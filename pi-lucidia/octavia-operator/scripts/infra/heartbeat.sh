#!/bin/bash
# BR-Heartbeat - Fleet heartbeat monitor
clear
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

HOSTS=("alice:192.168.4.49" "cecilia:192.168.4.96" "octavia:192.168.4.100" "aria:192.168.4.98" "lucidia:192.168.4.38")

while true; do
  clear
  printf "${PINK}╔══════════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║     ♥  BR-Heartbeat Fleet Monitor  ♥    ║${RESET}\n"
  printf "${PINK}╚══════════════════════════════════════════╝${RESET}\n\n"
  printf "  ${BLUE}%-12s %-16s %-8s %s${RESET}\n" "NODE" "IP" "STATUS" "LATENCY"
  printf "  ${BLUE}%-12s %-16s %-8s %s${RESET}\n" "────" "──" "──────" "───────"

  for entry in "${HOSTS[@]}"; do
    name="${entry%%:*}"
    ip="${entry##*:}"
    result=$(ping -c 1 -W 2 "$ip" 2>/dev/null)
    if [ $? -eq 0 ]; then
      ms=$(echo "$result" | grep 'time=' | sed 's/.*time=\([^ ]*\).*/\1/')
      printf "  ${GREEN}%-12s${RESET} %-16s ${GREEN}%-8s${RESET} %sms\n" "$name" "$ip" "ALIVE" "$ms"
    else
      printf "  ${RED}%-12s${RESET} %-16s ${RED}%-8s${RESET} --\n" "$name" "$ip" "DOWN"
    fi
  done

  # Mac stats
  printf "\n  ${PINK}── Local ──${RESET}\n"
  cpu=$(ps -A -o %cpu | awk '{s+=$1}END{printf "%.0f", s}')
  mem=$(ps -A -o %mem | awk '{s+=$1}END{printf "%.0f", s}')
  printf "  CPU: ${AMBER}%s%%${RESET}  MEM: ${AMBER}%s%%${RESET}\n" "$cpu" "$mem"

  printf "\n  ${BLUE}Refreshing in 5s... [Ctrl+C to quit]${RESET}\n"
  sleep 5
done
