#!/usr/bin/env bash
# Continuous cluster monitoring
# Runs tests in a loop and publishes alerts via MQTT

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERVAL=${1:-300}  # Default 5 minutes
MQTT_BROKER="octavia"
ALERT_TOPIC="blackroad/alerts/cluster-tests"

echo "Starting continuous cluster monitoring..."
echo "Interval: ${INTERVAL}s"
echo "Alert topic: ${ALERT_TOPIC}"
echo ""
echo "Press Ctrl+C to stop."
echo ""

iteration=1

while true; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Iteration #${iteration} - $(date)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Run tests in fast mode
  if "${SCRIPT_DIR}/run-tests.sh" --fast; then
    status="healthy"
    message="Cluster tests passed (iteration #${iteration})"
    echo "✅ Status: HEALTHY"
  else
    exit_code=$?
    if [ $exit_code -eq 1 ]; then
      status="warning"
      message="Cluster tests have warnings (iteration #${iteration})"
      echo "⚠️  Status: WARNINGS"
    else
      status="critical"
      message="Cluster tests FAILED (iteration #${iteration})"
      echo "❌ Status: CRITICAL"
    fi

    # Publish alert to MQTT
    if command -v mosquitto_pub &>/dev/null; then
      alert_json=$(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "iteration": $iteration,
  "status": "$status",
  "message": "$message",
  "exit_code": ${exit_code:-0}
}
EOF
)
      mosquitto_pub -h "$MQTT_BROKER" -t "$ALERT_TOPIC" -m "$alert_json" -r
      echo "📡 Alert published to MQTT"
    fi
  fi

  echo ""
  echo "Next test in ${INTERVAL}s..."
  echo ""

  ((iteration++))
  sleep "$INTERVAL"
done
