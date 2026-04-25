"""Tests for the agents client."""

from unittest.mock import MagicMock, patch

import pytest

from blackroad import BlackRoadClient
from blackroad.models import AgentInfo, AgentResult, AgentStatus


class TestAgentsClient:
    """Test suite for AgentsClient."""

    @pytest.fixture
    def client(self) -> BlackRoadClient:
        """Create a test client."""
        return BlackRoadClient(base_url="http://localhost:8000")

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_list_agents_all(self, mock_get: MagicMock, client: BlackRoadClient) -> None:
        """Test listing all agents."""
        mock_get.return_value = [
            {
                "name": "agent-1",
                "description": "First agent",
                "category": "devops",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": ["deployment"],
                "status": "idle",
                "dependencies": [],
            },
            {
                "name": "agent-2",
                "description": "Second agent",
                "category": "engineering",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": ["testing"],
                "status": "idle",
                "dependencies": [],
            },
        ]

        agents = client.agents.list_agents()

        assert len(agents) == 2
        assert all(isinstance(agent, AgentInfo) for agent in agents)
        assert agents[0].name == "agent-1"
        assert agents[1].name == "agent-2"

        mock_get.assert_called_once_with("/api/agents", params={})
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_list_agents_by_category(self, mock_get: MagicMock, client: BlackRoadClient) -> None:
        """Test listing agents by category."""
        mock_get.return_value = [
            {
                "name": "devops-agent",
                "description": "DevOps agent",
                "category": "devops",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": [],
                "status": "idle",
                "dependencies": [],
            }
        ]

        agents = client.agents.list_agents(category="devops")

        assert len(agents) == 1
        assert agents[0].category == "devops"

        mock_get.assert_called_once_with("/api/agents", params={"category": "devops"})
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_get_agent(self, mock_get: MagicMock, client: BlackRoadClient) -> None:
        """Test getting agent details."""
        mock_get.return_value = {
            "name": "test-agent",
            "description": "Test agent",
            "category": "test",
            "version": "1.0.0",
            "author": "BlackRoad",
            "tags": ["testing", "automation"],
            "status": "idle",
            "dependencies": ["dep-1", "dep-2"],
        }

        agent = client.agents.get_agent("test-agent")

        assert isinstance(agent, AgentInfo)
        assert agent.name == "test-agent"
        assert agent.version == "1.0.0"
        assert len(agent.tags) == 2
        assert len(agent.dependencies) == 2

        mock_get.assert_called_once_with("/api/agents/test-agent")
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_execute_agent(self, mock_post: MagicMock, client: BlackRoadClient) -> None:
        """Test executing an agent."""
        mock_post.return_value = {
            "agent_name": "test-agent",
            "execution_id": "550e8400-e29b-41d4-a716-446655440000",
            "status": "completed",
            "data": {"result": "success", "output": "Agent executed successfully"},
            "error": None,
            "started_at": "2024-01-01T00:00:00Z",
            "completed_at": "2024-01-01T00:05:00Z",
            "duration_seconds": 300.0,
            "metadata": {"environment": "test"},
        }

        result = client.agents.execute_agent(
            agent_name="test-agent",
            params={"environment": "test", "dry_run": True},
        )

        assert isinstance(result, AgentResult)
        assert result.agent_name == "test-agent"
        assert result.status == AgentStatus.COMPLETED
        assert result.data is not None
        assert result.data["result"] == "success"
        assert result.error is None
        assert result.duration_seconds == 300.0

        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[0][0] == "/api/agents/execute"
        assert call_args[1]["json"]["agent_name"] == "test-agent"
        assert call_args[1]["json"]["params"]["environment"] == "test"

        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_execute_agent_with_error(self, mock_post: MagicMock, client: BlackRoadClient) -> None:
        """Test executing an agent that fails."""
        mock_post.return_value = {
            "agent_name": "failing-agent",
            "execution_id": "550e8400-e29b-41d4-a716-446655440001",
            "status": "failed",
            "data": None,
            "error": "Agent execution failed: Configuration error",
            "started_at": "2024-01-01T00:00:00Z",
            "completed_at": "2024-01-01T00:00:10Z",
            "duration_seconds": 10.0,
            "metadata": {},
        }

        result = client.agents.execute_agent(
            agent_name="failing-agent",
            params={},
        )

        assert isinstance(result, AgentResult)
        assert result.status == AgentStatus.FAILED
        assert result.data is None
        assert result.error is not None
        assert "Configuration error" in result.error

        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_get_execution_status(self, mock_get: MagicMock, client: BlackRoadClient) -> None:
        """Test getting execution status."""
        execution_id = "550e8400-e29b-41d4-a716-446655440000"

        mock_get.return_value = {
            "agent_name": "test-agent",
            "execution_id": execution_id,
            "status": "running",
            "data": None,
            "error": None,
            "started_at": "2024-01-01T00:00:00Z",
            "completed_at": None,
            "duration_seconds": None,
            "metadata": {},
        }

        result = client.agents.get_execution_status(execution_id)

        assert isinstance(result, AgentResult)
        assert result.execution_id == execution_id
        assert result.status == AgentStatus.RUNNING
        assert result.completed_at is None

        mock_get.assert_called_once_with(f"/api/agents/executions/{execution_id}")
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_cancel_execution(self, mock_post: MagicMock, client: BlackRoadClient) -> None:
        """Test canceling an execution."""
        execution_id = "550e8400-e29b-41d4-a716-446655440000"

        mock_post.return_value = {
            "message": "Execution cancelled successfully",
            "execution_id": execution_id,
        }

        response = client.agents.cancel_execution(execution_id)

        assert "message" in response
        assert response["execution_id"] == execution_id

        mock_post.assert_called_once_with(f"/api/agents/executions/{execution_id}/cancel")
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_list_agents_empty(self, mock_get: MagicMock, client: BlackRoadClient) -> None:
        """Test listing agents when none are available."""
        mock_get.return_value = []

        agents = client.agents.list_agents()

        assert len(agents) == 0
        assert isinstance(agents, list)

        client.close()

    def test_execute_agent_no_params(self, client: BlackRoadClient) -> None:
        """Test executing an agent without parameters."""
        with patch("blackroad.utils.http.HTTPClient.post") as mock_post:
            mock_post.return_value = {
                "agent_name": "test-agent",
                "execution_id": "550e8400-e29b-41d4-a716-446655440000",
                "status": "completed",
                "data": {},
                "error": None,
                "started_at": "2024-01-01T00:00:00Z",
                "completed_at": "2024-01-01T00:00:10Z",
                "duration_seconds": 10.0,
                "metadata": {},
            }

            result = client.agents.execute_agent(agent_name="test-agent")

            assert isinstance(result, AgentResult)
            call_args = mock_post.call_args
            assert call_args[1]["json"]["params"] == {}

        client.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
