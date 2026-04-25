"""
RoadPad Tab Completion - Smart completions.

Features:
- Path completion
- Word completion from buffer
- Command completion
- Circuit/tunnel completion
"""

import os
from dataclasses import dataclass
from typing import List, Set, Callable


@dataclass
class Completion:
    """A completion candidate."""
    text: str
    display: str = ""
    kind: str = ""  # 'path', 'word', 'command', 'circuit', 'snippet'
    score: int = 0

    def __post_init__(self):
        if not self.display:
            self.display = self.text


class CompletionEngine:
    """Provides completions for RoadPad."""

    def __init__(self):
        self.word_cache: Set[str] = set()
        self.min_word_length = 3
        self.max_completions = 20

        # Command completions
        self.commands = [
            ":w", ":q", ":wq", ":e", ":help", ":save", ":open",
            ":git", ":diff", ":log", ":commit", ":push", ":pull",
            ":search", ":replace", ":goto",
            ":macro", ":marks", ":snippets",
            ":circuit", ":tunnel", ":health"
        ]

        # Circuit names
        self.circuits = [
            "@auto", "@copilot", "@local", "@cecilia", "@lucidia",
            "@refine", "@consensus", "@review", "@echo", "@claude"
        ]

        # Snippet triggers
        self.snippets = [
            "exp", "sum", "rev", "fix", "imp", "tst", "doc",
            "pyfn", "pycls", "bash", "mddoc",
            "@", "note", "todo", "done",
            "h1", "h2", "div", "json", "yaml"
        ]

    def update_word_cache(self, lines: List[str]) -> None:
        """Update word cache from buffer."""
        self.word_cache.clear()
        for line in lines:
            words = self._extract_words(line)
            self.word_cache.update(words)

    def _extract_words(self, text: str) -> List[str]:
        """Extract words from text."""
        import re
        words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', text)
        return [w for w in words if len(w) >= self.min_word_length]

    def complete(self, prefix: str, context: str = "", lines: List[str] | None = None) -> List[Completion]:
        """Get completions for prefix."""
        completions: List[Completion] = []

        # Update word cache if lines provided
        if lines:
            self.update_word_cache(lines)

        # Path completion (if starts with / or ./ or ~/)
        if prefix.startswith(("/", "./", "~/")):
            completions.extend(self._complete_path(prefix))

        # Command completion (if starts with :)
        elif prefix.startswith(":"):
            completions.extend(self._complete_commands(prefix))

        # Circuit completion (if starts with @)
        elif prefix.startswith("@"):
            completions.extend(self._complete_circuits(prefix))

        # Word/snippet completion
        else:
            completions.extend(self._complete_words(prefix))
            completions.extend(self._complete_snippets(prefix))

        # Sort by score and limit
        completions.sort(key=lambda c: (-c.score, c.text))
        return completions[:self.max_completions]

    def _complete_path(self, prefix: str) -> List[Completion]:
        """Complete file paths."""
        completions = []

        # Expand ~
        expanded = os.path.expanduser(prefix)

        # Get directory and partial name
        if os.path.isdir(expanded):
            directory = expanded
            partial = ""
        else:
            directory = os.path.dirname(expanded)
            partial = os.path.basename(expanded)

        if not directory:
            directory = "."

        try:
            entries = os.listdir(directory)
            for entry in entries:
                if entry.startswith(".") and not partial.startswith("."):
                    continue
                if partial and not entry.lower().startswith(partial.lower()):
                    continue

                full_path = os.path.join(directory, entry)
                is_dir = os.path.isdir(full_path)

                # Reconstruct with original prefix style
                if prefix.startswith("~/"):
                    home = os.path.expanduser("~")
                    display_path = "~" + full_path[len(home):]
                else:
                    display_path = full_path

                if is_dir:
                    display_path += "/"

                completions.append(Completion(
                    text=display_path,
                    display=entry + ("/" if is_dir else ""),
                    kind="path",
                    score=10 if is_dir else 5
                ))
        except:
            pass

        return completions

    def _complete_commands(self, prefix: str) -> List[Completion]:
        """Complete commands."""
        completions = []
        prefix_lower = prefix.lower()

        for cmd in self.commands:
            if cmd.lower().startswith(prefix_lower):
                completions.append(Completion(
                    text=cmd,
                    kind="command",
                    score=20 if cmd == prefix else 15
                ))

        return completions

    def _complete_circuits(self, prefix: str) -> List[Completion]:
        """Complete circuit names."""
        completions = []
        prefix_lower = prefix.lower()

        for circuit in self.circuits:
            if circuit.lower().startswith(prefix_lower):
                completions.append(Completion(
                    text=circuit + " ",
                    display=circuit,
                    kind="circuit",
                    score=25
                ))

        return completions

    def _complete_words(self, prefix: str) -> List[Completion]:
        """Complete from word cache."""
        if len(prefix) < 2:
            return []

        completions = []
        prefix_lower = prefix.lower()

        for word in self.word_cache:
            if word.lower().startswith(prefix_lower) and word != prefix:
                # Score based on match quality
                score = 5
                if word.startswith(prefix):  # Exact case match
                    score = 10

                completions.append(Completion(
                    text=word,
                    kind="word",
                    score=score
                ))

        return completions

    def _complete_snippets(self, prefix: str) -> List[Completion]:
        """Complete snippet triggers."""
        completions = []
        prefix_lower = prefix.lower()

        for trigger in self.snippets:
            if trigger.lower().startswith(prefix_lower):
                completions.append(Completion(
                    text=trigger,
                    display=f"{trigger} (snippet)",
                    kind="snippet",
                    score=15
                ))

        return completions


