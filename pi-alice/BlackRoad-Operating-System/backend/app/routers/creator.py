"""Creator Studio routes"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.auth import get_current_active_user
from app.database import get_db
from app.models.creator import CreativeProject
from app.models.user import User

router = APIRouter(prefix="/api/creator", tags=["Creator"])


class CreativeProjectPayload(BaseModel):
    title: str
    type: str = "mixed"
    description: Optional[str] = None
    links_to_assets: List[str] = Field(default_factory=list)
    status: str = "idea"
    revenue_streams: dict = Field(default_factory=dict)
    notes: Optional[str] = None


class CreativeProjectResponse(CreativeProjectPayload):
    id: int

    class Config:
        from_attributes = True


@router.get("/projects", response_model=List[CreativeProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CreativeProject).order_by(CreativeProject.created_at.desc()))
    return result.scalars().all()


@router.post("/projects", response_model=CreativeProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: CreativeProjectPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    project = CreativeProject(**payload.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=CreativeProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CreativeProject).where(CreativeProject.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=CreativeProjectResponse)
async def update_project(
    project_id: int,
    payload: CreativeProjectPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(CreativeProject).where(CreativeProject.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, value in payload.model_dump().items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project
