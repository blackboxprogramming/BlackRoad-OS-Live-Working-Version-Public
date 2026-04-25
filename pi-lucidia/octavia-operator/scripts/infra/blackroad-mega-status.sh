#!/bin/bash
# BR-Status - Full fleet status dashboard
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

clear
printf "${PINK}╔══════════════════════════════════════════════════╗${RESET}\n"
printf "${PINK}║          ⚡  BR-Status Dashboard  ⚡            ║${RESET}\n"
printf "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n\n"

NODES=("alice:192.168.4.49:pi" "cecilia:192.168.4.96:blackroad" "octavia:192.168.4.100:pi" "lucidia:192.168.4.38:octavia" "aria:192.168.4.98:blackroad")

for entry in "${NODES[@]}"; do
  IFS=: read -r name ip user <<< "$entry"

  printf "${VIOLET}┌─ %s (%s) ─────────────────────────────${RESET}\n" "$name" "$ip"

  if ! ping -c 1 -W 2 "$ip" &>/dev/null; then
    printf "${RED}│  ✗ OFFLINE${RESET}\n"
    printf "${VIOLET}└──────────────────────────────────────────${RESET}\n\n"
    continue
  fi

  printf "${GREEN}│  ✓ ONLINE${RESET}\n"

  # Get stats via SSH
  stats=$(ssh -o ConnectTimeout=3 -o BatchMode=yes "${user}@${ip}" "
    echo \"CPU: \$(top -bn1 2>/dev/null | grep 'Cpu' | head -1 | awk '{print \$2}')%\"
    echo \"MEM: \$(free -h 2>/dev/null | awk '/Mem/{print \$3\"/\"\$2}')\"
    echo \"DISK: \$(df -h / 2>/dev/null | awk 'NR==2{print \$5\" used (\"\$4\" free)\"}')\"
    echo \"TEMP: \$(vcgencmd measure_temp 2>/dev/null | cut -d= -f2)\"
    echo \"THROTTLE: \$(vcgencmd get_throttled 2>/dev/null | cut -d= -f2)\"
    echo \"UPTIME: \$(uptime -p 2>/dev/null || uptime | awk -F'up ' '{print \$2}' | awk -F',' '{print \$1,\$2}')\"
    echo \"DOCKER: \$(docker ps -q 2>/dev/null | wc -l | tr -d ' ') containers\"
    echo \"OLLAMA: \$(curl -s --connect-timeout 1 http://localhost:11434/api/tags 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print(len(d.get(\"models\",[])),\"models\")' 2>/dev/null || echo 'not running')\"
  " 2>/dev/null)

  if [[ -n "$stats" ]]; then
    echo "$stats" | while read -r line; do
      printf "${BLUE}│  %s${RESET}\n" "$line"
    done
  else
    printf "${AMBER}│  SSH failed (key auth)${RESET}\n"
  fi
  printf "${VIOLET}└──────────────────────────────────────────${RESET}\n\n"
done

# Local Mac status
printf "${VIOLET}┌─ mac (192.168.4.28) ────────────────────${RESET}\n"
printf "${GREEN}│  ✓ LOCAL${RESET}\n"
cpu=$(ps -A -o %cpu | awk '{s+=$1}END{printf "%.0f", s}')
mem=$(ps -A -o %mem | awk '{s+=$1}END{printf "%.0f", s}')
disk=$(df -h / | awk 'NR==2{print $5" used ("$4" free)"}')
printf "${BLUE}│  CPU: %s%%  MEM: %s%%${RESET}\n" "$cpu" "$mem"
printf "${BLUE}│  DISK: %s${RESET}\n" "$disk"
printf "${BLUE}│  Docker: %s containers${RESET}\n" "$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')"
printf "${VIOLET}└──────────────────────────────────────────${RESET}\n\n"

printf "${PINK}Done. Press Enter to exit.${RESET}\n"
read -r
