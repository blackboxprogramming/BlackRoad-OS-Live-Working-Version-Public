#!/bin/bash
# BlackRoad Power Monitor — runs via cron on each Pi
# Logs thermal/voltage events and alerts via stats-push
# Usage: */5 * * * * /opt/blackroad/power-monitor.sh

LOGFILE="/var/log/blackroad-power.log"
HOSTNAME=$(hostname)
TEMP=$(($(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0) / 1000))
FREQ=$(($(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq 2>/dev/null || echo 0) / 1000))
GOV=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null || echo "?")

# Voltage check (Pi 5 only)
VOLTS="n/a"
THROTTLE="0x0"
if command -v vcgencmd &>/dev/null; then
    VOLTS=$(vcgencmd measure_volts core 2>/dev/null | cut -d= -f2 || echo "n/a")
    THROTTLE=$(vcgencmd get_throttled 2>/dev/null | cut -d= -f2 || echo "n/a")
fi

# SD card health
IOWAIT=$(iostat -c 1 1 2>/dev/null | awk 'NR==4{print $4}' || echo "0")

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LINE="${TIMESTAMP} | ${HOSTNAME} | ${TEMP}°C | ${FREQ}MHz | ${GOV} | ${VOLTS} | thr:${THROTTLE} | iow:${IOWAIT}%"

echo "$LINE" >> "$LOGFILE"

# Alert thresholds
ALERT=""
[[ "$TEMP" -gt 70 ]] && ALERT+="TEMP_HIGH:${TEMP}C "
[[ "$THROTTLE" != "0x0" && "$THROTTLE" != "n/a" ]] && ALERT+="THROTTLED:${THROTTLE} "

# Check if voltage is below 0.82V (danger zone)
if [[ "$VOLTS" != "n/a" ]]; then
    V_INT=$(echo "$VOLTS" | tr -d 'V' | awk '{printf "%d", $1*10000}')
    [[ "$V_INT" -lt 8200 ]] && ALERT+="LOW_VOLTAGE:${VOLTS} "
fi

if [[ -n "$ALERT" ]]; then
    echo "${TIMESTAMP} ALERT: ${ALERT}" >> "$LOGFILE"
    # Could push to stats endpoint here
fi

# Rotate log at 1MB
LOGSIZE=$(stat -c %s "$LOGFILE" 2>/dev/null || stat -f %z "$LOGFILE" 2>/dev/null || echo 0)
[[ "$LOGSIZE" -gt 1048576 ]] && tail -500 "$LOGFILE" > "$LOGFILE.tmp" && mv "$LOGFILE.tmp" "$LOGFILE"
