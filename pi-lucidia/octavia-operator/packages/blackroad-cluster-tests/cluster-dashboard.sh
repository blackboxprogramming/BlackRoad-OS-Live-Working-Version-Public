#!/usr/bin/env bash
# Terminal-based cluster health dashboard
# Shows latest test results in a compact view

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="${SCRIPT_DIR}/results"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m'

# Get latest results for each node
NODES=(lucidia alice aria octavia shellfish)

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     BlackRoad Cluster Dashboard                         ║${NC}"
echo -e "${BLUE}║                        $(date +'%Y-%m-%d %H:%M:%S')                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Table header
printf "%-12s %-6s %-8s %-8s %-8s %-8s %-8s %-6s %-6s %-4s %-8s\n" \
  "NODE" "OS" "STORAGE" "NETWORK" "TIME" "MQTT" "SYSTEMD" "HW" "ROLE" "UI" "AGENT"
echo "────────────────────────────────────────────────────────────────────────────────"

for node in "${NODES[@]}"; do
  # Find latest result file for this node
  latest_result=$(ls -t "${RESULTS_DIR}/${node}"_*.json 2>/dev/null | head -n 1)

  if [[ -z "$latest_result" ]]; then
    printf "%-12s ${GRAY}%s${NC}\n" "$node" "NO DATA"
    continue
  fi

  # Extract test results
  declare -A test_status
  test_status[os]="?"
  test_status[storage]="?"
  test_status[network]="?"
  test_status[time]="?"
  test_status[mqtt]="?"
  test_status[systemd]="?"
  test_status[hardware]="?"
  test_status[role]="?"
  test_status[ui]="?"
  test_status[agent]="?"

  # Parse JSON (requires jq)
  if command -v jq &>/dev/null; then
    while IFS='|' read -r test status; do
      test_status[$test]=$status
    done < <(jq -r '.tests[]? | "\(.test)|\(.status)"' "$latest_result" 2>/dev/null)
  fi

  # Format each status with color
  format_status() {
    case "$1" in
      PASS) echo -e "${GREEN}✓${NC}" ;;
      WARN) echo -e "${YELLOW}⚠${NC}" ;;
      FAIL) echo -e "${RED}✗${NC}" ;;
      ERROR) echo -e "${RED}E${NC}" ;;
      *) echo -e "${GRAY}?${NC}" ;;
    esac
  }

  printf "%-12s %-6s %-8s %-8s %-8s %-8s %-8s %-6s %-6s %-4s %-8s\n" \
    "$node" \
    "$(format_status "${test_status[os]}")" \
    "$(format_status "${test_status[storage]}")" \
    "$(format_status "${test_status[network]}")" \
    "$(format_status "${test_status[time]}")" \
    "$(format_status "${test_status[mqtt]}")" \
    "$(format_status "${test_status[systemd]}")" \
    "$(format_status "${test_status[hardware]}")" \
    "$(format_status "${test_status[role]}")" \
    "$(format_status "${test_status[ui]}")" \
    "$(format_status "${test_status[agent]}")"
done

echo ""
echo -e "${GRAY}Legend: ${GREEN}✓${GRAY} Pass | ${YELLOW}⚠${GRAY} Warning | ${RED}✗${GRAY} Fail | ${GRAY}?${GRAY} Unknown${NC}"
echo ""

# Show age of results
echo "Result Ages:"
for node in "${NODES[@]}"; do
  latest_result=$(ls -t "${RESULTS_DIR}/${node}"_*.json 2>/dev/null | head -n 1)
  if [[ -n "$latest_result" ]]; then
    timestamp=$(jq -r '.timestamp' "$latest_result" 2>/dev/null || echo "unknown")
    age=$(( $(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%S" "${timestamp%+*}" +%s 2>/dev/null || echo 0) ))
    if [[ $age -lt 300 ]]; then
      color=$GREEN
    elif [[ $age -lt 1800 ]]; then
      color=$YELLOW
    else
      color=$RED
    fi
    printf "  %-12s ${color}%s${NC}\n" "$node" "$(printf '%dm %ds ago' $((age/60)) $((age%60)))"
  fi
done

echo ""

# Cluster summary
total_tests=0
total_pass=0
total_warn=0
total_fail=0

for node in "${NODES[@]}"; do
  latest_result=$(ls -t "${RESULTS_DIR}/${node}"_*.json 2>/dev/null | head -n 1)
  if [[ -n "$latest_result" ]] && command -v jq &>/dev/null; then
    pass=$(jq '[.tests[]? | select(.status == "PASS")] | length' "$latest_result" 2>/dev/null || echo 0)
    warn=$(jq '[.tests[]? | select(.status == "WARN")] | length' "$latest_result" 2>/dev/null || echo 0)
    fail=$(jq '[.tests[]? | select(.status == "FAIL" or .status == "ERROR")] | length' "$latest_result" 2>/dev/null || echo 0)

    ((total_pass += pass))
    ((total_warn += warn))
    ((total_fail += fail))
    ((total_tests += pass + warn + fail))
  fi
done

echo "Cluster Summary:"
echo -e "  Total tests: $total_tests"
echo -e "  ${GREEN}Pass:${NC}  $total_pass"
echo -e "  ${YELLOW}Warn:${NC}  $total_warn"
echo -e "  ${RED}Fail:${NC}  $total_fail"
echo ""

# Overall health
if [[ $total_fail -gt 0 ]]; then
  echo -e "Overall Status: ${RED}CRITICAL${NC} ❌"
  exit 2
elif [[ $total_warn -gt 0 ]]; then
  echo -e "Overall Status: ${YELLOW}WARNING${NC} ⚠️"
  exit 1
else
  echo -e "Overall Status: ${GREEN}HEALTHY${NC} ✅"
  exit 0
fi
