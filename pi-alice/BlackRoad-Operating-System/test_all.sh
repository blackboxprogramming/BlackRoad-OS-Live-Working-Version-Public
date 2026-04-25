#!/usr/bin/env bash
#
# test_all.sh - BlackRoad Operating System Test Orchestrator
#
# This script runs all test suites across the monorepo in a coordinated fashion.
# It supports both strict mode (fail-fast) and best-effort mode (run all, report summary).
#
# Usage:
#   ./test_all.sh              # Best-effort mode (run all suites, report at end)
#   ./test_all.sh --strict     # Strict mode (fail on first error)
#   ./test_all.sh --suite backend  # Run specific suite only
#   ./test_all.sh --help       # Show usage
#
# Available suites: backend, agents, operator, sdk-python, sdk-typescript, frontend
#

set -uo pipefail

###############################################################################
# CONFIGURATION
###############################################################################

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

STRICT_MODE=false
SPECIFIC_SUITE=""
VERBOSE=false

# Color codes for pretty output
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' RESET=''
fi

# Results tracking
declare -A SUITE_RESULTS
declare -A SUITE_TIMES
SUITES_RAN=0
SUITES_PASSED=0
SUITES_FAILED=0
SUITES_SKIPPED=0

###############################################################################
# HELPERS
###############################################################################

have() {
  command -v "$1" >/dev/null 2>&1
}

log_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${BOLD}$1${RESET}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

log_suite() {
  echo ""
  echo -e "${BLUE}▶ $1${RESET}"
}

log_info() {
  echo -e "  ${CYAN}ℹ${RESET} $1"
}

log_success() {
  echo -e "  ${GREEN}✓${RESET} $1"
}

log_warning() {
  echo -e "  ${YELLOW}⚠${RESET} $1"
}

log_error() {
  echo -e "  ${RED}✗${RESET} $1"
}

log_skip() {
  echo -e "  ${YELLOW}⊘${RESET} $1"
}

record_result() {
  local suite=$1
  local result=$2  # PASS, FAIL, SKIP
  local duration=$3

  SUITE_RESULTS[$suite]=$result
  SUITE_TIMES[$suite]=$duration
  ((SUITES_RAN++))

  case $result in
    PASS) ((SUITES_PASSED++)) ;;
    FAIL) ((SUITES_FAILED++)) ;;
    SKIP) ((SUITES_SKIPPED++)) ;;
  esac

  if [[ "$result" == "FAIL" && "$STRICT_MODE" == "true" ]]; then
    log_error "Strict mode enabled - aborting on first failure"
    print_summary
    exit 1
  fi
}

print_summary() {
  echo ""
  log_header "TEST SUMMARY"
  echo ""

  # Summary table
  printf "${BOLD}%-25s %-10s %-15s${RESET}\n" "Suite" "Result" "Duration"
  echo "─────────────────────────────────────────────────────────"

  for suite in backend agents operator sdk-python sdk-typescript frontend; do
    if [[ -n "${SUITE_RESULTS[$suite]:-}" ]]; then
      result="${SUITE_RESULTS[$suite]}"
      duration="${SUITE_TIMES[$suite]}"

      case $result in
        PASS)
          printf "${GREEN}%-25s %-10s %-15s${RESET}\n" "$suite" "✓ PASS" "$duration"
          ;;
        FAIL)
          printf "${RED}%-25s %-10s %-15s${RESET}\n" "$suite" "✗ FAIL" "$duration"
          ;;
        SKIP)
          printf "${YELLOW}%-25s %-10s %-15s${RESET}\n" "$suite" "⊘ SKIP" "$duration"
          ;;
      esac
    fi
  done

  echo "─────────────────────────────────────────────────────────"
  echo ""
  echo -e "${BOLD}Total:${RESET} $SUITES_RAN suites | ${GREEN}$SUITES_PASSED passed${RESET} | ${RED}$SUITES_FAILED failed${RESET} | ${YELLOW}$SUITES_SKIPPED skipped${RESET}"
  echo ""

  if [[ $SUITES_FAILED -gt 0 ]]; then
    echo -e "${RED}${BOLD}❌ TESTS FAILED${RESET}"
    return 1
  else
    echo -e "${GREEN}${BOLD}✅ ALL TESTS PASSED${RESET}"
    return 0
  fi
}

