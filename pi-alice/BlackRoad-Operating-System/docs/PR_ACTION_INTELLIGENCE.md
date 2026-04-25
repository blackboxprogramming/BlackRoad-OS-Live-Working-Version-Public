# PR Action Intelligence System

**Phase Q2 - Autonomous GitHub PR Management**

---

## Overview

The PR Action Intelligence System is BlackRoad OS's autonomous GitHub automation layer that eliminates manual PR interactions. Instead of clicking buttons like "Update Branch," "Commit Suggestion," or "Rerun Checks," these actions are intelligently queued, prioritized, and executed by the Operator Engine.

## Architecture

```
┌─────────────────────────────────────────┐
│         GitHub PR Interface             │
│  (Comments, Reviews, Checks, Labels)    │
└─────────────────┬───────────────────────┘
                  │ Webhooks
                  ↓
┌─────────────────────────────────────────┐
│      GitHub Webhook Handler             │
│  (operator_engine/github_webhooks.py)   │
└─────────────────┬───────────────────────┘
                  │ Event Normalization
                  ↓
┌─────────────────────────────────────────┐
│        PR Action Queue                  │
│  (operator_engine/pr_actions/)          │
│  - Prioritization                       │
│  - Deduplication                        │
│  - Rate Limiting                        │
│  - Retry Logic                          │
└─────────────────┬───────────────────────┘
                  │ Action Execution
                  ↓
┌─────────────────────────────────────────┐
│         Action Handlers                 │
│  - resolve_comment.py                   │
│  - commit_suggestion.py                 │
│  - update_branch.py                     │
│  - rerun_checks.py                      │
│  - open_issue.py                        │
│  - add_label.py                         │
│  - merge_pr.py                          │
└─────────────────┬───────────────────────┘
                  │ GitHub API Calls
                  ↓
┌─────────────────────────────────────────┐
│         GitHub API Client               │
│  (operator_engine/github_client.py)     │
└─────────────────────────────────────────┘
```

## Components

### 1. GitHub Webhook Handler

**File**: `operator_engine/github_webhooks.py`

Receives GitHub webhook events and maps them to PR actions.

**Supported Events**:
- `pull_request` - PR opened, synchronized, labeled, etc.
- `pull_request_review` - Review submitted
- `pull_request_review_comment` - Review comment created
- `issue_comment` - Comment on PR
- `check_suite` - Check suite completed
- `check_run` - Individual check completed
- `workflow_run` - Workflow completed

**Event Mapping**:
```python
# Example: PR labeled with "claude-auto"
Event: pull_request.labeled
→ Action: ADD_TO_MERGE_QUEUE
→ Priority: HIGH
→ Triggered by: webhook:labeled:claude-auto
```

### 2. PR Action Queue

**File**: `operator_engine/pr_actions/action_queue.py`

Priority-based queue with intelligent action management.

**Features**:
- **Priority-based execution** - Critical actions (security, hotfixes) first
- **Deduplication** - Identical actions are merged
- **Rate limiting** - Max 10 actions per repo per minute
- **Automatic retry** - Exponential backoff (2s, 4s, 8s)
- **Concurrent workers** - 5 workers processing actions in parallel

**Queue States**:
- `QUEUED` - Waiting for execution
- `PROCESSING` - Currently being executed
- `COMPLETED` - Successfully completed
- `FAILED` - Failed after max retries
- `CANCELLED` - Manually cancelled
- `RETRYING` - Retrying after failure

### 3. Action Types

**File**: `operator_engine/pr_actions/action_types.py`

Defines all possible PR actions.

**Action Categories**:

**Comment Actions**:
- `RESOLVE_COMMENT` - Mark a comment thread as resolved
- `CREATE_COMMENT` - Add a comment to PR
- `EDIT_COMMENT` - Edit existing comment
- `DELETE_COMMENT` - Delete a comment

**Code Suggestion Actions**:
- `APPLY_SUGGESTION` - Apply a single code suggestion
- `COMMIT_SUGGESTION` - Commit a suggestion with custom message
- `BATCH_SUGGESTIONS` - Apply multiple suggestions at once

**Branch Actions**:
- `UPDATE_BRANCH` - Merge base branch into PR branch
- `REBASE_BRANCH` - Rebase PR branch on base branch
- `SQUASH_COMMITS` - Squash commits in PR

