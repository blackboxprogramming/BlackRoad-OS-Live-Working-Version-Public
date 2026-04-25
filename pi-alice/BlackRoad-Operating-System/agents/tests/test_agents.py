"""
Test suite for BlackRoad Agent Library

Run with: pytest agents/tests/test_agents.py -v
"""

import pytest
import asyncio
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from base import (
    BaseAgent,
    AgentStatus,
    AgentRegistry,
    AgentExecutor,
    ExecutionPlan,
    ConfigManager
)


# Mock agent for testing
class MockAgent(BaseAgent):
    """Mock agent for testing purposes."""

    def __init__(self, name='mock-agent', should_fail=False):
        super().__init__(
            name=name,
            description='Mock agent for testing',
            category='test',
            version='1.0.0',
            tags=['mock', 'test']
        )
        self.should_fail = should_fail

    async def execute(self, params):
        if self.should_fail:
            raise Exception("Mock agent failure")
        return {'status': 'success', 'message': 'Mock execution'}


class TestBaseAgent:
    """Test the BaseAgent class."""

    @pytest.mark.asyncio
    async def test_agent_creation(self):
        """Test creating an agent."""
        agent = MockAgent()
        assert agent.metadata.name == 'mock-agent'
        assert agent.metadata.category == 'test'
        assert agent.status == AgentStatus.IDLE

    @pytest.mark.asyncio
    async def test_agent_execution_success(self):
        """Test successful agent execution."""
        agent = MockAgent()
        result = await agent.run({'test': 'data'})

        assert result.status == AgentStatus.COMPLETED
        assert result.agent_name == 'mock-agent'
        assert result.data['status'] == 'success'
        assert result.duration_seconds > 0

    @pytest.mark.asyncio
    async def test_agent_execution_failure(self):
        """Test agent execution failure."""
        agent = MockAgent(should_fail=True)
        result = await agent.run({'test': 'data'})

        assert result.status == AgentStatus.FAILED
        assert result.error is not None
        assert 'Mock agent failure' in result.error

    def test_agent_info(self):
        """Test getting agent information."""
        agent = MockAgent()
        info = agent.get_info()

        assert info['name'] == 'mock-agent'
        assert info['description'] == 'Mock agent for testing'
        assert info['category'] == 'test'
        assert info['version'] == '1.0.0'


class TestAgentRegistry:
    """Test the AgentRegistry class."""

    def test_registry_creation(self):
        """Test creating a registry."""
        registry = AgentRegistry(auto_discover=False)
        assert registry is not None

    def test_register_agent(self):
        """Test registering an agent."""
        registry = AgentRegistry(auto_discover=False)
        agent = MockAgent()
        registry.register(agent)

        retrieved = registry.get_agent('mock-agent')
        assert retrieved is not None
        assert retrieved.metadata.name == 'mock-agent'

    def test_register_duplicate_agent(self):
        """Test registering duplicate agent fails."""
        registry = AgentRegistry(auto_discover=False)
        agent1 = MockAgent()
        agent2 = MockAgent()

        registry.register(agent1)

        with pytest.raises(ValueError):
            registry.register(agent2, override=False)

    def test_unregister_agent(self):
        """Test unregistering an agent."""
        registry = AgentRegistry(auto_discover=False)
        agent = MockAgent()
        registry.register(agent)

        result = registry.unregister('mock-agent')
        assert result is True

        retrieved = registry.get_agent('mock-agent')
        assert retrieved is None

    def test_list_agents(self):
        """Test listing agents."""
        registry = AgentRegistry(auto_discover=False)
        agent1 = MockAgent(name='agent-1')
        agent2 = MockAgent(name='agent-2')

        registry.register(agent1)
        registry.register(agent2)

        agents = registry.list_agents()
        assert len(agents) == 2

    def test_list_agents_by_category(self):
        """Test listing agents by category."""
        registry = AgentRegistry(auto_discover=False)
        agent1 = MockAgent(name='agent-1')
        agent2 = MockAgent(name='agent-2')

        registry.register(agent1)
        registry.register(agent2)

        test_agents = registry.list_agents(category='test')
        assert len(test_agents) == 2

    def test_search_agents(self):
        """Test searching for agents."""
        registry = AgentRegistry(auto_discover=False)
        agent = MockAgent()
        registry.register(agent)

        results = registry.search('mock')
        assert len(results) == 1
        assert results[0].metadata.name == 'mock-agent'

    def test_get_stats(self):
        """Test getting registry statistics."""
        registry = AgentRegistry(auto_discover=False)
        agent1 = MockAgent(name='agent-1')
        agent2 = MockAgent(name='agent-2')

        registry.register(agent1)
        registry.register(agent2)

        stats = registry.get_stats()
        assert stats['total_agents'] == 2
        assert stats['total_categories'] == 1
        assert 'test' in stats['agents_by_category']


