"""
Lucidia Context Engine - Intelligent context injection.

When you ask about code, Lucidia automatically reads relevant files
and includes them in her context. No need to manually paste code.

Features:
  - Detects file references in queries
  - Auto-reads referenced files
  - Manages context window size
  - Prioritizes most relevant content
"""

import os
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Set
from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════════════
# CONTEXT DETECTION
# ═══════════════════════════════════════════════════════════════════════════════

# Patterns that indicate file references
FILE_PATTERNS = [
    r'(?:in|from|file|read|open|look at|check|see|show)\s+["\']?([a-zA-Z0-9_\-./]+\.(?:py|js|ts|sh|md|json|yaml|yml|toml|txt|css|html))["\']?',
    r'([a-zA-Z0-9_\-./]+\.(?:py|js|ts|sh|md|json|yaml|yml|toml))\s+(?:file|code|script)',
    r'(?:the|this)\s+([a-zA-Z0-9_\-./]+\.(?:py|js|ts|sh|md))',
]

# Patterns that indicate function/class references
CODE_PATTERNS = [
    r'(?:function|method|def|class|const|var|let)\s+([a-zA-Z_][a-zA-Z0-9_]*)',
    r'([A-Z][a-zA-Z0-9_]*)\s+class',
    r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\(',  # function calls
]

# Keywords that suggest code-related queries
CODE_KEYWORDS = {
    'function', 'class', 'method', 'variable', 'import', 'export',
    'error', 'bug', 'fix', 'implement', 'refactor', 'optimize',
    'explain', 'how does', 'what does', 'why does', 'debug',
    'add', 'remove', 'change', 'modify', 'update', 'create',
}


@dataclass
class ContextItem:
    """A piece of context to include."""
    source: str  # filename or "search:pattern"
    content: str
    relevance: float  # 0-1, higher = more relevant
    line_count: int
    truncated: bool = False


@dataclass
class QueryAnalysis:
    """Analysis of a user query."""
    original: str
    file_refs: List[str]
    code_refs: List[str]
    is_code_query: bool
    keywords: Set[str]


def analyze_query(query: str) -> QueryAnalysis:
    """
    Analyze a query to detect what context might be needed.
    """
    query_lower = query.lower()

    # Find file references
    file_refs = []
    for pattern in FILE_PATTERNS:
        matches = re.findall(pattern, query, re.IGNORECASE)
        file_refs.extend(matches)

    # Find code references (function/class names)
    code_refs = []
    for pattern in CODE_PATTERNS:
        matches = re.findall(pattern, query)
        code_refs.extend(matches)

    # Check if this is a code-related query
    found_keywords = set()
    for keyword in CODE_KEYWORDS:
        if keyword in query_lower:
            found_keywords.add(keyword)

    is_code_query = bool(file_refs or code_refs or found_keywords)

    return QueryAnalysis(
        original=query,
        file_refs=list(set(file_refs)),
        code_refs=list(set(code_refs)),
        is_code_query=is_code_query,
        keywords=found_keywords
    )


# ═══════════════════════════════════════════════════════════════════════════════
# FILE READING
# ═══════════════════════════════════════════════════════════════════════════════

def read_file_for_context(
    filepath: str,
    max_lines: int = 100,
    focus_pattern: str = None
) -> Optional[ContextItem]:
    """
    Read a file for context injection.
    Optionally focus on lines matching a pattern.
    """
    try:
        path = Path(filepath).expanduser()

        # Try relative to cwd first
        if not path.is_absolute():
            cwd_path = Path.cwd() / filepath
            if cwd_path.exists():
                path = cwd_path

        if not path.exists():
            return None

        if not path.is_file():
            return None

        # Size check
        if path.stat().st_size > 500 * 1024:  # 500KB limit
            return None

        with open(path, 'r', errors='replace') as f:
            lines = f.readlines()

        total_lines = len(lines)
        truncated = False

        if focus_pattern:
            # Find lines matching pattern and include context
            matching_ranges = []
            for i, line in enumerate(lines):
                if re.search(focus_pattern, line, re.IGNORECASE):
                    start = max(0, i - 5)
                    end = min(len(lines), i + 15)
                    matching_ranges.append((start, end))

            # Merge overlapping ranges
            if matching_ranges:
                merged = [matching_ranges[0]]
                for start, end in matching_ranges[1:]:
                    if start <= merged[-1][1]:
                        merged[-1] = (merged[-1][0], max(merged[-1][1], end))
                    else:
                        merged.append((start, end))

                # Extract matched content
                content_parts = []
                for start, end in merged[:5]:  # Limit to 5 regions
                    content_parts.append(f"... (line {start + 1})")
                    content_parts.extend(lines[start:end])

                content = "".join(content_parts)
                truncated = len(merged) > 5 or sum(e-s for s, e in merged) > max_lines
            else:
                # No matches, fall back to head
                content = "".join(lines[:max_lines])
                truncated = total_lines > max_lines
        else:
            # Just read from beginning
            if total_lines > max_lines:
                content = "".join(lines[:max_lines])
                truncated = True
            else:
                content = "".join(lines)

        return ContextItem(
            source=str(path.name),
            content=content.rstrip(),
            relevance=1.0,
            line_count=total_lines,
            truncated=truncated
        )

    except Exception as e:
        return None


def find_definition(name: str, search_path: str = ".") -> Optional[ContextItem]:
    """
    Find a function/class definition in the codebase.
    """
    patterns = [
        rf'def\s+{re.escape(name)}\s*\(',
        rf'class\s+{re.escape(name)}\s*[:\(]',
        rf'function\s+{re.escape(name)}\s*\(',
        rf'const\s+{re.escape(name)}\s*=',
        rf'{re.escape(name)}\s*=\s*(?:function|async)',
    ]

    combined_pattern = '|'.join(patterns)

    try:
        for root, dirs, files in os.walk(search_path):
            # Skip hidden and common ignore dirs
            dirs[:] = [d for d in dirs if not d.startswith('.')
                      and d not in ['node_modules', '__pycache__', 'venv', '.git']]

            for filename in files:
                if not filename.endswith(('.py', '.js', '.ts', '.sh')):
                    continue

                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', errors='replace') as f:
                        content = f.read()

                    if re.search(combined_pattern, content):
                        # Found it - read with focus
                        return read_file_for_context(filepath, focus_pattern=combined_pattern)
                except:
                    continue

        return None

    except Exception:
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# CONTEXT BUILDER
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Context:
    """Built context for a query."""
    items: List[ContextItem] = field(default_factory=list)
    total_lines: int = 0
    sources: List[str] = field(default_factory=list)

    def to_prompt_prefix(self) -> str:
        """Format context as a prompt prefix."""
        if not self.items:
            return ""

        parts = ["Here is relevant context:\n"]

        for item in self.items:
            parts.append(f"\n--- {item.source} ---")
            if item.truncated:
                parts.append(f"(showing {item.line_count} lines, truncated)")
            parts.append(item.content)
            parts.append("--- end ---\n")

        parts.append("\nNow, regarding your question:\n")

        return "\n".join(parts)


class ContextBuilder:
    """
    Builds context for queries automatically.
    """

    def __init__(self, max_context_lines: int = 200):
        self.max_context_lines = max_context_lines
        self.cache: Dict[str, ContextItem] = {}  # Simple file cache

    def build(self, query: str) -> Tuple[Context, QueryAnalysis]:
        """
        Analyze query and build relevant context.
        """
        analysis = analyze_query(query)
        context = Context()

        if not analysis.is_code_query:
            return context, analysis

        remaining_lines = self.max_context_lines

        # 1. Read explicitly referenced files
        for file_ref in analysis.file_refs[:3]:  # Limit to 3 files
            item = self._get_file(file_ref, remaining_lines)
            if item:
                context.items.append(item)
                context.sources.append(item.source)
                remaining_lines -= len(item.content.split('\n'))
                if remaining_lines <= 0:
                    break

        # 2. Find referenced definitions
        if remaining_lines > 0:
            for code_ref in analysis.code_refs[:3]:  # Limit to 3 definitions
                if code_ref in [item.source for item in context.items]:
                    continue

                item = find_definition(code_ref)
                if item and item.source not in context.sources:
                    context.items.append(item)
                    context.sources.append(item.source)
                    remaining_lines -= len(item.content.split('\n'))
                    if remaining_lines <= 0:
                        break

        # Calculate total lines
        context.total_lines = sum(len(item.content.split('\n')) for item in context.items)

        return context, analysis

    def _get_file(self, filepath: str, max_lines: int) -> Optional[ContextItem]:
        """Get file from cache or read it."""
        cache_key = f"{filepath}:{max_lines}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        item = read_file_for_context(filepath, max_lines)
        if item:
            self.cache[cache_key] = item

        return item

    def clear_cache(self):
        """Clear the file cache."""
        self.cache.clear()

    def get_stats(self) -> Dict:
        """Get builder statistics."""
        return {
            "cached_files": len(self.cache),
            "max_context_lines": self.max_context_lines,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# CONTEXT MANAGER (combines everything)
# ═══════════════════════════════════════════════════════════════════════════════

class ContextManager:
    """
    Manages context injection for Lucidia.
    """

    def __init__(self, max_context_lines: int = 200, auto_inject: bool = True):
        self.builder = ContextBuilder(max_context_lines)
        self.auto_inject = auto_inject
        self.last_context: Optional[Context] = None
        self.last_analysis: Optional[QueryAnalysis] = None
        self.injections_count = 0

    def process_query(self, query: str) -> Tuple[str, bool]:
        """
        Process a query, potentially adding context.
        Returns (modified_query, was_context_added).
        """
        if not self.auto_inject:
            return query, False

        context, analysis = self.builder.build(query)
        self.last_context = context
        self.last_analysis = analysis

        if not context.items:
            return query, False

        # Inject context
        prefix = context.to_prompt_prefix()
        self.injections_count += 1

        return prefix + query, True

    def get_last_context_summary(self) -> str:
        """Get summary of last injected context."""
        if not self.last_context or not self.last_context.items:
            return "No context injected"

        lines = [f"Context injected ({self.last_context.total_lines} lines):"]
        for item in self.last_context.items:
            truncated = " (truncated)" if item.truncated else ""
            lines.append(f"  - {item.source}: {item.line_count} lines{truncated}")

        return "\n".join(lines)

    def toggle_auto(self) -> bool:
        """Toggle automatic context injection."""
        self.auto_inject = not self.auto_inject
        return self.auto_inject

    def get_stats(self) -> Dict:
        """Get context manager statistics."""
        return {
            "auto_inject": self.auto_inject,
            "injections_count": self.injections_count,
            "builder": self.builder.get_stats(),
        }
