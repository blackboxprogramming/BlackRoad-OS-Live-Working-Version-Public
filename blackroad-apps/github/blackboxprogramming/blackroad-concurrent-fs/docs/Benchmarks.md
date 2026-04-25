# Benchmarks & stress plan

## What to measure

- ops/sec per shard (append + apply)
- end-to-end put latency (blob write + op commit)
- replay time from snapshot + N ops
- snapshot time for M paths

## Stress harness

`python -m brcfs.simulation.harness` supports:
- writers (concurrent clients)
- ops per writer
- shard count
- payload size range

## Failure modes to test next

- mid-append crash (partial line)
- snapshot interruption
- blob corruption / missing blob
- shard writer restart with outstanding requests

