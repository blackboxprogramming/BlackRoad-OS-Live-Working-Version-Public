"""
Agent Coordination Protocol - Multi-agent collaboration that actually works

The problem with current multi-agent systems:
- Agents duplicate work
- No shared context
- Messy handoffs
- Lost information
- No clear ownership

This protocol solves that by providing:
- Shared context via the cognitive layer
- Clear task ownership
- Handoff protocols
- Conflict resolution
- Progress tracking
- Collaboration patterns
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Set, Any
from uuid import uuid4
import json


class AgentRole(Enum):
    """Agent specializations"""
    COORDINATOR = "coordinator"  # Manages other agents
    CODER = "coder"  # Writes code
    REVIEWER = "reviewer"  # Reviews code/docs
    RESEARCHER = "researcher"  # Finds information
    DOCUMENTER = "documenter"  # Writes documentation
    TESTER = "tester"  # Tests code
    PLANNER = "planner"  # Creates plans
    EXECUTOR = "executor"  # Executes tasks


class TaskStatus(Enum):
    """Task status in agent workflow"""
    PENDING = "pending"
    CLAIMED = "claimed"
    IN_PROGRESS = "in_progress"
    REVIEW_NEEDED = "review_needed"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class HandoffType(Enum):
    """Types of handoffs between agents"""
    SEQUENTIAL = "sequential"  # A does task, then B does next task
    PARALLEL = "parallel"  # A and B work simultaneously
    REVIEW = "review"  # A does work, B reviews
    ASSIST = "assist"  # B helps A with current task
    DELEGATE = "delegate"  # A assigns subtask to B


@dataclass
class AgentInfo:
    """Information about an agent"""
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    role: AgentRole = AgentRole.EXECUTOR
    capabilities: Set[str] = field(default_factory=set)
    current_task_id: Optional[str] = None
    active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    last_seen: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Handoff:
    """A handoff between agents"""
    id: str = field(default_factory=lambda: str(uuid4()))
    from_agent_id: str = ""
    to_agent_id: str = ""
    task_id: str = ""
    handoff_type: HandoffType = HandoffType.SEQUENTIAL
    context: Dict[str, Any] = field(default_factory=dict)  # Info for receiving agent
    message: str = ""  # Handoff message
    created_at: datetime = field(default_factory=datetime.now)
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str = "pending"  # pending, accepted, rejected, completed


@dataclass
class CollaborationSession:
    """A multi-agent collaboration session"""
    id: str = field(default_factory=lambda: str(uuid4()))
    goal: str = ""
    description: str = ""
    agents: Set[str] = field(default_factory=set)  # Agent IDs
    task_ids: Set[str] = field(default_factory=set)  # Tasks in this session
    coordinator_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str = "planning"  # planning, active, completed, cancelled
    metadata: Dict[str, Any] = field(default_factory=dict)


class AgentCoordinator:
    """
    Coordinates multiple agents working together.

    Key responsibilities:
    - Task assignment and load balancing
    - Handoff management
    - Conflict resolution
    - Progress tracking
    - Context sharing
    """

    def __init__(self, intent_graph=None, context_engine=None):
        """
        Initialize with connections to cognitive systems.

        This allows agents to share context and intent.
        """
        self.intent_graph = intent_graph
        self.context_engine = context_engine
        self.agents: Dict[str, AgentInfo] = {}
        self.handoffs: Dict[str, Handoff] = {}
        self.sessions: Dict[str, CollaborationSession] = {}
        self.task_ownership: Dict[str, str] = {}  # task_id -> agent_id

    def register_agent(self, agent: AgentInfo) -> AgentInfo:
        """Register a new agent"""
        self.agents[agent.id] = agent
        return agent

    def create_session(self, goal: str, description: str = "",
                      coordinator_id: Optional[str] = None) -> CollaborationSession:
        """Create a new collaboration session"""
        session = CollaborationSession(
            goal=goal,
            description=description,
            coordinator_id=coordinator_id
        )
        self.sessions[session.id] = session

        # Create a goal in the intent graph
        if self.intent_graph:
            from cognitive.intent_graph import IntentType
            goal_node = self.intent_graph.create_goal(
                title=goal,
                description=description,
                metadata={"session_id": session.id}
            )
            session.metadata['intent_node_id'] = goal_node.id

        return session

    def assign_task(self, task_id: str, agent_id: str,
                   context: Optional[Dict] = None) -> bool:
        """
        Assign a task to a specific agent.

        Returns True if assignment successful, False otherwise.
        """
        if agent_id not in self.agents:
            return False

        agent = self.agents[agent_id]

        # Check if agent is available
        if agent.current_task_id and agent.active:
            # Agent is busy - could queue or reject
            return False

        # Assign the task
        self.task_ownership[task_id] = agent_id
        agent.current_task_id = task_id
        agent.last_seen = datetime.now()

        # Update task status in intent graph
        if self.intent_graph and task_id in self.intent_graph.nodes:
            task_node = self.intent_graph.nodes[task_id]
            task_node.assigned_to = agent_id
            task_node.status = task_node.status  # Keep current status

        # Provide context to the agent
        if self.context_engine and context:
            # Store context for agent to retrieve
            pass

        return True

    def find_available_agent(self, required_role: Optional[AgentRole] = None,
                           required_capabilities: Optional[Set[str]] = None) -> Optional[AgentInfo]:
        """
        Find an available agent with specific requirements.

        This is for automatic task assignment.
        """
        for agent in self.agents.values():
            if not agent.active:
                continue

            if agent.current_task_id:
                continue  # Agent is busy

            if required_role and agent.role != required_role:
                continue

            if required_capabilities:
                if not required_capabilities.issubset(agent.capabilities):
                    continue

            return agent

        return None

    def create_handoff(self, from_agent_id: str, to_agent_id: str,
                      task_id: str, handoff_type: HandoffType,
                      message: str = "", context: Optional[Dict] = None) -> Handoff:
        """
        Create a handoff from one agent to another.

        This is how agents collaborate!
        """
        handoff = Handoff(
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            task_id=task_id,
            handoff_type=handoff_type,
            message=message,
            context=context or {}
        )

        self.handoffs[handoff.id] = handoff

        # Get full context for the handoff
        if self.context_engine:
            context_bundle = self.context_engine.get_context_for_task(task_id)
            handoff.context['cognitive_context'] = {
                'goal': context_bundle.task_title,
                'top_items': [
                    {
                        'type': item.type,
                        'title': item.title,
                        'content': item.content
                    }
                    for item in context_bundle.get_top_items(5)
                ]
            }

        return handoff

    def accept_handoff(self, handoff_id: str, agent_id: str) -> bool:
        """Agent accepts a handoff"""
        if handoff_id not in self.handoffs:
            return False

        handoff = self.handoffs[handoff_id]

        if handoff.to_agent_id != agent_id:
            return False  # Wrong agent

        handoff.status = "accepted"
        handoff.accepted_at = datetime.now()

        # Update task ownership
        self.task_ownership[handoff.task_id] = agent_id
        if agent_id in self.agents:
            self.agents[agent_id].current_task_id = handoff.task_id

        return True

    def complete_handoff(self, handoff_id: str, result: Optional[Dict] = None) -> bool:
        """Mark a handoff as completed"""
        if handoff_id not in self.handoffs:
            return False

        handoff = self.handoffs[handoff_id]
        handoff.status = "completed"
        handoff.completed_at = datetime.now()

        if result:
            handoff.context['result'] = result

        # Update receiving agent
        if handoff.to_agent_id in self.agents:
            agent = self.agents[handoff.to_agent_id]
            if agent.current_task_id == handoff.task_id:
                agent.current_task_id = None

        return True

    def get_agent_context(self, agent_id: str) -> Dict[str, Any]:
        """
        Get full context for an agent.

        This tells the agent what they need to know:
        - Current task
        - Related context
        - Active handoffs
        - Session info
        """
        if agent_id not in self.agents:
            return {}

        agent = self.agents[agent_id]
        context = {
            'agent': {
                'id': agent.id,
                'name': agent.name,
                'role': agent.role.value,
                'current_task': agent.current_task_id
            },
            'active_handoffs': [],
            'pending_handoffs': [],
            'sessions': []
        }

        # Get active handoffs
        for handoff in self.handoffs.values():
            if handoff.to_agent_id == agent_id:
                if handoff.status == "pending":
                    context['pending_handoffs'].append({
                        'id': handoff.id,
                        'from_agent': handoff.from_agent_id,
                        'task_id': handoff.task_id,
                        'type': handoff.handoff_type.value,
                        'message': handoff.message
                    })
                elif handoff.status == "accepted":
                    context['active_handoffs'].append({
                        'id': handoff.id,
                        'task_id': handoff.task_id,
                        'type': handoff.handoff_type.value
                    })

        # Get task context if agent has current task
        if agent.current_task_id and self.context_engine:
            task_context = self.context_engine.get_context_for_task(agent.current_task_id)
            context['task_context'] = {
                'title': task_context.task_title,
                'top_items': [
                    {
                        'type': item.type,
                        'title': item.title,
                        'relevance': item.relevance_score
                    }
                    for item in task_context.get_top_items(5)
                ]
            }

        # Get active sessions
        for session in self.sessions.values():
            if agent_id in session.agents:
                context['sessions'].append({
                    'id': session.id,
                    'goal': session.goal,
                    'status': session.status,
                    'is_coordinator': session.coordinator_id == agent_id
                })

        return context

    def suggest_collaboration(self, task_id: str) -> List[Dict[str, Any]]:
        """
        Suggest how to collaborate on a task.

        Analyzes task and suggests:
        - Which agents should work on it
        - What collaboration pattern to use
        - How to split the work
        """
        suggestions = []

        if not self.intent_graph or task_id not in self.intent_graph.nodes:
            return suggestions

        task = self.intent_graph.nodes[task_id]

        # If task has subtasks, suggest parallel work
        if task.child_ids:
            suggestions.append({
                "pattern": "parallel",
                "description": f"Task has {len(task.child_ids)} subtasks. Assign to multiple agents for parallel execution.",
                "agents_needed": min(len(task.child_ids), 3),
                "roles": [AgentRole.EXECUTOR.value]
            })

        # If task is complex, suggest planner + executor pattern
        if task.description and len(task.description) > 500:
            suggestions.append({
                "pattern": "plan_and_execute",
                "description": "Complex task. Use planner to break down, then executor to implement.",
                "agents_needed": 2,
                "roles": [AgentRole.PLANNER.value, AgentRole.EXECUTOR.value]
            })

        # If task involves code, suggest coder + reviewer pattern
        code_extensions = {'.py', '.js', '.java', '.cpp', '.go', '.rs'}
        has_code = any(
            any(path.endswith(ext) for ext in code_extensions)
            for path in task.file_paths
        )

        if has_code:
            suggestions.append({
                "pattern": "code_and_review",
                "description": "Task involves code. Use coder + reviewer for quality.",
                "agents_needed": 2,
                "roles": [AgentRole.CODER.value, AgentRole.REVIEWER.value]
            })

        return suggestions

    def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get status of a collaboration session"""
        if session_id not in self.sessions:
            return {}

        session = self.sessions[session_id]

        # Gather task statuses
        task_statuses = {}
        if self.intent_graph:
            for task_id in session.task_ids:
                if task_id in self.intent_graph.nodes:
                    task = self.intent_graph.nodes[task_id]
                    status = task.status.value
                    task_statuses[status] = task_statuses.get(status, 0) + 1

        # Get agent activity
        active_agents = []
        for agent_id in session.agents:
            if agent_id in self.agents:
                agent = self.agents[agent_id]
                if agent.active and agent.current_task_id:
                    active_agents.append(agent_id)

        return {
            'session_id': session.id,
            'goal': session.goal,
            'status': session.status,
            'agents': {
                'total': len(session.agents),
                'active': len(active_agents)
            },
            'tasks': {
                'total': len(session.task_ids),
                'by_status': task_statuses
            },
            'progress': self._calculate_progress(session.task_ids),
            'duration': (datetime.now() - session.created_at).seconds if session.created_at else 0
        }

    def _calculate_progress(self, task_ids: Set[str]) -> float:
        """Calculate progress for a set of tasks"""
        if not task_ids or not self.intent_graph:
            return 0.0

        total = len(task_ids)
        completed = 0

        for task_id in task_ids:
            if task_id in self.intent_graph.nodes:
                task = self.intent_graph.nodes[task_id]
                if task.status.value == "completed":
                    completed += 1

        return completed / total if total > 0 else 0.0

    def resolve_conflict(self, task_id: str, agent1_id: str, agent2_id: str) -> str:
        """
        Resolve conflict when multiple agents try to work on same task.

        Resolution strategies:
        - Check who claimed first
        - Consider agent roles/capabilities
        - Suggest splitting task
        - Suggest collaboration pattern
        """
        # Simple strategy: first come, first served
        if task_id in self.task_ownership:
            return self.task_ownership[task_id]

        # If both agents have same role, assign to agent with less work
        if agent1_id in self.agents and agent2_id in self.agents:
            agent1 = self.agents[agent1_id]
            agent2 = self.agents[agent2_id]

            # Count active tasks
            agent1_tasks = sum(1 for tid, aid in self.task_ownership.items()
                             if aid == agent1_id)
            agent2_tasks = sum(1 for tid, aid in self.task_ownership.items()
                             if aid == agent2_id)

            return agent1_id if agent1_tasks <= agent2_tasks else agent2_id

        return agent1_id

    def export_coordination_state(self, file_path: str) -> None:
        """Export coordination state for persistence"""
        data = {
            'agents': {
                aid: {
                    'id': a.id,
                    'name': a.name,
                    'role': a.role.value,
                    'current_task': a.current_task_id,
                    'active': a.active
                }
                for aid, a in self.agents.items()
            },
            'sessions': {
                sid: {
                    'id': s.id,
                    'goal': s.goal,
                    'agents': list(s.agents),
                    'tasks': list(s.task_ids),
                    'status': s.status
                }
                for sid, s in self.sessions.items()
            },
            'task_ownership': self.task_ownership
        }

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)


# Example usage and collaboration patterns
if __name__ == "__main__":
    # Example: Multi-agent code review workflow
    # coordinator = AgentCoordinator(intent_graph, context_engine)

    # Register agents
    # coder = AgentInfo(name="CodeWriter", role=AgentRole.CODER)
    # reviewer = AgentInfo(name="CodeReviewer", role=AgentRole.REVIEWER)
    # coordinator.register_agent(coder)
    # coordinator.register_agent(reviewer)

    # Create session
    # session = coordinator.create_session(
    #     goal="Implement user authentication feature",
    #     description="Add login, signup, and password reset"
    # )

    # Assign work
    # coordinator.assign_task("implement-login", coder.id)

    # When coder is done, handoff to reviewer
    # handoff = coordinator.create_handoff(
    #     from_agent_id=coder.id,
    #     to_agent_id=reviewer.id,
    #     task_id="implement-login",
    #     handoff_type=HandoffType.REVIEW,
    #     message="Login implementation complete, ready for review"
    # )

    print("Agent Coordination Protocol initialized")
