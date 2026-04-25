#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=../lib/common.sh
. "$ROOT_DIR/lib/common.sh"

load_env

CF_API_BASE="https://api.cloudflare.com/client/v4"
CF_ENVS="${CF_ENVS:-dev prod}"
SECRETS_DIR="$ROOT_DIR/.secrets/cloudflare"
TUNNEL_CONFIG_DIR="${CF_TUNNEL_CONFIG_DIR:-$ROOT_DIR/cloudflare/generated}"
ROUTES_TEMP_FILE=""

usage() {
  cat <<'USAGE'
Usage: setup-cloudflare.sh [all|zones|dns|tunnels|access]

Environment:
  CLOUDFLARE_ACCOUNT_ID  Required for all operations
  CLOUDFLARE_API_TOKEN   Required for write operations
  CLOUDFLARE_API_TOKEN_READ Optional read token
USAGE
}

require_cmd curl
require_cmd jq
require_env CLOUDFLARE_ACCOUNT_ID
require_env CLOUDFLARE_API_TOKEN

CF_READ_TOKEN="${CLOUDFLARE_API_TOKEN_READ:-$CLOUDFLARE_API_TOKEN}"
CF_WRITE_TOKEN="$CLOUDFLARE_API_TOKEN"

mkdir -p "$SECRETS_DIR" "$SECRETS_DIR/tunnels" "$SECRETS_DIR/access" "$TUNNEL_CONFIG_DIR"
chmod 700 "$SECRETS_DIR"

cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local token

  case "$method" in
    GET)
      token="$CF_READ_TOKEN"
      ;;
    *)
      token="$CF_WRITE_TOKEN"
      ;;
  esac

  http_json "$method" "$CF_API_BASE$path" "$data" "Authorization: Bearer $token"
}

ensure_zone() {
  local env="$1"
  local env_upper
  local zone_name_var
  local zone_id_var
  local zone_name
  local zone_id

  env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
  zone_name_var="CF_ZONE_NAME_${env_upper}"
  zone_id_var="CF_ZONE_ID_${env_upper}"

  zone_id="${!zone_id_var:-}"
  zone_name="${!zone_name_var:-}"

  if [[ -z "$zone_id" ]]; then
    if [[ -z "$zone_name" ]]; then
      die "Missing $zone_name_var or $zone_id_var for $env"
    fi

    zone_id="$(cf_api GET "/zones?name=$zone_name" "" | jq -r '.result[0].id // empty')"

    if [[ -z "$zone_id" ]]; then
      local payload
      payload="$(jq -n \
        --arg name "$zone_name" \
        --arg account "$CLOUDFLARE_ACCOUNT_ID" \
        '{name: $name, account: {id: $account}, jump_start: true, type: "full"}')"
      zone_id="$(cf_api POST "/zones" "$payload" | jq -r '.result.id')"
    fi
  fi

  printf '%s' "$zone_id"
}

write_zone_ids() {
  local output="$SECRETS_DIR/zone-ids.env"
  : > "$output"
  for env in $CF_ENVS; do
    local env_upper
    local zone_id
    env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
    zone_id="$(ensure_zone "$env")"
    printf 'CF_ZONE_ID_%s=%s\n' "$env_upper" "$zone_id" >> "$output"
  done
  chmod 600 "$output"
}

upsert_dns_records() {
  local env="$1"
  local env_upper
  local zone_id
  local records_file

  env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
  zone_id="$(ensure_zone "$env")"

  records_file="$ROOT_DIR/cloudflare/dns.$env.json"
  if [[ ! -f "$records_file" ]]; then
    warn "Missing DNS records file: $records_file"
    return 0
  fi

  if ! jq -e '. | type == "array"' "$records_file" >/dev/null; then
    die "DNS records file must be a JSON array: $records_file"
  fi

  if [[ "$(jq -r 'length' "$records_file")" -eq 0 ]]; then
    log "No DNS records defined for $env"
    return 0
  fi

  jq -c '.[]' "$records_file" | while IFS= read -r record; do
    local type
    local name
    local payload
    local record_id

    type="$(printf '%s' "$record" | jq -r '.type')"
    name="$(printf '%s' "$record" | jq -r '.name')"

    payload="$(printf '%s' "$record" | jq '.ttl //= 1 | .proxied //= false')"

    record_id="$(cf_api GET "/zones/$zone_id/dns_records?type=$type&name=$name&per_page=1" "" | jq -r '.result[0].id // empty')"

    if [[ -n "$record_id" ]]; then
      cf_api PUT "/zones/$zone_id/dns_records/$record_id" "$payload" >/dev/null
      log "Updated DNS record: $name ($env)"
    else
      cf_api POST "/zones/$zone_id/dns_records" "$payload" >/dev/null
      log "Created DNS record: $name ($env)"
    fi
  done
}

