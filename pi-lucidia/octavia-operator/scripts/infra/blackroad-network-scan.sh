#!/bin/bash
# BR-Network - Network scanner and diagnostics
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║       🌐  BR-Network Scanner          ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════════╝${RESET}\n\n"
  cat <<MENU
  ${BLUE}1${RESET})  Scan LAN (192.168.4.0/24)
  ${BLUE}2${RESET})  Port scan a host
  ${BLUE}3${RESET})  Fleet connectivity matrix
  ${BLUE}4${RESET})  WireGuard status
  ${BLUE}5${RESET})  Tailscale status
  ${BLUE}6${RESET})  WiFi info
  ${BLUE}7${RESET})  Bandwidth test (speedtest)
  ${BLUE}8${RESET})  Traceroute
  ${BLUE}0${RESET})  Quit

MENU
  printf "  ${PINK}> ${RESET}"
  read -r c
  case $c in
    1) printf "\n  ${GREEN}Scanning 192.168.4.0/24...${RESET}\n"
       for i in $(seq 1 254); do
         (ping -c 1 -W 1 "192.168.4.$i" &>/dev/null && printf "  ${GREEN}%-16s${RESET} UP\n" "192.168.4.$i") &
         (( i % 50 == 0 )) && wait
       done
       wait
       read -rp "  ↩ ";;
    2) printf "  Host (IP): "; read -r host
       printf "  ${GREEN}Scanning %s...${RESET}\n" "$host"
       for port in 22 53 80 443 3000 3100 5432 6379 8080 8443 9090 11434; do
         (echo >/dev/tcp/"$host"/$port 2>/dev/null && printf "  ${GREEN}%-6d OPEN${RESET}\n" "$port") &
       done
       wait
       read -rp "  ↩ ";;
    3) printf "\n  ${GREEN}Fleet Connectivity:${RESET}\n"
       HOSTS=("mac:192.168.4.28" "alice:192.168.4.49" "cecilia:192.168.4.96" "octavia:192.168.4.100" "lucidia:192.168.4.38")
       printf "  ${BLUE}%-12s" "FROM\\TO"
       for h in "${HOSTS[@]}"; do printf "%-10s" "${h%%:*}"; done
       printf "${RESET}\n"
       for src in "${HOSTS[@]}"; do
         sn="${src%%:*}" si="${src##*:}"
         printf "  %-12s" "$sn"
         for dst in "${HOSTS[@]}"; do
           di="${dst##*:}"
           if ping -c 1 -W 1 "$di" &>/dev/null; then
             printf "${GREEN}%-10s${RESET}" "✓"
           else
             printf "${RED}%-10s${RESET}" "✗"
           fi
         done
         printf "\n"
       done
       read -rp "  ↩ ";;
    4) printf "\n  ${GREEN}WireGuard:${RESET}\n"
       wg show 2>/dev/null || printf "  ${AMBER}WireGuard not active locally${RESET}\n"
       read -rp "  ↩ ";;
    5) printf "\n  ${GREEN}Tailscale:${RESET}\n"
       tailscale status 2>/dev/null || printf "  ${AMBER}Tailscale not running${RESET}\n"
       read -rp "  ↩ ";;
    6) printf "\n  ${GREEN}WiFi:${RESET}\n"
       /System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I 2>/dev/null || \
         networksetup -getairportnetwork en0 2>/dev/null
       read -rp "  ↩ ";;
    7) printf "\n  ${GREEN}Speed test...${RESET}\n"
       if command -v speedtest-cli &>/dev/null; then
         speedtest-cli --simple
       elif command -v speedtest &>/dev/null; then
         speedtest
       else
         printf "  ${AMBER}Install: pip3 install speedtest-cli${RESET}\n"
       fi
       read -rp "  ↩ ";;
    8) printf "  Host: "; read -r host
       traceroute -m 15 "$host" 2>/dev/null || printf "  ${RED}Failed${RESET}\n"
       read -rp "  ↩ ";;
    0|q) exit;;
  esac
done
