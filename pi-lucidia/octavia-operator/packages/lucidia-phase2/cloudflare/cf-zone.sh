#!/usr/bin/env bash
set -e

[[ -z "$CF_API_TOKEN" || -z "$CF_ZONE_ID" ]] && {
  echo "❌ Cloudflare env vars missing"; exit 1;
}

RESP=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID")

BODY=$(echo "$RESP" | head -n -1)
CODE=$(echo "$RESP" | tail -n1)

[[ "$CODE" != "200" ]] && { echo "$BODY"; exit 1; }

echo "$BODY" | jq '.result | {name, status, paused, name_servers}'
