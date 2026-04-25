# Operator Engine Setup Guide

**Complete setup instructions for Phase Q2 PR automation**

---

## Prerequisites

- GitHub Personal Access Token with `repo` scope
- Webhook endpoint (Railway, Heroku, or custom server)
- PostgreSQL database (for queue persistence - optional)
- Redis (for caching - optional)

## Step 1: Environment Variables

Add to your `.env` file or Railway/Heroku config:

```bash
# Required
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
GITHUB_WEBHOOK_SECRET=your_random_secret_string_here

# Optional
OPERATOR_WEBHOOK_URL=https://your-domain.com/api/operator/webhooks/github
MAX_QUEUE_WORKERS=5
MAX_ACTIONS_PER_REPO=10
ACTION_RETRY_MAX=3
```

### Generating GitHub Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Actions workflows)
   - `write:discussion` (write discussions)
4. Copy token and save as `GITHUB_TOKEN`

### Generating Webhook Secret

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save output as `GITHUB_WEBHOOK_SECRET`

## Step 2: Deploy Operator Engine

### Option A: Railway (Recommended)

```bash
# Operator Engine is bundled with backend deployment
railway up
```

The Operator Engine router is automatically included in the FastAPI app.

### Option B: Standalone Deployment

If deploying separately:

```bash
# Clone repo
git clone https://github.com/blackboxprogramming/BlackRoad-Operating-System
cd BlackRoad-Operating-System

# Install dependencies
pip install -r backend/requirements.txt

# Run backend (includes Operator Engine)
cd backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Step 3: Configure GitHub Webhooks

### For Single Repository

1. Go to repository **Settings → Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `https://your-domain.com/api/operator/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Your `GITHUB_WEBHOOK_SECRET`
   - **SSL verification**: Enable
   - **Events**: Select individual events:
     - [x] Pull requests
     - [x] Pull request reviews
     - [x] Pull request review comments
     - [x] Issue comments
     - [x] Check suites
     - [x] Check runs
     - [x] Workflow runs
4. Click **Add webhook**

### For Organization (All Repos)

1. Go to organization **Settings → Webhooks**
2. Follow same steps as above
3. Webhook will apply to all repos in org

### Verify Webhook

After adding, send a test payload:

1. Go to webhook settings
2. Click **Recent Deliveries**
3. Click **Redeliver** on any event
4. Check response is `200 OK`

## Step 4: Enable Merge Queue

### Update Branch Protection Rules

1. Go to repository **Settings → Branches**
2. Find `main` branch protection rule (or create one)
3. Configure:
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - [ ] Require pull request reviews (disabled for auto-merge)
   - Required status checks:
     - `Backend Tests`
     - `CI / validate-html`
     - `CI / validate-javascript`
4. Save changes

### Create Merge Queue Config

The merge queue config is already in `.github/merge_queue.yml`.

GitHub will automatically detect this file and enable merge queue features (requires GitHub Enterprise or GitHub Team).

## Step 5: Set Up Prism Console

### Access the Dashboard

```bash
# Local development
open prism-console/pages/merge-dashboard.html

# Production
https://your-domain.com/prism-console/pages/merge-dashboard.html
```

### Configure API Endpoint

Update `prism-console/modules/merge-dashboard.js`:

```javascript
const apiBaseUrl = '/api/operator';  // Production
// const apiBaseUrl = 'http://localhost:8000/api/operator';  // Local
```

## Step 6: Create GitHub Teams (For Auto-Merge)

### Required Teams

Create these teams in your GitHub organization:

1. `claude-auto` - For Claude AI automated changes
2. `atlas-auto` - For Atlas AI automated changes
3. `docs-auto` - For documentation-only changes
4. `test-auto` - For test-only changes

### Team Settings

For each team:
1. Go to organization **Teams**
2. Click **New team**
3. Name: `claude-auto` (or respective name)
4. Description: "Auto-merge for Claude AI changes"
5. Add team to `.github/CODEOWNERS`:
   ```
   /docs/ @alexa-amundson @blackboxprogramming/docs-auto
   ```

## Step 7: Start the Queue

### Automatic Start (Recommended)

The queue starts automatically when the FastAPI app boots:

```python
# In backend/app/main.py

@app.on_event("startup")
async def startup():
    from operator_engine.pr_actions import get_queue
    queue = get_queue()
    await queue.start()
    logger.info("Operator Engine queue started")
```

### Manual Start

If needed, start manually:

```python
from operator_engine.pr_actions import get_queue

queue = get_queue()
await queue.start()
```

### Verify Queue is Running

