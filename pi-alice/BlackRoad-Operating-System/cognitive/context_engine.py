"""
Context Engine - Provides the right information at the right time

The problem: Information overload. You have code, docs, tasks, decisions,
history... but finding the RIGHT information for what you're doing NOW is hard.

The solution: A context engine that understands:
- What you're currently trying to do (from intent graph)
- What code you're working with
- What decisions have been made
- What documentation exists
- What related work has been done

And provides exactly what you need, when you need it.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Set, Any
from pathlib import Path
import json


@dataclass
class ContextItem:
    """A piece of contextual information"""
    id: str
    type: str  # code, doc, decision, task, artifact, etc.
    title: str
    content: str
    relevance_score: float  # 0.0 to 1.0
    source: str  # Where this came from
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ContextBundle:
    """A collection of relevant context for a specific task/goal"""
    task_id: str
    task_title: str
    items: List[ContextItem] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

    def add_item(self, item: ContextItem) -> None:
        """Add a context item"""
        self.items.append(item)
        self.last_updated = datetime.now()

    def get_top_items(self, n: int = 10) -> List[ContextItem]:
        """Get top N most relevant items"""
        sorted_items = sorted(self.items, key=lambda x: x.relevance_score, reverse=True)
        return sorted_items[:n]

    def filter_by_type(self, item_type: str) -> List[ContextItem]:
        """Get all items of a specific type"""
        return [item for item in self.items if item.type == item_type]


class ContextEngine:
    """
    The Context Engine - provides the right information at the right time.

    This is what makes working with the system feel intelligent.
    Instead of searching for information, it comes to you.
    """

    def __init__(self, intent_graph=None, semantic_fs=None, doc_manager=None):
        """
        Initialize with references to other cognitive systems.

        The Context Engine is the integration point that pulls together:
        - Intent Graph (what we're trying to do)
        - Semantic FS (what files exist and what they are)
        - Doc Manager (what documentation exists)
        """
        self.intent_graph = intent_graph
        self.semantic_fs = semantic_fs
        self.doc_manager = doc_manager
        self.context_cache: Dict[str, ContextBundle] = {}

    def get_context_for_task(self, task_id: str, max_items: int = 20) -> ContextBundle:
        """
        Get relevant context for a specific task.

        This is the main entry point - given a task, what context do you need?
        """
        # Check cache first
        if task_id in self.context_cache:
            bundle = self.context_cache[task_id]
            # Refresh if older than 5 minutes
            if (datetime.now() - bundle.last_updated).seconds < 300:
                return bundle

        # Get the task from intent graph
        if not self.intent_graph or task_id not in self.intent_graph.nodes:
            return ContextBundle(task_id=task_id, task_title="Unknown")

        task_node = self.intent_graph.nodes[task_id]
        bundle = ContextBundle(task_id=task_id, task_title=task_node.title)

        # 1. Add parent context (why are we doing this?)
        for parent_id in task_node.parent_ids:
            if parent_id in self.intent_graph.nodes:
                parent = self.intent_graph.nodes[parent_id]
                bundle.add_item(ContextItem(
                    id=parent_id,
                    type="goal",
                    title=parent.title,
                    content=parent.description,
                    relevance_score=0.9,
                    source="intent_graph",
                    metadata={"rationale": parent.rationale}
                ))

        # 2. Add related decisions
        for related_id in task_node.related_ids:
            if related_id in self.intent_graph.nodes:
                related = self.intent_graph.nodes[related_id]
                if related.type.value == "decision":
                    bundle.add_item(ContextItem(
                        id=related_id,
                        type="decision",
                        title=related.title,
                        content=related.rationale,
                        relevance_score=0.85,
                        source="intent_graph",
                        metadata=related.metadata
                    ))

        # 3. Add linked artifacts (code/docs)
        for file_path in task_node.file_paths:
            # Get file metadata from semantic FS
            if self.semantic_fs and file_path in self.semantic_fs.files:
                metadata = self.semantic_fs.files[file_path]
                bundle.add_item(ContextItem(
                    id=file_path,
                    type="artifact",
                    title=Path(file_path).name,
                    content=metadata.summary or "",
                    relevance_score=0.95,  # Direct links are highly relevant
                    source="semantic_fs",
                    metadata={
                        "doc_type": metadata.document_type.value,
                        "purpose": metadata.purpose.value
                    }
                ))

        # 4. Add related documentation
        if self.doc_manager:
            for file_path in task_node.file_paths:
                # Find docs that reference this file
                if file_path in self.doc_manager.code_to_docs:
                    for doc_path in self.doc_manager.code_to_docs[file_path]:
                        if doc_path in self.doc_manager.documents:
                            doc = self.doc_manager.documents[doc_path]
                            bundle.add_item(ContextItem(
                                id=doc_path,
                                type="documentation",
                                title=Path(doc_path).name,
                                content=f"Documentation for {file_path}",
                                relevance_score=0.8,
                                source="doc_manager",
                                metadata={
                                    "doc_type": doc.doc_type.value,
                                    "sync_status": doc.sync_status.value
                                }
                            ))

        # 5. Add similar tasks (based on tags)
        if task_node.tags and self.intent_graph:
            for tag in task_node.tags:
                similar_tasks = self.intent_graph.find_by_tag(tag)
                for similar in similar_tasks[:3]:  # Top 3 similar tasks
                    if similar.id != task_id:
                        bundle.add_item(ContextItem(
                            id=similar.id,
                            type="similar_task",
                            title=similar.title,
                            content=similar.description,
                            relevance_score=0.6,
                            source="intent_graph",
                            metadata={"status": similar.status.value}
                        ))

        # Cache the result
        self.context_cache[task_id] = bundle
        return bundle

    def get_context_for_file(self, file_path: str) -> ContextBundle:
        """
        Get context for a specific file.

        When you open a file, what context do you need?
        - Why does this file exist? (intent graph)
        - What does it do? (semantic FS)
        - What documentation exists? (doc manager)
        - What tasks reference it? (intent graph)
        """
        bundle = ContextBundle(task_id=file_path, task_title=Path(file_path).name)

        # 1. Get semantic metadata
        if self.semantic_fs and file_path in self.semantic_fs.files:
            metadata = self.semantic_fs.files[file_path]
            bundle.add_item(ContextItem(
                id=file_path,
                type="file_metadata",
                title="File Information",
                content=metadata.summary or "",
                relevance_score=1.0,
                source="semantic_fs",
                metadata={
                    "doc_type": metadata.document_type.value,
                    "purpose": metadata.purpose.value,
                    "keywords": list(metadata.keywords)
                }
            ))

        # 2. Find tasks that reference this file
        if self.intent_graph:
            tasks = self.intent_graph.find_by_artifact(file_path)
            for task in tasks:
                bundle.add_item(ContextItem(
                    id=task.id,
                    type="related_task",
                    title=task.title,
                    content=task.description,
                    relevance_score=0.9,
                    source="intent_graph",
                    metadata={
                        "rationale": task.rationale,
                        "status": task.status.value
                    }
                ))

        # 3. Find related documentation
        if self.doc_manager and file_path in self.doc_manager.code_to_docs:
            for doc_path in self.doc_manager.code_to_docs[file_path]:
                if doc_path in self.doc_manager.documents:
                    doc = self.doc_manager.documents[doc_path]
                    bundle.add_item(ContextItem(
                        id=doc_path,
                        type="documentation",
                        title=Path(doc_path).name,
                        content=f"Documentation for this file",
                        relevance_score=0.95,
                        source="doc_manager",
                        metadata={"sync_status": doc.sync_status.value}
                    ))

        # 4. Find related files
        if self.semantic_fs and file_path in self.semantic_fs.files:
            metadata = self.semantic_fs.files[file_path]
            for related_path in metadata.related_files:
                if related_path in self.semantic_fs.files:
                    related_meta = self.semantic_fs.files[related_path]
                    bundle.add_item(ContextItem(
                        id=related_path,
                        type="related_file",
                        title=Path(related_path).name,
                        content=related_meta.summary or "",
                        relevance_score=0.7,
                        source="semantic_fs"
                    ))

        return bundle

    def get_context_for_query(self, query: str) -> ContextBundle:
        """
        Get context for a natural language query.

        User asks: "How does authentication work?"
        System provides: relevant code, docs, decisions, etc.
        """
        bundle = ContextBundle(task_id=f"query:{query}", task_title=query)

        query_lower = query.lower()

        # 1. Search semantic FS for relevant files
        if self.semantic_fs:
            results = self.semantic_fs.search(query)
            for metadata in results[:5]:  # Top 5 results
                bundle.add_item(ContextItem(
                    id=metadata.file_path,
                    type="file",
                    title=Path(metadata.file_path).name,
                    content=metadata.summary or "",
                    relevance_score=0.8,
                    source="semantic_fs",
                    metadata={"doc_type": metadata.document_type.value}
                ))

        # 2. Search intent graph for relevant nodes
        if self.intent_graph:
            for node in self.intent_graph.nodes.values():
                score = 0.0

                # Match against title
                if query_lower in node.title.lower():
                    score += 0.5

                # Match against description
                if query_lower in node.description.lower():
                    score += 0.3

                # Match against rationale
                if query_lower in node.rationale.lower():
                    score += 0.2

                if score > 0.3:
                    bundle.add_item(ContextItem(
                        id=node.id,
                        type=node.type.value,
                        title=node.title,
                        content=node.description,
                        relevance_score=score,
                        source="intent_graph",
                        metadata={"rationale": node.rationale}
                    ))

        return bundle

    def get_current_context(self) -> ContextBundle:
        """
        Get context for "right now" - what's currently being worked on?

        Looks at:
        - Active tasks in intent graph
        - Recently modified files
        - Current goals
        """
        bundle = ContextBundle(task_id="current", task_title="Current Context")

        # 1. Get active goals
        if self.intent_graph:
            active_goals = self.intent_graph.get_active_goals()
            for goal in active_goals:
                bundle.add_item(ContextItem(
                    id=goal.id,
                    type="active_goal",
                    title=goal.title,
                    content=goal.description,
                    relevance_score=1.0,
                    source="intent_graph",
                    metadata={"rationale": goal.rationale}
                ))

            # 2. Get blocked tasks (need attention!)
            blocked = self.intent_graph.get_blocked_tasks()
            for task in blocked:
                bundle.add_item(ContextItem(
                    id=task.id,
                    type="blocked_task",
                    title=task.title,
                    content=task.description,
                    relevance_score=0.95,
                    source="intent_graph",
                    metadata={"blocker_count": len(task.blocked_by_ids)}
                ))

        # 3. Get recently modified files
        if self.semantic_fs:
            recent_files = sorted(
                self.semantic_fs.files.values(),
                key=lambda x: x.modified_at,
                reverse=True
            )[:5]

            for metadata in recent_files:
                bundle.add_item(ContextItem(
                    id=metadata.file_path,
                    type="recent_file",
                    title=Path(metadata.file_path).name,
                    content=metadata.summary or "",
                    relevance_score=0.8,
                    source="semantic_fs",
                    metadata={"modified_at": metadata.modified_at.isoformat()}
                ))

        # 4. Get out-of-sync docs (need updating!)
        if self.doc_manager:
            out_of_sync = [
                doc for doc in self.doc_manager.documents.values()
                if doc.sync_status.value == "out_of_sync"
            ]

            for doc in out_of_sync[:3]:
                bundle.add_item(ContextItem(
                    id=doc.file_path,
                    type="stale_doc",
                    title=Path(doc.file_path).name,
                    content="Documentation out of sync with code",
                    relevance_score=0.9,
                    source="doc_manager"
                ))

        return bundle

    def suggest_next_actions(self, task_id: str) -> List[Dict[str, Any]]:
        """
        Based on context, suggest what to do next.

        This is proactive intelligence - the system suggests next steps!
        """
        suggestions = []

        if not self.intent_graph or task_id not in self.intent_graph.nodes:
            return suggestions

        task = self.intent_graph.nodes[task_id]

        # 1. If task has no linked artifacts, suggest creating them
        if not task.file_paths:
            suggestions.append({
                "action": "create_artifact",
                "description": "This task has no linked code or documentation. Consider creating or linking relevant files.",
                "priority": "medium"
            })

        # 2. If blocked, suggest addressing blockers
        if task.blocked_by_ids:
            suggestions.append({
                "action": "resolve_blockers",
                "description": f"This task is blocked by {len(task.blocked_by_ids)} items. Address blockers first.",
                "priority": "high"
            })

        # 3. If has children tasks, check their status
        if task.child_ids:
            children = [self.intent_graph.nodes[cid] for cid in task.child_ids if cid in self.intent_graph.nodes]
            pending_children = [c for c in children if c.status.value == "pending"]

            if pending_children:
                suggestions.append({
                    "action": "start_subtasks",
                    "description": f"{len(pending_children)} subtasks are pending. Start with highest priority.",
                    "priority": "medium"
                })

        # 4. Check if related docs are out of sync
        context = self.get_context_for_task(task_id)
        stale_docs = [item for item in context.items if item.type == "documentation"
                     and item.metadata.get("sync_status") == "out_of_sync"]

        if stale_docs:
            suggestions.append({
                "action": "update_docs",
                "description": f"{len(stale_docs)} related documents are out of sync. Update documentation.",
                "priority": "low"
            })

        return suggestions

    def export_context(self, bundle: ContextBundle, format: str = "markdown") -> str:
        """Export context bundle in a readable format"""
        if format == "markdown":
            output = f"# Context: {bundle.task_title}\n\n"
            output += f"*Generated at {bundle.created_at.strftime('%Y-%m-%d %H:%M')}*\n\n"

            # Group by type
            by_type: Dict[str, List[ContextItem]] = {}
            for item in bundle.get_top_items(20):
                if item.type not in by_type:
                    by_type[item.type] = []
                by_type[item.type].append(item)

            for item_type, items in by_type.items():
                output += f"## {item_type.replace('_', ' ').title()}\n\n"
                for item in items:
                    output += f"### {item.title}\n"
                    if item.content:
                        output += f"{item.content}\n"
                    output += f"\n*Relevance: {item.relevance_score:.2f} | Source: {item.source}*\n\n"

            return output

        elif format == "json":
            return json.dumps({
                "task_id": bundle.task_id,
                "task_title": bundle.task_title,
                "created_at": bundle.created_at.isoformat(),
                "items": [
                    {
                        "id": item.id,
                        "type": item.type,
                        "title": item.title,
                        "content": item.content,
                        "relevance_score": item.relevance_score,
                        "source": item.source,
                        "metadata": item.metadata
                    }
                    for item in bundle.items
                ]
            }, indent=2)

        return str(bundle)


# Example usage
if __name__ == "__main__":
    # This would be initialized with actual systems
    # engine = ContextEngine(intent_graph, semantic_fs, doc_manager)

    # Get context for a task
    # context = engine.get_context_for_task("task-123")
    # print(engine.export_context(context))

    # Get current context
    # current = engine.get_current_context()
    # print("Currently working on:")
    # for item in current.get_top_items(5):
    #     print(f"  - {item.title} ({item.type})")

    print("Context Engine initialized")
