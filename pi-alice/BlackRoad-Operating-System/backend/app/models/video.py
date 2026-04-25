"""Video streaming models"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.database import Base


class Video(Base):
    """Video model"""

    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(String(500))
    video_url = Column(String(500), nullable=False)

    # Video metadata
    duration = Column(Integer)  # in seconds
    resolution = Column(String(20))  # e.g., "1920x1080"
    file_size = Column(Integer)  # in bytes
    format = Column(String(20))  # e.g., "mp4", "webm"

    # Engagement
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    dislikes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    # Visibility
    is_public = Column(Boolean, default=True)
    is_live = Column(Boolean, default=False)
    is_processing = Column(Boolean, default=False)

    # Categories/Tags
    category = Column(String(100))
    tags = Column(Text)  # Comma-separated

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))


class VideoView(Base):
    """Video view tracking"""

    __tablename__ = "video_views"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    # Watch metadata
    watch_duration = Column(Integer)  # seconds watched
    completion_percentage = Column(Float)

    # Analytics
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    referrer = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class VideoLike(Base):
    """Video like/dislike tracking"""

    __tablename__ = "video_likes"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_like = Column(Boolean, default=True)  # True=like, False=dislike

    created_at = Column(DateTime(timezone=True), server_default=func.now())
