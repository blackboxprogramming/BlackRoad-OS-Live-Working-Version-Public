# BlackRoad OS Infrastructure Control Plane

> **Last Updated**: 2025-11-19
> **Maintained By**: Atlas (AI Infrastructure Orchestrator) + Alexa Louise Amundson
> **Version**: 1.0

---

## 📋 Overview

This directory contains the **infrastructure control plane** for all BlackRoad OS services. It serves as the single source of truth for service definitions, deployment configurations, and operational tooling.

### Key Components

1. **`blackroad-manifest.yml`** - Complete service catalog with configuration
2. **`analysis/`** - Per-service technical analysis documents
3. **`templates/`** - Reusable infrastructure templates
4. **`../scripts/br_ops.py`** - Command-line operations tool
5. **`cloudflare/`** - DNS and CDN configuration
6. **`env/`** - Environment variable mapping

---

## 🗂️ Directory Structure

```
infra/
├── README.md                           # This file
├── blackroad-manifest.yml              # Service manifest (SSOT)
│
├── analysis/                           # Service analyses
│   ├── blackroad-backend.md            # Active: Main backend
│   ├── postgres.md                     # Active: Database
│   ├── redis.md                        # Active: Cache
│   ├── docs-site.md                    # Active: Documentation
│   ├── blackroad-api.md                # Planned: API gateway
│   └── prism-console.md                # Planned: Admin console
│
├── templates/                          # Infrastructure templates
│   ├── railway.toml.template           # Railway config
│   ├── railway.json.template           # Railway JSON config
│   ├── Dockerfile.fastapi.template     # FastAPI Dockerfile
│   ├── github-workflow-railway-deploy.yml.template
│   └── .env.example.template           # Environment variables
│
├── cloudflare/                         # DNS & CDN
│   ├── records.yaml                    # DNS records
│   ├── CLOUDFLARE_DNS_BLUEPRINT.md     # DNS setup guide
│   └── migrate_to_cloudflare.md        # Migration guide
│
└── env/                                # Environment mapping
    └── ENVIRONMENT_MAP.md              # Cross-platform env vars
```

---

## 🚀 Quick Start

### Using the Ops CLI

The `br_ops.py` CLI tool provides unified operations across all services:

```bash
# List all services
python scripts/br_ops.py list

# Show environment variables for a service
python scripts/br_ops.py env blackroad-backend

# Show repository information
python scripts/br_ops.py repo blackroad-backend

# Show service URL
python scripts/br_ops.py open blackroad-backend prod

# Show overall status
python scripts/br_ops.py status

# Show health check commands
python scripts/br_ops.py health blackroad-backend

# Show help
python scripts/br_ops.py help
```

### Example Output

```
$ python scripts/br_ops.py list

BLACKROAD OS SERVICES
================================================================================

🟢 ACTIVE SERVICES
--------------------------------------------------------------------------------

  blackroad-backend
    Type:     backend
    Repo:     blackboxprogramming/BlackRoad-Operating-System
    Domain:   blackroad.systems
    Project:  blackroad-core
    Phase:    1

  postgres
    Type:     database
    Domain:   N/A
    Project:  blackroad-core
    Phase:    1

  redis
    Type:     cache
    Domain:   N/A
    Project:  blackroad-core
    Phase:    1

📋 PLANNED SERVICES (Future)
--------------------------------------------------------------------------------

  public-api
    Type:        api-gateway
    Repo:        blackboxprogramming/blackroad-api
    Target Date: 2026-Q2
    Project:     blackroad-api

Total Services: 10
  Active:       4
  Development:  1
  Planned:      5
```

---

## 📖 Service Manifest

### What is `blackroad-manifest.yml`?

The manifest is a YAML file that defines:
- All active and planned services
- Deployment configuration
- Environment variables
- Domain mappings
- Dependencies (databases, caches, etc.)
- Health check endpoints
- CI/CD integration

### Manifest Structure

