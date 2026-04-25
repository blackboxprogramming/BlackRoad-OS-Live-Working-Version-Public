#!/bin/bash
# BR-Store - BlackRoad App Store
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

APPS_DIR=~/Applications

list_apps() {
  printf "\n  ${VIOLET}Installed BR Apps:${RESET}\n\n"
  i=0
  for app in "$APPS_DIR"/BR-*.app; do
    name=$(basename "$app" .app)
    script="$app/Contents/MacOS/$name"
    if [ -f "$script" ]; then
      target=$(grep '^open ' "$script" 2>/dev/null | head -1)
      ((i++))
      printf "  ${GREEN}%2d${RESET}) ${BLUE}%-20s${RESET} %s\n" "$i" "$name" "$target"
    fi
  done
  printf "\n  ${AMBER}Total: %d apps${RESET}\n" "$i"
}

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║       🏪  BR-Store (App Store)        ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════════╝${RESET}\n\n"
  cat <<MENU
  ${BLUE}1${RESET})  List installed apps
  ${BLUE}2${RESET})  Launch an app
  ${BLUE}3${RESET})  Check app health
  ${BLUE}4${RESET})  Rebuild Dock
  ${BLUE}0${RESET})  Quit

MENU
  printf "  ${PINK}> ${RESET}"
  read -r c
  case $c in
    1) list_apps; read -rp "  ↩ ";;
    2) printf "  App name (e.g. BR-Snake): "; read -r app
       script="$APPS_DIR/$app.app/Contents/MacOS/$app"
       if [ -f "$script" ]; then
         printf "  ${GREEN}Launching %s...${RESET}\n" "$app"
         bash "$script" &
       else
         printf "  ${AMBER}Not found: %s${RESET}\n" "$app"
       fi
       read -rp "  ↩ ";;
    3) printf "\n  ${VIOLET}App Health Check:${RESET}\n"
       ok=0 broken=0
       for app in "$APPS_DIR"/BR-*.app; do
         name=$(basename "$app" .app)
         script="$app/Contents/MacOS/$name"
         if [ ! -f "$script" ]; then
           printf "  ${AMBER}%-20s missing script${RESET}\n" "$name"
           ((broken++)); continue
         fi
         target=$(grep -oP '(?<=open\s).*' "$script" 2>/dev/null | grep -v '^-a' | head -1)
         if [[ "$target" =~ ^/ ]] && [ ! -e "$target" ]; then
           printf "  ${AMBER}%-20s missing: %s${RESET}\n" "$name" "$target"
           ((broken++))
         else
           ((ok++))
         fi
       done
       printf "\n  ${GREEN}%d OK${RESET}, ${AMBER}%d broken${RESET}\n" "$ok" "$broken"
       read -rp "  ↩ ";;
    4) killall Dock 2>/dev/null
       printf "  ${GREEN}Dock restarted${RESET}\n"
       read -rp "  ↩ ";;
    0|q) exit;;
  esac
done
