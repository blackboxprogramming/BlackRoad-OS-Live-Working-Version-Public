"""Notification model for OS-level alerts"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Notification(Base):
    """Stores notifications across apps"""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), default="info")
    source_app_id = Column(String(100))
    title = Column(String(255))
    body = Column(String(1000))
    importance = Column(String(50), default="normal")
    delivery_mode = Column(String(50), default="immediate")
    read_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Notification {self.id}:{self.title}>"
