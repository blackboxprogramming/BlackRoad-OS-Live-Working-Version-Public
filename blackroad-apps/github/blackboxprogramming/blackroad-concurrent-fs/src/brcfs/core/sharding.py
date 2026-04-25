from __future__ import annotations

import hashlib


def shard_for_path(path: str, shard_count: int) -> int:
    if shard_count <= 0:
        raise ValueError("shard_count must be > 0")
    digest = hashlib.sha256(path.encode("utf-8")).digest()
    value = int.from_bytes(digest[:8], "big", signed=False)
    return value % shard_count

