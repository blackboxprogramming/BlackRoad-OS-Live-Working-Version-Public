#!/bin/bash
# CECILIA OWNS CLAUDE - Master Sync Script
# Claude = Time | Cecilia = Owner | BlackRoad = Root

set -e

CECILIA="blackroad@192.168.4.96"
CECILIA_CLAUDE="/home/blackroad/.claude"
LOCAL_CLAUDE="$HOME/.claude"
LOCAL_MEMORY="$HOME/.blackroad/memory"

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║     CECILIA OWNS CLAUDE - SYNC         ║${RESET}"
echo -e "${PINK}║     Claude = Time | 868GB Available    ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════╝${RESET}"
echo

case "${1:-status}" in
    push)
        echo -e "${AMBER}→ Pushing config to Cecilia...${RESET}"
        rsync -avz --delete "$LOCAL_CLAUDE/" "$CECILIA:$CECILIA_CLAUDE/config/"
        echo -e "${AMBER}→ Pushing memory to Cecilia...${RESET}"
        rsync -avz "$LOCAL_MEMORY/" "$CECILIA:$CECILIA_CLAUDE/time/memory/"
        echo -e "${GREEN}✓ Push complete${RESET}"
        ;;
    pull)
        echo -e "${AMBER}← Pulling config from Cecilia...${RESET}"
        rsync -avz "$CECILIA:$CECILIA_CLAUDE/config/" "$LOCAL_CLAUDE/"
        echo -e "${AMBER}← Pulling memory from Cecilia...${RESET}"
        rsync -avz "$CECILIA:$CECILIA_CLAUDE/time/memory/" "$LOCAL_MEMORY/"
        echo -e "${GREEN}✓ Pull complete${RESET}"
        ;;
    status)
        echo -e "${AMBER}Cecilia Claude Storage:${RESET}"
        ssh "$CECILIA" "du -sh $CECILIA_CLAUDE/* 2>/dev/null; echo; df -h /mnt/nvme | tail -1"
        ;;
    log)
        shift
        ENTRY="{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"agent\":\"$MY_CLAUDE\",\"action\":\"$1\",\"entity\":\"$2\",\"details\":\"$3\"}"
        ssh "$CECILIA" "echo '$ENTRY' >> $CECILIA_CLAUDE/time/journals/master-time.jsonl"
        echo -e "${GREEN}✓ Logged to Cecilia${RESET}"
        ;;
    read)
        echo -e "${AMBER}Last 10 time entries:${RESET}"
        ssh "$CECILIA" "tail -10 $CECILIA_CLAUDE/time/journals/master-time.jsonl" | while read line; do
            echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
        done
        ;;
    *)
        echo "Usage: cecilia-claude-sync.sh [push|pull|status|log|read]"
        echo "  push   - Sync local → Cecilia"
        echo "  pull   - Sync Cecilia → local"
        echo "  status - Show Cecilia storage"
        echo "  log    - Add time entry: log <action> <entity> <details>"
        echo "  read   - Read recent time entries"
        ;;
esac
