"""
Resolve Comment Handler

Handles resolving review comments on PRs.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction

logger = logging.getLogger(__name__)


class ResolveCommentHandler(BaseHandler):
    """Handler for resolving PR review comments"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Resolve a review comment.

        Expected params:
            - comment_id: ID of the comment to resolve
        """
        comment_id = action.params.get("comment_id")
        if not comment_id:
            raise ValueError("comment_id is required")

        gh = await self.get_github_client()

        # Get the comment
        comment = await gh.get_review_comment(
            action.repo_owner, action.repo_name, comment_id
        )

        if not comment:
            raise ValueError(f"Comment {comment_id} not found")

        # Resolve the comment (mark as resolved in GitHub)
        await gh.resolve_review_comment(
            action.repo_owner, action.repo_name, comment_id
        )

        logger.info(
            f"Resolved comment {comment_id} on "
            f"{action.repo_owner}/{action.repo_name}#{action.pr_number}"
        )

        return {
            "comment_id": comment_id,
            "resolved": True,
            "pr_number": action.pr_number,
        }
