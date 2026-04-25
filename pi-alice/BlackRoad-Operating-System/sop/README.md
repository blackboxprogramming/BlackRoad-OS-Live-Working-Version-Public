# BlackRoad Automation SOP

**Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Active

---

## What This Is

This directory contains the **complete Standard Operating Procedures (SOPs)** for BlackRoad's automated ERP system, which integrates:

- **GitHub** (source control + CI/CD automation)
- **Salesforce** (customer data + business logic)
- **Asana** (project management + task tracking)

**Goal:** Automate the entire journey from "deal closed" to "code deployed" with minimal human intervention.

---

## Quick Start

### For Operators (Brenda)

**Start Here:** [Brenda's New Client Checklist](./playbooks/brenda-new-client-checklist.md)

This is your step-by-step guide for onboarding new clients. No technical knowledge required.

---

### For Engineers

**Start Here:** [New Client Kickoff Workflow](./workflows/new-client-kickoff.md)

Understand how the automation works end-to-end.

**Then:** [Release Pipeline Workflow](./workflows/release-pipeline.md)

Learn how deployments trigger automatic updates across systems.

---

### For Salesforce Admins

**Start Here:**
1. [Salesforce Flow: Opportunity Automation](./salesforce/flows/opp-automation-onstagechange.md)
2. [Salesforce Orchestration: New Client Kickoff](./salesforce/orchestrations/new-client-kickoff-orchestration.md)

These contain detailed specs for building the flows in Salesforce.

---

## Directory Structure

```
sop/
├── README.md                           ← You are here
│
├── workflows/                          ← End-to-end process documentation
│   ├── new-client-kickoff.md          ← Flagship workflow: Deal → Repos → Asana
│   └── release-pipeline.md            ← Deploy → Update Salesforce + Asana
│
├── playbooks/                          ← Human-friendly checklists
│   └── brenda-new-client-checklist.md ← Non-technical operator guide
│
├── salesforce/                         ← Salesforce automation specs
│   ├── flows/
│   │   └── opp-automation-onstagechange.md    ← Trigger on Closed Won
│   └── orchestrations/
│       └── new-client-kickoff-orchestration.md ← Multi-stage process
│
├── integrations/                       ← API integration specifications
│   ├── salesforce-to-github.md        ← Create repos from Salesforce
│   ├── github-to-salesforce.md        ← Update Salesforce after deploy
│   └── salesforce-to-asana.md         ← Create Asana projects from Salesforce
│
├── templates/                          ← Reusable templates
│   ├── github-actions/                ← CI/CD workflow templates
│   │   ├── ci.yml                     ← Test, lint, build
│   │   ├── deploy.yml                 ← Deploy to Railway/Cloudflare
│   │   └── safety.yml                 ← Security scanning
│   └── repo-template/                 ← Standard repo configuration
│       └── .github/
│           ├── pull_request_template.md
│           ├── labels.json
│           ├── branch-protection.md
│           └── ISSUE_TEMPLATE/
│               ├── bug_report.md
│               ├── feature_request.md
│               └── deployment_checklist.md
│
└── prompts/                            ← Claude/Cece prompt seeds
    └── (future: automation setup prompts)
```

---

## The Golden Path (How It All Works)

### 1. Salesforce: Deal Closes

**Human Action:** Sales marks Opportunity as "Closed Won"

**Automation:**
- Salesforce Flow creates Project record
- Orchestration kicks off (4 stages)
- Project Key generated (e.g., `ACME-1042`)

**Doc:** [Opp Automation Flow](./salesforce/flows/opp-automation-onstagechange.md)

---

### 2. GitHub: Repos Created

**Trigger:** Orchestration Stage 2 (Technical Setup)

**Automation:**
- Salesforce calls GitHub API
- 3 repos created:
  - `blackroad-{PROJECT_KEY}-backend`
  - `blackroad-{PROJECT_KEY}-frontend`
  - `blackroad-{PROJECT_KEY}-ops`
- CI/CD workflows added
- Branch protection enabled
- Labels applied
- Secrets configured

**Doc:** [Salesforce → GitHub Integration](./integrations/salesforce-to-github.md)

---

### 3. Asana: Project Board Created

**Trigger:** Same Orchestration Stage 2

**Automation:**
- Salesforce calls Asana API
- Project created with sections:
  - Discovery
  - Architecture
  - Build
  - Testing
  - Go-Live
- ~8-10 standard tasks created
- Tasks assigned with due dates
- Links back to Salesforce + GitHub

**Doc:** [Salesforce → Asana Integration](./integrations/salesforce-to-asana.md)

---

### 4. Engineers Work

**Human Action:** Engineers write code, create PRs, merge to `main`

**Automation:**
- GitHub Actions run CI pipeline (test + lint + build)
- PR must pass checks + get approval
- Merge triggers deploy pipeline
- Code deployed to Railway + Cloudflare

**Doc:** [Release Pipeline Workflow](./workflows/release-pipeline.md)

---

### 5. Feedback Loop

**Trigger:** Deploy succeeds

**Automation:**
- GitHub Actions call Salesforce API
- Update Project record:
  - `Last_Deploy_At__c`
  - `Last_Deploy_SHA__c`
  - `Deploy_Status__c`
- Create Deployment record for audit
- Call Asana API to mark "Deploy to production" task complete
- Post deploy notification to Slack

**Doc:** [GitHub → Salesforce Integration](./integrations/github-to-salesforce.md)

---

### 6. Go-Live

**Human Action:** Customer Success does final walkthrough with client

**Automation:**
- Project status updated to "Active"
- Go-live email sent automatically
- Renewal opportunity created
- Success metrics dashboard initialized

**Doc:** [New Client Kickoff Orchestration](./salesforce/orchestrations/new-client-kickoff-orchestration.md)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Get basic automation working

**Tasks:**
- [ ] Create Salesforce custom objects (Project__c, Deployment__c)
- [ ] Set up Salesforce Named Credentials (GitHub, Asana)
- [ ] Create test GitHub repos manually
- [ ] Apply GitHub Actions workflows from templates
- [ ] Test Salesforce → GitHub API call manually

**Docs:**
- [Salesforce Flow Spec](./salesforce/flows/opp-automation-onstagechange.md)
- [Salesforce → GitHub Integration](./integrations/salesforce-to-github.md)

---

### Phase 2: Core Workflow (Week 2-3)

**Goal:** Automate new client kickoff

**Tasks:**
- [ ] Build Salesforce Flow: Opp_Automation_OnStageChange
- [ ] Build Salesforce Orchestration: New_Client_Kickoff
- [ ] Implement GitHub repo creation (via Flow)
- [ ] Implement Asana project creation (via Flow)
- [ ] Test end-to-end with 1 test client

**Docs:**
- [New Client Kickoff Workflow](./workflows/new-client-kickoff.md)
- [Salesforce Orchestration Spec](./salesforce/orchestrations/new-client-kickoff-orchestration.md)

---

### Phase 3: Feedback Loop (Week 4)

**Goal:** Close the loop with deploy notifications

**Tasks:**
- [ ] Add GitHub → Salesforce workflow to repos
- [ ] Test deploy updates Salesforce Project record
- [ ] Add GitHub → Asana integration (mark tasks complete)
- [ ] Set up Slack notifications
- [ ] Deploy to 3 pilot projects

**Docs:**
- [Release Pipeline Workflow](./workflows/release-pipeline.md)
- [GitHub → Salesforce Integration](./integrations/github-to-salesforce.md)

---

### Phase 4: Scale (Week 5+)

**Goal:** Roll out to all new clients

**Tasks:**
- [ ] Train operations team on new process
- [ ] Document troubleshooting steps
- [ ] Create monitoring dashboard
- [ ] Roll out to all new deals
- [ ] Migrate existing clients gradually

**Docs:**
- [Brenda's Checklist](./playbooks/brenda-new-client-checklist.md)

---

## Key Principles

### 1. Event-Driven Everything

**Old Way:** "Brenda, can you create the repos and set up Asana?"

**New Way:** Mark opportunity as Closed Won → everything happens automatically

---

### 2. GitHub-First Configuration

All workflows, templates, and configs live in **version control** (this repo).

Changes go through PR → review → merge → deploy.

---

### 3. Two Views

**Operator View:** Simple checklists, no jargon, clear escalation paths

**Engineer View:** Detailed specs, API payloads, error handling

---

### 4. No Manual Status Syncing

Status lives in **one place** (Salesforce Project record).

Everything else subscribes via API.

---

## Troubleshooting

### "Repos didn't get created after 15 minutes"

1. Check Salesforce debug logs for HTTP callout errors
2. Verify GitHub API credentials in Named Credential
3. Check GitHub App permissions
4. See: [Salesforce → GitHub Integration, Error Handling](./integrations/salesforce-to-github.md#error-handling)

---

### "Asana project is missing tasks"

1. Check Salesforce debug logs
2. Verify Asana PAT is valid
3. Check custom metadata: Asana_Task_Template__mdt
4. See: [Salesforce → Asana Integration, Error Handling](./integrations/salesforce-to-asana.md#error-handling)

---

### "Deploy didn't update Salesforce"

1. Check GitHub Actions workflow logs
2. Verify PROJECT_KEY was extracted correctly from repo name
3. Check Salesforce API credentials in GitHub secrets
4. See: [GitHub → Salesforce Integration, Error Handling](./integrations/github-to-salesforce.md#error-handling)

---

### "How do I report an automation bug?"

**In GitHub:**
1. Go to this repo
2. Create new issue
3. Use label: `automation-bug`
4. Include:
   - Salesforce Project URL
   - Expected vs. actual behavior
   - Screenshots/logs

**In Slack:**
Post in #ops with:
- Project Key
- What broke
- Link to Salesforce Project

---

## Metrics & Monitoring

### Track These KPIs:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to First Commit | < 3 days | GitHub first commit - SF Start Date |
| Time to Go-Live | < 20 days | Go Live Date - Start Date |
| Automation Success Rate | > 95% | Projects with repos / Total projects |
| Manual Intervention Rate | < 10% | Projects needing fixes / Total |
| Deploy Frequency | > 5/week | Deploys per project per week |
| Deploy Success Rate | > 95% | Successful deploys / Total |

**Salesforce Reports:**
- "Projects by Status"
- "Deployments by Week"
- "Automation Errors (Last 30 Days)"

**GitHub Insights:**
- Actions usage
- Deploy frequency
- Build success rate

---

## Team Roles

### Operations (Brenda)

**Responsibilities:**
- Mark deals as Closed Won
- Verify automation ran successfully
- Communicate with clients
- Monitor Asana project progress
- Escalate issues to engineering

**Primary Doc:** [Brenda's Checklist](./playbooks/brenda-new-client-checklist.md)

---

### Salesforce Admin

**Responsibilities:**
- Build and maintain Flows + Orchestrations
- Manage Named Credentials
- Monitor API logs
- Troubleshoot Salesforce-side errors

**Primary Docs:**
- [Salesforce Flow Spec](./salesforce/flows/opp-automation-onstagechange.md)
- [Salesforce Orchestration Spec](./salesforce/orchestrations/new-client-kickoff-orchestration.md)

---

### DevOps / Engineering

**Responsibilities:**
- Maintain GitHub Actions workflows
- Configure repos via automation
- Monitor deploy pipelines
- Troubleshoot GitHub/Railway/Cloudflare issues

**Primary Docs:**
- [Release Pipeline Workflow](./workflows/release-pipeline.md)
- [GitHub Actions Templates](./templates/github-actions/)

---

### Integration Engineer

**Responsibilities:**
- Maintain API integrations
- Monitor API logs and rate limits
- Update integration specs
- Handle authentication issues

**Primary Docs:**
- [Salesforce → GitHub Integration](./integrations/salesforce-to-github.md)
- [GitHub → Salesforce Integration](./integrations/github-to-salesforce.md)
- [Salesforce → Asana Integration](./integrations/salesforce-to-asana.md)

---

## Security & Compliance

### Credentials Management

**Salesforce:**
- Use Named Credentials (not hardcoded tokens)
- Rotate OAuth tokens quarterly
- Use encrypted custom settings for sensitive data

**GitHub:**
- Use GitHub App (not PAT) for production
- Rotate secrets every 90 days
- Use organization-level secrets where possible

**Asana:**
- Use dedicated integration PAT
- Don't share PAT across integrations
- Rotate every 90 days

---

### Audit Trail

**Track:**
- All API calls (Salesforce Custom Object: API_Log__c)
- All deployments (Salesforce: Deployment__c)
- All automation errors (Cases with Type = "Automation Bug")

**Review:**
- Weekly: Error logs
- Monthly: Success rates, anomalies
- Quarterly: Security audit, credential rotation

---

## FAQs

### Q: What if I need to create a repo manually?

**A:** Follow the [Repo Template](./templates/repo-template/) to apply:
- Labels
- Branch protection
- Workflows
- PR template
- Issue templates

Then manually update Salesforce Project record with repo URLs.

---

### Q: Can I customize the Asana tasks for different package types?

**A:** Yes! Edit the Custom Metadata Type: `Asana_Task_Template__mdt`

Add records with conditions based on Package_Type__c.

---

### Q: How do I add a new GitHub Actions workflow to all repos?

**A:**
1. Add workflow to [templates/github-actions/](./templates/github-actions/)
2. Update Salesforce Flow to include new workflow in repo creation
3. For existing repos, use a script or PR to all repos

---

### Q: What if a client wants a custom domain (not .blackroad.app)?

**A:** Update the `Primary_Domain__c` field in Salesforce, then:
1. Configure Cloudflare custom domain
2. Update environment variables in Railway
3. Redeploy frontend

---

## Contributing

This SOP is **living documentation**. If you:
- Find an error
- Want to improve a process
- Have a better way to do something

**Submit a PR!**

1. Edit the relevant `.md` file
2. Create a PR with clear description
3. Tag @ops or @devops for review
4. Merge once approved

---

## Support

### Internal Support

**Slack Channels:**
- `#ops` - General operations questions
- `#dev` - Engineering / technical questions
- `#automation` - Automation bugs and improvements

**Email:**
- ops@blackroad.com - Operations team
- devops@blackroad.com - DevOps team

---

### External Resources

**Salesforce:**
- [Flow Builder Docs](https://help.salesforce.com/s/articleView?id=sf.flow.htm)
- [REST API Docs](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)

**GitHub:**
- [Actions Docs](https://docs.github.com/en/actions)
- [REST API Docs](https://docs.github.com/en/rest)

**Asana:**
- [API Docs](https://developers.asana.com/docs)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial SOP created - complete automation system | Cece (Claude) |

---

## Next Steps

**If you're here to implement this:**

1. **Week 1:** Read [New Client Kickoff Workflow](./workflows/new-client-kickoff.md)
2. **Week 2:** Set up Salesforce objects + credentials
3. **Week 3:** Build the Salesforce Flow
4. **Week 4:** Test with 1 test client end-to-end
5. **Week 5:** Roll out to production

**If you're here to use this:**

- **Operators:** [Brenda's Checklist](./playbooks/brenda-new-client-checklist.md)
- **Engineers:** [Release Pipeline](./workflows/release-pipeline.md)
- **Salesforce Admins:** [Flow Spec](./salesforce/flows/opp-automation-onstagechange.md)

---

**Welcome to Automate The Company Day. Let's make it happen.** 🚀
