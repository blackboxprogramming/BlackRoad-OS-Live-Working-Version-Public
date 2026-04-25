# Integration: GitHub → Salesforce

**Purpose:** Enable GitHub Actions to update Salesforce records after deployments
**Direction:** GitHub calls Salesforce REST API
**Authentication:** OAuth 2.0 (Connected App) or Named Credential
**Status:** Active
**Last Updated:** 2025-11-17

---

## Overview

This integration allows GitHub Actions workflows to:
- Update Project records with deployment metadata
- Create Deployment records for audit trail
- Trigger Salesforce flows/automations
- Close tasks or update statuses

**Key Use Case:** Auto-update Salesforce when code is deployed to production

---

## Authentication Setup

### Option A: Salesforce Connected App (Recommended)

**Benefits:**
- OAuth 2.0 standard
- Refresh tokens
- IP restrictions
- Better audit trail

**Setup Steps:**

#### 1. Create Connected App in Salesforce

1. **Setup → App Manager → New Connected App**

2. **Basic Information:**
   - Connected App Name: `GitHub Actions Integration`
   - API Name: `GitHub_Actions_Integration`
   - Contact Email: devops@blackroad.com

3. **API (Enable OAuth Settings):**
   - ✅ Enable OAuth Settings
   - Callback URL: `https://login.salesforce.com/services/oauth2/callback`
   - Selected OAuth Scopes:
     - `api` - Perform requests at any time
     - `refresh_token, offline_access` - Perform requests at any time

4. **Save** and wait 2-10 minutes for Consumer Key/Secret to be generated

5. **Get Credentials:**
   - Consumer Key (Client ID): `3MVG9...`
   - Consumer Secret (Client Secret): `ABC123...`

#### 2. Create GitHub Secrets

In each project repository (or organization-level):

1. Go to: Settings → Secrets and variables → Actions
2. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SALESFORCE_INSTANCE_URL` | `https://your-domain.my.salesforce.com` | Salesforce instance URL |
| `SALESFORCE_CLIENT_ID` | `3MVG9...` | Connected App Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | `ABC123...` | Connected App Consumer Secret |
| `SALESFORCE_USERNAME` | `integration-user@blackroad.com` | Service account username |
| `SALESFORCE_PASSWORD` | `password123` | Service account password |
| `SALESFORCE_SECURITY_TOKEN` | `XYZ789...` | Security token for user |

**Security Best Practice:** Use a dedicated integration service account, not a personal user.

#### 3. Get Access Token in GitHub Actions

**Workflow Step:**

```yaml
- name: Get Salesforce Access Token
  id: sf-auth
  run: |
    RESPONSE=$(curl -X POST "https://login.salesforce.com/services/oauth2/token" \
      -d "grant_type=password" \
      -d "client_id=${{ secrets.SALESFORCE_CLIENT_ID }}" \
      -d "client_secret=${{ secrets.SALESFORCE_CLIENT_SECRET }}" \
      -d "username=${{ secrets.SALESFORCE_USERNAME }}" \
      -d "password=${{ secrets.SALESFORCE_PASSWORD }}${{ secrets.SALESFORCE_SECURITY_TOKEN }}")

    ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')
    INSTANCE_URL=$(echo $RESPONSE | jq -r '.instance_url')

    echo "ACCESS_TOKEN=$ACCESS_TOKEN" >> $GITHUB_OUTPUT
    echo "INSTANCE_URL=$INSTANCE_URL" >> $GITHUB_OUTPUT
```

---

### Option B: Salesforce REST API Endpoint (Webhook Style)

**Setup Steps:**

1. **Create Apex REST Endpoint:**

