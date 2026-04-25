#!/bin/bash
# RoadNet Status Dashboard — run from Mac
# Shows all nodes, connected clients, transport state

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
VIOLET='\033[38;5;135m'
DIM='\033[2m'
RESET='\033[0m'

declare -A NODES=(
    [Alice]="pi@192.168.4.49"
    [Cecilia]="blackroad@192.168.4.96"
    [Octavia]="pi@192.168.4.97"
    [Aria]="pi@192.168.4.98"
    [Lucidia]="octavia@192.168.4.38"
)

declare -A NODE_IDS=([Alice]=1 [Cecilia]=2 [Octavia]=3 [Aria]=4 [Lucidia]=5)
declare -A CHANNELS=([Alice]=1 [Cecilia]=6 [Octavia]=11 [Aria]=1 [Lucidia]=11)

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo ""
echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║            R O A D N E T   —   S T A T U S                 ║${RESET}"
echo -e "${PINK}║         Your Network. Your Rules. No Carrier.               ║${RESET}"
echo -e "${PINK}╠══════════════════════════════════════════════════════════════╣${RESET}"

# Query each node in parallel
for name in Alice Cecilia Octavia Aria Lucidia; do
    ssh_target="${NODES[$name]}"
    nid="${NODE_IDS[$name]}"
    (
        ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no "$ssh_target" "
            echo 'NODE=${name}'
            # hostapd status
            if pgrep -x hostapd >/dev/null 2>&1; then
                echo 'AP=UP'
                # Count connected clients
                CLIENTS=\$(hostapd_cli -i wlan0 all_sta 2>/dev/null | grep -c '^\([0-9a-f]\{2\}:\)\{5\}' || echo 0)
                [[ -z \"\$CLIENTS\" || \"\$CLIENTS\" == \"\" ]] && CLIENTS=0
                echo \"CLIENTS=\${CLIENTS}\"
            else
                echo 'AP=DOWN'
                echo 'CLIENTS=0'
            fi
            # WiFi interface IP
            WIFI_IP=\$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print \$2}' | head -1)
            echo \"WIFI_IP=\${WIFI_IP:-none}\"
            # Current exit route
            if ip route show table 100 2>/dev/null | grep -q 'dev wg0'; then
                echo 'EXIT=wg0'
            elif ip route show table 100 2>/dev/null | grep -q 'dev eth0\|dev end0'; then
                echo 'EXIT=eth0'
            else
                DEFAULT=\$(ip route show default 2>/dev/null | head -1 | awk '{print \$5}')
                echo \"EXIT=\${DEFAULT:-unknown}\"
            fi
            # WireGuard
            if ip link show wg0 >/dev/null 2>&1; then
                echo 'WG=UP'
            else
                echo 'WG=DOWN'
            fi
            # Bluetooth PAN
            if ip link show bnep0 >/dev/null 2>&1 || ip link show br-roadnet >/dev/null 2>&1; then
                echo 'BT=UP'
            else
                echo 'BT=DOWN'
            fi
            # DHCP leases
            LEASES=\$(cat /var/lib/misc/dnsmasq.leases 2>/dev/null | grep '10.10.${nid}' | wc -l)
            echo \"LEASES=\${LEASES}\"
            # System
            LOAD=\$(cat /proc/loadavg 2>/dev/null | awk '{print \$1}')
            DISK=\$(df / 2>/dev/null | tail -1 | awk '{print \$5}')
            TEMP=\$(vcgencmd measure_temp 2>/dev/null | grep -oP '[0-9.]+' || echo '?')
            echo \"LOAD=\${LOAD}\"
            echo \"DISK=\${DISK}\"
            echo \"TEMP=\${TEMP}\"
            # Failover service
            if systemctl is-active roadnet-failover >/dev/null 2>&1; then
                echo 'FAILOVER=UP'
            else
                echo 'FAILOVER=DOWN'
            fi
        " > "$TMPDIR/${name}.txt" 2>/dev/null
    ) &
done
wait

# Display results
for name in Alice Cecilia Octavia Aria Lucidia; do
    ch="${CHANNELS[$name]}"
    file="$TMPDIR/${name}.txt"

    if [[ ! -s "$file" ]]; then
        echo -e "${PINK}║${RESET}  ${RED}●${RESET} ${name}      ${DIM}OFFLINE — SSH failed${RESET}"
        continue
    fi

    source "$file" 2>/dev/null

    # AP status indicator
    if [[ "$AP" == "UP" ]]; then
        AP_ICON="${GREEN}●${RESET} WiFi CH${ch}"
    else
        AP_ICON="${RED}○${RESET} WiFi OFF"
    fi

    # WireGuard indicator
    WG_ICON=""
    [[ "$WG" == "UP" ]] && WG_ICON="${GREEN}WG●${RESET}" || WG_ICON="${RED}WG○${RESET}"

    # Bluetooth indicator
    BT_ICON=""
    [[ "$name" == "Aria" ]] && { [[ "$BT" == "UP" ]] && BT_ICON=" ${BLUE}BT●${RESET}" || BT_ICON=" ${DIM}BT○${RESET}"; }

    # Client count
    TOTAL_CLIENTS=$((${CLIENTS:-0} + ${LEASES:-0}))
    [[ $TOTAL_CLIENTS -gt ${CLIENTS:-0} ]] && TOTAL_CLIENTS=${CLIENTS:-0}

    # Format line
    printf "${PINK}║${RESET}  %s %-9s │ %b │ %d clients │ exit: %-5s │ %b%b │ %s°C %s\n" \
        "" "$name" "$AP_ICON" "${CLIENTS:-0}" "${EXIT:-?}" "$WG_ICON" "$BT_ICON" "${TEMP:-?}" "${DISK:-?}"
done

echo -e "${PINK}╠══════════════════════════════════════════════════════════════╣${RESET}"

# Summary line
TOTAL_UP=0
TOTAL_CLIENTS=0
for name in Alice Cecilia Octavia Aria Lucidia; do
    file="$TMPDIR/${name}.txt"
    [[ -s "$file" ]] && source "$file" 2>/dev/null
    [[ "$AP" == "UP" ]] && ((TOTAL_UP++))
    TOTAL_CLIENTS=$((TOTAL_CLIENTS + ${CLIENTS:-0}))
done

echo -e "${PINK}║${RESET}  ${GREEN}${TOTAL_UP}/5 APs active${RESET} │ ${AMBER}${TOTAL_CLIENTS} total clients${RESET} │ ${BLUE}DNS: Pi-hole (Alice)${RESET}"
echo -e "${PINK}║${RESET}  ${VIOLET}SSID: RoadNet${RESET} │ ${DIM}3 transports: WiFi + WireGuard + Bluetooth${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
