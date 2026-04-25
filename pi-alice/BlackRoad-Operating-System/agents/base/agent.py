"""
Base Agent Class

The foundation for all BlackRoad agents. Provides common functionality,
error handling, logging, and execution framework.

Integrations:
- LEITL Protocol: Multi-agent collaboration with live session management
- Cognition Framework: Access to Cece's reasoning and architecture capabilities
"""

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Callable
from uuid import uuid4


class AgentStatus(Enum):
    """Agent execution status."""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AgentMetadata:
    """Agent metadata and configuration."""
    name: str
    description: str
    category: str
    version: str
    author: str = "BlackRoad"
    tags: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    timeout: int = 300  # seconds
    retry_count: int = 3
    retry_delay: int = 5  # seconds


@dataclass
class AgentResult:
    """Agent execution result."""
    agent_name: str
    execution_id: str
    status: AgentStatus
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseAgent(ABC):
    """
    Base class for all BlackRoad agents.

    Provides:
    - Lifecycle management (initialize, execute, cleanup)
    - Error handling and retries
    - Logging and telemetry
    - Input validation
    - Configuration management

    Example:
        ```python
        class MyAgent(BaseAgent):
            def __init__(self):
                super().__init__(
                    name='my-agent',
                    description='My custom agent',
                    category='custom',
                    version='1.0.0'
                )

            async def execute(self, params):
                # Your logic here
                return {'result': 'success'}
        ```
    """

    def __init__(
        self,
        name: str,
        description: str,
        category: str,
        version: str,
        **kwargs
    ):
        """Initialize the base agent."""
        self.metadata = AgentMetadata(
            name=name,
            description=description,
            category=category,
            version=version,
            **kwargs
        )

        self.status = AgentStatus.IDLE
        self.logger = logging.getLogger(f"agent.{name}")
        self._execution_id: Optional[str] = None
        self._hooks: Dict[str, List[Callable]] = {
            'before_execute': [],
            'after_execute': [],
            'on_error': [],
            'on_success': []
        }

        # LEITL Protocol integration (optional)
        self._leitl_enabled: bool = False
        self._leitl_session_id: Optional[str] = None
        self._leitl_protocol = None  # Will be set if LEITL is enabled

    @abstractmethod
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent logic.

        Args:
            params: Input parameters for the agent

        Returns:
            Dictionary containing execution results

        Raises:
            Exception: If execution fails
        """
        pass

    async def initialize(self) -> None:
        """
        Initialize the agent before execution.
        Override this method to add custom initialization logic.
        """
        self.logger.info(f"Initializing agent: {self.metadata.name}")

    async def cleanup(self) -> None:
        """
        Cleanup after agent execution.
        Override this method to add custom cleanup logic.
        """
        self.logger.info(f"Cleaning up agent: {self.metadata.name}")

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """
        Validate input parameters.
        Override this method to add custom validation logic.

        Args:
            params: Parameters to validate

        Returns:
            True if valid, False otherwise
        """
        return True

    async def run(self, params: Dict[str, Any]) -> AgentResult:
        """
        Run the agent with full lifecycle management.

        Args:
            params: Input parameters

        Returns:
            AgentResult containing execution details
        """
        execution_id = str(uuid4())
        self._execution_id = execution_id
        started_at = datetime.utcnow()

        self.logger.info(
            f"Starting agent execution: {self.metadata.name} "
            f"(ID: {execution_id})"
        )

        # Broadcast task started via LEITL (if enabled)
        await self._leitl_broadcast(
            "task.started",
            {
                "task_id": execution_id,
                "agent": self.metadata.name,
                "description": str(params.get("input", ""))[:200]
            }
        )

        try:
            # Validate params
            if not self.validate_params(params):
                raise ValueError("Invalid parameters provided")

            # Initialize
            await self.initialize()

            # Run before hooks
            await self._run_hooks('before_execute', params)

            # Execute with retries
            self.status = AgentStatus.RUNNING

            # Send heartbeat
            await self._leitl_heartbeat(f"Executing {self.metadata.name}")

            result_data = await self._execute_with_retry(params)

            # Run success hooks
            await self._run_hooks('on_success', result_data)

            # Cleanup
            await self.cleanup()

            # Run after hooks
            await self._run_hooks('after_execute', result_data)

            self.status = AgentStatus.COMPLETED
            completed_at = datetime.utcnow()
            duration = (completed_at - started_at).total_seconds()

            self.logger.info(
                f"Agent execution completed: {self.metadata.name} "
                f"(Duration: {duration:.2f}s)"
            )

            # Broadcast task completed via LEITL (if enabled)
            await self._leitl_broadcast(
                "task.completed",
                {
                    "task_id": execution_id,
                    "agent": self.metadata.name,
                    "duration": duration,
                    "status": "success"
                }
            )

            return AgentResult(
                agent_name=self.metadata.name,
                execution_id=execution_id,
                status=AgentStatus.COMPLETED,
                data=result_data,
                started_at=started_at,
                completed_at=completed_at,
                duration_seconds=duration
            )

        except Exception as e:
            self.status = AgentStatus.FAILED
            completed_at = datetime.utcnow()
            duration = (completed_at - started_at).total_seconds()

            error_msg = f"Agent execution failed: {str(e)}"
            self.logger.error(error_msg, exc_info=True)

            # Run error hooks
            await self._run_hooks('on_error', {'error': str(e)})

            # Broadcast task failed via LEITL (if enabled)
            await self._leitl_broadcast(
                "task.failed",
                {
                    "task_id": execution_id,
                    "agent": self.metadata.name,
                    "error": str(e),
                    "duration": duration
                }
            )

            return AgentResult(
                agent_name=self.metadata.name,
                execution_id=execution_id,
                status=AgentStatus.FAILED,
                error=str(e),
                started_at=started_at,
                completed_at=completed_at,
                duration_seconds=duration
            )

    async def _execute_with_retry(
        self,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute with automatic retries on failure."""
        last_exception = None

        for attempt in range(self.metadata.retry_count):
            try:
                return await asyncio.wait_for(
                    self.execute(params),
                    timeout=self.metadata.timeout
                )
            except asyncio.TimeoutError:
                last_exception = Exception(
                    f"Agent execution timed out after "
                    f"{self.metadata.timeout} seconds"
                )
                self.logger.warning(
                    f"Attempt {attempt + 1}/{self.metadata.retry_count} "
                    f"timed out"
                )
            except Exception as e:
                last_exception = e
                self.logger.warning(
                    f"Attempt {attempt + 1}/{self.metadata.retry_count} "
                    f"failed: {str(e)}"
                )

            if attempt < self.metadata.retry_count - 1:
                await asyncio.sleep(self.metadata.retry_delay)

        raise last_exception

    async def _run_hooks(
        self,
        hook_name: str,
        data: Dict[str, Any]
    ) -> None:
        """Run registered hooks."""
        for hook in self._hooks.get(hook_name, []):
            try:
                await hook(self, data)
            except Exception as e:
                self.logger.error(
                    f"Hook '{hook_name}' failed: {str(e)}",
                    exc_info=True
                )

    def register_hook(
        self,
        hook_name: str,
        callback: Callable
    ) -> None:
        """
        Register a lifecycle hook.

        Args:
            hook_name: Name of the hook (before_execute, after_execute, etc.)
            callback: Async function to call
        """
        if hook_name in self._hooks:
            self._hooks[hook_name].append(callback)
        else:
            raise ValueError(f"Unknown hook: {hook_name}")

    def get_info(self) -> Dict[str, Any]:
        """Get agent information."""
        return {
            'name': self.metadata.name,
            'description': self.metadata.description,
            'category': self.metadata.category,
            'version': self.metadata.version,
            'author': self.metadata.author,
            'tags': self.metadata.tags,
            'status': self.status.value,
            'dependencies': self.metadata.dependencies,
            'leitl_enabled': self._leitl_enabled,
            'leitl_session_id': self._leitl_session_id
        }

    async def enable_leitl(
        self,
        leitl_protocol=None,
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Enable LEITL protocol for this agent

        Args:
            leitl_protocol: LEITL protocol instance (optional, will be imported if not provided)
            tags: Optional tags for session categorization

        Returns:
            LEITL session ID
        """
        if self._leitl_enabled:
            return self._leitl_session_id

        # Import LEITL protocol if not provided
        if leitl_protocol is None:
            try:
                from app.services.leitl_protocol import leitl_protocol as protocol
                self._leitl_protocol = protocol
            except ImportError:
                self.logger.warning("LEITL protocol not available - running in standalone mode")
                return None
        else:
            self._leitl_protocol = leitl_protocol

        # Register session
        try:
            session = await self._leitl_protocol.register_session(
                agent_name=self.metadata.name,
                agent_type=self.metadata.category,
                tags=tags or self.metadata.tags
            )

            self._leitl_enabled = True
            self._leitl_session_id = session.session_id

            self.logger.info(f"✅ LEITL enabled - Session ID: {session.session_id}")
            return session.session_id

        except Exception as e:
            self.logger.error(f"Failed to enable LEITL: {str(e)}")
            return None

    async def disable_leitl(self):
        """Disable LEITL protocol and end session"""
        if not self._leitl_enabled:
            return

        try:
            if self._leitl_protocol and self._leitl_session_id:
                await self._leitl_protocol.end_session(self._leitl_session_id)

            self._leitl_enabled = False
            self._leitl_session_id = None
            self.logger.info("LEITL session ended")

        except Exception as e:
            self.logger.error(f"Error disabling LEITL: {str(e)}")

    async def _leitl_broadcast(
        self,
        event_type: str,
        data: Optional[Dict[str, Any]] = None
    ):
        """Broadcast event via LEITL protocol"""
        if not self._leitl_enabled or not self._leitl_protocol:
            return

        try:
            await self._leitl_protocol.broadcast_event(
                event_type=event_type,
                session_id=self._leitl_session_id,
                data=data
            )
        except Exception as e:
            self.logger.warning(f"LEITL broadcast failed: {str(e)}")

    async def _leitl_heartbeat(self, current_task: Optional[str] = None):
        """Send heartbeat to LEITL protocol"""
        if not self._leitl_enabled or not self._leitl_protocol:
            return

        try:
            await self._leitl_protocol.heartbeat(
                session_id=self._leitl_session_id,
                current_task=current_task
            )
        except Exception as e:
            self.logger.warning(f"LEITL heartbeat failed: {str(e)}")
