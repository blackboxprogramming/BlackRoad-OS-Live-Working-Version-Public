#!/bin/bash
# Deploy all domain repos to Cloudflare Pages

set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PINK}   🛣️  DEPLOYING TO CLOUDFLARE PAGES${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

deploy_static() {
    local repo=$1
    local project=$2

    echo -e "${BLUE}→${NC} Deploying $repo to $project.pages.dev"

    cd /tmp
    rm -rf "/tmp/$repo" 2>/dev/null || true
    gh repo clone "BlackRoad-OS/$repo" "/tmp/$repo" 2>/dev/null
    cd "/tmp/$repo"

    # Deploy static site (index.html in root)
    wrangler pages deploy . --project-name="$project" --commit-dirty=true 2>&1 | tail -3

    echo -e "${GREEN}  ✅ Deployed $project${NC}"
}

deploy_nextjs() {
    local repo=$1
    local project=$2

    echo -e "${BLUE}→${NC} Building & deploying $repo to $project.pages.dev"

    cd /tmp
    rm -rf "/tmp/$repo" 2>/dev/null || true
    gh repo clone "BlackRoad-OS/$repo" "/tmp/$repo" 2>/dev/null
    cd "/tmp/$repo"

    # Install and build Next.js
    npm install --silent 2>/dev/null
    npm run build 2>/dev/null

    # Deploy the out directory
    if [ -d "out" ]; then
        wrangler pages deploy out --project-name="$project" --commit-dirty=true 2>&1 | tail -3
        echo -e "${GREEN}  ✅ Deployed $project${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No out directory, deploying root${NC}"
        wrangler pages deploy . --project-name="$project" --commit-dirty=true 2>&1 | tail -3
    fi
}

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  STATIC LANDING PAGES${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

deploy_static "blackroad-company" "blackroad-company"
deploy_static "blackroad-me" "blackroad-me"
deploy_static "blackroad-network" "blackroad-network"
deploy_static "blackroad-systems" "blackroad-systems"
deploy_static "blackroadinc-us" "blackroadinc-us"
deploy_static "blackroadquantum-info" "blackroadquantum-info"
deploy_static "blackroadquantum-net" "blackroadquantum-net"
deploy_static "blackboxprogramming-io" "blackboxprogramming-io"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  NEXT.JS APPS (Building...)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

deploy_nextjs "blackroadai-com" "blackroadai-com"
deploy_nextjs "blackroadqi-com" "blackroadqi-com"
deploy_nextjs "blackroadquantum-com" "blackroadquantum-com"
deploy_nextjs "blackroadquantum-shop" "blackroadquantum-shop"
deploy_nextjs "blackroadquantum-store" "blackroadquantum-store"
deploy_nextjs "lucidia-studio" "lucidia-studio"
deploy_nextjs "lucidiaqi-com" "lucidiaqi-com"
deploy_nextjs "roadchain-io" "roadchain-io"
deploy_nextjs "roadcoin-io" "roadcoin-io"
deploy_nextjs "aliceqi-com" "aliceqi-com"

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ALL DOMAINS DEPLOYED!${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Sites are live at:"
echo "  - blackroad-company.pages.dev"
echo "  - blackroad-me.pages.dev"
echo "  - blackroad-network.pages.dev"
echo "  - blackroad-systems.pages.dev"
echo "  - blackroadinc-us.pages.dev"
echo "  - blackroadquantum-info.pages.dev"
echo "  - blackroadquantum-net.pages.dev"
echo "  - blackboxprogramming-io.pages.dev"
echo "  - blackroadai-com.pages.dev"
echo "  - blackroadqi-com.pages.dev"
echo "  - blackroadquantum-com.pages.dev"
echo "  - blackroadquantum-shop.pages.dev"
echo "  - blackroadquantum-store.pages.dev"
echo "  - lucidia-studio.pages.dev"
echo "  - lucidiaqi-com.pages.dev"
echo "  - roadchain-io.pages.dev"
echo "  - roadcoin-io.pages.dev"
echo "  - aliceqi-com.pages.dev"
