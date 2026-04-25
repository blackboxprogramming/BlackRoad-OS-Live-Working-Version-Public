"""
Cognitive Layer for BlackRoad OS

The missing layer that should have existed from day one.

This module integrates:
- Intent Graph: WHY things happen
- Semantic FS: WHAT files are and WHERE they belong
- Living Docs: Documentation that updates itself
- Context Engine: RIGHT information at the RIGHT time
- Agent Coordination: Multi-agent collaboration that works
- Smart Documents: OCR, ATS-friendly, auto-organizing documents
"""

from .intent_graph import IntentGraph, IntentNode, IntentType, IntentStatus
from .semantic_fs import SemanticFileSystem, DocumentType, DocumentPurpose
from .living_docs import DocManager, LivingDocument, DocType
from .context_engine import ContextEngine, ContextBundle, ContextItem
from .agent_coordination import AgentCoordinator, AgentInfo, AgentRole, Handoff
from .smart_documents import DocumentProcessor, SmartDocument, DocumentTemplate

__version__ = "0.1.0"

__all__ = [
    # Intent Graph
    'IntentGraph',
    'IntentNode',
    'IntentType',
    'IntentStatus',

    # Semantic FS
    'SemanticFileSystem',
    'DocumentType',
    'DocumentPurpose',

    # Living Docs
    'DocManager',
    'LivingDocument',
    'DocType',

    # Context Engine
    'ContextEngine',
    'ContextBundle',
    'ContextItem',

    # Agent Coordination
    'AgentCoordinator',
    'AgentInfo',
    'AgentRole',
    'Handoff',

    # Smart Documents
    'DocumentProcessor',
    'SmartDocument',
    'DocumentTemplate',

    # Main integration
    'CognitiveOS',
]


