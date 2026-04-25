# BlackRoad OS - CI/CD Automation Guide

**Last Updated:** 2025-11-16
**Status:** ✅ Fully Automated

---

## Overview

BlackRoad OS uses GitHub Actions to automatically test, validate, and deploy code on every push or merge to `main`. This guide explains what runs automatically, what secrets you need, and how to ensure the automation stays active.

---

## What Runs Automatically on Every Push/Merge to Main

### 1. Frontend Safety Net – BlackRoad OS CI
**Workflow:** `.github/workflows/ci.yml`
**Triggers:** Push/PR to `main`, manual dispatch

**What it does:**
- Validates HTML structure (DOCTYPE, tag matching, proper nesting)
- Checks JavaScript syntax (brace/parenthesis matching, function declarations)
- Scans for security issues (eval(), innerHTML with user input, XSS patterns)
- Validates README exists and has adequate content

**Perfect for:** Catching regressions in the single-page UI before design work resumes.

---

### 2. Backend Test Matrix – Backend Tests & API Connectivity
**Workflow:** `.github/workflows/backend-tests.yml`
**Triggers:** Push/PR to `main` or `claude/**` branches, manual dispatch

**What it does:**
- Spins up Postgres 15 and Redis 7 service containers
- Installs backend dependencies from `backend/requirements.txt`
- Creates a test `.env` file with local service URLs
- Runs pytest with coverage reporting (uploads to Codecov)
- Tests API integration availability (GitHub, Railway, Vercel, Stripe, Twilio, Slack, Discord, Sentry, OpenAI, HuggingFace, DigitalOcean)
- Runs code quality checks (Black, isort, Flake8) - soft-fail enabled
- Builds and tests the Docker image
- Displays a summary banner on completion

**Jobs:**
- `test` - Unit tests with coverage
- `api-connectivity` - Third-party API reachability checks
- `lint` - Code quality and linting (continue-on-error: true)
- `docker` - Docker image build verification
- `summary` - Aggregate results banner

---

### 3. Static Site Deployment – Deploy to GitHub Pages
**Workflow:** `.github/workflows/deploy.yml`
**Triggers:** Push to `main`, manual dispatch

**What it does:**
- Copies `backend/static/` content to a `dist/` artifact
- Optionally includes root `index.html` if present
- Configures GitHub Pages environment
- Uploads artifact and deploys to GitHub Pages
- Makes the static frontend accessible at your GitHub Pages URL

**Required Permissions:**
- `contents: read`
- `pages: write`
- `id-token: write`

---

### 4. Secrets/Config Drift Detection – Railway Secrets & Automation Audit
**Workflow:** `.github/workflows/railway-automation.yml`
**Triggers:** Push/PR to `main` or `claude/**` branches, nightly at 6 AM UTC, manual dispatch

**What it does:**
- Runs `scripts/railway/validate_env_template.py`
- Validates that `.env.example` matches `app/app.config.Settings` fields
- Ensures all sensitive keys use placeholder values (not real secrets)
- Checks `railway.toml` and `railway.json` for consistency
- Verifies Dockerfile path and builder settings
- Ensures required environment variables are documented

**Purpose:** Prevents deployment failures caused by missing or misaligned configuration keys.

---

### 5. Railway Backend Deploy – Deploy to Railway
**Workflow:** `.github/workflows/railway-deploy.yml`
**Triggers:** Push to `main`, manual dispatch with environment selection

**What it does:**
- Installs Railway CLI
- Links to your Railway project using `RAILWAY_PROJECT_ID`
- Deploys with `railway up --detach`
- Waits 30 seconds for deployment to complete
- Performs health check against `RAILWAY_DOMAIN/health`
- Sends deployment status notifications to Slack and/or Discord webhooks
- Runs post-deployment API health checks

**Jobs:**
- `deploy` - Main deployment and notifications
- `post-deploy` - Health checks and API validation

---

## How to Keep It Automatic After Every Merge

### 1. Enable Branch Protection Rules for `main`

