# Branch Protection Configuration

This document specifies the branch protection rules to be applied to all BlackRoad project repositories.

## Main Branch Protection

**Branch:** `main`

### Settings

**Require Pull Request:**
- ✅ Require a pull request before merging
- Require approvals: **1**
- Dismiss stale pull request approvals when new commits are pushed
- Require review from Code Owners (if CODEOWNERS file exists)

**Status Checks:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

**Required Status Checks:**
- `test (3.11)`
- `test (3.12)`
- `lint`
- `build`
- `security / summary` (allow to fail)

**Restrictions:**
- ✅ Restrict who can push to matching branches
- Allowed to push: **Repository admins only**
- Allowed to bypass: **None** (not even admins)

**Other Rules:**
- ✅ Require linear history (enforce rebase or squash merge)
- ✅ Require deployments to succeed before merging (if applicable)
- ✅ Lock branch (prevent all changes) - **❌ Disabled** (allow normal development)
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

**Enforcement:**
- ✅ Include administrators (admins must follow the same rules)

---

## Development Branch Protection (Optional)

**Branch:** `develop` (if using GitFlow)

### Settings

**Require Pull Request:**
- ✅ Require a pull request before merging
- Require approvals: **1**

**Status Checks:**
- ✅ Require status checks to pass before merging
- Required checks: `test`, `lint`, `build`

**Other Rules:**
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

---

## Tag Protection

**Pattern:** `v*` (all version tags)

### Settings
- ✅ Only repository admins can create tags matching this pattern
- ✅ Only repository admins can delete tags matching this pattern

**Purpose:** Prevent accidental or malicious deletion of release tags

---

## Implementation

### Via GitHub API

Use this script to apply branch protection rules programmatically:

```bash
#!/bin/bash

REPO="blackboxprogramming/blackroad-{PROJECT_KEY}-backend"
BRANCH="main"
TOKEN="${GITHUB_TOKEN}"

curl -X PUT \
  "https://api.github.com/repos/${REPO}/branches/${BRANCH}/protection" \
  -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "test (3.11)",
        "test (3.12)",
        "lint",
        "build"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

### Via GitHub Web UI

1. Go to repository → Settings → Branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Configure settings as specified above
5. Click "Create" or "Save changes"

---

## CODEOWNERS File

Create `.github/CODEOWNERS` to automatically request reviews from specific teams:

```
# Default owners for everything
* @blackboxprogramming/engineering

# Backend code
/backend/ @blackboxprogramming/backend-team

# Frontend code
/frontend/ @blackboxprogramming/frontend-team

# Infrastructure
/ops/ @blackboxprogramming/devops-team
/terraform/ @blackboxprogramming/devops-team
/.github/workflows/ @blackboxprogramming/devops-team

# Documentation
/docs/ @blackboxprogramming/documentation-team
*.md @blackboxprogramming/documentation-team

# Security-sensitive files
/secrets/ @blackboxprogramming/security-team
.env.* @blackboxprogramming/security-team
```

---

## Merge Strategy

**Preferred:** Squash and merge

**Reasoning:**
- Clean, linear history
- Each PR becomes a single commit
- Easy to revert if needed
- Clear attribution

**Alternative:** Rebase and merge (for repos with well-structured commit history)

**Avoid:** Merge commits (creates messy history)

---

## Exceptions

**When to bypass branch protection:**
- **NEVER** for regular development
- Only in absolute emergencies:
  - Critical production bug fix (with manager approval)
  - Security vulnerability patch (with security team approval)
  - Service outage (with on-call engineer approval)

**Process for emergency bypass:**
1. Get approval in #ops or #engineering Slack channel
2. Document reason in channel
3. Make the emergency change
4. Create follow-up PR immediately after to document the change
5. Post-mortem within 24 hours

---

## Monitoring

**Weekly:** Review bypass logs
**Monthly:** Audit branch protection settings across all repos
**Quarterly:** Review and update required status checks

**Tool:** Use GitHub audit log API to track who bypassed protection and why

---

## Related

- [GitHub Actions: CI Workflow](../../github-actions/ci.yml)
- [New Client Kickoff Workflow](../../workflows/new-client-kickoff.md)
- [Pull Request Template](./pull_request_template.md)
