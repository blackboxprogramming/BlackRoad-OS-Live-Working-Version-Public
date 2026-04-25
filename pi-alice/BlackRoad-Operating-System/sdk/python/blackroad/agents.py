"""Agents client for the BlackRoad SDK."""

from typing import TYPE_CHECKING, Any, Dict, List, Optional

from .models.agent import AgentInfo, AgentResult

if TYPE_CHECKING:
    from .utils.http import AsyncHTTPClient, HTTPClient


class AgentsClient:
    """Synchronous agents client."""

    def __init__(self, http_client: "HTTPClient") -> None:
        """
        Initialize the agents client.

        Args:
            http_client: HTTP client instance
        """
        self._client = http_client

    def list_agents(self, category: Optional[str] = None) -> List[AgentInfo]:
        """
        List available agents.

        Args:
            category: Filter by category (optional)

        Returns:
            List of agent information

        Example:
            >>> agents = client.agents.list_agents(category="devops")
            >>> for agent in agents:
            ...     print(f"{agent.name}: {agent.description}")
        """
        params = {}
        if category:
            params["category"] = category

        response = self._client.get("/api/agents", params=params)

        if isinstance(response, list):
            return [AgentInfo(**agent) for agent in response]
        return []

    def get_agent(self, agent_name: str) -> AgentInfo:
        """
        Get agent details.

        Args:
            agent_name: Name of the agent

        Returns:
            Agent information

        Raises:
            NotFoundError: If agent not found

        Example:
            >>> agent = client.agents.get_agent("deployment-agent")
            >>> print(f"Version: {agent.version}")
        """
        response = self._client.get(f"/api/agents/{agent_name}")
        return AgentInfo(**response)

    def execute_agent(
        self,
        agent_name: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> AgentResult:
        """
        Execute an agent.

        Args:
            agent_name: Name of the agent to execute
            params: Parameters for the agent execution

        Returns:
            Agent execution result

        Raises:
            NotFoundError: If agent not found
            AgentError: If execution fails
            ValidationError: If parameters are invalid

        Example:
            >>> result = client.agents.execute_agent(
            ...     agent_name="deployment-agent",
            ...     params={
            ...         "environment": "production",
            ...         "version": "1.2.3",
            ...         "service": "api"
            ...     }
            ... )
            >>> print(f"Status: {result.status}")
            >>> print(f"Result: {result.data}")
        """
        request_data = {
            "agent_name": agent_name,
            "params": params or {},
        }

        response = self._client.post("/api/agents/execute", json=request_data)
        return AgentResult(**response)

    def get_execution_status(self, execution_id: str) -> AgentResult:
        """
        Get execution status.

        Args:
            execution_id: Execution ID

        Returns:
            Agent execution result

        Raises:
            NotFoundError: If execution not found

        Example:
            >>> result = client.agents.get_execution_status(execution_id)
            >>> print(f"Status: {result.status}")
        """
        response = self._client.get(f"/api/agents/executions/{execution_id}")
        return AgentResult(**response)

    def cancel_execution(self, execution_id: str) -> dict:
        """
        Cancel an agent execution.

        Args:
            execution_id: Execution ID

        Returns:
            Cancellation confirmation

        Raises:
            NotFoundError: If execution not found

        Example:
            >>> response = client.agents.cancel_execution(execution_id)
            >>> print(response["message"])
        """
        return self._client.post(f"/api/agents/executions/{execution_id}/cancel")


class AsyncAgentsClient:
    """Asynchronous agents client."""

    def __init__(self, http_client: "AsyncHTTPClient") -> None:
        """
        Initialize the async agents client.

        Args:
            http_client: Async HTTP client instance
        """
        self._client = http_client

    async def list_agents(self, category: Optional[str] = None) -> List[AgentInfo]:
        """
        List available agents.

        Args:
            category: Filter by category (optional)

        Returns:
            List of agent information

        Example:
            >>> agents = await client.agents.list_agents(category="devops")
            >>> for agent in agents:
            ...     print(f"{agent.name}: {agent.description}")
        """
        params = {}
        if category:
            params["category"] = category

        response = await self._client.get("/api/agents", params=params)

        if isinstance(response, list):
            return [AgentInfo(**agent) for agent in response]
        return []

    async def get_agent(self, agent_name: str) -> AgentInfo:
        """
        Get agent details.

        Args:
            agent_name: Name of the agent

        Returns:
            Agent information

        Raises:
            NotFoundError: If agent not found

        Example:
            >>> agent = await client.agents.get_agent("deployment-agent")
            >>> print(f"Version: {agent.version}")
        """
        response = await self._client.get(f"/api/agents/{agent_name}")
        return AgentInfo(**response)

    async def execute_agent(
        self,
        agent_name: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> AgentResult:
        """
        Execute an agent.

        Args:
            agent_name: Name of the agent to execute
            params: Parameters for the agent execution

        Returns:
            Agent execution result

        Raises:
            NotFoundError: If agent not found
            AgentError: If execution fails
            ValidationError: If parameters are invalid

        Example:
            >>> result = await client.agents.execute_agent(
            ...     agent_name="deployment-agent",
            ...     params={
            ...         "environment": "production",
            ...         "version": "1.2.3",
            ...         "service": "api"
            ...     }
            ... )
            >>> print(f"Status: {result.status}")
            >>> print(f"Result: {result.data}")
        """
        request_data = {
            "agent_name": agent_name,
            "params": params or {},
        }

        response = await self._client.post("/api/agents/execute", json=request_data)
        return AgentResult(**response)

    async def get_execution_status(self, execution_id: str) -> AgentResult:
        """
        Get execution status.

        Args:
            execution_id: Execution ID

        Returns:
            Agent execution result

        Raises:
            NotFoundError: If execution not found

        Example:
            >>> result = await client.agents.get_execution_status(execution_id)
            >>> print(f"Status: {result.status}")
        """
        response = await self._client.get(f"/api/agents/executions/{execution_id}")
        return AgentResult(**response)

    async def cancel_execution(self, execution_id: str) -> dict:
        """
        Cancel an agent execution.

        Args:
            execution_id: Execution ID

        Returns:
            Cancellation confirmation

        Raises:
            NotFoundError: If execution not found

        Example:
            >>> response = await client.agents.cancel_execution(execution_id)
            >>> print(response["message"])
        """
        return await self._client.post(f"/api/agents/executions/{execution_id}/cancel")
