# Architecture

Goal: extremely high *logical* concurrency without shared-write corruption.

Key choices (v0):
- **Namespace is metadata**, not raw folders.
- **All mutations are operations/events first** (append-only per shard).
- **Single writer per shard** (serialized commits) with many concurrent callers.
- **Content-addressed blobs** (hash → bytes) separate from metadata.
- **Materialized view** (path → blob_hash) derived from snapshot + replay.

## Data plane

- Blob store: `sha256(bytes)` → file at `blobs/sha256/<prefix>/<hash>`
- Shard op log: JSONL append-only `shards/<id>/oplog.jsonl`
- Snapshot: periodic checkpoint `shards/<id>/snapshot.json`

## Control plane

- Shard coordinator set: routes ops to the right shard queue.
- Lease/lock model (v0 local): in-process single-writer thread per shard.
  - Future: cross-process leases via file locks or a small coordinator service.

## Write path (v0)

1. Client computes shard for `path`
2. Client writes content blob (dedupe by hash)
3. Client submits op `{type: "put", path, blob_hash, ...}`
4. Shard writer appends op to shard log (durable), then updates in-memory view

## Read path (v0)

- Read view mapping for shard, get `blob_hash`, stream blob bytes.

## Recovery (v0)

- Load snapshot (if present) → `{last_seq, map}`
- Replay log entries with `seq > last_seq` to rebuild view

## Non-goals (v0)

- Semantic merges, rename/move, permissions, multi-device leases.

