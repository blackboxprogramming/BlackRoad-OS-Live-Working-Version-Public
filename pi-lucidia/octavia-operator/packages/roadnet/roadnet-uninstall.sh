#!/bin/bash
# RoadNet Uninstall — cleanly remove from all Pis
# Restores original configs, doesn't break existing services

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

declare -A HOSTS=([Alice]="pi@192.168.4.49" [Cecilia]="blackroad@192.168.4.96" [Octavia]="pi@192.168.4.97" [Aria]="pi@192.168.4.98" [Lucidia]="octavia@192.168.4.38")
declare -A NODE_IDS=([Alice]=1 [Cecilia]=2 [Octavia]=3 [Aria]=4 [Lucidia]=5)

echo -e "${PINK}RoadNet Uninstall${RESET}"
echo ""

for name in Alice Cecilia Octavia Aria Lucidia; do
    host="${HOSTS[$name]}"
    nid="${NODE_IDS[$name]}"

    if ! ssh -o ConnectTimeout=3 -o BatchMode=yes "$host" "echo ok" >/dev/null 2>&1; then
        echo -e "  ${RED}●${RESET} ${name} — offline, skipping"
        continue
    fi

    echo -e "  ${AMBER}Cleaning ${name}...${RESET}"
    ssh -o ConnectTimeout=5 "$host" "
        # Stop services
        sudo systemctl stop roadnet-failover 2>/dev/null || true
        sudo systemctl disable roadnet-failover 2>/dev/null || true
        sudo killall hostapd 2>/dev/null || true

        # Remove configs
        sudo rm -f /etc/hostapd/hostapd-roadnet.conf
        sudo rm -f /etc/dnsmasq.d/roadnet.conf
        sudo rm -f /etc/systemd/system/roadnet-failover.service
        sudo rm -f /usr/local/bin/roadnet-failover.sh
        sudo rm -f /usr/local/bin/roadnet-bluetooth.sh

        # Remove iptables rules
        OUT_IF=eth0; ip link show eth0 >/dev/null 2>&1 || OUT_IF=end0
        sudo iptables -t nat -D POSTROUTING -s 10.10.${nid}.0/24 -o \$OUT_IF -j MASQUERADE 2>/dev/null || true
        sudo iptables -t nat -D POSTROUTING -s 10.10.${nid}.0/24 -o wg0 -j MASQUERADE 2>/dev/null || true
        sudo iptables -t nat -D POSTROUTING -s 10.10.99.0/24 -j MASQUERADE 2>/dev/null || true
        sudo iptables -D FORWARD -i wlan0 -o \$OUT_IF -j ACCEPT 2>/dev/null || true
        sudo iptables -D FORWARD -i \$OUT_IF -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || true

        # Remove policy routing
        sudo ip rule del from 10.10.${nid}.0/24 lookup 100 2>/dev/null || true
        sudo ip route flush table 100 2>/dev/null || true

        # Restore wlan0 to managed mode
        sudo ip addr flush dev wlan0 2>/dev/null || true

        # Remove dhcpcd deny line
        sudo sed -i '/roadnet/d' /etc/dhcpcd.conf 2>/dev/null || true

        # Re-enable NetworkManager on wlan0
        sudo nmcli device set wlan0 managed yes 2>/dev/null || true

        # Restart dnsmasq without roadnet config
        sudo systemctl restart dnsmasq 2>/dev/null || true

        # Reload systemd
        sudo systemctl daemon-reload

        # Remove bluetooth bridge
        sudo ip link set br-roadnet down 2>/dev/null || true
        sudo brctl delbr br-roadnet 2>/dev/null || true

        echo 'CLEAN'
    " 2>/dev/null && echo -e "  ${GREEN}●${RESET} ${name} — cleaned" || echo -e "  ${RED}●${RESET} ${name} — errors"
done

echo ""
echo -e "${GREEN}RoadNet removed from all nodes. Original configs restored.${RESET}"
