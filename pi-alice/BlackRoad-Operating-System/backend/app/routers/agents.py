"""
Agent API Router

Exposes the BlackRoad Agent Library via REST API.

Endpoints:
- GET /api/agents - List all agents
- GET /api/agents/{agent_name} - Get agent details
- POST /api/agents/{agent_name}/execute - Execute an agent
- GET /api/agents/categories - List categories
- GET /api/agents/search?q=query - Search agents
- GET /api/agents/stats - Get agent statistics
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import asyncio
import sys
from pathlib import Path

# Add agents directory to path
agents_path = Path(__file__).parent.parent.parent.parent / 'agents'
sys.path.insert(0, str(agents_path))

try:
    from base import AgentRegistry, AgentExecutor, ExecutionPlan, AgentStatus
except ImportError:
    # Fallback if agents module not available
    AgentRegistry = None
    AgentExecutor = None

router = APIRouter(prefix="/api/agents", tags=["agents"])

# Initialize registry and executor
registry = AgentRegistry() if AgentRegistry else None
executor = AgentExecutor() if AgentExecutor else None


# Pydantic models
class AgentInfo(BaseModel):
    """Agent information response."""
    name: str
    description: str
    category: str
    version: str
    author: str
    tags: List[str]
    status: str


class AgentExecuteRequest(BaseModel):
    """Agent execution request."""
    params: Dict[str, Any] = Field(default_factory=dict)


class AgentExecuteResponse(BaseModel):
    """Agent execution response."""
    agent_name: str
    execution_id: str
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    duration_seconds: Optional[float] = None


class AgentListResponse(BaseModel):
    """List of agents response."""
    total: int
    agents: List[AgentInfo]


class AgentStatsResponse(BaseModel):
    """Agent statistics response."""
    total_agents: int
    total_categories: int
    agents_by_category: Dict[str, int]
    categories: List[str]


class ExecutionPlanRequest(BaseModel):
    """Execution plan request."""
    agent_names: List[str]
    mode: str = "parallel"  # parallel, sequential, or dag
    max_concurrency: int = 5
    stop_on_error: bool = True
    params: Dict[str, Any] = Field(default_factory=dict)


class ExecutionPlanResponse(BaseModel):
    """Execution plan response."""
    plan_id: str
    status: str
    succeeded: int
    failed: int
    total_duration_seconds: float
    results: List[AgentExecuteResponse]


@router.get("/", response_model=AgentListResponse)
async def list_agents(category: Optional[str] = None):
    """
    List all agents or filter by category.

    Args:
        category: Optional category filter

    Returns:
        List of agents
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    agents = registry.list_agents(category=category)

    return AgentListResponse(
        total=len(agents),
        agents=[
            AgentInfo(**agent.get_info())
            for agent in agents
        ]
    )


@router.get("/categories")
async def list_categories():
    """
    List all agent categories.

    Returns:
        List of category names
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    categories = registry.list_categories()
    return {"categories": categories, "total": len(categories)}


@router.get("/stats", response_model=AgentStatsResponse)
async def get_stats():
    """
    Get agent statistics.

    Returns:
        Agent statistics
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    stats = registry.get_stats()
    return AgentStatsResponse(**stats)


@router.get("/search")
async def search_agents(q: str):
    """
    Search for agents.

    Args:
        q: Search query

    Returns:
        List of matching agents
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    results = registry.search(q)

    return {
        "query": q,
        "total": len(results),
        "agents": [
            AgentInfo(**agent.get_info())
            for agent in results
        ]
    }


@router.get("/{agent_name}", response_model=AgentInfo)
async def get_agent(agent_name: str):
    """
    Get details about a specific agent.

    Args:
        agent_name: Name of the agent

    Returns:
        Agent information

    Raises:
        HTTPException: If agent not found
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    agent = registry.get_agent(agent_name)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_name}' not found"
        )

    return AgentInfo(**agent.get_info())


@router.post("/{agent_name}/execute", response_model=AgentExecuteResponse)
async def execute_agent(
    agent_name: str,
    request: AgentExecuteRequest,
    background_tasks: BackgroundTasks
):
    """
    Execute an agent.

    Args:
        agent_name: Name of the agent to execute
        request: Execution parameters

    Returns:
        Execution result

    Raises:
        HTTPException: If agent not found or execution fails
    """
    if not registry or not executor:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    agent = registry.get_agent(agent_name)

    if not agent:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_name}' not found"
        )

    # Execute the agent
    result = await executor.execute(agent, request.params)

    return AgentExecuteResponse(
        agent_name=result.agent_name,
        execution_id=result.execution_id,
        status=result.status.value,
        data=result.data,
        error=result.error,
        duration_seconds=result.duration_seconds
    )


@router.post("/execute-plan", response_model=ExecutionPlanResponse)
async def execute_plan(request: ExecutionPlanRequest):
    """
    Execute multiple agents with an execution plan.

    Args:
        request: Execution plan request

    Returns:
        Execution plan result

    Raises:
        HTTPException: If agents not found or execution fails
    """
    if not registry or not executor:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    # Get all agents
    agents = []
    for agent_name in request.agent_names:
        agent = registry.get_agent(agent_name)
        if not agent:
            raise HTTPException(
                status_code=404,
                detail=f"Agent '{agent_name}' not found"
            )
        agents.append(agent)

    # Create execution plan
    plan = ExecutionPlan(
        agents=agents,
        mode=request.mode,
        max_concurrency=request.max_concurrency,
        stop_on_error=request.stop_on_error
    )

    # Execute plan
    result = await executor.execute_plan(plan, request.params)

    return ExecutionPlanResponse(
        plan_id=result.plan_id,
        status=result.status,
        succeeded=result.succeeded,
        failed=result.failed,
        total_duration_seconds=result.total_duration_seconds,
        results=[
            AgentExecuteResponse(
                agent_name=r.agent_name,
                execution_id=r.execution_id,
                status=r.status.value,
                data=r.data,
                error=r.error,
                duration_seconds=r.duration_seconds
            )
            for r in result.results
        ]
    )


@router.get("/manifest")
async def get_manifest():
    """
    Get complete agent manifest.

    Returns:
        Agent manifest with all agents and categories
    """
    if not registry:
        raise HTTPException(
            status_code=503,
            detail="Agent system not available"
        )

    manifest = registry.export_manifest()
    return manifest
