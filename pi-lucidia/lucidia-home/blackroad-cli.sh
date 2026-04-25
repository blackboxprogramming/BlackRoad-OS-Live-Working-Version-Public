#!/usr/bin/env bash
# BlackRoad-OS CLI
# Universal infrastructure management tool
# Version: 2.0.0
# Updated: 2025-12-26

VERSION="2.0.0"
INFRA_FILE="$HOME/BLACKROAD_INFRASTRUCTURE.md"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'
BR_PURPLE='\033[38;2;119;0;255m'
BR_ORANGE='\033[38;2;255;157;0m'
BR_BLUE='\033[38;2;0;102;255m'

banner() {
    echo -e "${BR_PURPLE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     🖤🛣️  BlackRoad-OS v$VERSION      ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

usage() {
    banner
    cat << EOF
USAGE: blackroad-cli <command> [options]

COMMANDS:
  ssh <device>         Connect to device via SSH
  list                 List all infrastructure devices
  status               Show status of all devices
  deploy <script>      Deploy script to all devices
  info <device>        Show detailed device info
  sync                 Sync infrastructure inventory
  update               Update BlackRoad-OS CLI
  version              Show version
  help                 Show this help

DEVICES:
  lucidia, aria64      Primary dev Pi (192.168.4.38)
  octavia              3D printing Pi (192.168.4.74)
  blackroad-pi         General Pi (192.168.4.64)
  alice                K3s cluster Pi (192.168.4.49)
  shellfish            DigitalOcean (174.138.44.45)

EXAMPLES:
  blackroad-cli ssh lucidia
  blackroad-cli list
  blackroad-cli status
  blackroad-cli deploy ~/my-script.sh

EOF
}

get_connection() {
    case "$1" in
        lucidia|aria64) echo "lucidia@192.168.4.38" ;;
        octavia) echo "pi@192.168.4.74" ;;
        blackroad-pi) echo "pi@192.168.4.64" ;;
        alice) echo "alice@192.168.4.49" ;;
        shellfish) echo "root@174.138.44.45" ;;
        *) echo "" ;;
    esac
}

cmd_ssh() {
    local device="$1"
    
    if [ -z "$device" ]; then
        echo -e "${RED}Error: Device name required${NC}"
        echo "Usage: blackroad-cli ssh <device>"
        exit 1
    fi
    
    local conn=$(get_connection "$device")
    if [ -z "$conn" ]; then
        echo -e "${RED}Error: Unknown device '$device'${NC}"
        exit 1
    fi
    
    echo -e "${BR_BLUE}🔌 Connecting to $device ($conn)...${NC}"
    ssh "$conn"
}

cmd_list() {
    banner
    echo -e "${BR_ORANGE}📋 BlackRoad Infrastructure Devices${NC}"
    echo ""
    echo -e "${CYAN}RASPBERRY PI CLUSTER:${NC}"
    echo "  lucidia (aria64)    192.168.4.38  Primary Development, Alt Data Storage"
    echo "  octavia             192.168.4.74  3D Printing, OctoPrint, Robotics"
    echo "  blackroad-pi        192.168.4.64  General Purpose Computing"
    echo "  alice               192.168.4.49  Kubernetes K3s Cluster Node"
    echo ""
    echo -e "${CYAN}CLOUD SERVERS:${NC}"
    echo "  shellfish           174.138.44.45 Public Cloud Server (DigitalOcean)"
    echo ""
}

cmd_status() {
    banner
    echo -e "${BR_ORANGE}🔍 Checking device status...${NC}"
    echo ""
    
    for device in lucidia octavia blackroad-pi alice shellfish; do
        local conn=$(get_connection "$device")
        printf "  %-15s ... " "$device"
        
        if timeout 2 ssh -o ConnectTimeout=2 -o BatchMode=yes "$conn" "echo ok" &>/dev/null; then
            echo -e "${GREEN}✓ ONLINE${NC}"
        else
            echo -e "${RED}✗ OFFLINE${NC}"
        fi
    done
    echo ""
}

