#!/bin/bash
# BR-DNS - DNS lookup and management tool
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║        🌐  BR-DNS Manager         ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════╝${RESET}\n\n"
  cat <<MENU
  ${BLUE}1${RESET})  Lookup domain (dig)
  ${BLUE}2${RESET})  Reverse DNS lookup
  ${BLUE}3${RESET})  Check blackroad.io records
  ${BLUE}4${RESET})  Check Pi-hole status (Alice)
  ${BLUE}5${RESET})  Flush local DNS cache
  ${BLUE}6${RESET})  Show /etc/resolv.conf
  ${BLUE}7${RESET})  Show blocked hosts (/etc/hosts)
  ${BLUE}0${RESET})  Quit

MENU
  printf "  ${PINK}> ${RESET}"
  read -r c
  case $c in
    1) printf "  Domain: "; read -r d
       dig +short "$d" A "$d" AAAA "$d" MX "$d" CNAME 2>/dev/null || nslookup "$d"
       read -rp "  ↩ ";;
    2) printf "  IP: "; read -r ip
       dig +short -x "$ip" 2>/dev/null || nslookup "$ip"
       read -rp "  ↩ ";;
    3) printf "\n  ${GREEN}blackroad.io DNS:${RESET}\n"
       for t in A AAAA MX CNAME TXT NS; do
         r=$(dig +short blackroad.io "$t" 2>/dev/null)
         [[ -n "$r" ]] && printf "  ${BLUE}%-6s${RESET} %s\n" "$t" "$r"
       done
       read -rp "  ↩ ";;
    4) printf "\n  ${GREEN}Pi-hole (Alice):${RESET}\n"
       curl -s "http://192.168.4.49/admin/api.php?summary" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  ⚠  Unreachable"
       read -rp "  ↩ ";;
    5) sudo dscacheutil -flushcache 2>/dev/null && sudo killall -HUP mDNSResponder 2>/dev/null
       printf "  ${GREEN}DNS cache flushed${RESET}\n"
       read -rp "  ↩ ";;
    6) cat /etc/resolv.conf; read -rp "  ↩ ";;
    7) blocked=$(grep -c '0.0.0.0\|127.0.0.1' /etc/hosts 2>/dev/null)
       printf "  ${AMBER}%d blocked domains in /etc/hosts${RESET}\n" "$blocked"
       grep '0.0.0.0\|127.0.0.1' /etc/hosts | head -20
       printf "  ...\n"
       read -rp "  ↩ ";;
    0|q) exit;;
  esac
done
