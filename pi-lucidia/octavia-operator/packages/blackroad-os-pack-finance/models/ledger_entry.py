from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Literal


@dataclass
class LedgerEntry:
    """Represents a financial ledger entry."""
    
    id: str
    timestamp: datetime
    account: str
    description: str
    amount: Decimal
    currency: str = "USD"
    entry_type: Literal["debit", "credit"] = "debit"
    category: str | None = None
    tags: list[str] | None = None
    metadata: dict[str, str] | None = None
    
    def __post_init__(self):
        """Ensure amount is a Decimal."""
        if not isinstance(self.amount, Decimal):
            self.amount = Decimal(str(self.amount))
        
        if self.tags is None:
            self.tags = []
        
        if self.metadata is None:
            self.metadata = {}
    
    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "account": self.account,
            "description": self.description,
            "amount": str(self.amount),
            "currency": self.currency,
            "entry_type": self.entry_type,
            "category": self.category,
            "tags": self.tags,
            "metadata": self.metadata,
        }


from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, validator


class LedgerEntry(BaseModel):
    date: date = Field(..., description="Transaction date")
    account: str = Field(..., description="Account name")
    debit: float | None = Field(0.0, description="Debit amount")
    credit: float | None = Field(0.0, description="Credit amount")
    description: Optional[str] = Field(None, description="Entry detail")

    @validator("debit", "credit", pre=True)
    def empty_to_zero(cls, value: float | None) -> float:
        return float(value or 0)

    @validator("debit", "credit")
    def non_negative(cls, value: float) -> float:
        if value < 0:
            raise ValueError("Amounts must be non-negative")
        return value

    @property
    def net(self) -> float:
        return (self.debit or 0) - (self.credit or 0)

    def is_balanced(self) -> bool:
        return abs(self.net) < 1e-6


class LedgerFile(BaseModel):
    name: str
    entries: list[LedgerEntry]

    def total_debits(self) -> float:
        return sum(e.debit or 0 for e in self.entries)

    def total_credits(self) -> float:
        return sum(e.credit or 0 for e in self.entries)

    def imbalance(self) -> float:
        return round(self.total_debits() - self.total_credits(), 2)

    def summary(self) -> dict[str, float]:
        return {
            "entries": len(self.entries),
            "debits": self.total_debits(),
            "credits": self.total_credits(),
            "imbalance": self.imbalance(),
        }
