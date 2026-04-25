"""
Agent Executor

Handles agent execution, orchestration, parallel execution,
and dependency management.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass, field

from .agent import BaseAgent, AgentResult, AgentStatus


@dataclass
class ExecutionPlan:
    """Plan for executing multiple agents."""
    agents: List[BaseAgent]
    mode: str = "sequential"  # sequential, parallel, or dag
    max_concurrency: int = 5
    stop_on_error: bool = True


@dataclass
class OrchestrationResult:
    """Result of orchestrated agent execution."""
    plan_id: str
    results: List[AgentResult]
    status: str
    started_at: datetime
    completed_at: datetime
    total_duration_seconds: float
    succeeded: int = 0
    failed: int = 0


class AgentExecutor:
    """
    Executes agents with support for:
    - Single agent execution
    - Parallel execution
    - Sequential execution
    - DAG-based execution with dependencies
    - Resource management
    - Rate limiting

    Example:
        ```python
        executor = AgentExecutor()

        # Execute single agent
        result = await executor.execute(agent, params)

        # Execute multiple agents in parallel
        results = await executor.execute_parallel([agent1, agent2], params)

        # Execute with dependencies
        plan = ExecutionPlan(
            agents=[agent1, agent2, agent3],
            mode='dag'
        )
        results = await executor.execute_plan(plan, params)
        ```
    """

    def __init__(
        self,
        max_concurrent_agents: int = 10,
        default_timeout: int = 300
    ):
        """Initialize the executor."""
        self.max_concurrent_agents = max_concurrent_agents
        self.default_timeout = default_timeout
        self.logger = logging.getLogger("agent.executor")
        self._semaphore = asyncio.Semaphore(max_concurrent_agents)
        self._active_executions: Dict[str, AgentResult] = {}

    async def execute(
        self,
        agent: BaseAgent,
        params: Dict[str, Any]
    ) -> AgentResult:
        """
        Execute a single agent.

        Args:
            agent: Agent to execute
            params: Parameters to pass to the agent

        Returns:
            AgentResult containing execution details
        """
        async with self._semaphore:
            self.logger.info(f"Executing agent: {agent.metadata.name}")
            result = await agent.run(params)
            return result

    async def execute_parallel(
        self,
        agents: List[BaseAgent],
        params: Dict[str, Any],
        max_concurrency: Optional[int] = None
    ) -> List[AgentResult]:
        """
        Execute multiple agents in parallel.

        Args:
            agents: List of agents to execute
            params: Parameters to pass to each agent
            max_concurrency: Max number of concurrent executions

        Returns:
            List of AgentResult objects
        """
        self.logger.info(
            f"Executing {len(agents)} agents in parallel "
            f"(max_concurrency: {max_concurrency or self.max_concurrent_agents})"
        )

        if max_concurrency:
            semaphore = asyncio.Semaphore(max_concurrency)

            async def execute_with_limit(agent):
                async with semaphore:
                    return await agent.run(params)

            tasks = [execute_with_limit(agent) for agent in agents]
        else:
            tasks = [self.execute(agent, params) for agent in agents]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Convert exceptions to failed results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(AgentResult(
                    agent_name=agents[i].metadata.name,
                    execution_id="error",
                    status=AgentStatus.FAILED,
                    error=str(result),
                    started_at=datetime.utcnow(),
                    completed_at=datetime.utcnow(),
                    duration_seconds=0.0
                ))
            else:
                processed_results.append(result)

        return processed_results

    async def execute_sequential(
        self,
        agents: List[BaseAgent],
        params: Dict[str, Any],
        stop_on_error: bool = True
    ) -> List[AgentResult]:
        """
        Execute multiple agents sequentially.

        Args:
            agents: List of agents to execute
            params: Parameters to pass to each agent
            stop_on_error: Stop execution if an agent fails

        Returns:
            List of AgentResult objects
        """
        self.logger.info(f"Executing {len(agents)} agents sequentially")

        results = []
        for agent in agents:
            result = await self.execute(agent, params)
            results.append(result)

            if stop_on_error and result.status == AgentStatus.FAILED:
                self.logger.warning(
                    f"Agent {agent.metadata.name} failed, "
                    f"stopping execution"
                )
                break

        return results

    async def execute_plan(
        self,
        plan: ExecutionPlan,
        params: Dict[str, Any]
    ) -> OrchestrationResult:
        """
        Execute an execution plan.

        Args:
            plan: Execution plan
            params: Parameters to pass to agents

        Returns:
            OrchestrationResult with all execution results
        """
        plan_id = f"plan_{datetime.utcnow().timestamp()}"
        started_at = datetime.utcnow()

        self.logger.info(
            f"Executing plan {plan_id} with {len(plan.agents)} agents "
            f"(mode: {plan.mode})"
        )

        if plan.mode == "parallel":
            results = await self.execute_parallel(
                plan.agents,
                params,
                plan.max_concurrency
            )
        elif plan.mode == "sequential":
            results = await self.execute_sequential(
                plan.agents,
                params,
                plan.stop_on_error
            )
        elif plan.mode == "dag":
            results = await self._execute_dag(plan.agents, params)
        else:
            raise ValueError(f"Unknown execution mode: {plan.mode}")

        completed_at = datetime.utcnow()
        duration = (completed_at - started_at).total_seconds()

        succeeded = sum(
            1 for r in results if r.status == AgentStatus.COMPLETED
        )
        failed = sum(
            1 for r in results if r.status == AgentStatus.FAILED
        )

        overall_status = "completed" if failed == 0 else "partial_failure"

        self.logger.info(
            f"Plan {plan_id} completed: {succeeded} succeeded, "
            f"{failed} failed (Duration: {duration:.2f}s)"
        )

        return OrchestrationResult(
            plan_id=plan_id,
            results=results,
            status=overall_status,
            started_at=started_at,
            completed_at=completed_at,
            total_duration_seconds=duration,
            succeeded=succeeded,
            failed=failed
        )

    async def _execute_dag(
        self,
        agents: List[BaseAgent],
        params: Dict[str, Any]
    ) -> List[AgentResult]:
        """
        Execute agents based on dependency graph (DAG).

        Args:
            agents: List of agents with dependencies
            params: Parameters to pass to agents

        Returns:
            List of AgentResult objects
        """
        # Build dependency graph
        graph = {}
        for agent in agents:
            graph[agent.metadata.name] = agent.metadata.dependencies

        # Topological sort to determine execution order
        executed = set()
        results = []

        async def execute_node(agent_name: str):
            if agent_name in executed:
                return

            # Find the agent
            agent = next(
                (a for a in agents if a.metadata.name == agent_name),
                None
            )
            if not agent:
                return

            # Execute dependencies first
            for dep in agent.metadata.dependencies:
                await execute_node(dep)

            # Execute this agent
            result = await self.execute(agent, params)
            results.append(result)
            executed.add(agent_name)

        # Execute all agents
        for agent in agents:
            await execute_node(agent.metadata.name)

        return results

    def get_active_executions(self) -> Dict[str, AgentResult]:
        """Get currently active agent executions."""
        return self._active_executions.copy()

    async def cancel_execution(self, execution_id: str) -> bool:
        """
        Cancel an active agent execution.

        Args:
            execution_id: ID of the execution to cancel

        Returns:
            True if cancelled, False if not found
        """
        if execution_id in self._active_executions:
            # Implementation would require task tracking
            # For now, just log
            self.logger.info(f"Cancelling execution: {execution_id}")
            return True
        return False
