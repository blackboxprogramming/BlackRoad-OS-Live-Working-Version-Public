# BlackRoad OS - Deployment & Smoke Test Guide

**Version:** 1.0
**Last Updated:** 2025-11-19
**For:** Alexa Louise (Cadillac)

---

## Overview

This guide provides **one-click deployment instructions** and **smoke tests** to verify that BlackRoad OS is fully operational across all services.

**Goal:** Alexa can deploy and verify the entire BlackRoad OS stack without touching individual PRs, configs, or manual interventions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Railway Deployment](#railway-deployment)
5. [Cloudflare DNS Setup](#cloudflare-dns-setup)
6. [Smoke Tests](#smoke-tests)
7. [Monitoring & Health](#monitoring--health)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│  (SSL, DDoS, Caching, WAF)                              │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌─────▼──────┐
   │ Backend │      │  Operator  │
   │ Service │      │  Engine    │
   └────┬────┘      └─────┬──────┘
        │                 │
   ┌────▼─────────────────▼────┐
   │     Railway Platform       │
   │  - PostgreSQL              │
   │  - Redis                   │
   │  - Auto-scaling            │
   └────────────────────────────┘
```

### Services

1. **Backend (Core API)**
   - FastAPI application
   - Serves: Frontend UI, API endpoints, Prism Console
   - Port: 8000
   - Health: `/health`
   - Version: `/version`

2. **Operator Engine**
   - Job scheduler and GitHub automation
   - Port: 8001
   - Health: `/health`
   - Version: `/version`

3. **Frontend (Served by Backend)**
   - Windows 95-style OS UI
   - Vanilla JavaScript, zero dependencies
   - Served at `/` from backend

4. **Prism Console (Served by Backend)**
   - Admin interface
   - Served at `/prism` from backend

---

## Prerequisites

### Required Tools

```bash
# Git
git --version  # Should be 2.x+

# Python (for local testing)
python --version  # Should be 3.11+

# Node.js (optional, for SDK development)
node --version  # Should be 18+

# Railway CLI (for deployment)
curl -fsSL https://railway.app/install.sh | sh
railway --version
```

### Required Accounts

- ✅ GitHub account (for repo access)
- ✅ Railway account (for deployment)
- ✅ Cloudflare account (for DNS)

### Required Secrets

Ensure you have these secrets ready:

**Backend:**
- `SECRET_KEY` - JWT signing key (generate with `openssl rand -hex 32`)
- `WALLET_MASTER_KEY` - Wallet encryption key (32 chars)
- `DATABASE_URL` - PostgreSQL connection string (Railway provides)
- `REDIS_URL` - Redis connection string (Railway provides)
- `GITHUB_TOKEN` - GitHub PAT for API access
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `STRIPE_SECRET_KEY` - Stripe secret (optional)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS S3 (optional)

**Operator:**
- `GITHUB_TOKEN` - GitHub PAT with repo permissions
- `GITHUB_WEBHOOK_SECRET` - Webhook signature secret

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System
```

### 2. Backend Local Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your local settings
# (Use defaults for local development)

# Run with Docker Compose (recommended)
docker-compose up

# OR run directly
uvicorn app.main:app --reload
```

**Access locally:**
- Frontend: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Prism Console: http://localhost:8000/prism
- Health: http://localhost:8000/health
- Version: http://localhost:8000/version

### 3. Operator Local Setup

```bash
cd operator_engine

# Install dependencies (in separate venv or reuse backend's)
pip install -r requirements.txt

# Run operator server
uvicorn operator_engine.server:app --reload --port 8001
```

**Access locally:**
- Health: http://localhost:8001/health
- Version: http://localhost:8001/version
- Jobs: http://localhost:8001/jobs

### 4. Run Tests

```bash
# Backend tests
cd backend
pytest -v

# Or use helper script
cd ..
bash scripts/run_backend_tests.sh

# Operator tests
cd operator_engine
pytest -v
```

---

## Railway Deployment

### Option 1: Automatic Deployment (via GitHub)

**This is the recommended approach.**

1. **Push to main branch:**

```bash
git add .
git commit -m "Deploy BlackRoad OS"
git push origin main
```

2. **GitHub Actions automatically triggers:**
   - `.github/workflows/railway-deploy.yml` runs
   - Builds and deploys both services to Railway
   - Runs health checks
   - Sends notifications (if configured)

3. **Monitor deployment:**
   - Go to: https://github.com/blackboxprogramming/BlackRoad-Operating-System/actions
   - Watch the "Deploy to Railway" workflow

### Option 2: Manual Deployment (via Railway CLI)

**Use this for testing or troubleshooting.**

1. **Install Railway CLI:**

```bash
curl -fsSL https://railway.app/install.sh | sh
```

2. **Login to Railway:**

```bash
railway login
```

3. **Link to your Railway project:**

```bash
# From repo root
railway link

# Select your project from the list
# Or create a new project
```

4. **Deploy services:**

```bash
# Deploy both services (uses railway.toml)
railway up

# Or deploy specific service
railway up -s blackroad-backend
railway up -s blackroad-operator
```

5. **Check deployment status:**

```bash
railway status

# View logs
railway logs -s blackroad-backend
railway logs -s blackroad-operator
```

6. **Get service URLs:**

```bash
# In Railway dashboard or CLI
railway domain

# Should output something like:
# blackroad-backend: blackroad-backend-production.up.railway.app
# blackroad-operator: blackroad-operator-production.up.railway.app
```

### Configure Environment Variables in Railway

**Via Railway Dashboard:**

1. Go to: https://railway.app/dashboard
2. Select your project
3. Click on each service (backend, operator)
4. Go to **Variables** tab
5. Add environment variables from `.env.example`

**Via Railway CLI:**

```bash
# Set a variable for backend service
railway variables set SECRET_KEY="your-secret-key-here" -s blackroad-backend

# Set a variable for operator service
railway variables set GITHUB_TOKEN="ghp_..." -s blackroad-operator

# Or set from .env file
railway variables set -f backend/.env -s blackroad-backend
```

**Required Variables (Backend):**

```bash
SECRET_KEY=<your-secret-32-char-key>
WALLET_MASTER_KEY=<your-wallet-key-32-chars>
ALLOWED_ORIGINS=https://blackroad.systems,https://api.blackroad.systems,https://os.blackroad.systems
ENVIRONMENT=production
DEBUG=False
GITHUB_TOKEN=<your-github-pat>
OPENAI_API_KEY=<optional>
STRIPE_SECRET_KEY=<optional>
AWS_ACCESS_KEY_ID=<optional>
AWS_SECRET_ACCESS_KEY=<optional>
```

**Required Variables (Operator):**

```bash
ENVIRONMENT=production
GITHUB_TOKEN=<your-github-pat>
GITHUB_WEBHOOK_SECRET=<your-webhook-secret>
```

**Note:** `DATABASE_URL` and `REDIS_URL` are automatically provided by Railway when you add PostgreSQL and Redis services.

---

## Cloudflare DNS Setup

Follow the **[DNS_CLOUDFLARE_PLAN.md](./infra/DNS_CLOUDFLARE_PLAN.md)** document.

**Quick Summary:**

1. Get Railway production URLs (from Railway dashboard or `railway domain`)
2. Login to Cloudflare: https://dash.cloudflare.com
3. Select `blackroad.systems` domain
4. Add CNAME records:
   - `api` → `<backend-railway-url>`
   - `core` → `<backend-railway-url>`
   - `operator` → `<operator-railway-url>`
   - `console` → `<backend-railway-url>`
   - `docs` → `<backend-railway-url>`
   - `web` → `<backend-railway-url>`
   - `os` → `<backend-railway-url>`
   - `@` (root) → `<backend-railway-url>`
   - `www` → `<backend-railway-url>`

5. Enable **Proxy** (orange cloud) for all records
6. Set SSL/TLS to **Full (strict)**

---

## Smoke Tests

Run these tests **after deployment** to ensure everything works.

### Automated Smoke Test Script

```bash
#!/bin/bash
# smoke-test.sh - Run after deployment

set -e

# Set your domain or Railway URL
BACKEND_URL=${BACKEND_URL:-"https://api.blackroad.systems"}
OPERATOR_URL=${OPERATOR_URL:-"https://operator.blackroad.systems"}

echo "🔍 Running BlackRoad OS Smoke Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Backend Health
echo -n "✓ Backend Health Check... "
curl -f -s "$BACKEND_URL/health" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Backend Version
echo -n "✓ Backend Version... "
curl -f -s "$BACKEND_URL/version" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 3: API Health Summary
echo -n "✓ API Health Summary... "
curl -f -s "$BACKEND_URL/api/health/summary" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 4: API Docs
echo -n "✓ API Documentation... "
curl -f -s "$BACKEND_URL/api/docs" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 5: Frontend UI
echo -n "✓ Frontend UI... "
curl -f -s "$BACKEND_URL/" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 6: Prism Console
echo -n "✓ Prism Console... "
curl -f -s "$BACKEND_URL/prism" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 7: Operator Health
echo -n "✓ Operator Health Check... "
curl -f -s "$OPERATOR_URL/health" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 8: Operator Version
echo -n "✓ Operator Version... "
curl -f -s "$OPERATOR_URL/version" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

# Test 9: Operator Jobs
echo -n "✓ Operator Jobs List... "
curl -f -s "$OPERATOR_URL/jobs" > /dev/null && echo "✅ PASS" || echo "❌ FAIL"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All smoke tests complete!"
```

**Save this as `scripts/smoke-test.sh` and run:**

```bash
chmod +x scripts/smoke-test.sh

# Test with Railway URLs
BACKEND_URL=https://<your-backend>.up.railway.app \
OPERATOR_URL=https://<your-operator>.up.railway.app \
./scripts/smoke-test.sh

# Or test with Cloudflare domains
BACKEND_URL=https://api.blackroad.systems \
OPERATOR_URL=https://operator.blackroad.systems \
./scripts/smoke-test.sh
```

### Manual Smoke Tests

**Test 1: Backend Health**
```bash
curl -i https://api.blackroad.systems/health

# Expected:
# HTTP/2 200
# {"status":"healthy","timestamp":1234567890.123}
```

**Test 2: Backend Version**
```bash
curl -i https://api.blackroad.systems/version

# Expected:
# HTTP/2 200
# {
#   "service": "blackroad-core",
#   "version": "1.0.0",
#   "environment": "production",
#   "commit": "abc123...",
#   "built_at": "2025-11-19T...",
#   "python_version": "3.11.x",
#   "platform": "Linux"
# }
```

**Test 3: API Health Summary**
```bash
curl -i https://api.blackroad.systems/api/health/summary

# Expected:
# HTTP/2 200
# {
#   "status": "healthy" | "degraded" | "unhealthy",
#   "summary": {
#     "total": 12,
#     "connected": 5,
#     "not_configured": 7,
#     "errors": 0
#   },
#   "connected_apis": ["github", "openai", ...],
#   ...
# }
```

**Test 4: Operator Health**
```bash
curl -i https://operator.blackroad.systems/health

# Expected:
# HTTP/2 200
# {"status":"healthy","version":"0.1.0"}
```

**Test 5: Operator Version**
```bash
curl -i https://operator.blackroad.systems/version

# Expected:
# HTTP/2 200
# {
#   "service": "blackroad-operator",
#   "version": "0.1.0",
#   ...
# }
```

**Test 6: Frontend UI**
```bash
# Open in browser
open https://os.blackroad.systems

# Should see Windows 95-style desktop interface
# Check for:
# - Desktop icons
# - Taskbar at bottom
# - Start menu works
# - Windows can be opened/closed
```

**Test 7: Prism Console**
```bash
# Open in browser
open https://console.blackroad.systems/prism

# Should see dark admin interface
# Check for:
# - Navigation tabs (Overview, Jobs, Agents, Logs, System)
# - Metrics cards
# - System status
```

**Test 8: API Documentation**
```bash
# Open in browser
open https://api.blackroad.systems/api/docs

# Should see Swagger UI
# Check for:
# - All routers listed
# - Endpoints grouped by tags
# - Try out authentication endpoints
```

---

## Monitoring & Health

### Health Endpoints

**Backend:**
- Basic health: `GET /health`
- Version info: `GET /version`
- API health: `GET /api/health/summary`
- Full API health: `GET /api/health/all`
- Individual API: `GET /api/health/{api_name}`

**Operator:**
- Basic health: `GET /health`
- Version info: `GET /version`
- Scheduler status: `GET /scheduler/status`

### Railway Monitoring

**View Metrics:**
1. Go to Railway dashboard
2. Select your project
3. Click on a service
4. View **Metrics** tab:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

**View Logs:**
```bash
# Via CLI
railway logs -s blackroad-backend
railway logs -s blackroad-operator --tail

# Via Dashboard
# Go to service > Deployments > View Logs
```

### Cloudflare Analytics

1. Login to Cloudflare
2. Select `blackroad.systems`
3. Go to **Analytics** tab
4. Monitor:
   - Requests
   - Bandwidth
   - Unique visitors
   - Threats blocked
   - Cache performance

### Set Up Alerts

**Railway Alerts:**
- Go to Project Settings > Notifications
- Enable alerts for:
  - Deployment failures
  - High CPU/Memory usage
  - Service crashes

**Cloudflare Health Checks:**
- See: `infra/DNS_CLOUDFLARE_PLAN.md`
- Configure health checks for both services
- Get email alerts on downtime

---

## Troubleshooting

### Issue: Deployment failed

**Check:**
```bash
# View recent logs
railway logs -s blackroad-backend --tail

# Check build logs
railway logs --deployment <deployment-id>

# Re-deploy
railway up -s blackroad-backend
```

**Common causes:**
- Missing environment variables
- Database migration failed
- Dependency installation failed

### Issue: Health check returns 502/503

**Check:**
1. Service is running: `railway status`
2. Logs for errors: `railway logs -s blackroad-backend`
3. Environment variables are set
4. Database and Redis are accessible

**Fix:**
```bash
# Restart service
railway restart -s blackroad-backend

# Or redeploy
railway up -s blackroad-backend
```

### Issue: CORS errors in browser

**Check:**
1. `ALLOWED_ORIGINS` environment variable includes your domain
2. Cloudflare SSL mode is **Full (strict)**

**Fix:**
```bash
# Update allowed origins
railway variables set ALLOWED_ORIGINS="https://blackroad.systems,https://api.blackroad.systems,https://os.blackroad.systems" -s blackroad-backend

# Restart service
railway restart -s blackroad-backend
```

### Issue: DNS not resolving

**Check:**
```bash
# Check DNS propagation
dig api.blackroad.systems
nslookup api.blackroad.systems

# Or use online tool
# https://dnschecker.org
```

**Fix:**
1. Wait up to 24 hours for global propagation
2. Flush local DNS cache
3. Verify CNAME records in Cloudflare

### Issue: 500 Internal Server Error

**Check:**
1. Railway logs: `railway logs -s blackroad-backend`
2. Database connectivity
3. Missing secrets

**Fix:**
```bash
# Check database connection
railway run -s blackroad-backend -- python -c "from app.database import async_engine; print('DB OK')"

# Verify all required env vars are set
railway variables -s blackroad-backend
```

### Issue: API endpoints return 404

**Check:**
1. Correct URL path
2. Service is deployed correctly
3. Routes are registered in `main.py`

**Fix:**
```bash
# Check API documentation for correct paths
open https://api.blackroad.systems/api/docs

# Verify routes
railway logs -s blackroad-backend | grep "Application startup complete"
```

---

## Success Criteria

BlackRoad OS is considered **fully operational** when:

- ✅ Backend service deploys without errors
- ✅ Operator service deploys without errors
- ✅ All health endpoints return 200 OK
- ✅ Frontend UI loads and is interactive
- ✅ Prism Console loads and shows metrics
- ✅ API documentation is accessible
- ✅ DNS resolves correctly for all subdomains
- ✅ SSL certificates are valid
- ✅ All smoke tests pass
- ✅ No errors in Railway logs
- ✅ Cloudflare proxy is active (orange cloud)

**Alexa's Victory Condition:**

> Visit https://os.blackroad.systems and see the Windows 95 desktop.
> Click around, open apps, and everything just works.
> No Git, no PRs, no manual config.

---

## Quick Reference Commands

```bash
# Deploy to Railway
railway up

# View status
railway status

# View logs
railway logs -s blackroad-backend --tail

# Set environment variable
railway variables set SECRET_KEY="xxx" -s blackroad-backend

# Restart service
railway restart -s blackroad-backend

# Run smoke tests
./scripts/smoke-test.sh

# View Railway dashboard
railway open

# SSH into Railway service (for debugging)
railway shell -s blackroad-backend
```

---

## Next Steps After Deployment

1. **Configure monitoring:**
   - Set up Cloudflare health checks
   - Enable Railway alerts
   - Set up external uptime monitoring

2. **Set up CI/CD:**
   - GitHub Actions already configured
   - Ensure `RAILWAY_TOKEN` secret is set in GitHub

3. **Configure webhooks:**
   - Set up GitHub webhooks for operator
   - Configure Stripe webhooks (if using payments)

4. **Performance tuning:**
   - Monitor Railway metrics
   - Adjust replica count if needed
   - Configure Cloudflare caching rules

5. **Security hardening:**
   - Enable Cloudflare WAF
   - Set up rate limiting
   - Configure IP whitelisting for `/prism` (optional)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
**Maintained by:** Atlas (AI Infrastructure Engineer)
**For:** Alexa Louise (Cadillac), Founder & Operator
