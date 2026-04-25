#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
. "$ROOT_DIR/lib/common.sh"

load_env

usage() {
  cat <<'USAGE'
Usage: setup-github.sh [all|repos|secrets|environments]

Required:
  GITHUB_ORG
  CLOUDFLARE_API_TOKEN
  ANTHROPIC_API_KEY
  OPENAI_API_KEY

Optional:
  GITHUB_VISIBILITY (private|public|internal)
  GITHUB_PROD_REVIEWER_USERNAMES (comma-separated)
  GITHUB_PROD_REVIEWER_IDS (comma-separated)
USAGE
}

require_cmd gh
require_env GITHUB_ORG
require_env CLOUDFLARE_API_TOKEN
require_env ANTHROPIC_API_KEY
require_env OPENAI_API_KEY

if [[ -n "${GITHUB_TOKEN:-}" && -z "${GH_TOKEN:-}" ]]; then
  export GH_TOKEN="$GITHUB_TOKEN"
fi

if ! gh auth status >/dev/null 2>&1; then
  die "gh is not authenticated. Run: gh auth login"
fi

VISIBILITY="${GITHUB_VISIBILITY:-private}"
case "$VISIBILITY" in
  private|public|internal)
    ;;
  *)
    die "GITHUB_VISIBILITY must be private, public, or internal"
    ;;
esac

REPOS=(
  "blackroad-cli"
  "blackroad-agents"
  "blackroad-infra"
  "blackroad-docs"
)

create_repos() {
  local repo
  for repo in "${REPOS[@]}"; do
    if gh repo view "$GITHUB_ORG/$repo" >/dev/null 2>&1; then
      log "Repo exists: $GITHUB_ORG/$repo"
    else
      gh repo create "$GITHUB_ORG/$repo" --$VISIBILITY --confirm --add-readme
      log "Created repo: $GITHUB_ORG/$repo"
    fi
  done
}

build_reviewer_ids() {
  local ids_csv="${GITHUB_PROD_REVIEWER_IDS:-}"
  local users_csv="${GITHUB_PROD_REVIEWER_USERNAMES:-}"
  local ids=()
  local value

  if [[ -n "$ids_csv" ]]; then
    IFS=',' read -r -a ids <<< "$ids_csv"
  elif [[ -n "$users_csv" ]]; then
    IFS=',' read -r -a users <<< "$users_csv"
    for value in "${users[@]}"; do
      value="$(printf '%s' "$value" | xargs)"
      [[ -z "$value" ]] && continue
      ids+=("$(gh api "users/$value" -q .id)")
    done
  else
    die "Missing GITHUB_PROD_REVIEWER_IDS or GITHUB_PROD_REVIEWER_USERNAMES"
  fi

  if [[ "${#ids[@]}" -eq 0 ]]; then
    die "No reviewers resolved for prod environment"
  fi

  printf '%s
' "${ids[@]}" | jq -R -s 'split("\n") | map(select(length>0)) | map(tonumber)'
}

configure_environments() {
  local repo
  local reviewers_json
  local payload

  reviewers_json="$(build_reviewer_ids)"
  payload="$(jq -n --argjson ids "$reviewers_json" '{reviewers: ($ids | map({type: "User", id: .}))}')"

  for repo in "${REPOS[@]}"; do
    gh api --method PUT "repos/$GITHUB_ORG/$repo/environments/dev" --input - <<< '{}' >/dev/null
    gh api --method PUT "repos/$GITHUB_ORG/$repo/environments/prod" --input - <<< "$payload" >/dev/null
    log "Environments ready: $GITHUB_ORG/$repo"
  done
}

set_secret() {
  local repo="$1"
  local name="$2"
  local value="$3"

  if [[ -z "$value" ]]; then
    die "Missing value for secret $name"
  fi

  printf '%s' "$value" | gh secret set "$name" --repo "$GITHUB_ORG/$repo" --body - >/dev/null
}

configure_secrets() {
  local repo
  for repo in "${REPOS[@]}"; do
    set_secret "$repo" "CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_API_TOKEN"
    set_secret "$repo" "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"
    set_secret "$repo" "OPENAI_API_KEY" "$OPENAI_API_KEY"

    if [[ -n "${CLOUDFLARE_API_TOKEN_READ:-}" ]]; then
      printf '%s' "$CLOUDFLARE_API_TOKEN_READ" | gh secret set "CLOUDFLARE_API_TOKEN_READ" --repo "$GITHUB_ORG/$repo" --body - >/dev/null
    fi

    if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
      printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | gh secret set "CLOUDFLARE_ACCOUNT_ID" --repo "$GITHUB_ORG/$repo" --body - >/dev/null
    fi

    log "Secrets set: $GITHUB_ORG/$repo"
  done
}

command="${1:-all}"
case "$command" in
  all)
    create_repos
    configure_secrets
    configure_environments
    ;;
  repos)
    create_repos
    ;;
  secrets)
    configure_secrets
    ;;
  environments)
    configure_environments
    ;;
  *)
    usage
    exit 1
    ;;
esac
