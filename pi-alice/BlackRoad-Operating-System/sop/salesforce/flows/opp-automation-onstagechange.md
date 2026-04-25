# Salesforce Flow: Opportunity Automation on Stage Change

**API Name:** `Opp_Automation_OnStageChange`
**Type:** Record-Triggered Flow (After Save)
**Object:** Opportunity
**Status:** Active
**Last Updated:** 2025-11-17

---

## Purpose

This flow automates the creation of Project records and kickoff of the orchestration when an Opportunity moves to "Closed Won" stage.

**Business Value:**
- Eliminates manual project setup
- Ensures consistency across all new clients
- Triggers downstream automation (GitHub, Asana)
- Captures all required metadata at deal closure

---

## Trigger Configuration

### Object
`Opportunity`

### Trigger Type
**Record-Triggered Flow (After Save)**

### Trigger Criteria
**When:** A record is updated
**Condition Requirements:**
- **StageName** changed
- **StageName** equals "Closed Won"

**Entry Condition Logic:**
```
AND(
  ISCHANGED(StageName),
  TEXT(StageName) = "Closed Won"
)
```

### Optimization
- ✅ Run asynchronously (Fast Field Updates) - **No** (need to create related records)
- ✅ Trigger order - **1** (run first, before other flows)

---

## Flow Variables

Create these variables at the start:

| Variable Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `varProjectKey` | Text | null | Generated project key (e.g., ACME-X7K9) |
| `varAccountSlug` | Text | null | Account name converted to slug |
| `varRandomSuffix` | Text | null | 4-character random suffix |
| `varProjectRecord` | Record (Project__c) | null | Created project record |
| `varExistingProject` | Record Collection (Project__c) | null | Check for existing project |

---

## Flow Logic

### 1. Decision: Validate Required Fields

**Element Type:** Decision

**Criteria:**
Check if all required fields are populated:

```
AND(
  NOT(ISBLANK({!$Record.AccountId})),
  NOT(ISBLANK({!$Record.Primary_Domain__c})),
  NOT(ISBLANK({!$Record.Package_Type__c})),
  NOT(ISBLANK({!$Record.Service_Tier__c}))
)
```

**Outcomes:**
- **Valid** → Continue to next step
- **Invalid** → Send error notification and stop

---

### 2A. Path: Invalid - Send Error Notification

**Element Type:** Action - Send Email

**To:** Opportunity Owner
**Subject:** `Action Required: Opportunity {!$Record.Name} Missing Information`
**Body:**
```
The opportunity "{!$Record.Name}" was marked as Closed Won, but is missing required information:

Required Fields:
- Account
- Primary Domain
- Package Type
- Service Tier

Please update the opportunity and change the stage to "Closed Won" again to trigger automation.

Opportunity Link: {!$Record.Id}
```

**Then:** Stop

---

### 2B. Path: Valid - Continue

#### Step 2.1: Check for Existing Project

**Element Type:** Get Records

**Object:** `Project__c`
**Conditions:**
- `Opportunity__c` equals `{!$Record.Id}`

**Store Output:** `varExistingProject`

---

#### Step 2.2: Decision: Project Already Exists?

**Criteria:**
```
NOT(ISNULL({!varExistingProject}))
```

**Outcomes:**
- **Exists** → Skip creation, update existing
- **Does Not Exist** → Create new project

---

#### Step 2.3A: Path: Project Exists - Update It

**Element Type:** Update Records

**Record:** `{!varExistingProject[0]}`
**Fields to Update:**
- `Status__c` = "Setup In Progress"
- `Updated_From_Opp__c` = `TODAY()`
- `Service_Tier__c` = `{!$Record.Service_Tier__c}`
- `Package_Type__c` = `{!$Record.Package_Type__c}`

**Then:** Skip to Step 3 (Launch Orchestration)

---

#### Step 2.3B: Path: Project Does Not Exist - Create It

##### Step 2.3B.1: Generate Account Slug

**Element Type:** Assignment

**Variable:** `varAccountSlug`
**Operator:** Equals
**Value:** Formula:
```
SUBSTITUTE(
  SUBSTITUTE(
    SUBSTITUTE(
      UPPER(LEFT({!$Record.Account.Name}, 10)),
      " ", "-"
    ),
    ".", ""
  ),
  ",", ""
)
```

**Purpose:** Convert "Acme Corp." → "ACME-CORP"

---

##### Step 2.3B.2: Generate Random Suffix

**Element Type:** Assignment

**Variable:** `varRandomSuffix`
**Value:** Formula:
```
SUBSTITUTE(
  LEFT(TEXT(RAND()), 4),
  "0.", ""
) & TEXT(FLOOR(RAND() * 10000))
```

