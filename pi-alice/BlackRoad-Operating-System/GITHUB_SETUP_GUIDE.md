# 🔧 GitHub Settings & Webhook Setup Guide

> **BlackRoad Operating System - Phase LIVE**
> **Purpose**: Complete guide for configuring GitHub automation and webhooks
> **Last Updated**: 2025-11-18

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Branch Protection Setup](#branch-protection-setup)
3. [Merge Queue Configuration](#merge-queue-configuration)
4. [GitHub Webhook Setup](#github-webhook-setup)
5. [Environment Variables](#environment-variables)
6. [Testing the Setup](#testing-the-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Admin access** to the `blackboxprogramming/BlackRoad-Operating-System` repository
- ✅ **Railway backend deployed** with the webhook endpoint live
- ✅ **GITHUB_WEBHOOK_SECRET** set in Railway environment variables
- ✅ All Phase Q automation workflows merged to `main`

---

## Branch Protection Setup

### 1. Navigate to Branch Protection

1. Go to repository **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Set **Branch name pattern**: `main`

### 2. Configure Protection Rules

Enable the following settings:

#### Required PR Reviews
- [x] **Require a pull request before merging**
- [x] **Require approvals**: 1
- [ ] Dismiss stale pull request approvals when new commits are pushed (optional)
- [ ] Require review from Code Owners (optional, for high-risk changes)
- [x] **Allow specified actors to bypass required pull requests**
  - Add: `github-actions[bot]`, `claude-code[bot]` (for auto-merge)

#### Status Checks
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**

**Required status checks** (select these):
- `Backend Tests` (from `backend-tests.yml`)
- `Frontend Validation` (from `ci.yml` or `frontend-ci-bucketed.yml`)
- `Auto-Merge` (from `auto-merge.yml`)
- `Label PR` (from `label-pr.yml`)
- Other bucketed CI checks as applicable (docs, agents, infra)

#### Other Settings
- [x] **Require conversation resolution before merging**
- [ ] Require signed commits (optional, for security)
- [ ] Require linear history (optional, for clean git history)
- [ ] Include administrators (UNCHECK for emergency overrides)

#### Merge Queue
- [x] **Enable merge queue**
  - **Merge method**: Squash
  - **Build concurrency**: 5
  - **Timeout (minutes)**: 60
  - **Status checks required**: All required checks above

Click **Create** to save the branch protection rule.

---

## Merge Queue Configuration

### 1. Create merge_queue.yml (Optional)

If you want fine-grained control, create `.github/merge_queue.yml`:

```yaml
# Merge Queue Configuration for BlackRoad OS
# Automatically manages PR merging to avoid race conditions

# Merge method (squash, merge, rebase)
merge_method: squash

# Commit message format
merge_commit_message: PR_TITLE
merge_commit_title_pattern: "#%number% %title%"

# Queue behavior
min_entries_to_merge: 0        # Merge immediately when ready
max_entries_to_merge: 5        # Batch up to 5 PRs
merge_timeout_minutes: 60      # Fail if merging takes > 1 hour

# Branch update method
update_method: rebase          # Keep clean history

# Required status checks (must match branch protection)
required_checks:
  - "Backend Tests"
  - "Frontend Validation"
  - "Auto-Merge"
  - "Label PR"
```

**Note**: GitHub merge queue settings in Branch Protection UI take precedence over this file.

### 2. Verify Queue is Active

- Push a test PR to main
- Once approved, it should enter the merge queue
- Check **Insights** → **Merge queue** to see queue status

---

## GitHub Webhook Setup

### 1. Create Webhook Secret

Generate a secure random secret for webhook verification:

```bash
# Option 1: Using openssl
openssl rand -hex 32

# Option 2: Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Option 3: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save this value** - you'll need it for Railway and GitHub.

### 2. Add Secret to Railway

1. Go to Railway dashboard → Your project → Variables
2. Click **+ New Variable**
3. Key: `GITHUB_WEBHOOK_SECRET`
4. Value: (paste the secret from step 1)
5. Click **Add**
6. Restart the service for the change to take effect

### 3. Configure Webhook in GitHub

1. Go to repository **Settings** → **Webhooks**
2. Click **Add webhook**

**Configuration**:

| Field | Value |
|-------|-------|
| **Payload URL** | `https://your-app.railway.app/api/webhooks/github` |
| **Content type** | `application/json` |
| **Secret** | (paste the secret from step 1) |
| **SSL verification** | Enable SSL verification |

**Which events would you like to trigger this webhook?**

- Select **Let me select individual events**
- Check:
  - [x] Pull requests
  - [x] Pull request reviews
  - [x] Pull request review comments
  - [x] Statuses
  - [x] Check runs
  - [x] Check suites

- Uncheck: Issues, Pushes, Releases, etc. (not needed for Phase Q)

- [x] **Active** (ensure webhook is enabled)

Click **Add webhook** to save.

### 4. Test Webhook

1. GitHub will send a `ping` event immediately
2. Check webhook **Recent Deliveries** tab
3. You should see a `ping` event with ✅ green checkmark (200 response)
4. If you see ❌ red X:
   - Check Railway logs for errors
   - Verify the webhook URL is correct
   - Verify the secret matches between Railway and GitHub

**Manual test**:
```bash
curl https://your-app.railway.app/api/webhooks/github/ping
```

Expected response:
```json
{
  "status": "ok",
  "message": "GitHub webhook endpoint is reachable",
  "configured": true
}
```

---

## Environment Variables

### Required in Railway

| Variable | Purpose | How to Generate |
|----------|---------|-----------------|
| `GITHUB_TOKEN` | GitHub API access for automation | Personal Access Token with `repo` scope |
| `GITHUB_WEBHOOK_SECRET` | Webhook signature verification | `openssl rand -hex 32` |
| `DATABASE_URL` | Database connection | Provided by Railway Postgres addon |
| `SECRET_KEY` | JWT signing | `openssl rand -hex 32` |

### Optional but Recommended

| Variable | Purpose |
|----------|---------|
| `SLACK_WEBHOOK_URL` | Slack notifications for PR events |
| `DISCORD_WEBHOOK_URL` | Discord notifications |

### How to Create GitHub Personal Access Token

1. Go to GitHub **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token** → **Generate new token (classic)**
3. **Note**: "BlackRoad OS Automation"
4. **Expiration**: 90 days (or custom)
5. **Scopes**:
   - [x] `repo` (Full control of private repositories)
   - [x] `workflow` (Update GitHub Action workflows)
   - [x] `read:org` (Read org and team membership)
6. Click **Generate token**
7. **Copy the token** immediately (you won't see it again!)
8. Add to Railway as `GITHUB_TOKEN`

---

## Testing the Setup

### 1. Test Auto-Labeling

Create a test PR:

```bash
git checkout -b test/auto-label
echo "# Test" >> docs/test.md
git add docs/test.md
git commit -m "Test auto-labeling"
git push origin test/auto-label
```

Open the PR on GitHub. Within 30 seconds, you should see:
- ✅ `docs` label applied
- ✅ `docs-only` label applied
- ✅ `size-xs` label applied

### 2. Test Auto-Approval

If the PR is docs-only:
- ✅ `docs-bot` should auto-approve within 1 minute
- Check PR timeline for approval event

### 3. Test Auto-Merge

Add the `auto-merge` label manually or enable auto-merge on the PR:

```bash
gh pr merge <PR_NUMBER> --auto --squash
```

After approval, the PR should:
- ✅ Enter merge queue (if enabled)
- ✅ Auto-merge within 5 minutes (soak time)
- ✅ Post a comment confirming auto-merge

### 4. Test Webhook Event Flow

Create a PR, then check Railway logs:

```bash
railway logs --tail 50
```

You should see log entries like:
```
GitHub webhook received: pull_request | Action: opened | PR: #123
GitHub Event: pull_request | Action: opened | PR: #123
```

### 5. Test Prism Console

Visit your deployed app:
```
https://your-app.railway.app/prism
```

You should see:
- ✅ Prism Console UI loads
- ✅ System metrics appear
- ✅ No 404 errors

---

## Troubleshooting

### Webhook Not Receiving Events

**Symptoms**:
- GitHub shows ❌ red X on webhook delivery
- Railway logs show no webhook events

**Fixes**:
1. Verify webhook URL is correct: `https://your-app.railway.app/api/webhooks/github`
2. Check Railway service is running: `railway status`
3. Test endpoint directly:
   ```bash
   curl https://your-app.railway.app/api/webhooks/github/ping
   ```
4. Verify `GITHUB_WEBHOOK_SECRET` is set in Railway
5. Check Railway logs for errors:
   ```bash
   railway logs | grep webhook
   ```

### Webhook Signature Validation Fails

**Symptoms**:
- Railway logs show "Invalid GitHub webhook signature"
- Webhook delivery shows 401 Unauthorized

**Fixes**:
1. Ensure `GITHUB_WEBHOOK_SECRET` matches exactly between GitHub and Railway
2. No extra spaces or newlines in the secret
3. Regenerate secret and update both places:
   ```bash
   openssl rand -hex 32
   ```

### Auto-Merge Not Working

**Symptoms**:
- PRs stay open even after approval
- No auto-merge comment appears

**Checks**:
1. PR has `auto-merge`, `claude-auto`, `docs-only`, or `merge-ready` label
2. PR has at least 1 approval
3. All required checks pass (green ✅)
4. No `do-not-merge`, `wip`, `breaking-change`, or `security` labels
5. Branch protection requires status checks to pass
6. Auto-merge workflow is enabled:
   ```bash
   gh workflow view auto-merge.yml
   ```

### Labels Not Auto-Applying

**Symptoms**:
- PRs don't get labeled automatically
- Manual labeling works fine

**Fixes**:
1. Check Label PR workflow is enabled:
   ```bash
   gh workflow view label-pr.yml
   ```
2. Verify workflow ran successfully:
   ```bash
   gh run list --workflow=label-pr.yml --limit=5
   ```
3. Check workflow logs for errors:
   ```bash
   gh run view <RUN_ID> --log
   ```
4. Ensure `.github/labeler.yml` exists and is valid

### Merge Queue Stuck

**Symptoms**:
- PRs enter queue but don't merge
- Queue shows "pending" for >1 hour

**Fixes**:
1. Check queue status in **Insights** → **Merge queue**
2. Look for failed checks in queued PRs
3. Check if main branch is protected properly
4. Manually remove stuck PR from queue (Admin → bypass)
5. Restart queue by disabling/re-enabling in Branch Protection

### Prism Console 404

**Symptoms**:
- `/prism` returns 404 Not Found
- Logs show "Prism Console mounted at /prism" on startup

**Fixes**:
1. Verify `prism-console/` directory exists in repository
2. Check Dockerfile copies prism-console:
   ```dockerfile
   COPY . .  # Should copy prism-console/ too
   ```
3. Restart Railway service
4. Check Railway build logs for errors

---

## Next Steps After Setup

Once everything is configured:

1. ✅ **Monitor for 1 week**
   - Watch auto-merged PRs
   - Check Prism dashboard daily
   - Review webhook delivery success rate

2. ✅ **Tune Auto-Merge Policy**
   - Adjust soak times based on comfort level
   - Expand to more PR categories (tests-only, scaffolds)
   - Review `AUTO_MERGE_POLICY.md` for tier upgrades

3. ✅ **Set Up Notifications**
   - Add Slack webhook for PR events
   - Configure Discord alerts for failures
   - Set up email digests for auto-merged PRs

4. ✅ **Train Team**
   - Share automation rules with contributors
   - Document label usage (`wip`, `do-not-merge`, etc.)
   - Create runbook for common scenarios

---

## Reference Links

- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- **Merge Queue**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
- **Webhooks**: https://docs.github.com/en/webhooks
- **Railway Docs**: https://docs.railway.app

**Related Docs**:
- `MERGE_QUEUE_PLAN.md` - High-level automation strategy
- `GITHUB_AUTOMATION_RULES.md` - Detailed automation logic
- `AUTO_MERGE_POLICY.md` - Auto-merge tiers and criteria
- `OPERATOR_PR_EVENT_HANDLERS.md` - Webhook event processing

---

**Phase LIVE is ready. Your merge queues are online.** 🚀

---

_Last Updated: 2025-11-18_
_Author: Claude (Phase LIVE Integration)_
