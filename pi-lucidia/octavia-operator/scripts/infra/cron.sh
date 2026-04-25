#!/bin/bash
# BR-Cron - Cron job viewer and manager
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║       ⏰  BR-Cron Manager         ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════╝${RESET}\n\n"
  cat <<MENU
  ${BLUE}1${RESET})  Show local crontab
  ${BLUE}2${RESET})  Show launchd agents
  ${BLUE}3${RESET})  Show Cecilia crons
  ${BLUE}4${RESET})  Show Octavia crons
  ${BLUE}5${RESET})  Show Lucidia crons
  ${BLUE}6${RESET})  Show Alice crons
  ${BLUE}7${RESET})  Edit local crontab
  ${BLUE}0${RESET})  Quit

MENU
  printf "  ${PINK}> ${RESET}"
  read -r c
  case $c in
    1) printf "\n  ${GREEN}Local crontab:${RESET}\n"
       crontab -l 2>/dev/null || echo "  No crontab"
       read -rp "  ↩ ";;
    2) printf "\n  ${GREEN}LaunchAgents:${RESET}\n"
       ls ~/Library/LaunchAgents/*.plist 2>/dev/null | while read f; do
         name=$(basename "$f" .plist)
         loaded=$(launchctl list 2>/dev/null | grep -c "$name")
         status="${GREEN}loaded${RESET}"
         (( loaded == 0 )) && status="${AMBER}unloaded${RESET}"
         printf "  %b  %s\n" "$status" "$name"
       done
       read -rp "  ↩ ";;
    3) printf "\n  ${GREEN}Cecilia crons:${RESET}\n"
       ssh -o ConnectTimeout=3 cecilia "crontab -l 2>/dev/null; echo '---'; sudo crontab -l 2>/dev/null" || echo "  ⚠  Offline"
       read -rp "  ↩ ";;
    4) printf "\n  ${GREEN}Octavia crons:${RESET}\n"
       ssh -o ConnectTimeout=3 octavia "crontab -l 2>/dev/null; echo '---'; sudo crontab -l 2>/dev/null" || echo "  ⚠  Offline"
       read -rp "  ↩ ";;
    5) printf "\n  ${GREEN}Lucidia crons:${RESET}\n"
       ssh -o ConnectTimeout=3 lucidia "crontab -l 2>/dev/null; echo '---'; sudo crontab -l 2>/dev/null" || echo "  ⚠  Offline"
       read -rp "  ↩ ";;
    6) printf "\n  ${GREEN}Alice crons:${RESET}\n"
       ssh -o ConnectTimeout=3 alice "crontab -l 2>/dev/null; echo '---'; sudo crontab -l 2>/dev/null" || echo "  ⚠  Offline"
       read -rp "  ↩ ";;
    7) crontab -e;;
    0|q) exit;;
  esac
done
