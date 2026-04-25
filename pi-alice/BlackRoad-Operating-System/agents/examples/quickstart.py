"""
BlackRoad Agent Library - Quickstart Guide

This example demonstrates how to use the BlackRoad Agent Library.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from base import AgentRegistry, AgentExecutor, ExecutionPlan


async def example_1_single_agent():
    """Example 1: Execute a single agent"""
    print("\n=== Example 1: Single Agent Execution ===\n")

    # Initialize registry and executor
    registry = AgentRegistry()
    executor = AgentExecutor()

    # Get an agent
    agent = registry.get_agent('deployment-agent')

    if agent:
        # Execute the agent
        result = await executor.execute(agent, {
            'platform': 'railway',
            'project_path': '/path/to/project',
            'environment': 'production'
        })

        print(f"Status: {result.status.value}")
        print(f"Duration: {result.duration_seconds:.2f}s")
        print(f"Result: {result.data}")
    else:
        print("Agent not found. Make sure agents are discovered.")


async def example_2_parallel_execution():
    """Example 2: Execute multiple agents in parallel"""
    print("\n=== Example 2: Parallel Agent Execution ===\n")

    registry = AgentRegistry()
    executor = AgentExecutor()

    # Get multiple agents
    agents = [
        registry.get_agent('docker-builder'),
        registry.get_agent('monitoring-agent'),
        registry.get_agent('health-checker')
    ]

    # Filter out None values
    agents = [a for a in agents if a is not None]

    if agents:
        # Execute in parallel
        results = await executor.execute_parallel(
            agents,
            {
                'image_name': 'blackroad-app',
                'targets': ['service1', 'service2'],
                'endpoints': ['http://localhost:8000/health']
            },
            max_concurrency=3
        )

        print(f"Executed {len(results)} agents:")
        for result in results:
            print(f"  - {result.agent_name}: {result.status.value}")


async def example_3_sequential_execution():
    """Example 3: Execute agents sequentially"""
    print("\n=== Example 3: Sequential Agent Execution ===\n")

    registry = AgentRegistry()
    executor = AgentExecutor()

    # Get agents for a deployment pipeline
    agents = [
        registry.get_agent('docker-builder'),
        registry.get_agent('container-scanner'),
        registry.get_agent('deployment-agent')
    ]

    agents = [a for a in agents if a is not None]

    if agents:
        # Execute sequentially
        results = await executor.execute_sequential(
            agents,
            {
                'image_name': 'blackroad-app',
                'tag': 'latest',
                'platform': 'railway',
                'project_path': '/path/to/project',
                'environment': 'production'
            },
            stop_on_error=True
        )

        print(f"Pipeline executed {len(results)} steps:")
        for i, result in enumerate(results, 1):
            print(f"  Step {i} - {result.agent_name}: {result.status.value}")


async def example_4_execution_plan():
    """Example 4: Execute with an execution plan"""
    print("\n=== Example 4: Execution Plan ===\n")

    registry = AgentRegistry()
    executor = AgentExecutor()

    agents = [
        registry.get_agent('code-reviewer'),
        registry.get_agent('test-generator'),
        registry.get_agent('security-scanner')
    ]

    agents = [a for a in agents if a is not None]

    if agents:
        # Create execution plan
        plan = ExecutionPlan(
            agents=agents,
            mode='parallel',
            max_concurrency=3,
            stop_on_error=False
        )

        # Execute plan
        result = await executor.execute_plan(plan, {
            'repository': 'blackboxprogramming/BlackRoad-Operating-System',
            'branch': 'main',
            'language': 'python'
        })

        print(f"Plan Status: {result.status}")
        print(f"Total Duration: {result.total_duration_seconds:.2f}s")
        print(f"Succeeded: {result.succeeded}/{len(agents)}")
        print(f"Failed: {result.failed}/{len(agents)}")


async def example_5_list_agents():
    """Example 5: List and discover agents"""
    print("\n=== Example 5: Agent Discovery ===\n")

    registry = AgentRegistry()

    # Get stats
    stats = registry.get_stats()
    print(f"Total Agents: {stats['total_agents']}")
    print(f"Categories: {stats['total_categories']}")

    print("\nAgents by Category:")
    for category, count in stats['agents_by_category'].items():
        print(f"  {category}: {count} agents")

    # List agents in a specific category
    print("\nDevOps Agents:")
    devops_agents = registry.list_agents(category='devops')
    for agent in devops_agents[:5]:  # Show first 5
        print(f"  - {agent.metadata.name}: {agent.metadata.description}")

    # Search for agents
    print("\nSearching for 'deploy':")
    search_results = registry.search('deploy')
    for agent in search_results[:3]:  # Show first 3
        print(f"  - {agent.metadata.name}: {agent.metadata.description}")


async def main():
    """Run all examples"""
    print("=" * 60)
    print("BlackRoad Agent Library - Quickstart Examples")
    print("=" * 60)

    await example_5_list_agents()
    await example_1_single_agent()
    await example_2_parallel_execution()
    await example_3_sequential_execution()
    await example_4_execution_plan()

    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)


if __name__ == '__main__':
    asyncio.run(main())
