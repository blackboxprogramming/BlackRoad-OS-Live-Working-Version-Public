#!/bin/bash

# =============================================================================
# BlackRoad OS Consolidation - Phase 1 Execution Script
# =============================================================================
# This script consolidates duplicate repos into the canonical spine.
# Run from any directory. It creates a temp workspace and cleans up after.
# =============================================================================

set -e

WORK_DIR="/tmp/blackroad-consolidation-$(date +%s)"
ORG="BlackRoad-OS"

echo "=============================================="
echo "🔧 BlackRoad OS Phase 1 Consolidation"
echo "=============================================="
echo ""
echo "Creating workspace at $WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Track results
declare -a COMPLETED=()
declare -a SKIPPED=()
declare -a FAILED=()

# =============================================================================
# Helper Functions
# =============================================================================

clone_repo() {
  local repo=$1
  echo "📥 Cloning $ORG/$repo..."
  gh repo clone "$ORG/$repo" "$WORK_DIR/$repo" -- --depth 1 2>/dev/null || {
    echo "⚠️  Could not clone $repo"
    return 1
  }
}

archive_repo_readme() {
  local repo=$1
  local target=$2
  local date=$(date +%Y-%m-%d)

  cat > "$WORK_DIR/$repo/README.md" << EOF
# ⚠️ This Repository Has Been Archived

> **Superseded by [\`BlackRoad-OS/$target\`](https://github.com/BlackRoad-OS/$target) as of $date.**

---

## What Happened?

This repository has been consolidated into the unified BlackRoad OS spine. All active development now happens in the canonical repository linked above.

## Why?

As part of the BlackRoad OS consolidation effort, we merged scattered repositories into **18 canonical repos** under the \`BlackRoad-OS\` organization. This reduces confusion, centralizes CI/CD, and makes the system easier to understand and contribute to.

## Where Did The Code Go?

| This Repo | Moved To |
|-----------|----------|
| \`$repo\` | [\`BlackRoad-OS/$target\`](https://github.com/BlackRoad-OS/$target) |

## Can I Still Use This?

This code is frozen and will not receive updates. For any new work, please use the canonical repository.

---

*Archived as part of the BlackRoad OS Consolidation - $date*
EOF
}

commit_and_push() {
  local repo=$1
  local message=$2
  local branch=${3:-main}

  cd "$WORK_DIR/$repo"
  git add -A
  if git diff --staged --quiet; then
    echo "⏭️  No changes to commit in $repo"
    return 0
  fi
  git commit -m "$message"
  git push origin "$branch" 2>/dev/null || git push origin master 2>/dev/null || {
    echo "❌ Failed to push $repo"
    return 1
  }
  echo "✅ Pushed changes to $repo"
}

# =============================================================================
# 1. blackroad-agent-os → blackroad-os-core / blackroad-os-operator
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 1/6: blackroad-agent-os → core/operator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-agent-os"; then
  # Check what's in there
  echo "📂 Contents:"
  ls -la "$WORK_DIR/blackroad-agent-os" | head -15

  # Archive it
  archive_repo_readme "blackroad-agent-os" "blackroad-os-core"
  commit_and_push "blackroad-agent-os" "chore: mark as archived, superseded by blackroad-os-core

Content has been consolidated into the canonical BlackRoad OS spine.
See: https://github.com/BlackRoad-OS/blackroad-os-core/blob/main/ARCHITECTURE.md

🤖 BlackRoad OS Consolidation Phase 1"

  COMPLETED+=("blackroad-agent-os → archived")
else
  SKIPPED+=("blackroad-agent-os")
fi

# =============================================================================
# 2. blackroad-agents → blackroad-os-agents
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 2/6: blackroad-agents → blackroad-os-agents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-agents"; then
  archive_repo_readme "blackroad-agents" "blackroad-os-agents"
  commit_and_push "blackroad-agents" "chore: mark as archived, superseded by blackroad-os-agents

🤖 BlackRoad OS Consolidation Phase 1"

  COMPLETED+=("blackroad-agents → archived")
else
  SKIPPED+=("blackroad-agents")
fi

# =============================================================================
# 3. blackroad-cli → blackroad-tools
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 3/6: blackroad-cli → blackroad-tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-cli"; then
  # This one we keep active but point to tools
  echo "ℹ️  blackroad-cli is the canonical CLI - keeping active"
  echo "   (blackroad-tools is for dev tooling, CLI stays separate)"
  SKIPPED+=("blackroad-cli - kept as canonical CLI repo")
else
  SKIPPED+=("blackroad-cli")
fi

# =============================================================================
# 4. blackroad-os-demo → blackroad-os-web
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 4/6: blackroad-os-demo → blackroad-os-web"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-os-demo"; then
  archive_repo_readme "blackroad-os-demo" "blackroad-os-web"
  commit_and_push "blackroad-os-demo" "chore: mark as archived, demos moved to blackroad-os-web

🤖 BlackRoad OS Consolidation Phase 1"

  COMPLETED+=("blackroad-os-demo → archived")
else
  SKIPPED+=("blackroad-os-demo")
fi

# =============================================================================
# 5. blackroad-os-home → blackroad-os-web
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 5/6: blackroad-os-home → blackroad-os-web"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-os-home"; then
  archive_repo_readme "blackroad-os-home" "blackroad-os-web"
  commit_and_push "blackroad-os-home" "chore: mark as archived, home content moved to blackroad-os-web

🤖 BlackRoad OS Consolidation Phase 1"

  COMPLETED+=("blackroad-os-home → archived")
else
  SKIPPED+=("blackroad-os-home")
fi

# =============================================================================
# 6. blackroad-os-helper → blackroad-os-core
# =============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 6/6: blackroad-os-helper → blackroad-os-core"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if clone_repo "blackroad-os-helper"; then
  archive_repo_readme "blackroad-os-helper" "blackroad-os-core"
  commit_and_push "blackroad-os-helper" "chore: mark as archived, helpers moved to blackroad-os-core

🤖 BlackRoad OS Consolidation Phase 1"

  COMPLETED+=("blackroad-os-helper → archived")
else
  SKIPPED+=("blackroad-os-helper")
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=============================================="
echo "📊 Phase 1 Consolidation Complete!"
echo "=============================================="
echo ""
echo "✅ Completed (${#COMPLETED[@]}):"
for item in "${COMPLETED[@]}"; do
  echo "   - $item"
done
echo ""
echo "⏭️  Skipped (${#SKIPPED[@]}):"
for item in "${SKIPPED[@]}"; do
  echo "   - $item"
done
echo ""
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "❌ Failed (${#FAILED[@]}):"
  for item in "${FAILED[@]}"; do
    echo "   - $item"
  done
fi

# Cleanup
echo ""
echo "🧹 Cleaning up workspace..."
rm -rf "$WORK_DIR"

echo ""
echo "Done! Next steps:"
echo "1. Go to GitHub and mark archived repos as 'Archived' in settings"
echo "2. Run Phase 2 (personal account cleanup)"
echo "3. Run infra setup (Cloudflare + Railway)"
