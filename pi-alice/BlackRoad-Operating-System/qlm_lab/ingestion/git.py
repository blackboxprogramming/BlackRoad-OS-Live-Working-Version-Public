"""
Git Connector - Ingest git history into QLM

Converts git commits into QLM events:
- Commits by humans → OPERATOR_INTENT or HI events
- Commits by bots/agents → AGENT_EXECUTION events
- Merge commits → coordination events
"""

import subprocess
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from qlm_lab.models import (
    QLMEvent,
    EventType,
    IntelligenceType,
    ActorType,
    ActorRole,
    Actor,
)
from qlm_lab.api import QLMInterface

logger = logging.getLogger(__name__)


class GitConnector:
    """
    Connects QLM to git repository history.

    Usage:
        connector = GitConnector(repo_path="/path/to/repo", qlm=qlm_interface)
        events = connector.ingest_recent_commits(days=7)
    """

    def __init__(self, repo_path: str, qlm: QLMInterface):
        """
        Args:
            repo_path: Path to git repository
            qlm: QLMInterface instance
        """
        self.repo_path = repo_path
        self.qlm = qlm

        # Patterns to detect agent commits
        self.agent_patterns = [
            r"^claude/",  # Claude branches
            r"^copilot/",  # Copilot branches
            r"^codex/",  # Codex branches
            r"\[bot\]",  # Bot commit messages
            r"\[agent\]",  # Agent commit messages
        ]

    def is_agent_commit(self, commit_data: Dict[str, str]) -> bool:
        """Determine if a commit was made by an agent"""
        # Check author name/email
        author = commit_data.get("author", "").lower()
        if any(
            pattern in author
            for pattern in ["bot", "agent", "claude", "copilot", "codex"]
        ):
            return True

        # Check branch name
        branch = commit_data.get("branch", "")
        for pattern in self.agent_patterns:
            if re.search(pattern, branch):
                return True

        # Check commit message
        message = commit_data.get("message", "")
        if "[agent]" in message.lower() or "[bot]" in message.lower():
            return True

        return False

    def get_git_log(
        self, since: Optional[str] = None, until: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get git log as structured data.

        Args:
            since: Start date (e.g., "7 days ago")
            until: End date (e.g., "now")

        Returns:
            List of commit dictionaries
        """
        cmd = [
            "git",
            "-C",
            self.repo_path,
            "log",
            "--pretty=format:%H|%an|%ae|%at|%s|%b",
            "--all",
        ]

        if since:
            cmd.append(f"--since={since}")
        if until:
            cmd.append(f"--until={until}")

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True, timeout=30
            )

            commits = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue

                parts = line.split("|", 5)
                if len(parts) < 5:
                    continue

                commit_hash, author_name, author_email, timestamp, subject = parts[:5]
                body = parts[5] if len(parts) > 5 else ""

                commits.append(
                    {
                        "hash": commit_hash,
                        "author": author_name,
                        "email": author_email,
                        "timestamp": int(timestamp),
                        "subject": subject,
                        "body": body,
                        "message": f"{subject}\n{body}".strip(),
                    }
                )

            return commits

        except subprocess.CalledProcessError as e:
            logger.error(f"Git log failed: {e}")
            return []
        except subprocess.TimeoutExpired:
            logger.error("Git log timed out")
            return []

    def ingest_commit(self, commit: Dict[str, Any]) -> Optional[QLMEvent]:
        """
        Ingest a single commit into QLM.

        Args:
            commit: Commit data from get_git_log()

        Returns:
            Created QLMEvent or None
        """
        is_agent = self.is_agent_commit(commit)

        # Determine actor
        author = commit["author"]
        actor_id = (
            f"agent-{author.lower().replace(' ', '-')}"
            if is_agent
            else f"human-{author.lower().replace(' ', '-')}"
        )

        # Register actor if not exists
        actor_type = ActorType.AGENT if is_agent else ActorType.HUMAN

        # Create event
        if is_agent:
            # Agent commit = AGENT_EXECUTION
            event = self.qlm.record_agent_execution(
                agent_id=actor_id,
                task_description=commit["subject"],
                metadata={
                    "commit_hash": commit["hash"],
                    "commit_message": commit["message"],
                    "timestamp": commit["timestamp"],
                    "author": author,
                },
            )
        else:
            # Human commit = OPERATOR_INTENT (assuming commits reflect intent)
            event = self.qlm.record_operator_intent(
                intent=commit["subject"],
                description=commit["body"],
                metadata={
                    "commit_hash": commit["hash"],
                    "timestamp": commit["timestamp"],
                    "author": author,
                },
            )

        logger.info(f"Ingested commit: {commit['hash'][:8]} - {commit['subject']}")
        return event

    def ingest_recent_commits(self, days: int = 7) -> List[QLMEvent]:
        """
        Ingest recent commits into QLM.

        Args:
            days: Number of days to look back

        Returns:
            List of created QLMEvents
        """
        logger.info(f"Ingesting git commits from last {days} days...")

        commits = self.get_git_log(since=f"{days} days ago")
        events = []

        for commit in commits:
            event = self.ingest_commit(commit)
            if event:
                events.append(event)

        logger.info(f"Ingested {len(events)} commits")
        return events

    def ingest_commit_range(
        self, since: str, until: Optional[str] = None
    ) -> List[QLMEvent]:
        """
        Ingest commits in a specific range.

        Args:
            since: Start date (e.g., "2024-01-01")
            until: End date (default: now)

        Returns:
            List of created QLMEvents
        """
        commits = self.get_git_log(since=since, until=until)
        events = []

        for commit in commits:
            event = self.ingest_commit(commit)
            if event:
                events.append(event)

        logger.info(f"Ingested {len(events)} commits from {since} to {until or 'now'}")
        return events
