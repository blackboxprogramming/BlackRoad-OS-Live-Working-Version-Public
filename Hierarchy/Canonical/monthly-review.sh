#!/bin/bash
# Run a monthly structural review for the Canonical hierarchy
# Usage: ./monthly-review.sh [review-dir]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./monthly-review.sh [review-dir]

Examples:
  ./monthly-review.sh
  ./monthly-review.sh ./MONTHLY-REVIEWS/manual-run

What it does:
  - runs the live doctor check
  - writes queue and archive reports
  - writes duplicate and naming reviews
  - writes a HOW-TO inventory review
  - writes an automation inventory review
  - stores the saved artifacts in a dated review directory

Rules:
  - if [review-dir] is omitted, the review is written into ./MONTHLY-REVIEWS/YYYYMMDD/
EOF
}

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
default_dir="$ROOT_DIR/MONTHLY-REVIEWS/$(date +%Y%m%d)"
review_dir=${1:-$default_dir}

mkdir -p "$review_dir"

doctor_path="$review_dir/doctor.txt"
queue_path="$review_dir/queue-report.txt"
archive_path="$review_dir/archive-report.txt"
duplicates_path="$review_dir/duplicate-review.txt"
naming_path="$review_dir/naming-review.txt"
howto_path="$review_dir/howto-review.txt"
automation_path="$review_dir/automation-review.txt"

printf '%s\n' 'Canonical monthly review'
printf '%s\n\n' '========================'
printf 'Review directory: %s\n\n' "$review_dir"

printf '%s\n' '[1/7] Doctor'
printf '%s\n' '------------'
"$ROOT_DIR/doctor.sh" | tee "$doctor_path"

printf '\n%s\n' '[2/7] Queue report'
printf '%s\n' '------------------'
"$ROOT_DIR/queue-report.sh" "$queue_path"

printf '\n%s\n' '[3/7] Archive report'
printf '%s\n' '--------------------'
"$ROOT_DIR/archive-report.sh" "$archive_path"

printf '\n%s\n' '[4/7] Duplicate review'
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

printf '\n%s\n' '[5/7] Naming review'
printf '%s\n' '-------------------'
python3 - "$ROOT_DIR" "$naming_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
skip_names = {"ARCHIVE-REPORTS", "DAILY-BRIEFS", "QUEUE-REPORTS", "TRACE-REPORTS", "WEEKLY-REVIEWS", "MONTHLY-REVIEWS"}
violations = []

for path in root.rglob("*"):
    if any(part in skip_names for part in path.parts):
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

printf '\n%s\n' '[6/7] HOW-TO review'
printf '%s\n' '-------------------'
python3 - "$ROOT_DIR" "$howto_path" <<'PY'
from pathlib import Path
from datetime import date
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
howto_dir = root / "HOW-TO"
guides = sorted(p.name for p in howto_dir.glob("*.txt") if p.is_file())

lines = [
    "Canonical HOW-TO review",
    "========================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Guide count: {len(guides)}",
    "",
    "Guide files",
    "-----------",
]

if not guides:
    lines.append("No HOW-TO guides found.")
else:
    lines.extend(f"- {name}" for name in guides)

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY
printf 'HOW-TO review: %s\n' "$howto_path"

printf '\n%s\n' '[7/7] Automation review'
printf '%s\n' '-----------------------'
python3 - "$ROOT_DIR" "$automation_path" <<'PY'
from pathlib import Path
from datetime import date
import os
import stat
import sys

root = Path(sys.argv[1])
output_path = Path(sys.argv[2])
scripts = []

for path in sorted(root.glob("*.sh")):
    mode = path.stat().st_mode
    executable = bool(mode & stat.S_IXUSR)
    scripts.append((path.name, executable))

lines = [
    "Canonical automation review",
    "===========================",
    "",
    f"Generated: {date.today().isoformat()}",
    f"Shell helpers: {len(scripts)}",
    "",
    "Shell helper files",
    "------------------",
]

if not scripts:
    lines.append("No shell helpers found.")
else:
    for name, executable in scripts:
        status = "executable" if executable else "not-executable"
        lines.append(f"- {name} [{status}]")

output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
PY
printf 'Automation review: %s\n' "$automation_path"

printf '\n%s\n' 'Artifacts'
printf '%s\n' '---------'
printf 'Doctor: %s\n' "$doctor_path"
printf 'Queue: %s\n' "$queue_path"
printf 'Archive: %s\n' "$archive_path"
printf 'Duplicates: %s\n' "$duplicates_path"
printf 'Naming: %s\n' "$naming_path"
printf 'HOW-TO: %s\n' "$howto_path"
printf 'Automation: %s\n' "$automation_path"
