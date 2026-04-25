"""Unified search endpoints"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.auth import get_current_active_user
from app.database import get_db
from app.models.capture import CaptureItem
from app.models.identity_profile import UserProfile
from app.models.creator import CreativeProject
from app.models.user import User

router = APIRouter(prefix="/api/search", tags=["Search"])


class SearchResult(BaseModel):
    app_id: str
    type: str
    title: str
    snippet: str | None = None
    ref_id: str | None = None


@router.get("", response_model=List[SearchResult])
async def unified_search(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    results: List[SearchResult] = []

    # Capture items search
    capture_result = await db.execute(
        select(CaptureItem).where(CaptureItem.raw_content.ilike(f"%{q}%"))
    )
    for item in capture_result.scalars().all():
        results.append(
            SearchResult(
                app_id="chaos-inbox",
                type=item.type,
                title=item.raw_content[:60] if item.raw_content else item.type,
                snippet=item.status,
                ref_id=str(item.id)
            )
        )

    # Creative projects
    project_result = await db.execute(
        select(CreativeProject).where(CreativeProject.title.ilike(f"%{q}%"))
    )
    for project in project_result.scalars().all():
        results.append(
            SearchResult(
                app_id="creator-studio",
                type=project.type,
                title=project.title,
                snippet=project.description[:80] if project.description else None,
                ref_id=str(project.id)
            )
        )

    # Identity profile
    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    if profile and q.lower() in (profile.name or "").lower():
        results.append(
            SearchResult(
                app_id="identity-center",
                type="profile",
                title=profile.name or "Profile",
                snippet=profile.email,
                ref_id=str(profile.id)
            )
        )

    # App discovery (front-end uses registry; include sample results)
    if "identity" in q.lower():
        results.append(SearchResult(app_id="identity-center", type="app", title="Identity Center"))
    if "chaos" in q.lower() or "note" in q.lower():
        results.append(SearchResult(app_id="chaos-inbox", type="app", title="Chaos Inbox"))
    if "creator" in q.lower():
        results.append(SearchResult(app_id="creator-studio", type="app", title="Creator Studio"))
    if "compliance" in q.lower():
        results.append(SearchResult(app_id="compliance-ops", type="app", title="Compliance & Ops"))

    return results
