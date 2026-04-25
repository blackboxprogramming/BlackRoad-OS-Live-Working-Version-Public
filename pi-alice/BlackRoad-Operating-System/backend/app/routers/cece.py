"""
Cece Ultra Router - Full Stack Cognition API

Provides endpoints for the Cece Ultra cognitive processing engine.
Integrates the 15-step Alexa Cognition Framework with the Cece Architecture Layer.

Endpoints:
- POST /api/cece/cognition - Run full stack cognition
- GET /api/cece/cognition/{execution_id} - Get execution results
- GET /api/cece/cognition/history - List execution history
- POST /api/cece/cognition/analyze - Quick analysis without storage
"""

import sys
import os
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

# Add agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../'))

try:
    from agents.categories.cognition.cece_ultra import CeceUltraAgent
except ImportError:
    CeceUltraAgent = None

from ..database import get_db
from ..models.cognition import (
    Workflow,
    WorkflowExecution,
    WorkflowStatus,
    ReasoningTrace,
    AgentMemory,
    PromptRegistry,
    ExecutionMode
)


router = APIRouter(prefix="/api/cece", tags=["Cece Ultra"])


# ============================================================================
# Request/Response Models
# ============================================================================

class CognitionRequest(BaseModel):
    """Request to run full stack cognition."""
    input: str = Field(..., description="User input to process")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    mode: str = Field(default="full_stack", description="Processing mode: full_stack, quick, deep_dive")
    orchestrate: bool = Field(default=False, description="Enable multi-agent orchestration")
    save_to_memory: bool = Field(default=True, description="Save results to agent memory")
    user_id: Optional[str] = Field(default=None, description="User ID for memory association")
    session_id: Optional[str] = Field(default=None, description="Session ID for memory association")


class CognitionResponse(BaseModel):
    """Response from cognition processing."""
    execution_id: str
    status: str
    normalized_input: Dict[str, Any]
    cognitive_pipeline: Dict[str, Any]
    architecture_output: Dict[str, Any]
    orchestration: Optional[Dict[str, Any]]
    action_plan: list
    stable_summary: str
    extras: Dict[str, Any]
    timestamp: datetime


class QuickAnalysisRequest(BaseModel):
    """Request for quick analysis without full processing."""
    input: str = Field(..., description="Input to analyze")
    focus: str = Field(default="emotional", description="Analysis focus: emotional, structural, priority")


class QuickAnalysisResponse(BaseModel):
    """Response from quick analysis."""
    input: str
    focus: str
    emotional_payload: str
    urgency: str
    vibe: str
    suggestions: list
    timestamp: datetime


