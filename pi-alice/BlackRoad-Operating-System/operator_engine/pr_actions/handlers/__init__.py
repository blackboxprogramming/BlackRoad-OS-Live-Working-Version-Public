"""
PR Action Handlers

Each handler implements the logic for a specific PR action type.
"""

from typing import Dict, Any
from abc import ABC, abstractmethod
import logging

from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class BaseHandler(ABC):
    """Base class for all PR action handlers"""

    @abstractmethod
    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Execute the action.

        Args:
            action: The PR action to execute

        Returns:
            Dict containing the result of the action

        Raises:
            Exception: If the action fails
        """
        pass

    async def validate(self, action: PRAction) -> bool:
        """
        Validate the action before execution.

        Args:
            action: The PR action to validate

        Returns:
            True if valid, False otherwise
        """
        return True

    async def get_github_client(self):
        """Get authenticated GitHub client"""
        # Import here to avoid circular dependencies
        from ...github_client import get_github_client
        return await get_github_client()


# Import all handlers
from .resolve_comment import ResolveCommentHandler
from .commit_suggestion import CommitSuggestionHandler
from .update_branch import UpdateBranchHandler
from .rerun_checks import RerunChecksHandler
from .open_issue import OpenIssueHandler
from .add_label import AddLabelHandler
from .merge_pr import MergePRHandler


# Handler registry
HANDLER_REGISTRY: Dict[PRActionType, BaseHandler] = {
    PRActionType.RESOLVE_COMMENT: ResolveCommentHandler(),
    PRActionType.COMMIT_SUGGESTION: CommitSuggestionHandler(),
    PRActionType.APPLY_SUGGESTION: CommitSuggestionHandler(),
    PRActionType.UPDATE_BRANCH: UpdateBranchHandler(),
    PRActionType.REBASE_BRANCH: UpdateBranchHandler(),
    PRActionType.RERUN_CHECKS: RerunChecksHandler(),
    PRActionType.RERUN_FAILED_CHECKS: RerunChecksHandler(),
    PRActionType.OPEN_ISSUE: OpenIssueHandler(),
    PRActionType.CLOSE_ISSUE: OpenIssueHandler(),
    PRActionType.ADD_LABEL: AddLabelHandler(),
    PRActionType.REMOVE_LABEL: AddLabelHandler(),
    PRActionType.MERGE_PR: MergePRHandler(),
    PRActionType.SQUASH_MERGE: MergePRHandler(),
    PRActionType.REBASE_MERGE: MergePRHandler(),
}


def get_handler(action_type: PRActionType) -> BaseHandler:
    """Get the handler for an action type"""
    handler = HANDLER_REGISTRY.get(action_type)
    if handler is None:
        raise ValueError(f"No handler registered for action type: {action_type}")
    return handler


__all__ = [
    "BaseHandler",
    "get_handler",
    "HANDLER_REGISTRY",
]
