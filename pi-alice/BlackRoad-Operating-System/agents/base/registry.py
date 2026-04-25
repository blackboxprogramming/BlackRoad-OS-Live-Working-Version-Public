"""
Agent Registry

Centralized registry for agent discovery, registration, and management.
"""

import importlib
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Type

from .agent import BaseAgent


class AgentRegistry:
    """
    Registry for managing and discovering agents.

    Features:
    - Agent registration and discovery
    - Category-based organization
    - Dynamic loading from filesystem
    - Agent search and filtering
    - Version management

    Example:
        ```python
        registry = AgentRegistry()

        # Register an agent
        registry.register(MyAgent())

        # Get an agent
        agent = registry.get_agent('my-agent')

        # List all agents
        all_agents = registry.list_agents()

        # List by category
        devops_agents = registry.list_agents(category='devops')

        # Search agents
        results = registry.search('deploy')
        ```
    """

    def __init__(self, auto_discover: bool = True):
        """Initialize the registry."""
        self.logger = logging.getLogger("agent.registry")
        self._agents: Dict[str, BaseAgent] = {}
        self._agents_by_category: Dict[str, List[str]] = {}
        self._agent_classes: Dict[str, Type[BaseAgent]] = {}

        if auto_discover:
            self.discover_agents()

    def register(
        self,
        agent: BaseAgent,
        override: bool = False
    ) -> None:
        """
        Register an agent.

        Args:
            agent: Agent instance to register
            override: Allow overriding existing agent

        Raises:
            ValueError: If agent already exists and override=False
        """
        agent_name = agent.metadata.name

        if agent_name in self._agents and not override:
            raise ValueError(
                f"Agent '{agent_name}' already registered. "
                f"Use override=True to replace."
            )

        self._agents[agent_name] = agent

        # Add to category index
        category = agent.metadata.category
        if category not in self._agents_by_category:
            self._agents_by_category[category] = []
        if agent_name not in self._agents_by_category[category]:
            self._agents_by_category[category].append(agent_name)

        self.logger.info(f"Registered agent: {agent_name}")

    def register_class(
        self,
        agent_class: Type[BaseAgent],
        name: Optional[str] = None
    ) -> None:
        """
        Register an agent class (lazy instantiation).

        Args:
            agent_class: Agent class to register
            name: Optional name override
        """
        agent_name = name or agent_class.__name__
        self._agent_classes[agent_name] = agent_class
        self.logger.info(f"Registered agent class: {agent_name}")

    def unregister(self, agent_name: str) -> bool:
        """
        Unregister an agent.

        Args:
            agent_name: Name of agent to remove

        Returns:
            True if removed, False if not found
        """
        if agent_name in self._agents:
            agent = self._agents[agent_name]
            category = agent.metadata.category

            del self._agents[agent_name]

            # Remove from category index
            if category in self._agents_by_category:
                self._agents_by_category[category].remove(agent_name)

            self.logger.info(f"Unregistered agent: {agent_name}")
            return True

        return False

    def get_agent(
        self,
        agent_name: str,
        create_new: bool = False
    ) -> Optional[BaseAgent]:
        """
        Get an agent by name.

        Args:
            agent_name: Name of the agent
            create_new: Create a new instance if it's a registered class

        Returns:
            Agent instance or None if not found
        """
        # Check instances first
        if agent_name in self._agents:
            return self._agents[agent_name]

        # Check classes
        if create_new and agent_name in self._agent_classes:
            agent_class = self._agent_classes[agent_name]
            agent = agent_class()
            self.register(agent)
            return agent

        return None

    def list_agents(
        self,
        category: Optional[str] = None
    ) -> List[BaseAgent]:
        """
        List all registered agents.

        Args:
            category: Filter by category (optional)

        Returns:
            List of agent instances
        """
        if category:
            agent_names = self._agents_by_category.get(category, [])
            return [self._agents[name] for name in agent_names]

        return list(self._agents.values())

    def list_categories(self) -> List[str]:
        """Get list of all agent categories."""
        return list(self._agents_by_category.keys())

    def search(
        self,
        query: str,
        search_in: List[str] = None
    ) -> List[BaseAgent]:
        """
        Search for agents.

        Args:
            query: Search query
            search_in: Fields to search in (name, description, tags)

        Returns:
            List of matching agents
        """
        if search_in is None:
            search_in = ['name', 'description', 'tags']

        query_lower = query.lower()
        results = []

        for agent in self._agents.values():
            matched = False

            if 'name' in search_in:
                if query_lower in agent.metadata.name.lower():
                    matched = True

            if 'description' in search_in:
                if query_lower in agent.metadata.description.lower():
                    matched = True

            if 'tags' in search_in:
                for tag in agent.metadata.tags:
                    if query_lower in tag.lower():
                        matched = True
                        break

            if matched:
                results.append(agent)

        return results

    def discover_agents(
        self,
        base_path: Optional[Path] = None
    ) -> int:
        """
        Discover and register agents from filesystem.

        Args:
            base_path: Base directory to search (defaults to ./categories)

        Returns:
            Number of agents discovered
        """
        if base_path is None:
            # Get path relative to this file
            current_dir = Path(__file__).parent.parent
            base_path = current_dir / "categories"

        if not base_path.exists():
            self.logger.warning(
                f"Agent directory not found: {base_path}"
            )
            return 0

        discovered = 0

        # Scan all category directories
        for category_dir in base_path.iterdir():
            if not category_dir.is_dir():
                continue

            category_name = category_dir.name

            # Scan all Python files in the category
            for agent_file in category_dir.glob("*.py"):
                if agent_file.name.startswith("_"):
                    continue

                try:
                    # Import the module
                    module_name = (
                        f"agents.categories.{category_name}."
                        f"{agent_file.stem}"
                    )
                    module = importlib.import_module(module_name)

                    # Find agent classes in the module
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)

                        # Check if it's a BaseAgent subclass
                        if (
                            isinstance(attr, type) and
                            issubclass(attr, BaseAgent) and
                            attr is not BaseAgent
                        ):
                            # Instantiate and register
                            try:
                                agent = attr()
                                self.register(agent)
                                discovered += 1
                            except Exception as e:
                                self.logger.error(
                                    f"Failed to instantiate {attr_name}: "
                                    f"{str(e)}"
                                )

                except Exception as e:
                    self.logger.error(
                        f"Failed to load {agent_file}: {str(e)}"
                    )

        self.logger.info(f"Discovered {discovered} agents")
        return discovered

    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics."""
        return {
            'total_agents': len(self._agents),
            'total_categories': len(self._agents_by_category),
            'agents_by_category': {
                cat: len(agents)
                for cat, agents in self._agents_by_category.items()
            },
            'categories': list(self._agents_by_category.keys())
        }

    def export_manifest(self) -> Dict[str, Any]:
        """Export agent manifest."""
        return {
            'agents': [
                agent.get_info()
                for agent in self._agents.values()
            ],
            'categories': self.list_categories(),
            'stats': self.get_stats()
        }

    async def enable_leitl_for_all(
        self,
        leitl_protocol=None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, str]:
        """
        Enable LEITL protocol for all registered agents

        This allows all agents to participate in the Live Everyone In The Loop
        multi-agent collaboration protocol.

        Args:
            leitl_protocol: LEITL protocol instance (optional, will be imported if not provided)
            tags: Optional tags for sessions

        Returns:
            Dict mapping agent names to LEITL session IDs
        """
        self.logger.info("🔗 Enabling LEITL for all agents...")

        sessions = {}

        for agent_name, agent in self._agents.items():
            try:
                session_id = await agent.enable_leitl(
                    leitl_protocol=leitl_protocol,
                    tags=tags
                )

                if session_id:
                    sessions[agent_name] = session_id
                    self.logger.info(f"  ✓ {agent_name}: {session_id}")

            except Exception as e:
                self.logger.warning(f"  ✗ {agent_name}: {str(e)}")

        self.logger.info(f"✅ LEITL enabled for {len(sessions)}/{len(self._agents)} agents")

        return sessions

    async def disable_leitl_for_all(self):
        """Disable LEITL protocol for all agents"""
        self.logger.info("🔌 Disabling LEITL for all agents...")

        for agent_name, agent in self._agents.items():
            try:
                await agent.disable_leitl()
                self.logger.debug(f"  ✓ {agent_name}")
            except Exception as e:
                self.logger.warning(f"  ✗ {agent_name}: {str(e)}")

        self.logger.info("✅ LEITL disabled for all agents")

    def get_leitl_status(self) -> Dict[str, Any]:
        """
        Get LEITL status for all agents

        Returns:
            Dict with LEITL enabled counts and session IDs
        """
        enabled_agents = {}
        disabled_agents = []

        for agent_name, agent in self._agents.items():
            if agent._leitl_enabled:
                enabled_agents[agent_name] = agent._leitl_session_id
            else:
                disabled_agents.append(agent_name)

        return {
            "leitl_enabled_count": len(enabled_agents),
            "leitl_disabled_count": len(disabled_agents),
            "enabled_agents": enabled_agents,
            "disabled_agents": disabled_agents,
            "total_agents": len(self._agents)
        }