**Why:** Ensures workflows run and pass before merging, guaranteeing they also run after merge completes.

**Steps:**
1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main` branch
3. Enable **Require status checks to pass before merging**
4. Select required statuses:
   - `Validate HTML & JavaScript` (from ci.yml)
   - `Run Backend Tests` (from backend-tests.yml)
   - `Test API Connectivity` (from backend-tests.yml)
   - `Code Quality & Linting` (from backend-tests.yml)
   - `Build Docker Image` (from backend-tests.yml)
   - `Validate Railway configuration` (from railway-automation.yml)
   - `Deploy to Railway` (from railway-deploy.yml) - optional
5. Enable **Require branches to be up to date before merging**
6. Save changes

**Result:** PRs cannot merge until all required workflows pass, and workflows automatically run on the merged commit.

---

### 2. Populate Required Secrets

**Why:** Deployment workflows need credentials to connect to Railway, send notifications, and upload coverage reports.

**Steps:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following **Repository secrets**:

#### Required for Railway Deployment:
- `RAILWAY_TOKEN` - Your Railway API token (get from [railway.app](https://railway.app) account settings)
- `RAILWAY_PROJECT_ID` - Your Railway project ID (from railway.toml or Railway dashboard)
- `RAILWAY_DOMAIN` - Your Railway deployment domain (e.g., `blackroad-backend.up.railway.app`)

#### Optional for Notifications:
- `SLACK_WEBHOOK_URL` - Slack incoming webhook URL (for deployment notifications)
- `DISCORD_WEBHOOK_URL` - Discord webhook URL (for deployment notifications)

#### Optional for Coverage Reports:
- `CODECOV_TOKEN` - Codecov upload token (if using private repo)

**Note:** Without these secrets, the Railway deploy workflow will skip deployment steps but won't fail. The CI/test workflows will continue to run successfully.

---

### 3. Keep `.env.example` Authoritative

**Why:** The `scripts/railway/validate_env_template.py` script enforces that all configuration keys are documented.

**Best Practices:**
- When adding new config to `app/app.config.Settings`, update `.env.example` with placeholder values
- Use placeholder patterns: `changeme-*`, `your-*`, `placeholder`, `example`, `xxxx`, etc.
- Never commit real secrets to `.env.example`
- The automation will fail if:
  - Required keys are missing from `.env.example`
  - Sensitive keys contain real values (not placeholders)
  - `railway.toml` or `railway.json` are misconfigured

**Validation runs:**
- On every push/PR to `main` or `claude/**` branches
- Nightly at 6 AM UTC
- Can be triggered manually via workflow_dispatch

---

### 4. Use `workflow_dispatch` Only for Reruns

**Why:** All workflows have manual triggers for convenience, but day-to-day operations rely on automatic push triggers.

**When to use manual triggers:**
- Re-running a workflow that flaked due to transient network issues
- Testing workflow changes before pushing to `main`
- Deploying to Railway staging environment (railway-deploy.yml has environment selector)
- Running validation outside of regular push/PR cycle

**When NOT to use:**
- Normal development flow - just push to `main` or open a PR
- Forcing deployments - let the automatic triggers handle it

---

## What Happens After a Merge to Main

Once you merge a PR to `main`, the following happens automatically:

1. **Immediate Validation** (parallel execution):
   - ✅ Frontend HTML/JS/security validation (ci.yml)
   - ✅ Backend tests + API connectivity (backend-tests.yml)
   - ✅ Railway config drift detection (railway-automation.yml)

2. **Static Frontend Deployment**:
   - ✅ GitHub Pages deployment (deploy.yml)
   - Your static site becomes live at your GitHub Pages URL

3. **Backend Deployment**:
   - ✅ Railway deployment (railway-deploy.yml)
   - Backend API becomes live at your Railway domain
   - Health checks verify deployment success
   - Slack/Discord notifications sent (if configured)
   - Post-deployment API health summary

**Timeline:**
- Validation workflows: ~3-5 minutes
- Static deployment: ~1-2 minutes
- Railway deployment: ~5-7 minutes
- **Total: ~10-15 minutes** from merge to full deployment

---

## Workflow Status Badges

Add these to your README.md to show workflow status:

```markdown
![BlackRoad OS CI](https://github.com/blackboxprogramming/BlackRoad-Operating-System/workflows/BlackRoad%20OS%20CI/badge.svg)
![Backend Tests](https://github.com/blackboxprogramming/BlackRoad-Operating-System/workflows/Backend%20Tests%20%26%20API%20Connectivity/badge.svg)
![Railway Deploy](https://github.com/blackboxprogramming/BlackRoad-Operating-System/workflows/Deploy%20to%20Railway/badge.svg)
![Railway Audit](https://github.com/blackboxprogramming/BlackRoad-Operating-System/workflows/Railway%20Secrets%20%26%20Automation%20Audit/badge.svg)
![GitHub Pages](https://github.com/blackboxprogramming/BlackRoad-Operating-System/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
```

---

## Troubleshooting

### Workflow Fails After Merge

**Check:**
1. GitHub Actions tab for error details
2. Ensure all required secrets are populated
3. Verify `.env.example` has all keys from `app/app.config.Settings`
4. Check Railway project is linked correctly
5. Review recent commits for syntax errors

**Common Issues:**
- Missing secrets → Add them in Settings → Secrets
- Config drift → Update `.env.example` with new keys
- Railway token expired → Generate new token and update secret
- Network flake → Re-run workflow manually

### Deployment Succeeds But Site Doesn't Work

**Frontend (GitHub Pages):**
1. Check that `backend/static/index.html` exists
2. Verify GitHub Pages is enabled (Settings → Pages)
3. Wait 1-2 minutes for CDN propagation
4. Check browser console for errors

**Backend (Railway):**
1. Check Railway logs for startup errors
2. Verify environment variables are set in Railway dashboard
3. Test health endpoint: `curl https://YOUR_DOMAIN/health`
4. Check database/Redis connections are configured

### Secrets/Config Validation Fails

**Error:** "Missing keys in .env.example"
- **Fix:** Add the missing keys to `backend/.env.example` with placeholder values

**Error:** "Sensitive keys must use placeholders"
- **Fix:** Replace real values in `.env.example` with `changeme-*` or `your-*` patterns

**Error:** "Railway start command must forward the $PORT value"
- **Fix:** Update `railway.toml` deploy.startCommand to include `$PORT`

---

## Summary

With the automation in place and the guardrails configured:

✅ **Validations** run automatically on every push/PR
✅ **Frontend** deploys to GitHub Pages on every merge to `main`
✅ **Backend** deploys to Railway on every merge to `main`
✅ **Config drift** is detected nightly and on every push
✅ **Notifications** alert your team of deployment status

**You're free to focus on the "fun part" of design knowing the automation has your back.**

---

## Required status checks for main branch  

The `main` branch is protected by a ruleset called `blackroad-os-main`. The following status checks must pass before merging into `main`:  

- BlackRoad OS CI / Validate HTML & JavaScript  
- Backend Tests & API Connectivity / Run Backend Tests  
- Backend Tests & API Connectivity / Test API Connectivity  
- Railway Secrets & Automation Audit / Validate Railway configuration  

These checks ensure that frontend code, backend tests, API connectivity, and Railway configuration are all validated prior to merging into production. You can optionally add more checks later (e.g., Code Quality & Linting, Build Docker Image, Test Summary, Automation summary, Deploy to GitHub Pages / deploy, Deploy to Railway / Deploy to Railway) once they prove stable.  

### Expected merge flow for `main`  

1. Create a feature branch from `main`.  
2. Open a pull request targeting `main`.  
3. Wait for all required status checks to succeed.  
4. Once checks are green and reviews are complete, merge the PR via squash, rebase, or merge commits.

*For questions or issues, check the [GitHub Issues](https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues) or contact the team.*
