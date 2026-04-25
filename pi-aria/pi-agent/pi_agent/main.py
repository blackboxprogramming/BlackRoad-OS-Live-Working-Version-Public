#!/usr/bin/env python3
"""BlackRoad Pi Agent - Main entry point.

A unified agent runtime for Raspberry Pi and other edge devices that connects
to the BlackRoad OS operator via WebSocket for task execution and telemetry.
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import signal
import sys
from pathlib import Path
from typing import Optional

from .config import Config
from .connection import ConnectionManager, Message
from .executor import Executor, Task
from .scheduler import Scheduler, ScheduledTask
from .telemetry import TelemetryCollector


logger = logging.getLogger(__name__)


class PiAgent:
    """Main Pi Agent orchestrator."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self._running = False

        # Initialize components
        self.executor = Executor(config.executor)
        self.scheduler = Scheduler()
        self.telemetry = TelemetryCollector()
        self.connection = ConnectionManager(
            config=config.operator,
            agent_id=config.agent.agent_id,
            agent_type=config.agent.agent_type,
            capabilities=config.agent.capabilities,
            hostname=config.agent.hostname,
            tags=config.agent.tags,
        )

        # Register handlers
        self._setup_handlers()

    def _setup_handlers(self) -> None:
        """Set up message and task handlers."""
        # WebSocket message handlers
        self.connection.on("task", self._handle_task)
        self.connection.on("execute_task", self._handle_execute_task)  # Operator format
        self.connection.on("cancel", self._handle_cancel)
        self.connection.on("ping", self._handle_ping)
        self.connection.on("config", self._handle_config)
        self.connection.on("registered", self._handle_registered)

        # Scheduler callback
        self.scheduler.add_callback(self._on_scheduled_task)

    async def _handle_task(self, msg: Message) -> None:
        """Handle incoming task."""
        task = Task.from_dict(msg.payload)
        task_id = await self.executor.submit(task)
        logger.info("Started task %s", task_id)

        # Monitor task completion
        asyncio.create_task(self._monitor_task(task_id))

    async def _monitor_task(self, task_id: str) -> None:
        """Monitor task and report result."""
        while True:
            await asyncio.sleep(0.5)
            result = self.executor.get_result(task_id)
            if result and result.status.value not in ("pending", "running"):
                await self.connection.send("task_result", result.to_dict())
                logger.info("Task %s completed: %s", task_id, result.status.value)
                break

    async def _handle_cancel(self, msg: Message) -> None:
        """Handle task cancellation."""
        task_id = msg.payload.get("task_id")
        if task_id:
            cancelled = await self.executor.cancel(task_id)
            logger.info("Cancel task %s: %s", task_id, cancelled)

    async def _handle_ping(self, msg: Message) -> None:
        """Handle ping from operator."""
        await self.connection.send("pong", {
            "timestamp": msg.timestamp,
            "agent_id": self.config.agent.agent_id,
        })

    async def _handle_config(self, msg: Message) -> None:
        """Handle config update from operator."""
        logger.info("Received config update: %s", msg.payload)
        # TODO: Apply config updates

    async def _handle_registered(self, msg: Message) -> None:
        """Handle registration confirmation from operator."""
        logger.info("Registered with operator: %s", msg.payload.get("message", "OK"))

    async def _handle_execute_task(self, msg: Message) -> None:
        """Handle execute_task from operator (plan-based execution).

        Operator sends:
        {
            "type": "execute_task",
            "payload": {
                "task_id": "...",
                "plan": {"commands": [{"run": "..."}]}
            }
        }
        """
        task_id = msg.payload.get("task_id")
        plan = msg.payload.get("plan", {})
        commands = plan.get("commands", [])

        logger.info("Received execute_task %s with %d commands", task_id, len(commands))

        # Execute commands sequentially
        for idx, cmd in enumerate(commands):
            command = cmd.get("run", "")
            if not command:
                continue

            # Create shell task
            task = Task(
                task_id=f"{task_id}-cmd-{idx}",
                task_type="shell",
                payload={"command": command},
            )

            await self.executor.submit(task)

            # Wait for completion and send output
            while True:
                await asyncio.sleep(0.2)
                result = self.executor.get_result(task.task_id)
                if result and result.status.value not in ("pending", "running"):
                    # Send command result
                    await self.connection.send("command_result", {
                        "task_id": task_id,
                        "command_index": idx,
                        "command": command,
                        "exit_code": result.exit_code or 0,
                        "duration_ms": int((result.duration or 0) * 1000),
                    })

                    # Send output
                    if result.stdout:
                        await self.connection.send("task_output", {
                            "task_id": task_id,
                            "command_index": idx,
                            "stream": "stdout",
                            "content": result.stdout,
                        })
                    if result.stderr:
                        await self.connection.send("task_output", {
                            "task_id": task_id,
                            "command_index": idx,
                            "stream": "stderr",
                            "content": result.stderr,
                        })

                    # If command failed, stop execution
                    if result.exit_code != 0:
                        await self.connection.send("task_complete", {
                            "task_id": task_id,
                            "success": False,
                            "exit_code": result.exit_code,
                            "error": result.error or result.stderr,
                        })
                        return
                    break

        # All commands completed successfully
        await self.connection.send("task_complete", {
            "task_id": task_id,
            "success": True,
            "exit_code": 0,
        })
        logger.info("Task %s completed successfully", task_id)

    async def _on_scheduled_task(self, scheduled: ScheduledTask) -> None:
        """Handle scheduled task execution."""
        task = Task(
            task_id=scheduled.task_id,
            task_type=scheduled.task_type,
            payload=scheduled.payload,
        )
        await self.executor.submit(task)

    async def _heartbeat_loop(self) -> None:
        """Send periodic heartbeats."""
        interval = self.config.telemetry.heartbeat_interval
        while self._running:
            try:
                if self.connection.is_connected:
                    metrics = self.telemetry.collect_metrics()
                    # Format matches operator's AgentHeartbeat schema
                    await self.connection.send("heartbeat", {
                        "agent_id": self.config.agent.agent_id,
                        "telemetry": {
                            "cpu_percent": metrics.cpu_percent,
                            "memory_percent": metrics.memory_percent,
                            "disk_percent": metrics.disk_percent,
                            "uptime_seconds": metrics.uptime_seconds,
                            "load_average": list(metrics.load_average),
                        },
                        "current_task_id": self.executor.get_running_tasks()[0] if self.executor.get_running_tasks() else None,
                        "workspaces": [],
                    })
                    logger.debug("Sent heartbeat")
            except Exception:
                logger.exception("Error sending heartbeat")

            await asyncio.sleep(interval)

    async def start(self) -> None:
        """Start the Pi Agent."""
        logger.info("=" * 60)
        logger.info("BlackRoad Pi Agent v0.1.0")
        logger.info("=" * 60)
        logger.info("Agent ID: %s", self.config.agent.agent_id)
        logger.info("Hostname: %s", self.config.agent.hostname)
        logger.info("Agent Type: %s", self.config.agent.agent_type)
        logger.info("Capabilities: %s", ", ".join(self.config.agent.capabilities))
        logger.info("Operator URL: %s", self.config.operator.url)
        logger.info("")

        # Log system info
        sys_info = self.telemetry.get_system_info()
        logger.info("System: %s %s (%s)",
                    sys_info.get("platform"),
                    sys_info.get("platform_release"),
                    sys_info.get("architecture"))
        if "pi_model" in sys_info:
            logger.info("Pi Model: %s", sys_info.get("pi_model"))
        logger.info("")

        self._running = True

        # Start components
        await self.scheduler.start()
        await self.connection.start()

        # Start heartbeat
        heartbeat_task = asyncio.create_task(self._heartbeat_loop())

        logger.info("Pi Agent running. Press Ctrl+C to stop.")
        logger.info("")

        try:
            # Run until stopped
            while self._running:
                await asyncio.sleep(1)
        finally:
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass

    async def stop(self) -> None:
        """Stop the Pi Agent."""
        logger.info("Stopping Pi Agent...")
        self._running = False
        await self.scheduler.stop()
        await self.connection.stop()
        logger.info("Pi Agent stopped")


