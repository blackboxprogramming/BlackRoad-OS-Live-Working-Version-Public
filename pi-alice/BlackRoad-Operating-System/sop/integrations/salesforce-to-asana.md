# Integration: Salesforce → Asana

**Purpose:** Enable Salesforce to create and manage Asana projects and tasks automatically
**Direction:** Salesforce calls Asana REST API
**Authentication:** Personal Access Token (PAT)
**Status:** Active
**Last Updated:** 2025-11-17

---

## Overview

This integration allows Salesforce Flows and Orchestrations to:
- Create Asana projects
- Add sections to projects
- Create tasks with assignments and due dates
- Update task status
- Add comments to tasks

**Key Use Case:** Auto-create Asana project board when Opportunity closes

---

## Authentication Setup

### Asana Personal Access Token (PAT)

**Setup Steps:**

1. **Generate PAT:**
   - Go to: https://app.asana.com/0/my-apps
   - Click "Personal access tokens"
   - Click "+ New access token"
   - Name: `Salesforce Integration`
   - Copy token (starts with `1/...`)

2. **Store in Salesforce:**
   - Setup → Named Credentials → New
   - Name: `Asana_API`
   - URL: `https://app.asana.com/api/1.0`
   - Identity Type: Named Principal
   - Authentication Protocol: Custom
   - Header: `Authorization: Bearer {YOUR_PAT}`

**Alternative:** Use Custom Settings

```
Setup → Custom Settings → New (Protected)
Name: Asana_Settings__c
Fields:
  - API_Token__c (Text, Encrypted)
  - Workspace_GID__c (Text)
  - Team_GID__c (Text)
```

---

## Required Asana Setup

### 1. Get Workspace GID

```bash
curl "https://app.asana.com/api/1.0/workspaces" \
  -H "Authorization: Bearer YOUR_PAT"
```

**Response:**
```json
{
  "data": [
    {
      "gid": "1234567890123456",
      "name": "BlackRoad Workspace",
      "resource_type": "workspace"
    }
  ]
}
```

**Store:** `WORKSPACE_GID = "1234567890123456"`

---

### 2. Get Team GID

```bash
curl "https://app.asana.com/api/1.0/organizations/1234567890123456/teams" \
  -H "Authorization: Bearer YOUR_PAT"
```

**Response:**
```json
{
  "data": [
    {
      "gid": "9876543210987654",
      "name": "Engineering",
      "resource_type": "team"
    }
  ]
}
```

**Store:** `TEAM_GID = "9876543210987654"`

---

### 3. Get User GIDs for Assignments

```bash
curl "https://app.asana.com/api/1.0/users?workspace=1234567890123456" \
  -H "Authorization: Bearer YOUR_PAT"
```

**Response:**
```json
{
  "data": [
    {
      "gid": "1111111111111111",
      "name": "Alice Developer",
      "email": "alice@blackroad.com"
    },
    {
      "gid": "2222222222222222",
      "name": "Bob DevOps",
      "email": "bob@blackroad.com"
    }
  ]
}
```

**Create Salesforce Mapping:**

| Role | Email | Asana GID |
|------|-------|-----------|
| DevOps Lead | bob@blackroad.com | 2222222222222222 |
| Backend Lead | alice@blackroad.com | 1111111111111111 |
| Customer Success | brenda@blackroad.com | 3333333333333333 |

Store in Custom Metadata Type: `Asana_User_Mapping__mdt`

---

## API Operations

### 1. Create Project

**Endpoint:**
```
POST https://app.asana.com/api/1.0/projects
```

**Headers:**
```
Authorization: Bearer {ASANA_PAT}
Content-Type: application/json
```

**Payload:**
```json
{
  "data": {
    "workspace": "1234567890123456",
    "team": "9876543210987654",
    "name": "Acme Corp - ACME-1042",
    "notes": "Salesforce Project: https://your-domain.my.salesforce.com/a0X5e000000XYZ1EAO\n\nRepos:\n- Backend: https://github.com/blackboxprogramming/blackroad-ACME-1042-backend\n- Frontend: https://github.com/blackboxprogramming/blackroad-ACME-1042-frontend\n- Ops: https://github.com/blackboxprogramming/blackroad-ACME-1042-ops",
    "color": "light-green",
    "default_view": "board",
    "public": false
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "gid": "5555555555555555",
    "name": "Acme Corp - ACME-1042",
    "permalink_url": "https://app.asana.com/0/5555555555555555/list"
  }
}
```

