# New Client / Project Kickoff Workflow

**Owner:** Operations
**Systems:** Salesforce → GitHub → Asana
**Status:** Active
**Last Updated:** 2025-11-17

---

## Overview

This is the **flagship automation workflow** that orchestrates the entire journey from "deal closed" to "project ready for development." It connects Salesforce, GitHub, and Asana to eliminate manual setup and ensure consistency.

**Flow Duration:** ~5-10 minutes (automated)
**Human Touch Points:** Initial validation + final review

---

## The Golden Path

```
Salesforce Opp (Closed Won)
    ↓
Salesforce Flow creates Project record
    ↓
Orchestration kicks off (4 stages)
    ↓
Stage 2: Technical Setup
    ↓
    ├─→ GitHub: Create repos + CI/CD
    └─→ Asana: Create project + tasks
    ↓
Feedback loops: Deploy events → Salesforce + Asana
```

---

## Stage-by-Stage Breakdown

### **Stage A: Salesforce – Opportunity Closure**

**Trigger:**
Sales Stage moves to `Closed Won` on Opportunity

**Salesforce Flow:** `Opp_Automation_OnStageChange`

**Actions:**

1. **Validate required fields:**
   - Account Name
   - Primary Contact
   - Domain/Subdomain
   - Package Type (OS / Console / Custom)
   - Service Tier (Starter / Pro / Enterprise)

2. **Create/Update Records:**
   - Link or create Account record
   - Link or create Contact record (Primary)
   - Create **Project** record (Custom Object: `Project__c`)

3. **Project Record Fields:**
   ```
   Project_Key__c:          {ACCOUNT_SLUG}-{RANDOM_4CHAR}
                           Example: ACME-X7K9

   Account__c:              Lookup to Account
   Opportunity__c:          Lookup to Opportunity
   Primary_Domain__c:       Text (e.g., "acme-portal")
   Package_Type__c:         Picklist (OS / Console / Custom)
   Service_Tier__c:         Picklist (Starter / Pro / Enterprise)
   Start_Date__c:           Date (auto: today)
   Status__c:               Picklist → "Setup In Progress"
   Technical_Owner__c:      Lookup to User
   ```

4. **Launch Orchestration:**
   - Name: `New_Client_Kickoff_Orchestration`
   - Input: Project record ID
   - Stages:
     - Sales Handoff
     - Technical Setup ← **We care about this**
     - Customer Onboarding
     - Review & Go-Live

**Outputs:**
✅ Project record created
✅ Orchestration started
✅ Notification sent to #ops Slack channel (optional)

---

### **Stage B: GitHub – Repository Scaffolding**

**Trigger:**
Orchestration Stage "Technical Setup" begins

**Mechanism:**
Salesforce **Autolaunched Flow** → HTTP Callout to GitHub API (or GitHub App webhook receiver)

**API Endpoint:**
```
POST https://api.github.com/orgs/blackboxprogramming/repos
Authorization: Bearer {GITHUB_APP_TOKEN}
```

**Payload (per repo):**
```json
{
  "name": "blackroad-{project_key}-backend",
  "description": "Backend for {Account Name} ({Project Key})",
  "private": true,
  "auto_init": true,
  "gitignore_template": "Python",
  "license_template": "mit"
}
```

**Repos Created:**

1. `blackroad-{project_key}-backend`
2. `blackroad-{project_key}-frontend`
3. `blackroad-{project_key}-ops`

**Apply Repo Template** (via GitHub API or Actions):

1. **Branch Protection** (on `main`):
   - Require PR before merge
   - Require 1 approval
   - Require status checks: `test`, `lint`, `build`
   - No force pushes
   - No deletions

2. **Labels** (via API):
   ```
   type:feature, type:bug, type:docs, type:refactor
   priority:p0, priority:p1, priority:p2, priority:p3
   area:backend, area:frontend, area:ops, area:infra
   status:blocked, status:in-review
   ```

3. **Issue Templates** (from `sop/templates/repo-template/.github/ISSUE_TEMPLATE/`):
   - `bug_report.md`
   - `feature_request.md`
   - `deployment_checklist.md`

4. **PR Template** (`.github/pull_request_template.md`)

