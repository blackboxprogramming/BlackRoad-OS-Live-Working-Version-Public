from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path

from brcfs.views.materialized import ShardView


@dataclass(frozen=True, slots=True)
class ShardSnapshot:
    shard_id: int
    last_seq: int
    path_to_blob: dict[str, str]

    @staticmethod
    def from_view(view: ShardView) -> "ShardSnapshot":
        return ShardSnapshot(
            shard_id=view.shard_id, last_seq=view.last_seq, path_to_blob=dict(view.path_to_blob)
        )


class SnapshotStore:
    def __init__(self, shard_dir: Path):
        self._path = shard_dir / "snapshot.json"

    @property
    def path(self) -> Path:
        return self._path

    def load(self) -> ShardSnapshot | None:
        if not self._path.exists():
            return None
        d = json.loads(self._path.read_text(encoding="utf-8"))
        return ShardSnapshot(
            shard_id=int(d["shard_id"]),
            last_seq=int(d["last_seq"]),
            path_to_blob=dict(d["path_to_blob"]),
        )

    def save(self, snapshot: ShardSnapshot) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self._path.with_suffix(".tmp")
        data = json.dumps(asdict(snapshot), separators=(",", ":"), sort_keys=True)
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, self._path)