```apex
@RestResource(urlMapping='/github/webhook')
global class GitHubWebhookHandler {

    @HttpPost
    global static String handleDeployment() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();

        Map<String, Object> payload = (Map<String, Object>) JSON.deserializeUntyped(body);

        String projectKey = (String) payload.get('project_key');
        String deployedAt = (String) payload.get('deployed_at');
        String gitSHA = (String) payload.get('git_sha');
        String deployedBy = (String) payload.get('deployed_by');

        // Find Project by external ID
        Project__c project = [
            SELECT Id, Name
            FROM Project__c
            WHERE Project_Key__c = :projectKey
            LIMIT 1
        ];

        // Update Project
        project.Last_Deploy_At__c = Datetime.valueOf(deployedAt);
        project.Last_Deploy_SHA__c = gitSHA;
        project.Last_Deploy_Actor__c = deployedBy;
        project.Deploy_Status__c = 'Success';
        update project;

        // Create Deployment record
        Deployment__c deployment = new Deployment__c(
            Project__c = project.Id,
            Deployed_At__c = Datetime.valueOf(deployedAt),
            Git_SHA__c = gitSHA,
            Deployed_By__c = deployedBy,
            Status__c = 'Success'
        );
        insert deployment;

        return JSON.serialize(new Map<String, Object>{
            'success' => true,
            'project_id' => project.Id,
            'deployment_id' => deployment.Id
        });
    }
}
```

2. **Configure Site Guest User Permissions:**
   - Grant access to `Project__c` and `Deployment__c` objects
   - Or use API key authentication in Apex

3. **Get Endpoint URL:**
   - `https://your-domain.my.salesforce.com/services/apexrest/github/webhook`

4. **Add to GitHub Secrets:**
   - `SALESFORCE_WEBHOOK_URL`: Full endpoint URL

---

## API Operations

### 1. Update Project Record (Upsert by External ID)

**Endpoint:**
```
PATCH {INSTANCE_URL}/services/data/v58.0/sobjects/Project__c/Project_Key__c/{PROJECT_KEY}
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Payload:**
```json
{
  "Last_Deploy_At__c": "2025-11-17T14:30:00Z",
  "Last_Deploy_SHA__c": "a1b2c3d4e5f6",
  "Last_Deploy_Branch__c": "main",
  "Last_Deploy_Actor__c": "github-user",
  "Deploy_Status__c": "Success",
  "Environment__c": "Production",
  "Backend_URL__c": "https://backend.railway.app",
  "Release_Notes_URL__c": "https://github.com/org/repo/commit/a1b2c3d4e5f6"
}
```

**Response (200 OK or 201 Created):**
```json
{
  "id": "a0X5e000000XYZ1EAO",
  "success": true,
  "errors": []
}
```

**GitHub Actions Implementation:**

```yaml
- name: Update Salesforce Project record
  env:
    SF_INSTANCE_URL: ${{ steps.sf-auth.outputs.INSTANCE_URL }}
    SF_ACCESS_TOKEN: ${{ steps.sf-auth.outputs.ACCESS_TOKEN }}
  run: |
    # Extract PROJECT_KEY from repo name
    REPO_NAME="${{ github.repository }}"
    PROJECT_KEY=$(echo "$REPO_NAME" | sed -n 's/.*blackroad-\([A-Z0-9-]*\)-.*/\1/p')

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
```

---

### 2. Create Deployment Record

**Endpoint:**
```
POST {INSTANCE_URL}/services/data/v58.0/sobjects/Deployment__c
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Payload:**
```json
{
  "Name": "ACME-1042 - a1b2c3d4",
  "Project_Key__c": "ACME-1042",
  "Deployed_At__c": "2025-11-17T14:30:00Z",
  "Git_SHA__c": "a1b2c3d4e5f6",
  "Git_Branch__c": "main",
  "Deployed_By__c": "github-user",
  "Status__c": "Success",
  "Environment__c": "Production",
  "Repository__c": "blackboxprogramming/blackroad-ACME-1042-backend",
  "Commit_URL__c": "https://github.com/blackboxprogramming/blackroad-ACME-1042-backend/commit/a1b2c3d4e5f6",
  "Duration_Seconds__c": 120
}
```

**Response (201 Created):**
```json
{
  "id": "a0Y5e000000ABC1EAO",
  "success": true,
  "errors": []
}
```

**GitHub Actions Implementation:**

```yaml
- name: Create Salesforce Deployment record
  run: |
    curl -X POST \
      "$SF_INSTANCE_URL/services/data/v58.0/sobjects/Deployment__c" \
      -H "Authorization: Bearer $SF_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "Name": "'"$PROJECT_KEY"' - '"${GITHUB_SHA:0:8}"'",
        "Project_Key__c": "'"$PROJECT_KEY"'",
        "Deployed_At__c": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
        "Git_SHA__c": "${{ github.sha }}",
        "Git_Branch__c": "${{ github.ref_name }}",
        "Deployed_By__c": "${{ github.actor }}",
        "Status__c": "Success",
        "Environment__c": "Production",
        "Repository__c": "${{ github.repository }}",
        "Commit_URL__c": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
      }'
```

