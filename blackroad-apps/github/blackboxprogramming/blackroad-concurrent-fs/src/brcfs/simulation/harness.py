from __future__ import annotations

import argparse
import os
import random
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from brcfs.api.fs import ConcurrentFS


def _rand_bytes(rng: random.Random, size: int) -> bytes:
    alphabet = string.ascii_letters + string.digits
    s = "".join(rng.choice(alphabet) for _ in range(size))
    return s.encode("utf-8")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="BRCFS concurrency simulation (v0)")
    p.add_argument("--root", required=True, help="runtime root dir (will be created)")
    p.add_argument("--writers", type=int, default=100, help="concurrent logical writers")
    p.add_argument("--ops-per-writer", type=int, default=10, help="ops per writer")
    p.add_argument("--shards", type=int, default=64, help="shard count")
    p.add_argument("--min-bytes", type=int, default=32)
    p.add_argument("--max-bytes", type=int, default=256)
    args = p.parse_args(argv)

    root = Path(args.root)
    root.mkdir(parents=True, exist_ok=True)

    fs = ConcurrentFS(root=root, shard_count=args.shards)

    t0 = time.perf_counter()

    def writer_task(writer_id: int) -> int:
        rng = random.Random(writer_id)
        ok = 0
        for i in range(args.ops_per_writer):
            size = rng.randint(args.min_bytes, args.max_bytes)
            data = _rand_bytes(rng, size)
            path = f"/users/{writer_id}/files/{i}.txt"
            fs.put_file(path, data, actor=f"writer:{writer_id}")
            ok += 1
        return ok

    max_workers = min(args.writers, (os.cpu_count() or 4) * 4)
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = [ex.submit(writer_task, w) for w in range(args.writers)]
        total_ok = 0
        for fut in as_completed(futures):
            total_ok += fut.result()

    fs.snapshot()
    fs.close()

    dt = time.perf_counter() - t0
    ops = args.writers * args.ops_per_writer
    rate = ops / dt if dt > 0 else 0.0
    print(f"writers={args.writers} ops={ops} shards={args.shards} seconds={dt:.3f} ops_per_sec={rate:.1f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

