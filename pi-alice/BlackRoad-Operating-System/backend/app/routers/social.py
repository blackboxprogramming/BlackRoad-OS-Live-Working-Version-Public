"""Social media (BlackRoad Social) routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.social import Post, Comment, Like, Follow
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/social", tags=["Social"])


class PostCreate(BaseModel):
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    username: str
    avatar_url: Optional[str]
    content: str
    image_url: Optional[str]
    video_url: Optional[str]
    likes_count: int
    comments_count: int
    shares_count: int
    created_at: datetime
    is_liked: bool = False

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    user_id: int
    username: str
    avatar_url: Optional[str]
    content: str
    likes_count: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/feed", response_model=List[PostResponse])
async def get_feed(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get social media feed"""
    # Get posts from followed users + own posts
    result = await db.execute(
        select(Post, User)
        .join(User, Post.user_id == User.id)
        .where(Post.is_public == True)
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset(offset)
    )
    posts_with_users = result.all()

    # Check which posts current user has liked
    post_ids = [post.id for post, _ in posts_with_users]
    liked_result = await db.execute(
        select(Like.post_id)
        .where(
            and_(
                Like.user_id == current_user.id,
                Like.post_id.in_(post_ids)
            )
        )
    )
    liked_post_ids = {row[0] for row in liked_result.all()}

    # Build response
    feed = []
    for post, user in posts_with_users:
        feed.append(PostResponse(
            id=post.id,
            user_id=post.user_id,
            username=user.username,
            avatar_url=user.avatar_url,
            content=post.content,
            image_url=post.image_url,
            video_url=post.video_url,
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            created_at=post.created_at,
            is_liked=post.id in liked_post_ids
        ))

    return feed


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new post"""
    post = Post(
        user_id=current_user.id,
        content=post_data.content,
        image_url=post_data.image_url,
        video_url=post_data.video_url,
        is_public=True
    )

    db.add(post)
    await db.commit()
    await db.refresh(post)

    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        username=current_user.username,
        avatar_url=current_user.avatar_url,
        content=post.content,
        image_url=post.image_url,
        video_url=post.video_url,
        likes_count=0,
        comments_count=0,
        shares_count=0,
        created_at=post.created_at,
        is_liked=False
    )


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Like a post"""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Check if already liked
    result = await db.execute(
        select(Like).where(
            and_(
                Like.user_id == current_user.id,
                Like.post_id == post_id
            )
        )
    )
    existing_like = result.scalar_one_or_none()

    if existing_like:
        # Unlike
        await db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        await db.commit()
        return {"liked": False, "likes_count": post.likes_count}
    else:
        # Like
        like = Like(user_id=current_user.id, post_id=post_id)
        db.add(like)
        post.likes_count += 1
        await db.commit()
        return {"liked": True, "likes_count": post.likes_count}


@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get comments for a post"""
    result = await db.execute(
        select(Comment, User)
        .join(User, Comment.user_id == User.id)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .limit(limit)
        .offset(offset)
    )
    comments_with_users = result.all()

    return [
        CommentResponse(
            id=comment.id,
            user_id=comment.user_id,
            username=user.username,
            avatar_url=user.avatar_url,
            content=comment.content,
            likes_count=comment.likes_count,
            created_at=comment.created_at
        )
        for comment, user in comments_with_users
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a comment to a post"""
    # Check if post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_data.content,
        parent_id=comment_data.parent_id
    )

    db.add(comment)
    post.comments_count += 1
    await db.commit()
    await db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        user_id=comment.user_id,
        username=current_user.username,
        avatar_url=current_user.avatar_url,
        content=comment.content,
        likes_count=0,
        created_at=comment.created_at
    )


@router.post("/users/{user_id}/follow")
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Follow a user"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already following
    result = await db.execute(
        select(Follow).where(
            and_(
                Follow.follower_id == current_user.id,
                Follow.following_id == user_id
            )
        )
    )
    existing_follow = result.scalar_one_or_none()

    if existing_follow:
        # Unfollow
        await db.delete(existing_follow)
        await db.commit()
        return {"following": False}
    else:
        # Follow
        follow = Follow(follower_id=current_user.id, following_id=user_id)
        db.add(follow)
        await db.commit()
        return {"following": True}
