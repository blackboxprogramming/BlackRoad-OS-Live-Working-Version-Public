#!/bin/bash
# BlackRoad Pi Fleet Health Monitor
# Pings all 4 Pis, checks key services, disk, memory, writes logs and alerts
# Usage: ./blackroad-health-monitor.sh

set -euo pipefail

# BlackRoad Brand Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Directories
LOG_DIR="$HOME/.blackroad/logs"
ALERT_DIR="$HOME/.blackroad/alerts"
mkdir -p "$LOG_DIR" "$ALERT_DIR"

# Date/time
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$LOG_DIR/health-${DATE}.log"

# Pi definitions: name|ip|ssh_user|services(port:label,...)
declare -a PI_DEFS=(
  "Alice|192.168.4.49|pi|53:Pi-hole,5432:PostgreSQL,6333:Qdrant,6379:Redis"
  "Cecilia|192.168.4.96|blackroad|11434:Ollama,9000:MinIO,5432:PostgreSQL"
  "Octavia|192.168.4.97|blackroad|3100:Gitea,4222:NATS,8086:InfluxDB"
  "Aria|192.168.4.98|blackroad|9000:Headscale,9090:Prometheus"
)

SSH_OPTS="-o ConnectTimeout=30 -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no -o BatchMode=yes -o LogLevel=ERROR"
ALERTS=()
NATS_SERVER="192.168.4.97:4222"

# Publish to NATS (non-blocking, best-effort)
nats_pub() {
  local subject="$1" payload="$2"
  nats pub "$subject" "$payload" --server="$NATS_SERVER" 2>/dev/null || true
}

log() {
  local msg="[$(date '+%H:%M:%S')] $1"
  echo "$msg" >> "$LOG_FILE"
  echo -e "$2$msg${RESET}"
}

log_separator() {
  local sep="$(printf '=%.0s' {1..60})"
  echo "$sep" >> "$LOG_FILE"
  echo -e "${VIOLET}${sep}${RESET}"
}

add_alert() {
  ALERTS+=("$1")
  log "ALERT: $1" "$RED"
}

# SSH with built-in timeout (no coreutils timeout needed)
run_ssh() {
  local user="$1" host="$2" cmd="$3"
  ssh $SSH_OPTS "${user}@${host}" "$cmd" 2>/dev/null
}

check_port() {
  local host="$1" port="$2" user="$3"
  run_ssh "$user" "$host" "ss -tlnp 2>/dev/null | grep -q ':${port} ' && echo UP || echo DOWN" || echo "SSH_FAIL"
}

# Header
log_separator
log "BlackRoad Health Monitor - $TIMESTAMP" "$PINK"
log_separator

