#!/usr/bin/env python3
"""
cece_git: Operator-friendly git reality helper for BlackRoad-Operating-Systems.

Usage examples (from repo root):

    python -m cece_git status
    python -m cece_git summary

This CLI does NOT require Warp and does NOT depend on QLM.
It simply reports git state in a way that makes sense to the Operator.
"""

from __future__ import annotations

import argparse
import subprocess
from dataclasses import dataclass
from typing import Optional


@dataclass
class GitHead:
    ref: str
    sha: str
    subject: str


@dataclass
class GitStatusSummary:
    local: Optional[GitHead]
    remote: Optional[GitHead]
    branch: Optional[str]
    ahead: int
    behind: int
    dirty: bool
    repo_path: str


def _run(cmd: list[str], cwd: str = ".") -> str:
    """Run a shell command and return stdout, or raise RuntimeError."""
    try:
        out = subprocess.check_output(cmd, cwd=cwd, stderr=subprocess.STDOUT)
        return out.decode("utf-8").strip()
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{e.output.decode('utf-8')}") from e


def _get_current_branch(cwd: str = ".") -> Optional[str]:
    try:
        return _run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=cwd)
    except RuntimeError:
        return None


def _get_head(ref: str, cwd: str = ".") -> Optional[GitHead]:
    """
    Get the HEAD info for a given ref (e.g. 'HEAD' or 'origin/main').
    Returns None if the ref doesn't exist.
    """
    try:
        fmt = "%H|%s"
        out = _run(["git", "log", "-1", f"--pretty=format:{fmt}", ref], cwd=cwd)
        sha, subject = out.split("|", 1)
        return GitHead(ref=ref, sha=sha, subject=subject)
    except Exception:
        return None


def _get_ahead_behind(branch: str, upstream: str, cwd: str = ".") -> tuple[int, int]:
    """
    Return (ahead, behind) between branch and upstream.
    If upstream doesn't exist, returns (0, 0).
    """
    try:
        out = _run(["git", "rev-list", "--left-right", "--count", f"{upstream}...{branch}"], cwd=cwd)
        behind_str, ahead_str = out.split()
        behind = int(behind_str)
        ahead = int(ahead_str)
        return ahead, behind
    except Exception:
        return (0, 0)


def _is_dirty(cwd: str = ".") -> bool:
    """True if working tree has uncommitted changes."""
    try:
        out = _run(["git", "status", "--porcelain"], cwd=cwd)
        return bool(out.strip())
    except RuntimeError:
        return False


def get_git_status_summary(cwd: str = ".") -> GitStatusSummary:
    """Collect a summary of git reality for the current repo."""
    branch = _get_current_branch(cwd=cwd)
    local_head = _get_head("HEAD", cwd=cwd)
    remote_head = _get_head("origin/main", cwd=cwd)
    dirty = _is_dirty(cwd=cwd)

    ahead = behind = 0
    if branch and remote_head is not None:
        ahead, behind = _get_ahead_behind(branch, "origin/main", cwd=cwd)

    return GitStatusSummary(
        local=local_head,
        remote=remote_head,
        branch=branch,
        ahead=ahead,
        behind=behind,
        dirty=dirty,
        repo_path=cwd,
    )


def cmd_status(args: argparse.Namespace) -> None:
    summary = get_git_status_summary(cwd=args.path)

    print(f"📂 Repo: {summary.repo_path}")
    if summary.branch is None:
        print("❌ Not a git repository or no current branch.")
        return

    print(f"🌿 Branch: {summary.branch}")
    if summary.local:
        print(f"  Local HEAD:  {summary.local.sha[:7]}  {summary.local.subject}")
    else:
        print("  Local HEAD:  (unavailable)")

    if summary.remote:
        print(f"  Remote HEAD: {summary.remote.sha[:7]}  {summary.remote.subject}")
    else:
        print("  Remote HEAD: (origin/main not found)")

    if summary.ahead == 0 and summary.behind == 0 and summary.remote:
        print("📡 Sync: local is in sync with origin/main")
    else:
        if summary.remote is None:
            print("📡 Sync: no origin/main to compare (or fetch first).")
        else:
            print(f"📡 Sync: ahead {summary.ahead}, behind {summary.behind}")

    print(f"🧼 Working tree: {'DIRTY' if summary.dirty else 'CLEAN'}")


def cmd_summary(args: argparse.Namespace) -> None:
    """Shorter output, more like a single-line Operator ping."""
    summary = get_git_status_summary(cwd=args.path)
    if summary.branch is None:
        print("❌ cece_git: not a git repo here.")
        return

    parts = []
    parts.append(f"{summary.branch}")
    if summary.local:
        parts.append(f"local {summary.local.sha[:7]}")
    if summary.remote:
        parts.append(f"origin {summary.remote.sha[:7]}")

    drift = []
    if summary.ahead:
        drift.append(f"↑{summary.ahead}")
    if summary.behind:
        drift.append(f"↓{summary.behind}")
    if drift:
        parts.append(f"({', '.join(drift)})")

    parts.append("DIRTY" if summary.dirty else "clean")

    print("cece_git:", " | ".join(parts))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="cece_git",
        description="Cece-flavored git reality helper for BlackRoad repos.",
    )
    parser.add_argument(
        "--path",
        "-C",
        default=".",
        help="Repo path (default: current directory)",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    p_status = subparsers.add_parser("status", help="Show detailed local vs origin/main status")
    p_status.set_defaults(func=cmd_status)

    p_summary = subparsers.add_parser("summary", help="Show a compact status summary")
    p_summary.set_defaults(func=cmd_summary)

    return parser


def main(argv: Optional[list[str]] = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
