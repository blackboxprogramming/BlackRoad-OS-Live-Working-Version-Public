#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# BlackRoad OS, Inc. — Multi-Org Scraper
# Scrapes ALL 17 GitHub orgs → indexes repos, topics, languages, products
# Returns everything to BlackRoad-OS-Inc/blackroad-operator
# ============================================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/output"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="${OUTPUT_DIR}/${TIMESTAMP}"

mkdir -p "${REPORT_DIR}"

# All 17 BlackRoad OS organizations
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

log()   { echo -e "${GREEN}[SCRAPE]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }

check_auth() {
  if ! gh auth status &>/dev/null; then
    error "Not authenticated with GitHub CLI. Run: gh auth login"
    exit 1
  fi
  log "GitHub CLI authenticated"
}

scrape_org() {
  local org="$1"
  local org_dir="${REPORT_DIR}/${org}"
  mkdir -p "${org_dir}"

  info "Scraping org: ${org}"

  # Get all repos with full metadata
  gh api "orgs/${org}/repos" \
    --paginate \
    -q '.[] | {
      name: .name,
      full_name: .full_name,
      description: .description,
      language: .language,
      topics: .topics,
      stargazers_count: .stargazers_count,
      forks_count: .forks_count,
      open_issues_count: .open_issues_count,
      default_branch: .default_branch,
      created_at: .created_at,
      updated_at: .updated_at,
      pushed_at: .pushed_at,
      size: .size,
      fork: .fork,
      archived: .archived,
      private: .private,
      html_url: .html_url,
      homepage: .homepage,
      has_pages: .has_pages,
      has_wiki: .has_wiki,
      has_discussions: .has_discussions,
      license: .license.spdx_id,
      visibility: .visibility
    }' > "${org_dir}/repos.jsonl" 2>/dev/null || warn "Could not fetch repos for ${org}"

  # Count repos
  local count=$(wc -l < "${org_dir}/repos.jsonl" 2>/dev/null || echo 0)
  log "${org}: ${count} repos indexed"

  # Extract languages summary
  if [ -s "${org_dir}/repos.jsonl" ]; then
    cat "${org_dir}/repos.jsonl" | python3 -c "
import sys, json
langs = {}
for line in sys.stdin:
    try:
        repo = json.loads(line)
        lang = repo.get('language') or 'Unknown'
        langs[lang] = langs.get(lang, 0) + 1
    except: pass
for lang, count in sorted(langs.items(), key=lambda x: -x[1]):
    print(f'{lang}: {count}')
" > "${org_dir}/languages.txt" 2>/dev/null
  fi

  # Extract topics summary
  if [ -s "${org_dir}/repos.jsonl" ]; then
    cat "${org_dir}/repos.jsonl" | python3 -c "
import sys, json
topics = {}
for line in sys.stdin:
    try:
        repo = json.loads(line)
        for t in (repo.get('topics') or []):
            topics[t] = topics.get(t, 0) + 1
    except: pass
for topic, count in sorted(topics.items(), key=lambda x: -x[1]):
    print(f'{topic}: {count}')
" > "${org_dir}/topics.txt" 2>/dev/null
  fi

  # Find production-ready repos (recently pushed, not archived, not fork)
  if [ -s "${org_dir}/repos.jsonl" ]; then
    cat "${org_dir}/repos.jsonl" | python3 -c "
import sys, json
from datetime import datetime, timezone
cutoff = datetime(2025, 6, 1, tzinfo=timezone.utc)
for line in sys.stdin:
    try:
        repo = json.loads(line)
        pushed = datetime.fromisoformat(repo['pushed_at'].replace('Z', '+00:00'))
        if (not repo.get('archived') and
            not repo.get('fork') and
            pushed > cutoff and
            (repo.get('size', 0) > 100)):
            print(json.dumps({
                'name': repo['name'],
                'language': repo.get('language'),
                'pushed_at': repo['pushed_at'],
                'size': repo['size'],
                'stars': repo.get('stargazers_count', 0),
                'url': repo.get('html_url'),
                'homepage': repo.get('homepage'),
                'description': repo.get('description')
            }))
    except: pass
" > "${org_dir}/production-candidates.jsonl" 2>/dev/null
  fi

  echo "${count}"
}

