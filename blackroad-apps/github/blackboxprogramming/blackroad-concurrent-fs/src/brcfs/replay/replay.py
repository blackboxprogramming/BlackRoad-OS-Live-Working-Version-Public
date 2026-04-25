from __future__ import annotations

from pathlib import Path

from brcfs.ops.models import PutOp
from brcfs.snapshots.snapshots import SnapshotStore
from brcfs.storage.oplog import JsonlOpLog
from brcfs.views.materialized import ShardView


def load_shard_view(shard_dir: Path, shard_id: int) -> ShardView:
    snapshot = SnapshotStore(shard_dir).load()
    view = ShardView(shard_id=shard_id)
    if snapshot:
        view.last_seq = snapshot.last_seq
        view.path_to_blob = dict(snapshot.path_to_blob)

    oplog = JsonlOpLog(shard_dir / "oplog.jsonl")
    for d in oplog.iter_lines():
        if d.get("type") != "put":
            continue
        op = PutOp.from_dict(d)  # type: ignore[arg-type]
        if op.seq <= view.last_seq:
            continue
        view.apply_put(op.path, op.blob_hash, op.seq)
    return view

