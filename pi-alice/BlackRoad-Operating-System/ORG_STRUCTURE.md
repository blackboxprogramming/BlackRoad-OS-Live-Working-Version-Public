# 🏢 BLACKROAD GITHUB ORGANIZATION STRUCTURE
## Repository Architecture & Responsibility Map

**Version:** 1.0
**Date:** 2025-11-18
**Author:** Claude (Sonnet 4.5) - BlackRoad Implementation Planning
**Organizations:** `blackboxprogramming` & `BlackRoad-AI`

---

## EXECUTIVE SUMMARY

This document maps **23 BlackRoad repositories** across 2 GitHub organizations to the 7-layer BlackRoad OS architecture defined in `MASTER_ORCHESTRATION_PLAN.md`.

**Key Findings**:
- **1 monolith** currently holds the canonical OS (BlackRoad-Operating-System)
- **6 satellite repos** for specific layers (API, operator, console, frontend sites)
- **8 experimental repos** for advanced features (Lucidia, quantum, AI labs)
- **8 utility/legacy repos** (starters, templates, personal projects)

**Recommended Strategy**: **Consolidate Phase 1** around 4 core repos, archive or migrate the rest.

---

## PART 1: REPOSITORY INVENTORY

### Core Operational Repos (Active in Phase 1)

| Repo | Owner | Purpose | Status | Lines of Code | Last Updated |
|------|-------|---------|--------|---------------|--------------|
| **BlackRoad-Operating-System** | blackboxprogramming | Monolith: OS core, backend API, agents, SDKs, docs | **CANONICAL** | ~50K+ | Active |
| **blackroad-api** | blackboxprogramming | Standalone API gateway (future split from monolith) | Planned | TBD | Stub |
| **blackroad-operator** | blackboxprogramming | Workflow orchestration & scheduled agents | Planned | TBD | Stub |
| **blackroad-prism-console** | blackboxprogramming | Admin UI for Prism job queue & observability | Planned | TBD | Stub |
| **blackroad.io** | blackboxprogramming | Corporate marketing site (blackroad.systems) | Planned | TBD | Stub |
| **BlackRoad.io** | BlackRoad-AI | Alternate corporate site (may be duplicate) | Unknown | TBD | Unknown |

### AI & Intelligence Repos

| Repo | Owner | Purpose | Status | Integration |
|------|-------|---------|--------|-------------|
| **lucidia** | blackboxprogramming | Multi-model AI orchestration layer | Development | Phase 2 |
| **lucidia-lab** | blackboxprogramming | Experimental AI research & testing | Development | Phase 2 |
| **native-ai-quantum-energy** | blackboxprogramming | Quantum computing + AI research | Research | Phase 3 |
| **quantum-math-lab** | blackboxprogramming | Mathematical foundations for quantum OS | Research | Phase 3 |
| **codex-agent-runner** | blackboxprogramming | Agent execution runtime (may merge with operator) | Development | Phase 2 |
| **codex-infinity** | blackboxprogramming | Advanced coding agent system | Development | Phase 2 |

### Utility & Experimental Repos

| Repo | Owner | Purpose | Status | Recommendation |
|------|-------|---------|--------|----------------|
| **blackroad** | blackboxprogramming | Possible legacy or alternative frontend | Unknown | Investigate → Archive or Merge |
| **BlackStream** | blackboxprogramming | Video streaming platform (RoadStream) | Development | Merge into monolith |
| **universal-computer** | blackboxprogramming | Theoretical computing model | Research | Archive (reference only) |
| **remember** | blackboxprogramming | Memory/logging framework | Development | May integrate with Vault |

### Planning & Documentation Repos

| Repo | Owner | Purpose | Status | Recommendation |
|------|-------|---------|--------|----------------|
| **blackroad-plans** | BlackRoad-AI | Strategic planning documents | Active | Keep separate |

### Starter Templates & Examples

| Repo | Owner | Purpose | Status | Recommendation |
|------|-------|---------|--------|----------------|
| **next-video-starter** | blackboxprogramming | Next.js video app template | Template | Archive or move to examples/ |
| **nextjs-ai-chatbot** | blackboxprogramming | Next.js + AI chatbot starter | Template | Archive or integrate features |

### Personal/Meta Repos