---

### 3. Query Salesforce (Optional)

**Use Case:** Get Project metadata before deploying

**Endpoint:**
```
GET {INSTANCE_URL}/services/data/v58.0/query?q=SELECT+Id,Name,Package_Type__c+FROM+Project__c+WHERE+Project_Key__c='ACME-1042'
```

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
```

**Response:**
```json
{
  "totalSize": 1,
  "done": true,
  "records": [
    {
      "Id": "a0X5e000000XYZ1EAO",
      "Name": "Acme Corp - ACME-1042",
      "Package_Type__c": "OS"
    }
  ]
}
```

---

## Required Salesforce Objects

### Deployment Custom Object

**API Name:** `Deployment__c`
**Label:** Deployment
**Record Name:** Deployment Name (Auto Number: `DEP-{0000}`)

#### Fields:

| Field API Name | Type | Length | Description |
|----------------|------|--------|-------------|
| `Project__c` | Lookup(Project__c) | N/A | Related project |
| `Project_Key__c` | Text (External ID) | 20 | For upsert operations |
| `Deployed_At__c` | DateTime | N/A | When deployment occurred |
| `Git_SHA__c` | Text | 40 | Git commit SHA |
| `Git_Branch__c` | Text | 100 | Git branch name |
| `Deployed_By__c` | Text | 100 | GitHub username |
| `Status__c` | Picklist | N/A | Success, Failed, Rollback, In Progress |
| `Environment__c` | Picklist | N/A | Staging, Production |
| `Repository__c` | Text | 255 | Full repo name (org/repo) |
| `Commit_URL__c` | URL | 255 | Link to commit |
| `Duration_Seconds__c` | Number(6,0) | N/A | Deploy duration |
| `Error_Message__c` | Long Text Area | 32768 | If deploy failed |

---

## Complete GitHub Actions Workflow

**File:** `.github/workflows/notify-salesforce.yml`

```yaml
name: Notify Salesforce After Deploy

on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types:
      - completed

jobs:
  notify-salesforce:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - name: Extract Project Key from repo name
        id: project-key
        run: |
          REPO_NAME="${{ github.repository }}"
          PROJECT_KEY=$(echo "$REPO_NAME" | sed -n 's/.*blackroad-\([A-Z0-9-]*\)-.*/\1/p')

          if [ -z "$PROJECT_KEY" ]; then
            echo "Warning: Could not extract project key"
            PROJECT_KEY="UNKNOWN"
          fi

          echo "PROJECT_KEY=$PROJECT_KEY" >> $GITHUB_OUTPUT

      - name: Authenticate with Salesforce
        id: sf-auth
        env:
          SF_CLIENT_ID: ${{ secrets.SALESFORCE_CLIENT_ID }}
          SF_CLIENT_SECRET: ${{ secrets.SALESFORCE_CLIENT_SECRET }}
          SF_USERNAME: ${{ secrets.SALESFORCE_USERNAME }}
          SF_PASSWORD: ${{ secrets.SALESFORCE_PASSWORD }}
          SF_SECURITY_TOKEN: ${{ secrets.SALESFORCE_SECURITY_TOKEN }}
        run: |
          RESPONSE=$(curl -X POST "https://login.salesforce.com/services/oauth2/token" \
            -d "grant_type=password" \
            -d "client_id=$SF_CLIENT_ID" \
            -d "client_secret=$SF_CLIENT_SECRET" \
            -d "username=$SF_USERNAME" \
            -d "password=$SF_PASSWORD$SF_SECURITY_TOKEN")

          ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')
          INSTANCE_URL=$(echo $RESPONSE | jq -r '.instance_url')

          echo "ACCESS_TOKEN=$ACCESS_TOKEN" >> $GITHUB_OUTPUT
          echo "INSTANCE_URL=$INSTANCE_URL" >> $GITHUB_OUTPUT

      - name: Update Salesforce Project record
        if: steps.project-key.outputs.PROJECT_KEY != 'UNKNOWN'
        env:
          SF_INSTANCE_URL: ${{ steps.sf-auth.outputs.INSTANCE_URL }}
          SF_ACCESS_TOKEN: ${{ steps.sf-auth.outputs.ACCESS_TOKEN }}
          PROJECT_KEY: ${{ steps.project-key.outputs.PROJECT_KEY }}
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
            }' || echo "Warning: Failed to update Project record"

      - name: Create Deployment record
        if: steps.project-key.outputs.PROJECT_KEY != 'UNKNOWN'
        env:
          SF_INSTANCE_URL: ${{ steps.sf-auth.outputs.INSTANCE_URL }}
          SF_ACCESS_TOKEN: ${{ steps.sf-auth.outputs.ACCESS_TOKEN }}
          PROJECT_KEY: ${{ steps.project-key.outputs.PROJECT_KEY }}
        run: |
          curl -X POST \
            "$SF_INSTANCE_URL/services/data/v58.0/sobjects/Deployment__c" \
            -H "Authorization: Bearer $SF_ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
              "Name": "'"$PROJECT_KEY"' - '"${GITHUB_SHA:0:8}"'",
              "Project_Key__c": "'"$PROJECT_KEY"'",
              "Deployed_At__c": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
              "Git_SHA__c": "${{ github.sha }}",
              "Git_Branch__c": "${{ github.ref_name }}",
              "Deployed_By__c": "${{ github.actor }}",
              "Status__c": "Success",
              "Environment__c": "Production",
              "Repository__c": "${{ github.repository }}",
              "Commit_URL__c": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
            }' || echo "Warning: Failed to create Deployment record"
