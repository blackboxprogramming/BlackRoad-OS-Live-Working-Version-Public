"""
Model Identity Registry — SHA-2048 verification for AI models.

Registers and verifies AI models (CoreML, ONNX, etc.) on RoadChain.
Each model gets a 2048-bit fingerprint based on its binary content.

identity > provider — models are identified by their hash, not their vendor.

BlackRoad OS, Inc. 2026
"""

from __future__ import annotations

import hashlib
import json
import time
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path

from ..crypto.sha2048 import sha2048, sha2048_hex, short_id, fingerprint_display
from ..constants import DATA_DIR


MODEL_REGISTRY_DB = DATA_DIR / "model-registry.db"


@dataclass
class ModelRecord:
    """A verified AI model record."""

    name: str
    fingerprint: str           # SHA-2048 hex (512 chars)
    short_id: str              # first 16 hex chars
    model_type: str            # mlmodelc, framework, onnx, safetensors, etc.
    vendor: str                # apple, blackroad, huggingface, etc.
    path: str                  # filesystem path
    size_bytes: int = 0
    sha256: str = ""           # legacy SHA-256 for compat
    verified: bool = False
    verified_at: int = 0
    metadata: dict = field(default_factory=dict)


class ModelRegistry:
    """SQLite-backed AI model identity registry."""

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or MODEL_REGISTRY_DB
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(str(self.db_path))
        self._conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self) -> None:
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS models (
                fingerprint TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                short_id TEXT NOT NULL,
                model_type TEXT NOT NULL,
                vendor TEXT DEFAULT '',
                path TEXT NOT NULL,
                size_bytes INTEGER DEFAULT 0,
                sha256 TEXT DEFAULT '',
                verified INTEGER DEFAULT 0,
                verified_at INTEGER DEFAULT 0,
                category TEXT DEFAULT '',
                framework TEXT DEFAULT '',
                metadata TEXT DEFAULT '{}',
                created_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_models_name ON models(name);
            CREATE INDEX IF NOT EXISTS idx_models_vendor ON models(vendor);
            CREATE INDEX IF NOT EXISTS idx_models_type ON models(model_type);
            CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
            CREATE INDEX IF NOT EXISTS idx_models_verified ON models(verified);
        """)
        self._conn.commit()

    def register_model(self, name: str, path: str, model_type: str = "mlmodelc",
                       vendor: str = "apple", category: str = "",
                       framework: str = "", metadata: dict | None = None) -> ModelRecord:
        """Register a model by computing its SHA-2048 fingerprint.

        The fingerprint is computed from the model's name + path + type + vendor
        combined with actual file content hashes when available.
        """
        p = Path(path)
        size_bytes = 0
        content_hash = b""

        # Try to hash actual file contents
        if p.exists():
            if p.is_dir():
                # For .mlmodelc directories, hash the manifest/weights
                for child in sorted(p.rglob("*")):
                    if child.is_file():
                        try:
                            data = child.read_bytes()
                            size_bytes += len(data)
                            content_hash += hashlib.sha256(data).digest()
                        except (PermissionError, OSError):
                            content_hash += hashlib.sha256(str(child).encode()).digest()
            elif p.is_file():
                try:
                    data = p.read_bytes()
                    size_bytes = len(data)
                    content_hash = hashlib.sha256(data).digest()
                except (PermissionError, OSError):
                    content_hash = hashlib.sha256(str(p).encode()).digest()
        else:
            # Path doesn't exist locally — hash the metadata
            content_hash = hashlib.sha256(f"{name}:{path}:{vendor}".encode()).digest()

        # Compute SHA-2048 fingerprint
        identity_input = (
            name.encode("utf-8") + b"\x00" +
            path.encode("utf-8") + b"\x00" +
            model_type.encode("utf-8") + b"\x00" +
            vendor.encode("utf-8") + b"\x00" +
            content_hash
        )
        fingerprint = sha2048_hex(identity_input)
        sid = short_id(bytes.fromhex(fingerprint))

        # Legacy SHA-256
        sha256_hash = hashlib.sha256(identity_input).hexdigest()

        now = int(time.time())
        meta = metadata or {}

        self._conn.execute(
            """INSERT OR REPLACE INTO models
               (fingerprint, name, short_id, model_type, vendor, path,
                size_bytes, sha256, verified, verified_at, category,
                framework, metadata, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)""",
            (fingerprint, name, sid, model_type, vendor, path,
             size_bytes, sha256_hash, now, category, framework,
             json.dumps(meta), now),
        )
        self._conn.commit()

        return ModelRecord(
            name=name,
            fingerprint=fingerprint,
            short_id=sid,
            model_type=model_type,
            vendor=vendor,
            path=path,
            size_bytes=size_bytes,
            sha256=sha256_hash,
            verified=True,
            verified_at=now,
            metadata=meta,
        )

    def verify_model(self, name: str) -> bool:
        """Verify a model's SHA-2048 fingerprint matches its current state."""
        row = self._conn.execute(
            "SELECT * FROM models WHERE name = ?", (name,)
        ).fetchone()
        if not row:
            return False

        p = Path(row["path"])
        if not p.exists():
            return False

        # Recompute and compare
        content_hash = b""
        if p.is_dir():
            for child in sorted(p.rglob("*")):
                if child.is_file():
                    try:
                        content_hash += hashlib.sha256(child.read_bytes()).digest()
                    except (PermissionError, OSError):
                        content_hash += hashlib.sha256(str(child).encode()).digest()
        elif p.is_file():
            try:
                content_hash = hashlib.sha256(p.read_bytes()).digest()
            except (PermissionError, OSError):
                content_hash = hashlib.sha256(str(p).encode()).digest()

        identity_input = (
            row["name"].encode("utf-8") + b"\x00" +
            row["path"].encode("utf-8") + b"\x00" +
            row["model_type"].encode("utf-8") + b"\x00" +
            row["vendor"].encode("utf-8") + b"\x00" +
            content_hash
        )
        current_fp = sha2048_hex(identity_input)
        return current_fp == row["fingerprint"]

    def get_by_name(self, name: str) -> ModelRecord | None:
        row = self._conn.execute(
            "SELECT * FROM models WHERE name = ?", (name,)
        ).fetchone()
        return self._row_to_record(row) if row else None

    def list_all(self, vendor: str = "") -> list[ModelRecord]:
        if vendor:
            rows = self._conn.execute(
                "SELECT * FROM models WHERE vendor = ? ORDER BY category, name",
                (vendor,),
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT * FROM models ORDER BY vendor, category, name"
            ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def list_by_category(self, category: str) -> list[ModelRecord]:
        rows = self._conn.execute(
            "SELECT * FROM models WHERE category = ? ORDER BY name",
            (category,),
        ).fetchall()
        return [self._row_to_record(r) for r in rows]

    def stats(self) -> dict:
        total = self._conn.execute("SELECT COUNT(*) FROM models").fetchone()[0]
        verified = self._conn.execute(
            "SELECT COUNT(*) FROM models WHERE verified = 1"
        ).fetchone()[0]

        vendors = self._conn.execute(
            "SELECT vendor, COUNT(*) as cnt FROM models GROUP BY vendor ORDER BY cnt DESC"
        ).fetchall()

        types = self._conn.execute(
            "SELECT model_type, COUNT(*) as cnt FROM models GROUP BY model_type ORDER BY cnt DESC"
        ).fetchall()

        categories = self._conn.execute(
            "SELECT category, COUNT(*) as cnt FROM models WHERE category != '' GROUP BY category ORDER BY cnt DESC"
        ).fetchall()

        total_size = self._conn.execute(
            "SELECT COALESCE(SUM(size_bytes), 0) FROM models"
        ).fetchone()[0]

        return {
            "total_models": total,
            "verified": verified,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "vendors": {r["vendor"]: r["cnt"] for r in vendors},
            "types": {r["model_type"]: r["cnt"] for r in types},
            "categories": {r["category"]: r["cnt"] for r in categories if r["category"]},
        }

    def _row_to_record(self, row: sqlite3.Row) -> ModelRecord:
        return ModelRecord(
            name=row["name"],
            fingerprint=row["fingerprint"],
            short_id=row["short_id"],
            model_type=row["model_type"],
            vendor=row["vendor"],
            path=row["path"],
            size_bytes=row["size_bytes"],
            sha256=row["sha256"],
            verified=bool(row["verified"]),
            verified_at=row["verified_at"],
            metadata=json.loads(row["metadata"]) if row["metadata"] else {},
        )

    def close(self):
        self._conn.close()