5. **GitHub Actions Workflows** (from `sop/templates/github-actions/`):
   - `.github/workflows/ci.yml` – Run tests + lint on every push/PR
   - `.github/workflows/deploy.yml` – Deploy on release tag or approved PR to `main`
   - `.github/workflows/safety.yml` – SAST + dependency scanning
   - `.github/workflows/notify-salesforce.yml` – Send deploy events back to Salesforce

**Secrets Setup** (manual or via API):
```
RAILWAY_TOKEN
CLOUDFLARE_API_TOKEN
SALESFORCE_WEBHOOK_URL
ASANA_API_TOKEN
```

**Outputs:**
✅ 3 repos created
✅ CI/CD pipelines active
✅ Branch protection enabled
✅ Repo URLs written back to Salesforce Project record:
   - `Backend_Repo_URL__c`
   - `Frontend_Repo_URL__c`
   - `Ops_Repo_URL__c`

---

### **Stage C: Asana – Task Space for Humans**

**Trigger:**
Same Orchestration Stage "Technical Setup", after GitHub repos created

**Mechanism:**
Salesforce Flow → HTTP Callout to Asana API (or via Zapier/Make)

**API Endpoint:**
```
POST https://app.asana.com/api/1.0/projects
Authorization: Bearer {ASANA_PAT}
```

**Payload:**
```json
{
  "data": {
    "name": "{Account Name} - {Project Key}",
    "notes": "Salesforce Project: {Project_URL}\nRepos:\n- Backend: {Backend_Repo_URL}\n- Frontend: {Frontend_Repo_URL}\n- Ops: {Ops_Repo_URL}",
    "workspace": "{WORKSPACE_GID}",
    "team": "{TEAM_GID}",
    "default_view": "board",
    "color": "light-green"
  }
}
```

**Create Sections:**
```
POST /projects/{project_gid}/sections
{
  "data": {
    "name": "Discovery"
  }
}
```

Repeat for: `Architecture`, `Build`, `Testing`, `Go-Live`

**Create Standard Tasks:**

| Section | Task | Assignee | Description |
|---------|------|----------|-------------|
| Discovery | Confirm domain + DNS with client | Sales Ops | Get final domain, subdomain, and DNS setup requirements |
| Discovery | Gather branding assets | Design | Logo, colors, fonts for custom theming |
| Architecture | Wire up Railway/Cloudflare envs | DevOps | Create staging + production environments |
| Architecture | Enable CI/CD secrets | DevOps | Add RAILWAY_TOKEN, CLOUDFLARE_API_TOKEN to GitHub |
| Build | Set up database schema | Backend | Initialize Postgres + migrations |
| Build | Implement authentication | Backend | SSO or email/password setup |
| Testing | Run first end-to-end test | QA | Verify deploy pipeline works end-to-end |
| Go-Live | Final client walkthrough | Customer Success | Demo + training session |

**Each Task Contains:**
- Link to Salesforce Project record
- Link to relevant GitHub repo + issues
- Due date (calculated from Project start date + offsets)

**Outputs:**
✅ Asana project created
✅ Standard task set populated
✅ Asana project URL written back to Salesforce:
   - `Asana_Project_URL__c`

---

### **Stage D: Feedback Loop – GitHub → Salesforce & Asana**

**Trigger:**
GitHub events:
- PR merged to `main` with label `release`
- GitHub Release created
- CI pipeline `deploy` job succeeds

**Mechanism:**
GitHub Action: `.github/workflows/notify-salesforce.yml`

**Action Workflow (Pseudocode):**

