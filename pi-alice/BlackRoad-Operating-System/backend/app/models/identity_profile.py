"""Identity profile model centralizing user fields"""
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import Base


class UserProfile(Base):
    """Canonical user profile stored once per account."""

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(255))
    legal_name = Column(String(255))
    email = Column(String(255))
    secondary_emails = Column(JSON, default=list)
    phone = Column(String(50))
    secondary_phones = Column(JSON, default=list)
    address = Column(String(500))
    timezone = Column(String(100))
    pronouns = Column(String(100))
    avatar_url = Column(String(500))
    external_ids = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="profile", uselist=False)

    def __repr__(self):
        return f"<UserProfile {self.user_id}>"
