#!/usr/bin/env bash
# BlackRoad OS — workerd install & run script
# Installs Cloudflare's open-source Workers runtime on Debian/Ubuntu (Pi/DO)
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

WORKERD_DIR="/opt/blackroad-workerd"
WORKERD_VERSION="v1.20260302.0"
ARCH=$(uname -m)

log()   { echo -e "${GREEN}✓${NC} $1"; }
info()  { echo -e "${CYAN}→${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; exit 1; }

# ── Detect architecture ──────────────────────────────────────────────────────
case "$ARCH" in
  x86_64)  WORKERD_ARCH="linux-64" ;;
  aarch64) WORKERD_ARCH="linux-arm64" ;;
  *)       error "Unsupported architecture: $ARCH" ;;
esac

# ── Install workerd binary ───────────────────────────────────────────────────
install_workerd() {
  if command -v workerd &>/dev/null; then
    log "workerd already installed: $(workerd --version 2>/dev/null || echo 'unknown version')"
    return
  fi

  info "Installing workerd ${WORKERD_VERSION} for ${WORKERD_ARCH}..."
  
  # Try npm first (easiest)
  if command -v npm &>/dev/null; then
    npm install -g workerd@latest && log "workerd installed via npm" && return
  fi

  # Fallback: download binary directly
  DOWNLOAD_URL="https://github.com/cloudflare/workerd/releases/download/${WORKERD_VERSION}/workerd-${WORKERD_ARCH}"
  info "Downloading from ${DOWNLOAD_URL}..."
  curl -fsSL "$DOWNLOAD_URL" -o /usr/local/bin/workerd
  chmod +x /usr/local/bin/workerd
  log "workerd binary installed to /usr/local/bin/workerd"
}

# ── Set up project directory ─────────────────────────────────────────────────
setup_dir() {
  info "Setting up ${WORKERD_DIR}..."
  mkdir -p "$WORKERD_DIR/workers"
  
  # Copy workers from this script's directory
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cp -r "$SCRIPT_DIR/../workers/"* "$WORKERD_DIR/workers/" 2>/dev/null || true
  cp "$SCRIPT_DIR/../workerd.capnp" "$WORKERD_DIR/" 2>/dev/null || true
  
  log "Project files copied to ${WORKERD_DIR}"
}

# ── Write secrets file ───────────────────────────────────────────────────────
write_secrets() {
  info "Writing secrets from environment..."
  SECRETS_FILE="$WORKERD_DIR/secrets.capnp"
  
  # Read secrets from ~/.blackroad/stripe/ 
  source ~/.blackroad/stripe/brand-kit-ids.env 2>/dev/null || true

  cat > "$SECRETS_FILE" << EOF
# Auto-generated — do not commit
# Update workerd.capnp bindings with actual secrets before running
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-""}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-""}
EOF
  chmod 600 "$SECRETS_FILE"
  log "Secrets written to ${SECRETS_FILE}"
}

# ── Create systemd services ───────────────────────────────────────────────────
install_services() {
  info "Installing systemd services..."
  
  for service in stripe router gateway; do
    cat > "/etc/systemd/system/blackroad-workerd-${service}.service" << EOF
[Unit]
Description=BlackRoad workerd — ${service} worker
After=network.target
Wants=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=${WORKERD_DIR}
ExecStart=/usr/local/bin/workerd serve workerd.capnp
Restart=on-failure
RestartSec=5s
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
  done

  # Single unified service (all workers in one process via capnp)
  cat > "/etc/systemd/system/blackroad-workerd.service" << 'EOF'
[Unit]
Description=BlackRoad OS — workerd edge runtime
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/blackroad-workerd
ExecStart=/usr/local/bin/workerd serve workerd.capnp
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable blackroad-workerd
  log "systemd service installed and enabled"
}

# ── Start service ─────────────────────────────────────────────────────────────
start_service() {
  info "Starting blackroad-workerd..."
  systemctl start blackroad-workerd
  sleep 2
  if systemctl is-active --quiet blackroad-workerd; then
    log "blackroad-workerd is running"
    echo ""
    echo -e "${CYAN}  Ports:${NC}"
    echo "    8081 — stripe worker  (POST /checkout, /portal, /webhook, /prices)"
    echo "    8082 — router worker  (routes by subdomain)"
    echo "    8083 — gateway worker (proxies to Ollama/Claude/OpenAI)"
  else
    error "Service failed to start. Check: journalctl -u blackroad-workerd -n 50"
  fi
}

# ── Caddy for TLS termination ─────────────────────────────────────────────────
install_caddy_proxy() {
  info "Installing Caddy as TLS reverse proxy..."
  
  if ! command -v caddy &>/dev/null; then
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https 2>/dev/null || true
    curl -fsSL https://dl.cloudflare.com/caddy/stable/debian.deb -o /tmp/caddy.deb 2>/dev/null || \
      curl -1sSLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
        | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg && \
      curl -1sSLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
        | tee /etc/apt/sources.list.d/caddy-stable.list && \
      apt-get update && apt-get install caddy -y
  fi

  cat > "/etc/caddy/Caddyfile" << 'EOF'
# BlackRoad OS — Edge Proxy
# TLS handled by Caddy (auto-HTTPS), forwards to workerd ports

stripe.blackroad.io {
  reverse_proxy localhost:8081
}

stripe.blackroadai.com {
  reverse_proxy localhost:8081
}

# Self-hosted AI gateway (private, bind to tailscale IP)
gateway.internal.blackroad.io {
  reverse_proxy localhost:8083
}

# Health check endpoint
:8080 {
  respond /health 200
  respond "BlackRoad Edge v1.0"
}
EOF

  systemctl restart caddy 2>/dev/null || service caddy restart 2>/dev/null || true
  log "Caddy configured and restarted"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════╗"
  echo -e "║   BlackRoad OS — workerd Edge Runtime        ║"
  echo -e "╚══════════════════════════════════════════════╝${NC}"
  echo ""

  case "${1:-install}" in
    install)
      install_workerd
      setup_dir
      write_secrets
      [ "$(id -u)" = "0" ] && install_services && start_service || \
        warn "Not root — skipping systemd install. Run: workerd serve ${WORKERD_DIR}/workerd.capnp"
      ;;
    dev)
      # Local dev mode — run directly
      info "Starting in dev mode..."
      cd "$WORKERD_DIR"
      exec workerd serve workerd.capnp
      ;;
    status)
      systemctl status blackroad-workerd 2>/dev/null || echo "Not running as systemd service"
      curl -s http://localhost:8081/health 2>/dev/null && echo "" || echo "Stripe port 8081 not responding"
      ;;
    logs)
      journalctl -u blackroad-workerd -f --no-pager
      ;;
    caddy)
      install_caddy_proxy
      ;;
    *)
      echo "Usage: $0 [install|dev|status|logs|caddy]"
      ;;
  esac
}

main "$@"
