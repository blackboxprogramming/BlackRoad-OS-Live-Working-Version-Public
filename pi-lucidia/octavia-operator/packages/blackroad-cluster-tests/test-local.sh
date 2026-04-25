#!/usr/bin/env bash
# Local test script - run test modules against localhost
# Useful for validating test module logic before SSH deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_MODULES_DIR="${SCRIPT_DIR}/modules"

echo "Running test modules locally..."
echo ""

for module in "${TEST_MODULES_DIR}"/test_*.sh; do
  module_name=$(basename "$module")
  echo -n "  ${module_name}... "

  # Run module and capture output
  result=$(bash "$module" 2>&1 | tail -n 1)

  # Parse status from JSON
  status=$(echo "$result" | jq -r '.status' 2>/dev/null || echo "ERROR")

  case "$status" in
    PASS)
      echo "✓ PASS"
      ;;
    WARN)
      echo "⚠ WARN"
      echo "    $(echo "$result" | jq -r '.message' 2>/dev/null)"
      ;;
    FAIL|ERROR)
      echo "✗ FAIL"
      echo "    $(echo "$result" | jq -r '.message' 2>/dev/null)"
      ;;
    *)
      echo "✗ INVALID OUTPUT"
      echo "    Raw: $result"
      ;;
  esac
done

echo ""
echo "Local test complete."
