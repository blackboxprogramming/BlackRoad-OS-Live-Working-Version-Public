"""
Commit Suggestion Handler

Handles committing code suggestions from reviews.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction

logger = logging.getLogger(__name__)


class CommitSuggestionHandler(BaseHandler):
    """Handler for committing code suggestions"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Apply and commit a code suggestion.

        Expected params:
            - suggestion_id: ID of the suggestion to apply (single)
            OR
            - suggestion_ids: List of suggestion IDs to batch apply
            - commit_message: Optional custom commit message
        """
        gh = await self.get_github_client()

        # Single or batch?
        suggestion_id = action.params.get("suggestion_id")
        suggestion_ids = action.params.get("suggestion_ids", [])

        if suggestion_id:
            suggestion_ids = [suggestion_id]
        elif not suggestion_ids:
            raise ValueError("Either suggestion_id or suggestion_ids required")

        # Get the PR
        pr = await gh.get_pull_request(
            action.repo_owner, action.repo_name, action.pr_number
        )

        # Apply suggestions
        results = []
        for sid in suggestion_ids:
            try:
                # Get suggestion details
                suggestion = await gh.get_review_comment(
                    action.repo_owner, action.repo_name, sid
                )

                if not suggestion:
                    logger.warning(f"Suggestion {sid} not found, skipping")
                    continue

                # Apply the suggestion
                result = await gh.apply_suggestion(
                    action.repo_owner,
                    action.repo_name,
                    action.pr_number,
                    sid,
                    commit_message=action.params.get("commit_message"),
                )

                results.append({
                    "suggestion_id": sid,
                    "applied": True,
                    "commit_sha": result.get("sha"),
                })

            except Exception as e:
                logger.error(f"Failed to apply suggestion {sid}: {e}")
                results.append({
                    "suggestion_id": sid,
                    "applied": False,
                    "error": str(e),
                })

        # Count successes
        applied_count = sum(1 for r in results if r.get("applied"))

        logger.info(
            f"Applied {applied_count}/{len(suggestion_ids)} suggestions on "
            f"{action.repo_owner}/{action.repo_name}#{action.pr_number}"
        )

        return {
            "pr_number": action.pr_number,
            "applied_count": applied_count,
            "total_count": len(suggestion_ids),
            "results": results,
        }
