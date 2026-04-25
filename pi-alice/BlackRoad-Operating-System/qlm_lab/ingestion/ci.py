"""
CI Connector - Ingest CI/test results into QLM

Converts CI events into QLM system events:
- Test runs → SYSTEM_TEST events
- Build results → SYSTEM_BUILD events
- Deploy actions → SYSTEM_DEPLOY events
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from qlm_lab.models import EventType
from qlm_lab.api import QLMInterface

logger = logging.getLogger(__name__)


class CIConnector:
    """
    Connects QLM to CI/CD system (GitHub Actions, Jenkins, etc.)

    Usage:
        connector = CIConnector(qlm=qlm_interface)
        connector.ingest_test_result(test_data)
        connector.ingest_build_result(build_data)
    """

    def __init__(self, qlm: QLMInterface):
        """
        Args:
            qlm: QLMInterface instance
        """
        self.qlm = qlm

    def ingest_test_result(
        self,
        test_name: str,
        passed: bool,
        duration_seconds: float,
        failures: Optional[List[str]] = None,
        commit_hash: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> Any:
        """
        Ingest a test run result.

        Args:
            test_name: Name of test suite
            passed: Whether tests passed
            duration_seconds: How long tests took
            failures: List of failed test names
            commit_hash: Related commit
            task_id: Related task

        Returns:
            Created QLMEvent
        """
        event_type = EventType.SYSTEM_TEST

        description = f"Test '{test_name}': {'PASSED' if passed else 'FAILED'}"

        metadata = {
            "test_name": test_name,
            "passed": passed,
            "duration_seconds": duration_seconds,
            "failures": failures or [],
            "commit_hash": commit_hash,
        }

        event = self.qlm.record_system_event(
            event_type=event_type,
            description=description,
            task_id=task_id,
            metadata=metadata,
        )

        logger.info(f"Ingested test result: {test_name} - {'PASS' if passed else 'FAIL'}")
        return event

    def ingest_build_result(
        self,
        build_name: str,
        success: bool,
        duration_seconds: float,
        artifacts: Optional[List[str]] = None,
        commit_hash: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> Any:
        """
        Ingest a build result.

        Args:
            build_name: Name of build
            success: Whether build succeeded
            duration_seconds: Build duration
            artifacts: List of produced artifacts
            commit_hash: Related commit
            task_id: Related task

        Returns:
            Created QLMEvent
        """
        event_type = EventType.SYSTEM_BUILD

        description = f"Build '{build_name}': {'SUCCESS' if success else 'FAILED'}"

        metadata = {
            "build_name": build_name,
            "success": success,
            "duration_seconds": duration_seconds,
            "artifacts": artifacts or [],
            "commit_hash": commit_hash,
        }

        event = self.qlm.record_system_event(
            event_type=event_type,
            description=description,
            task_id=task_id,
            metadata=metadata,
        )

        logger.info(f"Ingested build result: {build_name} - {'SUCCESS' if success else 'FAIL'}")
        return event

    def ingest_deploy_result(
        self,
        service_name: str,
        environment: str,
        success: bool,
        version: Optional[str] = None,
        commit_hash: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> Any:
        """
        Ingest a deployment result.

        Args:
            service_name: What was deployed
            environment: Where (production, staging, etc.)
            success: Whether deploy succeeded
            version: Version deployed
            commit_hash: Related commit
            task_id: Related task

        Returns:
            Created QLMEvent
        """
        event_type = EventType.SYSTEM_DEPLOY

        description = f"Deploy '{service_name}' to {environment}: {'SUCCESS' if success else 'FAILED'}"

        metadata = {
            "service": service_name,
            "environment": environment,
            "success": success,
            "version": version,
            "commit_hash": commit_hash,
        }

        event = self.qlm.record_system_event(
            event_type=event_type,
            description=description,
            task_id=task_id,
            metadata=metadata,
        )

        logger.info(f"Ingested deploy: {service_name} to {environment} - {'SUCCESS' if success else 'FAIL'}")
        return event

    def ingest_from_github_actions(self, workflow_run: Dict[str, Any]) -> List[Any]:
        """
        Ingest events from a GitHub Actions workflow run.

        Args:
            workflow_run: GitHub Actions workflow run data (JSON)

        Returns:
            List of created QLMEvents
        """
        events = []

        # Extract data from workflow
        name = workflow_run.get("name", "Unknown workflow")
        conclusion = workflow_run.get("conclusion", "unknown")
        success = conclusion == "success"

        # Get commit
        head_commit = workflow_run.get("head_commit", {})
        commit_hash = head_commit.get("id", None)

        # Create test event (assuming workflow is tests)
        if "test" in name.lower():
            event = self.ingest_test_result(
                test_name=name,
                passed=success,
                duration_seconds=0,  # Would need to calculate from timestamps
                commit_hash=commit_hash,
            )
            events.append(event)

        # Create build event (assuming workflow builds)
        elif "build" in name.lower():
            event = self.ingest_build_result(
                build_name=name,
                success=success,
                duration_seconds=0,
                commit_hash=commit_hash,
            )
            events.append(event)

        # Create deploy event
        elif "deploy" in name.lower():
            event = self.ingest_deploy_result(
                service_name=name,
                environment="production",  # Would need to parse from workflow
                success=success,
                commit_hash=commit_hash,
            )
            events.append(event)

        return events
