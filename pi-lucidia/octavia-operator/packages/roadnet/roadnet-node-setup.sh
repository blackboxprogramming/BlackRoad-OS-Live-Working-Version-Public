#!/bin/bash
# RoadNet Node Setup — runs on each Pi via SSH
# Turns a Raspberry Pi into a RoadNet access point
# Usage: ./roadnet-node-setup.sh --node-id 1 --channel 1 --password <pass> [--bluetooth]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

NODE_ID=""
CHANNEL=""
PASSWORD=""
ENABLE_BT=false
PIHOLE_DNS="192.168.4.49"
SSID="RoadNet"

while [[ $# -gt 0 ]]; do
    case $1 in
        --node-id) NODE_ID="$2"; shift 2 ;;
        --channel) CHANNEL="$2"; shift 2 ;;
        --password) PASSWORD="$2"; shift 2 ;;
        --bluetooth) ENABLE_BT=true; shift ;;
        *) shift ;;
    esac
done

if [[ -z "$NODE_ID" || -z "$CHANNEL" || -z "$PASSWORD" ]]; then
    echo -e "${RED}Usage: $0 --node-id <1-4> --channel <1|6|11> --password <pass> [--bluetooth]${RESET}"
    exit 1
fi

SUBNET="10.10.${NODE_ID}"
AP_IP="${SUBNET}.1"
DHCP_START="${SUBNET}.100"
DHCP_END="${SUBNET}.200"

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}  ROADNET NODE SETUP — Node ${NODE_ID} ($(hostname))${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Safety: verify wlan0 is connected (we won't touch it — using virtual AP uap0)
echo -e "${AMBER}[1/8] Checking connectivity...${RESET}"
if ip link show wlan0 2>/dev/null | grep -q "UP"; then
    WLAN_IP=$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}')
    echo -e "${GREEN}  ✓ wlan0 is UP (${WLAN_IP}) — will NOT be touched${RESET}"
    echo -e "${GREEN}  ✓ Using virtual AP (uap0) alongside wlan0${RESET}"
else
    echo -e "${RED}  ✗ wlan0 not found! Aborting.${RESET}"
    exit 1
fi

# Backup existing configs
echo -e "${AMBER}[2/8] Backing up existing configs...${RESET}"
BACKUP_DIR="/etc/roadnet-backup/$(date +%Y%m%d-%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
for f in /etc/hostapd/hostapd.conf /etc/dnsmasq.conf /etc/dhcpcd.conf /etc/network/interfaces; do
    [[ -f "$f" ]] && sudo cp "$f" "$BACKUP_DIR/" 2>/dev/null || true
done
echo -e "${GREEN}  ✓ Backed up to ${BACKUP_DIR}${RESET}"

# Install packages
echo -e "${AMBER}[3/8] Installing hostapd + dnsmasq (if needed)...${RESET}"
NEED_INSTALL=false
which hostapd >/dev/null 2>&1 || NEED_INSTALL=true
which dnsmasq >/dev/null 2>&1 || NEED_INSTALL=true
if $NEED_INSTALL; then
    sudo apt-get update -qq 2>/dev/null || true
    sudo apt-get install -y -qq hostapd dnsmasq 2>/dev/null || true
fi
echo -e "${GREEN}  ✓ hostapd + dnsmasq ready${RESET}"

# Stop conflicting services (but not existing Pi-hole dnsmasq)
echo -e "${AMBER}[4/8] Configuring services...${RESET}"
sudo systemctl stop hostapd 2>/dev/null || true
sudo systemctl unmask hostapd 2>/dev/null || true

# Unblock WiFi
sudo rfkill unblock wifi 2>/dev/null || true

# Determine mode: if eth0 has carrier, use wlan0 directly; otherwise create virtual AP (uap0)
echo -e "${AMBER}[5/8] Configuring access point...${RESET}"

# ALWAYS use virtual AP (uap0) — never steal wlan0 from home WiFi
# This keeps SSH alive and home internet working while running the AP
WIFI_IF="uap0"
echo -e "${AMBER}  Creating virtual AP (uap0) — wlan0 stays connected to home WiFi${RESET}"

# Remove old uap0 if exists
sudo iw dev uap0 del 2>/dev/null || true
sleep 1

# Add virtual interface for AP
sudo iw dev wlan0 interface add uap0 type __ap
sudo ip link set uap0 up

# Set different MAC to avoid conflicts with wlan0
ORIG_MAC=$(cat /sys/class/net/wlan0/address 2>/dev/null)
if [[ -n "$ORIG_MAC" ]]; then
    NEW_MAC=$(echo "$ORIG_MAC" | awk -F: '{OFS=":"; $6=sprintf("%02x",(("0x"$6)+1)%256); print}')
    sudo ip link set uap0 address "$NEW_MAC" 2>/dev/null || true
fi
echo -e "${GREEN}  ✓ Virtual AP interface uap0 created${RESET}"

sudo ip addr add "${AP_IP}/24" dev "$WIFI_IF" 2>/dev/null || true
echo -e "${GREEN}  AP interface: ${WIFI_IF}${RESET}"

# Write hostapd config
sudo tee /etc/hostapd/hostapd-roadnet.conf >/dev/null <<HOSTAPD
interface=${WIFI_IF}
driver=nl80211
ssid=${SSID}
hw_mode=g
channel=${CHANNEL}
wmm_enabled=0
macaddr_acl=0
auth_algs=1
wpa=2
wpa_passphrase=${PASSWORD}
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
country_code=US
ieee80211n=1
ieee80211d=1
HOSTAPD
echo -e "${GREEN}  ✓ hostapd configured: SSID=${SSID} CH=${CHANNEL}${RESET}"

# Write dnsmasq drop-in for RoadNet (doesn't replace existing)
sudo tee /etc/dnsmasq.d/roadnet.conf >/dev/null <<DNSMASQ
# RoadNet DHCP for WiFi clients
interface=${WIFI_IF}
listen-address=${AP_IP}
bind-dynamic
dhcp-range=${DHCP_START},${DHCP_END},255.255.255.0,24h
dhcp-option=option:router,${AP_IP}
dhcp-option=option:dns-server,${AP_IP}
server=${PIHOLE_DNS}
DNSMASQ
echo -e "${GREEN}  ✓ dnsmasq configured: DHCP ${DHCP_START}-${DHCP_END}${RESET}"

# NAT / iptables
echo -e "${AMBER}[6/8] Setting up NAT routing...${RESET}"
sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null
if ! grep -q "net.ipv4.ip_forward=1" /etc/sysctl.conf 2>/dev/null; then
    echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf >/dev/null
fi

# Detect outbound interface — use wlan0 since that's our internet path
# (uap0 is the AP, wlan0 stays connected to home WiFi)
OUT_IF="wlan0"

# Add NAT rules (idempotent)
sudo iptables -t nat -C POSTROUTING -s "${SUBNET}.0/24" -o "$OUT_IF" -j MASQUERADE 2>/dev/null || \
    sudo iptables -t nat -A POSTROUTING -s "${SUBNET}.0/24" -o "$OUT_IF" -j MASQUERADE

# Also masquerade through WireGuard if available
if ip link show wg0 >/dev/null 2>&1; then
    sudo iptables -t nat -C POSTROUTING -s "${SUBNET}.0/24" -o wg0 -j MASQUERADE 2>/dev/null || \
        sudo iptables -t nat -A POSTROUTING -s "${SUBNET}.0/24" -o wg0 -j MASQUERADE
fi

# Allow forwarding
sudo iptables -C FORWARD -i "$WIFI_IF" -o "$OUT_IF" -j ACCEPT 2>/dev/null || \
    sudo iptables -A FORWARD -i "$WIFI_IF" -o "$OUT_IF" -j ACCEPT
sudo iptables -C FORWARD -i "$OUT_IF" -o "$WIFI_IF" -m state --state RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || \
    sudo iptables -A FORWARD -i "$OUT_IF" -o "$WIFI_IF" -m state --state RELATED,ESTABLISHED -j ACCEPT

echo -e "${GREEN}  ✓ NAT routing enabled (${WIFI_IF} → ${OUT_IF})${RESET}"

# Install failover service
echo -e "${AMBER}[7/8] Installing failover monitor...${RESET}"
sudo tee /usr/local/bin/roadnet-failover.sh >/dev/null <<'FAILOVER'
#!/bin/bash
# RoadNet Failover Monitor
# Checks connectivity and switches exit routes

SUBNET_PREFIX="10.10"
LOG="/var/log/roadnet-failover.log"
CURRENT_EXIT=""
OUT_IF="eth0"
ip link show eth0 >/dev/null 2>&1 || OUT_IF="end0"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG"; }

check_exit() {
    # Try primary (eth0 via home router)
    if ping -c 1 -W 2 -I "$OUT_IF" 1.1.1.1 >/dev/null 2>&1; then
        echo "eth0"
        return
    fi
    # Try WireGuard
    if ip link show wg0 >/dev/null 2>&1; then
        if ping -c 1 -W 2 -I wg0 1.1.1.1 >/dev/null 2>&1; then
            echo "wg0"
            return
        fi
    fi
    # Try Bluetooth PAN
    if ip link show bnep0 >/dev/null 2>&1; then
        echo "bnep0"
        return
    fi
    echo "none"
}

while true; do
    NEW_EXIT=$(check_exit)
    if [[ "$NEW_EXIT" != "$CURRENT_EXIT" ]]; then
        log "EXIT CHANGE: ${CURRENT_EXIT:-none} → ${NEW_EXIT}"
        CURRENT_EXIT="$NEW_EXIT"
        if [[ "$NEW_EXIT" == "wg0" ]]; then
            # Switch RoadNet traffic to WireGuard
            ip route replace default via 10.8.0.1 dev wg0 table 100 2>/dev/null
            log "Routing through WireGuard (10.8.0.1)"
        elif [[ "$NEW_EXIT" == "eth0" || "$NEW_EXIT" == "end0" ]]; then
            GW=$(ip route show default dev "$OUT_IF" 2>/dev/null | awk '{print $3}' | head -1)
            [[ -z "$GW" ]] && GW="192.168.4.1"
            ip route replace default via "$GW" dev "$OUT_IF" table 100 2>/dev/null
            log "Routing through ${OUT_IF} (${GW})"
        fi
    fi
    sleep 10
done
FAILOVER
sudo chmod +x /usr/local/bin/roadnet-failover.sh

sudo tee /etc/systemd/system/roadnet-failover.service >/dev/null <<'UNIT'
[Unit]
Description=RoadNet Failover Monitor
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/roadnet-failover.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable roadnet-failover.service
echo -e "${GREEN}  ✓ Failover monitor installed${RESET}"

# Bluetooth PAN (Aria only)
if $ENABLE_BT; then
    echo -e "${AMBER}[7b] Setting up Bluetooth PAN...${RESET}"
    sudo tee /usr/local/bin/roadnet-bluetooth.sh >/dev/null <<'BTPAN'
#!/bin/bash
# RoadNet Bluetooth PAN server
bluetoothctl discoverable on 2>/dev/null
bluetoothctl pairable on 2>/dev/null

# Create NAP bridge
sudo brctl addbr br-roadnet 2>/dev/null || true
sudo ip addr add 10.10.99.1/24 dev br-roadnet 2>/dev/null || true
sudo ip link set br-roadnet up

# Enable NAT for BT clients
sudo iptables -t nat -A POSTROUTING -s 10.10.99.0/24 -j MASQUERADE 2>/dev/null

# Start BT NAP
sudo bt-network -s nap br-roadnet 2>/dev/null &

echo "Bluetooth PAN active on br-roadnet (10.10.99.0/24)"
BTPAN
    sudo chmod +x /usr/local/bin/roadnet-bluetooth.sh
    echo -e "${GREEN}  ✓ Bluetooth PAN configured${RESET}"
fi

# Start everything
echo -e "${AMBER}[8/8] Starting RoadNet...${RESET}"

# Restart dnsmasq to pick up new config
sudo systemctl restart dnsmasq 2>/dev/null || sudo dnsmasq --conf-file=/etc/dnsmasq.d/roadnet.conf &

# Start hostapd
sudo hostapd -B /etc/hostapd/hostapd-roadnet.conf 2>/dev/null
HOSTAPD_PID=$?

# Start failover
sudo systemctl start roadnet-failover.service

# Start BT if enabled
if $ENABLE_BT; then
    sudo /usr/local/bin/roadnet-bluetooth.sh &
fi

# Policy routing: RoadNet traffic uses table 100
sudo ip rule add from "${SUBNET}.0/24" lookup 100 2>/dev/null || true
GW=$(ip route show default 2>/dev/null | awk '{print $3}' | head -1)
[[ -z "$GW" ]] && GW="192.168.4.1"
sudo ip route add default via "$GW" table 100 2>/dev/null || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  ROADNET NODE ${NODE_ID} — ONLINE${RESET}"
echo -e "${GREEN}  SSID: ${SSID} | Channel: ${CHANNEL}${RESET}"
echo -e "${GREEN}  AP IP: ${AP_IP} | DHCP: ${DHCP_START}-${DHCP_END}${RESET}"
echo -e "${GREEN}  DNS: ${PIHOLE_DNS} (Pi-hole)${RESET}"
echo -e "${GREEN}  NAT: ${WIFI_IF} → ${OUT_IF}${RESET}"
$ENABLE_BT && echo -e "${GREEN}  Bluetooth PAN: 10.10.99.0/24${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
