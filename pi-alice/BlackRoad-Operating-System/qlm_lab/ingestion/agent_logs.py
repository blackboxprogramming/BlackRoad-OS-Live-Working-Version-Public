"""
Agent Log Connector - Ingest agent execution logs into QLM

Parses agent logs and converts them into QLM events.
"""

import json
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from qlm_lab.models import EventType, ActorRole
from qlm_lab.api import QLMInterface

logger = logging.getLogger(__name__)


class AgentLogConnector:
    """
    Connects QLM to agent execution logs.

    Usage:
        connector = AgentLogConnector(qlm=qlm_interface)
        connector.ingest_log_file("/path/to/agent.log")
    """

    def __init__(self, qlm: QLMInterface):
        """
        Args:
            qlm: QLMInterface instance
        """
        self.qlm = qlm

    def parse_log_line(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Parse a log line into structured data.

        Expects format: [timestamp] [agent_id] [level] message

        Args:
            line: Log line string

        Returns:
            Parsed log data or None
        """
        # Example: [2024-01-15 10:30:45] [agent-coder-001] [INFO] Task started: implement login
        pattern = r"\[([^\]]+)\]\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.+)"
        match = re.match(pattern, line)

        if not match:
            return None

        timestamp_str, agent_id, level, message = match.groups()

        try:
            timestamp = datetime.fromisoformat(timestamp_str)
        except ValueError:
            timestamp = datetime.now()

        return {
            "timestamp": timestamp,
            "agent_id": agent_id.strip(),
            "level": level.strip(),
            "message": message.strip(),
        }

    def ingest_log_line(self, log_data: Dict[str, Any]) -> Optional[Any]:
        """
        Ingest a parsed log line into QLM.

        Args:
            log_data: Parsed log data from parse_log_line()

        Returns:
            Created QLMEvent or None
        """
        agent_id = log_data["agent_id"]
        message = log_data["message"]

        # Register agent if not exists
        # (In production, would check if already registered)

        # Detect event type from message
        message_lower = message.lower()

        if "task started" in message_lower or "executing" in message_lower:
            # Extract task description
            task_desc = message.split(":", 1)[1].strip() if ":" in message else message

            return self.qlm.record_agent_execution(
                agent_id=agent_id,
                task_description=task_desc,
                metadata={"log_timestamp": log_data["timestamp"].isoformat()},
            )

        elif "task completed" in message_lower or "finished" in message_lower:
            # Extract task ID if present
            task_id = self._extract_task_id(message)

            return self.qlm.record_agent_completion(
                agent_id=agent_id,
                task_id=task_id or "unknown",
                success=True,
                result={"message": message},
            )

        elif "error" in message_lower or "failed" in message_lower:
            task_id = self._extract_task_id(message)

            return self.qlm.record_agent_error(
                agent_id=agent_id,
                task_id=task_id or "unknown",
                error=message,
            )

        elif "handoff" in message_lower or "passing to" in message_lower:
            # Extract target agent
            to_agent = self._extract_target_agent(message)
            task_id = self._extract_task_id(message)

            if to_agent:
                return self.qlm.record_agent_handoff(
                    from_agent_id=agent_id,
                    to_agent_id=to_agent,
                    task_id=task_id or "unknown",
                    handoff_message=message,
                )

        return None

    def _extract_task_id(self, message: str) -> Optional[str]:
        """Extract task ID from message if present"""
        # Look for task-XXX or task_XXX pattern
        match = re.search(r"task[_-](\w+)", message.lower())
        if match:
            return f"task-{match.group(1)}"
        return None

    def _extract_target_agent(self, message: str) -> Optional[str]:
        """Extract target agent ID from handoff message"""
        # Look for "to agent-XXX" or "→ agent-XXX"
        match = re.search(r"(?:to|→)\s+(agent-[\w-]+)", message.lower())
        if match:
            return match.group(1)
        return None

    def ingest_log_file(self, file_path: str) -> List[Any]:
        """
        Ingest an entire log file.

        Args:
            file_path: Path to log file

        Returns:
            List of created QLMEvents
        """
        events = []

        try:
            with open(file_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    log_data = self.parse_log_line(line)
                    if log_data:
                        event = self.ingest_log_line(log_data)
                        if event:
                            events.append(event)

            logger.info(f"Ingested {len(events)} events from {file_path}")
            return events

        except FileNotFoundError:
            logger.error(f"Log file not found: {file_path}")
            return []
        except Exception as e:
            logger.error(f"Error ingesting log file: {e}")
            return []

    def ingest_structured_log(self, log_entries: List[Dict[str, Any]]) -> List[Any]:
        """
        Ingest structured log entries (e.g., from JSON logs).

        Args:
            log_entries: List of log entry dictionaries

        Returns:
            List of created QLMEvents
        """
        events = []

        for entry in log_entries:
            # Convert to standard format
            log_data = {
                "timestamp": datetime.fromisoformat(entry.get("timestamp", datetime.now().isoformat())),
                "agent_id": entry.get("agent_id", "unknown"),
                "level": entry.get("level", "INFO"),
                "message": entry.get("message", ""),
            }

            event = self.ingest_log_line(log_data)
            if event:
                events.append(event)

        logger.info(f"Ingested {len(events)} structured log entries")
        return events