class TestAgentExecutor:
    """Test the AgentExecutor class."""

    @pytest.mark.asyncio
    async def test_execute_single_agent(self):
        """Test executing a single agent."""
        executor = AgentExecutor()
        agent = MockAgent()

        result = await executor.execute(agent, {'test': 'data'})

        assert result.status == AgentStatus.COMPLETED
        assert result.data['status'] == 'success'

    @pytest.mark.asyncio
    async def test_execute_parallel(self):
        """Test executing agents in parallel."""
        executor = AgentExecutor()
        agents = [
            MockAgent(name='agent-1'),
            MockAgent(name='agent-2'),
            MockAgent(name='agent-3')
        ]

        results = await executor.execute_parallel(
            agents,
            {'test': 'data'},
            max_concurrency=3
        )

        assert len(results) == 3
        assert all(r.status == AgentStatus.COMPLETED for r in results)

    @pytest.mark.asyncio
    async def test_execute_sequential(self):
        """Test executing agents sequentially."""
        executor = AgentExecutor()
        agents = [
            MockAgent(name='agent-1'),
            MockAgent(name='agent-2'),
            MockAgent(name='agent-3')
        ]

        results = await executor.execute_sequential(
            agents,
            {'test': 'data'}
        )

        assert len(results) == 3
        assert all(r.status == AgentStatus.COMPLETED for r in results)

    @pytest.mark.asyncio
    async def test_execute_sequential_stop_on_error(self):
        """Test sequential execution stops on error."""
        executor = AgentExecutor()
        agents = [
            MockAgent(name='agent-1'),
            MockAgent(name='agent-2', should_fail=True),
            MockAgent(name='agent-3')
        ]

        results = await executor.execute_sequential(
            agents,
            {'test': 'data'},
            stop_on_error=True
        )

        # Should stop after the failing agent
        assert len(results) == 2
        assert results[0].status == AgentStatus.COMPLETED
        assert results[1].status == AgentStatus.FAILED

    @pytest.mark.asyncio
    async def test_execution_plan_parallel(self):
        """Test executing a parallel execution plan."""
        executor = AgentExecutor()
        agents = [
            MockAgent(name='agent-1'),
            MockAgent(name='agent-2')
        ]

        plan = ExecutionPlan(
            agents=agents,
            mode='parallel',
            max_concurrency=2
        )

        result = await executor.execute_plan(plan, {'test': 'data'})

        assert result.status == 'completed'
        assert result.succeeded == 2
        assert result.failed == 0

    @pytest.mark.asyncio
    async def test_execution_plan_sequential(self):
        """Test executing a sequential execution plan."""
        executor = AgentExecutor()
        agents = [
            MockAgent(name='agent-1'),
            MockAgent(name='agent-2')
        ]

        plan = ExecutionPlan(
            agents=agents,
            mode='sequential',
            stop_on_error=True
        )

        result = await executor.execute_plan(plan, {'test': 'data'})

        assert result.status == 'completed'
        assert result.succeeded == 2
        assert result.failed == 0


class TestConfigManager:
    """Test the ConfigManager class."""

    def test_config_creation(self):
        """Test creating a configuration manager."""
        config = ConfigManager()
        assert config is not None

    def test_get_config_value(self):
        """Test getting configuration values."""
        config = ConfigManager()
        timeout = config.get('default_timeout')
        assert timeout == 300  # Default value

    def test_set_config_value(self):
        """Test setting configuration values."""
        config = ConfigManager()
        config.set('default_timeout', 600)
        assert config.get('default_timeout') == 600

    def test_get_all_config(self):
        """Test getting all configuration."""
        config = ConfigManager()
        all_config = config.get_all()
        assert isinstance(all_config, dict)
        assert 'default_timeout' in all_config


# Test configuration
@pytest.fixture
def event_loop():
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