```yaml
name: Notify Salesforce & Asana on Deploy

on:
  workflow_run:
    workflows: ["Deploy"]
    types:
      - completed

jobs:
  notify:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Extract deploy metadata
        run: |
          echo "SHA=${{ github.sha }}" >> $GITHUB_ENV
          echo "TAG=${{ github.ref_name }}" >> $GITHUB_ENV
          echo "REPO=${{ github.repository }}" >> $GITHUB_ENV

      - name: Update Salesforce Project
        run: |
          curl -X PATCH "$SALESFORCE_WEBHOOK_URL/services/data/v58.0/sobjects/Project__c/ExternalId__c/${{ secrets.PROJECT_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SALESFORCE_ACCESS_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "Last_Deploy_At__c": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "Last_Deploy_SHA__c": "'$SHA'",
              "Last_Deploy_Tag__c": "'$TAG'",
              "Environment__c": "production",
              "Release_Notes_URL__c": "https://github.com/'$REPO'/releases/tag/'$TAG'"
            }'

      - name: Complete Asana deploy task
        run: |
          TASK_GID=$(curl -s "https://app.asana.com/api/1.0/projects/${{ secrets.ASANA_PROJECT_GID }}/tasks?opt_fields=name,gid" \
            -H "Authorization: Bearer ${{ secrets.ASANA_PAT }}" | \
            jq -r '.data[] | select(.name | contains("Deploy to production")) | .gid')

          curl -X PUT "https://app.asana.com/api/1.0/tasks/$TASK_GID" \
            -H "Authorization: Bearer ${{ secrets.ASANA_PAT }}" \
            -H "Content-Type: application/json" \
            -d '{"data": {"completed": true}}'

          # Post comment
          curl -X POST "https://app.asana.com/api/1.0/tasks/$TASK_GID/stories" \
            -H "Authorization: Bearer ${{ secrets.ASANA_PAT }}" \
            -H "Content-Type: application/json" \
            -d '{"data": {"text": "✅ Deployed '$TAG' from '$REPO'@'$SHA' to production"}}'
```

**Outputs:**
✅ Salesforce Project updated with latest deploy info
✅ Asana tasks auto-completed
✅ Asana comments added with deploy details

---

## Human Touch Points (Brenda View)

**What You See:**

1. **Day 0 – Deal Closes:**
   - You mark Opportunity as "Closed Won" in Salesforce
   - Wait 5-10 minutes ⏱️

2. **Day 0 – Automatic Magic:**
   - Repos appear in GitHub (you get a Slack notification)
   - Asana project appears with all tasks assigned
   - No manual work needed

3. **Throughout Project:**
   - Engineers merge code → tasks auto-update in Asana
   - Deploy happens → Salesforce shows "Last Deploy: 2 hours ago"
   - You just monitor Asana and communicate with client

**If Something Breaks:**
- Create an issue in `blackroad-sop` repo with label `automation-bug`
- Tag @ops or @devops team
- Include: Salesforce Project URL, expected vs. actual behavior

---

## Validation Checklist

After this workflow runs, verify:

- [ ] Project record exists in Salesforce with all fields populated
- [ ] 3 repos created in GitHub with correct naming
- [ ] CI/CD workflows present in each repo
- [ ] Branch protection enabled on `main`
- [ ] Asana project created with 8+ tasks
- [ ] Salesforce Project has Asana + GitHub URLs filled in
- [ ] Test deploy updates Salesforce + Asana correctly

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No repos created after 10 min | GitHub API token expired | Refresh token in Salesforce Named Credential |
| Asana project missing | Webhook failed | Check Salesforce debug logs for HTTP callout errors |
| Deploy doesn't update Salesforce | Missing secret `PROJECT_KEY` | Add `PROJECT_KEY` secret to each repo |
| Tasks not auto-completing | Asana API token wrong | Verify `ASANA_PAT` secret in GitHub |

---

## Related Docs

- [Salesforce Flow Spec: Opp_Automation_OnStageChange](../salesforce/flows/opp-automation-onstagechange.md)
- [Salesforce Orchestration Spec](../salesforce/orchestrations/new-client-kickoff-orchestration.md)
- [GitHub Actions: CI Baseline](../templates/github-actions/ci.yml)
- [Integration: Salesforce → GitHub](../integrations/salesforce-to-github.md)
- [Integration: GitHub → Salesforce](../integrations/github-to-salesforce.md)
- [Playbook: Brenda's New Client Checklist](../playbooks/brenda-new-client-checklist.md)

---

## Metrics to Track

- **Time to First Commit:** From Closed Won to first commit in project repo (target: < 48 hours)
- **Automation Success Rate:** % of deals that auto-create repos + Asana (target: > 95%)
- **Manual Intervention Rate:** % of projects requiring manual fixes (target: < 10%)
- **Deploy Frequency:** Avg deploys per week per project (target: > 5)

---

**This is the backbone.** Every other automation workflow should follow this pattern:
1. Event-driven trigger
2. Cross-system orchestration
3. Feedback loops
4. Human-friendly visibility
