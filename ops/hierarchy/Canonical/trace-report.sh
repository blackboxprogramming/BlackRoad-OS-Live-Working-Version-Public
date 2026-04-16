#!/bin/bash
# Generate a saved lineage report for a Canonical item
# Usage: ./trace-report.sh <filename-or-item-id> [output-file]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./trace-report.sh <filename-or-item-id> [output-file]

Examples:
  ./trace-report.sh 20260415-conveyor-demo.item.txt
  ./trace-report.sh demo-001 ./TRACE-REPORTS/demo-001.trace.txt

What it does:
  Finds matching item files by basename or Item ID and writes a reusable text report.

Rules:
  - if [output-file] is omitted, the report is written into ./TRACE-REPORTS/
  - the report only includes live item matches, not TEMPLATE-ITEM.txt
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
REPORT_DIR="$ROOT_DIR/TRACE-REPORTS"
query=$1
output_arg=${2:-}

if [[ -n "$output_arg" ]]; then
  output_path=$output_arg
else
  safe_query=$(printf '%s' "$query" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]/-/g')
  output_path="$REPORT_DIR/$(date +%Y%m%d)-$safe_query.trace.txt"
fi

mkdir -p "$(dirname "$output_path")"

python3 - "$ROOT_DIR" "$query" "$output_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
query = sys.argv[2]
output_path = Path(sys.argv[3])
matches = []

def field_value(lines, prefix):
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return ""

for item in root.rglob("*.item.txt"):
    if item.name == "TEMPLATE-ITEM.txt":
        continue
    lines = item.read_text(encoding="utf-8").splitlines()
    item_id = field_value(lines, "Item ID:")
    if item.name == query or item_id == query:
        matches.append({
            "path": str(item.relative_to(root)),
            "item_id": item_id,
            "title": field_value(lines, "Title:"),
            "layer": field_value(lines, "Layer:"),
            "step": field_value(lines, "Current Step:"),
            "current_path": field_value(lines, "Current Path:"),
            "source": field_value(lines, "Source:"),
        })

if not matches:
    print(f"Error: no matching items found for query: {query}", file=sys.stderr)
    sys.exit(1)

lines = [
    "Canonical trace report",
    "======================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Query: {query}",
    f"Matches: {len(matches)}",
    "",
]

for match in sorted(matches, key=lambda m: m["path"]):
    lines.extend([
        match["path"],
        f"  Item ID: {match['item_id']}",
        f"  Title: {match['title']}",
        f"  Layer: {match['layer']}",
        f"  Current Step: {match['step']}",
        f"  Current Path: {match['current_path']}",
        f"  Source: {match['source']}",
        "",
    ])

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY

echo "trace report written: $output_path"
