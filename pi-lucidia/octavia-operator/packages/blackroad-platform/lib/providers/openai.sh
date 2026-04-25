#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../common.sh
. "$ROOT_DIR/lib/common.sh"

openai_call() {
  local system_prompt="${1:-}"
  local user_prompt="${2:-}"
  local model="${OPENAI_MODEL:-gpt-4o-mini}"
  local max_tokens="${OPENAI_MAX_TOKENS:-1024}"
  local api_url="${OPENAI_API_URL:-https://api.openai.com/v1/chat/completions}"
  local timeout="${OPENAI_TIMEOUT_SECONDS:-60}"

  require_env OPENAI_API_KEY
  require_cmd curl
  require_cmd jq

  if ! [[ "$max_tokens" =~ ^[0-9]+$ ]]; then
    die "OPENAI_MAX_TOKENS must be numeric"
  fi

  local payload
  payload="$(jq -n \
    --arg model "$model" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    --argjson max_tokens "$max_tokens" \
    '{
      model: $model,
      max_tokens: $max_tokens,
      messages: (
        ($system | if length > 0 then [{role: "system", content: $system}] else [] end)
        + [{role: "user", content: $user}]
      )
    }')"

  local response
  response="$(HTTP_TIMEOUT_SECONDS="$timeout" http_json POST "$api_url" "$payload" \
    "Authorization: Bearer $OPENAI_API_KEY")"

  local output
  output="$(printf '%s' "$response" | jq -r '.choices[0].message.content // empty')"
  if [[ -z "$output" ]]; then
    die "OpenAI response missing content"
  fi

  printf '%s\n' "$output"
}
