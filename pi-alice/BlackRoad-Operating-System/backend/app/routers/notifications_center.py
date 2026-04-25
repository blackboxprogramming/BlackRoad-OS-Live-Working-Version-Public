"""Notification center routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel

from app.auth import get_current_active_user
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class NotificationCreate(BaseModel):
    type: str = "info"
    source_app_id: Optional[str] = None
    title: str
    body: str
    importance: str = "normal"
    delivery_mode: str = "immediate"


class NotificationResponse(BaseModel):
    id: int
    type: str
    source_app_id: Optional[str]
    title: str
    body: str
    importance: str
    delivery_mode: str
    read_at: Optional[str]

    class Config:
        from_attributes = True


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    payload: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = Notification(**payload.model_dump())
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    importance: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Notification)
    if importance:
        query = query.where(Notification.importance == importance)
    result = await db.execute(query.order_by(Notification.created_at.desc()))
    return result.scalars().all()


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    if not notification.read_at:
        notification.read_at = datetime.utcnow()
    await db.commit()
    await db.refresh(notification)
    return notification