**Check Actions**:
- `RERUN_CHECKS` - Rerun all CI/CD checks
- `RERUN_FAILED_CHECKS` - Rerun only failed checks
- `SKIP_CHECKS` - Skip checks (admin only)

**Review Actions**:
- `REQUEST_REVIEW` - Request review from user/team
- `APPROVE_PR` - Approve the PR
- `REQUEST_CHANGES` - Request changes
- `DISMISS_REVIEW` - Dismiss a review

**Label Actions**:
- `ADD_LABEL` - Add labels to PR
- `REMOVE_LABEL` - Remove labels from PR
- `SYNC_LABELS` - Auto-sync labels based on file changes

**Merge Actions**:
- `MERGE_PR` - Merge PR (default method)
- `SQUASH_MERGE` - Squash and merge
- `REBASE_MERGE` - Rebase and merge
- `ADD_TO_MERGE_QUEUE` - Add PR to merge queue
- `REMOVE_FROM_MERGE_QUEUE` - Remove PR from merge queue

**Issue Actions**:
- `OPEN_ISSUE` - Create a new issue
- `CLOSE_ISSUE` - Close an issue
- `LINK_ISSUE` - Link issue to PR

### 4. Action Handlers

**Directory**: `operator_engine/pr_actions/handlers/`

Each handler implements the logic for a specific action type.

**Base Handler Pattern**:
```python
class BaseHandler(ABC):
    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """Execute the action"""
        pass

    async def validate(self, action: PRAction) -> bool:
        """Validate before execution"""
        pass

    async def get_github_client(self):
        """Get authenticated GitHub client"""
        pass
```

**Example Handler: Update Branch**
```python
# File: handlers/update_branch.py

async def execute(self, action: PRAction) -> Dict[str, Any]:
    gh = await self.get_github_client()

    # Get PR details
    pr = await gh.get_pull_request(
        action.repo_owner, action.repo_name, action.pr_number
    )

    # Check if branch is behind
    is_behind = await gh.is_branch_behind(
        action.repo_owner, action.repo_name,
        pr["head"]["ref"], pr["base"]["ref"]
    )

    if not is_behind:
        return {"updated": False, "reason": "already_up_to_date"}

    # Update the branch
    result = await gh.update_branch(
        action.repo_owner, action.repo_name,
        action.pr_number, method="merge"
    )

    return {
        "updated": True,
        "commit_sha": result.get("sha")
    }
```

### 5. GitHub API Client

**File**: `operator_engine/github_client.py`

Async HTTP client for GitHub REST API.

**Features**:
- **Authentication** - Bearer token via `GITHUB_TOKEN`
- **Rate limiting** - Tracks and respects GitHub rate limits
- **Auto-retry** - Retries on 429 (rate limit exceeded)
- **Type safety** - Full type hints for all operations

**Example Usage**:
```python
gh = await get_github_client()

# Get a PR
pr = await gh.get_pull_request("owner", "repo", 123)

# Update branch
await gh.update_branch("owner", "repo", 123)

# Add labels
await gh.add_labels("owner", "repo", 123, ["backend", "tests"])

# Merge PR
await gh.merge_pull_request("owner", "repo", 123, merge_method="squash")
```

## Integration with Prism Console

The PR Action Queue integrates with the Prism Console Merge Dashboard, providing:

- **Real-time queue statistics** - See what's queued, processing, completed, failed
- **PR action history** - Full audit trail of all actions taken
- **Manual triggers** - Manually trigger actions when needed
- **Logs and debugging** - View execution logs and error messages

**API Endpoints**:

```bash
# Queue statistics
GET /api/operator/queue/stats

# PR action history
GET /api/operator/queue/pr/{owner}/{repo}/{pr_number}

# Action status
GET /api/operator/queue/action/{action_id}

# Cancel action
POST /api/operator/queue/action/{action_id}/cancel

# Health check
GET /api/operator/health
```

## Workflow

### Typical PR Lifecycle with Automation

1. **PR Opened** (by Claude)
   - Webhook: `pull_request.opened`
   - Action: `SYNC_LABELS` (auto-label based on files)
   - Priority: `BACKGROUND`

2. **New Commits Pushed**
   - Webhook: `pull_request.synchronized`
   - Action: `UPDATE_BRANCH` (if behind base)
   - Priority: `HIGH`

3. **Labeled with "claude-auto"**
   - Webhook: `pull_request.labeled`
   - Action: `ADD_TO_MERGE_QUEUE`
   - Priority: `HIGH`

