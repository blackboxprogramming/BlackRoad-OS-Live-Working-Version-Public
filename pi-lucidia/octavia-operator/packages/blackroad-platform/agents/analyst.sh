#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
. "$ROOT_DIR/lib/common.sh"
# shellcheck source=../lib/providers/provider.sh
. "$ROOT_DIR/lib/providers/provider.sh"

load_env

SYSTEM_PROMPT='You are a BlackRoad analyst. Provide concise, high-signal answers.'
USER_PROMPT="${*:-}"

if [[ -z "$USER_PROMPT" ]]; then
  USER_PROMPT="$(cat)"
fi

provider_call "${PROVIDER:-auto}" "$SYSTEM_PROMPT" "$USER_PROMPT"
