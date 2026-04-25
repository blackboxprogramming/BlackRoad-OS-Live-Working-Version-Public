# BlackRoad OS Workflows

> Automate complex multi-step processes with intelligent agents

---

## Table of Contents

- [Overview](#overview)
- [Workflow Concepts](#workflow-concepts)
- [Creating Workflows](#creating-workflows)
- [Workflow Triggers](#workflow-triggers)
- [Workflow Steps](#workflow-steps)
- [Conditional Logic](#conditional-logic)
- [Error Handling](#error-handling)
- [Parallel Execution](#parallel-execution)
- [Workflow Templates](#workflow-templates)
- [Monitoring and Debugging](#monitoring-and-debugging)
- [Best Practices](#best-practices)

---

## Overview

Workflows are **automated sequences of tasks** that coordinate multiple agents, skills, and external services. They enable complex operations like CI/CD pipelines, data processing, and multi-agent collaborations.

### What is a Workflow?

```
┌──────────────────────────────────────────────────────────────────┐
│                         WORKFLOW                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Trigger                                                       │
│       │                                                          │
│       ▼                                                          │
│    ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐            │
│    │Step 1│────▶│Step 2│────▶│Step 3│────▶│Step 4│            │
│    └──────┘     └──┬───┘     └──────┘     └──────┘            │
│                    │                                            │
│                    │ condition                                  │
│                    ▼                                            │
│                 ┌──────┐                                        │
│                 │Step 5│                                        │
│                 └──────┘                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Workflow Capabilities

| Feature | Description |
|---------|-------------|
| **Multi-Agent** | Coordinate multiple agents |
| **Conditional** | Branch based on results |
| **Parallel** | Run steps concurrently |
| **Retries** | Automatic failure recovery |
| **Scheduling** | Cron-based triggers |
| **Events** | React to system events |
| **Human-in-Loop** | Approval gates |

---

## Workflow Concepts

### Core Components

```
┌───────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPONENTS                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  TRIGGER          What starts the workflow                    │
│  ├── Schedule     Cron expression                            │
│  ├── Event        System/webhook event                       │
│  ├── Manual       User initiated                             │
│  └── API          Programmatic start                         │
│                                                               │
│  STEPS            Individual tasks                            │
│  ├── Agent Task   Assign work to agent                       │
│  ├── Skill        Execute a skill                            │
│  ├── HTTP         Call external API                          │
│  ├── Script       Run custom code                            │
│  └── Subworkflow  Nest another workflow                      │
│                                                               │
│  CONTROL          Flow management                             │
│  ├── Condition    If/else branching                          │
│  ├── Loop         Iterate over items                         │
│  ├── Parallel     Concurrent execution                       │
│  └── Wait         Pause for condition                        │
│                                                               │
│  CONTEXT          Shared data                                 │
│  ├── Input        Initial parameters                         │
│  ├── Variables    Intermediate values                        │
│  └── Output       Final results                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Workflow States

```
                    ┌──────────┐
                    │ CREATED  │
                    └────┬─────┘
                         │ trigger
                         ▼
                    ┌──────────┐
         ┌─────────│ RUNNING  │─────────┐
         │         └────┬─────┘         │
         │ error        │ success       │ pause
         ▼              ▼               ▼
    ┌──────────┐  ┌──────────┐    ┌──────────┐
    │  FAILED  │  │COMPLETED │    │  PAUSED  │
    └──────────┘  └──────────┘    └────┬─────┘
                                       │ resume
                                       ▼
                                  ┌──────────┐
                                  │ RUNNING  │
                                  └──────────┘
```

---

## Creating Workflows

### YAML Definition

```yaml
# workflows/deploy-pipeline.yaml
name: deploy-pipeline
version: 1.0.0
description: Deploy application to production

# Input parameters
input:
  type: object
  required:
    - branch
    - environment
  properties:
    branch:
      type: string
      default: main
    environment:
      type: string
      enum: [staging, production]

# Workflow trigger
trigger:
  - type: webhook
    path: /deploy
  - type: schedule
    cron: "0 2 * * *"  # Daily at 2 AM

# Workflow steps
steps:
  - id: checkout
    name: Checkout Code
    agent: ALICE
    action: git-checkout
    params:
      branch: ${{ input.branch }}

  - id: test
    name: Run Tests
    agent: ALICE
    action: run-tests
    depends_on: [checkout]
    params:
      path: ${{ steps.checkout.output.path }}

  - id: build
    name: Build Application
    agent: OCTAVIA
    action: build
    depends_on: [test]
    condition: ${{ steps.test.output.passed }}
    params:
      path: ${{ steps.checkout.output.path }}

  - id: deploy
    name: Deploy to Environment
    agent: OCTAVIA
    action: deploy
    depends_on: [build]
    params:
      artifact: ${{ steps.build.output.artifact }}
      environment: ${{ input.environment }}

  - id: notify
    name: Send Notification
    action: slack-notify
    depends_on: [deploy]
    params:
      channel: "#deployments"
      message: "Deployed ${{ input.branch }} to ${{ input.environment }}"

# Output
output:
  deployed_version: ${{ steps.build.output.version }}
  deploy_url: ${{ steps.deploy.output.url }}
```

### Python Definition

```python
from blackroad.workflows import (
    Workflow,
    Step,
    Trigger,
    Condition
)

# Define workflow
deploy_workflow = Workflow(
    name="deploy-pipeline",
    version="1.0.0",
    description="Deploy application to production"
)

# Add trigger
deploy_workflow.add_trigger(Trigger.webhook("/deploy"))
deploy_workflow.add_trigger(Trigger.cron("0 2 * * *"))

# Define steps
@deploy_workflow.step(id="checkout")
async def checkout(ctx):
    return await ctx.agent("ALICE").run("git-checkout", {
        "branch": ctx.input["branch"]
    })

@deploy_workflow.step(id="test", depends_on=["checkout"])
async def run_tests(ctx):
    return await ctx.agent("ALICE").run("run-tests", {
        "path": ctx.steps["checkout"].output["path"]
    })

@deploy_workflow.step(
    id="build",
    depends_on=["test"],
    condition=lambda ctx: ctx.steps["test"].output["passed"]
)
async def build(ctx):
    return await ctx.agent("OCTAVIA").run("build", {
        "path": ctx.steps["checkout"].output["path"]
    })

@deploy_workflow.step(id="deploy", depends_on=["build"])
async def deploy(ctx):
    return await ctx.agent("OCTAVIA").run("deploy", {
        "artifact": ctx.steps["build"].output["artifact"],
        "environment": ctx.input["environment"]
    })

@deploy_workflow.step(id="notify", depends_on=["deploy"])
async def notify(ctx):
    await ctx.skill("slack-notify").execute({
        "channel": "#deployments",
        "message": f"Deployed {ctx.input['branch']} to {ctx.input['environment']}"
    })
```

### Register and Run

```bash
# Register workflow
./workflow.sh register workflows/deploy-pipeline.yaml

# Run workflow
./workflow.sh run deploy-pipeline --input '{"branch": "main", "environment": "staging"}'

# Check status
./workflow.sh status deploy-pipeline/run_123
```

---

## Workflow Triggers

### Manual Trigger

```yaml
trigger:
  - type: manual
    description: Manually start the workflow
```

```bash
# Start manually
./workflow.sh run my-workflow --input '{"param": "value"}'
```

### Webhook Trigger

```yaml
trigger:
  - type: webhook
    path: /webhooks/my-workflow
    method: POST
    secret: ${{ secrets.WEBHOOK_SECRET }}
```

```bash
# Trigger via webhook
curl -X POST "https://api.blackroad.io/webhooks/my-workflow" \
  -H "X-Webhook-Secret: $SECRET" \
  -d '{"param": "value"}'
```

### Schedule Trigger

```yaml
trigger:
  - type: schedule
    cron: "0 */6 * * *"  # Every 6 hours
    timezone: "UTC"
```

### Event Trigger

```yaml
trigger:
  - type: event
    source: github
    event: push
    filter:
      branch: main
```

### Composite Triggers

```yaml
trigger:
  # Run on push to main
  - type: event
    source: github
    event: push
    filter:
      branch: main

  # Run daily at midnight
  - type: schedule
    cron: "0 0 * * *"

  # Run via API
  - type: webhook
    path: /deploy
```

---

## Workflow Steps

### Agent Task Step

```yaml
- id: analyze
  name: Analyze Code
  agent: PRISM
  action: analyze-code
  params:
    path: ./src
    depth: deep
  timeout: 300s
  retries: 3
```

### Skill Step

```yaml
- id: search
  name: Search Web
  skill: web-search
  params:
    query: "kubernetes best practices"
    max_results: 10
```

### HTTP Step

```yaml
- id: api_call
  name: Call External API
  type: http
  method: POST
  url: https://api.example.com/endpoint
  headers:
    Authorization: Bearer ${{ secrets.API_TOKEN }}
  body:
    key: value
```

### Script Step

```yaml
- id: process
  name: Process Data
  type: script
  language: python
  code: |
    import json
    data = json.loads(context.input)
    result = [item * 2 for item in data['numbers']]
    return {"doubled": result}
```

### Subworkflow Step

```yaml
- id: sub
  name: Run Sub-workflow
  type: workflow
  workflow: data-processing
  input:
    file: ${{ steps.download.output.path }}
```

---

## Conditional Logic

### Simple Condition

```yaml
- id: deploy_prod
  name: Deploy to Production
  condition: ${{ input.environment == 'production' }}
  agent: OCTAVIA
  action: deploy
```

### Complex Conditions

```yaml
- id: notify_failure
  name: Notify on Failure
  condition: |
    ${{
      steps.test.status == 'failed' ||
      steps.build.status == 'failed'
    }}
  skill: slack-notify
  params:
    channel: "#alerts"
    message: "Pipeline failed!"
```

### If-Else Branching

```yaml
- id: branch_decision
  name: Decide Path
  type: condition
  if: ${{ steps.analysis.output.risk_level == 'high' }}
  then:
    - id: manual_review
      name: Request Manual Review
      type: approval
      approvers: ["admin@example.com"]
  else:
    - id: auto_proceed
      name: Auto Proceed
      agent: ALICE
      action: continue
```

### Switch Statement

```yaml
- id: env_deploy
  name: Deploy to Environment
  type: switch
  value: ${{ input.environment }}
  cases:
    development:
      - id: deploy_dev
        agent: OCTAVIA
        action: deploy-dev
    staging:
      - id: deploy_staging
        agent: OCTAVIA
        action: deploy-staging
    production:
      - id: deploy_prod
        agent: OCTAVIA
        action: deploy-prod
        approval: required
  default:
    - id: unknown_env
      type: fail
      message: "Unknown environment"
```

---

## Error Handling

### Retry Configuration

```yaml
- id: flaky_step
  name: Potentially Flaky Step
  agent: ALICE
  action: external-api-call
  retry:
    max_attempts: 3
    delay: 5s
    backoff: exponential  # 5s, 10s, 20s
    on_errors:
      - timeout
      - connection_error
```

### Error Handlers

```yaml
- id: risky_operation
  name: Risky Operation
  agent: OCTAVIA
  action: dangerous-task
  on_error:
    - id: cleanup
      name: Cleanup on Error
      agent: ALICE
      action: cleanup
    - id: notify_error
      skill: slack-notify
      params:
        channel: "#alerts"
        message: "Error in risky_operation: ${{ error.message }}"
```

### Fallback Steps

```yaml
- id: primary_deploy
  name: Primary Deploy
  agent: OCTAVIA
  action: deploy-railway
  fallback:
    - id: fallback_deploy
      name: Fallback Deploy
      agent: OCTAVIA
      action: deploy-vercel
```

### Continue on Error

```yaml
- id: optional_step
  name: Optional Enhancement
  agent: PRISM
  action: optimize
  continue_on_error: true  # Workflow continues even if this fails
```

### Global Error Handler

```yaml
on_error:
  - id: global_cleanup
    name: Global Cleanup
    agent: ALICE
    action: cleanup-all

  - id: global_notify
    skill: email
    params:
      to: admin@example.com
      subject: "Workflow Failed: ${{ workflow.name }}"
      body: "Error: ${{ error.message }}"
```

---

## Parallel Execution

### Parallel Steps

```yaml
- id: parallel_tests
  name: Run Tests in Parallel
  type: parallel
  steps:
    - id: unit_tests
      agent: ALICE
      action: run-unit-tests

    - id: integration_tests
      agent: ALICE
      action: run-integration-tests

    - id: e2e_tests
      agent: ALICE
      action: run-e2e-tests
```

### Parallel with Join

```yaml
- id: parallel_analysis
  type: parallel
  steps:
    - id: security_scan
      agent: CIPHER
      action: security-scan

    - id: code_quality
      agent: PRISM
      action: code-quality

    - id: dependency_check
      agent: ALICE
      action: dependency-check

- id: aggregate_results
  name: Aggregate Results
  depends_on: [parallel_analysis]
  agent: PRISM
  action: aggregate
  params:
    security: ${{ steps.security_scan.output }}
    quality: ${{ steps.code_quality.output }}
    dependencies: ${{ steps.dependency_check.output }}
```

### For-Each Parallel

```yaml
- id: deploy_regions
  name: Deploy to All Regions
  type: foreach
  items: ${{ input.regions }}  # ["us-east", "eu-west", "ap-south"]
  parallel: true
  max_concurrency: 3
  step:
    id: deploy_region
    agent: OCTAVIA
    action: deploy
    params:
      region: ${{ item }}
```

### Map-Reduce Pattern

```yaml
# Map: Process each item in parallel
- id: map_process
  type: foreach
  items: ${{ input.files }}
  parallel: true
  step:
    id: process_file
    agent: ALICE
    action: process-file
    params:
      file: ${{ item }}

# Reduce: Aggregate results
- id: reduce_aggregate
  depends_on: [map_process]
  agent: PRISM
  action: aggregate-results
  params:
    results: ${{ steps.map_process.outputs }}
```

---

## Workflow Templates

### Reusable Templates

```yaml
# templates/notify-template.yaml
name: notify-template
description: Reusable notification template

input:
  channel:
    type: string
    required: true
  message:
    type: string
    required: true

steps:
  - id: slack
    skill: slack-notify
    params:
      channel: ${{ input.channel }}
      message: ${{ input.message }}

  - id: email
    skill: email
    condition: ${{ input.email_enabled }}
    params:
      to: ${{ input.email_to }}
      subject: "Notification"
      body: ${{ input.message }}
```

### Using Templates

```yaml
# workflows/my-workflow.yaml
steps:
  - id: do_work
    agent: ALICE
    action: work

  - id: notify
    template: notify-template
    params:
      channel: "#general"
      message: "Work completed!"
```

### Template Library

| Template | Description | Use Case |
|----------|-------------|----------|
| `ci-pipeline` | Standard CI pipeline | Code testing |
| `cd-deploy` | Deployment pipeline | App deployment |
| `data-etl` | ETL workflow | Data processing |
| `incident-response` | Incident handling | Alert response |
| `onboarding` | User onboarding | New user setup |

---

## Monitoring and Debugging

### Workflow Dashboard

```bash
# View all workflows
./workflow.sh list

# View workflow runs
./workflow.sh runs deploy-pipeline

# View specific run
./workflow.sh status deploy-pipeline/run_123
```

### Run Details

```
Workflow: deploy-pipeline
Run ID: run_123
Status: COMPLETED
Duration: 4m 32s

Steps:
├── checkout [COMPLETED] 15s
├── test [COMPLETED] 2m 10s
├── build [COMPLETED] 1m 45s
├── deploy [COMPLETED] 20s
└── notify [COMPLETED] 2s

Output:
  deployed_version: 1.2.3
  deploy_url: https://app.example.com
```

### Logs

```bash
# View workflow logs
./workflow.sh logs deploy-pipeline/run_123

# Stream logs in real-time
./workflow.sh logs deploy-pipeline/run_123 --follow

# View specific step logs
./workflow.sh logs deploy-pipeline/run_123 --step build
```

### Debugging

```yaml
# Enable debug mode for a step
- id: debug_step
  agent: ALICE
  action: complex-task
  debug: true
  params:
    verbose: true
```

```bash
# Run workflow in debug mode
./workflow.sh run my-workflow --debug

# Dry run (validate without executing)
./workflow.sh run my-workflow --dry-run
```

### Metrics

```yaml
# Workflow metrics endpoint
metrics:
  enabled: true
  endpoint: /metrics/workflows

# Available metrics:
# - workflow_runs_total
# - workflow_duration_seconds
# - workflow_step_duration_seconds
# - workflow_failures_total
```

---

## Best Practices

### 1. Idempotent Steps

```yaml
# Good: Idempotent - can be safely retried
- id: create_resource
  agent: OCTAVIA
  action: create-or-update
  params:
    name: my-resource
    spec: {...}

# Bad: Not idempotent - creates duplicates on retry
- id: create_resource
  agent: OCTAVIA
  action: create
  params:
    spec: {...}
```

### 2. Meaningful Step IDs

```yaml
# Good: Clear, descriptive IDs
- id: fetch_user_data
- id: validate_payment
- id: send_confirmation_email

# Bad: Generic IDs
- id: step1
- id: step2
- id: step3
```

### 3. Proper Timeout Configuration

```yaml
- id: long_running_task
  agent: ALICE
  action: process-large-dataset
  timeout: 30m  # Set appropriate timeout

- id: quick_check
  agent: PRISM
  action: health-check
  timeout: 30s  # Short timeout for quick operations
```

### 4. Granular Error Handling

```yaml
- id: critical_step
  agent: OCTAVIA
  action: deploy
  retry:
    max_attempts: 3
    on_errors: [timeout, connection_error]
  on_error:
    - id: rollback
      agent: OCTAVIA
      action: rollback
```

### 5. Documentation

```yaml
name: my-workflow
description: |
  This workflow processes incoming orders by:
  1. Validating the order data
  2. Checking inventory
  3. Processing payment
  4. Sending confirmation

  Trigger: Webhook from order system
  Expected duration: 2-5 minutes
  Owner: commerce-team@example.com
```

### 6. Input Validation

```yaml
input:
  type: object
  required: [order_id, customer_email]
  properties:
    order_id:
      type: string
      pattern: "^ORD-[0-9]{8}$"
    customer_email:
      type: string
      format: email
    priority:
      type: string
      enum: [low, normal, high]
      default: normal
```

### 7. Secrets Management

```yaml
# Good: Use secrets reference
- id: api_call
  type: http
  headers:
    Authorization: Bearer ${{ secrets.API_TOKEN }}

# Bad: Hardcoded secrets
- id: api_call
  type: http
  headers:
    Authorization: Bearer sk-1234567890
```

---

## CLI Reference

```bash
# Workflow management
./workflow.sh list                    # List all workflows
./workflow.sh show <name>             # Show workflow details
./workflow.sh register <file>         # Register new workflow
./workflow.sh update <name> <file>    # Update workflow
./workflow.sh delete <name>           # Delete workflow

# Run management
./workflow.sh run <name> [--input JSON]   # Start workflow
./workflow.sh status <run_id>             # Check run status
./workflow.sh logs <run_id>               # View logs
./workflow.sh cancel <run_id>             # Cancel running workflow
./workflow.sh retry <run_id>              # Retry failed workflow

# Debugging
./workflow.sh validate <file>         # Validate workflow file
./workflow.sh dry-run <name>          # Simulate execution
./workflow.sh debug <run_id>          # Debug failed run
```

---

## API Reference

### Start Workflow

```bash
curl -X POST "https://api.blackroad.io/v1/workflows/deploy-pipeline/runs" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "input": {
      "branch": "main",
      "environment": "production"
    }
  }'
```

### Get Run Status

```bash
curl "https://api.blackroad.io/v1/workflows/deploy-pipeline/runs/run_123" \
  -H "Authorization: Bearer $TOKEN"
```

### Cancel Run

```bash
curl -X POST "https://api.blackroad.io/v1/workflows/deploy-pipeline/runs/run_123/cancel" \
  -H "Authorization: Bearer $TOKEN"
```

---

*Last updated: 2026-02-05*
