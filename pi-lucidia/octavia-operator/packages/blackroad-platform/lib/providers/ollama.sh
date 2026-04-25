#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=../common.sh
. "$ROOT_DIR/lib/common.sh"

ollama_available() {
  local base_url="${OLLAMA_BASE_URL:-http://localhost:11434}"
  curl -sS --max-time 2 "$base_url/api/tags" >/dev/null 2>&1
}

ollama_call() {
  local system_prompt="${1:-}"
  local user_prompt="${2:-}"
  local base_url="${OLLAMA_BASE_URL:-http://localhost:11434}"
  local model="${OLLAMA_MODEL:-llama3.1}"
  local keep_alive="${OLLAMA_KEEP_ALIVE:-5m}"
  local timeout="${OLLAMA_TIMEOUT_SECONDS:-60}"

  require_cmd curl
  require_cmd jq

  local payload
  payload="$(jq -n \
    --arg model "$model" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    --arg keep_alive "$keep_alive" \
    '{
      model: $model,
      stream: false,
      keep_alive: $keep_alive,
      messages: (
        ($system | if length > 0 then [{role: "system", content: $system}] else [] end)
        + [{role: "user", content: $user}]
      )
    }')"

  local response
  response="$(HTTP_TIMEOUT_SECONDS="$timeout" http_json POST "$base_url/api/chat" "$payload")"

  local output
  output="$(printf '%s' "$response" | jq -r '.message.content // empty')"
  if [[ -z "$output" ]]; then
    die "Ollama response missing content"
  fi

  printf '%s\n' "$output"
}
