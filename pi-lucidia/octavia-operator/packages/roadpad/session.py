"""
RoadPad Session - History and state persistence.

Sessions store:
- Conversation history (prompts + responses)
- Current circuit
- Buffer state
- Timestamps
"""

import json
import os
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import List


@dataclass
class Exchange:
    """A single prompt/response exchange."""
    timestamp: str
    circuit: str
    prompt: str
    response: str


@dataclass
class Session:
    """A RoadPad session."""
    id: str
    created: str
    modified: str
    circuit: str = "auto"
    exchanges: List[Exchange] = field(default_factory=list)
    buffer_content: str = ""

    def add_exchange(self, circuit: str, prompt: str, response: str) -> None:
        """Record an exchange."""
        self.exchanges.append(Exchange(
            timestamp=datetime.now().isoformat(),
            circuit=circuit,
            prompt=prompt,
            response=response
        ))
        self.modified = datetime.now().isoformat()

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "created": self.created,
            "modified": self.modified,
            "circuit": self.circuit,
            "exchanges": [asdict(e) for e in self.exchanges],
            "buffer_content": self.buffer_content
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Session":
        """Create from dictionary."""
        exchanges = [Exchange(**e) for e in data.get("exchanges", [])]
        return cls(
            id=data["id"],
            created=data["created"],
            modified=data["modified"],
            circuit=data.get("circuit", "auto"),
            exchanges=exchanges,
            buffer_content=data.get("buffer_content", "")
        )

    def to_markdown(self) -> str:
        """Export session as markdown."""
        lines = [
            f"# RoadPad Session",
            f"",
            f"- **ID**: {self.id}",
            f"- **Created**: {self.created}",
            f"- **Circuit**: {self.circuit}",
            f"- **Exchanges**: {len(self.exchanges)}",
            f"",
            f"---",
            f""
        ]

        for i, ex in enumerate(self.exchanges, 1):
            lines.extend([
                f"## Exchange {i}",
                f"",
                f"**Circuit**: `{ex.circuit}` | **Time**: {ex.timestamp}",
                f"",
                f"### Prompt",
                f"```",
                ex.prompt,
                f"```",
                f"",
                f"### Response",
                f"```",
                ex.response,
                f"```",
                f"",
                f"---",
                f""
            ])

        return "\n".join(lines)


class SessionManager:
    """Manages session persistence."""

    def __init__(self, session_dir: str | None = None):
        self.session_dir = session_dir or os.path.expanduser("~/.roadpad/sessions")
        os.makedirs(self.session_dir, exist_ok=True)
        self.current: Session | None = None

    def new_session(self) -> Session:
        """Create a new session."""
        now = datetime.now()
        session_id = now.strftime("%Y%m%d_%H%M%S")
        self.current = Session(
            id=session_id,
            created=now.isoformat(),
            modified=now.isoformat()
        )
        return self.current

    def save(self, session: Session | None = None) -> str:
        """Save session to disk."""
        session = session or self.current
        if not session:
            return ""

        filepath = os.path.join(self.session_dir, f"{session.id}.json")
        with open(filepath, "w") as f:
            json.dump(session.to_dict(), f, indent=2)
        return filepath

    def load(self, session_id: str) -> Session | None:
        """Load session from disk."""
        filepath = os.path.join(self.session_dir, f"{session_id}.json")
        if not os.path.exists(filepath):
            return None

        with open(filepath, "r") as f:
            data = json.load(f)
        self.current = Session.from_dict(data)
        return self.current

    def list_sessions(self) -> list[tuple[str, str]]:
        """List all saved sessions (id, modified)."""
        sessions = []
        for filename in os.listdir(self.session_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.session_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                    sessions.append((data["id"], data["modified"]))
                except:
                    pass
        return sorted(sessions, key=lambda x: x[1], reverse=True)

    def export_markdown(self, session: Session | None = None) -> str:
        """Export session as markdown file."""
        session = session or self.current
        if not session:
            return ""

        filepath = os.path.join(self.session_dir, f"{session.id}.md")
        with open(filepath, "w") as f:
            f.write(session.to_markdown())
        return filepath

    def get_recent(self, n: int = 5) -> list[Session]:
        """Get n most recent sessions."""
        sessions = []
        for session_id, _ in self.list_sessions()[:n]:
            session = self.load(session_id)
            if session:
                sessions.append(session)
        return sessions


# Global manager
_manager: SessionManager | None = None

def get_session_manager() -> SessionManager:
    """Get the global session manager."""
    global _manager
    if _manager is None:
        _manager = SessionManager()
    return _manager
