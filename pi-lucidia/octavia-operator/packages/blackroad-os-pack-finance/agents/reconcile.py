from __future__ import annotations

from decimal import Decimal
from datetime import datetime
from typing import Protocol


class TransactionService(Protocol):
    """Protocol for transaction data access."""
    
    def get_transactions(self, account: str, start_date: datetime, end_date: datetime) -> list[dict]:
        """Retrieve transactions for an account in a date range."""
        ...


class Reconcile:
    """Agent for transaction reconciliation."""
    
    def __init__(self, transaction_service: TransactionService):
        self.transaction_service = transaction_service
        self.agent_id = "agent.reconcile"
        self.display_name = "Reconcile"
        self.pack_id = "pack.finance"
    
    def reconcile_account(self, account: str, expected_balance: Decimal, 
                         start_date: datetime, end_date: datetime) -> dict:
        """
        Reconcile account transactions against expected balance.
        
        Args:
            account: Account identifier
            expected_balance: Expected ending balance
            start_date: Start of reconciliation period
            end_date: End of reconciliation period
        
        Returns:
            Reconciliation report
        """
        transactions = self.transaction_service.get_transactions(account, start_date, end_date)
        
        calculated_balance = Decimal('0')
        for txn in transactions:
            amount = Decimal(txn['amount'])
            if txn['entry_type'] == 'credit':
                calculated_balance += amount
            else:
                calculated_balance -= amount
        
        variance = expected_balance - calculated_balance
        is_balanced = abs(variance) < Decimal('0.01')
        
        return {
            'account': account,
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'expected_balance': str(expected_balance),
            'calculated_balance': str(calculated_balance),
            'variance': str(variance),
            'is_balanced': is_balanced,
            'transaction_count': len(transactions),
            'reconciled_at': datetime.now().isoformat(),
        }


# CLI interface
if __name__ == "__main__":
    print("Reconcile agent initialized")
    # TODO(reconcile): Add CLI commands for reconciliation operations
from pathlib import Path

from lib.csv_utils import load_ledgers


def reconcile_file(path: Path) -> dict[str, float]:
    ledger = load_ledgers(path.parent)
    target = next((l for l in ledger if l.name == path.name), None)
    if target is None:
        raise FileNotFoundError(path)
    return target.summary()


def reconcile_directory(path: Path) -> list[dict[str, float]]:
    ledgers = load_ledgers(path)
    return [ledger.summary() for ledger in ledgers]


if __name__ == "__main__":
    result = reconcile_file(Path("ledgers/2025-11-24-general.csv"))
    print("Reconcile summary", result)
