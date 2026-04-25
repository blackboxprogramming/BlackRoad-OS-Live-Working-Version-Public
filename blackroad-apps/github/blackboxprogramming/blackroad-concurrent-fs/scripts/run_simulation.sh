#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-./.brcfs-run}"
WRITERS="${2:-100}"
OPS_PER_WRITER="${3:-10}"

PYTHONPATH=./src python3 -m brcfs.simulation.harness --root "$ROOT" --writers "$WRITERS" --ops-per-writer "$OPS_PER_WRITER"
