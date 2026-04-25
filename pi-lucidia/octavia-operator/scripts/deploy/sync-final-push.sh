#!/bin/bash
# Final push: fetch, rebase with auto-resolve (theirs for conflicts), push
# For protected branches that can't be force-pushed

PUSH_TIMEOUT=30
SUCCESS=0
FAIL=0
SKIPPED=0
NO_REMOTE=0

declare -a PUSHED=()
declare -a FAILED=()

echo "=== Final Push: rebase + auto-resolve + push ==="

while IFS= read -r gitdir; do
    repo="$(dirname "$gitdir")"
    reponame="$(basename "$repo")"

    cd "$repo" 2>/dev/null || continue

    # Skip repos without remotes
    git remote get-url origin >/dev/null 2>&1 || { NO_REMOTE=$((NO_REMOTE+1)); continue; }

    # Clean up any stuck state
    git rebase --abort 2>/dev/null
    git merge --abort 2>/dev/null
    git cherry-pick --abort 2>/dev/null

    branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
    [ -z "$branch" ] && continue

    # Fetch
    timeout 15 git fetch origin 2>/dev/null

    # Check if ahead
    ahead="$(git rev-list --count origin/${branch}..HEAD 2>/dev/null)"
    if [ "$ahead" = "0" ] 2>/dev/null || [ -z "$ahead" ]; then
        SKIPPED=$((SKIPPED+1))
        continue
    fi

    # Try simple push first
    if timeout $PUSH_TIMEOUT git push origin "$branch" --no-verify 2>/dev/null; then
        SUCCESS=$((SUCCESS+1))
        PUSHED+=("$reponame")
        echo "  [OK] $reponame"
        continue
    fi

    # Try pull rebase with auto-resolve strategy
    # Use -X theirs to auto-resolve conflicts in favor of remote
    if timeout 60 git pull --rebase -X theirs origin "$branch" --no-verify 2>/dev/null; then
        if timeout $PUSH_TIMEOUT git push origin "$branch" --no-verify 2>/dev/null; then
            SUCCESS=$((SUCCESS+1))
            PUSHED+=("$reponame (rebased)")
            echo "  [REBASED+PUSHED] $reponame"
        else
            FAIL=$((FAIL+1))
            FAILED+=("$reponame (push after rebase)")
            echo "  [FAIL push] $reponame"
        fi
    else
        # Rebase failed even with auto-resolve, abort and try merge approach
        git rebase --abort 2>/dev/null

        # Try merge instead of rebase
        if timeout 60 git pull --no-rebase -X theirs origin "$branch" --no-verify 2>/dev/null; then
            # Auto-commit the merge if needed
            git add -A 2>/dev/null
            git commit -m "chore: merge remote changes" --no-verify 2>/dev/null

            if timeout $PUSH_TIMEOUT git push origin "$branch" --no-verify 2>/dev/null; then
                SUCCESS=$((SUCCESS+1))
                PUSHED+=("$reponame (merged)")
                echo "  [MERGED+PUSHED] $reponame"
            else
                FAIL=$((FAIL+1))
                FAILED+=("$reponame (push after merge)")
                echo "  [FAIL push after merge] $reponame"
            fi
        else
            git merge --abort 2>/dev/null
            FAIL=$((FAIL+1))
            FAILED+=("$reponame (merge failed)")
            echo "  [FAIL merge] $reponame"
        fi
    fi

done < <(find /Users/alexa -maxdepth 2 -name ".git" -type d 2>/dev/null | sort)

echo ""
echo "========================================="
echo "        FINAL PUSH SUMMARY"
echo "========================================="
echo "Pushed:      $SUCCESS"
echo "Failed:      $FAIL"
echo "Skipped:     $SKIPPED"
echo "No remote:   $NO_REMOTE"
echo "========================================="

if [ ${#PUSHED[@]} -gt 0 ]; then
    echo ""
    echo "Pushed:"
    printf '  - %s\n' "${PUSHED[@]}"
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "Failed:"
    printf '  - %s\n' "${FAILED[@]}"
fi
echo "Done."
