# 🔐 BlackRoad OS - Complete Environment Variables Reference

**Version**: 1.0.0
**Last Updated**: 2025-11-19
**Operator**: Atlas

---

## 📋 Overview

This document provides the complete reference for environment variables across all BlackRoad OS services.

### Variable Priority

1. **Railway Environment Variables** (highest priority)
2. **`.env` file** (local development)
3. **Default values in code** (fallback)

### Security Notes

- ⚠️ **NEVER** commit `.env` files to Git
- ⚠️ **NEVER** expose secrets in logs or error messages
- ✅ Use Railway's built-in secrets management
- ✅ Rotate secrets regularly (every 90 days minimum)

---

## 🎯 Core API Service

**Location**: `services/core-api/`
**Railway Service**: `blackroad-os-core-production`
**URL**: https://core.blackroad.systems

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Deployment environment |
| `PORT` | `$PORT` | Railway auto-provides |
| `ALLOWED_ORIGINS` | `https://prism.blackroad.systems,https://api.blackroad.systems` | CORS allowed origins |

### Optional Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host:5432/db` | PostgreSQL connection (future) |
| `REDIS_URL` | `redis://host:6379/0` | Redis connection (future) |

### Railway Auto-Provided

| Variable | Description |
|----------|-------------|
| `RAILWAY_GIT_COMMIT_SHA` | Git commit hash |
| `RAILWAY_REGION` | Railway region (e.g., `us-west1`) |
| `RAILWAY_SERVICE_ID` | Unique service ID |
| `RAILWAY_DEPLOYMENT_ID` | Unique deployment ID |

### Example `.env`

```bash
# Core API Environment Variables
ENVIRONMENT=production
PORT=8000
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems,https://blackroad.systems
```

---

## 🌐 Public API Gateway

**Location**: `services/public-api/`
**Railway Service**: `blackroad-os-api-production`
**URL**: https://api.blackroad.systems

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Deployment environment |
| `PORT` | `$PORT` | Railway auto-provides |
| `CORE_API_URL` | `https://blackroad-os-core-production.up.railway.app` | Core API backend URL |
| `AGENTS_API_URL` | `https://blackroad-os-operator-production.up.railway.app` | Operator API backend URL |
| `ALLOWED_ORIGINS` | `https://prism.blackroad.systems,https://blackroad.systems` | CORS allowed origins |

### Optional Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `API_KEYS_SECRET` | `<secret>` | Secret for API key encryption (future) |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting (future) |

### Example `.env`

```bash
# Public API Gateway Environment Variables
ENVIRONMENT=production
PORT=8000

# Backend URLs
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
AGENTS_API_URL=https://blackroad-os-operator-production.up.railway.app

# CORS
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems,https://api.blackroad.systems
```

---

## ⚙️ Operator Engine

**Location**: `operator_engine/`
**Railway Service**: `blackroad-os-operator-production`
**URL**: https://operator.blackroad.systems

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Deployment environment |
| `PORT` | `$PORT` | Railway auto-provides |
| `ALLOWED_ORIGINS` | `https://prism.blackroad.systems,https://api.blackroad.systems` | CORS allowed origins |

### Optional Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | `ghp_xxxxx` | GitHub API access for automation |
| `GITHUB_WEBHOOK_SECRET` | `<secret>` | Webhook signature verification |
| `DATABASE_URL` | `postgresql+asyncpg://...` | PostgreSQL for job persistence |
| `REDIS_URL` | `redis://...` | Redis for job queue |

### Example `.env`

```bash
# Operator Engine Environment Variables
ENVIRONMENT=production
PORT=8000
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://api.blackroad.systems

# Optional GitHub integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🎨 Prism Console

**Location**: `prism-console/`
**Railway Service**: `blackroad-os-prism-console-production`
**URL**: https://prism.blackroad.systems

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Deployment environment |
| `PORT` | `$PORT` | Railway auto-provides |
| `CORE_API_URL` | `https://blackroad-os-core-production.up.railway.app` | Core API URL for status page |
| `PUBLIC_API_URL` | `https://blackroad-os-api-production.up.railway.app` | Public API URL for status page |
| `OPERATOR_API_URL` | `https://blackroad-os-operator-production.up.railway.app` | Operator URL for status page |
| `PRISM_CONSOLE_URL` | `https://blackroad-os-prism-console-production.up.railway.app` | Self URL for status page |
| `ALLOWED_ORIGINS` | `https://blackroad.systems` | CORS allowed origins |

### Example `.env`

```bash
# Prism Console Environment Variables
ENVIRONMENT=production
PORT=8000

# Backend URLs for status page
CORE_API_URL=https://blackroad-os-core-production.up.railway.app
PUBLIC_API_URL=https://blackroad-os-api-production.up.railway.app
OPERATOR_API_URL=https://blackroad-os-operator-production.up.railway.app
PRISM_CONSOLE_URL=https://blackroad-os-prism-console-production.up.railway.app

# CORS
ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems
```

---

## 📊 Environment Matrix

### Development vs. Production