```yaml
version: "1.0"
workspace: "BlackRoad OS, Inc."

# Deployment state
deployment_state:
  phase: "Phase 1 - Monolith"
  strategy: "Monorepo with consolidation"
  active_services: 3
  planned_services: 11

# Domain configuration
domains:
  primary: "blackroad.systems"
  api: "api.blackroad.systems"
  prism: "prism.blackroad.systems"
  docs: "docs.blackroad.systems"

# Active projects
projects:
  blackroad-core:
    description: "Core backend API + static UI"
    services:
      blackroad-backend:
        repo: "blackboxprogramming/BlackRoad-Operating-System"
        kind: "backend"
        language: "python"
        framework: "FastAPI 0.104.1"
        # ... detailed configuration ...

# Planned projects
planned_projects:
  blackroad-api:
    description: "Public API gateway"
    status: "planned"
    phase: 2
    # ... configuration ...
```

### When to Update the Manifest

Update `blackroad-manifest.yml` when:
- ✅ Adding a new service
- ✅ Changing environment variables
- ✅ Updating domain routing
- ✅ Modifying deployment configuration
- ✅ Changing service dependencies
- ✅ Adding or removing health endpoints

---

## 📊 Service Analysis Documents

Each service has a detailed analysis document in `analysis/`:

### Active Services
- **`blackroad-backend.md`** - Main FastAPI backend (33+ routers)
- **`postgres.md`** - PostgreSQL database (Railway managed)
- **`redis.md`** - Redis cache (Railway managed)
- **`docs-site.md`** - MkDocs documentation (GitHub Pages)

### Planned Services
- **`blackroad-api.md`** - Future API gateway (Phase 2)
- **`prism-console.md`** - Admin console UI (Phase 2)

### Analysis Document Contents

Each analysis includes:
- Overview and purpose
- Technology stack
- Current endpoints/features
- Infrastructure configuration
- Database schema (if applicable)
- Security configuration
- Environment variables
- Monitoring & observability
- Performance benchmarks
- Testing strategy
- Development workflow
- Deployment process
- Rollback procedures
- Future enhancements

---

## 🛠️ Infrastructure Templates

### Available Templates

#### 1. `railway.toml.template`
Railway deployment configuration.

**Usage**:
```bash
cp infra/templates/railway.toml.template ./railway.toml
# Edit and customize for your service
```

#### 2. `railway.json.template`
Alternative Railway configuration (JSON format).

**Usage**:
```bash
cp infra/templates/railway.json.template ./railway.json
# Edit and customize
```

#### 3. `Dockerfile.fastapi.template`
Multi-stage Dockerfile optimized for FastAPI services.

**Features**:
- Multi-stage build (smaller image)
- Non-root user (security)
- Health check integrated
- Optimized layer caching

**Usage**:
```bash
cp infra/templates/Dockerfile.fastapi.template ./Dockerfile
# Customize for your service
```

#### 4. `github-workflow-railway-deploy.yml.template`
GitHub Actions workflow for automated Railway deployment.

**Features**:
- Branch-based environment routing
- Health check verification
- Failure notifications
- Manual workflow dispatch

**Usage**:
```bash
cp infra/templates/github-workflow-railway-deploy.yml.template \
   .github/workflows/railway-deploy.yml
# Edit secrets and configuration
```

#### 5. `.env.example.template`
Comprehensive environment variable template.

**Usage**:
```bash
cp infra/templates/.env.example.template ./.env.example
# Document your service's required env vars
```

---

## 🌍 Domain & DNS Configuration

### Current Domain Mapping

| Domain | Points To | Service | Status |
|--------|-----------|---------|--------|
| `blackroad.systems` | Railway backend | blackroad-backend | ✅ Active |
| `docs.blackroad.systems` | GitHub Pages | docs-site | ✅ Active |
| `api.blackroad.systems` | TBD | public-api | 📋 Planned (Phase 2) |
| `prism.blackroad.systems` | TBD | prism-console-web | 📋 Planned (Phase 2) |
| `console.blackroad.systems` | TBD | prism-console-web | 📋 Planned (Phase 2) |
| `agents.blackroad.systems` | TBD | agents-api | 📋 Planned (Phase 2) |
| `lucidia.earth` | TBD | lucidia-api | 📋 Planned (Phase 3) |

