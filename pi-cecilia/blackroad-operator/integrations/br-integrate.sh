#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# br integrate — BlackRoad OS Integration Manager
# Manage, test, and monitor all 30 integrations
# © BlackRoad OS, Inc. All rights reserved.
# ═══════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/manifest.json"

log()   { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
info()  { echo -e "${BLUE}ℹ${NC} $1"; }

# ── List all integrations ────────────────────────────────────
cmd_list() {
  echo -e "\n${BOLD}BlackRoad OS — 30 Integrations${NC}\n"

  local categories=("banking" "payments" "ai-providers" "cloud-deploy" "project-management" "crm" "communication" "auth" "infrastructure" "mobile-tools" "storage")

  for cat in "${categories[@]}"; do
    echo -e "${CYAN}[$cat]${NC}"
    local ids
    ids=$(python3 -c "
import json, sys
m = json.load(open('$MANIFEST'))
ids = m.get('categories', {}).get('$cat', [])
for i in ids: print(i)
" 2>/dev/null || echo "")

    for id in $ids; do
      local config_file="$SCRIPT_DIR/$id/config.yaml"
      if [ -f "$config_file" ]; then
        local name
        name=$(head -2 "$config_file" | grep "^#" | sed 's/^# //' | awk -F' — ' '{print $1}' | xargs)
        echo -e "  ${GREEN}●${NC} $id — $name"
      else
        echo -e "  ${RED}○${NC} $id — (no config)"
      fi
    done
    echo ""
  done
}

# ── Status / health check ───────────────────────────────────
cmd_status() {
  echo -e "\n${BOLD}Integration Status${NC}\n"

  local total=0 configured=0 unconfigured=0

  python3 -c "
import json, os
m = json.load(open('$MANIFEST'))
for i in m['integrations']:
    total_vars = len(i.get('env_vars', []))
    set_vars = sum(1 for v in i.get('env_vars', []) if os.environ.get(v))
    status = '●' if set_vars > 0 or total_vars == 0 else '○'
    color = '32' if set_vars > 0 or total_vars == 0 else '31'
    pct = f'{set_vars}/{total_vars}' if total_vars > 0 else 'local'
    print(f'  \033[0;{color}m{status}\033[0m {i[\"id\"]:<22} {i[\"name\"]:<30} [{pct}]')
" 2>/dev/null || error "Failed to read manifest"
}

# ── Check a specific integration ─────────────────────────────
cmd_check() {
  local id="${1:-}"
  if [ -z "$id" ]; then
    error "Usage: br integrate check <integration-id>"
    return 1
  fi

  local config_file="$SCRIPT_DIR/$id/config.yaml"
  if [ ! -f "$config_file" ]; then
    error "Integration not found: $id"
    return 1
  fi

  echo -e "\n${BOLD}Checking: $id${NC}\n"
  cat "$config_file"
  echo ""

  # Check env vars
  python3 -c "
import json, os
m = json.load(open('$MANIFEST'))
for i in m['integrations']:
    if i['id'] == '$id':
        for v in i.get('env_vars', []):
            val = os.environ.get(v)
            if val:
                masked = val[:4] + '...' + val[-4:] if len(val) > 12 else '***'
                print(f'  \033[0;32m✓\033[0m {v} = {masked}')
            else:
                print(f'  \033[0;31m✗\033[0m {v} = (not set)')
        break
" 2>/dev/null
}

# ── Test an integration endpoint ─────────────────────────────
cmd_test() {
  local id="${1:-}"
  if [ -z "$id" ]; then
    error "Usage: br integrate test <integration-id>"
    return 1
  fi

  echo -e "\n${BOLD}Testing: $id${NC}\n"

  python3 -c "
import json, os, urllib.request, urllib.error, time

m = json.load(open('$MANIFEST'))
config = next((i for i in m['integrations'] if i['id'] == '$id'), None)
if not config:
    print('\033[0;31m✗\033[0m Integration not found')
    exit(1)

api_base = config.get('api_base', '')
if not api_base:
    print('\033[0;32m✓\033[0m Local tool — no API endpoint to test')
    exit(0)

auth_type = config.get('auth_type', '')
env_vars = config.get('env_vars', [])

# Build auth header
headers = {'Content-Type': 'application/json'}
if auth_type == 'bearer_token' and env_vars:
    token = os.environ.get(env_vars[0], '')
    if token:
        headers['Authorization'] = f'Bearer {token}'
elif auth_type == 'api_key' and env_vars:
    key = os.environ.get(env_vars[0], '')
    if '$id' == 'claude' and key:
        headers['x-api-key'] = key
        headers['anthropic-version'] = '2024-10-22'

if not any(os.environ.get(v) for v in env_vars):
    print(f'\033[1;33m⚠\033[0m No credentials configured for $id')
    print(f'  Set: {\" \".join(env_vars)}')
    exit(0)

# Test the endpoint
try:
    start = time.time()
    req = urllib.request.Request(api_base, headers=headers)
    resp = urllib.request.urlopen(req, timeout=10)
    latency = int((time.time() - start) * 1000)
    print(f'\033[0;32m✓\033[0m {config[\"name\"]} — HTTP {resp.status} ({latency}ms)')
except urllib.error.HTTPError as e:
    latency = 0
    if e.code in (401, 403):
        print(f'\033[1;33m⚠\033[0m {config[\"name\"]} — Auth error (HTTP {e.code})')
    else:
        print(f'\033[0;31m✗\033[0m {config[\"name\"]} — HTTP {e.code}')
except Exception as e:
    print(f'\033[0;31m✗\033[0m {config[\"name\"]} — {e}')
" 2>/dev/null
}

# ── Show environment template ────────────────────────────────
cmd_env() {
  if [ -f "$SCRIPT_DIR/.env.example" ]; then
    cat "$SCRIPT_DIR/.env.example"
  else
    error ".env.example not found"
  fi
}

# ── Show categories ──────────────────────────────────────────
cmd_categories() {
  echo -e "\n${BOLD}Integration Categories${NC}\n"
  python3 -c "
import json
m = json.load(open('$MANIFEST'))
for cat, ids in sorted(m.get('categories', {}).items()):
    print(f'  \033[0;36m{cat:<22}\033[0m {len(ids)} integrations: {\" \".join(ids)}')
" 2>/dev/null
}

# ── Help ─────────────────────────────────────────────────────
show_help() {
  echo -e "\n${BOLD}br integrate${NC} — BlackRoad OS Integration Manager\n"
  echo -e "  ${CYAN}list${NC}                  List all 30 integrations"
  echo -e "  ${CYAN}status${NC}                Show configuration status"
  echo -e "  ${CYAN}check${NC} <id>            Check a specific integration"
  echo -e "  ${CYAN}test${NC}  <id>            Test an integration endpoint"
  echo -e "  ${CYAN}categories${NC}            Show integration categories"
  echo -e "  ${CYAN}env${NC}                   Show environment variable template"
  echo -e ""
  echo -e "  ${MAGENTA}Integrations:${NC}"
  echo -e "    Banking:     mercury"
  echo -e "    Payments:    stripe, stripe-atlas"
  echo -e "    AI:          claude, chatgpt, gemini, grok, xai, huggingface"
  echo -e "    Cloud:       cloudflare, railway, vercel, digitalocean"
  echo -e "    PM:          notion, linear, jira"
  echo -e "    CRM:         salesforce"
  echo -e "    Comms:       slack, email, instagram"
  echo -e "    Auth:        clerk, enclave"
  echo -e "    Infra:       tailscale, raspberry-pi, termius"
  echo -e "    Mobile:      pyto, shellfish, working-copy, ish"
  echo -e "    Storage:     google-drive"
  echo ""
}

# ── Router ───────────────────────────────────────────────────
case "${1:-help}" in
  list)        cmd_list ;;
  status)      cmd_status ;;
  check)       cmd_check "${2:-}" ;;
  test)        cmd_test "${2:-}" ;;
  categories)  cmd_categories ;;
  env)         cmd_env ;;
  help|*)      show_help ;;
esac
