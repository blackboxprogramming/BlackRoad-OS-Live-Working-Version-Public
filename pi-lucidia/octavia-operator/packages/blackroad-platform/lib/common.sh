#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${ROOT_DIR:-}" ]]; then
  ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

log() {
  printf '%s\n' "$*"
}

warn() {
  printf 'WARN: %s\n' "$*" >&2
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"
}

require_env() {
  local var="$1"
  local value="${!var:-}"
  if [[ -z "$value" ]]; then
    die "Missing required env: $var"
  fi
}

load_env() {
  local env_file="${1:-$ROOT_DIR/.env}"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

http_json() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  shift 3 || true
  local -a headers=("$@")
  local header_file
  local response
  local status
  local body
  local -a curl_args

  header_file="$(mktemp)"
  curl_args=(-sS -D "$header_file" -w '\n%{http_code}' -X "$method")

  if [[ -n "${HTTP_TIMEOUT_SECONDS:-}" ]]; then
    curl_args+=(--max-time "$HTTP_TIMEOUT_SECONDS")
  fi

  for header in "${headers[@]}"; do
    curl_args+=(-H "$header")
  done

  if [[ -n "$data" ]]; then
    curl_args+=(-H 'Content-Type: application/json' --data "$data")
  fi

  response="$(curl "${curl_args[@]}" "$url")"
  status="$(printf '%s' "$response" | tail -n 1)"
  body="$(printf '%s' "$response" | sed '$d')"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    if [[ "$status" -eq 429 ]]; then
      local retry_after
      retry_after="$(awk -F': ' 'tolower($1)=="retry-after"{print $2}' "$header_file" | tr -d '\r')"
      warn "Rate limited (HTTP 429). Retry-After: ${retry_after:-unspecified}"
    else
      warn "HTTP $status for $method $url"
    fi
    printf '%s\n' "$body" >&2
    rm -f "$header_file"
    return 1
  fi

  rm -f "$header_file"
  printf '%s' "$body"
}
