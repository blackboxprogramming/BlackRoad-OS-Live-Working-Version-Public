"""Email models"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EmailFolderType(str, enum.Enum):
    """Email folder types"""
    INBOX = "inbox"
    SENT = "sent"
    DRAFTS = "drafts"
    SPAM = "spam"
    TRASH = "trash"
    CUSTOM = "custom"


class EmailFolder(Base):
    """Email folder model"""

    __tablename__ = "email_folders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    folder_type = Column(Enum(EmailFolderType), default=EmailFolderType.CUSTOM)
    icon = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Email(Base):
    """Email model"""

    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)

    # Sender/Receiver
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    sender_email = Column(String(255), nullable=False)
    sender_name = Column(String(255))

    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_email = Column(String(255), nullable=False)

    # CC/BCC
    cc = Column(Text)  # Comma-separated emails
    bcc = Column(Text)  # Comma-separated emails

    # Email content
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    html_body = Column(Text)

    # Metadata
    folder_id = Column(Integer, ForeignKey("email_folders.id", ondelete="SET NULL"))
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)

    # Attachments (stored as JSON array of file IDs)
    attachment_ids = Column(Text)

    # Thread
    thread_id = Column(String(255), index=True)
    in_reply_to = Column(Integer, ForeignKey("emails.id", ondelete="SET NULL"))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True))
    read_at = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<Email {self.id}: {self.subject}>"
