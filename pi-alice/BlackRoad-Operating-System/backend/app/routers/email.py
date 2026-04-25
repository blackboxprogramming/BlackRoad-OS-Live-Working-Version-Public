"""Email (RoadMail) routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.email import Email, EmailFolder, EmailFolderType
from app.auth import get_current_active_user
from app.utils import utc_now

router = APIRouter(prefix="/api/email", tags=["Email"])


class EmailCreate(BaseModel):
    to: EmailStr
    subject: str
    body: str
    cc: List[EmailStr] = []
    bcc: List[EmailStr] = []


class EmailResponse(BaseModel):
    id: int
    sender_email: str
    sender_name: str
    recipient_email: str
    subject: str
    body: str
    is_read: bool
    is_starred: bool
    created_at: datetime
    sent_at: datetime | None

    class Config:
        from_attributes = True


@router.get("/folders", response_model=List[dict])
async def get_folders(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's email folders"""
    result = await db.execute(
        select(EmailFolder).where(EmailFolder.user_id == current_user.id)
    )
    folders = result.scalars().all()

    # Create default folders if none exist
    if not folders:
        default_folders = [
            EmailFolder(user_id=current_user.id, name="Inbox", folder_type=EmailFolderType.INBOX, icon="📥"),
            EmailFolder(user_id=current_user.id, name="Sent", folder_type=EmailFolderType.SENT, icon="📤"),
            EmailFolder(user_id=current_user.id, name="Drafts", folder_type=EmailFolderType.DRAFTS, icon="📝"),
            EmailFolder(user_id=current_user.id, name="Spam", folder_type=EmailFolderType.SPAM, icon="🚫"),
            EmailFolder(user_id=current_user.id, name="Trash", folder_type=EmailFolderType.TRASH, icon="🗑️"),
        ]
        for folder in default_folders:
            db.add(folder)
        await db.commit()
        folders = default_folders

    return [
        {
            "id": f.id,
            "name": f.name,
            "icon": f.icon,
            "folder_type": f.folder_type
        }
        for f in folders
    ]


@router.get("/inbox", response_model=List[EmailResponse])
async def get_inbox(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get inbox emails"""
    result = await db.execute(
        select(Email)
        .where(
            and_(
                Email.recipient_id == current_user.id,
                Email.is_draft == False
            )
        )
        .order_by(Email.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    emails = result.scalars().all()
    return emails


@router.get("/sent", response_model=List[EmailResponse])
async def get_sent(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get sent emails"""
    result = await db.execute(
        select(Email)
        .where(
            and_(
                Email.sender_id == current_user.id,
                Email.is_draft == False
            )
        )
        .order_by(Email.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    emails = result.scalars().all()
    return emails


@router.post("/send", response_model=EmailResponse, status_code=status.HTTP_201_CREATED)
async def send_email(
    email_data: EmailCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Send an email"""
    # Find recipient
    result = await db.execute(
        select(User).where(User.email == email_data.to)
    )
    recipient = result.scalar_one_or_none()

    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )

    # Create email
    email = Email(
        sender_id=current_user.id,
        sender_email=current_user.email,
        sender_name=current_user.full_name or current_user.username,
        recipient_id=recipient.id,
        recipient_email=recipient.email,
        subject=email_data.subject,
        body=email_data.body,
        cc=",".join(email_data.cc) if email_data.cc else None,
        bcc=",".join(email_data.bcc) if email_data.bcc else None,
        is_read=False,
        is_draft=False,
        sent_at=utc_now()
    )

    db.add(email)
    await db.commit()
    await db.refresh(email)

    return email


@router.get("/{email_id}", response_model=EmailResponse)
async def get_email(
    email_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific email"""
    result = await db.execute(
        select(Email).where(
            and_(
                Email.id == email_id,
                or_(
                    Email.sender_id == current_user.id,
                    Email.recipient_id == current_user.id
                )
            )
        )
    )
    email = result.scalar_one_or_none()

    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )

    # Mark as read if recipient is viewing
    if email.recipient_id == current_user.id and not email.is_read:
        email.is_read = True
        email.read_at = utc_now()
        await db.commit()

    return email


@router.delete("/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email(
    email_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an email"""
    result = await db.execute(
        select(Email).where(
            and_(
                Email.id == email_id,
                or_(
                    Email.sender_id == current_user.id,
                    Email.recipient_id == current_user.id
                )
            )
        )
    )
    email = result.scalar_one_or_none()

    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )

    await db.delete(email)
    await db.commit()

    return None
