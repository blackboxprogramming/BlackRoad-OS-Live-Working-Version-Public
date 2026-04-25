from __future__ import annotations

import queue
import threading
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from brcfs.core.paths import normalize_logical_path
from brcfs.core.sharding import shard_for_path
from brcfs.ops.models import PutOp
from brcfs.replay.replay import load_shard_view
from brcfs.snapshots.snapshots import ShardSnapshot, SnapshotStore
from brcfs.storage.oplog import JsonlOpLog
from brcfs.views.materialized import ShardView


@dataclass(frozen=True, slots=True)
class PutRequest:
    path: str
    blob_hash: str
    actor: str
    ts_ns: int
    result: "queue.Queue[PutOp]"


class ShardWriter(threading.Thread):
    def __init__(self, shard_dir: Path, shard_id: int):
        super().__init__(name=f"shard-writer-{shard_id}", daemon=True)
        self._shard_dir = shard_dir
        self._shard_id = shard_id
        self._q: "queue.Queue[PutRequest | None]" = queue.Queue()
        self._stop = threading.Event()

        self._oplog = JsonlOpLog(shard_dir / "oplog.jsonl")
        self._snapshot_store = SnapshotStore(shard_dir)
        self._view = load_shard_view(shard_dir, shard_id)

        self._seq = self._view.last_seq

    @property
    def view(self) -> ShardView:
        return self._view

    def submit_put(self, req: PutRequest) -> None:
        self._q.put(req)

    def stop(self) -> None:
        self._stop.set()
        self._q.put(None)

    def snapshot(self) -> ShardSnapshot:
        snap = ShardSnapshot.from_view(self._view)
        self._snapshot_store.save(snap)
        return snap

    def run(self) -> None:
        while not self._stop.is_set():
            item = self._q.get()
            if item is None:
                return

            self._seq += 1
            op = PutOp(
                op_id=str(uuid.uuid4()),
                ts_ns=item.ts_ns,
                actor=item.actor,
                shard_id=self._shard_id,
                seq=self._seq,
                path=item.path,
                blob_hash=item.blob_hash,
            )
            self._oplog.append(op.to_dict())
            self._view.apply_put(op.path, op.blob_hash, op.seq)
            item.result.put(op)


class CoordinatorSet:
    def __init__(self, root: Path, shard_count: int = 64, clock_ns: Callable[[], int] | None = None):
        self._root = root
        self._shard_count = shard_count
        self._clock_ns = clock_ns or time.time_ns

        self._shards_root = root / "shards"
        self._shards_root.mkdir(parents=True, exist_ok=True)
        self._writers: dict[int, ShardWriter] = {}
        self._writers_lock = threading.Lock()

    @property
    def shard_count(self) -> int:
        return self._shard_count

    def _writer_for(self, shard_id: int) -> ShardWriter:
        with self._writers_lock:
            w = self._writers.get(shard_id)
            if w:
                return w
            shard_dir = self._shards_root / f"{shard_id:04d}"
            shard_dir.mkdir(parents=True, exist_ok=True)
            w = ShardWriter(shard_dir=shard_dir, shard_id=shard_id)
            w.start()
            self._writers[shard_id] = w
            return w

    def put_binding(self, path: str, blob_hash: str, actor: str) -> PutOp:
        path = normalize_logical_path(path)
        shard_id = shard_for_path(path, self._shard_count)
        writer = self._writer_for(shard_id)
        result_q: "queue.Queue[PutOp]" = queue.Queue(maxsize=1)
        req = PutRequest(path=path, blob_hash=blob_hash, actor=actor, ts_ns=self._clock_ns(), result=result_q)
        writer.submit_put(req)
        return result_q.get()

    def get_binding(self, path: str) -> str | None:
        path = normalize_logical_path(path)
        shard_id = shard_for_path(path, self._shard_count)
        with self._writers_lock:
            writer = self._writers.get(shard_id)
        if writer:
            return writer.view.path_to_blob.get(path)

        shard_dir = self._shards_root / f"{shard_id:04d}"
        if not shard_dir.exists():
            return None
        view = load_shard_view(shard_dir, shard_id)
        return view.path_to_blob.get(path)

    def snapshot_all(self) -> list[ShardSnapshot]:
        snaps: list[ShardSnapshot] = []
        with self._writers_lock:
            writers = list(self._writers.values())
        for w in writers:
            snaps.append(w.snapshot())
        return snaps

    def stop(self) -> None:
        with self._writers_lock:
            writers = list(self._writers.values())
            self._writers.clear()
        for w in writers:
            w.stop()
        for w in writers:
            w.join(timeout=5.0)
