#!/bin/bash
# Process remaining BlackRoad-OS repos from /tmp/br-os-remaining.txt
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

ENHANCED=0; SKIPPED=0; FAILED=0; TOTAL=0
LOG_FILE="$HOME/.blackroad-production-enhance/enhance-remaining-$(date +%Y%m%d-%H%M%S).log"

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
  gh api "repos/$1/contents/$2" --jq '.sha' 2>/dev/null && return 0 || return 1
}

detect_type() {
  local files
  files=$(gh api "repos/$1/git/trees/HEAD?recursive=1" --jq '[.tree[].path] | join("\n")' 2>/dev/null || echo "")
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
  local repo="$1"
  local full="BlackRoad-OS/$repo"
  TOTAL=$((TOTAL + 1))

  [[ "$repo" == ".github" || "$repo" == *".github.io" ]] && { SKIPPED=$((SKIPPED+1)); return; }

  local meta
  meta=$(gh api "repos/$full" --jq '{a:.archived,f:.fork,b:.default_branch}' 2>/dev/null || echo '{}')
  local archived=$(echo "$meta" | jq -r '.a // false')
  local fork=$(echo "$meta" | jq -r '.f // false')
  local branch=$(echo "$meta" | jq -r '.b // "main"')
  [[ "$archived" == "true" || "$fork" == "true" ]] && { SKIPPED=$((SKIPPED+1)); return; }

  local ptype=$(detect_type "$full")
  local pushed=0

  if ! file_exists "$full" ".github/workflows/ci.yml"; then
    local ci_file="/tmp/br-generic-ci.yml"
    case "$ptype" in
      node|nextjs|worker) ci_file="/tmp/br-node-ci.yml";;
      python) ci_file="/tmp/br-python-ci.yml";;
      go) ci_file="/tmp/br-go-ci.yml";;
      shell) ci_file="/tmp/br-shell-ci.yml";;
    esac
    if push_file "$full" ".github/workflows/ci.yml" "$ci_file" "ci: add CI workflow" "$branch" >/dev/null 2>&1; then
      pushed=$((pushed+1))
    fi
  fi

  if ! file_exists "$full" "Dockerfile"; then
    local docker_file="/tmp/br-node-docker"
    case "$ptype" in
      python) docker_file="/tmp/br-python-docker";;
    esac
    if [[ -f "$docker_file" ]]; then
      push_file "$full" "Dockerfile" "$docker_file" "ci: add Dockerfile" "$branch" >/dev/null 2>&1 && pushed=$((pushed+1))
    fi
  fi

  if ! file_exists "$full" ".dockerignore"; then
    push_file "$full" ".dockerignore" "/tmp/br-dockerignore" "ci: add .dockerignore" "$branch" >/dev/null 2>&1 && pushed=$((pushed+1))
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

log "${PINK}━━━ BlackRoad-OS Remaining (736 repos) ━━━${RESET}"

while IFS= read -r repo; do
  [[ -z "$repo" ]] && continue
  process_repo "$repo"
done < /tmp/br-os-remaining.txt

log ""
log "${GREEN}Enhanced:${RESET} $ENHANCED | ${VIOLET}Skipped:${RESET} $SKIPPED | ${RED}Failed:${RESET} $FAILED | Total: $TOTAL"
log "Log: $LOG_FILE"
