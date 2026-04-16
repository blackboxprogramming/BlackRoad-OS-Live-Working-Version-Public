#!/bin/bash
# Run a session-start brief for the Canonical hierarchy
# Usage: ./daily-brief.sh [brief-dir]

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./daily-brief.sh [brief-dir]

Examples:
  ./daily-brief.sh
  ./daily-brief.sh ./DAILY-BRIEFS/manual-run

What it does:
  - runs the live doctor check
  - writes a queue report
  - writes an archive report
  - stores the saved artifacts in a dated brief directory

Rules:
  - if [brief-dir] is omitted, the brief is written into ./DAILY-BRIEFS/YYYYMMDD/
EOF
}

if [[ $# -gt 1 ]]; then
  usage >&2
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
default_dir="$ROOT_DIR/DAILY-BRIEFS/$(date +%Y%m%d)"
brief_dir=${1:-$default_dir}

mkdir -p "$brief_dir"

doctor_path="$brief_dir/doctor.txt"
queue_path="$brief_dir/queue-report.txt"
archive_path="$brief_dir/archive-report.txt"

printf '%s\n' 'Canonical daily brief'
printf '%s\n\n' '====================='
printf 'Brief directory: %s\n\n' "$brief_dir"

printf '%s\n' '[1/3] Doctor'
printf '%s\n' '------------'
"$ROOT_DIR/doctor.sh" | tee "$doctor_path"

printf '\n%s\n' '[2/3] Queue report'
printf '%s\n' '------------------'
"$ROOT_DIR/queue-report.sh" "$queue_path"

printf '\n%s\n' '[3/3] Archive report'
printf '%s\n' '--------------------'
"$ROOT_DIR/archive-report.sh" "$archive_path"

printf '\n%s\n' 'Artifacts'
printf '%s\n' '---------'
printf 'Doctor: %s\n' "$doctor_path"
printf 'Queue: %s\n' "$queue_path"
printf 'Archive: %s\n' "$archive_path"
