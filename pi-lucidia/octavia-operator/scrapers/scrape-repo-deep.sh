#!/usr/bin/env bash
set -euo pipefail
###############################################################################
# scrape-repo-deep.sh — Deep-scan a single repo for production signals
#
# Checks: package.json deps, CI/CD, deploy configs, Stripe, Clerk, auth,
#          database configs, API routes, env vars, and revenue indicators.
#
# Usage: ./scrape-repo-deep.sh <org/repo>
# Output: JSON to stdout (pipe to file as needed)
###############################################################################

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

REPO="${1:?Usage: $0 <org/repo>}"

log() { echo -e "${GREEN}[DEEP]${NC} $1" >&2; }
info() { echo -e "${CYAN}[INFO]${NC} $1" >&2; }

# Get repo metadata
info "Fetching metadata for ${REPO}..."
META=$(gh api "repos/${REPO}" --jq '{
  name: .name,
  full_name: .full_name,
  description: .description,
  language: .language,
  topics: .topics,
  homepage: .homepage,
  default_branch: .default_branch,
  private: .private,
  fork: .fork,
  archived: .archived,
  size: .size,
  updated_at: .updated_at,
  pushed_at: .pushed_at,
  has_pages: .has_pages
}' 2>/dev/null || echo '{}')

# Get file tree
info "Fetching file tree..."
TREE=$(gh api "repos/${REPO}/git/trees/HEAD?recursive=1" \
  --jq '[.tree[].path]' 2>/dev/null || echo '[]')

# Detect deploy targets
DEPLOY_TARGETS=$(echo "$TREE" | jq '[
  if any(. == "railway.toml") then "railway" else empty end,
  if any(. == "vercel.json") then "vercel" else empty end,
  if any(test("wrangler\\.toml")) then "cloudflare" else empty end,
  if any(. == "Dockerfile") then "docker" else empty end,
  if any(. == "fly.toml") then "fly" else empty end,
  if any(. == "netlify.toml") then "netlify" else empty end,
  if any(. == "render.yaml") then "render" else empty end,
  if any(. == "Procfile") then "heroku" else empty end,
  if any(test("^\\.github/workflows")) then "github-actions" else empty end
]' 2>/dev/null || echo '[]')

# Detect integrations from file tree
INTEGRATIONS=$(echo "$TREE" | jq '[
  if any(test("stripe"; "i")) then "stripe" else empty end,
  if any(test("clerk"; "i")) then "clerk" else empty end,
  if any(test("auth0"; "i")) then "auth0" else empty end,
  if any(test("supabase"; "i")) then "supabase" else empty end,
  if any(test("firebase"; "i")) then "firebase" else empty end,
  if any(test("prisma"; "i")) then "prisma" else empty end,
  if any(test("drizzle"; "i")) then "drizzle" else empty end,
  if any(test("next-auth|nextauth"; "i")) then "nextauth" else empty end,
  if any(test("sentry"; "i")) then "sentry" else empty end,
  if any(test("posthog"; "i")) then "posthog" else empty end,
  if any(test("resend"; "i")) then "resend" else empty end,
  if any(test("twilio"; "i")) then "twilio" else empty end,
  if any(test("sendgrid"; "i")) then "sendgrid" else empty end,
  if any(test("plaid"; "i")) then "plaid" else empty end
] | unique' 2>/dev/null || echo '[]')

# Detect tech stack from file tree
STACK=$(echo "$TREE" | jq '[
  if any(. == "package.json") then "node" else empty end,
  if any(test("next\\.config")) then "nextjs" else empty end,
  if any(test("nuxt\\.config")) then "nuxt" else empty end,
  if any(test("requirements\\.txt|pyproject\\.toml|setup\\.py")) then "python" else empty end,
  if any(. == "go.mod") then "go" else empty end,
  if any(. == "Cargo.toml") then "rust" else empty end,
  if any(test("tsconfig")) then "typescript" else empty end,
  if any(test("\\.sol$")) then "solidity" else empty end,
  if any(test("tailwind\\.config")) then "tailwind" else empty end,
  if any(test("prisma/schema\\.prisma")) then "prisma-orm" else empty end
] | unique' 2>/dev/null || echo '[]')

# Get workflows
WORKFLOWS=$(gh api "repos/${REPO}/actions/workflows" \
  --jq '[.workflows[] | {name: .name, state: .state, path: .path}]' 2>/dev/null || echo '[]')

# Check for env example
ENV_VARS='[]'
if echo "$TREE" | jq -e 'any(. == ".env.example")' &>/dev/null; then
  ENV_CONTENT=$(gh api "repos/${REPO}/contents/.env.example" \
    --jq '.content' 2>/dev/null | base64 -d 2>/dev/null || echo "")
  if [ -n "$ENV_CONTENT" ]; then
    ENV_VARS=$(echo "$ENV_CONTENT" | grep -E '^[A-Z_]+=' | cut -d= -f1 | jq -R . | jq -s . 2>/dev/null || echo '[]')
  fi
fi

# Build ROI score (0-100)
ROI_SCORE=0
echo "$DEPLOY_TARGETS" | jq -e 'length > 0' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 20))
echo "$INTEGRATIONS" | jq -e 'any(. == "stripe")' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 30))
echo "$INTEGRATIONS" | jq -e 'any(. == "clerk")' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 15))
echo "$INTEGRATIONS" | jq -e 'length > 2' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 10))
echo "$STACK" | jq -e 'any(. == "nextjs")' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 10))
echo "$STACK" | jq -e 'any(. == "typescript")' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 5))
echo "$WORKFLOWS" | jq -e 'length > 0' &>/dev/null && ROI_SCORE=$((ROI_SCORE + 10))

# Assemble output
jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --argjson meta "$META" \
  --argjson deploy "$DEPLOY_TARGETS" \
  --argjson integrations "$INTEGRATIONS" \
  --argjson stack "$STACK" \
  --argjson workflows "$WORKFLOWS" \
  --argjson env_vars "$ENV_VARS" \
  --argjson roi "$ROI_SCORE" \
  '{
    _metadata: {scanned_at: $ts, owner: "BlackRoad OS, Inc."},
    repo: $meta,
    production: {
      deploy_targets: $deploy,
      is_deployable: ($deploy | length > 0)
    },
    integrations: $integrations,
    tech_stack: $stack,
    workflows: $workflows,
    env_vars_detected: $env_vars,
    roi_score: $roi,
    classification: (
      if $roi >= 60 then "HIGH_ROI_PRODUCTION"
      elif $roi >= 30 then "MEDIUM_ROI_STAGING"
      else "LOW_ROI_DEV"
    end)
  }'

log "Deep scan complete for ${REPO}"
