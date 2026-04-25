#!/usr/bin/env bash
# Test Module: MQTT Fabric
# Validates broker connectivity, pub/sub roundtrip

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"mqtt\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check MQTT fabric"
  exit 0
fi

HOSTNAME=$(hostname)
MQTT_BROKER="octavia"
MQTT_PORT=1883

# Check if mosquitto clients are installed
if ! command -v mosquitto_pub &>/dev/null || ! command -v mosquitto_sub &>/dev/null; then
  output_result "WARN" "mosquitto clients not installed" "{\"hostname\": \"$HOSTNAME\"}"
  exit 0
fi

# Check if this IS the broker (octavia)
BROKER_RUNNING="false"
if [[ "$HOSTNAME" == "octavia" ]]; then
  if systemctl is-active --quiet mosquitto 2>/dev/null; then
    BROKER_RUNNING="true"
  fi
fi

# Test connectivity to broker
BROKER_REACHABLE="false"
if timeout 3 bash -c "cat < /dev/null > /dev/tcp/${MQTT_BROKER}/${MQTT_PORT}" 2>/dev/null; then
  BROKER_REACHABLE="true"
fi

# Pub/sub roundtrip test
PUBSUB_STATUS="not_tested"
PUBSUB_MESSAGE=""
TEST_TOPIC="blackroad/test/$(hostname)/$$"
TEST_PAYLOAD="test_$(date +%s)"

if [[ "$BROKER_REACHABLE" == "true" ]]; then
  # Start subscriber in background
  RECEIVED_MESSAGE=$(timeout 5 mosquitto_sub -h "$MQTT_BROKER" -t "$TEST_TOPIC" -C 1 2>/dev/null &
    sleep 0.5
    mosquitto_pub -h "$MQTT_BROKER" -t "$TEST_TOPIC" -m "$TEST_PAYLOAD" 2>/dev/null
    wait
  ) || RECEIVED_MESSAGE=""

  if [[ "$RECEIVED_MESSAGE" == "$TEST_PAYLOAD" ]]; then
    PUBSUB_STATUS="pass"
    PUBSUB_MESSAGE="Roundtrip successful"
  else
    PUBSUB_STATUS="fail"
    PUBSUB_MESSAGE="Roundtrip failed (expected: $TEST_PAYLOAD, got: $RECEIVED_MESSAGE)"
  fi
fi

# Test retained messages
RETAINED_STATUS="not_tested"
if [[ "$PUBSUB_STATUS" == "pass" ]]; then
  RETAINED_TOPIC="blackroad/test/retained/$(hostname)"
  RETAINED_PAYLOAD="retained_$(date +%s)"

  # Publish retained message
  mosquitto_pub -h "$MQTT_BROKER" -t "$RETAINED_TOPIC" -m "$RETAINED_PAYLOAD" -r 2>/dev/null

  # Subscribe and check if we get the retained message immediately
  RETAINED_RECEIVED=$(timeout 2 mosquitto_sub -h "$MQTT_BROKER" -t "$RETAINED_TOPIC" -C 1 2>/dev/null || echo "")

  if [[ "$RETAINED_RECEIVED" == "$RETAINED_PAYLOAD" ]]; then
    RETAINED_STATUS="pass"
  else
    RETAINED_STATUS="fail"
  fi

  # Clean up retained message
  mosquitto_pub -h "$MQTT_BROKER" -t "$RETAINED_TOPIC" -n -r 2>/dev/null
fi

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "broker": "$MQTT_BROKER",
  "broker_running": $BROKER_RUNNING,
  "broker_reachable": $BROKER_REACHABLE,
  "pubsub_status": "$PUBSUB_STATUS",
  "pubsub_message": "$PUBSUB_MESSAGE",
  "retained_status": "$RETAINED_STATUS"
}
EOF
)

# Determine status
if [[ "$HOSTNAME" == "octavia" && "$BROKER_RUNNING" == "false" ]]; then
  output_result "FAIL" "MQTT broker not running on octavia" "$DETAILS"
elif [[ "$BROKER_REACHABLE" == "false" ]]; then
  output_result "FAIL" "Cannot reach MQTT broker" "$DETAILS"
elif [[ "$PUBSUB_STATUS" == "fail" ]]; then
  output_result "FAIL" "MQTT pub/sub roundtrip failed" "$DETAILS"
elif [[ "$RETAINED_STATUS" == "fail" ]]; then
  output_result "WARN" "MQTT retained messages not working" "$DETAILS"
else
  output_result "PASS" "MQTT fabric operational" "$DETAILS"
fi
