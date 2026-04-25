"""
RoadPad Git Integration - Version control from the editor.

Features:
- Status view
- Diff view
- Commit from editor
- Branch switching
- Log view
"""

import subprocess
import os
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class GitStatus:
    """Git repository status."""
    is_repo: bool = False
    branch: str = ""
    ahead: int = 0
    behind: int = 0
    staged: List[str] = None
    modified: List[str] = None
    untracked: List[str] = None
    conflicts: List[str] = None

    def __post_init__(self):
        self.staged = self.staged or []
        self.modified = self.modified or []
        self.untracked = self.untracked or []
        self.conflicts = self.conflicts or []

    @property
    def is_clean(self) -> bool:
        return not (self.staged or self.modified or self.untracked or self.conflicts)

    @property
    def summary(self) -> str:
        if not self.is_repo:
            return "not a repo"
        parts = [self.branch]
        if self.ahead:
            parts.append(f"↑{self.ahead}")
        if self.behind:
            parts.append(f"↓{self.behind}")
        if self.staged:
            parts.append(f"+{len(self.staged)}")
        if self.modified:
            parts.append(f"~{len(self.modified)}")
        if self.untracked:
            parts.append(f"?{len(self.untracked)}")
        if self.conflicts:
            parts.append(f"!{len(self.conflicts)}")
        return " ".join(parts)


@dataclass
class GitCommit:
    """A git commit."""
    hash: str
    short_hash: str
    author: str
    date: str
    message: str


class Git:
    """Git operations."""

    def __init__(self, path: str | None = None):
        self.path = path or os.getcwd()

    def _run(self, *args, cwd: str | None = None) -> Tuple[str, str, int]:
        """Run git command."""
        try:
            result = subprocess.run(
                ["git"] + list(args),
                cwd=cwd or self.path,
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout.strip(), result.stderr.strip(), result.returncode
        except subprocess.TimeoutExpired:
            return "", "timeout", 1
        except Exception as e:
            return "", str(e), 1

    def is_repo(self) -> bool:
        """Check if current directory is a git repo."""
        _, _, code = self._run("rev-parse", "--git-dir")
        return code == 0

    def status(self) -> GitStatus:
        """Get repository status."""
        if not self.is_repo():
            return GitStatus(is_repo=False)

        status = GitStatus(is_repo=True)

        # Branch
        out, _, _ = self._run("branch", "--show-current")
        status.branch = out or "HEAD"

        # Ahead/behind
        out, _, _ = self._run("rev-list", "--left-right", "--count", f"{status.branch}...@{{u}}")
        if out:
            parts = out.split()
            if len(parts) == 2:
                status.ahead = int(parts[0])
                status.behind = int(parts[1])

        # File status
        out, _, _ = self._run("status", "--porcelain")
        for line in out.split("\n"):
            if not line:
                continue
            code = line[:2]
            filepath = line[3:]

            if code == "??":
                status.untracked.append(filepath)
            elif code[0] in "MADRC":
                status.staged.append(filepath)
            elif code[1] in "MD":
                status.modified.append(filepath)
            elif code in ("UU", "AA", "DD"):
                status.conflicts.append(filepath)

        return status

    def diff(self, filepath: str | None = None, staged: bool = False) -> str:
        """Get diff."""
        args = ["diff"]
        if staged:
            args.append("--staged")
        if filepath:
            args.append("--")
            args.append(filepath)
        out, _, _ = self._run(*args)
        return out

    def log(self, n: int = 10) -> List[GitCommit]:
        """Get commit log."""
        out, _, code = self._run(
            "log", f"-{n}",
            "--format=%H|%h|%an|%ar|%s"
        )
        if code != 0:
            return []

        commits = []
        for line in out.split("\n"):
            if not line:
                continue
            parts = line.split("|", 4)
            if len(parts) == 5:
                commits.append(GitCommit(
                    hash=parts[0],
                    short_hash=parts[1],
                    author=parts[2],
                    date=parts[3],
                    message=parts[4]
                ))
        return commits

    def branches(self) -> List[Tuple[str, bool]]:
        """List branches. Returns (name, is_current)."""
        out, _, _ = self._run("branch", "-a")
        branches = []
        for line in out.split("\n"):
            if not line:
                continue
            is_current = line.startswith("*")
            name = line.lstrip("* ").strip()
            branches.append((name, is_current))
        return branches

    def checkout(self, branch: str) -> Tuple[bool, str]:
        """Checkout branch."""
        _, err, code = self._run("checkout", branch)
        return code == 0, err

    def add(self, filepath: str | None = None) -> Tuple[bool, str]:
        """Stage file(s)."""
        if filepath:
            _, err, code = self._run("add", filepath)
        else:
            _, err, code = self._run("add", "-A")
        return code == 0, err

    def commit(self, message: str) -> Tuple[bool, str]:
        """Create commit."""
        _, err, code = self._run("commit", "-m", message)
        return code == 0, err

    def push(self) -> Tuple[bool, str]:
        """Push to remote."""
        _, err, code = self._run("push")
        return code == 0, err

    def pull(self) -> Tuple[bool, str]:
        """Pull from remote."""
        _, err, code = self._run("pull")
        return code == 0, err

    def stash(self, pop: bool = False) -> Tuple[bool, str]:
        """Stash or pop."""
        cmd = "pop" if pop else "push"
        _, err, code = self._run("stash", cmd)
        return code == 0, err

    def format_status(self) -> str:
        """Format status for display."""
        status = self.status()
        if not status.is_repo:
            return "Not a git repository"

        lines = [
            f"Branch: {status.branch}",
            ""
        ]

        if status.ahead or status.behind:
            lines.append(f"↑{status.ahead} ↓{status.behind} vs upstream")
            lines.append("")

        if status.staged:
            lines.append("[Staged]")
            for f in status.staged[:10]:
                lines.append(f"  + {f}")
            if len(status.staged) > 10:
                lines.append(f"  ... and {len(status.staged) - 10} more")
            lines.append("")

        if status.modified:
            lines.append("[Modified]")
            for f in status.modified[:10]:
                lines.append(f"  ~ {f}")
            if len(status.modified) > 10:
                lines.append(f"  ... and {len(status.modified) - 10} more")
            lines.append("")

        if status.untracked:
            lines.append("[Untracked]")
            for f in status.untracked[:10]:
                lines.append(f"  ? {f}")
            if len(status.untracked) > 10:
                lines.append(f"  ... and {len(status.untracked) - 10} more")
            lines.append("")

        if status.conflicts:
            lines.append("[Conflicts]")
            for f in status.conflicts:
                lines.append(f"  ! {f}")
            lines.append("")

        if status.is_clean:
            lines.append("Working tree clean")

        return "\n".join(lines)

    def format_log(self, n: int = 10) -> str:
        """Format log for display."""
        commits = self.log(n)
        if not commits:
            return "No commits"

        lines = []
        for c in commits:
            lines.append(f"{c.short_hash} {c.message[:50]}")
            lines.append(f"       {c.author}, {c.date}")
            lines.append("")

        return "\n".join(lines)


# Global git instance
_git: Git | None = None

def get_git() -> Git:
    """Get global git instance."""
    global _git
    if _git is None:
        _git = Git()
    return _git
