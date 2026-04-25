# Infrastructure Overview

BlackRoad OS infrastructure spans DNS, CDN, compute, and data layers.

## Infrastructure Stack

```
┌─────────────────────────────────────────┐
│ Cloudflare (DNS, CDN, SSL, DDoS)       │
│ ↓                                       │
│ ├── blackroad.systems                   │
│ ├── os.blackroad.systems                │
│ ├── api.blackroad.systems               │
│ ├── prism.blackroad.systems             │
│ └── 10+ other domains                   │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ Railway (Production Backend)            │
│ ↓                                       │
│ ├── FastAPI Application                 │
│ ├── PostgreSQL Database                 │
│ └── Redis Cache                         │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ GitHub (Code, CI/CD)                    │
│ ↓                                       │
│ ├── Source code repository              │
│ ├── GitHub Actions workflows            │
│ └── GitHub Pages (static frontend)      │
└─────────────────────────────────────────┘
```

## Cloudflare Configuration

### DNS Management

All domains point to Cloudflare nameservers:
- `ns1.cloudflare.com`
- `ns2.cloudflare.com`

### CNAME Records

```
os.blackroad.systems → blackroad-os-production.up.railway.app
api.blackroad.systems → blackroad-os-production.up.railway.app
prism.blackroad.systems → blackroad-os-production.up.railway.app
```

### SSL/TLS

- **Mode:** Full (strict)
- **Certificate:** Cloudflare Universal SSL
- **Min TLS:** 1.2
- **HSTS:** Enabled

### Features Enabled

- ✅ DDoS protection
- ✅ WAF (Web Application Firewall)
- ✅ Caching (static assets)
- ✅ Auto-minify (JS, CSS, HTML)
- ✅ Brotli compression
- ✅ HTTP/2 and HTTP/3

[Full Cloudflare Guide →](infra-cloudflare.md)

---

## Railway Deployment

### Services

- **Web Service**: FastAPI backend
- **PostgreSQL**: Managed database
- **Redis**: Managed cache

### Configuration

