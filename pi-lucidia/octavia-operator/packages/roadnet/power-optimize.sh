#!/bin/bash
# BlackRoad Fleet Power Optimizer
# Reduces power draw on Pi 5s with Hailo-8 accelerators
# Deployed to: Cecilia, Octavia, Lucidia (+ Alice as baseline)
# Usage: sudo ./power-optimize.sh [--apply]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

HOSTNAME=$(hostname)
DRY_RUN=true
[[ "$1" == "--apply" ]] && DRY_RUN=false

echo -e "${PINK}━━━ BlackRoad Power Optimizer ━━━${RESET}"
echo -e "Node: ${AMBER}${HOSTNAME}${RESET} | Mode: $(${DRY_RUN} && echo 'DRY RUN' || echo 'APPLYING')"
echo ""

# Detect platform
CONFIG="/boot/firmware/config.txt"
[[ ! -f "$CONFIG" ]] && CONFIG="/boot/config.txt"
[[ ! -f "$CONFIG" ]] && { echo -e "${RED}No config.txt found${RESET}"; exit 1; }

HAS_HAILO=false
[[ -e /dev/hailo0 ]] && HAS_HAILO=true

HAS_NVME=false
lsblk -d | grep -q nvme && HAS_NVME=true

# Current state
echo -e "${AMBER}Current State:${RESET}"
GOVERNOR=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor)
CUR_FREQ=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq)
MAX_FREQ=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq)
TEMP=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "?")
echo "  Governor: ${GOVERNOR} | Freq: $((CUR_FREQ/1000))MHz / $((MAX_FREQ/1000))MHz max"
echo "  Temp: $((TEMP/1000))°C | Hailo: ${HAS_HAILO} | NVMe: ${HAS_NVME}"

if command -v vcgencmd &>/dev/null; then
    VOLTS=$(vcgencmd measure_volts core 2>/dev/null || echo "unknown")
    THROTTLE=$(vcgencmd get_throttled 2>/dev/null || echo "unknown")
    GPU_MEM=$(vcgencmd get_mem gpu 2>/dev/null || echo "unknown")
    echo "  Voltage: ${VOLTS} | Throttle: ${THROTTLE} | GPU: ${GPU_MEM}"
fi
echo ""

CHANGES=0

# === FIX 1: CPU Governor → conservative (saves power, still responsive) ===
if [[ "$GOVERNOR" != "conservative" ]]; then
    echo -e "${GREEN}[1] CPU governor: ${GOVERNOR} → conservative${RESET}"
    echo "    (scales freq based on load, slower ramp-up = less power spikes)"
    if ! $DRY_RUN; then
        for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
            echo "conservative" > "$cpu"
        done
        # Make persistent
        if ! grep -q "cpufreq.default_governor=conservative" /boot/firmware/cmdline.txt 2>/dev/null && \
           ! grep -q "cpufreq.default_governor=conservative" /boot/cmdline.txt 2>/dev/null; then
            CMDLINE="/boot/firmware/cmdline.txt"
            [[ ! -f "$CMDLINE" ]] && CMDLINE="/boot/cmdline.txt"
            if [[ -f "$CMDLINE" ]]; then
                sed -i 's/$/ cpufreq.default_governor=conservative/' "$CMDLINE"
                echo "    Persisted in cmdline.txt"
            fi
        fi
    fi
    ((CHANGES++))
else
    echo "[1] CPU governor already conservative ✓"
fi

# === FIX 2: Remove overclock if present ===
if grep -q "^over_voltage=" "$CONFIG" || grep -q "^arm_freq=" "$CONFIG"; then
    OV=$(grep "^over_voltage=" "$CONFIG" | tail -1 | cut -d= -f2)
    AF=$(grep "^arm_freq=" "$CONFIG" | tail -1 | cut -d= -f2)
    echo -e "${GREEN}[2] Remove overclock: over_voltage=${OV:-none}, arm_freq=${AF:-none}${RESET}"
    echo "    (overclock + Hailo PCIe = guaranteed undervoltage)"
    if ! $DRY_RUN; then
        sed -i '/^over_voltage=/d' "$CONFIG"
        sed -i '/^arm_freq=/d' "$CONFIG"
        echo "    Removed from config.txt (reboot required)"
    fi
    ((CHANGES++))
