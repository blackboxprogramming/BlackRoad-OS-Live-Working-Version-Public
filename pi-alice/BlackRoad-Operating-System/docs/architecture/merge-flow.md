# GitHub Merge Flow Architecture

> **BlackRoad Operating System — Phase Q**
> **Purpose**: Document how GitHub events flow through the system
> **Last Updated**: 2025-11-18

---

## Overview

This document describes how GitHub PR events flow from GitHub webhooks through the BlackRoad backend into the Operator Engine and Prism Console.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        GitHub                                  │
│                                                                │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │ PR Open  │   │PR Approve│   │ PR Merge │   │Check Run │   │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   │
│       │              │              │              │          │
└───────┼──────────────┼──────────────┼──────────────┼──────────┘
        │              │              │              │
        │              │              │              │
        └──────────────┴──────────────┴──────────────┘
                       │ Webhook (HTTPS POST)
                       ▼
┌────────────────────────────────────────────────────────────────┐
│              FastAPI Backend (BlackRoad OS)                    │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  POST /api/webhooks/github                              │  │
│  │  - Validate HMAC signature                              │  │
│  │  - Parse X-GitHub-Event header                          │  │
│  │  - Extract JSON payload                                 │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│                         ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  github_events.py (Event Handler Service)              │  │
│  │  - Route event to handler function                      │  │
│  │  - Log to database (github_events table)                │  │
│  │  - Process PR metadata                                  │  │
│  │  - Update PR state (pull_requests table)                │  │
│  │  - Check merge queue eligibility                        │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│                         ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Database (PostgreSQL)                                  │  │
│  │  - github_events (audit log)                            │  │
│  │  - pull_requests (PR metadata)                          │  │
│  │  - merge_queue (queue state)                            │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          ├──> Emit OS Event (Redis Pub/Sub)
                          │
                          └──> Notify Prism (WebSocket)
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────┐
│              Prism Console (Frontend Dashboard)                │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  prism-merge-dashboard.js                               │  │
│  │  - Subscribe to WebSocket events                        │  │
│  │  - Update queue visualization                           │  │
│  │  - Show notifications                                   │  │
│  │  - Display metrics                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                    Operator Engine                             │
│  - Receives OS events                                          │
│  - Triggers automation rules                                   │
│  - Updates dashboard state                                     │
└────────────────────────────────────────────────────────────────┘
```

---

## Event Flow Sequences

### Sequence 1: PR Opened

1. **GitHub**: User opens PR
2. **GitHub**: Sends webhook to `/api/webhooks/github`
3. **FastAPI**: Validates signature, parses event
4. **Event Handler**: Calls `handle_pull_request()`
5. **Event Handler**: Calls `on_pr_opened(pr_data)`
6. **Database**: Inserts row in `pull_requests` table
7. **Event Handler**: Calls `emit_os_event("github:pr:opened")`
8. **Event Handler**: Calls `notify_prism("pr_opened")`
9. **Prism Console**: Receives WebSocket message
10. **Prism Console**: Updates dashboard UI
11. **Operator Engine**: Receives OS event
12. **Operator Engine**: Logs to operator dashboard

### Sequence 2: PR Approved → Auto-Merge

1. **GitHub**: Reviewer approves PR
2. **GitHub**: Sends `pull_request_review` webhook
3. **FastAPI**: Routes to `handle_pr_review()`
4. **Event Handler**: Checks if `state == "approved"`
5. **Database**: Updates `pull_requests.approved = true`
6. **Event Handler**: Calls `check_merge_queue_eligibility()`
7. **Event Handler**: Checks:
   - Has auto-merge label? ✅
   - Approved? ✅
   - All checks pass? ✅
   - No conflicts? ✅
8. **Database**: Inserts row in `merge_queue` table
9. **Event Handler**: Calls `notify_prism("pr_entered_queue")`
10. **Prism Console**: Shows "PR entered queue" notification
11. **GitHub Actions**: Auto-merge workflow triggers
12. **GitHub Actions**: Waits soak time (5 min for AI PRs)
13. **GitHub Actions**: Merges PR
14. **GitHub**: Sends `pull_request` (action: closed, merged: true)
15. **Event Handler**: Calls `on_pr_closed()` with `merged=true`
16. **Database**: Updates `pull_requests.merged_at`
17. **Database**: Updates `merge_queue.status = "completed"`
18. **Prism Console**: Shows "PR merged" notification
19. **Prism Console**: Removes PR from queue UI

### Sequence 3: Check Run Completed

1. **GitHub**: CI check completes
2. **GitHub**: Sends `check_run` webhook
3. **FastAPI**: Routes to `handle_check_run()`
4. **Event Handler**: Extracts `conclusion` (success/failure)
5. **Event Handler**: Finds associated PRs
6. **Database**: Updates `pull_requests.checks` JSON field
7. **Event Handler**: If all checks pass:
   - Calls `check_merge_queue_eligibility()`
8. **Event Handler**: Calls `notify_prism("pr_check_completed")`
9. **Prism Console**: Updates check status in UI
10. **Operator Engine**: Logs check result

---

## Data Models

### github_events Table

```sql
CREATE TABLE github_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    action VARCHAR(50),
    repository VARCHAR(255),
    sender VARCHAR(100),
    pr_number INTEGER,
    payload JSONB,
    received_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP
);
```

### pull_requests Table

```sql
CREATE TABLE pull_requests (
    id SERIAL PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(100) NOT NULL,
    head_branch VARCHAR(255) NOT NULL,
    base_branch VARCHAR(255) NOT NULL,
    head_sha VARCHAR(40),
    state VARCHAR(20) NOT NULL,
    labels TEXT[],
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    checks JSONB,
    checks_status VARCHAR(20),
    has_conflicts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    merged_at TIMESTAMP,
    url VARCHAR(500)
);
```

### merge_queue Table

```sql
CREATE TABLE merge_queue (
    id SERIAL PRIMARY KEY,
    pr_number INTEGER UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL,
    entered_at TIMESTAMP NOT NULL,
    started_merging_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (pr_number) REFERENCES pull_requests(number)
);
```

---

## WebSocket Protocol

### Client → Server (Subscribe)

```json
{
  "type": "subscribe",
  "channel": "github:events"
}
```

### Server → Client (Event)

```json
{
  "type": "github:pr_opened",
  "data": {
    "pr_number": 123,
    "title": "Add user authentication",
    "author": "claude-code[bot]",
    "url": "https://github.com/.../pull/123"
  },
  "timestamp": "2025-11-18T14:32:15Z"
}
```

### Event Types

- `github:pr_opened`
- `github:pr_approved`
- `github:pr_entered_queue`
- `github:pr_check_completed`
- `github:pr_closed`
- `github:pr_updated`
- `github:pr_auto_merge_enabled`

---

## Security

### Webhook Signature Validation

```python
import hmac
import hashlib

