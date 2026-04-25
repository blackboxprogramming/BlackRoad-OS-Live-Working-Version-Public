from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime
from typing import Literal


@dataclass
class BudgetModel:
    """Represents a budget allocation model."""
    
    id: str
    name: str
    period: Literal["monthly", "quarterly", "yearly"]
    start_date: datetime
    end_date: datetime
    allocated: Decimal
    spent: Decimal = Decimal("0")
    currency: str = "USD"
    categories: dict[str, Decimal] | None = None
    
    def __post_init__(self):
        """Ensure amounts are Decimals."""
        if not isinstance(self.allocated, Decimal):
            self.allocated = Decimal(str(self.allocated))
        if not isinstance(self.spent, Decimal):
            self.spent = Decimal(str(self.spent))
        
        if self.categories is None:
            self.categories = {}
    
    def remaining(self) -> Decimal:
        """Calculate remaining budget."""
        return self.allocated - self.spent
    
    def utilization(self) -> Decimal:
        """Calculate budget utilization percentage."""
        if self.allocated == 0:
            return Decimal("0")
        return (self.spent / self.allocated) * Decimal("100")
    
    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "name": self.name,
            "period": self.period,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "allocated": str(self.allocated),
            "spent": str(self.spent),
            "currency": self.currency,
            "remaining": str(self.remaining()),
            "utilization": str(self.utilization()),
            "categories": {k: str(v) for k, v in (self.categories or {}).items()},
        }
from datetime import date
from typing import Dict

from pydantic import BaseModel, Field


class BudgetLine(BaseModel):
    account: str = Field(..., description="Account name")
    monthly_limit: float = Field(..., ge=0, description="Planned monthly spend")
    owner: str = Field(..., description="Budget owner")


class BudgetModel(BaseModel):
    effective_date: date = Field(..., description="Budget start date")
    lines: list[BudgetLine]

    def to_summary(self) -> Dict[str, float]:
        return {line.account: line.monthly_limit for line in self.lines}

    def variance(self, actuals: Dict[str, float]) -> Dict[str, float]:
        summary = self.to_summary()
        variances: Dict[str, float] = {}
        for account, planned in summary.items():
            actual = actuals.get(account, 0)
            variances[account] = round(actual - planned, 2)
        return variances
