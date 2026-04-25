"""File system models"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from app.database import Base


class Folder(Base):
    """Folder model"""

    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"))
    path = Column(String(1000), nullable=False)  # Full path for quick lookups

    is_shared = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class File(Base):
    """File model"""

    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"))

    name = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    path = Column(String(1000), nullable=False)

    # File metadata
    file_type = Column(String(100))  # MIME type
    extension = Column(String(20))
    size = Column(BigInteger, nullable=False)  # in bytes

    # Storage
    storage_key = Column(String(500), nullable=False)  # S3 key or local path
    storage_url = Column(String(1000))  # Public URL if available
    checksum = Column(String(64))  # SHA-256 hash

    # Sharing
    is_shared = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    share_token = Column(String(255), unique=True)

    # Metadata
    description = Column(Text)
    tags = Column(Text)  # Comma-separated

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))

    def __repr__(self):
        return f"<File {self.name}>"
