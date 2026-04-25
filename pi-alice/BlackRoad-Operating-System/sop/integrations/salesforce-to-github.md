# Integration: Salesforce → GitHub

**Purpose:** Enable Salesforce to create and configure GitHub repositories automatically
**Direction:** Salesforce calls GitHub REST API
**Authentication:** GitHub App or Personal Access Token
**Status:** Active
**Last Updated:** 2025-11-17

---

## Overview

This integration allows Salesforce Flows and Orchestrations to:
- Create new repositories
- Configure repository settings
- Add labels, branch protection, workflows
- Manage repository secrets

**Key Use Case:** Automatic repo creation when Opportunity moves to "Closed Won"

---

## Authentication Setup

### Option A: GitHub App (Recommended for Production)

**Benefits:**
- More secure (short-lived tokens)
- Better rate limits
- Granular permissions
- Audit trail

**Setup Steps:**

1. **Create GitHub App:**
   - Go to: https://github.com/organizations/blackboxprogramming/settings/apps
   - Click "New GitHub App"
   - Name: `BlackRoad Salesforce Integration`
   - Homepage URL: `https://blackroad.app`
   - Webhook URL: (leave blank for now, covered in github-to-salesforce.md)

2. **Permissions:**
   - Repository permissions:
     - Administration: Read & Write
     - Contents: Read & Write
     - Metadata: Read-only
     - Secrets: Read & Write
     - Workflows: Read & Write
   - Organization permissions:
     - Members: Read-only

3. **Install App:**
   - Install app on organization: `blackboxprogramming`
   - Select: All repositories (or specific repos)

4. **Generate Private Key:**
   - Download private key (`.pem` file)
   - Store securely in Salesforce

5. **Get App Details:**
   - App ID: `123456`
   - Installation ID: `789012`

**Salesforce Named Credential:**
- Name: `GitHub_API`
- URL: `https://api.github.com`
- Identity Type: Named Principal
- Authentication Protocol: Custom
- Custom Authentication: Use Apex class to generate JWT → exchange for installation access token

**Apex Class for Token Generation:**

```apex
public class GitHubAppTokenProvider {
    private static final String GITHUB_APP_ID = '123456';
    private static final String GITHUB_APP_PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // Store in Protected Custom Setting

    public static String getInstallationToken() {
        // 1. Generate JWT
        String jwt = generateJWT();

        // 2. Exchange JWT for installation access token
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.github.com/app/installations/789012/access_tokens');
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + jwt);
        req.setHeader('Accept', 'application/vnd.github+json');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 201) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) result.get('token');
        }

        throw new CalloutException('Failed to get GitHub access token: ' + res.getBody());
    }

    private static String generateJWT() {
        // Use JWT library or implement JWT generation
        // See: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
    }
}
```

---

### Option B: Personal Access Token (Quick Start / Testing)

**Setup Steps:**

1. **Create PAT:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scopes:
     - `repo` (full control)
     - `workflow` (update workflows)
     - `admin:org` (read org)

2. **Store in Salesforce:**
   - Setup → Named Credentials → New
   - Name: `GitHub_API`
   - URL: `https://api.github.com`
   - Identity Type: Named Principal
   - Authentication Protocol: Password Authentication
   - Username: (your GitHub username)
   - Password: (paste PAT)

**⚠️ Security Note:** PAT never expires unless you set an expiration. For production, use GitHub App.

---

## API Endpoints & Payloads

### 1. Create Repository

**Endpoint:**
```
POST https://api.github.com/orgs/blackboxprogramming/repos
```

**Headers:**
```
Authorization: Bearer {GITHUB_TOKEN}
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
Content-Type: application/json
```

**Payload:**
```json
{
  "name": "blackroad-ACME-1042-backend",
  "description": "Backend for Acme Corp (ACME-1042)",
  "private": true,
  "auto_init": true,
  "gitignore_template": "Python",
  "license_template": "mit"
}
```

**Response (201 Created):**
```json
{
  "id": 123456789,
  "name": "blackroad-ACME-1042-backend",
  "full_name": "blackboxprogramming/blackroad-ACME-1042-backend",
  "html_url": "https://github.com/blackboxprogramming/blackroad-ACME-1042-backend",
  "clone_url": "https://github.com/blackboxprogramming/blackroad-ACME-1042-backend.git",
  "default_branch": "main",
  ...
}
```

**Salesforce Flow Implementation:**

