# 🚀 BlackRoad OS Deployment Notes

**Version**: 2.5
**Date**: 2025-11-18
**Purpose**: Production deployment checklist and reference

---

## Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] GitHub repository: `blackboxprogramming/BlackRoad-Operating-System`
- [ ] Railway account with project created
- [ ] Cloudflare account with domains added
- [ ] Domain registrar: GoDaddy (or other)
- [ ] Railway CLI installed: `curl -fsSL https://railway.app/install.sh | sh`
- [ ] Git configured and authenticated

---

## Environment Variables

### Required Variables

**Backend Service (Railway)**

```bash
# Core Settings
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generate-with-openssl-rand-hex-32>
APP_NAME="BlackRoad Operating System"
APP_VERSION="1.0.0"

# Database (auto-injected by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_ASYNC_URL=${{Postgres.DATABASE_ASYNC_URL}}

# Redis (auto-injected by Railway)
REDIS_URL=${{Redis.REDIS_URL}}

# CORS (update with your domains)
ALLOWED_ORIGINS=https://blackroad.systems,https://os.blackroad.systems,https://blackroad.ai,https://www.blackroad.systems

# Public URLs
API_BASE_URL=https://blackroad.systems
FRONTEND_URL=https://blackroad.systems

# JWT Settings
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

# Blockchain
WALLET_MASTER_KEY=<generate-with-openssl-rand-hex-32>
```

### Optional Variables (Add as Needed)

```bash
# AI Integration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# External Services
GITHUB_TOKEN=ghp_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SLACK_BOT_TOKEN=xoxb-...
DISCORD_BOT_TOKEN=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Cloud Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=us-east-1

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

### Generate Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate WALLET_MASTER_KEY
openssl rand -hex 32

# Generate JWT secret (if separate)
openssl rand -hex 32
```

---

## Railway Deployment

### 1. Create Railway Project

**Via CLI:**
```bash
# Login
railway login

# Create new project
railway init

# Link to GitHub repo
railway link
```

**Via Web UI:**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `blackboxprogramming/BlackRoad-Operating-System`
4. Choose "Deploy Now"

### 2. Add Database Services

**PostgreSQL:**
```bash
# Via CLI
railway add --plugin postgresql

# Or via Web UI:
# Project → New → Database → Add PostgreSQL
```

**Redis:**
```bash
# Via CLI
railway add --plugin redis

# Or via Web UI:
# Project → New → Database → Add Redis
```

### 3. Set Environment Variables

**Via CLI:**
```bash
# Set individual variables
railway variables set ENVIRONMENT=production
railway variables set DEBUG=False
railway variables set SECRET_KEY=<your-secret-key>
railway variables set ALLOWED_ORIGINS=https://blackroad.systems

# Or upload from file
railway variables set -f backend/.env.example
# (Edit values before uploading!)
```

**Via Web UI:**
1. Project → backend service → Variables
2. Click "New Variable"
3. Add each variable from list above
4. Save

**Important:** For `DATABASE_URL` and `REDIS_URL`, use Railway's variable references:
- `${{Postgres.DATABASE_URL}}`
- `${{Redis.REDIS_URL}}`

These auto-populate with connection strings.

### 4. Configure Build & Deploy

**railway.toml** (already in repo):
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Verify Build Settings:**
- Root directory: `/`
- Dockerfile path: `backend/Dockerfile`
- Start command: Auto-detected from railway.toml

### 5. Deploy Backend

**Via CLI:**
```bash
# Deploy from current branch
railway up

# Or deploy specific service
railway up --service backend
```

**Via Web UI:**
- Push to main branch → automatic deployment
- Or click "Deploy" button in Railway dashboard

### 6. Run Database Migrations

**After first deployment:**
```bash
# Connect to Railway service
railway run bash

# Inside Railway container:
cd backend
alembic upgrade head

# Or run directly:
railway run alembic upgrade head
```

### 7. Add Custom Domains

**Via Railway Web UI:**
1. Project → backend service → Settings → Networking
2. Under "Custom Domains", click "Add Domain"
3. Enter: `blackroad.systems`
4. Railway provides CNAME target (e.g., `blackroad-os-production.up.railway.app`)
5. Add this CNAME to Cloudflare (see next section)
6. Wait for SSL provisioning (automatic, 2-5 minutes)
7. Repeat for other domains/subdomains

**Domains to add:**
- `blackroad.systems` (primary)
- `os.blackroad.systems` (optional alias)
- `api.blackroad.systems` (optional explicit API subdomain)

### 8. Verify Deployment

