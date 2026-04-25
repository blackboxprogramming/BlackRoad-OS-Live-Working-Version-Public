"""
QLM Ingestion - Wire QLM to Reality

This module contains connectors that ingest real system data into QLM:
- Git commits → QLMEvents
- CI test results → System events
- Agent logs → Agent execution events
- Deployment events → System events

Each connector transforms external data into QLMEvents.
"""

from qlm_lab.ingestion.git import GitConnector
from qlm_lab.ingestion.ci import CIConnector
from qlm_lab.ingestion.agent_logs import AgentLogConnector

__all__ = ["GitConnector", "CIConnector", "AgentLogConnector"]