### DNS Management

DNS is managed via **Cloudflare**. See:
- `infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md` - Complete DNS setup
- `infra/cloudflare/records.yaml` - Current DNS records

---

## 🔐 Environment Variables

### Environment Variable Management

Environment variables are:
1. **Documented** in `infra/env/ENVIRONMENT_MAP.md`
2. **Defined** in manifest (`blackroad-manifest.yml`)
3. **Templated** in `.env.example.template`
4. **Set** in Railway dashboard (production)
5. **Accessed** via `br_ops.py env <service>`

### Viewing Required Variables

```bash
# Show all required env vars for a service
python scripts/br_ops.py env blackroad-backend
```

Output:
```
🔴 REQUIRED (Must Set)
--------------------------------------------------------------------------------

  DATABASE_URL
    Description: PostgreSQL connection string
    Source:      ${{Postgres.DATABASE_URL}}
    Example:     postgresql+asyncpg://user:pass@host:5432/blackroad

  SECRET_KEY
    Description: JWT signing key
    Generate:    openssl rand -hex 32
    Secret:      Yes (keep secure!)

...
```

### Setting Variables in Railway

1. Railway Dashboard → Project → Service
2. Variables tab
3. Add each required variable
4. Use `${{Postgres.DATABASE_URL}}` syntax for references

---

## 📦 Deployment

### Current Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION STACK (Phase 1)                                  │
└─────────────────────────────────────────────────────────────┘

Cloudflare CDN
    ↓
Railway Backend (blackroad-backend)
    ├── FastAPI Application
    ├── Postgres Database
    └── Redis Cache

GitHub Pages
    └── Documentation (docs-site)
```

### Deployment Process

#### Automatic (Recommended)

1. Create feature branch
2. Make changes
3. Open PR → CI runs
4. Merge to main → Auto-deploy to Railway
5. Monitor Railway logs

#### Manual (Emergency)

```bash
# Using Railway CLI
railway login
railway link <PROJECT_ID>
railway up --service blackroad-backend
railway logs --tail 100

# Verify deployment
curl https://blackroad.systems/health
```

### Health Checks

```bash
# View health check commands
python scripts/br_ops.py health blackroad-backend

# Example output:
# curl https://blackroad.systems/health
# curl https://blackroad.systems/api/health/summary
# curl https://blackroad.systems/api/system/version
```

---

## 🔄 Phase 2 Migration Plan

### Timeline

- **Q1 2026**: Create `blackroad.io` marketing site
- **Q1 2026**: Extract Prism Console to standalone service
- **Q2 2026**: Extract API gateway (`blackroad-api`)
- **Q2 2026**: Deploy agents runtime (`blackroad-operator`)

### Migration Strategy

1. **Keep monolith running** during extraction
2. **Blue-green deployment** with DNS switching
3. **Monitor error rates** for 24 hours before cutover
4. **Document rollback procedures**

### Extraction Tools

```bash
# Extract API gateway
git subtree split --prefix=backend/app/routers --branch=api-split
cd ../blackroad-api
git pull ../BlackRoad-Operating-System api-split

# Deploy new service
railway up --service blackroad-api

