"""Lightweight compliance and ops events"""
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class ComplianceEvent(Base):
    """Event log for compliance and ops visibility."""

    __tablename__ = "compliance_events"

    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(255))
    action = Column(String(255))
    resource = Column(String(255))
    event_metadata = Column("metadata", JSON, default=dict)
    severity = Column(String(50), default="info")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ComplianceEvent {self.action} by {self.actor}>"
