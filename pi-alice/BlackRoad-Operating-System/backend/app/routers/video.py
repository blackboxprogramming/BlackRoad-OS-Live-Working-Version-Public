"""Video streaming (BlackStream) routes"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.video import Video, VideoView, VideoLike
from app.auth import get_current_active_user
from app.utils import utc_now

router = APIRouter(prefix="/api/videos", tags=["Videos"])


class VideoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None


class VideoResponse(BaseModel):
    id: int
    user_id: int
    username: str
    avatar_url: Optional[str]
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    video_url: str
    duration: Optional[int]
    views_count: int
    likes_count: int
    dislikes_count: int
    comments_count: int
    is_public: bool
    created_at: datetime
    is_liked: Optional[bool] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[VideoResponse])
async def get_videos(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_active_user)
):
    """Get videos"""
    query = select(Video, User).join(User, Video.user_id == User.id).where(Video.is_public == True)

    if category:
        query = query.where(Video.category == category)

    query = query.order_by(desc(Video.created_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    videos_with_users = result.all()

    # Check which videos current user has liked
    video_ids = [video.id for video, _ in videos_with_users]
    liked_result = await db.execute(
        select(VideoLike)
        .where(
            and_(
                VideoLike.user_id == current_user.id,
                VideoLike.video_id.in_(video_ids),
                VideoLike.is_like == True
            )
        )
    )
    liked_video_ids = {like.video_id for like in liked_result.scalars().all()}

    return [
        VideoResponse(
            id=video.id,
            user_id=video.user_id,
            username=user.username,
            avatar_url=user.avatar_url,
            title=video.title,
            description=video.description,
            thumbnail_url=video.thumbnail_url,
            video_url=video.video_url,
            duration=video.duration,
            views_count=video.views_count,
            likes_count=video.likes_count,
            dislikes_count=video.dislikes_count,
            comments_count=video.comments_count,
            is_public=video.is_public,
            created_at=video.created_at,
            is_liked=video.id in liked_video_ids
        )
        for video, user in videos_with_users
    ]


@router.post("/", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    video_data: VideoCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a video"""
    video = Video(
        user_id=current_user.id,
        title=video_data.title,
        description=video_data.description,
        video_url=video_data.video_url,
        thumbnail_url=video_data.thumbnail_url,
        category=video_data.category,
        tags=video_data.tags,
        is_public=True,
        published_at=utc_now()
    )

    db.add(video)
    await db.commit()
    await db.refresh(video)

    return VideoResponse(
        id=video.id,
        user_id=video.user_id,
        username=current_user.username,
        avatar_url=current_user.avatar_url,
        title=video.title,
        description=video.description,
        thumbnail_url=video.thumbnail_url,
        video_url=video.video_url,
        duration=video.duration,
        views_count=0,
        likes_count=0,
        dislikes_count=0,
        comments_count=0,
        is_public=True,
        created_at=video.created_at,
        is_liked=False
    )


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific video"""
    result = await db.execute(
        select(Video, User)
        .join(User, Video.user_id == User.id)
        .where(Video.id == video_id)
    )
    video_with_user = result.first()

    if not video_with_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    video, user = video_with_user

    # Record view
    view = VideoView(
        video_id=video.id,
        user_id=current_user.id
    )
    db.add(view)
    video.views_count += 1
    await db.commit()

    # Check if liked
    liked_result = await db.execute(
        select(VideoLike)
        .where(
            and_(
                VideoLike.user_id == current_user.id,
                VideoLike.video_id == video_id,
                VideoLike.is_like == True
            )
        )
    )
    is_liked = liked_result.scalar_one_or_none() is not None

    return VideoResponse(
        id=video.id,
        user_id=video.user_id,
        username=user.username,
        avatar_url=user.avatar_url,
        title=video.title,
        description=video.description,
        thumbnail_url=video.thumbnail_url,
        video_url=video.video_url,
        duration=video.duration,
        views_count=video.views_count,
        likes_count=video.likes_count,
        dislikes_count=video.dislikes_count,
        comments_count=video.comments_count,
        is_public=video.is_public,
        created_at=video.created_at,
        is_liked=is_liked
    )


@router.post("/{video_id}/like")
async def like_video(
    video_id: int,
    is_like: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Like or dislike a video"""
    # Check if video exists
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # Check if already liked/disliked
    result = await db.execute(
        select(VideoLike).where(
            and_(
                VideoLike.user_id == current_user.id,
                VideoLike.video_id == video_id
            )
        )
    )
    existing_like = result.scalar_one_or_none()

    if existing_like:
        # Update or remove
        if existing_like.is_like == is_like:
            # Remove like/dislike
            await db.delete(existing_like)
            if is_like:
                video.likes_count = max(0, video.likes_count - 1)
            else:
                video.dislikes_count = max(0, video.dislikes_count - 1)
        else:
            # Change from like to dislike or vice versa
            existing_like.is_like = is_like
            if is_like:
                video.likes_count += 1
                video.dislikes_count = max(0, video.dislikes_count - 1)
            else:
                video.dislikes_count += 1
                video.likes_count = max(0, video.likes_count - 1)
    else:
        # New like/dislike
        like = VideoLike(
            user_id=current_user.id,
            video_id=video_id,
            is_like=is_like
        )
        db.add(like)
        if is_like:
            video.likes_count += 1
        else:
            video.dislikes_count += 1

    await db.commit()

    return {
        "liked": is_like if existing_like is None or existing_like.is_like != is_like else None,
        "likes_count": video.likes_count,
        "dislikes_count": video.dislikes_count
    }
