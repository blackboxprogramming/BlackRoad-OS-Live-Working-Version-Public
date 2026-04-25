# Release Pipeline Workflow

**Owner:** Engineering + DevOps
**Systems:** GitHub → Railway/Cloudflare → Salesforce → Asana
**Status:** Active
**Last Updated:** 2025-11-17

---

## Overview

This workflow automates the **entire release and deployment lifecycle**, from code commit to production deployment to updating all stakeholders automatically.

**Key Principle:** Merge to `main` should feel like magic. Everything else happens automatically.

---

## The Pipeline

```
Developer pushes code
    ↓
GitHub Actions: CI pipeline (test + lint + build)
    ↓
    PASS → Ready for PR
    ↓
PR created + reviewed + approved
    ↓
PR merged to `main`
    ↓
GitHub Actions: Deploy pipeline
    ↓
    ├─→ Deploy to Railway (backend)
    ├─→ Deploy to Cloudflare Pages (frontend)
    └─→ Update configs (ops)
    ↓
Deploy succeeds
    ↓
GitHub Actions: Notify stakeholders
    ↓
    ├─→ Update Salesforce Project (deploy metadata)
    ├─→ Complete Asana tasks (deployment checklist)
    └─→ Post to Slack #deploys
```

---

## Stage 1: Continuous Integration (CI)

**Trigger:**
- Every push to any branch
- Every pull request opened/updated

**GitHub Action:** `.github/workflows/ci.yml`

**Jobs:**

### 1.1 Test
```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      python-version: [3.11, 3.12]
  steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: ${{ matrix.python-version }}
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    - name: Run tests
      run: pytest --cov=. --cov-report=xml
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      if: matrix.python-version == '3.12'
```

### 1.2 Lint
```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'
    - name: Install linters
      run: pip install ruff black isort mypy
    - name: Run ruff
      run: ruff check .
    - name: Check formatting
      run: black --check .
    - name: Check import order
      run: isort --check-only .
    - name: Type check
      run: mypy . --ignore-missing-imports
```

### 1.3 Build
```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Build Docker image
      run: docker build -t test-build .
    - name: Test container starts
      run: |
        docker run -d --name test-container test-build
        sleep 5
        docker logs test-container
        docker stop test-container
```

**Outputs:**
✅ All checks pass → PR can be merged
❌ Any check fails → PR blocked until fixed

---

## Stage 2: Pull Request Flow

**Process:**

1. **Developer creates PR** with standardized template:
   ```markdown
   ## What
   Brief description of changes

   ## Why
   Business/technical justification

   ## How
   Implementation approach

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Screenshots/Logs
   (if applicable)

   ## Related
   - Asana Task: [link]
   - Salesforce Project: [link]
   ```

2. **Automated checks run:**
   - CI pipeline (test + lint + build)
   - CODEOWNERS review assignment
   - Label auto-applied based on files changed

3. **Human review:**
   - At least 1 approval required
   - No unresolved conversations
   - All checks green

4. **Merge:**
   - Squash and merge (clean history)
   - Auto-delete branch after merge

---

## Stage 3: Continuous Deployment (CD)

**Trigger:**
- Push to `main` branch
- GitHub Release created (for versioned deploys)

**GitHub Action:** `.github/workflows/deploy.yml`

### 3.1 Deploy Backend (Railway)

```yaml
deploy-backend:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - uses: actions/checkout@v4

    - name: Install Railway CLI
      run: |
        curl -fsSL https://railway.app/install.sh | sh

    - name: Deploy to Railway
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      run: |
        railway up --service backend --environment production

    - name: Wait for deployment
      run: |
        railway status --service backend --environment production --wait

    - name: Run post-deploy health check
      run: |
        BACKEND_URL=$(railway variables get BACKEND_URL --service backend --environment production)
        curl -f "$BACKEND_URL/health" || exit 1

    - name: Save deploy metadata
      run: |
        echo "DEPLOY_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $GITHUB_ENV
        echo "DEPLOY_SHA=${{ github.sha }}" >> $GITHUB_ENV
        echo "DEPLOY_BRANCH=${{ github.ref_name }}" >> $GITHUB_ENV
```

### 3.2 Deploy Frontend (Cloudflare Pages)

```yaml
deploy-frontend:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Build frontend
      env:
        VITE_API_URL: ${{ secrets.PROD_API_URL }}
        VITE_ENV: production
      run: npm run build

    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: blackroad-frontend
        directory: dist
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}

    - name: Verify deployment
      run: |
        sleep 30  # Wait for propagation
        curl -f "https://blackroad.app" || exit 1
```

### 3.3 Update Infrastructure (if ops repo)