```yaml
Element: HTTP Callout
Method: POST
Endpoint: {!$Credential.GitHub_API}/orgs/blackboxprogramming/repos
Headers:
  - Authorization: Bearer {!$Credential.GitHub_API.AccessToken}
  - Accept: application/vnd.github+json
  - Content-Type: application/json
Body: (JSON from above, with merge fields)

Store Response In: varRepoResponse
Parse:
  - varRepoURL = {!varRepoResponse.html_url}
  - varRepoName = {!varRepoResponse.name}
```

---

### 2. Create Labels

**Endpoint:**
```
POST https://api.github.com/repos/blackboxprogramming/{REPO_NAME}/labels
```

**Payload (repeat for each label):**
```json
{
  "name": "type:feature",
  "color": "0E8A16",
  "description": "New feature or enhancement"
}
```

**Salesforce Implementation:**

Use a loop to create multiple labels from a JSON dataset:

```yaml
Element: Loop
Collection: Parse JSON from sop/templates/repo-template/.github/labels.json
Current Item: varLabel

Inside Loop:
  - HTTP Callout
  - Endpoint: {!$Credential.GitHub_API}/repos/blackboxprogramming/{!varRepoName}/labels
  - Body: {!varLabel}
```

---

### 3. Apply Branch Protection

**Endpoint:**
```
PUT https://api.github.com/repos/blackboxprogramming/{REPO_NAME}/branches/main/protection
```

**Payload:**
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test (3.11)", "test (3.12)", "lint", "build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

**Response (200 OK):**
```json
{
  "url": "https://api.github.com/repos/blackboxprogramming/blackroad-ACME-1042-backend/branches/main/protection",
  ...
}
```

---

### 4. Create Workflow Files

**Endpoint:**
```
PUT https://api.github.com/repos/blackboxprogramming/{REPO_NAME}/contents/.github/workflows/ci.yml
```

**Payload:**
```json
{
  "message": "Add CI workflow",
  "content": "{BASE64_ENCODED_CI_YML}",
  "branch": "main"
}
```

**Salesforce Implementation:**

1. Store workflow YAML templates in Salesforce Static Resources:
   - `ci_yml`
   - `deploy_yml`
   - `safety_yml`

2. For each workflow:
   - Load static resource
   - Base64 encode content (use Apex)
   - PUT to GitHub

**Apex Helper:**
```apex
public static String base64EncodeStaticResource(String resourceName) {
    StaticResource sr = [SELECT Body FROM StaticResource WHERE Name = :resourceName LIMIT 1];
    return EncodingUtil.base64Encode(sr.Body);
}
```

---

### 5. Add Repository Secrets

**Endpoint:**
```
PUT https://api.github.com/repos/blackboxprogramming/{REPO_NAME}/actions/secrets/{SECRET_NAME}
```

**Payload:**
```json
{
  "encrypted_value": "{ENCRYPTED_SECRET}",
  "key_id": "{PUBLIC_KEY_ID}"
}
```

**Pre-requisite:** Get repository public key

```
GET https://api.github.com/repos/blackboxprogramming/{REPO_NAME}/actions/secrets/public-key
```

**Response:**
```json
{
  "key_id": "012345678912345678",
  "key": "BASE64_PUBLIC_KEY"
}
```

**Encryption:**

Use libsodium sealed boxes (NaCl) to encrypt secrets.

**Apex Implementation:** Use external service or pre-encrypted values.

**Secrets to Add:**

| Secret Name | Value Source |
|-------------|--------------|
| `PROJECT_KEY` | From Project__c.Project_Key__c |
| `SALESFORCE_INSTANCE_URL` | From Salesforce |
| `SALESFORCE_ACCESS_TOKEN` | Generate Connected App token |
| `RAILWAY_TOKEN` | From Salesforce Custom Setting |
| `CLOUDFLARE_API_TOKEN` | From Salesforce Custom Setting |
| `ASANA_PAT` | From Salesforce Custom Setting |

---

## Complete Flow Example

**Salesforce Flow: Create GitHub Repos for Project**