**Railway.toml:**
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheck.path = "/health"
```

### Environment Variables

Required vars (set in Railway dashboard):
- `DATABASE_URL` - PostgreSQL connection string (auto-injected)
- `REDIS_URL` - Redis connection string (auto-injected)
- `SECRET_KEY` - JWT signing key
- `ENVIRONMENT` - "production"
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

### Deployment Process

1. Push to `main` branch
2. GitHub Action triggers
3. Railway builds Docker image
4. Runs Alembic migrations
5. Starts FastAPI server
6. Health check validation
7. Traffic cutover

### Monitoring

- **Health Check**: `/health` endpoint every 30s
- **Logs**: Via Railway dashboard or CLI
- **Metrics**: Built-in Railway metrics
- **Alerts**: Slack/email notifications (configured in Railway)

[Full Railway Guide →](infra-railway.md)

---

## GitHub Configuration

### Repository Structure

- **Main Repo**: `blackboxprogramming/BlackRoad-Operating-System`
- **Branches**: `main`, `claude/*`, feature branches
- **Protected**: `main` branch (require PR reviews)

### CI/CD Workflows

Located in `.github/workflows/`:

1. **ci.yml** - HTML/JS validation
2. **backend-tests.yml** - Backend tests
3. **deploy.yml** - GitHub Pages deploy
4. **railway-deploy.yml** - Railway backend deploy
5. **railway-automation.yml** - Env validation

### Secrets

Required GitHub secrets:
- `RAILWAY_TOKEN` - Railway deployment token
- `CLOUDFLARE_API_TOKEN` - Cloudflare API access (future)

### GitHub Pages

- **Branch**: Deployed from `gh-pages` branch
- **Content**: Static frontend from `backend/static/`
- **URL**: `https://blackboxprogramming.github.io/BlackRoad-Operating-System/`

[Full GitHub Guide →](infra-github.md)

---

## Domain Architecture

### Primary Domains

| Domain | Purpose | Points To |
|--------|---------|-----------|
| `blackroad.systems` | Corporate site | Railway backend |
| `os.blackroad.systems` | Main OS interface | Railway backend |
| `api.blackroad.systems` | API gateway | Railway backend |
| `prism.blackroad.systems` | Admin console | Railway backend |
| `blackroadai.com` | AI products | Railway backend (future) |
| `lucidia.earth` | AI narrative | Railway backend (future) |

### Secondary Domains

- `blackroad.me` - Personal identity
- `blackroad.network` - Developer network
- `blackroad.pro` - Professional services
- `blackroad.cloud` - Cloud services

---

## Data Layer

### PostgreSQL (Railway)

- **Version**: 14+
- **Size**: Shared CPU, 512MB RAM (starter)
- **Backup**: Daily automatic backups
- **Migrations**: Alembic-managed
- **Access**: Via DATABASE_URL env var

### Redis (Railway)

- **Version**: 7+
- **Size**: Shared, 128MB (starter)
- **Usage**: Session storage, caching
- **Persistence**: AOF enabled
- **Access**: Via REDIS_URL env var

### Future: RoadChain

- **Platform**: DigitalOcean Droplets
- **Nodes**: 3-5 distributed nodes
- **Consensus**: Proof of Authority (PoA)
- **Storage**: Tamper-evident ledger

---

## Scaling Strategy

### Phase 1 (Current)
- Single Railway instance
- Managed PostgreSQL
- Managed Redis
- Cloudflare CDN

### Phase 2 (3-6 months)
- Horizontal scaling (Railway)
- Database read replicas
- Redis clustering
- Cloudflare Workers for edge functions

### Phase 3 (12+ months)
- Kubernetes (GKE/EKS)
- Multi-region deployment
- Distributed RoadChain
- CDN for video streaming

---

## Cost Breakdown

### Current (Estimated)

- **Railway**: ~$20/mo (Hobby plan)
- **Cloudflare**: $0 (Free plan)
- **GitHub**: $0 (Public repo)
- **Domains**: ~$100/year (10 domains @ $10 each)

**Total**: ~$20/mo + $100/year = ~$28/mo average

### Phase 2 (Projected)

- **Railway**: ~$50/mo (Pro plan)
- **Cloudflare**: $20/mo (Pro plan)
- **DigitalOcean**: $30/mo (3 droplets)
- **GitHub**: $0

**Total**: ~$100/mo

---

## Security

### SSL/TLS
- Cloudflare Universal SSL
- Auto-renewing certificates
- HSTS enabled

### DDoS Protection
- Cloudflare DDoS mitigation
- Rate limiting (future)
- IP blocking (manual)

### Secrets Management
- Railway environment variables (encrypted)
- GitHub Secrets (encrypted)
- Never commit `.env` files

### Access Control
- Railway: Team-based access
- Cloudflare: Role-based access
- GitHub: Protected branches

---

## Monitoring & Observability

### Current

- Railway health checks
- Basic logging
- Error tracking (Sentry integration)

### Future

- Prometheus metrics
- Grafana dashboards
- ELK stack for logs
- Uptime monitoring (UptimeRobot)
- Performance monitoring (New Relic)

---

## Disaster Recovery

### Backups

- **Database**: Daily automatic (Railway)
- **Code**: Git version control
- **Secrets**: Secure password manager

### Recovery Plan

1. Restore from Railway DB backup
2. Redeploy from Git (`main` branch)
3. Update DNS if needed (Cloudflare)
4. Verify health checks

**RTO**: ~30 minutes
**RPO**: 24 hours (daily backups)

---

## Next Steps

- [Set up Cloudflare](infra-cloudflare.md)
- [Deploy to Railway](infra-railway.md)
- [Configure GitHub](infra-github.md)