else
    echo "[2] No overclock settings ✓"
fi

# === FIX 3: Reduce GPU memory (Hailo does AI, not GPU) ===
CURRENT_GPU=$(grep "^gpu_mem=" "$CONFIG" | tail -1 | cut -d= -f2)
CURRENT_GPU=${CURRENT_GPU:-76}  # default is 76MB on Pi 5
if [[ "$CURRENT_GPU" -gt 16 ]]; then
    echo -e "${GREEN}[3] GPU memory: ${CURRENT_GPU}MB → 16MB${RESET}"
    echo "    (headless servers don't need GPU RAM, Hailo handles AI inference)"
    if ! $DRY_RUN; then
        sed -i '/^gpu_mem=/d' "$CONFIG"
        # Add under [all] section
        if grep -q "^\[all\]" "$CONFIG"; then
            sed -i '/^\[all\]/a gpu_mem=16' "$CONFIG"
        else
            echo -e "\n[all]\ngpu_mem=16" >> "$CONFIG"
        fi
        echo "    Set in config.txt (reboot required)"
    fi
    ((CHANGES++))
else
    echo "[3] GPU memory already minimal (${CURRENT_GPU}MB) ✓"
fi

# === FIX 4: Disable HDMI if no display attached ===
HDMI_STATUS=$(cat /sys/class/drm/card1-HDMI-A-1/status 2>/dev/null || echo "unknown")
HDMI2_STATUS=$(cat /sys/class/drm/card1-HDMI-A-2/status 2>/dev/null || echo "unknown")
if [[ "$HDMI_STATUS" == "disconnected" && "$HDMI2_STATUS" == "disconnected" ]]; then
    echo -e "${GREEN}[4] Both HDMI ports disconnected — can save ~25mA each${RESET}"
    echo "    (add hdmi_blanking=1 to config.txt for power savings)"
    if ! $DRY_RUN; then
        if ! grep -q "^hdmi_blanking=" "$CONFIG"; then
            if grep -q "^\[all\]" "$CONFIG"; then
                sed -i '/^\[all\]/a hdmi_blanking=1' "$CONFIG"
            else
                echo -e "\n[all]\nhdmi_blanking=1" >> "$CONFIG"
            fi
            echo "    Added hdmi_blanking=1 (reboot required)"
        fi
    fi
    ((CHANGES++))
elif [[ "$HDMI_STATUS" == "connected" || "$HDMI2_STATUS" == "connected" ]]; then
    echo "[4] HDMI display connected — skipping blanking"
else
    echo "[4] HDMI status unknown — skipping"
fi

# === FIX 5: Set kernel power params for SD card longevity ===
SWAPPINESS=$(cat /proc/sys/vm/swappiness)
if [[ "$SWAPPINESS" -gt 10 ]]; then
    echo -e "${GREEN}[5] Swappiness: ${SWAPPINESS} → 10 (reduce SD writes)${RESET}"
    if ! $DRY_RUN; then
        sysctl -w vm.swappiness=10 >/dev/null
        sysctl -w vm.dirty_ratio=40 >/dev/null
        sysctl -w vm.dirty_background_ratio=5 >/dev/null
        sysctl -w vm.dirty_expire_centisecs=6000 >/dev/null
        # Persist
        cat > /etc/sysctl.d/99-blackroad-power.conf <<SYSCTL
# BlackRoad Power + SD longevity optimizations
vm.swappiness=10
vm.dirty_ratio=40
vm.dirty_background_ratio=5
vm.dirty_expire_centisecs=6000
vm.dirty_writeback_centisecs=3000
SYSCTL
        echo "    Persisted in /etc/sysctl.d/99-blackroad-power.conf"
    fi
    ((CHANGES++))
