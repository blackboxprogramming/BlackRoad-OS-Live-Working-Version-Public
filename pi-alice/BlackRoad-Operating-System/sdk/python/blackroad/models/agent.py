"""Agent models for the BlackRoad SDK."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AgentStatus(str, Enum):
    """Agent execution status."""

    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentMetadata(BaseModel):
    """Agent metadata."""

    name: str
    description: str
    category: str
    version: str
    author: str = "BlackRoad"
    tags: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    timeout: int = 300
    retry_count: int = 3
    retry_delay: int = 5

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "name": "deployment-agent",
                "description": "Automated deployment agent",
                "category": "devops",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": ["deployment", "automation"],
                "dependencies": [],
                "timeout": 300,
                "retry_count": 3,
                "retry_delay": 5,
            }
        }


class AgentInfo(BaseModel):
    """Agent information."""

    name: str
    description: str
    category: str
    version: str
    author: str = "BlackRoad"
    tags: List[str] = Field(default_factory=list)
    status: AgentStatus = AgentStatus.IDLE
    dependencies: List[str] = Field(default_factory=list)

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "deployment-agent",
                "description": "Automated deployment agent",
                "category": "devops",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": ["deployment", "automation"],
                "status": "idle",
                "dependencies": [],
            }
        }


class AgentResult(BaseModel):
    """Agent execution result."""

    agent_name: str
    execution_id: str
    status: AgentStatus
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        """Pydantic configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "agent_name": "deployment-agent",
                "execution_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "completed",
                "data": {
                    "deployed": True,
                    "environment": "production",
                    "version": "1.2.3",
                },
                "error": None,
                "started_at": "2024-01-01T00:00:00Z",
                "completed_at": "2024-01-01T00:05:00Z",
                "duration_seconds": 300.0,
                "metadata": {},
            }
        }


class AgentExecuteRequest(BaseModel):
    """Request to execute an agent."""

    agent_name: str
    params: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            "example": {
                "agent_name": "deployment-agent",
                "params": {
                    "environment": "production",
                    "version": "1.2.3",
                    "service": "api",
                },
            }
        }
