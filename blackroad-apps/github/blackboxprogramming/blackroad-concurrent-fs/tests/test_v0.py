from __future__ import annotations

import json
import tempfile
import threading
import unittest
from pathlib import Path

from brcfs.api.fs import ConcurrentFS
from brcfs.core.sharding import shard_for_path


class TestV0(unittest.TestCase):
    def test_put_get_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td) / "runtime"
            fs = ConcurrentFS(root=root, shard_count=8)
            fs.put_file("/a/b/c.txt", b"hello", actor="t")
            got = fs.get_file("/a/b/c.txt")
            self.assertEqual(got, b"hello")
            fs.close()

    def test_snapshot_and_replay(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td) / "runtime"
            fs = ConcurrentFS(root=root, shard_count=8)
            fs.put_file("/x/y.txt", b"one", actor="t")
            fs.snapshot()
            fs.close()

            fs2 = ConcurrentFS(root=root, shard_count=8)
            got = fs2.get_file("/x/y.txt")
            self.assertEqual(got, b"one")
            fs2.close()

    def test_single_writer_seq_per_shard(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td) / "runtime"
            shard_count = 2
            fs = ConcurrentFS(root=root, shard_count=shard_count)

            target_shard = 0
            paths: list[str] = []
            i = 0
            while len(paths) < 50:
                p = f"/users/u/files/{i}.txt"
                if shard_for_path(p, shard_count) == target_shard:
                    paths.append(p)
                i += 1

            def do_put(p: str) -> None:
                fs.put_file(p, f"data:{p}".encode("utf-8"), actor="w")

            threads = [threading.Thread(target=do_put, args=(p,)) for p in paths]
            for t in threads:
                t.start()
            for t in threads:
                t.join()

            fs.close()

            shard_dir = root / "shards" / f"{target_shard:04d}"
            oplog = shard_dir / "oplog.jsonl"
            self.assertTrue(oplog.exists())

            seqs: list[int] = []
            with open(oplog, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    d = json.loads(line)
                    seqs.append(int(d["seq"]))

            self.assertEqual(len(seqs), len(paths))
            self.assertEqual(sorted(seqs), list(range(1, len(paths) + 1)))


if __name__ == "__main__":
    unittest.main()

