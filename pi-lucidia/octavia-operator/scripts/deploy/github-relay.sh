#!/bin/bash
# GitHub Relay: Pull from Gitea, push to GitHub
# Runs on Cecilia (192.168.4.96), relays repos from Gitea → GitHub
# Usage: ~/github-relay.sh [--dry-run]

set -euo pipefail

GITEA_URL="http://blackroad:BlackRoad2026OS@192.168.4.97:3100"
GITEA_API="$GITEA_URL/api/v1"
WORK_DIR="$HOME/gitea-mirrors"
LOG_FILE="$HOME/github-relay.log"
DRY_RUN=false

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

mkdir -p "$WORK_DIR"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

log "===== GitHub Relay Started (dry_run=$DRY_RUN) ====="

PUSHED=0
SKIPPED=0
FAILED=0

# Fetch all repos from Gitea (paginated, 50 per page)
page=1
ALL_REPOS=""
while true; do
    response=$(curl -sf "$GITEA_API/repos/search?limit=50&page=$page" 2>/dev/null) || break
    repos=$(echo "$response" | python3 -c '
import sys, json
data = json.load(sys.stdin)
for r in data.get("data", []):
    print(r["full_name"] + "|" + r["clone_url"])
' 2>/dev/null) || break
    [[ -z "$repos" ]] && break
    ALL_REPOS="$ALL_REPOS
$repos"
    page=$((page + 1))
done

ALL_REPOS=$(echo "$ALL_REPOS" | sed '/^$/d')
total=$(echo "$ALL_REPOS" | wc -l | tr -d ' ')
log "Found $total repos on Gitea"

while IFS='|' read -r full_name clone_url; do
    [[ -z "$full_name" ]] && continue
    repo_name=$(basename "$full_name")
    repo_dir="$WORK_DIR/$repo_name"

    if $DRY_RUN; then
        if [[ -d "$repo_dir" ]] && git -C "$repo_dir" remote get-url github &>/dev/null; then
            log "[DRY-RUN] Would sync: $full_name → GitHub"
            PUSHED=$((PUSHED + 1))
        else
            log "[DRY-RUN] No github remote for: $full_name (would skip)"
            SKIPPED=$((SKIPPED + 1))
        fi
        continue
    fi

    # Build local Gitea URL (API-returned clone_url may use public domain)
    local_clone_url="${GITEA_URL}/${full_name}.git"

    # Clone bare if not exists
    if [[ ! -d "$repo_dir" ]]; then
        git clone --bare "$local_clone_url" "$repo_dir" 2>/dev/null || {
            log "[FAILED] Clone failed: $full_name"
            FAILED=$((FAILED + 1))
            continue
        }
        # Add github remote: github.com/blackboxprogramming/<repo_name>
        git -C "$repo_dir" remote add github "git@github.com:blackboxprogramming/${repo_name}.git" 2>/dev/null || true
    fi

    # Fetch latest from Gitea origin only (not github)
    git -C "$repo_dir" fetch origin --prune 2>/dev/null || {
        log "[FAILED] Fetch failed: $full_name"
        FAILED=$((FAILED + 1))
        continue
    }

    # Check if github remote exists
    if ! git -C "$repo_dir" remote get-url github &>/dev/null; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    # Push to GitHub
    output=$(git -C "$repo_dir" push github --all 2>&1) && {
        if echo "$output" | grep -q "Everything up-to-date"; then
            SKIPPED=$((SKIPPED + 1))
        else
            log "[PUSHED] $full_name → GitHub"
            PUSHED=$((PUSHED + 1))
        fi
    } || {
        # If repo doesn't exist on GitHub yet, log and continue
        if echo "$output" | grep -qE "Repository not found|does not exist"; then
            log "[SKIP-NO-GH] $full_name: GitHub repo not found"
            SKIPPED=$((SKIPPED + 1))
        else
            log "[FAILED] $full_name: $output"
            FAILED=$((FAILED + 1))
        fi
    }
done <<< "$ALL_REPOS"

log "===== GitHub Relay Complete: pushed=$PUSHED skipped=$SKIPPED failed=$FAILED ====="