def validate_signature(payload_body: bytes, signature: str, secret: str) -> bool:
    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload_body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)
```

### Required Headers

- `X-Hub-Signature-256`: HMAC-SHA256 signature
- `X-GitHub-Event`: Event type (e.g., "pull_request")
- `X-GitHub-Delivery`: Unique delivery ID
- `Content-Type`: `application/json`

---

## API Endpoints

### Webhook Endpoint

```
POST /api/webhooks/github
Authorization: None (validates signature instead)
Content-Type: application/json
X-Hub-Signature-256: sha256=<signature>
X-GitHub-Event: <event_type>

Body: GitHub webhook payload
```

### Query Endpoints

```
GET /api/github/merge-queue
Returns current queue state

GET /api/github/metrics
Returns merge metrics (PRs/day, avg time, etc.)

GET /api/github/events?pr_number=123
Returns event history for PR #123
```

---

## Monitoring

### Metrics to Track

- **Events received per hour**
- **Event processing time**
- **WebSocket connection count**
- **Database query performance**
- **Queue depth over time**
- **Merge success rate**

### Alerting

- Alert if event processing time > 5 seconds
- Alert if queue depth > 20 PRs
- Alert if WebSocket disconnects frequently
- Alert if database writes fail

---

## Related Documentation

- `MERGE_QUEUE_PLAN.md` — Overall merge queue strategy
- `OPERATOR_PR_EVENT_HANDLERS.md` — Event handler implementation
- `GITHUB_AUTOMATION_RULES.md` — Automation rules and policies
- `AUTO_MERGE_POLICY.md` — Auto-merge tier definitions

---

**Last Updated**: 2025-11-18
**Owner**: Operator Alexa (Cadillac)