for pi_def in "${PI_DEFS[@]}"; do
  IFS='|' read -r name ip user services <<< "$pi_def"
  echo "" >> "$LOG_FILE"
  log "--- $name ($ip) ---" "$BLUE"

  # Ping check
  if ping -c 1 -W 3 "$ip" &>/dev/null; then
    log "$name: REACHABLE" "$GREEN"
    nats_pub "blackroad.health" "{\"node\":\"$name\",\"status\":\"up\",\"ts\":$(date +%s)}"
  else
    add_alert "$name ($ip) is UNREACHABLE"
    log "$name: UNREACHABLE - skipping service checks" "$RED"
    nats_pub "blackroad.alerts" "{\"node\":\"$name\",\"status\":\"down\",\"ts\":$(date +%s)}"
    continue
  fi

  # Service port checks
  IFS=',' read -ra svc_list <<< "$services"
  for svc in "${svc_list[@]}"; do
    IFS=':' read -r port label <<< "$svc"
    status=$(check_port "$ip" "$port" "$user")
    if [[ "$status" == "UP" ]]; then
      log "  $label (port $port): UP" "$GREEN"
      nats_pub "blackroad.health" "{\"service\":\"$label\",\"node\":\"$name\",\"port\":$port,\"status\":\"up\",\"ts\":$(date +%s)}"
    else
      add_alert "$name: $label (port $port) is $status"
      log "  $label (port $port): $status" "$RED"
      nats_pub "blackroad.alerts" "{\"service\":\"$label\",\"node\":\"$name\",\"port\":$port,\"status\":\"down\",\"ts\":$(date +%s)}"
    fi
  done

  # Disk usage
  disk=$(run_ssh "$user" "$ip" "df -h / | tail -1" || echo "FAILED")
  if [[ "$disk" != "FAILED" ]]; then
    disk_pct=$(echo "$disk" | awk '{print $5}' | tr -d '%')
    if [[ "$disk_pct" -ge 90 ]]; then
      add_alert "$name: Disk usage at ${disk_pct}%"
      log "  Disk: $disk" "$RED"
    elif [[ "$disk_pct" -ge 80 ]]; then
      log "  Disk: $disk" "$AMBER"
    else
      log "  Disk: $disk" "$GREEN"
    fi
  else
    log "  Disk: check failed" "$RED"
  fi

  # Memory usage
  mem=$(run_ssh "$user" "$ip" "free -m | grep Mem" || echo "FAILED")
  if [[ "$mem" != "FAILED" ]]; then
    mem_total=$(echo "$mem" | awk '{print $2}')
    mem_used=$(echo "$mem" | awk '{print $3}')
    if [[ "$mem_total" -gt 0 ]]; then
      mem_pct=$(( mem_used * 100 / mem_total ))
      if [[ "$mem_pct" -ge 90 ]]; then
        add_alert "$name: Memory usage at ${mem_pct}%"
        log "  Memory: ${mem_used}M/${mem_total}M (${mem_pct}%)" "$RED"
      elif [[ "$mem_pct" -ge 80 ]]; then
        log "  Memory: ${mem_used}M/${mem_total}M (${mem_pct}%)" "$AMBER"
      else
        log "  Memory: ${mem_used}M/${mem_total}M (${mem_pct}%)" "$GREEN"
      fi
    fi
  else
    log "  Memory: check failed" "$RED"
  fi

  # Pi-specific checks
  case "$name" in
    Cecilia)
      ollama_count=$(run_ssh "$user" "$ip" "ollama list 2>/dev/null | tail -n +2 | wc -l" || echo "FAILED")
      if [[ "$ollama_count" != "FAILED" ]]; then
        log "  Ollama models: $ollama_count" "$BLUE"
      else
        log "  Ollama model count: check failed" "$RED"
      fi
      ;;
    Octavia)
      gitea_repos=$(run_ssh "$user" "$ip" \
        "curl -sf http://localhost:3100/api/v1/repos/search?limit=50 2>/dev/null | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get(\"data\",[])))'  2>/dev/null || \
         find /var/lib/gitea/repositories -maxdepth 2 -name '*.git' 2>/dev/null | wc -l || echo FAILED" || echo "FAILED")
      if [[ "$gitea_repos" != "FAILED" ]]; then
        log "  Gitea repos: $gitea_repos" "$BLUE"
      else
        log "  Gitea repo count: check failed" "$RED"
      fi
      ;;
  esac
done

# Write alerts file if any
if [[ ${#ALERTS[@]} -gt 0 ]]; then
  ALERT_FILE="$ALERT_DIR/alert-${TIMESTAMP}.txt"
  {
    echo "BlackRoad Health Alert - $(date)"
    echo "==============================="
    for a in "${ALERTS[@]}"; do
      echo "  - $a"
    done
  } > "$ALERT_FILE"
  echo "" >> "$LOG_FILE"
  log "ALERTS WRITTEN: $ALERT_FILE (${#ALERTS[@]} issues)" "$RED"
else
  echo "" >> "$LOG_FILE"
  log "All systems healthy - no alerts" "$GREEN"
fi

log_separator
