"""
Intent Graph - The Core of Cognitive OS

Tracks goals, decisions, tasks, and their relationships.
Every action has a "why" attached. No more context loss.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Set, Any
from uuid import uuid4
import json


class IntentType(Enum):
    """Types of intent nodes in the graph"""
    GOAL = "goal"  # High-level objective
    TASK = "task"  # Specific action item
    DECISION = "decision"  # Choice made and why
    QUESTION = "question"  # Open question
    CONTEXT = "context"  # Background information
    ARTIFACT = "artifact"  # Code, doc, file created
    INSIGHT = "insight"  # Learning or realization
    BLOCKER = "blocker"  # Something preventing progress


class IntentStatus(Enum):
    """Status of an intent node"""
    ACTIVE = "active"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"
    PENDING = "pending"


@dataclass
class IntentNode:
    """A node in the intent graph"""
    id: str = field(default_factory=lambda: str(uuid4()))
    type: IntentType = IntentType.TASK
    title: str = ""
    description: str = ""
    status: IntentStatus = IntentStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    # The WHY - this is crucial
    rationale: str = ""

    # Relationships
    parent_ids: Set[str] = field(default_factory=set)
    child_ids: Set[str] = field(default_factory=set)
    related_ids: Set[str] = field(default_factory=set)
    blocks_ids: Set[str] = field(default_factory=set)  # This blocks these
    blocked_by_ids: Set[str] = field(default_factory=set)  # Blocked by these

    # Linked artifacts
    file_paths: Set[str] = field(default_factory=set)
    commit_hashes: Set[str] = field(default_factory=set)
    urls: Set[str] = field(default_factory=set)

    # Metadata
    tags: Set[str] = field(default_factory=set)
    priority: int = 0  # Higher = more important
    effort_estimate: Optional[int] = None  # In minutes
    actual_effort: Optional[int] = None

    # Agent collaboration
    assigned_to: Optional[str] = None  # Agent or human
    created_by: Optional[str] = None

    # Custom metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Serialize to dict"""
        return {
            'id': self.id,
            'type': self.type.value,
            'title': self.title,
            'description': self.description,
            'status': self.status.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'rationale': self.rationale,
            'parent_ids': list(self.parent_ids),
            'child_ids': list(self.child_ids),
            'related_ids': list(self.related_ids),
            'blocks_ids': list(self.blocks_ids),
            'blocked_by_ids': list(self.blocked_by_ids),
            'file_paths': list(self.file_paths),
            'commit_hashes': list(self.commit_hashes),
            'urls': list(self.urls),
            'tags': list(self.tags),
            'priority': self.priority,
            'effort_estimate': self.effort_estimate,
            'actual_effort': self.actual_effort,
            'assigned_to': self.assigned_to,
            'created_by': self.created_by,
            'metadata': self.metadata
        }


