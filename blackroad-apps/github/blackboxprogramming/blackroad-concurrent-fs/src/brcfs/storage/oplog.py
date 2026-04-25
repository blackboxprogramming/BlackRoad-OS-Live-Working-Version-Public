from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator


@dataclass(frozen=True, slots=True)
class LogAppendResult:
    seq: int


class JsonlOpLog:
    def __init__(self, path: Path):
        self._path = path
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if not self._path.exists():
            self._path.write_text("", encoding="utf-8")

    @property
    def path(self) -> Path:
        return self._path

    def iter_lines(self) -> Iterator[dict]:
        with open(self._path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    # v0 behavior: stop at first corrupt/partial line (treat as tail truncation).
                    return

    def append(self, record: dict) -> None:
        data = json.dumps(record, separators=(",", ":"), sort_keys=True)
        with open(self._path, "a", encoding="utf-8") as f:
            f.write(data)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())

    def append_many(self, records: Iterable[dict]) -> None:
        with open(self._path, "a", encoding="utf-8") as f:
            for record in records:
                data = json.dumps(record, separators=(",", ":"), sort_keys=True)
                f.write(data)
                f.write("\n")
            f.flush()
            os.fsync(f.fileno())

