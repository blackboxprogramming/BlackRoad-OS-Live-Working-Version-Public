"""WebSocket connection manager for Pi Agent."""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

try:
    import websockets
    from websockets.client import WebSocketClientProtocol
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    WebSocketClientProtocol = Any  # type: ignore

from .config import OperatorConfig


logger = logging.getLogger(__name__)


class ConnectionState(str, Enum):
    """WebSocket connection state."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"


@dataclass
class Message:
    """WebSocket message."""
    msg_type: str
    payload: Dict[str, Any]
    timestamp: float

    @classmethod
    def from_json(cls, data: str) -> "Message":
        parsed = json.loads(data)
        return cls(
            msg_type=parsed.get("type", "unknown"),
            payload=parsed.get("payload", {}),
            timestamp=parsed.get("timestamp", time.time()),
        )

    def to_json(self) -> str:
        return json.dumps({
            "type": self.msg_type,
            "payload": self.payload,
            "timestamp": self.timestamp,
        })


class ConnectionManager:
    """Manages WebSocket connection to the operator."""

    def __init__(
        self,
        config: OperatorConfig,
        agent_id: str,
        agent_type: str,
        capabilities: List[str],
        hostname: str = "",
        tags: Optional[Dict[str, str]] = None,
    ) -> None:
        if not WEBSOCKETS_AVAILABLE:
            raise ImportError("websockets library required: pip install websockets")

        self.config = config
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.hostname = hostname or agent_id
        self.tags = tags or {}

        self._ws: Optional[WebSocketClientProtocol] = None
        self._state = ConnectionState.DISCONNECTED
        self._reconnect_attempts = 0
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._send_queue: asyncio.Queue[Message] = asyncio.Queue()
        self._handlers: Dict[str, List[Callable]] = {}
        self._last_ping: Optional[float] = None
        self._last_pong: Optional[float] = None

    @property
    def state(self) -> ConnectionState:
        return self._state

    @property
    def is_connected(self) -> bool:
        return self._state == ConnectionState.CONNECTED

    def on(self, msg_type: str, handler: Callable) -> None:
        """Register a message handler."""
        if msg_type not in self._handlers:
            self._handlers[msg_type] = []
        self._handlers[msg_type].append(handler)

    async def send(self, msg_type: str, payload: Dict[str, Any]) -> None:
        """Queue a message to send."""
        msg = Message(msg_type=msg_type, payload=payload, timestamp=time.time())
        await self._send_queue.put(msg)

    async def start(self) -> None:
        """Start the connection manager."""
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info("Connection manager started")

    async def stop(self) -> None:
        """Stop the connection manager."""
        self._running = False
        if self._ws:
            await self._ws.close()
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self._state = ConnectionState.DISCONNECTED
        logger.info("Connection manager stopped")

    async def _run(self) -> None:
        """Main connection loop."""
        while self._running:
            try:
                await self._connect()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Connection error: %s", e)

            if self._running:
                await self._handle_reconnect()

    async def _connect(self) -> None:
        """Establish WebSocket connection."""
        self._state = ConnectionState.CONNECTING
        logger.info("Connecting to %s", self.config.url)

        try:
            self._ws = await websockets.connect(
                self.config.url,
                ping_interval=self.config.ping_interval,
                ping_timeout=self.config.ping_timeout,
            )
            self._state = ConnectionState.CONNECTED
            self._reconnect_attempts = 0
            logger.info("Connected to operator")

            # Send registration
            await self._send_registration()

            # Start send/receive tasks
            await asyncio.gather(
                self._receive_loop(),
                self._send_loop(),
            )

        except websockets.exceptions.ConnectionClosed as e:
            logger.warning("Connection closed: %s", e)
        except Exception as e:
            logger.error("Connection failed: %s", e)
        finally:
            self._ws = None
            self._state = ConnectionState.DISCONNECTED

    async def _send_registration(self) -> None:
        """Send agent registration message.

        Format matches blackroad-os-operator AgentRegistration schema:
        - id: agent identifier
        - hostname: device hostname
        - display_name: human-readable name
        - roles: list of roles (e.g., ["pi-node", "edge"])
        - tags: list of tags
        - capabilities: AgentCapabilities object
        """
        # Convert capability list to operator's capability format
        capabilities_obj = {
            "docker": "docker" in self.capabilities,
            "python": "3.11" if "python" in self.capabilities else None,
            "node": None,
            "git": True,
            "disk_gb": None,
            "memory_mb": None,
        }

        await self.send("register", {
            "id": self.agent_id,
            "hostname": self.hostname,
            "display_name": self.hostname,
            "roles": [self.agent_type],
            "tags": list(self.tags.keys()) if self.tags else [],
            "capabilities": capabilities_obj,
        })

    async def _receive_loop(self) -> None:
        """Receive messages from WebSocket."""
        if not self._ws:
            return

        async for data in self._ws:
            try:
                msg = Message.from_json(data)
                await self._dispatch(msg)
            except json.JSONDecodeError as e:
                logger.warning("Invalid JSON received: %s", e)
            except Exception as e:
                logger.exception("Error handling message: %s", e)

    async def _send_loop(self) -> None:
        """Send queued messages."""
        while self._running and self._ws:
            try:
                msg = await asyncio.wait_for(
                    self._send_queue.get(),
                    timeout=1.0,
                )
                if self._ws:
                    await self._ws.send(msg.to_json())
                    logger.debug("Sent %s message", msg.msg_type)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error("Error sending message: %s", e)

    async def _dispatch(self, msg: Message) -> None:
        """Dispatch message to handlers."""
        handlers = self._handlers.get(msg.msg_type, [])
        handlers.extend(self._handlers.get("*", []))  # Wildcard handlers

        for handler in handlers:
            try:
                result = handler(msg)
                if asyncio.iscoroutine(result):
                    await result
            except Exception:
                logger.exception("Error in message handler")

    async def _handle_reconnect(self) -> None:
        """Handle reconnection with backoff."""
        self._state = ConnectionState.RECONNECTING
        self._reconnect_attempts += 1

        # Check max attempts
        if (
            self.config.reconnect_max_attempts > 0
            and self._reconnect_attempts >= self.config.reconnect_max_attempts
        ):
            logger.error("Max reconnect attempts reached")
            self._running = False
            return

        # Exponential backoff with jitter
        delay = min(
            self.config.reconnect_interval * (2 ** min(self._reconnect_attempts - 1, 5)),
            60.0,  # Max 60 seconds
        )
        import random
        delay *= 0.5 + random.random()  # Add jitter

        logger.info(
            "Reconnecting in %.1fs (attempt %d)",
            delay,
            self._reconnect_attempts,
        )
        await asyncio.sleep(delay)
