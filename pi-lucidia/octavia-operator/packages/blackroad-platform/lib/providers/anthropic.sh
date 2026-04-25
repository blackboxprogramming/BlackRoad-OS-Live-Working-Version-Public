#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../common.sh
. "$ROOT_DIR/lib/common.sh"

anthropic_call() {
  local system_prompt="${1:-}"
  local user_prompt="${2:-}"
  local model="${ANTHROPIC_MODEL:-claude-3-5-sonnet-20240620}"
  local max_tokens="${ANTHROPIC_MAX_TOKENS:-1024}"
  local api_url="${ANTHROPIC_API_URL:-https://api.anthropic.com/v1/messages}"
  local timeout="${ANTHROPIC_TIMEOUT_SECONDS:-60}"

  require_env ANTHROPIC_API_KEY
  require_cmd curl
  require_cmd jq

  if ! [[ "$max_tokens" =~ ^[0-9]+$ ]]; then
    die "ANTHROPIC_MAX_TOKENS must be numeric"
  fi

  local payload
  payload="$(jq -n \
    --arg model "$model" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    --argjson max_tokens "$max_tokens" \
    '{
      model: $model,
      system: $system,
      max_tokens: $max_tokens,
      messages: [
        {
          role: "user",
          content: [{type: "text", text: $user}]
        }
      ]
    }')"

  local response
  response="$(HTTP_TIMEOUT_SECONDS="$timeout" http_json POST "$api_url" "$payload" \
    "x-api-key: $ANTHROPIC_API_KEY" \
    "anthropic-version: 2023-06-01")"

  local output
  output="$(printf '%s' "$response" | jq -r '.content[0].text // empty')"
  if [[ -z "$output" ]]; then
    die "Anthropic response missing content"
  fi

  printf '%s\n' "$output"
}
