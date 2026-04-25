# BlackRoad Domain Architecture

> **Last Updated**: 2025-11-29
> **Purpose**: Map verified domains to services, repos, and Railway deployments

---

## Domain Inventory

### Primary Domains

| Domain | Purpose | Target Service | Railway Service |
|--------|---------|----------------|-----------------|
| **blackroad.systems** | Enterprise OS Platform | API Gateway | blackroad-os-api-gateway |
| **blackroad.io** | Consumer Platform | Web App | blackroad-os-web |
| **blackroadinc.us** | Corporate Site | Static/Landing | blackroad-os-home |
| **blackroadai.com** | AI Platform | Prism Console | blackroad-prism-console |
| **lucidia.earth** | Lucidia Platform | Lucidia Service | (future) |
| **lucidia.studio** | Creator Studio | Creator Pack | blackroad-os-pack-creator-studio |

### Quantum/Research Domains

| Domain | Purpose | Target Service |
|--------|---------|----------------|
| **blackroadquantum.com** | Quantum Computing Hub | blackroad-os-research |
| **blackroadquantum.info** | Quantum Documentation | blackroad-os-docs |
| **blackroadquantum.net** | Quantum Network/API | blackroad-os-pack-research-lab |
| **blackroadquantum.shop** | Quantum Marketplace | (future) |
| **blackroadquantum.store** | Quantum Assets | (future) |
| **blackroadqi.com** | Quantum Intelligence | blackroad-os-research |
| **lucidiaqi.com** | Lucidia Quantum | blackroad-os-research |

### Specialty Domains

| Domain | Purpose | Target Service |
|--------|---------|----------------|
| **blackroad.me** | Personal/Profile | blackroad-os-web |
| **blackroad.network** | Network Services | blackroad-os-infra |
| **aliceqi.com** | Alice/Personal Brand | (static) |

---

## Subdomain Architecture

### blackroad.systems (Enterprise)

```
blackroad.systems
├── api.blackroad.systems        → blackroad-os-api-gateway
├── core.blackroad.systems       → blackroad-os-core
├── operator.blackroad.systems   → blackroad-os-operator
├── beacon.blackroad.systems     → blackroad-os-beacon
├── prism.blackroad.systems      → blackroad-prism-console
├── docs.blackroad.systems       → blackroad-os-docs
├── console.blackroad.systems    → blackroad-os-master
├── infra.blackroad.systems      → blackroad-os-infra
├── archive.blackroad.systems    → blackroad-os-archive
├── demo.blackroad.systems       → blackroad-os-demo
└── status.blackroad.systems     → (health dashboard)
```

### blackroad.io (Consumer)

```
blackroad.io
├── app.blackroad.io             → blackroad-os-web (main app)
├── home.blackroad.io            → blackroad-os-home (landing)
├── roadview.blackroad.io        → (search platform - future)
├── roadwork.blackroad.io        → blackroad-os-pack-education
├── roadworld.blackroad.io       → (metaverse - future)
├── roadtrip.blackroad.io        → blackroad-os-pack-creator-studio
├── roadchain.blackroad.io       → (blockchain - future)
├── agents.blackroad.io          → blackroad-os-agents
└── api.blackroad.io             → blackroad-os-api
```

### Pack Subdomains

```
packs.blackroad.systems (or blackroad.io)
├── finance.blackroad.systems    → blackroad-os-pack-finance
├── legal.blackroad.systems      → blackroad-os-pack-legal
├── research.blackroad.systems   → blackroad-os-pack-research-lab
├── creator.blackroad.systems    → blackroad-os-pack-creator-studio
├── education.blackroad.systems  → blackroad-os-pack-education
├── devops.blackroad.systems     → blackroad-os-pack-infra-devops
└── brand.blackroad.systems      → blackroad-os-brand
```

---

## GitHub Organization Mapping

### BlackRoad-OS (Primary)

| Repository | Domain | Purpose |
|------------|--------|---------|
| blackroad-os | blackroad.io | Main monorepo/orchestration |
| blackroad-os-web | app.blackroad.io | Consumer web application |
| blackroad-os-core | core.blackroad.systems | Core API & backend |
| blackroad-os-api | api.blackroad.io | Public API |
| blackroad-os-api-gateway | api.blackroad.systems | API gateway/routing |
| blackroad-os-operator | operator.blackroad.systems | GitHub automation |
| blackroad-os-beacon | beacon.blackroad.systems | Health monitoring |
| blackroad-os-master | console.blackroad.systems | Master console |
| blackroad-os-home | home.blackroad.io | Landing page |
| blackroad-os-docs | docs.blackroad.systems | Documentation |
| blackroad-os-demo | demo.blackroad.systems | Demo environment |
| blackroad-os-archive | archive.blackroad.systems | Archive storage |
| blackroad-os-infra | infra.blackroad.systems | Infrastructure |
| blackroad-os-agents | agents.blackroad.io | Agent system |
| blackroad-os-research | research.blackroad.systems | Research platform |
| blackroad-os-brand | brand.blackroad.systems | Brand assets |
| blackroad-os-ideas | - | Ideas repository |

### Pack Repositories

| Repository | Domain | Purpose |
|------------|--------|---------|
| blackroad-os-pack-finance | finance.blackroad.systems | Finance automation |
| blackroad-os-pack-legal | legal.blackroad.systems | Legal & compliance |
| blackroad-os-pack-research-lab | research.blackroad.systems | Research tools |
| blackroad-os-pack-creator-studio | creator.blackroad.systems | Creator tools |
| blackroad-os-pack-education | education.blackroad.systems | Education platform |
| blackroad-os-pack-infra-devops | devops.blackroad.systems | DevOps tools |

