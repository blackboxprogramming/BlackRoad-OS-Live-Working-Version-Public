# AGENTS.md
## Mission
This repository implements a massively concurrent, event-sourced filesystem runtime for BlackRoad OS.

## Rules
- Do not directly mutate shared filesystem state from multiple agents.
- All writes become operations/events first (append-only).
- Preserve append-only logs unless a snapshot/compaction routine explicitly handles them.
- Favor correctness, auditability, replayability, and crash recovery over premature optimization.
- Keep content storage separate from namespace/metadata.
- Keep shard coordination explicit (single writer per shard).
- Prefer deterministic tests.
- Never hide assumptions.

## Architecture priorities
1. Single writer per shard
2. Many readers
3. Replayable state
4. Snapshot recovery
5. Conflict visibility
6. Isolated agent workspaces
7. Measurable performance

## Deliverables
- `docs/Architecture.md`
- `docs/DataModel.md`
- `docs/Recovery.md`
- `docs/Benchmarks.md`
- `src/`
- `tests/`
- `scripts/`

## Implementation bias
- Python-first core
- Clean interfaces
- Small modules
- No giant god objects
- No magic globals

## Done means
- Local simulation passes
- Replay restores state correctly
- Snapshot + recovery works
- Concurrent ops are serialized correctly at shard boundary
- Benchmarks and failure modes are documented