###############################################################################
# TEST SUITE FUNCTIONS
###############################################################################

run_backend_tests() {
  log_suite "Backend (FastAPI + pytest)"

  local start_time=$(date +%s)

  if [[ ! -d "$ROOT/backend" ]]; then
    log_skip "backend/ directory not found"
    record_result "backend" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT/backend"

  # Detect Python
  local PY=python3
  if ! have python3; then
    if have python; then
      PY=python
    else
      log_error "Python not found"
      record_result "backend" "FAIL" "0s"
      return 1
    fi
  fi

  log_info "Using Python: $($PY --version 2>&1)"

  # Setup virtual environment for isolation
  local VENV_DIR=".venv-tests"
  if [[ ! -d "$VENV_DIR" ]]; then
    log_info "Creating test virtual environment..."
    $PY -m venv "$VENV_DIR" >/dev/null 2>&1
  fi

  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"

  # Install dependencies
  log_info "Installing dependencies..."
  pip install --upgrade pip >/dev/null 2>&1
  if [[ -f requirements.txt ]]; then
    pip install -r requirements.txt >/dev/null 2>&1
  fi

  # Run pytest
  if have pytest && [[ -f pytest.ini || -d tests ]]; then
    log_info "Running pytest..."

    # Export test environment variables
    # Unset potentially conflicting variables and set proper test values
    unset DATABASE_URL DATABASE_ASYNC_URL
    export TEST_DATABASE_URL="${TEST_DATABASE_URL:-sqlite+aiosqlite:///./test.db}"
    export DATABASE_URL="sqlite:///./test.db"
    export DATABASE_ASYNC_URL="sqlite+aiosqlite:///./test.db"
    export ENVIRONMENT="testing"
    export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8000"
    export SECRET_KEY="test-secret-key-for-local-tests"
    export WALLET_MASTER_KEY="test-wallet-master-key-32chars-000"

    if [[ "$VERBOSE" == "true" ]]; then
      pytest -v --maxfail=1
    else
      pytest -q --maxfail=1
    fi

    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
      log_success "Backend tests passed"
      record_result "backend" "PASS" "${duration}s"
    else
      log_error "Backend tests failed (exit code: $exit_code)"
      record_result "backend" "FAIL" "${duration}s"
      return 1
    fi
  else
    log_skip "pytest not available or no tests found"
    record_result "backend" "SKIP" "0s"
  fi

  deactivate 2>/dev/null || true
  cd "$ROOT"
}

run_agents_tests() {
  log_suite "Agents (200+ AI agent ecosystem)"

  local start_time=$(date +%s)

  if [[ ! -d "$ROOT/agents/tests" ]]; then
    log_skip "agents/tests/ directory not found"
    record_result "agents" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT"

  local PY=python3
  if ! have python3; then
    PY=python
  fi

  # Install agents dependencies
  if [[ -f agents/requirements.txt ]]; then
    log_info "Installing agent dependencies..."
    $PY -m pip install -r agents/requirements.txt >/dev/null 2>&1
  fi

  # Ensure pytest-asyncio is installed for async tests
  $PY -m pip install pytest-asyncio >/dev/null 2>&1

  if have pytest; then
    log_info "Running agent tests..."

    if [[ "$VERBOSE" == "true" ]]; then
      pytest agents/tests/ -v
    else
      pytest agents/tests/ -q
    fi

    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
      log_success "Agent tests passed"
      record_result "agents" "PASS" "${duration}s"
    else
      log_error "Agent tests failed"
      record_result "agents" "FAIL" "${duration}s"
      return 1
    fi
  else
    log_skip "pytest not available"
    record_result "agents" "SKIP" "0s"
  fi

  cd "$ROOT"
}

