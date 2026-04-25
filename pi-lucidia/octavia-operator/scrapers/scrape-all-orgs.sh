#!/usr/bin/env bash
set -euo pipefail
###############################################################################
# scrape-all-orgs.sh — Index every repo across all 17 BlackRoad orgs
#
# Scrapes: repos, topics, languages, deploy status, package.json/pyproject,
#          Stripe/Clerk/auth configs, CI workflows, and production indicators.
#
# Output:  scrapers/output/org-index.json  (master index)
#          scrapers/output/<org>/           (per-org data)
#
# Requires: gh CLI authenticated, jq
# All output stays in BlackRoad-OS-Inc/blackroad-operator
###############################################################################

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/output"
MASTER_INDEX="${OUTPUT_DIR}/org-index.json"
PRODUCTS_INDEX="${OUTPUT_DIR}/products-index.json"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# All 17 BlackRoad orgs — PROPRIETARY
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

# Production indicators — files/patterns that signal prod-ready repos
PROD_INDICATORS=(
  "Dockerfile"
  "docker-compose.yml"
  "railway.toml"
  "vercel.json"
  "wrangler.toml"
  "fly.toml"
  "render.yaml"
  "netlify.toml"
  ".env.production"
  "Procfile"
)

# Revenue/integration indicators
REVENUE_INDICATORS=(
  "stripe"
  "clerk"
  "auth0"
  "supabase"
  "firebase"
  "prisma"
  "drizzle"
  "nextauth"
  "passport"
)

log()   { echo -e "${GREEN}[SCRAPER]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }

check_deps() {
  for cmd in gh jq; do
    if ! command -v "$cmd" &>/dev/null; then
      error "$cmd is required but not installed"
      exit 1
    fi
  done
  if ! gh auth status &>/dev/null 2>&1; then
    error "gh CLI not authenticated. Run: gh auth login"
    exit 1
  fi
}

mkdir -p "$OUTPUT_DIR"

###############################################################################
# scrape_org — Pull all repos for a single org
###############################################################################
scrape_org() {
  local org="$1"
  local org_dir="${OUTPUT_DIR}/${org}"
  mkdir -p "$org_dir"

  info "Scraping ${org}..."

  # Fetch all repos (paginated, up to 500)
  gh api --paginate "orgs/${org}/repos?per_page=100&sort=updated&direction=desc" \
    --jq '.[] | {
      name: .name,
      full_name: .full_name,
      description: .description,
      language: .language,
      default_branch: .default_branch,
      private: .private,
      fork: .fork,
      archived: .archived,
      topics: .topics,
      homepage: .homepage,
      html_url: .html_url,
      created_at: .created_at,
      updated_at: .updated_at,
      pushed_at: .pushed_at,
      size: .size,
      stargazers_count: .stargazers_count,
      has_pages: .has_pages,
      has_wiki: .has_wiki,
      has_issues: .has_issues,
      open_issues_count: .open_issues_count
    }' > "${org_dir}/repos.jsonl" 2>/dev/null || {
      warn "Could not scrape ${org} (may be private or rate-limited)"
      echo '[]' > "${org_dir}/repos.json"
      return
    }

  # Convert JSONL to JSON array
  if [ -s "${org_dir}/repos.jsonl" ]; then
    jq -s '.' "${org_dir}/repos.jsonl" > "${org_dir}/repos.json"
    local count
    count=$(jq 'length' "${org_dir}/repos.json")
    log "${org}: ${count} repos indexed"
  else
    echo '[]' > "${org_dir}/repos.json"
    warn "${org}: 0 repos found"
  fi

  rm -f "${org_dir}/repos.jsonl"
}

