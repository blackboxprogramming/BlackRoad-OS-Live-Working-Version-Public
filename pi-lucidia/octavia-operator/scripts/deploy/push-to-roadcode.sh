#!/bin/bash
ROADCODE="http://192.168.4.97:3100"
TOKEN="d6b725383c8a1b7e364d27e22fefde8aa0342abc"
PUSHED=0
FAILED=0

get_org() {
  case "$1" in
    blackroad-agent*) echo "agents" ;;
    blackroad-infra*|blackroad-deploy*|blackroad-pi*|blackroad-pitstop*|blackroad-pixel-city*) echo "infrastructure" ;;
    blackroad-platform*|blackroad-dashboard*|blackroad-web*|blackroad-webhooks*) echo "platform" ;;
    blackroad-cli*|blackroad-sdk*|blackroad-helper*|blackroad-tools*) echo "tools" ;;
    blackroad-os*|blackroad-*|br-*) echo "blackroad-os" ;;
    lucidia*) echo "lucidia" ;;
    road*) echo "roadchain" ;;
    *) echo "blackroad-os" ;;
  esac
}

for dir in /Users/alexa/blackroad-*/ /Users/alexa/lucidia-*/ /Users/alexa/road*/ /Users/alexa/br-*/; do
  [ -d "$dir" ] || continue
  name=$(basename "$dir")
  org=$(get_org "$name")
  
  cd "$dir"
  
  # Init git if needed
  if [ ! -d ".git" ]; then
    git init -b main > /dev/null 2>&1
    git add -A > /dev/null 2>&1
    git commit -m "Initial commit — RoadCode import" > /dev/null 2>&1
  fi
  
  # Add roadcode remote
  git remote remove roadcode 2>/dev/null
  git remote add roadcode "http://blackroad:BlackRoad2026OS@192.168.4.97:3100/$org/$name.git"
  
  # Push
  if git push roadcode HEAD:main --force > /dev/null 2>&1; then
    echo "✓ $org/$name"
    PUSHED=$((PUSHED + 1))
  else
    echo "✗ $org/$name"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=== PUSHED: $PUSHED | FAILED: $FAILED ==="
