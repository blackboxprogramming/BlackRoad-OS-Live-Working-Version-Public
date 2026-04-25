#!/usr/bin/env bash
set -e

[[ -z "$GITHUB_TOKEN" || -z "$GITHUB_OWNER" || -z "$GITHUB_REPO" ]] && {
  echo "❌ GitHub env vars missing"; exit 1;
}

API="https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO"

RESP=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: token $GITHUB_TOKEN" \
  "$API")

BODY=$(echo "$RESP" | head -n -1)
CODE=$(echo "$RESP" | tail -n1)

[[ "$CODE" != "200" ]] && { echo "$BODY"; exit 1; }

echo "$BODY" | jq '{name, private, default_branch, updated_at}'
