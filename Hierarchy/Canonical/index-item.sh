#!/bin/bash
# Move an item into 26-Index and create a structured index record
# Usage: ./index-item.sh <item-file>

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

usage() {
  cat <<'EOF'
Usage:
  ./index-item.sh <item-file>

Examples:
  ./index-item.sh /Applications/Hierarchy/Canonical/.../Workflow/18-Review/example.item.txt
  ./index-item.sh /Applications/Hierarchy/Canonical/.../Workflow/26-Index/example.item.txt

What it does:
  - moves the item to 26-Index if needed
  - writes a structured sidecar index record next to the item

Rules:
  - <item-file> must live inside Workflow/<step>/
  - TEMPLATE-ITEM.txt is not allowed
  - the index record is overwritten on rerun so it stays current
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
current_step=$(basename "$item_dir")

if [[ "$item_name" == "TEMPLATE-ITEM.txt" ]]; then
  echo "Error: refusing to index TEMPLATE-ITEM.txt" >&2
  exit 1
fi

case "$current_step" in
  27-Archive-and-Reference)
    echo "Error: item is already archived" >&2
    exit 1
    ;;
  26-Index)
    indexed_path="$item_path"
    ;;
  *)
    "$ROOT_DIR/move-item.sh" "$item_path" 26-Index >/dev/null
    indexed_path="$(dirname "$item_path")/../26-Index/$item_name"
    ;;
esac

indexed_dir=$(cd "$(dirname "$indexed_path")" && pwd)
indexed_abs="$indexed_dir/$item_name"
record_name=${item_name%.item.txt}.index.txt
record_path="$indexed_dir/$record_name"

python3 - "$ROOT_DIR" "$indexed_abs" "$record_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
item_path = Path(sys.argv[2])
record_path = Path(sys.argv[3])
lines = item_path.read_text(encoding="utf-8").splitlines()

def field_value(prefix):
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return ""

item_id = field_value("Item ID:")
title = field_value("Title:")
layer = field_value("Layer:")
step = field_value("Current Step:")
current_path = field_value("Current Path:")
status = field_value("Status:")
owner = field_value("Owner:")
source = field_value("Source:")
destination_layer = field_value("Destination Layer:")
priority = field_value("Priority:")
dependencies = field_value("Dependencies:")
created = field_value("Created:")
updated = field_value("Last Updated:")

item_rel = item_path.relative_to(root)
record_rel = record_path.relative_to(root)

content = [
    "Canonical index record",
    "======================",
    "",
    f"Indexed: {date.today().isoformat()}",
    f"Item File: {item_rel}",
    f"Record File: {record_rel}",
    "",
    "Metadata",
    "--------",
    f"Item ID: {item_id}",
    f"Title: {title}",
    f"Layer: {layer}",
    f"Current Step: {step}",
    f"Current Path: {current_path}",
    f"Status: {status}",
    f"Owner: {owner}",
    f"Source: {source}",
    f"Destination Layer: {destination_layer}",
    f"Priority: {priority}",
    f"Dependencies: {dependencies}",
    f"Created: {created}",
    f"Last Updated: {updated}",
    "",
    "Purpose",
    "-------",
    "This record freezes a clean reference summary at step 26 before long-term archive.",
    "",
    "Follow-on",
    "---------",
    f"- trace with: ./trace-item.sh {item_id or item_path.name}",
    f"- report with: ./trace-report.sh {item_id or item_path.name}",
    f"- archive with: ./archive-item.sh {item_path}",
]

record_path.write_text("\n".join(content).rstrip() + "\n", encoding="utf-8")
PY

echo "index complete:"
echo "  item: $indexed_abs"
echo "  record: $record_path"
