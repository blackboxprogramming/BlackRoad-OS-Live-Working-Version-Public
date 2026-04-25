"""Capture and clustering models for chaotic inputs"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CaptureItem(Base):
    """Generic capture item that can represent notes, links, screenshots, etc."""

    __tablename__ = "capture_items"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), default="note", index=True)
    raw_content = Column(Text)
    source = Column(String(100), default="manual", index=True)
    tags = Column(JSON, default=list)
    related_to = Column(JSON, default=list)
    status = Column(String(50), default="inbox", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CaptureItem {self.id}:{self.type}>"


class CaptureCluster(Base):
    """Lightweight clustering container for captured items."""

    __tablename__ = "capture_clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    item_ids = Column(JSON, default=list)
    last_refreshed_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<CaptureCluster {self.name}>"