```

---

## Error Handling

### Common Errors

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 401 | Unauthorized | Token expired | Re-authenticate |
| 403 | Forbidden | Insufficient permissions | Check user permissions in Salesforce |
| 404 | Not Found | Project_Key__c doesn't exist | Verify project key extraction logic |
| 400 | Bad Request | Invalid field value | Check datetime format (must be ISO 8601) |

### Retry Logic

```yaml
- name: Update Salesforce (with retries)
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 2
    max_attempts: 3
    command: |
      curl -X PATCH ... (Salesforce API call)
```

---

## Testing

### Manual Test (curl)

```bash
# 1. Get access token
ACCESS_TOKEN=$(curl -X POST "https://login.salesforce.com/services/oauth2/token" \
  -d "grant_type=password" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD_AND_TOKEN" | jq -r '.access_token')

# 2. Update Project
curl -X PATCH \
  "https://your-domain.my.salesforce.com/services/data/v58.0/sobjects/Project__c/Project_Key__c/TEST-1234" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Last_Deploy_At__c": "2025-11-17T14:30:00Z",
    "Deploy_Status__c": "Success"
  }'
```

### GitHub Actions Test

1. Push commit to test repo
2. Trigger deploy workflow
3. Verify Salesforce Project updated
4. Check Deployment record created
5. Review GitHub Actions logs for errors

---

## Monitoring

**Track These Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Salesforce API Success Rate | > 98% | < 95% |
| Avg API Response Time | < 1s | > 3s |
| Failed Updates | < 2% | > 5% |

**Salesforce Report:** "Deployments by Status (Last 30 Days)"

---

## Security Best Practices

1. **Use Service Account:**
   - Create `integration-user@blackroad.com`
   - Assign minimal permissions
   - Enable API-only user (no login UI)

2. **Rotate Credentials:**
   - Rotate passwords every 90 days
   - Use GitHub encrypted secrets
   - Never commit credentials to git

3. **IP Restrictions:**
   - Whitelist GitHub Actions IP ranges in Salesforce
   - See: https://api.github.com/meta

4. **Audit Logging:**
   - Enable Salesforce Event Monitoring
   - Log all API calls
   - Review monthly

---

## Related Documentation

- [Salesforce REST API Docs](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [GitHub Actions: Deploy Workflow](../templates/github-actions/deploy.yml)
- [Workflow: Release Pipeline](../workflows/release-pipeline.md)
- [Integration: Salesforce → GitHub](./salesforce-to-github.md)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial specification | Cece (Claude) |
