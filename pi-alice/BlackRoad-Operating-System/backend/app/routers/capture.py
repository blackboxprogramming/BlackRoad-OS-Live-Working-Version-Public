"""Routes for Chaos Inbox capture items and clustering"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel, Field

from app.auth import get_current_active_user
from app.database import get_db
from app.models.capture import CaptureItem, CaptureCluster
from app.models.user import User

router = APIRouter(prefix="/api/capture", tags=["Chaos Inbox"])


class CaptureItemCreate(BaseModel):
    type: str = "note"
    raw_content: Optional[str] = None
    source: Optional[str] = "manual"
    tags: List[str] = Field(default_factory=list)
    related_to: List[str] = Field(default_factory=list)
    status: str = "inbox"


class CaptureItemResponse(BaseModel):
    id: int
    type: str
    raw_content: Optional[str]
    source: Optional[str]
    tags: List[str]
    related_to: List[str]
    status: str

    class Config:
        from_attributes = True


class TagUpdate(BaseModel):
    tags: List[str]


class StatusUpdate(BaseModel):
    status: str


class ClusterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    item_ids: List[int] = Field(default_factory=list)


class ClusterResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    item_ids: List[int]
    last_refreshed_at: Optional[str]

    class Config:
        from_attributes = True


@router.post("/items", response_model=CaptureItemResponse, status_code=status.HTTP_201_CREATED)
async def create_capture_item(
    item: CaptureItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new capture item."""
    capture_item = CaptureItem(**item.model_dump())
    db.add(capture_item)
    await db.commit()
    await db.refresh(capture_item)
    return capture_item


@router.get("/items", response_model=List[CaptureItemResponse])
async def list_capture_items(
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List capture items with optional filters."""
    query = select(CaptureItem)
    if status_filter:
        query = query.where(CaptureItem.status == status_filter)
    if type_filter:
        query = query.where(CaptureItem.type == type_filter)

    result = await db.execute(query.order_by(CaptureItem.created_at.desc()))
    return result.scalars().all()


@router.post("/items/{item_id}/tag", response_model=CaptureItemResponse)
async def update_tags(
    item_id: int,
    payload: TagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CaptureItem).where(CaptureItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    item.tags = payload.tags
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/items/{item_id}/status", response_model=CaptureItemResponse)
async def update_status(
    item_id: int,
    payload: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CaptureItem).where(CaptureItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    item.status = payload.status
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/clusters", response_model=ClusterResponse, status_code=status.HTTP_201_CREATED)
async def create_cluster(
    payload: ClusterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    cluster = CaptureCluster(**payload.model_dump())
    db.add(cluster)
    await db.commit()
    await db.refresh(cluster)
    return cluster


@router.get("/clusters", response_model=List[ClusterResponse])
async def list_clusters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CaptureCluster).order_by(CaptureCluster.last_refreshed_at.desc()))
    return result.scalars().all()
