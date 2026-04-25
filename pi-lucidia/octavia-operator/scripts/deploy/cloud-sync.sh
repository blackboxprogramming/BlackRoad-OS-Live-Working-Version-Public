#!/bin/bash
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

REMOTE="gdrive-blackroad:blackroad-cloud-backup"
HOME_DIR="/Users/alexa"

echo -e "${PINK}▓▓ BlackRoad Cloud Sync ▓▓${RESET}"
echo -e "${AMBER}Target: ${REMOTE} (2TB Drive, 1.96TB free)${RESET}"
echo ""

# Sync all project folders (excluding junk)
EXCLUDE_FLAGS=(
  --exclude "node_modules/**"
  --exclude ".git/**"
  --exclude "dist/**"
  --exclude "build/**"
  --exclude ".next/**"
  --exclude "out/**"
  --exclude "__pycache__/**"
  --exclude ".venv/**"
  --exclude "*.pyc"
  --exclude ".DS_Store"
  --exclude "*.o"
  --exclude "*.a"
  --exclude "*.dylib"
  --exclude ".lucidia-espressif/**"
  --exclude "esp-idf/**"
  --exclude "bouffalo_sdk/**"
  --exclude "actions-runner/**"
  --exclude "Library/**"
  --exclude ".Trash/**"
  --exclude "Pictures/**"
  --exclude "Movies/**"
  --exclude "Music/**"
)

echo -e "${GREEN}[1/3] Syncing all project source code...${RESET}"
rclone sync "$HOME_DIR" "$REMOTE/home" \
  "${EXCLUDE_FLAGS[@]}" \
  --transfers 8 \
  --checkers 16 \
  --progress \
  --stats 10s \
  --fast-list \
  -v 2>&1

echo ""
echo -e "${GREEN}[2/3] Syncing BlackRoad-Private...${RESET}"
rclone sync "$HOME_DIR/BlackRoad-Private" "$REMOTE/BlackRoad-Private" \
  --exclude "node_modules/**" \
  --exclude ".git/**" \
  --transfers 8 \
  --progress \
  -v 2>&1

echo ""
echo -e "${GREEN}[3/3] Syncing Desktop templates...${RESET}"
rclone sync "$HOME_DIR/Desktop/templates" "$REMOTE/templates" \
  --progress \
  -v 2>&1

echo ""
echo -e "${PINK}▓▓ Cloud sync complete ▓▓${RESET}"
echo -e "${GREEN}All source code backed up to: ${REMOTE}${RESET}"