```bash
curl https://your-domain.com/api/operator/health
```

Expected response:
```json
{
  "status": "healthy",
  "queue_running": true,
  "queued": 0,
  "processing": 0,
  "completed": 5,
  "failed": 0,
  "workers": 5
}
```

## Step 8: Test the System

### Create a Test PR

1. Create a branch: `git checkout -b claude/test-automation`
2. Make a simple change (e.g., update README)
3. Commit: `git commit -m "docs: test automation"`
4. Push: `git push -u origin claude/test-automation`
5. Open PR on GitHub

### Verify Automation

Check that:
1. PR is auto-labeled (should have `docs` label)
2. PR is added to merge queue (check Prism Console)
3. Checks run automatically
4. PR merges automatically after checks pass

### Check Logs

```bash
# View Operator Engine logs
railway logs --service backend | grep "operator_engine"

# Or locally
tail -f logs/operator.log
```

## Step 9: Monitor and Tune

### Key Metrics to Watch

- **Queue depth** - Keep < 10 for optimal performance
- **Merge velocity** - Target 15-20 merges/hour
- **Failure rate** - Keep < 10%
- **Time in queue** - Target < 15 minutes

### Tuning Parameters

If queue is slow:
```yaml
# .github/merge_queue.yml
queue:
  batch_size: 3  # Reduce for faster processing
  check_timeout: 20  # Reduce if checks are fast
```

If too many failures:
```yaml
auto_merge:
  require_reviews: true  # Enable reviews for quality
  excluded_patterns:  # Add more exclusions
    - "critical_file.py"
```

## Troubleshooting

### Webhooks Not Being Received

**Check**:
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/operator/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}'
```

**Solutions**:
- Verify endpoint is publicly accessible
- Check firewall rules
- Verify SSL certificate is valid
- Check webhook secret matches

### Queue Not Processing Actions

**Check**:
```bash
curl https://your-domain.com/api/operator/queue/stats
```

**Solutions**:
- Restart the queue: `await queue.stop(); await queue.start()`
- Check worker count: Increase `MAX_QUEUE_WORKERS`
- Review error logs
- Verify `GITHUB_TOKEN` has correct permissions

### Actions Failing

**Check**:
```bash
curl https://your-domain.com/api/operator/queue/action/{action_id}
```

**Common Issues**:
1. **403 Forbidden** - GitHub token lacks permissions
2. **404 Not Found** - PR or comment doesn't exist
3. **422 Unprocessable** - Invalid parameters
4. **429 Rate Limited** - Slow down requests

### Auto-Merge Not Working

**Checklist**:
- [ ] PR has auto-merge label (`claude-auto`, `docs`, etc.)
- [ ] All required checks are passing
- [ ] Branch is up-to-date with base
- [ ] No merge conflicts
- [ ] Branch protection rules allow auto-merge
- [ ] PR is not in draft mode

## Advanced Configuration

### Custom Action Handlers

Add custom handlers for your workflow:

```python
# operator_engine/pr_actions/handlers/custom_handler.py

from . import BaseHandler
from ..action_types import PRAction

class CustomHandler(BaseHandler):
    async def execute(self, action: PRAction):
        # Your custom logic
        return {"status": "success"}

# Register in handlers/__init__.py
from .custom_handler import CustomHandler

HANDLER_REGISTRY[PRActionType.CUSTOM_ACTION] = CustomHandler()
```

### Database Persistence (Optional)

Store queue state in PostgreSQL:

```python
# operator_engine/pr_actions/persistence.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

class PersistentQueue(PRActionQueue):
    async def enqueue(self, action):
        # Save to database
        session = Session()
        session.add(action)
        session.commit()
        return await super().enqueue(action)
```

### Slack Notifications

Add Slack webhook for notifications:

```python
# operator_engine/notifications.py

import httpx

async def notify_slack(message: str):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return

    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json={"text": message})

# Use in handlers
await notify_slack(f"PR #{pr_number} merged successfully! 🎉")
```

## Maintenance

### Weekly Tasks

- Review failed actions in Prism Console
- Check queue depth trends
- Update `GITHUB_TOKEN` if expiring
- Review and adjust priority rules

### Monthly Tasks

- Audit merge queue metrics
- Review and update auto-merge labels
- Clean up old action logs
- Update documentation

### Quarterly Tasks

- Review security settings
- Update dependencies
- Optimize slow handlers
- Plan new automation features

---

**Status**: ✅ Production Ready (Phase Q2)
**Maintainer**: @alexa-amundson
**Last Updated**: 2025-11-18
