"""LEITL Protocol - Live Everyone In The Loop multi-agent communication"""
import asyncio
import json
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set

from app.redis_client import get_redis


class LEITLSession:
    """Represents a single LEITL agent session"""

    def __init__(
        self,
        session_id: str,
        agent_name: str,
        agent_type: str,
        tags: Optional[List[str]] = None
    ):
        self.session_id = session_id
        self.agent_name = agent_name
        self.agent_type = agent_type
        self.tags = tags or []
        self.started_at = datetime.utcnow()
        self.last_heartbeat = datetime.utcnow()
        self.status = "active"
        self.current_task = None
        self.context_sources = []

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "session_id": self.session_id,
            "agent_name": self.agent_name,
            "agent_type": self.agent_type,
            "tags": self.tags,
            "started_at": self.started_at.isoformat(),
            "last_heartbeat": self.last_heartbeat.isoformat(),
            "status": self.status,
            "current_task": self.current_task,
            "context_sources": self.context_sources,
            "uptime": str(datetime.utcnow() - self.started_at)
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'LEITLSession':
        """Create from dictionary"""
        session = cls(
            session_id=data["session_id"],
            agent_name=data["agent_name"],
            agent_type=data["agent_type"],
            tags=data.get("tags", [])
        )
        session.started_at = datetime.fromisoformat(data["started_at"])
        session.last_heartbeat = datetime.fromisoformat(data["last_heartbeat"])
        session.status = data.get("status", "active")
        session.current_task = data.get("current_task")
        session.context_sources = data.get("context_sources", [])
        return session