###############################################################################
# scan_repo_for_products — Deep scan a repo for production indicators
###############################################################################
scan_repo_for_products() {
  local full_name="$1"

  # Check for key files that indicate production readiness
  local has_deploy=false
  local has_revenue=false
  local deploy_targets=()
  local revenue_integrations=()

  # Check deploy configs via API (tree search)
  local tree
  tree=$(gh api "repos/${full_name}/git/trees/HEAD?recursive=1" \
    --jq '.tree[].path' 2>/dev/null || echo "")

  if [ -n "$tree" ]; then
    # Deploy target detection
    echo "$tree" | grep -qi "railway.toml" && deploy_targets+=("railway") && has_deploy=true
    echo "$tree" | grep -qi "vercel.json" && deploy_targets+=("vercel") && has_deploy=true
    echo "$tree" | grep -qi "wrangler.toml" && deploy_targets+=("cloudflare") && has_deploy=true
    echo "$tree" | grep -qi "Dockerfile" && deploy_targets+=("docker") && has_deploy=true
    echo "$tree" | grep -qi "fly.toml" && deploy_targets+=("fly") && has_deploy=true
    echo "$tree" | grep -qi "netlify.toml" && deploy_targets+=("netlify") && has_deploy=true
    echo "$tree" | grep -qi "Procfile" && deploy_targets+=("heroku") && has_deploy=true

    # Revenue/auth integration detection
    echo "$tree" | grep -qi "stripe" && revenue_integrations+=("stripe") && has_revenue=true
    echo "$tree" | grep -qi "clerk" && revenue_integrations+=("clerk") && has_revenue=true
    echo "$tree" | grep -qi "auth0" && revenue_integrations+=("auth0") && has_revenue=true
    echo "$tree" | grep -qi "supabase" && revenue_integrations+=("supabase") && has_revenue=true
    echo "$tree" | grep -qi "prisma" && revenue_integrations+=("prisma") && has_revenue=true
    echo "$tree" | grep -qi "nextauth\|next-auth" && revenue_integrations+=("nextauth") && has_revenue=true

    # Package.json check for dependencies
    if echo "$tree" | grep -q "^package.json$"; then
      local pkg
      pkg=$(gh api "repos/${full_name}/contents/package.json" \
        --jq '.content' 2>/dev/null | base64 -d 2>/dev/null || echo "{}")
      echo "$pkg" | grep -qi '"stripe"' && revenue_integrations+=("stripe-sdk") && has_revenue=true
      echo "$pkg" | grep -qi '"@clerk"' && revenue_integrations+=("clerk-sdk") && has_revenue=true
      echo "$pkg" | grep -qi '"@stripe"' && revenue_integrations+=("stripe-node") && has_revenue=true
    fi
  fi

  # Output product scan result
  local deploy_json
  deploy_json=$(printf '%s\n' "${deploy_targets[@]}" 2>/dev/null | jq -R . | jq -s . 2>/dev/null || echo '[]')
  local revenue_json
  revenue_json=$(printf '%s\n' "${revenue_integrations[@]}" 2>/dev/null | jq -R . | jq -s . 2>/dev/null || echo '[]')

  jq -n \
    --arg repo "$full_name" \
    --argjson has_deploy "$has_deploy" \
    --argjson has_revenue "$has_revenue" \
    --argjson deploy_targets "$deploy_json" \
    --argjson revenue_integrations "$revenue_json" \
    '{
      repo: $repo,
      production_ready: $has_deploy,
      has_revenue_integration: $has_revenue,
      deploy_targets: $deploy_targets,
      revenue_integrations: $revenue_integrations
    }'
}

###############################################################################
# build_master_index — Aggregate all org data into a single index
###############################################################################
build_master_index() {
  log "Building master index..."

  local org_data=()
  local total_repos=0

  for org in "${ORGS[@]}"; do
    local org_file="${OUTPUT_DIR}/${org}/repos.json"
    if [ -f "$org_file" ]; then
      local count
      count=$(jq 'length' "$org_file" 2>/dev/null || echo 0)
      total_repos=$((total_repos + count))
      org_data+=("$(jq -n \
        --arg org "$org" \
        --argjson count "$count" \
        --argjson repos "$(cat "$org_file")" \
        '{org: $org, repo_count: $count, repos: $repos}')")
    fi
  done

  # Combine into master index
  printf '%s\n' "${org_data[@]}" | jq -s \
    --arg ts "$TIMESTAMP" \
    --argjson total "$total_repos" \
    '{
      _metadata: {
        generated_at: $ts,
        total_repos: $total,
        total_orgs: (. | length),
        owner: "BlackRoad OS, Inc.",
        proprietary: true
      },
      organizations: .
    }' > "$MASTER_INDEX"

  log "Master index: ${total_repos} repos across ${#ORGS[@]} orgs"
  log "Saved to: ${MASTER_INDEX}"
}

###############################################################################
# main
###############################################################################
main() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║  BlackRoad OS, Inc. — Organization Scraper              ║${NC}"
  echo -e "${CYAN}║  Indexing all 17 orgs → BlackRoad-OS-Inc/operator       ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
  echo ""

  check_deps

  local mode="${1:-all}"

  case "$mode" in
    all)
      for org in "${ORGS[@]}"; do
        scrape_org "$org"
      done
      build_master_index
      ;;
    org)
      local target="${2:?Usage: $0 org <org-name>}"
      scrape_org "$target"
      ;;
    products)
      log "Running product scan on all indexed repos..."
      local products=()
      for org in "${ORGS[@]}"; do
        local org_file="${OUTPUT_DIR}/${org}/repos.json"
        [ -f "$org_file" ] || continue
        local repos
        repos=$(jq -r '.[].full_name' "$org_file" 2>/dev/null)
        while IFS= read -r repo; do
          [ -z "$repo" ] && continue
          info "Scanning ${repo}..."
          local result
          result=$(scan_repo_for_products "$repo" 2>/dev/null || echo '{}')
          products+=("$result")
        done <<< "$repos"
      done
      printf '%s\n' "${products[@]}" | jq -s \
        --arg ts "$TIMESTAMP" \
        '{
          _metadata: {generated_at: $ts, owner: "BlackRoad OS, Inc."},
          products: [.[] | select(.production_ready == true or .has_revenue_integration == true)],
          all_scanned: .
        }' > "$PRODUCTS_INDEX"
      log "Products index saved to: ${PRODUCTS_INDEX}"
      ;;
    *)
      echo "Usage: $0 {all|org <name>|products}"
      exit 1
      ;;
  esac

  echo ""
  log "Scraping complete. All data in: ${OUTPUT_DIR}/"
}

main "$@"
