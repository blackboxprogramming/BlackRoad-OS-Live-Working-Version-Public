#!/bin/bash
# BlackRoad Production Enhancer — Push CI, Docker, .env to all repos
# Usage: ./production-enhance.sh [--dry-run] [--org ORG] [--limit N]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

DRY_RUN=false
TARGET_ORG=""
LIMIT=0
ENHANCED=0; SKIPPED=0; FAILED=0; TOTAL=0
LOG_DIR="$HOME/.blackroad-production-enhance"
LOG_FILE="$LOG_DIR/enhance-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$LOG_DIR"

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) TARGET_ORG="$2"; shift 2;;
    --limit) LIMIT="$2"; shift 2;;
    *) shift;;
  esac
done

log() { echo -e "$1" | tee -a "$LOG_FILE"; }

push_file() {
  local repo="$1" filepath="$2" tmpfile="$3" msg="$4" branch="${5:-main}"
  local encoded sha
  encoded=$(base64 -i "$tmpfile")
  sha=$(gh api "repos/$repo/contents/$filepath?ref=$branch" --jq '.sha' 2>/dev/null || echo "")
  if [ -n "$sha" ]; then
    gh api "repos/$repo/contents/$filepath" -X PUT -f message="$msg" -f content="$encoded" -f sha="$sha" -f branch="$branch" --jq '.content.path' 2>/dev/null
  else
    gh api "repos/$repo/contents/$filepath" -X PUT -f message="$msg" -f content="$encoded" -f branch="$branch" --jq '.content.path' 2>/dev/null
  fi
}

file_exists() {
  local repo="$1" filepath="$2"
  gh api "repos/$repo/contents/$filepath" --jq '.sha' 2>/dev/null && return 0 || return 1
}

detect_type() {
  local repo="$1"
  local files
  files=$(gh api "repos/$repo/git/trees/HEAD?recursive=1" --jq '[.tree[].path] | join("\n")' 2>/dev/null || echo "")
  if echo "$files" | grep -q "package.json"; then
    if echo "$files" | grep -q "next.config"; then echo "nextjs"
    elif echo "$files" | grep -q "wrangler.toml"; then echo "worker"
    else echo "node"
    fi
  elif echo "$files" | grep -qE "(requirements\.txt|pyproject\.toml|setup\.py)"; then echo "python"
  elif echo "$files" | grep -q "go.mod"; then echo "go"
  elif echo "$files" | grep -q "Cargo.toml"; then echo "rust"
  elif echo "$files" | grep -qE "\.sh$"; then echo "shell"
  else echo "generic"
  fi
}

process_repo() {
  local owner="$1" repo="$2"
  local full="$owner/$repo"
  TOTAL=$((TOTAL + 1))

  # Skip profile/pages repos
  [[ "$repo" == ".github" || "$repo" == *".github.io" ]] && { SKIPPED=$((SKIPPED+1)); return; }

  # Check archived/fork
  local meta
  meta=$(gh api "repos/$full" --jq '{a:.archived,f:.fork,b:.default_branch}' 2>/dev/null || echo '{}')
  local archived=$(echo "$meta" | jq -r '.a // false')
  local fork=$(echo "$meta" | jq -r '.f // false')
  local branch=$(echo "$meta" | jq -r '.b // "main"')
  [[ "$archived" == "true" || "$fork" == "true" ]] && { SKIPPED=$((SKIPPED+1)); return; }

  local ptype=$(detect_type "$full")
  local pushed=0

  # Push CI if missing
  if ! file_exists "$full" ".github/workflows/ci.yml"; then
    local ci_file="/tmp/br-generic-ci.yml"
    case "$ptype" in
      node|nextjs|worker) ci_file="/tmp/br-node-ci.yml";;
      python) ci_file="/tmp/br-python-ci.yml";;
      go) ci_file="/tmp/br-go-ci.yml";;
      shell) ci_file="/tmp/br-shell-ci.yml";;
    esac
    if [[ "$DRY_RUN" == "false" ]]; then
      if push_file "$full" ".github/workflows/ci.yml" "$ci_file" "ci: add CI workflow" "$branch" >/dev/null 2>&1; then
        pushed=$((pushed+1))
      fi
    else
      pushed=$((pushed+1))
    fi
  fi

  # Push Dockerfile if missing
  if ! file_exists "$full" "Dockerfile"; then
    local docker_file="/tmp/br-node-docker"
    case "$ptype" in
      python) docker_file="/tmp/br-python-docker";;
      node|nextjs|worker) docker_file="/tmp/br-node-docker";;
    esac
    if [[ -f "$docker_file" ]]; then
      if [[ "$DRY_RUN" == "false" ]]; then
        push_file "$full" "Dockerfile" "$docker_file" "ci: add Dockerfile" "$branch" >/dev/null 2>&1 && pushed=$((pushed+1))
      else
        pushed=$((pushed+1))
      fi
    fi
  fi

  # Push .dockerignore if missing
  if ! file_exists "$full" ".dockerignore"; then
    if [[ "$DRY_RUN" == "false" ]]; then
      push_file "$full" ".dockerignore" "/tmp/br-dockerignore" "ci: add .dockerignore" "$branch" >/dev/null 2>&1 && pushed=$((pushed+1))
    else
      pushed=$((pushed+1))
    fi
  fi

  if [[ "$pushed" -gt 0 ]]; then
    log "  ${GREEN}+${pushed}${RESET} $full ($ptype)"
    ENHANCED=$((ENHANCED+1))
  else
    log "  ${VIOLET}ok${RESET} $full"
    SKIPPED=$((SKIPPED+1))
  fi

  sleep 0.5
}

process_owner() {
  local owner="$1"
  log "${PINK}━━━ $owner ━━━${RESET}"
  local repos
  repos=$(gh repo list "$owner" --limit 1500 --json name --jq '.[].name' 2>/dev/null)
  while IFS= read -r repo; do
    [[ -z "$repo" ]] && continue
    [[ "$LIMIT" -gt 0 && "$TOTAL" -ge "$LIMIT" ]] && break
    process_repo "$owner" "$repo"
  done <<< "$repos"
}

ALL_ORGS=(Blackbox-Enterprises BlackRoad-AI BlackRoad-Labs BlackRoad-Cloud BlackRoad-Ventures BlackRoad-Foundation BlackRoad-Media BlackRoad-Hardware BlackRoad-Education BlackRoad-Gov BlackRoad-Security BlackRoad-Interactive BlackRoad-Archive BlackRoad-Studio BlackRoad-OS-Inc)

log "${PINK}╔═══════════════════════════════════════════╗${RESET}"
log "${PINK}║  BlackRoad Production Enhancer             ║${RESET}"
log "${PINK}╚═══════════════════════════════════════════╝${RESET}"
log "Mode: $(if $DRY_RUN; then echo 'DRY RUN'; else echo 'LIVE'; fi)"

if [[ -n "$TARGET_ORG" ]]; then
  process_owner "$TARGET_ORG"
else
  for org in "${ALL_ORGS[@]}"; do
    [[ "$LIMIT" -gt 0 && "$TOTAL" -ge "$LIMIT" ]] && break
    process_owner "$org"
  done
  process_owner "blackboxprogramming"
fi

log ""
log "${GREEN}Enhanced:${RESET} $ENHANCED | ${VIOLET}Skipped:${RESET} $SKIPPED | ${RED}Failed:${RESET} $FAILED | Total: $TOTAL"
log "Log: $LOG_FILE"