| Repo | Owner | Purpose | Status | Recommendation |
|------|-------|---------|--------|----------------|
| **my-repository** | blackboxprogramming | Personal experiments | Unknown | Archive |
| **blackboxprogramming** | blackboxprogramming | Profile README or meta repo | Meta | Keep |
| **new_world** | blackboxprogramming | Possible game or narrative project | Unknown | Investigate → Archive or merge with MetaCity |

---

## PART 2: 7-LAYER ARCHITECTURE MAPPING

### Layer 1: DNS & CDN
**Responsibility**: Domain management, SSL, DDoS protection

| Repo | Role | Implementation |
|------|------|----------------|
| **BlackRoad-Operating-System** | Cloudflare DNS config scripts | `scripts/cloudflare/sync_dns.py` (planned) |
| **blackroad.io** | DNS CNAME targets | `CNAME @ → blackroad-os-production.up.railway.app` |

**Domains Served**:
- `blackroad.systems` → Corporate site
- `os.blackroad.systems` → OS interface
- `api.blackroad.systems` → API gateway
- `prism.blackroad.systems` → Prism Console
- `lucidia.earth` → Narrative experiences (Phase 2)

**Config Files**:
- `ops/domains.yaml` (in monolith)
- Cloudflare dashboard (manual for Phase 1)

---

### Layer 2: Compute & Infrastructure
**Responsibility**: Hosting, containers, orchestration

| Repo | Role | Deployment Target | Config |
|------|------|-------------------|--------|
| **BlackRoad-Operating-System** | Backend API + static UI | Railway | `railway.toml`, `Dockerfile` |
| **blackroad-operator** | Worker processes | Railway (future) | Docker |
| **blackroad-prism-console** | Admin UI | Railway or Vercel | Docker or static |
| **blackroad.io** | Marketing site | Vercel or GitHub Pages | Static build |

**Infrastructure Providers**:
- **Railway**: Backend API, PostgreSQL, Redis (current)
- **DigitalOcean**: RoadChain nodes (Phase 2)
- **Cloudflare Workers**: Edge functions (Phase 2)
- **GitHub Pages**: Documentation sites

---

### Layer 3: Data & State
**Responsibility**: Databases, caching, blockchain, compliance logs

| Repo | Component | Storage | Technology |
|------|-----------|---------|------------|
| **BlackRoad-Operating-System** | User data, app state | PostgreSQL (Railway) | SQLAlchemy 2.0 + asyncpg |
| **BlackRoad-Operating-System** | Session cache | Redis (Railway) | redis-py 5.0 |
| **BlackRoad-Operating-System** | RoadChain ledger | In-memory (Phase 1) → PostgreSQL | Custom blockchain |
| **BlackRoad-Operating-System** | Vault compliance | `compliance_event` table | Immutable audit log |

