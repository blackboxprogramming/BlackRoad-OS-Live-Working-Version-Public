#!/bin/bash
# Resolve common guide keywords to the right Canonical document
# Usage: ./open-guide.sh <topic>

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
HOWTO_DIR="$ROOT_DIR/HOW-TO"

usage() {
  cat <<'EOF'
Usage:
  ./open-guide.sh <topic>

Topics:
  start | bootstrap | quickstart
  new | create
  philosophy | manifesto
  glossary | vocabulary
  move | handoff | conveyor
  handoff-tool | transfer
  archive | reference
  archive-report | archive-manifest
  queue-report | queue-manifest
  daily-brief | brief
  weekly-review | weekly
  monthly-review | monthly
  index-item | index-record
  decide | decision
  examples | trace
  quality | standards
  status | overview
  integrity | audit
  repair | fix-metadata
  lineage | trace-tool | trace-report
  doctor | health
  troubleshoot | troubleshooting
  roles | rhythms
  manual | index | map

What it does:
  Prints the best matching file path and the first part of that document.
EOF
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

topic=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')

case "$topic" in
  start|bootstrap|quickstart)
    target="$HOWTO_DIR/19-BOOTSTRAP-SEQUENCE.txt"
    ;;
  new|create)
    target="$HOWTO_DIR/01-QUICKSTART.txt"
    ;;
  philosophy|manifesto)
    target="$HOWTO_DIR/20-MANIFESTO.txt"
    ;;
  glossary|vocabulary|terms)
    target="$HOWTO_DIR/08-GLOSSARY.txt"
    ;;
  move|moving)
    target="$HOWTO_DIR/03-MOVING-ITEMS.txt"
    ;;
  handoff|handoffs|conveyor)
    target="$HOWTO_DIR/04-HANDOFFS-AND-CONVEYOR.txt"
    ;;
  handoff-tool|transfer)
    target="$HOWTO_DIR/07-RECIPES.txt"
    ;;
  archive|reference)
    target="$HOWTO_DIR/07-RECIPES.txt"
    ;;
  archive-report|archive-manifest)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  queue-report|queue-manifest|queue)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  daily-brief|brief|daily)
    target="$HOWTO_DIR/19-BOOTSTRAP-SEQUENCE.txt"
    ;;
  weekly-review|weekly)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  monthly-review|monthly)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  index-item|index-record|indexing)
    target="$HOWTO_DIR/07-RECIPES.txt"
    ;;
  decide|decision|decisions)
    target="$HOWTO_DIR/14-DECISION-TREES.txt"
    ;;
  examples|example|patterns)
    target="$HOWTO_DIR/18-EXAMPLES-LIBRARY.txt"
    ;;
  trace|traces|lineage|trace-tool|trace-report)
    target="$ROOT_DIR/EXAMPLE-TRACE.txt"
    ;;
  quality|standards)
    target="$HOWTO_DIR/16-QUALITY-STANDARDS.txt"
    ;;
  status|overview)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  integrity|audit)
    target="$HOWTO_DIR/17-TROUBLESHOOTING.txt"
    ;;
  repair|fix-metadata)
    target="$HOWTO_DIR/17-TROUBLESHOOTING.txt"
    ;;
  doctor|health)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  troubleshoot|troubleshooting|fix)
    target="$HOWTO_DIR/17-TROUBLESHOOTING.txt"
    ;;
  roles|role)
    target="$HOWTO_DIR/12-ROLE-MODES.txt"
    ;;
  rhythms|cadence)
    target="$HOWTO_DIR/15-OPERATING-RHYTHMS.txt"
    ;;
  manual|index|map)
    target="$HOWTO_DIR/21-INDEX-OF-INDEXES.txt"
    ;;
  *)
    echo "Error: unknown topic: $1" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac

echo "Guide: $target"
echo
sed -n '1,80p' "$target"
