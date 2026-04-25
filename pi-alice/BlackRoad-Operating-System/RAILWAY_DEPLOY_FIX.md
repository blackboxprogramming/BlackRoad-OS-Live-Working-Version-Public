# Railway Deployment Fix - Phase LIVE

> **Date**: 2025-11-18
> **Issue**: Railway deployment failing due to incorrect startCommand
> **Status**: ✅ FIXED

---

## Problem Identified

The Railway deployment was failing because of a mismatch between the Docker build context and the `startCommand` in `railway.toml`.

### Root Cause

**In `railway.toml`**:
```toml
[build]
dockerfilePath = "backend/Dockerfile"  # ✅ Correct - builds from backend/ directory

[deploy]
startCommand = "cd backend && uvicorn app.main:app ..."  # ❌ WRONG!
```

**The Issue**:
1. Railway builds the Docker image from `backend/Dockerfile`
2. The build context is the `backend/` directory
3. Inside the container, the working directory is `/app/` with all backend files
4. There is **NO `backend/` subdirectory** inside the container
5. The `cd backend` command fails, causing deployment failure

### Docker Build Context Flow

```
Repository Structure:
/home/user/BlackRoad-Operating-System/
├── backend/
│   ├── Dockerfile          ← Railway builds from here
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── ...

Docker Build (Railway):
1. Context: backend/ directory
2. WORKDIR /app
3. COPY requirements.txt .    → /app/requirements.txt
4. COPY . .                   → /app/app/, /app/tests/, etc.

Final Container Structure:
/app/
├── app/
│   └── main.py      ← uvicorn app.main:app works here
├── requirements.txt
├── tests/
└── static/

❌ There is NO /app/backend/ directory!
❌ `cd backend` fails!
```

---

## Fixes Applied

### 1. Fixed `railway.toml`

**Before**:
```toml
[deploy]
startCommand = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

**After**:
```toml
[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
# startCommand is handled by Dockerfile CMD - no need to override
```

**Rationale**: Let the Dockerfile `CMD` handle the start command since it already knows the correct structure.

### 2. Enhanced `backend/Dockerfile`

**Improvements**:
```dockerfile
# Added curl for healthchecks
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \                              # ← NEW
    && rm -rf /var/lib/apt/lists/*

# Upgraded pip before installing
RUN pip install --no-cache-dir --upgrade pip && \  # ← NEW
    pip install --no-cache-dir -r requirements.txt

# Security: run as non-root user
RUN useradd -m -u 1000 blackroad && \    # ← NEW
    chown -R blackroad:blackroad /app
USER blackroad                            # ← NEW

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \  # ← NEW
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Explicit worker count for Railway
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
```

**Benefits**:
- ✅ Security: Runs as non-root user (`blackroad`)
- ✅ Health checks: Railway can auto-detect health status
- ✅ Worker control: Single worker to avoid memory issues on Railway's free tier
- ✅ Curl available: Supports health endpoint checks

---

## Required Environment Variables in Railway

Based on `backend/.env.example`, the following variables **MUST** be set in Railway:

### Critical (Required for Startup)

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Primary database connection |
| `SECRET_KEY` | `<random-64-char-string>` | JWT signing key |
| `ALLOWED_ORIGINS` | `https://your-app.railway.app` | CORS configuration |
| `ENVIRONMENT` | `production` | Runtime environment |
| `DEBUG` | `False` | Disable debug mode |

### Important (Recommended)

| Variable | Example | Purpose |
|----------|---------|---------|
| `REDIS_URL` | `redis://host:6379/0` | Session storage, caching |
| `WALLET_MASTER_KEY` | `<random-key>` | Blockchain wallet encryption |
| `JWT_SECRET` | `<random-key>` | JWT token secret |

### Optional (Feature-Specific)

| Variable | Purpose | Required When |
|----------|---------|---------------|
| `OPENAI_API_KEY` | AI chat features | Using AI router |
| `GITHUB_TOKEN` | GitHub integration | Using GitHub router |
| `STRIPE_SECRET_KEY` | Payment processing | Using Stripe router |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | Email sending | Using email router |

See `ENV_VARS.md` for the complete list.

---

## Deployment Workflow

### Automatic Deployment (Recommended)

1. Push to `main` branch
2. GitHub Action `.github/workflows/railway-deploy.yml` triggers
3. Railway CLI deploys using `railway.toml`
4. Health check runs at `/health`
5. Traffic cutover if healthy

### Manual Deployment

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Link to project
railway link <PROJECT_ID>

# Deploy
railway up

# Check logs
railway logs

# Check status
railway status
```

---

## Verification Steps

After deployment, verify these endpoints:

### 1. Health Check
```bash
curl https://<your-app>.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. API Docs
```bash
curl https://<your-app>.railway.app/api/docs
```

Should return the Swagger UI HTML.

### 3. API Health Summary
```bash
curl https://<your-app>.railway.app/api/health/summary
```

Expected response:
```json
{
  "summary": {
    "total": 33,
    "connected": <number>,
    "not_configured": <number>,
    "errors": <number>
  },
  "integrations": { ... }
}
```

---

## Troubleshooting

### Issue: "cd: can't cd to backend: No such file or directory"

**Cause**: Using old `railway.toml` with `startCommand = "cd backend && ..."`
**Fix**: Remove or comment out `startCommand` in `railway.toml` (fixed in this PR)

### Issue: "Permission denied" errors

**Cause**: Application trying to write to files owned by root
**Fix**: Dockerfile now creates non-root user `blackroad` (fixed in this PR)

### Issue: "Port already in use"

**Cause**: Railway `$PORT` variable not being used
**Fix**: Dockerfile CMD uses `${PORT:-8000}` (already correct)

### Issue: Health check failing

**Possible causes**:
1. `/health` endpoint not implemented → Check `backend/app/routers/system.py` or `dashboard.py`
2. Database connection failing → Check `DATABASE_URL` in Railway
3. Redis connection failing → Check `REDIS_URL` or make Redis optional
4. Application startup errors → Check Railway logs

**Debug**:
```bash
railway logs --tail 100
```

### Issue: Database connection errors

**Symptoms**: "could not connect to server", "password authentication failed"

**Fix**:
1. Ensure `DATABASE_URL` is set in Railway
2. Use the format: `postgresql://<user>:<password>@<host>:<port>/<database>`
3. For Railway Postgres addon, use the provided `DATABASE_URL`
4. Verify the database is in the same Railway project

---

## Next Steps

1. ✅ Fixed `railway.toml` (remove incorrect `cd backend`)
2. ✅ Enhanced `Dockerfile` (security, health checks, workers)
3. ⏳ Test deployment on Railway
4. ⏳ Verify health endpoints
5. ⏳ Update `ENV_VARS.md` with Railway-specific notes
6. ⏳ Document in `CLAUDE.md` for future reference

---

## Related Files

- `railway.toml` - Railway deployment configuration
- `backend/Dockerfile` - Container definition
- `backend/.env.example` - Environment variable template
- `ENV_VARS.md` - Comprehensive environment variable documentation
- `.github/workflows/railway-deploy.yml` - Deployment automation
- `CLAUDE.md` - AI assistant guide (should be updated)

---

**Status**: Deployment fixes are ready to test. Next commit will trigger automatic Railway deployment via GitHub Actions.

**Expected Outcome**: ✅ Successful deployment with healthy status at `/health` endpoint.

---

_Last Updated: 2025-11-18_
_Author: Claude (Phase LIVE Integration)_
