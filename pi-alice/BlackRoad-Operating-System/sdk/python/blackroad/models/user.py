"""User models for the BlackRoad SDK."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Model for creating a new user."""

    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "full_name": "John Doe",
            }
        }


class User(BaseModel):
    """User model."""

    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    is_admin: bool = False
    wallet_address: Optional[str] = None
    balance: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "avatar_url": None,
                "bio": "Software developer",
                "is_active": True,
                "is_verified": False,
                "is_admin": False,
                "wallet_address": "0x1234567890abcdef",
                "balance": 100.0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": None,
                "last_login": None,
            }
        }


class Token(BaseModel):
    """Authentication token model."""

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
            }
        }


class UserLogin(BaseModel):
    """Model for user login."""

    username: str
    password: str

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123",
            }
        }
