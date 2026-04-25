from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ShardView:
    shard_id: int
    last_seq: int = 0
    path_to_blob: dict[str, str] = field(default_factory=dict)

    def apply_put(self, path: str, blob_hash: str, seq: int) -> None:
        if seq <= self.last_seq:
            return
        self.path_to_blob[path] = blob_hash
        self.last_seq = seq

