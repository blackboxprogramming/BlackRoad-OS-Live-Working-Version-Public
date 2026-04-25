#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# E2E Tokenless Path Test Suite
# Tests all open PRs against the BlackRoad tokenless gateway architecture
# © BlackRoad OS, Inc. All rights reserved.
# ═══════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PASSED=0
FAILED=0
WARNINGS=0

pass()  { PASSED=$((PASSED + 1)); echo -e "  ${GREEN}✓${NC} $1"; }
fail()  { FAILED=$((FAILED + 1)); echo -e "  ${RED}✗${NC} $1"; }
warn()  { WARNINGS=$((WARNINGS + 1)); echo -e "  ${YELLOW}⚠${NC} $1"; }
info()  { echo -e "  ${CYAN}ℹ${NC} $1"; }

# ── 1. Gateway Unit Tests ────────────────────────────────────
echo -e "\n${BOLD}[1/5] Gateway Unit Tests${NC}"

# Ensure blackroad-core can run as CJS
if [ ! -f "$ROOT_DIR/blackroad-core/package.json" ]; then
  echo '{"private":true}' > "$ROOT_DIR/blackroad-core/package.json"
  CLEANUP_BC_PKG=1
fi

if node "$ROOT_DIR/blackroad-core/tests/gateway.test.js" >/dev/null 2>&1; then
  pass "Gateway unit tests — all passing"
else
  fail "Gateway unit tests — FAILED"
fi

# Clean up temporary package.json
if [ "${CLEANUP_BC_PKG:-}" = "1" ]; then
  rm -f "$ROOT_DIR/blackroad-core/package.json"
fi

# ── 2. Tokenless Agent Verification ─────────────────────────
echo -e "\n${BOLD}[2/5] Tokenless Agent Verification${NC}"

if command -v rg >/dev/null 2>&1; then
  if bash "$ROOT_DIR/blackroad-core/scripts/verify-tokenless-agents.sh" >/dev/null 2>&1; then
    pass "All 6 core agents are tokenless and vendor-agnostic"
  else
    fail "Forbidden vendor references found in agent code"
  fi
else
  warn "ripgrep (rg) not installed — skipping agent scan"
fi

# ── 3. Vitest Unit Tests ────────────────────────────────────
echo -e "\n${BOLD}[3/5] Vitest Unit Tests${NC}"

if [ -d "$ROOT_DIR/node_modules" ] && [ -f "$ROOT_DIR/node_modules/.package-lock.json" ]; then
  vitest_output=$(npx vitest run 2>&1 || true)
  if echo "$vitest_output" | grep -qE "Tests.*passed"; then
    pass "Vitest unit tests — all passing"
  elif echo "$vitest_output" | grep -qE "Tests.*failed"; then
    fail "Vitest unit tests — FAILED"
  else
    warn "Vitest could not determine results"
  fi
else
  warn "node_modules not installed — skipping vitest"
fi

# ── 4. PR Tokenless Path Scan ───────────────────────────────
echo -e "\n${BOLD}[4/5] PR Tokenless Path Scan${NC}"

MAIN_SHA=$(git rev-parse origin/main 2>/dev/null || echo "")
if [ -z "$MAIN_SHA" ]; then
  warn "Cannot determine origin/main — skipping PR scan"
else
  # Get all open PR refs
  PR_REFS=$(git ls-remote origin 'refs/pull/*/head' 2>/dev/null | awk '{print $2}' | sed 's|refs/pull/||;s|/head||' | sort -n)

  for pr_num in $PR_REFS; do
    # Fetch if not already available; warn and skip PR on fetch failure
    if ! fetch_output=$(git fetch origin "refs/pull/$pr_num/head:refs/remotes/origin/pr/$pr_num" 2>&1); then
      warn "PR #$pr_num — Failed to fetch PR ref: $fetch_output"
      continue
    fi

    # Generate diff; warn and skip PR on diff failure
    if ! raw_diff=$(git diff "$MAIN_SHA"..origin/pr/$pr_num 2>&1); then
      warn "PR #$pr_num — Unable to generate diff: $raw_diff"
      continue
    fi

    # Scan diff for forbidden patterns (only added lines)
    diff_output=$(printf '%s\n' "$raw_diff" | grep "^+" | grep -v "^+++" || true)
    # Check for hardcoded API keys (real values, not empty placeholders)
    hardcoded_keys=$(echo "$diff_output" | grep -E 'sk-[a-zA-Z0-9]{20,}|sk-ant-[a-zA-Z0-9]{20,}' || true)

    # Check for direct provider calls in non-doc/config code
    direct_calls=$(echo "$diff_output" | grep -E '(fetch|axios|http\.request|curl).*api\.(openai|anthropic|claude)\.com' || true)

    # Check for direct provider base URLs (e.g., in configs/manifests)
    provider_urls=$(echo "$diff_output" | grep -E 'https?://(api\.)?(openai|anthropic|claude)\.com' || true)

    # Check for merge conflicts
    conflicts=$(echo "$diff_output" | grep -E '^\+(<<<<<<<|=======|>>>>>>>)' || true)

    if [ -n "$hardcoded_keys" ]; then
      fail "PR #$pr_num — Hardcoded API keys detected"
    elif [ -n "$direct_calls" ] || [ -n "$provider_urls" ]; then
      fail "PR #$pr_num — Direct provider API usage bypassing gateway"
    elif [ -n "$conflicts" ]; then
      warn "PR #$pr_num — Unresolved merge conflicts"
    else
      pass "PR #$pr_num — Clean"
    fi
  done
fi

# ── 5. Cross-Org Connection Validation ──────────────────────
echo -e "\n${BOLD}[5/5] Cross-Org Connection Validation${NC}"

# Verify workflows reference valid orgs
VALID_ORGS="BlackRoad-OS-Inc BlackRoad-OS blackboxprogramming BlackRoad-AI BlackRoad-Cloud BlackRoad-Security"
workflow_files=$(find "$ROOT_DIR/.github/workflows" -name "*.yml" 2>/dev/null)

if [ -n "$workflow_files" ]; then
  invalid_orgs=$(grep -rh 'repos/[A-Za-z-]*/[a-z]' $workflow_files 2>/dev/null | grep -v -E "$(echo $VALID_ORGS | tr ' ' '|')" || true)
  if [ -z "$invalid_orgs" ]; then
    pass "All workflow cross-repo references target valid BlackRoad orgs"
  else
    warn "Workflows reference unknown organizations"
  fi
else
  info "No workflow files found"
fi

# Verify gateway binding is localhost-only
GATEWAY_SERVER="$ROOT_DIR/blackroad-core/gateway/server.js"
if [ ! -f "$GATEWAY_SERVER" ]; then
  warn "Gateway server.js not found; cannot verify bind address"
elif grep -q "bind:[[:space:]]*'0\.0\.0\.0'" "$GATEWAY_SERVER"; then
  fail "Gateway binds to 0.0.0.0 (should be 127.0.0.1)"
elif grep -q "bind:[[:space:]]*'127\.0\.0\.1'" "$GATEWAY_SERVER"; then
  pass "Gateway binds to localhost only (secure)"
else
  warn "Gateway bind address could not be verified as localhost-only"
fi

# ── Summary ─────────────────────────────────────────────────
SEP="══════════════════════════════════════════════════"
echo -e "\n${BOLD}${SEP}${NC}"
echo -e "${BOLD}Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}, ${YELLOW}$WARNINGS warnings${NC}"
echo -e "${BOLD}${SEP}${NC}"

if [ "$FAILED" -gt 0 ]; then
  exit 1
else
  exit 0
fi
