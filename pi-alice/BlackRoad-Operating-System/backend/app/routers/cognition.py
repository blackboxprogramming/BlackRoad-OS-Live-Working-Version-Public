"""
Cognition API Router

Exposes the Cece Cognition Framework via REST API:
- Execute individual agents (Cece, Wasp, Clause, Codex)
- Execute multi-agent workflows
- Query reasoning traces
- Access agent memory
- Manage prompts

Endpoints:
- POST /api/cognition/execute - Execute single agent
- POST /api/cognition/workflows - Execute multi-agent workflow
- GET  /api/cognition/reasoning-trace/{workflow_id} - Get reasoning trace
- GET  /api/cognition/memory - Query agent memory
- POST /api/prompts/register - Register new prompt
- GET  /api/prompts/search - Search prompts
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field

# Import our agents and orchestration
from agents.categories.ai_ml.cece_agent import CeceAgent
from agents.categories.ai_ml.wasp_agent import WaspAgent
from agents.categories.ai_ml.clause_agent import ClauseAgent
from agents.categories.ai_ml.codex_agent import CodexAgent
from app.services.orchestration import (
    OrchestrationEngine,
    Workflow,
    WorkflowStep,
    ExecutionMode
)


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cognition", tags=["Cognition"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class AgentExecuteRequest(BaseModel):
    """Request to execute single agent"""
    agent: str = Field(..., description="Agent name: cece, wasp, clause, codex")
    input: str = Field(..., description="Input/prompt for the agent")
    context: Dict[str, Any] = Field(default_factory=dict, description="Optional context")
    verbose: bool = Field(default=True, description="Return full reasoning trace")


class AgentExecuteResponse(BaseModel):
    """Response from agent execution"""
    agent: str
    result: Dict[str, Any]
    reasoning_trace: List[Any]
    confidence: float
    execution_time_seconds: float
    warnings: List[str] = Field(default_factory=list)


class WorkflowStepRequest(BaseModel):
    """Workflow step definition"""
    name: str
    agent_name: str
    input_template: str
    depends_on: List[str] = Field(default_factory=list)
    parallel_with: List[str] = Field(default_factory=list)
    max_retries: int = Field(default=3)


class WorkflowExecuteRequest(BaseModel):
    """Request to execute multi-agent workflow"""
    name: str
    steps: List[WorkflowStepRequest]
    mode: str = Field(default="sequential", description="sequential, parallel, or recursive")
    initial_context: Dict[str, Any] = Field(default_factory=dict)
    timeout_seconds: int = Field(default=600)


class WorkflowExecuteResponse(BaseModel):
    """Response from workflow execution"""
    workflow_id: str
    status: str
    step_results: Dict[str, Any]
    reasoning_trace: List[Dict[str, Any]]
    memory: Dict[str, Any]
    total_duration_seconds: float
    error: Optional[str] = None


class PromptRegisterRequest(BaseModel):
    """Request to register new prompt"""
    agent_name: str
    prompt_text: str
    version: str = Field(default="1.0.0")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PromptSearchRequest(BaseModel):
    """Request to search prompts"""
    agent: Optional[str] = None
    version: Optional[str] = None
    search_term: Optional[str] = None


# ============================================================================
# AGENT EXECUTION ENDPOINTS
# ============================================================================

# Global orchestration engine
orchestration_engine = OrchestrationEngine()


@router.post("/execute", response_model=AgentExecuteResponse)
async def execute_agent(request: AgentExecuteRequest):
    """
    Execute single agent

    Execute one of the core agents (Cece, Wasp, Clause, Codex) with the given input.

    **Agents:**
    - `cece`: Cognitive architect (15-step reasoning + 6-step architecture)
    - `wasp`: UI/UX specialist (7-step design process)
    - `clause`: Legal specialist (7-step legal review)
    - `codex`: Code execution specialist (7-step dev process)

    **Example:**
    ```json
    {
      "agent": "cece",
      "input": "I'm overwhelmed with 10 projects and don't know where to start",
      "context": {
        "projects": ["Project A", "Project B", ...],
        "deadlines": {...}
      }
    }
    ```
    """
    logger.info(f"🚀 Executing agent: {request.agent}")

    # Get agent instance
    if request.agent not in orchestration_engine.agents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown agent: {request.agent}. Available: cece, wasp, clause, codex"
        )

    agent = orchestration_engine.agents[request.agent]

    # Prepare params
    params = {
        "input": request.input,
        "context": request.context,
        "verbose": request.verbose
    }

    try:
        # Execute agent
        result = await agent.run(params)

        # Build response
        return AgentExecuteResponse(
            agent=request.agent,
            result=result.data,
            reasoning_trace=result.data.get("reasoning_trace", []),
            confidence=result.data.get("confidence", 0.85),
            execution_time_seconds=result.duration_seconds or 0.0,
            warnings=result.data.get("warnings", [])
        )

    except Exception as e:
        logger.error(f"Error executing agent {request.agent}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent execution failed: {str(e)}"
        )


@router.post("/workflows", response_model=WorkflowExecuteResponse)
async def execute_workflow(request: WorkflowExecuteRequest):
    """
    Execute multi-agent workflow

    Execute a multi-step workflow with multiple agents working together.

    **Execution Modes:**
    - `sequential`: Steps run one after another (A → B → C)
    - `parallel`: Independent steps run simultaneously where possible
    - `recursive`: Steps iterate until convergence

    **Example:**
    ```json
    {
      "name": "Build Dashboard",
      "mode": "sequential",
      "steps": [
        {
          "name": "architect",
          "agent_name": "cece",
          "input_template": "Design a dashboard for AI agent workflows"
        },
        {
          "name": "backend",
          "agent_name": "codex",
          "input_template": "${architect.architecture.backend_spec}",
          "depends_on": ["architect"]
        },
        {
          "name": "frontend",
          "agent_name": "wasp",
          "input_template": "${architect.architecture.frontend_spec}",
          "depends_on": ["architect"]
        }
      ]
    }
    ```
    """
    logger.info(f"🚀 Executing workflow: {request.name}")

    # Convert request to Workflow
    try:
        mode = ExecutionMode[request.mode.upper()]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid execution mode: {request.mode}. Use: sequential, parallel, or recursive"
        )

    workflow = Workflow(
        id=str(uuid4()),
        name=request.name,
        steps=[
            WorkflowStep(
                name=step.name,
                agent_name=step.agent_name,
                input_template=step.input_template,
                depends_on=step.depends_on,
                parallel_with=step.parallel_with,
                max_retries=step.max_retries
            )
            for step in request.steps
        ],
        mode=mode,
        timeout_seconds=request.timeout_seconds
    )

    try:
        # Execute workflow
        result = await orchestration_engine.execute_workflow(
            workflow,
            initial_context=request.initial_context
        )

        # Build response
        return WorkflowExecuteResponse(
            workflow_id=result.workflow_id,
            status=result.status.value,
            step_results=result.step_results,
            reasoning_trace=result.reasoning_trace,
            memory=result.memory,
            total_duration_seconds=result.total_duration_seconds,
            error=result.error
        )

    except Exception as e:
        logger.error(f"Error executing workflow {request.name}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/reasoning-trace/{workflow_id}")
async def get_reasoning_trace(workflow_id: str):
    """
    Get reasoning trace for workflow

    Retrieve the complete reasoning trace showing how agents arrived at their decisions.

    Returns a list of reasoning steps with:
    - Step name and emoji
    - Input context
    - Output/decision
    - Confidence score
    - Timestamp
    """
    # In a real implementation, would fetch from database
    # For now, return placeholder
    return {
        "workflow_id": workflow_id,
        "trace": [
            {
                "step": "🚨 Not ok",
                "agent": "cece",
                "input": "I'm overwhelmed with projects",
                "output": "There's too many competing priorities without clear hierarchy",
                "confidence": 0.95,
                "timestamp": datetime.utcnow().isoformat()
            }
        ],
        "overall_confidence": 0.87
    }


@router.get("/memory")
async def get_memory(workflow_id: Optional[str] = None):
    """
    Query agent memory

    Retrieve shared memory/context from workflow execution.

    Can filter by workflow_id to get memory for specific workflow.
    """
    # In a real implementation, would fetch from database/cache
    return {
        "workflow_id": workflow_id,
        "context": {
            "user_preferences": {},
            "session_data": {}
        },
        "reasoning_trace": [],
        "confidence_scores": {}
    }


@router.get("/active-workflows")
async def get_active_workflows():
    """
    Get list of active workflows

    Returns workflow IDs currently being executed.
    """
    active = orchestration_engine.get_active_workflows()

    return {
        "active_workflows": active,
        "count": len(active)
    }


@router.post("/cancel-workflow/{workflow_id}")
async def cancel_workflow(workflow_id: str):
    """
    Cancel running workflow

    Attempts to cancel a running workflow. Returns success status.
    """
    success = await orchestration_engine.cancel_workflow(workflow_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow not found or already completed: {workflow_id}"
        )

    return {
        "workflow_id": workflow_id,
        "status": "cancelled"
    }


# ============================================================================
# PROMPT MANAGEMENT ENDPOINTS
# ============================================================================

# In-memory prompt registry (would be database in production)
prompt_registry: Dict[str, List[Dict[str, Any]]] = {}


@router.post("/prompts/register")
async def register_prompt(request: PromptRegisterRequest):
    """
    Register new agent prompt

    Register a custom summon prompt for an agent.

    **Example:**
    ```json
    {
      "agent_name": "cece",
      "prompt_text": "Cece, run cognition.\\n\\nUse the Alexa-Cece Framework...\\n\\nNow analyze: [YOUR REQUEST]",
      "version": "1.0.0",
      "metadata": {
        "author": "Alexa",
        "purpose": "Full cognition framework"
      }
    }
    ```
    """
    prompt_id = str(uuid4())

    prompt = {
        "id": prompt_id,
        "agent_name": request.agent_name,
        "prompt_text": request.prompt_text,
        "version": request.version,
        "metadata": request.metadata,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }

    if request.agent_name not in prompt_registry:
        prompt_registry[request.agent_name] = []

    prompt_registry[request.agent_name].append(prompt)

    logger.info(f"Registered prompt for {request.agent_name} (ID: {prompt_id})")

    return {
        "prompt_id": prompt_id,
        "status": "registered"
    }


@router.get("/prompts/search")
async def search_prompts(
    agent: Optional[str] = None,
    version: Optional[str] = None
):
    """
    Search registered prompts

    Search for prompts by agent name and/or version.

    **Query Parameters:**
    - `agent`: Filter by agent name (cece, wasp, clause, codex)
    - `version`: Filter by version (e.g., "1.0.0", "latest")
    """
    results = []

    if agent:
        if agent in prompt_registry:
            prompts = prompt_registry[agent]

            if version == "latest":
                # Return only the most recent version
                if prompts:
                    prompts = [max(prompts, key=lambda p: p["created_at"])]

            elif version:
                # Filter by specific version
                prompts = [p for p in prompts if p["version"] == version]

            results.extend(prompts)
    else:
        # Return all prompts
        for agent_prompts in prompt_registry.values():
            results.extend(agent_prompts)

    return {
        "prompts": results,
        "count": len(results)
    }


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/agents")
async def list_agents():
    """
    List available agents

    Returns information about all available agents.
    """
    agents = []

    for agent_name, agent_instance in orchestration_engine.agents.items():
        info = agent_instance.get_info()
        agents.append(info)

    return {
        "agents": agents,
        "count": len(agents)
    }


@router.get("/health")
async def health_check():
    """
    Health check for cognition system

    Returns system status and metrics.
    """
    return {
        "status": "healthy",
        "agents_available": len(orchestration_engine.agents),
        "active_workflows": len(orchestration_engine.get_active_workflows()),
        "prompts_registered": sum(len(prompts) for prompts in prompt_registry.values()),
        "timestamp": datetime.utcnow().isoformat()
    }
