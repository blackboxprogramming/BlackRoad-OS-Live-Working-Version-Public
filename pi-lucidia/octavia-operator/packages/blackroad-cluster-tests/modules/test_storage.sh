#!/usr/bin/env bash
# Test Module: Storage Health
# NON-DESTRUCTIVE storage validation

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"storage\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check storage health"
  exit 0
fi

# Get all block devices
BLOCK_DEVICES=$(lsblk -J -o NAME,SIZE,TYPE,MOUNTPOINT 2>/dev/null | jq -c '.')

# Root filesystem usage
ROOT_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
ROOT_INODES=$(df -i / | awk 'NR==2 {print $5}' | sed 's/%//')

# Check SMART status if available
SMART_STATUS="not_available"
SMART_DEVICE=""
if command -v smartctl &>/dev/null; then
  # Try to find primary storage device
  PRIMARY_DEVICE=$(lsblk -ndo NAME,TYPE | awk '$2=="disk" {print "/dev/"$1; exit}')
  if [[ -n "$PRIMARY_DEVICE" ]]; then
    SMART_DEVICE="$PRIMARY_DEVICE"
    if sudo smartctl -H "$PRIMARY_DEVICE" &>/dev/null; then
      if sudo smartctl -H "$PRIMARY_DEVICE" | grep -q "PASSED"; then
        SMART_STATUS="healthy"
      else
        SMART_STATUS="degraded"
      fi
    fi
  fi
fi

# Skip slow SMART test in fast mode
if [[ "${FAST_MODE:-false}" == "true" ]]; then
  SMART_STATUS="skipped_fast_mode"
fi

DETAILS=$(cat <<EOF
{
  "root_disk_usage": "$ROOT_USAGE%",
  "root_inode_usage": "$ROOT_INODES%",
  "smart_status": "$SMART_STATUS",
  "smart_device": "$SMART_DEVICE",
  "block_devices": $BLOCK_DEVICES
}
EOF
)

# Determine status
if [[ $ROOT_USAGE -gt 90 ]]; then
  output_result "FAIL" "Root disk usage critical (${ROOT_USAGE}%)" "$DETAILS"
elif [[ $ROOT_USAGE -gt 80 ]]; then
  output_result "WARN" "Root disk usage high (${ROOT_USAGE}%)" "$DETAILS"
elif [[ $ROOT_INODES -gt 90 ]]; then
  output_result "FAIL" "Inode usage critical (${ROOT_INODES}%)" "$DETAILS"
elif [[ "$SMART_STATUS" == "degraded" ]]; then
  output_result "FAIL" "SMART health check failed" "$DETAILS"
elif [[ $ROOT_INODES -gt 80 ]]; then
  output_result "WARN" "Inode usage high (${ROOT_INODES}%)" "$DETAILS"
else
  output_result "PASS" "Storage health nominal" "$DETAILS"
fi
