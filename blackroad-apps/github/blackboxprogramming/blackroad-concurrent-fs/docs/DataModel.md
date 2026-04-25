# Data model (v0)

## Blob

- `hash`: hex SHA-256
- `bytes`: immutable
- stored in: `blobs/sha256/<hh>/<hash>`

## Operation (JSONL per shard)

Common fields:
- `op_id`: UUID
- `ts_ns`: int (time in ns)
- `actor`: string
- `shard_id`: int
- `seq`: int (monotonic per shard, assigned by shard writer)

Types:
- `put`
  - `path`: string (absolute logical path, `/...`)
  - `blob_hash`: string (sha-256 hex)

## Snapshot (per shard)

- `shard_id`: int
- `last_seq`: int
- `map`: `{ path: blob_hash }`

