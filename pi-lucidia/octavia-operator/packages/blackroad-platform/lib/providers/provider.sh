#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../common.sh
. "$ROOT_DIR/lib/common.sh"
# shellcheck source=anthropic.sh
. "$ROOT_DIR/lib/providers/anthropic.sh"
# shellcheck source=openai.sh
. "$ROOT_DIR/lib/providers/openai.sh"
# shellcheck source=ollama.sh
. "$ROOT_DIR/lib/providers/ollama.sh"

normalize_provider() {
  local provider="$1"
  printf '%s' "$provider" | tr '[:upper:]' '[:lower:]'
}

select_provider() {
  if ollama_available; then
    printf '%s' "ollama"
    return 0
  fi

  if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    printf '%s' "anthropic"
    return 0
  fi

  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    printf '%s' "openai"
    return 0
  fi

  die "No provider available. Set OLLAMA_BASE_URL or API keys."
}

provider_call() {
  local provider="${1:-auto}"
  local system_prompt="${2:-}"
  local user_prompt="${3:-}"

  provider="$(normalize_provider "$provider")"
  if [[ -z "$provider" || "$provider" == "auto" || "$provider" == "local-first" ]]; then
    provider="$(select_provider)"
  fi

  case "$provider" in
    ollama)
      ollama_call "$system_prompt" "$user_prompt"
      ;;
    anthropic|claude)
      anthropic_call "$system_prompt" "$user_prompt"
      ;;
    openai)
      openai_call "$system_prompt" "$user_prompt"
      ;;
    *)
      die "Unsupported provider: $provider"
      ;;
  esac
}