run_operator_tests() {
  log_suite "Operator Engine (GitHub automation)"

  local start_time=$(date +%s)

  if [[ ! -d "$ROOT/operator_engine" ]]; then
    log_skip "operator_engine/ directory not found"
    record_result "operator" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT/operator_engine"

  local PY=python3
  if ! have python3; then
    PY=python
  fi

  # Install dependencies if requirements.txt exists
  if [[ -f requirements.txt ]]; then
    log_info "Installing operator dependencies..."
    $PY -m pip install -r requirements.txt >/dev/null 2>&1
  fi

  # Ensure pytest-asyncio is installed for async tests
  $PY -m pip install pytest-asyncio >/dev/null 2>&1

  if have pytest && [[ -d tests ]]; then
    log_info "Running operator tests..."

    if [[ "$VERBOSE" == "true" ]]; then
      pytest tests/ -v
    else
      pytest tests/ -q
    fi

    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
      log_success "Operator tests passed"
      record_result "operator" "PASS" "${duration}s"
    else
      log_error "Operator tests failed"
      record_result "operator" "FAIL" "${duration}s"
      return 1
    fi
  else
    log_skip "pytest not available or no tests found"
    record_result "operator" "SKIP" "0s"
  fi

  cd "$ROOT"
}

run_sdk_python_tests() {
  log_suite "SDK: Python (Official Python SDK)"

  local start_time=$(date +%s)

  if [[ ! -d "$ROOT/sdk/python" ]]; then
    log_skip "sdk/python/ directory not found"
    record_result "sdk-python" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT/sdk/python"

  local PY=python3
  if ! have python3; then
    PY=python
  fi

  log_info "Installing SDK in editable mode..."
  $PY -m pip install -e .[dev] >/dev/null 2>&1

  if have pytest; then
    log_info "Running Python SDK tests..."

    if [[ "$VERBOSE" == "true" ]]; then
      pytest -v
    else
      pytest -q
    fi

    local exit_code=$?
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
      log_success "Python SDK tests passed"
      record_result "sdk-python" "PASS" "${duration}s"
    else
      log_error "Python SDK tests failed"
      record_result "sdk-python" "FAIL" "${duration}s"
      return 1
    fi
  else
    log_skip "pytest not available"
    record_result "sdk-python" "SKIP" "0s"
  fi

  cd "$ROOT"
}

run_sdk_typescript_tests() {
  log_suite "SDK: TypeScript (Official TypeScript/JavaScript SDK)"

  local start_time=$(date +%s)

  if [[ ! -d "$ROOT/sdk/typescript" ]]; then
    log_skip "sdk/typescript/ directory not found"
    record_result "sdk-typescript" "SKIP" "0s"
    return 0
  fi

  if ! have node; then
    log_skip "Node.js not installed"
    record_result "sdk-typescript" "SKIP" "0s"
    return 0
  fi

  cd "$ROOT/sdk/typescript"

  log_info "Using Node: $(node --version)"

  # Install dependencies
  if [[ -f package.json ]]; then
    log_info "Installing npm dependencies..."
    npm install >/dev/null 2>&1
  fi

  # Check if test script exists in package.json
  if [[ -f package.json ]] && grep -q '"test"' package.json; then
    log_info "Running TypeScript SDK tests (Jest)..."

    if [[ "$VERBOSE" == "true" ]]; then
      npm test
    else
      npm test -- --silent 2>&1 | grep -E "(PASS|FAIL|Test Suites)" || true
    fi

    local exit_code=${PIPESTATUS[0]}
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [[ $exit_code -eq 0 ]]; then
      log_success "TypeScript SDK tests passed"
      record_result "sdk-typescript" "PASS" "${duration}s"
    else
      log_error "TypeScript SDK tests failed"
      record_result "sdk-typescript" "FAIL" "${duration}s"
      return 1
    fi
  else
    log_skip "No test script found in package.json"
    record_result "sdk-typescript" "SKIP" "0s"
  fi

  cd "$ROOT"
}

