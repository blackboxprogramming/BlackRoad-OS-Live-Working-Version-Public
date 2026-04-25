#!/usr/bin/env bash
# Test Module: Network Connectivity
# Validates LAN, Tailscale, DNS, mDNS, inter-node communication

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"network\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check network connectivity"
  exit 0
fi

# Get IP addresses
LAN_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | head -n1)
TAILSCALE_IP=$(ip -4 addr show tailscale0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1 || echo "none")

# DNS resolution test
DNS_STATUS="pass"
if ! nslookup google.com &>/dev/null; then
  DNS_STATUS="fail"
fi

# mDNS test (check if .local resolution works)
MDNS_STATUS="pass"
HOSTNAME=$(hostname)
if ! getent hosts "${HOSTNAME}.local" &>/dev/null; then
  MDNS_STATUS="warn"
fi

# Test connectivity to known nodes (skip if fast mode)
INTER_NODE_STATUS="skipped"
TESTED_NODES=()
if [[ "${FAST_MODE:-false}" == "false" ]]; then
  INTER_NODE_STATUS="pass"
  for node in lucidia alice aria octavia shellfish; do
    if [[ "$node" != "$HOSTNAME" ]]; then
      if ping -c 1 -W 2 "$node" &>/dev/null; then
        TESTED_NODES+=("{\"node\": \"$node\", \"status\": \"reachable\"}")
      else
        TESTED_NODES+=("{\"node\": \"$node\", \"status\": \"unreachable\"}")
        INTER_NODE_STATUS="warn"
      fi
    fi
  done
fi

TESTED_NODES_JSON="[$(IFS=,; echo "${TESTED_NODES[*]}")]"

# Packet loss test to gateway (skip if fast mode)
PACKET_LOSS=0
if [[ "${FAST_MODE:-false}" == "false" ]]; then
  GATEWAY=$(ip route | grep default | awk '{print $3}' | head -n1)
  if [[ -n "$GATEWAY" ]]; then
    PACKET_LOSS=$(ping -c 10 -W 1 "$GATEWAY" 2>/dev/null | grep -oP '\d+(?=% packet loss)' || echo 0)
  fi
fi

DETAILS=$(cat <<EOF
{
  "lan_ip": "$LAN_IP",
  "tailscale_ip": "$TAILSCALE_IP",
  "dns_status": "$DNS_STATUS",
  "mdns_status": "$MDNS_STATUS",
  "inter_node_status": "$INTER_NODE_STATUS",
  "tested_nodes": $TESTED_NODES_JSON,
  "packet_loss": "$PACKET_LOSS%"
}
EOF
)

# Determine status
if [[ "$DNS_STATUS" == "fail" ]]; then
  output_result "FAIL" "DNS resolution failed" "$DETAILS"
elif [[ "$INTER_NODE_STATUS" == "fail" ]]; then
  output_result "FAIL" "Cannot reach other nodes" "$DETAILS"
elif [[ $PACKET_LOSS -gt 10 ]]; then
  output_result "WARN" "High packet loss (${PACKET_LOSS}%)" "$DETAILS"
elif [[ "$TAILSCALE_IP" == "none" ]]; then
  output_result "WARN" "Tailscale not configured" "$DETAILS"
elif [[ "$MDNS_STATUS" == "warn" ]]; then
  output_result "WARN" "mDNS resolution issue" "$DETAILS"
elif [[ "$INTER_NODE_STATUS" == "warn" ]]; then
  output_result "WARN" "Some nodes unreachable" "$DETAILS"
else
  output_result "PASS" "Network connectivity nominal" "$DETAILS"
fi
