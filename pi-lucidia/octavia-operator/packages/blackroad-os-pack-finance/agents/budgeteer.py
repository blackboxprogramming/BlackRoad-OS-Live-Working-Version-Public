from __future__ import annotations

from decimal import Decimal
from datetime import datetime
from typing import Protocol


class BudgetService(Protocol):
    """Protocol for budget management service."""
    
    def get_budget(self, budget_id: str) -> dict:
        """Retrieve budget by ID."""
        ...
    
    def update_spent(self, budget_id: str, amount: Decimal) -> None:
        """Update spent amount for a budget."""
        ...


class Budgeteer:
    """Agent for budget management and tracking."""
    
    def __init__(self, budget_service: BudgetService):
        self.budget_service = budget_service
        self.agent_id = "agent.budgeteer"
        self.display_name = "Budgeteer"
        self.pack_id = "pack.finance"
    
    def check_budget(self, budget_id: str, proposed_amount: Decimal) -> dict:
        """
        Check if a proposed expense fits within budget.
        
        Args:
            budget_id: ID of the budget to check
            proposed_amount: Amount of proposed expense
        
        Returns:
            Dictionary with approval status and details
        """
        budget = self.budget_service.get_budget(budget_id)
        allocated = Decimal(budget['allocated'])
        spent = Decimal(budget['spent'])
        remaining = allocated - spent
        
        approved = proposed_amount <= remaining
        
        return {
            'approved': approved,
            'budget_id': budget_id,
            'proposed_amount': str(proposed_amount),
            'remaining': str(remaining),
            'utilization': str((spent / allocated * 100) if allocated > 0 else 0),
            'timestamp': datetime.now().isoformat(),
        }
    
    def allocate_budget(self, name: str, amount: Decimal, period: str) -> dict:
        """
        Allocate a new budget.
        
        Args:
            name: Budget name
            amount: Allocated amount
            period: Budget period (monthly, quarterly, yearly)
        
        Returns:
            Dictionary with budget details
        """
        return {
            'name': name,
            'allocated': str(amount),
            'period': period,
            'created_at': datetime.now().isoformat(),
        }
    
    def generate_report(self, budget_id: str) -> dict:
        """Generate budget utilization report."""
        budget = self.budget_service.get_budget(budget_id)
        allocated = Decimal(budget['allocated'])
        spent = Decimal(budget['spent'])
        
        return {
            'budget_id': budget_id,
            'name': budget['name'],
            'allocated': str(allocated),
            'spent': str(spent),
            'remaining': str(allocated - spent),
            'utilization_pct': str((spent / allocated * 100) if allocated > 0 else 0),
            'period': budget['period'],
            'report_generated': datetime.now().isoformat(),
        }


# CLI interface
if __name__ == "__main__":
    import sys
    
    class MockBudgetService:
        """Mock budget service for testing."""
        
        def get_budget(self, budget_id: str) -> dict:
            return {
                'id': budget_id,
                'name': 'Q1 Operations',
                'allocated': '100000.00',
                'spent': '45000.00',
                'period': 'quarterly',
            }
        
        def update_spent(self, budget_id: str, amount: Decimal) -> None:
            pass
    
    budgeteer = Budgeteer(MockBudgetService())
    
    if len(sys.argv) > 1 and sys.argv[1] == 'check':
        result = budgeteer.check_budget('budget-001', Decimal('5000.00'))
        print(f"Budget check result: {result}")
    elif len(sys.argv) > 1 and sys.argv[1] == 'report':
        report = budgeteer.generate_report('budget-001')
        print(f"Budget report: {report}")
    else:
        print("Usage: python budgeteer.py [check|report]")
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Protocol, Dict, Any


class CostExplorerClient(Protocol):
    def get_cost_and_usage(self, **kwargs: Any) -> Dict[str, Any]:
        """Protocol for AWS Cost Explorer client."""


class Reporter(Protocol):
    def post(self, channel: str, message: str) -> None:
        """Protocol for posting messages to chat destinations."""


def _default_time_range(days_elapsed: int) -> Dict[str, str]:
    today = date.today()
    start = today - timedelta(days=days_elapsed)
    return {"Start": start.isoformat(), "End": today.isoformat()}


@dataclass
class BudgetForecast:
    current_spend: float
    burn_rate: float
    forecast_monthly: float
    percent_of_budget: float


class Budgeteer:
    """Forecasts burn rate and prepares weekly spending reports."""

    def __init__(self, budget_limit: float, slack_channel: str = "#finops") -> None:
        self.budget_limit = budget_limit
        self.slack_channel = slack_channel

    def get_month_to_date_spend(
        self,
        client: CostExplorerClient,
        days_elapsed: int,
        time_range: Dict[str, str] | None = None,
    ) -> float:
        """Fetch month-to-date spend from a Cost Explorer compatible client."""

        window = time_range or _default_time_range(days_elapsed)
        response = client.get_cost_and_usage(
            TimePeriod=window,
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
        )
        total = response.get("ResultsByTime", [{}])[0].get("Total", {})
        amount = total.get("UnblendedCost", {}).get("Amount", "0")
        try:
            return float(amount)
        except (TypeError, ValueError):
            return 0.0

    def forecast(self, current_spend: float, days_elapsed: int, days_in_month: int) -> BudgetForecast:
        if days_elapsed <= 0 or days_in_month <= 0:
            raise ValueError("days_elapsed and days_in_month must be positive")

        burn_rate = current_spend / days_elapsed
        forecast_monthly = burn_rate * days_in_month
        percent_of_budget = (forecast_monthly / self.budget_limit) * 100 if self.budget_limit else 0.0
        return BudgetForecast(
            current_spend=current_spend,
            burn_rate=burn_rate,
            forecast_monthly=forecast_monthly,
            percent_of_budget=percent_of_budget,
        )

    def build_weekly_report(
        self,
        client: CostExplorerClient,
        days_elapsed: int,
        days_in_month: int,
        reporter: Reporter | None = None,
    ) -> str:
        current_spend = self.get_month_to_date_spend(client, days_elapsed)
        forecast = self.forecast(current_spend, days_elapsed, days_in_month)

        report = (
            f"[finance-budgeteer] Week closeout — MTD spend: ${forecast.current_spend:,.2f}\n"
            f"Daily burn: ${forecast.burn_rate:,.2f}\n"
            f"Projected month-end: ${forecast.forecast_monthly:,.2f} ({forecast.percent_of_budget:,.1f}% of budget)"
        )

        if reporter:
            reporter.post(self.slack_channel, report)
        return report


__all__ = ["Budgeteer", "BudgetForecast", "CostExplorerClient", "Reporter"]
