#!/bin/bash
# ============================================================================
# BlackRoad OS — Bottleneck Analyzer with Live System Data
# ============================================================================
# Replaces simulated RANDOM data with actual system metrics.
#
# Usage:
#   ./bottlenecks.sh              # One-shot analysis
#   ./bottlenecks.sh --watch      # Continuous monitoring
#   ./bottlenecks.sh --json       # JSON output
#
set -euo pipefail

# Colors
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'
P='\033[1;35m'; W='\033[1;37m'; DIM='\033[2m'; NC='\033[0m'
BOLD='\033[1m'

WATCH=false
JSON_MODE=false
INTERVAL=5

while [ $# -gt 0 ]; do
  case "$1" in
    --watch|-w) WATCH=true; shift ;;
    --json|-j) JSON_MODE=true; shift ;;
    --interval|-i) INTERVAL="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--watch] [--json] [--interval <sec>]"
      exit 0
      ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

# ============================================================================
# Live Data Collection
# ============================================================================

get_cpu_usage() {
  # Read /proc/stat twice and compute CPU usage over the interval
  if [ -f /proc/stat ]; then
    local line1 line2
    local user1 nice1 system1 idle1 iowait1 irq1 softirq1 steal1
    local user2 nice2 system2 idle2 iowait2 irq2 softirq2 steal2

    line1=$(head -n 1 /proc/stat)
    read -r _ user1 nice1 system1 idle1 iowait1 irq1 softirq1 steal1 _ <<< "$line1"
    local total1=$((user1 + nice1 + system1 + idle1 + iowait1 + irq1 + softirq1 + steal1))

    # Short sampling interval for "live" CPU usage
    sleep 0.2

    line2=$(head -n 1 /proc/stat)
    read -r _ user2 nice2 system2 idle2 iowait2 irq2 softirq2 steal2 _ <<< "$line2"
    local total2=$((user2 + nice2 + system2 + idle2 + iowait2 + irq2 + softirq2 + steal2))

    local total_delta=$((total2 - total1))
    local idle_delta=$(((idle2 + iowait2) - (idle1 + iowait1)))

    if [ "$total_delta" -gt 0 ]; then
      echo $(((total_delta - idle_delta) * 100 / total_delta))
    else
      echo 0
    fi
  else
    echo 0
  fi
}

get_cpu_cores() {
  nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo 2>/dev/null || echo 1
}

get_load_avg() {
  if [ -f /proc/loadavg ]; then
    cut -d' ' -f1-3 /proc/loadavg
  else
    echo "0.00 0.00 0.00"
  fi
}

get_mem_info() {
  if [ -f /proc/meminfo ]; then
    local total_kb used_kb free_kb available_kb
    total_kb=$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)
    available_kb=$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)
    free_kb=$(awk '/^MemFree:/ {print $2}' /proc/meminfo)
    # Prefer MemAvailable, fallback to MemFree
    if [ -n "$available_kb" ]; then
      used_kb=$((total_kb - available_kb))
    else
      used_kb=$((total_kb - free_kb))
    fi
    local total_mb=$((total_kb / 1024))
    local used_mb=$((used_kb / 1024))
    local pct=$((used_kb * 100 / total_kb))
    echo "$used_mb $total_mb $pct"
  else
    echo "0 0 0"
  fi
}

get_swap_info() {
  if [ -f /proc/meminfo ]; then
    local swap_total swap_free
    swap_total=$(awk '/^SwapTotal:/ {print $2}' /proc/meminfo)
    swap_free=$(awk '/^SwapFree:/ {print $2}' /proc/meminfo)
    if [ "$swap_total" -gt 0 ] 2>/dev/null; then
      local swap_used=$((swap_total - swap_free))
      local swap_pct=$((swap_used * 100 / swap_total))
      echo "$((swap_used / 1024)) $((swap_total / 1024)) $swap_pct"
    else
      echo "0 0 0"
    fi
  else
    echo "0 0 0"
  fi
}

