"""Task executor for Pi Agent."""

from __future__ import annotations

import asyncio
import logging
import shlex
import subprocess
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4

from .config import ExecutorConfig


logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    """Task execution status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


@dataclass
class TaskResult:
    """Result of task execution."""
    task_id: str
    status: TaskStatus
    exit_code: Optional[int] = None
    stdout: str = ""
    stderr: str = ""
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    error: Optional[str] = None

    @property
    def duration(self) -> Optional[float]:
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "status": self.status.value,
            "exit_code": self.exit_code,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration": self.duration,
            "error": self.error,
        }


@dataclass
class Task:
    """Task to be executed."""
    task_id: str
    task_type: str
    payload: Dict[str, Any]
    created_at: float = field(default_factory=time.time)
    timeout: Optional[float] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        return cls(
            task_id=data.get("task_id", str(uuid4())),
            task_type=data.get("type", "shell"),
            payload=data.get("payload", {}),
            timeout=data.get("timeout"),
        )


class Executor:
    """Executes tasks received from the operator."""

    def __init__(self, config: ExecutorConfig) -> None:
        self.config = config
        self._running_tasks: Dict[str, asyncio.Task] = {}
        self._results: Dict[str, TaskResult] = {}
        self._semaphore = asyncio.Semaphore(config.max_concurrent_tasks)
        self._handlers: Dict[str, Callable] = {
            "shell": self._execute_shell,
            "script": self._execute_script,
            "python": self._execute_python,
            "file_read": self._execute_file_read,
            "file_write": self._execute_file_write,
            "service": self._execute_service,
        }

    def register_handler(self, task_type: str, handler: Callable) -> None:
        """Register a custom task handler."""
        self._handlers[task_type] = handler

    async def submit(self, task: Task) -> str:
        """Submit a task for execution."""
        logger.info("Submitting task %s (type=%s)", task.task_id, task.task_type)

        if task.task_id in self._running_tasks:
            logger.warning("Task %s already running", task.task_id)
            return task.task_id

        # Create initial result
        self._results[task.task_id] = TaskResult(
            task_id=task.task_id,
            status=TaskStatus.PENDING,
        )

        # Start execution
        asyncio_task = asyncio.create_task(self._run_task(task))
        self._running_tasks[task.task_id] = asyncio_task

        return task.task_id

    async def _run_task(self, task: Task) -> TaskResult:
        """Run a task with semaphore limiting."""
        async with self._semaphore:
            result = self._results[task.task_id]
            result.status = TaskStatus.RUNNING
            result.started_at = time.time()

            handler = self._handlers.get(task.task_type)
            if not handler:
                result.status = TaskStatus.FAILED
                result.error = f"Unknown task type: {task.task_type}"
                result.completed_at = time.time()
                return result

            timeout = task.timeout or self.config.task_timeout
            try:
                result = await asyncio.wait_for(
                    handler(task, result),
                    timeout=timeout,
                )
            except asyncio.TimeoutError:
                result.status = TaskStatus.TIMEOUT
                result.error = f"Task timed out after {timeout}s"
                result.completed_at = time.time()
            except asyncio.CancelledError:
                result.status = TaskStatus.CANCELLED
                result.completed_at = time.time()
            except Exception as e:
                logger.exception("Task %s failed", task.task_id)
                result.status = TaskStatus.FAILED
                result.error = str(e)
                result.completed_at = time.time()
            finally:
                self._running_tasks.pop(task.task_id, None)

            self._results[task.task_id] = result
            return result

    async def cancel(self, task_id: str) -> bool:
        """Cancel a running task."""
        asyncio_task = self._running_tasks.get(task_id)
        if asyncio_task:
            asyncio_task.cancel()
            return True
        return False

    def get_result(self, task_id: str) -> Optional[TaskResult]:
        """Get task result."""
        return self._results.get(task_id)

    def get_running_tasks(self) -> List[str]:
        """Get list of running task IDs."""
        return list(self._running_tasks.keys())

    # Task handlers

    async def _execute_shell(self, task: Task, result: TaskResult) -> TaskResult:
        """Execute a shell command."""
        command = task.payload.get("command", "")
        if not command:
            result.status = TaskStatus.FAILED
            result.error = "No command provided"
            result.completed_at = time.time()
            return result

        # Safety check
        if self._is_blocked_command(command):
            result.status = TaskStatus.FAILED
            result.error = "Command blocked by security policy"
            result.completed_at = time.time()
            return result

        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=task.payload.get("cwd"),
                env=task.payload.get("env"),
            )
            stdout, stderr = await proc.communicate()

            result.exit_code = proc.returncode
            result.stdout = stdout.decode("utf-8", errors="replace")
            result.stderr = stderr.decode("utf-8", errors="replace")
            result.status = TaskStatus.COMPLETED if proc.returncode == 0 else TaskStatus.FAILED
            result.completed_at = time.time()

        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            result.completed_at = time.time()

        return result

    async def _execute_script(self, task: Task, result: TaskResult) -> TaskResult:
        """Execute a script file."""
        script_path = task.payload.get("path", "")
        args = task.payload.get("args", [])

        if not script_path:
            result.status = TaskStatus.FAILED
            result.error = "No script path provided"
            result.completed_at = time.time()
            return result

        cmd = [script_path] + args
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()

            result.exit_code = proc.returncode
            result.stdout = stdout.decode("utf-8", errors="replace")
            result.stderr = stderr.decode("utf-8", errors="replace")
            result.status = TaskStatus.COMPLETED if proc.returncode == 0 else TaskStatus.FAILED
            result.completed_at = time.time()

        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            result.completed_at = time.time()

        return result

    async def _execute_python(self, task: Task, result: TaskResult) -> TaskResult:
        """Execute Python code."""
        code = task.payload.get("code", "")
        if not code:
            result.status = TaskStatus.FAILED
            result.error = "No code provided"
            result.completed_at = time.time()
            return result

        try:
            proc = await asyncio.create_subprocess_exec(
                "python3", "-c", code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()

            result.exit_code = proc.returncode
            result.stdout = stdout.decode("utf-8", errors="replace")
            result.stderr = stderr.decode("utf-8", errors="replace")
            result.status = TaskStatus.COMPLETED if proc.returncode == 0 else TaskStatus.FAILED
            result.completed_at = time.time()

        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            result.completed_at = time.time()

        return result

    async def _execute_file_read(self, task: Task, result: TaskResult) -> TaskResult:
        """Read a file."""
        path = task.payload.get("path", "")
        if not path:
            result.status = TaskStatus.FAILED
            result.error = "No path provided"
            result.completed_at = time.time()
            return result

        try:
            with open(path, "r", encoding="utf-8") as f:
                result.stdout = f.read()
            result.status = TaskStatus.COMPLETED
            result.exit_code = 0
            result.completed_at = time.time()
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            result.completed_at = time.time()

        return result

    async def _execute_file_write(self, task: Task, result: TaskResult) -> TaskResult:
        """Write to a file."""
        path = task.payload.get("path", "")
        content = task.payload.get("content", "")

        if not path:
            result.status = TaskStatus.FAILED
            result.error = "No path provided"
            result.completed_at = time.time()
            return result

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            result.status = TaskStatus.COMPLETED
            result.exit_code = 0
            result.stdout = f"Written {len(content)} bytes to {path}"
            result.completed_at = time.time()
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            result.completed_at = time.time()

        return result

    async def _execute_service(self, task: Task, result: TaskResult) -> TaskResult:
        """Manage a systemd service."""
        service = task.payload.get("service", "")
        action = task.payload.get("action", "status")

        if not service:
            result.status = TaskStatus.FAILED
            result.error = "No service name provided"
            result.completed_at = time.time()
            return result

        if action not in ("start", "stop", "restart", "status", "enable", "disable"):
            result.status = TaskStatus.FAILED
            result.error = f"Invalid action: {action}"
            result.completed_at = time.time()
            return result

        cmd = f"systemctl {action} {shlex.quote(service)}"
        task.payload["command"] = cmd
        return await self._execute_shell(task, result)

    def _is_blocked_command(self, command: str) -> bool:
        """Check if command is in blocklist."""
        cmd_lower = command.lower()
        for blocked in self.config.blocked_commands:
            if blocked.lower() in cmd_lower:
                return True
        return False
