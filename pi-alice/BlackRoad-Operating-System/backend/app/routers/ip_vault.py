"""IP Vault routes - Cryptographic proof-of-origin for ideas"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.leo import LEO as LEOModel, AnchorEvent
from app.schemas.leo import (
    LEOCreate,
    LEOResponse,
    LEODetail,
    LEOList,
    AnchorRequest,
    AnchorEventResponse
)

# Import the VaultAgent
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from agents.categories.security.vault_agent import VaultAgent

router = APIRouter(prefix="/api/vault", tags=["IP Vault"])


@router.post("/leos", response_model=LEODetail, status_code=status.HTTP_201_CREATED)
async def create_leo(
    leo_data: LEOCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new Ledger Evidence Object (LEO).

    Vaults an idea by:
    1. Canonicalizing the text
    2. Computing cryptographic hashes
    3. Creating a LEO record
    4. Returning verification and anchoring instructions
    """
    try:
        # Initialize VaultAgent
        agent = VaultAgent()

        # Create LEO using agent
        result = await agent.run({
            'action': 'create_leo',
            'idea': leo_data.idea,
            'author': leo_data.author,
            'title': leo_data.title
        })

        if result.status.value != 'completed':
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create LEO: {result.error}"
            )

        leo_dict = result.data['result']['leo']
        verification_text = result.data['result']['verification_text']
        anchoring_options = result.data['result']['anchoring_options']

        # Create database record
        db_leo = LEOModel(
            id=leo_dict['id'],
            author=leo_dict['author'],
            title=leo_dict['title'],
            sha256=leo_dict['sha256'],
            sha512=leo_dict['sha512'],
            keccak256=leo_dict['keccak256'],
            canonical_size=leo_dict['canonical_size'],
            anchor_status=leo_dict['anchor_status'],
            created_at=datetime.fromisoformat(leo_dict['created_at'].replace('Z', '+00:00'))
        )

        db.add(db_leo)
        await db.commit()
        await db.refresh(db_leo)

        # Return detailed response
        return LEODetail(
            id=db_leo.id,
            author=db_leo.author,
            title=db_leo.title,
            sha256=db_leo.sha256,
            sha512=db_leo.sha512,
            keccak256=db_leo.keccak256,
            canonical_size=db_leo.canonical_size,
            anchor_status=db_leo.anchor_status,
            anchor_txid=db_leo.anchor_txid,
            anchor_chain=db_leo.anchor_chain,
            anchor_block_height=db_leo.anchor_block_height,
            anchored_at=db_leo.anchored_at,
            created_at=db_leo.created_at,
            updated_at=db_leo.updated_at,
            verification_text=verification_text,
            anchoring_options=anchoring_options
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating LEO: {str(e)}"
        )


@router.get("/leos", response_model=LEOList)
async def list_leos(
    page: int = 1,
    per_page: int = 20,
    author: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List all LEOs with pagination.

    Query parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20, max: 100)
    - author: Filter by author (optional)
    """
    # Validate pagination
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be >= 1"
        )
    if per_page < 1 or per_page > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="per_page must be between 1 and 100"
        )

    # Build query
    query = select(LEOModel)

    # Filter by author if provided
    if author:
        query = query.where(LEOModel.author == author)

    # Order by created_at descending (newest first)
    query = query.order_by(desc(LEOModel.created_at))

    # Count total
    count_query = select(func.count()).select_from(LEOModel)
    if author:
        count_query = count_query.where(LEOModel.author == author)
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    # Execute query
    result = await db.execute(query)
    leos = result.scalars().all()

    return LEOList(
        leos=[LEOResponse.model_validate(leo) for leo in leos],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/leos/{leo_id}", response_model=LEODetail)
async def get_leo(
    leo_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific LEO by ID.

    Returns:
    - Full LEO details
    - Verification instructions
    - Anchoring options
    """
    # Query database
    result = await db.execute(
        select(LEOModel).where(LEOModel.id == leo_id)
    )
    leo = result.scalar_one_or_none()

    if not leo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LEO with ID {leo_id} not found"
        )

    # Generate verification text and anchoring options
    agent = VaultAgent()

    # Reconstruct LEO for verification text
    from agents.categories.security.vault_agent import LEO as LEODataclass
    leo_obj = LEODataclass(
        id=leo.id,
        author=leo.author,
        title=leo.title,
        canonical_size=leo.canonical_size,
        sha256=leo.sha256,
        sha512=leo.sha512,
        keccak256=leo.keccak256,
        created_at=leo.created_at.isoformat() + 'Z',
        anchor_status=leo.anchor_status,
        anchor_txid=leo.anchor_txid,
        anchor_chain=leo.anchor_chain
    )

    verification_text = agent._generate_verification_text(leo_obj)
    anchoring_options = agent._generate_anchoring_options(leo_obj)

    return LEODetail(
        id=leo.id,
        author=leo.author,
        title=leo.title,
        sha256=leo.sha256,
        sha512=leo.sha512,
        keccak256=leo.keccak256,
        canonical_size=leo.canonical_size,
        anchor_status=leo.anchor_status,
        anchor_txid=leo.anchor_txid,
        anchor_chain=leo.anchor_chain,
        anchor_block_height=leo.anchor_block_height,
        anchored_at=leo.anchored_at,
        created_at=leo.created_at,
        updated_at=leo.updated_at,
        verification_text=verification_text,
        anchoring_options=anchoring_options
    )


@router.post("/leos/{leo_id}/anchor", response_model=LEOResponse)
async def anchor_leo(
    leo_id: str,
    anchor_data: AnchorRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate blockchain anchoring for a LEO.

    NOTE: This is a placeholder endpoint for v0.
    Future implementation will integrate with actual blockchain networks.
    """
    # Query LEO
    result = await db.execute(
        select(LEOModel).where(LEOModel.id == leo_id)
    )
    leo = result.scalar_one_or_none()

    if not leo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LEO with ID {leo_id} not found"
        )

    # Check if already anchored
    if leo.anchor_status == 'anchored':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LEO is already anchored"
        )

    # TODO: Implement actual blockchain anchoring
    # For v0, just update status to indicate anchoring initiated
    leo.anchor_status = 'pending'
    leo.anchor_chain = anchor_data.chain

    # Create anchor event
    anchor_event = AnchorEvent(
        leo_id=leo_id,
        event_type='anchor_initiated',
        chain=anchor_data.chain,
        status='pending'
    )
    db.add(anchor_event)

    await db.commit()
    await db.refresh(leo)

    return LEOResponse.model_validate(leo)


@router.get("/leos/{leo_id}/events", response_model=List[AnchorEventResponse])
async def get_leo_events(
    leo_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all anchor events for a LEO.

    Returns the audit trail of all anchoring attempts and status changes.
    """
    # Verify LEO exists
    leo_result = await db.execute(
        select(LEOModel).where(LEOModel.id == leo_id)
    )
    leo = leo_result.scalar_one_or_none()

    if not leo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LEO with ID {leo_id} not found"
        )

    # Query events
    result = await db.execute(
        select(AnchorEvent)
        .where(AnchorEvent.leo_id == leo_id)
        .order_by(desc(AnchorEvent.created_at))
    )
    events = result.scalars().all()

    return [AnchorEventResponse.model_validate(event) for event in events]
