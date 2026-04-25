"""
Update Branch Handler

Handles updating PR branches with base branch changes.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class UpdateBranchHandler(BaseHandler):
    """Handler for updating PR branches"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Update a PR branch with changes from the base branch.

        Expected params:
            - method: "merge" or "rebase" (default: "merge")
        """
        gh = await self.get_github_client()

        # Get merge method
        method = action.params.get("method", "merge")
        if action.action_type == PRActionType.REBASE_BRANCH:
            method = "rebase"

        # Get the PR
        pr = await gh.get_pull_request(
            action.repo_owner, action.repo_name, action.pr_number
        )

        if not pr:
            raise ValueError(f"PR #{action.pr_number} not found")

        # Check if update is needed
        is_behind = await gh.is_branch_behind(
            action.repo_owner,
            action.repo_name,
            pr["head"]["ref"],
            pr["base"]["ref"],
        )

        if not is_behind:
            logger.info(
                f"PR #{action.pr_number} is already up to date with base branch"
            )
            return {
                "pr_number": action.pr_number,
                "updated": False,
                "reason": "already_up_to_date",
            }

        # Update the branch
        result = await gh.update_branch(
            action.repo_owner,
            action.repo_name,
            action.pr_number,
            method=method,
        )

        logger.info(
            f"Updated PR #{action.pr_number} branch using {method} method"
        )

        return {
            "pr_number": action.pr_number,
            "updated": True,
            "method": method,
            "commit_sha": result.get("sha"),
        }
