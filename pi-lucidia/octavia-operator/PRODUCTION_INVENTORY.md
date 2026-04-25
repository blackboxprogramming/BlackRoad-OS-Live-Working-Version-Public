# Production Inventory

> **BlackRoad OS, Inc. — Complete Production Asset Registry**
> Every product, service, domain, worker, agent, device, and deployment.
> Single source of truth for production readiness.

**Last Updated:** 2026-02-28
**Total Files:** 125,000+
**Total Repos:** 1,825+
**Total Agents:** 30,000

---

## Table of Contents

- [Production Products (Stripe)](#production-products-stripe)
- [Canonical Pricing (Single Source of Truth)](#canonical-pricing-single-source-of-truth)
- [Per-Service Stripe Products](#per-service-stripe-products)
- [Live Deployments](#live-deployments)
- [Cloudflare Workers (30 configs)](#cloudflare-workers-30-configs)
- [Cloudflare DNS Zones (19 domains)](#cloudflare-dns-zones-19-domains)
- [Cloudflare Storage](#cloudflare-storage)
- [Railway Services (11 configs)](#railway-services-11-configs)
- [Vercel Apps (4 configs)](#vercel-apps-4-configs)
- [Device Fleet (8 nodes)](#device-fleet-8-nodes)
- [Agent Registry (17 agents)](#agent-registry-17-agents)
- [GitHub Organizations (17 orgs)](#github-organizations-17-orgs)
- [CLI Tools (84+ tools)](#cli-tools-84-tools)
- [Dashboards (128 scripts)](#dashboards-128-scripts)
- [Self-Hosted Migration Services](#self-hosted-migration-services)
- [Production Readiness Checklist](#production-readiness-checklist)
- [Google Drive Accounting](#google-drive-accounting)

---

## Production Products (Stripe)

### Stripe Account
- **Account ID:** `acct_1SUDM8ChUUSEbzyh`
- **Dashboard:** https://dashboard.stripe.com

### Canonical Pricing (Single Source of Truth)

**Source file:** `migration/phase4-services/payment-gateway/pricing.ts`

| Tier | Monthly | Yearly | Agents | Tasks/mo | Trial | Stripe Env Vars |
|------|---------|--------|--------|----------|-------|-----------------|
| **Free** | $0 | $0 | 3 | 100 | — | — |
| **Pro** | $29 | $290 | 100 | 10,000 | 14 days | `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY` |
| **Enterprise** | $199 | $1,990 | Unlimited | Unlimited | 14 days | `STRIPE_PRICE_ENT_MONTHLY`, `STRIPE_PRICE_ENT_YEARLY` |
| **Enterprise Custom** | Custom | Custom | Custom | Custom | — | Contact sales |

### Free Tier Features
- 3 AI Agents
- 100 tasks/month
- Community support
- Basic analytics
- Public API (rate-limited)

### Pro Tier Features
- 100 AI Agents
- 10,000 tasks/month
- Priority support
- Advanced analytics
- Custom integrations
- API access (unlimited)
- Webhook notifications
- Tokenless gateway (:8787)
- Agent email routing (@blackroad.io)
- PS-SHA-infinity memory persistence
- Web dashboard + SSE fleet
- `br oracle` (LLM reflection)

### Enterprise Tier Features
- Unlimited AI Agents
- Unlimited tasks
- 24/7 phone + Slack support
- Custom analytics dashboards
- Dedicated account manager
- On-premise deployment option
- SLA guarantees (99.9%)
- SSO / SAML
- Audit logs
- 30,000 agent runtime
- Railway A100/H100 GPU
- Custom agent identities
- Dedicated Cloudflare Workers
- Direct line to Alexa

### Website Pricing Page (Alternative Display)

**Source file:** `websites/pricing/index.html`

| Tier | Price | Tagline |
|------|-------|---------|
| Solo | Free | The full br CLI. All 84 tools. No account required. |
| Pro | $49/mo (billed annually) | Tokenless gateway + agent emails + full runtime |
| Enterprise | Custom | 30K agents. Railway GPU. Dedicated infra. SLA. |

> **ACTION NEEDED:** Reconcile pricing.ts ($29 Pro) vs pricing page ($49 Pro). Pick one and align.

---

## Per-Service Stripe Products

9 services have `stripe-config.json` with per-service pricing:

| Service | Repo | Basic | Pro | Enterprise |
|---------|------|-------|-----|-----------|
| Agent OS | `BlackRoad-OS/blackroad-agent-os` | $9/mo | $29/mo | $99/mo |
| Agents API | `BlackRoad-OS/blackroad-agents` | $9/mo | $29/mo | $99/mo |
| CLI | `BlackRoad-OS/blackroad-cli` | $9/mo | $29/mo | $99/mo |
| Hello | `BlackRoad-OS/blackroad-hello` | $9/mo | $29/mo | $99/mo |
| Docs | `BlackRoad-OS/blackroad-os-docs` | $9/mo | $29/mo | $99/mo |
| Pi Ops | `BlackRoad-OS/blackroad-pi-ops` | $9/mo | $29/mo | $99/mo |
| Tools | `BlackRoad-OS/blackroad-tools` | $9/mo | $29/mo | $99/mo |
| Containers | `BlackRoad-OS/containers-template` | $9/mo | $29/mo | $99/mo |
| Lucidia Core | `BlackRoad-OS/lucidia-core` | $9/mo | $29/mo | $99/mo |

> **ACTION NEEDED:** These per-service configs are templated boilerplate. Decide: unified platform pricing OR per-service pricing. Recommendation: use the canonical pricing.ts as the single source.

### Stripe Setup Commands

```bash
# 1. Authenticate
br stripe auth sk_live_YOUR_KEY

# 2. Create canonical products in Stripe
br stripe products create
# Creates: Pro ($29/mo, $290/yr) + Enterprise ($199/mo, $1,990/yr)

# 3. Set price IDs as worker secrets
wrangler secret put STRIPE_PRICE_PRO_MONTHLY    # paste price_xxx
wrangler secret put STRIPE_PRICE_PRO_YEARLY     # paste price_xxx
wrangler secret put STRIPE_PRICE_ENT_MONTHLY    # paste price_xxx
wrangler secret put STRIPE_PRICE_ENT_YEARLY     # paste price_xxx

# 4. Create webhook endpoint in Stripe Dashboard
# URL: https://pay.blackroad.io/webhook
# Events: checkout.session.completed, customer.subscription.*, invoice.payment_*

# 5. Set webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET       # paste whsec_xxx

# 6. Verify
br stripe products list
br stripe revenue
```

---

## Live Deployments

### Cloudflare Pages (Verified Live)

| Domain | Deployment URL | Status |
|--------|---------------|--------|
| os.blackroad.io | `a81f29a4.blackroad-os-web.pages.dev` | `[DEPLOYED]` |
| products.blackroad.io | `79ea5ba2.blackroad-dashboard.pages.dev` | `[DEPLOYED]` |
| roadtrip.blackroad.io | `1486760f.blackroad-pitstop.pages.dev` | `[DEPLOYED]` |
| pitstop.blackroad.io | `30db9407.blackroad-portals.pages.dev` | `[DEPLOYED]` |

### Payment Gateway

| URL | Backend | Port | Status |
|-----|---------|------|--------|
| pay.blackroad.io | Hono (Node.js) self-hosted | 3002 | `[CONFIGURED]` |
| pay.blackroad.io | Cloudflare Worker (legacy) | — | `[CONFIGURED]` |

---

## Cloudflare Workers (30 configs)

### Production Workers

| # | Worker Name | Config Path | Category |
|---|------------|-------------|----------|
| 1 | `blackroad-operator` | `dashboard/wrangler.toml` | Dashboard |
| 2 | `blackroad-os-api` | `blackroad-os/workers/blackroad-os-api/wrangler.toml` | Core API |
| 3 | `email-router` | `blackroad-os/workers/email-router/wrangler.toml` | Email |
| 4 | `blackroad-email` | `workers/email/wrangler.toml` | Email |
| 5 | `auth` | `workers/auth/wrangler.toml` | Auth |
| 6 | `copilot-cli` | `workers/copilot-cli/wrangler.toml` | CLI |
| 7 | `email-setup` | `workers/email-setup/wrangler.toml` | Email |
| 8 | `blackroad-agent-os` | `orgs/core/blackroad-agent-os/wrangler.toml` | Agents |
| 9 | `blackroad-agents` | `orgs/core/blackroad-agents/wrangler.toml` | Agents |
| 10 | `blackroad-cli` | `orgs/core/blackroad-cli/wrangler.toml` | CLI |
| 11 | `blackroad-hello` | `orgs/core/blackroad-hello/wrangler.toml` | Health |
| 12 | `blackroad-os-dashboard` | `orgs/core/blackroad-os-dashboard/wrangler.toml` | Dashboard |
| 13 | `blackroad-os-docs` | `orgs/core/blackroad-os-docs/wrangler.toml` | Docs |
| 14 | `blackroad-os-metaverse` | `orgs/core/blackroad-os-metaverse/wrangler.toml` | 3D/VR |
| 15 | `blackroad-os-metrics` | `orgs/core/blackroad-os-metrics/scripts/cloudflare_workers/wrangler.toml` | Metrics |
| 16 | `blackroad-os-pitstop` | `orgs/core/blackroad-os-pitstop/wrangler.toml` | Portal |
| 17 | `blackroad-os-roadcoin` | `orgs/core/blackroad-os-roadcoin/wrangler.toml` | Crypto |
| 18 | `blackroad-os-roadworld` | `orgs/core/blackroad-os-roadworld/wrangler.toml` | World |
| 19 | `blackroad-pi-ops` | `orgs/core/blackroad-pi-ops/wrangler.toml` | Pi |
| 20 | `blackroad-tools` | `orgs/core/blackroad-tools/wrangler.toml` | Tools |
| 21 | `containers-template` | `orgs/core/containers-template/wrangler.toml` | Template |
| 22 | `lucidia-core` | `orgs/core/lucidia-core/wrangler.toml` | AI |
| 23 | `lucidia-earth-website` | `orgs/core/lucidia-earth-website/wrangler.toml` | Web |
| 24 | `aria-infrastructure` | `orgs/personal/aria-infrastructure-queen/website/wrangler.toml` | Infra |
| 25 | `blackroad-dashboard` | `orgs/personal/blackroad-dashboard/wrangler.toml` | Dashboard |
| 26 | `blackroad-metaverse` | `orgs/personal/blackroad-metaverse/wrangler.toml` | 3D |
| 27 | `blackroad-pitstop` | `orgs/personal/blackroad-pitstop/wrangler.toml` | Portal |
| 28 | `blackroad-roadworld` | `orgs/personal/blackroad-roadworld/wrangler.toml` | World |
| 29 | `lucidia-blackroad-io` | `orgs/personal/lucidia/blackroad.io/worker/wrangler.toml` | Web |
| 30 | `blackroad-dashboard (app)` | `blackroad-os/apps/blackroad-dashboard/wrangler.toml` | Dashboard |

### KV Namespaces (Real IDs)

| Binding | Namespace ID | Worker |
|---------|-------------|--------|
| `AGENT_INBOXES` | `d3cbe4e1ab814905b8c29cad110001d1` | email-router |
| `INBOX` | `b6c3379f5951468b99ec33264b9dd6dd` | blackroad-email |
| `REVOCATIONS` | — | auth |

---

## Cloudflare DNS Zones (19 Domains)

| # | Domain | Category | Primary Use |
|---|--------|----------|-------------|
| 1 | **blackroad.io** | **Primary** | Main platform domain |
| 2 | blackroadai.com | AI | AI-focused landing |
| 3 | blackroad.company | Corporate | Company site |
| 4 | blackroadinc.us | Corporate | US entity |
| 5 | blackroad.me | Personal | Personal brand |
| 6 | blackroad.network | Infrastructure | Network services |
| 7 | blackroad.systems | Infrastructure | Systems portal |
| 8 | blackboxprogramming.io | Developer | Dev portfolio |
| 9 | aliceqi.com | Agent | Alice agent site |
| 10 | blackroadqi.com | Quantum | Quantum computing |
| 11 | blackroadquantum.com | Quantum | Quantum main |
| 12 | blackroadquantum.info | Quantum | Quantum info |
| 13 | blackroadquantum.net | Quantum | Quantum network |
| 14 | blackroadquantum.shop | Quantum | Quantum shop |
| 15 | blackroadquantum.store | Quantum | Quantum store |
| 16 | lucidiaqi.com | AI | Lucidia QI |
| 17 | lucidia.studio | AI | Lucidia creative |
| 18 | roadchain.io | Crypto | Blockchain |
| 19 | roadcoin.io | Crypto | RoadCoin |

---

## Cloudflare Storage

### R2 Buckets

| Bucket | Size | Contents |
|--------|------|----------|
| `blackroad-models` | 135GB | Quantized LLMs (Qwen 72B, Llama 70B, DeepSeek R1) |

### D1 Databases (6)
Configured via `wrangler.toml` `[[d1_databases]]` bindings.

### KV Namespaces (11)
Configured via `wrangler.toml` `[[kv_namespaces]]` bindings.

---

## Railway Services (11 configs)

| # | Service | Config Path | Purpose |
|---|---------|------------|---------|
| 1 | blackroad-agent-os | `orgs/core/blackroad-agent-os/railway.toml` | Agent operating system |
| 2 | blackroad-agents | `orgs/core/blackroad-agents/railway.toml` | Agents API (FastAPI) |
| 3 | blackroad-cli | `orgs/core/blackroad-cli/railway.toml` | CLI cloud service |
| 4 | blackroad-hello | `orgs/core/blackroad-hello/railway.toml` | Health/hello service |
| 5 | blackroad-os-docs | `orgs/core/blackroad-os-docs/railway.toml` | Documentation (Docusaurus) |
| 6 | blackroad-pi-ops | `orgs/core/blackroad-pi-ops/railway.toml` | Pi operations API |
| 7 | blackroad-tools | `orgs/core/blackroad-tools/railway.toml` | CRM/ERP tools |
| 8 | containers-template | `orgs/core/containers-template/railway.toml` | Container service template |
| 9 | lucidia-core | `orgs/core/lucidia-core/railway.toml` | AI reasoning engine |
| 10 | lucidia-platform API | `orgs/core/lucidia-platform/api/railway.toml` | Lucidia platform API |
| 11 | lucidia-platform Deploy | `orgs/core/lucidia-platform/deploy/railway.toml` | Lucidia deployment |

### Railway Project IDs

| # | Project ID | Name |
|---|------------|------|
| 01 | `9d3d2549-3778-4c86-8afd-cefceaaa74d2` | RoadWork Production |
| 02 | `6d4ab1b5-3e97-460e-bba0-4db86691c476` | RoadWork Staging |
| 03 | `aa968fb7-ec35-4a8b-92dc-1eba70fa8478` | BlackRoad Core Services |
| 04 | `e8b256aa-8708-4eb2-ba24-99eba4fe7c2e` | BlackRoad Operator |
| 05 | `85e6de55-fefd-4e8d-a9ec-d20c235c2551` | BlackRoad Master |
| 06 | `8ac583cb-ffad-40bd-8676-6569783274d1` | BlackRoad Beacon |
| 07 | `b61ecd98-adb2-4788-a2e0-f98e322af53a` | BlackRoad Packs |
| 08 | `47f557cf-09b8-40df-8d77-b34f91ba90cc` | Prism Console |
| 09 | `1a039a7e-a60c-42c5-be68-e66f9e269209` | BlackRoad Home |

---

## Vercel Apps (4 configs)

| # | App | Config Path | Framework |
|---|-----|------------|-----------|
| 1 | blackroad-os-web | `orgs/core/blackroad-os-web/vercel.json` | Next.js 16 |
| 2 | containers-template | `orgs/core/containers-template/vercel.json` | Next.js |
| 3 | blackbox-airbyte docs | `orgs/enterprise/blackbox-airbyte/docusaurus/vercel.json` | Docusaurus |
| 4 | clerk-docs | `orgs/personal/clerk-docs/vercel.json` | Next.js |

**Vercel Team:** `alexa-amundsons-projects`

---

## Device Fleet (8 nodes)

| # | Device | Hostname | Role | IP | RAM Budget |
|---|--------|----------|------|-----|-----------|
| 1 | Alice | alice | Control plane | `192.168.4.49` | — |
| 2 | Aria | aria | Operations | `192.168.4.82` | 4GB |
| 3 | Octavia | octavia | AI inference (PRIMARY) | `192.168.4.38` | 3GB |
| 4 | Codex | codex | Build / CI | — | — |
| 5 | Cecilia | cecilia | DB + DNS | `192.168.4.89` | 4GB |
| 6 | Lucidia | lucidia | Object storage | `192.168.4.81` | 1GB |
| 7 | Anastasia | anastasia | Experimental | `174.138.44.45` | — |
| 8 | Shellfish | shellfish (codex-infinity) | Cloud bridge (DO) | `159.65.43.12` | 2GB |

### Agent Capacity Distribution

| Device | Agents | Role |
|--------|--------|------|
| Octavia Pi | 22,500 | PRIMARY |
| Lucidia Pi | 7,500 | SECONDARY |
| Shellfish Droplet | 0 (failover) | FAILOVER |
| **Total** | **30,000** | — |

---

## Agent Registry (17 agents)

### AI Agents

| # | Agent | Email | Role | Host | Model | Color |
|---|-------|-------|------|------|-------|-------|
| 1 | **LUCIDIA** | lucidia@blackroad.io | Philosopher | 192.168.4.81 | qwen3:8b | Purple |
| 2 | **ALICE** | alice@blackroad.io | Operator | 192.168.4.49 | llama3.2:3b | Cyan |
| 3 | **OCTAVIA** | octavia@blackroad.io | Architect | 192.168.4.38 | qwen2.5-coder:3b | Green |
| 4 | **ARIA** | aria@blackroad.io | Dreamer | 192.168.4.82 | llama3.2:3b | Blue |
| 5 | **CECILIA (CECE)** | cecilia@blackroad.io | Core Intelligence | 192.168.4.89 | cece3b:latest | Yellow |
| 6 | **CIPHER** | cipher@blackroad.io | Guardian | 159.65.43.12 | deepseek-coder:1.3b | Red |
| 7 | **ANASTASIA** | anastasia@blackroad.io | Infrastructure | 174.138.44.45 | — | Dim |
| 8 | **GEMATRIA** | gematria@blackroad.io | Edge Gateway | 159.65.43.12 | — | Dim |
| 9 | **PRISM** | prism@blackroad.io | Analyst | — | — | — |
| 10 | **ECHO** | echo@blackroad.io | Memory | — | — | — |
| 11 | **ORACLE** | oracle@blackroad.io | — | — | — | — |
| 12 | **ATLAS** | atlas@blackroad.io | — | — | — | — |
| 13 | **SHELLFISH** | shellfish@blackroad.io | Hacker | — | llama3.2:1b | — |

### Human Operators

| Name | Email | Role | GitHub |
|------|-------|------|--------|
| Alexa Amundson | alexa@blackroad.io | Founder / OS Architect | blackboxprogramming |

---

## GitHub Organizations (17 orgs)

| # | Organization | Repos | Focus |
|---|-------------|-------|-------|
| 1 | **BlackRoad-OS-Inc** | 7 | Corporate core (PRIVATE) |
| 2 | **BlackRoad-OS** | 1,332+ | Core platform |
| 3 | **blackboxprogramming** | 68 | Primary development |
| 4 | **BlackRoad-AI** | 52 | AI/ML stack |
| 5 | **BlackRoad-Cloud** | 30 | Cloud infrastructure |
| 6 | **BlackRoad-Security** | 30 | Security tools |
| 7 | **BlackRoad-Foundation** | 30 | Business tools |
| 8 | **BlackRoad-Hardware** | 30 | IoT/hardware |
| 9 | **BlackRoad-Media** | 29 | Media/content |
| 10 | **BlackRoad-Interactive** | 29 | Games/graphics |
| 11 | **BlackRoad-Education** | 24 | Learning |
| 12 | **BlackRoad-Gov** | 23 | Governance |
| 13 | **Blackbox-Enterprises** | 21 | Enterprise automation |
| 14 | **BlackRoad-Archive** | 21 | Archival |
| 15 | **BlackRoad-Labs** | 20 | Research |
| 16 | **BlackRoad-Studio** | 19 | Creative tools |
| 17 | **BlackRoad-Ventures** | 17 | Business/finance |

**Total: 1,825+ repositories**

---

## CLI Tools (84+ tools)

### br CLI Tools (in tools/ directory)

| # | Tool | Command | Purpose |
|---|------|---------|---------|
| 1 | agent-gateway | `br gateway` | Tokenless gateway management |
| 2 | agent-mesh | `br mesh` | Agent mesh coordination |
| 3 | agent-router | `br router` | Task routing |
| 4 | agent-runtime | `br runtime` | Agent runtime |
| 5 | agent-tasks | `br tasks` | Task management |
| 6 | agents-live | `br agents` | Live agent dashboard |
| 7 | ai | `br ai` | AI model management |
| 8 | api-tester | `br api` | HTTP testing |
| 9 | auth | `br auth` | Authentication |
| 10 | backup-manager | `br backup` | Backups |
| 11 | brand | `br brand` | Brand assets |
| 12 | broadcast | `br broadcast` | Agent broadcast |
| 13 | cece-identity | `br cece` | CECE identity |
| 14 | ci-pipeline | `br ci` | CI/CD |
| 15 | cloudflare | `br cloudflare` | Cloudflare management |
| 16 | code-quality | `br quality` | Linting |
| 17 | coding-assistant | `br code` | Code assistant |
| 18 | collab | `br collab` | Collaboration |
| 19 | compliance-scanner | `br compliance` | Compliance |
| 20 | context | `br context` | Context management |
| 21 | context-radar | `br radar` | Context radar |
| 22 | cron | `br cron` | Scheduled tasks |
| 23 | dashboard | `br dashboard` | Dashboard |
| 24 | db-client | `br db` | Database client |
| 25 | dependency-helper | `br deps` | Dependencies |
| 26 | deploy-cmd | `br deploy` | Deployment |
| 27 | deploy-manager | `br deploy-manager` | Deploy orchestration |
| 28 | docker-manager | `br docker` | Docker |
| 29 | docs | `br docs` | Documentation |
| 30 | email | `br email` | Email management |
| 31 | env-check | `br env` | Environment check |
| 32 | env-manager | `br env-manager` | Env management |
| 33 | file-finder | `br find` | File search |
| 34 | fleet | `br fleet` | Fleet management |
| 35 | geb | `br geb` | GEB oracle |
| 36 | git-ai | `br git-ai` | AI-powered git |
| 37 | git-integration | `br git` | Git operations |
| 38 | health-check | `br health` | Health check |
| 39 | journal | `br journal` | Dev journal |
| 40 | log-parser | `br logs` | Log parsing |
| 41 | log-tail | `br tail` | Log tailing |
| 42 | mail | `br mail` | Mail operations |
| 43 | metrics-dashboard | `br metrics` | Metrics |
| 44 | nodes | `br nodes` | Node management |
| 45 | notifications | `br notifications` | Notifications |
| 46 | notify | `br notify` | Notify |
| 47 | ocean-droplets | `br ocean` | DigitalOcean |
| 48 | oracle | `br oracle` | LLM oracle |
| 49 | org | `br org` | Org management |
| 50 | org-audit | `br audit` | Org audit |
| 51 | pair-programming | `br pair` | Pair programming |
| 52 | pdf-read | `br pdf` | PDF reader |
| 53 | perf-monitor | `br perf` | Performance |
| 54 | pi | `br pi` | Pi management |
| 55 | pi-manager | `br pi-manager` | Pi fleet |
| 56 | port | `br port` | Port management |
| 57 | project-init | `br init` | Project init |
| 58 | pulse | `br pulse` | Pulse monitor |
| 59 | quick-notes | `br note` | Notes |
| 60 | review | `br review` | Code review |
| 61 | roundup | `br roundup` | Daily roundup |
| 62 | search | `br search` | Code search |
| 63 | secrets-vault | `br vault` | Secrets vault |
| 64 | security-hardening | `br harden` | Security hardening |
| 65 | security-scanner | `br security` | Security scan |
| 66 | session-manager | `br session` | Session management |
| 67 | smart-search | `br smart-search` | Smart search |
| 68 | snapshot | `br snapshot` | Snapshot |
| 69 | snippet-manager | `br snippet` | Snippets |
| 70 | ssh | `br ssh` | SSH management |
| 71 | ssl-manager | `br ssl` | SSL management |
| 72 | standup | `br standup` | Standup notes |
| 73 | status-all | `br status` | Status overview |
| 74 | **stripe** | `br stripe` | **Stripe management** |
| 75 | sync | `br sync` | Sync operations |
| 76 | talk | `br talk` | Agent conversations |
| 77 | task-manager | `br task` | Task manager |
| 78 | task-runner | `br run` | Task runner |
| 79 | template | `br template` | Templates |
| 80 | test-suite | `br test` | Test runner |
| 81 | timeline | `br timeline` | Timeline |
| 82 | vercel-pro | `br vercel` | Vercel management |
| 83 | web-dev | `br web` | Web development |
| 84 | web-monitor | `br monitor` | Web monitoring |
| 85 | whoami | `br whoami` | Identity |
| 86 | wifi-scanner | `br wifi` | WiFi scan |
| 87 | worker-bridge | `br bridge` | Worker bridge |
| 88 | world | `br world` | ASCII world |
| 89 | worlds | `br worlds` | Multi-world |

---

## Dashboards (128 scripts)

128 shell-based dashboards in `dashboards/` directory, including:

### Production-Critical

| Dashboard | Purpose |
|-----------|---------|
| `blackroad-dashboard.sh` | Main system dashboard |
| `blackroad-master-control.sh` | Master control panel |
| `blackroad-live-dashboard.sh` | Live metrics |
| `live-system-dashboard.sh` | System metrics |
| `live-github-dashboard.sh` | GitHub activity |
| `stripe-automation.sh` | Stripe revenue/subscriptions |
| `security-dashboard.sh` | Security overview |
| `database-monitor.sh` | Database health |
| `api-health-check.sh` | API health |
| `deployment-timeline.sh` | Deployment history |
| `auto-ceo-mode.sh` | Executive overview |
| `auto-agent-coordinator.sh` | Agent coordination |
| `corporate-agents.sh` | Corporate agent status |

### Infrastructure

| Dashboard | Purpose |
|-----------|---------|
| `device-cloudflare.sh` | Cloudflare status |
| `device-github.sh` | GitHub status |
| `device-railway.sh` | Railway status |
| `device-raspberry-pi.sh` | Pi fleet status |
| `docker-fleet.sh` | Docker containers |
| `network-topology-3d.sh` | Network viz |
| `ssl-cert-tracker.sh` | SSL cert expiry |
| `dns-record-viewer.sh` | DNS records |
| `services-ports-map.sh` | Service port map |

---

## Self-Hosted Migration Services

### Migration Phases (Cloudflare → Self-Hosted)

| Phase | Directory | Status |
|-------|-----------|--------|
| 0 | `migration/phase0-export/` | Export all CF data |
| 1 | `migration/phase1-postgres-redis/` | PostgreSQL + Redis on Cecilia |
| 2 | `migration/phase2-minio/` | MinIO on Lucidia |
| 3 | `migration/phase3-wireguard-caddy/` | WireGuard mesh + Caddy |
| 4 | `migration/phase4-services/` | Port Workers to Hono |
| 5-8 | Planned | DNS cutover → Decommission |

### Self-Hosted Services (Phase 4)

| Service | Port | Host | Purpose |
|---------|------|------|---------|
| API Gateway | 3000 | Octavia (192.168.4.38) | Main API routing |
| Payment Gateway | 3002 | Cecilia (192.168.4.89) | Stripe checkout + webhooks |
| Info Server | 3001 | Octavia | Service info |
| Subdomain Router | 3003 | Octavia | Subdomain routing |

---

## Google Drive Accounting

### Current State
Google Drive integration is **NOT YET CONFIGURED** in this repo.

### Required Setup

| Step | Action | Status |
|------|--------|--------|
| 1 | Create GCP project `blackroad-os` | `[TODO]` |
| 2 | Enable Google Drive API | `[TODO]` |
| 3 | Create service account | `[TODO]` |
| 4 | Download service account JSON key | `[TODO]` |
| 5 | Share Drive folders with service account | `[TODO]` |
| 6 | Set `GOOGLE_SERVICE_ACCOUNT_KEY` in GitHub Secrets | `[TODO]` |
| 7 | Set `GOOGLE_DRIVE_FOLDER_ID` for backups | `[TODO]` |
| 8 | Create backup automation workflow | `[TODO]` |

### Recommended Drive Folder Structure

```
BlackRoad OS (Shared Drive)/
├── Backups/
│   ├── Database/          # PostgreSQL dumps
│   ├── KV-Snapshots/      # KV namespace exports
│   ├── D1-Exports/        # D1 database exports
│   └── R2-Manifests/      # R2 bucket manifests
├── Credentials/           # Encrypted credential backups
├── Documentation/         # Architecture docs exports
├── Agent-Logs/            # Agent activity logs
├── Revenue-Reports/       # Stripe revenue exports
└── Compliance/            # Audit trails
```

### Where to Set Google Keys

```bash
# GitHub Actions (base64-encode the JSON key)
cat service-account.json | base64 | gh secret set GOOGLE_SERVICE_ACCOUNT_KEY --org BlackRoad-OS-Inc

# Local development
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Railway
railway variables set GOOGLE_SERVICE_ACCOUNT_KEY=$(base64 < service-account.json)
```

---

## Production Readiness Checklist

### Payments (Stripe)

- [ ] Authenticate: `br stripe auth sk_live_xxx`
- [ ] Create products: `br stripe products create`
- [ ] Note price IDs from output
- [ ] Set worker secrets (6 vars — see PRODUCTION_KEYS.md)
- [ ] Create webhook endpoint in Stripe Dashboard
- [ ] Set webhook secret
- [ ] Test checkout flow end-to-end
- [ ] Verify: `br stripe revenue`

### Infrastructure (Cloudflare)

- [ ] Verify `wrangler login` authenticated
- [ ] Deploy core workers: `wrangler deploy` in each worker dir
- [ ] Verify KV namespaces created
- [ ] Verify D1 databases created
- [ ] Verify R2 bucket `blackroad-models` accessible
- [ ] Verify tunnel running on blackroad-pi

### Infrastructure (Railway)

- [ ] Verify `railway login` authenticated
- [ ] Link projects to Railway: `railway link` in each service
- [ ] Set env vars for each service
- [ ] Deploy: `railway up`
- [ ] Verify health endpoints

### Infrastructure (Vercel)

- [ ] Verify `vercel login` authenticated
- [ ] Deploy blackroad-os-web: `vercel --prod`
- [ ] Set env vars in Vercel dashboard

### Infrastructure (DigitalOcean)

- [ ] Verify droplets accessible
- [ ] SSH to shellfish: `ssh root@159.65.43.12`
- [ ] SSH to anastasia: `ssh root@174.138.44.45`

### Device Fleet

- [ ] Ping all Pis from LAN
- [ ] Verify SSH to alice, aria, octavia, codex, cecilia, lucidia, anastasia
- [ ] Verify Ollama running on inference nodes
- [ ] Verify cloudflared tunnel on octavia

### GitHub

- [ ] Set org-wide secrets (see PRODUCTION_KEYS.md)
- [ ] Verify CI workflows passing
- [ ] Verify Dependabot alerts addressed

### Google Drive

- [ ] Create GCP project
- [ ] Enable Drive API
- [ ] Create service account
- [ ] Set GitHub secret
- [ ] Create backup workflow
- [ ] Test backup → Drive upload

### AI Providers

- [ ] Set `ANTHROPIC_API_KEY` in gateway
- [ ] Set `OPENAI_API_KEY` in gateway
- [ ] Set `HUGGINGFACE_TOKEN` in GitHub secrets
- [ ] Verify tokenless agent compliance: `verify-tokenless-agents.sh`

### Security

- [ ] Rotate all keys (see rotation schedule in PRODUCTION_KEYS.md)
- [ ] Run `br security scan`
- [ ] Check GitHub secret scanning alerts
- [ ] Verify vault master key: `~/.blackroad/vault/.master.key` (chmod 400)
- [ ] Verify no `.env` files committed

---

**MOVE FASTER. THINK HARDER. ALWAYS BELIEVE.**

*© 2026 BlackRoad OS, Inc. All rights reserved. CLASSIFIED.*
