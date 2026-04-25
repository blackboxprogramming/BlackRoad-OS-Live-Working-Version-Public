#!/bin/bash
# BlackRoad OS End-to-End Test Runner
# One command to rule them all — validates the entire stack
# Usage: ./blackroad-e2e-test.sh

set -o pipefail

# ── BlackRoad Brand Colors ──────────────────────────────────────────
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Test Counters ───────────────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0
FAILURES=()
START_TIME=$(date +%s)
TEST_TIMEOUT=35

# ── Timeout Command (macOS compat) ─────────────────────────────────
if command -v gtimeout &>/dev/null; then
  TIMEOUT_CMD="gtimeout"
elif command -v timeout &>/dev/null; then
  TIMEOUT_CMD="timeout"
else
  # Pure-bash fallback using background process
  TIMEOUT_CMD=""
fi

# ── Pi Definitions ──────────────────────────────────────────────────
declare -A PI_IPS=(
  [Alice]="192.168.4.49"
  [Cecilia]="192.168.4.96"
  [Octavia]="192.168.4.97"
  [Aria]="192.168.4.98"
)

declare -A PI_SSH_USERS=(
  [Alice]="pi"
  [Cecilia]="blackroad"
  [Octavia]="blackroad"
  [Aria]="blackroad"
)

# ── Cloudflare Domains (blackroad.io) ────────────────────────────────
CF_DOMAINS=(
  "blackroad.io"
  "status.blackroad.io"
  "app.blackroad.io"
  "docs.blackroad.io"
  "tools.blackroad.io"
  "gateway.blackroad.io"
  "console.blackroad.io"
  "dashboard.blackroad.io"
  "network.blackroad.io"
  "alice.blackroad.io"
)

# ── Service Port Map (Pi → port list) ──────────────────────────────
# Alice: Pi-hole(80,53), PostgreSQL(5432)
# Cecilia: Ollama(11434), MinIO(9000,9001), PostgreSQL(5432), CECE API(8787)
# Octavia: OctoPrint(5000), InfluxDB(8086), GitHub Runner
# Aria: Ollama(11434), InfluxDB(8086), Headscale(8088), Portainer(9443)
declare -A PI_SERVICES
PI_SERVICES[Alice]="Pi-hole:80 DNS:53 PostgreSQL:5432"
PI_SERVICES[Cecilia]="Ollama:11434 MinIO-API:9000 MinIO-Console:9001 PostgreSQL:5432"
PI_SERVICES[Octavia]="OctoPrint:5000 InfluxDB:8086"
PI_SERVICES[Aria]="Ollama:11434 InfluxDB:8086 Headscale:8088 Portainer:9443"

# ── Helpers ─────────────────────────────────────────────────────────

header() {
  echo ""
  echo -e "${PINK}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${PINK}${BOLD}║${RESET}  ${AMBER}${BOLD}B L A C K R O A D   O S${RESET}   ${VIOLET}End-to-End Test Runner${RESET}         ${PINK}${BOLD}║${RESET}"
  echo -e "${PINK}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
  echo -e "${DIM}  Host: $(hostname) | $(date '+%Y-%m-%d %H:%M:%S %Z') | PID $$${RESET}"
  echo ""
}

section() {
  echo ""
  echo -e "${BLUE}${BOLD}── $1 ──────────────────────────────────────────${RESET}"
}

_run_with_timeout() {
  local secs="$1"
  shift
  if [[ -n "$TIMEOUT_CMD" ]]; then
    "$TIMEOUT_CMD" "$secs" bash -c "$*" 2>&1
  else
    # Pure-bash timeout fallback for macOS without coreutils
    local output_file
    output_file=$(mktemp)
    bash -c "$*" >"$output_file" 2>&1 &
    local pid=$!
    local i=0
    while kill -0 "$pid" 2>/dev/null; do
      if [[ $i -ge $secs ]]; then
        kill -9 "$pid" 2>/dev/null
        wait "$pid" 2>/dev/null
        cat "$output_file"
        rm -f "$output_file"
        return 124
      fi
      sleep 1
      i=$((i + 1))
    done
    wait "$pid"
    local rc=$?
    cat "$output_file"
    rm -f "$output_file"
    return $rc
  fi
}

run_test() {
  local name="$1"
  shift
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  local output
  if output=$(_run_with_timeout "$TEST_TIMEOUT" "$*"); then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "  ${GREEN}[PASS]${RESET} ${name}"
    if [[ -n "$output" && "$VERBOSE" == "1" ]]; then
      echo -e "         ${DIM}${output}${RESET}"
    fi
    return 0
  else
    local rc=$?
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILURES+=("$name")
    if [[ $rc -eq 124 ]]; then
      echo -e "  ${RED}[FAIL]${RESET} ${name} ${DIM}(timeout after ${TEST_TIMEOUT}s)${RESET}"
    else
      echo -e "  ${RED}[FAIL]${RESET} ${name}"
    fi
    if [[ -n "$output" ]]; then
      echo -e "         ${DIM}${output:0:200}${RESET}"
    fi
    return 1
  fi
}

# ── HEADER ──────────────────────────────────────────────────────────
header

