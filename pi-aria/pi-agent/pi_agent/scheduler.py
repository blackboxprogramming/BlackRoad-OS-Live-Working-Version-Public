"""Task scheduler for Pi Agent."""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from heapq import heappop, heappush
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4


logger = logging.getLogger(__name__)


@dataclass(order=True)
class ScheduledTask:
    """A task scheduled for future execution."""
    run_at: float
    task_id: str = field(compare=False)
    task_type: str = field(compare=False)
    payload: Dict[str, Any] = field(compare=False)
    repeat_interval: Optional[float] = field(default=None, compare=False)
    created_at: float = field(default_factory=time.time, compare=False)


class Scheduler:
    """Schedules and manages recurring and delayed tasks."""

    def __init__(self) -> None:
        self._queue: List[ScheduledTask] = []
        self._tasks: Dict[str, ScheduledTask] = {}
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._callbacks: List[Callable[[ScheduledTask], Any]] = []
        self._lock = asyncio.Lock()

    def add_callback(self, callback: Callable[[ScheduledTask], Any]) -> None:
        """Add a callback to be invoked when a task is due."""
        self._callbacks.append(callback)

    async def schedule(
        self,
        task_type: str,
        payload: Dict[str, Any],
        delay: float = 0,
        repeat_interval: Optional[float] = None,
        task_id: Optional[str] = None,
    ) -> str:
        """Schedule a task for execution.

        Args:
            task_type: Type of task to execute
            payload: Task payload
            delay: Seconds until first execution
            repeat_interval: If set, repeat at this interval
            task_id: Optional explicit task ID

        Returns:
            Task ID
        """
        task_id = task_id or str(uuid4())
        run_at = time.time() + delay

        scheduled = ScheduledTask(
            run_at=run_at,
            task_id=task_id,
            task_type=task_type,
            payload=payload,
            repeat_interval=repeat_interval,
        )

        async with self._lock:
            heappush(self._queue, scheduled)
            self._tasks[task_id] = scheduled

        logger.info(
            "Scheduled task %s (type=%s) to run in %.1fs%s",
            task_id,
            task_type,
            delay,
            f", repeating every {repeat_interval}s" if repeat_interval else "",
        )
        return task_id

    async def cancel(self, task_id: str) -> bool:
        """Cancel a scheduled task."""
        async with self._lock:
            if task_id in self._tasks:
                del self._tasks[task_id]
                logger.info("Cancelled scheduled task %s", task_id)
                return True
        return False

    async def reschedule(self, task_id: str, delay: float) -> bool:
        """Reschedule an existing task."""
        async with self._lock:
            if task_id not in self._tasks:
                return False

            old_task = self._tasks[task_id]
            new_task = ScheduledTask(
                run_at=time.time() + delay,
                task_id=task_id,
                task_type=old_task.task_type,
                payload=old_task.payload,
                repeat_interval=old_task.repeat_interval,
            )
            self._tasks[task_id] = new_task
            heappush(self._queue, new_task)
            logger.info("Rescheduled task %s to run in %.1fs", task_id, delay)
            return True

    def get_scheduled_tasks(self) -> List[Dict[str, Any]]:
        """Get list of scheduled tasks."""
        return [
            {
                "task_id": t.task_id,
                "task_type": t.task_type,
                "run_at": t.run_at,
                "repeat_interval": t.repeat_interval,
                "payload": t.payload,
            }
            for t in self._tasks.values()
        ]

    async def start(self) -> None:
        """Start the scheduler loop."""
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info("Scheduler started")

    async def stop(self) -> None:
        """Stop the scheduler loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        logger.info("Scheduler stopped")

    async def _run(self) -> None:
        """Main scheduler loop."""
        while self._running:
            try:
                await self._process_queue()
                await asyncio.sleep(0.1)  # Check every 100ms
            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Error in scheduler loop")
                await asyncio.sleep(1)

    async def _process_queue(self) -> None:
        """Process due tasks."""
        now = time.time()

        while self._queue:
            async with self._lock:
                if not self._queue:
                    break

                next_task = self._queue[0]
                if next_task.run_at > now:
                    break

                heappop(self._queue)

                # Skip if task was cancelled
                if next_task.task_id not in self._tasks:
                    continue

                task = self._tasks[next_task.task_id]

                # If this is an old version of a rescheduled task, skip
                if task.run_at != next_task.run_at:
                    continue

            # Execute callbacks
            for callback in self._callbacks:
                try:
                    result = callback(task)
                    if asyncio.iscoroutine(result):
                        await result
                except Exception:
                    logger.exception("Error in scheduler callback")

            # Reschedule if recurring
            if task.repeat_interval:
                async with self._lock:
                    if task.task_id in self._tasks:
                        new_task = ScheduledTask(
                            run_at=time.time() + task.repeat_interval,
                            task_id=task.task_id,
                            task_type=task.task_type,
                            payload=task.payload,
                            repeat_interval=task.repeat_interval,
                        )
                        self._tasks[task.task_id] = new_task
                        heappush(self._queue, new_task)
            else:
                async with self._lock:
                    self._tasks.pop(task.task_id, None)
