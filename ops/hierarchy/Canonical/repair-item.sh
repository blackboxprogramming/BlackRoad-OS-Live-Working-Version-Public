#!/bin/bash
# Repair location-derived metadata for a Canonical item in place
# Usage: ./repair-item.sh <item-file>

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./repair-item.sh <item-file>

What it repairs:
  - Layer
  - Current Step
  - Current Path
  - Last Updated

What it does not change:
  - Source
  - Item ID
  - Title

Rules:
  - <item-file> must live inside Workflow/<step>/
  - use this when the file location is the truth
  - use move-item.sh when the item should actually change step
EOF
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

item_path=$1

if [[ ! -f "$item_path" ]]; then
  echo "Error: item file not found: $item_path" >&2
  exit 1
fi

item_dir=$(cd "$(dirname "$item_path")" && pwd)
item_name=$(basename "$item_path")

if [[ "$item_name" == "TEMPLATE-ITEM.txt" ]]; then
  echo "Error: refusing to repair TEMPLATE-ITEM.txt" >&2
  exit 1
fi

current_step=$(basename "$item_dir")
current_workflow=$(dirname "$item_dir")

if [[ "$(basename "$current_workflow")" != "Workflow" ]]; then
  echo "Error: item must be inside Workflow/<step>/" >&2
  exit 1
fi

item_abs="$item_dir/$item_name"
layer_name=$(basename "$(dirname "$current_workflow")")

tmp_file=$(mktemp)
python3 - "$item_abs" "$tmp_file" "$current_step" "$layer_name" <<'PY'
import sys
from datetime import date

src, dst, step_name, layer_name = sys.argv[1:]
today = date.today().isoformat()
current_path = f"Workflow/{step_name}/"

patterns = {
    "Layer:": f"Layer: {layer_name}",
    "Current Step:": f"Current Step: {step_name}",
    "Current Path:": f"Current Path: {current_path}",
    "Last Updated:": f"Last Updated: {today}",
}

with open(src, "r", encoding="utf-8") as fh:
    lines = fh.readlines()

updated = []
seen = set()
for line in lines:
    replaced = False
    for prefix, value in patterns.items():
        if line.startswith(prefix):
            updated.append(value + "\n")
            seen.add(prefix)
            replaced = True
            break
    if replaced:
        continue
    updated.append(line)

if "Layer:" not in seen:
    updated.insert(0, f"Layer: {layer_name}\n")
if "Current Step:" not in seen:
    updated.append(f"Current Step: {step_name}\n")
if "Current Path:" not in seen:
    updated.append(f"Current Path: {current_path}\n")
if "Last Updated:" not in seen:
    updated.append(f"Last Updated: {today}\n")

with open(dst, "w", encoding="utf-8") as fh:
    fh.writelines(updated)
PY

mv "$tmp_file" "$item_abs"
echo "repaired: $item_abs"
