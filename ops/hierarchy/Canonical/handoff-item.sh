#!/bin/bash
# Perform a visible cross-layer handoff: 24-Conveyor-Belt -> 25-Transfer -> next layer 01-Intake
# Usage: ./handoff-item.sh <item-file> <target-workflow-dir>

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

usage() {
  cat <<'EOF'
Usage:
  ./handoff-item.sh <item-file> <target-workflow-dir>

Examples:
  ./handoff-item.sh /Applications/Hierarchy/Canonical/.../Workflow/24-Conveyor-Belt/example.item.txt /Applications/Hierarchy/Canonical/.../13-Pull-Request/Workflow

Rules:
  - <item-file> must currently live in Workflow/24-Conveyor-Belt/
  - <target-workflow-dir> must be a Workflow directory
  - the script preserves visible upstream states and creates a downstream 01-Intake copy
EOF
}

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 1
fi

item_path=$1
target_workflow=$2

if [[ ! -f "$item_path" ]]; then
  echo "Error: item file not found: $item_path" >&2
  exit 1
fi

if [[ ! -d "$target_workflow" ]]; then
  echo "Error: target workflow not found: $target_workflow" >&2
  exit 1
fi

item_dir=$(cd "$(dirname "$item_path")" && pwd)
current_step=$(basename "$item_dir")

if [[ "$current_step" != "24-Conveyor-Belt" ]]; then
  echo "Error: item must start in Workflow/24-Conveyor-Belt/" >&2
  exit 1
fi

if [[ "$(basename "$(cd "$target_workflow" && pwd)")" != "Workflow" ]]; then
  echo "Error: target must be a Workflow directory" >&2
  exit 1
fi

"$ROOT_DIR/move-item.sh" --copy "$item_path" 25-Transfer
transfer_path="$(dirname "$item_path")/../25-Transfer/$(basename "$item_path")"
"$ROOT_DIR/move-item.sh" --copy "$transfer_path" 01-Intake "$target_workflow"

echo "handoff complete:"
echo "  upstream queue: $item_path"
echo "  upstream transfer: $transfer_path"
echo "  downstream intake: $(cd "$target_workflow" && pwd)/01-Intake/$(basename "$item_path")"
