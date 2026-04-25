# 🚀 BlackRoad OS - Complete Deployment Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Operator**: Atlas (AI Infrastructure Orchestrator)
**Status**: Production Ready

---

## 📋 Overview

This guide provides step-by-step instructions for deploying the complete BlackRoad OS infrastructure to Railway and configuring Cloudflare DNS.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    CLOUDFLARE DNS                         │
│  blackroad.systems / api.blackroad.systems / etc.        │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────┐      ┌─────────────────────────┐
│   Prism Console     │      │   Public API Gateway    │
│   (Next.js/Static)  │      │   (FastAPI Proxy)       │
│   /status page      │      │   Routes to backends    │
└─────────────────────┘      └──────────┬──────────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                  ┌──────────┐   ┌──────────┐   ┌──────────┐
                  │   Core   │   │ Operator │   │  Docs    │
                  │   API    │   │ Engine   │   │  Site    │
                  └──────────┘   └──────────┘   └──────────┘
```

---

## 🎯 Services Overview

| Service | Description | Port | Health Endpoint |
|---------|-------------|------|-----------------|
| **Core API** | Core business logic | 8000 | `/health` |
| **Public API** | API gateway/proxy | 8000 | `/health` |
| **Operator** | Job scheduler & agents | 8000 | `/health` |
| **Prism Console** | Admin dashboard | 8000 | `/health` |
| **Docs** | Documentation site | N/A | N/A |

---

## 🔧 Prerequisites

1. **Railway Account** - https://railway.app
2. **Cloudflare Account** - Domain: `blackroad.systems`
3. **GitHub Repository Access** - `blackboxprogramming/BlackRoad-Operating-System`
4. **Railway CLI** (optional):
   ```bash
   curl -fsSL https://railway.app/install.sh | sh
   railway login
   ```

---

## 📦 Step 1: Deploy Core API

### 1.1 Create Railway Service

```bash
cd services/core-api

# Option A: Via Railway CLI
railway init
railway up

# Option B: Via Railway Dashboard
# 1. New Project → "blackroad-core-api"
# 2. Connect to GitHub repo
# 3. Set root directory: "services/core-api"
# 4. Railway will detect Dockerfile
```

### 1.2 Set Environment Variables

In Railway Dashboard → Service → Variables:

```bash
ENVIRONMENT=production
PORT=$PORT  # Auto-set by Railway
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems,https://blackroad.systems
```

### 1.3 Verify Deployment

```bash
# Check health endpoint
curl https://blackroad-os-core-production.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "core-api",
  "version": "1.0.0",
  ...
}
```

### 1.4 Create Production Environment

In Railway:
1. Go to service settings
2. Create "production" environment
3. Ensure domain: `blackroad-os-core-production.up.railway.app`

---

## 📦 Step 2: Deploy Operator Service

### 2.1 Create Railway Service

```bash
cd operator_engine

railway init
railway up
```

### 2.2 Set Environment Variables

```bash
ENVIRONMENT=production
PORT=$PORT
GITHUB_TOKEN=<your-github-token>  # Optional
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems
```

### 2.3 Verify Deployment

```bash
curl https://blackroad-os-operator-production.up.railway.app/health
```

---

## 📦 Step 3: Deploy Public API Gateway

### 3.1 Create Railway Service

```bash
cd services/public-api

railway init
railway up
```

### 3.2 Set Environment Variables

**CRITICAL**: Public API must know where to route requests.

```bash
ENVIRONMENT=production
PORT=$PORT

# Backend URLs (use Railway internal URLs or public URLs)
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
AGENTS_API_URL=https://blackroad-os-operator-production.up.railway.app

# CORS
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems,https://api.blackroad.systems
```

### 3.3 Verify Deployment

```bash
# Check health (should report backend status)
curl https://blackroad-os-api-production.up.railway.app/health

# Test proxy to Core API
curl https://blackroad-os-api-production.up.railway.app/api/core/status
```

---

## 📦 Step 4: Deploy Prism Console

### 4.1 Create Railway Service

```bash
cd prism-console

railway init
railway up
```

### 4.2 Set Environment Variables

```bash
ENVIRONMENT=production
PORT=$PORT

# Backend URLs for status page
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
PUBLIC_API_URL=https://blackroad-os-api-production.up.railway.app
OPERATOR_API_URL=https://blackroad-os-operator-production.up.railway.app
PRISM_CONSOLE_URL=https://blackroad-os-prism-console-production.up.railway.app

# CORS
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems
```

### 4.3 Verify Deployment

```bash
# Check health
curl https://blackroad-os-prism-console-production.up.railway.app/health

# Visit status page
open https://blackroad-os-prism-console-production.up.railway.app/status
```

---

## 🌐 Step 5: Configure Cloudflare DNS

### 5.1 DNS Records

In Cloudflare Dashboard → DNS → Records:

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | `core` | `blackroad-os-core-production.up.railway.app` | ✅ ON | Auto |
| CNAME | `api` | `blackroad-os-api-production.up.railway.app` | ✅ ON | Auto |
| CNAME | `operator` | `blackroad-os-operator-production.up.railway.app` | ✅ ON | Auto |
| CNAME | `prism` | `blackroad-os-prism-console-production.up.railway.app` | ✅ ON | Auto |
| CNAME | `docs` | `blackroad-os-docs-production.up.railway.app` | ✅ ON | Auto |
| CNAME | `os` | `prism.blackroad.systems` | ✅ ON | Auto |
| CNAME | `@` | `prism.blackroad.systems` | ✅ ON | Auto |

**Notes**:
- Proxy Status: **ON** (orange cloud) for all records
- SSL/TLS Mode: **Full** (not Strict)
- Auto Minify: **ON** for HTML, CSS, JS
- Always Use HTTPS: **ON**

### 5.2 SSL/TLS Configuration

```
SSL/TLS → Overview → Encryption Mode: FULL
SSL/TLS → Edge Certificates → Always Use HTTPS: ON
SSL/TLS → Edge Certificates → Auto Minify: ON (HTML, CSS, JS)
```

### 5.3 Verify DNS Propagation

```bash
# Check DNS resolution
dig core.blackroad.systems
dig api.blackroad.systems
dig prism.blackroad.systems