| Variable | Development | Production |
|----------|-------------|------------|
| `ENVIRONMENT` | `development` | `production` |
| `DEBUG` | `True` | `False` |
| `ALLOWED_ORIGINS` | `*` (all) | Specific domains only |
| `CORE_API_URL` | `http://localhost:8001` | `https://blackroad-os-core-production.up.railway.app` |
| `PUBLIC_API_URL` | `http://localhost:8000` | `https://blackroad-os-api-production.up.railway.app` |
| `OPERATOR_API_URL` | `http://localhost:8002` | `https://blackroad-os-operator-production.up.railway.app` |

---

## 🔄 URL Mapping

### Railway URLs → Cloudflare URLs

| Service | Railway URL | Cloudflare URL |
|---------|-------------|----------------|
| Core API | `blackroad-os-core-production.up.railway.app` | `core.blackroad.systems` |
| Public API | `blackroad-os-api-production.up.railway.app` | `api.blackroad.systems` |
| Operator | `blackroad-os-operator-production.up.railway.app` | `operator.blackroad.systems` |
| Prism Console | `blackroad-os-prism-console-production.up.railway.app` | `prism.blackroad.systems` |

**Note**: Use Railway URLs in environment variables (more stable). Cloudflare URLs are for public access.

---

## 🧪 Local Development Setup

### 1. Core API (Port 8001)

```bash
cd services/core-api
cp .env.example .env

# Edit .env
cat > .env << EOF
ENVIRONMENT=development
PORT=8001
ALLOWED_ORIGINS=*
EOF

# Run
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

### 2. Public API (Port 8000)

```bash
cd services/public-api
cp .env.example .env

# Edit .env
cat > .env << EOF
ENVIRONMENT=development
PORT=8000
CORE_API_URL=http://localhost:8001
AGENTS_API_URL=http://localhost:8002
ALLOWED_ORIGINS=*
EOF

# Run
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 3. Operator (Port 8002)

```bash
cd operator_engine
cp .env.example .env

# Edit .env
cat > .env << EOF
ENVIRONMENT=development
PORT=8002
ALLOWED_ORIGINS=*
EOF

# Run
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn operator_engine.server:app --port 8002 --reload
```

### 4. Prism Console (Port 8003)

```bash
cd prism-console
cp .env.example .env

# Edit .env
cat > .env << EOF
ENVIRONMENT=development
PORT=8003
CORE_API_URL=http://localhost:8001
PUBLIC_API_URL=http://localhost:8000
OPERATOR_API_URL=http://localhost:8002
PRISM_CONSOLE_URL=http://localhost:8003
ALLOWED_ORIGINS=*
EOF

# Run
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --port 8003 --reload
```

---

## 🔐 Secrets Management

### Generating Secrets

```bash
# Generate random secret (32 bytes)
openssl rand -hex 32

# Generate JWT secret
openssl rand -base64 32

# Generate API key
openssl rand -hex 16
```

### Storing Secrets in Railway

**Via Railway CLI**:
```bash
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set GITHUB_TOKEN=ghp_your_token
```

**Via Railway Dashboard**:
1. Navigate to service
2. Variables tab
3. Click "Add Variable"
4. Enter name and value
5. Save

### Rotating Secrets

**Frequency**:
- **Every 90 days**: All production secrets
- **Immediately**: If compromised
- **Before team member leaves**: All shared secrets

**Process**:
1. Generate new secret
2. Update Railway variables
3. Redeploy service
4. Verify service health
5. Delete old secret from password manager

---

## 🐛 Troubleshooting

### Missing Environment Variable

**Symptom**: Service crashes with `KeyError` or "Environment variable not found"

**Solution**:
```bash
# Check current variables
railway variables

# Add missing variable
railway variables set VARIABLE_NAME=value

# Restart service
railway restart
```

### Wrong Backend URL

**Symptom**: Public API returns 503 or "Backend unreachable"

**Solution**:
1. Verify backend service is running
2. Check URL in environment variables:
   ```bash
   railway variables | grep URL
   ```
3. Test backend directly:
   ```bash
   curl https://blackroad-os-core-production.up.railway.app/health
   ```
4. Update variable if incorrect:
   ```bash
   railway variables set CORE_API_URL=https://blackroad-os-core-production.up.railway.app
   ```

### CORS Errors

**Symptom**: Browser console shows CORS policy error

**Solution**:
1. Check `ALLOWED_ORIGINS` includes requesting domain
2. Update variable:
   ```bash
   railway variables set ALLOWED_ORIGINS=https://prism.blackroad.systems,https://blackroad.systems
   ```
3. Restart service
4. Test with curl:
   ```bash
   curl -H "Origin: https://prism.blackroad.systems" \
        -I https://api.blackroad.systems/health
   ```

---

## ✅ Verification Checklist

### After Setting Variables

- [ ] All required variables set for each service
- [ ] No placeholder values (e.g., `<your-value-here>`)
- [ ] URLs use HTTPS (not HTTP) in production
- [ ] CORS origins include all necessary domains
- [ ] Secrets are not exposed in logs
- [ ] Services restart successfully
- [ ] Health endpoints return 200 OK

### Testing

```bash
# Test each service health endpoint
curl https://core.blackroad.systems/health
curl https://api.blackroad.systems/health
curl https://operator.blackroad.systems/health
curl https://prism.blackroad.systems/health

# All should return status: "healthy"
```

---

**ENVIRONMENT VARIABLES CONFIGURED**

All services have correct environment variables. System ready for deployment.

**End of Environment Variables Reference**