class LEITLProtocol:
    """Manages LEITL multi-agent communication protocol"""

    def __init__(self):
        self.redis = None
        self.heartbeat_timeout = 60  # seconds
        self.cleanup_interval = 30  # seconds
        self._cleanup_task = None
        self._active_websockets: Dict[str, Set] = {}  # session_id -> set of websockets

    async def initialize(self):
        """Initialize Redis and start cleanup task"""
        self.redis = await get_redis()
        # Start cleanup task
        self._cleanup_task = asyncio.create_task(self._cleanup_dead_sessions())

    async def shutdown(self):
        """Shutdown protocol"""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

    async def register_session(
        self,
        agent_name: str,
        agent_type: str = "assistant",
        tags: Optional[List[str]] = None
    ) -> LEITLSession:
        """
        Register a new LEITL session

        Args:
            agent_name: Name of the agent (e.g., "Cece", "Claude")
            agent_type: Type of agent (e.g., "code_assistant", "chat")
            tags: Optional tags for categorization

        Returns:
            LEITLSession object with session_id
        """
        # Generate session ID
        session_id = f"leitl-{agent_name.lower()}-{secrets.token_hex(8)}"

        # Create session
        session = LEITLSession(
            session_id=session_id,
            agent_name=agent_name,
            agent_type=agent_type,
            tags=tags or []
        )

        # Store in Redis
        await self._save_session(session)

        # Add to active sessions set
        await self.redis.sadd("leitl:sessions:active", session_id)

        # Broadcast session started event
        await self.broadcast_event(
            event_type="session.started",
            session_id=session_id,
            data={
                "agent_name": agent_name,
                "agent_type": agent_type,
                "tags": tags or []
            }
        )

        return session

    async def heartbeat(
        self,
        session_id: str,
        current_task: Optional[str] = None
    ):
        """
        Update session heartbeat

        Args:
            session_id: Session ID
            current_task: Current task description (optional)
        """
        session = await self._get_session(session_id)
        if not session:
            return

        session.last_heartbeat = datetime.utcnow()
        if current_task:
            session.current_task = current_task

        await self._save_session(session)

        # Broadcast heartbeat event
        await self.broadcast_event(
            event_type="session.heartbeat",
            session_id=session_id,
            data={
                "current_task": current_task
            }
        )

    async def end_session(self, session_id: str):
        """End a session and cleanup"""
        # Get session
        session = await self._get_session(session_id)
        if not session:
            return

        # Remove from active set
        await self.redis.srem("leitl:sessions:active", session_id)

        # Broadcast session ended
        await self.broadcast_event(
            event_type="session.ended",
            session_id=session_id,
            data={
                "agent_name": session.agent_name,
                "uptime": str(datetime.utcnow() - session.started_at)
            }
        )

        # Delete session
        await self.redis.delete(f"leitl:session:{session_id}")

    async def get_active_sessions(self) -> List[Dict]:
        """Get all active sessions"""
        session_ids = await self.redis.smembers("leitl:sessions:active")
        sessions = []

        for session_id in session_ids:
            session = await self._get_session(session_id)
            if session:
                sessions.append(session.to_dict())

        return sessions

    async def broadcast_event(
        self,
        event_type: str,
        session_id: str,
        data: Optional[Dict] = None
    ):
        """
        Broadcast event to all active sessions

        Args:
            event_type: Type of event (e.g., "task.started", "context.updated")
            session_id: Originating session ID
            data: Event data
        """
        message = {
            "event_type": event_type,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data or {}
        }

        # Publish to Redis PubSub
        await self.redis.publish(
            "leitl:events",
            json.dumps(message)
        )

        # Store in recent messages (last 100)
        await self.redis.lpush(
            "leitl:messages",
            json.dumps(message)
        )
        await self.redis.ltrim("leitl:messages", 0, 99)

        # Log activity
        await self._log_activity(message)

        # Send to connected WebSockets
        await self._broadcast_to_websockets(message)

    async def get_recent_messages(self, limit: int = 20) -> List[Dict]:
        """Get recent broadcast messages"""
        messages = await self.redis.lrange("leitl:messages", 0, limit - 1)
        return [json.loads(msg) for msg in messages]

    async def get_activity_log(self, since: Optional[datetime] = None, limit: int = 50) -> List[Dict]:
        """Get activity log"""
        # Get all activity entries
        entries = await self.redis.lrange("leitl:activity", 0, limit - 1)
        activities = [json.loads(entry) for entry in entries]

        # Filter by timestamp if provided
        if since:
            activities = [
                a for a in activities
                if datetime.fromisoformat(a["timestamp"]) >= since
            ]

        return activities

    async def register_websocket(self, session_id: str, websocket):
        """Register a WebSocket for a session"""
        if session_id not in self._active_websockets:
            self._active_websockets[session_id] = set()
        self._active_websockets[session_id].add(websocket)

    async def unregister_websocket(self, session_id: str, websocket):
        """Unregister a WebSocket"""
        if session_id in self._active_websockets:
            self._active_websockets[session_id].discard(websocket)
            if not self._active_websockets[session_id]:
                del self._active_websockets[session_id]

    async def _broadcast_to_websockets(self, message: Dict):
        """Broadcast message to all connected WebSockets"""
        # Send to all sessions
        dead_sockets = []

        for session_id, sockets in self._active_websockets.items():
            for ws in sockets:
                try:
                    await ws.send_json(message)
                except:
                    dead_sockets.append((session_id, ws))

        # Cleanup dead sockets
        for session_id, ws in dead_sockets:
            await self.unregister_websocket(session_id, ws)

    async def _save_session(self, session: LEITLSession):
        """Save session to Redis"""
        await self.redis.set(
            f"leitl:session:{session.session_id}",
            json.dumps(session.to_dict()),
            ex=3600  # 1 hour TTL
        )

    async def _get_session(self, session_id: str) -> Optional[LEITLSession]:
        """Get session from Redis"""
        data = await self.redis.get(f"leitl:session:{session_id}")
        if data:
            return LEITLSession.from_dict(json.loads(data))
        return None

    async def _log_activity(self, message: Dict):
        """Log activity to Redis list"""
        await self.redis.lpush(
            "leitl:activity",
            json.dumps(message)
        )
        await self.redis.ltrim("leitl:activity", 0, 999)  # Keep last 1000
        # Set expiration on activity log
        await self.redis.expire("leitl:activity", 86400)  # 24 hours

    async def _cleanup_dead_sessions(self):
        """Background task to cleanup dead sessions"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)

                # Get all active session IDs
                session_ids = await self.redis.smembers("leitl:sessions:active")

                now = datetime.utcnow()

                for session_id in session_ids:
                    session = await self._get_session(session_id)
                    if not session:
                        # Session data missing, remove from active set
                        await self.redis.srem("leitl:sessions:active", session_id)
                        continue

                    # Check if heartbeat timeout
                    time_since_heartbeat = (now - session.last_heartbeat).total_seconds()

                    if time_since_heartbeat > self.heartbeat_timeout:
                        # Session is dead, cleanup
                        await self.end_session(session_id)

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in LEITL cleanup: {e}")


# Singleton instance
leitl_protocol = LEITLProtocol()
