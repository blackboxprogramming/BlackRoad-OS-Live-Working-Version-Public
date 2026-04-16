#!/bin/bash
# Move or copy a workflow item to another step or workflow layer
# Usage: ./move-item.sh [--copy] <item-file> <target-step> [target-workflow-dir]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./move-item.sh [--copy] <item-file> <target-step> [target-workflow-dir]

Examples:
  ./move-item.sh Canonical/01-Enterprise/Workflow/01-Intake/example.item.txt 02-Register
  ./move-item.sh --copy Canonical/.../24-Conveyor-Belt/example.item.txt 01-Intake Canonical/.../13-Pull-Request/Workflow

Rules:
  - <item-file> must live inside a Workflow/<step>/ folder
  - <target-step> must match an existing step folder in the destination workflow
  - [target-workflow-dir] defaults to the current item's workflow root
  - --copy preserves the source file for audit-trail style handoffs
EOF
}

copy_mode=0

if [[ $# -gt 0 && "$1" == "--copy" ]]; then
  copy_mode=1
  shift
fi

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage >&2
  exit 1
fi

item_path=$1
target_step=$2
target_workflow_arg=${3:-}

if [[ ! -f "$item_path" ]]; then
  echo "Error: item file not found: $item_path" >&2
  exit 1
fi

item_dir=$(cd "$(dirname "$item_path")" && pwd)
item_name=$(basename "$item_path")

if [[ "$item_name" == "TEMPLATE-ITEM.txt" ]]; then
  echo "Error: refusing to move TEMPLATE-ITEM.txt" >&2
  exit 1
fi

current_step=$(basename "$item_dir")
current_workflow=$(dirname "$item_dir")

if [[ "$(basename "$current_workflow")" != "Workflow" ]]; then
  echo "Error: item must be inside Workflow/<step>/" >&2
  exit 1
fi

item_abs=$(cd "$item_dir" && pwd)/"$item_name"

if [[ -n "$target_workflow_arg" ]]; then
  if [[ ! -d "$target_workflow_arg" ]]; then
    echo "Error: target workflow not found: $target_workflow_arg" >&2
    exit 1
  fi
  target_workflow=$(cd "$target_workflow_arg" && pwd)
else
  target_workflow=$current_workflow
fi

if [[ "$(basename "$target_workflow")" != "Workflow" ]]; then
  echo "Error: target workflow must be a Workflow directory" >&2
  exit 1
fi

target_dir="$target_workflow/$target_step"

if [[ ! -d "$target_dir" ]]; then
  echo "Error: target step does not exist: $target_dir" >&2
  exit 1
fi

target_abs="$target_dir/$item_name"

if [[ -e "$target_abs" ]]; then
  echo "Error: target file already exists: $target_abs" >&2
  exit 1
fi

layer_name=$(basename "$(dirname "$target_workflow")")
current_rel=$(python3 - "$item_abs" "$current_workflow" <<'PY'
import os
import sys
print(os.path.relpath(sys.argv[1], sys.argv[2]))
PY
)

tmp_file=$(mktemp)
python3 - "$item_abs" "$tmp_file" "$target_step" "$layer_name" "$current_rel" "$target_workflow" <<'PY'
import os
import re
import sys
from datetime import date

src, dst, target_step, layer_name, source_rel, target_workflow = sys.argv[1:]
today = date.today().isoformat()
current_path = f"Workflow/{target_step}/"
target_root = os.path.dirname(target_workflow)
source_field = source_rel if source_rel != os.path.basename(src) else os.path.basename(src)

patterns = {
    "Layer:": f"Layer: {layer_name}",
    "Current Step:": f"Current Step: {target_step}",
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

    if line.startswith("Source:") and os.path.dirname(src) != os.path.join(target_workflow, target_step):
      updated.append(f"Source: {source_field}\n")
      seen.add("Source:")
      continue

    updated.append(line)

if "Layer:" not in seen:
    updated.insert(0, f"Layer: {layer_name}\n")
if "Current Step:" not in seen:
    updated.append(f"Current Step: {target_step}\n")
if "Current Path:" not in seen:
    updated.append(f"Current Path: {current_path}\n")
if "Last Updated:" not in seen:
    updated.append(f"Last Updated: {today}\n")
if "Source:" not in seen and os.path.dirname(src) != os.path.join(target_workflow, target_step):
    updated.append(f"Source: {source_field}\n")

with open(dst, "w", encoding="utf-8") as fh:
    fh.writelines(updated)
PY

if [[ $copy_mode -eq 1 ]]; then
  mv "$tmp_file" "$target_abs"
  action="copied"
else
  mv "$tmp_file" "$target_abs"
  rm "$item_abs"
  action="moved"
fi

echo "$action: $item_abs -> $target_abs"
