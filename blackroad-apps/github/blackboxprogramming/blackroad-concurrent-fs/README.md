# blackroad-concurrent-fs

Local-first prototype of a shard-aware, event-sourced, append-only filesystem runtime.

## Quick start

- Run unit tests: `python -m unittest`
- Run a small simulation:
  - `python -m brcfs.simulation.harness --root ./.brcfs-run --writers 100 --ops-per-writer 10`

## Core guarantees (v0)

- Content is stored as blobs addressed by SHA-256.
- All mutations are append-only operations (JSONL) per shard.
- Each shard has a single writer thread (many concurrent callers).
- State can be snapshotted and replayed from logs.

