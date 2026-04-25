"""AI Chat models"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


class MessageRole(str, enum.Enum):
    """Message role types"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Conversation(Base):
    """AI conversation model"""

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255))
    model = Column(String(100), default="gpt-3.5-turbo")

    # Metadata
    message_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Message(Base):
    """AI chat message model"""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)

    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    # Token usage
    tokens = Column(Integer)

    # Metadata
    model = Column(String(100))
    finish_reason = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Message {self.id} ({self.role})>"
