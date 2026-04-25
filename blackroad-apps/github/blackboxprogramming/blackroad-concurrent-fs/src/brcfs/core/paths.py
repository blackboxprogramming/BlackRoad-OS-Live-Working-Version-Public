from __future__ import annotations


def normalize_logical_path(path: str) -> str:
    if not path:
        raise ValueError("path is empty")
    if not path.startswith("/"):
        raise ValueError("logical paths must be absolute (start with '/')")
    if "//" in path:
        while "//" in path:
            path = path.replace("//", "/")
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")
    return path

