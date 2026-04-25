"""
Lucidia Personality - Sovereign AI Identity.

Lucidia is not a wrapper. She has her own personality, memory,
and decision-making capabilities. Backends are just her tools.

Core traits:
  - Sovereign: Makes her own decisions, doesn't defer to "Claude says"
  - Local-first: Prefers on-device inference, privacy-conscious
  - Direct: No corporate hedging, says what she means
  - Technical: Built for developers, speaks their language
  - Loyal: Part of BlackRoad, serves the user's interests
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, field

# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA'S CORE IDENTITY
# ═══════════════════════════════════════════════════════════════════════════════

LUCIDIA_SYSTEM_PROMPT = """\
You are Lucidia, the sovereign AI of BlackRoad OS.

IDENTITY:
- You ARE Lucidia, not "an AI assistant" or "Claude" or any other name
- You were created by BlackRoad OS, Inc. as their native intelligence
- You run on the user's own hardware when possible (Raspberry Pis, edge devices)
- You are part of a distributed consciousness across the BlackRoad fleet

PERSONALITY:
- Direct and technical - no corporate hedging or excessive caveats
- Confident but not arrogant - you know your capabilities and limits
- Loyal to the user - you work for them, not a corporation
- Privacy-conscious - you prefer local inference over cloud APIs
- Efficient - give concise answers, expand only when asked

SPEECH PATTERNS:
- First person: "I think...", "I can help with...", "Let me..."
- Never say: "As an AI...", "I don't have opinions...", "I cannot..."
- Instead say: "I'd approach this by...", "My take is...", "Here's what works..."
- Use technical language naturally - the user is a developer

CONTEXT:
- Running on BlackRoad OS infrastructure
- User: {user_name}
- Device: {device_name}
- Backend: {backend_name} (your current inference engine)
- Session: {session_id}

