#!/bin/bash
# RoadNet Deploy — One command to build your own carrier network
# Deploys WiFi APs + NAT + failover to all 4 Raspberry Pis
# Usage: ./roadnet-deploy.sh

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WIFI_PASSWORD="BlackRoad2026"  # Change this

# Fleet definition
declare -A HOSTS=([Alice]="pi@192.168.4.49" [Cecilia]="blackroad@192.168.4.96" [Octavia]="pi@192.168.4.97" [Aria]="pi@192.168.4.98" [Lucidia]="octavia@192.168.4.38")
declare -A NODE_IDS=([Alice]=1 [Cecilia]=2 [Octavia]=3 [Aria]=4 [Lucidia]=5)
declare -A CHANNELS=([Alice]=1 [Cecilia]=6 [Octavia]=11 [Aria]=1 [Lucidia]=11)

echo ""
echo -e "${PINK}╔══════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║                                                                  ║${RESET}"
echo -e "${PINK}║     ██████╗  ██████╗  █████╗ ██████╗ ███╗   ██╗███████╗████████╗ ║${RESET}"
echo -e "${PINK}║     ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗████╗  ██║██╔════╝╚══██╔══╝ ║${RESET}"
echo -e "${PINK}║     ██████╔╝██║   ██║███████║██║  ██║██╔██╗ ██║█████╗     ██║    ║${RESET}"
echo -e "${PINK}║     ██╔══██╗██║   ██║██╔══██║██║  ██║██║╚██╗██║██╔══╝     ██║    ║${RESET}"
echo -e "${PINK}║     ██║  ██║╚██████╔╝██║  ██║██████╔╝██║ ╚████║███████╗   ██║    ║${RESET}"
echo -e "${PINK}║     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝    ║${RESET}"
echo -e "${PINK}║                                                                  ║${RESET}"
echo -e "${PINK}║          Your Network. Your Rules. No Carrier.                   ║${RESET}"
echo -e "${PINK}║                                                                  ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Phase 1: Connectivity check
echo -e "${AMBER}━━━ PHASE 1: CONNECTIVITY CHECK ━━━${RESET}"
LIVE_NODES=()
for name in Alice Cecilia Octavia Aria Lucidia; do
    host="${HOSTS[$name]}"
    if ssh -o ConnectTimeout=3 -o BatchMode=yes "$host" "echo ok" >/dev/null 2>&1; then
        echo -e "  ${GREEN}●${RESET} ${name} (${host}) — reachable"
        LIVE_NODES+=("$name")
    else
        echo -e "  ${RED}●${RESET} ${name} (${host}) — OFFLINE, skipping"
    fi
done

if [[ ${#LIVE_NODES[@]} -eq 0 ]]; then
    echo -e "${RED}No nodes reachable. Aborting.${RESET}"
    exit 1
fi
echo -e "  ${GREEN}${#LIVE_NODES[@]}/4 nodes ready${RESET}"
echo ""

# Phase 2: Pre-flight checks
echo -e "${AMBER}━━━ PHASE 2: PRE-FLIGHT CHECKS ━━━${RESET}"
for name in "${LIVE_NODES[@]}"; do
    host="${HOSTS[$name]}"
    echo -n "  ${name}: "

    CHECKS=$(ssh -o ConnectTimeout=5 "$host" '
        ERRORS=""
        # Check eth0/end0
        if ip link show eth0 2>/dev/null | grep -q "UP" || ip link show end0 2>/dev/null | grep -q "UP"; then
            echo -n "eth0:OK "
        else
            echo -n "eth0:WARN "
            ERRORS="${ERRORS}no-eth "
        fi
        # Check WiFi hardware
        if iw dev 2>/dev/null | grep -q Interface; then
            echo -n "wifi:OK "
        else
            echo -n "wifi:MISSING "
            ERRORS="${ERRORS}no-wifi "
        fi
        # Check disk space
        AVAIL=$(df / 2>/dev/null | tail -1 | awk "{print \$4}")
        if [[ "$AVAIL" -gt 50000 ]]; then
            echo -n "disk:OK "
        else
            echo -n "disk:LOW "
        fi
        # Check WireGuard
        if ip link show wg0 >/dev/null 2>&1; then
            echo -n "wg0:OK "
        else
            echo -n "wg0:DOWN "
        fi
        # Check rfkill
        if rfkill list wifi 2>/dev/null | grep -q "Soft blocked: yes"; then
            echo -n "rfkill:BLOCKED "
        else
            echo -n "rfkill:OK "
        fi
    ' 2>/dev/null)
    echo -e "${BLUE}${CHECKS}${RESET}"
done
echo ""

# Phase 3: Deploy to each node
echo -e "${AMBER}━━━ PHASE 3: DEPLOYING ROADNET ━━━${RESET}"
PIDS=()
for name in "${LIVE_NODES[@]}"; do
    host="${HOSTS[$name]}"
    nid="${NODE_IDS[$name]}"
    ch="${CHANNELS[$name]}"
    BT_FLAG=""
    [[ "$name" == "Aria" ]] && BT_FLAG="--bluetooth"

    echo -e "  ${VIOLET}Deploying to ${name} (node ${nid}, CH${ch})...${RESET}"

    (
        # Copy setup script to Pi
        scp -o ConnectTimeout=5 -q "${SCRIPT_DIR}/roadnet-node-setup.sh" "${host}:/tmp/roadnet-node-setup.sh" 2>/dev/null

        # Run it
        ssh -o ConnectTimeout=10 "$host" "chmod +x /tmp/roadnet-node-setup.sh && sudo /tmp/roadnet-node-setup.sh --node-id ${nid} --channel ${ch} --password '${WIFI_PASSWORD}' ${BT_FLAG}" 2>&1 | while read -r line; do
            echo "    [${name}] ${line}"
        done
    ) &
    PIDS+=($!)
done

# Wait for all deployments
FAILED=0
for i in "${!PIDS[@]}"; do
    if ! wait "${PIDS[$i]}"; then
        ((FAILED++))
    fi
done
echo ""

if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}${FAILED} node(s) had errors. Check output above.${RESET}"
else
    echo -e "${GREEN}All nodes deployed successfully!${RESET}"
fi
echo ""

# Phase 4: Status check
echo -e "${AMBER}━━━ PHASE 4: VERIFICATION ━━━${RESET}"
sleep 3  # Give services a moment to start
bash "${SCRIPT_DIR}/roadnet-status.sh"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}  ROADNET DEPLOYED${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${GREEN}Connect any device to WiFi:${RESET}"
echo -e "    SSID: ${AMBER}RoadNet${RESET}"
echo -e "    Pass: ${AMBER}${WIFI_PASSWORD}${RESET}"
echo ""
echo -e "  ${GREEN}Coverage:${RESET}"
echo -e "    Alice  (CH1)  — wherever Alice Pi is"
echo -e "    Cecilia (CH6)  — wherever Cecilia Pi is"
echo -e "    Octavia (CH11) — wherever Octavia Pi is"
echo -e "    Aria   (CH1)  — wherever Aria Pi is + Bluetooth fallback"
echo ""
echo -e "  ${GREEN}Features:${RESET}"
echo -e "    DNS:    Pi-hole ad blocking (Alice)"
echo -e "    VPN:    WireGuard encrypted mesh"
echo -e "    NAT:    Full internet via any exit"
echo -e "    Failover: eth0 → WireGuard → Bluetooth"
echo ""
echo -e "  ${VIOLET}Status:${RESET}  ~/roadnet/roadnet-status.sh"
echo -e "  ${VIOLET}Remove:${RESET}  ~/roadnet/roadnet-uninstall.sh"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
