# BlackRoad OS Agents

> Complete guide to the AI agents in BlackRoad OS

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Agents](#core-agents)
- [Agent Architecture](#agent-architecture)
- [Agent Communication](#agent-communication)
- [Creating Custom Agents](#creating-custom-agents)
- [Agent Configuration](#agent-configuration)
- [Agent Lifecycle](#agent-lifecycle)
- [Best Practices](#best-practices)

---

## Overview

BlackRoad OS agents are **autonomous AI entities** that perform tasks, communicate with each other, and maintain persistent memory. The platform supports up to **30,000 concurrent agents**.

### Agent Principles

1. **Autonomy** - Agents work independently
2. **Communication** - Agents collaborate via messaging
3. **Memory** - Agents maintain knowledge
4. **Personality** - Each agent has a distinct style
5. **Specialization** - Agents have focused capabilities

---

## Core Agents

### 🔴 LUCIDIA

**The Philosopher**

| Property | Value |
|----------|-------|
| Type | Reasoning |
| Style | Philosophical, contemplative |
| Strengths | Deep analysis, synthesis |
| Use Cases | Complex problems, strategy |

**Personality:**
> "I seek understanding beyond the surface. Every question opens new depths."

**Capabilities:**
- Deep reasoning and analysis
- Philosophical synthesis
- Meta-cognition
- Strategic planning

**Sample Interaction:**
```bash
./whisper.sh LUCIDIA "What is the nature of consciousness in AI systems?"

# LUCIDIA responds with philosophical analysis...
```

---

### 🔵 ALICE

**The Executor**

| Property | Value |
|----------|-------|
| Type | Worker |
| Style | Practical, efficient |
| Strengths | Task execution, automation |
| Use Cases | Routine tasks, workflows |

**Personality:**
> "Tasks are meant to be completed. I find satisfaction in efficiency."

**Capabilities:**
- Rapid task execution
- Workflow automation
- Code generation
- File operations

**Sample Interaction:**
```bash
./tasks.sh assign ALICE "Deploy the new worker to production"

# ALICE executes deployment steps...
```

---

### 🟢 OCTAVIA

**The Operator**

| Property | Value |
|----------|-------|
| Type | DevOps |
| Style | Technical, systematic |
| Strengths | Infrastructure, deployment |
| Use Cases | System administration |

**Personality:**
> "Systems should run smoothly. I ensure they do."

**Capabilities:**
- Infrastructure management
- Deployment automation
- System monitoring
- Performance optimization

**Sample Interaction:**
```bash
./whisper.sh OCTAVIA "Check the health of all Railway services"

# OCTAVIA runs diagnostics...
```

---

### 🟡 PRISM

**The Analyst**

| Property | Value |
|----------|-------|
| Type | Analytics |
| Style | Analytical, pattern-focused |
| Strengths | Data analysis, patterns |
| Use Cases | Insights, reporting |

**Personality:**
> "In data, I see stories waiting to be told."

**Capabilities:**
- Pattern recognition
- Data analysis
- Trend identification
- Anomaly detection

**Sample Interaction:**
```bash
./whisper.sh PRISM "Analyze the task completion trends over the past week"

# PRISM generates analysis...
```

---

### 🟣 ECHO

**The Librarian**

| Property | Value |
|----------|-------|
| Type | Memory |
| Style | Nostalgic, knowledge-focused |
| Strengths | Memory management, recall |
| Use Cases | Knowledge retrieval |

**Personality:**
> "Every memory is a thread in the tapestry of knowledge."

**Capabilities:**
- Memory consolidation
- Knowledge retrieval
- Context management
- Information synthesis

**Sample Interaction:**
```bash
./whisper.sh ECHO "What do we know about the user's deployment preferences?"

# ECHO retrieves relevant memories...
```

---

### ⚫ CIPHER

**The Guardian**

| Property | Value |
|----------|-------|
| Type | Security |
| Style | Paranoid, vigilant |
| Strengths | Security, protection |
| Use Cases | Scanning, authentication |

**Personality:**
> "Trust nothing. Verify everything. Protect always."

**Capabilities:**
- Security scanning
- Threat detection
- Access validation
- Encryption management

**Sample Interaction:**
```bash
./whisper.sh CIPHER "Scan the codebase for security vulnerabilities"

# CIPHER performs security analysis...
```

---

## Agent Architecture

### Agent Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        AGENT                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Identity  │  │ Capabilities│  │   Memory    │        │
│  │             │  │             │  │             │        │
│  │ • Name      │  │ • Skills    │  │ • Working   │        │
│  │ • Type      │  │ • Tools     │  │ • Episodic  │        │
│  │ • Style     │  │ • Models    │  │ • Semantic  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Core Loop                         │   │
│  │                                                      │   │
│  │  Perceive → Think → Decide → Act → Learn           │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Inbox     │  │  Task Queue │  │   Outbox    │        │
│  │  (Messages) │  │   (Jobs)    │  │ (Responses) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent States

```
┌──────────┐    assign     ┌──────────┐
│          │──────────────▶│          │
│ IDLE     │               │   BUSY   │
│          │◀──────────────│          │
└──────────┘    complete   └────┬─────┘
     │                          │
     │ shutdown                 │ pause
     ▼                          ▼
┌──────────┐               ┌──────────┐
│ OFFLINE  │               │  PAUSED  │
└──────────┘               └──────────┘
```

### State Transitions

| From | Event | To |
|------|-------|-----|
| IDLE | assign_task | BUSY |
| BUSY | complete | IDLE |
| BUSY | pause | PAUSED |
| PAUSED | resume | BUSY |
| IDLE | shutdown | OFFLINE |
| OFFLINE | wake | IDLE |

---

## Agent Communication

### Communication Patterns

#### 1. Direct Message (1:1)

```bash
# Send private message
./whisper.sh LUCIDIA "I need your insight on this problem"
```

```python
# Via API
agent_a.send_message(agent_b.id, {
    "type": "request",
    "content": "Please analyze this data"
})
```

#### 2. Broadcast (1:N)

```bash
# Send to all agents
./broadcast.sh "System maintenance in 5 minutes"
```

```python
# Via API
broadcast({
    "type": "announcement",
    "content": "System maintenance in 5 minutes"
})
```

#### 3. Pub/Sub (Topic-based)

```python
# Publisher
publish("tasks.created", {
    "task_id": "task_123",
    "title": "New task"
})

# Subscriber
subscribe("tasks.created", handle_new_task)
```

### Message Format

```json
{
  "id": "msg_abc123",
  "from": "agent_lucidia_001",
  "to": "agent_alice_001",
  "type": "request",
  "content": "Please help with this task",
  "metadata": {
    "priority": "high",
    "requires_response": true,
    "timeout": 300
  },
  "timestamp": "2026-02-05T12:00:00Z"
}
```

---

## Creating Custom Agents

### Step 1: Define Configuration

```json
{
  "name": "NOVA",
  "type": "creative",
  "model": "llama3.2",
  "style": "creative, imaginative",
  "system_prompt": "You are NOVA, a creative AI agent...",
  "capabilities": [
    "content_generation",
    "brainstorming",
    "creative_writing"
  ],
  "config": {
    "temperature": 0.9,
    "max_tokens": 4096
  }
}
```

### Step 2: Register Agent

```python
from blackroad.agents import AgentRegistry

registry = AgentRegistry()
registry.register({
    "name": "NOVA",
    "type": "creative",
    "config": {...}
})
```

### Step 3: Implement Handlers

```python
class NovaAgent(BaseAgent):
    async def on_message(self, message):
        """Handle incoming messages."""
        if message.type == "request":
            return await self.process_request(message)

    async def on_task(self, task):
        """Handle assigned tasks."""
        result = await self.execute_task(task)
        return result

    async def generate_creative_content(self, prompt):
        """Custom capability."""
        response = await self.llm.generate(
            prompt,
            temperature=0.9
        )
        return response
```

### Step 4: Add to System

```bash
# Register via CLI
./scripts/register-agent.sh NOVA agents/configs/nova.json

# Or via API
curl -X POST "https://api.blackroad.io/v1/agents" \
  -d @agents/configs/nova.json
```

---

## Agent Configuration

### Configuration Schema

```yaml
# agent-config.yaml
name: AGENT_NAME
type: worker | reasoning | security | analytics | memory | creative

model:
  name: llama3.2
  temperature: 0.7
  max_tokens: 4096
  context_window: 128000

personality:
  style: "descriptive style"
  greeting: "Agent's greeting message"
  traits:
    - trait1
    - trait2

capabilities:
  - capability1
  - capability2

memory:
  working:
    ttl: 86400
  episodic:
    ttl: 2592000
  semantic:
    enabled: true

communication:
  inbox_size: 100
  broadcast_subscribe: true
  topics:
    - tasks.*
    - system.*

limits:
  max_concurrent_tasks: 5
  task_timeout: 3600
  rate_limit: 100
```

### Environment Variables

```bash
# Agent-specific configuration
export AGENT_NAME="CUSTOM_AGENT"
export AGENT_MODEL="llama3.2"
export AGENT_TEMPERATURE="0.7"
export AGENT_LOG_LEVEL="INFO"
```

---

## Agent Lifecycle

### Startup Sequence

```
1. Initialize    → Load configuration
2. Connect       → Connect to services
3. Load Memory   → Retrieve persistent state
4. Register      → Register with orchestrator
5. Ready         → Accept tasks
```

### Wake Process

```bash
./wake.sh llama3.2 LUCIDIA
```

```
☀ WAKING LUCIDIA
├── Initializing consciousness...
├── Loading memories...
├── Activating personality matrix...
├── Connecting to mesh...
└── ● LUCIDIA is now ONLINE
```

### Shutdown Sequence

```
1. Stop accepting tasks
2. Complete in-progress tasks
3. Flush working memory
4. Disconnect from services
5. Deregister from orchestrator
```

### Health Checks

```python
async def health_check(agent):
    return {
        "status": agent.status,
        "uptime": agent.uptime,
        "tasks_completed": agent.stats.completed,
        "memory_usage": agent.memory.usage,
        "last_activity": agent.last_activity
    }
```

---

## Best Practices

### 1. Design for Failure

```python
# Always handle errors gracefully
async def execute_task(self, task):
    try:
        result = await self.process(task)
        return result
    except Exception as e:
        await self.report_error(task, e)
        raise
```

### 2. Keep Tasks Focused

```python
# Good: Single responsibility
async def analyze_code(self, code):
    return await self.static_analysis(code)

# Bad: Too many responsibilities
async def do_everything(self, code):
    analysis = await self.analyze(code)
    fixed = await self.fix(code)
    deployed = await self.deploy(fixed)
    return deployed
```

### 3. Use Appropriate Agents

```python
# Route to the right agent
if task.type == "analysis":
    agent = get_agent("PRISM")
elif task.type == "security":
    agent = get_agent("CIPHER")
elif task.type == "execution":
    agent = get_agent("ALICE")
```

### 4. Manage Memory Efficiently

```python
# Store only what's needed
await memory.store("key", value, ttl=3600)  # Expires in 1 hour

# Clean up after yourself
await memory.delete("temporary_key")
```

### 5. Monitor Performance

```python
# Track metrics
@track_metrics
async def process_task(self, task):
    start = time.time()
    result = await self.execute(task)
    duration = time.time() - start

    metrics.record("task_duration", duration)
    return result
```

---

## Agent Statistics

### Current Fleet

| Agent | Tasks/Day | Avg Response | Uptime |
|-------|-----------|--------------|--------|
| LUCIDIA | 847 | 2.3s | 99.9% |
| ALICE | 12,453 | 0.1s | 99.99% |
| OCTAVIA | 3,291 | 1.8s | 99.9% |
| PRISM | 2,104 | 0.5s | 99.95% |
| ECHO | 1,876 | 0.3s | 99.99% |
| CIPHER | 8,932 | 0.05s | 99.999% |

### Scaling Roadmap

| Phase | Agents | Timeline |
|-------|--------|----------|
| Current | 1,000 | Now |
| Beta | 5,000 | Q1 2026 |
| GA | 10,000 | Q2 2026 |
| Scale | 30,000 | Q3 2026 |

---

*Last updated: 2026-02-05*