**Note:** Generates a 4-character alphanumeric suffix (simplified version; in production, use a more robust random generator or auto-number)

**Better Alternative:** Use Salesforce auto-number field on Project__c:
- Field: `Project_Number__c` (Auto Number)
- Format: `{0000}`
- Starting Number: `1000`

---

##### Step 2.3B.3: Build Project Key

**Element Type:** Assignment

**Variable:** `varProjectKey`
**Value:**
```
{!varAccountSlug} & "-" & TEXT({!$Record.Project_Number__c})
```

**Example Output:** `ACME-1042`

---

##### Step 2.3B.4: Create Project Record

**Element Type:** Create Records

**Object:** `Project__c`

**Fields:**

| Field API Name | Value |
|----------------|-------|
| `Name` | `{!$Record.Account.Name} - {!varProjectKey}` |
| `Project_Key__c` | `{!varProjectKey}` |
| `Account__c` | `{!$Record.AccountId}` |
| `Opportunity__c` | `{!$Record.Id}` |
| `Primary_Domain__c` | `{!$Record.Primary_Domain__c}` |
| `Package_Type__c` | `{!$Record.Package_Type__c}` |
| `Service_Tier__c` | `{!$Record.Service_Tier__c}` |
| `Start_Date__c` | `TODAY()` |
| `Status__c` | `"Setup In Progress"` |
| `Technical_Owner__c` | `{!$Record.OwnerId}` (or default to a user) |
| `OwnerId` | `{!$Record.OwnerId}` |

**Store Output:** `varProjectRecord`

---

### 3. Launch Orchestration

**Element Type:** Action - Orchestration

**Orchestration Name:** `New_Client_Kickoff_Orchestration`

**Input Variables:**
- `ProjectRecordId` = `{!varProjectRecord.Id}`
- `OpportunityRecordId` = `{!$Record.Id}`
- `AccountRecordId` = `{!$Record.AccountId}`

**Run Asynchronously:** Yes

---

### 4. Send Notification to Ops Team

**Element Type:** Action - Post to Chatter / Slack

**Option A: Chatter Post**
```
New project created! 🚀

Project: {!varProjectRecord.Name}
Project Key: {!varProjectRecord.Project_Key__c}
Account: {!$Record.Account.Name}
Package: {!$Record.Package_Type__c}

Orchestration started. GitHub repos and Asana project will be created within 5-10 minutes.

Link: {!varProjectRecord.Id}
```

**Option B: Slack (via HTTP Callout)**

See [Integration: Salesforce → Slack](../../integrations/salesforce-to-slack.md)

---

### 5. Update Opportunity with Project Link

**Element Type:** Update Records

**Record:** `{!$Record}`
**Fields to Update:**
- `Project__c` (Lookup field) = `{!varProjectRecord.Id}`

---

## Error Handling

### Fault Path

If any step fails:

**Element Type:** Action - Create Case

**Fields:**
- `Subject` = `"Automation Error: {!$Record.Name} Project Creation Failed"`
- `Description` = `"Error creating project for opportunity: {!$Record.Id}\n\nError: {!$Flow.FaultMessage}"`
- `Priority` = `"High"`
- `Type` = `"Automation Bug"`
- `OwnerId` = `<DevOps Queue ID>`

**Then:** Send email to DevOps team

---

## Testing Checklist

Before activating:

- [ ] Test with valid opportunity (all fields populated)
- [ ] Test with missing fields (verify error email)
- [ ] Test with existing project (verify update path)
- [ ] Verify project key generation (unique and correct format)
- [ ] Verify orchestration kicks off
- [ ] Check Chatter/Slack notification appears
- [ ] Verify fault path (intentionally cause error)

---

## Required Salesforce Objects & Fields

### Opportunity Custom Fields

Add these to the Opportunity object if they don't exist:

| Field API Name | Type | Picklist Values | Description |
|----------------|------|-----------------|-------------|
| `Primary_Domain__c` | Text(80) | N/A | Client's desired subdomain |
| `Package_Type__c` | Picklist | OS, Console, Custom | Product package purchased |
| `Service_Tier__c` | Picklist | Starter, Pro, Enterprise | Service level |
| `Project__c` | Lookup(Project__c) | N/A | Link to created project |

---

### Project Custom Object

Create this custom object:

**API Name:** `Project__c`
**Label:** Project
**Plural Label:** Projects
**Record Name:** Project Name (Text)

#### Fields:

