#!/usr/bin/env bash
curl -s \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  | jq '.result[] | {type, name, content, proxied}'
