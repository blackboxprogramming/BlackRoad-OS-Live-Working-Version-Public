#!/bin/bash

# =============================================================================
# BlackRoad OS Consolidation - Phase 2: Personal Account Cleanup
# =============================================================================
# Archives duplicate repos in blackboxprogramming account
# =============================================================================

set -e

WORK_DIR="/tmp/blackroad-phase2-$(date +%s)"
PERSONAL="blackboxprogramming"

echo "=============================================="
echo "🔧 BlackRoad OS Phase 2: Personal Cleanup"
echo "=============================================="
echo ""
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

declare -a COMPLETED=()
declare -a SKIPPED=()

archive_personal_repo() {
  local repo=$1
  local target=$2
  local date=$(date +%Y-%m-%d)

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Archiving: $PERSONAL/$repo → BlackRoad-OS/$target"

  if gh repo clone "$PERSONAL/$repo" "$WORK_DIR/$repo" -- --depth 1 2>/dev/null; then
    cat > "$WORK_DIR/$repo/README.md" << EOF
# ⚠️ This Repository Has Been Archived

> **Superseded by [\`BlackRoad-OS/$target\`](https://github.com/BlackRoad-OS/$target) as of $date.**

---

This was a personal/development version. The canonical implementation now lives in the BlackRoad-OS organization.

## Where Did The Code Go?

| This Repo | Moved To |
|-----------|----------|
| \`$repo\` | [\`BlackRoad-OS/$target\`](https://github.com/BlackRoad-OS/$target) |

See [ARCHITECTURE.md](https://github.com/BlackRoad-OS/blackroad-os-core/blob/main/ARCHITECTURE.md) for the full system design.

---

*Archived as part of the BlackRoad OS Consolidation - $date*
EOF

    cd "$WORK_DIR/$repo"
    git add README.md
    if ! git diff --staged --quiet; then
      git commit -m "chore: mark as archived, superseded by BlackRoad-OS/$target

🤖 BlackRoad OS Consolidation Phase 2"
      git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
        echo "⚠️  Could not push to $repo"
        SKIPPED+=("$repo - push failed")
        return
      }
      echo "✅ $repo archived"
      COMPLETED+=("$repo → BlackRoad-OS/$target")
    else
      echo "⏭️  $repo - no changes needed"
      SKIPPED+=("$repo - already up to date")
    fi
    cd "$WORK_DIR"
  else
    echo "⚠️  Could not clone $repo"
    SKIPPED+=("$repo - clone failed")
  fi
}

# Archive personal duplicates
archive_personal_repo "BLACKROAD-OS-MASTER" "blackroad-os-core"
archive_personal_repo "BlackRoad-Operating-System" "blackroad-os-core"
archive_personal_repo "blackroad" "blackroad"
archive_personal_repo "blackroad-api" "blackroad-os-api"
archive_personal_repo "blackroad-operator" "blackroad-os-operator"
archive_personal_repo "blackroad-prism-console" "blackroad-os-prism-console"

echo ""
echo "=============================================="
echo "📊 Phase 2 Complete!"
echo "=============================================="
echo ""
echo "✅ Archived (${#COMPLETED[@]}):"
for item in "${COMPLETED[@]}"; do
  echo "   - $item"
done
echo ""
echo "⏭️  Skipped (${#SKIPPED[@]}):"
for item in "${SKIPPED[@]}"; do
  echo "   - $item"
done

rm -rf "$WORK_DIR"

echo ""
echo "Next: Go to GitHub Settings for each repo and click 'Archive this repository'"
