#!/usr/bin/env bash
# Test Module: Agent / Operator Layer
# Validates blackroad-operator, heartbeat, emotional envelope

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"agent\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check agent/operator layer"
  exit 0
fi

HOSTNAME=$(hostname)

# Check operator service
OPERATOR_RUNNING="false"
OPERATOR_STATUS="unknown"
if systemctl is-active --quiet blackroad-operator 2>/dev/null; then
  OPERATOR_RUNNING="true"
  OPERATOR_STATUS="active"
elif systemctl is-failed --quiet blackroad-operator 2>/dev/null; then
  OPERATOR_STATUS="failed"
else
  OPERATOR_STATUS="inactive"
fi

# Check heartbeat service
HEARTBEAT_RUNNING="false"
HEARTBEAT_STATUS="unknown"
if systemctl is-active --quiet blackroad-heartbeat 2>/dev/null; then
  HEARTBEAT_RUNNING="true"
  HEARTBEAT_STATUS="active"
elif systemctl is-failed --quiet blackroad-heartbeat 2>/dev/null; then
  HEARTBEAT_STATUS="failed"
else
  HEARTBEAT_STATUS="inactive"
fi

# Check for recent MQTT heartbeat messages
MQTT_BROKER="octavia"
HEARTBEAT_TOPIC="blackroad/heartbeat/${HOSTNAME}"
RECENT_HEARTBEAT="unknown"
PHASE_VALUE="unknown"
EMOTIONAL_ENVELOPE="unknown"

if command -v mosquitto_sub &>/dev/null; then
  # Try to read retained heartbeat message
  HEARTBEAT_MSG=$(timeout 3 mosquitto_sub -h "$MQTT_BROKER" -t "$HEARTBEAT_TOPIC" -C 1 2>/dev/null || echo "")

  if [[ -n "$HEARTBEAT_MSG" ]]; then
    RECENT_HEARTBEAT="found"

    # Try to parse JSON for phase and emotional envelope
    if command -v jq &>/dev/null; then
      PHASE_VALUE=$(echo "$HEARTBEAT_MSG" | jq -r '.phase // "unknown"' 2>/dev/null || echo "unknown")
      EMOTIONAL_ENVELOPE=$(echo "$HEARTBEAT_MSG" | jq -r '.emotional_envelope // "unknown"' 2>/dev/null || echo "unknown")
    fi
  else
    RECENT_HEARTBEAT="not_found"
  fi
fi

# Validate phase cycling (0 → 01 → 1 → 10)
PHASE_VALID="unknown"
if [[ "$PHASE_VALUE" != "unknown" ]]; then
  case "$PHASE_VALUE" in
    0|01|1|10)
      PHASE_VALID="true"
      ;;
    *)
      PHASE_VALID="false"
      ;;
  esac
fi

# Check operator API endpoint (if it exposes one)
OPERATOR_API_REACHABLE="false"
OPERATOR_PORT=8000
if timeout 2 curl -sf "http://localhost:${OPERATOR_PORT}/health" &>/dev/null; then
  OPERATOR_API_REACHABLE="true"
fi

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "operator_running": $OPERATOR_RUNNING,
  "operator_status": "$OPERATOR_STATUS",
  "heartbeat_running": $HEARTBEAT_RUNNING,
  "heartbeat_status": "$HEARTBEAT_STATUS",
  "recent_heartbeat": "$RECENT_HEARTBEAT",
  "phase_value": "$PHASE_VALUE",
  "phase_valid": "$PHASE_VALID",
  "emotional_envelope": "$EMOTIONAL_ENVELOPE",
  "operator_api_reachable": $OPERATOR_API_REACHABLE
}
EOF
)

# Determine status
if [[ "$OPERATOR_STATUS" == "failed" ]]; then
  output_result "FAIL" "Operator service failed" "$DETAILS"
elif [[ "$HEARTBEAT_STATUS" == "failed" ]]; then
  output_result "FAIL" "Heartbeat service failed" "$DETAILS"
elif [[ "$OPERATOR_RUNNING" == "false" ]]; then
  output_result "WARN" "Operator service not running" "$DETAILS"
elif [[ "$HEARTBEAT_RUNNING" == "false" ]]; then
  output_result "WARN" "Heartbeat service not running" "$DETAILS"
elif [[ "$RECENT_HEARTBEAT" == "not_found" ]]; then
  output_result "WARN" "No recent heartbeat messages in MQTT" "$DETAILS"
elif [[ "$PHASE_VALID" == "false" ]]; then
  output_result "WARN" "Invalid phase value in heartbeat: $PHASE_VALUE" "$DETAILS"
elif [[ "$EMOTIONAL_ENVELOPE" == "unknown" ]]; then
  output_result "WARN" "Emotional envelope missing from heartbeat" "$DETAILS"
else
  output_result "PASS" "Agent/operator layer operational" "$DETAILS"
fi