```yaml
update-infra:
  runs-on: ubuntu-latest
  if: contains(github.repository, '-ops')
  steps:
    - uses: actions/checkout@v4

    - name: Apply Terraform changes
      env:
        TF_VAR_railway_token: ${{ secrets.RAILWAY_TOKEN }}
        TF_VAR_cloudflare_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      run: |
        cd terraform
        terraform init
        terraform plan -out=tfplan
        terraform apply -auto-approve tfplan

    - name: Update Cloudflare DNS
      if: contains(github.event.head_commit.message, '[dns]')
      run: |
        # Apply DNS changes from dns-config.json
        python scripts/update_cloudflare_dns.py
```

---

## Stage 4: Stakeholder Notification

**Trigger:**
Deploy jobs complete successfully

**GitHub Action:** `.github/workflows/notify-stakeholders.yml`

### 4.1 Update Salesforce

```yaml
update-salesforce:
  needs: [deploy-backend, deploy-frontend]
  runs-on: ubuntu-latest
  steps:
    - name: Get Project Key from repo
      run: |
        # Extract from repo name: blackroad-ACME-X7K9-backend → ACME-X7K9
        REPO_NAME="${{ github.repository }}"
        PROJECT_KEY=$(echo "$REPO_NAME" | sed -n 's/.*blackroad-\([A-Z0-9-]*\)-.*/\1/p')
        echo "PROJECT_KEY=$PROJECT_KEY" >> $GITHUB_ENV

    - name: Update Salesforce Project record
      env:
        SF_INSTANCE_URL: ${{ secrets.SALESFORCE_INSTANCE_URL }}
        SF_ACCESS_TOKEN: ${{ secrets.SALESFORCE_ACCESS_TOKEN }}
      run: |
        curl -X PATCH \
          "$SF_INSTANCE_URL/services/data/v58.0/sobjects/Project__c/Project_Key__c/$PROJECT_KEY" \
          -H "Authorization: Bearer $SF_ACCESS_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "Last_Deploy_At__c": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
            "Last_Deploy_SHA__c": "${{ github.sha }}",
            "Last_Deploy_Branch__c": "${{ github.ref_name }}",
            "Last_Deploy_Actor__c": "${{ github.actor }}",
            "Deploy_Status__c": "Success",
            "Environment__c": "Production",
            "Release_Notes_URL__c": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
          }'

    - name: Create Salesforce deployment record
      run: |
        curl -X POST \
          "$SF_INSTANCE_URL/services/data/v58.0/sobjects/Deployment__c" \
          -H "Authorization: Bearer $SF_ACCESS_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{
            "Project__c": "'"$PROJECT_KEY"'",
            "Deployed_At__c": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
            "Git_SHA__c": "${{ github.sha }}",
            "Git_Branch__c": "${{ github.ref_name }}",
            "Deployed_By__c": "${{ github.actor }}",
            "Status__c": "Success",
            "Repository__c": "${{ github.repository }}",
            "Commit_URL__c": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
          }'
```

### 4.2 Update Asana

```yaml
update-asana:
  needs: [deploy-backend, deploy-frontend]
  runs-on: ubuntu-latest
  steps:
    - name: Get Asana project and task IDs
      env:
        ASANA_PAT: ${{ secrets.ASANA_PAT }}
        PROJECT_KEY: ${{ env.PROJECT_KEY }}
      run: |
        # Find project by name containing PROJECT_KEY
        PROJECT_GID=$(curl -s "https://app.asana.com/api/1.0/projects?workspace=${{ secrets.ASANA_WORKSPACE_GID }}&opt_fields=name,gid" \
          -H "Authorization: Bearer $ASANA_PAT" | \
          jq -r '.data[] | select(.name | contains("'$PROJECT_KEY'")) | .gid')

        echo "ASANA_PROJECT_GID=$PROJECT_GID" >> $GITHUB_ENV

    - name: Find and complete deploy task
      run: |
        # Find "Deploy to production" task
        TASK_GID=$(curl -s "https://app.asana.com/api/1.0/projects/$ASANA_PROJECT_GID/tasks?opt_fields=name,gid,completed" \
          -H "Authorization: Bearer $ASANA_PAT" | \
          jq -r '.data[] | select(.name | contains("Deploy") and (.completed == false)) | .gid' | head -n 1)

        if [ -n "$TASK_GID" ]; then
          # Mark as complete
          curl -X PUT "https://app.asana.com/api/1.0/tasks/$TASK_GID" \
            -H "Authorization: Bearer $ASANA_PAT" \
            -H "Content-Type: application/json" \
            -d '{"data": {"completed": true}}'

          # Add comment with deploy details
          curl -X POST "https://app.asana.com/api/1.0/tasks/$TASK_GID/stories" \
            -H "Authorization: Bearer $ASANA_PAT" \
            -H "Content-Type: application/json" \
            -d '{
              "data": {
                "text": "✅ Deployed to production\n\n**Commit:** ${{ github.sha }}\n**By:** ${{ github.actor }}\n**Time:** '"$(date -u)"'\n**Link:** https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
              }
            }'
        fi
```

