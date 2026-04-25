#!/usr/bin/env bash

# BlackRoad OS - Stripe Product Provisioner
# Creates ALL products and prices in Stripe for production
#
# Usage:
#   ./production/provision-stripe.sh          # Interactive (prompts for key)
#   STRIPE_SECRET_KEY=sk_live_xxx ./production/provision-stripe.sh  # Non-interactive
#
# Products Created:
#   1. BlackRoad OS Pro         ($29/mo, $290/yr)
#   2. BlackRoad OS Enterprise  ($199/mo, $1,990/yr)
#   3. Open Source Support      ($5/mo, $25/mo, $100/mo, $10, $50, $500 one-time)
#   4. Commercial License       ($499/yr, $999/yr, $2,499/yr)
#   5. Consulting               ($250/hr, $1,500/day, $5,000/project)
#   6. Priority Support         ($499/mo)

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
AMBER='\033[38;5;214m'
PINK='\033[38;5;205m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

OUTPUT_FILE="production/.stripe-provision-output.json"

# ─── Auth ───
if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  if [[ -f "$HOME/.blackroad/stripe.conf" ]]; then
    source "$HOME/.blackroad/stripe.conf"
  fi
fi

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo -e "${RED}STRIPE_SECRET_KEY not set${NC}"
  echo "Set it via: export STRIPE_SECRET_KEY=sk_live_xxx"
  echo "Or run: br stripe auth sk_live_xxx"
  exit 1
fi

MODE="LIVE"
[[ "$STRIPE_SECRET_KEY" == sk_test_* ]] && MODE="TEST"
echo -e "${AMBER}${BOLD}BlackRoad OS — Stripe Product Provisioner${NC}"
echo -e "${DIM}Mode: $MODE${NC}"
echo ""

# ─── API Helper ───
stripe_api() {
  local method="$1"
  local endpoint="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -s -X "$method" "https://api.stripe.com/v1${endpoint}" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
      -d "$data"
  else
    curl -s -X "$method" "https://api.stripe.com/v1${endpoint}" \
      -H "Authorization: Bearer $STRIPE_SECRET_KEY"
  fi
}

