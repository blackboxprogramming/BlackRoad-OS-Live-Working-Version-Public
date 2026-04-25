from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, TypedDict


OpType = Literal["put"]


class PutOpDict(TypedDict):
    type: Literal["put"]
    op_id: str
    ts_ns: int
    actor: str
    shard_id: int
    seq: int
    path: str
    blob_hash: str


@dataclass(frozen=True, slots=True)
class PutOp:
    op_id: str
    ts_ns: int
    actor: str
    shard_id: int
    seq: int
    path: str
    blob_hash: str

    def to_dict(self) -> PutOpDict:
        return {
            "type": "put",
            "op_id": self.op_id,
            "ts_ns": self.ts_ns,
            "actor": self.actor,
            "shard_id": self.shard_id,
            "seq": self.seq,
            "path": self.path,
            "blob_hash": self.blob_hash,
        }

    @staticmethod
    def from_dict(d: PutOpDict) -> "PutOp":
        return PutOp(
            op_id=d["op_id"],
            ts_ns=int(d["ts_ns"]),
            actor=d["actor"],
            shard_id=int(d["shard_id"]),
            seq=int(d["seq"]),
            path=d["path"],
            blob_hash=d["blob_hash"],
        )

