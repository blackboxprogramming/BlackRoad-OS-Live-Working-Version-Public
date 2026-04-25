#!/bin/bash
# BlackRoad OS - Service Status Checker
# Tests all *.blackroad.systems services for health endpoints

echo "========================================"
echo "BlackRoad OS Service Status Check"
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "========================================"
echo ""

# Service list from DNS.md
SERVICES=(
    "operator"
    "core"
    "api"
    "app"
    "console"
    "docs"
    "web"
    "os"
    "blackroad.systems"
)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test a service
test_service() {
    local service=$1
    local url=""

    if [ "$service" == "blackroad.systems" ]; then
        url="https://blackroad.systems"
    else
        url="https://$service.blackroad.systems"
    fi

    echo -n "Testing $url ... "

    # Test /health endpoint
    health_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/health" 2>&1)
    health_response=$(curl -s --max-time 10 "$url/health" 2>&1)

    # Test /version endpoint
    version_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/version" 2>&1)

    # Test root endpoint
    root_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/" 2>&1)

    # Determine status
    if [[ "$health_code" == "200" ]]; then
        echo -e "${GREEN}✓ HEALTHY${NC} (health: $health_code, version: $version_code, root: $root_code)"
        echo "  Response: $health_response" | head -c 100
        echo ""
    elif [[ "$health_code" == "403" ]]; then
        echo -e "${YELLOW}⚠ FORBIDDEN${NC} (health: $health_code, version: $version_code, root: $root_code)"
        echo "  Note: Service exists but Cloudflare is blocking access"
    elif [[ "$health_code" == "000" || "$health_code" == "" ]]; then
        echo -e "${RED}✗ UNREACHABLE${NC} (health: $health_code, version: $version_code, root: $root_code)"
        echo "  Error: Cannot connect to service"
    else
        echo -e "${YELLOW}⚠ UNKNOWN${NC} (health: $health_code, version: $version_code, root: $root_code)"
    fi
    echo ""
}

# Test all services
for service in "${SERVICES[@]}"; do
    test_service "$service"
done

echo "========================================"
echo "Service Status Summary"
echo "========================================"
echo ""
echo "Legend:"
echo "  ✓ HEALTHY    - Service is responding with 200 OK"
echo "  ⚠ FORBIDDEN  - Service exists but Cloudflare is blocking (403)"
echo "  ✗ UNREACHABLE - Cannot connect to service"
echo ""
echo "Next Steps:"
echo "  1. Check Cloudflare WAF rules for 403 errors"
echo "  2. Verify Railway deployment for unreachable services"
echo "  3. Check DNS configuration in Cloudflare dashboard"
echo "  4. Review satellite repo deployment status"
echo ""
echo "Documentation:"
echo "  - DNS Map: infra/DNS.md"
echo "  - Infrastructure: INFRASTRUCTURE.md"
echo "  - Syscall API: SYSCALL_API.md"
echo ""