```yaml
Flow Name: GitHub_Repo_Setup

Input Variables:
  - ProjectRecordId (Text)

Steps:

1. Get Project Record
   - Object: Project__c
   - Filter: Id = {!ProjectRecordId}
   - Store: varProject

2. Loop: For Each Repo Type
   - Collection: ["backend", "frontend", "ops"]
   - Current Item: varRepoType

   2.1: Create Repo
       - HTTP Callout (as documented above)
       - Store Response: varRepoResponse

   2.2: Create Labels
       - Loop through labels.json
       - HTTP Callout for each label

   2.3: Apply Branch Protection
       - HTTP Callout (as documented)

   2.4: Create Workflow Files
       - For each: ci.yml, deploy.yml, safety.yml
       - HTTP Callout to create file

   2.5: Add Secrets
       - Get public key
       - Encrypt secrets
       - PUT each secret

   2.6: Update Project Record
       - Assignment:
         - Backend_Repo_URL__c = {!varRepoResponse.html_url} (if backend)
         - Frontend_Repo_URL__c = {!varRepoResponse.html_url} (if frontend)
         - Ops_Repo_URL__c = {!varRepoResponse.html_url} (if ops)

3. Update Project Record with all URLs
   - Update Record: Project__c

4. Send Success Notification
   - Post to Chatter or send email
```

---

## Error Handling

### Common Errors

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 401 | Unauthorized | Invalid token | Refresh GitHub App token or regenerate PAT |
| 403 | Forbidden | Insufficient permissions | Check GitHub App/PAT scopes |
| 422 | Unprocessable Entity | Repo name already exists | Check for existing repo first |
| 422 | Validation Failed | Branch protection: required check doesn't exist | Create workflow first, then apply protection |
| 404 | Not Found | Repo or resource doesn't exist | Verify repo was created successfully |

### Salesforce Fault Path

```yaml
Fault Path:
  - Element: Create Case
    Subject: "GitHub Integration Error: {!$Flow.FaultMessage}"
    Description: "Failed to create GitHub repo for Project: {!varProject.Name}\n\nError: {!$Flow.FaultMessage}"
    Priority: High
    OwnerId: {!DevOpsQueueId}

  - Element: Send Email
    To: devops@blackroad.com
    Subject: "GitHub Automation Failed"
    Body: (include error details)
```

---

## Testing

### Manual Test (Postman / curl)

```bash
# 1. Create repo
curl -X POST \
  https://api.github.com/orgs/blackboxprogramming/repos \
  -H "Authorization: token YOUR_PAT" \
  -H "Accept: application/vnd.github+json" \
  -d '{
    "name": "test-repo-delete-me",
    "private": true,
    "auto_init": true
  }'

# 2. Create label
curl -X POST \
  https://api.github.com/repos/blackboxprogramming/test-repo-delete-me/labels \
  -H "Authorization: token YOUR_PAT" \
  -d '{
    "name": "type:test",
    "color": "BADA55"
  }'

# 3. Clean up
curl -X DELETE \
  https://api.github.com/repos/blackboxprogramming/test-repo-delete-me \
  -H "Authorization: token YOUR_PAT"
```

### Salesforce Sandbox Test

1. Create test Project record
2. Run flow: `GitHub_Repo_Setup` with test Project ID
3. Verify:
   - Repos created in GitHub
   - Labels applied
   - Branch protection enabled
   - Workflows present
   - Secrets added
4. Clean up test repos

---

## Rate Limits

**GitHub API Rate Limits:**
- PAT: 5,000 requests/hour
- GitHub App: 15,000 requests/hour

**Per Repository Creation:**
- Approximately 50-100 API calls (1 repo + labels + protection + workflows + secrets)
- Can create ~50-300 repos per hour

**Best Practices:**
- Use GitHub App for better limits
- Implement exponential backoff on 403 (rate limit exceeded)
- Cache public keys for secret encryption
- Batch operations where possible

---

## Monitoring

**Track These Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Success Rate | > 98% | < 95% |
| Avg Response Time | < 2s | > 5s |
| Rate Limit Usage | < 50% | > 80% |
| Failed Repo Creations | < 2% | > 5% |

**Salesforce Custom Object:** `GitHub_API_Log__c`

**Fields:**
- Operation__c (Create Repo, Add Label, etc.)
- Project__c (Lookup)
- Status__c (Success, Failed)
- Status_Code__c (200, 201, 422, etc.)
- Error_Message__c
- Response_Time__c
- Timestamp__c

---

## Related Documentation

- [GitHub API Docs: Repositories](https://docs.github.com/en/rest/repos/repos)
- [GitHub API Docs: Branch Protection](https://docs.github.com/en/rest/branches/branch-protection)
- [GitHub API Docs: Secrets](https://docs.github.com/en/rest/actions/secrets)
- [Salesforce Orchestration: New Client Kickoff](../salesforce/orchestrations/new-client-kickoff-orchestration.md)
- [Workflow: New Client Kickoff](../workflows/new-client-kickoff.md)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-11-17 | 1.0 | Initial specification | Cece (Claude) |