get_disk_info() {
  local line
  line=$(df -BG / 2>/dev/null | tail -1)
  local total used avail pct
  total=$(echo "$line" | awk '{print $2}' | tr -d 'G')
  used=$(echo "$line" | awk '{print $3}' | tr -d 'G')
  avail=$(echo "$line" | awk '{print $4}' | tr -d 'G')
  pct=$(echo "$line" | awk '{print $5}' | tr -d '%')
  echo "${used:-0} ${total:-0} ${pct:-0} ${avail:-0}"
}

get_connections() {
  local count
  count=$(ss -tun state established 2>/dev/null | tail -n +2 | wc -l) || true
  echo "${count:-0}" | tr -d '[:space:]'
}

get_process_count() {
  local count
  count=$(ps aux 2>/dev/null | tail -n +2 | wc -l) || true
  echo "${count:-0}" | tr -d '[:space:]'
}

get_node_processes() {
  local count
  count=$(ps aux 2>/dev/null | grep '[n]ode' | wc -l) || true
  echo "${count:-0}" | tr -d '[:space:]'
}

get_python_processes() {
  local count
  count=$(ps aux 2>/dev/null | grep '[p]ython' | wc -l) || true
  echo "${count:-0}" | tr -d '[:space:]'
}

get_uptime_human() {
  local up
  up=$(cat /proc/uptime 2>/dev/null | cut -d. -f1 || echo 0)
  local days=$((up / 86400))
  local hours=$(( (up % 86400) / 3600 ))
  local mins=$(( (up % 3600) / 60 ))
  if [ $days -gt 0 ]; then
    echo "${days}d ${hours}h ${mins}m"
  elif [ $hours -gt 0 ]; then
    echo "${hours}h ${mins}m"
  else
    echo "${mins}m"
  fi
}

# Service probe: name, url -> status, latency
probe_service() {
  local name="$1"
  local url="$2"
  local start end http_code latency status curl_exit
  start=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")
  curl_exit=0
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null) || curl_exit=$?
  if [ "$curl_exit" -ne 0 ] || [ -z "${http_code:-}" ]; then
    http_code="000"
  fi
  end=$(date +%s%N 2>/dev/null || python3 -c "import time; print(int(time.time()*1e9))")
  latency=$(( (end - start) / 1000000 ))

  if [ "$http_code" = "200" ]; then
    status="UP"
  elif [ "$http_code" = "000" ]; then
    status="DOWN"
  else
    status="DEGRADED"
  fi
  echo "$name|$status|${latency}ms|$http_code"
}

# ============================================================================
# Progress bars
# ============================================================================

bar() {
  local pct=$1
  local w=${2:-20}
  local filled=$((pct * w / 100))
  local empty=$((w - filled))
  local color="$G"
  [ "$pct" -ge 70 ] && color="$Y"
  [ "$pct" -ge 90 ] && color="$R"
  printf "${color}"
  for ((i=0; i<filled; i++)); do printf '█'; done
  printf "${DIM}"
  for ((i=0; i<empty; i++)); do printf '░'; done
  printf "${NC}"
}

# ============================================================================
# Bottleneck Detection
# ============================================================================

BOTTLENECKS=()
SCORE=100

add_bottleneck() {
  local severity="$1" category="$2" title="$3" detail="$4" metric="$5" rec="$6"
  BOTTLENECKS+=("${severity}|${category}|${title}|${detail}|${metric}|${rec}")
  case "$severity" in
    CRITICAL) SCORE=$((SCORE - 25)) ;;
    WARNING)  SCORE=$((SCORE - 10)) ;;
  esac
  [ $SCORE -lt 0 ] && SCORE=0
}

