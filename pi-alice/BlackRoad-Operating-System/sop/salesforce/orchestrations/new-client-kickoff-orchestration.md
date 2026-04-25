# Salesforce Orchestration: New Client Kickoff

**API Name:** `New_Client_Kickoff_Orchestration`
**Type:** Multi-Stage Orchestration
**Status:** Active
**Last Updated:** 2025-11-17

---

## Purpose

This orchestration coordinates the entire **end-to-end new client onboarding process** across multiple teams and systems, from deal closure to go-live.

**Key Benefits:**
- Orchestrates cross-functional work (Sales, Engineering, Customer Success)
- Enforces process consistency
- Provides visibility into project status
- Automates hand-offs between teams
- Ensures nothing falls through the cracks

---

## Input Variables

| Variable Name | Type | Required | Description |
|---------------|------|----------|-------------|
| `ProjectRecordId` | Record ID | ✅ | ID of the Project__c record |
| `OpportunityRecordId` | Record ID | ✅ | ID of the Opportunity |
| `AccountRecordId` | Record ID | ✅ | ID of the Account |

---

## Stages Overview

```
1. Sales Handoff (1-2 days)
   ↓
2. Technical Setup (3-5 days) ← KEY AUTOMATION STAGE
   ↓
3. Customer Onboarding (5-10 days)
   ↓
4. Review & Go-Live (2-3 days)
```

**Total Timeline:** 11-20 days (varies by package complexity)

---

## Stage 1: Sales Handoff

**Owner:** Sales Operations
**Duration:** 1-2 days
**Status Field:** `Project__c.Status__c` = "Sales Handoff"

### Steps

#### Step 1.1: Send Welcome Email to Client

**Element Type:** Action - Send Email

**Template:** `Client_Welcome_Email`

**To:** Primary Contact from Opportunity
**CC:** Account Executive, Account Owner
**From:** ops@blackroad.com

**Merge Fields:**
- `{!Account.Name}`
- `{!Project.Project_Key__c}`
- `{!Project.Package_Type__c}`
- `{!Opportunity.Owner.Name}`

---

#### Step 1.2: Create Internal Kickoff Task

**Element Type:** Action - Create Task

**Assigned To:** Sales Operations Manager
**Subject:** `Internal Kickoff: {!Project.Name}`
**Due Date:** `TODAY() + 1`
**Priority:** High

**Description:**
```
New project needs kickoff coordination:

Project: {!Project.Name}
Project Key: {!Project.Project_Key__c}
Account: {!Account.Name}
Package: {!Project.Package_Type__c}
Service Tier: {!Project.Service_Tier__c}

Action Required:
- Verify all Opportunity fields are complete
- Confirm primary contact is correct
- Schedule kickoff call with client
- Brief technical team on any special requirements

Salesforce Project: {!Project.Id}
```

---

#### Step 1.3: Wait for Approval

**Element Type:** Interactive Step - Screen Flow

**Screen:** "Sales Handoff Complete?"

**Fields:**
- Checkbox: "Kickoff call scheduled"
- Checkbox: "Client expectations set"
- Checkbox: "Special requirements documented"
- Text Area: "Notes for technical team"

**Assigned To:** Sales Operations Manager

**Completion Criteria:** All checkboxes checked

---

#### Step 1.4: Update Project Status

**Element Type:** Action - Update Records

**Record:** Project__c
**Fields:**
- `Status__c` = "Technical Setup"
- `Sales_Handoff_Completed__c` = `TODAY()`
- `Technical_Notes__c` = `{!Screen.Notes}`

---

## Stage 2: Technical Setup

**Owner:** DevOps / Engineering
**Duration:** 3-5 days (mostly automated)
**Status Field:** `Project__c.Status__c` = "Technical Setup"

### Steps

#### Step 2.1: Create GitHub Repositories

**Element Type:** Autolaunched Flow - HTTP Callout

**Named Credential:** `GitHub_API`
**Endpoint:** `POST https://api.github.com/orgs/blackboxprogramming/repos`

**For Each Repo Type:** (Backend, Frontend, Ops)

**Payload:**
```json
{
  "name": "blackroad-{!Project.Project_Key__c}-{!RepoType}",
  "description": "{!Account.Name} - {!Project.Package_Type__c}",
  "private": true,
  "auto_init": true,
  "gitignore_template": "Python"
}
```

