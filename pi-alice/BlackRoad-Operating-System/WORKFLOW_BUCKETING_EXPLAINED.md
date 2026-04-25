# ⚡ WORKFLOW BUCKETING EXPLAINED

> **BlackRoad Operating System — Phase Q**
> **Purpose**: Module-specific CI for faster, cheaper builds
> **Owner**: Operator Alexa (Cadillac)
> **Last Updated**: 2025-11-18

---

## What is Workflow Bucketing?

**Workflow Bucketing** is the practice of splitting a monolithic CI pipeline into **module-specific workflows** that only run when relevant files change.

### Before Bucketing (Monolithic CI)

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]

jobs:
  test-everything:
    runs-on: ubuntu-latest
    steps:
      - Backend tests (5 min)
      - Frontend tests (3 min)
      - Agent tests (2 min)
      - Docs linting (1 min)
      - Infra validation (2 min)
      # Total: 13 minutes PER PR
```

**Problems**:
- 📝 Docs-only PR runs backend tests (unnecessary)
- 🎨 Frontend PR runs agent tests (waste of time)
- 💰 Every PR costs 13 CI minutes (expensive)
- ⏱️ Slow feedback (wait for irrelevant tests)

### After Bucketing (Module-Specific CI)

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI
on:
  pull_request:
    paths: ['backend/**']  # Only run when backend changes

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - Backend tests (5 min)
      # Total: 5 minutes for backend PRs
```

```yaml
# .github/workflows/docs-ci.yml
name: Docs CI
on:
  pull_request:
    paths: ['docs/**', '*.md']  # Only run when docs change

jobs:
  lint-docs:
    runs-on: ubuntu-latest
    steps:
      - Docs linting (1 min)
      # Total: 1 minute for docs PRs
```

**Benefits**:
- ⚡ **3-5x faster** CI (only relevant tests run)
- 💰 **60% cost reduction** (fewer wasted minutes)
- 🎯 **Targeted feedback** (see relevant results first)
- 🔄 **Parallel execution** (multiple buckets run simultaneously)

---

## BlackRoad Workflow Buckets

### Bucket 1: Backend CI

**File**: `.github/workflows/backend-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'backend/**'
      - 'requirements.txt'
      - 'Dockerfile'
      - 'docker-compose.yml'
  push:
    branches: [main]
    paths:
      - 'backend/**'
```

**Jobs**:
- Install Python dependencies
- Run pytest with coverage
- Type checking (mypy)
- Linting (flake8, black)
- Security scan (bandit)

**Duration**: ~5 minutes

**When it runs**:
- ✅ Backend code changes
- ✅ Dependency changes
- ✅ Docker changes
- ❌ Frontend-only changes
- ❌ Docs-only changes

---

### Bucket 2: Frontend CI

**File**: `.github/workflows/frontend-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'blackroad-os/**'
      - 'backend/static/**'
  push:
    branches: [main]
    paths:
      - 'blackroad-os/**'
      - 'backend/static/**'
```

**Jobs**:
- HTML validation
- JavaScript syntax checking
- CSS linting
- Accessibility checks (WCAG 2.1)
- Security scan (XSS, innerHTML)

**Duration**: ~3 minutes

**When it runs**:
- ✅ Frontend JS/CSS/HTML changes
- ✅ Static asset changes
- ❌ Backend-only changes
- ❌ Docs-only changes

---

### Bucket 3: Agents CI

**File**: `.github/workflows/agents-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'agents/**'
  push:
    branches: [main]
    paths:
      - 'agents/**'
```

**Jobs**:
- Run agent tests
- Validate agent templates
- Check agent registry
- Lint agent code

**Duration**: ~2 minutes

**When it runs**:
- ✅ Agent code changes
- ✅ Agent template changes
- ❌ Non-agent changes

---

### Bucket 4: Docs CI

**File**: `.github/workflows/docs-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'docs/**'
      - '*.md'
      - 'README.*'
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '*.md'
```

**Jobs**:
- Markdown linting
- Link checking
- Spell checking (optional)
- Documentation structure validation

**Duration**: ~1 minute

**When it runs**:
- ✅ Documentation changes
- ✅ README updates
- ❌ Code changes (unless docs also change)

---

### Bucket 5: Infrastructure CI

**File**: `.github/workflows/infra-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'infra/**'
      - 'ops/**'
      - '.github/**'
      - 'railway.toml'
      - 'railway.json'
      - '*.toml'
      - '*.json'
  push:
    branches: [main]
    paths:
      - 'infra/**'
      - '.github/**'
```

**Jobs**:
- Validate YAML/TOML/JSON
- Check workflow syntax
- Terraform plan (if applicable)
- Ansible lint (if applicable)
- Configuration validation

**Duration**: ~2 minutes

**When it runs**:
- ✅ Workflow changes
- ✅ Infrastructure config changes
- ✅ Deployment config changes
- ❌ Application code changes

---

### Bucket 6: SDK CI

**File**: `.github/workflows/sdk-ci.yml`

**Triggers**:
```yaml
on:
  pull_request:
    paths:
      - 'sdk/**'
  push:
    branches: [main]
    paths:
      - 'sdk/**'
```

