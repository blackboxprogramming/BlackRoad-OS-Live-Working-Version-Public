#!/bin/bash
# Generate a saved manifest of active workflow queues across the Canonical hierarchy
# Usage: ./queue-report.sh [output-file]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./queue-report.sh [output-file]

Examples:
  ./queue-report.sh
  ./queue-report.sh ./QUEUE-REPORTS/manual-queue-report.txt

What it does:
  Scans the main active workflow states and writes a reusable queue manifest.

Tracked states:
  - 01-Intake
  - 18-Review
  - 23-Ready-to-Move
  - 24-Conveyor-Belt
  - 25-Transfer

Rules:
  - if [output-file] is omitted, the report is written into ./QUEUE-REPORTS/
  - TEMPLATE-ITEM.txt is excluded
EOF
}

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
REPORT_DIR="$ROOT_DIR/QUEUE-REPORTS"
output_arg=${1:-}

if [[ -n "$output_arg" ]]; then
  output_path=$output_arg
else
  output_path="$REPORT_DIR/$(date +%Y%m%d)-queue-report.txt"
fi

mkdir -p "$(dirname "$output_path")"

python3 - "$ROOT_DIR" "$output_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
tracked_steps = [
    "01-Intake",
    "18-Review",
    "23-Ready-to-Move",
    "24-Conveyor-Belt",
    "25-Transfer",
]

summary_counts = {step: 0 for step in tracked_steps}
rows = []

for workflow in sorted(root.rglob("Workflow")):
    step_rows = []
    for step_name in tracked_steps:
        step_dir = workflow / step_name
        if not step_dir.is_dir():
            continue
        files = sorted(
            p.name for p in step_dir.iterdir()
            if p.is_file() and p.name != "TEMPLATE-ITEM.txt"
        )
        if files:
            summary_counts[step_name] += len(files)
            step_rows.append((step_name, files))
    if step_rows:
        rows.append((str(workflow.relative_to(root)), step_rows))

lines = [
    "Canonical queue report",
    "======================",
    "",
    f"Generated: {date.today().isoformat()}",
    "",
    "Tracked state totals",
    "--------------------",
]

for step_name in tracked_steps:
    lines.append(f"{step_name}: {summary_counts[step_name]}")

lines.extend(["", f"Workflows with queued items: {len(rows)}", ""])

if not rows:
    lines.append("No queued items found.")
else:
    for workflow_rel, step_rows in rows:
        lines.append(workflow_rel)
        for step_name, files in step_rows:
            lines.append(f"  {step_name}: {len(files)}")
            for name in files:
                lines.append(f"    - {name}")
        lines.append("")

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY

echo "queue report written: $output_path"