def setup_logging(config: Config) -> None:
    """Configure logging."""
    log_level = getattr(logging, config.logging.level.upper(), logging.INFO)
    log_format = config.logging.format

    handlers = [logging.StreamHandler()]
    if config.logging.file:
        handlers.append(logging.FileHandler(config.logging.file))

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=handlers,
    )

    # Reduce noise from libraries
    logging.getLogger("websockets").setLevel(logging.WARNING)


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="BlackRoad Pi Agent - Edge device runtime for BlackRoad OS"
    )
    parser.add_argument(
        "-c", "--config",
        type=Path,
        help="Path to config file",
    )
    parser.add_argument(
        "--operator-url",
        help="Override operator WebSocket URL",
    )
    parser.add_argument(
        "--agent-id",
        help="Override agent ID",
    )
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Log level",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.1.0",
    )
    return parser.parse_args()


async def main_async() -> int:
    """Async main entry point."""
    args = parse_args()

    # Load config
    config = Config.load(args.config)

    # Apply CLI overrides
    if args.operator_url:
        config.operator.url = args.operator_url
    if args.agent_id:
        config.agent.agent_id = args.agent_id
    if args.log_level:
        config.logging.level = args.log_level

    # Setup logging
    setup_logging(config)

    # Create and run agent
    agent = PiAgent(config)

    # Handle signals
    loop = asyncio.get_running_loop()

    def signal_handler():
        asyncio.create_task(agent.stop())

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, signal_handler)

    try:
        await agent.start()
        return 0
    except KeyboardInterrupt:
        await agent.stop()
        return 0
    except Exception:
        logger.exception("Fatal error")
        return 1


def main() -> None:
    """Main entry point."""
    sys.exit(asyncio.run(main_async()))


if __name__ == "__main__":
    main()