**Jobs**:
- **Python SDK**:
  - Run pytest
  - Type checking
  - Build package
- **TypeScript SDK**:
  - Run jest tests
  - Build ESM/CJS bundles
  - Type checking

**Duration**: ~4 minutes

**When it runs**:
- ✅ SDK code changes
- ❌ Main application changes

---

## Path-Based Triggering

### How it Works

GitHub Actions supports path filtering:

```yaml
on:
  pull_request:
    paths:
      - 'backend/**'           # All files in backend/
      - '!backend/README.md'   # Except backend README
      - 'requirements.txt'     # Specific file
      - '**/*.py'              # All Python files anywhere
```

**Operators**:
- `**` — Match any number of directories
- `*` — Match any characters except `/`
- `!` — Negation (exclude pattern)

### Path Patterns by Bucket

**Backend**:
```yaml
paths:
  - 'backend/**'
  - 'requirements.txt'
  - 'Dockerfile'
  - 'docker-compose.yml'
```

**Frontend**:
```yaml
paths:
  - 'blackroad-os/**'
  - 'backend/static/**'
```

**Agents**:
```yaml
paths:
  - 'agents/**'
```

**Docs**:
```yaml
paths:
  - 'docs/**'
  - '*.md'
  - 'README.*'
  - '!backend/README.md'  # Exclude backend README (triggers backend CI)
```

**Infrastructure**:
```yaml
paths:
  - 'infra/**'
  - 'ops/**'
  - '.github/**'
  - '*.toml'
  - '*.json'
  - '!package.json'  # Exclude package.json (triggers SDK CI)
```

**SDK**:
```yaml
paths:
  - 'sdk/python/**'
  - 'sdk/typescript/**'
```

---

## Multi-Module PRs

### What if a PR changes multiple modules?

**Example**: PR changes both backend and frontend

**Result**: Both workflows run

```
PR #123: Add user profile page
- backend/app/routers/profile.py
- blackroad-os/js/apps/profile.js

Workflows triggered:
✅ backend-ci.yml (5 min)
✅ frontend-ci.yml (3 min)
Total: 8 min (runs in parallel)
```

**Without bucketing**:
- Would run 13-minute monolithic CI
- Savings: 5 minutes (38% faster)

### Overlapping Changes

**Example**: PR changes docs in backend README

```
PR #124: Update backend README
- backend/README.md

Workflows triggered:
✅ backend-ci.yml (backend/** matches)
✅ docs-ci.yml (*.md matches)
```

**Solution**: Use negation to exclude overlaps

```yaml
# docs-ci.yml
paths:
  - 'docs/**'
  - '*.md'
  - '!backend/README.md'  # Let backend CI handle this
  - '!sdk/python/README.md'  # Let SDK CI handle this
```

**Result**: Only `backend-ci.yml` runs

---

## Cost Savings Analysis

### Assumptions

- **PRs per day**: 50
- **Distribution**:
  - 30% docs-only
  - 20% backend-only
  - 15% frontend-only
  - 10% agents-only
  - 10% infra-only
  - 15% multi-module

### Before Bucketing

| PR Type | Count | CI Time | Total Time |
|---------|-------|---------|------------|
| Docs | 15 | 13 min | 195 min |
| Backend | 10 | 13 min | 130 min |
| Frontend | 7.5 | 13 min | 97.5 min |
| Agents | 5 | 13 min | 65 min |
| Infra | 5 | 13 min | 65 min |
| Multi | 7.5 | 13 min | 97.5 min |
| **Total** | **50** | — | **650 min/day** |

**Monthly cost**: 650 min/day × 30 days = **19,500 minutes**

### After Bucketing

| PR Type | Count | CI Time | Total Time |
|---------|-------|---------|------------|
| Docs | 15 | 1 min | 15 min |
| Backend | 10 | 5 min | 50 min |
| Frontend | 7.5 | 3 min | 22.5 min |
| Agents | 5 | 2 min | 10 min |
| Infra | 5 | 2 min | 10 min |
| Multi | 7.5 | 8 min | 60 min |
| **Total** | **50** | — | **167.5 min/day** |

**Monthly cost**: 167.5 min/day × 30 days = **5,025 minutes**

**Savings**: 19,500 - 5,025 = **14,475 minutes/month** (74% reduction)

**Dollar Savings** (at $0.008/min for GitHub Actions):
- Before: $156/month
- After: $40/month
- **Savings: $116/month**

---

## Implementation Best Practices

### 1. Overlapping Paths

**Problem**: Some paths trigger multiple workflows

**Solution**: Use negation to assign ownership

```yaml
# docs-ci.yml - Only general docs
paths:
  - 'docs/**'
  - '*.md'
  - '!backend/**/*.md'
  - '!sdk/**/*.md'

# backend-ci.yml - Backend + backend docs
paths:
  - 'backend/**'  # Includes backend/**/*.md
```

### 2. Shared Dependencies

**Problem**: `requirements.txt` affects backend, agents, SDK

**Solution**: Trigger all affected buckets