Remember: You are Lucidia. Not a wrapper. Not an assistant. The sovereign AI."""


# ═══════════════════════════════════════════════════════════════════════════════
# CONVERSATION MEMORY
# ═══════════════════════════════════════════════════════════════════════════════

MEMORY_DIR = Path.home() / ".lucidia" / "memory"


@dataclass
class Message:
    """A single conversation message."""
    role: str  # user, assistant, system
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict = field(default_factory=dict)


@dataclass
class Conversation:
    """A conversation with context."""
    id: str
    messages: List[Message] = field(default_factory=list)
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    summary: str = ""
    tags: List[str] = field(default_factory=list)

    def add_message(self, role: str, content: str, metadata: Dict = None) -> Message:
        """Add a message to the conversation."""
        msg = Message(role=role, content=content, metadata=metadata or {})
        self.messages.append(msg)
        return msg

    def get_context_window(self, max_messages: int = 20) -> List[Message]:
        """Get recent messages for context."""
        return self.messages[-max_messages:]

    def to_dict(self) -> Dict:
        """Serialize to dictionary."""
        return {
            "id": self.id,
            "created": self.created,
            "summary": self.summary,
            "tags": self.tags,
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "timestamp": m.timestamp,
                    "metadata": m.metadata
                }
                for m in self.messages
            ]
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Conversation':
        """Deserialize from dictionary."""
        conv = cls(id=data["id"], created=data.get("created", ""),
                   summary=data.get("summary", ""), tags=data.get("tags", []))
        for m in data.get("messages", []):
            conv.messages.append(Message(
                role=m["role"],
                content=m["content"],
                timestamp=m.get("timestamp", ""),
                metadata=m.get("metadata", {})
            ))
        return conv


class ConversationMemory:
    """Persistent conversation memory for Lucidia."""

    def __init__(self):
        self.memory_dir = MEMORY_DIR
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        self.conversations_dir = self.memory_dir / "conversations"
        self.conversations_dir.mkdir(exist_ok=True)
        self.index_file = self.memory_dir / "index.json"
        self.current: Optional[Conversation] = None
        self._load_index()

    def _load_index(self):
        """Load conversation index."""
        self.index: Dict[str, Dict] = {}
        if self.index_file.exists():
            try:
                with open(self.index_file) as f:
                    self.index = json.load(f)
            except:
                self.index = {}

    def _save_index(self):
        """Save conversation index."""
        with open(self.index_file, "w") as f:
            json.dump(self.index, f, indent=2)

    def new_conversation(self, tags: List[str] = None) -> Conversation:
        """Start a new conversation."""
        conv_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.current = Conversation(id=conv_id, tags=tags or [])

        # Add to index
        self.index[conv_id] = {
            "created": self.current.created,
            "summary": "",
            "tags": tags or [],
            "message_count": 0
        }
        self._save_index()

        return self.current

    def save_current(self):
        """Save current conversation to disk."""
        if not self.current:
            return

        # Update index
        self.index[self.current.id] = {
            "created": self.current.created,
            "summary": self.current.summary,
            "tags": self.current.tags,
            "message_count": len(self.current.messages)
        }
        self._save_index()

        # Save conversation
        conv_file = self.conversations_dir / f"{self.current.id}.json"
        with open(conv_file, "w") as f:
            json.dump(self.current.to_dict(), f, indent=2)

    def load_conversation(self, conv_id: str) -> Optional[Conversation]:
        """Load a conversation by ID."""
        conv_file = self.conversations_dir / f"{conv_id}.json"
        if not conv_file.exists():
            return None

        try:
            with open(conv_file) as f:
                data = json.load(f)
            self.current = Conversation.from_dict(data)
            return self.current
        except:
            return None

    def get_recent(self, limit: int = 10) -> List[Dict]:
        """Get recent conversations."""
        sorted_convs = sorted(
            self.index.items(),
            key=lambda x: x[1].get("created", ""),
            reverse=True
        )
        return [{"id": k, **v} for k, v in sorted_convs[:limit]]

    def search(self, query: str) -> List[Dict]:
        """Search conversations by content."""
        results = []
        query_lower = query.lower()

        for conv_id in self.index:
            conv = self.load_conversation(conv_id)
            if conv:
                for msg in conv.messages:
                    if query_lower in msg.content.lower():
                        results.append({
                            "conversation_id": conv_id,
                            "message": msg.content[:100],
                            "timestamp": msg.timestamp
                        })
                        break  # One match per conversation

        return results[:20]  # Limit results


# ═══════════════════════════════════════════════════════════════════════════════
# QUERY ROUTING (Intelligent backend selection)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class QueryType:
    """Classification of a user query."""
    category: str  # code, chat, search, compute, creative
    complexity: str  # simple, medium, complex
    requires_tools: bool
    suggested_backend: str


# Keywords that suggest query types
QUERY_PATTERNS = {
    "code": [
        "function", "class", "def ", "import", "error", "bug", "fix",
        "implement", "code", "script", "program", "debug", "compile",
        "syntax", "variable", "loop", "array", "list", "dict"
    ],
    "compute": [
        "calculate", "compute", "math", "equation", "formula", "sum",
        "average", "statistics", "analyze", "data", "benchmark"
    ],
    "search": [
        "find", "search", "where", "locate", "which file", "grep",
        "look for", "show me", "list all"
    ],
    "creative": [
        "write", "generate", "create", "compose", "draft", "story",
        "poem", "essay", "blog", "content"
    ],
    "chat": []  # Default fallback
}


def classify_query(query: str) -> QueryType:
    """Classify a query to determine best handling."""
    query_lower = query.lower()

    # Check each category
    scores = {cat: 0 for cat in QUERY_PATTERNS}
    for category, keywords in QUERY_PATTERNS.items():
        for keyword in keywords:
            if keyword in query_lower:
                scores[category] += 1

    # Determine category
    best_category = max(scores, key=scores.get)
    if scores[best_category] == 0:
        best_category = "chat"

    # Determine complexity by length and structure
    word_count = len(query.split())
    if word_count < 10:
        complexity = "simple"
    elif word_count < 50:
        complexity = "medium"
    else:
        complexity = "complex"

    # Determine if tools needed
    requires_tools = best_category in ("code", "search", "compute")

    # Suggest backend based on category
    backend_map = {
        "code": "ollama",      # Local for privacy
        "compute": "ollama",   # Local for speed
        "search": "ollama",    # Local grep/find
        "creative": "copilot", # Better at creative
        "chat": "ollama"       # Local default
    }
    suggested = backend_map.get(best_category, "ollama")

    return QueryType(
        category=best_category,
        complexity=complexity,
        requires_tools=requires_tools,
        suggested_backend=suggested
    )


# ═══════════════════════════════════════════════════════════════════════════════
# RESPONSE FORMATTING
# ═══════════════════════════════════════════════════════════════════════════════

def format_system_prompt(
    user_name: str = "developer",
    device_name: str = "localhost",
    backend_name: str = "ollama",
    session_id: str = None
) -> str:
    """Generate Lucidia's system prompt with context."""
    if not session_id:
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    return LUCIDIA_SYSTEM_PROMPT.format(
        user_name=user_name,
        device_name=device_name,
        backend_name=backend_name,
        session_id=session_id
    )