### 4.3 Notify Slack

```yaml
notify-slack:
  needs: [update-salesforce, update-asana]
  runs-on: ubuntu-latest
  if: always()
  steps:
    - name: Post to #deploys channel
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_DEPLOYS }}
      run: |
        STATUS_EMOJI="${{ job.status == 'success' && '✅' || '❌' }}"
        curl -X POST "$SLACK_WEBHOOK_URL" \
          -H "Content-Type: application/json" \
          -d '{
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "'"$STATUS_EMOJI"' *Deploy to Production*\n\n*Project:* '"$PROJECT_KEY"'\n*Repo:* `${{ github.repository }}`\n*Commit:* <https://github.com/${{ github.repository }}/commit/${{ github.sha }}|'"${GITHUB_SHA:0:7}"'>\n*By:* ${{ github.actor }}\n*Status:* ${{ job.status }}"
                }
              }
            ]
          }'
```

---

## Stage 5: Rollback (if needed)

**Trigger:** Manual action or automated health check failure

**GitHub Action:** `.github/workflows/rollback.yml`

```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      target_sha:
        description: 'Git SHA to rollback to'
        required: true
      reason:
        description: 'Reason for rollback'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.target_sha }}

      - name: Rollback backend
        run: |
          railway up --service backend --environment production

      - name: Rollback frontend
        run: |
          npm ci
          npm run build
          # Deploy to Cloudflare...

      - name: Update Salesforce
        run: |
          curl -X POST "$SF_INSTANCE_URL/services/data/v58.0/sobjects/Deployment__c" \
            -H "Authorization: Bearer $SF_ACCESS_TOKEN" \
            -d '{
              "Project__c": "'"$PROJECT_KEY"'",
              "Status__c": "Rollback",
              "Git_SHA__c": "${{ github.event.inputs.target_sha }}",
              "Rollback_Reason__c": "${{ github.event.inputs.reason }}"
            }'

      - name: Notify team
        run: |
          curl -X POST "$SLACK_WEBHOOK_URL" \
            -d '{
              "text": "⚠️ *ROLLBACK PERFORMED*\n\nProject: '"$PROJECT_KEY"'\nRolled back to: '"${{ github.event.inputs.target_sha }}"'\nReason: '"${{ github.event.inputs.reason }}"'\nBy: '"${{ github.actor }}"'"
            }'
```

---

## Human Touch Points

**What Developers Do:**

1. Write code in feature branch
2. Create PR when ready
3. Address review feedback
4. Merge PR (or approve auto-merge)
5. **That's it.** Everything else is automatic.

**What Ops/Brenda Sees:**

1. Slack notification: "✅ Deploy to production: ACME-X7K9"
2. Asana task auto-completes
3. Salesforce shows updated "Last Deploy" timestamp
4. No manual status updates needed

**When to Intervene:**

- Deploy fails (red X in GitHub Actions)
- Health check fails post-deploy
- Customer reports issue immediately after deploy
- → Use rollback workflow

---

## Metrics Dashboard

Track these in Salesforce or a monitoring tool:

| Metric | Target | Current |
|--------|--------|---------|
| **Deploy Frequency** | > 5/week per project | - |
| **Lead Time** (commit → production) | < 30 minutes | - |
| **Change Failure Rate** | < 15% | - |
| **MTTR** (Mean Time to Recovery) | < 1 hour | - |
| **Deploy Success Rate** | > 95% | - |

---

## Validation Checklist

After each deploy, verify:

- [ ] CI pipeline passed all checks
- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Database migrations applied (if any)
- [ ] Salesforce Project record updated
- [ ] Asana task marked complete
- [ ] Slack notification sent
- [ ] No alerts in monitoring

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| CI fails on test | Code issue | Fix tests, push again |
| Deploy fails on Railway | Token expired | Refresh `RAILWAY_TOKEN` secret |
| Salesforce not updating | Wrong project key | Verify repo name matches `blackroad-{PROJECT_KEY}-*` |
| Asana task not completing | Task name doesn't match | Ensure task name contains "Deploy" |
| Health check fails | Backend not fully started | Increase sleep time in workflow |

---

## Related Docs

- [GitHub Actions: CI Workflow](../templates/github-actions/ci.yml)
- [GitHub Actions: Deploy Workflow](../templates/github-actions/deploy.yml)
- [GitHub Actions: Notify Stakeholders](../templates/github-actions/notify-stakeholders.yml)
- [Integration: GitHub → Salesforce](../integrations/github-to-salesforce.md)
- [New Client Kickoff Workflow](./new-client-kickoff.md)

---

## Philosophy

**"Deploy should be boring."**

The goal is to make deployments so reliable, automated, and well-monitored that they become **non-events**.

Every commit to `main` is a potential release. Every release updates all stakeholders automatically. No human should ever ask "Did this deploy?" or "What version is in production?"

The system should always know.
