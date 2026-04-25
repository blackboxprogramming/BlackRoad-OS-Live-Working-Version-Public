# BlackRoad OS Infrastructure Registry

**Version:** 1.0.0
**Last Updated:** 2025-11-28
**Owner:** Alexa Louise Amundson (Operator)
**Status:** Production Active

---

## Overview

This document is the **single source of truth** for all BlackRoad OS infrastructure:
- Domain portfolio
- GitHub organizations
- Railway services
- Cloudflare configurations
- Service mappings

---

## 1. Domain Portfolio (16 Domains)

### Cluster A: OS Layer (Primary)

| Domain | Purpose | Hosting | Status |
|--------|---------|---------|--------|
| **blackroad.systems** | OS backend, services, APIs | Railway | Active |

### Cluster B: Brand/Frontend Layer

| Domain | Purpose | Hosting | Status |
|--------|---------|---------|--------|
| **blackroad.io** | Consumer-facing UI | Pages + Railway | Active |
| **blackroad.me** | Personal brand site | Pages | Reserved |
| **blackroad.network** | Social/identity layer | TBD | Reserved |
| **blackroadai.com** | AI-focused public brand | Pages | Reserved |
| **blackroadinc.us** | Corporate presence | Pages | Reserved |

### Cluster C: Quantum Layer

| Domain | Purpose | Hosting | Status |
|--------|---------|---------|--------|
| **blackroadquantum.com** | Quantum roadmap | TBD | Reserved |
| **blackroadquantum.net** | Quantum API layer | Railway | Reserved |
| **blackroadquantum.info** | Quantum documentation | Pages | Reserved |
| **blackroadquantum.shop** | Quantum merchandise | E-commerce | Reserved |
| **blackroadquantum.store** | Quantum merchandise | E-commerce | Reserved |

### Cluster D: Lucidia Layer

| Domain | Purpose | Hosting | Status |
|--------|---------|---------|--------|
| **lucidia.earth** | Lucidia worldspace | Pages | Reserved |
| **lucidiaqi.com** | Lucidia + QI identity | Pages | Reserved |
| **lucidia.studio** | Lucidia creative tools | Pages | Active |

### Cluster E: QI Layer

| Domain | Purpose | Hosting | Status |
|--------|---------|---------|--------|
| **blackroadqi.com** | QI math layer | TBD | Reserved |
| **aliceqi.com** | Personal AI identity | TBD | Reserved |

---

## 2. GitHub Organization Map (17 Orgs)

### Enterprise

| Organization | Type | Purpose |
|--------------|------|---------|
| **BlackRoad OS, Inc.** | Enterprise | Parent umbrella, SSO, billing |

### Core Organizations

| Organization | Purpose | Priority |
|--------------|---------|----------|
| **BlackRoad-OS** | Main OS kernel, services, agents | HIGHEST |
| **BlackRoad-Cloud** | Infrastructure, IaC, deployment | HIGH |
| **BlackRoad-AI** | LLM agents, AI frameworks | HIGH |

### Supporting Organizations

| Organization | Purpose | Layer |
|--------------|---------|-------|
| **BlackRoad-Labs** | R&D, math, quantum, experiments | Research |
| **BlackRoad-Media** | Brand, graphics, creative assets | Creative |
| **BlackRoad-Studio** | Design engineering, editors | Creative |
| **BlackRoad-Security** | Zero-trust, auth, threats | Security |
| **BlackRoad-Gov** | Compliance, FINRA, regulation | Compliance |
| **BlackRoad-Ventures** | Startup arm, revenue ops | Commercial |
| **BlackRoad-Foundation** | Non-profit, ethics, AI safety | Mission |
| **BlackRoad-Education** | Learning portals, training | Education |
| **BlackRoad-Hardware** | Pi fleet, IoT, embedded | Hardware |
| **BlackRoad-Interactive** | Games, VR, 3D worlds | Interactive |
| **BlackRoad-Archive** | Legacy repos, backups | Archive |
| **Blackbox-Enterprises** | Legacy parent org | Deprecated |

---

## 3. BlackRoad-OS Repository Map (25 Repos)

### Core Layer (Kernel)

| Repo | Railway Service | Domain | Purpose |
|------|-----------------|--------|---------|
| `blackroad-os-core` | blackroad-os-core-production | core.blackroad.systems | Main OS app |
| `blackroad-os-api` | blackroad-os-api-production | api.blackroad.systems | Operator API |
| `blackroad-os-api-gateway` | blackroad-os-api-gateway-production | - | API gateway |
| `blackroad-os-web` | blackroad-os-web-production | web.blackroad.systems | Public backend |
| `blackroad` | blackroad-production | - | Legacy monolith |
| `blackroad-os-master` | blackroad-os-master-production | - | Master controller |

