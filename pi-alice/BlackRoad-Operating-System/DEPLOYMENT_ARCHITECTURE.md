# BlackRoad OS Deployment Architecture

> **Last Updated**: 2025-11-19
> **Status**: Canonical deployment model for all BlackRoad OS services

---

## Table of Contents

1. [Overview](#overview)
2. [The Monorepo vs Satellite Model](#the-monorepo-vs-satellite-model)
3. [Critical Rules](#critical-rules)
4. [Deployment Topology](#deployment-topology)
5. [Service-to-Repository Mapping](#service-to-repository-mapping)
6. [Environment Configuration](#environment-configuration)
7. [Cloudflare DNS Configuration](#cloudflare-dns-configuration)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Troubleshooting](#troubleshooting)

---

## Overview

BlackRoad OS uses a **monorepo-to-satellite sync architecture** where:

- **`BlackRoad-Operating-System`** (this repo) = Source of truth, orchestration, sync logic
- **Satellite repos** (`blackroad-os-core`, `blackroad-os-api`, etc.) = Deployable services

This document establishes the canonical deployment model to prevent misconfiguration.

---

## The Monorepo vs Satellite Model

### BlackRoad-Operating-System (Monorepo)

**Purpose**: Control plane and source of truth

**Role**:
- Houses all service code in `services/`, `apps/`, `docs/`
- Syncs code to satellite repos via GitHub Actions
- Stores orchestration logic, prompts, and infrastructure configs
- Serves as the "brain" - NOT the compute

**Deployment Status**: ❌ **NEVER DEPLOYED TO PRODUCTION**

**Why NOT deployable**:
- No single entry point (contains multiple services)
- Would create circular deployment dependencies
- Not designed for runtime execution
- Would break service discovery and routing

### Satellite Repositories

**Purpose**: Deployable, runtime services

**Satellites**:
| Repository | Purpose | Railway Service | Cloudflare Domain |
|------------|---------|-----------------|-------------------|
| `blackroad-os-core` | Core API & business logic | `blackroad-os-core-production` | `core.blackroad.systems` |
| `blackroad-os-api` | Public API gateway | `blackroad-os-api-production` | `api.blackroad.systems` |
| `blackroad-os-operator` | Agent runtime & orchestrator | `blackroad-os-operator-production` | `operator.blackroad.systems` |
| `blackroad-os-prism-console` | Status console frontend | `blackroad-os-prism-console-production` | `prism.blackroad.systems` |
| `blackroad-os-docs` | Documentation site | `blackroad-os-docs-production` | `docs.blackroad.systems` |
| `blackroad-os-web` | Public website | `blackroad-os-web-production` | `blackroad.systems` |

**Deployment Status**: ✅ **EACH DEPLOYED INDEPENDENTLY TO RAILWAY**

**Sync Process**:
1. Developer edits code in monorepo (e.g., `services/core-api/`)
2. GitHub Action syncs changes to satellite (`BlackRoad-OS/blackroad-os-core`)
3. Satellite triggers Railway deployment
4. Railway deploys to production

**See**: `docs/os/monorepo-sync.md` for sync details

---

## Critical Rules

### ❌ NEVER DO THIS

1. **Never add `BlackRoad-Operating-System` to Railway as a service**
   - Not in production environments
   - Not in staging environments
   - Not in development environments (unless explicitly testing locally)

2. **Never reference the monorepo in service configurations**
   - Don't add it to env vars (e.g., `MONOREPO_URL`)
   - Don't add it as a dependency in other services
   - Don't point Cloudflare to the monorepo

3. **Never deploy the monorepo to production**
   - It's not designed to run as a service
   - It will break everything

4. **Never host the legacy `blackroad-os` bundle**
   - The only supported UI lives in `backend/static/index.html`
   - Serve it through the FastAPI backend or the `blackroad-os-web` satellite
   - Do not push the monorepo or `/blackroad-os` assets directly to Pages/GoDaddy

### ✅ ALWAYS DO THIS

1. **Deploy ONLY satellite repos to Railway**
   - Each satellite = one Railway service
   - Each service = one environment (dev, staging, production)

2. **Edit code ONLY in the monorepo**
   - Satellites are read-only mirrors
   - All changes flow: monorepo → sync → satellite → deploy

3. **Point Cloudflare ONLY to satellite Railway URLs**
   - `core.blackroad.systems` → `blackroad-os-core-production.up.railway.app`
   - `api.blackroad.systems` → `blackroad-os-api-production.up.railway.app`
   - etc.

4. **Create production environments for ALL satellites**
   - Each satellite needs: dev, staging, production
   - Example: `blackroad-os-core-dev`, `blackroad-os-core-staging`, `blackroad-os-core-production`

---

## Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│  BlackRoad-Operating-System (Monorepo)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ services/    │  │ apps/        │  │ docs/        │      │
│  │ core-api/    │  │ prism-console│  │ site/        │      │
│  │ public-api/  │  │ web/         │  │              │      │
│  │ operator/    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                     GitHub Actions Sync                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Satellite Repositories (Deployable)                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ blackroad-os-  │  │ blackroad-os-  │  │ blackroad-os-  ││
│  │ core           │  │ api            │  │ operator       ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ blackroad-os-  │  │ blackroad-os-  │  │ blackroad-os-  ││
│  │ prism-console  │  │ web            │  │ docs           ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Railway (Deployment Platform)                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ core-production│  │ api-production │  │ operator-prod  ││
│  │ .up.railway.app│  │ .up.railway.app│  │ .up.railway.app││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare (DNS & Routing)                                  │
│  core.blackroad.systems  → blackroad-os-core-production      │
│  api.blackroad.systems   → blackroad-os-api-production       │
│  operator.blackroad.systems → blackroad-os-operator-production│
└─────────────────────────────────────────────────────────────┘
```

---

## Service-to-Repository Mapping

### Canonical Mapping

Defined in `infra/github/sync-config.yml`:

```yaml
services:
  core-api:
    monorepo_path: "services/core-api"
    target_repo: "BlackRoad-OS/blackroad-os-core"
    target_branch: "main"
  public-api:
    monorepo_path: "services/public-api"
    target_repo: "BlackRoad-OS/blackroad-os-api"
    target_branch: "main"
  operator:
    monorepo_path: "services/operator"
    target_repo: "BlackRoad-OS/blackroad-os-operator"
    target_branch: "main"

apps:
  prism-console:
    monorepo_path: "apps/prism-console"
    target_repo: "BlackRoad-OS/blackroad-os-prism-console"
    target_branch: "main"
  web:
    monorepo_path: "apps/web"
    target_repo: "BlackRoad-OS/blackroad-os-web"
    target_branch: "main"

docs:
  site:
    monorepo_path: "docs/site"
    target_repo: "BlackRoad-OS/blackroad-os-docs"
    target_branch: "main"
```

### Development Workflow

1. **Edit in monorepo**: `services/core-api/app/main.py`
2. **Commit to monorepo**: `git commit -m "Add health endpoint"`
3. **Push to monorepo**: `git push origin main`
4. **GitHub Action syncs**: Copies `services/core-api/` → `BlackRoad-OS/blackroad-os-core`
5. **Railway deploys**: Deploys `blackroad-os-core` to production

---

## Environment Configuration

### Required Railway Environments

Each satellite repository needs THREE environments:

1. **Development** (`-dev`)
   - Connected to: `dev` or `develop` branch
   - Example: `blackroad-os-core-dev.up.railway.app`

2. **Staging** (`-staging`)
   - Connected to: `staging` branch
   - Example: `blackroad-os-core-staging.up.railway.app`

3. **Production** (`-production`)
   - Connected to: `main` branch
   - Example: `blackroad-os-core-production.up.railway.app`

### Environment Variables by Service

#### Core API (`blackroad-os-core`)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...

# Auth
SECRET_KEY=...
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Service URLs
API_URL=https://api.blackroad.systems
OPERATOR_URL=https://operator.blackroad.systems
PRISM_URL=https://prism.blackroad.systems

# Environment
ENVIRONMENT=production
DEBUG=False
```

#### Public API (`blackroad-os-api`)

```bash
# Core API reference
CORE_API_URL=https://core.blackroad.systems

# Auth
JWT_SECRET=...

# Environment
ENVIRONMENT=production
```

#### Operator (`blackroad-os-operator`)

```bash
# Core API reference
CORE_API_URL=https://core.blackroad.systems
API_URL=https://api.blackroad.systems

# GitHub
GITHUB_TOKEN=...
GITHUB_APP_ID=...

# Environment
ENVIRONMENT=production
```

#### Prism Console (`blackroad-os-prism-console`)

```bash
# Frontend env vars (Next.js)
NEXT_PUBLIC_CORE_API_URL=https://core.blackroad.systems
NEXT_PUBLIC_API_URL=https://api.blackroad.systems
NEXT_PUBLIC_OPERATOR_URL=https://operator.blackroad.systems
```

### ❌ NEVER Add These Vars

```bash
# ❌ DO NOT ADD THESE - THEY WILL BREAK EVERYTHING
MONOREPO_URL=https://github.com/blackboxprogramming/BlackRoad-Operating-System
BLACKROAD_OS_REPO=BlackRoad-Operating-System
SOURCE_REPO=BlackRoad-Operating-System
```

**Why?** These vars reference the non-deployable monorepo, creating confusion and breaking service discovery.

---

## Cloudflare DNS Configuration

### Canonical DNS Records

| Subdomain | Type | Target | Proxied |
|-----------|------|--------|---------|
| `blackroad.systems` | CNAME | `blackroad-os-web-production.up.railway.app` | ✅ Yes |
| `core.blackroad.systems` | CNAME | `blackroad-os-core-production.up.railway.app` | ✅ Yes |
| `api.blackroad.systems` | CNAME | `blackroad-os-api-production.up.railway.app` | ✅ Yes |
| `operator.blackroad.systems` | CNAME | `blackroad-os-operator-production.up.railway.app` | ✅ Yes |
| `prism.blackroad.systems` | CNAME | `blackroad-os-prism-console-production.up.railway.app` | ✅ Yes |
| `docs.blackroad.systems` | CNAME | `blackroad-os-docs-production.up.railway.app` | ✅ Yes |
| `os.blackroad.systems` | CNAME | `prism.blackroad.systems` | ✅ Yes |

### ❌ NEVER Point Cloudflare To

```
# ❌ WRONG - Monorepo is not deployed
core.blackroad.systems → blackroad-operating-system.up.railway.app

# ❌ WRONG - Monorepo doesn't exist on Railway
api.blackroad.systems → blackroad-os-monorepo-production.up.railway.app
```

**See**: `CLOUDFLARE_DNS_BLUEPRINT.md` for complete DNS configuration

---

## Common Mistakes to Avoid

### Mistake #1: Adding Monorepo to Railway

**Problem**:
```bash
# ❌ Creating Railway service for monorepo
railway link blackboxprogramming/BlackRoad-Operating-System
railway up
```

**Why it's wrong**:
- Monorepo contains multiple services (not a single deployable)
- No single entry point or health check
- Will create circular dependencies

**Solution**:
```bash
# ✅ Deploy satellite repos instead
railway link BlackRoad-OS/blackroad-os-core
railway up
```

### Mistake #2: Adding Monorepo to Service Env Vars

**Problem**:
```bash
# ❌ In blackroad-os-core environment
MONOREPO_URL=https://github.com/blackboxprogramming/BlackRoad-Operating-System
```

**Why it's wrong**:
- Services should reference other services, not the source repo
- Creates confusion between source code and runtime services

**Solution**:
```bash
# ✅ Reference other services instead
API_URL=https://api.blackroad.systems
OPERATOR_URL=https://operator.blackroad.systems
```

### Mistake #3: Pointing Cloudflare to Monorepo

**Problem**:
```
# ❌ Cloudflare DNS
core.blackroad.systems → blackroad-operating-system.up.railway.app
```

**Why it's wrong**:
- Monorepo is not deployed to Railway
- URL doesn't exist
- Will result in DNS failures

**Solution**:
```
# ✅ Point to satellite Railway URL
core.blackroad.systems → blackroad-os-core-production.up.railway.app
```

### Mistake #4: Editing Satellite Repos Directly

**Problem**:
```bash
# ❌ Editing blackroad-os-core directly
cd blackroad-os-core
git commit -m "Fix bug"
git push
```

**Why it's wrong**:
- Satellites are read-only mirrors
- Changes will be overwritten by next sync
- Creates drift between monorepo and satellite

**Solution**:
```bash
# ✅ Edit in monorepo
cd BlackRoad-Operating-System/services/core-api
# Make changes
git commit -m "Fix bug"
git push
# Sync workflow automatically updates satellite
```

---

## Troubleshooting

### Issue: "Service not deploying after code change"

**Diagnosis**:
1. Check if code was edited in monorepo (not satellite)
2. Verify sync workflow ran successfully
3. Check Railway deployment logs

**Solution**:
```bash
# 1. Verify sync workflow
gh workflow view sync-core-api
gh run list --workflow=sync-core-api

# 2. Manually trigger sync if needed
gh workflow run sync-core-api

# 3. Check Railway deployment
railway logs -s blackroad-os-core-production
```

### Issue: "Environment variables not resolving correctly"

**Diagnosis**:
1. Check if vars reference monorepo (wrong)
2. Verify service-to-service URLs are correct
3. Confirm Railway environment is set up properly

**Solution**:
```bash
# 1. List current env vars
railway variables

# 2. Remove monorepo references
railway variables delete MONOREPO_URL

# 3. Add correct service URLs
railway variables set CORE_API_URL=https://core.blackroad.systems
```

### Issue: "Cloudflare returning 522 errors"

**Diagnosis**:
1. Check if DNS points to correct Railway URL
2. Verify Railway service is running
3. Confirm health check is passing

**Solution**:
```bash
# 1. Check Railway service status
railway status

# 2. Verify health endpoint
curl https://blackroad-os-core-production.up.railway.app/health

# 3. Update Cloudflare DNS if needed
# (via Cloudflare dashboard: DNS → Edit CNAME)
```

### Issue: "Circular deployment loops"

**Diagnosis**:
- Monorepo may be configured as a dependency
- Service may be triggering its own deployment

**Solution**:
1. Remove monorepo from Railway services
2. Ensure satellites deploy independently
3. Check GitHub Actions triggers

---

## Summary

### The Golden Rules

1. **Monorepo = Source of Truth** (not deployed)
2. **Satellites = Deployable Services** (deployed to Railway)
3. **Edit in monorepo** → Sync to satellites → Deploy automatically
4. **Never add monorepo to Railway** or service configurations
5. **Cloudflare points to satellites**, not monorepo

### Quick Reference

**When you want to...**

- **Deploy a service**: Use satellite repo (`blackroad-os-core`), not monorepo
- **Edit code**: Edit in monorepo (`services/core-api`), not satellite
- **Configure DNS**: Point to satellite Railway URL, not monorepo
- **Set env vars**: Reference other services, not monorepo
- **Create new service**: Add to monorepo, create sync workflow, deploy satellite

---

**For questions or issues**, see:
- `docs/os/monorepo-sync.md` - Sync process details
- `CLOUDFLARE_DNS_BLUEPRINT.md` - DNS configuration
- `infra/railway/ENVIRONMENT_GUIDE.md` - Railway setup
- `CLAUDE.md` - Development guide

---

*Last updated: 2025-11-19*
*This document is canonical for all BlackRoad OS deployments.*
