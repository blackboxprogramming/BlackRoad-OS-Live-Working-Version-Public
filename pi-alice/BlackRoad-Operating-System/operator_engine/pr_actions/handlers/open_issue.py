"""
Open/Close Issue Handler

Handles creating and managing issues from PR actions.
"""

from typing import Dict, Any
import logging

from . import BaseHandler
from ..action_types import PRAction, PRActionType

logger = logging.getLogger(__name__)


class OpenIssueHandler(BaseHandler):
    """Handler for creating and managing issues"""

    async def execute(self, action: PRAction) -> Dict[str, Any]:
        """
        Create or close an issue.

        Expected params for OPEN_ISSUE:
            - title: Issue title
            - body: Issue body
            - labels: Optional list of labels
            - assignees: Optional list of assignees
            - link_to_pr: If True, link the issue to the PR (default: True)

        Expected params for CLOSE_ISSUE:
            - issue_number: Issue number to close
            - comment: Optional closing comment
        """
        gh = await self.get_github_client()

        if action.action_type == PRActionType.OPEN_ISSUE:
            return await self._open_issue(gh, action)
        elif action.action_type == PRActionType.CLOSE_ISSUE:
            return await self._close_issue(gh, action)
        else:
            raise ValueError(f"Unsupported action type: {action.action_type}")

    async def _open_issue(self, gh, action: PRAction) -> Dict[str, Any]:
        """Create a new issue"""
        title = action.params.get("title")
        if not title:
            raise ValueError("title is required")

        body = action.params.get("body", "")
        labels = action.params.get("labels", [])
        assignees = action.params.get("assignees", [])
        link_to_pr = action.params.get("link_to_pr", True)

        # Add PR reference to body if requested
        if link_to_pr:
            pr_link = f"https://github.com/{action.repo_owner}/{action.repo_name}/pull/{action.pr_number}"
            body = f"{body}\n\n---\nCreated from PR #{action.pr_number}: {pr_link}"

        # Create the issue
        issue = await gh.create_issue(
            action.repo_owner,
            action.repo_name,
            title=title,
            body=body,
            labels=labels,
            assignees=assignees,
        )

        logger.info(
            f"Created issue #{issue['number']} from PR #{action.pr_number}: {title}"
        )

        return {
            "issue_number": issue["number"],
            "issue_url": issue["html_url"],
            "pr_number": action.pr_number,
            "title": title,
        }

    async def _close_issue(self, gh, action: PRAction) -> Dict[str, Any]:
        """Close an existing issue"""
        issue_number = action.params.get("issue_number")
        if not issue_number:
            raise ValueError("issue_number is required")

        comment = action.params.get("comment")

        # Add closing comment if provided
        if comment:
            await gh.create_issue_comment(
                action.repo_owner,
                action.repo_name,
                issue_number,
                comment,
            )

        # Close the issue
        await gh.close_issue(
            action.repo_owner,
            action.repo_name,
            issue_number,
        )

        logger.info(
            f"Closed issue #{issue_number} from PR #{action.pr_number}"
        )

        return {
            "issue_number": issue_number,
            "closed": True,
            "pr_number": action.pr_number,
        }
