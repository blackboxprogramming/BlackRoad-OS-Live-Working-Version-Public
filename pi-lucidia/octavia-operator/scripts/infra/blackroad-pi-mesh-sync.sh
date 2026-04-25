#!/usr/bin/env bash
# BLACKROAD PI MESH - DISTRIBUTED SOVEREIGNTY
# No one can bring us down - data replicated across the fleet!

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

# Pi Fleet - simple arrays (bash 3 compatible)
PI_NAMES="cecilia lucidia"
PI_CECILIA_HOST="blackroad@192.168.4.89"
PI_CECILIA_PATH="/home/blackroad/claude"
PI_LUCIDIA_HOST="pi@192.168.4.81"
PI_LUCIDIA_PATH="/mnt/nvme/blackroad/claude"

echo -e "${PINK}"
cat << 'BANNER'
╔══════════════════════════════════════════════════════════════╗
║   ____  _            _    ____                 _             ║
║  | __ )| | __ _  ___| | _|  _ \ ___   __ _  __| |            ║
║  |  _ \| |/ _` |/ __| |/ / |_) / _ \ / _` |/ _` |            ║
║  | |_) | | (_| | (__|   <|  _ < (_) | (_| | (_| |            ║
║  |____/|_|\__,_|\___|_|\_\_| \_\___/ \__,_|\__,_|            ║
║                                                              ║
║        P I   M E S H  -  N O   O N E   C A N                 ║
║              B R I N G   U S   D O W N                       ║
╚══════════════════════════════════════════════════════════════╝
BANNER
echo -e "${RESET}"

get_host() {
    case "$1" in
        cecilia) echo "$PI_CECILIA_HOST" ;;
        lucidia) echo "$PI_LUCIDIA_HOST" ;;
    esac
}

get_path() {
    case "$1" in
        cecilia) echo "$PI_CECILIA_PATH" ;;
        lucidia) echo "$PI_LUCIDIA_PATH" ;;
    esac
}

check_nodes() {
    echo -e "${AMBER}Checking Pi Fleet Status...${RESET}"
    for node in $PI_NAMES; do
        host=$(get_host "$node")
        if ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
            echo -e "  ${GREEN}●${RESET} $node - ONLINE"
        else
            echo -e "  ${PINK}○${RESET} $node - offline"
        fi
    done
    echo
}

sync_all() {
    echo -e "${AMBER}Syncing to ALL Pi nodes...${RESET}"
    
    for node in $PI_NAMES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        
        echo -e "${BLUE}→ Syncing to $node...${RESET}"
        if ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
            rsync -avz --delete ~/.claude/ "$host:$path/config/" 2>/dev/null
            rsync -avz ~/.blackroad/memory/ "$host:$path/time/memory/" 2>/dev/null
            echo -e "  ${GREEN}✓${RESET} $node synced"
        else
            echo -e "  ${PINK}✗${RESET} $node unreachable"
        fi
    done
    
    # Cross-sync between Pis
    echo -e "${BLUE}→ Cross-syncing cecilia ↔ lucidia...${RESET}"
    ssh -o ConnectTimeout=3 "$PI_CECILIA_HOST" \
        "rsync -avz $PI_CECILIA_PATH/time/ $PI_LUCIDIA_HOST:$PI_LUCIDIA_PATH/time/ 2>/dev/null" && \
        echo -e "  ${GREEN}✓${RESET} Cross-sync complete" || \
        echo -e "  ${PINK}✗${RESET} Cross-sync skipped"
    
    echo -e "\n${GREEN}═══ MESH SYNC COMPLETE ═══${RESET}"
}

status() {
    echo -e "${AMBER}Pi Fleet Storage Status:${RESET}\n"
    for node in $PI_NAMES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        
        echo -e "${BLUE}$node:${RESET}"
        ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" \
            "du -sh $path/* 2>/dev/null; echo; df -h \$(dirname $path) | tail -1" 2>/dev/null || echo "  (offline)"
        echo
    done
}

broadcast_time() {
    local action="$1"
    local entity="$2" 
    local details="$3"
    local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local entry="{\"ts\":\"$ts\",\"agent\":\"${MY_CLAUDE:-mesh}\",\"action\":\"$action\",\"entity\":\"$entity\",\"details\":\"$details\",\"mesh\":true}"
    
    echo -e "${AMBER}Broadcasting to all nodes...${RESET}"
    for node in $PI_NAMES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        
        if ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" "echo '$entry' >> $path/time/journals/master-time.jsonl" 2>/dev/null; then
            echo -e "  ${GREEN}✓${RESET} $node"
        else
            echo -e "  ${PINK}✗${RESET} $node"
        fi
    done
    echo -e "${GREEN}Broadcast complete${RESET}"
}

case "${1:-status}" in
    check)   check_nodes ;;
    sync)    sync_all ;;
    status)  status ;;
    broadcast) shift; broadcast_time "$@" ;;
    *)
        echo "Usage: blackroad-pi-mesh-sync.sh [check|sync|status|broadcast]"
        echo "  check     - Check which Pis are online"
        echo "  sync      - Sync to ALL online Pis + cross-sync"
        echo "  status    - Show storage on all Pis"  
        echo "  broadcast - Log to ALL time journals"
        ;;
esac
