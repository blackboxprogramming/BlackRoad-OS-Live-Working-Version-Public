#!/bin/bash
# Create a new workflow item from TEMPLATE-ITEM.txt
# Usage: ./new-item.sh <workflow-dir> <name> [title]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./new-item.sh <workflow-dir> <name> [title]

Examples:
  ./new-item.sh Canonical/01-Enterprise/Workflow roadmap
  ./new-item.sh /Applications/Hierarchy/Canonical/01-Enterprise/Workflow auth-review "Review auth flow"

Rules:
  - <workflow-dir> must be a Workflow directory
  - the new item is created in Workflow/01-Intake/
  - <name> is converted into a shell-safe filename
EOF
}

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage >&2
  exit 1
fi

workflow_arg=$1
raw_name=$2
title=${3:-}

if [[ ! -d "$workflow_arg" ]]; then
  echo "Error: workflow directory not found: $workflow_arg" >&2
  exit 1
fi

workflow_dir=$(cd "$workflow_arg" && pwd)

if [[ "$(basename "$workflow_dir")" != "Workflow" ]]; then
  echo "Error: target must be a Workflow directory" >&2
  exit 1
fi

template="$workflow_dir/TEMPLATE-ITEM.txt"
intake_dir="$workflow_dir/01-Intake"

if [[ ! -f "$template" ]]; then
  echo "Error: template not found: $template" >&2
  exit 1
fi

if [[ ! -d "$intake_dir" ]]; then
  echo "Error: intake directory not found: $intake_dir" >&2
  exit 1
fi

slug=$(printf '%s' "$raw_name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')

if [[ -z "$slug" ]]; then
  echo "Error: item name produced an empty slug" >&2
  exit 1
fi

today=$(date +%Y%m%d)
iso_today=$(date +%F)
filename="${today}-${slug}.item.txt"
target="$intake_dir/$filename"

if [[ -e "$target" ]]; then
  echo "Error: target item already exists: $target" >&2
  exit 1
fi

layer_name=$(basename "$(dirname "$workflow_dir")")
item_title=${title:-$(printf '%s' "$raw_name" | sed -E 's/[-_]+/ /g; s/\b([a-z])/\U\1/g')}
item_id="item-${today}-${slug}"

python3 - "$template" "$target" "$item_id" "$item_title" "$layer_name" "$iso_today" <<'PY'
import sys

src, dst, item_id, title, layer_name, today = sys.argv[1:]
updates = {
    "Item ID:": f"Item ID: {item_id}",
    "Title:": f"Title: {title}",
    "Layer:": f"Layer: {layer_name}",
    "Current Step:": "Current Step: 01-Intake",
    "Current Path:": "Current Path: Workflow/01-Intake/",
    "Created:": f"Created: {today}",
    "Last Updated:": f"Last Updated: {today}",
}

with open(src, "r", encoding="utf-8") as fh:
    lines = fh.readlines()

out = []
for line in lines:
    replaced = False
    for prefix, value in updates.items():
        if line.startswith(prefix):
            out.append(value + "\n")
            replaced = True
            break
    if not replaced:
        out.append(line)

with open(dst, "w", encoding="utf-8") as fh:
    fh.writelines(out)
PY

echo "created: $target"
