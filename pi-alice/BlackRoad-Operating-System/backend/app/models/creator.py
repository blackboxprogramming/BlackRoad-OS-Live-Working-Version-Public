"""Creator workspace models"""
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base


class CreativeProject(Base):
    """Creative project container for creators"""

    __tablename__ = "creative_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(String(100), default="mixed")
    description = Column(Text)
    links_to_assets = Column(JSON, default=list)
    status = Column(String(50), default="idea")
    revenue_streams = Column(JSON, default=dict)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CreativeProject {self.title}>"