run_frontend_tests() {
  log_suite "Frontend (Vanilla JavaScript validation)"

  local start_time=$(date +%s)

  # Note: Frontend currently has CI validation only (no unit tests)
  # This suite validates that the frontend files are present and valid

  if [[ ! -d "$ROOT/backend/static" ]]; then
    log_skip "backend/static/ directory not found"
    record_result "frontend" "SKIP" "0s"
    return 0
  fi

  log_info "Validating frontend structure..."

  local errors=0

  # Check for essential files
  if [[ ! -f "$ROOT/backend/static/index.html" ]]; then
    log_error "Missing: backend/static/index.html"
    ((errors++))
  else
    log_success "Found: index.html"
  fi

  if [[ ! -d "$ROOT/backend/static/js" ]]; then
    log_error "Missing: backend/static/js/ directory"
    ((errors++))
  else
    log_success "Found: js/ directory"
  fi

  # Basic JavaScript syntax check (if node is available)
  if have node && [[ -d "$ROOT/backend/static/js" ]]; then
    log_info "Running JavaScript syntax validation..."

    local js_errors=0
    while IFS= read -r -d '' file; do
      if ! node --check "$file" 2>/dev/null; then
        log_error "Syntax error in: $file"
        ((js_errors++))
      fi
    done < <(find "$ROOT/backend/static/js" -name "*.js" -print0)

    if [[ $js_errors -eq 0 ]]; then
      log_success "JavaScript syntax validation passed"
    else
      log_error "JavaScript syntax validation failed ($js_errors files)"
      ((errors++))
    fi
  fi

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  if [[ $errors -eq 0 ]]; then
    log_success "Frontend validation passed"
    record_result "frontend" "PASS" "${duration}s"
  else
    log_error "Frontend validation failed ($errors errors)"
    record_result "frontend" "FAIL" "${duration}s"
    return 1
  fi
}

###############################################################################
# COMMAND-LINE PARSING
###############################################################################

show_help() {
  cat << EOF
${BOLD}BlackRoad Operating System - Test Orchestrator${RESET}

${BOLD}USAGE:${RESET}
  ./test_all.sh [OPTIONS]

${BOLD}OPTIONS:${RESET}
  --strict              Fail on first test suite failure (default: best-effort)
  --suite <name>        Run specific test suite only
  --verbose, -v         Show verbose test output
  --help, -h            Show this help message

${BOLD}AVAILABLE SUITES:${RESET}
  backend              Backend FastAPI tests (pytest)
  agents               AI agent ecosystem tests (pytest)
  operator             Operator engine tests (pytest)
  sdk-python           Python SDK tests (pytest)
  sdk-typescript       TypeScript SDK tests (jest)
  frontend             Frontend validation (structure + syntax)

${BOLD}EXAMPLES:${RESET}
  ./test_all.sh                     # Run all suites, best-effort mode
  ./test_all.sh --strict            # Run all suites, fail-fast mode
  ./test_all.sh --suite backend     # Run only backend tests
  ./test_all.sh --suite sdk-python --verbose  # Run Python SDK tests with verbose output

${BOLD}EXIT CODES:${RESET}
  0    All tests passed
  1    One or more test suites failed

${BOLD}NOTES:${RESET}
  - In best-effort mode, all suites run even if some fail
  - In strict mode, execution stops at first failure
  - Suite results are summarized at the end
  - Use --verbose for detailed test output

EOF
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --strict)
      STRICT_MODE=true
      shift
      ;;
    --suite)
      SPECIFIC_SUITE="$2"
      shift 2
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${RESET}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

###############################################################################
# MAIN EXECUTION
###############################################################################

log_header "BlackRoad Operating System - Test Orchestrator"

if [[ "$STRICT_MODE" == "true" ]]; then
  log_info "Mode: ${RED}${BOLD}STRICT${RESET} (fail-fast)"
else
  log_info "Mode: ${GREEN}${BOLD}BEST-EFFORT${RESET} (run all suites)"
fi

if [[ -n "$SPECIFIC_SUITE" ]]; then
  log_info "Running suite: ${BOLD}$SPECIFIC_SUITE${RESET}"
fi

echo ""

# Run suites
if [[ -z "$SPECIFIC_SUITE" ]]; then
  # Run all suites
  run_backend_tests || true
  run_agents_tests || true
  run_operator_tests || true
  run_sdk_python_tests || true
  run_sdk_typescript_tests || true
  run_frontend_tests || true
else
  # Run specific suite
  case $SPECIFIC_SUITE in
    backend)
      run_backend_tests
      ;;
    agents)
      run_agents_tests
      ;;
    operator)
      run_operator_tests
      ;;
    sdk-python)
      run_sdk_python_tests
      ;;
    sdk-typescript)
      run_sdk_typescript_tests
      ;;
    frontend)
      run_frontend_tests
      ;;
    *)
      log_error "Unknown suite: $SPECIFIC_SUITE"
      echo "Use --help to see available suites"
      exit 1
      ;;
  esac
fi

# Print summary and exit with appropriate code
print_summary
exit $?
