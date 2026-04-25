#!/bin/bash
# smoke-test.sh - BlackRoad OS Smoke Tests
# Run this after deployment to verify all services are operational

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set your domain or Railway URL
BACKEND_URL=${BACKEND_URL:-"https://api.blackroad.systems"}
OPERATOR_URL=${OPERATOR_URL:-"https://operator.blackroad.systems"}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 BlackRoad OS Smoke Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Backend URL: ${YELLOW}$BACKEND_URL${NC}"
echo -e "Operator URL: ${YELLOW}$OPERATOR_URL${NC}"
echo ""

PASSED=0
FAILED=0

# Helper function to run tests
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || response="000"

    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_code)"
        ((FAILED++))
    fi
}

# Backend Tests
echo -e "\n${BLUE}Backend Service Tests:${NC}"
test_endpoint "Health Check" "$BACKEND_URL/health"
test_endpoint "Version Info" "$BACKEND_URL/version"
test_endpoint "API Info" "$BACKEND_URL/api"
test_endpoint "API Health Summary" "$BACKEND_URL/api/health/summary"
test_endpoint "API Documentation" "$BACKEND_URL/api/docs"
test_endpoint "Frontend UI" "$BACKEND_URL/"
test_endpoint "Prism Console" "$BACKEND_URL/prism"

# Operator Tests
echo -e "\n${BLUE}Operator Service Tests:${NC}"
test_endpoint "Health Check" "$OPERATOR_URL/health"
test_endpoint "Version Info" "$OPERATOR_URL/version"
test_endpoint "Jobs List" "$OPERATOR_URL/jobs"
test_endpoint "Scheduler Status" "$OPERATOR_URL/scheduler/status"

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary:${NC}"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All smoke tests passed!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Check logs for details.${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
