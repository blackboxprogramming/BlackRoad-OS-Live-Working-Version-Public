from __future__ import annotations

import csv
from typing import Any, Protocol
from decimal import Decimal
from datetime import datetime
from pathlib import Path


class CSVReader(Protocol):
    """Protocol for CSV reading operations."""
    
    def read(self, path: Path) -> list[dict[str, Any]]:
        """Read CSV file and return list of dictionaries."""
        ...


class CSVWriter(Protocol):
    """Protocol for CSV writing operations."""
    
    def write(self, path: Path, data: list[dict[str, Any]]) -> None:
        """Write data to CSV file."""
        ...


def read_ledger_csv(path: Path) -> list[dict[str, Any]]:
    """Read ledger entries from CSV file."""
    entries = []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            entries.append({
                'id': row['id'],
                'timestamp': datetime.fromisoformat(row['timestamp']),
                'account': row['account'],
                'description': row['description'],
                'amount': Decimal(row['amount']),
                'currency': row.get('currency', 'USD'),
                'entry_type': row.get('entry_type', 'debit'),
                'category': row.get('category'),
            })
    return entries


def write_ledger_csv(path: Path, entries: list[dict[str, Any]]) -> None:
    """Write ledger entries to CSV file."""
    if not entries:
        return
    
    fieldnames = ['id', 'timestamp', 'account', 'description', 'amount', 
                  'currency', 'entry_type', 'category']
    
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for entry in entries:
            row = {
                'id': entry['id'],
                'timestamp': entry['timestamp'].isoformat() if isinstance(entry['timestamp'], datetime) else entry['timestamp'],
                'account': entry['account'],
                'description': entry['description'],
                'amount': str(entry['amount']),
                'currency': entry.get('currency', 'USD'),
                'entry_type': entry.get('entry_type', 'debit'),
                'category': entry.get('category', ''),
            }
            writer.writerow(row)
from pathlib import Path
from typing import Iterable, List

import pandas as pd

from models.ledger_entry import LedgerEntry, LedgerFile


def read_ledger_csv(path: Path) -> LedgerFile:
    rows: List[LedgerEntry] = []
    with path.open() as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(LedgerEntry(**row))
    return LedgerFile(name=path.name, entries=rows)


def load_ledgers(directory: Path) -> list[LedgerFile]:
    return [read_ledger_csv(path) for path in sorted(directory.glob("*.csv"))]


def to_dataframe(ledger: LedgerFile) -> pd.DataFrame:
    data = [entry.dict() for entry in ledger.entries]
    return pd.DataFrame(data)


def aggregate_balances(ledgers: Iterable[LedgerFile]) -> pd.DataFrame:
    frames = [to_dataframe(ledger) for ledger in ledgers]
    if not frames:
        return pd.DataFrame(columns=["account", "debit", "credit"])
    combined = pd.concat(frames, ignore_index=True)
    grouped = combined.groupby("account").agg({"debit": "sum", "credit": "sum"})
    grouped["net"] = grouped["debit"] - grouped["credit"]
    return grouped.reset_index()
