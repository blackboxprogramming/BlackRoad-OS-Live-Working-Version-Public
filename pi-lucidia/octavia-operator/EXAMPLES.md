# BlackRoad OS Examples & Recipes

> Practical code examples for common BlackRoad OS tasks

---

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Agent Examples](#agent-examples)
- [Memory Examples](#memory-examples)
- [Task Examples](#task-examples)
- [Workflow Examples](#workflow-examples)
- [Integration Examples](#integration-examples)
- [API Examples](#api-examples)
- [CLI Recipes](#cli-recipes)

---

## Quick Start Examples

### Hello World Agent

```python
# hello_agent.py
from blackroad.agents import Agent

async def main():
    # Create and wake an agent
    agent = Agent({"name": "HELLO", "type": "worker"})
    await agent.wake("llama3.2")

    # Send a message
    response = await agent.chat("Hello! What can you do?")
    print(response)

    # Shutdown
    await agent.shutdown()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Simple Task Execution

```python
# simple_task.py
from blackroad.tasks import TaskQueue

async def main():
    queue = TaskQueue()

    # Create a task
    task = await queue.create({
        "title": "Analyze this file",
        "description": "Review code quality",
        "agent": "ALICE",
        "priority": "normal"
    })

    # Wait for completion
    result = await queue.wait(task.id)
    print(f"Task completed: {result}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Memory Store and Retrieve

```python
# memory_example.py
from blackroad.memory import Memory

async def main():
    memory = Memory()

    # Store a memory
    await memory.store(
        key="user_preference",
        value={"theme": "dark", "language": "en"},
        tier="semantic"
    )

    # Retrieve it
    pref = await memory.get("user_preference")
    print(f"Preferences: {pref}")

    # Search memories
    results = await memory.search("user settings", limit=5)
    for r in results:
        print(f"Found: {r['key']} (score: {r['score']:.2f})")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

---

## Agent Examples

### Create a Custom Agent

```python
# custom_agent.py
from blackroad.agents import Agent, AgentConfig

# Define agent configuration
config = AgentConfig(
    name="NOVA",
    type="creative",
    model="llama3.2",
    system_prompt="""You are NOVA, a creative AI assistant.
    You specialize in brainstorming, creative writing, and
    generating innovative ideas.""",
    temperature=0.9,
    capabilities=["brainstorm", "write", "ideate"]
)

# Create and use the agent
async def main():
    agent = Agent(config)
    await agent.wake()

    # Creative task
    ideas = await agent.run("brainstorm", {
        "topic": "AI-powered productivity tools",
        "count": 5
    })

    for idea in ideas:
        print(f"- {idea}")

    await agent.shutdown()
```

### Multi-Agent Collaboration

```python
# multi_agent.py
from blackroad.agents import AgentPool
from blackroad.coordination import Coordinator

async def analyze_and_fix_code(code: str):
    pool = AgentPool()
    coordinator = Coordinator(pool)

    # Step 1: PRISM analyzes the code
    analysis = await coordinator.assign(
        agent="PRISM",
        task="analyze_code",
        params={"code": code}
    )

    # Step 2: If issues found, ALICE fixes them
    if analysis["issues"]:
        fixed_code = await coordinator.assign(
            agent="ALICE",
            task="fix_code",
            params={
                "code": code,
                "issues": analysis["issues"]
            }
        )

        # Step 3: CIPHER does security review
        security = await coordinator.assign(
            agent="CIPHER",
            task="security_scan",
            params={"code": fixed_code}
        )

        return {
            "original_issues": analysis["issues"],
            "fixed_code": fixed_code,
            "security_status": security
        }

    return {"status": "clean", "code": code}
```

### Agent with Custom Skills

```python
# skilled_agent.py
from blackroad.agents import Agent
from blackroad.skills import Skill

# Define a custom skill
class DataAnalysisSkill(Skill):
    name = "data_analysis"

    async def execute(self, data: list) -> dict:
        import statistics

        return {
            "count": len(data),
            "mean": statistics.mean(data),
            "median": statistics.median(data),
            "std_dev": statistics.stdev(data) if len(data) > 1 else 0
        }

# Use with agent
async def main():
    agent = Agent({"name": "ANALYST", "type": "analytics"})
    agent.register_skill(DataAnalysisSkill())
    await agent.wake("llama3.2")

    # Use the skill
    result = await agent.use_skill("data_analysis", {
        "data": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    })

    print(f"Analysis: {result}")
```

### Agent Event Handlers

```python
# agent_events.py
from blackroad.agents import Agent

agent = Agent({"name": "WATCHER", "type": "monitor"})

@agent.on("task_started")
async def handle_task_start(event):
    print(f"Task started: {event.task_id}")

@agent.on("task_completed")
async def handle_task_complete(event):
    print(f"Task completed: {event.task_id} in {event.duration}s")

@agent.on("error")
async def handle_error(event):
    print(f"Error: {event.error}")
    # Could notify, log, or recover

@agent.on("message")
async def handle_message(event):
    if event.from_agent:
        print(f"Message from {event.from_agent}: {event.content}")
```

---

## Memory Examples

### Hierarchical Memory Usage

```python
# hierarchical_memory.py
from blackroad.memory import Memory

async def main():
    memory = Memory()

    # Working memory - current session data
    await memory.store(
        key="current_task",
        value={"id": "task_123", "status": "active"},
        tier="working",
        ttl=3600  # 1 hour
    )

    # Episodic memory - conversation history
    await memory.store(
        key="conversation:user_456:2026-02-05",
        value={
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
        },
        tier="episodic",
        ttl=2592000  # 30 days
    )

    # Semantic memory - learned knowledge
    await memory.store(
        key="knowledge:deployment_process",
        value="To deploy, run ./deploy.sh followed by...",
        tier="semantic"
        # No TTL - permanent
    )

    # Search across all tiers
    results = await memory.search(
        query="deployment",
        tier="all"
    )
```

### Memory Consolidation

```python
# memory_consolidation.py
from blackroad.memory import Memory, Consolidator

async def consolidate_memories():
    memory = Memory()
    consolidator = Consolidator(memory)

    # Consolidate working -> episodic
    result = await consolidator.run(
        source="working",
        target="episodic",
        older_than_hours=24,
        summarize=True
    )
    print(f"Consolidated {result.count} memories")

    # Consolidate episodic -> semantic
    result = await consolidator.run(
        source="episodic",
        target="semantic",
        older_than_days=7,
        summarize=True
    )
    print(f"Created {result.summaries} semantic entries")
```

### Semantic Search

```python
# semantic_search.py
from blackroad.memory import SemanticMemory

async def semantic_search_example():
    sm = SemanticMemory()

    # Store documents with embeddings
    documents = [
        "Railway is a cloud platform for deploying applications",
        "Cloudflare provides edge computing and CDN services",
        "Vercel specializes in frontend hosting and serverless",
        "DigitalOcean offers virtual machines and managed databases"
    ]

    for i, doc in enumerate(documents):
        await sm.store(f"doc_{i}", doc)

    # Search semantically
    results = await sm.search(
        query="Where should I deploy my React app?",
        limit=3
    )

    for result in results:
        print(f"[{result['score']:.2f}] {result['content']}")
```

### Cross-Agent Memory Sharing

```python
# shared_memory.py
from blackroad.memory import SharedMemory

async def share_between_agents():
    memory = SharedMemory()

    # OCTAVIA stores deployment info
    await memory.store(
        key="deployment:latest",
        value={"version": "1.2.3", "status": "success"},
        owner="OCTAVIA",
        share_with=["ALICE", "CIPHER"]  # Specific agents
    )

    # ALICE can read it
    data = await memory.get_shared(
        key="deployment:latest",
        owner="OCTAVIA",
        requester="ALICE"
    )

    # Or share publicly
    await memory.store(
        key="announcement",
        value="System maintenance at 2 AM",
        owner="OCTAVIA",
        permission="public"
    )
```

---

## Task Examples

### Create and Track Tasks

```python
# task_management.py
from blackroad.tasks import TaskManager

async def manage_tasks():
    tm = TaskManager()

    # Create a task
    task = await tm.create({
        "title": "Review PR #456",
        "description": "Check for security issues and code quality",
        "agent": "ALICE",
        "priority": "high",
        "deadline": "2026-02-06T12:00:00Z"
    })

    print(f"Created task: {task.id}")

    # Check status
    status = await tm.status(task.id)
    print(f"Status: {status}")

    # List all tasks
    all_tasks = await tm.list(
        status="pending",
        agent="ALICE"
    )

    for t in all_tasks:
        print(f"- {t.title} [{t.priority}]")
```

### Task Dependencies

```python
# task_dependencies.py
from blackroad.tasks import TaskManager

async def create_dependent_tasks():
    tm = TaskManager()

    # Create parent task
    build = await tm.create({
        "title": "Build application",
        "agent": "OCTAVIA"
    })

    # Create dependent tasks
    test = await tm.create({
        "title": "Run tests",
        "agent": "ALICE",
        "depends_on": [build.id]
    })

    deploy = await tm.create({
        "title": "Deploy to staging",
        "agent": "OCTAVIA",
        "depends_on": [test.id]
    })

    # Tasks will execute in order
    await tm.execute_all()
```

### Parallel Task Execution

```python
# parallel_tasks.py
from blackroad.tasks import TaskManager
import asyncio

async def run_parallel():
    tm = TaskManager()

    # Create multiple independent tasks
    tasks = await asyncio.gather(
        tm.create({"title": "Lint code", "agent": "ALICE"}),
        tm.create({"title": "Run unit tests", "agent": "ALICE"}),
        tm.create({"title": "Security scan", "agent": "CIPHER"}),
        tm.create({"title": "Build docs", "agent": "PRISM"})
    )

    # Execute all in parallel
    results = await tm.execute_parallel([t.id for t in tasks])

    for result in results:
        print(f"{result.task_id}: {result.status}")
```

---

## Workflow Examples

### CI/CD Pipeline

```yaml
# workflows/ci-cd.yaml
name: ci-cd-pipeline
version: 1.0.0

trigger:
  - type: webhook
    path: /hooks/github
    events: [push]

input:
  branch:
    type: string
    default: main

steps:
  - id: checkout
    agent: ALICE
    action: git-checkout
    params:
      branch: ${{ input.branch }}

  - id: install
    agent: ALICE
    action: npm-install
    depends_on: [checkout]

  - id: lint
    agent: ALICE
    action: npm-run
    params:
      script: lint
    depends_on: [install]

  - id: test
    agent: ALICE
    action: npm-run
    params:
      script: test
    depends_on: [install]

  - id: build
    agent: OCTAVIA
    action: npm-run
    params:
      script: build
    depends_on: [lint, test]
    condition: ${{ steps.lint.success && steps.test.success }}

  - id: deploy
    agent: OCTAVIA
    action: deploy
    params:
      environment: staging
    depends_on: [build]
    condition: ${{ input.branch == 'main' }}

  - id: notify
    action: slack-notify
    params:
      channel: "#deployments"
      message: "Deployed ${{ input.branch }} to staging"
    depends_on: [deploy]
```

### Data Processing Pipeline

```python
# data_pipeline.py
from blackroad.workflows import Workflow, Step

async def create_data_pipeline():
    workflow = Workflow("data-processing")

    # Step 1: Extract data
    @workflow.step(id="extract")
    async def extract(ctx):
        data = await ctx.skill("database").query(
            "SELECT * FROM events WHERE date > $1",
            [ctx.input["start_date"]]
        )
        return {"records": data}

    # Step 2: Transform data
    @workflow.step(id="transform", depends_on=["extract"])
    async def transform(ctx):
        records = ctx.steps["extract"].output["records"]
        transformed = []
        for record in records:
            transformed.append({
                "id": record["id"],
                "timestamp": record["created_at"],
                "value": record["amount"] * 1.1  # Apply transformation
            })
        return {"transformed": transformed}

    # Step 3: Load data
    @workflow.step(id="load", depends_on=["transform"])
    async def load(ctx):
        data = ctx.steps["transform"].output["transformed"]
        await ctx.skill("database").bulk_insert(
            "processed_events",
            data
        )
        return {"loaded": len(data)}

    # Step 4: Notify completion
    @workflow.step(id="notify", depends_on=["load"])
    async def notify(ctx):
        count = ctx.steps["load"].output["loaded"]
        await ctx.skill("slack").send(
            channel="#data-team",
            message=f"Processed {count} records"
        )

    return workflow
```

### Approval Workflow

```yaml
# workflows/approval.yaml
name: deployment-approval
version: 1.0.0

input:
  environment:
    type: string
    enum: [staging, production]

steps:
  - id: prepare
    agent: OCTAVIA
    action: prepare-deployment
    params:
      env: ${{ input.environment }}

  - id: security-review
    agent: CIPHER
    action: security-scan
    depends_on: [prepare]

  - id: approval
    type: approval
    depends_on: [security-review]
    condition: ${{ input.environment == 'production' }}
    config:
      approvers:
        - admin@example.com
      timeout: 24h
      message: |
        Deployment to production requires approval.
        Security scan: ${{ steps.security-review.output.status }}

  - id: deploy
    agent: OCTAVIA
    action: deploy
    depends_on: [approval]
    params:
      environment: ${{ input.environment }}

  - id: verify
    agent: PRISM
    action: verify-deployment
    depends_on: [deploy]

  - id: rollback
    agent: OCTAVIA
    action: rollback
    depends_on: [verify]
    condition: ${{ steps.verify.output.healthy == false }}
```

---

## Integration Examples

### GitHub Integration

```python
# github_integration.py
from blackroad.integrations import GitHub

async def github_operations():
    gh = GitHub()

    # Create an issue
    issue = await gh.issues.create(
        repo="blackroad-os/blackroad",
        title="Bug: Memory leak in agent service",
        body="""
        ## Description
        Memory usage grows over time...

        ## Steps to Reproduce
        1. Start agent service
        2. Run for 24 hours
        3. Observe memory usage
        """,
        labels=["bug", "memory"]
    )

    # Create a branch
    await gh.branches.create(
        repo="blackroad-os/blackroad",
        branch=f"fix/issue-{issue.number}",
        from_branch="main"
    )

    # Create a PR
    pr = await gh.pulls.create(
        repo="blackroad-os/blackroad",
        title=f"Fix: Memory leak (closes #{issue.number})",
        body="Fixed the memory leak by...",
        head=f"fix/issue-{issue.number}",
        base="main"
    )

    # Request review
    await gh.pulls.request_review(
        repo="blackroad-os/blackroad",
        pr_number=pr.number,
        reviewers=["teammate"]
    )
```

### Slack Integration

```python
# slack_integration.py
from blackroad.integrations import Slack

async def slack_operations():
    slack = Slack()

    # Send a simple message
    await slack.send(
        channel="#general",
        text="Hello from BlackRoad!"
    )

    # Send a rich message
    await slack.send(
        channel="#deployments",
        blocks=[
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Deployment Complete"
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": "*Environment:*\nProduction"},
                    {"type": "mrkdwn", "text": "*Version:*\n1.2.3"},
                    {"type": "mrkdwn", "text": "*Status:*\n:white_check_mark: Success"},
                    {"type": "mrkdwn", "text": "*Duration:*\n4m 32s"}
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "View Logs"},
                        "url": "https://logs.blackroad.io/deploy/123"
                    }
                ]
            }
        ]
    )
```

### Database Integration

```python
# database_integration.py
from blackroad.integrations import PostgreSQL

async def database_operations():
    db = PostgreSQL()

    # Query with parameters
    users = await db.query(
        "SELECT * FROM users WHERE created_at > $1 AND active = $2",
        ["2026-01-01", True]
    )

    # Insert with returning
    new_user = await db.query_one(
        """
        INSERT INTO users (name, email, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *
        """,
        ["John Doe", "john@example.com"]
    )

    # Transaction
    async with db.transaction() as tx:
        await tx.execute(
            "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
            [100, 1]
        )
        await tx.execute(
            "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
            [100, 2]
        )
        await tx.execute(
            "INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)",
            [1, 2, 100]
        )
```

---

## API Examples

### REST API Usage

```python
# api_usage.py
import aiohttp

BASE_URL = "https://api.blackroad.io/v1"
API_KEY = "your-api-key"

async def api_examples():
    headers = {"Authorization": f"Bearer {API_KEY}"}

    async with aiohttp.ClientSession() as session:
        # List agents
        async with session.get(
            f"{BASE_URL}/agents",
            headers=headers
        ) as response:
            agents = await response.json()
            print(f"Agents: {agents}")

        # Create a task
        async with session.post(
            f"{BASE_URL}/tasks",
            headers=headers,
            json={
                "title": "Review code",
                "agent_id": "agent_alice_001",
                "priority": "high"
            }
        ) as response:
            task = await response.json()
            print(f"Created task: {task['id']}")

        # Search memory
        async with session.post(
            f"{BASE_URL}/memory/search",
            headers=headers,
            json={
                "query": "deployment guide",
                "limit": 10
            }
        ) as response:
            results = await response.json()
            print(f"Found {len(results['data'])} memories")
```

### WebSocket Real-time Updates

```python
# websocket_example.py
import asyncio
import websockets
import json

async def listen_to_events():
    uri = "wss://api.blackroad.io/v1/ws"

    async with websockets.connect(uri) as ws:
        # Authenticate
        await ws.send(json.dumps({
            "type": "auth",
            "token": "your-api-key"
        }))

        # Subscribe to events
        await ws.send(json.dumps({
            "type": "subscribe",
            "channels": ["tasks", "agents"]
        }))

        # Listen for events
        async for message in ws:
            event = json.loads(message)

            if event["type"] == "task.created":
                print(f"New task: {event['data']['title']}")
            elif event["type"] == "task.completed":
                print(f"Task completed: {event['data']['id']}")
            elif event["type"] == "agent.status":
                print(f"Agent {event['data']['name']}: {event['data']['status']}")
```

---

## CLI Recipes

### Quick Agent Operations

```bash
# Wake an agent and have a conversation
./wake.sh llama3.2 ALICE && ./chat.sh ALICE

# Assign a task to an agent
./tasks.sh assign ALICE "Review the latest PR"

# Check task status
./tasks.sh status

# View agent logs
./logs.sh --agent ALICE --since 1h
```

### Memory Operations

```bash
# Search memory
./mem.sh search "deployment guide"

# Store a value
./mem.sh store "my_key" "my_value" --tier semantic

# Get a value
./mem.sh get "my_key"

# View memory stats
./mem.sh stats
```

### Workflow Operations

```bash
# Run a workflow
./workflow.sh run ci-cd --input '{"branch": "feature/new"}'

# Check workflow status
./workflow.sh status ci-cd/run_123

# View workflow logs
./workflow.sh logs ci-cd/run_123

# Cancel a workflow
./workflow.sh cancel ci-cd/run_123
```

### Infrastructure Operations

```bash
# Full system status
./blackroad-mesh.sh

# Health check
./health.sh

# Deploy to all environments
./deploy.sh all

# View infrastructure costs
./costs.sh --month current
```

### One-Liners

```bash
# Quick deploy and notify
./deploy.sh staging && ./alert.sh info "Deployed to staging"

# Check all services and fix if broken
./health.sh --fix

# Export all memories to backup
./mem.sh export > backup_$(date +%Y%m%d).json

# Find and kill stuck tasks
./tasks.sh list --status stuck | xargs -I {} ./tasks.sh cancel {}

# Monitor real-time with filtering
./monitor.sh --agents | grep -E "(ALICE|OCTAVIA)"
```

---

*Last updated: 2026-02-05*
