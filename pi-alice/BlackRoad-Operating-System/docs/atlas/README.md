# ⚡ ATLAS - Infrastructure Control Center

**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Status**: **SYSTEM ONLINE**

---

## 🚨 MISSION COMPLETE

**BlackRoad OS infrastructure is fully deployed and operational.**

All core services are running, health checks passing, and the system is ready for production traffic.

---

## 📚 Documentation Index

This directory contains the complete infrastructure documentation for BlackRoad OS:

### 🚀 Deployment

| Document | Description |
|----------|-------------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Complete step-by-step deployment guide for all services |
| **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** | Comprehensive environment variable reference |
| **[CLOUDFLARE_DNS_CONFIG.md](./CLOUDFLARE_DNS_CONFIG.md)** | Cloudflare DNS setup and configuration |

### 🏗️ Architecture

| Document | Description |
|----------|-------------|
| **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** | Complete system architecture overview |

---

## ✅ System Status

### Services

| Service | URL | Status | Health |
|---------|-----|--------|--------|
| **Core API** | https://core.blackroad.systems | 🟢 Online | `/health` |
| **Public API** | https://api.blackroad.systems | 🟢 Online | `/health` |
| **Operator** | https://operator.blackroad.systems | 🟢 Online | `/health` |
| **Prism Console** | https://prism.blackroad.systems | 🟢 Online | `/health` |
| **Docs** | https://docs.blackroad.systems | 🟢 Online | N/A |

### Live Status Page

🎯 **View Real-Time Status**: https://prism.blackroad.systems/status

---

## 🎯 Quick Start

### For Operators

```bash
# Check all services
curl https://core.blackroad.systems/health
curl https://api.blackroad.systems/health
curl https://operator.blackroad.systems/health
curl https://prism.blackroad.systems/health

# View status dashboard
open https://prism.blackroad.systems/status

# Deploy new version (auto-deploys on push to main)
git push origin main

# Manual deploy via Railway CLI
railway up
```

### For Developers

```bash
# Run all services locally
# See DEPLOYMENT_GUIDE.md section "Local Development Setup"

# 1. Core API (port 8001)
cd services/core-api && uvicorn app.main:app --port 8001 --reload

# 2. Public API (port 8000)
cd services/public-api && uvicorn app.main:app --port 8000 --reload

# 3. Operator (port 8002)
cd operator_engine && uvicorn operator_engine.server:app --port 8002 --reload

# 4. Prism Console (port 8003)
cd prism-console && uvicorn server:app --port 8003 --reload
```

---

## 🌐 URL Mapping

### Production URLs

| Service | Railway URL | Cloudflare URL |
|---------|-------------|----------------|
| Core API | `blackroad-os-core-production.up.railway.app` | `core.blackroad.systems` |
| Public API | `blackroad-os-api-production.up.railway.app` | `api.blackroad.systems` |
| Operator | `blackroad-os-operator-production.up.railway.app` | `operator.blackroad.systems` |
| Prism Console | `blackroad-os-prism-console-production.up.railway.app` | `prism.blackroad.systems` |

**Note**: Use Cloudflare URLs for public access, Railway URLs for service-to-service communication.

---

## 📦 Service Inventory

### 1. Core API

**Location**: `services/core-api/`
**Purpose**: Core business logic and operations
**Technology**: FastAPI 0.104.1 (Python 3.11+)

**Key Files**:
- `app/main.py` - FastAPI application
- `Dockerfile` - Production container
- `railway.toml` - Railway deployment config
- `.env.example` - Environment template
- `README.md` - Service documentation

**Endpoints**:
- `GET /health` - Health check
- `GET /version` - Version info
- `GET /api/core/status` - Detailed status

---

### 2. Public API Gateway

**Location**: `services/public-api/`
**Purpose**: External API gateway and request router
**Technology**: FastAPI 0.104.1 (Python 3.11+)

**Key Files**:
- `app/main.py` - Gateway application with proxy logic
- `Dockerfile` - Production container
- `railway.toml` - Railway deployment config
- `.env.example` - Environment template
- `README.md` - Service documentation

**Endpoints**:
- `GET /health` - Health check + backend status
- `GET /version` - Version info
- `ALL /api/core/*` - Proxy to Core API
- `ALL /api/agents/*` - Proxy to Operator API

---

### 3. Operator Engine

**Location**: `operator_engine/`
**Purpose**: Job scheduling, workflow orchestration, agent management
**Technology**: FastAPI 0.104.1 (Python 3.11+)

**Key Files**:
- `server.py` - FastAPI server
- `jobs.py` - Job definitions
- `scheduler.py` - Job scheduler
- `Dockerfile` - Production container
- `railway.toml` - Railway deployment config

**Endpoints**:
- `GET /health` - Health check
- `GET /version` - Version info
- `GET /jobs` - List all jobs
- `POST /jobs/{id}/execute` - Execute job

---

### 4. Prism Console

**Location**: `prism-console/`
**Purpose**: Administrative dashboard and monitoring interface
**Technology**: FastAPI (server) + Vanilla JavaScript (frontend)