# Test HTTPS access
curl https://core.blackroad.systems/health
curl https://api.blackroad.systems/health
curl https://prism.blackroad.systems/health
```

---

## ✅ Step 6: Verify Complete System

### 6.1 Health Check All Services

Run the following commands to verify all services are healthy:

```bash
#!/bin/bash
# health-check-all.sh

SERVICES=(
    "https://core.blackroad.systems/health"
    "https://api.blackroad.systems/health"
    "https://prism.blackroad.systems/health"
    "https://operator.blackroad.systems/health"
)

echo "Checking BlackRoad OS Services..."
echo "=================================="

for SERVICE in "${SERVICES[@]}"; do
    echo -n "Checking $SERVICE ... "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE")
    if [ "$STATUS" -eq 200 ]; then
        echo "✅ OK ($STATUS)"
    else
        echo "❌ FAILED ($STATUS)"
    fi
done
```

### 6.2 Visit Prism Console Status Page

```bash
open https://prism.blackroad.systems/status
```

You should see:
- ✅ All services showing green (healthy)
- Version numbers displayed
- Uptime information
- Environment: production

---

## 🔄 Step 7: Set Up Automatic Deployments

### 7.1 GitHub Actions (Already Configured)

The repository includes workflows for automatic deployment:

- `.github/workflows/railway-deploy.yml` - Auto-deploy on push to main
- Each service watches its respective directory

### 7.2 Railway Auto-Deploy Settings

In each Railway service:
1. Settings → Source
2. Enable "Auto-Deploy on Push"
3. Set watch paths:
   - Core API: `services/core-api/**`
   - Public API: `services/public-api/**`
   - Operator: `operator_engine/**`
   - Prism: `prism-console/**`

---

## 🔐 Step 8: Environment Variables Reference

### Core API

```bash
ENVIRONMENT=production
PORT=$PORT
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems,https://blackroad.systems
```

### Public API Gateway

```bash
ENVIRONMENT=production
PORT=$PORT
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
AGENTS_API_URL=https://blackroad-os-operator-production.up.railway.app
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems,https://api.blackroad.systems
```

### Operator

```bash
ENVIRONMENT=production
PORT=$PORT
GITHUB_TOKEN=<optional>
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems
```

### Prism Console

```bash
ENVIRONMENT=production
PORT=$PORT
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
PUBLIC_API_URL=https://blackroad-os-api-production.up.railway.app
OPERATOR_API_URL=https://blackroad-os-operator-production.up.railway.app
PRISM_CONSOLE_URL=https://blackroad-os-prism-console-production.up.railway.app
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems
```

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ All 4 services return `200 OK` on `/health` endpoints
2. ✅ Prism Console `/status` page shows all services green
3. ✅ DNS resolves correctly (dig/nslookup)
4. ✅ HTTPS works on all domains (no certificate errors)
5. ✅ Public API can proxy to Core API: `curl https://api.blackroad.systems/api/core/status`
6. ✅ Prism Console accessible at https://prism.blackroad.systems
7. ✅ Auto-deployment triggers on git push

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check Railway logs
railway logs

# Common issues:
# 1. Missing PORT environment variable
# 2. Wrong Dockerfile path
# 3. Missing requirements.txt dependencies
```

### Health Check Fails

```bash
# Verify environment variables are set
railway variables

# Check health endpoint directly
curl https://your-service.up.railway.app/health

# Check Railway service status
railway status
```

### DNS Not Resolving

```bash
# Verify Cloudflare DNS records
dig @1.1.1.1 core.blackroad.systems

# Check Cloudflare proxy status (should be ON)
# Check SSL/TLS mode (should be FULL, not STRICT)
```

### CORS Errors

```bash
# Verify ALLOWED_ORIGINS includes requesting domain
# Example: If Prism is at prism.blackroad.systems, add to ALLOWED_ORIGINS

# Test CORS headers
curl -H "Origin: https://prism.blackroad.systems" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://api.blackroad.systems/health
```

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Cloudflare DNS Docs**: https://developers.cloudflare.com/dns
- **BlackRoad OS Docs**: https://docs.blackroad.systems
- **Service Manifests**: `/infra/blackroad-manifest.yml`

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Services**: Set up monitoring alerts in Railway
2. **Performance Tuning**: Adjust Railway resource limits if needed
3. **Backup Strategy**: Configure Railway backup policies
4. **Security Audit**: Review API keys, secrets rotation
5. **Documentation**: Update internal wiki with deployment details
6. **Team Access**: Add team members to Railway project

---

**BLACKROAD OS DEPLOYMENT COMPLETE**

All services online. System operational.

**End of Deployment Guide**
