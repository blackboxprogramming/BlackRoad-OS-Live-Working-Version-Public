#!/bin/bash
# Trace an item across the Canonical hierarchy by filename or Item ID
# Usage: ./trace-item.sh <filename-or-item-id>

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

usage() {
  cat <<'EOF'
Usage:
  ./trace-item.sh <filename-or-item-id>

Examples:
  ./trace-item.sh 20260415-conveyor-demo.item.txt
  ./trace-item.sh demo-001

What it does:
  Finds matching item files by basename or Item ID and prints a compact lineage view.
EOF
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

query=$1

python3 - "$ROOT_DIR" "$query" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
query = sys.argv[2]
matches = []

def field_value(lines, prefix):
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return None

for item in root.rglob("*.item.txt"):
    if item.name == "TEMPLATE-ITEM.txt":
        continue
    lines = item.read_text(encoding="utf-8").splitlines()
    item_id = field_value(lines, "Item ID:")
    if item.name == query or item_id == query:
        matches.append({
            "path": item.relative_to(root),
            "item_id": item_id or "",
            "title": field_value(lines, "Title:") or "",
            "layer": field_value(lines, "Layer:") or "",
            "step": field_value(lines, "Current Step:") or "",
            "source": field_value(lines, "Source:") or "",
        })

print("Canonical item trace")
print("====================")
print()
print(f"Query: {query}")
print(f"Matches: {len(matches)}")
print()

if not matches:
    print("No matching items found.")
    sys.exit(0)

for match in sorted(matches, key=lambda m: str(m["path"])):
    print(match["path"])
    print(f"  Item ID: {match['item_id']}")
    print(f"  Title: {match['title']}")
    print(f"  Layer: {match['layer']}")
    print(f"  Current Step: {match['step']}")
    print(f"  Source: {match['source']}")
PY