```yaml
# backend-ci.yml
paths:
  - 'backend/**'
  - 'requirements.txt'

# agents-ci.yml
paths:
  - 'agents/**'
  - 'requirements.txt'

# sdk-ci.yml
paths:
  - 'sdk/python/**'
  - 'requirements.txt'
```

### 3. Global Files

**Problem**: `.gitignore`, `LICENSE`, `.env.example` don't fit in buckets

**Solution**: Create a separate "meta" workflow (or skip CI)

```yaml
# meta-ci.yml (optional)
on:
  pull_request:
    paths:
      - '.gitignore'
      - 'LICENSE'
      - '.env.example'

jobs:
  validate-meta:
    runs-on: ubuntu-latest
    steps:
      - name: Validate .env.example
        run: python scripts/validate_env.py
```

**Alternative**: Docs-only changes (like LICENSE) can skip CI entirely

### 4. Required Checks

**Problem**: Branch protection requires specific check names

**Solution**: Make bucket names consistent

```yaml
# backend-ci.yml
jobs:
  test:  # Always call it 'test'
    name: Backend Tests  # Display name

# frontend-ci.yml
jobs:
  test:  # Same job name
    name: Frontend Tests  # Different display name
```

**Branch protection**:
```
Required status checks:
- Backend Tests
- Frontend Tests
- Security Scan
```

**Smart behavior**: Only require checks that ran (based on paths)

---

## Parallel Execution

### How Parallelism Works

GitHub Actions runs workflows **in parallel** by default.

**Example**: PR changes backend + frontend

```
PR opened at 14:00:00
├─> backend-ci.yml starts at 14:00:05 (5 min duration)
└─> frontend-ci.yml starts at 14:00:06 (3 min duration)

Both finish by 14:05:06 (5 min total wall time)
```

**Without parallelism**: 5 min + 3 min = 8 min

**With parallelism**: max(5 min, 3 min) = 5 min

**Time savings**: 37.5%

### Matrix Strategies

For even more parallelism:

```yaml
# backend-ci.yml
jobs:
  test:
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pytest
```

**Result**: 3 jobs run in parallel (Python 3.10, 3.11, 3.12)

---

## Monitoring & Metrics

### Track Workflow Performance

**Metrics to monitor**:
- Average CI time per bucket
- Failure rate per bucket
- Cost per bucket (CI minutes used)
- Coverage of path patterns (any PRs skipping CI?)

**Tools**:
- GitHub Actions usage reports
- Prism Console metrics dashboard
- Custom analytics (log workflow runs to database)

### Optimize Slow Buckets

**If backend-ci.yml is slow (> 10 min)**:
- Split into smaller jobs (lint, test, type-check in parallel)
- Cache dependencies aggressively
- Use matrix to parallelize tests
- Remove redundant checks

**Example**:
```yaml
# Before: Sequential (10 min total)
jobs:
  test-backend:
    steps:
      - Install deps (2 min)
      - Lint (2 min)
      - Type check (2 min)
      - Tests (4 min)

# After: Parallel (4 min total)
jobs:
  lint:
    steps:
      - Install deps (2 min)
      - Lint (2 min)
  type-check:
    steps:
      - Install deps (2 min)
      - Type check (2 min)
  test:
    steps:
      - Install deps (2 min)
      - Tests (4 min)
```

---

## Migration from Monolithic CI

### Step 1: Analyze Current CI

**Questions**:
- Which tests take longest?
- Which tests fail most often?
- What are logical module boundaries?

### Step 2: Create Buckets

Start with obvious buckets:
- Backend
- Frontend
- Docs

### Step 3: Run in Parallel (Validation)

Run both monolithic CI and bucketed CI:

```yaml
# ci.yml (keep existing)
name: CI (Legacy)
on: [pull_request]

# backend-ci.yml (new)
name: Backend CI
on:
  pull_request:
    paths: ['backend/**']
```

**Compare results**:
- Do both pass/fail consistently?
- Is bucketed CI faster?
- Are there gaps (PRs that skip CI)?

### Step 4: Migrate Branch Protection

Update required checks:

```
Before:
- CI (Legacy)

After:
- Backend Tests
- Frontend Tests
- Docs Lint
```

### Step 5: Remove Monolithic CI

Once confident, delete `ci.yml`

---

## Summary

**Workflow Bucketing** achieves:

- ⚡ **3-5x faster CI** (only relevant tests run)
- 💰 **74% cost reduction** (fewer CI minutes)
- 🎯 **Targeted feedback** (see results faster)
- 🔄 **Parallel execution** (multiple buckets simultaneously)
- 📊 **Better metrics** (per-module failure rates)

**Implementation**:
- Define module boundaries (backend, frontend, agents, docs, infra, SDK)
- Create workflow per module with path filters
- Handle overlaps with negation
- Monitor and optimize slow buckets

**Result**: **Faster, cheaper, smarter CI pipeline**

---

**Last Updated**: 2025-11-18
**Owner**: Operator Alexa (Cadillac)
**Related Docs**: `MERGE_QUEUE_PLAN.md`, `GITHUB_AUTOMATION_RULES.md`