class CompletionPopup:
    """Manages completion popup state."""

    def __init__(self, engine: CompletionEngine):
        self.engine = engine
        self.completions: List[Completion] = []
        self.selected_index: int = 0
        self.visible: bool = False
        self.prefix: str = ""
        self.start_col: int = 0

    def show(self, prefix: str, start_col: int, lines: List[str] | None = None) -> bool:
        """Show completions for prefix."""
        self.prefix = prefix
        self.start_col = start_col
        self.completions = self.engine.complete(prefix, lines=lines)
        self.selected_index = 0
        self.visible = bool(self.completions)
        return self.visible

    def hide(self) -> None:
        """Hide popup."""
        self.visible = False
        self.completions = []
        self.selected_index = 0

    def select_next(self) -> None:
        """Select next completion."""
        if self.completions:
            self.selected_index = (self.selected_index + 1) % len(self.completions)

    def select_prev(self) -> None:
        """Select previous completion."""
        if self.completions:
            self.selected_index = (self.selected_index - 1) % len(self.completions)

    def selected(self) -> Completion | None:
        """Get selected completion."""
        if self.visible and self.completions:
            return self.completions[self.selected_index]
        return None

    def accept(self) -> str | None:
        """Accept selected completion and return text to insert."""
        completion = self.selected()
        if completion:
            self.hide()
            # Return the part after prefix
            return completion.text[len(self.prefix):]
        return None

    def format_popup(self, max_height: int = 10) -> List[str]:
        """Format popup for display."""
        if not self.visible or not self.completions:
            return []

        lines = []
        visible_count = min(len(self.completions), max_height)

        # Scroll to keep selection visible
        start = 0
        if self.selected_index >= visible_count:
            start = self.selected_index - visible_count + 1

        for i in range(start, start + visible_count):
            if i >= len(self.completions):
                break
            c = self.completions[i]
            prefix = ">" if i == self.selected_index else " "
            kind_mark = {"path": "/", "command": ":", "circuit": "@", "word": "", "snippet": "*"}.get(c.kind, "")
            lines.append(f"{prefix}{kind_mark}{c.display}")

        return lines


# Global engine and popup
_engine: CompletionEngine | None = None
_popup: CompletionPopup | None = None

def get_completion_engine() -> CompletionEngine:
    """Get global completion engine."""
    global _engine
    if _engine is None:
        _engine = CompletionEngine()
    return _engine

def get_completion_popup() -> CompletionPopup:
    """Get global completion popup."""
    global _popup
    if _popup is None:
        _popup = CompletionPopup(get_completion_engine())
    return _popup