ensure_cloudflared_login() {
  local cert_path
  cert_path="${CLOUDFLARED_ORIGIN_CERT:-$HOME/.cloudflared/cert.pem}"
  if [[ ! -f "$cert_path" ]]; then
    die "cloudflared login required. Run: cloudflared login"
  fi
}

load_routes_file() {
  local env="$1"
  local env_upper
  local routes_file
  local domain_var
  local domain

  env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
  routes_file="$ROOT_DIR/cloudflare/tunnel.$env.routes"

  if [[ -f "$routes_file" ]]; then
    ROUTES_TEMP_FILE=""
    printf '%s' "$routes_file"
    return 0
  fi

  domain_var="CF_DOMAIN_${env_upper}"
  domain="${!domain_var:-}"

  if [[ -z "$domain" ]]; then
    die "Missing $domain_var or tunnel routes file for $env"
  fi

  routes_file="$(mktemp)"
  printf '%s\n' "api.$domain http://localhost:3000" >> "$routes_file"
  printf '%s\n' "agents.$domain http://localhost:3030" >> "$routes_file"
  printf '%s\n' "web.$domain http://localhost:3000" >> "$routes_file"
  ROUTES_TEMP_FILE="$routes_file"
  printf '%s' "$routes_file"
}

write_tunnel_config() {
  local env="$1"
  local tunnel_id="$2"
  local credentials_file="$3"
  local config_file="$4"
  local routes_file="$5"

  {
    printf 'tunnel: %s\n' "$tunnel_id"
    printf 'credentials-file: %s\n' "$credentials_file"
    printf 'ingress:\n'
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      [[ "$line" =~ ^# ]] && continue
      local hostname
      local service
      hostname="${line%% *}"
      service="${line#* }"
      if [[ -z "$hostname" || -z "$service" ]]; then
        continue
      fi
      printf '  - hostname: %s\n' "$hostname"
      printf '    service: %s\n' "$service"
    done < "$routes_file"
    printf '  - service: http_status:404\n'
  } > "$config_file"
}

setup_tunnels() {
  require_cmd cloudflared
  ensure_cloudflared_login

  for env in $CF_ENVS; do
    local env_upper
    local tunnel_name_var
    local tunnel_name
    local tunnel_id
    local creds_source
    local creds_dest
    local config_file
    local routes_file

    env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
    tunnel_name_var="CF_TUNNEL_NAME_${env_upper}"
    tunnel_name="${!tunnel_name_var:-}"

    if [[ -z "$tunnel_name" ]]; then
      die "Missing $tunnel_name_var"
    fi

    tunnel_id="$(cloudflared tunnel list --output json | jq -r --arg name "$tunnel_name" '.[] | select(.name==$name) | .id')"
    if [[ -z "$tunnel_id" ]]; then
      cloudflared tunnel create "$tunnel_name" >/dev/null
      tunnel_id="$(cloudflared tunnel list --output json | jq -r --arg name "$tunnel_name" '.[] | select(.name==$name) | .id')"
    fi

    creds_source="$HOME/.cloudflared/$tunnel_id.json"
    if [[ ! -f "$creds_source" ]]; then
      die "Missing tunnel credentials: $creds_source"
    fi

    creds_dest="$SECRETS_DIR/tunnels/$tunnel_name-$tunnel_id.json"
    cp "$creds_source" "$creds_dest"
    chmod 600 "$creds_dest"

    config_file="$TUNNEL_CONFIG_DIR/$tunnel_name.yml"
    routes_file="$(load_routes_file "$env")"
    write_tunnel_config "$env" "$tunnel_id" "$creds_dest" "$config_file" "$routes_file"
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      [[ "$line" =~ ^# ]] && continue
      local hostname
      hostname="${line%% *}"
      if [[ -n "$hostname" ]]; then
        cloudflared tunnel route dns "$tunnel_name" "$hostname" >/dev/null
      fi
    done < "$routes_file"

    if [[ -n "$ROUTES_TEMP_FILE" ]]; then
      rm -f "$ROUTES_TEMP_FILE"
      ROUTES_TEMP_FILE=""
    fi

    log "Tunnel ready: $tunnel_name ($env)"
  done
}

setup_access() {
  require_env CF_ACCESS_ALLOWED_EMAILS

  local include_json
  include_json="$(printf '%s' "$CF_ACCESS_ALLOWED_EMAILS" | tr ',' '\n' | jq -R -s 'split("\n") | map(select(length>0)) | map({email:{email:.}})')"

  for env in $CF_ENVS; do
    local env_upper
    local app_name_var
    local app_domain_var
    local token_name_var
    local app_name
    local app_domain
    local token_name
    local app_id
    local policy_id
    local payload

    env_upper="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')"
    app_name_var="CF_ACCESS_APP_NAME_${env_upper}"
    app_domain_var="CF_ACCESS_APP_DOMAIN_${env_upper}"
    token_name_var="CF_ACCESS_SERVICE_TOKEN_NAME_${env_upper}"

    app_name="${!app_name_var:-BlackRoad ${env} Access}"
    app_domain="${!app_domain_var:-}"
    token_name="${!token_name_var:-BlackRoad ${env} Service Token}"

    if [[ -z "$app_domain" ]]; then
      die "Missing $app_domain_var"
    fi

    app_id="$(cf_api GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps?name=$app_name" "" | jq -r '.result[0].id // empty')"
    if [[ -z "$app_id" ]]; then
      payload="$(jq -n \
        --arg name "$app_name" \
        --arg domain "$app_domain" \
        '{name: $name, domain: $domain, type: "self_hosted", session_duration: "24h"}')"
      app_id="$(cf_api POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps" "$payload" | jq -r '.result.id')"
    fi

    policy_id="$(cf_api GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps/$app_id/policies" "" | jq -r '.result[] | select(.name=="Allow access") | .id' | head -n 1)"

    payload="$(jq -n \
      --arg name "Allow access" \
      --arg decision "allow" \
      --argjson include "$include_json" \
      '{name: $name, decision: $decision, include: $include}')"

    if [[ -n "$policy_id" ]]; then
      cf_api PUT "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps/$app_id/policies/$policy_id" "$payload" >/dev/null
    else
      cf_api POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/apps/$app_id/policies" "$payload" >/dev/null
    fi

    local service_token_id
    service_token_id="$(cf_api GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/service_tokens" "" | jq -r --arg name "$token_name" '.result[] | select(.name==$name) | .id' | head -n 1)"

    if [[ -z "$service_token_id" ]]; then
      payload="$(jq -n --arg name "$token_name" '{name: $name}')"
      cf_api POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/access/service_tokens" "$payload" > "$SECRETS_DIR/access/service-token-$env.json"
      chmod 600 "$SECRETS_DIR/access/service-token-$env.json"
    else
      log "Service token exists for $env. Skipping creation."
    fi

    log "Access ready: $app_name ($env)"
  done
}

run_all() {
  write_zone_ids
  for env in $CF_ENVS; do
    upsert_dns_records "$env"
  done
  setup_tunnels
  setup_access
}

command="${1:-all}"
case "$command" in
  all)
    run_all
    ;;
  zones)
    write_zone_ids
    ;;
  dns)
    for env in $CF_ENVS; do
      upsert_dns_records "$env"
    done
    ;;
  tunnels)
    setup_tunnels
    ;;
  access)
    setup_access
    ;;
  *)
    usage
    exit 1
    ;;
esac
