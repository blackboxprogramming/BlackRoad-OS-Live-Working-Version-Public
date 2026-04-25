#!/usr/bin/env bash
# BLACKROAD SOVEREIGN MESH - LOCAL + CLOUD
# TRULY UNSTOPPABLE - Distributed across home AND cloud!

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

# ALL NODES - Local Pis + Cloud Droplets
LOCAL_NODES="cecilia lucidia"
CLOUD_NODES="anastasia gematria"
ALL_NODES="$LOCAL_NODES $CLOUD_NODES"

# Node configurations
get_host() {
    case "$1" in
        cecilia)   echo "blackroad@192.168.4.89" ;;
        lucidia)   echo "pi@192.168.4.81" ;;
        anastasia) echo "blackroad@174.138.44.45" ;;
        gematria)  echo "blackroad@159.65.43.12" ;;
    esac
}

get_path() {
    case "$1" in
        cecilia)   echo "/home/blackroad/claude" ;;
        lucidia)   echo "/mnt/nvme/blackroad/claude" ;;
        anastasia) echo "/home/blackroad/claude" ;;
        gematria)  echo "/home/blackroad/claude" ;;
    esac
}

get_type() {
    case "$1" in
        cecilia|lucidia) echo "LOCAL" ;;
        anastasia|gematria) echo "CLOUD" ;;
    esac
}

banner() {
    echo -e "${PINK}"
    cat << 'ART'
╔═══════════════════════════════════════════════════════════════════╗
║   ███████╗ ██████╗ ██╗   ██╗███████╗██████╗ ███████╗██╗ ██████╗  ║
║   ██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██║██╔════╝  ║
║   ███████╗██║   ██║██║   ██║█████╗  ██████╔╝█████╗  ██║██║  ███╗ ║
║   ╚════██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══╝  ██║██║   ██║ ║
║   ███████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║███████╗██║╚██████╔╝ ║
║   ╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝  ║
║                          M E S H                                  ║
║        LOCAL (1.25TB) + CLOUD (69GB) = UNSTOPPABLE               ║
╚═══════════════════════════════════════════════════════════════════╝
ART
    echo -e "${RESET}"
}

check_all() {
    banner
    echo -e "${AMBER}Checking ALL nodes (Local + Cloud)...${RESET}\n"
    
    echo -e "${BLUE}LOCAL NODES:${RESET}"
    for node in $LOCAL_NODES; do
        host=$(get_host "$node")
        if ssh -o ConnectTimeout=3 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
            echo -e "  ${GREEN}●${RESET} $node - ONLINE"
        else
            echo -e "  ${PINK}○${RESET} $node - offline"
        fi
    done
    
    echo -e "\n${VIOLET}CLOUD NODES:${RESET}"
    for node in $CLOUD_NODES; do
        host=$(get_host "$node")
        if ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
            echo -e "  ${GREEN}●${RESET} $node - ONLINE"
        else
            echo -e "  ${PINK}○${RESET} $node - offline"
        fi
    done
    echo
}

sync_all() {
    banner
    echo -e "${AMBER}Syncing to ALL nodes...${RESET}\n"
    
    for node in $ALL_NODES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        type=$(get_type "$node")
        
        echo -e "${BLUE}→ [$type] $node...${RESET}"
        if ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "echo ok" &>/dev/null; then
            # Sync config (smaller, goes everywhere)
            rsync -avz --delete ~/.claude/ "$host:$path/config/" 2>/dev/null
            
            # Sync memory (full sync to local, journals only to cloud)
            if [ "$type" = "LOCAL" ]; then
                rsync -avz ~/.blackroad/memory/ "$host:$path/time/memory/" 2>/dev/null
            else
                # Cloud gets just journals (smaller footprint)
                rsync -avz ~/.blackroad/memory/journals/ "$host:$path/time/journals/" 2>/dev/null
            fi
            echo -e "  ${GREEN}✓${RESET} $node synced"
        else
            echo -e "  ${PINK}✗${RESET} $node unreachable"
        fi
    done
    
    echo -e "\n${GREEN}═══ SOVEREIGN MESH SYNC COMPLETE ═══${RESET}"
}

status_all() {
    banner
    echo -e "${AMBER}Storage Status - All Nodes:${RESET}\n"
    
    total_available=0
    
    for node in $ALL_NODES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        type=$(get_type "$node")
        
        echo -e "${BLUE}[$type] $node:${RESET}"
        if ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "du -sh $path 2>/dev/null; df -h \$(dirname $path) | tail -1" 2>/dev/null; then
            echo
        else
            echo "  (offline)"
            echo
        fi
    done
}

broadcast_all() {
    banner
    local action="$1"
    local entity="$2" 
    local details="$3"
    local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local entry="{\"ts\":\"$ts\",\"agent\":\"${MY_CLAUDE:-sovereign-mesh}\",\"action\":\"$action\",\"entity\":\"$entity\",\"details\":\"$details\",\"mesh\":\"all-nodes-local-cloud\"}"
    
    echo -e "${AMBER}Broadcasting to ALL nodes (Local + Cloud)...${RESET}"
    for node in $ALL_NODES; do
        host=$(get_host "$node")
        path=$(get_path "$node")
        
        if ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "echo '$entry' >> $path/time/journals/master-time.jsonl" 2>/dev/null; then
            echo -e "  ${GREEN}✓${RESET} $node"
        else
            echo -e "  ${PINK}✗${RESET} $node"
        fi
    done
    echo -e "${GREEN}Broadcast complete - replicated across local AND cloud!${RESET}"
}

case "${1:-check}" in
    check)     check_all ;;
    sync)      sync_all ;;
    status)    status_all ;;
    broadcast) shift; broadcast_all "$@" ;;
    *)
        banner
        echo "Usage: blackroad-sovereign-mesh.sh [check|sync|status|broadcast]"
        echo ""
        echo "  check     - Check ALL nodes (local + cloud)"
        echo "  sync      - Sync to ALL nodes"
        echo "  status    - Show storage on ALL nodes"
        echo "  broadcast - Log to ALL time journals"
        echo ""
        echo "Nodes: cecilia, lucidia (LOCAL) + anastasia, gematria (CLOUD)"
        ;;
esac
