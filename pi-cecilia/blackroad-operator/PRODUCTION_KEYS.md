# Production Keys Registry

> **CLASSIFIED — BlackRoad OS, Inc.**
> This file is the single source of truth for ALL production service credentials.
> It documents WHERE keys live and HOW to rotate them — never the keys themselves.
> Actual secrets are stored in their respective provider dashboards and local vaults.

**Last Updated:** 2026-02-28
**Owner:** alexa-amundson
**Stripe Account:** `acct_1SUDM8ChUUSEbzyh`

---

## Table of Contents

- [Key Locations Summary](#key-locations-summary)
- [Stripe (Payments)](#stripe-payments)
- [Cloudflare](#cloudflare)
- [Railway](#railway)
- [Vercel](#vercel)
- [DigitalOcean](#digitalocean)
- [GitHub](#github)
- [AI Providers](#ai-providers)
- [Database & Storage](#database--storage)
- [Communication & Monitoring](#communication--monitoring)
- [Device Fleet SSH](#device-fleet-ssh)
- [Salesforce](#salesforce)
- [Notion](#notion)
- [Rotation Schedule](#rotation-schedule)
- [Emergency Procedures](#emergency-procedures)

---

## Key Locations Summary

| Provider | Dashboard | Local Config | GitHub Secrets | Worker Secrets |
|----------|-----------|-------------|----------------|----------------|
| **Stripe** | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) | `~/.blackroad/stripe.conf` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `wrangler secret` |
| **Cloudflare** | [dash.cloudflare.com](https://dash.cloudflare.com) | `wrangler whoami` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | N/A (owner) |
| **Railway** | [railway.app/account/tokens](https://railway.app/account/tokens) | `railway whoami` | `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID` | N/A |
| **Vercel** | [vercel.com/account/tokens](https://vercel.com/account/tokens) | `vercel whoami` | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | N/A |
| **DigitalOcean** | [cloud.digitalocean.com/account/api](https://cloud.digitalocean.com/account/api) | `~/.blackroad/digitalocean.conf` | `DIGITALOCEAN_ACCESS_TOKEN` | N/A |
| **GitHub** | [github.com/settings/tokens](https://github.com/settings/tokens) | `gh auth status` | `GITHUB_TOKEN` (auto) | N/A |
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com) | Gateway only | `ANTHROPIC_API_KEY` | Gateway secret |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Gateway only | `OPENAI_API_KEY` | Gateway secret |
| **HuggingFace** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | `huggingface-cli whoami` | `HUGGINGFACE_TOKEN` | N/A |
| **Google Drive** | [console.cloud.google.com](https://console.cloud.google.com) | See [Google/Drive](#google-drive) | `GOOGLE_SERVICE_ACCOUNT_KEY` | N/A |

---

## Stripe (Payments)

### Account
- **Account ID:** `acct_1SUDM8ChUUSEbzyh`
- **Dashboard:** https://dashboard.stripe.com
- **Mode:** Live + Test environments

### Required Keys

| Key | Environment Variable | Where It Lives | Used By |
|-----|---------------------|----------------|---------|
| Secret Key (Live) | `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | Payment gateway, `br stripe` CLI |
| Secret Key (Test) | `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys (test) | Local dev, staging |
| Publishable Key (Live) | `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | Frontend checkout |
| Webhook Secret | `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks | `POST /webhook` endpoint |

### Stripe Price IDs (Create via `br stripe products create`)

| Product | Tier | Interval | Environment Variable | Amount |
|---------|------|----------|---------------------|--------|
| BlackRoad OS Pro | pro | monthly | `STRIPE_PRICE_PRO_MONTHLY` | $29/mo |
| BlackRoad OS Pro | pro | yearly | `STRIPE_PRICE_PRO_YEARLY` | $290/yr |
| BlackRoad OS Enterprise | enterprise | monthly | `STRIPE_PRICE_ENT_MONTHLY` | $199/mo |
| BlackRoad OS Enterprise | enterprise | yearly | `STRIPE_PRICE_ENT_YEARLY` | $1,990/yr |

### Where to Set Stripe Keys

```bash
# 1. Local CLI tool
br stripe auth sk_live_xxxxx

# 2. Cloudflare Worker secrets (payment-gateway)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_PRO_MONTHLY
wrangler secret put STRIPE_PRICE_PRO_YEARLY
wrangler secret put STRIPE_PRICE_ENT_MONTHLY
wrangler secret put STRIPE_PRICE_ENT_YEARLY

# 3. Self-hosted (phase4-services/.env)
cp migration/phase4-services/.env.example migration/phase4-services/.env
# Fill in: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, all price IDs

# 4. GitHub Actions secrets (for CI/CD)
gh secret set STRIPE_SECRET_KEY --repo BlackRoad-OS-Inc/blackroad-operator
gh secret set STRIPE_WEBHOOK_SECRET --repo BlackRoad-OS-Inc/blackroad-operator

# 5. Railway environment variables
railway variables set STRIPE_SECRET_KEY=sk_live_xxx
railway variables set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Stripe Products Setup (Run Once)

```bash
# Authenticate
br stripe auth sk_live_YOUR_KEY

# Create canonical products + prices in Stripe
br stripe products create

# Verify
br stripe products list
br stripe revenue
```

### Stripe Webhook Endpoints

| Endpoint | URL | Events |
|----------|-----|--------|
| Production (CF Worker) | `https://pay.blackroad.io/webhook` | `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*` |
| Production (Self-hosted) | `https://pay.blackroad.io/webhook` (port 3002) | Same |
| Staging | `https://pay-staging.blackroad.io/webhook` | Same (test mode) |

---

## Cloudflare

### Account
- **Account ID:** `848cf0b18d51e0170e0d1537aec3505a`
- **Dashboard:** https://dash.cloudflare.com

### Required Keys

| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| API Token (Global) | `CLOUDFLARE_API_TOKEN` | CF Dashboard → My Profile → API Tokens |
| Account ID | `CLOUDFLARE_ACCOUNT_ID` | `848cf0b18d51e0170e0d1537aec3505a` (public) |
| Tunnel Token | `CLOUDFLARE_TUNNEL_TOKEN` | CF Dashboard → Zero Trust → Tunnels |

### DNS Zones (19 Domains)

| Domain | Zone | Status |
|--------|------|--------|
| aliceqi.com | Cloudflare | Active |
| blackboxprogramming.io | Cloudflare | Active |
| blackroadai.com | Cloudflare | Active |
| blackroad.company | Cloudflare | Active |
| blackroadinc.us | Cloudflare | Active |
| **blackroad.io** | Cloudflare | **Primary** |
| blackroad.me | Cloudflare | Active |
| blackroad.network | Cloudflare | Active |
| blackroad.systems | Cloudflare | Active |
| blackroadqi.com | Cloudflare | Active |
| blackroadquantum.com | Cloudflare | Active |
| blackroadquantum.info | Cloudflare | Active |
| blackroadquantum.net | Cloudflare | Active |
| blackroadquantum.shop | Cloudflare | Active |
| blackroadquantum.store | Cloudflare | Active |
| lucidiaqi.com | Cloudflare | Active |
| lucidia.studio | Cloudflare | Active |
| roadchain.io | Cloudflare | Active |
| roadcoin.io | Cloudflare | Active |

### Workers (30 wrangler.toml configs in this repo)

| Worker | Config Path | Purpose |
|--------|------------|---------|
| blackroad-dashboard | `dashboard/wrangler.toml` | Dashboard worker |
| blackroad-os-api | `blackroad-os/workers/blackroad-os-api/wrangler.toml` | Core API |
| email-router | `blackroad-os/workers/email-router/wrangler.toml` | Email routing |
| auth | `workers/auth/wrangler.toml` | Authentication worker |
| copilot-cli | `workers/copilot-cli/wrangler.toml` | Copilot CLI bridge |
| email | `workers/email/wrangler.toml` | Email worker |
| email-setup | `workers/email-setup/wrangler.toml` | Email setup |
| blackroad-agent-os | `orgs/core/blackroad-agent-os/wrangler.toml` | Agent OS |
| blackroad-agents | `orgs/core/blackroad-agents/wrangler.toml` | Agents API |
| blackroad-cli | `orgs/core/blackroad-cli/wrangler.toml` | CLI worker |
| blackroad-hello | `orgs/core/blackroad-hello/wrangler.toml` | Hello/health |
| blackroad-os-dashboard | `orgs/core/blackroad-os-dashboard/wrangler.toml` | OS dashboard |
| blackroad-os-docs | `orgs/core/blackroad-os-docs/wrangler.toml` | Docs site |
| blackroad-os-metaverse | `orgs/core/blackroad-os-metaverse/wrangler.toml` | Metaverse |
| blackroad-os-metrics | `orgs/core/blackroad-os-metrics/scripts/cloudflare_workers/wrangler.toml` | Metrics |
| blackroad-os-pitstop | `orgs/core/blackroad-os-pitstop/wrangler.toml` | Portal hub |
| blackroad-os-roadcoin | `orgs/core/blackroad-os-roadcoin/wrangler.toml` | RoadCoin |
| blackroad-os-roadworld | `orgs/core/blackroad-os-roadworld/wrangler.toml` | Road World |
| blackroad-pi-ops | `orgs/core/blackroad-pi-ops/wrangler.toml` | Pi operations |
| blackroad-tools | `orgs/core/blackroad-tools/wrangler.toml` | Tools API |
| containers-template | `orgs/core/containers-template/wrangler.toml` | Container template |
| lucidia-core | `orgs/core/lucidia-core/wrangler.toml` | Lucidia core |
| lucidia-earth-website | `orgs/core/lucidia-earth-website/wrangler.toml` | Lucidia Earth |
| aria-infrastructure | `orgs/personal/aria-infrastructure-queen/website/wrangler.toml` | Aria infra |
| blackroad-dashboard (personal) | `orgs/personal/blackroad-dashboard/wrangler.toml` | Dashboard |
| blackroad-metaverse | `orgs/personal/blackroad-metaverse/wrangler.toml` | Metaverse |
| blackroad-pitstop | `orgs/personal/blackroad-pitstop/wrangler.toml` | Pitstop |
| blackroad-roadworld | `orgs/personal/blackroad-roadworld/wrangler.toml` | Road World |
| lucidia-blackroad-io | `orgs/personal/lucidia/blackroad.io/worker/wrangler.toml` | Lucidia worker |

### Where to Set Cloudflare Keys

```bash
# Local development
wrangler login

# GitHub Actions
gh secret set CLOUDFLARE_API_TOKEN --repo BlackRoad-OS-Inc/blackroad-operator
gh secret set CLOUDFLARE_ACCOUNT_ID --repo BlackRoad-OS-Inc/blackroad-operator
gh secret set CLOUDFLARE_TUNNEL_TOKEN --repo BlackRoad-OS-Inc/blackroad-operator

# Per-worker secrets
cd <worker-dir> && wrangler secret put <SECRET_NAME>
```

---

## Railway

### Projects (14 Total)

| # | Project ID | Name | Status |
|---|------------|------|--------|
| 01 | `9d3d2549-3778-4c86-8afd-cefceaaa74d2` | RoadWork Production | `[CONFIGURED]` |
| 02 | `6d4ab1b5-3e97-460e-bba0-4db86691c476` | RoadWork Staging | `[CONFIGURED]` |
| 03 | `aa968fb7-ec35-4a8b-92dc-1eba70fa8478` | BlackRoad Core Services | `[CONFIGURED]` |
| 04 | `e8b256aa-8708-4eb2-ba24-99eba4fe7c2e` | BlackRoad Operator | `[CONFIGURED]` |
| 05 | `85e6de55-fefd-4e8d-a9ec-d20c235c2551` | BlackRoad Master | `[CONFIGURED]` |
| 06 | `8ac583cb-ffad-40bd-8676-6569783274d1` | BlackRoad Beacon | `[CONFIGURED]` |
| 07 | `b61ecd98-adb2-4788-a2e0-f98e322af53a` | BlackRoad Packs | `[CONFIGURED]` |
| 08 | `47f557cf-09b8-40df-8d77-b34f91ba90cc` | Prism Console | `[CONFIGURED]` |
| 09 | `1a039a7e-a60c-42c5-be68-e66f9e269209` | BlackRoad Home | `[CONFIGURED]` |
| 10-14 | Reserved | Expansion | `[PENDING]` |

### Required Keys

| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| Railway Token | `RAILWAY_TOKEN` | [railway.app/account/tokens](https://railway.app/account/tokens) |
| Project ID | `RAILWAY_PROJECT_ID` | Per-project (see table above) |

### Railway Config Files (11 in this repo)

| Path | Purpose |
|------|---------|
| `orgs/core/blackroad-agent-os/railway.toml` | Agent OS service |
| `orgs/core/blackroad-agents/railway.toml` | Agents API service |
| `orgs/core/blackroad-cli/railway.toml` | CLI service |
| `orgs/core/blackroad-hello/railway.toml` | Hello/health service |
| `orgs/core/blackroad-os-docs/railway.toml` | Docs service |
| `orgs/core/blackroad-pi-ops/railway.toml` | Pi ops service |
| `orgs/core/blackroad-tools/railway.toml` | Tools service |
| `orgs/core/containers-template/railway.toml` | Container template |
| `orgs/core/lucidia-core/railway.toml` | Lucidia core |
| `orgs/core/lucidia-platform/api/railway.toml` | Lucidia Platform API |
| `orgs/core/lucidia-platform/deploy/railway.toml` | Lucidia Platform Deploy |

### Where to Set Railway Keys

```bash
# Local
railway login

# GitHub Actions
gh secret set RAILWAY_TOKEN --repo BlackRoad-OS-Inc/blackroad-operator

# Per-service env vars
railway link --project <project-id>
railway variables set KEY=value
```

---

## Vercel

### Account
- **Team:** `alexa-amundsons-projects`

### Required Keys

| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| Vercel Token | `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| Org ID | `VERCEL_ORG_ID` | Vercel Dashboard → Settings |
| Project ID | `VERCEL_PROJECT_ID` | Per-project settings |

### Vercel Config Files (4 in this repo)

| Path | Purpose |
|------|---------|
| `orgs/core/blackroad-os-web/vercel.json` | Main web app |
| `orgs/core/containers-template/vercel.json` | Container template |
| `orgs/enterprise/blackbox-airbyte/docusaurus/vercel.json` | Airbyte docs |
| `orgs/personal/clerk-docs/vercel.json` | Clerk docs |

### Where to Set Vercel Keys

```bash
# Local
vercel login

# GitHub Actions
gh secret set VERCEL_TOKEN --repo BlackRoad-OS-Inc/blackroad-operator
gh secret set VERCEL_ORG_ID --repo BlackRoad-OS-Inc/blackroad-operator
gh secret set VERCEL_PROJECT_ID --repo BlackRoad-OS-Inc/blackroad-operator

# Per-project env vars
vercel env add VARIABLE_NAME
```

---

## DigitalOcean

### Infrastructure

| Resource | Details |
|----------|---------|
| Primary Droplet | codex-infinity @ `159.65.43.12` |
| Failover Droplet | shellfish @ `174.138.44.45` |

### Required Keys

| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| Access Token | `DIGITALOCEAN_ACCESS_TOKEN` | [cloud.digitalocean.com/account/api](https://cloud.digitalocean.com/account/api) |
| Spaces Access Key | `DIGITALOCEAN_SPACES_KEY` | DO Dashboard → API → Spaces Keys |
| Spaces Secret Key | `DIGITALOCEAN_SPACES_SECRET` | DO Dashboard → API → Spaces Keys |

### Where to Set DO Keys

```bash
# Local CLI tool
br ocean auth <token>

# GitHub Actions
gh secret set DIGITALOCEAN_ACCESS_TOKEN --repo BlackRoad-OS-Inc/blackroad-operator
```

---

## GitHub

### Organizations (17 Total — ALL BlackRoad OS, Inc.)

| # | Organization | Repos |
|---|-------------|-------|
| 1 | BlackRoad-OS-Inc | 7 (corporate core) |
| 2 | BlackRoad-OS | 1,332+ |
| 3 | blackboxprogramming | 68 |
| 4 | BlackRoad-AI | 52 |
| 5 | BlackRoad-Cloud | 30 |
| 6 | BlackRoad-Security | 30 |
| 7 | BlackRoad-Foundation | 30 |
| 8 | BlackRoad-Hardware | 30 |
| 9 | BlackRoad-Media | 29 |
| 10 | BlackRoad-Interactive | 29 |
| 11 | BlackRoad-Education | 24 |
| 12 | BlackRoad-Gov | 23 |
| 13 | Blackbox-Enterprises | 21 |
| 14 | BlackRoad-Archive | 21 |
| 15 | BlackRoad-Labs | 20 |
| 16 | BlackRoad-Studio | 19 |
| 17 | BlackRoad-Ventures | 17 |

### Required Keys

| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| Personal Access Token | `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) |
| Actions Token | `GITHUB_TOKEN` | Auto-provided in workflows |

### GitHub Actions Secrets (Set Per Repo or Org-Wide)

```bash
# Org-wide secrets (recommended — set once, available to all repos)
gh secret set STRIPE_SECRET_KEY --org BlackRoad-OS-Inc
gh secret set CLOUDFLARE_API_TOKEN --org BlackRoad-OS-Inc
gh secret set CLOUDFLARE_ACCOUNT_ID --org BlackRoad-OS-Inc
gh secret set RAILWAY_TOKEN --org BlackRoad-OS-Inc
gh secret set VERCEL_TOKEN --org BlackRoad-OS-Inc
gh secret set DIGITALOCEAN_ACCESS_TOKEN --org BlackRoad-OS-Inc
gh secret set HUGGINGFACE_TOKEN --org BlackRoad-OS-Inc
gh secret set ANTHROPIC_API_KEY --org BlackRoad-OS-Inc
gh secret set OPENAI_API_KEY --org BlackRoad-OS-Inc
```

---

## AI Providers

### Anthropic (Claude)
| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| API Key | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

**Rule:** Never in agent code. Only in the Tokenless Gateway (`blackroad-core/`).

### OpenAI
| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| API Key | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

**Rule:** Never in agent code. Only in the Tokenless Gateway.

### HuggingFace
| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| Token | `HUGGINGFACE_TOKEN` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| User | `blackroadio` | HF account |

### Ollama (Local)
| Key | Environment Variable | Default |
|-----|---------------------|---------|
| Base URL | `OLLAMA_URL` | `http://localhost:11434` |

No API key required — local inference.

### Where to Set AI Keys

```bash
# Gateway environment only
export BLACKROAD_ANTHROPIC_API_KEY=sk-ant-xxx
export BLACKROAD_OPENAI_API_KEY=sk-xxx

# GitHub Actions
gh secret set ANTHROPIC_API_KEY --org BlackRoad-OS-Inc
gh secret set OPENAI_API_KEY --org BlackRoad-OS-Inc
gh secret set HUGGINGFACE_TOKEN --org BlackRoad-OS-Inc

# Verify no keys in agent code
blackroad-core/scripts/verify-tokenless-agents.sh
```

---

## Database & Storage

### PostgreSQL (Self-Hosted on Cecilia Pi)

| Key | Environment Variable | Default |
|-----|---------------------|---------|
| Host | `PG_HOST` | `10.10.0.2` (WireGuard) / `192.168.4.89` (LAN) |
| Port | `PG_PORT` | `5432` |
| User | `PG_USER` | `blackroad` |
| Password | `PG_PASSWORD` | Set during `setup-cecilia.sh` |
| Connection URL | `DATABASE_URL` | `postgresql://blackroad:xxx@10.10.0.2:5432/blackroad` |

### Redis (Self-Hosted on Cecilia Pi)

| Key | Environment Variable | Default |
|-----|---------------------|---------|
| Host | `REDIS_HOST` | `10.10.0.2` |
| Port | `REDIS_PORT` | `6379` |
| Password | `REDIS_PASSWORD` | Set during `setup-cecilia.sh` |

### MinIO / R2 Object Storage

| Key | Environment Variable | Notes |
|-----|---------------------|-------|
| Endpoint | `MINIO_ENDPOINT` | `10.10.0.3` (Lucidia Pi) |
| Port | `MINIO_PORT` | `9000` |
| Access Key | `MINIO_ACCESS_KEY` | `blackroad-admin` |
| Secret Key | `MINIO_SECRET_KEY` | Set during `setup-minio.sh` |
| R2 Bucket | `blackroad-models` | 135GB LLMs on Cloudflare R2 |

### Cloudflare D1 (6 databases)
Set via `wrangler.toml` `[[d1_databases]]` bindings.

### Cloudflare KV (11 namespaces)
Set via `wrangler.toml` `[[kv_namespaces]]` bindings.

### SQLite (Local CLI)

| Database | Path | Used By |
|----------|------|---------|
| Stripe cache | `~/.blackroad/stripe.db` | `br stripe` |
| DigitalOcean | `~/.blackroad/digitalocean.db` | `br ocean` |
| CECE identity | `~/.blackroad/cece-identity.db` | `br cece` |
| Memory | `~/.blackroad/memory/` | Memory system |

---

## Communication & Monitoring

### Sentry
| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| DSN | `SENTRY_DSN` | [sentry.io](https://sentry.io) project settings |
| Public DSN | `NEXT_PUBLIC_SENTRY_DSN` | Safe for client-side |

### SendGrid
| Key | Environment Variable | Where It Lives |
|-----|---------------------|----------------|
| API Key | `SENDGRID_API_KEY` | [app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys) |

### Tunnels

| Provider | Key | Environment Variable |
|----------|-----|---------------------|
| Cloudflare Tunnel | Token | `CLOUDFLARE_TUNNEL_TOKEN` |
| ngrok | Auth Token | `NGROK_AUTHTOKEN` |
| Tailscale | Auth Key | `TAILSCALE_AUTH_KEY` |

---

## Google Drive

### Setup Required

| Key | Environment Variable | Where to Get |
|-----|---------------------|-------------|
| Service Account JSON | `GOOGLE_SERVICE_ACCOUNT_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → IAM → Service Accounts |
| OAuth Client ID | `GOOGLE_CLIENT_ID` | GCP Console → APIs & Services → Credentials |
| OAuth Client Secret | `GOOGLE_CLIENT_SECRET` | GCP Console → APIs & Services → Credentials |
| Drive Folder ID | `GOOGLE_DRIVE_FOLDER_ID` | From Drive URL |

### Google Drive Integration Checklist

- [ ] Create GCP project for BlackRoad OS
- [ ] Enable Google Drive API
- [ ] Create service account with Drive access
- [ ] Download service account JSON key
- [ ] Share target Drive folder with service account email
- [ ] Set `GOOGLE_SERVICE_ACCOUNT_KEY` in GitHub Secrets
- [ ] Set `GOOGLE_DRIVE_FOLDER_ID` for backup targets

### Where to Set Google Keys

```bash
# GitHub Actions (base64-encode the JSON key)
cat service-account.json | base64 | gh secret set GOOGLE_SERVICE_ACCOUNT_KEY --org BlackRoad-OS-Inc

# Local
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## Device Fleet SSH

### Nodes

| Device | Hostname | Role | SSH |
|--------|----------|------|-----|
| Alice | alice | Control plane | `ssh pi@alice` |
| Aria | aria | Operations | `ssh pi@aria` |
| Octavia | octavia | AI inference | `ssh pi@octavia` |
| Codex | codex | Build / CI | `ssh pi@codex` |
| Shellfish | shellfish | Cloud bridge (DO) | `ssh root@159.65.43.12` |
| Anastasia | anastasia | Experimental | `ssh pi@anastasia` |
| Cecilia | cecilia | DB + DNS | `ssh pi@192.168.4.89` |
| Lucidia | lucidia | Object storage | `ssh pi@192.168.4.81` |

### SSH Key
- **Key:** `~/.ssh/id_ed25519`
- **Permissions:** `chmod 600 ~/.ssh/id_ed25519`

---

## Salesforce

| Key | Environment Variable | Value |
|-----|---------------------|-------|
| Profile 1 | `SALESFORCE_PROFILE_ID` | `w0290jck2ebf0xos3p` |
| Profile 2 | `SALESFORCE_USER` | `alexa-amundson` |
| Instance URL | `SALESFORCE_INSTANCE_URL` | Set in Salesforce org |
| Access Token | `SALESFORCE_ACCESS_TOKEN` | SF Connected App |

---

## Notion

| Key | Environment Variable | Value |
|-----|---------------------|-------|
| Workspace ID | `NOTION_WORKSPACE_ID` | `76cded82e3874f9db0d44dff11b8f2fd` |
| API Token | `NOTION_TOKEN` | [notion.so/my-integrations](https://www.notion.so/my-integrations) |

---

## Authentication Secrets (Per-App)

| Key | Environment Variable | Generate With |
|-----|---------------------|--------------|
| JWT Secret | `JWT_SECRET` | `openssl rand -base64 32` |
| NextAuth Secret | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| NextAuth URL | `NEXTAUTH_URL` | `https://blackroad.io` (prod) |
| MCP Bridge Token | `MCP_BRIDGE_TOKEN` | `openssl rand -hex 32` |
| Master Vault Key | `~/.blackroad/vault/.master.key` | `openssl rand -base64 64` |

---

## Rotation Schedule

| Secret Category | Rotation Frequency | Last Rotated | Next Due |
|----------------|-------------------|--------------|----------|
| Stripe API Keys | Quarterly | — | Set up |
| Cloudflare API Tokens | Quarterly | — | Set up |
| Railway Tokens | Quarterly | — | Set up |
| GitHub PATs | 90 days | — | Set up |
| AI Provider Keys | Quarterly | — | Set up |
| Database Passwords | Semi-annually | — | Set up |
| SSH Keys | Annually | — | Set up |
| JWT/Auth Secrets | Semi-annually | — | Set up |
| Webhook Secrets | On breach only | — | — |

---

## Emergency Procedures

### Key Compromised

```bash
# 1. Immediately rotate the compromised key at the provider dashboard
# 2. Update all locations where the key is used:

# GitHub org secrets
gh secret set <KEY_NAME> --org BlackRoad-OS-Inc

# Cloudflare worker secrets
cd <worker> && wrangler secret put <KEY_NAME>

# Railway
railway variables set <KEY_NAME>=<new-value>

# Local configs
# Update ~/.blackroad/*.conf files

# 3. Check for unauthorized usage in provider dashboards
# 4. Run security scan
br security scan
```

### Full Credentials Audit

```bash
# Scan for leaked secrets in codebase
blackroad-core/scripts/verify-tokenless-agents.sh

# Check GitHub secret scanning alerts
gh api repos/BlackRoad-OS-Inc/blackroad-operator/secret-scanning/alerts

# Verify no .env files committed
git log --all --diff-filter=A -- '*.env' ':!*.env.example'
```

---

**This file documents WHERE keys live. NEVER put actual key values in this file or any committed file.**

*© 2026 BlackRoad OS, Inc. All rights reserved. CLASSIFIED.*
