import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.csv_utils import load_ledgers  # noqa: E402


def test_load_ledgers(tmp_path: Path) -> None:
    sample = tmp_path / "sample.csv"
    sample.write_text(
        """date,account,debit,credit,description\n2025-11-24,Cash,10,,Seed\n2025-11-24,Equity,,10,Seed\n"""
    )
    ledgers = load_ledgers(tmp_path)
    assert len(ledgers) == 1
    summary = ledgers[0].summary()
    assert summary["imbalance"] == 0