scrape_org_workflows() {
  local org="$1"
  local org_dir="${REPORT_DIR}/${org}"

  # Get workflows for each repo
  if [ -s "${org_dir}/repos.jsonl" ]; then
    cat "${org_dir}/repos.jsonl" | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        repo = json.loads(line)
        print(repo['name'])
    except: pass
" | while read -r repo; do
      gh api "repos/${org}/${repo}/actions/workflows" \
        -q '.workflows[] | {name: .name, state: .state, path: .path}' \
        >> "${org_dir}/workflows.jsonl" 2>/dev/null || true
    done
  fi
}

scan_for_products() {
  local org="$1"
  local org_dir="${REPORT_DIR}/${org}"

  info "Scanning ${org} for product indicators..."

  if [ -s "${org_dir}/repos.jsonl" ]; then
    cat "${org_dir}/repos.jsonl" | python3 -c "
import sys, json

product_indicators = [
    'package.json', 'requirements.txt', 'Cargo.toml', 'go.mod',
    'Dockerfile', 'docker-compose', 'railway.toml', 'vercel.json',
    'wrangler.toml', 'netlify.toml', 'fly.toml'
]

# Score repos by production readiness
for line in sys.stdin:
    try:
        repo = json.loads(line)
        score = 0
        reasons = []

        # Size indicates real code
        if repo.get('size', 0) > 500:
            score += 2
            reasons.append('substantial-codebase')
        if repo.get('size', 0) > 5000:
            score += 3
            reasons.append('large-codebase')

        # Stars indicate usage
        if repo.get('stargazers_count', 0) > 0:
            score += 1
            reasons.append('starred')

        # Has homepage = deployed
        if repo.get('homepage'):
            score += 3
            reasons.append('has-homepage')

        # Has pages = deployed
        if repo.get('has_pages'):
            score += 2
            reasons.append('github-pages')

        # Not a fork = original work
        if not repo.get('fork'):
            score += 2
            reasons.append('original')

        # Not archived = active
        if not repo.get('archived'):
            score += 1
            reasons.append('active')

        # Has description = documented
        if repo.get('description'):
            score += 1
            reasons.append('documented')

        if score >= 5:
            print(json.dumps({
                'name': repo['name'],
                'score': score,
                'reasons': reasons,
                'language': repo.get('language'),
                'url': repo.get('html_url'),
                'homepage': repo.get('homepage'),
                'description': repo.get('description'),
                'size': repo.get('size', 0),
                'stars': repo.get('stargazers_count', 0)
            }))
    except: pass
" > "${org_dir}/product-scores.jsonl" 2>/dev/null
  fi
}

