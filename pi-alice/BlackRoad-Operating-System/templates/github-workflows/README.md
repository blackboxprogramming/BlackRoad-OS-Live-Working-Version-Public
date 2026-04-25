# GitHub Workflows Templates

This directory contains **reusable GitHub Actions workflow templates** for BlackRoad OS satellite repositories.

---

## Available Templates

### 1. `deploy.yml` - Railway Deployment

**Purpose**: Automatically deploy to Railway on push to `main`

**Features**:
- Runs tests before deployment
- Deploys to Railway
- Health check after deployment
- Notifications on success/failure

**Setup**:
```bash
# 1. Copy to satellite repo
cp templates/github-workflows/deploy.yml .github/workflows/

# 2. Replace placeholders
# - {SERVICE_NAME}: e.g., "core", "api", "operator"
# - {DOMAIN}: e.g., "core", "api", "operator"

# 3. Add Railway token to GitHub secrets
gh secret set RAILWAY_TOKEN --body "your-railway-token"

# 4. Commit and push
git add .github/workflows/deploy.yml
git commit -m "Add Railway deployment workflow"
git push
```

---

### 2. `test.yml` - Test Suite

**Purpose**: Run tests on every push and pull request

**Features**:
- Runs linting
- Type checking
- Unit tests with coverage
- Build validation
- Environment template validation

**Setup**:
```bash
# Copy to satellite repo
cp templates/github-workflows/test.yml .github/workflows/

# No customization needed
git add .github/workflows/test.yml
git commit -m "Add test workflow"
git push
```

---

### 3. `validate-kernel.yml` - Kernel Validation

**Purpose**: Ensure service correctly implements BlackRoad OS kernel

**Features**:
- Validates kernel directory structure
- Checks for required kernel modules
- Verifies syscall endpoints
- Validates railway.json
- Checks documentation

**Setup**:
```bash
# Copy to satellite repo
cp templates/github-workflows/validate-kernel.yml .github/workflows/

# No customization needed
git add .github/workflows/validate-kernel.yml
git commit -m "Add kernel validation workflow"
git push
```

---

## Quick Start (New Satellite Repo)

To set up all workflows for a new satellite repo:

```bash
# 1. Clone satellite repo
git clone https://github.com/BlackRoad-OS/blackroad-os-{service}
cd blackroad-os-{service}

# 2. Copy all workflows
mkdir -p .github/workflows
cp /path/to/monorepo/templates/github-workflows/*.yml .github/workflows/

# 3. Customize deploy.yml
sed -i 's/{SERVICE_NAME}/core/g' .github/workflows/deploy.yml
sed -i 's/{DOMAIN}/core/g' .github/workflows/deploy.yml

# 4. Add Railway token secret
gh secret set RAILWAY_TOKEN --body "$(railway token)"

# 5. Commit and push
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push
```

---

## Required GitHub Secrets

### For `deploy.yml`

| Secret | Description | How to Get |
|--------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | Run `railway token` in CLI |

### Optional Secrets

| Secret | Description | When Needed |
|--------|-------------|-------------|
| `CODECOV_TOKEN` | Codecov API token | For code coverage reporting |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | For Slack alerts |

---

## Workflow Triggers

### `deploy.yml`
- **Trigger**: Push to `main` branch
- **Manual**: Via workflow_dispatch

### `test.yml`
- **Trigger**: Push to any branch
- **Trigger**: Pull request to `main` or `develop`

### `validate-kernel.yml`
- **Trigger**: Push to `main` or `develop`
- **Trigger**: Pull request to `main`

---

## Customization Guide

### Adding Custom Test Steps

Edit `test.yml`:

```yaml
- name: Run custom tests
  run: npm run test:custom

- name: Integration tests
  run: npm run test:integration
  env:
    DATABASE_URL: postgresql://test:test@localhost:5432/test
```

### Adding Deployment Environments

Edit `deploy.yml`:

```yaml
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: railway up --environment staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: railway up --environment production
```

### Adding Slack Notifications

Add to `deploy.yml`:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production: ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Troubleshooting

### Workflow Not Running

**Cause**: Workflow file not in correct location

**Solution**:
```bash
# Ensure files are in .github/workflows/
ls -la .github/workflows/
```

### Deployment Fails with 401 Error

**Cause**: Invalid or missing `RAILWAY_TOKEN`

**Solution**:
```bash
# Regenerate Railway token
railway token

# Update GitHub secret
gh secret set RAILWAY_TOKEN --body "new-token"
```

### Health Check Always Fails

**Cause**: Service not exposing health endpoint

**Solution**:
```typescript
// Ensure /health endpoint exists
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

### Tests Pass Locally but Fail in CI

**Cause**: Environment differences

**Solution**:
```bash
# Add test environment to .env.example
cp .env.example .env.test

# Update test.yml to use test env
- name: Run tests
  run: npm test
  env:
    NODE_ENV: test
```

---

## Best Practices

1. **Always run tests before deploying**
   - Use `continue-on-error: false` for critical tests

2. **Use health checks**
   - Verify deployment succeeded before marking as complete

3. **Cache dependencies**
   - Speeds up workflow runs significantly

4. **Fail fast**
   - Stop workflow on first failure to save CI minutes

5. **Notify on failures**
   - Set up Slack/email notifications for production deploys

6. **Use matrix builds**
   - Test against multiple Node versions if needed

7. **Separate concerns**
   - Keep test, deploy, and validation workflows separate

---

## References

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Railway CLI Docs**: https://docs.railway.app/develop/cli
- **BlackRoad OS Deployment**: `../docs/RAILWAY_DEPLOYMENT.md`

---

**Last Updated**: 2025-11-20
**Author**: Atlas (Infrastructure Architect)
