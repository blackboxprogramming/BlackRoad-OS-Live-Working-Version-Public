#!/bin/bash
# Archive an item by ensuring step-26 indexing exists, then moving item and record to step 27
# Usage: ./archive-item.sh <item-file>

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

usage() {
  cat <<'EOF'
Usage:
  ./archive-item.sh <item-file>

Examples:
  ./archive-item.sh /Applications/Hierarchy/Canonical/.../Workflow/18-Review/example.item.txt
  ./archive-item.sh /Applications/Hierarchy/Canonical/.../Workflow/26-Index/example.item.txt

Rules:
  - <item-file> must live inside Workflow/<step>/
  - if the item is not already in 26-Index, it will be indexed first
  - an index sidecar record is created or refreshed in 26-Index
  - the item and its index record then move to 27-Archive-and-Reference
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
  echo "Error: refusing to archive TEMPLATE-ITEM.txt" >&2
  exit 1
fi

case "$current_step" in
  27-Archive-and-Reference)
    echo "Error: item is already archived" >&2
    exit 1
    ;;
  *)
    "$ROOT_DIR/index-item.sh" "$item_path" >/dev/null
    ;;
esac

if [[ "$current_step" == "26-Index" ]]; then
  "$ROOT_DIR/index-item.sh" "$item_path" >/dev/null
fi

workflow_dir=$(dirname "$item_dir")
index_dir="$workflow_dir/26-Index"
archive_dir="$workflow_dir/27-Archive-and-Reference"
indexed_path="$index_dir/$item_name"
record_name=${item_name%.item.txt}.index.txt
index_record="$index_dir/$record_name"
archived_record="$archive_dir/$record_name"

if [[ ! -f "$indexed_path" ]]; then
  echo "Error: indexed item not found after indexing: $indexed_path" >&2
  exit 1
fi

if [[ ! -f "$index_record" ]]; then
  echo "Error: index record not found after indexing: $index_record" >&2
  exit 1
fi

"$ROOT_DIR/move-item.sh" "$indexed_path" 27-Archive-and-Reference
archived_path="$archive_dir/$item_name"

if [[ -e "$archived_record" ]]; then
  echo "Error: archive record already exists: $archived_record" >&2
  exit 1
fi

mv "$index_record" "$archived_record"

echo "archive complete:"
echo "  indexed: $indexed_path"
echo "  index record: $archived_record"
echo "  archived: $archived_path"
