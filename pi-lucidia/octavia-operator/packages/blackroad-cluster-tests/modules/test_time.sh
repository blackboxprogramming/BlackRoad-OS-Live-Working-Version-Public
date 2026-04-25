#!/usr/bin/env bash
# Test Module: Time Synchronization
# Validates chrony tracking and time authority (octavia)

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"time\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check time synchronization"
  exit 0
fi

HOSTNAME=$(hostname)

# Check if chrony is running
CHRONY_RUNNING="false"
if systemctl is-active --quiet chronyd 2>/dev/null; then
  CHRONY_RUNNING="true"
fi

# Get chrony tracking info
CHRONY_TRACKING=""
NTP_SOURCE=""
OFFSET_MS=0
DRIFT_PPM=0

if [[ "$CHRONY_RUNNING" == "true" ]]; then
  CHRONY_TRACKING=$(chronyc tracking 2>/dev/null || echo "")
  if [[ -n "$CHRONY_TRACKING" ]]; then
    # Extract offset and drift
    OFFSET_MS=$(echo "$CHRONY_TRACKING" | grep "System time" | awk '{print $4}' | sed 's/seconds//' | awk '{printf "%.0f", $1 * 1000}')
    DRIFT_PPM=$(echo "$CHRONY_TRACKING" | grep "Frequency" | awk '{print $3}')
  fi

  # Get current NTP source
  NTP_SOURCE=$(chronyc sources 2>/dev/null | grep '^\*' | awk '{print $2}' || echo "none")
fi

# Check if octavia is the time source (for non-octavia nodes)
USING_OCTAVIA="n/a"
if [[ "$HOSTNAME" != "octavia" ]]; then
  if echo "$NTP_SOURCE" | grep -q "octavia"; then
    USING_OCTAVIA="yes"
  else
    USING_OCTAVIA="no"
  fi
fi

# Check if this IS octavia (should be time authority)
IS_TIME_AUTHORITY="false"
if [[ "$HOSTNAME" == "octavia" ]]; then
  IS_TIME_AUTHORITY="true"
fi

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "chrony_running": $CHRONY_RUNNING,
  "ntp_source": "$NTP_SOURCE",
  "using_octavia": "$USING_OCTAVIA",
  "is_time_authority": $IS_TIME_AUTHORITY,
  "offset_ms": $OFFSET_MS,
  "drift_ppm": "$DRIFT_PPM"
}
EOF
)

# Determine status
if [[ "$CHRONY_RUNNING" == "false" ]]; then
  output_result "FAIL" "chrony not running" "$DETAILS"
elif [[ "$NTP_SOURCE" == "none" ]]; then
  output_result "FAIL" "No NTP source configured" "$DETAILS"
elif [[ "$HOSTNAME" != "octavia" && "$USING_OCTAVIA" == "no" ]]; then
  output_result "WARN" "Not using octavia as time source" "$DETAILS"
elif [[ ${OFFSET_MS#-} -gt 50 ]]; then
  output_result "WARN" "Time offset exceeds 50ms (${OFFSET_MS}ms)" "$DETAILS"
else
  output_result "PASS" "Time synchronization nominal" "$DETAILS"
fi
