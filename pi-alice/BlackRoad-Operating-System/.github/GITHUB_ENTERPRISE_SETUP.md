# GitHub Enterprise Structure
## Repository Organization, Policies, and Workflows

**Version:** 1.0
**Date:** 2025-11-18
**Purpose:** Define GitHub organization structure and best practices

---

## Repository Strategy

### Current State: Monorepo ✅

**Repository**: `blackboxprogramming/BlackRoad-Operating-System`

**Structure**:
```
BlackRoad-Operating-System/
├── backend/               # FastAPI backend
├── blackroad-os/          # Win95 OS frontend
├── docs/                  # Documentation
├── sdk/                   # Python & TypeScript SDKs
│   ├── python/
│   └── typescript/
├── agents/                # Agent specifications
├── cognitive/             # Cognitive architecture
├── blackroad-universe/    # Brand, domains, GTM
├── ops/                   # Operations, domain config
├── infra/                 # Infrastructure configs
└── scripts/               # Automation scripts
```

**Pros**:
- ✅ Single source of truth
- ✅ Atomic commits across frontend/backend
- ✅ Simpler for small teams
- ✅ Easier local development

**Cons**:
- ❌ Larger repo size
- ❌ Harder to scale teams (can't assign granular permissions)
- ❌ All CI runs even if only one component changes (can be mitigated with path filters)

**Recommendation**: **Keep monorepo for Phase 1** (0-12 months), evaluate split in Phase 2 when team grows.

---

### Future State: Multi-Repo (Phase 2+)

**When to split**:
- Team size > 10 engineers
- Need granular access control (different teams own different repos)
- Want independent release cycles (frontend vs backend)

**Proposed Repos**:

1. **blackroad-os-core** - Core OS runtime, identity (PS-SHA∞)
   - Owner: Core team
   - Language: Python, JavaScript
   - Deploy: Railway

2. **blackroad-os-prism-console** - Admin, observability, Prism UI
   - Owner: Frontend team
   - Language: React/TypeScript
   - Deploy: Vercel / GitHub Pages

3. **blackroad-os-operator** - Workers, schedulers, agent orchestration
   - Owner: Backend team
   - Language: Python (Celery/RQ)
   - Deploy: Railway

4. **blackroad-os-api** - Backend API gateway, routing, schemas
   - Owner: Backend team
   - Language: Python (FastAPI)
   - Deploy: Railway

5. **blackroad-os-web** - Pocket OS web interface (frontend)
   - Owner: Frontend team
   - Language: HTML/CSS/JS
   - Deploy: GitHub Pages

6. **blackroad-os-docs** - Codex, specs, standards, whitepapers
   - Owner: Docs team
   - Language: Markdown
   - Deploy: GitHub Pages

---

## GitHub Organization

### Organization Settings

**Name**: `blackroad` (preferred) or keep `blackboxprogramming`

**Teams**:

| Team | Role | Members | Repositories |
|------|------|---------|--------------|
| `@blackroad/core` | Maintain | Alexa + core contributors | All repos (admin) |
| `@blackroad/backend` | Write | Backend engineers | backend, api, operator repos |
| `@blackroad/frontend` | Write | Frontend engineers | web, prism-console repos |
| `@blackroad/docs` | Write | Docs writers, technical writers | docs repo |
| `@blackroad/community` | Triage | External contributors | All (read, can create issues/PRs) |

**Team Sync** (if using external tools):
- Sync with Slack: `#blackroad-core`, `#blackroad-backend`, etc.
- Sync with Discord: Roles mirror GitHub teams

---

## Branch Protection Rules

### `main` Branch (Production)

**Required Settings**:
- ✅ **Require pull request before merging**
  - Required approvals: **1**
  - Dismiss stale reviews: ✅
  - Require review from Code Owners: ✅

- ✅ **Require status checks to pass**
  - Required checks:
    - `CI / lint`
    - `CI / type-check`
    - `CI / test-backend`
    - `CI / build`
  - Require branches to be up to date: ✅

- ✅ **Require conversation resolution before merging**

- ❌ **Do not allow bypassing** (enforce for administrators)

- ❌ **Do not allow force pushes**

- ❌ **Do not allow deletions**

**Linear History**:
- ✅ Require linear history (or use squash merging)

---

### `develop` Branch (If Using GitFlow)

**Optional Settings**:
- ✅ Require pull request
- ✅ Require status checks
- ✅ **Allow force pushes** (for rebasing - use with caution)
- Approvals: 0-1 (more flexible than `main`)

---

### `claude/*` Branches (AI Agent Branches)

**Special Settings**:
- ✅ Allow direct commits (AI agents commit directly)
- ✅ Require status checks to pass
- ❌ No protection rules (temporary branches, auto-deleted after PR merge)

**Naming Convention**:
- `claude/feature-name-{session-id}`
- Session ID ensures unique branch names per AI session

---

## Required Status Checks

### Current Workflows

From `.github/workflows/`:

| Workflow | File | Triggers | Required Checks |
|----------|------|----------|----------------|
| **CI** | `ci.yml` | Push to `main`, PR | `lint`, `type-check`, `build` |
| **Backend Tests** | `backend-tests.yml` | Push to `backend/**`, PR | `test-backend` |
| **Railway Deploy** | `railway-deploy.yml` | Push to `main` | (deployment only, not blocking) |
| **GitHub Pages Deploy** | `deploy.yml` | Push to `main` | (deployment only) |
| **Railway Secrets Audit** | `railway-automation.yml` | Schedule (nightly) | (audit only) |
| **Domain Sync** | `sync-domains.yml` | Manual, schedule | (sync only) |
| **Domain Health** | `domain-health.yml` | Schedule (hourly) | (monitoring only) |

### Adding Checks to Branch Protection

**Via GitHub UI**:
1. Go to Settings → Branches → Branch protection rules
2. Click `main` (or create new)
3. Under "Require status checks to pass before merging":
   - ✅ Require status checks
   - Search and add: `CI / lint`, `CI / type-check`, `CI / test-backend`, `CI / build`
   - ✅ Require branches to be up to date

**Via GitHub API** (automation):

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/blackboxprogramming/BlackRoad-Operating-System/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["CI / lint","CI / type-check","CI / test-backend","CI / build"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null \
  -f required_conversation_resolution=true
```

---

## CODEOWNERS File

**Location**: `.github/CODEOWNERS`

**Already Created**: See `.github/CODEOWNERS` in this repo

**How it Works**:
- When PR changes files, GitHub auto-requests review from owners
- PR can't merge until Code Owner approves (if "Require review from Code Owners" is enabled)

---

## Pull Request Templates

**Location**: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
<!-- Provide a clear description of the changes in this PR -->

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Infrastructure change

## Related Issue
<!-- Link to related issue: Closes #123 -->

## Testing
<!-- Describe how you tested these changes -->
- [ ] Tested locally
- [ ] Added/updated unit tests
- [ ] Added/updated integration tests
- [ ] Tested in staging environment

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Related documentation updated

## Deployment Notes
<!-- Any special steps needed for deployment? -->
```

**Create file**: `.github/PULL_REQUEST_TEMPLATE.md` with above content

---

## Issue Templates

**Location**: `.github/ISSUE_TEMPLATE/`

### 1. Bug Report

**File**: `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug in BlackRoad OS
title: "[BUG] "
labels: bug
assignees: ''
---

## Bug Description
<!-- Clear description of the bug -->

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
<!-- What should happen -->

## Actual Behavior
<!-- What actually happens -->

## Environment
- **BlackRoad OS Version**: [e.g., v0.1.1]
- **Browser**: [e.g., Chrome 120, Safari 17]
- **OS**: [e.g., macOS 14, Windows 11, iOS 17]
- **Device**: [e.g., Desktop, iPhone 15]

## Screenshots
<!-- If applicable, add screenshots -->

## Additional Context
<!-- Any other context about the problem -->

## Possible Solution
<!-- Optional: suggest a fix if you have ideas -->
```

### 2. Feature Request

**File**: `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest a new feature for BlackRoad OS
title: "[FEATURE] "
labels: enhancement
assignees: ''
---

## Feature Description
<!-- Clear description of the feature you want -->

## Problem Statement
<!-- What problem does this solve? Why is it needed? -->

## Proposed Solution
<!-- How should this feature work? -->

## Alternatives Considered
<!-- What other solutions have you thought about? -->

## Additional Context
<!-- Mockups, examples, links, etc. -->

## Acceptance Criteria
<!-- How will we know this feature is complete? -->
- [ ] Criterion 1
- [ ] Criterion 2
```

### 3. Documentation

**File**: `.github/ISSUE_TEMPLATE/documentation.md`

```markdown
---
name: Documentation
about: Suggest documentation improvements
title: "[DOCS] "
labels: documentation
assignees: ''
---

## Documentation Issue
<!-- What's missing, unclear, or incorrect in the docs? -->

## Affected Pages/Sections
<!-- Link to the docs that need updating -->

## Suggested Changes
<!-- What should be added/changed? -->

## Additional Context
<!-- Any examples, screenshots, or references -->
```

**Create these files** in `.github/ISSUE_TEMPLATE/`

---

## Project Boards

### Org-Level Project Board

**Name**: "BlackRoad OS Roadmap"

**View Type**: Board

**Columns**:

| Column | Description | Automation |
|--------|-------------|------------|
| 📋 Backlog | All new issues, not yet prioritized | Auto-add: new issues |
| 🎯 Phase 1 (Prove the OS) | Q1-Q4 deliverables | Auto-add: label `Phase 1` |
| 🚀 Phase 2 (Expand Intelligence) | Q5-Q6 deliverables | Auto-add: label `Phase 2` |
| 🌍 Phase 3 (Ecosystem) | Q7-Q8 deliverables | Auto-add: label `Phase 3` |
| 🏃 In Progress | Currently being worked on | Auto-add: assigned + status `in progress` |
| 👀 In Review | PR submitted, awaiting review | Auto-add: PR opened |
| ✅ Done | Completed | Auto-add: PR merged, issue closed |

**Automation Rules**:
- Issue created → add to "Backlog"
- Issue labeled `Phase 1` → move to "Phase 1" column
- Issue assigned → move to "In Progress"
- PR opened → move to "In Review"
- PR merged → move to "Done"
- Issue closed → move to "Done"

**Create via GitHub UI**:
1. Go to Organization → Projects → New project
2. Choose "Board" template
3. Add columns above
4. Configure automation (Settings → Workflows)

---

## Labels

**Standard Labels** (auto-created by GitHub):

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | Red | Something isn't working |
| `documentation` | Blue | Improvements or additions to documentation |
| `duplicate` | Gray | This issue or PR already exists |
| `enhancement` | Green | New feature or request |
| `good first issue` | Purple | Good for newcomers |
| `help wanted` | Orange | Extra attention is needed |
| `invalid` | Gray | This doesn't seem right |
| `question` | Pink | Further information is requested |
| `wontfix` | White | This will not be worked on |

**Custom Labels** (add these):

| Label | Color | Description |
|-------|-------|-------------|
| `Phase 1` | `#0E8A16` | Phase 1: Prove the OS (Months 0-12) |
| `Phase 2` | `#1D76DB` | Phase 2: Expand Intelligence (Months 12-18) |
| `Phase 3` | `#5319E7` | Phase 3: Ecosystem (Months 18-24+) |
| `backend` | `#D93F0B` | Backend (FastAPI, Python) |
| `frontend` | `#FBCA04` | Frontend (OS, UI, JavaScript) |
| `infrastructure` | `#0052CC` | Infrastructure, DevOps, CI/CD |
| `agent` | `#C5DEF5` | Agent-related (Prism, Lucidia, Operator) |
| `security` | `#B60205` | Security issue or enhancement |
| `performance` | `#D4C5F9` | Performance improvement |
| `breaking-change` | `#D93F0B` | Breaking change (major version bump) |

**Create via GitHub UI**: Settings → Labels → New label

---

## Recommended Workflow Additions

### 1. PR Labeler

**File**: `.github/workflows/pr-labeler.yml`

```yaml
name: PR Labeler
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

**Config**: `.github/labeler.yml`

```yaml
backend:
  - backend/**/*

frontend:
  - blackroad-os/**/*
  - backend/static/**/*

infrastructure:
  - .github/**/*
  - scripts/**/*
  - ops/**/*
  - infra/**/*
  - railway.*
  - docker-compose.yml

documentation:
  - docs/**/*
  - '**/*.md'

agent:
  - agents/**/*
  - blackroad-universe/prompts/**/*
```

### 2. Dependabot

**File**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Backend Python dependencies
  - package-ecosystem: "pip"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "backend"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "infrastructure"

  # Docker
  - package-ecosystem: "docker"
    directory: "/backend"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "infrastructure"
```

### 3. CodeQL Security Scanning

**File**: `.github/workflows/codeql.yml`

```yaml
name: CodeQL Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Monday 6am

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read

    strategy:
      matrix:
        language: ['python', 'javascript']

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

### 4. Release Automation

**File**: `.github/workflows/release.yml`

```yaml
name: Create Release
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        run: |
          CHANGELOG=$(git log --pretty=format:"- %s (%h)" $(git describe --tags --abbrev=0 HEAD^)..HEAD)
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes in this Release
            ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
```

---

## Best Practices

### Commit Messages

**Format**: Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(backend): add Prism job queue API endpoint

Implemented /api/prism/jobs endpoint with pagination,
filtering, and sorting. Connects to PostgreSQL for
persistent storage.

Closes #123
```

```
fix(os): resolve window z-index bug on minimize

Windows were not maintaining correct z-order after
minimize/restore. Fixed by tracking z-index state
in window manager.

Fixes #456
```

### PR Size

**Recommendations**:
- **Small PRs**: < 200 lines changed (ideal)
- **Medium PRs**: 200-500 lines (acceptable)
- **Large PRs**: > 500 lines (break into smaller PRs if possible)

**Exceptions**:
- Auto-generated code
- Third-party library updates
- Large refactors (clearly communicate scope)

### Code Review Process

1. **Author**: Create PR, self-review, request reviewers
2. **Reviewers**: Review within 24 hours (business days)
3. **Author**: Address feedback, update PR
4. **Reviewers**: Approve or request changes
5. **Author**: Merge (or auto-merge if approved + CI passes)

**Review Checklist**:
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No obvious bugs or security issues
- [ ] Commit messages are clear

---

## Security

### Secret Scanning

GitHub automatically scans for exposed secrets. Ensure:
- ✅ Secret scanning enabled (default for public repos)
- ✅ Push protection enabled (blocks commits with secrets)

### Dependency Scanning

- ✅ Dependabot alerts enabled
- ✅ Weekly dependency updates (via Dependabot)

### Vulnerability Alerts

GitHub sends alerts for known vulnerabilities. Ensure:
- ✅ Alerts enabled (Settings → Security → Vulnerability alerts)
- ✅ Team notified via email/Slack

---

## Maintenance

**Weekly**:
- Review open PRs (ensure < 5 open)
- Review open issues (triage, label, prioritize)
- Merge Dependabot PRs (if CI passes)

**Monthly**:
- Review project board (move stale items)
- Review labels (add/remove as needed)
- Audit branch protection rules

**Quarterly**:
- Review team permissions
- Audit CODEOWNERS (update as team changes)
- Review workflows (optimize, remove unused)

---

**This structure ensures a well-organized, scalable GitHub setup for BlackRoad OS.**