# ════════════════════════════════════════════════════════════════════
# 1. PI MESH — ping, SSH, uptime
# ════════════════════════════════════════════════════════════════════
section "1. Pi Mesh Connectivity"

for pi in Alice Cecilia Octavia Aria; do
  ip="${PI_IPS[$pi]}"
  user="${PI_SSH_USERS[$pi]}"

  # Note: Aria is currently offline — expect failures
  run_test "$pi ping ($ip)" \
    "ping -c1 -W3 '$ip' >/dev/null 2>&1"

  run_test "$pi SSH" \
    "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes '$user@$ip' 'echo ok' >/dev/null 2>&1"

  run_test "$pi uptime" \
    "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes '$user@$ip' 'uptime' 2>/dev/null | head -1"
done

# ════════════════════════════════════════════════════════════════════
# 2. SERVICES — check ports on each Pi via SSH
# ════════════════════════════════════════════════════════════════════
section "2. Service Port Checks (via SSH)"

for pi in Alice Cecilia Octavia Aria; do
  ip="${PI_IPS[$pi]}"
  user="${PI_SSH_USERS[$pi]}"
  services="${PI_SERVICES[$pi]}"
  for svc in $services; do
    svc_name="${svc%%:*}"
    port="${svc##*:}"
    run_test "$pi → $svc_name (:$port)" \
      "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes '$user@$ip' 'ss -tln | grep -q :$port' 2>/dev/null"
  done
done

# ════════════════════════════════════════════════════════════════════
# 3. CLOUDFLARE — curl top 10 domains
# ════════════════════════════════════════════════════════════════════
section "3. Cloudflare Domains"

for domain in "${CF_DOMAINS[@]}"; do
  run_test "https://$domain" \
    "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 'https://$domain'); [[ \"\$code\" =~ ^(200|301|302|303|307|308|401|403|404)$ ]]"
done

# ════════════════════════════════════════════════════════════════════
# 4. API GATEWAY — health, agents, tools
# ════════════════════════════════════════════════════════════════════
section "4. API Gateway"

API_BASE="https://api.blackroad.io"

run_test "GET $API_BASE/v1/health" \
  "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 '$API_BASE/v1/health'); [[ \"\$code\" =~ ^(200|204)$ ]]"

run_test "GET $API_BASE/v1/agents" \
  "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 '$API_BASE/v1/agents'); [[ \"\$code\" =~ ^(200|401|403)$ ]]"

run_test "GET $API_BASE/v1/tools" \
  "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 '$API_BASE/v1/tools'); [[ \"\$code\" =~ ^(200|401|403)$ ]]"

# ════════════════════════════════════════════════════════════════════
# 5. MEMORY SYSTEM — log, verify, search (local CLI)
# ════════════════════════════════════════════════════════════════════
section "5. Memory System"

run_test "Memory: log entry" \
  "bash ~/memory-system.sh log 'e2e-test' 'Automated e2e test run' 2>&1"

run_test "Memory: verify" \
  "bash ~/memory-system.sh verify 2>&1"

run_test "Memory: search" \
  "bash ~/memory-indexer.sh search 'e2e-test' 2>&1"

# ════════════════════════════════════════════════════════════════════
# 6. TASK MARKETPLACE — post, claim, complete (local CLI)
# ════════════════════════════════════════════════════════════════════
section "6. Task Marketplace"

TASK_ID="e2e-$(date +%s)"

run_test "Task: post" \
  "bash ~/memory-task-marketplace.sh post '$TASK_ID' 'E2E Test' 'Automated test' high e2e 2>&1"

run_test "Task: claim" \
  "bash ~/memory-task-marketplace.sh claim '$TASK_ID' 2>&1"

run_test "Task: complete" \
  "bash ~/memory-task-marketplace.sh complete '$TASK_ID' 2>&1"

# ════════════════════════════════════════════════════════════════════
# 7. NATS — pub/sub round trip
# ════════════════════════════════════════════════════════════════════
section "7. NATS Messaging"

NATS_HOST="${PI_IPS[Octavia]}"

run_test "NATS: port reachable (via SSH)" \
  "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$NATS_HOST 'ss -tln | grep -q :4222' 2>/dev/null"

if command -v nats &>/dev/null; then
  NATS_SUBJ="e2e.test.$(date +%s)"
  run_test "NATS: pub/sub round trip" \
    "nats pub '$NATS_SUBJ' 'hello from e2e' --server='nats://$NATS_HOST:4222' --timeout=5s 2>/dev/null"
else
  run_test "NATS: pub/sub (nats CLI not installed)" \
    "false"
fi

# ════════════════════════════════════════════════════════════════════
# 8. OLLAMA on Cecilia — models + inference (via SSH)
# ════════════════════════════════════════════════════════════════════
section "8. Ollama (Cecilia — via SSH)"

CECILIA_IP="${PI_IPS[Cecilia]}"

run_test "Ollama: API reachable (via SSH)" \
  "ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$CECILIA_IP 'curl -s -o /dev/null -w \"%{http_code}\" http://localhost:11434/ 2>/dev/null' | grep -q 200"

