#!/usr/bin/env bash
# Test Module: Role Correctness
# Validates node role matches expected configuration

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"role\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check role correctness"
  exit 0
fi

HOSTNAME=$(hostname)

# Check if node.yaml exists
NODE_CONFIG="/etc/blackroad/node.yaml"
CONFIG_EXISTS="false"
CONFIGURED_ROLE="unknown"
CONFIGURED_NODE_ID="unknown"

if [[ -f "$NODE_CONFIG" ]]; then
  CONFIG_EXISTS="true"

  # Parse YAML (simple grep-based parsing)
  CONFIGURED_ROLE=$(grep "^role:" "$NODE_CONFIG" 2>/dev/null | awk '{print $2}' | tr -d '"' || echo "unknown")
  CONFIGURED_NODE_ID=$(grep "^node_id:" "$NODE_CONFIG" 2>/dev/null | awk '{print $2}' | tr -d '"' || echo "unknown")
fi

# Expected roles based on hostname
declare -A EXPECTED_ROLES
EXPECTED_ROLES=(
  [lucidia]="codex"
  [alice]="display"
  [aria]="printer"
  [octavia]="authority"
  [shellfish]="cloud"
)

EXPECTED_ROLE="${EXPECTED_ROLES[$HOSTNAME]:-unknown}"

# Role alignment
ROLE_MATCHES="unknown"
if [[ "$EXPECTED_ROLE" != "unknown" && "$CONFIGURED_ROLE" != "unknown" ]]; then
  if [[ "$EXPECTED_ROLE" == "$CONFIGURED_ROLE" ]]; then
    ROLE_MATCHES="true"
  else
    ROLE_MATCHES="false"
  fi
fi

# Validate node_id matches hostname
NODE_ID_MATCHES="unknown"
if [[ "$CONFIGURED_NODE_ID" != "unknown" ]]; then
  if [[ "$CONFIGURED_NODE_ID" == "$HOSTNAME" ]]; then
    NODE_ID_MATCHES="true"
  else
    NODE_ID_MATCHES="false"
  fi
fi

# Check role-specific services
ROLE_SERVICES_OK="unknown"
ROLE_SERVICES_STATUS=""

case "$CONFIGURED_ROLE" in
  authority)
    # octavia should run mosquitto and chronyd
    if systemctl is-active --quiet mosquitto && systemctl is-active --quiet chronyd; then
      ROLE_SERVICES_OK="true"
      ROLE_SERVICES_STATUS="mosquitto,chronyd active"
    else
      ROLE_SERVICES_OK="false"
      ROLE_SERVICES_STATUS="mosquitto or chronyd inactive"
    fi
    ;;
  display)
    # alice should have kiosk or display service
    if systemctl is-active --quiet blackroad-kiosk 2>/dev/null; then
      ROLE_SERVICES_OK="true"
      ROLE_SERVICES_STATUS="kiosk active"
    else
      ROLE_SERVICES_OK="warn"
      ROLE_SERVICES_STATUS="kiosk not active"
    fi
    ;;
  printer)
    # aria should have CUPS
    if systemctl is-active --quiet cups 2>/dev/null; then
      ROLE_SERVICES_OK="true"
      ROLE_SERVICES_STATUS="cups active"
    else
      ROLE_SERVICES_OK="warn"
      ROLE_SERVICES_STATUS="cups not active"
    fi
    ;;
  *)
    ROLE_SERVICES_OK="n/a"
    ROLE_SERVICES_STATUS="no specific services required"
    ;;
esac

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "config_exists": $CONFIG_EXISTS,
  "configured_role": "$CONFIGURED_ROLE",
  "expected_role": "$EXPECTED_ROLE",
  "role_matches": "$ROLE_MATCHES",
  "configured_node_id": "$CONFIGURED_NODE_ID",
  "node_id_matches": "$NODE_ID_MATCHES",
  "role_services_ok": "$ROLE_SERVICES_OK",
  "role_services_status": "$ROLE_SERVICES_STATUS"
}
EOF
)

# Determine status
if [[ "$CONFIG_EXISTS" == "false" ]]; then
  output_result "FAIL" "Node config missing: $NODE_CONFIG" "$DETAILS"
elif [[ "$ROLE_MATCHES" == "false" ]]; then
  output_result "FAIL" "Role mismatch (expected: $EXPECTED_ROLE, got: $CONFIGURED_ROLE)" "$DETAILS"
elif [[ "$NODE_ID_MATCHES" == "false" ]]; then
  output_result "FAIL" "Node ID mismatch (expected: $HOSTNAME, got: $CONFIGURED_NODE_ID)" "$DETAILS"
elif [[ "$ROLE_SERVICES_OK" == "false" ]]; then
  output_result "FAIL" "Role-specific services not running: $ROLE_SERVICES_STATUS" "$DETAILS"
elif [[ "$ROLE_SERVICES_OK" == "warn" ]]; then
  output_result "WARN" "Role-specific services issue: $ROLE_SERVICES_STATUS" "$DETAILS"
else
  output_result "PASS" "Role configuration correct" "$DETAILS"
fi
