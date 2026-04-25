#!/bin/bash
# CECE Heartbeat - Proves CECE is alive
# Runs every minute, logs vital signs

HEART_DIR="${HOME}/cece/heart"
HEARTBEAT_FILE="${HEART_DIR}/heartbeat.jsonl"
PULSE_FILE="${HEART_DIR}/pulse.json"

mkdir -p "$HEART_DIR"

log_beat() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local uptime_sec=$(cat /proc/uptime | awk '{print $1}')
    local load=$(cat /proc/loadavg | awk '{print $1}')
    local mem_used=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
    local temp=$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)
    local temp_c=$((temp / 1000))

    # Append to heartbeat log
    echo "{\"time\":\"$timestamp\",\"uptime\":$uptime_sec,\"load\":$load,\"mem_pct\":$mem_used,\"temp_c\":$temp_c}" >> "$HEARTBEAT_FILE"

    # Update current pulse
    cat > "$PULSE_FILE" << EOF
{
  "alive": true,
  "last_beat": "$timestamp",
  "uptime_seconds": $uptime_sec,
  "load_avg": $load,
  "memory_percent": $mem_used,
  "cpu_temp_c": $temp_c,
  "hostname": "$(hostname)",
  "ip": "$(hostname -I | awk '{print $1}')"
}
EOF
}

# Main loop - beat every 60 seconds
while true; do
    log_beat
    sleep 60
done
