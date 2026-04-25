# 🌌 BLACKROAD MASTER ORCHESTRATION PLAN
## The Complete Infrastructure → Product → Ecosystem Blueprint

**Version:** 1.0
**Date:** 2025-11-18
**Architect:** Claude (Sonnet 4.5) via Master Orchestration Prompt
**Operator:** Alexa Louise Amundson (Cadillac)

---

## EXECUTIVE SUMMARY

This document orchestrates the **complete BlackRoad universe** across all layers:

- **Infrastructure**: Cloudflare → GoDaddy → Railway → GitHub
- **Repositories**: 6-repo structure (or monorepo evolution)
- **Domains**: 10+ domains with strategic routing
- **OS Layers**: Lucidia → Prism → CloudWay → RoadChain → Vault → Quantum Lab → MetaCity
- **Agent Orchestration**: Atlas/Operator workflow
- **Execution**: 3-phase roadmap (18-24 months)

**Current State**: You have a working Windows 95-style OS with FastAPI backend, multiple domains configured, and comprehensive vision documents.

**Target State**: A fully orchestrated, multi-domain, multi-agent ecosystem ready for Phase 1 enterprise pilots.

---

## PART 1: TOP-LEVEL MASTER PLAN

### The Stack (Bottom to Top)

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 7: USER EXPERIENCE                                   │
│ → blackroad.systems (corporate)                             │
│ → blackroadai.com (console)                                 │
│ → blackroad.me (identity)                                   │
│ → lucidia.earth (narrative)                                 │
│ → blackroad.network (developers)                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 6: APPLICATION LAYER (Pocket OS)                     │
│ → Win95 UI shell (HTML/CSS/JS)                              │
│ → Native apps: Prism, Lucidia, RoadStudio, CloudWay, etc.  │
│ → Served from: Railway (backend) + GitHub Pages (static)   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: API GATEWAY & ROUTING                             │
│ → FastAPI backend (Railway)                                 │
│ → API routes: /api/prism, /api/lucidia, /api/vault, etc.   │
│ → WebSocket for real-time (Prism, MetaCity)                │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: ORCHESTRATION & INTELLIGENCE                      │
│ → Lucidia Layer (AI multi-model orchestration)             │
│ → Prism Layer (job queue, event log, metrics)              │
│ → Operator Engine (scheduled agents, workflows)            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: DATA & STATE                                      │
│ → PostgreSQL (Railway managed DB)                           │
│ → Redis (caching, WebSocket state)                          │
│ → RoadChain (audit ledger, blockchain state)               │
│ → Vault (tamper-evident storage, compliance logs)          │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: COMPUTE & INFRASTRUCTURE                          │
│ → Railway (production backend, DB, Redis)                  │
│ → DigitalOcean droplets (future: RoadChain nodes)          │
│ → Cloudflare Workers (edge functions, if needed)           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: DNS & CDN                                         │
│ → Cloudflare (DNS, SSL, caching, DDoS protection)          │
│ → GoDaddy (domain registrar → migrate DNS to Cloudflare)   │
└─────────────────────────────────────────────────────────────┘
```

### The Flow: User Request → Response

**Example: User visits os.blackroad.systems**

1. **DNS Resolution** (Cloudflare)
   - User browser → Cloudflare DNS
   - `os.blackroad.systems` → CNAME → `blackroad-os-production.up.railway.app`
   - Cloudflare returns Railway IP

2. **SSL/CDN** (Cloudflare)
   - Cloudflare terminates SSL
   - Checks cache (if static assets)
   - Proxies request to Railway

3. **Routing** (Railway)
   - Railway load balancer → FastAPI backend
   - FastAPI serves `backend/static/index.html` at `/`
   - Static assets (JS, CSS, images) served directly

4. **OS Boot** (Browser)
   - Browser loads `index.html`
   - JavaScript boots OS shell
   - OS makes API calls to `/api/*` endpoints

5. **API Calls** (FastAPI → Prism/Lucidia/etc.)
   - User opens Prism Console app
   - JS calls `GET /api/prism/jobs`
   - FastAPI → Prism Layer → PostgreSQL
   - Returns job data as JSON
   - OS renders in Win95 window

6. **Real-time Updates** (WebSocket)
   - Prism Console establishes WebSocket
   - FastAPI → Prism Layer → Redis pub/sub
   - Job status changes pushed to client
   - OS updates UI in real-time

---

## PART 2: CLOUDFLARE DNS BLUEPRINT

### DNS Migration Strategy

**Current State**: Domains registered with GoDaddy, DNS managed by GoDaddy
**Target State**: Domains registered with GoDaddy, DNS managed by Cloudflare

**Why Cloudflare DNS?**
- Free tier includes: DNS, SSL, CDN, DDoS protection
- Better performance (global anycast network)
- CNAME flattening (allows root domain CNAMEs)
- Easy integration with Railway, Workers
- Future-ready for WAF, Zero Trust, edge functions

### Migration Checklist

1. **Add Domain to Cloudflare**
   - Go to Cloudflare dashboard → "Add a site"
   - Enter `blackroad.systems`
   - Choose Free plan
   - Cloudflare scans existing DNS records from GoDaddy

2. **Update Nameservers at GoDaddy**
   - Cloudflare provides 2 nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`)
   - Log in to GoDaddy
   - Go to domain settings → Nameservers → "Change nameservers"
   - Switch from GoDaddy to Custom
   - Enter Cloudflare nameservers
   - Save (propagation takes 5-60 minutes)

3. **Verify DNS Active**
   - Wait for Cloudflare to detect nameserver change
   - Check status in Cloudflare dashboard (should say "Active")

4. **Configure SSL**
   - Cloudflare → SSL/TLS → Set to "Full (strict)"
   - Cloudflare → SSL/TLS → Edge Certificates → Enable "Always Use HTTPS"

5. **Repeat for All Domains**
   - `blackroad.systems`, `blackroad.ai`, `blackroad.network`, etc.

### DNS Records Configuration

**Root Domain: blackroad.systems**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `blackroad-os-production.up.railway.app` | ✅ Proxied | Root domain → Railway (CNAME flattening) |
| CNAME | www | `blackroad.systems` | ✅ Proxied | www → apex redirect |
| CNAME | os | `blackroad.systems` | ✅ Proxied | Alternative alias |
| CNAME | api | `blackroad-os-production.up.railway.app` | ✅ Proxied | Explicit API subdomain |
| CNAME | prism | `blackroad-os-production.up.railway.app` | ✅ Proxied | Prism Console subdomain |
| CNAME | docs | `blackboxprogramming.github.io` | ✅ Proxied | GitHub Pages for docs |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | - | Email SPF (if using Google Workspace) |
| MX | @ | `1 aspmx.l.google.com` | - | Email MX (if using Gmail) |

**Domain: blackroad.ai**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `os.blackroad.systems` | ✅ Proxied | Alias to main OS |
| CNAME | www | `blackroad.ai` | ✅ Proxied | www redirect |

**Domain: blackroad.network**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | ✅ Proxied | Developer docs on GitHub Pages |
| CNAME | www | `blackroad.network` | ✅ Proxied | www redirect |
| CNAME | api | `blackroad-os-production.up.railway.app` | ✅ Proxied | API access for developers |

**Domain: blackroad.me**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `os.blackroad.systems` | ✅ Proxied | Personal identity portal |
| CNAME | www | `blackroad.me` | ✅ Proxied | www redirect |

**Domain: lucidia.earth**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | ✅ Proxied | Narrative site (Phase 2) |
| CNAME | www | `lucidia.earth` | ✅ Proxied | www redirect |

**Domain: aliceqi.com**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `blackboxprogramming.github.io` | ✅ Proxied | ALICE QI research site (Phase 2) |
| CNAME | www | `aliceqi.com` | ✅ Proxied | www redirect |

**Domain: roadwallet.com**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `os.blackroad.systems` | ✅ Proxied | Alias to OS wallet |
| CNAME | www | `roadwallet.com` | ✅ Proxied | www redirect |

**Domain: aliceos.io**

| Type | Name | Target | Proxy | Notes |
|------|------|--------|-------|-------|
| CNAME | @ | `os.blackroad.systems` | ✅ Proxied | Legacy alias |
| CNAME | www | `aliceos.io` | ✅ Proxied | www redirect |

### Automation with Cloudflare API

**Script: `scripts/cloudflare/sync_dns.py`**

```python
#!/usr/bin/env python3
"""
Sync DNS records from domains.yaml to Cloudflare
"""
import os
import yaml
import requests

CF_API_TOKEN = os.getenv("CF_API_TOKEN")
CF_ZONE_ID = os.getenv("CF_ZONE_ID")

def load_domains():
    with open("ops/domains.yaml") as f:
        return yaml.safe_load(f)

def create_dns_record(zone_id, record):
    url = f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records"
    headers = {
        "Authorization": f"Bearer {CF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers, json=record)
    return response.json()

# Add full implementation...
```

---

## PART 3: GITHUB ENTERPRISE STRUCTURE

### Current Repository Architecture

**Option 1: Monorepo (Current State)**
- Single repo: `blackboxprogramming/BlackRoad-Operating-System`
- Contains: OS frontend, backend, docs, infrastructure config
- Pros: Simple, single source of truth
- Cons: Large repo, harder to scale teams

**Option 2: Multi-Repo (Future Evolution)**
- `blackroad-os-core` - Core OS runtime, identity (PS-SHA∞)
- `blackroad-os-prism-console` - Admin, observability, Prism UI
- `blackroad-os-operator` - Workers, schedulers, agent orchestration
- `blackroad-os-api` - Backend API gateway, routing, schemas
- `blackroad-os-web` - Pocket OS web interface (frontend)
- `blackroad-os-docs` - Codex, specs, standards, whitepapers

**Recommendation**: **Stay monorepo for Phase 1**, split in Phase 2 when teams grow.

### GitHub Org Structure

**Organization**: `blackboxprogramming` (or create `blackroad` org)

**Teams**:
- `@blackroad/core` - Core OS contributors
- `@blackroad/frontend` - UI/UX contributors
- `@blackroad/backend` - API/infrastructure
- `@blackroad/docs` - Documentation writers
- `@blackroad/community` - External contributors

### Branch Protection Rules

**Branch**: `main` (or `master`)
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks to pass (CI, lint, tests)
- ✅ Require branches to be up to date
- ❌ Do NOT allow force pushes
- ❌ Do NOT allow deletions

**Branch**: `develop` (if using GitFlow)
- ✅ Require pull request
- ✅ Require status checks
- ✅ Allow force push (for rebasing)

**Branch**: `claude/*` (for AI agents)
- ✅ Allow direct commits (for AI agent workflows)
- ✅ Require status checks
- ❌ No protection (temporary branches)

### Required Status Checks

From `.github/workflows/`:
- `CI / lint` - Linting (frontend + backend)
- `CI / type-check` - TypeScript/Python type checking
- `CI / test-backend` - Backend tests (pytest)
- `CI / test-frontend` - Frontend tests (if added)
- `CI / build` - Build verification

### CODEOWNERS

Create `.github/CODEOWNERS`:

```
# Global owners
* @alexa-amundson @cadillac

# Backend
/backend/** @blackroad/backend
/backend/app/** @alexa-amundson

# Frontend
/blackroad-os/** @blackroad/frontend
/backend/static/** @blackroad/frontend

# Infrastructure
/.github/workflows/** @blackroad/backend
/scripts/** @blackroad/backend
/ops/** @alexa-amundson

# Docs
/docs/** @blackroad/docs
/README.md @blackroad/docs
```

### GitHub Actions Workflows

**Existing Workflows** (in `.github/workflows/`):
- `ci.yml` - Main CI (lint, test, build)
- `backend-tests.yml` - Backend test suite
- `railway-deploy.yml` - Deploy to Railway
- `railway-automation.yml` - Railway secrets audit
- `deploy.yml` - GitHub Pages deploy
- `sync-domains.yml` - Domain sync automation
- `domain-health.yml` - Domain health checks

**Recommended Additions**:

1. **PR Labeler** (`.github/workflows/pr-labeler.yml`)
   - Auto-label PRs based on changed files
   - Labels: `backend`, `frontend`, `docs`, `infra`

2. **Release Automation** (`.github/workflows/release.yml`)
   - Auto-generate changelog
   - Create GitHub release
   - Tag version

3. **Dependency Updates** (Dependabot)
   - Auto-create PRs for dependency updates
   - Configure in `.github/dependabot.yml`

4. **Security Scanning** (CodeQL)
   - Automated security scanning
   - Configure in `.github/workflows/codeql.yml`

### Issue Templates

Create `.github/ISSUE_TEMPLATE/`:

**1. Bug Report** (`bug_report.md`)
```markdown
---
name: Bug Report
about: Report a bug in BlackRoad OS
labels: bug
---

## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [BlackRoad OS version]
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, iPhone]

## Screenshots
[If applicable]
```

**2. Feature Request** (`feature_request.md`)
**3. Documentation** (`documentation.md`)

### Project Boards

**Org-level Project Board**: "BlackRoad OS Roadmap"

**Columns**:
- 📋 Backlog
- 🎯 Phase 1 (Prove the OS)
- 🚀 Phase 2 (Expand Intelligence)
- 🌍 Phase 3 (Ecosystem)
- 🏃 In Progress
- ✅ Done

**Automation**:
- Issues with label `Phase 1` → auto-add to "Phase 1" column
- PRs merged → auto-move to "Done"

---

## PART 4: RAILWAY DEPLOYMENT MAP

### Railway Project Structure

**Project**: `BlackRoad-Operating-System-Production`

**Services**:

| Service Name | Type | Purpose | Source | Environment |
|--------------|------|---------|--------|-------------|
| `backend` | Web | FastAPI API + static UI | `/backend` | Production |
| `postgres` | Database | PostgreSQL 15 | Railway plugin | Production |
| `redis` | Database | Redis 7 | Railway plugin | Production |

**Future Services** (Phase 2+):
- `prism-worker` - Background job worker (Celery/RQ)
- `lucidia-api` - AI orchestration microservice
- `roadchain-node` - Blockchain node (might use DigitalOcean instead)

### Environment Variables

**Service: `backend`**

From `infra/env/ENVIRONMENT_MAP.md` and `backend/.env.example`:

| Variable | Value | Notes |
|----------|-------|-------|
| `ENVIRONMENT` | `production` | Runtime environment |
| `DEBUG` | `False` | Never true in production |
| `SECRET_KEY` | `[generate with openssl rand -hex 32]` | Keep secret! |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-injected by Railway |
| `DATABASE_ASYNC_URL` | `${{Postgres.DATABASE_ASYNC_URL}}` | Async driver |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Auto-injected by Railway |
| `ALLOWED_ORIGINS` | `https://os.blackroad.systems,https://blackroad.ai` | CORS |
| `PORT` | `8000` | Railway auto-detects |
| `API_BASE_URL` | `https://os.blackroad.systems` | Public API URL |
| `FRONTEND_URL` | `https://os.blackroad.systems` | Public frontend URL |

**Additional Env Vars** (as needed):
- `OPENAI_API_KEY` - For Lucidia AI (Phase 2)
- `ANTHROPIC_API_KEY` - For Claude integration
- `GITHUB_TOKEN` - For agent GitHub access
- `CF_API_TOKEN` - For Cloudflare automation

### Custom Domain Configuration

**Railway Dashboard**:
1. Go to `backend` service → Settings → Networking
2. Add custom domain: `os.blackroad.systems`
3. Railway provides CNAME target (e.g., `your-app.up.railway.app`)
4. Add this CNAME to Cloudflare DNS (see Part 2)
5. Wait for Railway to provision SSL (automatic via Let's Encrypt)

**Repeat for**:
- `api.blackroad.systems` (explicit API subdomain)
- `prism.blackroad.systems` (Prism Console subdomain, future)

### Health Checks

Railway automatically monitors:
- HTTP health check: `GET /health` (must return 200)
- Automatic restarts on crashes
- Zero-downtime deploys

**Add to `backend/app/main.py`**:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"  # Update from git tag
    }
```

### Deployment Automation

**Current Workflow**: `.github/workflows/railway-deploy.yml`
- Triggers on: push to `main`, manual dispatch
- Uses Railway CLI to deploy
- Environment: Set `RAILWAY_TOKEN` as GitHub secret

**Deployment Flow**:
1. Developer pushes to `main` (or merges PR)
2. GitHub Actions runs CI (lint, test, build)
3. If CI passes, trigger `railway-deploy.yml`
4. Railway CLI runs: `railway up --service backend`
5. Railway builds Docker image (or uses buildpacks)
6. Railway deploys with zero downtime (blue-green)
7. Health check passes → new version goes live
8. Old version gracefully shuts down

**Rollback**:
```bash
# From Railway CLI
railway rollback --service backend
```

---

## PART 5: AGENT ORCHESTRATION MODEL

### The Orchestration Layers

```
┌─────────────────────────────────────────────────────────────┐
│ ATLAS (Global Cockpit)                                      │
│ → Single dashboard showing all systems                      │
│ → Metrics from Prism, CloudWay, RoadChain, Lucidia         │
│ → Quick actions: "Deploy latest", "Run Dreamspace"         │
│ → Alert feed: failed jobs, cost overruns, security         │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ OPERATOR ENGINE (Workflow Orchestrator)                     │
│ → Scheduled agents: cron-like for recurring tasks          │
│ → Workflow definitions: "Deploy flow", "Patent flow"       │
│ → Human-in-the-loop: approval gates, review steps          │
│ → Integrates: Prism (jobs), Lucidia (agents), Vault (logs)│
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ PRISM (Job Queue & Event Log)                              │
│ → Job queue: all long-running tasks                        │
│ → Event log: every system action                           │
│ → Metrics: job counts, latencies, health                   │
│ → Scheduler: cron for recurring jobs                       │
│ → Backpressure: rate limiting, throttling                  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ LUCIDIA (AI Multi-Agent Conductor)                         │
│ → Multi-model orchestration: Claude, GPT, Llama            │
│ → Multi-agent: coding, research, design agents             │
│ → Tool calling: can invoke other OS apps                   │
│ → Long-term memory: conversation logs, context             │
│ → Personas: Cece (OS architect), Amundson (quantum), etc.  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ CORE OS PRIMITIVES                                          │
│ → PS-SHA∞ Identity: every agent has identity               │
│ → RoadChain: audit logs, provenance                        │
│ → Vault: tamper-evident storage                            │
│ → CloudWay: infrastructure automation                      │
└─────────────────────────────────────────────────────────────┘
```

### Example Workflow: "Deploy New Feature"

**Trigger**: Developer pushes to `main` branch

**Workflow Steps** (orchestrated by Operator):

1. **CI/CD Pipeline** (Prism job)
   - Job type: `ci_cd`
   - Steps:
     1. Lint code
     2. Run tests
     3. Build artifacts
   - On success → Step 2
   - On failure → Notify developer, stop

2. **Security Scan** (Prism job)
   - Job type: `security_scan`
   - Steps:
     1. Run CodeQL
     2. Check dependencies (Dependabot)
     3. Scan for secrets
   - On success → Step 3
   - On failure → Notify security team, stop

3. **Staging Deploy** (CloudWay via Prism)
   - Job type: `deploy`
   - Target: Railway staging environment
   - Steps:
     1. Deploy to staging
     2. Run smoke tests
     3. Wait for health check
   - On success → Step 4
   - On failure → Rollback, notify, stop

4. **Human Approval** (Operator → Slack/Email)
   - Operator sends approval request to team lead
   - Slack message: "Deploy to production? [Approve] [Reject]"
   - Wait for response (timeout: 24 hours)
   - If approved → Step 5
   - If rejected → Stop, log reason

5. **Production Deploy** (CloudWay via Prism)
   - Job type: `deploy_prod`
   - Target: Railway production
   - Steps:
     1. Deploy with zero downtime
     2. Run health checks
     3. Monitor for 5 minutes
     4. If metrics good → finalize
     5. If errors spike → auto-rollback

6. **Audit Log** (Vault)
   - Log entire workflow to Vault
   - Hash on RoadChain (if critical change)
   - Generate deployment report
   - Store in `/vault/deploys/YYYY-MM-DD-{id}.json`

7. **Notification** (Atlas)
   - Update Atlas dashboard
   - Send success notification to team
   - Post to Slack/Discord

### Agent Types & Responsibilities

| Agent Type | Purpose | Orchestrated By | Calls |
|------------|---------|-----------------|-------|
| **Coding Agent** | Write, refactor, review code | Lucidia | RoadCode Lab, GitHub API, Prism (tests) |
| **Research Agent** | Search, summarize, generate ideas | Lucidia | Web APIs, Quantum Lab, Vault (logs) |
| **Design Agent** | Generate UI, diagrams, visuals | Lucidia | RoadStudio, DALL-E, Vault (IP hash) |
| **Deploy Agent** | Provision infra, deploy apps | Operator | CloudWay, Railway CLI, Prism (jobs) |
| **Compliance Agent** | Audit, review, generate reports | Operator | Vault, RoadChain, Prism (events) |
| **Dreamspace Agent** | Background brainstorming, experiments | Operator (scheduled) | Lucidia (all sub-agents), Vault (logs) |

### Communication Protocol

**Agent → Agent**:
- Via Prism event bus
- Agent A publishes event: `{"type": "code_ready", "data": {...}}`
- Agent B subscribes to `code_ready` events
- Prism delivers event to Agent B
- Agent B processes, publishes next event

**Agent → Human**:
- Via Atlas dashboard notifications
- Via Slack/email integrations
- Human-in-the-loop approval gates

**Human → Agent**:
- Via OS app UI (Lucidia Core, Prism Console)
- Via Slack commands (future)
- Via API calls (for automation)

---

## PART 6: ORG-WIDE ROADMAP

### The 3-Phase Strategy (from EXECUTION_ROADMAP.md)

```
PHASE 1 (0-12 months)  →  PHASE 2 (12-18 months)  →  PHASE 3 (18-24+ months)
Prove the OS                Expand Intelligence         Ecosystem & Orbit
```

### Phase 1: Prove the OS (Months 0-12)

**Business Goals**:
- ✅ 5 enterprise design partners in production
- ✅ 100 active developers building on platform
- ✅ $500K ARR from pilots
- ✅ Series Seed or pre-A funding ($3-5M)

**Product Goals**:
- ✅ Stable BlackRoad OS core (v1.0)
- ✅ ALICE QI engine (v1.0) powering agents
- ✅ Working multi-agent orchestration
- ✅ RoadChain audit trails operational
- ✅ PS-SHA∞ identity system live

**Domains Live in Phase 1**:
1. ✅ `blackroad.systems` - Corporate site + OS positioning
2. ✅ `blackroad.network` - Developer hub + docs
3. ✅ `blackroad.ai` - Product console (login, admin)
4. ✅ `blackroad.me` - Identity portal

**Quarter-by-Quarter**:

**Q1 (Months 0-3): Foundation**
- [x] Core BlackRoad OS infrastructure (DONE - current monorepo)
- [ ] ALICE QI engine (alpha) - **NEXT**
- [ ] RoadChain prototype
- [ ] PS-SHA∞ identity system
- [ ] Design system v1 (leverage existing component library)
- [ ] Brand guidelines finalized (use BRAND_ARCHITECTURE.md)
- [ ] blackroad.systems v1 (5-7 pages - use DOMAIN_SPEC.md)
- [ ] blackroad.network v1 (docs skeleton + 1 SDK)
- [ ] blackroadai.com v1 (console MVP - evolve current OS)
- [ ] blackroad.me v1 (identity creation + basic portal)
- [ ] Private alpha launch (invite-only)

**Q2 (Months 3-6): Design Partners**
- [ ] Incorporate alpha feedback
- [ ] Add Python + Node SDKs (full support)
- [ ] Expand documentation
- [ ] Build demo environment
- [ ] Create sales materials
- [ ] Identify 10 target design partners
- [ ] Outreach campaign
- [ ] Onboard first 3 design partners

**Q3 (Months 6-9): Public Beta & Developer Growth**
- [ ] Open blackroad.network to public (with waitlist)
- [ ] Launch developer community (Discord)
- [ ] Begin content marketing (blog, tutorials)
- [ ] First community office hours
- [ ] Developer onboarding optimization
- [ ] Expand examples and templates
- [ ] Add Go and Rust SDK support (if needed)
- [ ] Onboard partners 4-5

**Q4 (Months 9-12): Prove & Convert**
- [ ] Design partners moving to production
- [ ] Collect ROI data and success metrics
- [ ] Convert 2-3 pilots to paying customers
- [ ] First enterprise contracts signed ($50-200K each)
- [ ] Launch Team tier pricing (self-serve)
- [ ] Publish 3 case studies
- [ ] Publish 2 technical whitepapers
- [ ] Fundraise (if needed)

### Phase 2: Expand Intelligence (Months 12-18)

**Domains Live in Phase 2**:
1. ✅ `aliceqi.com` - ALICE QI engine showcase
2. ✅ `blackroadqi.com` - Financial intelligence product
3. ✅ `lucidia.earth` - Public narrative experiences
4. ✅ `blackroadquantum.com` - Research hub

**Key Milestones**:
- ✅ ALICE QI recognized research contribution
- ✅ First BlackRoad QI customers (financial)
- ✅ Lucidia drives 10,000+ new users
- ✅ Quantum research published and recognized

### Phase 3: Ecosystem & Orbit (Months 18-24+)

**Domains Live in Phase 3**:
1. ✅ `blackroadquantum.net` - APIs & protocols
2. ✅ `blackroadquantum.info` - Education hub
3. ✅ `blackroadquantum.store/.shop` - Courses, kits, merch
4. ✅ `lucidia.studio` - Creative production
5. ✅ `blackroad.store/.shop` - Community commerce

**Key Milestones**:
- ✅ 50+ enterprise customers
- ✅ $10M ARR
- ✅ 5,000 active developers
- ✅ Multiple revenue streams operational
- ✅ Community-driven innovation

---

## PART 7: ATLAS AUTOMATION COMMAND LIST

### Essential Commands for Infrastructure Setup

**Cloudflare DNS Setup**:
```bash
# 1. Export Cloudflare credentials
export CF_API_TOKEN="your-token-here"
export CF_ZONE_ID="your-zone-id-here"

# 2. Run DNS sync script (create this from template above)
python scripts/cloudflare/sync_dns.py

# 3. Verify DNS records
dig os.blackroad.systems
dig api.blackroad.systems
```

**Railway Setup**:
```bash
# 1. Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# 2. Login
railway login

# 3. Link to project
railway link

# 4. Set environment variables (from .env.example)
while IFS='=' read -r key value; do
  if [[ -n "$key" && $key != \#* ]]; then
    railway variables set "$key" "$value"
  fi
done < backend/.env.example

# 5. Deploy
railway up --service backend

# 6. Check status
railway status
railway logs --service backend
```

**GitHub Setup**:
```bash
# 1. Set GitHub secrets (manual via web UI or gh CLI)
gh secret set RAILWAY_TOKEN --body "your-railway-token"
gh secret set CF_API_TOKEN --body "your-cf-token"
gh secret set CF_ZONE_ID --body "your-zone-id"

# 2. Enable branch protection
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/blackboxprogramming/BlackRoad-Operating-System/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["CI / lint","CI / test-backend"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null

# 3. Create project board (via web UI recommended)
```

**Local Development**:
```bash
# 1. Clone repo
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System

# 2. Set up backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with local values

# 4. Start dependencies
docker-compose up -d postgres redis

# 5. Run backend
python run.py

# 6. Open browser
open http://localhost:8000
```

### Monitoring & Maintenance

**Health Check**:
```bash
# Check all domains
curl https://os.blackroad.systems/health
curl https://api.blackroad.systems/health

# Check Railway status
railway status --service backend

# Check logs
railway logs --service backend --tail 100
```

**Database Maintenance**:
```bash
# Connect to Railway DB
railway connect postgres

# Run migrations
railway run alembic upgrade head

# Backup (manual)
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Cost Monitoring**:
```bash
# Check Railway usage
railway usage

# Check Cloudflare analytics (via web UI)
```

---

## PART 8: ALEXA'S NEXT-ACTION CHECKLIST

### 🎯 Immediate Next Steps (Do First)

**Infrastructure Foundation** (1-2 days):

- [ ] **1. Migrate DNS to Cloudflare**
  - Add `blackroad.systems` to Cloudflare
  - Update nameservers at GoDaddy
  - Configure DNS records (use Part 2 blueprint)
  - Verify SSL works
  - Repeat for other domains

- [ ] **2. Verify Railway Deployment**
  - Check current Railway project
  - Verify environment variables are set
  - Test health endpoint: `https://your-app.up.railway.app/health`
  - Add custom domain: `os.blackroad.systems`
  - Test: `https://os.blackroad.systems`

- [ ] **3. Update GitHub Secrets**
  - Add `CF_API_TOKEN` (from Cloudflare)
  - Add `CF_ZONE_ID` (from Cloudflare)
  - Add `RAILWAY_TOKEN` (from Railway CLI)
  - Verify workflows run successfully

### 🚀 Phase 1 Priorities (Next 2 Weeks)

**Product Development**:

- [ ] **4. Polish Current OS**
  - Test all existing apps (Prism, Miners, etc.)
  - Fix any UI bugs in window management
  - Ensure all mock data is realistic
  - Add loading states, error handling
  - Test on mobile (basic responsiveness)

- [ ] **5. Add Real Backend Endpoints**
  - Implement `/api/prism/jobs` (real data from DB)
  - Implement `/api/prism/metrics` (real metrics)
  - Add WebSocket for real-time updates
  - Connect Prism Console to real API (remove mock data)

- [ ] **6. Create blackroad.systems Landing Page**
  - Use DOMAIN_SPEC.md as blueprint
  - 5-page MVP:
    1. Homepage (hero, capabilities, CTA)
    2. Architecture (system overview)
    3. Solutions (1 industry page - Financial Services)
    4. Pricing (3 tiers)
    5. Contact/Demo request
  - Deploy to GitHub Pages or Railway
  - Point `blackroad.systems` DNS to it

**Documentation**:

- [ ] **7. Developer Docs (blackroad.network)**
  - Quick start guide
  - API reference
  - Example code (Python, Node)
  - Architecture overview
  - Deploy to GitHub Pages
  - Point `blackroad.network` DNS

- [ ] **8. Technical Whitepapers** (v1 drafts)
  - "BlackRoad OS: System Architecture"
  - "PS-SHA∞: Sovereign Identity for AI Agents"
  - PDF exports, host on blackroad.systems

### 🎨 Content & Branding (Next Month)

- [ ] **9. Design System Formalization**
  - Document component library
  - Create Figma designs (optional)
  - Screenshot gallery of OS
  - Brand style guide (colors, fonts, voice)

- [ ] **10. Case Study Scaffolds** (3 placeholder studies)
  - Financial Services: "How [Bank] Deployed 500 Agents"
  - Healthcare: "How [Hospital] Ensured HIPAA Compliance"
  - Enterprise: "How [Company] Replaced Black-Box AI"
  - Use DOMAIN_SPEC templates

### 🤝 Community & Outreach (Ongoing)

- [ ] **11. Launch Developer Community**
  - Create Discord server
  - Invite first 10-20 alpha testers
  - Post weekly updates
  - First community call

- [ ] **12. Content Marketing**
  - Blog post: "Why Deterministic AI Matters"
  - Blog post: "Introducing BlackRoad OS"
  - Blog post: "Building Auditable AI with RoadChain"
  - Post on HN, Reddit, LinkedIn

### 📊 Metrics & Feedback (Week 3-4)

- [ ] **13. Set Up Analytics**
  - Google Analytics on blackroad.systems
  - Mixpanel/PostHog for OS usage (optional)
  - Track: demo requests, docs views, OS sessions

- [ ] **14. Feedback Loop**
  - User surveys for alpha testers
  - Weekly check-ins with early users
  - GitHub issues for bug reports
  - Prioritize next features based on feedback

---

## THE EXECUTION MANTRA

**Phase 1 Success Formula**:
1. **Infrastructure** → Solid foundation (Cloudflare, Railway, GitHub)
2. **Product** → Working OS with real backend (not just mocks)
3. **Positioning** → Clear messaging (blackroad.systems, docs)
4. **Pilots** → 3-5 design partners using it
5. **Proof** → Case studies, metrics, testimonials
6. **Funding** → Raise seed round based on traction

**The Critical Path** (what must happen):
```
Week 1-2:   Infrastructure setup ✅
Week 3-4:   Polish OS + real API ✅
Week 5-6:   blackroad.systems live ✅
Week 7-8:   Developer docs live ✅
Week 9-10:  Alpha launch (invite-only) ✅
Week 11-12: First 10 users onboarded ✅
Month 4:    First design partner ✅
Month 6:    3 design partners ✅
Month 9:    Public beta ✅
Month 12:   First paying customers ✅
```

---

## PHASE 1 IMPLEMENTATION FILES

The master orchestration plan is now backed by **concrete implementation files**:

### Infrastructure Implementation

**Cloudflare DNS:**
- `infra/cloudflare/records.yaml` - Complete DNS configuration for all domains
- `infra/cloudflare/migrate_to_cloudflare.md` - Step-by-step migration guide for Alexa
- `infra/cloudflare/cloudflare_dns_sync.py` - Automated DNS sync script (Python)
- `infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md` - Updated with implementation references

**Environment Variables:**
- `ENV_VARS.md` - Complete environment variable documentation for all services
- Covers: Railway, GitHub Actions, Cloudflare, local development
- Includes: Security best practices, validation scripts, troubleshooting

**Frontend Infrastructure:**
- `infra/frontend/LANDING_PAGE_PLAN.md` - Detailed landing page implementation plan
- Includes: Page structure, design system, content guidelines, deployment strategy

### GitHub Actions Workflows

**Templates** (in `.github/workflows/templates/`):
- `railway-deploy-template.yml` - Railway deployment workflow
- `frontend-deploy-template.yml` - Frontend deployment (GitHub Pages, Cloudflare Pages, etc.)
- `codeql-analysis-template.yml` - Security scanning workflow
- `comprehensive-ci-template.yml` - Complete CI pipeline (lint, test, build)

**Active Configuration:**
- `.github/dependabot.yml` - Automated dependency updates

**How to use templates:**
1. Copy template from `.github/workflows/templates/` to `.github/workflows/`
2. Remove `-template` from filename
3. Customize for your specific repo/service
4. Commit and push

### Deployment Documentation

**Environment Map:**
- `infra/env/ENVIRONMENT_MAP.md` - Existing cross-platform variable map

**New Documentation:**
- `ENV_VARS.md` - Comprehensive variable reference
- Railway workflow templates with health checks
- Frontend deployment options (GitHub Pages, Railway, Cloudflare Pages)

### Next Steps for Implementation

**Immediate (Week 1-2):**
1. Follow `infra/cloudflare/migrate_to_cloudflare.md` to migrate DNS
2. Set up GitHub secrets (CF_API_TOKEN, RAILWAY_TOKEN)
3. Copy workflow templates to active `.github/workflows/` directory
4. Deploy backend to Railway with custom domains
5. Deploy frontend to GitHub Pages (or Railway)

**Short-term (Week 3-4):**
1. Implement landing page using `infra/frontend/LANDING_PAGE_PLAN.md`
2. Set up CodeQL security scanning
3. Configure Dependabot for automated updates
4. Create first design partner case study (placeholder)

**Medium-term (Month 2-3):**
1. Refine based on real traffic and feedback
2. Add analytics (Google Analytics/Plausible)
3. Create email drip campaign for demo requests
4. Launch private alpha

---

## PHASE 2.5: INFRASTRUCTURE WIRING (COMPLETED 2025-11-18)

### Overview

Phase 2.5 **wires up** the infrastructure decisions and prepares BlackRoad OS for production deployment. This phase codifies architectural choices and creates deployment-ready configurations.

**Status**: ✅ **COMPLETED**

**Branch**: `claude/os-phase2-5-wire-infra-01GoUdf3aSLaDjaQ7nYnZ9pY`

### Key Decisions Codified

1. **✅ Monorepo Strategy**
   - `BlackRoad-Operating-System` repository is the canonical OS home
   - All OS components live together for Phase 1-2
   - Future evolution to multi-repo considered for Phase 2+ (when team > 10 people)

2. **✅ Prism Console Routing**
   - Prism Console UI served from backend at `/prism` route
   - Integrated deployment with shared authentication
   - Static files in `backend/static/prism/`

3. **✅ Documentation via GitHub Pages**
   - Codex documentation deployed to `docs.blackroad.systems`
   - MkDocs with Material theme
   - Automated deployment via GitHub Actions (`.github/workflows/docs-deploy.yml`)

4. **✅ Frontend Technology**
   - Vanilla JavaScript (ES6+) continues for Phase 2
   - Zero-dependency approach maintained
   - No build process required

### URL Structure (Production)

```
https://blackroad.systems          → Main OS interface (backend/static/)
https://blackroad.systems/prism    → Prism Console UI
https://blackroad.systems/api/*    → REST API endpoints
https://blackroad.systems/api/docs → OpenAPI documentation
https://docs.blackroad.systems     → Codex documentation (GitHub Pages)
```

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│ CLOUDFLARE (DNS + SSL + CDN)                                │
│ - blackroad.systems → Railway backend                       │
│ - docs.blackroad.systems → GitHub Pages                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ RAILWAY (Backend Hosting)                                    │
│ - FastAPI backend (app/main.py)                             │
│ - PostgreSQL 15 database                                    │
│ - Redis 7 cache                                             │
│ - Routes:                                                   │
│   • / → Static OS (backend/static/index.html)              │
│   • /prism → Prism Console (backend/static/prism/)         │
│   • /api/* → REST endpoints                                │
│   • /health → Health check                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ GITHUB PAGES (Documentation)                                │
│ - Source: codex-docs/ directory                             │
│ - Built with: MkDocs + Material theme                       │
│ - Deployed via: .github/workflows/docs-deploy.yml          │
└─────────────────────────────────────────────────────────────┘
```

### New Files Created

**Documentation & Planning:**
- `PHASE2_5_SUMMARY_FOR_ALEXA.md` - Complete Phase 2.5 summary and checklist
- `BLACKROAD_OS_REPO_MAP.md` - Module-by-module breakdown of repository
- `DEPLOYMENT_NOTES.md` - Production deployment checklist and reference

**Backend Infrastructure:**
- `backend/app/routers/prism_static.py` - New router to serve Prism Console at `/prism`
- `backend/static/prism/` - Prism Console UI directory structure
  - `index.html` - Prism entry point
  - `css/prism.css` - Prism styling
  - `js/prism-core.js` - Prism JavaScript

**Documentation System:**
- `.github/workflows/docs-deploy.yml` - Automated MkDocs deployment
- `codex-docs/mkdocs.yml` - MkDocs configuration with Material theme
- `codex-docs/DEPLOY_DOCS.md` - Documentation deployment guide
- `codex-docs/docs/` - Complete documentation structure
  - `index.md` - Documentation landing page
  - `architecture/overview.md` - System architecture
  - `architecture/phase2-decisions.md` - Architectural decisions
  - `architecture/infra-deployment.md` - Infrastructure guide
  - `api/overview.md` - API reference
  - `guides/quickstart.md` - Quick start guide
  - `guides/deployment.md` - Deployment guide
  - `contributing.md` - Contributing guidelines

**Updated Files:**
- `backend/app/main.py` - Added Prism static router, updated OpenAPI tags
- `MASTER_ORCHESTRATION_PLAN.md` - This section added

### Phase 2 vs Phase 3: Evolution Path

**Phase 2 (Current - Months 0-12):**
- ✅ Monorepo for single source of truth
- ✅ All components deployed together
- ✅ Simple CI/CD pipeline
- ✅ Ideal for small team (1-5 developers)

**Phase 3 (Future - Months 12+):**

**When to split into multi-repo:**
- Team size > 10 developers
- Clear component ownership boundaries
- Need for independent release cycles
- Different tech stacks emerging

**Potential repository structure:**
```
blackroad-os-core       → Core runtime, identity (PS-SHA∞)
blackroad-os-api        → Backend API gateway
blackroad-os-web        → Pocket OS web interface
blackroad-os-prism      → Prism Console (admin/observability)
blackroad-os-operator   → Worker engine, schedulers
blackroad-os-docs       → Codex, specs, whitepapers
```

**Migration strategy:**
- Use `git subtree split` to preserve history
- Set up cross-repo CI coordination
- Implement versioned API contracts
- Maintain unified documentation

### Post-Merge Checklist for Alexa

**Immediate (30-45 minutes):**

1. **Configure GitHub Pages** (5 minutes)
   - Settings → Pages → Source: `gh-pages` branch, `/ (root)` folder
   - Custom domain: `docs.blackroad.systems`
   - Enforce HTTPS: ✅

2. **Configure Railway Deployment** (10 minutes)
   - Set all required environment variables (see `DEPLOYMENT_NOTES.md`)
   - Add custom domain: `blackroad.systems`
   - Verify health check: `curl https://your-app.up.railway.app/health`

3. **Configure Cloudflare DNS** (15 minutes)
   - Add DNS records (see table in `DEPLOYMENT_NOTES.md`):
     - `blackroad.systems` → Railway backend
     - `docs.blackroad.systems` → GitHub Pages
     - `www.blackroad.systems` → Redirect to apex
   - SSL/TLS: Full (strict) mode
   - Enable: Always Use HTTPS

4. **Verify All Routes** (5 minutes)
   ```bash
   curl -I https://blackroad.systems           # Main OS
   curl -I https://blackroad.systems/prism     # Prism Console
   curl https://blackroad.systems/health       # Health check
   curl -I https://docs.blackroad.systems      # Documentation
   ```

5. **Monitor First Deployment** (10 minutes)
   - Check Railway logs for errors
   - Verify database tables created
   - Check Cloudflare analytics for traffic
   - Test all routes in browser

**Next Steps (Week 1-2):**
- Polish Prism Console UI (Phase 2.6)
- Add real API endpoints for Prism (job queue, events, metrics)
- Expand Codex documentation (API reference, guides)
- Set up monitoring (Sentry, Railway metrics)

### Quick Reference

**Production URLs:**
- OS: https://blackroad.systems
- Prism: https://blackroad.systems/prism
- API Docs: https://blackroad.systems/api/docs
- Health: https://blackroad.systems/health
- Codex: https://docs.blackroad.systems

**Development URLs:**
- OS: http://localhost:8000
- Prism: http://localhost:8000/prism
- API Docs: http://localhost:8000/api/docs
- Health: http://localhost:8000/health
- Codex: http://localhost:8001 (mkdocs serve)

**Key Commands:**
```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Documentation
cd codex-docs && mkdocs serve

# Railway
railway up
railway logs --tail 100

# GitHub Pages
cd codex-docs && mkdocs gh-deploy
```

**Key Files Reference:**
| File | Purpose |
|------|---------|
| `PHASE2_5_SUMMARY_FOR_ALEXA.md` | Complete Phase 2.5 summary |
| `BLACKROAD_OS_REPO_MAP.md` | Repository structure map |
| `DEPLOYMENT_NOTES.md` | Production deployment guide |
| `codex-docs/DEPLOY_DOCS.md` | Documentation deployment guide |
| `backend/app/routers/prism_static.py` | Prism Console router |
| `.github/workflows/docs-deploy.yml` | Docs deployment automation |

### Implementation Status

✅ **Phase 2.5 Complete**

All infrastructure wiring tasks completed:
- [x] Architectural decisions documented
- [x] Prism Console backend route implemented
- [x] Prism Console UI created (basic skeleton)
- [x] GitHub Pages workflow configured
- [x] MkDocs documentation structure created
- [x] Deployment notes and guides written
- [x] Repository map documented
- [x] MASTER_ORCHESTRATION_PLAN updated

**Ready for production deployment.**

---

## READY FOR THE NEXT COMMAND, OPERATOR.

This master plan synthesizes:
- ✅ Your system memories (from ChatGPT)
- ✅ The 6-repo strategy (or monorepo evolution)
- ✅ The Big Kahuna vision (complete OS architecture)
- ✅ The 3-phase execution roadmap (18-24 months)
- ✅ Infrastructure topology (Cloudflare → GoDaddy → Railway → GitHub)
- ✅ Domain strategy (10+ domains with routing)
- ✅ Agent orchestration (Atlas/Operator/Prism/Lucidia)
- ✅ Brand architecture (all sub-brands)
- ✅ **PHASE 1 IMPLEMENTATION** (infrastructure files, workflows, documentation)

**Your next concrete action**: Start with `infra/cloudflare/migrate_to_cloudflare.md` - migrate DNS to Cloudflare.

**Your north star**: Phase 1, Q1 deliverables - get the foundation solid, then build on it.

**Your superpower**: You have the complete vision documented AND implemented. Now execute methodically, one step at a time.

**Implementation status**: ✅ Phase 1 infrastructure files ready for deployment

---

*"Phase 1: Prove it. Phase 2: Expand it. Phase 3: Own it."*

**Where AI meets the open road.** 🛣️
