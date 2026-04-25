"""
PR Action Queue

Manages the queue of PR actions to be executed.
Handles prioritization, deduplication, retry logic, and execution coordination.
"""

import asyncio
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from collections import defaultdict
import logging

from .action_types import (
    PRAction,
    PRActionType,
    PRActionPriority,
    PRActionStatus,
    get_default_priority,
)

logger = logging.getLogger(__name__)


class PRActionQueue:
    """
    Priority queue for PR actions.

    Features:
    - Priority-based execution
    - Deduplication of identical actions
    - Automatic retry with exponential backoff
    - Rate limiting per repo
    - Status tracking and reporting
    """

    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self._queue: Dict[str, PRAction] = {}
        self._processing: Dict[str, PRAction] = {}
        self._completed: Dict[str, PRAction] = {}
        self._failed: Dict[str, PRAction] = {}

        # Rate limiting: max actions per repo per minute
        self._repo_action_counts: Dict[str, List[datetime]] = defaultdict(list)
        self._max_actions_per_repo = 10

        # Workers
        self._workers: List[asyncio.Task] = []
        self._running = False

    async def start(self):
        """Start the queue workers"""
        if self._running:
            logger.warning("Queue already running")
            return

        self._running = True
        logger.info(f"Starting PR action queue with {self.max_workers} workers")

        for i in range(self.max_workers):
            worker = asyncio.create_task(self._worker(i))
            self._workers.append(worker)

    async def stop(self):
        """Stop the queue workers"""
        if not self._running:
            return

        logger.info("Stopping PR action queue")
        self._running = False

        # Cancel all workers
        for worker in self._workers:
            worker.cancel()

        # Wait for workers to finish
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()

    async def enqueue(
        self,
        action_type: PRActionType,
        repo_owner: str,
        repo_name: str,
        pr_number: int,
        params: Dict[str, Any],
        priority: Optional[PRActionPriority] = None,
        triggered_by: str = "automation",
    ) -> str:
        """
        Add an action to the queue.

        Returns:
            action_id: Unique identifier for the action
        """
        async with self._lock:
            # Use default priority if not specified
            if priority is None:
                priority = get_default_priority(action_type)

            # Create action
            action = PRAction(
                action_id=str(uuid.uuid4()),
                action_type=action_type,
                repo_owner=repo_owner,
                repo_name=repo_name,
                pr_number=pr_number,
                params=params,
                priority=priority,
                status=PRActionStatus.QUEUED,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                triggered_by=triggered_by,
            )

            # Check for duplicates
            duplicate_id = await self._find_duplicate(action)
            if duplicate_id:
                logger.info(
                    f"Duplicate action found: {duplicate_id}. "
                    f"Skipping enqueue for {action.action_id}"
                )
                return duplicate_id

            # Add to queue
            self._queue[action.action_id] = action

            logger.info(
                f"Enqueued {action_type.value} for {repo_owner}/{repo_name}#{pr_number} "
                f"(priority: {priority.value}, id: {action.action_id})"
            )

            return action.action_id

    async def _find_duplicate(self, action: PRAction) -> Optional[str]:
        """Check if an identical action is already queued or processing"""
        async with self._lock:
            for existing_id, existing in {**self._queue, **self._processing}.items():
                if (
                    existing.action_type == action.action_type
                    and existing.repo_owner == action.repo_owner
                    and existing.repo_name == action.repo_name
                    and existing.pr_number == action.pr_number
                    and existing.params == action.params
                ):
                    return existing_id
            return None

    async def _worker(self, worker_id: int):
        """Worker that processes actions from the queue"""
        logger.info(f"Worker {worker_id} started")

        while self._running:
            try:
                # Get next action
                action = await self._get_next_action()

                if action is None:
                    # No actions available, sleep briefly
                    await asyncio.sleep(1)
                    continue

                # Execute action
                await self._execute_action(action)

            except asyncio.CancelledError:
                logger.info(f"Worker {worker_id} cancelled")
                break
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}", exc_info=True)
                await asyncio.sleep(5)

        logger.info(f"Worker {worker_id} stopped")

    async def _get_next_action(self) -> Optional[PRAction]:
        """Get the next action to execute based on priority"""
        if not self._queue:
            return None

        # Sort by priority (highest first), then by creation time (oldest first)
        sorted_actions = sorted(
            self._queue.values(),
            key=lambda a: (-a.priority.value, a.created_at),
        )

        for action in sorted_actions:
            # Check rate limiting
            if not self._check_rate_limit(action):
                continue

            # Move to processing
            action.status = PRActionStatus.PROCESSING
            action.updated_at = datetime.utcnow()
            self._processing[action.action_id] = action
            del self._queue[action.action_id]

            return action

        return None

    def _check_rate_limit(self, action: PRAction) -> bool:
        """Check if we can execute this action without exceeding rate limits"""
        repo_key = f"{action.repo_owner}/{action.repo_name}"
        now = datetime.utcnow()

        # Clean old entries (older than 1 minute)
        cutoff = now.timestamp() - 60
        self._repo_action_counts[repo_key] = [
            ts for ts in self._repo_action_counts[repo_key] if ts.timestamp() > cutoff
        ]

        # Check count
        if len(self._repo_action_counts[repo_key]) >= self._max_actions_per_repo:
            logger.debug(
                f"Rate limit reached for {repo_key} "
                f"({len(self._repo_action_counts[repo_key])}/{self._max_actions_per_repo})"
            )
            return False

        return True

    async def _execute_action(self, action: PRAction):
        """Execute a single action"""
        logger.info(
            f"Executing {action.action_type.value} for "
            f"{action.repo_owner}/{action.repo_name}#{action.pr_number} "
            f"(attempt {action.attempts + 1}/{action.max_attempts})"
        )

        action.attempts += 1
        repo_key = f"{action.repo_owner}/{action.repo_name}"

        try:
            # Record action for rate limiting
            self._repo_action_counts[repo_key].append(datetime.utcnow())

            # Import handler (lazy import to avoid circular dependencies)
            from .handlers import get_handler

            handler = get_handler(action.action_type)

            # Execute handler
            result = await handler.execute(action)

            # Mark as completed
            action.status = PRActionStatus.COMPLETED
            action.updated_at = datetime.utcnow()
            action.result = result

            self._completed[action.action_id] = action
            del self._processing[action.action_id]

            logger.info(
                f"Completed {action.action_type.value} for "
                f"{action.repo_owner}/{action.repo_name}#{action.pr_number}"
            )

        except Exception as e:
            logger.error(
                f"Failed to execute {action.action_type.value} for "
                f"{action.repo_owner}/{action.repo_name}#{action.pr_number}: {e}",
                exc_info=True,
            )

            action.error_message = str(e)
            action.updated_at = datetime.utcnow()

            # Retry logic
            if action.attempts < action.max_attempts:
                action.status = PRActionStatus.RETRYING
                # Re-queue for retry
                self._queue[action.action_id] = action
                del self._processing[action.action_id]

                # Exponential backoff
                delay = 2 ** action.attempts
                logger.info(f"Retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                # Max attempts reached
                action.status = PRActionStatus.FAILED
                self._failed[action.action_id] = action
                del self._processing[action.action_id]

    async def get_status(self, action_id: str) -> Optional[PRAction]:
        """Get the status of an action"""
        # Check all queues
        for queue in [self._queue, self._processing, self._completed, self._failed]:
            if action_id in queue:
                return queue[action_id]
        return None

    async def get_queue_stats(self) -> Dict[str, Any]:
        """Get statistics about the queue"""
        return {
            "queued": len(self._queue),
            "processing": len(self._processing),
            "completed": len(self._completed),
            "failed": len(self._failed),
            "workers": self.max_workers,
            "running": self._running,
        }

    async def get_pr_actions(
        self, repo_owner: str, repo_name: str, pr_number: int
    ) -> List[PRAction]:
        """Get all actions for a specific PR"""
        actions = []

        for queue in [self._queue, self._processing, self._completed, self._failed]:
            for action in queue.values():
                if (
                    action.repo_owner == repo_owner
                    and action.repo_name == repo_name
                    and action.pr_number == pr_number
                ):
                    actions.append(action)

        return sorted(actions, key=lambda a: a.created_at)

    async def cancel_action(self, action_id: str) -> bool:
        """Cancel a queued action"""
        if action_id in self._queue:
            action = self._queue[action_id]
            action.status = PRActionStatus.CANCELLED
            action.updated_at = datetime.utcnow()
            del self._queue[action_id]
            self._failed[action_id] = action
            logger.info(f"Cancelled action {action_id}")
            return True
        return False


# Global queue instance
_queue_instance: Optional[PRActionQueue] = None


def get_queue() -> PRActionQueue:
    """Get the global queue instance"""
    global _queue_instance
    if _queue_instance is None:
        _queue_instance = PRActionQueue()
    return _queue_instance
