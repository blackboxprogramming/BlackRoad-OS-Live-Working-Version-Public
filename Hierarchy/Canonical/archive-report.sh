#!/bin/bash
# Generate a saved manifest of archived items and records across the Canonical hierarchy
# Usage: ./archive-report.sh [output-file]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./archive-report.sh [output-file]

Examples:
  ./archive-report.sh
  ./archive-report.sh ./ARCHIVE-REPORTS/manual-archive-report.txt

What it does:
  Scans every Workflow/27-Archive-and-Reference/ directory and writes a reusable manifest.

Rules:
  - if [output-file] is omitted, the report is written into ./ARCHIVE-REPORTS/
  - item files and index sidecar files are counted separately
EOF
}

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
REPORT_DIR="$ROOT_DIR/ARCHIVE-REPORTS"
output_arg=${1:-}

if [[ -n "$output_arg" ]]; then
  output_path=$output_arg
else
  output_path="$REPORT_DIR/$(date +%Y%m%d)-archive-report.txt"
fi

mkdir -p "$(dirname "$output_path")"

python3 - "$ROOT_DIR" "$output_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
rows = []
total_items = 0
total_records = 0

for archive_dir in sorted(root.rglob("27-Archive-and-Reference")):
    if not archive_dir.is_dir():
        continue
    item_files = sorted(
        p.name for p in archive_dir.iterdir()
        if p.is_file() and p.name.endswith(".item.txt") and p.name != "TEMPLATE-ITEM.txt"
    )
    index_files = sorted(
        p.name for p in archive_dir.iterdir()
        if p.is_file() and p.name.endswith(".index.txt")
    )
    if item_files or index_files:
        total_items += len(item_files)
        total_records += len(index_files)
        rows.append({
            "path": str(archive_dir.relative_to(root)),
            "item_files": item_files,
            "index_files": index_files,
        })

lines = [
    "Canonical archive report",
    "========================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Archive directories with content: {len(rows)}",
    f"Archived item files: {total_items}",
    f"Archived index records: {total_records}",
    "",
]

if not rows:
    lines.append("No archived items found.")
else:
    for row in rows:
        lines.extend([
            row["path"],
            f"  Item files: {len(row['item_files'])}",
            f"  Index records: {len(row['index_files'])}",
        ])
        if row["item_files"]:
            lines.append("  Items")
            lines.append("  -----")
            lines.extend(f"  - {name}" for name in row["item_files"])
        if row["index_files"]:
            lines.append("  Index records")
            lines.append("  -------------")
            lines.extend(f"  - {name}" for name in row["index_files"])
        lines.append("")

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY

echo "archive report written: $output_path"
