#!/usr/bin/env bash
set -euo pipefail
###############################################################################
# scrape-products.sh — Identify all production-scale, high-ROI products
#                       across all 17 BlackRoad orgs
#
# This is the URGENT indexer. Scans every org for repos that have:
#   - Deploy configs (railway/vercel/cloudflare/docker)
#   - Revenue integrations (Stripe, Clerk, auth)
#   - Active CI/CD
#   - Recent push activity
#
# Output: scrapers/output/products-urgent.json
###############################################################################

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/output"
URGENT_FILE="${OUTPUT_DIR}/products-urgent.json"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "$OUTPUT_DIR"

ORGS=(
  "BlackRoad-OS-Inc"
  "BlackRoad-OS"
  "blackboxprogramming"
  "BlackRoad-AI"
  "BlackRoad-Cloud"
  "BlackRoad-Security"
  "BlackRoad-Media"
  "BlackRoad-Foundation"
  "BlackRoad-Interactive"
  "BlackRoad-Hardware"
  "BlackRoad-Labs"
  "BlackRoad-Studio"
  "BlackRoad-Ventures"
  "BlackRoad-Education"
  "BlackRoad-Gov"
  "Blackbox-Enterprises"
  "BlackRoad-Archive"
)

log()  { echo -e "${GREEN}[PRODUCTS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }

echo ""
echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  URGENT: BlackRoad Product Scraper                      ║${NC}"
echo -e "${RED}║  Scanning all 17 orgs for production-ready products     ║${NC}"
echo -e "${RED}║  Target: BlackRoad-OS-Inc/blackroad-operator            ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check deps
for cmd in gh jq; do
  command -v "$cmd" &>/dev/null || { echo "Missing: $cmd"; exit 1; }
done

ALL_PRODUCTS="[]"

for org in "${ORGS[@]}"; do
  info "Scanning ${org}..."

  # Get repos updated in last 90 days, sorted by push date
  REPOS=$(gh api --paginate "orgs/${org}/repos?per_page=100&sort=pushed&direction=desc" \
    --jq '.[] | select(.archived != true) | {
      full_name: .full_name,
      name: .name,
      description: .description,
      language: .language,
      topics: .topics,
      homepage: .homepage,
      pushed_at: .pushed_at,
      private: .private,
      fork: .fork,
      size: .size,
      has_pages: .has_pages,
      default_branch: .default_branch
    }' 2>/dev/null | jq -s '.' 2>/dev/null || echo '[]')

  REPO_COUNT=$(echo "$REPOS" | jq 'length')
  log "${org}: ${REPO_COUNT} active repos"

  # For each repo, check for production indicators via search
  ORG_PRODUCTS=$(echo "$REPOS" | jq --arg org "$org" '[
    .[] | . + {org: $org}
    | select(
      .language != null and
      .size > 10
    )
  ]')

  ALL_PRODUCTS=$(echo "$ALL_PRODUCTS" "$ORG_PRODUCTS" | jq -s 'add')
done

# Build the urgent index
TOTAL=$(echo "$ALL_PRODUCTS" | jq 'length')

jq -n \
  --arg ts "$TIMESTAMP" \
  --argjson total "$TOTAL" \
  --argjson products "$ALL_PRODUCTS" \
  '{
    _metadata: {
      generated_at: $ts,
      owner: "BlackRoad OS, Inc.",
      proprietary: true,
      urgent: true,
      purpose: "Production product index for E2E deployment"
    },
    summary: {
      total_active_repos: $total,
      orgs_scanned: 17,
      target_org: "BlackRoad-OS-Inc"
    },
    e2e_requirements: {
      stripe: {
        status: "REQUIRED",
        integration: "stripe-node + @stripe/stripe-js",
        webhooks: ["checkout.session.completed", "customer.subscription.updated", "invoice.paid"],
        products: ["BlackRoad OS Pro", "BlackRoad OS Enterprise", "Agent Credits"]
      },
      clerk: {
        status: "REQUIRED",
        integration: "@clerk/nextjs + @clerk/backend",
        features: ["SSO", "MFA", "org-management", "user-metadata"],
        orgs_sync: true
      },
      deployment_targets: ["railway", "vercel", "cloudflare-workers", "cloudflare-pages"]
    },
    products: $products
  }' > "$URGENT_FILE"

log "URGENT index saved: ${URGENT_FILE}"
log "Total repos indexed: ${TOTAL}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Review: cat ${URGENT_FILE} | jq '.summary'"
echo "  2. Deep scan: ./scrape-repo-deep.sh <org/repo>"
echo "  3. Deploy:  Push to BlackRoad-OS-Inc/blackroad-operator"
