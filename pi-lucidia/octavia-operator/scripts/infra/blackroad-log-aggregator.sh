#!/bin/bash
# BR-Logs - Fleet log aggregator
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

NODES=("alice:192.168.4.49:pi" "cecilia:192.168.4.96:blackroad" "octavia:192.168.4.100:pi" "lucidia:192.168.4.38:octavia")

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║        📋  BR-Logs Aggregator         ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════════╝${RESET}\n\n"
  cat <<MENU
  ${BLUE}1${RESET})  Tail all nodes (live)
  ${BLUE}2${RESET})  System errors (last hour)
  ${BLUE}3${RESET})  Docker logs
  ${BLUE}4${RESET})  Ollama logs
  ${BLUE}5${RESET})  Cloudflared logs
  ${BLUE}6${RESET})  Power/throttle alerts
  ${BLUE}7${RESET})  Search logs
  ${BLUE}0${RESET})  Quit

MENU
  printf "  ${PINK}> ${RESET}"
  read -r c
  case $c in
    1) printf "\n  ${GREEN}Live tail (Ctrl+C to stop):${RESET}\n\n"
       for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "journalctl -f -n 5 --no-pager 2>/dev/null" 2>/dev/null | sed "s/^/  [${name}] /" &
       done
       wait
       read -rp "  ↩ ";;
    2) for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "journalctl -p err --since '1 hour ago' --no-pager -n 10 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    3) for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s Docker ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "docker ps --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    4) for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s Ollama ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "journalctl -u ollama --no-pager -n 5 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    5) for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s Cloudflared ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "journalctl -u cloudflared --no-pager -n 5 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    6) for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s Power ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "vcgencmd get_throttled 2>/dev/null; vcgencmd measure_volts 2>/dev/null; vcgencmd measure_temp 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    7) printf "  Search: "; read -r query
       for entry in "${NODES[@]}"; do
         IFS=: read -r name ip user <<< "$entry"
         printf "\n  ${AMBER}── %s ──${RESET}\n" "$name"
         ssh -o ConnectTimeout=3 "${user}@${ip}" "journalctl --no-pager -n 20 --grep='$query' 2>/dev/null" || printf "  ${RED}Offline${RESET}\n"
       done
       read -rp "  ↩ ";;
    0|q) exit;;
  esac
done
