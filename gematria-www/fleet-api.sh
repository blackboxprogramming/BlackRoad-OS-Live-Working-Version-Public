#!/bin/bash
# Simple fleet status proxy — returns JSON with Pi status
# Called by Caddy via exec, or as a standalone script
NODES=("alice:10.8.0.6" "cecilia:10.8.0.3" "octavia:10.8.0.4" "lucidia:10.8.0.7")
echo "{"
echo "  \"nodes\": ["
first=true
for entry in "${NODES[@]}"; do
  name="${entry%%:*}"
  ip="${entry##*:}"
  status="offline"
  temp="?"
  ping -c 1 -W 1 "$ip" &>/dev/null && status="online"
  if [ "$status" = "online" ]; then
    temp=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no "$ip" "cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null" 2>/dev/null)
    [ -n "$temp" ] && temp=$((temp/1000)) || temp="?"
  fi
  [ "$first" = true ] && first=false || echo ","
  echo "    {\"name\":\"$name\",\"ip\":\"$ip\",\"status\":\"$status\",\"cpu_temp\":\"$temp\"}"
done
echo "  ]"
echo "}"
