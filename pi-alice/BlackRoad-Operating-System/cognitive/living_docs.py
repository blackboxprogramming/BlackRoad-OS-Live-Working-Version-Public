"""
Living Documents - Code-aware, self-updating documentation

The problem with traditional docs:
- They get out of sync with code
- They don't know what code they're documenting
- They can't update themselves
- They're disconnected from the actual system

Living Documents solve this by being:
- Code-aware: Understand what code they document
- Self-updating: Automatically update when code changes
- Context-linked: Connected to intent graph and semantic FS
- Smart: Know when they're out of date and need attention
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
import re
import ast
import json


class DocType(Enum):
    """Types of living documents"""
    API_REFERENCE = "api_reference"
    ARCHITECTURE = "architecture"
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    SPEC = "spec"
    README = "readme"
    CHANGELOG = "changelog"
    RUNBOOK = "runbook"


class SyncStatus(Enum):
    """Document sync status with code"""
    IN_SYNC = "in_sync"
    OUT_OF_SYNC = "out_of_sync"
    NEEDS_REVIEW = "needs_review"
    UNKNOWN = "unknown"


@dataclass
class CodeReference:
    """A reference to a piece of code"""
    file_path: str
    line_start: int
    line_end: int
    element_type: str  # function, class, method, variable, etc.
    element_name: str
    signature: Optional[str] = None
    docstring: Optional[str] = None
    last_modified: Optional[datetime] = None
    hash: Optional[str] = None  # Hash of the referenced code


@dataclass
class DocumentSection:
    """A section of a living document"""
    id: str
    title: str
    content: str
    code_references: List[CodeReference] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)
    auto_generated: bool = False  # Was this auto-generated from code?


class LivingDocument:
    """
    A document that knows what code it's documenting and can update itself.

    Key features:
    - Tracks which code it documents
    - Detects when code changes
    - Can auto-update based on code changes
    - Understands document structure
    - Links to intent graph (WHY this doc exists)
    """

    def __init__(self, file_path: str, doc_type: DocType = DocType.GUIDE):
        self.file_path = file_path
        self.doc_type = doc_type
        self.sections: List[DocumentSection] = []
        self.code_references: Set[str] = set()  # All files referenced
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
        self.last_sync_check = datetime.now()
        self.sync_status = SyncStatus.UNKNOWN
        self.intent_node_id: Optional[str] = None  # Link to intent graph
        self.metadata: Dict[str, Any] = {}

    def parse_document(self) -> None:
        """
        Parse the document and extract code references.

        Looks for patterns like:
        - `file.py:123` - reference to specific line
        - ```python ... ``` - code blocks
        - @ref(file.py:ClassName.method) - explicit references
        """
        if not Path(self.file_path).exists():
            return

        with open(self.file_path, 'r') as f:
            content = f.read()

        # Extract code references
        # Pattern: file_path:line_number
        refs = re.findall(r'`?([a-zA-Z0-9_/.-]+\.py):(\d+)`?', content)
        for file_path, line_num in refs:
            self.code_references.add(file_path)

        # Extract code blocks
        code_blocks = re.findall(r'```(\w+)?\n(.*?)```', content, re.DOTALL)

        # TODO: Parse document structure into sections
        # TODO: Link code blocks to actual files if possible

    def check_sync_status(self) -> SyncStatus:
        """
        Check if the document is in sync with the code it references.

        Returns:
        - IN_SYNC: All referenced code matches
        - OUT_OF_SYNC: Referenced code has changed
        - NEEDS_REVIEW: Can't determine automatically
        """
        if not self.code_references:
            return SyncStatus.UNKNOWN

        # Check if referenced files have been modified since last update
        for ref_file in self.code_references:
            if not Path(ref_file).exists():
                return SyncStatus.OUT_OF_SYNC

            file_mtime = datetime.fromtimestamp(Path(ref_file).stat().st_mtime)
            if file_mtime > self.last_updated:
                return SyncStatus.OUT_OF_SYNC

        return SyncStatus.IN_SYNC

    def extract_code_info(self, file_path: str) -> List[CodeReference]:
        """
        Extract information about code elements from a file.

        For Python files, this extracts:
        - Classes and their methods
        - Functions
        - Docstrings
        - Signatures
        """
        if not file_path.endswith('.py'):
            return []

        try:
            with open(file_path, 'r') as f:
                content = f.read()
                tree = ast.parse(content)
        except Exception:
            return []

        references = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                ref = CodeReference(
                    file_path=file_path,
                    line_start=node.lineno,
                    line_end=node.end_lineno or node.lineno,
                    element_type='function',
                    element_name=node.name,
                    signature=self._get_function_signature(node),
                    docstring=ast.get_docstring(node)
                )
                references.append(ref)

            elif isinstance(node, ast.ClassDef):
                ref = CodeReference(
                    file_path=file_path,
                    line_start=node.lineno,
                    line_end=node.end_lineno or node.lineno,
                    element_type='class',
                    element_name=node.name,
                    docstring=ast.get_docstring(node)
                )
                references.append(ref)

        return references

    def _get_function_signature(self, node: ast.FunctionDef) -> str:
        """Extract function signature from AST node"""
        args = []
        for arg in node.args.args:
            arg_str = arg.arg
            if arg.annotation:
                arg_str += f": {ast.unparse(arg.annotation)}"
            args.append(arg_str)

        return_type = ""
        if node.returns:
            return_type = f" -> {ast.unparse(node.returns)}"

        return f"{node.name}({', '.join(args)}){return_type}"

    def auto_generate_api_reference(self, code_file: str) -> str:
        """
        Auto-generate API reference documentation from code.

        This is the dream - docs that write themselves from code!
        """
        refs = self.extract_code_info(code_file)

        doc = f"# API Reference: {Path(code_file).stem}\n\n"
        doc += f"*Auto-generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"

        # Group by type
        classes = [r for r in refs if r.element_type == 'class']
        functions = [r for r in refs if r.element_type == 'function']

        if classes:
            doc += "## Classes\n\n"
            for cls in classes:
                doc += f"### `{cls.element_name}`\n\n"
                if cls.docstring:
                    doc += f"{cls.docstring}\n\n"
                doc += f"*Defined in `{cls.file_path}:{cls.line_start}`*\n\n"

        if functions:
            doc += "## Functions\n\n"
            for func in functions:
                doc += f"### `{func.signature}`\n\n"
                if func.docstring:
                    doc += f"{func.docstring}\n\n"
                doc += f"*Defined in `{func.file_path}:{func.line_start}`*\n\n"

        return doc

    def update_from_code(self, code_file: str) -> None:
        """
        Update this document based on changes in referenced code.

        This is where the "living" part comes in - the doc updates itself!
        """
        if self.doc_type == DocType.API_REFERENCE:
            new_content = self.auto_generate_api_reference(code_file)
            with open(self.file_path, 'w') as f:
                f.write(new_content)
            self.last_updated = datetime.now()
            self.sync_status = SyncStatus.IN_SYNC

    def add_code_reference(self, file_path: str, line_num: Optional[int] = None,
                          element_name: Optional[str] = None) -> str:
        """
        Add a reference to code in the document.

        Returns the markdown to insert in the document.
        """
        self.code_references.add(file_path)

        if element_name:
            return f"`{file_path}:{element_name}`"
        elif line_num:
            return f"`{file_path}:{line_num}`"
        else:
            return f"`{file_path}`"


class DocManager:
    """
    Manages all living documents in the system.

    Responsibilities:
    - Track all living documents
    - Monitor code changes
    - Trigger doc updates when code changes
    - Generate new docs from code
    - Keep docs in sync
    """

    def __init__(self, index_path: str = ".living_docs_index.json"):
        self.index_path = index_path
        self.documents: Dict[str, LivingDocument] = {}
        self.code_to_docs: Dict[str, Set[str]] = {}  # Maps code files to docs that reference them

    def register_document(self, doc: LivingDocument) -> None:
        """Register a living document"""
        self.documents[doc.file_path] = doc

        # Build reverse index: code file -> docs
        for code_file in doc.code_references:
            if code_file not in self.code_to_docs:
                self.code_to_docs[code_file] = set()
            self.code_to_docs[code_file].add(doc.file_path)

    def check_all_docs(self) -> List[LivingDocument]:
        """
        Check sync status of all documents.

        Returns list of out-of-sync documents.
        """
        out_of_sync = []
        for doc in self.documents.values():
            status = doc.check_sync_status()
            doc.sync_status = status
            doc.last_sync_check = datetime.now()

            if status == SyncStatus.OUT_OF_SYNC:
                out_of_sync.append(doc)

        return out_of_sync

    def on_code_change(self, code_file: str) -> List[str]:
        """
        Handle a code file change - find and update affected docs.

        Returns list of documents that were updated.
        """
        if code_file not in self.code_to_docs:
            return []

        updated_docs = []
        for doc_path in self.code_to_docs[code_file]:
            if doc_path in self.documents:
                doc = self.documents[doc_path]
                doc.sync_status = SyncStatus.OUT_OF_SYNC
                # Could auto-update here if configured
                updated_docs.append(doc_path)

        return updated_docs

    def generate_doc(self, doc_type: DocType, code_file: str,
                    output_path: str) -> LivingDocument:
        """
        Generate a new living document from code.

        This is the magic - auto-generating docs!
        """
        doc = LivingDocument(output_path, doc_type)

        if doc_type == DocType.API_REFERENCE:
            content = doc.auto_generate_api_reference(code_file)
            with open(output_path, 'w') as f:
                f.write(content)

        doc.code_references.add(code_file)
        self.register_document(doc)

        return doc

    def get_stale_docs(self, max_age_days: int = 30) -> List[LivingDocument]:
        """Find documents that haven't been updated in a while"""
        cutoff = datetime.now().timestamp() - (max_age_days * 24 * 60 * 60)
        stale = []

        for doc in self.documents.values():
            if doc.last_updated.timestamp() < cutoff:
                stale.append(doc)

        return stale

    def export_index(self) -> None:
        """Save the document index"""
        data = {
            'documents': {},
            'code_to_docs': {
                k: list(v) for k, v in self.code_to_docs.items()
            }
        }

        for path, doc in self.documents.items():
            data['documents'][path] = {
                'file_path': doc.file_path,
                'doc_type': doc.doc_type.value,
                'code_references': list(doc.code_references),
                'sync_status': doc.sync_status.value,
                'last_updated': doc.last_updated.isoformat(),
                'intent_node_id': doc.intent_node_id
            }

        with open(self.index_path, 'w') as f:
            json.dump(data, f, indent=2)


# Example usage
if __name__ == "__main__":
    # Create a document manager
    manager = DocManager()

    # Generate API docs from a code file
    # doc = manager.generate_doc(
    #     doc_type=DocType.API_REFERENCE,
    #     code_file="cognitive/intent_graph.py",
    #     output_path="docs/api/intent_graph.md"
    # )

    # Check all docs for sync status
    # out_of_sync = manager.check_all_docs()
    # if out_of_sync:
    #     print(f"Found {len(out_of_sync)} out-of-sync documents:")
    #     for doc in out_of_sync:
    #         print(f"  - {doc.file_path}")

    print("Living Documents system initialized")
