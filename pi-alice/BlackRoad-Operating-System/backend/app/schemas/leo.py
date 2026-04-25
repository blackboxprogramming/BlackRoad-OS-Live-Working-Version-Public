"""LEO (Ledger Evidence Object) schemas"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class LEOCreate(BaseModel):
    """LEO creation schema"""
    idea: str = Field(..., min_length=1, description="Raw idea text to vault")
    author: str = Field(default="Alexa", description="Author of the idea")
    title: Optional[str] = Field(None, max_length=500, description="Optional title for the idea")


class LEOResponse(BaseModel):
    """LEO response schema"""
    id: str
    author: str
    title: Optional[str]
    sha256: str
    sha512: str
    keccak256: str
    canonical_size: int
    anchor_status: str
    anchor_txid: Optional[str]
    anchor_chain: Optional[str]
    anchor_block_height: Optional[int]
    anchored_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class LEODetail(LEOResponse):
    """
    Detailed LEO response with verification and anchoring info
    """
    verification_text: str
    anchoring_options: Dict[str, Any]


class LEOList(BaseModel):
    """Paginated LEO list response"""
    leos: list[LEOResponse]
    total: int
    page: int
    per_page: int


class AnchorRequest(BaseModel):
    """Blockchain anchor request"""
    chain: str = Field(
        default="bitcoin",
        description="Target blockchain (bitcoin, litecoin, ethereum)"
    )


class AnchorEventResponse(BaseModel):
    """Anchor event response"""
    id: int
    leo_id: str
    event_type: str
    chain: Optional[str]
    txid: Optional[str]
    block_height: Optional[int]
    status: str
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
