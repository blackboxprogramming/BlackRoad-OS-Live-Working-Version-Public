"""
Semantic File System - Auto-organizing file management

No more downloads folder chaos. Files organize themselves based on:
- Content (what's in them)
- Purpose (why they exist)
- Context (what they're related to)
- Usage patterns (how they're accessed)

This is what file management should have been from the start.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
import hashlib
import mimetypes
import json
import re


class DocumentType(Enum):
    """Semantic document types - not just file extensions"""
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    BUSINESS_PLAN = "business_plan"
    TECHNICAL_SPEC = "technical_spec"
    MEETING_NOTES = "meeting_notes"
    FINANCIAL_DOC = "financial_doc"
    CONTRACT = "contract"
    RESEARCH_PAPER = "research_paper"
    CODE = "code"
    DATA = "data"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    ARCHIVE = "archive"
    CONFIG = "config"
    DOCUMENTATION = "documentation"
    PRESENTATION = "presentation"
    SPREADSHEET = "spreadsheet"
    EMAIL = "email"
    CHAT_LOG = "chat_log"
    UNKNOWN = "unknown"


class DocumentPurpose(Enum):
    """Why does this document exist?"""
    REFERENCE = "reference"  # For looking things up
    ACTIVE_WORK = "active_work"  # Currently working on
    ARCHIVE = "archive"  # Historical record
    TEMPLATE = "template"  # To be copied/used as starting point
    COLLABORATION = "collaboration"  # Shared with others
    PERSONAL = "personal"  # Just for me
    DELIVERABLE = "deliverable"  # To be sent to someone
    INPUT = "input"  # Source material for something else
    OUTPUT = "output"  # Result of a process


@dataclass
class SemanticMetadata:
    """Rich metadata about a file"""
    # Basic info
    file_path: str
    file_hash: str
    file_size: int
    mime_type: str
    created_at: datetime
    modified_at: datetime
    last_accessed: datetime

    # Semantic classification
    document_type: DocumentType = DocumentType.UNKNOWN
    purpose: DocumentPurpose = DocumentPurpose.REFERENCE
    confidence: float = 0.0  # Confidence in classification

    # Content analysis
    title: Optional[str] = None
    summary: Optional[str] = None
    keywords: Set[str] = field(default_factory=set)
    entities: Dict[str, List[str]] = field(default_factory=dict)  # people, orgs, dates, etc.

    # Relationships
    related_files: Set[str] = field(default_factory=set)
    parent_project: Optional[str] = None
    tags: Set[str] = field(default_factory=set)

    # Usage patterns
    access_count: int = 0
    edit_count: int = 0
    share_count: int = 0

    # Intent graph link
    intent_node_ids: Set[str] = field(default_factory=set)

    # Custom metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            'file_path': self.file_path,
            'file_hash': self.file_hash,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'created_at': self.created_at.isoformat(),
            'modified_at': self.modified_at.isoformat(),
            'last_accessed': self.last_accessed.isoformat(),
            'document_type': self.document_type.value,
            'purpose': self.purpose.value,
            'confidence': self.confidence,
            'title': self.title,
            'summary': self.summary,
            'keywords': list(self.keywords),
            'entities': self.entities,
            'related_files': list(self.related_files),
            'parent_project': self.parent_project,
            'tags': list(self.tags),
            'access_count': self.access_count,
            'edit_count': self.edit_count,
            'share_count': self.share_count,
            'intent_node_ids': list(self.intent_node_ids),
            'metadata': self.metadata
        }


class SemanticFileSystem:
    """
    A file system that understands what files ARE, not just where they're stored.

    Key features:
    - Auto-classification based on content
    - Semantic search (find by purpose, not just name)
    - Auto-organization (files suggest where they belong)
    - Relationship tracking (what's related to what)
    - Intent-aware (files know why they exist)
    """

    def __init__(self, index_path: str = ".semantic_fs_index.json"):
        self.index_path = index_path
        self.files: Dict[str, SemanticMetadata] = {}
        self.load_index()

    def load_index(self):
        """Load the semantic index from disk"""
        try:
            if Path(self.index_path).exists():
                with open(self.index_path, 'r') as f:
                    # TODO: Implement full deserialization
                    pass
        except Exception as e:
            print(f"Error loading index: {e}")

    def save_index(self):
        """Save the semantic index to disk"""
        data = {
            'files': {
                path: metadata.to_dict()
                for path, metadata in self.files.items()
            }
        }
        with open(self.index_path, 'w') as f:
            json.dump(data, f, indent=2)

    def analyze_file(self, file_path: str) -> SemanticMetadata:
        """
        Analyze a file and extract semantic metadata.
        This is where the magic happens - understanding what a file IS.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Basic file info
        stat = path.stat()
        mime_type, _ = mimetypes.guess_type(file_path)

        # Compute hash
        with open(file_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        metadata = SemanticMetadata(
            file_path=str(path.absolute()),
            file_hash=file_hash,
            file_size=stat.st_size,
            mime_type=mime_type or "application/octet-stream",
            created_at=datetime.fromtimestamp(stat.st_ctime),
            modified_at=datetime.fromtimestamp(stat.st_mtime),
            last_accessed=datetime.fromtimestamp(stat.st_atime)
        )

        # Classify the document
        doc_type, confidence = self._classify_document(file_path, mime_type)
        metadata.document_type = doc_type
        metadata.confidence = confidence

        # Extract content if it's text-based
        if self._is_text_file(mime_type):
            content = self._extract_text(file_path)
            metadata.keywords = self._extract_keywords(content)
            metadata.entities = self._extract_entities(content)
            metadata.title = self._extract_title(content, path.name)
            metadata.summary = self._generate_summary(content)

        # Infer purpose based on location and type
        metadata.purpose = self._infer_purpose(file_path, doc_type)

        return metadata

    def _classify_document(self, file_path: str, mime_type: Optional[str]) -> tuple[DocumentType, float]:
        """
        Classify document based on content and structure.
        Returns (DocumentType, confidence_score)
        """
        path = Path(file_path)
        extension = path.suffix.lower()

        # Extension-based classification (basic)
        ext_map = {
            '.py': DocumentType.CODE,
            '.js': DocumentType.CODE,
            '.ts': DocumentType.CODE,
            '.java': DocumentType.CODE,
            '.cpp': DocumentType.CODE,
            '.c': DocumentType.CODE,
            '.rs': DocumentType.CODE,
            '.go': DocumentType.CODE,
            '.pdf': DocumentType.UNKNOWN,  # Need content analysis
            '.docx': DocumentType.UNKNOWN,  # Need content analysis
            '.doc': DocumentType.UNKNOWN,
            '.txt': DocumentType.UNKNOWN,
            '.md': DocumentType.DOCUMENTATION,
            '.csv': DocumentType.DATA,
            '.json': DocumentType.DATA,
            '.xml': DocumentType.DATA,
            '.yaml': DocumentType.CONFIG,
            '.yml': DocumentType.CONFIG,
            '.png': DocumentType.IMAGE,
            '.jpg': DocumentType.IMAGE,
            '.jpeg': DocumentType.IMAGE,
            '.gif': DocumentType.IMAGE,
            '.mp4': DocumentType.VIDEO,
            '.mp3': DocumentType.AUDIO,
            '.zip': DocumentType.ARCHIVE,
            '.tar': DocumentType.ARCHIVE,
            '.gz': DocumentType.ARCHIVE,
            '.pptx': DocumentType.PRESENTATION,
            '.xlsx': DocumentType.SPREADSHEET,
        }

        if extension in ext_map:
            doc_type = ext_map[extension]
            if doc_type != DocumentType.UNKNOWN:
                return doc_type, 0.8

        # Content-based classification for unknown types
        if self._is_text_file(mime_type):
            content = self._extract_text(file_path)
            return self._classify_by_content(content, path.name)

        return DocumentType.UNKNOWN, 0.0

    def _classify_by_content(self, content: str, filename: str) -> tuple[DocumentType, float]:
        """Classify document by analyzing its content"""
        content_lower = content.lower()
        filename_lower = filename.lower()

        # Resume detection
        resume_keywords = ['resume', 'curriculum vitae', 'cv', 'experience', 'education', 'skills']
        resume_score = sum(1 for kw in resume_keywords if kw in content_lower or kw in filename_lower)
        if resume_score >= 3:
            return DocumentType.RESUME, min(0.9, 0.3 * resume_score)

        # Cover letter
        if ('dear' in content_lower and 'sincerely' in content_lower) or 'cover letter' in filename_lower:
            return DocumentType.COVER_LETTER, 0.7

        # Business plan
        business_keywords = ['executive summary', 'market analysis', 'financial projections', 'business model']
        if sum(1 for kw in business_keywords if kw in content_lower) >= 2:
            return DocumentType.BUSINESS_PLAN, 0.8

        # Technical spec
        tech_keywords = ['architecture', 'requirements', 'specification', 'api', 'implementation']
        if sum(1 for kw in tech_keywords if kw in content_lower) >= 2:
            return DocumentType.TECHNICAL_SPEC, 0.7

        # Meeting notes
        meeting_keywords = ['meeting', 'attendees', 'action items', 'agenda']
        if sum(1 for kw in meeting_keywords if kw in content_lower) >= 2:
            return DocumentType.MEETING_NOTES, 0.7

        return DocumentType.UNKNOWN, 0.0

    def _infer_purpose(self, file_path: str, doc_type: DocumentType) -> DocumentPurpose:
        """Infer why this file exists based on location and type"""
        path = Path(file_path)
        path_lower = str(path).lower()

        # Location-based inference
        if 'download' in path_lower:
            return DocumentPurpose.INPUT
        if 'archive' in path_lower or 'backup' in path_lower:
            return DocumentPurpose.ARCHIVE
        if 'template' in path_lower:
            return DocumentPurpose.TEMPLATE
        if 'draft' in path_lower or 'wip' in path_lower:
            return DocumentPurpose.ACTIVE_WORK
        if 'output' in path_lower or 'export' in path_lower:
            return DocumentPurpose.OUTPUT

        # Type-based inference
        if doc_type == DocumentType.RESUME:
            return DocumentPurpose.DELIVERABLE
        if doc_type == DocumentType.TEMPLATE:
            return DocumentPurpose.TEMPLATE
        if doc_type == DocumentType.MEETING_NOTES:
            return DocumentPurpose.REFERENCE

        return DocumentPurpose.REFERENCE

    def _is_text_file(self, mime_type: Optional[str]) -> bool:
        """Check if file is text-based"""
        if not mime_type:
            return False
        return mime_type.startswith('text/') or mime_type in [
            'application/json',
            'application/xml',
            'application/javascript'
        ]

    def _extract_text(self, file_path: str) -> str:
        """Extract text content from file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception:
            return ""

    def _extract_keywords(self, content: str, max_keywords: int = 20) -> Set[str]:
        """Extract important keywords from content"""
        # Simple keyword extraction - in production, use TF-IDF or similar
        words = re.findall(r'\b[a-z]{4,}\b', content.lower())

        # Remove common words
        stop_words = {'that', 'this', 'with', 'from', 'have', 'been', 'will', 'your', 'their'}
        words = [w for w in words if w not in stop_words]

        # Count frequency
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Get top keywords
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:max_keywords]
        return set(word for word, _ in top_words)

    def _extract_entities(self, content: str) -> Dict[str, List[str]]:
        """Extract named entities (people, places, orgs, dates, etc.)"""
        # Simplified entity extraction - in production, use NER
        entities = {
            'emails': [],
            'urls': [],
            'dates': [],
            'phone_numbers': []
        }

        # Extract emails
        entities['emails'] = re.findall(r'\b[\w.-]+@[\w.-]+\.\w+\b', content)

        # Extract URLs
        entities['urls'] = re.findall(r'https?://[^\s]+', content)

        # Extract dates (simple patterns)
        entities['dates'] = re.findall(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', content)

        # Extract phone numbers (simple pattern)
        entities['phone_numbers'] = re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', content)

        return entities

    def _extract_title(self, content: str, filename: str) -> str:
        """Extract or infer document title"""
        lines = content.split('\n')

        # Look for common title patterns
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if not line:
                continue

            # Markdown heading
            if line.startswith('# '):
                return line[2:].strip()

            # If it's a short line at the start, might be a title
            if len(line) < 100 and len(line) > 5:
                return line

        # Fall back to filename
        return Path(filename).stem.replace('_', ' ').replace('-', ' ').title()

    def _generate_summary(self, content: str, max_length: int = 200) -> str:
        """Generate a brief summary of the content"""
        # Simple summary - first few sentences
        sentences = re.split(r'[.!?]+', content)
        summary = ""
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            if len(summary) + len(sentence) > max_length:
                break
            summary += sentence + ". "
        return summary.strip()

    def index_file(self, file_path: str) -> SemanticMetadata:
        """Index a file in the semantic file system"""
        metadata = self.analyze_file(file_path)
        self.files[metadata.file_path] = metadata
        self.save_index()
        return metadata

    def search(self, query: str, filters: Optional[Dict] = None) -> List[SemanticMetadata]:
        """
        Semantic search - find files by content, purpose, type, etc.
        Not just filename matching!
        """
        results = []
        query_lower = query.lower()

        for metadata in self.files.values():
            score = 0.0

            # Match against title
            if metadata.title and query_lower in metadata.title.lower():
                score += 2.0

            # Match against keywords
            if any(query_lower in kw for kw in metadata.keywords):
                score += 1.5

            # Match against summary
            if metadata.summary and query_lower in metadata.summary.lower():
                score += 1.0

            # Match against filename
            if query_lower in Path(metadata.file_path).name.lower():
                score += 0.5

            # Apply filters
            if filters:
                if 'document_type' in filters and metadata.document_type != filters['document_type']:
                    continue
                if 'purpose' in filters and metadata.purpose != filters['purpose']:
                    continue
                if 'tags' in filters and not set(filters['tags']).intersection(metadata.tags):
                    continue

            if score > 0:
                results.append((metadata, score))

        # Sort by score
        results.sort(key=lambda x: x[1], reverse=True)
        return [metadata for metadata, _ in results]

    def suggest_location(self, file_path: str) -> str:
        """
        Suggest where a file should be organized.
        This solves the "downloads folder chaos" problem.
        """
        metadata = self.analyze_file(file_path)

        # Base directory structure
        base_map = {
            DocumentType.RESUME: "documents/career/resumes",
            DocumentType.COVER_LETTER: "documents/career/cover_letters",
            DocumentType.BUSINESS_PLAN: "documents/business",
            DocumentType.TECHNICAL_SPEC: "documents/technical",
            DocumentType.MEETING_NOTES: "documents/meetings",
            DocumentType.FINANCIAL_DOC: "documents/financial",
            DocumentType.CONTRACT: "documents/legal",
            DocumentType.CODE: "code",
            DocumentType.DATA: "data",
            DocumentType.IMAGE: "media/images",
            DocumentType.VIDEO: "media/videos",
            DocumentType.AUDIO: "media/audio",
            DocumentType.DOCUMENTATION: "docs",
            DocumentType.PRESENTATION: "documents/presentations",
            DocumentType.SPREADSHEET: "documents/spreadsheets",
        }

        base_dir = base_map.get(metadata.document_type, "misc")

        # Add purpose subdirectory
        if metadata.purpose == DocumentPurpose.ARCHIVE:
            base_dir += "/archive"
        elif metadata.purpose == DocumentPurpose.TEMPLATE:
            base_dir += "/templates"
        elif metadata.purpose == DocumentPurpose.ACTIVE_WORK:
            base_dir += "/active"

        # Add project subdirectory if applicable
        if metadata.parent_project:
            base_dir += f"/{metadata.parent_project}"

        filename = Path(file_path).name
        return f"{base_dir}/{filename}"

    def auto_organize(self, file_path: str, dry_run: bool = True) -> str:
        """
        Automatically organize a file based on its semantic classification.

        dry_run=True: Just return where it should go
        dry_run=False: Actually move the file
        """
        suggested_path = self.suggest_location(file_path)

        if not dry_run:
            # Create directory if needed
            Path(suggested_path).parent.mkdir(parents=True, exist_ok=True)

            # Move the file
            Path(file_path).rename(suggested_path)

            # Update index
            if file_path in self.files:
                metadata = self.files.pop(file_path)
                metadata.file_path = suggested_path
                self.files[suggested_path] = metadata
                self.save_index()

        return suggested_path


# Example usage
if __name__ == "__main__":
    sfs = SemanticFileSystem()

    # Example: Analyze a resume
    # metadata = sfs.index_file("~/Downloads/john_doe_resume.pdf")
    # print(f"Document type: {metadata.document_type}")
    # print(f"Suggested location: {sfs.suggest_location('~/Downloads/john_doe_resume.pdf')}")

    # Example: Search for all resumes
    # resumes = sfs.search("", filters={'document_type': DocumentType.RESUME})
    # for resume in resumes:
    #     print(f"Found resume: {resume.title} at {resume.file_path}")

    print("Semantic File System initialized")