# Update DNS
# Cloudflare: api.blackroad.systems → new service
```

---

## 📚 Documentation References

### Primary Docs
- **MASTER_ORCHESTRATION_PLAN.md** - Complete 7-layer architecture
- **ORG_STRUCTURE.md** - Repository organization strategy
- **PRODUCTION_STACK_AUDIT_2025-11-18.md** - Current production state
- **BLACKROAD_OS_BIG_KAHUNA_VISION.md** - Long-term roadmap
- **CLAUDE.md** - AI assistant guide

### Infrastructure Docs
- **infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md** - DNS configuration
- **infra/env/ENVIRONMENT_MAP.md** - Environment variables
- **DEPLOYMENT_NOTES.md** - Production deployment guide

---

## 🛡️ Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Railway secrets for sensitive data
- ✅ Generate secure keys: `openssl rand -hex 32`
- ✅ Rotate secrets quarterly

### 2. Docker Security
- ✅ Use non-root user in containers
- ✅ Multi-stage builds to reduce attack surface
- ✅ Scan images for vulnerabilities
- ✅ Pin dependency versions

### 3. API Security
- ✅ JWT authentication with short expiry
- ✅ Rate limiting on public endpoints
- ✅ Input validation with Pydantic
- ✅ CORS properly configured

### 4. Database Security
- ✅ Use connection pooling
- ✅ Encrypted connections (SSL/TLS)
- ✅ Regular backups (Railway managed)
- ✅ Access control via environment

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check Railway logs
railway logs --service blackroad-backend --tail 100

# Verify environment variables
railway variables list

# Test locally
docker build -t test .
docker run -p 8000:8000 test
curl http://localhost:8000/health
```

#### 2. Service Won't Start
- ✅ Check `DATABASE_URL` and `REDIS_URL` are set
- ✅ Verify `SECRET_KEY` is generated
- ✅ Check port configuration (`$PORT`)
- ✅ Review startup logs for errors

#### 3. Health Check Failing
```bash
# Check endpoint directly
curl -v https://blackroad.systems/health

# Verify Railway health check settings
# Dashboard → Service → Settings → Health Check
```

#### 4. DNS Issues
- ✅ Verify CNAME in Cloudflare dashboard
- ✅ Check proxy status (orange cloud)
- ✅ Wait for DNS propagation (up to 24h)
- ✅ Test with `dig blackroad.systems`

---

## 📞 Getting Help

### Ops CLI Help
```bash
python scripts/br_ops.py help
```

### AI Assistants
- **Atlas** - Infrastructure orchestration
- **Cece** - Engineering & deployment

### Documentation
- Read the service analysis: `infra/analysis/<service>.md`
- Check the manifest: `infra/blackroad-manifest.yml`
- Review deployment docs: `DEPLOYMENT_NOTES.md`

### Support Channels
- **GitHub Issues**: Technical problems
- **Documentation**: `docs.blackroad.systems`
- **Operator**: Alexa Louise Amundson (Cadillac)

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Monolith backend deployed
- ✅ Postgres + Redis managed by Railway
- ✅ Documentation on GitHub Pages
- ✅ Control plane infrastructure established

### Phase 2 (2026 Q1-Q2)
- 📋 Extract API gateway
- 📋 Deploy Prism Console standalone
- 📋 Add agents runtime
- 📋 Create marketing site

### Phase 3 (2026 Q3-Q4)
- 📋 Microservices architecture
- 📋 Multi-region deployment
- 📋 Service mesh (Istio/Linkerd)
- 📋 Advanced observability

---

## 📝 Contributing

### Adding a New Service

1. **Update manifest**:
   ```bash
   vim infra/blackroad-manifest.yml
   # Add service definition under projects or planned_projects
   ```

2. **Create analysis document**:
   ```bash
   cp infra/analysis/blackroad-backend.md infra/analysis/new-service.md
   # Fill in service details
   ```

3. **Test ops CLI**:
   ```bash
   python scripts/br_ops.py list
   python scripts/br_ops.py env new-service
   ```

4. **Commit changes**:
   ```bash
   git add infra/
   git commit -m "Add new-service to infrastructure manifest"
   ```

### Updating Existing Service

1. Update `infra/blackroad-manifest.yml`
2. Update service analysis in `infra/analysis/`
3. Update any affected templates
4. Test with ops CLI
5. Commit and push

---

## 📄 License

This infrastructure documentation is part of the BlackRoad Operating System project.

---

*Control Plane Established: 2025-11-19*
*Maintained By: Atlas (AI Infrastructure Orchestrator)*
*Operator: Alexa Louise Amundson (Cadillac)*
*"Where AI meets the open road." 🛣️*
