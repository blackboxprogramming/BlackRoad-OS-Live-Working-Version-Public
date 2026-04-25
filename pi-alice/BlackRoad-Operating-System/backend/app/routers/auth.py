"""Authentication routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.blockchain import Wallet
from app.schemas.user import UserCreate, UserResponse, Token, UserLogin
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_active_user
)
from app.services.blockchain import BlockchainService
from app.services.crypto import wallet_crypto, WalletKeyEncryptionError
from app.utils import utc_now

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Backwards compatibility for modules importing get_current_user from this router
get_current_user = get_current_active_user


class SimpleOAuth2PasswordRequestForm:
    """Minimal form parser compatible with OAuth2 password flow"""

    def __init__(
        self,
        grant_type: Optional[str] = Form(default=None),
        username: str = Form(...),
        password: str = Form(...),
        scope: str = Form(default=""),
        client_id: Optional[str] = Form(default=None),
        client_secret: Optional[str] = Form(default=None)
    ):
        self.grant_type = grant_type
        self.username = username
        self.password = password
        self.scopes = scope.split()
        self.client_id = client_id
        self.client_secret = client_secret


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    result = await db.execute(
        select(User).where(
            (User.username == user_data.username) | (User.email == user_data.email)
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # Generate wallet
    wallet_address, private_key, public_key = BlockchainService.generate_wallet_address()

    try:
        encrypted_private_key = wallet_crypto.encrypt(private_key)
    except WalletKeyEncryptionError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to encrypt wallet key"
        )

    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        wallet_address=wallet_address,
        wallet_private_key=encrypted_private_key,
        balance=100.0,  # Starting bonus
        created_at=utc_now()
    )

    db.add(user)
    await db.flush()

    wallet = Wallet(
        user_id=user.id,
        address=wallet_address,
        private_key=encrypted_private_key,
        public_key=public_key,
        balance=user.balance,
        label="Primary Wallet",
        is_primary=True,
    )

    db.add(wallet)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: SimpleOAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token"""
    # Get user
    result = await db.execute(
        select(User).where(User.username == form_data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Update last login
    user.last_login = utc_now()
    await db.commit()

    # Create tokens
    access_token = create_access_token(
        data={"user_id": user.id, "username": user.username}
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "username": user.username}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.post("/logout")
async def logout():
    """Logout (client should delete token)"""
    return {"message": "Successfully logged out"}


async def get_current_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Reusable dependency that returns the authenticated user."""
    return current_user