else
    echo "[5] Swappiness already low (${SWAPPINESS}) ✓"
fi

# === FIX 6: Disable unnecessary services eating power ===
DISABLE_LIST=""
# lightdm on headless servers
systemctl is-active lightdm &>/dev/null && DISABLE_LIST+="lightdm "
# cups if no printer
systemctl is-active cups &>/dev/null && DISABLE_LIST+="cups "
systemctl is-active cups-browsed &>/dev/null && DISABLE_LIST+="cups-browsed "
# rpcbind if no NFS clients
systemctl is-active rpcbind &>/dev/null && DISABLE_LIST+="rpcbind "
# nfs-blkmap if no NFS
systemctl is-active nfs-blkmap &>/dev/null && DISABLE_LIST+="nfs-blkmap "
# bluetooth if unused
if ! bluetoothctl devices 2>/dev/null | grep -q Device; then
    systemctl is-active bluetooth &>/dev/null && DISABLE_LIST+="bluetooth "
fi

if [[ -n "$DISABLE_LIST" ]]; then
    echo -e "${GREEN}[6] Disable unused services: ${DISABLE_LIST}${RESET}"
    echo "    (each idle service = ~5-50mA wasted)"
    if ! $DRY_RUN; then
        for svc in $DISABLE_LIST; do
            systemctl stop "$svc" 2>/dev/null || true
            systemctl disable "$svc" 2>/dev/null || true
            echo "    Stopped + disabled: $svc"
        done
    fi
    ((CHANGES++))
else
    echo "[6] No unnecessary services found ✓"
fi

# === FIX 7: WiFi power management ===
WIFI_PM=$(iwconfig wlan0 2>/dev/null | grep -o "Power Management:.*" || echo "unknown")
if echo "$WIFI_PM" | grep -q "off"; then
    echo -e "${GREEN}[7] Enable WiFi power management (saves ~40mA)${RESET}"
    if ! $DRY_RUN; then
        iwconfig wlan0 power on 2>/dev/null || true
        # Persist
        cat > /etc/NetworkManager/conf.d/wifi-powersave.conf 2>/dev/null <<WIFI || true
[connection]
wifi.powersave = 3
WIFI
        echo "    WiFi power save enabled"
    fi
    ((CHANGES++))
else
    echo "[7] WiFi power management already on ✓"
fi

# === FIX 8: CPU frequency cap for Hailo nodes ===
if $HAS_HAILO; then
    if [[ "$MAX_FREQ" -gt 2000000 ]]; then
        echo -e "${GREEN}[8] Cap CPU to 2.0GHz for Hailo nodes (PCIe shares power rail)${RESET}"
        echo "    (Hailo-8 draws ~2.5W on PCIe, CPU must yield headroom)"
        if ! $DRY_RUN; then
            for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq; do
                echo 2000000 > "$cpu"
            done
            # Persist via config.txt
            if ! grep -q "^arm_freq=2000" "$CONFIG"; then
                if grep -q "^\[all\]" "$CONFIG"; then
                    sed -i '/^\[all\]/a arm_freq=2000' "$CONFIG"
                else
                    echo -e "\n[all]\narm_freq=2000" >> "$CONFIG"
                fi
            fi
            echo "    CPU capped to 2.0GHz (immediate + config.txt)"
        fi
        ((CHANGES++))
    else
        echo "[8] CPU already capped for Hailo ✓"
    fi
else
    echo "[8] No Hailo — skipping CPU cap"
fi

echo ""
echo -e "${PINK}━━━ Summary ━━━${RESET}"
echo -e "Changes: ${CHANGES}"
if $DRY_RUN; then
    echo -e "${AMBER}Run with --apply to make changes${RESET}"
else
    echo -e "${GREEN}Applied! Some changes need reboot.${RESET}"
    # Show new state
    echo ""
    echo "New governor: $(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor)"
    echo "New max freq: $(($(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq)/1000))MHz"
    echo "Temp: $(($(cat /sys/class/thermal/thermal_zone0/temp)/1000))°C"
fi
