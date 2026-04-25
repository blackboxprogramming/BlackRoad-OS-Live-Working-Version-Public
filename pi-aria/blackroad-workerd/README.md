# BlackRoad OS — Self-Hosted Edge Runtime

> Run Cloudflare Workers **on your own hardware** using [workerd](https://github.com/cloudflare/workerd) — Cloudflare's open-source Workers runtime.

```
Pi / DigitalOcean
├── workerd (port 8081) → stripe worker
├── workerd (port 8082) → router worker  
├── workerd (port 8083) → AI gateway worker
└── Caddy → TLS termination → workerd ports
```

## Quick Start

```bash
# Install workerd globally
npm install -g workerd

# Run locally (dev)
npm run dev

# Deploy to Pi
npm run deploy:pi

# Deploy to DigitalOcean droplet
npm run deploy:do
```

## Workers

| Worker | Port | Routes |
|--------|------|--------|
| `stripe` | 8081 | `/checkout`, `/portal`, `/webhook`, `/prices`, `/health` |
| `router` | 8082 | Routes by subdomain to service workers |
| `gateway` | 8083 | Proxies to Ollama / Claude / OpenAI |

## Secrets

Before running, set secrets in `workerd.capnp` bindings or export env vars:

```bash
export STRIPE_SECRET_KEY="sk_live_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Production (systemd)

```bash
# Install as systemd service (requires root)
sudo bash scripts/install.sh

# Check status
npm run status:pi
npm run logs:pi
```

## Why workerd?

- **Zero CF billing** — run Workers code on your own infra
- **Same runtime** — identical V8 isolates, same APIs as Cloudflare
- **Local AI** — gateway worker proxies to Ollama on the same machine
- **No cold starts** — persistent process, instant response
- **ARM64 support** — runs on Raspberry Pi 4/5

## Architecture

```
Internet
    │
    ▼
Caddy (auto-TLS via Let's Encrypt)
    │
    ├── stripe.blackroad.io → workerd:8081 (stripe worker)
    ├── gateway.blackroad.io → workerd:8083 (AI gateway)
    └── *.internal → Tailscale mesh
```