### Automation Layer

| Repo | Railway Service | Domain | Purpose |
|------|-----------------|--------|---------|
| `blackroad-os-operator` | blackroad-os-operator-production | operator.blackroad.systems | Orchestrator |
| `blackroad-os-beacon` | blackroad-os-beacon-production | - | Telemetry |
| `blackroad-os-infra` | blackroad-os-infra-production | infra.blackroad.systems | IaC |
| `blackroad-os-archive` | blackroad-os-archive-production | - | Append-only logs |

### Pack Layer (Modular Apps)

| Repo | Railway Service | Purpose |
|------|-----------------|---------|
| `blackroad-os-pack-research-lab` | pack-research-lab-production | R&D tools |
| `blackroad-os-pack-legal` | pack-legal-production | Legal compliance |
| `blackroad-os-pack-infra-devops` | pack-infra-devops-production | CI/CD |
| `blackroad-os-pack-finance` | pack-finance-production | Billing |
| `blackroad-os-pack-education` | pack-education-production | Training |
| `blackroad-os-pack-creator-studio` | pack-creator-studio-production | Design tools |

### Intelligence Layer

| Repo | Railway Service | Purpose |
|------|-----------------|---------|
| `blackroad-os-agents` | - | Agent manifests |
| `blackroad-os-ideas` | blackroad-os-ideas-production | Idea backlog |
| `blackroad-os-research` | blackroad-os-research-production | Math research |

### Brand Layer

| Repo | Railway Service | Domain | Purpose |
|------|-----------------|--------|---------|
| `blackroad-os-brand` | blackroad-os-brand-production | - | Brand system |
| `blackroad-os-home` | blackroad-os-home-production | - | Company handbook |
| `blackroad-os-docs` | blackroad-os-docs-production | docs.blackroad.systems | Documentation |

### UI/Admin Layer

| Repo | Railway Service | Domain | Purpose |
|------|-----------------|--------|---------|
| `blackroad-os-demo` | blackroad-os-demo-production | - | Demo site |
| `blackroad-os-prism-console` | blackroad-os-prism-console-production | console.blackroad.systems | Admin console |

---

## 4. Railway Configuration

### Project Details

```
Project ID: 03ce1e43-5086-4255-b2bc-0146c8916f4c
Dashboard: https://railway.com/project/03ce1e43-5086-4255-b2bc-0146c8916f4c
Environment: production
```

### Service Contract

Every Railway service MUST implement:

```yaml
endpoints:
  - path: /health
    method: GET
    response: { "status": "ok" }

  - path: /version
    method: GET
    response: { "version": "x.y.z", "commit": "<sha>", "service": "<name>" }

requirements:
  - Dockerfile or Nixpacks
  - Bind to $PORT environment variable
  - Production start command (not dev mode)
  - railway.json configuration
```

### Railway Service URLs (Production)

| Service | Railway URL |
|---------|-------------|
| blackroad-os | blackroad-os-production.up.railway.app |
| blackroad-os-api | blackroad-os-api-production-ff5a.up.railway.app |
| blackroad-os-core | blackroad-os-core-production.up.railway.app |
| blackroad-os-web | blackroad-os-web-production.up.railway.app |
| blackroad-os-operator | blackroad-os-operator-production.up.railway.app |
| blackroad-os-docs | blackroad-os-docs-production.up.railway.app |
| blackroad-os-prism-console | blackroad-os-prism-console-production.up.railway.app |

---

## 5. Cloudflare DNS Configuration

### blackroad.systems (Backend OS)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | blackroad-operating-system-production.up.railway.app | ON |
| CNAME | www | blackroad.systems | ON |
| CNAME | api | blackroad-os-api-production-ff5a.up.railway.app | ON |
| CNAME | app | blackroad-operating-system-production.up.railway.app | ON |
| CNAME | console | blackroad-os-prism-console-production.up.railway.app | ON |
| CNAME | core | blackroad-os-core-production.up.railway.app | ON |
| CNAME | docs | blackroad-os-docs-production.up.railway.app | ON |
| CNAME | infra | blackroad-os-infra-production.up.railway.app | ON |
| CNAME | operator | blackroad-os-operator-production.up.railway.app | ON |
| CNAME | os | blackroad-os-root-production.up.railway.app | ON |
| CNAME | prism | blackroad-prism-console-production.up.railway.app | ON |
| CNAME | research | blackroad-os-research-production.up.railway.app | ON |
| CNAME | web | blackroad-os-web-production.up.railway.app | ON |

