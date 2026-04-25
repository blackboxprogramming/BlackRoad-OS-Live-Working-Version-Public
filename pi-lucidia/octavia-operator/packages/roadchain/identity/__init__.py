"""RoadChain Agent Identity — SHA-2048 identity layer.

Identity > Provider. The hash is the agent.
"""

from .agent import AgentIdentity
from .registry import IdentityRegistry

__all__ = ["AgentIdentity", "IdentityRegistry"]