class CognitiveOS:
    """
    The Cognitive Operating System - integrates all cognitive components.

    This is the main entry point for using the cognitive layer.
    """

    def __init__(self, workspace_path: str = "."):
        """
        Initialize the Cognitive OS.

        Args:
            workspace_path: Root path for the workspace
        """
        # Initialize all systems
        self.intent_graph = IntentGraph()
        self.semantic_fs = SemanticFileSystem(f"{workspace_path}/.semantic_fs_index.json")
        self.doc_manager = DocManager(f"{workspace_path}/.living_docs_index.json")
        self.context_engine = ContextEngine(
            intent_graph=self.intent_graph,
            semantic_fs=self.semantic_fs,
            doc_manager=self.doc_manager
        )
        self.agent_coordinator = AgentCoordinator(
            intent_graph=self.intent_graph,
            context_engine=self.context_engine
        )
        self.doc_processor = DocumentProcessor(
            semantic_fs=self.semantic_fs,
            doc_manager=self.doc_manager,
            intent_graph=self.intent_graph
        )

        self.workspace_path = workspace_path

    def process_new_file(self, file_path: str) -> None:
        """
        Process a new file through the cognitive layer.

        This is the magic - a file gets:
        - Analyzed and classified (Semantic FS)
        - Auto-organized (suggested location)
        - Linked to intent (why does it exist?)
        - OCR'd if needed (Smart Docs)
        - Template-matched (Smart Docs)
        """
        # 1. Index in semantic FS
        metadata = self.semantic_fs.index_file(file_path)
        print(f"✓ Indexed: {metadata.document_type.value}")

        # 2. Suggest where it should go
        suggested_path = self.semantic_fs.suggest_location(file_path)
        print(f"✓ Suggested location: {suggested_path}")

        # 3. Process with smart docs if it's a document
        if metadata.document_type in [DocumentType.RESUME, DocumentType.BUSINESS_PLAN,
                                     DocumentType.MEETING_NOTES]:
            doc = self.doc_processor.process_document(file_path, auto_organize=False)
            print(f"✓ Processed with template: {doc.suggested_template.value if doc.suggested_template else 'none'}")

        print()

    def create_goal(self, title: str, description: str = "", rationale: str = "") -> IntentNode:
        """Create a new goal with full cognitive integration"""
        goal = self.intent_graph.create_goal(title, description, rationale)
        print(f"✓ Created goal: {title}")
        if rationale:
            print(f"  Why: {rationale}")
        return goal

    def create_task(self, title: str, goal_id: str = None, rationale: str = "") -> IntentNode:
        """Create a task linked to a goal"""
        task = self.intent_graph.create_task(title, parent_id=goal_id, rationale=rationale)
        print(f"✓ Created task: {title}")
        return task

    def get_context(self, query: str = None, task_id: str = None, file_path: str = None):
        """
        Get relevant context based on what you're asking about.

        This is the intelligence - provide the right info at the right time.
        """
        if query:
            return self.context_engine.get_context_for_query(query)
        elif task_id:
            return self.context_engine.get_context_for_task(task_id)
        elif file_path:
            return self.context_engine.get_context_for_file(file_path)
        else:
            return self.context_engine.get_current_context()

    def show_current_state(self) -> None:
        """Show the current state of the cognitive OS"""
        print("\n" + "=" * 60)
        print("COGNITIVE OS STATE")
        print("=" * 60)

        # Intent graph summary
        print("\n" + self.intent_graph.get_summary())

        # Active context
        print("\nCURRENT CONTEXT")
        print("-" * 60)
        current = self.context_engine.get_current_context()
        for item in current.get_top_items(5):
            print(f"  [{item.type}] {item.title} (relevance: {item.relevance_score:.2f})")

        # File system stats
        print("\nSEMANTIC FILE SYSTEM")
        print("-" * 60)
        print(f"  Indexed files: {len(self.semantic_fs.files)}")

        # Document stats
        print("\nLIVING DOCUMENTS")
        print("-" * 60)
        print(f"  Tracked documents: {len(self.doc_manager.documents)}")
        out_of_sync = self.doc_manager.check_all_docs()
        if out_of_sync:
            print(f"  ⚠ Out of sync: {len(out_of_sync)}")

        # Agent stats
        print("\nAGENT COORDINATION")
        print("-" * 60)
        print(f"  Registered agents: {len(self.agent_coordinator.agents)}")
        print(f"  Active sessions: {len(self.agent_coordinator.sessions)}")

        print("\n" + "=" * 60 + "\n")

    def export_all(self, export_dir: str = ".cognitive_export") -> None:
        """Export all cognitive data"""
        from pathlib import Path
        Path(export_dir).mkdir(exist_ok=True)

        # Export intent graph
        self.intent_graph.export_json(f"{export_dir}/intent_graph.json")

        # Export semantic FS
        self.semantic_fs.save_index()

        # Export living docs
        self.doc_manager.export_index()

        # Export agent coordination
        self.agent_coordinator.export_coordination_state(f"{export_dir}/agent_coordination.json")

        print(f"✓ Exported all cognitive data to {export_dir}/")


# Quick start example
def demo():
    """Demonstration of the Cognitive OS"""
    print("\n" + "=" * 60)
    print("COGNITIVE OS - DEMONSTRATION")
    print("=" * 60 + "\n")

    # Initialize
    cog = CognitiveOS()

    # Create a goal
    goal = cog.create_goal(
        title="Build a smart document management system",
        rationale="Current file management is chaos. Need semantic organization."
    )

    # Create tasks
    task1 = cog.create_task(
        "Implement OCR for document scanning",
        goal_id=goal.id,
        rationale="Extract structured data from PDFs"
    )

    task2 = cog.create_task(
        "Build auto-filing system",
        goal_id=goal.id,
        rationale="Documents should organize themselves"
    )

    # Show state
    cog.show_current_state()

    # Get context for the first task
    print("\nCONTEXT FOR: Implement OCR")
    print("-" * 60)
    context = cog.get_context(task_id=task1.id)
    for item in context.get_top_items(3):
        print(f"  [{item.type}] {item.title}")

    print("\n✓ Cognitive OS is ready!\n")


if __name__ == "__main__":
    demo()
