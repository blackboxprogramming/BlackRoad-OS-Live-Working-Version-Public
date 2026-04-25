"""
QLM State Management - The core state machine

QLMState represents the complete state of the Quantum Intelligence system at a point in time.

State includes:
- All intelligence layers (HI, AI, QI)
- All actors and their current state
- Event history
- Detected QI emergences
- Metrics

State transitions happen when events are processed.
Each event can trigger:
- Actor state changes
- New QI emergence detection
- Metric updates
- Causal graph updates
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

from qlm_lab.models import (
    IntelligenceType,
    IntelligenceLayer,
    Actor,
    ActorType,
    ActorRole,
    ActorState,
    QLMEvent,
    EventType,
    QIEmergence,
    QLMMetrics,
    QI_PATTERNS,
)


@dataclass
class StateTransition:
    """
    Represents a state transition caused by an event.

    This allows introspection: "What changed when event X happened?"
    """
    event_id: str
    timestamp: datetime
    before_snapshot: Dict[str, Any]
    after_snapshot: Dict[str, Any]
    changes: List[str]  # Human-readable list of changes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat(),
            "before_snapshot": self.before_snapshot,
            "after_snapshot": self.after_snapshot,
            "changes": self.changes,
        }


class QLMState:
    """
    The complete state of the Quantum Intelligence system.

    This is the "brain" of QLM. It tracks everything:
    - All intelligence layers
    - All actors
    - All events
    - All emergences
    - All metrics

    Key methods:
    - ingest_event(): Process a new event and update state
    - query(): Answer questions about current state
    - explain_transition(): Explain why state changed
    - detect_qi_emergence(): Find emergent patterns
    - calculate_metrics(): Compute system metrics
    """

    def __init__(self, intent_graph=None, agent_coordinator=None):
        """
        Initialize QLM state.

        Can integrate with existing cognitive systems:
        - intent_graph: From cognitive.intent_graph
        - agent_coordinator: From cognitive.agent_coordination
        """
        # Integration with existing cognitive layer
        self.intent_graph = intent_graph
        self.agent_coordinator = agent_coordinator

        # Intelligence layers
        self.layers: Dict[IntelligenceType, IntelligenceLayer] = {
            IntelligenceType.HI: IntelligenceLayer(type=IntelligenceType.HI),
            IntelligenceType.AI: IntelligenceLayer(type=IntelligenceType.AI),
            IntelligenceType.QI: IntelligenceLayer(type=IntelligenceType.QI),
        }

        # Event history (ordered by timestamp)
        self.events: List[QLMEvent] = []

        # Detected QI emergences
        self.emergences: List[QIEmergence] = []

        # State transition history
        self.transitions: List[StateTransition] = []

        # Metrics
        self.metrics = QLMMetrics()

        # Timestamps
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def register_actor(self, actor: Actor) -> None:
        """
        Register an actor in the appropriate intelligence layer.

        Human → HI layer
        Agent → AI layer
        System → (tracked but not in a specific layer)
        """
        if actor.actor_type == ActorType.HUMAN:
            self.layers[IntelligenceType.HI].add_actor(actor)
            self.metrics.hi_actors += 1
        elif actor.actor_type == ActorType.AGENT:
            self.layers[IntelligenceType.AI].add_actor(actor)
            self.metrics.ai_actors += 1
        elif actor.actor_type == ActorType.SYSTEM:
            # System actors are tracked but don't belong to HI/AI/QI layers
            self.metrics.system_actors += 1

    def ingest_event(self, event: QLMEvent) -> None:
        """
        Ingest a new event and update state.

        This is the core state transition function.

        Steps:
        1. Capture before-state snapshot
        2. Add event to history
        3. Update actor states
        4. Detect QI emergence
        5. Update metrics
        6. Capture after-state snapshot
        7. Record transition
        """
        # 1. Before snapshot
        before = self._create_snapshot()

        # 2. Add event
        self.events.append(event)

        # 3. Update actor states
        self._update_actor_state(event)

        # 4. Update layer metrics
        if event.source_layer == IntelligenceType.HI:
            self.layers[IntelligenceType.HI].total_events += 1
            self.metrics.hi_events += 1
        elif event.source_layer == IntelligenceType.AI:
            self.layers[IntelligenceType.AI].total_events += 1
            self.metrics.ai_events += 1
        elif event.source_layer == IntelligenceType.QI:
            self.layers[IntelligenceType.QI].total_events += 1
            self.metrics.qi_events += 1

        # 5. Detect QI emergence
        emergence = self._detect_qi_emergence(event)
        if emergence:
            self.emergences.append(emergence)
            self.metrics.qi_events += 1

        # 6. Update operator metrics
        if event.event_type == EventType.OPERATOR_APPROVAL:
            self.metrics.operator_approvals += 1
        elif event.event_type == EventType.OPERATOR_VETO:
            self.metrics.operator_vetoes += 1
        elif event.event_type == EventType.OPERATOR_QUERY:
            self.metrics.operator_queries += 1

        # 7. After snapshot
        after = self._create_snapshot()

        # 8. Record transition
        changes = self._compute_changes(before, after)
        transition = StateTransition(
            event_id=event.id,
            timestamp=event.timestamp,
            before_snapshot=before,
            after_snapshot=after,
            changes=changes,
        )
        self.transitions.append(transition)

        self.updated_at = datetime.now()

    def _update_actor_state(self, event: QLMEvent) -> None:
        """Update actor state based on event"""
        actor_id = event.actor_id

        # Find actor in any layer
        actor = None
        for layer in self.layers.values():
            if actor_id in layer.actors:
                actor = layer.actors[actor_id]
                break

        if not actor:
            return

        # Update actor state based on event type
        if event.event_type in [EventType.AGENT_EXECUTION, EventType.OPERATOR_INTENT]:
            actor.state = ActorState.ACTIVE
            actor.current_task_id = event.task_id

        elif event.event_type in [EventType.AGENT_COMPLETION]:
            actor.state = ActorState.IDLE
            actor.current_task_id = None

        elif event.event_type == EventType.AGENT_ERROR:
            actor.state = ActorState.BLOCKED

        actor.last_active = event.timestamp

    def _detect_qi_emergence(self, event: QLMEvent) -> Optional[QIEmergence]:
        """
        Detect if this event (combined with recent events) represents QI emergence.

        This is where the magic happens: detecting when 1 + 1 = 3.
        """
        # Look at recent events (last 10)
        recent_events = self.events[-10:]

        # Check each known QI pattern
        for pattern_name, pattern_def in QI_PATTERNS.items():
            if self._matches_pattern(recent_events, pattern_name, pattern_def):
                return QIEmergence(
                    pattern_name=pattern_name,
                    trigger_events=[e.id for e in recent_events[-3:]],  # Last 3 events
                    confidence=0.8,  # TODO: Implement proper confidence scoring
                    explanation=pattern_def["description"],
                    impact_score=self._calculate_impact(pattern_name),
                )

        return None

    def _matches_pattern(
        self, events: List[QLMEvent], pattern_name: str, pattern_def: Dict
    ) -> bool:
        """Check if a sequence of events matches a QI pattern"""
        if pattern_name == "agent_self_correction":
            # Look for: AGENT_ERROR followed by AGENT_EXECUTION with same task
            for i in range(len(events) - 1):
                if (
                    events[i].event_type == EventType.AGENT_ERROR
                    and events[i + 1].event_type == EventType.AGENT_EXECUTION
                    and events[i].task_id == events[i + 1].task_id
                ):
                    return True

        elif pattern_name == "operator_feedback_loop":
            # Look for: OPERATOR_INTENT → AGENT_COMPLETION → OPERATOR_APPROVAL
            for i in range(len(events) - 2):
                if (
                    events[i].event_type == EventType.OPERATOR_INTENT
                    and events[i + 1].event_type == EventType.AGENT_COMPLETION
                    and events[i + 2].event_type == EventType.OPERATOR_APPROVAL
                ):
                    self.metrics.feedback_loop_count += 1
                    return True

        # TODO: Implement other pattern detectors

        return False

    def _calculate_impact(self, pattern_name: str) -> float:
        """Calculate impact score for an emergence pattern"""
        significance_map = {
            "very_high": 1.0,
            "high": 0.8,
            "medium": 0.5,
            "low": 0.3,
        }
        pattern_def = QI_PATTERNS.get(pattern_name, {})
        significance = pattern_def.get("significance", "medium")
        return significance_map.get(significance, 0.5)

    def _create_snapshot(self) -> Dict[str, Any]:
        """Create a snapshot of current state"""
        return {
            "timestamp": datetime.now().isoformat(),
            "total_events": len(self.events),
            "total_emergences": len(self.emergences),
            "metrics": self.metrics.to_dict(),
        }

    def _compute_changes(
        self, before: Dict[str, Any], after: Dict[str, Any]
    ) -> List[str]:
        """Compute human-readable changes between states"""
        changes = []

        if after["total_events"] > before["total_events"]:
            changes.append(f"New event added (total: {after['total_events']})")

        if after["total_emergences"] > before["total_emergences"]:
            changes.append(
                f"QI emergence detected (total: {after['total_emergences']})"
            )

        # Compare metrics
        before_metrics = before["metrics"]
        after_metrics = after["metrics"]

        if after_metrics["hi_events"] > before_metrics["hi_events"]:
            changes.append("Operator activity increased")

        if after_metrics["ai_events"] > before_metrics["ai_events"]:
            changes.append("Agent activity increased")

        return changes

    def query(self, query_type: str, **kwargs) -> Any:
        """
        Query the QLM state.

        Examples:
        - query("active_actors")
        - query("events_by_type", event_type=EventType.OPERATOR_INTENT)
        - query("emergences_by_pattern", pattern="agent_self_correction")
        - query("metrics_summary")
        """
        if query_type == "active_actors":
            active = []
            for layer in self.layers.values():
                active.extend(layer.get_active_actors())
            return active

        elif query_type == "events_by_type":
            event_type = kwargs.get("event_type")
            return [e for e in self.events if e.event_type == event_type]

        elif query_type == "events_by_actor":
            actor_id = kwargs.get("actor_id")
            return [e for e in self.events if e.actor_id == actor_id]

        elif query_type == "events_in_timerange":
            start = kwargs.get("start", datetime.now() - timedelta(days=1))
            end = kwargs.get("end", datetime.now())
            return [e for e in self.events if start <= e.timestamp <= end]

        elif query_type == "emergences_by_pattern":
            pattern = kwargs.get("pattern")
            return [em for em in self.emergences if em.pattern_name == pattern]

        elif query_type == "metrics_summary":
            return self.metrics.to_dict()

        elif query_type == "recent_transitions":
            limit = kwargs.get("limit", 10)
            return self.transitions[-limit:]

        return None

    def explain_transition(self, event_id: str) -> Optional[StateTransition]:
        """Explain what happened when a specific event occurred"""
        for transition in self.transitions:
            if transition.event_id == event_id:
                return transition
        return None

    def calculate_alignment(self) -> float:
        """
        Calculate HI-AI alignment.

        This measures: "Is AI doing what the Operator intended?"

        Approach:
        - Look at OPERATOR_INTENT events
        - Look at subsequent AGENT_COMPLETION events
        - Check if agent actions align with intent
        - Return alignment score (0.0 to 1.0)
        """
        operator_intents = [
            e for e in self.events if e.event_type == EventType.OPERATOR_INTENT
        ]

        if not operator_intents:
            return 1.0  # No intents = perfect alignment (vacuous truth)

        aligned_count = 0

        for intent_event in operator_intents:
            # Find completions after this intent
            completions_after = [
                e
                for e in self.events
                if e.event_type == EventType.AGENT_COMPLETION
                and e.timestamp > intent_event.timestamp
                and e.intent_node_id == intent_event.intent_node_id
            ]

            if completions_after:
                # Check if any completion was approved
                approvals = [
                    e
                    for e in self.events
                    if e.event_type == EventType.OPERATOR_APPROVAL
                    and e.timestamp > completions_after[0].timestamp
                    and e.intent_node_id == intent_event.intent_node_id
                ]

                if approvals:
                    aligned_count += 1

        alignment = aligned_count / len(operator_intents) if operator_intents else 1.0
        self.metrics.hi_ai_alignment = alignment
        return alignment

    def summarize_for_operator(self, days: int = 7) -> str:
        """
        Create a human-readable summary for the Operator.

        This is what Alexa sees when she asks: "What happened this week?"
        """
        cutoff = datetime.now() - timedelta(days=days)
        recent_events = [e for e in self.events if e.timestamp >= cutoff]

        # Count events by type
        event_counts = {}
        for event in recent_events:
            event_type = event.event_type.value
            event_counts[event_type] = event_counts.get(event_type, 0) + 1

        # Get emergences
        recent_emergences = [
            em for em in self.emergences if em.timestamp >= cutoff
        ]

        # Calculate alignment
        alignment = self.calculate_alignment()

        summary = f"""