class ExecutionHistoryResponse(BaseModel):
    """Historical execution record."""
    execution_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    input_preview: str
    confidence: Optional[float]


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/cognition", response_model=CognitionResponse)
async def run_cognition(
    request: CognitionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Run full stack cognition on user input.

    Processes input through:
    1. Input normalization (🫧)
    2. 15-step cognitive pipeline (🧩)
    3. 6-module architecture layer (🛠️)
    4. Multi-agent orchestration (🧬) - if enabled
    5. Output generation (📋)

    Results are saved to database and optionally to agent memory.
    """
    if not CeceUltraAgent:
        raise HTTPException(
            status_code=503,
            detail="Cece Ultra agent not available. Check agent installation."
        )

    # Initialize agent
    agent = CeceUltraAgent()

    # Ensure a workflow exists for this execution
    workflow_name = "Cece Ultra Full Stack Cognition"
    workflow_result = await db.execute(
        select(Workflow).where(Workflow.name == workflow_name)
    )
    workflow = workflow_result.scalar_one_or_none()

    if not workflow:
        workflow = Workflow(
            name=workflow_name,
            description="Cece Ultra 15-step cognition pipeline with architecture layer",
            mode=ExecutionMode.SEQUENTIAL,
            steps=[
                "trigger",
                "root_cause",
                "impulse",
                "reflection",
                "challenge",
                "counterpoint",
                "determination",
                "question",
                "bias_offset",
                "values_alignment",
                "clarification",
                "restatement",
                "final_clarification",
                "validation",
                "final_answer",
            ],
            created_by="cece-ultra",
            tags=["cece", "cognition", "ultra"],
        )
        db.add(workflow)
        await db.flush()

    # Create execution record
    execution_id = uuid4()
    execution = WorkflowExecution(
        id=execution_id,
        workflow_id=workflow.id,
        status=WorkflowStatus.RUNNING,
        started_at=datetime.utcnow(),
        initial_context={
            'input': request.input,
            'context': request.context or {},
            'mode': request.mode,
            'orchestrate': request.orchestrate
        },
        total_agents_used=1
    )

    try:
        # Run agent
        result = await agent.run({
            'input': request.input,
            'context': request.context or {},
            'mode': request.mode,
            'orchestrate': request.orchestrate
        })

        # Update execution record
        execution.status = WorkflowStatus.COMPLETED if result.status.value == "completed" else WorkflowStatus.FAILED
        execution.completed_at = datetime.utcnow()
        execution.duration_seconds = result.duration_seconds
        execution.step_results = result.data
        execution.overall_confidence = result.data.get('cognitive_pipeline', {}).get('confidence', 0.0)

        if result.error:
            execution.error_message = result.error
            execution.status = WorkflowStatus.FAILED

        # Save execution
        db.add(execution)

        # Save reasoning traces
        if result.data and 'cognitive_pipeline' in result.data:
            pipeline = result.data['cognitive_pipeline']
            step_number = 0

            # Map of cognitive steps to emojis
            step_emojis = {
                'trigger': '🚨',
                'root_cause': '❓',
                'impulse': '⚡',
                'reflection': '🪞',
                'challenge': '⚔️',
                'counterpoint': '🔁',
                'determination': '🎯',
                'question': '🧐',
                'bias_offset': '⚖️',
                'values_alignment': '🧱',
                'clarification': '✍️',
                'restatement': '♻️',
                'final_clarification': '🔎',
                'validation': '🤝',
                'final_answer': '⭐'
            }

            for step_name, step_value in pipeline.items():
                if step_name not in ['emotional_state_before', 'emotional_state_after', 'confidence']:
                    trace = ReasoningTrace(
                        execution_id=execution_id,
                        workflow_step_name='cognitive_pipeline',
                        agent_name='cece-ultra',
                        step_number=step_number,
                        step_name=step_name,
                        step_emoji=step_emojis.get(step_name, '🔹'),
                        input_context=request.input,
                        output=str(step_value),
                        confidence_score=pipeline.get('confidence', 0.0),
                        trace_metadata={'mode': request.mode}
                    )
                    db.add(trace)
                    step_number += 1

        # Save to agent memory if requested
        if request.save_to_memory:
            memory = AgentMemory(
                execution_id=execution_id,
                context={
                    'input': request.input,
                    'output': result.data,
                    'mode': request.mode
                },
                confidence_scores={
                    'overall': result.data.get('cognitive_pipeline', {}).get('confidence', 0.0)
                },
                session_id=request.session_id,
                user_id=request.user_id
            )
            db.add(memory)

        await db.commit()

        # Build response
        return CognitionResponse(
            execution_id=str(execution_id),
            status=execution.status.value,
            normalized_input=result.data.get('normalized_input', {}),
            cognitive_pipeline=result.data.get('cognitive_pipeline', {}),
            architecture_output=result.data.get('architecture_output', {}),
            orchestration=result.data.get('orchestration'),
            action_plan=result.data.get('action_plan', []),
            stable_summary=result.data.get('stable_summary', ''),
            extras=result.data.get('extras', {}),
            timestamp=execution.started_at
        )

    except Exception as e:
        # Update execution with error
        execution.status = WorkflowStatus.FAILED
        execution.completed_at = datetime.utcnow()
        execution.error_message = str(e)
        db.add(execution)
        await db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Cognition processing failed: {str(e)}"
        )


@router.get("/cognition/{execution_id}", response_model=CognitionResponse)
async def get_cognition_result(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get results from a previous cognition execution.

    Returns the full cognitive processing results including:
    - Normalized input
    - 15-step pipeline results
    - Architecture layer outputs
    - Orchestration details (if applicable)
    - Action plan and summary
    """
    result = await db.execute(
        select(WorkflowExecution).where(WorkflowExecution.id == execution_id)
    )
    execution = result.scalar_one_or_none()

    if not execution:
        raise HTTPException(
            status_code=404,
            detail=f"Execution {execution_id} not found"
        )

    data = execution.step_results or {}

    return CognitionResponse(
        execution_id=str(execution.id),
        status=execution.status.value,
        normalized_input=data.get('normalized_input', {}),
        cognitive_pipeline=data.get('cognitive_pipeline', {}),
        architecture_output=data.get('architecture_output', {}),
        orchestration=data.get('orchestration'),
        action_plan=data.get('action_plan', []),
        stable_summary=data.get('stable_summary', ''),
        extras=data.get('extras', {}),
        timestamp=execution.started_at
    )


@router.get("/cognition/history", response_model=list[ExecutionHistoryResponse])
async def get_cognition_history(
    limit: int = Query(default=20, ge=1, le=100),
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get execution history.

    Returns a list of recent cognition executions with summary info.
    Can be filtered by user_id or session_id.
    """
    query = select(WorkflowExecution).order_by(desc(WorkflowExecution.started_at))

    # Apply filters if provided
    if user_id or session_id:
        # Join with agent memory to filter
        from sqlalchemy.orm import aliased
        memory_alias = aliased(AgentMemory)
        query = query.join(
            memory_alias,
            WorkflowExecution.id == memory_alias.execution_id,
            isouter=True
        )

        if user_id:
            query = query.where(memory_alias.user_id == user_id)
        if session_id:
            query = query.where(memory_alias.session_id == session_id)

    query = query.limit(limit)

    result = await db.execute(query)
    executions = result.scalars().all()

    return [
        ExecutionHistoryResponse(
            execution_id=str(exec.id),
            status=exec.status.value,
            started_at=exec.started_at,
            completed_at=exec.completed_at,
            duration_seconds=exec.duration_seconds,
            input_preview=(exec.initial_context or {}).get('input', '')[:100],
            confidence=exec.overall_confidence
        )
        for exec in executions
    ]


@router.post("/cognition/analyze", response_model=QuickAnalysisResponse)
async def quick_analysis(request: QuickAnalysisRequest):
    """
    Quick analysis without full cognition pipeline.

    Provides rapid insights focused on:
    - emotional: Emotional payload and vibe
    - structural: Organization and priorities
    - priority: What matters most

    Does not save to database.
    """
    # Simple emotional analysis
    emotional_markers = {
        '😭': 'overwhelmed',
        '💚': 'seeking_support',
        '🔥': 'urgent',
        '💛': 'gentle',
        '⚡': 'energized'
    }

    emotional_payload = 'neutral'
    for emoji, emotion in emotional_markers.items():
        if emoji in request.input:
            emotional_payload = emotion
            break

    # Urgency detection
    urgency_keywords = ['urgent', 'asap', 'now', 'immediately', 'help']
    urgency = 'high' if any(k in request.input.lower() for k in urgency_keywords) else 'medium'

    # Vibe detection
    vibe = 'familiar' if any(c in request.input for c in ['!', '...', '💚', '😭']) else 'neutral'

    # Generate suggestions based on focus
    suggestions = []

    if request.focus == 'emotional':
        if emotional_payload == 'overwhelmed':
            suggestions = [
                'Take a breath - nothing is on fire',
                'Pick ONE thing to close today',
                'You got this 💜'
            ]
        else:
            suggestions = [
                'Identify the core question',
                'Check your emotional state',
                'Ground in values'
            ]
    elif request.focus == 'structural':
        suggestions = [
            'Break into smaller steps',
            'Create a dependency graph',
            'Prioritize by impact',
            'Set clear done criteria'
        ]
    elif request.focus == 'priority':
        suggestions = [
            'What\'s blocking everything else?',
            'What has the highest impact?',
            'What can you close today?',
            'What can wait?'
        ]

    return QuickAnalysisResponse(
        input=request.input,
        focus=request.focus,
        emotional_payload=emotional_payload,
        urgency=urgency,
        vibe=vibe,
        suggestions=suggestions,
        timestamp=datetime.utcnow()
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    agent_available = CeceUltraAgent is not None

    return {
        "status": "healthy" if agent_available else "degraded",
        "agent_available": agent_available,
        "service": "cece-ultra",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/info")
async def get_info():
    """
    Get information about the Cece Ultra system.

    Returns details about:
    - Cognitive pipeline stages
    - Architecture modules
    - Agent capabilities
    """
    return {
        "name": "Cece Ultra",
        "version": "1.0.0",
        "description": "Full stack cognition engine with 15-step pipeline and architecture layer",
        "author": "Alexa (Cadillac)",
        "cognitive_pipeline": {
            "stages": 15,
            "steps": [
                "🚨 Not Ok - Trigger detection",
                "❓ Why - Root cause analysis",
                "⚡ Impulse - First reaction",
                "🪞 Reflect - Zoom out perspective",
                "⚔️ Argue - Challenge assumptions",
                "🔁 Counterpoint - Alternative view",
                "🎯 Determine - Truth seeking",
                "🧐 Question - What's missing?",
                "⚖️ Offset Bias - Check distortions",
                "🧱 Reground - Align with values",
                "✍️ Clarify - First pass answer",
                "♻️ Restate - Reframe for clarity",
                "🔎 Clarify Again - Final polish",
                "🤝 Validate - Alignment check",
                "⭐ Final Answer - Deliver"
            ]
        },
        "architecture_layer": {
            "modules": 6,
            "capabilities": [
                "🟦 Structure - Chaos to frameworks",
                "🟥 Prioritize - Signal from noise",
                "🟩 Translate - Emotions to systems",
                "🟪 Stabilize - De-escalate spirals",
                "🟨 Project-Manage - Actionable plans",
                "🟧 Loopback - Recursive refinement"
            ]
        },
        "orchestration": {
            "modes": ["sequential", "parallel", "recursive"],
            "agents": ["cece", "wasp", "clause", "codex"]
        },
        "features": [
            "15-step cognitive pipeline",
            "6-module architecture layer",
            "Multi-agent orchestration",
            "Memory integration",
            "Emotional intelligence",
            "Structured reasoning",
            "Action planning"
        ],
        "tone": "Warm, witty, big-sister architect. Familiar but precise. Reality-aligned.",
        "invocation": "Cece, run cognition.",
        "documentation": "/docs/CECE_ULTRAPROMPT.md"
    }
