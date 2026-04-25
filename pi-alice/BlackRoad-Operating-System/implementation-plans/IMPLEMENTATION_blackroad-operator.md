# 🚀 IMPLEMENTATION PLAN: blackroad-operator
## Workflow Orchestration & Agent Scheduler

**Repo**: `blackboxprogramming/blackroad-operator`
**Purpose**: Agent orchestration, workflow automation, scheduled tasks
**Phase**: **Phase 2 (Months 12-18)**

---

## PURPOSE

**blackroad-operator** is the **workflow orchestration engine** that:
- Runs 200+ agents on schedules (cron-like)
- Orchestrates multi-step workflows
- Integrates with Prism (job queue) and Lucidia (AI)
- Provides human-in-the-loop approval gates
- Manages background tasks and long-running processes

**Role in Architecture**: **Layer 4** (Orchestration & Intelligence)

---

## KEY COMPONENTS

### 1. Scheduler

```python
# app/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from agents import registry

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=2)  # Daily at 2am
async def backup_database():
    agent = registry.get('BackupAgent')
    await agent.execute()

@scheduler.scheduled_job('interval', minutes=15)
async def health_check_services():
    agent = registry.get('HealthCheckAgent')
    await agent.execute()
```

### 2. Workflow Engine

```python
# app/workflows/deploy_flow.py
from app.workflow import Workflow, Step

deploy_workflow = Workflow(
    name="Deploy New Feature",
    steps=[
        Step("lint", agent="LintAgent"),
        Step("test", agent="TestAgent", depends_on=["lint"]),
        Step("build", agent="BuildAgent", depends_on=["test"]),
        Step("deploy_staging", agent="DeployAgent", config={"env": "staging"}),
        Step("smoke_test", agent="SmokeTestAgent", depends_on=["deploy_staging"]),
        Step("human_approval", type="approval", timeout="24h"),
        Step("deploy_prod", agent="DeployAgent", config={"env": "production"}),
    ]
)
```

### 3. Prism Integration

```python
# app/prism.py
import httpx

class PrismClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def create_job(self, job_type: str, metadata: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/jobs",
                json={"type": job_type, "metadata": metadata}
            )
            return response.json()

    async def stream_job_status(self, job_id: str):
        # WebSocket connection for real-time updates
        pass
```

---

## MIGRATION FROM MONOLITH

**What Moves**:
- `agents/` directory (all 200+ agents)
- New: Scheduler code
- New: Workflow definitions
- New: Prism integration

**Migration Steps**:
1. Copy `agents/` from monolith
2. Add scheduler (APScheduler or Celery Beat)
3. Create workflow engine
4. Deploy to Railway as worker service
5. Connect to Prism via API

**Effort**: 3-4 weeks

---

## REQUIRED WORKFLOWS

1. **CI/CD** - Lint, test agents, deploy to Railway
2. **Agent Tests** - Unit tests for all 200+ agents
3. **Integration Tests** - Test workflows end-to-end
4. **Performance Monitoring** - Track agent execution time

---

## CLOUDFLARE & DOMAINS

**Domain**: `operator.blackroad.systems` (internal only, not public)
**Access**: API gateway proxies requests from `api.blackroad.systems/api/agents/*`

---

## PHASE 2 MILESTONES

**Month 12-13**: Repo setup, agent migration
**Month 14-15**: Scheduler implementation
**Month 16-17**: Workflow engine
**Month 18**: Production deployment

**Success Criteria**:
- ✅ All 200+ agents migrated
- ✅ 10+ scheduled jobs running daily
- ✅ 5+ workflows in production
- ✅ 99.5% agent success rate

---

**Last Updated**: 2025-11-18
