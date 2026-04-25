# BlackRoad OS - Railway Deployment Guide

**Version:** 2.0
**Last Updated:** 2025-11-20
**Author:** Atlas (Infrastructure Architect)
**Status:** Production Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Architecture](#deployment-architecture)
4. [Setting Up a New Service](#setting-up-a-new-service)
5. [Environment Variables](#environment-variables)
6. [Deploying to Production](#deploying-to-production)
7. [Monitoring & Health Checks](#monitoring--health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

BlackRoad OS uses a **monorepo-to-satellite deployment model**:

1. **Monorepo** (`BlackRoad-Operating-System`): Source of truth, NOT deployed
2. **Satellite repos**: Individual deployable services (e.g., `blackroad-os-core`)
3. **Railway**: Hosting platform for all services
4. **Cloudflare**: DNS + CDN in front of Railway

**Railway Project**: 57687c3e-5e71-48b6-bc3e-c5b52aebdfc9

---

## Prerequisites

### Required Tools

```bash
# Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# GitHub CLI (optional)
brew install gh

# Node.js 20+
nvm install 20
nvm use 20
```

### Required Access

- [ ] Railway account with access to BlackRoad OS project
- [ ] GitHub access to BlackRoad-OS organization
- [ ] Cloudflare account (for DNS management)

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│  Monorepo (BlackRoad-Operating-     │
│  System) - NOT DEPLOYED              │
│  Contains: services/, kernel/        │
└──────────────┬──────────────────────┘
               │
      GitHub Actions Sync
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Satellite    │  │ Satellite    │
│ blackroad-os-│  │ blackroad-os-│
│ core (repo)  │  │ api (repo)   │
└──────┬───────┘  └──────┬───────┘
       │                 │
  Railway Deploy    Railway Deploy
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Railway Svc  │  │ Railway Svc  │
│ core-prod    │  │ api-prod     │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
         Cloudflare DNS
                │
       ┌────────┴────────┐
       ▼                 ▼
core.blackroad.   api.blackroad.
systems           systems
```

---

## Setting Up a New Service

### Step 1: Create Satellite Repository

```bash
# In GitHub (via web or gh CLI)
gh repo create BlackRoad-OS/blackroad-os-{service} \
  --private \
  --description "BlackRoad OS - {Service} Service"
```

### Step 2: Initialize Service Code

```bash
# Clone satellite repo
git clone https://github.com/BlackRoad-OS/blackroad-os-{service}
cd blackroad-os-{service}

# Copy service code from monorepo
cp -r /path/to/monorepo/services/{service}/* .

# Copy kernel
cp -r /path/to/monorepo/kernel/typescript src/kernel

# Initialize package.json (if not present)
pnpm init

# Add kernel dependencies
pnpm add express dotenv
pnpm add -D typescript @types/node @types/express tsx
```

### Step 3: Create Railway Service

```bash
# Login to Railway
railway login

# Link to BlackRoad OS project
railway link 57687c3e-5e71-48b6-bc3e-c5b52aebdfc9

# Create new service
railway service create blackroad-os-{service}-production

# Or use Railway dashboard:
# https://railway.app/project/57687c3e-5e71-48b6-bc3e-c5b52aebdfc9
```

### Step 4: Configure railway.json

Create `railway.json` in satellite repo:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "healthcheck": {
    "path": "/health",
    "interval": 30,
    "timeout": 10
  }
}
```

### Step 5: Set Environment Variables

In Railway dashboard or CLI:

```bash
# Required variables
railway variables set SERVICE_NAME=blackroad-os-{service}
railway variables set SERVICE_ROLE={role}
railway variables set ENVIRONMENT=production
railway variables set PORT=8000

# Service URLs
railway variables set OPERATOR_URL=https://operator.blackroad.systems
railway variables set CORE_API_URL=https://core.blackroad.systems
railway variables set PUBLIC_API_URL=https://api.blackroad.systems

# Internal URLs
railway variables set OPERATOR_INTERNAL_URL=http://blackroad-os-operator.railway.internal:8001
railway variables set CORE_API_INTERNAL_URL=http://blackroad-os-core.railway.internal:8000

# Service-specific secrets
railway variables set DATABASE_URL=postgresql://...
railway variables set REDIS_URL=redis://...
railway variables set API_KEY=...
```

### Step 6: Deploy

```bash
# Push to main branch
git add .
git commit -m "Initial commit"
git push origin main

# Railway auto-deploys on push to main
# Or manually deploy:
railway up
```

---

## Environment Variables

### Required for All Services

```bash
SERVICE_NAME=blackroad-os-{service}
SERVICE_ROLE=core|api|operator|web|console|docs|shell
ENVIRONMENT=production|development|staging
PORT=8000
```

### Railway Auto-Provided

```bash
RAILWAY_STATIC_URL=<auto>
RAILWAY_ENVIRONMENT=<auto>
RAILWAY_PROJECT_ID=<auto>
```

### Inter-Service URLs

```bash
# Public URLs
OPERATOR_URL=https://operator.blackroad.systems
CORE_API_URL=https://core.blackroad.systems
PUBLIC_API_URL=https://api.blackroad.systems
CONSOLE_URL=https://console.blackroad.systems
DOCS_URL=https://docs.blackroad.systems
WEB_URL=https://web.blackroad.systems
OS_URL=https://os.blackroad.systems

# Internal URLs (Railway private network)
OPERATOR_INTERNAL_URL=http://blackroad-os-operator.railway.internal:8001
CORE_API_INTERNAL_URL=http://blackroad-os-core.railway.internal:8000
PUBLIC_API_INTERNAL_URL=http://blackroad-os-api.railway.internal:8000
CONSOLE_INTERNAL_URL=http://blackroad-os-prism-console.railway.internal:8000
DOCS_INTERNAL_URL=http://blackroad-os-docs.railway.internal:8000
WEB_INTERNAL_URL=http://blackroad-os-web.railway.internal:8000
```

### Service-Specific Secrets

```bash
# Database (if applicable)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (if applicable)
REDIS_URL=redis://host:6379/0

# API Keys (service-specific)
API_KEY=...
JWT_SECRET=...
GITHUB_TOKEN=...
```

---

## Deploying to Production

### Automatic Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml` in satellite repo:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: railway up --service blackroad-os-{service}-production
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Health Check
        run: |
          sleep 10
          curl -f https://{service}.blackroad.systems/health || exit 1
```

### Manual Deployment

```bash
# Deploy current directory
railway up

# Deploy specific service
railway up --service blackroad-os-core-production

# Deploy with environment
railway up --environment production
```

### Deployment Checklist

Before deploying:

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] `railway.json` present
- [ ] Health check endpoint implemented
- [ ] Dockerfile builds successfully (if using Docker)
- [ ] No hardcoded secrets in code
- [ ] Logs configured for Railway

---

## Monitoring & Health Checks

### Health Check Endpoints

Railway checks `/health` endpoint:

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

**Configuration**:
- Interval: 30 seconds
- Timeout: 10 seconds
- Expected: 200 OK

### Viewing Logs

```bash
# Real-time logs
railway logs

# Specific service
railway logs --service blackroad-os-core-production

# Follow logs
railway logs -f

# Last 100 lines
railway logs --tail 100
```

### Metrics Dashboard

View in Railway:
- CPU usage
- Memory usage
- Request rate
- Error rate
- Network traffic

**URL**: https://railway.app/project/57687c3e-5e71-48b6-bc3e-c5b52aebdfc9

### Alerts

Configure alerts in Railway dashboard:
- Service down
- High CPU usage (> 80%)
- High memory usage (> 90%)
- Error rate (> 5%)

---

## Troubleshooting

### Service Won't Start

**Symptoms**: Service crashes immediately after deploy

**Solutions**:
```bash
# Check logs
railway logs --tail 100

# Common issues:
# 1. Missing environment variables
railway variables

# 2. Port mismatch
# Ensure PORT=8000 or read from process.env.PORT

# 3. Build failed
# Check build logs in Railway dashboard
```

### Health Check Failing

**Symptoms**: Railway shows "unhealthy" status

**Solutions**:
```bash
# Test health endpoint directly
curl https://{service-url}.up.railway.app/health

# Check if server is listening on correct port
# Ensure: app.listen(process.env.PORT || 8000)

# Verify health check path in railway.json
# Should be: "healthcheck": { "path": "/health" }
```

### Can't Connect to Other Services

**Symptoms**: RPC calls timeout or fail

**Solutions**:
```bash
# 1. Verify internal URLs are set
railway variables | grep INTERNAL

# 2. Test internal connectivity
# Deploy a test service that curls other services

# 3. Check Railway private network
# All services must be in same Railway project

# 4. Verify service names
# Must match {service}.railway.internal format
```

### Environment Variables Not Loading

**Symptoms**: Config validation errors

**Solutions**:
```bash
# List all variables
railway variables

# Set missing variables
railway variables set KEY=value

# Reload service after setting variables
railway redeploy
```

### Deployment Stuck

**Symptoms**: Deploy in progress for > 10 minutes

**Solutions**:
```bash
# Cancel deployment
railway cancel-deploy

# Redeploy
railway up

# If still stuck, check Railway status:
# https://railway.statuspage.io
```

---

## Best Practices

### Code Organization

```
satellite-repo/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # Express server
│   ├── kernel/           # Copied from monorepo
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── workers/          # Background workers
├── tests/
├── .github/
│   └── workflows/
│       └── deploy.yml    # Auto-deploy
├── railway.json          # Railway config
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Secrets Management

❌ **Never**:
- Commit secrets to Git
- Hardcode API keys
- Log sensitive data
- Expose secrets in error messages

✅ **Always**:
- Use Railway environment variables
- Rotate secrets regularly
- Use different secrets per environment
- Validate secrets on startup

### Performance

- Use Railway internal URLs for inter-service calls
- Enable HTTP/2 for faster connections
- Implement connection pooling (DB, Redis)
- Cache frequently-accessed data
- Use streaming for large responses

### Reliability

- Implement graceful shutdown
- Handle SIGTERM signal
- Use health checks
- Implement circuit breakers for RPC
- Add retry logic with exponential backoff
- Log all errors

### Cost Optimization

- Right-size services (CPU/memory)
- Use development environment for testing
- Clean up unused services
- Monitor usage in Railway dashboard
- Use Railway's free tier for development

---

## Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Dashboard**: https://railway.app/project/57687c3e-5e71-48b6-bc3e-c5b52aebdfc9
- **Monorepo**: https://github.com/blackboxprogramming/BlackRoad-Operating-System
- **Satellite Org**: https://github.com/BlackRoad-OS
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **DNS Map**: `../infra/DNS.md`
- **Service Registry**: `../INFRASTRUCTURE.md`
- **Syscall API**: `../SYSCALL_API.md`

---

**Version:** 2.0
**Last Updated:** 2025-11-20
**Author:** Atlas (Infrastructure Architect)
**Status:** ✅ Production Guide
