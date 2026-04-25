"""LEO (Ledger Evidence Object) model"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class LEO(Base):
    """
    Ledger Evidence Object (LEO) model

    Cryptographic proof-of-origin for ideas and intellectual property.
    Stores hashes and metadata suitable for blockchain anchoring.
    """

    __tablename__ = "leos"

    id = Column(String(36), primary_key=True, index=True)  # UUID
    author = Column(String(255), nullable=False, default="Alexa")
    title = Column(String(500), nullable=True)

    # Cryptographic hashes
    sha256 = Column(String(64), nullable=False, index=True)
    sha512 = Column(String(128), nullable=False)
    keccak256 = Column(String(64), nullable=False)

    # Metadata
    canonical_size = Column(Integer, nullable=False)

    # Blockchain anchoring
    anchor_status = Column(
        String(20),
        nullable=False,
        default="pending"
    )  # pending, anchored, failed
    anchor_txid = Column(String(128), nullable=True)
    anchor_chain = Column(String(50), nullable=True)
    anchor_block_height = Column(Integer, nullable=True)
    anchored_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<LEO {self.id} by {self.author}>"


class AnchorEvent(Base):
    """
    Blockchain anchor event audit trail

    Tracks all anchoring attempts and status changes for LEOs.
    """

    __tablename__ = "anchor_events"

    id = Column(Integer, primary_key=True, index=True)
    leo_id = Column(String(36), nullable=False, index=True)

    # Event details
    event_type = Column(String(50), nullable=False)  # anchor_initiated, anchor_confirmed, anchor_failed
    chain = Column(String(50), nullable=True)
    txid = Column(String(128), nullable=True)
    block_height = Column(Integer, nullable=True)

    # Status
    status = Column(String(20), nullable=False)  # pending, confirmed, failed
    error_message = Column(Text, nullable=True)

    # Metadata (attribute renamed from 'metadata' to avoid SQLAlchemy reserved attribute)
    event_metadata = Column("metadata", Text, nullable=True)  # JSON serialized

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<AnchorEvent {self.id} for LEO {self.leo_id}>"