**Health Check:**
```bash
# Check Railway URL first
curl https://blackroad-os-production.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": 1700000000,
  "environment": "production"
}
```

**Check Logs:**
```bash
# Via CLI
railway logs --service backend --tail 100

# Or in Web UI:
# Project → backend → Logs
```

**Look for:**
- ✅ "Starting BlackRoad Operating System Backend..."
- ✅ "Database tables created successfully"
- ✅ "Server running on production mode"
- ❌ No error stack traces

---

## Cloudflare Configuration

### 1. Add Domain to Cloudflare

**If not already added:**
1. Cloudflare dashboard → "Add a site"
2. Enter: `blackroad.systems`
3. Choose: Free plan
4. Cloudflare scans existing DNS records

### 2. Update Nameservers at Domain Registrar

**At GoDaddy (or your registrar):**
1. Log in to domain management
2. Find `blackroad.systems` → DNS settings
3. Change nameservers from GoDaddy to Cloudflare
4. Cloudflare provides 2 nameservers (e.g., `ns1.cloudflare.com`, `ns2.cloudflare.com`)
5. Save changes
6. Wait 5-60 minutes for propagation

**Verify:**
```bash
dig NS blackroad.systems
# Should show Cloudflare nameservers
```

### 3. Configure DNS Records

**For `blackroad.systems` zone:**

| Type | Name | Target | Proxy | TTL | Notes |
|------|------|--------|-------|-----|-------|
| CNAME | @ | `blackroad-os-production.up.railway.app` | ✅ Proxied | Auto | Root domain → Railway |
| CNAME | www | `blackroad.systems` | ✅ Proxied | Auto | www redirect |
| CNAME | os | `blackroad.systems` | ✅ Proxied | Auto | Optional alias |
| CNAME | api | `blackroad.systems` | ✅ Proxied | Auto | Optional explicit API |
| CNAME | prism | `blackroad.systems` | ✅ Proxied | Auto | Prism Console alias (future) |
| CNAME | docs | `blackboxprogramming.github.io` | ✅ Proxied | Auto | GitHub Pages docs |

**Important:**
- All CNAMEs should be **Proxied** (orange cloud icon)
- This enables Cloudflare CDN, SSL, DDoS protection
- Use CNAME flattening for root domain (@) - Cloudflare does this automatically

**Add DNS Records:**
1. Cloudflare dashboard → DNS → Records
2. Click "Add record"
3. Fill in values from table above
4. Click "Save"
5. Repeat for each record

### 4. Configure SSL/TLS

**Settings:**
1. Cloudflare → SSL/TLS → Overview
2. Set encryption mode: **Full (strict)**
3. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

**Edge Certificates:**
1. Cloudflare → SSL/TLS → Edge Certificates
2. Verify:
   - ✅ Universal SSL: Active
   - ✅ Certificate status: Active
   - ✅ Edge certificates: Covers all subdomains

### 5. Configure Page Rules (Optional)

**Rule 1: Redirect www to apex**
- URL: `www.blackroad.systems/*`
- Setting: Forwarding URL
- Status: 301 - Permanent Redirect
- Destination: `https://blackroad.systems/$1`