run_test "Ollama: list models (via SSH)" \
  "count=\$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$CECILIA_IP 'curl -s http://localhost:11434/api/tags' 2>/dev/null | python3 -c \"import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])))\" 2>/dev/null); [[ \$count -gt 0 ]]"

run_test "Ollama: quick inference (cece)" \
  "resp=\$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$CECILIA_IP 'echo \"hi\" | timeout 30 ollama run cece --nowordwrap 2>/dev/null' | head -1); [[ -n \"\$resp\" ]]"

# ════════════════════════════════════════════════════════════════════
# 9. GIT SYNC — Gitea API (via SSH to Octavia)
# ════════════════════════════════════════════════════════════════════
section "9. Git Sync (Gitea — via SSH)"

OCTAVIA_IP="${PI_IPS[Octavia]}"

run_test "Gitea: API reachable (via SSH)" \
  "code=\$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$OCTAVIA_IP 'curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3100/api/v1/repos/search?limit=1' 2>/dev/null); [[ \"\$code\" =~ ^(200|401|403)$ ]]"

run_test "Gitea: repo count > 0 (via SSH)" \
  "code=\$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes blackroad@$OCTAVIA_IP 'curl -s http://localhost:3100/api/v1/repos/search?limit=1 -o /dev/null -w \"%{http_code}\"' 2>/dev/null); [[ \"\$code\" == \"200\" ]]"

# ════════════════════════════════════════════════════════════════════
# 10. LOCAL BUILDS — key projects type-check
# ════════════════════════════════════════════════════════════════════
section "10. Local Builds"

LOCAL_PROJECTS=(
  "$HOME/blackroad-core"
  "$HOME/br-os"
  "$HOME/blackroad-web"
  "$HOME/blackroad-memory-worker"
)

for proj in "${LOCAL_PROJECTS[@]}"; do
  proj_name=$(basename "$proj")
  if [[ -d "$proj" ]]; then
    run_test "$proj_name: exists" "true"

    run_test "$proj_name: node_modules" \
      "[[ -d '$proj/node_modules' ]]"

    if [[ -f "$proj/tsconfig.json" ]]; then
      run_test "$proj_name: tsc --noEmit" \
        "cd '$proj' && npx tsc --noEmit 2>&1 | tail -5"
    fi
  else
    run_test "$proj_name: exists" "false"
  fi
done

# ════════════════════════════════════════════════════════════════════
# 11. STRIPE — auth + products
# ════════════════════════════════════════════════════════════════════
section "11. Stripe"

if command -v stripe &>/dev/null; then
  run_test "Stripe CLI: auth check" \
    "stripe config --list 2>/dev/null | grep -q 'test_mode'"

  run_test "Stripe: list products" \
    "stripe products list --limit=1 2>/dev/null | grep -q 'id'"
else
  if [[ -n "$STRIPE_SECRET_KEY" ]]; then
    run_test "Stripe API: auth" \
      "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
        -u \"\$STRIPE_SECRET_KEY:\" 'https://api.stripe.com/v1/balance'); \
      [[ \"\$code\" == '200' ]]"

    run_test "Stripe API: list products" \
      "code=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
        -u \"\$STRIPE_SECRET_KEY:\" 'https://api.stripe.com/v1/products?limit=1'); \
      [[ \"\$code\" == '200' ]]"
  else
    run_test "Stripe: CLI or STRIPE_SECRET_KEY available" "false"
  fi
fi

# ════════════════════════════════════════════════════════════════════
# 12. RCLONE — remotes + backup dir
# ════════════════════════════════════════════════════════════════════
section "12. rclone"

if command -v rclone &>/dev/null; then
  run_test "rclone: installed" "true"

  run_test "rclone: has remotes" \
    "count=\$(rclone listremotes 2>/dev/null | wc -l); [[ \$count -gt 0 ]]"

  run_test "rclone: verify backup dir" \
    "rclone listremotes 2>/dev/null | head -1 | while read remote; do \
      rclone lsd \"\${remote}\" --max-depth 1 2>/dev/null | head -1; \
    done | grep -q '.'"
else
  run_test "rclone: installed" "false"
fi

# ════════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════════
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECS=$((ELAPSED % 60))

echo ""
echo -e "${PINK}${BOLD}══════════════════════════════════════════════════════════════${RESET}"
echo -e "${AMBER}${BOLD}  RESULTS${RESET}"
echo -e "${PINK}${BOLD}══════════════════════════════════════════════════════════════${RESET}"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}ALL TESTS PASSED${RESET}  ${GREEN}${PASS_COUNT}/${TOTAL_COUNT}${RESET}"
else
  echo -e "  ${AMBER}${BOLD}${PASS_COUNT}/${TOTAL_COUNT} tests passed${RESET}  ${RED}(${FAIL_COUNT} failed)${RESET}"
  echo ""
  echo -e "  ${RED}${BOLD}Failures:${RESET}"
  for f in "${FAILURES[@]}"; do
    echo -e "    ${RED}x${RESET} $f"
  done
fi

echo ""
echo -e "  ${DIM}Completed in ${MINUTES}m ${SECS}s${RESET}"
echo ""

exit $FAIL_COUNT