**Store Response:** Capture repo URLs

**Update Project Record:**
- `Backend_Repo_URL__c` = Response.html_url (for backend)
- `Frontend_Repo_URL__c` = Response.html_url (for frontend)
- `Ops_Repo_URL__c` = Response.html_url (for ops)

**See:** [Integration: Salesforce → GitHub](../../integrations/salesforce-to-github.md) for detailed API specs

---

#### Step 2.2: Apply Repository Templates

**Element Type:** Autolaunched Flow - HTTP Callout (Multiple)

**For Each Repo:**

1. **Create Labels**
   - POST to `/repos/{owner}/{repo}/labels`
   - Apply standard label set from `labels.json`

2. **Apply Branch Protection**
   - PUT to `/repos/{owner}/{repo}/branches/main/protection`
   - Configure as per branch-protection spec

3. **Create Workflows**
   - POST to create files via GitHub API
   - Add `ci.yml`, `deploy.yml`, `safety.yml`

4. **Add Secrets**
   - POST to `/repos/{owner}/{repo}/actions/secrets`
   - Add: `PROJECT_KEY`, `SALESFORCE_INSTANCE_URL`, `SALESFORCE_ACCESS_TOKEN`

---

#### Step 2.3: Create Asana Project

**Element Type:** Autolaunched Flow - HTTP Callout

**Named Credential:** `Asana_API`
**Endpoint:** `POST https://app.asana.com/api/1.0/projects`

**Payload:**
```json
{
  "data": {
    "name": "{!Account.Name} - {!Project.Project_Key__c}",
    "workspace": "{!$Credential.Asana_API.Workspace_GID}",
    "team": "{!$Credential.Asana_API.Team_GID}",
    "notes": "Salesforce Project: {!Project.Id}\nRepos:\n- Backend: {!Project.Backend_Repo_URL__c}\n- Frontend: {!Project.Frontend_Repo_URL__c}\n- Ops: {!Project.Ops_Repo_URL__c}",
    "default_view": "board",
    "color": "light-green"
  }
}
```

**Store Response:** `{!AsanaProjectGID}`

**Update Project:**
- `Asana_Project_URL__c` = `https://app.asana.com/0/{!AsanaProjectGID}/list`

**See:** [Integration: Salesforce → Asana](../../integrations/salesforce-to-asana.md) for detailed API specs

---

#### Step 2.4: Create Asana Sections & Tasks

**Element Type:** Loop + HTTP Callouts

**For Each Section:** (Discovery, Architecture, Build, Testing, Go-Live)

1. **Create Section:**
   ```
   POST /projects/{!AsanaProjectGID}/sections
   {"data": {"name": "Discovery"}}
   ```

2. **Create Tasks in Section:**

**Discovery Section:**
- Task: "Confirm domain + DNS with client" → Assign to Sales Ops
- Task: "Gather branding assets" → Assign to Design team

**Architecture Section:**
- Task: "Wire up Railway/Cloudflare environments" → Assign to DevOps
- Task: "Enable CI/CD secrets" → Assign to DevOps
- Task: "Design database schema" → Assign to Backend team

**Build Section:**
- Task: "Set up database and migrations" → Assign to Backend
- Task: "Implement authentication" → Assign to Backend
- Task: "Build core UI components" → Assign to Frontend

**Testing Section:**
- Task: "Run end-to-end test suite" → Assign to QA
- Task: "Security scan and review" → Assign to Security team

**Go-Live Section:**
- Task: "Final client walkthrough" → Assign to Customer Success
- Task: "Deploy to production" → Assign to DevOps

**Each Task Payload:**
```json
{
  "data": {
    "name": "{!TaskName}",
    "projects": ["{!AsanaProjectGID}"],
    "memberships": [{"project": "{!AsanaProjectGID}", "section": "{!SectionGID}"}],
    "assignee": "{!AssigneeEmail}",
    "due_on": "{!CalculatedDueDate}",
    "notes": "Salesforce Project: {!Project.Id}\nGitHub Repos: {!Project.Backend_Repo_URL__c}"
  }
}
```

---

#### Step 2.5: Wait for Repositories to Be Verified

**Element Type:** Interactive Step - Approval

**Approver:** DevOps Manager
**Approval Criteria:**
- [ ] All 3 repos created and accessible
- [ ] CI/CD workflows active
- [ ] Branch protection enabled
- [ ] Secrets configured