**Database Schema Owner**: **BlackRoad-Operating-System/backend/app/models/**

**Migration Strategy**:
- Phase 1: Monolith owns all schemas
- Phase 2: Split into service-specific DBs (Prism DB, Lucidia DB, etc.)

---

### Layer 4: Orchestration & Intelligence
**Responsibility**: Agents, jobs, AI orchestration, workflows

| Repo | Component | Purpose | Status |
|------|-----------|---------|--------|
| **BlackRoad-Operating-System** | 200+ agents | Agent library | ✅ Complete (base framework) |
| **lucidia** | Multi-model AI orchestration | Route requests to Claude, GPT, Llama | 🔨 Development |
| **lucidia-lab** | AI experiments | Test new models, prompts | 🔬 Research |
| **blackroad-operator** | Workflow scheduler | Cron-like agent execution | 📋 Planned |
| **blackroad-prism-console** | Job queue UI | Visualize Prism jobs | 📋 Planned |
| **codex-agent-runner** | Agent execution runtime | Run agents in isolated envs | 🔨 Development |
| **codex-infinity** | Advanced coding agents | Generate entire codebases | 🔬 Research |

**API Endpoints** (in BlackRoad-Operating-System):
- `GET /api/agents/library` → List 200+ agents
- `POST /api/agents/{agent_id}/execute` → Run agent
- `GET /api/jobs` → Prism job queue
- `WebSocket /api/jobs/{job_id}/stream` → Real-time updates

---

### Layer 5: API Gateway & Routing
**Responsibility**: REST API, WebSocket, authentication, routing

| Repo | Role | Technology | Endpoints |
|------|------|------------|-----------|
| **BlackRoad-Operating-System** | Canonical API gateway | FastAPI 0.104.1 | 33 routers, 100+ endpoints |
| **blackroad-api** | Future: Standalone API | FastAPI (split from monolith) | Phase 2 migration |

**Current Routers** (in monolith):
```
/api/auth/*           → Authentication (JWT)
/api/email/*          → RoadMail
/api/social/*         → BlackRoad Social
/api/video/*          → BlackStream
/api/blockchain/*     → RoadChain
/api/miner/*          → Mining
/api/agents/*         → Agent orchestration (planned)
/api/prism/*          → Job queue (planned)
... 25 more routers
```

**Host-Based Routing** (Phase 2):
- `blackroadai.com/*` → Prism theme
- `lucidia.earth/*` → Narrative theme
- `api.blackroad.systems/*` → Developer API

---

### Layer 6: Application Layer (Pocket OS)
**Responsibility**: Windows 95 UI, native apps, real-time sync

| Repo | Component | Technology | Deployment |
|------|-----------|------------|------------|
| **BlackRoad-Operating-System** | Canonical OS UI | Vanilla JS, HTML, CSS | `backend/static/index.html` |
| **blackroad-prism-console** | Admin console | React or Vanilla JS | Separate app |
| **BlackStream** | Video streaming app | Next.js (potential) | May merge into monolith |
| **blackroad** | Possible alternate UI | Unknown | **Investigate → Archive or merge** |

**Native Apps** (embedded in OS):
- RoadMail, BlackRoad Social, BlackStream, RoadChain Explorer
- RoadCoin Miner, Wallet, RoadView Browser, Terminal, File Explorer
- GitHub Manager, Raspberry Pi Manager
- RoadCity, RoadCraft, Road Life (games)

**Duplication Issue**:
- `backend/static/` → **CANONICAL**
- `blackroad-os/` → **LEGACY** (superseded, mark as deprecated)

---

### Layer 7: User Experience (Multi-Domain)
**Responsibility**: Marketing sites, developer docs, narrative experiences

| Repo | Domain | Purpose | Technology | Status |
|------|--------|---------|------------|--------|
| **blackroad.io** | blackroad.systems | Corporate site | HTML/CSS or Next.js | 📋 Planned |
| **BlackRoad.io** | TBD (may be duplicate) | Unknown | Unknown | ❓ Investigate |
| **BlackRoad-Operating-System** | os.blackroad.systems | OS interface | FastAPI + static | ✅ Live |
| **blackroad-plans** | Internal only | Planning docs | Markdown | ✅ Active |
| **BlackRoad-Operating-System** | blackroad.network | Developer docs | MkDocs or Docusaurus | 📋 Planned |
| **lucidia** | lucidia.earth | Narrative site | Next.js (Phase 2) | 📋 Planned |

**Domain Ownership** (from MASTER_ORCHESTRATION_PLAN.md):
```
blackroad.systems     → blackroad.io repo (corporate)
os.blackroad.systems  → BlackRoad-Operating-System (OS)
api.blackroad.systems → blackroad-api (future) or monolith (Phase 1)
prism.blackroad.systems → blackroad-prism-console
blackroad.network     → BlackRoad-Operating-System/docs/ (developer)
lucidia.earth         → lucidia repo (narrative)
aliceqi.com           → quantum-math-lab or lucidia-lab (research)
```

---

## PART 3: RECOMMENDED REPOSITORY STRATEGY

### Phase 1 (Months 0-12): Consolidate Around Monolith

**Active Repos** (4 core):
1. **BlackRoad-Operating-System** → Canonical monolith (OS, API, agents, docs)
2. **blackroad.io** → Corporate marketing site
3. **blackroad-plans** → Strategic planning (separate org)
4. **lucidia** → AI layer (development starts mid-Phase 1)

**Archive** (move to `archive/` or mark read-only):
- `blackroad-os/` → Superseded by `backend/static/`
- `next-video-starter` → Template, not core product
- `nextjs-ai-chatbot` → Template, integrate features into monolith if needed
- `my-repository` → Personal, not product
- `universal-computer` → Research reference only

**Investigate** (determine keep/merge/archive):
- `blackroad` → If alternate UI, merge or archive
- `BlackRoad.io` → If duplicate of blackroad.io, archive
- `new_world` → Merge with MetaCity if game-related, else archive

**Keep as Experimental**:
- `lucidia-lab` → Research & testing
- `quantum-math-lab` → Long-term research
- `native-ai-quantum-energy` → Long-term research
- `remember` → May integrate into Vault

---

### Phase 2 (Months 12-18): Strategic Split

**New Active Repos**:
1. **blackroad-api** → Extract API gateway from monolith
2. **blackroad-operator** → Workflow orchestration & scheduler
3. **blackroad-prism-console** → Admin UI for observability
4. **BlackStream** → Standalone video platform

**Monolith Becomes**:
- **BlackRoad-Operating-System** → Core runtime, identity (PS-SHA∞), RoadChain

**Migration Strategy**:
```
Monolith (Phase 1)
├── backend/app/routers/*  → blackroad-api/routers/
├── agents/                → blackroad-operator/agents/
├── backend/static/        → Keep in monolith (OS shell)
└── docs/                  → blackroad-network (GitHub Pages)
```

---

### Phase 3 (Months 18-24+): Microservices & Ecosystem

**Additional Repos**:
- **blackroad-vault** → Compliance & audit ledger
- **blackroad-cloudway** → Infrastructure as software
- **blackroad-roadchain** → Blockchain network
- **blackroad-metacity** → Gaming platform

**Full Ecosystem** (10 repos):
```
┌─────────────────────────────────────────────────────────────┐
│ USER-FACING                                                 │
├─────────────────────────────────────────────────────────────┤
│ blackroad.io             → Corporate site                   │
│ BlackRoad-Operating-System → OS shell (minimal)             │
│ blackroad-prism-console  → Admin UI                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BACKEND SERVICES                                            │
├─────────────────────────────────────────────────────────────┤
│ blackroad-api            → REST/GraphQL gateway             │
│ blackroad-operator       → Workflows & scheduler            │
│ lucidia                  → AI orchestration                 │
│ blackroad-vault          → Compliance ledger                │
│ blackroad-cloudway       → Infrastructure automation        │
│ blackroad-roadchain      → Blockchain nodes                 │
│ blackroad-metacity       → Gaming backend                   │
└─────────────────────────────────────────────────────────────┘
```

---

## PART 4: GITHUB ORG RECOMMENDATIONS

### Current State
- **blackboxprogramming** org → 20 repos (mix of active, experimental, personal)
- **BlackRoad-AI** org → 2 repos (blackroad-plans, BlackRoad.io)

### Recommended Structure

**Option A: Consolidate into single `blackroad` org**
- Create new `blackroad` GitHub organization
- Migrate all product repos from `blackboxprogramming` and `BlackRoad-AI`
- Keep `blackboxprogramming` for personal/experimental work
- **Pros**: Clear branding, professional, easier permissions
- **Cons**: Migration effort, URL changes

**Option B: Keep `blackboxprogramming`, clean it up**
- Archive/delete non-product repos
- Rename to `blackroad-os` or `blackroad-ai` (GitHub allows org rename)
- **Pros**: No migration, URLs stay same
- **Cons**: Less professional name

**Option C: Hybrid (Recommended for Phase 1)**
- Keep `blackboxprogramming` as-is for Phase 1 (minimize disruption)
- Create `blackroad` org for Phase 2 (migrate core repos)
- Use topics/tags to distinguish product vs. experimental repos
- **Pros**: Gradual transition, low risk
- **Cons**: Temporary complexity

### GitHub Teams (Future)

Once org structure is solidified:

```
@blackroad/core           → Alexa + senior engineers (all repos)
@blackroad/frontend       → UI/UX contributors (OS, Prism Console)
@blackroad/backend        → API/infrastructure (API, Operator, CloudWay)
@blackroad/ai             → AI/ML contributors (Lucidia, agents)
@blackroad/docs           → Documentation writers (docs, README)
@blackroad/community      → External contributors (all repos, triage role)
```

### CODEOWNERS Consolidation

**Monolith** (`BlackRoad-Operating-System/.github/CODEOWNERS`):
```
# Global owners
* @alexa-amundson @cadillac

# Backend
/backend/app/** @blackroad/backend @alexa-amundson

# Frontend
/backend/static/** @blackroad/frontend @alexa-amundson

# Agents
/agents/** @blackroad/ai @alexa-amundson

# Infrastructure
/.github/workflows/** @blackroad/backend
/scripts/** @blackroad/backend
/ops/** @alexa-amundson

# Docs
/docs/** @blackroad/docs
/README.md @blackroad/docs
```

**Future Repos**: Each repo gets its own CODEOWNERS with `@blackroad/core` as global owner

---

## PART 5: CANONICAL WORKFLOWS

### Required GitHub Actions (All Active Repos)

| Workflow | File | Purpose | Runs On |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Lint, type-check, test | Push, PR → main |
| **Deploy** | `.github/workflows/deploy.yml` | Deploy to Railway/Vercel | Push → main (after CI passes) |
| **Security** | `.github/workflows/codeql.yml` | CodeQL security scan | Weekly, PR → main |
| **Dependencies** | `.github/dependabot.yml` | Auto-update deps | Daily |

### Repo-Specific Workflows

**BlackRoad-Operating-System** (monolith):
- `backend-tests.yml` → Run pytest
- `railway-deploy.yml` → Deploy to Railway
- `railway-automation.yml` → Env validation
- `domain-health.yml` → Multi-domain health checks

**blackroad.io** (marketing site):
- `build.yml` → Build Next.js/static site
- `deploy-vercel.yml` → Deploy to Vercel

**blackroad-api** (future):
- `api-tests.yml` → API contract tests
- `railway-deploy.yml` → Deploy API service

**lucidia** (AI layer):
- `model-tests.yml` → Test AI model integrations
- `deploy.yml` → Deploy to Railway

---

## PART 6: MIGRATION CHECKLIST

### Immediate Actions (This Week)

- [ ] **Deprecate `blackroad-os/` directory in monolith**
  - Add README: "⚠️ LEGACY: This directory is superseded by `backend/static/`. Do not edit."
  - Update all docs to reference `backend/static/` only
  - Archive or delete after verification

- [ ] **Investigate duplicate repos**
  - [ ] Check if `blackroad` repo has different code than `backend/static/`
  - [ ] Check if `BlackRoad.io` is duplicate of `blackroad.io` plan
  - [ ] Document findings, recommend archive or merge

- [ ] **Tag experimental repos**
  - Add GitHub topic tags: `experimental`, `research`, `phase-2`, `phase-3`
  - Update repo descriptions to clarify status

### Phase 1 Setup (Weeks 1-4)

- [ ] **Create `blackroad.io` repo**
  - Use `next-video-starter` or simple HTML as template
  - Implement 5-page MVP (from NEXT_ACTIONS_ALEXA.md)
  - Deploy to Vercel or GitHub Pages
  - Point `blackroad.systems` DNS

- [ ] **Set up `blackroad-plans` integration**
  - Link from monolith README
  - Reference in MASTER_ORCHESTRATION_PLAN.md
  - Keep as single source of truth for strategy docs

- [ ] **Create ORG_STRUCTURE.md in all active repos**
  - Link to this canonical version in monolith
  - Each repo gets a "Role in Ecosystem" section

### Phase 2 Preparation (Months 6-12)

- [ ] **Scaffold future repos**
  - Create `blackroad-api` stub (copy backend/app/, remove static/)
  - Create `blackroad-operator` stub (copy agents/, add scheduler)
  - Create `blackroad-prism-console` stub (React app)
  - Mark as "UNDER DEVELOPMENT - Phase 2"

- [ ] **Plan migration scripts**
  - `scripts/migrate_api.sh` → Extract backend/app/routers/ to blackroad-api
  - `scripts/migrate_agents.sh` → Extract agents/ to blackroad-operator
  - Document in MIGRATION_GUIDE.md

### Phase 3 (Months 12+)

- [ ] **Create new org (optional)**
  - If going with Option A, create `blackroad` org
  - Transfer repos from `blackboxprogramming` and `BlackRoad-AI`
  - Update all docs, CI/CD with new URLs

- [ ] **Microservices repos**
  - `blackroad-vault`, `blackroad-cloudway`, `blackroad-roadchain`, `blackroad-metacity`
  - Each with own CI/CD, deployment, docs

---

## PART 7: REPO HEALTH METRICS

### Recommended Tracking (Per Repo)

| Metric | Tool | Frequency |
|--------|------|-----------|
| **Test Coverage** | pytest-cov, CodeCov | Every CI run |
| **Build Status** | GitHub Actions badges | Real-time |
| **Dependencies** | Dependabot alerts | Daily |
| **Security** | CodeQL, Snyk | Weekly |
| **Code Quality** | SonarCloud, CodeClimate | Every PR |
| **Deploy Status** | Railway/Vercel status checks | Every deploy |

### Monolith Health Dashboard

Add to `README.md`:
```markdown
## 📊 Repository Health

| Component | Status | Coverage | Last Deploy |
|-----------|--------|----------|-------------|
| Backend API | ![CI](https://github.com/.../workflows/ci.yml/badge.svg) | 75% | 2025-11-18 |
| Frontend | ![CI](https://github.com/.../workflows/ci.yml/badge.svg) | N/A | 2025-11-18 |
| Agents | ![Tests](https://github.com/.../workflows/backend-tests.yml/badge.svg) | 60% | 2025-11-15 |
| Deployment | ![Railway](https://img.shields.io/badge/railway-deployed-success) | - | 2025-11-18 |
```

---

## PART 8: QUICK REFERENCE

### Repo Ownership Matrix

| Repo | Primary Owner | Secondary Owner | Purpose | Status |
|------|---------------|-----------------|---------|--------|
| BlackRoad-Operating-System | @alexa-amundson | @blackroad/core | Monolith (OS, API, agents) | Active |
| blackroad.io | @alexa-amundson | @blackroad/frontend | Corporate site | Planned |
| blackroad-plans | @alexa-amundson | - | Strategic planning | Active |
| lucidia | @alexa-amundson | @blackroad/ai | AI orchestration | Development |
| blackroad-api | @alexa-amundson | @blackroad/backend | API gateway | Phase 2 |
| blackroad-operator | @alexa-amundson | @blackroad/backend | Workflow orchestration | Phase 2 |
| blackroad-prism-console | @alexa-amundson | @blackroad/frontend | Admin UI | Phase 2 |

### Documentation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ MASTER DOCS (in BlackRoad-Operating-System)                │
├─────────────────────────────────────────────────────────────┤
│ MASTER_ORCHESTRATION_PLAN.md  → Complete 7-layer blueprint │
│ ORG_STRUCTURE.md (this file)  → Repo architecture          │
│ NEXT_ACTIONS_ALEXA.md          → Execution checklist       │
│ BLACKROAD_OS_BIG_KAHUNA_VISION.md → 18-24 month roadmap    │
│ CLAUDE.md                      → AI assistant guide        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ REPO-SPECIFIC DOCS (in each repo)                          │
├─────────────────────────────────────────────────────────────┤
│ IMPLEMENTATION.md              → This repo's plan           │
│ README.md                      → Overview, setup            │
│ CONTRIBUTING.md                → How to contribute          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STRATEGIC DOCS (in blackroad-plans)                        │
├─────────────────────────────────────────────────────────────┤
│ [Plans, roadmaps, strategy documents]                      │
└─────────────────────────────────────────────────────────────┘
```

---

## CONCLUSION

**Current State**: 23 repos across 2 orgs with unclear boundaries and some duplication

**Target State** (Phase 1): 4 core active repos with clear roles, 15 archived/experimental

**Execution Strategy**:
1. **Week 1**: Deprecate duplicates, tag experimental repos
2. **Weeks 2-4**: Create blackroad.io, set up docs
3. **Months 3-6**: Start lucidia development
4. **Months 6-12**: Plan Phase 2 splits (API, operator, console)
5. **Months 12+**: Microservices architecture

**Next Steps**: Create `IMPLEMENTATION.md` in each core repo with detailed plans.

---

*This document is the single source of truth for BlackRoad repository organization. Update as architecture evolves.*

**Last Updated**: 2025-11-18
**Next Review**: 2025-12-18 (monthly)
