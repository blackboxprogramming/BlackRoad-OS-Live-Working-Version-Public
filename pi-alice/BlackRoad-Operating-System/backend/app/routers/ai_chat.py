"""AI Chat routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, delete
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.ai_chat import Conversation, Message, MessageRole
from app.auth import get_current_active_user
from app.utils import utc_now

router = APIRouter(prefix="/api/ai-chat", tags=["AI Chat"])


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationResponse(BaseModel):
    id: int
    title: Optional[str]
    message_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: MessageRole
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    """Get user's conversations"""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(desc(Conversation.updated_at))
        .limit(limit)
        .offset(offset)
    )
    conversations = result.scalars().all()

    return conversations


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_data: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation"""
    conversation = Conversation(
        user_id=current_user.id,
        title=conv_data.title
    )

    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    return conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a conversation"""
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            )
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages in a conversation"""
    # Verify conversation belongs to user
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            )
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    return messages


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message in a conversation"""
    # Verify conversation belongs to user
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            )
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Create user message
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=message_data.content
    )
    db.add(user_message)

    # Generate AI response (simplified - in production, call OpenAI API)
    ai_response_content = f"This is a simulated AI response to: '{message_data.content}'. In production, this would call the OpenAI API configured in settings.OPENAI_API_KEY."

    ai_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.ASSISTANT,
        content=ai_response_content
    )
    db.add(ai_message)

    # Update conversation
    conversation.message_count += 2
    conversation.updated_at = utc_now()

    if not conversation.title or conversation.title == "New Conversation":
        # Auto-generate title from first message
        conversation.title = message_data.content[:50] + "..." if len(message_data.content) > 50 else message_data.content

    await db.commit()
    await db.refresh(ai_message)

    return ai_message


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a conversation"""
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id
            )
        )
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Delete all messages
    await db.execute(
        delete(Message).where(Message.conversation_id == conversation_id)
    )

    await db.delete(conversation)
    await db.commit()

    return None
