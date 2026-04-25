## QLM (Quantum Language Model) - Complete Guide

> **The semantic layer for Operator-AI collaboration**

---

## Table of Contents

1. [What is QLM?](#what-is-qlm)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Data Models](#data-models)
5. [API Reference](#api-reference)
6. [Integration Guide](#integration-guide)
7. [Experiments & Validation](#experiments--validation)
8. [Visualization](#visualization)
9. [Operator's Guide](#operators-guide)
10. [Development & Extension](#development--extension)

---

## What is QLM?

**QLM (Quantum Language Model)** is a stateful semantic layer that tracks, analyzes, and explains the interaction between **Human Intelligence (HI)**, **AI Intelligence (AI)**, and emergent **Quantum Intelligence (QI)** in the BlackRoad Operating System.

### The Problem QLM Solves

Modern AI systems have a **context loss problem**:
- AI agents execute tasks but lose track of *why*
- Humans give intent but can't see *what happened*
- Systems evolve but no one knows *how we got here*
- Emergent behaviors appear with no explanation

QLM fixes this by creating a **complete causal graph** of:
- Operator intent
- Agent executions
- System events
- Feedback loops
- Emergent patterns

### The "Quantum" Metaphor

The "quantum" in QLM does NOT refer to quantum physics. Instead, it describes:

**Superposition of Roles**: An agent can be both executor AND coordinator simultaneously.

**Superposition of States**: A task can be in_progress AND blocked at the same time.

**Superposition of Perspectives**: The same event looks different from HI vs AI vs QI viewpoints.

**Quantum Intelligence (QI)**: Emergent behaviors that appear when HI + AI + deterministic systems interact in feedback loops. When 1 + 1 = 3.

---

## Core Concepts

### Intelligence Layers

QLM models three layers of intelligence:

#### 1. HI (Human Intelligence)

**Definition**: The Operator layer - human judgment, taste, ethics, goals, narrative.

**Primary Actor**: Alexa (Operator)

**Capabilities**:
- Define intent and constraints
- Approve or veto AI actions
- Ask questions and interpret results
- Provide judgment on ambiguous decisions

**Events**:
- `OPERATOR_INTENT`: Operator defines a goal
- `OPERATOR_APPROVAL`: Operator approves agent work
- `OPERATOR_VETO`: Operator rejects agent work
- `OPERATOR_QUERY`: Operator asks a question

#### 2. AI (Agent Intelligence)

**Definition**: LLM-powered agents, code generation, pattern completion, search, transformation.

**Primary Actors**: 200+ BlackRoad agents (coder, reviewer, researcher, etc.)

**Capabilities**:
- Execute tasks
- Generate code/docs/designs
- Search and retrieve information
- Coordinate with other agents

**Events**:
- `AGENT_EXECUTION`: Agent starts working
- `AGENT_COMPLETION`: Agent finishes task
- `AGENT_ERROR`: Agent encounters error
- `AGENT_HANDOFF`: Agent passes work to another agent

#### 3. QI (Quantum Intelligence)

**Definition**: Emergent system-level intelligence that appears when HI + AI + deterministic systems interact in feedback loops.

**Not a single actor**: QI is a property of the *entire system*.

**Emergence Patterns**:
- `agent_self_correction`: Agent fixes own errors without HI intervention
- `novel_solution`: Agent finds approach not in training data
- `emergent_collaboration`: Agents self-organize into new patterns
- `operator_feedback_loop`: HI → AI → HI creates refined understanding
- `system_adaptation`: Deterministic systems evolve in response to AI

**Events**:
- `QI_EMERGENCE`: Novel behavior detected
- `QI_FEEDBACK_LOOP`: HI+AI feedback detected
- `QI_PATTERN`: Recurring emergent pattern identified

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Operator (Alexa)                  │
│                  Human Intelligence (HI)            │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Intent, Approval, Veto
                       ↓
┌──────────────────────────────────────────────────────┐
│                   QLM Interface                      │
│   record_operator_intent(), ask(), get_summary()    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────┐
│                    QLM State                         │
│  • Intelligence Layers (HI, AI, QI)                 │
│  • Event History                                     │
│  • QI Emergence Detection                            │
│  • Metrics & Alignment                               │
└──────┬────────────────────────┬──────────────────────┘
       │                        │
       │                        │
       ↓                        ↓
┌──────────────────┐   ┌──────────────────────────────┐
│  Ingestion       │   │  Cognitive Layer Integration │
│  • Git           │   │  • IntentGraph               │
│  • CI/CD         │   │  • AgentCoordinator          │
│  • Agent Logs    │   │  • ContextEngine             │
└──────────────────┘   └──────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────┐
│              Reality (External Systems)              │
│  • Git commits • Test results • Deployments          │
│  • Agent executions • System events                  │
└──────────────────────────────────────────────────────┘
```

### Key Components

#### `qlm_lab/models.py`
Defines core data structures:
- `IntelligenceType`, `ActorType`, `ActorRole`
- `Actor`: Represents humans, agents, systems
- `QLMEvent`: Every action generates an event
- `QIEmergence`: Detected emergent patterns
- `QLMMetrics`: System-level metrics

#### `qlm_lab/state.py`
Manages QLM state:
- `QLMState`: Complete state snapshot
- `ingest_event()`: Process new events and update state
- `query()`: Answer questions about state
- `detect_qi_emergence()`: Pattern matching for QI
- `calculate_alignment()`: HI-AI alignment scoring

#### `qlm_lab/api.py`
Public interface:
- `QLMInterface`: Main API class
- `record_*()`: Methods to record events
- `get_*()`: Query methods
- `ask()`: Natural language queries

#### `qlm_lab/ingestion/`
Connects QLM to reality:
- `GitConnector`: Ingest git commits
- `CIConnector`: Ingest test/build/deploy results
- `AgentLogConnector`: Parse agent logs

#### `qlm_lab/experiments/`
Validation experiments:
- `AlignmentDetectionExperiment`: Test alignment scoring
- `EmergenceDetectionExperiment`: Test QI detection

#### `qlm_lab/visualization.py`
Visualization tools:
- Event timeline
- Actor interaction graph
- Alignment trends
- Emergence patterns

---

## Data Models

### Actor

```python
@dataclass
class Actor:
    id: str                    # Unique identifier
    name: str                  # Human-readable name
    actor_type: ActorType      # HUMAN | AGENT | SYSTEM
    role: ActorRole            # OPERATOR | EXECUTOR | COORDINATOR | REVIEWER | ...
    state: ActorState          # ACTIVE | IDLE | BLOCKED | OFFLINE
    capabilities: Set[str]     # What this actor can do
    current_task_id: Optional[str]
    created_at: datetime
    last_active: datetime
```

### QLMEvent

```python
@dataclass
class QLMEvent:
    id: str                           # Unique event ID
    timestamp: datetime               # When event occurred
    source_layer: IntelligenceType    # HI | AI | QI
    actor_id: str                     # Who generated this event
    event_type: EventType             # OPERATOR_INTENT | AGENT_EXECUTION | ...
    data: Dict[str, Any]              # Event payload
    caused_by: List[str]              # Causal event IDs
    intent_node_id: Optional[str]     # Link to IntentGraph
    task_id: Optional[str]            # Related task
    tags: Set[str]
    metadata: Dict[str, Any]
```

### QIEmergence

```python
@dataclass
class QIEmergence:
    id: str                           # Unique emergence ID
    timestamp: datetime               # When detected
    pattern_name: str                 # e.g., "agent_self_correction"
    trigger_events: List[str]         # Events that triggered this
    confidence: float                 # 0.0 to 1.0
    explanation: str                  # Human-readable description
    operator_validated: Optional[bool] # Did Operator confirm?
    operator_notes: str
    impact_score: float               # Significance (0.0 to 1.0)
```

### QLMMetrics

```python
@dataclass
class QLMMetrics:
    hi_events: int                    # Count of HI events
    ai_events: int                    # Count of AI events
    qi_events: int                    # Count of QI events
    system_events: int                # Count of system events

    hi_ai_alignment: float            # Alignment score (0.0 to 1.0)
    qi_emergence_rate: float          # Rate of QI detection
    feedback_loop_count: int          # HI→AI→HI cycles

    operator_approvals: int
    operator_vetoes: int
    operator_queries: int

    start_time: datetime
    end_time: datetime
```

---

## API Reference

### Initialization

```python
from qlm_lab.api import QLMInterface

# Basic initialization
qlm = QLMInterface()

# With cognitive layer integration
from cognitive.intent_graph import IntentGraph
from cognitive.agent_coordination import AgentCoordinator

intent_graph = IntentGraph()
agent_coordinator = AgentCoordinator(intent_graph)

qlm = QLMInterface(
    intent_graph=intent_graph,
    agent_coordinator=agent_coordinator
)
```

### Recording Events

#### Operator Events (HI)

```python
# Record Operator intent
event = qlm.record_operator_intent(
    intent="Deploy authentication feature",
    description="Implement login, signup, password reset",
    intent_node_id="intent-auth-001"  # Link to IntentGraph
)

# Record Operator approval
qlm.record_operator_approval(
    what_approved="Login implementation",
    intent_node_id="intent-auth-001",
    task_id="task-login-001"
)

# Record Operator veto
qlm.record_operator_veto(
    what_vetoed="Password reset implementation",
    reason="Security concerns - needs stronger validation",
    intent_node_id="intent-auth-001",
    task_id="task-reset-001"
)

# Record Operator query
qlm.record_operator_query("What did agents do today?")
```

#### Agent Events (AI)

```python
# Register an agent
agent = qlm.register_agent(
    agent_id="coder-001",
    name="CodeWriter",
    role=ActorRole.CODER,
    capabilities=["python", "javascript", "testing"]
)

# Record agent execution
qlm.record_agent_execution(
    agent_id="coder-001",
    task_description="Implement login endpoint",
    task_id="task-login-001",
    intent_node_id="intent-auth-001"
)

# Record agent completion
qlm.record_agent_completion(
    agent_id="coder-001",
    task_id="task-login-001",
    success=True,
    result={"files_modified": ["auth.py"], "tests_added": 5}
)

# Record agent error
qlm.record_agent_error(
    agent_id="coder-001",
    task_id="task-login-001",
    error="Database connection failed"
)

# Record agent handoff
qlm.record_agent_handoff(
    from_agent_id="coder-001",
    to_agent_id="reviewer-001",
    task_id="task-login-001",
    handoff_message="Ready for review"
)
```

#### System Events

```python
# Record test result
qlm.record_system_event(
    event_type=EventType.SYSTEM_TEST,
    description="Backend tests passed",
    task_id="task-login-001",
    metadata={
        "passed": True,
        "test_count": 42,
        "duration_seconds": 12.3
    }
)

# Record build result
qlm.record_system_event(
    event_type=EventType.SYSTEM_BUILD,
    description="Production build successful",
    metadata={"build_id": "build-123", "artifacts": ["app.tar.gz"]}
)

# Record deployment
qlm.record_system_event(
    event_type=EventType.SYSTEM_DEPLOY,
    description="Deployed to production",
    metadata={"environment": "production", "version": "v1.2.0"}
)
```

### Querying State

```python
# Get Operator summary
summary = qlm.get_summary(days=7)
print(summary)

# Get alignment score
alignment = qlm.get_alignment_score()
print(f"HI-AI Alignment: {alignment:.1%}")

# Get recent QI emergences
emergences = qlm.get_recent_emergences(limit=10)
for em in emergences:
    print(f"{em.pattern_name}: {em.explanation}")

# Get active actors
active = qlm.get_active_actors()
for actor in active:
    print(f"{actor.name} - {actor.role.value}")

# Get events by type
intents = qlm.get_events_by_type(EventType.OPERATOR_INTENT)
print(f"Total intents: {len(intents)}")

# Get events in time range
from datetime import datetime, timedelta
yesterday = datetime.now() - timedelta(days=1)
recent_events = qlm.get_events_in_timerange(yesterday)
```

### Natural Language Queries

```python
# Ask questions in natural language
response = qlm.ask("What did agents do today?")
print(response)

response = qlm.ask("Are we aligned with my intent?")
print(response)

response = qlm.ask("Show me emergent behaviors")
print(response)

response = qlm.ask("What's the status?")
print(response)
```

### Export/Import State

```python
# Export state to JSON
qlm.export_state("/path/to/qlm_state.json")

# Import state from JSON
qlm.import_state("/path/to/qlm_state.json")
```

---

## Integration Guide

### Integrating with Existing Cognitive Layer

QLM is designed to integrate seamlessly with the existing cognitive infrastructure:

```python
from cognitive.intent_graph import IntentGraph
from cognitive.agent_coordination import AgentCoordinator
from qlm_lab.api import QLMInterface

# Initialize cognitive systems
intent_graph = IntentGraph()
agent_coordinator = AgentCoordinator(intent_graph)

# Initialize QLM with cognitive integration
qlm = QLMInterface(
    intent_graph=intent_graph,
    agent_coordinator=agent_coordinator
)

# Now when you create goals in IntentGraph...
goal = intent_graph.create_goal(
    title="Build authentication",
    rationale="Need secure user login"
)

# ...also record in QLM
qlm.record_operator_intent(
    intent="Build authentication",
    intent_node_id=goal.id
)

# When agents coordinate...
task = intent_graph.create_task(
    title="Implement login",
    parent_id=goal.id
)

agent_coordinator.assign_task(task.id, agent_id="coder-001")

# ...also record in QLM
qlm.record_agent_execution(
    agent_id="coder-001",
    task_description="Implement login",
    task_id=task.id,
    intent_node_id=goal.id
)
```

### Ingesting Real System Data

#### Git Commits

```python
from qlm_lab.ingestion.git import GitConnector

connector = GitConnector(repo_path="/path/to/repo", qlm=qlm)

# Ingest last 7 days of commits
events = connector.ingest_recent_commits(days=7)
print(f"Ingested {len(events)} commits")

# Ingest specific range
events = connector.ingest_commit_range(
    since="2024-01-01",
    until="2024-01-31"
)
```

#### CI/CD Results

```python
from qlm_lab.ingestion.ci import CIConnector

connector = CIConnector(qlm=qlm)

# Ingest test result
connector.ingest_test_result(
    test_name="Backend Tests",
    passed=True,
    duration_seconds=12.3,
    commit_hash="abc123"
)

# Ingest build result
connector.ingest_build_result(
    build_name="Production Build",
    success=True,
    duration_seconds=45.2,
    artifacts=["app.tar.gz", "app.zip"]
)

# Ingest deployment
connector.ingest_deploy_result(
    service_name="blackroad-api",
    environment="production",
    success=True,
    version="v1.2.0"
)
```

#### Agent Logs

```python
from qlm_lab.ingestion.agent_logs import AgentLogConnector

connector = AgentLogConnector(qlm=qlm)

# Ingest log file
events = connector.ingest_log_file("/path/to/agent.log")
print(f"Ingested {len(events)} events from logs")

# Ingest structured logs
log_entries = [
    {
        "timestamp": "2024-01-15T10:30:00",
        "agent_id": "coder-001",
        "level": "INFO",
        "message": "Task started: implement login"
    },
    # ...
]
events = connector.ingest_structured_log(log_entries)
```

---

## Experiments & Validation

QLM includes built-in experiments to validate its effectiveness:

### Alignment Detection Experiment

**Hypothesis**: QLM can accurately detect when AI agents drift from Operator intent.

```bash
python -m qlm_lab.experiments.alignment_detection
```

**Scenarios**:
- Perfect alignment (100% approval)
- Partial alignment (some vetoes)
- No alignment (all vetoes)

**Success Criteria**: Alignment score accuracy within 20%

### Emergence Detection Experiment

**Hypothesis**: QLM can detect emergent QI behaviors.

```bash
python -m qlm_lab.experiments.emergence_detection
```

**Patterns Tested**:
- Agent self-correction
- Operator feedback loop
- Emergent collaboration
- Normal execution (should NOT trigger)

**Success Criteria**:
- True positive rate ≥ 80%
- False positive rate < 20%

---

## Visualization

QLM includes powerful visualization tools:

```python
from qlm_lab.visualization import QLMVisualizer

viz = QLMVisualizer(qlm)

# Event timeline
viz.plot_event_timeline(save_path="timeline.png")

# Actor interaction graph
viz.plot_actor_graph(save_path="actors.png")

# Alignment over time
viz.plot_alignment_over_time(save_path="alignment.png")

# Emergence patterns
viz.plot_emergence_patterns(save_path="emergence.png")

# Export complete dashboard
viz.export_dashboard(output_dir="./qlm_dashboard")
```

**Requirements**:
```bash
pip install matplotlib networkx
```

---

## Operator's Guide

### Daily Usage

As the Operator (Alexa), here's how to use QLM:

#### Morning Check-In

```python
# What happened overnight?
summary = qlm.get_summary(days=1)
print(summary)

# Are agents aligned with my goals?
alignment = qlm.get_alignment_score()
if alignment < 0.7:
    print("⚠️ Warning: Low alignment detected")

# Any emergent behaviors?
emergences = qlm.get_recent_emergences()
for em in emergences:
    print(f"✨ {em.pattern_name}: {em.explanation}")
```

#### Defining Intent

```python
# When starting a new project
qlm.record_operator_intent(
    intent="Build payment integration",
    description="Integrate Stripe for subscriptions and one-time payments",
    intent_node_id="intent-payment-2024-01"
)
```

#### Reviewing Agent Work

```python
# When agents complete work
qlm.record_operator_approval(
    what_approved="Stripe integration implementation",
    intent_node_id="intent-payment-2024-01",
    task_id="task-stripe-001"
)

# When work doesn't match intent
qlm.record_operator_veto(
    what_vetoed="Payment form UI",
    reason="Doesn't match brand guidelines - needs redesign",
    intent_node_id="intent-payment-2024-01",
    task_id="task-ui-001"
)
```

#### Asking Questions

```python
# Natural language queries
qlm.ask("What did agents do today?")
qlm.ask("Are we aligned with my intent?")
qlm.ask("Show me emergent behaviors")
qlm.ask("What's the status?")
```

### Understanding Alignment

**Alignment Score**: 0.0 to 1.0

- **0.9-1.0**: Excellent - agents are executing your intent well
- **0.7-0.9**: Good - minor drift, watch for patterns
- **0.5-0.7**: Warning - significant misalignment, review vetoes
- **< 0.5**: Critical - agents not following intent, intervention needed

**Improving Alignment**:
1. Be more specific in intent descriptions
2. Provide examples of what "good" looks like
3. Give immediate feedback (approve/veto)
4. Review patterns in vetoes - is there confusion?

### Understanding QI Emergence

**Common Patterns**:

- **agent_self_correction**: Agent fixed its own error without your help
  - *Good sign*: Agents are learning and adapting

- **novel_solution**: Agent found an approach you didn't suggest
  - *Good sign*: Creative problem-solving
  - *Watch for*: Ensure solution aligns with intent

- **operator_feedback_loop**: You → agent → feedback → refined approach
  - *Good sign*: Healthy iteration cycle
  - *Measure*: Count of loops indicates collaboration quality

- **emergent_collaboration**: Agents self-organized
  - *Good sign*: Agents coordinating without explicit instructions
  - *Watch for*: Ensure coordination serves your intent

---

## Development & Extension

### Adding New Event Types

```python
# In qlm_lab/models.py
class EventType(Enum):
    # ... existing types ...
    CUSTOM_EVENT = "custom_event"

# In qlm_lab/api.py
def record_custom_event(self, ...):
    event = QLMEvent(
        source_layer=IntelligenceType.AI,
        event_type=EventType.CUSTOM_EVENT,
        ...
    )
    self.state.ingest_event(event)
    return event
```

### Adding New QI Patterns

```python
# In qlm_lab/models.py
QI_PATTERNS["my_pattern"] = {
    "description": "Description of when this pattern occurs",
    "trigger": "sequence of events that trigger this",
    "significance": "high",  # high | medium | low | very_high
}

# In qlm_lab/state.py
def _matches_pattern(self, events, pattern_name, pattern_def):
    if pattern_name == "my_pattern":
        # Implement pattern detection logic
        # Return True if pattern matches
        pass
```

### Adding New Connectors

```python
# Create qlm_lab/ingestion/my_connector.py
from qlm_lab.api import QLMInterface
from qlm_lab.models import EventType

class MyConnector:
    def __init__(self, qlm: QLMInterface):
        self.qlm = qlm

    def ingest_my_data(self, data):
        # Transform data into QLM events
        event = self.qlm.record_system_event(
            event_type=EventType.SYSTEM_CUSTOM,
            description=...,
            metadata=...
        )
        return event
```

### Running Tests

```bash
# Run QLM tests
pytest tests/test_qlm_core.py -v

# Run all tests
pytest tests/ -v

# With coverage
pytest tests/test_qlm_core.py --cov=qlm_lab --cov-report=html
```

### Running Demo

```bash
# Interactive demo
python -m qlm_lab.demo

# Run specific experiment
python -m qlm_lab.experiments.alignment_detection
python -m qlm_lab.experiments.emergence_detection
```

---

## Next Steps

### Phase 1: Lab (Current)

- ✅ Core QLM models and state management
- ✅ Basic event ingestion (git, CI, agents)
- ✅ Alignment and emergence detection
- ✅ Visualization and experiments
- ✅ Documentation

### Phase 2: Integration (Next 1-2 months)

- [ ] Full cognitive layer integration
- [ ] Real-time event streaming
- [ ] FastAPI router for QLM API
- [ ] Prism Console UI integration
- [ ] Dashboard for Operator

### Phase 3: Production (Months 3-4)

- [ ] Database persistence (PostgreSQL)
- [ ] Advanced QI pattern detection (ML-based)
- [ ] Multi-Operator support
- [ ] Audit trail and compliance
- [ ] Performance optimization

### Phase 4: Lucidia Language (Months 5-6)

- [ ] Lucidia syntax for expressing intent
- [ ] Lucidia → QLM compiler
- [ ] QLM → Lucidia decompiler (explain mode)
- [ ] Lucidia REPL for live QLM queries

---

## FAQ

**Q: What's the difference between QLM and the IntentGraph?**

A: IntentGraph tracks *what* (goals, tasks, artifacts). QLM tracks *why*, *how*, and *emergence* (intent, execution, QI patterns). They complement each other.

**Q: Do I need to use QLM for every agent?**

A: No, start small. Use QLM for critical workflows where you need clear intent tracking and alignment verification.

**Q: How does QLM relate to Lucidia?**

A: Lucidia is the *language* for expressing intent and constraints. QLM is the *runtime* that tracks and enforces them.

**Q: What if I don't want to record every event?**

A: QLM is opt-in. Only record events you care about. Start with Operator intents and agent completions.

**Q: Can QLM work with multiple Operators?**

A: Currently optimized for single Operator (Alexa). Multi-Operator support planned for Phase 3.

**Q: How do I debug QLM?**

A: Use `qlm.state.export_json()` to inspect state, visualizations to see patterns, and experiments to validate behavior.

---

## Conclusion

QLM provides the missing semantic layer for Operator-AI collaboration. By tracking HI, AI, and QI as first-class concepts, QLM makes AI systems **understandable**, **controllable**, and **improvable**.

**Start using QLM today**:

```python
from qlm_lab.api import QLMInterface

qlm = QLMInterface()

# Your intent
qlm.record_operator_intent("Build the future")

# Agent execution
qlm.record_agent_execution("agent-1", "Create something amazing", "task-1")

# Check alignment
print(f"Alignment: {qlm.get_alignment_score():.1%}")

# Ask questions
print(qlm.ask("What's the status?"))
```

**Happy building! 🛣️✨**

---

*QLM is part of the BlackRoad Operating System. See BLACKROAD_OS_BIG_KAHUNA_VISION.md for the complete vision.*
