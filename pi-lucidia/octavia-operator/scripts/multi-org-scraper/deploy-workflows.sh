#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# BlackRoad OS, Inc. — Workflow Deployer
# Dispatches product-discovery + indexing workflows to ALL org repos
# Returns results to BlackRoad-OS-Inc/blackroad-operator
# ============================================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_DIR="${SCRIPT_DIR}/workflows"

# All 17 orgs
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

log()   { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }

check_auth() {
  if ! gh auth status &>/dev/null; then
    error "Not authenticated. Run: gh auth login"
    exit 1
  fi
}

deploy_workflow_to_repo() {
  local org="$1"
  local repo="$2"
  local workflow_file="$3"
  local workflow_name=$(basename "${workflow_file}")

  # Check if .github/workflows exists
  local has_workflows=$(gh api "repos/${org}/${repo}/contents/.github/workflows" -q 'length' 2>/dev/null || echo "0")

  # Create workflow via API
  local content=$(base64 -w 0 < "${workflow_file}")
  local path=".github/workflows/${workflow_name}"

  # Check if file exists
  local sha=$(gh api "repos/${org}/${repo}/contents/${path}" -q '.sha' 2>/dev/null || echo "")

  local json_payload
  if [ -n "${sha}" ]; then
    json_payload=$(jq -n --arg msg "Update ${workflow_name} via BlackRoad Operator" \
      --arg content "${content}" \
      --arg sha "${sha}" \
      '{message: $msg, content: $content, sha: $sha}')
  else
    json_payload=$(jq -n --arg msg "Add ${workflow_name} via BlackRoad Operator" \
      --arg content "${content}" \
      '{message: $msg, content: $content}')
  fi

  gh api "repos/${org}/${repo}/contents/${path}" \
    -X PUT \
    --input - <<< "${json_payload}" \
    -q '.content.html_url' 2>/dev/null && \
    log "Deployed ${workflow_name} → ${org}/${repo}" || \
    warn "Failed to deploy ${workflow_name} → ${org}/${repo}"
}

deploy_to_org() {
  local org="$1"
  info "Deploying workflows to ${org}..."

  # Get all repo names
  local repos=$(gh api "orgs/${org}/repos" --paginate \
    -q '.[] | select(.archived == false) | .name' 2>/dev/null)

  if [ -z "${repos}" ]; then
    warn "No repos found for ${org} (may be private/inaccessible)"
    return
  fi

  local count=0
  while IFS= read -r repo; do
    for wf in "${WORKFLOW_DIR}"/*.yml; do
      [ -f "${wf}" ] || continue
      deploy_workflow_to_repo "${org}" "${repo}" "${wf}"
      count=$((count + 1))
    done
  done <<< "${repos}"

  log "${org}: ${count} workflow deployments attempted"
}

# ============================================================================
# MAIN
# ============================================================================

echo -e "${MAGENTA}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  BlackRoad OS, Inc. — Workflow Deployer                 ║"
echo "║  Dispatching to ALL 17 Organizations                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

check_auth

if [ ! -d "${WORKFLOW_DIR}" ] || [ -z "$(ls -A "${WORKFLOW_DIR}"/*.yml 2>/dev/null)" ]; then
  error "No workflow files found in ${WORKFLOW_DIR}"
  error "Run this after workflow files have been created"
  exit 1
fi

log "Workflow files to deploy:"
for wf in "${WORKFLOW_DIR}"/*.yml; do
  echo "  - $(basename "${wf}")"
done
echo ""

# Deploy to all orgs
for org in "${ORGS[@]}"; do
  deploy_to_org "${org}"
done

log "=== DEPLOYMENT COMPLETE ==="
log "All workflows dispatched to 17 organizations"
log "Results will flow back to BlackRoad-OS-Inc/blackroad-operator"
