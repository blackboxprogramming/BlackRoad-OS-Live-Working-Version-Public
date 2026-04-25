from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from brcfs.core.hashing import sha256_hex


@dataclass(frozen=True, slots=True)
class BlobRef:
    hash: str
    size: int


class BlobStore:
    def __init__(self, root: Path):
        self._root = root
        self._blobs_root = root / "blobs" / "sha256"
        self._blobs_root.mkdir(parents=True, exist_ok=True)

    def blob_path(self, blob_hash: str) -> Path:
        prefix = blob_hash[:2]
        return self._blobs_root / prefix / blob_hash

    def put(self, data: bytes) -> BlobRef:
        blob_hash = sha256_hex(data)
        path = self.blob_path(blob_hash)
        path.parent.mkdir(parents=True, exist_ok=True)

        if path.exists():
            return BlobRef(hash=blob_hash, size=path.stat().st_size)

        tmp = path.with_suffix(".tmp")
        with open(tmp, "wb") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
        return BlobRef(hash=blob_hash, size=len(data))

    def get(self, blob_hash: str) -> bytes:
        path = self.blob_path(blob_hash)
        return path.read_bytes()

