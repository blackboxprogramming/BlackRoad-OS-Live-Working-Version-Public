# Recovery & replay (v0)

For each shard:
1. Load `snapshot.json` if present.
2. Open `oplog.jsonl`.
3. Replay each op with `seq > snapshot.last_seq`.
4. Materialized view is now the source for reads.

Crash-safety:
- An op is durable once appended and `fsync`’d.
- View is derived; losing in-memory state is acceptable.