extract_id() {
  echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

check_error() {
  local response="$1"
  local context="$2"
  if echo "$response" | grep -q '"error"'; then
    local msg
    msg=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${RED}  FAILED: $context — $msg${NC}"
    return 1
  fi
  return 0
}

# ─── Track results ───
declare -A PRICE_IDS
RESULTS=""

add_result() {
  local key="$1" value="$2"
  PRICE_IDS["$key"]="$value"
  if [[ -n "$RESULTS" ]]; then
    RESULTS="$RESULTS,"
  fi
  RESULTS="$RESULTS
    \"$key\": \"$value\""
}

# ============================================================================
# 1. CORE SUBSCRIPTION PRODUCTS
# ============================================================================
echo -e "${PINK}━━━ Creating Core Subscription Products ━━━${NC}"

# --- BlackRoad OS Pro ---
echo -e "${AMBER}Creating: BlackRoad OS Pro${NC}"
PRO_PROD=$(stripe_api POST "/products" \
  "name=BlackRoad+OS+Pro&description=100+AI+Agents,+10K+tasks/mo,+priority+support,+custom+integrations&metadata[tier_id]=pro&metadata[product_group]=core")
PRO_PROD_ID=$(extract_id "$PRO_PROD")
check_error "$PRO_PROD" "Pro Product" || exit 1
echo -e "  ${GREEN}Product: $PRO_PROD_ID${NC}"

PRO_M=$(stripe_api POST "/prices" \
  "product=$PRO_PROD_ID&unit_amount=2900&currency=usd&recurring[interval]=month&metadata[tier_id]=pro&metadata[period]=monthly")
PRO_M_ID=$(extract_id "$PRO_M")
add_result "STRIPE_PRICE_PRO_MONTHLY" "$PRO_M_ID"
echo -e "  ${GREEN}Monthly: $PRO_M_ID ($29/mo)${NC}"

PRO_Y=$(stripe_api POST "/prices" \
  "product=$PRO_PROD_ID&unit_amount=29000&currency=usd&recurring[interval]=year&metadata[tier_id]=pro&metadata[period]=yearly")
PRO_Y_ID=$(extract_id "$PRO_Y")
add_result "STRIPE_PRICE_PRO_YEARLY" "$PRO_Y_ID"
echo -e "  ${GREEN}Yearly:  $PRO_Y_ID ($290/yr)${NC}"
echo ""

# --- BlackRoad OS Enterprise ---
echo -e "${AMBER}Creating: BlackRoad OS Enterprise${NC}"
ENT_PROD=$(stripe_api POST "/products" \
  "name=BlackRoad+OS+Enterprise&description=Unlimited+agents,+SSO/SAML,+SLA+99.9%%,+dedicated+support,+audit+logs&metadata[tier_id]=enterprise&metadata[product_group]=core")
ENT_PROD_ID=$(extract_id "$ENT_PROD")
check_error "$ENT_PROD" "Enterprise Product" || exit 1
echo -e "  ${GREEN}Product: $ENT_PROD_ID${NC}"

ENT_M=$(stripe_api POST "/prices" \
  "product=$ENT_PROD_ID&unit_amount=19900&currency=usd&recurring[interval]=month&metadata[tier_id]=enterprise&metadata[period]=monthly")
ENT_M_ID=$(extract_id "$ENT_M")
add_result "STRIPE_PRICE_ENT_MONTHLY" "$ENT_M_ID"
echo -e "  ${GREEN}Monthly: $ENT_M_ID ($199/mo)${NC}"

ENT_Y=$(stripe_api POST "/prices" \
  "product=$ENT_PROD_ID&unit_amount=199000&currency=usd&recurring[interval]=year&metadata[tier_id]=enterprise&metadata[period]=yearly")
ENT_Y_ID=$(extract_id "$ENT_Y")
add_result "STRIPE_PRICE_ENT_YEARLY" "$ENT_Y_ID"
echo -e "  ${GREEN}Yearly:  $ENT_Y_ID ($1,990/yr)${NC}"
echo ""

# ============================================================================
# 2. OPEN SOURCE SUPPORT / SPONSORSHIP
# ============================================================================
echo -e "${PINK}━━━ Creating Sponsorship Products ━━━${NC}"

echo -e "${AMBER}Creating: Open Source Support${NC}"
OSS_PROD=$(stripe_api POST "/products" \
  "name=Open+Source+Support&description=Support+BlackRoad+OS+development&metadata[product_group]=sponsorship")
OSS_PROD_ID=$(extract_id "$OSS_PROD")
check_error "$OSS_PROD" "OSS Product" || exit 1
echo -e "  ${GREEN}Product: $OSS_PROD_ID${NC}"

# Monthly tiers
for tier_info in "friend:500:5" "supporter:2500:25" "sponsor:10000:100"; do
  IFS=':' read -r tier_name amount display <<< "$tier_info"
  RESP=$(stripe_api POST "/prices" \
    "product=$OSS_PROD_ID&unit_amount=$amount&currency=usd&recurring[interval]=month&metadata[tier]=$tier_name&metadata[product_group]=sponsorship")
  RESP_ID=$(extract_id "$RESP")
  add_result "STRIPE_PRICE_OSS_${tier_name^^}_MONTHLY" "$RESP_ID"
  echo -e "  ${GREEN}$tier_name: $RESP_ID (\$$display/mo)${NC}"
done

# One-time tiers
for tier_info in "coffee:1000:10" "backer:5000:50" "champion:50000:500"; do
  IFS=':' read -r tier_name amount display <<< "$tier_info"
  RESP=$(stripe_api POST "/prices" \
    "product=$OSS_PROD_ID&unit_amount=$amount&currency=usd&metadata[tier]=$tier_name&metadata[product_group]=sponsorship")
  RESP_ID=$(extract_id "$RESP")
  add_result "STRIPE_PRICE_OSS_${tier_name^^}_ONETIME" "$RESP_ID"
  echo -e "  ${GREEN}$tier_name: $RESP_ID (\$$display one-time)${NC}"
done
echo ""

# ============================================================================
# 3. COMMERCIAL LICENSING
# ============================================================================
echo -e "${PINK}━━━ Creating Commercial License Products ━━━${NC}"

echo -e "${AMBER}Creating: Commercial License${NC}"
LIC_PROD=$(stripe_api POST "/products" \
  "name=Commercial+License&description=Use+BlackRoad+OS+in+commercial+products&metadata[product_group]=licensing")
LIC_PROD_ID=$(extract_id "$LIC_PROD")
check_error "$LIC_PROD" "License Product" || exit 1
echo -e "  ${GREEN}Product: $LIC_PROD_ID${NC}"

for tier_info in "startup:49900:499" "business:99900:999" "enterprise:249900:2499"; do
  IFS=':' read -r tier_name amount display <<< "$tier_info"
  RESP=$(stripe_api POST "/prices" \
    "product=$LIC_PROD_ID&unit_amount=$amount&currency=usd&recurring[interval]=year&metadata[tier]=$tier_name&metadata[product_group]=licensing")
  RESP_ID=$(extract_id "$RESP")
  add_result "STRIPE_PRICE_LICENSE_${tier_name^^}_YEARLY" "$RESP_ID"
  echo -e "  ${GREEN}$tier_name: $RESP_ID (\$$display/yr)${NC}"
done
echo ""

# ============================================================================
# 4. CONSULTING
# ============================================================================
echo -e "${PINK}━━━ Creating Consulting Products ━━━${NC}"

echo -e "${AMBER}Creating: Consulting & Integration${NC}"
CON_PROD=$(stripe_api POST "/products" \
  "name=Consulting+%26+Integration&description=Expert+help+integrating+BlackRoad+OS&metadata[product_group]=consulting")
CON_PROD_ID=$(extract_id "$CON_PROD")
check_error "$CON_PROD" "Consulting Product" || exit 1
echo -e "  ${GREEN}Product: $CON_PROD_ID${NC}"

for tier_info in "hourly:25000:250" "daily:150000:1500" "project:500000:5000"; do
  IFS=':' read -r tier_name amount display <<< "$tier_info"
  RESP=$(stripe_api POST "/prices" \
    "product=$CON_PROD_ID&unit_amount=$amount&currency=usd&metadata[tier]=$tier_name&metadata[product_group]=consulting")
  RESP_ID=$(extract_id "$RESP")
  add_result "STRIPE_PRICE_CONSULTING_${tier_name^^}" "$RESP_ID"
  echo -e "  ${GREEN}$tier_name: $RESP_ID (\$${display})${NC}"
done
echo ""

# ============================================================================
# 5. PRIORITY SUPPORT
# ============================================================================
echo -e "${PINK}━━━ Creating Priority Support Product ━━━${NC}"

echo -e "${AMBER}Creating: Priority Support${NC}"
SUP_PROD=$(stripe_api POST "/products" \
  "name=Priority+Support&description=24/7+priority+support+with+SLA&metadata[product_group]=support")
SUP_PROD_ID=$(extract_id "$SUP_PROD")
check_error "$SUP_PROD" "Support Product" || exit 1
echo -e "  ${GREEN}Product: $SUP_PROD_ID${NC}"

SUP_M=$(stripe_api POST "/prices" \
  "product=$SUP_PROD_ID&unit_amount=49900&currency=usd&recurring[interval]=month&metadata[tier]=priority&metadata[product_group]=support")
SUP_M_ID=$(extract_id "$SUP_M")
add_result "STRIPE_PRICE_PRIORITY_SUPPORT_MONTHLY" "$SUP_M_ID"
echo -e "  ${GREEN}Monthly: $SUP_M_ID ($499/mo)${NC}"
echo ""

# ============================================================================
# 6. PER-REPO PRODUCTS (Agent OS, CLI, etc.)
# ============================================================================
echo -e "${PINK}━━━ Creating Per-Repo Products ━━━${NC}"

for repo_info in \
  "blackroad-agent-os:Agent+OS:AI+agent+orchestration+platform" \
  "blackroad-cli:CLI:Command-line+interface+for+BlackRoad+OS" \
  "blackroad-tools:Tools:Developer+tools+and+utilities" \
  "lucidia-core:Lucidia:AI+learning+and+memory+system" \
  "blackroad-pi-ops:Pi+Ops:Raspberry+Pi+operations+and+management"; do

  IFS=':' read -r repo_slug name desc <<< "$repo_info"

  echo -e "${AMBER}Creating: $name${NC}"
  REPO_PROD=$(stripe_api POST "/products" \
    "name=BlackRoad+$name&description=$desc&metadata[repo]=$repo_slug&metadata[product_group]=repos")
  REPO_PROD_ID=$(extract_id "$REPO_PROD")

  if ! check_error "$REPO_PROD" "$name Product"; then
    continue
  fi
  echo -e "  ${GREEN}Product: $REPO_PROD_ID${NC}"

  # Basic $9/mo
  BASIC=$(stripe_api POST "/prices" \
    "product=$REPO_PROD_ID&unit_amount=900&currency=usd&recurring[interval]=month&metadata[tier]=basic&metadata[repo]=$repo_slug")
  BASIC_ID=$(extract_id "$BASIC")
  add_result "STRIPE_PRICE_${repo_slug^^}_BASIC" "$BASIC_ID"
  echo -e "  ${GREEN}Basic: $BASIC_ID ($9/mo)${NC}"

  # Pro $29/mo
  PRO=$(stripe_api POST "/prices" \
    "product=$REPO_PROD_ID&unit_amount=2900&currency=usd&recurring[interval]=month&metadata[tier]=pro&metadata[repo]=$repo_slug")
  PRO_ID=$(extract_id "$PRO")
  add_result "STRIPE_PRICE_${repo_slug^^}_PRO" "$PRO_ID"
  echo -e "  ${GREEN}Pro: $PRO_ID ($29/mo)${NC}"

  # Enterprise $99/mo
  ENT=$(stripe_api POST "/prices" \
    "product=$REPO_PROD_ID&unit_amount=9900&currency=usd&recurring[interval]=month&metadata[tier]=enterprise&metadata[repo]=$repo_slug")
  ENT_ID=$(extract_id "$ENT")
  add_result "STRIPE_PRICE_${repo_slug^^}_ENT" "$ENT_ID"
  echo -e "  ${GREEN}Enterprise: $ENT_ID ($99/mo)${NC}"
  echo ""
done

# ============================================================================
# OUTPUT
# ============================================================================
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}All products and prices provisioned!${NC}"
echo ""

