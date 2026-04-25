"""
Add/Remove Label Handler

Handles managing labels on PRs.
"""

from typing import Dict, Any, List
import logging

from . import BaseHandler
from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class AddLabelHandler(BaseHandler):
    """Handler for managing PR labels"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Add or remove labels from a PR.

        Expected params for ADD_LABEL:
            - labels: List of labels to add

        Expected params for REMOVE_LABEL:
            - labels: List of labels to remove
        """
        gh = await self.get_github_client()

        labels = action.params.get("labels", [])
        if not labels:
            raise ValueError("labels list is required")

        # Ensure labels is a list
        if isinstance(labels, str):
            labels = [labels]

        if action.action_type == PRActionType.ADD_LABEL:
            return await self._add_labels(gh, action, labels)
        elif action.action_type == PRActionType.REMOVE_LABEL:
            return await self._remove_labels(gh, action, labels)
        else:
            raise ValueError(f"Unsupported action type: {action.action_type}")

    async def _add_labels(self, gh, action: PRAction, labels: List[str]) -> Dict[str, Any]:
        """Add labels to a PR"""
        # Add labels
        result = await gh.add_labels(
            action.repo_owner,
            action.repo_name,
            action.pr_number,
            labels,
        )

        logger.info(
            f"Added labels {labels} to PR #{action.pr_number}"
        )

        return {
            "pr_number": action.pr_number,
            "added": labels,
            "current_labels": [label["name"] for label in result],
        }

    async def _remove_labels(self, gh, action: PRAction, labels: List[str]) -> Dict[str, Any]:
        """Remove labels from a PR"""
        removed = []
        errors = []

        for label in labels:
            try:
                await gh.remove_label(
                    action.repo_owner,
                    action.repo_name,
                    action.pr_number,
                    label,
                )
                removed.append(label)
            except Exception as e:
                logger.error(f"Failed to remove label '{label}': {e}")
                errors.append({"label": label, "error": str(e)})

        logger.info(
            f"Removed labels {removed} from PR #{action.pr_number}"
        )

        # Get current labels
        pr = await gh.get_pull_request(
            action.repo_owner,
            action.repo_name,
            action.pr_number,
        )
        current_labels = [label["name"] for label in pr.get("labels", [])]

        return {
            "pr_number": action.pr_number,
            "removed": removed,
            "errors": errors,
            "current_labels": current_labels,
        }