analyze() {
  BOTTLENECKS=()
  SCORE=100

  local cpu_pct cores load_1m load_5m load_15m
  cpu_pct=$(get_cpu_usage)
  cores=$(get_cpu_cores)
  read -r load_1m load_5m load_15m <<< "$(get_load_avg)"

  # CPU
  if [ "$cpu_pct" -ge 90 ]; then
    add_bottleneck "CRITICAL" "cpu" "CPU critically overloaded" \
      "CPU usage at ${cpu_pct}% across ${cores} cores" "${cpu_pct}%" \
      "Identify CPU-heavy processes. Consider scaling or offloading inference to GPU."
  elif [ "$cpu_pct" -ge 70 ]; then
    add_bottleneck "WARNING" "cpu" "CPU usage elevated" \
      "CPU usage at ${cpu_pct}% across ${cores} cores" "${cpu_pct}%" \
      "Monitor trending. Review agent task distribution."
  fi

  # Load per core
  local load_int load_frac load_x100 core_load_x100
  load_int=${load_1m%.*}
  load_frac=${load_1m#*.}
  load_x100=$(( 10#$load_int * 100 + 10#${load_frac:-0} ))
  core_load_x100=$(( load_x100 / cores ))
  if [ $core_load_x100 -ge 150 ]; then
    add_bottleneck "CRITICAL" "load" "System load critically high" \
      "Load avg ${load_1m} on ${cores} cores" "${load_1m}" \
      "System is oversubscribed. Reduce concurrent agent count or add compute."
  elif [ $core_load_x100 -ge 80 ]; then
    add_bottleneck "WARNING" "load" "System load above optimal" \
      "Load avg ${load_1m} on ${cores} cores" "${load_1m}" \
      "Consider distributing work across Pi cluster nodes."
  fi

  # Memory
  local mem_used mem_total mem_pct
  read -r mem_used mem_total mem_pct <<< "$(get_mem_info)"
  if [ "$mem_pct" -ge 90 ]; then
    add_bottleneck "CRITICAL" "memory" "Memory critically low" \
      "${mem_used}MB / ${mem_total}MB used (${mem_pct}%)" "${mem_pct}%" \
      "Kill non-essential processes. Reduce Ollama model context or unload models."
  elif [ "$mem_pct" -ge 75 ]; then
    add_bottleneck "WARNING" "memory" "Memory usage elevated" \
      "${mem_used}MB / ${mem_total}MB used (${mem_pct}%)" "${mem_pct}%" \
      "Monitor memory-hungry processes. Consider smaller quantized models."
  fi

  # Swap
  local swap_used swap_total swap_pct
  read -r swap_used swap_total swap_pct <<< "$(get_swap_info)"
  if [ "$swap_total" -gt 0 ]; then
    if [ "$swap_pct" -ge 80 ]; then
      add_bottleneck "CRITICAL" "memory" "Swap usage critically high" \
        "${swap_used}MB / ${swap_total}MB swap (${swap_pct}%)" "${swap_pct}%" \
        "System is thrashing. Free memory immediately or add RAM."
    elif [ "$swap_pct" -ge 50 ]; then
      add_bottleneck "WARNING" "memory" "Swap usage elevated" \
        "${swap_used}MB / ${swap_total}MB swap (${swap_pct}%)" "${swap_pct}%" \
        "Memory pressure is high. Reduce agent concurrency."
    fi
  fi

  # Disk
  local disk_used disk_total disk_pct disk_avail
  read -r disk_used disk_total disk_pct disk_avail <<< "$(get_disk_info)"
  if [ "$disk_pct" -ge 95 ]; then
    add_bottleneck "CRITICAL" "disk" "Disk space critically low" \
      "${disk_used}GB / ${disk_total}GB used (${disk_pct}%)" "${disk_pct}%" \
      "Purge old logs, prune Docker images, remove unused model files."
  elif [ "$disk_pct" -ge 80 ]; then
    add_bottleneck "WARNING" "disk" "Disk space running low" \
      "${disk_used}GB / ${disk_total}GB used (${disk_pct}%)" "${disk_pct}%" \
      "Clean temp files, rotate logs, archive old memory journals."
  fi

  # Network connections
  local conns
  conns=$(get_connections)
  if [ "$conns" -ge 1000 ]; then
    add_bottleneck "CRITICAL" "network" "Connection count critically high" \
      "${conns} established connections" "${conns}" \
      "Possible connection leak. Check agent WebSocket and gateway pooling."
  elif [ "$conns" -ge 500 ]; then
    add_bottleneck "WARNING" "network" "Connection count elevated" \
      "${conns} established connections" "${conns}" \
      "Review connection pooling. Enable keep-alive where appropriate."
  fi
}

# ============================================================================
# Render
# ============================================================================

render() {
  local TS
  TS=$(date +%H:%M:%S)
  local cpu_pct cores
  cpu_pct=$(get_cpu_usage)
  cores=$(get_cpu_cores)
  local load_1m load_5m load_15m
  read -r load_1m load_5m load_15m <<< "$(get_load_avg)"
  local mem_used mem_total mem_pct
  read -r mem_used mem_total mem_pct <<< "$(get_mem_info)"
  local swap_used swap_total swap_pct
  read -r swap_used swap_total swap_pct <<< "$(get_swap_info)"
  local disk_used disk_total disk_pct disk_avail
  read -r disk_used disk_total disk_pct disk_avail <<< "$(get_disk_info)"
  local conns procs node_procs py_procs uptime_h
  conns=$(get_connections)
  procs=$(get_process_count)
  node_procs=$(get_node_processes)
  py_procs=$(get_python_processes)
  uptime_h=$(get_uptime_human)

  # Analyze
  analyze

  if [ "$JSON_MODE" = true ]; then
    local bn_json="["
    local first=true
    for b in "${BOTTLENECKS[@]}"; do
      IFS='|' read -r sev cat title detail metric rec <<< "$b"
      [ "$first" = true ] && first=false || bn_json+=","
      bn_json+="{\"severity\":\"$sev\",\"category\":\"$cat\",\"title\":\"$title\",\"detail\":\"$detail\",\"metric\":\"$metric\",\"recommendation\":\"$rec\"}"
    done
    bn_json+="]"
    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"score\":$SCORE,\"cpu\":{\"usage\":$cpu_pct,\"cores\":$cores,\"load\":[${load_1m},${load_5m},${load_15m}]},\"memory\":{\"usedMB\":$mem_used,\"totalMB\":$mem_total,\"percent\":$mem_pct},\"disk\":{\"usedGB\":$disk_used,\"totalGB\":$disk_total,\"percent\":$disk_pct},\"network\":{\"connections\":$conns},\"processes\":{\"total\":$procs,\"node\":$node_procs,\"python\":$py_procs},\"uptime\":\"$uptime_h\",\"bottlenecks\":$bn_json}"
    return
  fi

  # Header
  echo -e "${P}┌──────────────────────────────────────────────────────────────────┐${NC}"
  echo -e "${P}│${NC}  ${W}BLACKROAD OS · BOTTLENECK ANALYZER${NC}            ${DIM}LIVE${NC} ${G}●${NC} ${DIM}$TS${NC}   ${P}│${NC}"
  echo -e "${P}├──────────────────────────────────────────────────────────────────┤${NC}"
  echo -e "${P}│${NC}                                                                  ${P}│${NC}"
  echo -e "${P}│${NC}  ${W}CPU${NC}   $(bar $cpu_pct) ${C}${cpu_pct}%${NC}  ${DIM}${cores} cores${NC}                   ${P}│${NC}"
  echo -e "${P}│${NC}  ${W}MEM${NC}   $(bar $mem_pct) ${C}${mem_pct}%${NC}  ${DIM}${mem_used}/${mem_total}MB${NC}              ${P}│${NC}"
  echo -e "${P}│${NC}  ${W}DISK${NC}  $(bar $disk_pct) ${C}${disk_pct}%${NC}  ${DIM}${disk_used}/${disk_total}GB${NC}               ${P}│${NC}"
  if [ "$swap_total" -gt 0 ]; then
    echo -e "${P}│${NC}  ${W}SWAP${NC}  $(bar $swap_pct) ${C}${swap_pct}%${NC}  ${DIM}${swap_used}/${swap_total}MB${NC}              ${P}│${NC}"
  fi
  echo -e "${P}│${NC}  ${W}LOAD${NC}  ${DIM}1m:${NC} ${C}${load_1m}${NC}  ${DIM}5m:${NC} ${C}${load_5m}${NC}  ${DIM}15m:${NC} ${C}${load_15m}${NC}                    ${P}│${NC}"
  echo -e "${P}│${NC}  ${W}NET${NC}   ${DIM}connections:${NC} ${C}${conns}${NC}  ${DIM}uptime:${NC} ${C}${uptime_h}${NC}                    ${P}│${NC}"
  echo -e "${P}│${NC}  ${W}PROC${NC}  ${DIM}total:${NC} ${C}${procs}${NC}  ${DIM}node:${NC} ${C}${node_procs}${NC}  ${DIM}python:${NC} ${C}${py_procs}${NC}                     ${P}│${NC}"
  echo -e "${P}│${NC}                                                                  ${P}│${NC}"

  # Service probes
  echo -e "${P}├──────────────────────────────────────────────────────────────────┤${NC}"
  echo -e "${P}│${NC}  ${W}SERVICE PROBES${NC}                                                  ${P}│${NC}"
  echo -e "${P}│${NC}                                                                  ${P}│${NC}"

  local gateway_url="${BLACKROAD_GATEWAY_URL:-http://127.0.0.1:8787}"
  local ollama_url="${OLLAMA_URL:-http://localhost:11434}"

  for probe_result in \
    "$(probe_service 'Gateway' "${gateway_url}/v1/health")" \
    "$(probe_service 'Ollama' "${ollama_url}/api/tags")" \
    "$(probe_service 'GitHub API' 'https://api.github.com')"; do
    IFS='|' read -r svc_name svc_status svc_latency svc_code <<< "$probe_result"
    local status_color="$G"
    [ "$svc_status" = "DOWN" ] && status_color="$R"
    [ "$svc_status" = "DEGRADED" ] && status_color="$Y"
    local icon="${G}●${NC}"
    [ "$svc_status" = "DOWN" ] && icon="${R}●${NC}"
    [ "$svc_status" = "DEGRADED" ] && icon="${Y}●${NC}"
    printf "  ${P}│${NC}  ${icon} %-14s ${status_color}%-8s${NC} ${DIM}%s${NC}                        ${P}│${NC}\n" \
      "$svc_name" "$svc_status" "$svc_latency"
  done

  echo -e "${P}│${NC}                                                                  ${P}│${NC}"

  # Bottleneck report
  echo -e "${P}├──────────────────────────────────────────────────────────────────┤${NC}"
  local score_color="$G"
  [ $SCORE -lt 80 ] && score_color="$Y"
  [ $SCORE -lt 50 ] && score_color="$R"
  echo -e "${P}│${NC}  ${W}BOTTLENECKS${NC}                        Score: ${score_color}${SCORE}${NC}/100              ${P}│${NC}"
  echo -e "${P}├──────────────────────────────────────────────────────────────────┤${NC}"

  if [ ${#BOTTLENECKS[@]} -eq 0 ]; then
    echo -e "${P}│${NC}  ${G}✓ No bottlenecks detected. All systems nominal.${NC}                  ${P}│${NC}"
  else
    for b in "${BOTTLENECKS[@]}"; do
      IFS='|' read -r sev cat title detail metric rec <<< "$b"
      local sev_icon
      case "$sev" in
        CRITICAL) sev_icon="${R}■ CRITICAL${NC}" ;;
        WARNING)  sev_icon="${Y}▲ WARNING${NC} " ;;
        *)        sev_icon="${C}● INFO${NC}    " ;;
      esac
      echo -e "${P}│${NC}  ${sev_icon}  ${BOLD}${title}${NC}                                        ${P}│${NC}"
      echo -e "${P}│${NC}              ${DIM}${detail}${NC}                                        ${P}│${NC}"
      echo -e "${P}│${NC}              ${DIM}fix: ${rec}${NC}  ${P}│${NC}"
    done
  fi

  echo -e "${P}│${NC}                                                                  ${P}│${NC}"
  echo -e "${P}└──────────────────────────────────────────────────────────────────┘${NC}"
}

# ============================================================================
# Main
# ============================================================================

if [ "$WATCH" = true ]; then
  tput civis 2>/dev/null || true
  trap 'tput cnorm 2>/dev/null; exit' INT TERM
  while true; do
    clear
    render
    echo -e "  ${DIM}Refreshing every ${INTERVAL}s. Press Ctrl+C to stop.${NC}"
    sleep "$INTERVAL"
  done
else
  echo ""
  render
  echo ""
fi
