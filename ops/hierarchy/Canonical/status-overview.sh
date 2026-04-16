#!/bin/bash
# Summarize key workflow state counts across the Canonical hierarchy
# Usage: ./status-overview.sh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

printf '%s\n' 'Canonical status overview'
printf '%s\n\n' '========================='
printf 'Root: %s\n\n' "$ROOT_DIR"

count_items() {
  local step_name=$1
  find "$ROOT_DIR" -type d -path "*/Workflow/$step_name" -print0 |
    while IFS= read -r -d '' dir; do
      find "$dir" -mindepth 1 -maxdepth 1 -type f ! -name 'TEMPLATE-ITEM.txt'
    done | wc -l | tr -d ' '
}

print_section() {
  local label=$1
  local step_name=$2
  local count
  count=$(count_items "$step_name")
  printf '%-22s %s\n' "$label" "$count"
}

printf '%s\n' 'Key state counts'
printf '%s\n' '----------------'
print_section '01-Intake' '01-Intake'
print_section '18-Review' '18-Review'
print_section '23-Ready-to-Move' '23-Ready-to-Move'
print_section '24-Conveyor-Belt' '24-Conveyor-Belt'
print_section '25-Transfer' '25-Transfer'
print_section '27-Archive-and-Reference' '27-Archive-and-Reference'

printf '\n%s\n' 'Active workflow directories with items'
printf '%s\n' '-------------------------------------'

python3 - "$ROOT_DIR" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
rows = []
for workflow in root.rglob('Workflow'):
    counts = {}
    total = 0
    for step in workflow.iterdir():
        if not step.is_dir():
            continue
        files = [p for p in step.iterdir() if p.is_file() and p.name != 'TEMPLATE-ITEM.txt']
        if files:
            counts[step.name] = len(files)
            total += len(files)
    if counts:
        rel = workflow.relative_to(root)
        rows.append((str(rel), total, counts))

for rel, total, counts in sorted(rows):
    summary = ', '.join(f'{name}:{count}' for name, count in sorted(counts.items()))
    print(f'{rel} -> total:{total} [{summary}]')
PY