**Timeout:** 2 days
**Escalation:** If not approved in 2 days, send alert to Engineering Manager

---

#### Step 2.6: Update Project Status

**Element Type:** Action - Update Records

**Record:** Project__c
**Fields:**
- `Status__c` = "Customer Onboarding"
- `Technical_Setup_Completed__c` = `TODAY()`

---

## Stage 3: Customer Onboarding

**Owner:** Customer Success
**Duration:** 5-10 days
**Status Field:** `Project__c.Status__c` = "Customer Onboarding"

### Steps

#### Step 3.1: Schedule Kickoff Call

**Element Type:** Action - Create Event

**Assigned To:** Customer Success Manager
**Invitees:**
- Primary Contact (from Opportunity)
- Technical Owner (from Project)
- Account Executive

**Subject:** `Kickoff Call: {!Project.Name}`
**Duration:** 1 hour
**Due Date:** `TODAY() + 3`

**Description:**
```
Agenda:
1. Introductions (5 min)
2. Project overview and timeline (10 min)
3. Requirements review (20 min)
4. Q&A (20 min)
5. Next steps (5 min)

Preparation:
- Review Opportunity notes
- Review Asana project board
- Prepare questions about domain, branding, integrations

Links:
- Salesforce Project: {!Project.Id}
- Asana Board: {!Project.Asana_Project_URL__c}
- GitHub Repos: {!Project.Backend_Repo_URL__c}
```

---

#### Step 3.2: Wait for Development Milestones

**Element Type:** Wait - Condition-Based

**Condition:**
- At least 50% of Asana tasks in "Build" section marked complete
  **OR**
- Project status manually changed
  **OR**
- 10 days elapsed

**Check Frequency:** Daily

---

#### Step 3.3: Send Progress Update to Client

**Element Type:** Action - Send Email (every week)

**Template:** `Client_Progress_Update`

**To:** Primary Contact
**CC:** Account Executive, Technical Owner

**Merge Fields:**
- Progress summary from Asana
- Link to staging environment (if available)
- Next milestones

---

#### Step 3.4: Wait for Testing Complete

**Element Type:** Interactive Step - Checkbox

**Screen:** "Testing Complete?"

**Assigned To:** QA Lead

**Fields:**
- [ ] All end-to-end tests pass
- [ ] Security scan clean
- [ ] Performance acceptable
- [ ] Client UAT completed

---

#### Step 3.5: Update Project Status

**Element Type:** Action - Update Records

**Record:** Project__c
**Fields:**
- `Status__c` = "Review & Go-Live"
- `Onboarding_Completed__c` = `TODAY()`

---

## Stage 4: Review & Go-Live

**Owner:** Customer Success + DevOps
**Duration:** 2-3 days
**Status Field:** `Project__c.Status__c` = "Review & Go-Live"

### Steps

#### Step 4.1: Final Client Walkthrough

**Element Type:** Action - Create Event

**Assigned To:** Customer Success Manager
**Invitees:** Primary Contact, Technical Owner

**Subject:** `Final Review: {!Project.Name}`
**Duration:** 30 minutes
**Due Date:** `TODAY() + 1`

---

#### Step 4.2: Wait for Client Approval

**Element Type:** Interactive Step - Screen Flow

**Screen:** "Client Approval"

**Assigned To:** Customer Success Manager

**Fields:**
- Radio: "Client approval status" (Approved / Needs Changes / Rejected)
- Text Area: "Client feedback"
- Checkbox: "Client trained on system"

**Conditional Logic:**
- If "Needs Changes" → Loop back to Stage 3, Step 3.2
- If "Rejected" → Escalate to Sales leadership
- If "Approved" → Continue

---

#### Step 4.3: Production Deployment

**Element Type:** Action - Create Task

**Assigned To:** DevOps team
**Subject:** `Deploy to Production: {!Project.Project_Key__c}`
**Priority:** High
**Due Date:** `TODAY() + 1`

**Description:**
```
Project is client-approved and ready for production deployment.

Action:
1. Verify staging is stable
2. Create production Railway/Cloudflare environments
3. Merge to main and deploy (will trigger GitHub Actions)
4. Verify health checks
5. Mark this task complete

Links:
- Asana Deploy Task: {!Project.Asana_Project_URL__c}
- Backend Repo: {!Project.Backend_Repo_URL__c}
- Ops Repo: {!Project.Ops_Repo_URL__c}

Note: Deployment will auto-update Salesforce Project record when complete.
```

