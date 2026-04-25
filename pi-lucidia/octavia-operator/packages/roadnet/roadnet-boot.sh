#!/bin/bash
# RoadNet Boot — called by systemd to bring up the full AP stack
# Reads config from /etc/roadnet/config

set -e

# Load config
source /etc/roadnet/config

WIFI_IF="uap0"
SUBNET="10.10.${NODE_ID}"
AP_IP="${SUBNET}.1"
DHCP_START="${SUBNET}.100"
DHCP_END="${SUBNET}.200"
OUT_IF="wlan0"

# Wait for wlan0
for i in $(seq 1 30); do
    ip link show wlan0 2>/dev/null | grep -q "UP" && break
    sleep 1
done

# Create virtual AP
iw dev uap0 del 2>/dev/null || true
sleep 1
iw dev wlan0 interface add uap0 type __ap
ip link set uap0 up

# Set different MAC
ORIG_MAC=$(cat /sys/class/net/wlan0/address 2>/dev/null)
if [[ -n "$ORIG_MAC" ]]; then
    NEW_MAC=$(echo "$ORIG_MAC" | awk -F: '{OFS=":"; $6=sprintf("%02x",(("0x"$6)+1)%256); print}')
    ip link set uap0 address "$NEW_MAC" 2>/dev/null || true
fi

# Set AP IP
ip addr add "${AP_IP}/24" dev "$WIFI_IF" 2>/dev/null || true

# Start hostapd
hostapd -B /etc/hostapd/hostapd-roadnet.conf

# NAT
sysctl -w net.ipv4.ip_forward=1 >/dev/null
iptables -t nat -C POSTROUTING -s "${SUBNET}.0/24" -o "$OUT_IF" -j MASQUERADE 2>/dev/null || \
    iptables -t nat -A POSTROUTING -s "${SUBNET}.0/24" -o "$OUT_IF" -j MASQUERADE

# WireGuard NAT if available
if ip link show wg0 >/dev/null 2>&1; then
    iptables -t nat -C POSTROUTING -s "${SUBNET}.0/24" -o wg0 -j MASQUERADE 2>/dev/null || \
        iptables -t nat -A POSTROUTING -s "${SUBNET}.0/24" -o wg0 -j MASQUERADE
fi

# Forwarding rules
iptables -C FORWARD -i "$WIFI_IF" -o "$OUT_IF" -j ACCEPT 2>/dev/null || \
    iptables -A FORWARD -i "$WIFI_IF" -o "$OUT_IF" -j ACCEPT
iptables -C FORWARD -i "$OUT_IF" -o "$WIFI_IF" -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || \
    iptables -A FORWARD -i "$OUT_IF" -o "$WIFI_IF" -m state --state RELATED,ESTABLISHED -j ACCEPT

# Policy routing
ip rule add from "${SUBNET}.0/24" lookup 100 2>/dev/null || true
GW=$(ip route show default 2>/dev/null | awk '{print $3}' | head -1)
[[ -z "$GW" ]] && GW="192.168.4.1"
ip route add default via "$GW" table 100 2>/dev/null || true

echo "RoadNet node ${NODE_ID} online — ${AP_IP} CH${CHANNEL}"