| Field API Name | Type | Length/Format | Unique | Required | Description |
|----------------|------|---------------|--------|----------|-------------|
| `Project_Key__c` | Text | 20 | ✅ Yes | ✅ Yes | Unique project identifier (e.g., ACME-1042) |
| `Account__c` | Lookup(Account) | N/A | ❌ | ✅ | Related account |
| `Opportunity__c` | Lookup(Opportunity) | N/A | ❌ | ✅ | Related opportunity |
| `Primary_Domain__c` | Text | 80 | ❌ | ✅ | Client's subdomain |
| `Package_Type__c` | Picklist | N/A | ❌ | ✅ | OS, Console, Custom |
| `Service_Tier__c` | Picklist | N/A | ❌ | ✅ | Starter, Pro, Enterprise |
| `Start_Date__c` | Date | N/A | ❌ | ✅ | Project start date |
| `Status__c` | Picklist | N/A | ❌ | ✅ | Setup In Progress, Active, On Hold, Completed |
| `Technical_Owner__c` | Lookup(User) | N/A | ❌ | ❌ | Lead developer |
| `Backend_Repo_URL__c` | URL | 255 | ❌ | ❌ | GitHub backend repo |
| `Frontend_Repo_URL__c` | URL | 255 | ❌ | ❌ | GitHub frontend repo |
| `Ops_Repo_URL__c` | URL | 255 | ❌ | ❌ | GitHub ops repo |
| `Asana_Project_URL__c` | URL | 255 | ❌ | ❌ | Asana project |
| `Last_Deploy_At__c` | DateTime | N/A | ❌ | ❌ | Last deployment timestamp |
| `Last_Deploy_SHA__c` | Text | 40 | ❌ | ❌ | Git commit SHA |
| `Last_Deploy_Branch__c` | Text | 100 | ❌ | ❌ | Git branch |
| `Last_Deploy_Actor__c` | Text | 100 | ❌ | ❌ | Who deployed |
| `Deploy_Status__c` | Picklist | N/A | ❌ | ❌ | Success, Failed, Rollback |
| `Environment__c` | Picklist | N/A | ❌ | ❌ | Staging, Production |
| `Backend_URL__c` | URL | 255 | ❌ | ❌ | Production backend URL |
| `Frontend_URL__c` | URL | 255 | ❌ | ❌ | Production frontend URL |
| `Release_Notes_URL__c` | URL | 255 | ❌ | ❌ | Link to latest release notes |

#### Page Layouts:

Create page layout with sections:
1. **Project Information** (Name, Project Key, Status, Dates)
2. **Client Details** (Account, Opportunity, Primary Domain, Package, Tier)
3. **Technical Details** (Technical Owner, Repo URLs, Asana URL)
4. **Deployment Info** (Last Deploy fields, URLs)

---

## Deployment Instructions

### Step 1: Create Custom Objects & Fields

Use Salesforce Setup → Object Manager to create:
- Project__c object with all fields listed above
- Custom fields on Opportunity object

### Step 2: Create Named Credentials (for later integrations)

Setup → Named Credentials:
- `GitHub_API` (for calling GitHub API)
- `Asana_API` (for calling Asana API)
- `Slack_Webhook` (for Slack notifications)

### Step 3: Build the Flow

1. Setup → Flows → New Flow
2. Choose "Record-Triggered Flow"
3. Configure trigger as specified above
4. Build each element in order
5. Save as "Opp_Automation_OnStageChange"
6. Activate

### Step 4: Test in Sandbox

1. Create a test opportunity
2. Fill all required fields
3. Change stage to "Closed Won"
4. Verify:
   - Project record created
   - Fields populated correctly
   - Notification sent
   - No errors in debug logs

### Step 5: Deploy to Production

Use Change Sets or Salesforce CLI:

```bash
sf project deploy start \
  --source-dir force-app/main/default/flows/Opp_Automation_OnStageChange.flow-meta.xml \
  --target-org production
```

---

## Monitoring & Maintenance

### Weekly:
- Review flow error logs
- Check for opportunities stuck in "Closed Won" without projects

### Monthly:
- Review project key uniqueness
- Audit project creation success rate (target: >98%)

### Quarterly:
- Review and update picklist values
- Optimize flow performance if needed

---

## Related Documentation

- [Salesforce Orchestration: New Client Kickoff](../orchestrations/new-client-kickoff-orchestration.md)
- [Workflow: New Client Kickoff](../../workflows/new-client-kickoff.md)
- [Integration: Salesforce → GitHub](../../integrations/salesforce-to-github.md)
- [Integration: Salesforce → Asana](../../integrations/salesforce-to-asana.md)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial specification | Cece (Claude) |