---

#### Step 4.4: Wait for Deploy Task Complete

**Element Type:** Wait - Task Completion

**Wait For:** Task created in Step 4.3 to be marked complete

**Timeout:** 3 days
**Escalation:** Alert Engineering Manager if not completed

---

#### Step 4.5: Send Go-Live Notification

**Element Type:** Action - Send Email

**Template:** `Client_GoLive_Notification`

**To:** Primary Contact
**CC:** Account Executive, Customer Success Manager

**Merge Fields:**
- Production URL: `{!Project.Frontend_URL__c}`
- Support contact info
- Documentation links

---

#### Step 4.6: Update Project Status to Active

**Element Type:** Action - Update Records

**Record:** Project__c
**Fields:**
- `Status__c` = "Active"
- `Go_Live_Date__c` = `TODAY()`

---

#### Step 4.7: Create Success Metrics Dashboard

**Element Type:** Action - Create Dashboard (optional)

**Purpose:** Track ongoing project health

**Metrics:**
- Deploy frequency
- Error rates
- Customer support tickets
- Feature adoption

---

## Orchestration Complete

**Final Actions:**

1. **Post to Chatter:** Announce successful onboarding
2. **Update Opportunity:** Set `Stage` = "Closed Won - Active"
3. **Create Renewal Opportunity:** Schedule for renewal date
4. **Archive Orchestration:** Store for audit trail

---

## Error Handling

### If GitHub API Fails (Step 2.1-2.2)

1. Log error to Salesforce
2. Create high-priority task for DevOps
3. Send alert to #ops Slack
4. Pause orchestration (manual resume after fix)

### If Asana API Fails (Step 2.3-2.4)

1. Log error
2. Continue orchestration (Asana is nice-to-have)
3. Create manual Asana project (via SOP)

### If Client Approval Rejected (Step 4.2)

1. Loop back to appropriate stage based on feedback
2. Create issue in GitHub with client feedback
3. Notify engineering team

---

## Monitoring & Metrics

### Track These KPIs:

| Metric | Target | Measured By |
|--------|--------|-------------|
| Time to First Commit | < 3 days from Closed Won | GitHub first commit timestamp |
| Time to Go-Live | < 20 days from Closed Won | `Go_Live_Date__c` - `Start_Date__c` |
| Orchestration Completion Rate | > 95% | Successful completions / total starts |
| Stage Escalations | < 5% | Escalations triggered / total projects |
| Client Approval First-Time Rate | > 80% | Approved without loops / total |

### Weekly Review:
- How many orchestrations in flight?
- Any stuck in a stage for > expected duration?
- Any escalations or errors?

### Monthly Audit:
- Review all completed orchestrations
- Identify bottlenecks
- Update stage durations based on actuals

---

## Deployment Instructions

### Prerequisites:
1. Create all custom objects and fields (see Flow spec)
2. Set up Named Credentials (GitHub, Asana, Slack)
3. Create email templates
4. Set up approval processes

### Build Orchestration:

1. **Setup → Orchestrator → New Orchestration**
2. Name: `New_Client_Kickoff_Orchestration`
3. Add stages (1-4) as specified
4. For each stage, add steps as elements
5. Configure inputs/outputs
6. Set wait conditions
7. Add error handlers
8. Activate

### Test in Sandbox:

1. Create test opportunity
2. Move to Closed Won
3. Verify orchestration starts
4. Walk through each stage
5. Verify APIs called correctly
6. Check error handling

### Deploy to Production:

```bash
sf project deploy start \
  --source-dir force-app/main/default/orchestrations/New_Client_Kickoff_Orchestration.orchestration-meta.xml \
  --target-org production
```

---

## Related Documentation

- [Salesforce Flow: Opp_Automation_OnStageChange](../flows/opp-automation-onstagechange.md)
- [Workflow: New Client Kickoff](../../workflows/new-client-kickoff.md)
- [Integration: Salesforce → GitHub](../../integrations/salesforce-to-github.md)
- [Integration: Salesforce → Asana](../../integrations/salesforce-to-asana.md)
- [Playbook: Brenda's New Client Checklist](../../playbooks/brenda-new-client-checklist.md)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial specification | Cece (Claude) |
