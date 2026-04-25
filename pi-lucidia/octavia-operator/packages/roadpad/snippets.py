"""
RoadPad Snippets - Quick insert templates.

Features:
- Predefined snippets
- Custom snippets
- Variable expansion
- Tab stops
"""

import os
import json
from dataclasses import dataclass, field
from typing import Dict, List
from datetime import datetime


@dataclass
class Snippet:
    """A snippet template."""
    name: str
    trigger: str
    content: str
    description: str = ""
    category: str = "general"

    def expand(self, variables: Dict[str, str] | None = None) -> str:
        """Expand snippet with variables."""
        text = self.content
        vars = variables or {}

        # Built-in variables
        now = datetime.now()
        builtins = {
            "$DATE": now.strftime("%Y-%m-%d"),
            "$TIME": now.strftime("%H:%M:%S"),
            "$DATETIME": now.isoformat(),
            "$USER": os.environ.get("USER", "user"),
            "$HOME": os.path.expanduser("~"),
            "$CWD": os.getcwd(),
        }

        # Apply built-ins
        for key, value in builtins.items():
            text = text.replace(key, value)

        # Apply custom variables
        for key, value in vars.items():
            text = text.replace(f"${key}", value)
            text = text.replace(f"${{{key}}}", value)

        return text


class SnippetManager:
    """Manages snippets."""

    def __init__(self, snippets_dir: str | None = None):
        self.snippets_dir = snippets_dir or os.path.expanduser("~/.roadpad/snippets")
        os.makedirs(self.snippets_dir, exist_ok=True)
        self.snippets: Dict[str, Snippet] = {}
        self._init_defaults()
        self._load_custom()

    def _init_defaults(self):
        """Initialize default snippets."""
        defaults = [
            # Prompts
            Snippet("explain", "exp", "Explain $1 in simple terms.", "Explain concept", "prompt"),
            Snippet("summarize", "sum", "Summarize the following:\n\n$1", "Summarize text", "prompt"),
            Snippet("review", "rev", "Review this code for issues:\n\n```\n$1\n```", "Code review", "prompt"),
            Snippet("fix", "fix", "Fix this error:\n\n$1", "Fix error", "prompt"),
            Snippet("improve", "imp", "Improve this code:\n\n```\n$1\n```", "Improve code", "prompt"),
            Snippet("test", "tst", "Write tests for:\n\n```\n$1\n```", "Write tests", "prompt"),
            Snippet("document", "doc", "Write documentation for:\n\n```\n$1\n```", "Write docs", "prompt"),

            # Code templates
            Snippet("python_func", "pyfn",
                    "def $1($2):\n    \"\"\"$3\"\"\"\n    $0",
                    "Python function", "code"),
            Snippet("python_class", "pycls",
                    "class $1:\n    \"\"\"$2\"\"\"\n\n    def __init__(self$3):\n        $0",
                    "Python class", "code"),
            Snippet("bash_script", "bash",
                    "#!/bin/bash\n# $1\n\nset -e\n\n$0",
                    "Bash script", "code"),
            Snippet("markdown_doc", "mddoc",
                    "# $1\n\n## Overview\n\n$2\n\n## Usage\n\n```\n$3\n```\n\n## $0",
                    "Markdown doc", "code"),

            # RoadPad specific
            Snippet("circuit_switch", "@", "@$1 ", "Switch circuit", "roadpad"),
            Snippet("session_note", "note", "---\n[Note: $DATE $TIME]\n$1\n---", "Add note", "roadpad"),
            Snippet("todo", "todo", "- [ ] $1", "Add todo", "roadpad"),
            Snippet("done", "done", "- [x] $1 ($DATE)", "Mark done", "roadpad"),

            # Headers
            Snippet("header_section", "h1", "═" * 40 + "\n$1\n" + "═" * 40, "Section header", "format"),
            Snippet("header_sub", "h2", "─" * 40 + "\n$1\n" + "─" * 40, "Sub header", "format"),
            Snippet("divider", "div", "─" * 60, "Divider line", "format"),

            # Common patterns
            Snippet("json_obj", "json", '{\n  "$1": $2\n}', "JSON object", "data"),
            Snippet("yaml_block", "yaml", "$1:\n  $2: $3", "YAML block", "data"),
        ]

        for snippet in defaults:
            self.snippets[snippet.trigger] = snippet

    def _load_custom(self):
        """Load custom snippets from disk."""
        custom_file = os.path.join(self.snippets_dir, "custom.json")
        if os.path.exists(custom_file):
            try:
                with open(custom_file, "r") as f:
                    data = json.load(f)
                for item in data:
                    snippet = Snippet(**item)
                    self.snippets[snippet.trigger] = snippet
            except:
                pass

    def save_custom(self):
        """Save custom snippets to disk."""
        custom = [s for s in self.snippets.values() if s.category == "custom"]
        custom_file = os.path.join(self.snippets_dir, "custom.json")
        with open(custom_file, "w") as f:
            json.dump([{
                "name": s.name,
                "trigger": s.trigger,
                "content": s.content,
                "description": s.description,
                "category": "custom"
            } for s in custom], f, indent=2)

    def get(self, trigger: str) -> Snippet | None:
        """Get snippet by trigger."""
        return self.snippets.get(trigger)

    def add(self, name: str, trigger: str, content: str, description: str = "") -> None:
        """Add custom snippet."""
        self.snippets[trigger] = Snippet(
            name=name,
            trigger=trigger,
            content=content,
            description=description,
            category="custom"
        )
        self.save_custom()

    def remove(self, trigger: str) -> bool:
        """Remove snippet."""
        if trigger in self.snippets:
            del self.snippets[trigger]
            self.save_custom()
            return True
        return False

    def search(self, query: str) -> List[Snippet]:
        """Search snippets."""
        query = query.lower()
        return [
            s for s in self.snippets.values()
            if query in s.name.lower() or query in s.trigger.lower() or query in s.description.lower()
        ]

    def by_category(self) -> Dict[str, List[Snippet]]:
        """Group snippets by category."""
        groups: Dict[str, List[Snippet]] = {}
        for snippet in self.snippets.values():
            if snippet.category not in groups:
                groups[snippet.category] = []
            groups[snippet.category].append(snippet)
        return groups

    def list_triggers(self) -> List[str]:
        """List all triggers."""
        return sorted(self.snippets.keys())

    def expand_if_trigger(self, text: str, variables: Dict[str, str] | None = None) -> str | None:
        """Check if text ends with a trigger and expand it."""
        for trigger, snippet in self.snippets.items():
            if text.endswith(trigger):
                prefix = text[:-len(trigger)]
                return prefix + snippet.expand(variables)
        return None

    def format_list(self) -> str:
        """Format snippet list for display."""
        lines = ["Snippets", "=" * 40, ""]

        for category, snippets in sorted(self.by_category().items()):
            lines.append(f"[{category.upper()}]")
            for s in sorted(snippets, key=lambda x: x.trigger):
                lines.append(f"  {s.trigger:10} → {s.description or s.name}")
            lines.append("")

        return "\n".join(lines)


# Global manager
_manager: SnippetManager | None = None

def get_snippet_manager() -> SnippetManager:
    """Get global snippet manager."""
    global _manager
    if _manager is None:
        _manager = SnippetManager()
    return _manager
