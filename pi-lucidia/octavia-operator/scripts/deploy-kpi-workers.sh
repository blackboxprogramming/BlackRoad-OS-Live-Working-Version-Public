#!/usr/bin/env bash
set -euo pipefail

# ─── BlackRoad KPI Workers Deployment Script ─────────────────────────────────
# Deploys all 6 KPI workers to Cloudflare in the correct order.
# Usage: ./scripts/deploy-kpi-workers.sh [worker|all]

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()   { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
info()  { echo -e "${CYAN}ℹ${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

WORKERS=(
  "kpi-collector"
  "kpi-github"
  "kpi-infra"
  "kpi-agents"
  "kpi-aggregator"
  "kpi-dashboard"
)

deploy_worker() {
  local worker="$1"
  local dir="$ROOT_DIR/workers/$worker"

  if [ ! -d "$dir" ]; then
    error "Worker directory not found: $dir"
    return 1
  fi

  info "Deploying $worker..."
  cd "$dir"

  if wrangler deploy 2>&1; then
    log "$worker deployed successfully"
  else
    error "$worker deployment failed"
    return 1
  fi

  cd "$ROOT_DIR"
}

verify_worker() {
  local worker="$1"
  local url="https://blackroad-$worker.blackroad.workers.dev/health"

  info "Verifying $worker at $url..."
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")

  if [ "$status" = "200" ]; then
    log "$worker is healthy (HTTP $status)"
  else
    warn "$worker returned HTTP $status (may still be propagating)"
  fi
}

TARGET="${1:-all}"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   BlackRoad KPI Workers — Deploy Pipeline     ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

if [ "$TARGET" = "all" ]; then
  info "Deploying all ${#WORKERS[@]} KPI workers..."
  echo ""
  for worker in "${WORKERS[@]}"; do
    deploy_worker "$worker"
  done
  echo ""
  info "Verifying deployments..."
  for worker in "${WORKERS[@]}"; do
    verify_worker "$worker"
  done
else
  deploy_worker "kpi-$TARGET"
  verify_worker "kpi-$TARGET"
fi

echo ""
log "Deployment complete!"
echo ""
echo -e "${CYAN}Dashboard:${NC}   https://blackroad-kpi-dashboard.blackroad.workers.dev"
echo -e "${CYAN}Aggregator:${NC}  https://blackroad-kpi-aggregator.blackroad.workers.dev/kpi"
echo -e "${CYAN}GitHub:${NC}      https://blackroad-kpi-github.blackroad.workers.dev/summary"
echo -e "${CYAN}Infra:${NC}       https://blackroad-kpi-infra.blackroad.workers.dev/summary"
echo -e "${CYAN}Agents:${NC}      https://blackroad-kpi-agents.blackroad.workers.dev/summary"
echo -e "${CYAN}Collector:${NC}   https://blackroad-kpi-collector.blackroad.workers.dev/metrics"
echo ""
