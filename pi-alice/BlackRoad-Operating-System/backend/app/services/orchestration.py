"""
Multi-Agent Orchestration Service

Coordinates execution of multiple AI agents in workflows:
- Sequential execution (A → B → C)
- Parallel execution (A + B + C → merge)
- Recursive refinement (A ⇄ B until optimal)
- Memory sharing between agents
- Reasoning trace aggregation
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set
from uuid import uuid4

# Import our core agents
from agents.categories.ai_ml.cece_agent import CeceAgent
from agents.categories.ai_ml.wasp_agent import WaspAgent
from agents.categories.ai_ml.clause_agent import ClauseAgent
from agents.categories.ai_ml.codex_agent import CodexAgent


logger = logging.getLogger(__name__)


class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExecutionMode(Enum):
    """Agent execution mode"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    RECURSIVE = "recursive"


@dataclass
class WorkflowStep:
    """Single step in workflow"""
    name: str
    agent_name: str
    input_template: str  # Can reference previous outputs with ${step_name.field}
    depends_on: List[str] = field(default_factory=list)
    parallel_with: List[str] = field(default_factory=list)
    max_retries: int = 3


@dataclass
class Workflow:
    """Multi-agent workflow definition"""
    id: str
    name: str
    steps: List[WorkflowStep]
    mode: ExecutionMode = ExecutionMode.SEQUENTIAL
    timeout_seconds: int = 600  # 10 minutes default
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class WorkflowResult:
    """Workflow execution result"""
    workflow_id: str
    status: WorkflowStatus
    step_results: Dict[str, Any]
    reasoning_trace: List[Dict[str, Any]]
    memory: Dict[str, Any]
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    total_duration_seconds: float = 0.0


class AgentMemory:
    """Shared memory across workflow agents"""

    def __init__(self):
        self.context: Dict[str, Any] = {}
        self.reasoning_trace: List[Dict[str, Any]] = []
        self.confidence_scores: Dict[str, float] = {}
        self.metadata: Dict[str, Any] = {}

    def set(self, key: str, value: Any) -> None:
        """Set value in context"""
        self.context[key] = value

    def get(self, key: str, default: Any = None) -> Any:
        """Get value from context"""
        return self.context.get(key, default)

    def add_reasoning(self, step_name: str, agent_name: str, reasoning: Any) -> None:
        """Add reasoning trace from agent"""
        self.reasoning_trace.append({
            "step": step_name,
            "agent": agent_name,
            "reasoning": reasoning,
            "timestamp": datetime.utcnow().isoformat()
        })

    def set_confidence(self, step_name: str, confidence: float) -> None:
        """Set confidence score for step"""
        self.confidence_scores[step_name] = confidence