**Salesforce Flow Implementation:**

```yaml
Element: HTTP Callout
Method: POST
Endpoint: {!$Credential.Asana_API}/projects
Headers:
  - Authorization: Bearer {!$Credential.Asana_API.Token}
  - Content-Type: application/json
Body:
  {
    "data": {
      "workspace": "{!$CustomMetadata.Asana_Settings__mdt.Workspace_GID__c}",
      "team": "{!$CustomMetadata.Asana_Settings__mdt.Team_GID__c}",
      "name": "{!varProject.Name}",
      "notes": "Salesforce: {!varProject.Id}\nRepos:\n- {!varProject.Backend_Repo_URL__c}",
      "color": "light-green",
      "default_view": "board"
    }
  }

Store Response: varAsanaResponse
Parse:
  - varAsanaProjectGID = {!varAsanaResponse.data.gid}
  - varAsanaProjectURL = {!varAsanaResponse.data.permalink_url}

Update Project Record:
  - Asana_Project_URL__c = {!varAsanaProjectURL}
  - Asana_Project_GID__c = {!varAsanaProjectGID}
```

---

### 2. Create Section

**Endpoint:**
```
POST https://app.asana.com/api/1.0/projects/{PROJECT_GID}/sections
```

**Payload:**
```json
{
  "data": {
    "name": "Discovery"
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "gid": "6666666666666666",
    "name": "Discovery"
  }
}
```

**Salesforce Implementation:**

```yaml
Element: Loop
Collection: ["Discovery", "Architecture", "Build", "Testing", "Go-Live"]
Current Item: varSectionName

Inside Loop:
  - HTTP Callout
  - Endpoint: {!$Credential.Asana_API}/projects/{!varAsanaProjectGID}/sections
  - Body: {"data": {"name": "{!varSectionName}"}}
  - Store Response: varSectionResponse
  - Add to Collection: varSectionGIDs[{!varSectionName}] = {!varSectionResponse.data.gid}
```

---

### 3. Create Task

**Endpoint:**
```
POST https://app.asana.com/api/1.0/tasks
```

**Payload:**
```json
{
  "data": {
    "projects": ["5555555555555555"],
    "name": "Confirm domain + DNS with client",
    "notes": "Get final domain, subdomain, and DNS setup requirements from client.\n\nSalesforce Project: https://your-domain.my.salesforce.com/a0X5e000000XYZ1EAO",
    "assignee": "3333333333333333",
    "due_on": "2025-11-20",
    "memberships": [
      {
        "project": "5555555555555555",
        "section": "6666666666666666"
      }
    ]
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "gid": "7777777777777777",
    "name": "Confirm domain + DNS with client",
    "permalink_url": "https://app.asana.com/0/5555555555555555/7777777777777777"
  }
}
```

**Salesforce Implementation:**

```yaml
Element: Loop
Collection: varTaskDefinitions (custom metadata or JSON)
Current Item: varTask

Inside Loop:
  - Calculate Due Date
    Formula: TODAY() + {!varTask.DaysOffset}

  - Lookup Assignee GID
    From: Asana_User_Mapping__mdt
    Match: Role = {!varTask.AssigneeRole}

  - HTTP Callout
  - Endpoint: {!$Credential.Asana_API}/tasks
  - Body:
      {
        "data": {
          "projects": ["{!varAsanaProjectGID}"],
          "name": "{!varTask.Name}",
          "notes": "{!varTask.Description}\n\nSalesforce: {!varProject.Id}",
          "assignee": "{!varAssigneeGID}",
          "due_on": "{!varDueDate}",
          "memberships": [{
            "project": "{!varAsanaProjectGID}",
            "section": "{!varSectionGIDs[varTask.Section]}"
          }]
        }
      }
```

---

### 4. Update Task (Mark Complete)

**Endpoint:**
```
PUT https://app.asana.com/api/1.0/tasks/{TASK_GID}
```

