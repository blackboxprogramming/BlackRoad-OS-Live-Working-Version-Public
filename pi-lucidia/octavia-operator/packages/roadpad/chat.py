"""
RoadPad AI Chat Panel - Integrated AI conversation.

Features:
- Side panel chat
- Multiple providers
- Context from buffer
- Streaming responses
"""

import os
import json
import subprocess
from dataclasses import dataclass, field
from typing import List, Dict, Callable
from datetime import datetime


@dataclass
class ChatMessage:
    """A chat message."""
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    provider: str = ""
    tokens: int = 0


@dataclass
class ChatConversation:
    """A conversation thread."""
    id: str
    title: str = "New Chat"
    messages: List[ChatMessage] = field(default_factory=list)
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    provider: str = "copilot"

    def add_user_message(self, content: str) -> ChatMessage:
        """Add user message."""
        msg = ChatMessage(role="user", content=content)
        self.messages.append(msg)
        return msg

    def add_assistant_message(self, content: str, provider: str = "") -> ChatMessage:
        """Add assistant message."""
        msg = ChatMessage(role="assistant", content=content, provider=provider or self.provider)
        self.messages.append(msg)
        return msg

    def get_context_messages(self, n: int = 10) -> List[Dict]:
        """Get recent messages for context."""
        recent = self.messages[-n:]
        return [{"role": m.role, "content": m.content} for m in recent]

    def to_dict(self) -> Dict:
        """Convert to dict."""
        return {
            "id": self.id,
            "title": self.title,
            "messages": [
                {"role": m.role, "content": m.content, "timestamp": m.timestamp, "provider": m.provider}
                for m in self.messages
            ],
            "created": self.created,
            "provider": self.provider
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "ChatConversation":
        """Load from dict."""
        conv = cls(
            id=data["id"],
            title=data.get("title", "Chat"),
            created=data.get("created", ""),
            provider=data.get("provider", "copilot")
        )
        for m in data.get("messages", []):
            conv.messages.append(ChatMessage(
                role=m["role"],
                content=m["content"],
                timestamp=m.get("timestamp", ""),
                provider=m.get("provider", "")
            ))
        return conv


class ChatProvider:
    """Base chat provider."""

    def __init__(self, name: str):
        self.name = name

    def send(self, messages: List[Dict], on_token: Callable[[str], None] | None = None) -> str:
        """Send messages and get response."""
        raise NotImplementedError


class CopilotChatProvider(ChatProvider):
    """GitHub Copilot chat provider."""

    def __init__(self):
        super().__init__("copilot")

    def send(self, messages: List[Dict], on_token: Callable[[str], None] | None = None) -> str:
        """Send via gh copilot suggest."""
        # Build prompt from messages
        prompt = ""
        for msg in messages:
            if msg["role"] == "user":
                prompt = msg["content"]  # Use last user message

        try:
            result = subprocess.run(
                ["gh", "copilot", "suggest", "-t", "shell", prompt],
                capture_output=True,
                text=True,
                timeout=60
            )
            return result.stdout.strip() or result.stderr.strip()
        except Exception as e:
            return f"Error: {e}"


class OllamaChatProvider(ChatProvider):
    """Ollama chat provider."""

    def __init__(self, host: str = "localhost", port: int = 11434, model: str = "llama3.2"):
        super().__init__(f"ollama@{host}")
        self.host = host
        self.port = port
        self.model = model
        self.base_url = f"http://{host}:{port}"

    def send(self, messages: List[Dict], on_token: Callable[[str], None] | None = None) -> str:
        """Send via Ollama API."""
        import urllib.request
        import urllib.error

        data = json.dumps({
            "model": self.model,
            "messages": messages,
            "stream": False
        }).encode()

        try:
            req = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode())
                return result.get("message", {}).get("content", "")
        except Exception as e:
            return f"Error: {e}"


