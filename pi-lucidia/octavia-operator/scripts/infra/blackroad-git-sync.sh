#!/bin/bash
# BlackRoad Git Sync: Push all local repos to Gitea (roadcode remote)
# Runs on Mac, pushes to Gitea at 192.168.4.97:3100
# Usage: ~/blackroad-git-sync.sh [--dry-run]

set -euo pipefail

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[31m'
RESET='\033[0m'

LOG_DIR="$HOME/.blackroad/logs"
LOG_FILE="$LOG_DIR/git-sync.log"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

mkdir -p "$LOG_DIR"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg" | tee -a "$LOG_FILE"
}

log "===== Git Sync Started (dry_run=$DRY_RUN) ====="

# Pre-flight: check if Gitea is reachable before iterating 164+ repos
GITEA_HOST="192.168.4.97"
GITEA_PORT="3100"
if ! nc -z -w 5 "$GITEA_HOST" "$GITEA_PORT" 2>/dev/null; then
    log "${RED}[ABORT]${RESET} Gitea ($GITEA_HOST:$GITEA_PORT) unreachable — skipping sync"
    exit 0
fi

PUSHED=0
SKIPPED=0
FAILED=0
ERRORS=""

# Set git timeout to 15s instead of default 75s
export GIT_HTTP_LOW_SPEED_LIMIT=1000
export GIT_HTTP_LOW_SPEED_TIME=15

# Collect all matching directories
for dir in "$HOME"/blackroad-*/ "$HOME"/lucidia-*/ "$HOME"/road*/ "$HOME"/br-*/; do
    [[ -d "$dir" ]] || continue
    [[ -d "$dir/.git" ]] || continue

    repo_name=$(basename "$dir")

    # Check if roadcode remote exists
    if ! git -C "$dir" remote get-url roadcode &>/dev/null; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    if $DRY_RUN; then
        log "${PINK}[DRY-RUN]${RESET} Would push: $repo_name"
        PUSHED=$((PUSHED + 1))
        continue
    fi

    # Push all branches to roadcode
    output=$(git -C "$dir" push roadcode --all 2>&1) && {
        if echo "$output" | grep -q "Everything up-to-date"; then
            SKIPPED=$((SKIPPED + 1))
        else
            log "${GREEN}[PUSHED]${RESET} $repo_name"
            PUSHED=$((PUSHED + 1))
        fi
    } || {
        log "${RED}[FAILED]${RESET} $repo_name: $output"
        ERRORS="$ERRORS\n  $repo_name: $output"
        FAILED=$((FAILED + 1))
    }
done

log "===== Git Sync Complete: pushed=$PUSHED skipped=$SKIPPED failed=$FAILED ====="
if [[ -n "$ERRORS" ]]; then
    log "Errors:$ERRORS"
fi
