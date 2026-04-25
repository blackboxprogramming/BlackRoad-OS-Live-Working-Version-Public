"""
QLM Lab - Quantum Language Model Implementation

This module implements the QLM (Quantum Language Model) system for BlackRoad OS.

QLM is a stateful semantic layer that:
- Tracks HI (Human Intelligence), AI (Agent Intelligence), and QI (Quantum/Emergent Intelligence)
- Connects Operator intent to system execution
- Detects emergent behaviors in HI+AI feedback loops
- Provides introspection and control tools for the Operator

Key Components:
- models: Core data structures (IntelligenceLayer, Actor, QLMEvent, QIEmergence)
- state: QLM state management and transitions
- events: Event ingestion and processing
- api: Public API for QLM operations
- ingestion: Connectors to real system data (git, CI, agents)
- experiments: Validation experiments and metrics
- visualization: Tools for visualizing QLM state

Integration Points:
- cognitive.intent_graph: Foundation for intent tracking
- cognitive.agent_coordination: Multi-agent collaboration
- operator_engine.scheduler: Background QLM analysis
- agents: Event source for AI actions

Usage:
    from qlm_lab import QLMState, QLMEvent
    from qlm_lab.api import QLMInterface

    # Initialize QLM
    qlm = QLMInterface()

    # Record Operator intent
    qlm.record_operator_intent("Deploy authentication feature")

    # Record agent execution
    qlm.record_agent_execution(agent_id="coder-001", task="implement login")

    # Query state
    state = qlm.get_current_state()
    summary = qlm.summarize_for_operator(days=7)
"""

__version__ = "0.1.0"

from qlm_lab.models import (
    IntelligenceType,
    ActorType,
    ActorRole,
    IntelligenceLayer,
    Actor,
    QLMEvent,
    EventType,
    QIEmergence,
    QLMMetrics,
)

from qlm_lab.state import QLMState, StateTransition

from qlm_lab.api import QLMInterface

__all__ = [
    "IntelligenceType",
    "ActorType",
    "ActorRole",
    "IntelligenceLayer",
    "Actor",
    "QLMEvent",
    "EventType",
    "QIEmergence",
    "QLMMetrics",
    "QLMState",
    "StateTransition",
    "QLMInterface",
]
