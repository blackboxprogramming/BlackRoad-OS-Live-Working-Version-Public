"""
Merge PR Handler

Handles merging PRs with various strategies.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class MergePRHandler(BaseHandler):
    """Handler for merging PRs"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Merge a PR.

        Expected params:
            - merge_method: "merge", "squash", or "rebase" (default: from action_type)
            - commit_title: Optional custom commit title
            - commit_message: Optional custom commit message
            - skip_checks: If True, merge without waiting for checks (default: False)
        """
        gh = await self.get_github_client()

        # Determine merge method
        merge_method = action.params.get("merge_method")
        if not merge_method:
            if action.action_type == PRActionType.SQUASH_MERGE:
                merge_method = "squash"
            elif action.action_type == PRActionType.REBASE_MERGE:
                merge_method = "rebase"
            else:
                merge_method = "merge"

        # Get the PR
        pr = await gh.get_pull_request(
            action.repo_owner, action.repo_name, action.pr_number
        )

        if not pr:
            raise ValueError(f"PR #{action.pr_number} not found")

        # Check if PR is mergeable
        if not pr.get("mergeable", False):
            raise ValueError(
                f"PR #{action.pr_number} is not mergeable. "
                f"Merge state: {pr.get('mergeable_state')}"
            )

        # Check if checks are passing (unless skip_checks is True)
        skip_checks = action.params.get("skip_checks", False)
        if not skip_checks:
            checks_passing = await self._check_required_checks(gh, action)
            if not checks_passing:
                raise ValueError(
                    f"Required checks are not passing for PR #{action.pr_number}"
                )

        # Merge the PR
        result = await gh.merge_pull_request(
            action.repo_owner,
            action.repo_name,
            action.pr_number,
            merge_method=merge_method,
            commit_title=action.params.get("commit_title"),
            commit_message=action.params.get("commit_message"),
        )

        logger.info(
            f"Merged PR #{action.pr_number} using {merge_method} method. "
            f"Merge commit: {result.get('sha')}"
        )

        return {
            "pr_number": action.pr_number,
            "merged": True,
            "merge_method": merge_method,
            "sha": result.get("sha"),
            "message": result.get("message"),
        }

    async def _check_required_checks(self, gh, action: PRAction) -> bool:
        """Check if all required checks are passing"""
        pr = await gh.get_pull_request(
            action.repo_owner, action.repo_name, action.pr_number
        )

        head_sha = pr["head"]["sha"]

        # Get check runs
        check_runs = await gh.get_check_runs(
            action.repo_owner, action.repo_name, head_sha
        )

        # Get required checks for the repo
        required_checks = await gh.get_required_checks(
            action.repo_owner, action.repo_name, pr["base"]["ref"]
        )

        # Defensive checks for required_checks
        if required_checks is None:
            required_checks = []
        elif not isinstance(required_checks, list):
            logger.warning(f"Unexpected required_checks type: {type(required_checks)}")
            required_checks = []
        # If no required checks, consider it passing
        if not required_checks:
            return True

        # Check if all required checks are passing
        for required_check in required_checks:
            matching_checks = [
                check for check in check_runs
                if check["name"] == required_check
            ]

            if not matching_checks:
                logger.warning(
                    f"Required check '{required_check}' not found for PR #{action.pr_number}"
                )
                return False

            # Check if any matching check passed
            passed = any(
                check["conclusion"] == "success"
                for check in matching_checks
            )

            if not passed:
                logger.warning(
                    f"Required check '{required_check}' did not pass for PR #{action.pr_number}"
                )
                return False

        return True