class OrchestrationEngine:
    """
    Multi-Agent Orchestration Engine

    Executes workflows with multiple AI agents, managing:
    - Execution order (sequential, parallel, recursive)
    - Dependency resolution
    - Memory sharing
    - Error handling and retries
    - Reasoning trace aggregation

    Example:
        ```python
        engine = OrchestrationEngine()

        workflow = Workflow(
            id="build-dashboard",
            name="Build Dashboard",
            steps=[
                WorkflowStep(
                    name="architect",
                    agent_name="cece",
                    input_template="Design dashboard for AI agents"
                ),
                WorkflowStep(
                    name="backend",
                    agent_name="codex",
                    input_template="${architect.architecture.backend_spec}",
                    depends_on=["architect"]
                ),
                WorkflowStep(
                    name="frontend",
                    agent_name="wasp",
                    input_template="${architect.architecture.frontend_spec}",
                    depends_on=["architect"]
                )
            ]
        )

        result = await engine.execute_workflow(workflow)
        ```
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Initialize agents
        self.agents = {
            "cece": CeceAgent(),
            "wasp": WaspAgent(),
            "clause": ClauseAgent(),
            "codex": CodexAgent()
        }

        # Active workflows
        self.active_workflows: Dict[str, Workflow] = {}

    async def execute_workflow(
        self,
        workflow: Workflow,
        initial_context: Optional[Dict[str, Any]] = None
    ) -> WorkflowResult:
        """
        Execute multi-agent workflow

        Args:
            workflow: Workflow definition
            initial_context: Initial context/memory (optional)

        Returns:
            WorkflowResult with all step outputs and reasoning traces
        """
        workflow_id = workflow.id or str(uuid4())
        started_at = datetime.utcnow()

        self.logger.info(f"🚀 Starting workflow: {workflow.name} (ID: {workflow_id})")
        self.active_workflows[workflow_id] = workflow

        # Initialize shared memory
        memory = AgentMemory()
        if initial_context:
            memory.context.update(initial_context)

        try:
            # Execute based on mode
            if workflow.mode == ExecutionMode.SEQUENTIAL:
                step_results = await self._execute_sequential(workflow, memory)
            elif workflow.mode == ExecutionMode.PARALLEL:
                step_results = await self._execute_parallel(workflow, memory)
            elif workflow.mode == ExecutionMode.RECURSIVE:
                step_results = await self._execute_recursive(workflow, memory)
            else:
                raise ValueError(f"Unknown execution mode: {workflow.mode}")

            completed_at = datetime.utcnow()
            duration = (completed_at - started_at).total_seconds()

            self.logger.info(
                f"✅ Workflow completed: {workflow.name} "
                f"({len(step_results)} steps, {duration:.2f}s)"
            )

            return WorkflowResult(
                workflow_id=workflow_id,
                status=WorkflowStatus.COMPLETED,
                step_results=step_results,
                reasoning_trace=memory.reasoning_trace,
                memory=memory.context,
                started_at=started_at,
                completed_at=completed_at,
                total_duration_seconds=duration
            )

        except Exception as e:
            self.logger.error(f"❌ Workflow failed: {workflow.name} - {str(e)}", exc_info=True)

            return WorkflowResult(
                workflow_id=workflow_id,
                status=WorkflowStatus.FAILED,
                step_results={},
                reasoning_trace=memory.reasoning_trace,
                memory=memory.context,
                started_at=started_at,
                completed_at=datetime.utcnow(),
                error=str(e)
            )

        finally:
            # Cleanup
            if workflow_id in self.active_workflows:
                del self.active_workflows[workflow_id]

    async def _execute_sequential(
        self,
        workflow: Workflow,
        memory: AgentMemory
    ) -> Dict[str, Any]:
        """Execute workflow steps sequentially"""
        step_results = {}

        for step in workflow.steps:
            self.logger.info(f"▶️  Executing step: {step.name} (agent: {step.agent_name})")

            # Resolve input from template
            input_params = self._resolve_input_template(step.input_template, step_results, memory)

            # Execute agent
            result = await self._execute_agent_with_retry(
                step.agent_name,
                input_params,
                step.max_retries
            )

            # Store result
            step_results[step.name] = result.data

            # Update memory
            memory.set(f"{step.name}_output", result.data)
            memory.add_reasoning(step.name, step.agent_name, result.data.get("reasoning_trace", []))

            if "confidence" in result.data:
                memory.set_confidence(step.name, result.data["confidence"])

        return step_results

    async def _execute_parallel(
        self,
        workflow: Workflow,
        memory: AgentMemory
    ) -> Dict[str, Any]:
        """Execute workflow steps in parallel where possible"""
        step_results = {}
        remaining_steps = set(step.name for step in workflow.steps)
        completed_steps: Set[str] = set()

        while remaining_steps:
            # Find steps that can run now (dependencies met)
            ready_steps = []

            for step in workflow.steps:
                if step.name not in remaining_steps:
                    continue

                # Check if dependencies are met
                deps_met = all(dep in completed_steps for dep in step.depends_on)

                if deps_met:
                    ready_steps.append(step)

            if not ready_steps:
                raise RuntimeError("Workflow deadlock: no steps can execute (circular dependency?)")

            # Execute ready steps in parallel
            self.logger.info(f"▶️  Executing {len(ready_steps)} steps in parallel")

            tasks = []
            for step in ready_steps:
                input_params = self._resolve_input_template(step.input_template, step_results, memory)
                task = self._execute_agent_with_retry(
                    step.agent_name,
                    input_params,
                    step.max_retries
                )
                tasks.append((step.name, step.agent_name, task))

            # Wait for all parallel steps to complete
            results = await asyncio.gather(*[task for _, _, task in tasks])

            # Process results
            for (step_name, agent_name, _), result in zip(tasks, results):
                step_results[step_name] = result.data
                memory.set(f"{step_name}_output", result.data)
                memory.add_reasoning(step_name, agent_name, result.data.get("reasoning_trace", []))

                if "confidence" in result.data:
                    memory.set_confidence(step_name, result.data["confidence"])

                completed_steps.add(step_name)
                remaining_steps.remove(step_name)

        return step_results

    async def _execute_recursive(
        self,
        workflow: Workflow,
        memory: AgentMemory
    ) -> Dict[str, Any]:
        """Execute workflow recursively until convergence"""
        step_results = {}
        max_iterations = 10
        convergence_threshold = 0.95
        iteration = 0

        while iteration < max_iterations:
            iteration += 1
            self.logger.info(f"🔄 Recursive iteration {iteration}")

            iteration_results = {}

            # Execute all steps
            for step in workflow.steps:
                input_params = self._resolve_input_template(step.input_template, step_results, memory)

                result = await self._execute_agent_with_retry(
                    step.agent_name,
                    input_params,
                    step.max_retries
                )

                iteration_results[step.name] = result.data
                memory.add_reasoning(f"{step.name}_iter{iteration}", step.agent_name, result.data.get("reasoning_trace", []))

            # Check convergence
            confidence = self._calculate_overall_confidence(iteration_results)

            self.logger.info(f"   Confidence: {confidence:.2f}")

            if confidence >= convergence_threshold:
                self.logger.info(f"✓ Converged at iteration {iteration} (confidence: {confidence:.2f})")
                step_results = iteration_results
                break

            step_results = iteration_results

        return step_results

    async def _execute_agent_with_retry(
        self,
        agent_name: str,
        params: Dict[str, Any],
        max_retries: int
    ):
        """Execute agent with automatic retries"""
        if agent_name not in self.agents:
            raise ValueError(f"Unknown agent: {agent_name}")

        agent = self.agents[agent_name]
        last_exception = None

        for attempt in range(max_retries):
            try:
                result = await agent.run(params)
                return result

            except Exception as e:
                last_exception = e
                self.logger.warning(
                    f"Agent {agent_name} attempt {attempt + 1}/{max_retries} failed: {str(e)}"
                )

                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff

        raise last_exception

    def _resolve_input_template(
        self,
        template: str,
        step_results: Dict[str, Any],
        memory: AgentMemory
    ) -> Dict[str, Any]:
        """Resolve input template with variables from previous steps"""

        # If template doesn't contain variables, treat as direct input
        if "${" not in template:
            return {"input": template}

        # Replace variables like ${step_name.field} with actual values
        resolved = template

        import re
        pattern = r'\$\{([^}]+)\}'
        matches = re.findall(pattern, template)

        for match in matches:
            parts = match.split('.')

            # Navigate through nested structure
            value = step_results
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part)
                else:
                    value = None
                    break

            if value is not None:
                resolved = resolved.replace(f"${{{match}}}", str(value))

        return {"input": resolved, "context": memory.context}

    def _calculate_overall_confidence(self, step_results: Dict[str, Any]) -> float:
        """Calculate overall confidence from step results"""
        confidences = []

        for result in step_results.values():
            if isinstance(result, dict) and "confidence" in result:
                confidences.append(result["confidence"])

        if not confidences:
            return 0.0

        return sum(confidences) / len(confidences)

    async def cancel_workflow(self, workflow_id: str) -> bool:
        """Cancel running workflow"""
        if workflow_id in self.active_workflows:
            self.logger.info(f"Cancelling workflow: {workflow_id}")
            # In a real implementation, would cancel running tasks
            del self.active_workflows[workflow_id]
            return True
        return False

    def get_active_workflows(self) -> List[str]:
        """Get list of active workflow IDs"""
        return list(self.active_workflows.keys())
