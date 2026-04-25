# BlackRoad OS - Railway Services Documentation

> **Last Updated**: 2025-11-29
> **Project ID**: `03ce1e43-5086-4255-b2bc-0146c8916f4c`
> **Workspace**: BlackRoad OS, Inc.
> **Environment**: production

---

## Overview

BlackRoad OS is deployed across multiple Railway services, forming a distributed operating system architecture. Each service represents a distinct component of the OS ecosystem.

---

## Service Registry

### Core Services

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad** | `blackroad.railway.internal` | Main entry point service |
| **blackroad-os** | `blackroad-os-production.up.railway.app` | Primary OS interface |
| **blackroad-os-master** | `blackroad-os-master-production.up.railway.app` | Master orchestration service |
| **blackroad-os-core** | `blackroad-os-core-production.up.railway.app` | Core backend API, auth, blockchain |

### API Services

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad-os-api** | `blackroad-os-api-production-3335.up.railway.app` | Public API service |
| **blackroad-os-api-gateway** | `blackroad-os-api-gateway-production.up.railway.app` | API gateway/routing |

### Frontend Services

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad-os-home** | `blackroad-os-home-production.up.railway.app` | Home/landing page |
| **blackroad-os-web** | `blackroad-os-web-production.up.railway.app` | Web client interface |
| **blackroad-os-docs** | `blackroad-os-docs-production-f7af.up.railway.app` | Documentation site |
| **blackroad-os-demo** | `blackroad-os-demo-production.up.railway.app` | Demo environment |

### Infrastructure Services

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad-os-infra** | `blackroad-os-infra-production.up.railway.app` | Infrastructure management |
| **blackroad-os-operator** | `operator.blackroad.systems` | GitHub automation, PR orchestration |
| **blackroad-os-beacon** | `beacon.blackroad.systems` | Health monitoring/beacon service |
| **blackroad-os-archive** | `blackroad-os-archive-production.up.railway.app` | Archive/storage service |

### Pack Services (Modular Extensions)

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad-os-pack-creator-studio** | `blackroad-os-pack-creator-studio-production.up.railway.app` | Creator tools pack |
| **blackroad-os-pack-research-lab** | `blackroad-os-pack-research-lab-production.up.railway.app` | Research tools pack |
| **blackroad-os-pack-finance** | `blackroad-os-pack-finance-production.up.railway.app` | Finance tools pack |
| **blackroad-os-pack-infra-devops** | `blackroad-os-pack-infra-devops-production.up.railway.app` | DevOps tools pack |
| **blackroad-os-pack-legal** | `blackroad-os-pack-legal-production.up.railway.app` | Legal/compliance pack |

### Specialized Services

| Service | URL | Purpose |
|---------|-----|---------|
| **blackroad-prism-console** | `prism.blackroad.systems` | Prism AI orchestration console |
| **blackroad-os-research** | `blackroad-os-research-production.up.railway.app` | Research platform |
| **terrific-intuition** | `terrific-intuition-production.up.railway.app` | Experimental service |

---

## Custom Domains (Cloudflare DNS)

The following services have custom domains configured via Cloudflare:

| Domain | Service | Type |
|--------|---------|------|
| `operator.blackroad.systems` | blackroad-os-operator | CNAME |
| `beacon.blackroad.systems` | blackroad-os-beacon | CNAME |
| `prism.blackroad.systems` | blackroad-prism-console | CNAME |

---

## Environment Variables

All services share the following Railway-injected environment variables:

```
RAILWAY_ENVIRONMENT=production
RAILWAY_ENVIRONMENT_ID=57e6ac32-0e86-4bde-a337-948535e27bcc
RAILWAY_ENVIRONMENT_NAME=production
RAILWAY_PROJECT_ID=03ce1e43-5086-4255-b2bc-0146c8916f4c
RAILWAY_PROJECT_NAME=BlackRoad OS
```

### Service URL References

Services can reference each other using these environment variables:

```
RAILWAY_SERVICE_BLACKROAD_OS_API_GATEWAY_URL=blackroad-os-api-gateway-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_API_URL=blackroad-os-api-production-3335.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_BEACON_URL=beacon.blackroad.systems
RAILWAY_SERVICE_BLACKROAD_OS_CORE_URL=blackroad-os-core-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_DOCS_URL=blackroad-os-docs-production-f7af.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_HOME_URL=blackroad-os-home-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_INFRA_URL=blackroad-os-infra-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_MASTER_URL=blackroad-os-master-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_PACK_RESEARCH_LAB_URL=blackroad-os-pack-research-lab-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_OS_URL=blackroad-os-production.up.railway.app
RAILWAY_SERVICE_BLACKROAD_PRISM_CONSOLE_URL=prism.blackroad.systems
```

---

## Internal Communication

For service-to-service communication within Railway, use internal DNS:

```
http://{service-name}.railway.internal:{PORT}
```

Example:
```
http://blackroad.railway.internal:8000
```

---

## Health Checks

All services should implement the following health check endpoints:

- `GET /health` - Basic health check
- `GET /v1/sys/health` - Detailed system health (Syscall API)
- `GET /v1/sys/identity` - Service identity information

---

## Deployment

### Railway CLI Commands

```bash
# Link to project
railway link -p 03ce1e43-5086-4255-b2bc-0146c8916f4c

# Check status
railway status

# View logs
railway logs

# Deploy
railway up

# View variables
railway variables
```

### Automatic Deployments

Services are configured for automatic deployment when:
1. Code is pushed to linked GitHub repositories
2. Manual deploy triggered via Railway dashboard
3. Railway CLI `railway up` command

---

## Architecture Diagram

```
                                    Cloudflare DNS
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    operator.blackroad.systems    beacon.blackroad.systems    prism.blackroad.systems
              │                          │                          │
              ▼                          ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
    │  blackroad-os-  │        │  blackroad-os-  │        │   blackroad-    │
    │    operator     │        │     beacon      │        │  prism-console  │
    └─────────────────┘        └─────────────────┘        └─────────────────┘
              │                          │                          │
              └──────────────────────────┼──────────────────────────┘
                                         │
                            Railway Internal Network
                                         │
    ┌────────────┬────────────┬─────────┴─────────┬────────────┬────────────┐
    │            │            │                   │            │            │
    ▼            ▼            ▼                   ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌──────────┐         ┌────────┐  ┌────────┐  ┌────────┐
│  core  │  │  api   │  │ api-     │         │  web   │  │  docs  │  │ infra  │
│        │  │        │  │ gateway  │         │        │  │        │  │        │
└────────┘  └────────┘  └──────────┘         └────────┘  └────────┘  └────────┘
    │            │            │                   │            │            │
    └────────────┴────────────┴─────────┬─────────┴────────────┴────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │    Pack Services   │
                              │  (creator-studio,  │
                              │  research-lab,     │
                              │  finance, legal,   │
                              │  infra-devops)     │
                              └───────────────────┘
```

---

## Related Documentation

- `railway.json` - Service definitions and IDs
- `railway.toml` - Build and deploy configuration (root of repo)
- `.env.railway.example` - Environment variable template
- `INFRASTRUCTURE.md` - Full infrastructure documentation
- `SYSCALL_API.md` - Standard API specification

---

*This document is auto-generated and maintained. Last sync: 2025-11-29*
