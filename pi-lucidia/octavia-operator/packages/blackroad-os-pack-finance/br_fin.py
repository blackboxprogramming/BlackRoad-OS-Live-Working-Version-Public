from __future__ import annotations

"""
BlackRoad Finance Pack CLI
Main entry point for finance pack operations.
"""

import sys
from decimal import Decimal
from datetime import datetime
from typing import Literal


class FinancePack:
    """Main CLI interface for BlackRoad Finance Pack."""
    
    def __init__(self):
        self.pack_id = "pack.finance"
        self.version = "0.1.0"
        self.agents = ["budgeteer", "reconcile", "forecast", "audit"]
    
    def info(self) -> dict:
        """Display pack information."""
        return {
            "pack_id": self.pack_id,
            "version": self.version,
            "agents": self.agents,
            "status": "active",
        }
    
    def list_agents(self) -> list[str]:
        """List available agents."""
        return self.agents
    
    def run_agent(self, agent_name: str, *args) -> None:
        """Run a specific agent."""
        if agent_name not in self.agents:
            print(f"Unknown agent: {agent_name}")
            print(f"Available agents: {', '.join(self.agents)}")
            return
        
        print(f"Running agent: {agent_name}")
        # Agent execution would be implemented here
        # TODO(cli): Implement agent execution logic
    
    def help(self) -> None:
        """Display help information."""
        print(f"""
BlackRoad Finance Pack v{self.version}

Usage:
  br_fin info              - Show pack information
  br_fin list              - List available agents
  br_fin run <agent> ...   - Run a specific agent
  br_fin help              - Show this help message

Available agents:
  {chr(10).join(f'  - {agent}' for agent in self.agents)}

Examples:
  br_fin run budgeteer check budget-001 5000.00
  br_fin run reconcile account-001 2024-01-01 2024-01-31
  br_fin run forecast revenue monthly
  br_fin run audit ledger.csv
        """.strip())


def main():
    """Main CLI entry point."""
    pack = FinancePack()
    
    if len(sys.argv) < 2:
        pack.help()
        return
    
    command = sys.argv[1]
    
    if command == "info":
        info = pack.info()
        print(f"Pack: {info['pack_id']}")
        print(f"Version: {info['version']}")
        print(f"Status: {info['status']}")
        print(f"Agents: {', '.join(info['agents'])}")
    
    elif command == "list":
        print("Available agents:")
        for agent in pack.list_agents():
            print(f"  - {agent}")
    
    elif command == "run":
        if len(sys.argv) < 3:
            print("Error: Agent name required")
            print("Usage: br_fin run <agent> [args...]")
            return
        
        agent_name = sys.argv[2]
        pack.run_agent(agent_name, *sys.argv[3:])
    
    elif command == "help":
        pack.help()
    
    else:
        print(f"Unknown command: {command}")
        pack.help()


if __name__ == "__main__":
    main()
import sqlite3
from pathlib import Path

import click
import pandas as pd

from lib import csv_utils
from models.budget_model import BudgetModel, BudgetLine

DB_PATH = Path(".tmp-ledgers.db")


def init_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ledger (
            date TEXT,
            account TEXT,
            debit REAL,
            credit REAL,
            description TEXT
        )
        """
    )
    conn.commit()


def import_ledgers(directory: Path) -> None:
    ledgers = csv_utils.load_ledgers(directory)
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    for ledger in ledgers:
        df = csv_utils.to_dataframe(ledger)
        df.to_sql("ledger", conn, if_exists="append", index=False)
    conn.close()


def ascii_chart(series: list[float]) -> str:
    if not series:
        return "(no data)"
    max_value = max(series)
    scale = 40 / max_value if max_value else 1
    lines = []
    for idx, value in enumerate(series, start=1):
        bar = "#" * int(value * scale)
        lines.append(f"M{idx}: {bar} {value:.2f}")
    return "\n".join(lines)


def forecast_cash_flow(months: int) -> list[float]:
    if not DB_PATH.exists():
        return [0.0 for _ in range(months)]
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT debit, credit FROM ledger", conn)
    conn.close()
    df["net"] = df["debit"] - df["credit"]
    rolling = df["net"].rolling(window=2, min_periods=1).mean()
    baseline = rolling.mean() if not rolling.empty else 0
    return [round(baseline * (1 + i * 0.01), 2) for i in range(months)]


def reconcile_file(path: Path) -> dict[str, float]:
    ledger = csv_utils.read_ledger_csv(path)
    return ledger.summary()


@click.group()
def cli() -> None:
    """FinancePack CLI for imports, reconciliation, and forecasting."""


@cli.command(name="import")
@click.argument("directory", type=click.Path(exists=True))
def import_(directory: str) -> None:
    """Import ledger CSVs into a temporary SQLite store."""
    dir_path = Path(directory)
    import_ledgers(dir_path)
    click.echo(f"Imported ledgers from {dir_path}")


@cli.command()
@click.argument("ledger_file", type=click.Path(exists=True))
def reconcile(ledger_file: str) -> None:
    """Reconcile a specific ledger file and print imbalance."""
    summary = reconcile_file(Path(ledger_file))
    click.echo(summary)


@cli.command()
@click.argument("target", type=click.Choice(["cash-flow"]))
@click.option("--months", default=3, show_default=True, help="Months to forecast")
def forecast(target: str, months: int) -> None:
    """Forecast cash flow with a simple rolling-average heuristic."""
    if target != "cash-flow":
        raise click.ClickException("Unsupported forecast target")
    series = forecast_cash_flow(months)
    click.echo("Cash-Flow Forecast")
    for idx, value in enumerate(series, start=1):
        click.echo(f"M{idx}: {value:.2f}")
    click.echo("\n" + ascii_chart(series))


@cli.command()
@click.option("--owner", default="finance@blackroad.os")
@click.option("--limit", default=1500.0)
def scaffold_budget(owner: str, limit: float) -> None:
    """Generate a starter budget JSON document."""
    model = BudgetModel(
        effective_date=pd.Timestamp("2025-11-01").date(),
        lines=[
            BudgetLine(account="Software Expense", monthly_limit=limit, owner=owner),
            BudgetLine(account="Security Expense", monthly_limit=limit * 0.5, owner=owner),
        ],
    )
    click.echo(model.json(indent=2))


if __name__ == "__main__":
    # TODO(fin-pack-next): add multi-currency flag and Stripe webhook trigger
    cli()