### Other Organizations

| Organization | Domain Focus | Purpose |
|--------------|--------------|---------|
| BlackRoad-AI | blackroadai.com | AI/ML services |
| BlackRoad-Labs | blackroadquantum.* | Research & quantum |
| BlackRoad-Education | roadwork.blackroad.io | Education platform |
| BlackRoad-Media | - | Media & content |
| BlackRoad-Studio | lucidia.studio | Creator studio |
| BlackRoad-Cloud | blackroad.network | Cloud infrastructure |
| BlackRoad-Security | - | Security services |
| BlackRoad-Foundation | - | Open source & community |
| BlackRoad-Interactive | - | Gaming & metaverse |
| BlackRoad-Hardware | - | Hardware projects |
| BlackRoad-Ventures | - | Investments |
| BlackRoad-Gov | - | Government/compliance |
| BlackRoad-Archive | archive.blackroad.systems | Archive management |
| Blackbox-Enterprises | - | Parent company |

---

## Railway Service to Domain Mapping

### Current Railway Services (BlackRoad OS Project)

| Railway Service | Primary Domain | Subdomain |
|----------------|----------------|-----------|
| blackroad | blackroad.io | (root) |
| blackroad-os | blackroad.io | os.blackroad.io |
| blackroad-os-master | blackroad.systems | console.blackroad.systems |
| blackroad-os-home | blackroad.io | home.blackroad.io |
| blackroad-os-operator | blackroad.systems | operator.blackroad.systems |
| blackroad-os-beacon | blackroad.systems | beacon.blackroad.systems |
| blackroad-os-core | blackroad.systems | core.blackroad.systems |
| blackroad-os-api | blackroad.io | api.blackroad.io |
| blackroad-os-api-gateway | blackroad.systems | api.blackroad.systems |
| blackroad-os-web | blackroad.io | app.blackroad.io |
| blackroad-os-docs | blackroad.systems | docs.blackroad.systems |
| blackroad-os-demo | blackroad.systems | demo.blackroad.systems |
| blackroad-os-infra | blackroad.systems | infra.blackroad.systems |
| blackroad-os-archive | blackroad.systems | archive.blackroad.systems |
| blackroad-os-research | blackroad.systems | research.blackroad.systems |
| blackroad-prism-console | blackroad.systems | prism.blackroad.systems |
| blackroad-os-pack-finance | blackroad.systems | finance.blackroad.systems |
| blackroad-os-pack-legal | blackroad.systems | legal.blackroad.systems |
| blackroad-os-pack-research-lab | blackroad.systems | lab.blackroad.systems |
| blackroad-os-pack-creator-studio | blackroad.io | creator.blackroad.io |
| blackroad-os-pack-infra-devops | blackroad.systems | devops.blackroad.systems |

---

## DNS Configuration (Cloudflare)

### Root Domain Records

```dns
# blackroad.systems
@                  A        (Railway IP or CNAME to Railway)
api                CNAME    blackroad-os-api-gateway-production.up.railway.app
core               CNAME    blackroad-os-core-production.up.railway.app
operator           CNAME    blackroad-os-operator-production.up.railway.app
beacon             CNAME    blackroad-os-beacon-production.up.railway.app
prism              CNAME    blackroad-prism-console-production.up.railway.app
docs               CNAME    blackroad-os-docs-production.up.railway.app
console            CNAME    blackroad-os-master-production.up.railway.app
infra              CNAME    blackroad-os-infra-production.up.railway.app
demo               CNAME    blackroad-os-demo-production.up.railway.app
archive            CNAME    blackroad-os-archive-production.up.railway.app
research           CNAME    blackroad-os-research-production.up.railway.app
finance            CNAME    blackroad-os-pack-finance-production.up.railway.app
legal              CNAME    blackroad-os-pack-legal-production.up.railway.app
devops             CNAME    blackroad-os-pack-infra-devops-production.up.railway.app

# blackroad.io
@                  A        (Railway IP or CNAME to Railway)
app                CNAME    blackroad-os-web-production.up.railway.app
home               CNAME    blackroad-os-home-production.up.railway.app
api                CNAME    blackroad-os-api-production.up.railway.app
agents             CNAME    blackroad-os-agents-production.up.railway.app
creator            CNAME    blackroad-os-pack-creator-studio-production.up.railway.app
```

---

## Implementation Priority

### Phase 1: Core Infrastructure (Now)
1. ✅ blackroad.systems → api.blackroad.systems (API Gateway)
2. ✅ prism.blackroad.systems (Prism Console)
3. ✅ operator.blackroad.systems (Operator)
4. ✅ beacon.blackroad.systems (Beacon)
5. [ ] core.blackroad.systems (Core API)
6. [ ] docs.blackroad.systems (Documentation)

### Phase 2: Consumer Platform
1. [ ] blackroad.io root
2. [ ] app.blackroad.io (Main app)
3. [ ] home.blackroad.io (Landing)
4. [ ] api.blackroad.io (Public API)

### Phase 3: Packs & Extensions
1. [ ] finance.blackroad.systems
2. [ ] legal.blackroad.systems
3. [ ] research.blackroad.systems
4. [ ] creator.blackroad.io
5. [ ] education.blackroad.io

### Phase 4: Advanced
1. [ ] blackroadquantum.com
2. [ ] lucidia.earth
3. [ ] lucidia.studio

---

## Service Health Endpoints

All services should expose:
- `GET /health` - Basic health check
- `GET /v1/sys/health` - Detailed system health
- `GET /v1/sys/identity` - Service identity
- `GET /v1/sys/version` - Version info

---

*This document defines the canonical mapping between domains, services, and repositories for BlackRoad OS.*
