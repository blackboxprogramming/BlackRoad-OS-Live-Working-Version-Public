#!/bin/bash
# Run a one-command health check for the Canonical hierarchy
# Usage: ./doctor.sh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

printf '%s\n' 'Canonical doctor'
printf '%s\n\n' '================'

printf '%s\n' '[1/2] Status overview'
printf '%s\n' '---------------------'
"$ROOT_DIR/status-overview.sh"

printf '\n%s\n' '[2/2] Integrity check'
printf '%s\n' '---------------------'
"$ROOT_DIR/check-integrity.sh"
