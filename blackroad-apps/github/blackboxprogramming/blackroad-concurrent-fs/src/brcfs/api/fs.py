from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from brcfs.core.paths import normalize_logical_path
from brcfs.shards.coordinator import CoordinatorSet
from brcfs.storage.blobs import BlobStore


@dataclass(frozen=True, slots=True)
class PutResult:
    path: str
    blob_hash: str
    op_id: str
    shard_id: int
    seq: int


class ConcurrentFS:
    def __init__(self, root: Path, shard_count: int = 64):
        self._root = root
        self._root.mkdir(parents=True, exist_ok=True)
        self._blobs = BlobStore(root)
        self._coord = CoordinatorSet(root, shard_count=shard_count)

    @property
    def root(self) -> Path:
        return self._root

    def put_file(self, path: str, data: bytes, actor: str = "anonymous") -> PutResult:
        path = normalize_logical_path(path)
        blob = self._blobs.put(data)
        op = self._coord.put_binding(path=path, blob_hash=blob.hash, actor=actor)
        return PutResult(path=path, blob_hash=blob.hash, op_id=op.op_id, shard_id=op.shard_id, seq=op.seq)

    def get_file(self, path: str) -> bytes | None:
        path = normalize_logical_path(path)
        blob_hash = self._coord.get_binding(path)
        if not blob_hash:
            return None
        return self._blobs.get(blob_hash)

    def snapshot(self) -> None:
        self._coord.snapshot_all()

    def close(self) -> None:
        self._coord.stop()
