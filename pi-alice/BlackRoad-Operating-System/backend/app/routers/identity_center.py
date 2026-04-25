"""Identity Center routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

from app.auth import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.identity_profile import UserProfile

router = APIRouter(prefix="/api/identity", tags=["Identity"])


class UserProfilePayload(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    email: Optional[str] = None
    secondary_emails: List[str] = Field(default_factory=list)
    phone: Optional[str] = None
    secondary_phones: List[str] = Field(default_factory=list)
    address: Optional[str] = None
    timezone: Optional[str] = None
    pronouns: Optional[str] = None
    avatar_url: Optional[str] = None
    external_ids: Dict[str, str] = Field(default_factory=dict)


class UserProfileResponse(UserProfilePayload):
    completeness: int = 0

    class Config:
        from_attributes = True


def calculate_completeness(profile: UserProfile) -> int:
    filled = [
        profile.name,
        profile.email,
        profile.phone,
        profile.address,
        profile.timezone,
        profile.pronouns,
    ]
    score = int((len([f for f in filled if f]) / len(filled)) * 100)
    return min(score + (10 if profile.avatar_url else 0), 100)


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id, email=current_user.email, name=current_user.full_name)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    response = UserProfileResponse.model_validate(profile)
    response.completeness = calculate_completeness(profile)
    return response


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    payload: UserProfilePayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump().items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    response = UserProfileResponse.model_validate(profile)
    response.completeness = calculate_completeness(profile)
    return response


@router.get("/linked", response_model=dict)
async def list_linked_accounts(
    current_user: User = Depends(get_current_active_user)
):
    # Placeholder for linked services registry
    return {
        "github": bool(current_user.wallet_address),
        "wallet": bool(current_user.wallet_address),
        "discord": False,
        "railway": False,
    }


@router.post("/link_external", response_model=dict)
async def link_external(
    provider: str,
    external_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    external = profile.external_ids or {}
    external[provider] = external_id
    profile.external_ids = external
    await db.commit()
    await db.refresh(profile)

    return {"provider": provider, "external_id": external_id}
