"""
QLM Core Models - Data structures for Quantum Language Model

These models formalize the HI/AI/QI intelligence framework:

- HI (Human Intelligence): Operator actions, intent, judgment, taste, ethics
- AI (Model Intelligence): LLMs, agents, code generation, pattern completion
- QI (Quantum Intelligence): Emergent system behaviors when HI+AI interact in loops

The "quantum" metaphor means:
- Superposition of roles (an agent can be executor AND coordinator)
- Superposition of states (a task can be in_progress AND blocked)
- Superposition of perspectives (same event viewed differently by HI vs AI)

QI emerges when:
1. AI designs deterministic systems
2. Deterministic systems constrain AI behavior
3. Humans orchestrate and interpret the cycle
4. Novel, unpredicted behaviors appear

This is NOT quantum physics. It's a meta-model for describing
intelligence that emerges from feedback loops between humans, AI, and code.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Set, Any
from uuid import uuid4


class IntelligenceType(Enum):
    """
    The three layers of intelligence in the QLM model.

    HI = Human Intelligence (Operator)
    AI = Model Intelligence (LLMs, agents)
    QI = Quantum Intelligence (emergent system behaviors)
    """
    HI = "human_intelligence"  # Operator layer: intent, judgment, taste
    AI = "model_intelligence"  # Agent layer: execution, completion, transformation
    QI = "quantum_intelligence"  # System layer: emergence, feedback loops, novelty


class ActorType(Enum):
    """Types of actors in the system"""
    HUMAN = "human"  # The Operator (Alexa) or other humans
    AGENT = "agent"  # AI agents (LLM-powered)
    SYSTEM = "system"  # Deterministic systems (git, CI, infrastructure)


class ActorRole(Enum):
    """Roles actors can play"""
    OPERATOR = "operator"  # Human orchestrator (primary decision maker)
    EXECUTOR = "executor"  # Performs tasks
    COORDINATOR = "coordinator"  # Manages other actors
    REVIEWER = "reviewer"  # Reviews work
    MONITOR = "monitor"  # Observes and reports
    GOVERNOR = "governor"  # Enforces policies


class ActorState(Enum):
    """Current state of an actor"""
    ACTIVE = "active"  # Currently working
    IDLE = "idle"  # Available but not working
    BLOCKED = "blocked"  # Wants to work but can't
    OFFLINE = "offline"  # Not available


@dataclass
class Actor:
    """
    An actor in the QLM system.

    Actors perform actions that generate QLMEvents.
    Actors can be humans (Operator), AI agents, or deterministic systems.
    """
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    actor_type: ActorType = ActorType.AGENT
    role: ActorRole = ActorRole.EXECUTOR
    state: ActorState = ActorState.IDLE

    # What this actor can do
    capabilities: Set[str] = field(default_factory=set)

    # Current activity
    current_task_id: Optional[str] = None

    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_active: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "actor_type": self.actor_type.value,
            "role": self.role.value,
            "state": self.state.value,
            "capabilities": list(self.capabilities),
            "current_task_id": self.current_task_id,
            "created_at": self.created_at.isoformat(),
            "last_active": self.last_active.isoformat(),
            "metadata": self.metadata,
        }


@dataclass
class IntelligenceLayer:
    """
    One of the three intelligence layers (HI, AI, or QI).

    Each layer has:
    - Actors who perform actions
    - Capabilities they can execute
    - Metrics about their activity
    """
    type: IntelligenceType
    actors: Dict[str, Actor] = field(default_factory=dict)

    # Layer-level capabilities
    capabilities: Set[str] = field(default_factory=set)

    # Metrics
    total_events: int = 0
    active_actors: int = 0

    def add_actor(self, actor: Actor) -> None:
        """Add an actor to this intelligence layer"""
        self.actors[actor.id] = actor
        self.capabilities.update(actor.capabilities)
        if actor.state == ActorState.ACTIVE:
            self.active_actors += 1

    def get_active_actors(self) -> List[Actor]:
        """Get all currently active actors"""
        return [a for a in self.actors.values() if a.state == ActorState.ACTIVE]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type.value,
            "actors": {aid: a.to_dict() for aid, a in self.actors.items()},
            "capabilities": list(self.capabilities),
            "total_events": self.total_events,
            "active_actors": self.active_actors,
        }


class EventType(Enum):
    """
    Types of events in the QLM system.

    Events flow through the system and trigger state transitions.
    """
    # HI (Operator) events
    OPERATOR_INTENT = "operator_intent"  # Operator defines a goal
    OPERATOR_APPROVAL = "operator_approval"  # Operator approves something
    OPERATOR_VETO = "operator_veto"  # Operator rejects something
    OPERATOR_QUERY = "operator_query"  # Operator asks a question

    # AI (Agent) events
    AGENT_EXECUTION = "agent_execution"  # Agent performs a task
    AGENT_COMPLETION = "agent_completion"  # Agent finishes a task
    AGENT_ERROR = "agent_error"  # Agent encounters an error
    AGENT_HANDOFF = "agent_handoff"  # Agent hands off to another agent

    # System events
    SYSTEM_DEPLOY = "system_deploy"  # Code deployed
    SYSTEM_TEST = "system_test"  # Tests run
    SYSTEM_BUILD = "system_build"  # Build completed
    SYSTEM_ERROR = "system_error"  # System error occurred

    # QI (Emergent) events
    QI_EMERGENCE = "qi_emergence"  # Novel behavior detected
    QI_FEEDBACK_LOOP = "qi_feedback_loop"  # HI+AI feedback detected
    QI_PATTERN = "qi_pattern"  # Recurring pattern identified


@dataclass
class QLMEvent:
    """
    An event in the QLM system.

    Events are the fundamental unit of QLM state transitions.
    Every action by every actor generates an event.

    Events have causality: they can be caused by other events,
    creating a causal graph of system behavior.
    """
    id: str = field(default_factory=lambda: str(uuid4()))
    timestamp: datetime = field(default_factory=datetime.now)

    # What layer generated this event
    source_layer: IntelligenceType = IntelligenceType.AI

    # What actor generated this event
    actor_id: str = ""

    # What type of event
    event_type: EventType = EventType.AGENT_EXECUTION

    # Event payload
    data: Dict[str, Any] = field(default_factory=dict)

    # Causality: what events caused this event
    caused_by: List[str] = field(default_factory=list)  # List of event IDs

    # Related entities
    intent_node_id: Optional[str] = None  # Link to IntentGraph node
    task_id: Optional[str] = None

    # Metadata
    tags: Set[str] = field(default_factory=set)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "source_layer": self.source_layer.value,
            "actor_id": self.actor_id,
            "event_type": self.event_type.value,
            "data": self.data,
            "caused_by": self.caused_by,
            "intent_node_id": self.intent_node_id,
            "task_id": self.task_id,
            "tags": list(self.tags),
            "metadata": self.metadata,
        }


@dataclass
class QIEmergence:
    """
    Represents a detected QI (Quantum Intelligence) emergence event.

    QI emerges when:
    - HI + AI create a feedback loop
    - The system exhibits novel, unpredicted behavior
    - Deterministic systems evolve in response to AI
    - Agents self-organize in unexpected ways

    This is the "quantum" moment: when 1 + 1 = 3.
    """
    id: str = field(default_factory=lambda: str(uuid4()))
    timestamp: datetime = field(default_factory=datetime.now)

    # What pattern emerged
    pattern_name: str = ""  # e.g., "agent_self_correction", "novel_solution"

    # What triggered this emergence
    trigger_events: List[str] = field(default_factory=list)  # Event IDs

    # Confidence that this is truly emergent (0.0 to 1.0)
    confidence: float = 0.0

    # Human-readable explanation
    explanation: str = ""

    # Operator feedback
    operator_validated: Optional[bool] = None  # Did Operator confirm this?
    operator_notes: str = ""

    # Impact
    impact_score: float = 0.0  # How significant was this emergence?

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "pattern_name": self.pattern_name,
            "trigger_events": self.trigger_events,
            "confidence": self.confidence,
            "explanation": self.explanation,
            "operator_validated": self.operator_validated,
            "operator_notes": self.operator_notes,
            "impact_score": self.impact_score,
        }


@dataclass
class QLMMetrics:
    """
    System-level metrics for QLM state.

    These metrics help the Operator understand:
    - How much activity in each intelligence layer
    - How aligned is AI with HI intent
    - How much QI emergence is happening
    - Overall system health
    """
    # Event counts by layer
    hi_events: int = 0
    ai_events: int = 0
    qi_events: int = 0
    system_events: int = 0

    # Actor counts by layer
    hi_actors: int = 0
    ai_actors: int = 0
    system_actors: int = 0

    # Alignment: how much AI follows HI intent (0.0 to 1.0)
    hi_ai_alignment: float = 0.0

    # Emergence: rate of QI events detected
    qi_emergence_rate: float = 0.0

    # Feedback loops: number of HI→AI→HI cycles
    feedback_loop_count: int = 0

    # Operator metrics
    operator_approvals: int = 0
    operator_vetoes: int = 0
    operator_queries: int = 0

    # Time range for these metrics
    start_time: datetime = field(default_factory=datetime.now)
    end_time: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hi_events": self.hi_events,
            "ai_events": self.ai_events,
            "qi_events": self.qi_events,
            "system_events": self.system_events,
            "hi_actors": self.hi_actors,
            "ai_actors": self.ai_actors,
            "system_actors": self.system_actors,
            "hi_ai_alignment": self.hi_ai_alignment,
            "qi_emergence_rate": self.qi_emergence_rate,
            "feedback_loop_count": self.feedback_loop_count,
            "operator_approvals": self.operator_approvals,
            "operator_vetoes": self.operator_vetoes,
            "operator_queries": self.operator_queries,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
        }


# Known QI emergence patterns
QI_PATTERNS = {
    "agent_self_correction": {
        "description": "Agent detected its own error and corrected without HI intervention",
        "trigger": "AGENT_ERROR followed by AGENT_EXECUTION with same task_id",
        "significance": "high",
    },
    "novel_solution": {
        "description": "Agent found a solution not in training data or prompts",
        "trigger": "AGENT_COMPLETION with novel approach indicator",
        "significance": "very_high",
    },
    "emergent_collaboration": {
        "description": "Agents self-organized into collaboration pattern",
        "trigger": "Multiple AGENT_HANDOFF events forming new pattern",
        "significance": "high",
    },
    "operator_feedback_loop": {
        "description": "HI intent → AI execution → HI approval → refined intent",
        "trigger": "OPERATOR_INTENT → AGENT_COMPLETION → OPERATOR_APPROVAL → OPERATOR_INTENT",
        "significance": "medium",
    },
    "system_adaptation": {
        "description": "Deterministic system evolved in response to AI behavior",
        "trigger": "AGENT_EXECUTION → SYSTEM_ERROR → AGENT_EXECUTION (different approach)",
        "significance": "high",
    },
}