QLM State Summary (Last {days} Days)
{'=' * 50}

📊 Activity Overview:
  Total Events: {len(recent_events)}
  HI (Operator) Events: {sum(1 for e in recent_events if e.source_layer == IntelligenceType.HI)}
  AI (Agent) Events: {sum(1 for e in recent_events if e.source_layer == IntelligenceType.AI)}
  System Events: {sum(1 for e in recent_events if 'system' in e.event_type.value)}

✨ QI Emergence:
  Emergent Patterns Detected: {len(recent_emergences)}
"""

        if recent_emergences:
            summary += "  Notable Emergences:\n"
            for em in recent_emergences[:5]:  # Top 5
                summary += f"    - {em.pattern_name}: {em.explanation}\n"

        summary += f"""
🎯 Alignment:
  HI-AI Alignment Score: {alignment:.2%}
  Operator Approvals: {self.metrics.operator_approvals}
  Operator Vetoes: {self.metrics.operator_vetoes}
  Feedback Loops: {self.metrics.feedback_loop_count}

👥 Active Actors:
  HI Layer: {len(self.layers[IntelligenceType.HI].get_active_actors())}
  AI Layer: {len(self.layers[IntelligenceType.AI].get_active_actors())}

📈 Top Event Types:
"""

        for event_type, count in sorted(
            event_counts.items(), key=lambda x: x[1], reverse=True
        )[:5]:
            summary += f"  {event_type}: {count}\n"

        return summary

    def export_json(self, file_path: str) -> None:
        """Export QLM state to JSON"""
        data = {
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "layers": {
                layer_type.value: layer.to_dict()
                for layer_type, layer in self.layers.items()
            },
            "events": [e.to_dict() for e in self.events],
            "emergences": [em.to_dict() for em in self.emergences],
            "metrics": self.metrics.to_dict(),
        }

        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

    def import_json(self, file_path: str) -> None:
        """Import QLM state from JSON"""
        with open(file_path, "r") as f:
            data = json.load(f)

        # TODO: Implement full deserialization
        pass
