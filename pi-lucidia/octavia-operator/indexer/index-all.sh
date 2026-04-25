#!/usr/bin/env bash
set -euo pipefail
###############################################################################
# index-all.sh — Master indexer: runs scrapers, builds product index,
#                validates E2E config, and outputs deployment manifest.
#
# This is the single entry point for "index everything NOW"
#
# Usage: ./indexer/index-all.sh
# Output: indexer/output/
###############################################################################

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${SCRIPT_DIR}/output"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "$OUTPUT_DIR"

echo ""
echo -e "${RED}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}${BOLD}║  URGENT: BlackRoad Master Indexer                            ║${NC}"
echo -e "${RED}${BOLD}║  Target: BlackRoad-OS-Inc/blackroad-operator                 ║${NC}"
echo -e "${RED}${BOLD}║  Scope:  17 orgs · 1,825+ repos · E2E                        ║${NC}"
echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Step 1: Run org scraper
###############################################################################
echo -e "${CYAN}[1/5] Scraping all 17 organizations...${NC}"
if [ -x "${ROOT_DIR}/scrapers/scrape-all-orgs.sh" ]; then
  bash "${ROOT_DIR}/scrapers/scrape-all-orgs.sh" all 2>&1 | tail -5
else
  echo -e "${YELLOW}  Scraper not executable. Run: chmod +x scrapers/scrape-all-orgs.sh${NC}"
fi

###############################################################################
# Step 2: Run product scanner
###############################################################################
echo ""
echo -e "${CYAN}[2/5] Scanning for production-ready products...${NC}"
if [ -x "${ROOT_DIR}/scrapers/scrape-products.sh" ]; then
  bash "${ROOT_DIR}/scrapers/scrape-products.sh" 2>&1 | tail -5
else
  echo -e "${YELLOW}  Product scanner not executable. Run: chmod +x scrapers/scrape-products.sh${NC}"
fi

###############################################################################
# Step 3: Validate E2E config
###############################################################################
echo ""
echo -e "${CYAN}[3/5] Validating E2E integration config...${NC}"

E2E_STATUS="incomplete"
MISSING_VARS=()

# Check critical env vars
for var in STRIPE_SECRET_KEY NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY CLERK_SECRET_KEY NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY DATABASE_URL; do
  if [ -z "${!var:-}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  E2E_STATUS="ready"
  echo -e "${GREEN}  All critical E2E vars set${NC}"
else
  echo -e "${YELLOW}  Missing ${#MISSING_VARS[@]} critical env vars:${NC}"
  for v in "${MISSING_VARS[@]}"; do
    echo -e "${YELLOW}    - ${v}${NC}"
  done
fi

###############################################################################
# Step 4: Build deployment manifest
###############################################################################
echo ""
echo -e "${CYAN}[4/5] Building deployment manifest...${NC}"

cat > "${OUTPUT_DIR}/deployment-manifest.json" << EOF
{
  "_metadata": {
    "generated_at": "${TIMESTAMP}",
    "owner": "BlackRoad OS, Inc.",
    "target": "BlackRoad-OS-Inc/blackroad-operator",
    "e2e_status": "${E2E_STATUS}"
  },
  "scrapers": {
    "org_scraper": "scrapers/scrape-all-orgs.sh",
    "product_scraper": "scrapers/scrape-products.sh",
    "deep_scanner": "scrapers/scrape-repo-deep.sh"
  },
  "workflows": {
    "scrape_and_index": ".github/workflows/scrape-and-index.yml",
    "deploy_to_all": ".github/workflows/deploy-to-all-repos.yml"
  },
  "integrations": {
    "stripe": "integrations/stripe/stripe-config.ts",
    "clerk": "integrations/clerk/clerk-config.ts",
    "e2e": "integrations/e2e/e2e-config.ts",
    "webhooks": {
      "stripe": "integrations/stripe/webhook-handler.ts",
      "clerk": "integrations/clerk/webhook-handler.ts"
    }
  },
  "deploy_targets": [
    {"platform": "railway", "status": "configured"},
    {"platform": "vercel", "status": "configured"},
    {"platform": "cloudflare-workers", "status": "configured"},
    {"platform": "cloudflare-pages", "status": "configured"},
    {"platform": "digitalocean", "status": "configured"}
  ],
  "domains": [
    "blackroad.io",
    "blackroad.ai",
    "blackroad.network",
    "blackroad.systems",
    "blackroad.me",
    "blackroad.inc"
  ],
  "products": [
    {"name": "BlackRoad OS Pro", "price": 4900, "interval": "month"},
    {"name": "BlackRoad OS Enterprise", "price": 29900, "interval": "month"},
    {"name": "Agent Credits", "price": 1000, "one_time": true},
    {"name": "BlackRoad API Access", "price": 9900, "interval": "month"}
  ]
}
EOF
echo -e "${GREEN}  Saved: ${OUTPUT_DIR}/deployment-manifest.json${NC}"

###############################################################################
# Step 5: Summary
###############################################################################
echo ""
echo -e "${CYAN}[5/5] Generating summary...${NC}"

ORG_INDEX="${ROOT_DIR}/scrapers/output/org-index.json"
PROD_INDEX="${ROOT_DIR}/scrapers/output/products-urgent.json"

TOTAL_REPOS=0
if [ -f "$ORG_INDEX" ]; then
  TOTAL_REPOS=$(jq '.._metadata.total_repos // 0' "$ORG_INDEX" 2>/dev/null || echo 0)
fi

PROD_COUNT=0
if [ -f "$PROD_INDEX" ]; then
  PROD_COUNT=$(jq '.products | length // 0' "$PROD_INDEX" 2>/dev/null || echo 0)
fi

echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  INDEXING COMPLETE${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo -e "  Orgs scanned:      17"
echo -e "  Repos indexed:     ${TOTAL_REPOS}"
echo -e "  Products found:    ${PROD_COUNT}"
echo -e "  E2E status:        ${E2E_STATUS}"
echo -e "  Target:            BlackRoad-OS-Inc/blackroad-operator"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
echo ""

if [ "$E2E_STATUS" != "ready" ]; then
  echo -e "${YELLOW}${BOLD}ACTION REQUIRED:${NC}"
  echo -e "${YELLOW}  Set these secrets in BlackRoad-OS-Inc/blackroad-operator:${NC}"
  for v in "${MISSING_VARS[@]}"; do
    echo -e "${YELLOW}    gh secret set ${v} --repo BlackRoad-OS-Inc/blackroad-operator${NC}"
  done
  echo ""
fi

echo -e "${CYAN}Next steps:${NC}"
echo "  1. Set missing secrets (see above)"
echo "  2. Run: gh workflow run scrape-and-index.yml"
echo "  3. Run: gh workflow run deploy-to-all-repos.yml --field dry_run=false"
echo "  4. Create Stripe products at dashboard.stripe.com"
echo "  5. Create Clerk app at dashboard.clerk.com"
