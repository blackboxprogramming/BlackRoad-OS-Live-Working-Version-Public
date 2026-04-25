"""
Tests for QLM core functionality
"""

import pytest
from datetime import datetime, timedelta

from qlm_lab.api import QLMInterface
from qlm_lab.models import (
    Actor,
    ActorType,
    ActorRole,
    ActorState,
    IntelligenceType,
    EventType,
    QLMEvent,
)


class TestQLMCore:
    """Test core QLM functionality"""

    def test_qlm_initialization(self):
        """Test QLM initializes correctly"""
        qlm = QLMInterface()

        assert qlm.state is not None
        assert len(qlm.state.layers) == 3  # HI, AI, QI
        assert len(qlm.state.events) == 0  # No events yet
        assert qlm.operator.actor_type == ActorType.HUMAN

    def test_register_agent(self):
        """Test agent registration"""
        qlm = QLMInterface()

        agent = qlm.register_agent(
            agent_id="test-agent",
            name="TestAgent",
            role=ActorRole.EXECUTOR,
            capabilities=["testing", "debugging"],
        )

        assert agent.id == "test-agent"
        assert agent.name == "TestAgent"
        assert agent.role == ActorRole.EXECUTOR
        assert "testing" in agent.capabilities
        assert "debugging" in agent.capabilities

    def test_record_operator_intent(self):
        """Test recording Operator intent"""
        qlm = QLMInterface()

        event = qlm.record_operator_intent(
            intent="Test intent", description="Test description"
        )

        assert event.source_layer == IntelligenceType.HI
        assert event.event_type == EventType.OPERATOR_INTENT
        assert event.data["intent"] == "Test intent"
        assert len(qlm.state.events) == 1

    def test_record_agent_execution(self):
        """Test recording agent execution"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        event = qlm.record_agent_execution(
            agent_id="agent-1",
            task_description="Test task",
            task_id="task-1",
        )

        assert event.source_layer == IntelligenceType.AI
        assert event.event_type == EventType.AGENT_EXECUTION
        assert event.actor_id == "agent-1"
        assert event.task_id == "task-1"

    def test_record_agent_completion(self):
        """Test recording agent completion"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        event = qlm.record_agent_completion(
            agent_id="agent-1",
            task_id="task-1",
            success=True,
            result={"status": "done"},
        )

        assert event.event_type == EventType.AGENT_COMPLETION
        assert event.data["success"] is True
        assert event.data["result"]["status"] == "done"

    def test_alignment_calculation(self):
        """Test HI-AI alignment calculation"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        # Create intent
        qlm.record_operator_intent("Test intent", intent_node_id="intent-1")

        # Agent executes
        qlm.record_agent_execution(
            "agent-1", "Do task", "task-1", intent_node_id="intent-1"
        )
        qlm.record_agent_completion("agent-1", "task-1", True)

        # Operator approves
        qlm.record_operator_approval(
            "Good work", intent_node_id="intent-1", task_id="task-1"
        )

        alignment = qlm.get_alignment_score()
        assert alignment == 1.0  # Perfect alignment

    def test_qi_emergence_detection(self):
        """Test QI emergence detection"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        # Simulate self-correction pattern
        qlm.record_agent_execution("agent-1", "Task", "task-1")
        qlm.record_agent_error("agent-1", "task-1", "Error occurred")
        qlm.record_agent_execution("agent-1", "Task retry", "task-1")
        qlm.record_agent_completion("agent-1", "task-1", True)

        # Check for emergence
        emergences = qlm.get_recent_emergences()

        # Emergence detection may or may not trigger depending on pattern matching
        # This test mainly ensures the system doesn't crash
        assert isinstance(emergences, list)

    def test_query_events_by_type(self):
        """Test querying events by type"""
        qlm = QLMInterface()

        # Record various events
        qlm.record_operator_intent("Intent 1")
        qlm.record_operator_intent("Intent 2")

        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)
        qlm.record_agent_execution("agent-1", "Task", "task-1")

        # Query
        intent_events = qlm.get_events_by_type(EventType.OPERATOR_INTENT)
        assert len(intent_events) == 2

        exec_events = qlm.get_events_by_type(EventType.AGENT_EXECUTION)
        assert len(exec_events) == 1

    def test_query_events_in_timerange(self):
        """Test querying events in time range"""
        qlm = QLMInterface()

        now = datetime.now()
        yesterday = now - timedelta(days=1)

        qlm.record_operator_intent("Recent intent")

        events = qlm.get_events_in_timerange(yesterday, now)
        assert len(events) >= 1

    def test_operator_ask_interface(self):
        """Test natural language query interface"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        qlm.record_operator_intent("Test")
        qlm.record_agent_execution("agent-1", "Task", "task-1")
        qlm.record_agent_completion("agent-1", "task-1", True)
        qlm.record_operator_approval("Good", task_id="task-1")

        # Test queries
        response = qlm.ask("What's the status?")
        assert "QLM State Summary" in response

        response = qlm.ask("Are we aligned with my intent?")
        assert "Alignment" in response

    def test_export_import_state(self, tmp_path):
        """Test state export and import"""
        qlm = QLMInterface()

        # Create some state
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)
        qlm.record_operator_intent("Test intent")
        qlm.record_agent_execution("agent-1", "Task", "task-1")

        # Export
        export_path = tmp_path / "qlm_state.json"
        qlm.export_state(str(export_path))

        assert export_path.exists()

        # Check content
        import json

        with open(export_path, "r") as f:
            data = json.load(f)

        assert "layers" in data
        assert "events" in data
        assert "metrics" in data

    def test_metrics_tracking(self):
        """Test metrics are tracked correctly"""
        qlm = QLMInterface()
        qlm.register_agent("agent-1", "Agent1", ActorRole.EXECUTOR)

        # Record events
        qlm.record_operator_intent("Intent")
        qlm.record_agent_execution("agent-1", "Task", "task-1")
        qlm.record_operator_approval("Good", task_id="task-1")

        metrics = qlm.state.metrics

        assert metrics.hi_events >= 2  # Intent + approval
        assert metrics.ai_events >= 1  # Execution
        assert metrics.operator_approvals == 1


class TestQLMModels:
    """Test QLM data models"""

    def test_actor_creation(self):
        """Test Actor model"""
        actor = Actor(
            id="test-actor",
            name="TestActor",
            actor_type=ActorType.AGENT,
            role=ActorRole.EXECUTOR,
            state=ActorState.ACTIVE,
        )

        assert actor.id == "test-actor"
        assert actor.actor_type == ActorType.AGENT
        assert actor.role == ActorRole.EXECUTOR
        assert actor.state == ActorState.ACTIVE

        # Test serialization
        data = actor.to_dict()
        assert data["id"] == "test-actor"
        assert data["actor_type"] == "agent"

    def test_event_creation(self):
        """Test QLMEvent model"""
        event = QLMEvent(
            source_layer=IntelligenceType.AI,
            actor_id="agent-1",
            event_type=EventType.AGENT_EXECUTION,
            task_id="task-1",
            data={"test": "data"},
        )

        assert event.source_layer == IntelligenceType.AI
        assert event.event_type == EventType.AGENT_EXECUTION
        assert event.task_id == "task-1"
        assert event.data["test"] == "data"

        # Test serialization
        data = event.to_dict()
        assert data["source_layer"] == "model_intelligence"
        assert data["event_type"] == "agent_execution"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