class IntentGraph:
    """
    The Intent Graph - tracks what we're doing and why.

    This solves the biggest problem in AI-human collaboration:
    context loss. Every decision, task, and artifact is connected
    to its purpose and rationale.
    """

    def __init__(self):
        self.nodes: Dict[str, IntentNode] = {}
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def add_node(self, node: IntentNode) -> IntentNode:
        """Add a node to the graph"""
        self.nodes[node.id] = node
        self.updated_at = datetime.now()
        return node

    def create_goal(self, title: str, description: str = "",
                   rationale: str = "", **kwargs) -> IntentNode:
        """Create a goal node"""
        node = IntentNode(
            type=IntentType.GOAL,
            title=title,
            description=description,
            rationale=rationale,
            status=IntentStatus.ACTIVE,
            **kwargs
        )
        return self.add_node(node)

    def create_task(self, title: str, parent_id: Optional[str] = None,
                   rationale: str = "", **kwargs) -> IntentNode:
        """Create a task node, optionally linked to a parent goal"""
        node = IntentNode(
            type=IntentType.TASK,
            title=title,
            rationale=rationale,
            **kwargs
        )
        if parent_id:
            node.parent_ids.add(parent_id)
            if parent_id in self.nodes:
                self.nodes[parent_id].child_ids.add(node.id)
        return self.add_node(node)

    def create_decision(self, title: str, rationale: str,
                       alternatives_considered: List[str] = None,
                       **kwargs) -> IntentNode:
        """
        Create a decision node - this is CRITICAL.
        Always capture WHY a decision was made and what alternatives were considered.
        """
        metadata = kwargs.get('metadata', {})
        metadata['alternatives_considered'] = alternatives_considered or []
        kwargs['metadata'] = metadata

        node = IntentNode(
            type=IntentType.DECISION,
            title=title,
            rationale=rationale,
            status=IntentStatus.COMPLETED,
            **kwargs
        )
        return self.add_node(node)

    def link_nodes(self, from_id: str, to_id: str,
                   relationship: str = "related") -> None:
        """Link two nodes with a relationship"""
        if from_id not in self.nodes or to_id not in self.nodes:
            return

        if relationship == "parent":
            self.nodes[to_id].parent_ids.add(from_id)
            self.nodes[from_id].child_ids.add(to_id)
        elif relationship == "blocks":
            self.nodes[from_id].blocks_ids.add(to_id)
            self.nodes[to_id].blocked_by_ids.add(from_id)
        else:  # related
            self.nodes[from_id].related_ids.add(to_id)
            self.nodes[to_id].related_ids.add(from_id)

        self.updated_at = datetime.now()

    def link_artifact(self, node_id: str, artifact_path: str,
                     commit_hash: Optional[str] = None) -> None:
        """Link a code/doc artifact to an intent node"""
        if node_id in self.nodes:
            self.nodes[node_id].file_paths.add(artifact_path)
            if commit_hash:
                self.nodes[node_id].commit_hashes.add(commit_hash)
            self.updated_at = datetime.now()

    def get_context(self, node_id: str, depth: int = 2) -> Dict[str, Any]:
        """
        Get full context for a node - parents, children, related items.
        This is what makes the system context-aware.
        """
        if node_id not in self.nodes:
            return {}

        context = {
            'node': self.nodes[node_id],
            'parents': [],
            'children': [],
            'related': [],
            'blockers': [],
            'artifacts': []
        }

        node = self.nodes[node_id]

        # Get parents
        for parent_id in node.parent_ids:
            if parent_id in self.nodes:
                context['parents'].append(self.nodes[parent_id])

        # Get children
        for child_id in node.child_ids:
            if child_id in self.nodes:
                context['children'].append(self.nodes[child_id])

        # Get related
        for related_id in node.related_ids:
            if related_id in self.nodes:
                context['related'].append(self.nodes[related_id])

        # Get blockers
        for blocker_id in node.blocked_by_ids:
            if blocker_id in self.nodes:
                context['blockers'].append(self.nodes[blocker_id])

        # Get artifacts
        context['artifacts'] = {
            'files': list(node.file_paths),
            'commits': list(node.commit_hashes),
            'urls': list(node.urls)
        }

        return context

    def get_active_goals(self) -> List[IntentNode]:
        """Get all active goals - what are we trying to accomplish?"""
        return [
            node for node in self.nodes.values()
            if node.type == IntentType.GOAL and node.status == IntentStatus.ACTIVE
        ]

    def get_blocked_tasks(self) -> List[IntentNode]:
        """Find all blocked tasks - what needs unblocking?"""
        return [
            node for node in self.nodes.values()
            if node.status == IntentStatus.BLOCKED or len(node.blocked_by_ids) > 0
        ]

    def find_by_tag(self, tag: str) -> List[IntentNode]:
        """Find all nodes with a specific tag"""
        return [
            node for node in self.nodes.values()
            if tag in node.tags
        ]

    def find_by_artifact(self, file_path: str) -> List[IntentNode]:
        """Find all intent nodes related to a file - WHY does this file exist?"""
        return [
            node for node in self.nodes.values()
            if file_path in node.file_paths
        ]

    def export_json(self, file_path: str) -> None:
        """Export the entire graph to JSON"""
        data = {
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'nodes': {
                node_id: node.to_dict()
                for node_id, node in self.nodes.items()
            }
        }
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

    def import_json(self, file_path: str) -> None:
        """Import a graph from JSON"""
        with open(file_path, 'r') as f:
            data = json.load(f)

        # TODO: Implement full deserialization
        # This would parse the JSON and recreate all nodes
        pass

    def get_summary(self) -> str:
        """Get a human-readable summary of the current state"""
        goals = [n for n in self.nodes.values() if n.type == IntentType.GOAL]
        tasks = [n for n in self.nodes.values() if n.type == IntentType.TASK]
        decisions = [n for n in self.nodes.values() if n.type == IntentType.DECISION]

        active_goals = [g for g in goals if g.status == IntentStatus.ACTIVE]
        active_tasks = [t for t in tasks if t.status == IntentStatus.ACTIVE]
        blocked = self.get_blocked_tasks()

        summary = f"""
Intent Graph Summary
====================
Total Nodes: {len(self.nodes)}
Goals: {len(goals)} ({len(active_goals)} active)
Tasks: {len(tasks)} ({len(active_tasks)} active)
Decisions: {len(decisions)}
Blocked Items: {len(blocked)}

Active Goals:
"""
        for goal in active_goals:
            summary += f"\n  - {goal.title}"
            if goal.rationale:
                summary += f"\n    Why: {goal.rationale}"

        if blocked:
            summary += "\n\nBlocked Tasks:"
            for task in blocked:
                summary += f"\n  - {task.title}"
                if task.blocked_by_ids:
                    summary += f" (blocked by {len(task.blocked_by_ids)} items)"

        return summary


# Example usage
if __name__ == "__main__":
    # Create a sample intent graph
    graph = IntentGraph()

    # Add a goal
    goal = graph.create_goal(
        title="Build a smart document management system",
        rationale="Current file management is chaos. Downloads folder anarchy. Need semantic organization."
    )

    # Add tasks under that goal
    task1 = graph.create_task(
        title="Implement OCR for document scanning",
        parent_id=goal.id,
        rationale="Need to extract structured data from PDFs and images"
    )

    task2 = graph.create_task(
        title="Build auto-filing system",
        parent_id=goal.id,
        rationale="Documents should organize themselves based on content"
    )

    # Make a decision
    decision = graph.create_decision(
        title="Use Tesseract for OCR",
        rationale="Open source, well-maintained, good accuracy, supports multiple languages",
        alternatives_considered=[
            "Google Cloud Vision API (too expensive for local-first OS)",
            "AWS Textract (vendor lock-in)",
            "pytesseract (Python wrapper around Tesseract - good option)"
        ]
    )

    # Link decision to task
    graph.link_nodes(decision.id, task1.id, "related")

    print(graph.get_summary())
