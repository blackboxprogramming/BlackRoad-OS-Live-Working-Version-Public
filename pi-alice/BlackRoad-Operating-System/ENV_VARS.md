# Environment Variables Documentation

**Version:** 1.0
**Date:** 2025-11-18
**Purpose:** Complete reference for all environment variables across BlackRoad OS infrastructure

---

## Overview

This document provides the **complete list** of environment variables used across the BlackRoad OS ecosystem. It covers:

- **Required variables** for core functionality
- **Optional variables** for integrations and features
- **Where to set them** (Railway, GitHub Actions, local development)
- **How to generate secret values** safely
- **Security best practices**

---

## Table of Contents

1. [Core Application](#core-application)
2. [Database & Cache](#database--cache)
3. [Authentication & Security](#authentication--security)
4. [API Integrations](#api-integrations)
5. [Infrastructure](#infrastructure)
6. [Deployment](#deployment)
7. [Observability](#observability)
8. [Where to Set Variables](#where-to-set-variables)
9. [Security Best Practices](#security-best-practices)
10. [Quick Start Templates](#quick-start-templates)

---

## Core Application

### ENVIRONMENT
**Required:** Yes
**Default:** `development`
**Valid values:** `development`, `staging`, `production`
**Description:** Runtime environment identifier

**Where to set:**
- **Railway (production):** `production`
- **Railway (staging):** `staging`
- **Local:** `development`

**Example:**
```bash
ENVIRONMENT=production
```

### DEBUG
**Required:** No
**Default:** `False`
**Valid values:** `True`, `False`
**Description:** Enable debug mode (verbose logging, stack traces)

**⚠️ Security Warning:** MUST be `False` in production!

**Where to set:**
- **Railway:** `False`
- **Local:** `True` (for development)

**Example:**
```bash
DEBUG=False
```

### SECRET_KEY
**Required:** Yes
**Description:** Secret key for signing sessions, JWT tokens, and encryption

**How to generate:**
```bash
# Option 1: Using openssl
openssl rand -hex 32

# Option 2: Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**⚠️ Security:**
- MUST be unique per environment (production ≠ staging ≠ local)
- MUST be at least 32 characters
- NEVER commit to git
- Rotate quarterly or after suspected compromise

**Where to set:**
- **Railway (production):** Generate unique value
- **Railway (staging):** Generate different unique value
- **Local:** Generate local value (in `.env`, gitignored)

**Example:**
```bash
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### API_BASE_URL
**Required:** Yes
**Description:** Public URL for the backend API (used by frontend for API calls)

**Where to set:**
- **Railway (production):** `https://os.blackroad.systems`
- **Railway (staging):** `https://staging.blackroad.systems`
- **Local:** `http://localhost:8000`

**Example:**
```bash
API_BASE_URL=https://os.blackroad.systems
```

### FRONTEND_URL
**Required:** Yes
**Description:** Public URL for the frontend (used for CORS, redirects, emails)

**Where to set:**
- **Railway (production):** `https://os.blackroad.systems`
- **Railway (staging):** `https://staging.blackroad.systems`
- **Local:** `http://localhost:8000`

**Example:**
```bash
FRONTEND_URL=https://os.blackroad.systems
```

### ALLOWED_ORIGINS
**Required:** Yes
**Description:** Comma-separated list of allowed CORS origins

**Where to set:**
- **Railway (production):** `https://os.blackroad.systems,https://blackroad.ai,https://blackroad.network`
- **Railway (staging):** `https://staging.blackroad.systems`
- **Local:** `http://localhost:8000,http://localhost:3000`

**Example:**
```bash
ALLOWED_ORIGINS=https://os.blackroad.systems,https://blackroad.ai
```

### PORT
**Required:** No (Railway auto-detects)
**Default:** `8000`
**Description:** HTTP port for the backend server

**Where to set:**
- **Railway:** Not needed (Railway sets `$PORT` automatically)
- **Local:** `8000` (or any available port)

**Example:**
```bash
PORT=8000
```

---

## Database & Cache

### DATABASE_URL
**Required:** Yes
**Description:** PostgreSQL connection string (sync driver)

**Format:** `postgresql://user:password@host:port/database`

**Where to set:**
- **Railway:** Auto-injected via `${{Postgres.DATABASE_URL}}`
- **Local:** `postgresql://user:pass@localhost:5432/blackroad_dev`

**Example:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/blackroad_dev
```

**How to use Railway reference:**
In Railway dashboard → Service → Variables:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### DATABASE_ASYNC_URL
**Required:** Yes (for async database operations)
**Description:** PostgreSQL connection string (async driver)

**Format:** `postgresql+asyncpg://user:password@host:port/database`

**Where to set:**
- **Railway:** Convert `DATABASE_URL` to async:
  ```
  DATABASE_ASYNC_URL=${{Postgres.DATABASE_URL_ASYNC}}
  ```
  Or manually construct:
  ```bash
  # If Railway doesn't provide async URL, derive from sync URL
  # Replace 'postgresql://' with 'postgresql+asyncpg://'
  ```

- **Local:** `postgresql+asyncpg://user:pass@localhost:5432/blackroad_dev`

**Example:**
```bash
DATABASE_ASYNC_URL=postgresql+asyncpg://user:password@localhost:5432/blackroad_dev
```

### REDIS_URL
**Required:** Yes
**Description:** Redis connection string for caching and sessions

**Format:** `redis://host:port/db` or `redis://user:password@host:port/db`

**Where to set:**
- **Railway:** Auto-injected via `${{Redis.REDIS_URL}}`
- **Local:** `redis://localhost:6379/0`

**Example:**
```bash
REDIS_URL=redis://localhost:6379/0
```

**How to use Railway reference:**
In Railway dashboard → Service → Variables:
```
REDIS_URL=${{Redis.REDIS_URL}}
```

---

## Authentication & Security

### ACCESS_TOKEN_EXPIRE_MINUTES
**Required:** No
**Default:** `30`
**Description:** JWT access token expiration time (in minutes)

**Recommended values:**
- **Production:** `15` - `30` (shorter = more secure)
- **Development:** `60` - `120` (longer = less login friction)

**Example:**
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### REFRESH_TOKEN_EXPIRE_DAYS
**Required:** No
**Default:** `7`
**Description:** JWT refresh token expiration time (in days)

**Recommended values:**
- **Production:** `7` - `14`
- **Development:** `30`

**Example:**
```bash
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### WALLET_MASTER_KEY
**Required:** Yes (for blockchain features)
**Description:** Master key for wallet/blockchain operations

**How to generate:**
```bash
openssl rand -hex 32
```

**⚠️ Security:**
- CRITICAL: Losing this key means losing access to blockchain wallets
- Backup securely (encrypted password manager, hardware security module)
- NEVER expose in logs or error messages

**Example:**
```bash
WALLET_MASTER_KEY=your-generated-master-key-here
```

---

## API Integrations

### OPENAI_API_KEY
**Required:** For AI features (Lucidia, agents)
**Description:** OpenAI API key for GPT models

**How to get:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key (starts with `sk-`)

**Example:**
```bash
OPENAI_API_KEY=sk-proj-1234567890abcdef...
```

### ANTHROPIC_API_KEY
**Required:** For Claude integration
**Description:** Anthropic API key for Claude models

**How to get:**
1. Go to https://console.anthropic.com/settings/keys
2. Create new API key
3. Copy key

**Example:**
```bash
ANTHROPIC_API_KEY=sk-ant-1234567890abcdef...
```

### GITHUB_TOKEN
**Required:** For GitHub integrations (agents, automation)
**Description:** GitHub Personal Access Token (PAT)

**How to get:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic or fine-grained)
3. Required scopes: `repo`, `workflow`, `read:org`

**Example:**
```bash
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz
```

### STRIPE_SECRET_KEY
**Required:** For payment features
**Description:** Stripe API secret key

**How to get:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Secret key" (starts with `sk_test_` or `sk_live_`)

**⚠️ Use test key for development:**
```bash
# Development/Staging
STRIPE_SECRET_KEY=sk_test_...

# Production
STRIPE_SECRET_KEY=sk_live_...
```

### STRIPE_PUBLISHABLE_KEY
**Required:** For frontend payment UI
**Description:** Stripe publishable key (safe to expose in frontend)

**Example:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_1234567890abcdef...
```

### AWS_ACCESS_KEY_ID
**Required:** For AWS S3 storage
**Description:** AWS IAM access key ID

**How to get:**
1. AWS Console → IAM → Users → Security Credentials
2. Create access key
3. Download/save credentials

**Example:**
```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
```

### AWS_SECRET_ACCESS_KEY
**Required:** For AWS S3 storage
**Description:** AWS IAM secret access key

**Example:**
```bash
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### AWS_S3_BUCKET
**Required:** For AWS S3 storage
**Description:** S3 bucket name for file uploads

**Example:**
```bash
AWS_S3_BUCKET=blackroad-uploads-production
```

### AWS_REGION
**Required:** For AWS S3 storage
**Default:** `us-east-1`
**Description:** AWS region for S3 bucket

**Example:**
```bash
AWS_REGION=us-east-1
```

---

## Infrastructure

### CF_API_TOKEN
**Required:** For Cloudflare automation
**Description:** Cloudflare API token for DNS/cache management

**How to get:**
1. Cloudflare dashboard → My Profile → API Tokens
2. Create token with "Zone.DNS" edit permissions
3. Copy token

**Where to set:**
- **GitHub Actions:** As secret `CF_API_TOKEN`
- **Local:** Export when running DNS scripts

**Example:**
```bash
CF_API_TOKEN=your-cloudflare-api-token
```

### CF_ZONE_ID
**Required:** For Cloudflare automation
**Description:** Cloudflare zone ID for a specific domain

**How to get:**
1. Cloudflare dashboard → Select domain
2. Overview page → Right sidebar → Zone ID

**Where to set:**
- **GitHub Actions:** As secret `CF_ZONE_ID`
- **records.yaml:** In domain configuration

**Example:**
```bash
CF_ZONE_ID=1234567890abcdef1234567890abcdef
```

### RAILWAY_TOKEN
**Required:** For Railway CLI/CI deployments
**Description:** Railway API token for deployments

**How to get:**
```bash
railway login
railway tokens create
```

**Where to set:**
- **GitHub Actions:** As secret `RAILWAY_TOKEN`
- **Local:** Export when using Railway CLI

**Example:**
```bash
RAILWAY_TOKEN=your-railway-api-token
```

### RAILWAY_SERVICE_ID
**Required:** For specific service deployments
**Description:** Railway service ID to deploy to

**How to get:**
1. Railway dashboard → Service → Settings
2. Copy Service ID

**Where to set:**
- **GitHub Actions:** As repository variable

**Example:**
```bash
RAILWAY_SERVICE_ID=abc123def456
```

---

## Deployment

### SENTRY_DSN
**Required:** For error monitoring
**Description:** Sentry Data Source Name for error tracking

**How to get:**
1. Go to https://sentry.io
2. Create new project
3. Copy DSN from project settings

**Example:**
```bash
SENTRY_DSN=https://1234567890abcdef@o123456.ingest.sentry.io/1234567
```

### SENTRY_ENVIRONMENT
**Required:** No (if using SENTRY_DSN)
**Default:** Uses `ENVIRONMENT` value
**Description:** Sentry environment tag

**Example:**
```bash
SENTRY_ENVIRONMENT=production
```

---

## Observability

### LOG_LEVEL
**Required:** No
**Default:** `INFO`
**Valid values:** `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
**Description:** Application logging level

**Recommended:**
- **Production:** `WARNING` or `INFO`
- **Staging:** `INFO` or `DEBUG`
- **Development:** `DEBUG`

**Example:**
```bash
LOG_LEVEL=INFO
```

---

## Where to Set Variables

### Railway (Production & Staging)

1. Go to Railway dashboard → Your project
2. Select service (e.g., `backend`)
3. Go to **Variables** tab
4. Click **New Variable**
5. Enter name and value
6. Click **Add**

**Railway Reference Variables:**
Use `${{ServiceName.VARIABLE}}` to reference values from other services:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

**Shared Variables:**
For variables used across services, use **Shared Variables**:
1. Variables tab → **Shared Variables**
2. Add variable (e.g., `SECRET_KEY`)
3. All services can access

### GitHub Actions

1. Go to repository → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Enter name and value
4. Click **Add secret**

**Required GitHub Secrets:**
- `RAILWAY_TOKEN` - For Railway deployments
- `CF_API_TOKEN` - For DNS automation
- `SENTRY_DSN` - For error monitoring (optional)

**How to use in workflows:**
```yaml
env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Local Development

1. Copy environment template:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `.env` file with your local values:
   ```bash
   nano backend/.env  # or use your preferred editor
   ```

3. The `.env` file is gitignored - safe to add real values

4. FastAPI automatically loads `.env` via `python-dotenv`

**⚠️ Never commit `.env` files to git!**

---

## Security Best Practices

### 1. Secret Generation
- **Always use cryptographically secure random generators**
- Minimum 32 characters for secrets
- Use different secrets per environment

**Good:**
```bash
openssl rand -hex 32
python -c "import secrets; print(secrets.token_hex(32))"
```

**Bad:**
```bash
# Don't use predictable values
SECRET_KEY=password123
SECRET_KEY=my-app-secret
```

### 2. Secret Storage
- ✅ Railway environment variables (encrypted at rest)
- ✅ GitHub Actions secrets (encrypted)
- ✅ `.env` files (gitignored)
- ✅ Password managers (1Password, LastPass, Bitwarden)
- ❌ NEVER commit secrets to git
- ❌ NEVER hardcode in source code
- ❌ NEVER expose in logs or error messages

### 3. Secret Rotation
- Rotate `SECRET_KEY` quarterly
- Rotate API keys after suspected compromise
- Update credentials after team member departure
- Keep backups of old secrets (for rollback)

### 4. Principle of Least Privilege
- Give each service only the permissions it needs
- Use separate database users for different services
- Use read-only API keys where possible
- Limit token scopes (GitHub, Stripe, etc.)

### 5. Verification
Before deploying to production:
- [ ] All required variables are set
- [ ] No placeholder values (e.g., `REPLACE_ME`)
- [ ] Secrets are unique per environment
- [ ] `DEBUG=False` in production
- [ ] CORS origins match production domains
- [ ] Database backups are configured

---

## Quick Start Templates

### Production Railway (backend service)
```bash
# Core
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=[generate-unique-32-char-string]
API_BASE_URL=https://os.blackroad.systems
FRONTEND_URL=https://os.blackroad.systems
ALLOWED_ORIGINS=https://os.blackroad.systems,https://blackroad.ai

# Database (auto-injected by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_ASYNC_URL=${{Postgres.DATABASE_URL_ASYNC}}
REDIS_URL=${{Redis.REDIS_URL}}

# Auth
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
WALLET_MASTER_KEY=[generate-unique-32-char-string]

# AI (add when ready)
# OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...

# Observability (add when ready)
# SENTRY_DSN=https://...
# LOG_LEVEL=WARNING
```

### Local Development (.env)
```bash
# Core
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=local-dev-secret-key-not-for-production
API_BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# Database (Docker Compose)
DATABASE_URL=postgresql://blackroad:blackroad@localhost:5432/blackroad_dev
DATABASE_ASYNC_URL=postgresql+asyncpg://blackroad:blackroad@localhost:5432/blackroad_dev
REDIS_URL=redis://localhost:6379/0

# Auth
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=30
WALLET_MASTER_KEY=local-dev-wallet-key

# AI (optional - use your own keys)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

### GitHub Actions Secrets
```bash
# Required
RAILWAY_TOKEN=[get-from-railway-cli]
CF_API_TOKEN=[get-from-cloudflare]

# Optional
SENTRY_DSN=[get-from-sentry]
```

---

## Validation Script

Use this script to validate your environment variables:

```bash
#!/bin/bash
# File: scripts/validate_env.sh

set -e

echo "Validating environment variables..."

# Check required variables
REQUIRED_VARS=(
  "ENVIRONMENT"
  "SECRET_KEY"
  "DATABASE_URL"
  "REDIS_URL"
  "API_BASE_URL"
  "FRONTEND_URL"
  "ALLOWED_ORIGINS"
)

MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    MISSING_VARS+=("$VAR")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${MISSING_VARS[@]}"
  exit 1
fi

# Check SECRET_KEY length
if [ ${#SECRET_KEY} -lt 32 ]; then
  echo "❌ SECRET_KEY must be at least 32 characters"
  exit 1
fi

# Check DEBUG in production
if [ "$ENVIRONMENT" = "production" ] && [ "$DEBUG" = "True" ]; then
  echo "⚠️  WARNING: DEBUG=True in production environment!"
  exit 1
fi

echo "✅ Environment variables validated successfully!"
```

**Run before deploy:**
```bash
chmod +x scripts/validate_env.sh
source backend/.env && ./scripts/validate_env.sh
```

---

## Troubleshooting

### Variable Not Loading

**Problem:** Application doesn't see environment variable

**Solutions:**
1. **Railway:** Check service Variables tab - is variable set?
2. **Local:** Is `.env` file in correct location (`backend/.env`)?
3. **Restart:** Restart application after changing variables
4. **Syntax:** Check for typos in variable names

### Database Connection Fails

**Problem:** `DatabaseConnectionError` or similar

**Solutions:**
1. Check `DATABASE_URL` format is correct
2. Railway: Verify Postgres plugin is attached
3. Local: Check Docker Compose is running (`docker-compose ps`)
4. Check database credentials are correct

### CORS Errors

**Problem:** Frontend can't call API (CORS error in browser console)

**Solutions:**
1. Check `ALLOWED_ORIGINS` includes frontend domain
2. Include protocol: `https://` not just `domain.com`
3. No trailing slash: `https://domain.com` not `https://domain.com/`
4. Railway: Wait 1-2 minutes for variable updates to apply

---

**This document is the single source of truth for environment variables. Keep it updated as new variables are added.**

**Where AI meets the open road.** 🛣️