**Rule 2: Cache static assets**
- URL: `blackroad.systems/static/*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

**Rule 3: Cache Prism assets**
- URL: `blackroad.systems/prism/assets/*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week

### 6. Verify DNS & SSL

**Check DNS propagation:**
```bash
# Check A/CNAME records
dig blackroad.systems
dig www.blackroad.systems
dig docs.blackroad.systems

# Check from different locations
# Use: https://dnschecker.org
```

**Check SSL:**
```bash
# Check certificate
curl -vI https://blackroad.systems 2>&1 | grep -i 'SSL\|TLS'

# Or visit in browser and click padlock icon
```

**Test all routes:**
```bash
# Main OS
curl -I https://blackroad.systems
# → 200 OK

# Prism
curl -I https://blackroad.systems/prism
# → 200 OK (after Prism UI is deployed)

# API Health
curl https://blackroad.systems/health
# → {"status": "healthy", ...}

# Docs
curl -I https://docs.blackroad.systems
# → 200 OK (after GitHub Pages is set up)
```

---

## GitHub Pages (Documentation)

### 1. Build Documentation Locally (Test)

```bash
cd codex-docs

# Install MkDocs
pip install mkdocs mkdocs-material

# Test build
mkdocs build --strict

# Test locally
mkdocs serve
# Visit: http://localhost:8001
```

### 2. Configure GitHub Pages

**Via GitHub Web UI:**
1. Repository → Settings → Pages
2. Source:
   - Branch: `gh-pages` (created by workflow)
   - Folder: `/ (root)`
3. Custom domain: `docs.blackroad.systems`
4. ✅ Enforce HTTPS
5. Save

**GitHub creates a CNAME file** in `gh-pages` branch automatically.

### 3. Deploy Documentation

**Automatic (via GitHub Actions):**
- Workflow: `.github/workflows/docs-deploy.yml`
- Trigger: Push to `main` branch, or manual dispatch
- Actions:
  1. Checkout code
  2. Install MkDocs + Material theme
  3. Build docs: `mkdocs build --strict`
  4. Deploy to `gh-pages` branch

**Manual Deploy (if needed):**
```bash
cd codex-docs

# Build and deploy
mkdocs gh-deploy

# This creates/updates gh-pages branch
```

### 4. Verify Documentation

```bash
# Check GitHub Pages URL first
curl -I https://blackboxprogramming.github.io/BlackRoad-Operating-System/

# Then check custom domain
curl -I https://docs.blackroad.systems/
```

---

## GitHub Secrets (CI/CD)

### Required Secrets

**For Railway deployment:**
```bash
# Get Railway token
railway login
railway whoami

# Add to GitHub:
# Settings → Secrets and variables → Actions → New repository secret
Name: RAILWAY_TOKEN
Value: <your-railway-token>
```

**For Cloudflare automation (optional):**
```bash
# Get Cloudflare API token
# Cloudflare dashboard → Profile → API Tokens → Create Token
# Template: Edit zone DNS

Name: CF_API_TOKEN
Value: <your-cloudflare-token>

Name: CF_ZONE_ID
Value: <zone-id-from-cloudflare-dashboard>
```

### Set Secrets

**Via GitHub Web UI:**
1. Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from above
4. Click "Add secret"

**Via GitHub CLI:**
```bash
gh secret set RAILWAY_TOKEN --body "<your-token>"
gh secret set CF_API_TOKEN --body "<your-token>"
gh secret set CF_ZONE_ID --body "<zone-id>"
```

---

## Monitoring & Maintenance

### Health Checks

**Automated (Railway):**
- Railway checks `/health` endpoint every 30 seconds
- Auto-restarts on failure
- Sends alerts (configure in Railway dashboard)

**Manual:**
```bash
# Quick health check
curl https://blackroad.systems/health

# Detailed check
curl https://blackroad.systems/api/docs
# Should show OpenAPI docs
```

### Logs

**Railway Logs:**
```bash
# Tail logs
railway logs --service backend --tail 100

# Or in Web UI:
# Project → backend → Logs
```

**Cloudflare Analytics:**
- Dashboard → Analytics
- Check: Requests, bandwidth, threats blocked

### Database Backups

**Railway automatic backups:**
- Daily snapshots (free tier: 7 days retention)
- To restore: Railway dashboard → Postgres → Backups

**Manual backup:**
```bash
# Export database
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Import database (if needed)
railway run psql $DATABASE_URL < backup-20251118.sql
```

### Cost Monitoring

**Railway usage:**
```bash
# Check current usage
railway usage

# Or in Web UI:
# Project → Usage
```

**Cloudflare analytics:**
- Free tier: Unlimited requests
- Monitor: SSL/TLS usage, cache hit ratio

---

## Rollback Procedures

### Railway Rollback

**Via Web UI:**
1. Project → backend → Deployments
2. Find previous successful deployment
3. Click "..." → Rollback
4. Confirm

**Via CLI:**
```bash
railway rollback --service backend
```

### Database Rollback

**Via Alembic:**
```bash
# Rollback last migration
railway run alembic downgrade -1

# Rollback to specific version
railway run alembic downgrade <revision>
```

### DNS Rollback

**If needed:**
1. Cloudflare dashboard → DNS → Records
2. Edit CNAME record
3. Point to previous target
4. Save (propagates in ~2 minutes due to proxy)

---

## Troubleshooting

### Issue: Railway Deployment Fails

**Check:**
```bash
# View build logs
railway logs --service backend

# Common issues:
# - Missing environment variables
# - Dockerfile syntax error
# - Dependencies not installing
```

**Fix:**
1. Verify all required env vars are set
2. Test Dockerfile locally: `docker build -t test backend/`
3. Check `requirements.txt` for typos
4. Re-deploy: `railway up`

### Issue: Database Connection Errors

**Check:**
```bash
# Verify DATABASE_URL is set
railway variables | grep DATABASE

# Test connection
railway run psql $DATABASE_URL
```

**Fix:**
1. Ensure PostgreSQL plugin is added
2. Use `${{Postgres.DATABASE_URL}}` reference
3. Check database is running: Railway dashboard → Postgres

### Issue: CORS Errors in Browser

**Check:**
```bash
# Verify ALLOWED_ORIGINS
railway variables | grep ALLOWED_ORIGINS
```

**Fix:**
1. Add your domain to ALLOWED_ORIGINS
2. Include both `https://blackroad.systems` and `https://www.blackroad.systems`
3. No trailing slashes!
4. Redeploy: `railway up`

### Issue: Cloudflare 522 Error

**Cause:** Origin (Railway) is down

**Check:**
```bash
# Test Railway directly
curl https://blackroad-os-production.up.railway.app/health
```

**Fix:**
1. Check Railway logs for errors
2. Verify health endpoint works
3. Restart service if needed
4. Wait 1-2 minutes for Cloudflare to detect

### Issue: GitHub Pages Not Updating

**Check:**
```bash
# Check workflow status
gh run list --workflow=docs-deploy.yml

# View workflow logs
gh run view <run-id> --log
```

**Fix:**
1. Verify workflow ran successfully
2. Check `gh-pages` branch was updated
3. Check GitHub Pages settings: correct branch/folder
4. Wait 5-10 minutes for deployment
5. Hard refresh browser (Ctrl+F5)

---

## Security Checklist

### Pre-Production

- [ ] All secrets use environment variables (not hardcoded)
- [ ] `SECRET_KEY` is unique and strong (32+ hex chars)
- [ ] `DEBUG=False` in production
- [ ] HTTPS enforced (Cloudflare "Always Use HTTPS")
- [ ] CORS restricted to specific domains (not `*`)
- [ ] Database uses strong password (Railway auto-generates)
- [ ] API rate limiting enabled (TODO: add middleware)
- [ ] Sentry error monitoring configured (optional)

### Post-Production

- [ ] Monitor Railway logs for errors
- [ ] Monitor Cloudflare for attack attempts
- [ ] Enable GitHub Dependabot for vulnerability alerts
- [ ] Regular database backups (Railway automatic)
- [ ] Test disaster recovery (restore from backup)

---

## Quick Reference

### Production URLs

| Service | URL | Source |
|---------|-----|--------|
| Main OS | https://blackroad.systems | Railway (backend/static/) |
| Prism Console | https://blackroad.systems/prism | Railway (backend/static/prism/) |
| API Docs | https://blackroad.systems/api/docs | Railway (OpenAPI) |
| Health Check | https://blackroad.systems/health | Railway (endpoint) |
| Documentation | https://docs.blackroad.systems | GitHub Pages (codex-docs/) |

### Development URLs

| Service | URL | Source |
|---------|-----|--------|
| Main OS | http://localhost:8000 | Local backend |
| Prism Console | http://localhost:8000/prism | Local backend |
| API Docs | http://localhost:8000/api/docs | Local backend |
| Health Check | http://localhost:8000/health | Local backend |
| Documentation | http://localhost:8001 | `mkdocs serve` |

### Important Commands

```bash
# Railway
railway login
railway link
railway up
railway logs --tail 100
railway variables
railway status

# Cloudflare (via API - optional)
# Use Web UI for most tasks

# GitHub Pages
cd codex-docs
mkdocs build --strict
mkdocs serve
mkdocs gh-deploy

# Database
railway run alembic upgrade head
railway run alembic downgrade -1
railway run pg_dump $DATABASE_URL > backup.sql
```

---

## Post-Deployment Checklist

After completing deployment:

- [ ] All services running (Railway dashboard)
- [ ] Health check returns 200: `curl https://blackroad.systems/health`
- [ ] Main OS loads: `https://blackroad.systems`
- [ ] Prism Console loads: `https://blackroad.systems/prism`
- [ ] API docs accessible: `https://blackroad.systems/api/docs`
- [ ] Documentation accessible: `https://docs.blackroad.systems`
- [ ] SSL valid (green padlock in browser)
- [ ] DNS resolves correctly (all subdomains)
- [ ] Logs show no errors (Railway + Cloudflare)
- [ ] Database migrations ran successfully
- [ ] Secrets/env vars all set correctly
- [ ] Monitoring configured (optional: Sentry)
- [ ] Team notified of deployment

---

**Where AI meets the open road.** 🛣️

*Production deployment notes for BlackRoad OS Phase 2.5*
