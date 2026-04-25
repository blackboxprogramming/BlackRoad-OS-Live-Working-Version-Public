"""
QLM API - Public interface for Quantum Language Model

This is the primary way applications interact with QLM.

The QLMInterface provides:
- Simple methods to record events
- Queries about current state
- Operator-facing summaries
- Integration with cognitive layer

Usage:
    from qlm_lab.api import QLMInterface

    qlm = QLMInterface()

    # Record events
    qlm.record_operator_intent("Deploy auth feature", intent_node_id="abc123")
    qlm.record_agent_execution("agent-001", "Implement login", task_id="task-001")
    qlm.record_agent_completion("agent-001", "task-001", success=True)

    # Query state
    summary = qlm.get_summary(days=7)
    alignment = qlm.get_alignment_score()
    emergences = qlm.get_recent_emergences(limit=5)

    # Operator tools
    print(qlm.ask("What did agents do today?"))
    print(qlm.ask("Are we aligned with my intent?"))
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

from qlm_lab.state import QLMState
from qlm_lab.models import (
    Actor,
    ActorType,
    ActorRole,
    ActorState,
    QLMEvent,
    EventType,
    IntelligenceType,
    QIEmergence,
)

logger = logging.getLogger(__name__)


class QLMInterface:
    """
    Public API for QLM.

    This provides a simple, clean interface for recording events
    and querying QLM state.
    """

    def __init__(self, intent_graph=None, agent_coordinator=None):
        """
        Initialize QLM interface.

        Args:
            intent_graph: Optional cognitive.intent_graph.IntentGraph
            agent_coordinator: Optional cognitive.agent_coordination.AgentCoordinator
        """
        self.state = QLMState(
            intent_graph=intent_graph, agent_coordinator=agent_coordinator
        )

        # Register default Operator
        self.operator = Actor(
            id="operator-alexa",
            name="Alexa (Operator)",
            actor_type=ActorType.HUMAN,
            role=ActorRole.OPERATOR,
            state=ActorState.ACTIVE,
            capabilities={"intent", "approve", "veto", "query", "orchestrate"},
        )
        self.state.register_actor(self.operator)

        logger.info("QLM Interface initialized")

    def record_operator_intent(
        self,
        intent: str,
        description: str = "",
        intent_node_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> QLMEvent:
        """
        Record an Operator intent.

        This is HI (Human Intelligence) expressing a goal or desire.

        Args:
            intent: What the Operator wants (e.g., "Deploy authentication")
            description: Additional context
            intent_node_id: Optional link to IntentGraph node
            metadata: Additional data

        Returns:
            The created QLMEvent
        """
        event = QLMEvent(
            source_layer=IntelligenceType.HI,
            actor_id=self.operator.id,
            event_type=EventType.OPERATOR_INTENT,
            intent_node_id=intent_node_id,
            data={
                "intent": intent,
                "description": description,
            },
            metadata=metadata or {},
        )

        self.state.ingest_event(event)
        logger.info(f"Operator intent recorded: {intent}")
        return event

    def record_operator_approval(
        self,
        what_approved: str,
        intent_node_id: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> QLMEvent:
        """Record Operator approval of agent work"""
        event = QLMEvent(
            source_layer=IntelligenceType.HI,
            actor_id=self.operator.id,
            event_type=EventType.OPERATOR_APPROVAL,
            intent_node_id=intent_node_id,
            task_id=task_id,
            data={"approved": what_approved},
        )

        self.state.ingest_event(event)
        logger.info(f"Operator approval recorded: {what_approved}")
        return event

    def record_operator_veto(
        self,
        what_vetoed: str,
        reason: str,
        intent_node_id: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> QLMEvent:
        """Record Operator veto of agent work"""
        event = QLMEvent(
            source_layer=IntelligenceType.HI,
            actor_id=self.operator.id,
            event_type=EventType.OPERATOR_VETO,
            intent_node_id=intent_node_id,
            task_id=task_id,
            data={"vetoed": what_vetoed, "reason": reason},
        )

        self.state.ingest_event(event)
        logger.info(f"Operator veto recorded: {what_vetoed}")
        return event

    def record_operator_query(self, query: str) -> QLMEvent:
        """Record Operator asking a question"""
        event = QLMEvent(
            source_layer=IntelligenceType.HI,
            actor_id=self.operator.id,
            event_type=EventType.OPERATOR_QUERY,
            data={"query": query},
        )

        self.state.ingest_event(event)
        return event

    def record_agent_execution(
        self,
        agent_id: str,
        task_description: str,
        task_id: Optional[str] = None,
        intent_node_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> QLMEvent:
        """
        Record an agent starting execution.

        This is AI (Agent Intelligence) performing work.

        Args:
            agent_id: Agent identifier
            task_description: What the agent is doing
            task_id: Optional task ID
            intent_node_id: Link to the intent this fulfills
            metadata: Additional data

        Returns:
            The created QLMEvent
        """
        event = QLMEvent(
            source_layer=IntelligenceType.AI,
            actor_id=agent_id,
            event_type=EventType.AGENT_EXECUTION,
            task_id=task_id,
            intent_node_id=intent_node_id,
            data={
                "task": task_description,
            },
            metadata=metadata or {},
        )

        self.state.ingest_event(event)
        logger.info(f"Agent execution recorded: {agent_id} - {task_description}")
        return event

    def record_agent_completion(
        self,
        agent_id: str,
        task_id: str,
        success: bool = True,
        result: Optional[Dict] = None,
        intent_node_id: Optional[str] = None,
    ) -> QLMEvent:
        """Record an agent completing a task"""
        # If no intent is provided, try to inherit it from the most recent execution
        if intent_node_id is None:
            for event in reversed(self.state.events):
                if (
                    event.event_type == EventType.AGENT_EXECUTION
                    and event.task_id == task_id
                    and event.actor_id == agent_id
                ):
                    intent_node_id = event.intent_node_id
                    break

        event = QLMEvent(
            source_layer=IntelligenceType.AI,
            actor_id=agent_id,
            event_type=EventType.AGENT_COMPLETION,
            task_id=task_id,
            intent_node_id=intent_node_id,
            data={
                "success": success,
                "result": result or {},
            },
        )

        self.state.ingest_event(event)
        logger.info(f"Agent completion recorded: {agent_id} - {task_id}")
        return event

    def record_agent_error(
        self,
        agent_id: str,
        task_id: str,
        error: str,
        intent_node_id: Optional[str] = None,
    ) -> QLMEvent:
        """Record an agent error"""
        event = QLMEvent(
            source_layer=IntelligenceType.AI,
            actor_id=agent_id,
            event_type=EventType.AGENT_ERROR,
            task_id=task_id,
            intent_node_id=intent_node_id,
            data={"error": error},
        )

        self.state.ingest_event(event)
        logger.warning(f"Agent error recorded: {agent_id} - {error}")
        return event

    def record_agent_handoff(
        self,
        from_agent_id: str,
        to_agent_id: str,
        task_id: str,
        handoff_message: str = "",
    ) -> QLMEvent:
        """Record an agent-to-agent handoff"""
        event = QLMEvent(
            source_layer=IntelligenceType.AI,
            actor_id=from_agent_id,
            event_type=EventType.AGENT_HANDOFF,
            task_id=task_id,
            data={
                "to_agent": to_agent_id,
                "message": handoff_message,
            },
        )

        self.state.ingest_event(event)
        logger.info(f"Agent handoff recorded: {from_agent_id} → {to_agent_id}")
        return event

    def record_system_event(
        self,
        event_type: EventType,
        description: str,
        task_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> QLMEvent:
        """
        Record a system event (deploy, test, build, error).

        Args:
            event_type: Must be a SYSTEM_* event type
            description: What happened
            task_id: Optional related task
            metadata: Additional data (test results, build logs, etc.)
        """
        event = QLMEvent(
            source_layer=IntelligenceType.AI,  # System events in AI layer
            actor_id="system",
            event_type=event_type,
            task_id=task_id,
            data={"description": description},
            metadata=metadata or {},
        )

        self.state.ingest_event(event)
        logger.info(f"System event recorded: {event_type.value} - {description}")
        return event

    def register_agent(
        self,
        agent_id: str,
        name: str,
        role: ActorRole = ActorRole.EXECUTOR,
        capabilities: Optional[List[str]] = None,
    ) -> Actor:
        """
        Register a new agent in the QLM system.

        Args:
            agent_id: Unique agent identifier
            name: Human-readable name
            role: Agent's role
            capabilities: List of capabilities

        Returns:
            The created Actor
        """
        actor = Actor(
            id=agent_id,
            name=name,
            actor_type=ActorType.AGENT,
            role=role,
            state=ActorState.IDLE,
            capabilities=set(capabilities or []),
        )

        self.state.register_actor(actor)
        logger.info(f"Agent registered: {name} ({agent_id})")
        return actor

    def get_summary(self, days: int = 7) -> str:
        """
        Get an Operator-facing summary.

        Args:
            days: Number of days to summarize

        Returns:
            Human-readable summary string
        """
        return self.state.summarize_for_operator(days=days)

    def get_alignment_score(self) -> float:
        """Get HI-AI alignment score (0.0 to 1.0)"""
        return self.state.calculate_alignment()

    def get_recent_emergences(self, limit: int = 10) -> List[QIEmergence]:
        """Get recent QI emergence events"""
        return self.state.emergences[-limit:]

    def get_active_actors(self) -> List[Actor]:
        """Get all currently active actors"""
        return self.state.query("active_actors")

    def get_events_by_type(
        self, event_type: EventType, limit: Optional[int] = None
    ) -> List[QLMEvent]:
        """Get events of a specific type"""
        events = self.state.query("events_by_type", event_type=event_type)
        return events[-limit:] if limit else events

    def get_events_in_timerange(
        self, start: datetime, end: Optional[datetime] = None
    ) -> List[QLMEvent]:
        """Get events within a time range"""
        # Use the provided end boundary but allow for events created just after the
        # timestamp to still be included in "now"-style queries.
        end = max(end or datetime.now(), datetime.now())
        return self.state.query("events_in_timerange", start=start, end=end)

    def ask(self, question: str) -> str:
        """
        Natural language query interface for Operator.

        Examples:
        - "What did agents do today?"
        - "Are we aligned with my intent?"
        - "Show me emergent behaviors"
        - "What's the status?"

        This is a simple keyword-based implementation.
        In production, this would use an LLM to interpret questions.
        """
        # Record the query
        self.record_operator_query(question)

        question_lower = question.lower()

        # Today's activity
        if "today" in question_lower or "what did" in question_lower:
            today_start = datetime.now().replace(hour=0, minute=0, second=0)
            events = self.get_events_in_timerange(today_start)

            agent_events = [e for e in events if e.source_layer == IntelligenceType.AI]

            response = f"Today's Activity:\n"
            response += f"- Total Events: {len(events)}\n"
            response += f"- Agent Actions: {len(agent_events)}\n"

            # Group by agent
            by_agent = {}
            for event in agent_events:
                agent_id = event.actor_id
                by_agent[agent_id] = by_agent.get(agent_id, 0) + 1

            response += f"\nMost Active Agents:\n"
            for agent_id, count in sorted(
                by_agent.items(), key=lambda x: x[1], reverse=True
            )[:5]:
                response += f"  - {agent_id}: {count} actions\n"

            return response

        # Alignment
        elif "aligned" in question_lower or "alignment" in question_lower:
            alignment = self.get_alignment_score()
            response = f"HI-AI Alignment: {alignment:.1%}\n"

            if alignment >= 0.8:
                response += "✅ Excellent alignment - agents are following your intent well."
            elif alignment >= 0.6:
                response += "⚠️  Moderate alignment - some drift from intent detected."
            else:
                response += "🚨 Low alignment - significant divergence from your intent."

            response += f"\n\nRecent Feedback:\n"
            response += f"- Approvals: {self.state.metrics.operator_approvals}\n"
            response += f"- Vetoes: {self.state.metrics.operator_vetoes}\n"
            response += f"- Feedback Loops: {self.state.metrics.feedback_loop_count}\n"

            return response

        # Emergence
        elif "emergent" in question_lower or "emergence" in question_lower or "qi" in question_lower:
            emergences = self.get_recent_emergences(limit=5)

            if not emergences:
                return "No emergent behaviors detected recently."

            response = f"Recent QI Emergence Events ({len(emergences)}):\n\n"

            for em in emergences:
                response += f"🌟 {em.pattern_name}\n"
                response += f"   {em.explanation}\n"
                response += f"   Confidence: {em.confidence:.0%}\n"
                response += f"   Impact: {em.impact_score:.1f}/1.0\n\n"

            return response

        # Status
        elif "status" in question_lower or "summary" in question_lower:
            return self.get_summary(days=7)

        # Default
        else:
            return (
                f"I don't understand the question: '{question}'\n\n"
                f"Try asking:\n"
                f"- What did agents do today?\n"
                f"- Are we aligned with my intent?\n"
                f"- Show me emergent behaviors\n"
                f"- What's the status?\n"
            )

    def explain_event(self, event_id: str) -> Optional[str]:
        """Explain what happened with a specific event"""
        transition = self.state.explain_transition(event_id)

        if not transition:
            return None

        response = f"Event: {event_id}\n"
        response += f"Time: {transition.timestamp}\n\n"
        response += f"Changes:\n"
        for change in transition.changes:
            response += f"  - {change}\n"

        return response

    def export_state(self, file_path: str) -> None:
        """Export QLM state to JSON file"""
        self.state.export_json(file_path)
        logger.info(f"QLM state exported to: {file_path}")

    def import_state(self, file_path: str) -> None:
        """Import QLM state from JSON file"""
        self.state.import_json(file_path)
        logger.info(f"QLM state imported from: {file_path}")
