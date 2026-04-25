"""User schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    wallet_address: Optional[str] = None
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[int] = None
    username: Optional[str] = None
