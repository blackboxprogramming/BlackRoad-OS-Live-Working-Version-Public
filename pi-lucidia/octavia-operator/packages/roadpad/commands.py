"""
RoadPad Commands - Command palette and keyboard shortcuts.

Commands can be invoked via:
- Keyboard shortcuts (Ctrl+key)
- Command palette (Ctrl+/)
- Direct typing (:command)
"""

from dataclasses import dataclass
from typing import Callable, Any


@dataclass
class Command:
    """A RoadPad command."""
    name: str
    description: str
    shortcut: str | None = None
    action: Callable[..., Any] | None = None
    category: str = "general"


class CommandRegistry:
    """Registry of all commands."""

    def __init__(self):
        self.commands: dict[str, Command] = {}
        self._init_defaults()

    def _init_defaults(self):
        """Register default commands."""
        # File commands
        self.register(Command("save", "Save current buffer", "Ctrl+S", category="file"))
        self.register(Command("open", "Open file", "Ctrl+O", category="file"))
        self.register(Command("new", "New buffer", "Ctrl+N", category="file"))
        self.register(Command("quit", "Quit RoadPad", "Ctrl+Q", category="file"))

        # Mode commands
        self.register(Command("prompt", "Switch to prompt mode", "Ctrl+P", category="mode"))
        self.register(Command("editor", "Switch to editor mode", "Ctrl+E", category="mode"))
        self.register(Command("command", "Open command palette", "Ctrl+/", category="mode"))

        # Circuit commands
        self.register(Command("circuit", "Switch circuit", None, category="circuit"))
        self.register(Command("circuit.auto", "Use auto circuit", "Ctrl+0", category="circuit"))
        self.register(Command("circuit.copilot", "Use Copilot", "Ctrl+1", category="circuit"))
        self.register(Command("circuit.local", "Use local Ollama", "Ctrl+2", category="circuit"))
        self.register(Command("circuit.cecilia", "Use Cecilia", "Ctrl+3", category="circuit"))
        self.register(Command("circuit.lucidia", "Use Lucidia", "Ctrl+4", category="circuit"))
        self.register(Command("circuit.refine", "Use refine chain", "Ctrl+5", category="circuit"))
        self.register(Command("circuit.consensus", "Use consensus", "Ctrl+6", category="circuit"))

        # Session commands
        self.register(Command("session.save", "Save session", None, category="session"))
        self.register(Command("session.load", "Load session", None, category="session"))
        self.register(Command("session.export", "Export as markdown", None, category="session"))
        self.register(Command("session.list", "List sessions", None, category="session"))

        # Tunnel commands
        self.register(Command("tunnel.status", "Show tunnel status", None, category="tunnel"))
        self.register(Command("tunnel.refresh", "Refresh tunnel status", None, category="tunnel"))

        # View commands
        self.register(Command("clear", "Clear buffer", None, category="view"))
        self.register(Command("scroll.top", "Scroll to top", "Ctrl+Home", category="view"))
        self.register(Command("scroll.bottom", "Scroll to bottom", "Ctrl+End", category="view"))

        # Edit commands
        self.register(Command("accept", "Cycle accept mode", "Shift+Tab", category="edit"))
        self.register(Command("undo", "Undo last change", "Ctrl+Z", category="edit"))

        # Help
        self.register(Command("help", "Show help", "F1", category="help"))
        self.register(Command("shortcuts", "Show keyboard shortcuts", None, category="help"))

    def register(self, command: Command) -> None:
        """Register a command."""
        self.commands[command.name] = command

    def get(self, name: str) -> Command | None:
        """Get command by name."""
        return self.commands.get(name)

    def search(self, query: str) -> list[Command]:
        """Search commands by name or description."""
        query = query.lower()
        results = []
        for cmd in self.commands.values():
            if query in cmd.name.lower() or query in cmd.description.lower():
                results.append(cmd)
        return sorted(results, key=lambda c: c.name)

    def by_category(self) -> dict[str, list[Command]]:
        """Group commands by category."""
        groups: dict[str, list[Command]] = {}
        for cmd in self.commands.values():
            if cmd.category not in groups:
                groups[cmd.category] = []
            groups[cmd.category].append(cmd)
        return groups

    def by_shortcut(self, shortcut: str) -> Command | None:
        """Find command by shortcut."""
        for cmd in self.commands.values():
            if cmd.shortcut == shortcut:
                return cmd
        return None

    def list_all(self) -> list[Command]:
        """List all commands."""
        return sorted(self.commands.values(), key=lambda c: c.name)

    def format_help(self) -> str:
        """Format help text."""
        lines = ["RoadPad Commands", "=" * 40, ""]

        for category, commands in sorted(self.by_category().items()):
            lines.append(f"[{category.upper()}]")
            for cmd in sorted(commands, key=lambda c: c.name):
                shortcut = f" ({cmd.shortcut})" if cmd.shortcut else ""
                lines.append(f"  :{cmd.name}{shortcut}")
                lines.append(f"    {cmd.description}")
            lines.append("")

        return "\n".join(lines)


# Key code mappings
KEY_BINDINGS = {
    # Ctrl+number for circuits
    48: "circuit.auto",     # Ctrl+0
    49: "circuit.copilot",  # Ctrl+1
    50: "circuit.local",    # Ctrl+2
    51: "circuit.cecilia",  # Ctrl+3
    52: "circuit.lucidia",  # Ctrl+4
    53: "circuit.refine",   # Ctrl+5
    54: "circuit.consensus", # Ctrl+6

    # Standard shortcuts
    19: "save",      # Ctrl+S
    17: "quit",      # Ctrl+Q
    16: "prompt",    # Ctrl+P
    15: "open",      # Ctrl+O
    14: "new",       # Ctrl+N
    5: "editor",     # Ctrl+E
    26: "undo",      # Ctrl+Z
    47: "command",   # Ctrl+/

    # Function keys
    265: "help",     # F1
}


# Global registry
_registry: CommandRegistry | None = None

def get_command_registry() -> CommandRegistry:
    """Get the global command registry."""
    global _registry
    if _registry is None:
        _registry = CommandRegistry()
    return _registry


def key_to_command(key: int) -> str | None:
    """Map key code to command name."""
    return KEY_BINDINGS.get(key)
