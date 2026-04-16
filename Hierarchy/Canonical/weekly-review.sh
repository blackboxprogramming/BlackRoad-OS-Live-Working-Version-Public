#!/bin/bash
# Run a weekly maintenance review for the Canonical hierarchy
# Usage: ./weekly-review.sh [review-dir]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./weekly-review.sh [review-dir]

Examples:
  ./weekly-review.sh
  ./weekly-review.sh ./WEEKLY-REVIEWS/manual-run

What it does:
  - runs the live doctor check
  - writes a queue report
  - writes an archive report
  - writes a duplicate-item review
  - writes a shell-safe naming review
  - stores the saved artifacts in a dated review directory

Rules:
  - if [review-dir] is omitted, the review is written into ./WEEKLY-REVIEWS/YYYYMMDD/
EOF
}

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
default_dir="$ROOT_DIR/WEEKLY-REVIEWS/$(date +%Y%m%d)"
review_dir=${1:-$default_dir}

mkdir -p "$review_dir"

doctor_path="$review_dir/doctor.txt"
queue_path="$review_dir/queue-report.txt"
archive_path="$review_dir/archive-report.txt"
duplicates_path="$review_dir/duplicate-review.txt"
naming_path="$review_dir/naming-review.txt"

printf '%s\n' 'Canonical weekly review'
printf '%s\n\n' '======================='
printf 'Review directory: %s\n\n' "$review_dir"

printf '%s\n' '[1/5] Doctor'
printf '%s\n' '------------'
"$ROOT_DIR/doctor.sh" | tee "$doctor_path"

printf '\n%s\n' '[2/5] Queue report'
printf '%s\n' '------------------'
"$ROOT_DIR/queue-report.sh" "$queue_path"

printf '\n%s\n' '[3/5] Archive report'
printf '%s\n' '--------------------'
"$ROOT_DIR/archive-report.sh" "$archive_path"

printf '\n%s\n' '[4/5] Duplicate review'
printf '%s\n' '----------------------'
python3 - "$ROOT_DIR" "$duplicates_path" <<'PY'
from pathlib import Path
from datetime import date
from collections import defaultdict
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
groups = defaultdict(list)

for item in root.rglob("*.item.txt"):
    if item.name == "TEMPLATE-ITEM.txt":
        continue
    groups[item.name].append(str(item.relative_to(root)))

duplicates = {name: sorted(paths) for name, paths in groups.items() if len(paths) > 1}

lines = [
    "Canonical duplicate review",
    "==========================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Duplicate basenames: {len(duplicates)}",
    "",
]

if not duplicates:
    lines.append("No duplicate item basenames found.")
else:
    for name, paths in sorted(duplicates.items()):
        lines.append(name)
        for path in paths:
            lines.append(f"  - {path}")
        lines.append("")

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY
printf 'Duplicate review: %s\n' "$duplicates_path"

printf '\n%s\n' '[5/5] Naming review'
printf '%s\n' '-------------------'
python3 - "$ROOT_DIR" "$naming_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
violations = []

for path in root.rglob("*"):
    if path.name in {"ARCHIVE-REPORTS", "DAILY-BRIEFS", "QUEUE-REPORTS", "TRACE-REPORTS", "WEEKLY-REVIEWS"}:
        continue
    if " " in path.name:
        violations.append(str(path.relative_to(root)))

lines = [
    "Canonical naming review",
    "=======================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Names with spaces: {len(violations)}",
    "",
]

if not violations:
    lines.append("No shell-unsafe space-containing names found.")
else:
    for violation in sorted(violations):
        lines.append(f"- {violation}")

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY
printf 'Naming review: %s\n' "$naming_path"

printf '\n%s\n' 'Artifacts'
printf '%s\n' '---------'
printf 'Doctor: %s\n' "$doctor_path"
printf 'Queue: %s\n' "$queue_path"
printf 'Archive: %s\n' "$archive_path"
printf 'Duplicates: %s\n' "$duplicates_path"
printf 'Naming: %s\n' "$naming_path"
