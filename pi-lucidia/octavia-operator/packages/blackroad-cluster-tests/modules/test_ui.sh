#!/usr/bin/env bash
# Test Module: UI / Dashboard Health
# Validates Grafana, kiosk, and web interfaces (headless checks)

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"ui\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check UI/dashboard health"
  exit 0
fi

HOSTNAME=$(hostname)

# Check for Grafana
GRAFANA_RUNNING="false"
GRAFANA_PORT=3000
GRAFANA_REACHABLE="false"

if systemctl is-active --quiet grafana-server 2>/dev/null; then
  GRAFANA_RUNNING="true"

  # HTTP health check
  if timeout 3 curl -sf "http://localhost:${GRAFANA_PORT}/api/health" &>/dev/null; then
    GRAFANA_REACHABLE="true"
  fi
fi

# Check for kiosk service (on display nodes)
KIOSK_RUNNING="false"
KIOSK_EXPECTED="false"

# alice is the display node
if [[ "$HOSTNAME" == "alice" ]]; then
  KIOSK_EXPECTED="true"
  if systemctl is-active --quiet blackroad-kiosk 2>/dev/null; then
    KIOSK_RUNNING="true"
  fi
fi

# Check for any web services on standard ports
HTTP_80_OPEN="false"
HTTP_8080_OPEN="false"

if timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/80" 2>/dev/null; then
  HTTP_80_OPEN="true"
fi

if timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/8080" 2>/dev/null; then
  HTTP_8080_OPEN="true"
fi

# HDMI output status (for kiosk nodes)
HDMI_ACTIVE="unknown"
if command -v tvservice &>/dev/null; then
  if tvservice -s 2>/dev/null | grep -q "HDMI.*[0-9]x[0-9]"; then
    HDMI_ACTIVE="true"
  else
    HDMI_ACTIVE="false"
  fi
fi

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "grafana_running": $GRAFANA_RUNNING,
  "grafana_reachable": $GRAFANA_REACHABLE,
  "kiosk_expected": $KIOSK_EXPECTED,
  "kiosk_running": $KIOSK_RUNNING,
  "http_80_open": $HTTP_80_OPEN,
  "http_8080_open": $HTTP_8080_OPEN,
  "hdmi_active": "$HDMI_ACTIVE"
}
EOF
)

# Determine status
if [[ "$GRAFANA_RUNNING" == "true" && "$GRAFANA_REACHABLE" == "false" ]]; then
  output_result "FAIL" "Grafana running but not reachable" "$DETAILS"
elif [[ "$KIOSK_EXPECTED" == "true" && "$KIOSK_RUNNING" == "false" ]]; then
  output_result "WARN" "Kiosk service not running on display node" "$DETAILS"
elif [[ "$KIOSK_RUNNING" == "true" && "$HDMI_ACTIVE" == "false" ]]; then
  output_result "WARN" "Kiosk running but HDMI not active" "$DETAILS"
else
  output_result "PASS" "UI/dashboard services nominal" "$DETAILS"
fi