generate_master_report() {
  local report_file="${REPORT_DIR}/MASTER-INDEX.md"

  info "Generating master report..."

  cat > "${report_file}" << 'HEADER'
# BlackRoad OS, Inc. — Master Organization Index

> Auto-generated by multi-org-scraper
> ALL CONTENT PROPRIETARY TO BLACKROAD OS, INC.

## Summary

HEADER

  local total_repos=0
  local total_products=0

  for org in "${ORGS[@]}"; do
    local org_dir="${REPORT_DIR}/${org}"
    local repo_count=$(wc -l < "${org_dir}/repos.jsonl" 2>/dev/null || echo 0)
    local product_count=$(wc -l < "${org_dir}/product-scores.jsonl" 2>/dev/null || echo 0)
    total_repos=$((total_repos + repo_count))
    total_products=$((total_products + product_count))

    echo "### ${org}" >> "${report_file}"
    echo "- **Repos**: ${repo_count}" >> "${report_file}"
    echo "- **Production candidates**: ${product_count}" >> "${report_file}"

    if [ -s "${org_dir}/languages.txt" ]; then
      echo "- **Languages**: $(head -5 "${org_dir}/languages.txt" | tr '\n' ', ')" >> "${report_file}"
    fi

    if [ -s "${org_dir}/product-scores.jsonl" ]; then
      echo "" >> "${report_file}"
      echo "**Top Products:**" >> "${report_file}"
      echo "| Repo | Score | Language | Description |" >> "${report_file}"
      echo "|------|-------|----------|-------------|" >> "${report_file}"
      cat "${org_dir}/product-scores.jsonl" | python3 -c "
import sys, json
repos = []
for line in sys.stdin:
    try:
        repos.append(json.loads(line))
    except: pass
for r in sorted(repos, key=lambda x: -x['score'])[:10]:
    desc = (r.get('description') or 'N/A')[:60]
    print(f\"| {r['name']} | {r['score']} | {r.get('language', 'N/A')} | {desc} |\")
" >> "${report_file}" 2>/dev/null
    fi

    echo "" >> "${report_file}"
  done

  # Add totals at top
  sed -i "s/## Summary/## Summary\n\n- **Total Organizations**: ${#ORGS[@]}\n- **Total Repositories**: ${total_repos}\n- **Production Candidates**: ${total_products}\n- **Scan Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)/" "${report_file}"

  log "Master report: ${report_file}"
}

generate_product_manifest() {
  local manifest="${REPORT_DIR}/product-manifest.json"

  info "Generating product manifest..."

  python3 -c "
import json, os, glob

report_dir = '${REPORT_DIR}'
products = []

for org_dir in sorted(glob.glob(os.path.join(report_dir, '*/'))):
    org_name = os.path.basename(os.path.normpath(org_dir))
    scores_file = os.path.join(org_dir, 'product-scores.jsonl')
    if os.path.exists(scores_file):
        with open(scores_file) as f:
            for line in f:
                try:
                    p = json.loads(line)
                    p['organization'] = org_name
                    products.append(p)
                except:
                    pass

products.sort(key=lambda x: -x.get('score', 0))

manifest = {
    'generated_at': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'total_products': len(products),
    'owner': 'BlackRoad OS, Inc.',
    'products': products
}

print(json.dumps(manifest, indent=2))
" > "${manifest}"

  log "Product manifest: ${manifest}"
}

# ============================================================================
# MAIN
# ============================================================================

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  BlackRoad OS, Inc. — Multi-Org Scraper                 ║"
echo "║  17 Organizations • 1,825+ Repositories                 ║"
echo "║  ALL PROPRIETARY — BlackRoad OS, Inc.                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

check_auth

log "Starting full org scrape..."
log "Output directory: ${REPORT_DIR}"

total=0
for org in "${ORGS[@]}"; do
  count=$(scrape_org "${org}")
  total=$((total + count))
  scan_for_products "${org}"
done

log "Total repos scraped: ${total}"

generate_master_report
generate_product_manifest

# Generate consolidated JSON index
python3 -c "
import json, os, glob

report_dir = '${REPORT_DIR}'
index = {
    'timestamp': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'owner': 'BlackRoad OS, Inc.',
    'organizations': {}
}

for org_dir in sorted(glob.glob(os.path.join(report_dir, '*/'))):
    org_name = os.path.basename(os.path.normpath(org_dir))
    repos_file = os.path.join(org_dir, 'repos.jsonl')
    repos = []
    if os.path.exists(repos_file):
        with open(repos_file) as f:
            for line in f:
                try:
                    repos.append(json.loads(line))
                except:
                    pass
    index['organizations'][org_name] = {
        'repo_count': len(repos),
        'repos': repos
    }

print(json.dumps(index, indent=2))
" > "${REPORT_DIR}/full-index.json"

echo ""
log "=== SCRAPE COMPLETE ==="
log "Report directory: ${REPORT_DIR}"
log "Master index:     ${REPORT_DIR}/MASTER-INDEX.md"
log "Product manifest: ${REPORT_DIR}/product-manifest.json"
log "Full JSON index:  ${REPORT_DIR}/full-index.json"
echo ""
echo -e "${YELLOW}NEXT: Run deploy-workflows.sh to dispatch to all repos${NC}"
