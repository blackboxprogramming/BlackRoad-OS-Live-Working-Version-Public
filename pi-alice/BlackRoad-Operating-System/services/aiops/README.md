# BlackRoad OS - AIops Service

> AI-powered operations and automated incident response

## Overview

The AIops service provides intelligent operational monitoring, automated remediation, and SLO budget management for BlackRoad OS infrastructure.

## Features

### Canary Analysis (`canary.py`)
- Compare metric snapshots between baseline and canary deployments
- Configurable thresholds for latency (p50, p95) and error rates
- Automatic pass/fail determination
- Artifact generation for audit trails

### Config Drift Detection (`config_drift.py`)
- Detect configuration changes across environments
- Severity-based alerting (critical/warning)
- Baseline comparison for compliance

### Event Correlation (`correlation.py`)
- Rule-based event correlation engine
- Multi-source event integration (incidents, healthchecks, changes, anomalies)
- Time-window based pattern matching
- Root cause identification

### Auto-Remediation (`remediation.py`)
- Runbook-based automated responses
- Maintenance window enforcement
- Dry-run execution support
- Execution blocking for safety

### SLO Budget Management (`slo_budget.py`)
- Error budget calculation and tracking
- Budget state management (ok/warn/burning)
- Alert generation for budget exhaustion

## Configuration

Config files are expected at:
```
configs/aiops/
├── canary.yaml         # Canary analysis thresholds
├── correlation.yaml    # Correlation rules
└── maintenance.yaml    # Maintenance windows
```

## Usage

```python
from services.aiops import canary, remediation, slo_budget

# Run canary analysis
result = canary.analyze(base_path, canary_path)

# Check SLO budget
status = slo_budget.budget_status("api-gateway", "7d")

# Plan remediation
plan = remediation.plan(correlations)
```

## Integration

### Railway Deployment
- Service: `blackroad-os-infra`
- Domain: `infra.blackroad.systems`
- Health: `GET /health`

### Endpoints
- `POST /v1/aiops/canary` - Run canary analysis
- `POST /v1/aiops/correlate` - Correlate events
- `POST /v1/aiops/remediate` - Execute remediation
- `GET /v1/aiops/slo/:service` - Get SLO budget status

## Artifacts

All operations generate artifacts in:
```
artifacts/aiops/
├── canary_YYYYMMDDHHMMSS/
│   ├── diff.json
│   └── report.md
├── correlation_YYYYMMDDHHMMSS.json
├── plan.json
└── exec_YYYYMMDDHHMMSS/
    ├── log.jsonl
    └── summary.md
```

## Source

Extracted from: `blackroad-prism-console/aiops/`