cmd_info() {
    local device="$1"
    
    if [ -z "$device" ]; then
        echo -e "${RED}Error: Device name required${NC}"
        exit 1
    fi
    
    local conn=$(get_connection "$device")
    if [ -z "$conn" ]; then
        echo -e "${RED}Error: Unknown device '$device'${NC}"
        exit 1
    fi
    
    banner
    echo -e "${BR_ORANGE}📊 Device Info: $device${NC}"
    echo ""
    echo -e "  ${CYAN}Connection:${NC} $conn"
    echo ""
    echo -e "${CYAN}Live Info:${NC}"
    ssh "$conn" 'echo "  Hostname: $(hostname)"; echo "  User: $(whoami)"; echo "  IPs: $(hostname -I)"; echo "  Uptime: $(uptime -p 2>/dev/null || uptime)"'
}

cmd_deploy() {
    local script="$1"
    
    if [ -z "$script" ]; then
        echo -e "${RED}Error: Script path required${NC}"
        exit 1
    fi
    
    if [ ! -f "$script" ]; then
        echo -e "${RED}Error: Script not found: $script${NC}"
        exit 1
    fi
    
    banner
    echo -e "${BR_ORANGE}🚀 Deploying $script to all devices...${NC}"
    echo ""
    
    for device in lucidia octavia blackroad-pi alice shellfish; do
        local conn=$(get_connection "$device")
        echo -e "  ${CYAN}→ $device${NC}"
        
        if scp "$script" "$conn:~/" && ssh "$conn" "chmod +x ~/$(basename "$script")"; then
            echo -e "    ${GREEN}✓ Deployed${NC}"
        else
            echo -e "    ${RED}✗ Failed${NC}"
        fi
    done
    echo ""
}

cmd_sync() {
    banner
    echo -e "${BR_ORANGE}🔄 Syncing infrastructure inventory...${NC}"
    echo ""
    
    if [ ! -f "$INFRA_FILE" ]; then
        echo -e "${RED}Error: Infrastructure file not found: $INFRA_FILE${NC}"
        exit 1
    fi
    
    for device in lucidia octavia blackroad-pi alice shellfish; do
        local conn=$(get_connection "$device")
        echo -e "  ${CYAN}→ $device${NC}"
        
        if scp "$INFRA_FILE" "$conn:~/BLACKROAD_INFRASTRUCTURE.md" &>/dev/null; then
            echo -e "    ${GREEN}✓ Synced${NC}"
        else
            echo -e "    ${RED}✗ Failed${NC}"
        fi
    done
    echo ""
}

cmd_update() {
    banner
    echo -e "${BR_ORANGE}📥 Updating BlackRoad-OS CLI...${NC}"
    echo ""
    
    for device in lucidia octavia blackroad-pi alice shellfish; do
        local conn=$(get_connection "$device")
        echo -e "  ${CYAN}→ $device${NC}"
        
        if scp "$0" "$conn:~/blackroad-cli.sh" && ssh "$conn" "chmod +x ~/blackroad-cli.sh"; then
            echo -e "    ${GREEN}✓ Updated${NC}"
        else
            echo -e "    ${RED}✗ Failed${NC}"
        fi
    done
    echo ""
}

cmd_version() {
    banner
    echo "Version: $VERSION"
    echo "Updated: 2025-12-26"
    echo ""
}

# Main
main() {
    local cmd="${1:-help}"
    shift || true
    
    case "$cmd" in
        ssh) cmd_ssh "$@" ;;
        list|ls) cmd_list ;;
        status|st) cmd_status ;;
        info) cmd_info "$@" ;;
        deploy) cmd_deploy "$@" ;;
        sync) cmd_sync ;;
        update) cmd_update ;;
        version|-v|--version) cmd_version ;;
        help|-h|--help) usage ;;
        *)
            echo -e "${RED}Error: Unknown command '$cmd'${NC}"
            usage
            exit 1
            ;;
    esac
}

main "$@"