class ChatPanel:
    """Chat panel state and logic."""

    def __init__(self, chats_dir: str | None = None):
        self.chats_dir = chats_dir or os.path.expanduser("~/.roadpad/chats")
        os.makedirs(self.chats_dir, exist_ok=True)

        self.conversations: Dict[str, ChatConversation] = {}
        self.current_conversation_id: str = ""
        self.visible: bool = False
        self.width: int = 40  # Panel width
        self.scroll_offset: int = 0

        # Providers
        self.providers: Dict[str, ChatProvider] = {
            "copilot": CopilotChatProvider(),
            "ollama": OllamaChatProvider(),
            "cecilia": OllamaChatProvider(host="cecilia"),
            "lucidia": OllamaChatProvider(host="lucidia"),
        }
        self.current_provider: str = "copilot"

        # Input
        self.input_buffer: str = ""
        self.input_history: List[str] = []
        self.history_index: int = -1

        # Context
        self.buffer_context: str = ""

        self._load_conversations()

    def _load_conversations(self) -> None:
        """Load saved conversations."""
        if not os.path.exists(self.chats_dir):
            return

        for filename in os.listdir(self.chats_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.chats_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                    conv = ChatConversation.from_dict(data)
                    self.conversations[conv.id] = conv
                except:
                    pass

    def save_conversation(self, conv: ChatConversation) -> None:
        """Save conversation to disk."""
        filepath = os.path.join(self.chats_dir, f"{conv.id}.json")
        with open(filepath, "w") as f:
            json.dump(conv.to_dict(), f, indent=2)

    def new_conversation(self) -> ChatConversation:
        """Create new conversation."""
        import uuid
        conv_id = str(uuid.uuid4())[:8]
        conv = ChatConversation(id=conv_id, provider=self.current_provider)
        self.conversations[conv_id] = conv
        self.current_conversation_id = conv_id
        return conv

    @property
    def current_conversation(self) -> ChatConversation | None:
        """Get current conversation."""
        return self.conversations.get(self.current_conversation_id)

    def send_message(self, content: str, include_buffer: bool = False) -> str:
        """Send message and get response."""
        conv = self.current_conversation
        if not conv:
            conv = self.new_conversation()

        # Add context if requested
        if include_buffer and self.buffer_context:
            content = f"Context from editor:\n```\n{self.buffer_context}\n```\n\n{content}"

        # Add user message
        conv.add_user_message(content)

        # Save input to history
        self.input_history.append(content)
        self.history_index = -1

        # Get provider
        provider = self.providers.get(self.current_provider)
        if not provider:
            response = "Unknown provider"
        else:
            messages = conv.get_context_messages()
            response = provider.send(messages)

        # Add assistant message
        conv.add_assistant_message(response, self.current_provider)

        # Auto-title from first exchange
        if len(conv.messages) == 2:
            conv.title = content[:30] + ("..." if len(content) > 30 else "")

        # Save
        self.save_conversation(conv)

        return response

    def toggle(self) -> None:
        """Toggle panel visibility."""
        self.visible = not self.visible

    def show(self) -> None:
        """Show panel."""
        self.visible = True
        if not self.current_conversation_id:
            self.new_conversation()

    def hide(self) -> None:
        """Hide panel."""
        self.visible = False

    def set_buffer_context(self, text: str) -> None:
        """Set context from buffer."""
        self.buffer_context = text[:2000]  # Limit context

    def format_messages(self, height: int) -> List[str]:
        """Format messages for display."""
        lines = []
        conv = self.current_conversation

        if not conv:
            lines.append("No conversation")
            lines.append("")
            lines.append("Type to start chatting")
            return lines

        # Header
        lines.append(f"[{conv.provider}] {conv.title[:self.width-10]}")
        lines.append("─" * (self.width - 2))

        # Messages
        for msg in conv.messages:
            prefix = ">" if msg.role == "user" else "<"
            lines.append(f"{prefix} {msg.role}")

            # Word wrap content
            words = msg.content.split()
            current_line = "  "
            for word in words:
                if len(current_line) + len(word) + 1 > self.width - 2:
                    lines.append(current_line)
                    current_line = "  "
                current_line += word + " "
            if current_line.strip():
                lines.append(current_line)
            lines.append("")

        # Scroll
        if len(lines) > height - 3:
            lines = lines[-(height - 3):]

        return lines

    def format_input(self) -> str:
        """Format input line."""
        return f"> {self.input_buffer}"

    def list_conversations(self) -> List[ChatConversation]:
        """List all conversations."""
        return sorted(
            self.conversations.values(),
            key=lambda c: c.created,
            reverse=True
        )

    def switch_conversation(self, conv_id: str) -> bool:
        """Switch to conversation."""
        if conv_id in self.conversations:
            self.current_conversation_id = conv_id
            return True
        return False

    def delete_conversation(self, conv_id: str) -> bool:
        """Delete conversation."""
        if conv_id in self.conversations:
            del self.conversations[conv_id]
            filepath = os.path.join(self.chats_dir, f"{conv_id}.json")
            if os.path.exists(filepath):
                os.remove(filepath)
            if conv_id == self.current_conversation_id:
                self.current_conversation_id = ""
            return True
        return False


# Global panel
_panel: ChatPanel | None = None

def get_chat_panel() -> ChatPanel:
    """Get global chat panel."""
    global _panel
    if _panel is None:
        _panel = ChatPanel()
    return _panel
