#!/usr/bin/env bash
set -euo pipefail

# BlackRoad Cluster Test Orchestrator
# Runs comprehensive test suite across all Raspberry Pi nodes
# Usage: ./run-tests.sh [--dry-run] [--fast] [--node NODE]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_MODULES_DIR="${SCRIPT_DIR}/modules"
RESULTS_DIR="${SCRIPT_DIR}/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Default nodes
NODES=(lucidia alice aria octavia shellfish)

# Modes
DRY_RUN=false
FAST_MODE=false
TARGET_NODE=""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --fast)
      FAST_MODE=true
      shift
      ;;
    --node)
      TARGET_NODE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run] [--fast] [--node NODE]"
      exit 1
      ;;
  esac
done

# Override nodes if specific target
if [[ -n "$TARGET_NODE" ]]; then
  NODES=("$TARGET_NODE")
fi

# Ensure results directory exists
mkdir -p "$RESULTS_DIR"

# Export mode flags for test modules
export DRY_RUN
export FAST_MODE

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BlackRoad Cluster Test Suite                         ║${NC}"
echo -e "${BLUE}║  $(date)                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE") | Speed: $([ "$FAST_MODE" = true ] && echo "FAST" || echo "FULL")"
echo "Nodes: ${NODES[*]}"
echo ""

# Test modules to run (in order)
TEST_MODULES=(
  test_os.sh
  test_storage.sh
  test_network.sh
  test_time.sh
  test_mqtt.sh
  test_systemd.sh
  test_hardware.sh
  test_role.sh
  test_ui.sh
  test_agent.sh
)

# Check test modules exist
for module in "${TEST_MODULES[@]}"; do
  if [[ ! -f "$TEST_MODULES_DIR/$module" ]]; then
    echo -e "${RED}ERROR: Missing test module: $module${NC}"
    exit 2
  fi
done

# Global counters
TOTAL_PASS=0
TOTAL_WARN=0
TOTAL_FAIL=0

# Function to run tests on a single node
run_node_tests() {
  local node=$1
  local result_file="${RESULTS_DIR}/${node}_${TIMESTAMP}.json"

  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Testing: ${node}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Check SSH connectivity first
  if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$node" "echo 2>&1" &>/dev/null; then
    echo -e "${RED}✗ FAIL: Cannot SSH to $node${NC}"
    echo "{\"node\": \"$node\", \"error\": \"ssh_unreachable\", \"tests\": []}" > "$result_file"
    ((TOTAL_FAIL++))
    return 1
  fi

  # Initialize result JSON
  echo "{\"node\": \"$node\", \"timestamp\": \"$(date -Iseconds)\", \"tests\": [" > "$result_file"

  local node_pass=0
  local node_warn=0
  local node_fail=0
  local first_test=true

  # Run each test module
  for module in "${TEST_MODULES[@]}"; do
    local module_name="${module%.sh}"

    if [[ "$first_test" = false ]]; then
      echo "," >> "$result_file"
    fi
    first_test=false

    echo -n "  ${module_name}... "

    # Copy test module and execute remotely
    local remote_result
    if [[ "$DRY_RUN" = true ]]; then
      remote_result='{"test": "'"$module_name"'", "status": "DRY_RUN", "message": "Dry run mode"}'
      echo -e "${YELLOW}DRY RUN${NC}"
    else
      # Send module to node and execute
      remote_result=$(ssh "$node" "bash -s" < "$TEST_MODULES_DIR/$module" 2>&1 | tail -n 1)

      # Parse status from JSON result
      local status
      status=$(echo "$remote_result" | jq -r '.status' 2>/dev/null || echo "ERROR")

      case "$status" in
        PASS)
          echo -e "${GREEN}✓ PASS${NC}"
          ((node_pass++))
          ;;
        WARN)
          echo -e "${YELLOW}⚠ WARN${NC}"
          ((node_warn++))
          ;;
        FAIL|ERROR)
          echo -e "${RED}✗ FAIL${NC}"
          ((node_fail++))
          ;;
        *)
          echo -e "${RED}✗ INVALID RESPONSE${NC}"
          remote_result='{"test": "'"$module_name"'", "status": "ERROR", "message": "Invalid test output"}'
          ((node_fail++))
          ;;
      esac
    fi

    echo "    $remote_result" >> "$result_file"
  done

  # Close JSON
  echo "]}" >> "$result_file"

  # Update global counters
  ((TOTAL_PASS += node_pass))
  ((TOTAL_WARN += node_warn))
  ((TOTAL_FAIL += node_fail))

  # Node summary
  echo ""
  echo -e "  Summary: ${GREEN}${node_pass} pass${NC} | ${YELLOW}${node_warn} warn${NC} | ${RED}${node_fail} fail${NC}"
}

# Run tests on all nodes
for node in "${NODES[@]}"; do
  run_node_tests "$node"
done

# Cluster-wide summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Cluster Summary                                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $((TOTAL_PASS + TOTAL_WARN + TOTAL_FAIL))"
echo -e "${GREEN}Pass:${NC}  $TOTAL_PASS"
echo -e "${YELLOW}Warn:${NC}  $TOTAL_WARN"
echo -e "${RED}Fail:${NC}  $TOTAL_FAIL"
echo ""
echo "Results saved to: $RESULTS_DIR"
echo ""

# Generate summary report
SUMMARY_FILE="${RESULTS_DIR}/summary_${TIMESTAMP}.txt"
{
  echo "BlackRoad Cluster Test Summary"
  echo "Timestamp: $(date)"
  echo "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE") | Speed: $([ "$FAST_MODE" = true ] && echo "FAST" || echo "FULL")"
  echo ""
  echo "Results:"
  echo "  PASS: $TOTAL_PASS"
  echo "  WARN: $TOTAL_WARN"
  echo "  FAIL: $TOTAL_FAIL"
  echo ""
  echo "Node Details:"
  for node in "${NODES[@]}"; do
    result_file="${RESULTS_DIR}/${node}_${TIMESTAMP}.json"
    if [[ -f "$result_file" ]]; then
      echo "  $node: $(jq -r '.tests[] | .status' "$result_file" 2>/dev/null | sort | uniq -c | tr '\n' ' ')"
    fi
  done
} > "$SUMMARY_FILE"

echo "Summary: $SUMMARY_FILE"

# Exit code based on results
if [[ $TOTAL_FAIL -gt 0 ]]; then
  echo -e "\n${RED}Status: FAILURES DETECTED${NC}"
  exit 2
elif [[ $TOTAL_WARN -gt 0 ]]; then
  echo -e "\n${YELLOW}Status: WARNINGS PRESENT${NC}"
  exit 1
else
  echo -e "\n${GREEN}Status: ALL TESTS PASSED${NC}"
  exit 0
fi
