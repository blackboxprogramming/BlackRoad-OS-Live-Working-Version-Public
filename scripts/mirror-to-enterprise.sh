#!/bin/bash
# BlackRoad OS — Mirror to Enterprise Orgs
# Run this after GitHub Support unblocks the IP allow list
#
# Usage: ./scripts/mirror-to-enterprise.sh
#
# Tests access first, then pushes to all enterprise repos.
# Remember the Road. Pave Tomorrow!

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo ""
echo "BLACKROAD MIRROR TO ENTERPRISE"
echo "=============================="
echo ""

# Test access first
echo "Testing enterprise access..."
if gh api /orgs/BlackRoad-OS --jq '.login' 2>/dev/null; then
  echo "  BlackRoad-OS: ACCESSIBLE"
else
  echo "  BlackRoad-OS: STILL BLOCKED"
  echo ""
  echo "  IP allow list is still blocking access."
  echo "  Check GitHub Support ticket #4324012"
  echo "  Current IP: $(curl -s ifconfig.me)"
  echo ""
  echo "  Cannot mirror until unblocked."
  exit 1
fi

if gh api /orgs/BlackRoad-OS-Inc --jq '.login' 2>/dev/null; then
  echo "  BlackRoad-OS-Inc: ACCESSIBLE"
else
  echo "  BlackRoad-OS-Inc: STILL BLOCKED"
fi

echo ""

# Add remotes if not present
add_remote() {
  local name="$1"
  local url="$2"
  if ! git remote get-url "$name" &>/dev/null; then
    git remote add "$name" "$url"
    echo "  Added remote: $name"
  fi
}

add_remote "roadcode" "https://github.com/BlackRoad-OS/RoadCode.git"
add_remote "blackroad-os-org" "https://github.com/BlackRoad-OS/blackroad-os.git"
add_remote "blackroad-os-inc" "https://github.com/BlackRoad-OS-Inc/blackroad.git"
add_remote "live-public" "https://github.com/blackboxprogramming/BlackRoad-OS-Live-Working-Version-Public.git"

echo ""
echo "Pushing to enterprise repos..."
echo ""

# Push to each remote
for remote in roadcode blackroad-os-inc live-public; do
  echo "  Pushing to $remote..."
  if git push "$remote" main 2>&1; then
    echo "  [$remote] PUSHED"
  else
    echo "  [$remote] FAILED (may be archived or blocked)"
  fi
  echo ""
done

echo ""
echo "Mirror complete."
echo ""
echo "Remotes:"
git remote -v | grep push
echo ""
echo "Remember the Road. Pave Tomorrow!"
