"""
Rerun Checks Handler

Handles re-running CI/CD checks on PRs.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class RerunChecksHandler(BaseHandler):
    """Handler for re-running CI/CD checks"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Re-run CI/CD checks for a PR.

        Expected params:
            - check_ids: Optional list of specific check IDs to rerun
            - failed_only: If True, only rerun failed checks (default: False)
        """
        gh = await self.get_github_client()

        # Get the PR
        pr = await gh.get_pull_request(
            action.repo_owner, action.repo_name, action.pr_number
        )

        if not pr:
            raise ValueError(f"PR #{action.pr_number} not found")

        head_sha = pr["head"]["sha"]

        # Get check runs for the PR
        check_runs = await gh.get_check_runs(
            action.repo_owner, action.repo_name, head_sha
        )

        # Filter checks
        failed_only = (
            action.params.get("failed_only", False)
            or action.action_type == PRActionType.RERUN_FAILED_CHECKS
        )
        check_ids = action.params.get("check_ids", [])

        checks_to_rerun = []
        for check in check_runs:
            # Filter by ID if specified
            if check_ids and check["id"] not in check_ids:
                continue

            # Filter by status if failed_only
            if failed_only and check["conclusion"] != "failure":
                continue

            checks_to_rerun.append(check)

        # Rerun checks
        results = []
        for check in checks_to_rerun:
            try:
                # Trigger rerun
                result = await gh.rerun_check(
                    action.repo_owner,
                    action.repo_name,
                    check["id"],
                )

                results.append({
                    "check_id": check["id"],
                    "check_name": check["name"],
                    "rerun": True,
                })

                logger.info(
                    f"Reran check '{check['name']}' (ID: {check['id']}) "
                    f"for PR #{action.pr_number}"
                )

            except Exception as e:
                logger.error(
                    f"Failed to rerun check {check['id']}: {e}"
                )
                results.append({
                    "check_id": check["id"],
                    "check_name": check["name"],
                    "rerun": False,
                    "error": str(e),
                })

        rerun_count = sum(1 for r in results if r.get("rerun"))

        logger.info(
            f"Reran {rerun_count}/{len(checks_to_rerun)} checks for "
            f"PR #{action.pr_number}"
        )

        return {
            "pr_number": action.pr_number,
            "head_sha": head_sha,
            "rerun_count": rerun_count,
            "total_count": len(checks_to_rerun),
            "results": results,
        }
