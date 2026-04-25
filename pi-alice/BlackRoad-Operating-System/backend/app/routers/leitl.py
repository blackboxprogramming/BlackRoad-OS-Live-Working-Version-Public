"""LEITL Protocol API Router - Live Everyone In The Loop"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.services.leitl_protocol import leitl_protocol
from app.services.webdav_context import webdav_context_manager


router = APIRouter(prefix="/api/leitl", tags=["LEITL"])


# Pydantic models
class SessionRegisterRequest(BaseModel):
    """Request to register a new LEITL session"""
    agent_name: str = Field(..., description="Name of the agent (e.g., Cece, Claude)")
    agent_type: str = Field(default="assistant", description="Type of agent")
    tags: Optional[List[str]] = Field(default=None, description="Optional tags")


class SessionRegisterResponse(BaseModel):
    """Response after registering session"""
    session_id: str
    websocket_url: str
    agent_name: str
    started_at: str


class HeartbeatRequest(BaseModel):
    """Heartbeat update"""
    current_task: Optional[str] = Field(default=None, description="Current task description")


class BroadcastRequest(BaseModel):
    """Broadcast message request"""
    event_type: str = Field(..., description="Event type (e.g., task.started)")
    data: Optional[dict] = Field(default=None, description="Event data")


class WebDAVContextRequest(BaseModel):
    """Request for WebDAV context"""
    webdav_url: str = Field(..., description="Base WebDAV URL")
    username: Optional[str] = Field(default=None, description="WebDAV username")
    password: Optional[str] = Field(default=None, description="WebDAV password")
    query: Optional[str] = Field(default=None, description="Search query")
    file_types: Optional[List[str]] = Field(default=None, description="File type filters")
    max_results: int = Field(default=10, description="Max results to return")


# Initialize on startup
@router.on_event("startup")
async def startup():
    """Initialize LEITL protocol and WebDAV manager"""
    await leitl_protocol.initialize()
    await webdav_context_manager.initialize()


@router.on_event("shutdown")
async def shutdown():
    """Shutdown LEITL protocol"""
    await leitl_protocol.shutdown()


# Session management endpoints
@router.post("/session/register", response_model=SessionRegisterResponse)
async def register_session(request: SessionRegisterRequest):
    """
    Register a new LEITL session

    Creates a new session ID and broadcasts to other active sessions.
    Returns WebSocket URL for real-time communication.
    """
    session = await leitl_protocol.register_session(
        agent_name=request.agent_name,
        agent_type=request.agent_type,
        tags=request.tags
    )

    # Construct WebSocket URL (assumes same host)
    # In production, this would use the actual host from request
    websocket_url = f"ws://localhost:8000/api/leitl/ws/{session.session_id}"

    return SessionRegisterResponse(
        session_id=session.session_id,
        websocket_url=websocket_url,
        agent_name=session.agent_name,
        started_at=session.started_at.isoformat()
    )


@router.get("/sessions/active")
async def get_active_sessions():
    """
    Get all active LEITL sessions

    Returns list of currently active agent sessions with their status.
    """
    sessions = await leitl_protocol.get_active_sessions()
    return {
        "sessions": sessions,
        "total": len(sessions)
    }


@router.post("/session/{session_id}/heartbeat")
async def send_heartbeat(session_id: str, request: HeartbeatRequest):
    """
    Send heartbeat for a session

    Keeps the session alive and optionally updates current task.
    Sessions without heartbeat for 60s are considered dead.
    """
    await leitl_protocol.heartbeat(
        session_id=session_id,
        current_task=request.current_task
    )

    return {"status": "ok"}


@router.post("/session/{session_id}/end")
async def end_session(session_id: str):
    """
    End a session

    Gracefully terminates a session and broadcasts to other agents.
    """
    await leitl_protocol.end_session(session_id)
    return {"status": "ended"}


# Messaging endpoints
@router.post("/session/{session_id}/broadcast")
async def broadcast_message(session_id: str, request: BroadcastRequest):
    """
    Broadcast event to all active sessions

    Publishes event to Redis PubSub and WebSocket connections.
    All active sessions will receive this event.
    """
    await leitl_protocol.broadcast_event(
        event_type=request.event_type,
        session_id=session_id,
        data=request.data
    )

    return {"status": "broadcasted"}


@router.get("/messages/recent")
async def get_recent_messages(limit: int = Query(default=20, le=100)):
    """
    Get recent broadcast messages

    Returns the last N messages broadcast across all sessions.
    """
    messages = await leitl_protocol.get_recent_messages(limit=limit)
    return {
        "messages": messages,
        "count": len(messages)
    }


@router.get("/activity")
async def get_activity_log(
    since: Optional[str] = Query(default=None, description="ISO timestamp"),
    limit: int = Query(default=50, le=200)
):
    """
    Get activity log

    Returns recent activity across all sessions.
    Optionally filter by timestamp.
    """
    since_dt = datetime.fromisoformat(since) if since else None
    activities = await leitl_protocol.get_activity_log(since=since_dt, limit=limit)

    return {
        "activities": activities,
        "count": len(activities)
    }


# WebDAV context endpoints
@router.post("/context/sync")
async def sync_webdav_context(request: WebDAVContextRequest):
    """
    Sync and get WebDAV context

    Fetches files from WebDAV, matches based on query, and returns content.
    Results are cached for 1 hour.
    """
    context = await webdav_context_manager.sync_and_get(
        webdav_url=request.webdav_url,
        username=request.username,
        password=request.password,
        query=request.query,
        file_types=request.file_types,
        max_results=request.max_results
    )

    return context


# WebSocket endpoint
@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket connection for real-time LEITL events

    Connect with: ws://host/api/leitl/ws/{session_id}

    Messages received:
    - Broadcast events from other sessions
    - Heartbeat confirmations
    - System notifications

    Messages to send:
    - {"type": "heartbeat", "current_task": "..."}
    - {"type": "broadcast", "event_type": "...", "data": {...}}
    """
    await websocket.accept()

    # Register WebSocket
    await leitl_protocol.register_websocket(session_id, websocket)

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "event_type": "connection.established",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Listen for messages
        while True:
            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "heartbeat":
                # Update heartbeat
                current_task = data.get("current_task")
                await leitl_protocol.heartbeat(session_id, current_task)

                # Send confirmation
                await websocket.send_json({
                    "event_type": "heartbeat.confirmed",
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat()
                })

            elif message_type == "broadcast":
                # Broadcast event
                event_type = data.get("event_type")
                event_data = data.get("data")

                await leitl_protocol.broadcast_event(
                    event_type=event_type,
                    session_id=session_id,
                    data=event_data
                )

            elif message_type == "ping":
                # Respond to ping
                await websocket.send_json({
                    "event_type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })

    except WebSocketDisconnect:
        # Unregister WebSocket
        await leitl_protocol.unregister_websocket(session_id, websocket)
    except Exception as e:
        print(f"WebSocket error for {session_id}: {e}")
        await leitl_protocol.unregister_websocket(session_id, websocket)


# Health check
@router.get("/health")
async def health_check():
    """LEITL protocol health check"""
    sessions = await leitl_protocol.get_active_sessions()

    return {
        "status": "healthy",
        "active_sessions": len(sessions),
        "timestamp": datetime.utcnow().isoformat()
    }


# Quick start endpoint (combines register + context)
@router.post("/quick-start")
async def quick_start(
    agent_name: str = Query(..., description="Agent name"),
    webdav_url: Optional[str] = Query(default=None, description="WebDAV URL"),
    query: Optional[str] = Query(default=None, description="Context query"),
    tags: Optional[List[str]] = Query(default=None, description="Session tags")
):
    """
    Quick start LEITL session with optional WebDAV context

    One-shot endpoint that:
    1. Registers a new session
    2. Optionally syncs WebDAV context
    3. Returns session info + context + WebSocket URL

    Perfect for "Turn on LEITL" prompts!
    """
    # Register session
    session = await leitl_protocol.register_session(
        agent_name=agent_name,
        agent_type="assistant",
        tags=tags or []
    )

    websocket_url = f"ws://localhost:8000/api/leitl/ws/{session.session_id}"

    result = {
        "session": {
            "session_id": session.session_id,
            "agent_name": session.agent_name,
            "websocket_url": websocket_url,
            "started_at": session.started_at.isoformat()
        },
        "context": None,
        "other_sessions": await leitl_protocol.get_active_sessions()
    }

    # Optionally sync WebDAV context
    if webdav_url:
        context = await webdav_context_manager.sync_and_get(
            webdav_url=webdav_url,
            query=query,
            max_results=5
        )
        result["context"] = context

    return result
