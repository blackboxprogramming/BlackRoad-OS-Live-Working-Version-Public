#!/usr/bin/env python3
"""
BlackRoad SDK - Agent Operations Example
========================================

This example demonstrates advanced agent operations including:
- Listing and filtering agents
- Getting agent details
- Executing agents with parameters
- Monitoring execution status
- Handling agent errors
"""

import asyncio
import os
import sys
import time
from typing import Dict, Any

# Add parent directory to path to import blackroad
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from blackroad import (
    AgentError,
    AsyncBlackRoadClient,
    BlackRoadClient,
    NotFoundError,
)


def sync_example() -> None:
    """Synchronous agent operations example."""
    print("=== Synchronous Agent Operations ===\n")

    # Initialize client
    client = BlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000")
    )

    # Login (assuming user exists from quickstart)
    try:
        token = client.auth.login(username="demo_user", password="SecurePassword123!")
        client.set_token(token.access_token)
        print(f"Logged in as: {client.auth.me().username}\n")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # Example 1: List All Agents
    print("1. Listing all available agents...")
    try:
        all_agents = client.agents.list_agents()
        print(f"Total agents available: {len(all_agents)}")

        # Group by category
        categories: Dict[str, int] = {}
        for agent in all_agents:
            categories[agent.category] = categories.get(agent.category, 0) + 1

        print("\nAgents by category:")
        for category, count in sorted(categories.items()):
            print(f"  {category}: {count} agents")

    except NotFoundError:
        print("Agent endpoints not implemented yet")
        return
    except Exception as e:
        print(f"Error listing agents: {e}")
        return

    # Example 2: Filter Agents by Category
    print("\n2. Filtering agents by category...")
    try:
        devops_agents = client.agents.list_agents(category="devops")
        print(f"Found {len(devops_agents)} DevOps agents:")
        for agent in devops_agents[:5]:
            print(f"  - {agent.name} (v{agent.version})")
            print(f"    {agent.description}")
            if agent.tags:
                print(f"    Tags: {', '.join(agent.tags)}")

    except Exception as e:
        print(f"Error: {e}")

    # Example 3: Get Agent Details
    print("\n3. Getting agent details...")
    try:
        agent_name = devops_agents[0].name if devops_agents else "deployment-agent"
        agent = client.agents.get_agent(agent_name)
        print(f"\nAgent: {agent.name}")
        print(f"Version: {agent.version}")
        print(f"Category: {agent.category}")
        print(f"Description: {agent.description}")
        print(f"Author: {agent.author}")
        print(f"Status: {agent.status}")
        if agent.dependencies:
            print(f"Dependencies: {', '.join(agent.dependencies)}")

    except NotFoundError:
        print(f"Agent '{agent_name}' not found")
    except Exception as e:
        print(f"Error: {e}")

    # Example 4: Execute an Agent
    print("\n4. Executing an agent...")
    try:
        params = {
            "environment": "staging",
            "version": "1.0.0",
            "service": "api",
            "dry_run": True,
        }

        print(f"Executing {agent_name} with params: {params}")
        result = client.agents.execute_agent(
            agent_name=agent_name,
            params=params,
        )

        print(f"\nExecution ID: {result.execution_id}")
        print(f"Status: {result.status}")
        print(f"Agent: {result.agent_name}")

        if result.data:
            print(f"Result data: {result.data}")

        if result.duration_seconds:
            print(f"Duration: {result.duration_seconds:.2f} seconds")

    except AgentError as e:
        print(f"Agent execution failed: {e}")
    except Exception as e:
        print(f"Error: {e}")

    # Example 5: Monitor Execution Status
    if result and result.execution_id:
        print("\n5. Monitoring execution status...")
        try:
            status = client.agents.get_execution_status(result.execution_id)
            print(f"Execution status: {status.status}")

            if status.status == "completed":
                print("Execution completed successfully!")
                if status.data:
                    print(f"Result: {status.data}")
            elif status.status == "failed":
                print(f"Execution failed: {status.error}")

        except Exception as e:
            print(f"Error checking status: {e}")

    # Cleanup
    client.close()
    print("\n=== Synchronous Example Complete ===")


async def async_example() -> None:
    """Asynchronous agent operations example."""
    print("\n\n=== Asynchronous Agent Operations ===\n")

    # Initialize async client
    async with AsyncBlackRoadClient(
        base_url=os.getenv("BLACKROAD_BASE_URL", "http://localhost:8000")
    ) as client:

        # Login
        try:
            token = await client.auth.login(username="demo_user", password="SecurePassword123!")
            client.set_token(token.access_token)
            user = await client.auth.me()
            print(f"Logged in as: {user.username}\n")
        except Exception as e:
            print(f"Login failed: {e}")
            return

        # Example: Execute Multiple Agents Concurrently
        print("Executing multiple agents concurrently...")

        try:
            # Get list of agents
            agents = await client.agents.list_agents(category="devops")
            if not agents:
                print("No DevOps agents available")
                return

            # Execute first 3 agents concurrently
            agent_names = [agent.name for agent in agents[:3]]
            print(f"Executing agents: {', '.join(agent_names)}")

            # Create tasks for concurrent execution
            tasks = [
                client.agents.execute_agent(
                    agent_name=name,
                    params={"dry_run": True, "environment": "test"},
                )
                for name in agent_names
            ]

            # Wait for all executions to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            print("\nExecution Results:")
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"\n  {agent_names[i]}: FAILED - {result}")
                else:
                    print(f"\n  {agent_names[i]}: {result.status}")
                    print(f"    Execution ID: {result.execution_id}")
                    if result.duration_seconds:
                        print(f"    Duration: {result.duration_seconds:.2f}s")

        except NotFoundError:
            print("Agent endpoints not implemented yet")
        except Exception as e:
            print(f"Error: {e}")

    print("\n=== Asynchronous Example Complete ===")


def main() -> None:
    """Run all examples."""
    print("BlackRoad SDK - Agent Operations Examples")
    print("=" * 50)

    # Run synchronous example
    sync_example()

    # Run asynchronous example
    asyncio.run(async_example())

    print("\n" + "=" * 50)
    print("Examples complete!")
    print("\nNote: Some operations may fail if agent endpoints")
    print("are not fully implemented in the backend.")


if __name__ == "__main__":
    main()
