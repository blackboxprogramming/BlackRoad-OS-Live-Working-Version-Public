# BlackRoad OS - Analytics Service

> Business intelligence, anomaly detection, and decision automation

## Overview

The Analytics service provides intelligent business analytics, anomaly detection, cohort analysis, and automated decision planning for BlackRoad OS.

## Features

### Anomaly Detection (`anomaly_rules.py`)
- Rule-based metric anomaly detection
- Safe expression evaluation with AST visitor pattern
- Configurable severity levels
- Percentage drop and delta threshold detection
- Time series analysis with trailing window

### Cohort Analysis (`cohorts.py`)
- User segmentation and cohort tracking
- Multi-metric aggregation:
  - Revenue
  - Gross margin percentage
  - NPS (Net Promoter Score)
  - Return rate
  - Uptime
  - MTTR (Mean Time To Recovery)
- Period-based bucketing (Monthly, Weekly, Quarterly)

### Decision Engine (`decide.py`)
- Action heuristics mapping
- Credit budget constraints
- Goal-based action selection
- RACI matrix generation
- Impact-scored decision optimization
- Multi-goal support

### Narrative Generation (`narrative.py`)
- Automated report generation (Markdown, PPTX)
- Executive summaries with structured sections:
  - What happened
  - Why it matters
  - What we're doing
  - Risks & Next Steps
- Schema validation for outputs

## Configuration

Config files expected at:
```
configs/analytics/
├── rules.yaml          # Anomaly detection rules
├── goals.yaml          # Business goals
├── constraints.yaml    # Decision constraints
└── cohorts.yaml        # Cohort definitions
```

## Usage

```python
from services.analytics import anomaly_rules, decide, narrative

# Detect anomalies
anomalies = anomaly_rules.run_rules(rules_path, "7d")

# Plan actions based on anomalies
plan_path = decide.plan_actions(anomalies_path, goals_path, constraints_path)

# Generate narrative report
report = narrative.generate(data, template="executive")
```

## Integration

### Railway Deployment
- Service: `blackroad-os-core`
- Domain: `core.blackroad.systems`
- Health: `GET /health`

### Endpoints
- `POST /v1/analytics/anomalies` - Detect anomalies
- `GET /v1/analytics/cohorts/:id` - Get cohort metrics
- `POST /v1/analytics/decide` - Plan actions
- `POST /v1/analytics/report` - Generate narrative

## Artifacts

All operations generate artifacts in:
```
artifacts/
├── anomalies/
│   ├── YYYYMMDDHHMMSS.json
│   ├── YYYYMMDDHHMMSS.md
│   └── latest.json
├── decisions/
│   └── plan_YYYYMMDDHHMMSS.json
└── reports/
    └── YYYYMMDDHHMMSS.md
```

## Decision Heuristics

Built-in action mappings:

| Metric | Action | Bot | Credits | Impact |
|--------|--------|-----|---------|--------|
| uptime | SRE mitigation | sre_bot | 8 | 4 |
| revenue | Adjust Pricing | pricing_bot | 10 | 5 |

## Source

Extracted from: `blackroad-prism-console/analytics/`