# Write output JSON
cat > "$OUTPUT_FILE" << JSONEOF
{
  "provisioned_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "stripe_account": "acct_1S70Zn3e5FMFdlFw",
  "mode": "$MODE",
  "price_ids": {
    $RESULTS
  }
}
JSONEOF

echo -e "${AMBER}Output written to: $OUTPUT_FILE${NC}"
echo ""

# Print env var export commands
echo -e "${PINK}━━━ Environment Variables (copy to .env) ━━━${NC}"
echo ""
for key in "${!PRICE_IDS[@]}"; do
  echo "$key=${PRICE_IDS[$key]}"
done | sort
echo ""

# Print wrangler commands
echo -e "${PINK}━━━ Wrangler Secret Commands ━━━${NC}"
echo ""
echo "cd workers/payment-gateway"
for key in STRIPE_PRICE_PRO_MONTHLY STRIPE_PRICE_PRO_YEARLY STRIPE_PRICE_ENT_MONTHLY STRIPE_PRICE_ENT_YEARLY; do
  if [[ -n "${PRICE_IDS[$key]:-}" ]]; then
    echo "echo '${PRICE_IDS[$key]}' | wrangler secret put $key"
  fi
done
echo ""

# Print GitHub Actions secret commands
echo -e "${PINK}━━━ GitHub Actions Secrets ━━━${NC}"
echo ""
for key in "${!PRICE_IDS[@]}"; do
  echo "gh secret set $key --body '${PRICE_IDS[$key]}' --org BlackRoad-OS-Inc"
done | sort
echo ""

echo -e "${GREEN}${BOLD}Done. MOVE FASTER. THINK HARDER. ALWAYS BELIEVE.${NC}"