**Payload:**
```json
{
  "data": {
    "completed": true
  }
}
```

**Response (200 OK):**
```json
{
  "data": {
    "gid": "7777777777777777",
    "completed": true
  }
}
```

---

### 5. Add Comment to Task

**Endpoint:**
```
POST https://app.asana.com/api/1.0/tasks/{TASK_GID}/stories
```

**Payload:**
```json
{
  "data": {
    "text": "✅ Deployed v0.1.3 to production\n\n**Commit:** a1b2c3d4\n**By:** github-user\n**Time:** 2025-11-17 14:30 UTC\n**Link:** https://github.com/org/repo/commit/a1b2c3d4"
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "gid": "8888888888888888",
    "text": "✅ Deployed v0.1.3..."
  }
}
```

---

## Task Template Definition

**Store in Salesforce Custom Metadata:** `Asana_Task_Template__mdt`

| Label | API Name | Section__c | Days_Offset__c | Assignee_Role__c |
|-------|----------|------------|----------------|------------------|
| Confirm domain + DNS | Confirm_Domain_DNS | Discovery | 1 | Sales Ops |
| Gather branding assets | Gather_Branding | Discovery | 1 | Design |
| Wire up Railway/Cloudflare | Wire_Up_Envs | Architecture | 3 | DevOps |
| Enable CI/CD secrets | Enable_Secrets | Architecture | 3 | DevOps |
| Set up database | Setup_Database | Build | 5 | Backend |
| Implement authentication | Implement_Auth | Build | 7 | Backend |
| Run E2E tests | Run_E2E_Tests | Testing | 12 | QA |
| Final client walkthrough | Final_Walkthrough | Go-Live | 18 | Customer Success |
| Deploy to production | Deploy_Production | Go-Live | 19 | DevOps |

**Query in Flow:**

```apex
[SELECT Label, Section__c, Days_Offset__c, Assignee_Role__c, Description__c
 FROM Asana_Task_Template__mdt
 ORDER BY Days_Offset__c ASC]
```

---

## Complete Salesforce Flow Example

**Flow Name:** `Asana_Project_Setup`

**Input Variables:**
- `ProjectRecordId` (Text)
- `AsanaProjectGID` (Text) - from Create Project step

**Steps:**

```yaml
1. Get Project Record
   - Object: Project__c
   - Filter: Id = {!ProjectRecordId}

2. Create Asana Project
   - HTTP Callout (as documented)
   - Store: varAsanaProjectGID

3. Create Sections
   - Loop: ["Discovery", "Architecture", "Build", "Testing", "Go-Live"]
   - HTTP Callout per section
   - Store GIDs in Map: varSectionGIDs

4. Get Task Templates
   - Get Records: Asana_Task_Template__mdt
   - Store: varTaskTemplates

5. Loop: Create Tasks
   - For Each: varTaskTemplates
   - Calculate due date: TODAY() + DaysOffset
   - Lookup assignee GID from Asana_User_Mapping__mdt
   - HTTP Callout to create task
   - Link task to correct section

6. Update Project Record
   - Asana_Project_URL__c = {!varAsanaResponse.data.permalink_url}
   - Asana_Project_GID__c = {!varAsanaProjectGID}
```

---

## User Mapping Setup

**Custom Metadata Type:** `Asana_User_Mapping__mdt`

**Fields:**
- `Role__c` (Text) - "DevOps", "Backend", "Customer Success", etc.
- `Email__c` (Email)
- `Asana_GID__c` (Text)

**Records:**

| Label | Role__c | Email__c | Asana_GID__c |
|-------|---------|----------|--------------|
| DevOps Team | DevOps | devops@blackroad.com | 2222222222222222 |
| Backend Team | Backend | backend@blackroad.com | 1111111111111111 |
| Customer Success | Customer Success | brenda@blackroad.com | 3333333333333333 |
| QA Team | QA | qa@blackroad.com | 4444444444444444 |

**Query in Flow:**

```apex
[SELECT Asana_GID__c
 FROM Asana_User_Mapping__mdt
 WHERE Role__c = :assigneeRole
 LIMIT 1]
```

---

## Error Handling

