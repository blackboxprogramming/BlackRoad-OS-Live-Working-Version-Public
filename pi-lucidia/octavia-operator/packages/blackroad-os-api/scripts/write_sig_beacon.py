"""Emit a small signature beacon for build pipelines."""

from __future__ import annotations

import json
import time
from pathlib import Path

BEACON_PATH = Path("public/sig.beacon.json")


def write_beacon() -> None:
    BEACON_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {"ts": int(time.time()), "agent": "API-Gen-0"}
    BEACON_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


if __name__ == "__main__":
    write_beacon()
    print(f"Wrote beacon to {BEACON_PATH}")
