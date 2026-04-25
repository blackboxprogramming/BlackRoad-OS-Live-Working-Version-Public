# BlackRoad Operator Engine

**Version:** 0.1.0
**Status:** Phase 2 Scaffold

## Overview

The Operator Engine is BlackRoad OS's workflow orchestration and job scheduling system. It manages scheduled tasks, agent execution, and background jobs across the entire BlackRoad ecosystem.

## Features

- **Job Registry**: In-memory job storage and management
- **Scheduler**: Simple interval-based job scheduler
- **HTTP API**: Optional FastAPI server for remote job management
- **Extensible**: Designed to integrate with Celery, RQ, or APScheduler in production

## Architecture

```
operator_engine/
├── __init__.py          # Package exports
├── config.py            # Configuration settings
├── jobs.py              # Job models and registry
├── scheduler.py         # Scheduler implementation
├── server.py            # Optional HTTP server
├── tests/               # Test suite
│   ├── test_jobs.py
│   └── test_scheduler.py
└── README.md            # This file
```

## Quick Start

### As a Library

```python
from operator_engine import Job, JobStatus, Scheduler, job_registry

# Create a job
job = Job(
    name="Daily Backup",
    schedule="0 0 * * *",  # Cron-style schedule
    metadata={"category": "maintenance"}
)

# Add to registry
job_registry.add_job(job)

# Execute immediately
scheduler = Scheduler()
result = await scheduler.execute_job(job.id)

print(f"Job {result.name} completed with status {result.status}")
```

### As a Service

```bash
# Run the HTTP server
python -m operator_engine.server

# Server runs on http://localhost:8001
# API docs at http://localhost:8001/docs
```

### API Endpoints

- `GET /health` - Health check
- `GET /jobs` - List all jobs
- `GET /jobs/{job_id}` - Get specific job
- `POST /jobs/{job_id}/execute` - Execute job immediately
- `GET /scheduler/status` - Get scheduler status

## Example Jobs

The Operator Engine comes with 3 example jobs:

1. **Health Check Monitor** - Runs every 5 minutes
2. **Agent Sync** - Runs every hour
3. **Blockchain Ledger Sync** - Runs daily at midnight

## Running Tests

```bash
# Install pytest if not already installed
pip install pytest pytest-asyncio

# Run tests
python -m pytest operator_engine/tests/ -v

# With coverage
python -m pytest operator_engine/tests/ --cov=operator_engine --cov-report=html
```

## Configuration

The Operator Engine uses environment variables for configuration:

```bash
# Core settings
APP_NAME="BlackRoad Operator Engine"
APP_VERSION="0.1.0"
ENVIRONMENT="development"

# Scheduler settings
SCHEDULER_INTERVAL_SECONDS=60
MAX_CONCURRENT_JOBS=5
JOB_TIMEOUT_SECONDS=300

# Database (shared with main backend)
DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/db"
REDIS_URL="redis://localhost:6379/0"

# Logging
LOG_LEVEL="INFO"
```

## Integration with BlackRoad OS

The Operator Engine integrates with:

- **Backend API** (`/api/jobs`) - Job management endpoints
- **Prism Console** - Job monitoring UI
- **Agent Library** - Scheduled agent execution
- **RoadChain** - Ledger sync jobs
- **Vault** - Compliance audit jobs

## Phase 2 Roadmap

Current implementation is a **minimal scaffold**. Production roadmap includes:

- [ ] Persistent job storage (PostgreSQL)
- [ ] Distributed scheduling (Celery/RQ)
- [ ] Job dependencies and workflows
- [ ] Real-time job monitoring (WebSocket)
- [ ] Retry logic and error handling
- [ ] Job prioritization and queuing
- [ ] Integration with agent execution framework
- [ ] Metrics and observability (Prometheus)

## How to Run Locally

```bash
# Option 1: As a library (import in Python)
python
>>> from operator_engine import scheduler
>>> status = scheduler.get_status()
>>> print(status)

# Option 2: As a standalone service
python -m operator_engine.server

# Visit http://localhost:8001/docs for API documentation
```

## Development

```bash
# Install dependencies
pip install fastapi uvicorn pydantic-settings

# Run tests
pytest operator_engine/tests/

# Start server in dev mode
python -m operator_engine.server
```

## License

Part of BlackRoad Operating System - MIT License

---

**Next Steps**: Integrate with main backend, add persistent storage, implement distributed scheduling.