### Common Errors

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 400 | Bad Request | Invalid GID or payload | Verify workspace/team GIDs |
| 401 | Unauthorized | Invalid token | Regenerate PAT in Asana |
| 403 | Forbidden | No access to workspace | Check PAT has workspace access |
| 404 | Not Found | Project/task doesn't exist | Verify GID is correct |
| 429 | Too Many Requests | Rate limit exceeded | Implement exponential backoff |

### Salesforce Fault Path

```yaml
Fault Path:
  - Element: Create Case
    Subject: "Asana Integration Error: {!$Flow.FaultMessage}"
    Description: "Failed to create Asana project for: {!varProject.Name}\n\nError: {!$Flow.FaultMessage}"
    Priority: Medium
    Type: "Automation Bug"

  - Element: Send Email
    To: ops@blackroad.com
    Subject: "Asana Automation Failed - Manual Project Needed"
    Body: "Project: {!varProject.Name}\nKey: {!varProject.Project_Key__c}\n\nPlease create Asana project manually."
```

---

## Rate Limits

**Asana API Rate Limits:**
- 1,500 requests per minute per user
- Burst: Up to 60 requests in the first second

**Per Asana Project Creation:**
- 1 request: Create project
- 5 requests: Create sections
- 8-10 requests: Create tasks
- **Total:** ~15 requests

**Best Practices:**
- Can create ~100 projects per minute
- Add delay between operations if hitting limits
- Use exponential backoff on 429 errors

---

## Testing

### Manual Test (curl)

```bash
# 1. Create project
curl -X POST "https://app.asana.com/api/1.0/projects" \
  -H "Authorization: Bearer YOUR_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "workspace": "1234567890123456",
      "name": "Test Project - DELETE ME"
    }
  }'

# Response: Get project GID (e.g., 5555555555555555)

# 2. Create section
curl -X POST "https://app.asana.com/api/1.0/projects/5555555555555555/sections" \
  -H "Authorization: Bearer YOUR_PAT" \
  -d '{"data": {"name": "To Do"}}'

# 3. Create task
curl -X POST "https://app.asana.com/api/1.0/tasks" \
  -H "Authorization: Bearer YOUR_PAT" \
  -d '{
    "data": {
      "projects": ["5555555555555555"],
      "name": "Test task"
    }
  }'

# 4. Clean up - delete project
curl -X DELETE "https://app.asana.com/api/1.0/projects/5555555555555555" \
  -H "Authorization: Bearer YOUR_PAT"
```

### Salesforce Sandbox Test

1. Create test Project record
2. Run flow: `Asana_Project_Setup`
3. Verify:
   - Project created in Asana
   - Sections present
   - Tasks created with correct assignees
   - Due dates calculated correctly
4. Clean up test project in Asana

---

## Monitoring

**Track These Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Asana API Success Rate | > 98% | < 95% |
| Avg Project Creation Time | < 30s | > 60s |
| Failed Project Creations | < 2% | > 5% |
| Tasks Created Per Project | ~8-10 | < 5 or > 15 |

**Salesforce Custom Object:** `Asana_API_Log__c`

**Fields:**
- Operation__c (Create Project, Create Task, etc.)
- Project__c (Lookup)
- Status__c (Success, Failed)
- Response_Time__c
- Error_Message__c
- Timestamp__c

---

## Security Best Practices

1. **PAT Security:**
   - Never share PAT
   - Use encrypted custom settings
   - Rotate every 90 days
   - Generate separate PAT per integration (if multiple)

2. **Project Visibility:**
   - Set `public: false` for client projects
   - Only share with relevant team members
   - Review permissions quarterly

3. **Audit Logging:**
   - Log all Asana API calls in Salesforce
   - Review monthly
   - Track who accessed projects

---

## Related Documentation

- [Asana API Docs: Projects](https://developers.asana.com/docs/projects)
- [Asana API Docs: Tasks](https://developers.asana.com/docs/tasks)
- [Salesforce Orchestration: New Client Kickoff](../salesforce/orchestrations/new-client-kickoff-orchestration.md)
- [Workflow: New Client Kickoff](../workflows/new-client-kickoff.md)
- [Integration: Salesforce → GitHub](./salesforce-to-github.md)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial specification | Cece (Claude) |