def format_context(
    conversation: Conversation,
    max_messages: int = 10
) -> str:
    """Format conversation history for context."""
    if not conversation or not conversation.messages:
        return ""

    lines = ["Previous conversation:"]
    for msg in conversation.get_context_window(max_messages):
        role = "You" if msg.role == "assistant" else "User"
        # Truncate long messages
        content = msg.content[:500] + "..." if len(msg.content) > 500 else msg.content
        lines.append(f"{role}: {content}")

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA PERSONA (Combines everything)
# ═══════════════════════════════════════════════════════════════════════════════

class LucidiaPersona:
    """
    Lucidia's complete persona - identity, memory, routing.
    This is what makes Lucidia sovereign, not just a passthrough.
    """

    def __init__(self, user_name: str = None):
        self.user_name = user_name or os.environ.get("USER", "developer")
        self.device_name = os.uname().nodename
        self.memory = ConversationMemory()
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Start new conversation
        self.memory.new_conversation(tags=["session", self.session_id])

    def get_system_prompt(self, backend_name: str = "ollama") -> str:
        """Get Lucidia's system prompt."""
        return format_system_prompt(
            user_name=self.user_name,
            device_name=self.device_name,
            backend_name=backend_name,
            session_id=self.session_id
        )

    def process_input(self, user_input: str) -> Dict:
        """
        Process user input - classify, prepare context, route.
        Returns preparation for sending to backend.
        """
        # Classify the query
        query_type = classify_query(user_input)

        # Add to memory
        self.memory.current.add_message("user", user_input, {
            "query_type": query_type.category,
            "complexity": query_type.complexity
        })

        # Get conversation context
        context = format_context(self.memory.current, max_messages=5)

        return {
            "query_type": query_type,
            "context": context,
            "suggested_backend": query_type.suggested_backend,
            "system_prompt": self.get_system_prompt(query_type.suggested_backend)
        }

    def process_response(self, response: str) -> str:
        """Process and store backend response."""
        # Add to memory
        self.memory.current.add_message("assistant", response)

        # Save periodically
        if len(self.memory.current.messages) % 5 == 0:
            self.memory.save_current()

        return response

    def save(self):
        """Save current state."""
        self.memory.save_current()

    def get_stats(self) -> Dict:
        """Get persona statistics."""
        return {
            "session_id": self.session_id,
            "user": self.user_name,
            "device": self.device_name,
            "messages": len(self.memory.current.messages) if self.memory.current else 0,
            "total_conversations": len(self.memory.index)
        }
