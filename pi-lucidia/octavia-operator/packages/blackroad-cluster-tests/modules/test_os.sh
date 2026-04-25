#!/usr/bin/env bash
# Test Module: OS Health
# Validates boot status, kernel version, filesystem health

set -euo pipefail

# Output JSON result
output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"os\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

# Check if running in dry-run mode (passed via stdin context or env)
if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check OS health"
  exit 0
fi

# Collect system info
UPTIME=$(uptime -p 2>/dev/null || echo "unknown")
KERNEL=$(uname -r)
OS_PRETTY=$(grep PRETTY_NAME /etc/os-release 2>/dev/null | cut -d'"' -f2 || echo "unknown")
HOSTNAME=$(hostname)

# Check filesystem is read-write
FS_STATUS="rw"
if grep ' / ' /proc/mounts | grep -q ' ro[, ]'; then
  output_result "FAIL" "Root filesystem is read-only" "{\"uptime\": \"$UPTIME\", \"kernel\": \"$KERNEL\"}"
  exit 1
fi

# Check for recent fsck errors
FSCK_ERRORS=0
if [[ -f /var/log/fsck/checkfs ]]; then
  FSCK_ERRORS=$(grep -c "ERROR" /var/log/fsck/checkfs 2>/dev/null || echo 0)
fi

# Check boot device
BOOT_DEVICE="unknown"
ROOT_DEVICE=$(findmnt -n -o SOURCE / | sed 's/[0-9]*$//')
if echo "$ROOT_DEVICE" | grep -q "mmcblk"; then
  BOOT_DEVICE="SD Card"
elif echo "$ROOT_DEVICE" | grep -q "nvme"; then
  BOOT_DEVICE="NVMe"
fi

# Assemble details
DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "uptime": "$UPTIME",
  "kernel": "$KERNEL",
  "os": "$OS_PRETTY",
  "boot_device": "$BOOT_DEVICE",
  "root_device": "$ROOT_DEVICE",
  "fs_status": "$FS_STATUS",
  "fsck_errors": $FSCK_ERRORS
}
EOF
)

# Determine status
if [[ $FSCK_ERRORS -gt 0 ]]; then
  output_result "WARN" "fsck errors detected" "$DETAILS"
elif [[ "$BOOT_DEVICE" == "unknown" ]]; then
  output_result "WARN" "Cannot determine boot device type" "$DETAILS"
else
  output_result "PASS" "OS health nominal" "$DETAILS"
fi