4. **Review Comment with "/update-branch"**
   - Webhook: `issue_comment.created`
   - Action: `UPDATE_BRANCH`
   - Priority: `HIGH`

5. **Check Suite Failed**
   - Webhook: `check_suite.completed`
   - Action: `RERUN_FAILED_CHECKS`
   - Priority: `CRITICAL`

6. **All Checks Pass + Approved**
   - Webhook: `pull_request_review.submitted`
   - Action: `MERGE_PR`
   - Priority: `CRITICAL`

## Configuration

### Environment Variables

```bash
# Required
GITHUB_TOKEN=ghp_...                    # GitHub Personal Access Token
GITHUB_WEBHOOK_SECRET=your-secret       # Webhook signature validation

# Optional
OPERATOR_WEBHOOK_URL=https://...        # Operator webhook endpoint
MAX_QUEUE_WORKERS=5                     # Number of concurrent workers
MAX_ACTIONS_PER_REPO=10                 # Rate limit per repo
ACTION_RETRY_MAX=3                      # Max retry attempts
```

### GitHub Webhook Setup

1. Go to repository Settings → Webhooks
2. Add webhook:
   - **Payload URL**: `https://your-domain.com/api/operator/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Your `GITHUB_WEBHOOK_SECRET`
   - **Events**: Select individual events:
     - Pull requests
     - Pull request reviews
     - Pull request review comments
     - Issue comments
     - Check suites
     - Check runs
     - Workflow runs

3. Save webhook

## Security

### Webhook Signature Verification

All incoming webhooks are verified using HMAC-SHA256:

```python
expected_signature = "sha256=" + hmac.new(
    webhook_secret.encode(),
    payload,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected_signature, received_signature):
    raise HTTPException(status_code=401, detail="Invalid signature")
```

### Rate Limiting

Per-repo rate limiting prevents abuse:
- Max 10 actions per repo per minute
- Exponential backoff on retries
- GitHub API rate limits respected (5000/hour)

### Action Validation

All actions are validated before execution:
- Required parameters present
- PR exists and is open
- User has necessary permissions
- Branch is not protected (for destructive operations)

## Monitoring

### Logs

All actions are logged with structured logging:

```python
logger.info(
    f"Executing {action.action_type.value} for "
    f"{action.repo_owner}/{action.repo_name}#{action.pr_number} "
    f"(attempt {action.attempts}/{action.max_attempts})"
)
```

### Metrics

Track queue performance:
- Actions per minute
- Success/failure rate
- Average execution time
- Queue depth over time

### Alerts

Set up alerts for:
- High failure rate (>20%)
- Queue depth > 50
- Webhook signature failures
- GitHub API rate limit approaching

## Troubleshooting

### Common Issues

**1. Actions not being queued**
- Check webhook is configured correctly
- Verify `GITHUB_WEBHOOK_SECRET` matches
- Check webhook delivery logs in GitHub

**2. Actions failing**
- Check `GITHUB_TOKEN` has necessary permissions
- Verify GitHub API rate limit not exceeded
- Review action execution logs

**3. Queue not processing**
- Check queue is running: `GET /api/operator/health`
- Restart queue workers
- Check for exceptions in logs

**4. Duplicate actions**
- Deduplication should prevent this
- Check if webhooks are firing multiple times
- Review queue logs for details

### Debug Mode

Enable debug logging:

```python
import logging

logging.getLogger('operator_engine').setLevel(logging.DEBUG)
```

### Manual Action Triggering

Trigger actions via API:

```bash
curl -X POST https://your-domain.com/api/operator/queue/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "update_branch",
    "repo_owner": "blackboxprogramming",
    "repo_name": "BlackRoad-Operating-System",
    "pr_number": 123,
    "params": {"method": "merge"}
  }'
```

## Future Enhancements

- **GraphQL Support** - Use GitHub GraphQL API for advanced operations
- **Batch Operations** - Apply suggestions in batches
- **ML-based Prioritization** - Learn from past actions to optimize priority
- **Cross-repo Actions** - Actions that span multiple repositories
- **Custom Webhooks** - Trigger external services
- **Action Scheduling** - Schedule actions for specific times
- **Rollback Support** - Undo actions if needed

---

**Status**: ✅ Production Ready (Phase Q2)
**Maintainer**: @alexa-amundson
**Last Updated**: 2025-11-18
