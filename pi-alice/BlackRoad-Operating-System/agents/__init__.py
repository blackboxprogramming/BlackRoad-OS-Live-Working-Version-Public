"""
BlackRoad Agent Library

The world's largest production-ready AI agent ecosystem.

Features:
- 208+ pre-built agents across 10 categories
- Production-grade base framework
- Agent orchestration and execution
- Parallel and sequential execution
- Dependency management
- Configuration management
- Comprehensive monitoring

Quick Start:
    >>> from agents.base import AgentRegistry, AgentExecutor
    >>> registry = AgentRegistry()
    >>> executor = AgentExecutor()
    >>> agent = registry.get_agent('deployment-agent')
    >>> result = await executor.execute(agent, {'platform': 'railway'})

Categories:
- DevOps (28 agents): Deployment, monitoring, infrastructure
- Engineering (30 agents): Code generation, testing, documentation
- Data (25 agents): ETL, analysis, visualization
- Security (20 agents): Scanning, compliance, threat detection
- Finance (20 agents): Trading, portfolio management, risk analysis
- Creative (20 agents): Content generation, SEO, translation
- Business (20 agents): CRM, automation, project management
- Research (15 agents): Literature review, experiments, data analysis
- Web (15 agents): Scraping, API integration, webhooks
- AI/ML (15 agents): Training, deployment, monitoring
"""

__version__ = '1.0.0'
__author__ = 'BlackRoad Corporation'

from .base import (
    BaseAgent,
    AgentStatus,
    AgentMetadata,
    AgentResult,
    AgentExecutor,
    ExecutionPlan,
    OrchestrationResult,
    AgentRegistry,
    ConfigManager,
    get_config,
    init_config,
    AgentConfig,
)

__all__ = [
    'BaseAgent',
    'AgentStatus',
    'AgentMetadata',
    'AgentResult',
    'AgentExecutor',
    'ExecutionPlan',
    'OrchestrationResult',
    'AgentRegistry',
    'ConfigManager',
    'get_config',
    'init_config',
    'AgentConfig',
]


def get_agent_count():
    """Get total number of registered agents."""
    registry = AgentRegistry()
    stats = registry.get_stats()
    return stats['total_agents']


def get_categories():
    """Get list of all agent categories."""
    registry = AgentRegistry()
    return registry.list_categories()


def print_stats():
    """Print agent library statistics."""
    registry = AgentRegistry()
    stats = registry.get_stats()

    print("=" * 60)
    print("BlackRoad Agent Library Statistics")
    print("=" * 60)
    print(f"Total Agents: {stats['total_agents']}")
    print(f"Categories: {stats['total_categories']}")
    print("\nAgents by Category:")
    for category, count in sorted(stats['agents_by_category'].items()):
        print(f"  {category:.<20} {count:>3} agents")
    print("=" * 60)
