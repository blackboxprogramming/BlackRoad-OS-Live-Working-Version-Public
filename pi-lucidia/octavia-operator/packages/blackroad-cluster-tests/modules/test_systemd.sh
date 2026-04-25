#!/usr/bin/env bash
# Test Module: Systemd Services
# Validates BlackRoad services and targets

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"systemd\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check systemd services"
  exit 0
fi

HOSTNAME=$(hostname)

# Expected BlackRoad services
EXPECTED_SERVICES=(
  "blackroad-heartbeat.service"
  "blackroad-operator.service"
)

# Services that should be disabled after first run
ONETIME_SERVICES=(
  "blackroad-firstboot.service"
)

# Collect service states
declare -A SERVICE_STATUS
FAILED_SERVICES=()
MISSING_SERVICES=()
ACTIVE_SERVICES=()

for service in "${EXPECTED_SERVICES[@]}"; do
  if systemctl list-unit-files | grep -q "^${service}"; then
    if systemctl is-active --quiet "$service"; then
      SERVICE_STATUS[$service]="active"
      ACTIVE_SERVICES+=("$service")
    elif systemctl is-failed --quiet "$service"; then
      SERVICE_STATUS[$service]="failed"
      FAILED_SERVICES+=("$service")
    else
      SERVICE_STATUS[$service]="inactive"
    fi
  else
    SERVICE_STATUS[$service]="missing"
    MISSING_SERVICES+=("$service")
  fi
done

# Check one-time services are disabled
FIRSTBOOT_STATUS="not_found"
if systemctl list-unit-files | grep -q "^blackroad-firstboot.service"; then
  if systemctl is-enabled --quiet blackroad-firstboot.service 2>/dev/null; then
    FIRSTBOOT_STATUS="enabled_warn"
  else
    FIRSTBOOT_STATUS="disabled_ok"
  fi
fi

# Count all failed units on system
SYSTEM_FAILED_COUNT=$(systemctl --failed --no-pager --no-legend | wc -l)

# Build services JSON
SERVICES_JSON="["
FIRST=true
for service in "${EXPECTED_SERVICES[@]}"; do
  [[ "$FIRST" == "false" ]] && SERVICES_JSON+=","
  FIRST=false
  SERVICES_JSON+="{\"name\": \"$service\", \"status\": \"${SERVICE_STATUS[$service]}\"}"
done
SERVICES_JSON+="]"

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "services": $SERVICES_JSON,
  "firstboot_status": "$FIRSTBOOT_STATUS",
  "system_failed_count": $SYSTEM_FAILED_COUNT,
  "failed_services": [$(IFS=,; echo "${FAILED_SERVICES[*]}" | sed 's/\([^,]*\)/"\1"/g')],
  "missing_services": [$(IFS=,; echo "${MISSING_SERVICES[*]}" | sed 's/\([^,]*\)/"\1"/g')]
}
EOF
)

# Determine status
if [[ ${#FAILED_SERVICES[@]} -gt 0 ]]; then
  output_result "FAIL" "BlackRoad services failed: ${FAILED_SERVICES[*]}" "$DETAILS"
elif [[ ${#MISSING_SERVICES[@]} -gt 0 ]]; then
  output_result "FAIL" "BlackRoad services missing: ${MISSING_SERVICES[*]}" "$DETAILS"
elif [[ $SYSTEM_FAILED_COUNT -gt 0 ]]; then
  output_result "WARN" "System has $SYSTEM_FAILED_COUNT failed unit(s)" "$DETAILS"
elif [[ "$FIRSTBOOT_STATUS" == "enabled_warn" ]]; then
  output_result "WARN" "blackroad-firstboot still enabled" "$DETAILS"
else
  output_result "PASS" "Systemd services nominal" "$DETAILS"
fi