### blackroad.io (Frontend UI)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | blackroad-operating-system-production.up.railway.app | ON |
| CNAME | www | blackroad.io | ON |
| CNAME | api | blackroad-os-api.pages.dev | ON |
| CNAME | brand | blackroad-os-brand.pages.dev | ON |
| CNAME | chat | nextjs-ai-chatbot.pages.dev | ON |
| CNAME | console | blackroad-os-prism-console.pages.dev | ON |
| CNAME | dashboard | blackroad-os-operator.pages.dev | ON |
| CNAME | demo | blackroad-os-demo.pages.dev | ON |
| CNAME | docs | blackroad-os-docs.pages.dev | ON |
| CNAME | operator | blackroad-os-operator.pages.dev | ON |
| CNAME | prism | blackroad-os-prism-console.pages.dev | ON |
| CNAME | studio | lucidia.studio.pages.dev | ON |
| CNAME | web | blackroad-os-web.pages.dev | ON |

### Cloudflare Settings

```yaml
ssl_mode: Full (Strict)
always_https: true
min_tls_version: "1.2"
automatic_https_rewrites: true
brotli: true
auto_minify: true
```

---

## 6. Agent Registry

### Current Agent Count: 300

| Tier | Range | Count | Purpose |
|------|-------|-------|---------|
| Executive | 1-5 | 5 | C-suite decision makers |
| Operational | 6-25 | 20 | Department heads |
| Supporting | 26-50 | 25 | Specialists |
| Specialist | 51-75 | 25 | Domain experts |
| Swarm | 76-100 | 25 | Task executors |
| Governance | 101-115 | 15 | Policy & compliance |
| Intelligence | 116-140 | 25 | Analytics & insights |
| Infrastructure | 141-165 | 25 | DevOps & systems |
| Commerce | 166-185 | 20 | Business operations |
| Ecosystem | 186-200 | 15 | Platform & community |
| Defense | 201-220 | 20 | Security & protection |
| Knowledge | 221-240 | 20 | Documentation & learning |
| Creative | 241-260 | 20 | Design & content |
| Quality | 261-280 | 20 | Testing & QA |
| Innovation | 281-300 | 20 | R&D & experimentation |

### Agent Registry Location
```
/Users/alexa/projects/blackroad-os-agents-work/registry/agents.json
```

---

## 7. Brand System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Orange | #FF9D00 | Primary accent |
| Deep Orange | #FF6B00 | Primary gradient |
| Hot Pink | #FF0066 | Secondary accent |
| Magenta Pink | #FF006B | Tertiary accent |
| Magenta | #D600AA | Gradient mid |
| Electric Purple | #7700FF | Gradient transition |
| Electric Blue | #0066FF | Secondary accent |

### Gradient

```css
--br-gradient: linear-gradient(135deg, #FF9D00, #FF6B00, #FF0066, #D600AA, #7700FF, #0066FF);
```

---

## 8. Deployment Checklist

### New Railway Service

- [ ] Create repo in BlackRoad-OS org
- [ ] Add `Dockerfile`
- [ ] Add `railway.json`
- [ ] Implement `/health` endpoint
- [ ] Implement `/version` endpoint
- [ ] Bind to `$PORT` environment variable
- [ ] Connect repo to Railway
- [ ] Add CNAME in Cloudflare
- [ ] Verify health check
- [ ] Document in this registry

### New Cloudflare Pages Site

- [ ] Create repo in appropriate org
- [ ] Add build configuration
- [ ] Connect to Cloudflare Pages
- [ ] Add CNAME in Cloudflare
- [ ] Verify site loads
- [ ] Document in this registry

---

## 9. Quick Reference

### Railway CLI

```bash
# Login
railway login

# Link to project
railway link 03ce1e43-5086-4255-b2bc-0146c8916f4c

# Check status
railway status

# View logs
railway logs --service <service-name>

# Redeploy
railway up --service <service-name>
```

### Health Check Script

```bash
#!/bin/bash
for domain in api core operator console docs web; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain.blackroad.systems/health")
  echo "$domain: $status"
done
```

### DNS Verification

```bash
dig api.blackroad.systems +short
dig core.blackroad.systems +short
dig operator.blackroad.systems +short
```

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-28 | Alexa + Cece | Initial comprehensive registry |

---

**This document is the authoritative reference for BlackRoad OS infrastructure.**
**Keep it updated as the system evolves.**