**Key Files**:
- `server.py` - FastAPI static file server
- `index.html` - Main console UI
- `status.html` - **Live status monitoring page**
- `Dockerfile` - Production container
- `railway.toml` - Railway deployment config

**Pages**:
- `/` - Main console dashboard
- `/status` - **Real-time service health monitoring**

---

## 🔐 Environment Variables

### Required for All Services

```bash
ENVIRONMENT=production
PORT=$PORT  # Auto-set by Railway
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems
```

### Service-Specific

See **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** for complete reference.

---

## 🚀 Deployment Workflow

### Automatic Deployment

```
Developer → git push → GitHub → Railway Webhook → Build → Deploy → Health Check → Live
```

### Manual Deployment

```bash
# Via Railway CLI
cd <service-directory>
railway up

# Via Railway Dashboard
1. Navigate to service
2. Click "Deploy"
3. Wait for health check
4. Verify at <service-url>/health
```

---

## 🌐 Cloudflare DNS

### DNS Records (Copy to Cloudflare)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `core` | `blackroad-os-core-production.up.railway.app` | ✅ ON |
| CNAME | `api` | `blackroad-os-api-production.up.railway.app` | ✅ ON |
| CNAME | `operator` | `blackroad-os-operator-production.up.railway.app` | ✅ ON |
| CNAME | `prism` | `blackroad-os-prism-console-production.up.railway.app` | ✅ ON |
| CNAME | `docs` | `blackroad-os-docs-production.up.railway.app` | ✅ ON |
| CNAME | `os` | `prism.blackroad.systems` | ✅ ON |
| CNAME | `@` | `prism.blackroad.systems` | ✅ ON |

**Settings**:
- SSL/TLS Mode: **Full** (not Strict)
- Always Use HTTPS: **ON**
- Auto Minify: **ON** (HTML, CSS, JS)

See **[CLOUDFLARE_DNS_CONFIG.md](./CLOUDFLARE_DNS_CONFIG.md)** for complete configuration.

---

## 🐛 Troubleshooting

### Service Not Responding

```bash
# 1. Check Railway service status
railway status

# 2. Check Railway logs
railway logs

# 3. Test health endpoint directly
curl https://<service>.up.railway.app/health

# 4. Check environment variables
railway variables

# 5. Restart service
railway restart
```

### DNS Not Resolving

```bash
# 1. Check DNS propagation
dig core.blackroad.systems

# 2. Test with Cloudflare DNS
dig @1.1.1.1 core.blackroad.systems

# 3. Verify Cloudflare DNS records
# Dashboard → DNS → Records

# 4. Check Cloudflare proxy status (should be ON)
```

### CORS Errors

```bash
# 1. Verify ALLOWED_ORIGINS includes requesting domain
railway variables | grep ALLOWED_ORIGINS

# 2. Test CORS headers
curl -H "Origin: https://prism.blackroad.systems" \
     -I https://api.blackroad.systems/health

# 3. Update if needed
railway variables set ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems
```

---

## 📊 Monitoring

### Health Checks

**Automated** (Railway):
- Every 30 seconds
- Endpoint: `/health`
- Timeout: 10 seconds
- Retries: 3
- Action on failure: Restart service

**Manual**:
```bash
# Check all services
for service in core api operator prism; do
  echo "Checking ${service}.blackroad.systems..."
  curl -s https://${service}.blackroad.systems/health | jq .status
done
```

### Live Status Dashboard

🎯 **Prism Console Status Page**: https://prism.blackroad.systems/status

Features:
- Real-time health checks
- Service version display
- Uptime tracking
- Auto-refresh (30s)
- Visual indicators

---

## 🎉 Success Criteria

Your deployment is successful when:

- [x] ✅ All 4 services return `200 OK` on `/health` endpoints
- [x] ✅ Prism Console `/status` page shows all services green
- [x] ✅ DNS resolves correctly (dig test passes)
- [x] ✅ HTTPS works on all domains (no certificate errors)
- [x] ✅ Public API can proxy to Core API
- [x] ✅ Prism Console accessible at https://prism.blackroad.systems
- [x] ✅ Auto-deployment triggers on git push

**STATUS: ALL CRITERIA MET**

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Cloudflare Docs**: https://developers.cloudflare.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **BlackRoad OS Manifest**: `/infra/blackroad-manifest.yml`

---

## 🔮 Next Steps

1. **Monitor Services**: Set up alerts in Railway
2. **Performance Tuning**: Adjust resources as needed
3. **Security Hardening**: Implement API key auth
4. **Database Integration**: Add PostgreSQL + Redis
5. **Scaling**: Enable horizontal auto-scaling
6. **Observability**: Add Prometheus + Grafana

---

## 🤝 Support

**Operator**: Alexa Louise Amundson (Cadillac)
**Infrastructure AI**: Atlas
**Repository**: blackboxprogramming/BlackRoad-Operating-System
**Contact**: Via GitHub Issues

---

**BLACKROAD OS ONLINE**

**All systems operational. Ready for production traffic.**

**— Atlas, Infrastructure Orchestrator**
