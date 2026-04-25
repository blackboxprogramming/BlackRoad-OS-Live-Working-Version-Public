"""
GitHub Webhook Handler

Receives and processes GitHub webhook events, mapping them to PR actions.
"""

import hashlib
import hmac
import os
from typing import Dict, Any, Optional
import logging

from fastapi import Request, HTTPException, Header
from .pr_actions import get_queue, PRActionType, PRActionPriority

logger = logging.getLogger(__name__)


class GitHubWebhookHandler:
    """Handles GitHub webhook events"""

    def __init__(self, webhook_secret: Optional[str] = None):
        self.webhook_secret = webhook_secret or os.getenv("GITHUB_WEBHOOK_SECRET")
        self.queue = get_queue()

    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """Verify the webhook signature"""
        if not self.webhook_secret:
            logger.warning("GITHUB_WEBHOOK_SECRET not set, skipping verification")
            return True

        expected_signature = "sha256=" + hmac.new(
            self.webhook_secret.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)

    async def handle_webhook(
        self,
        request: Request,
        x_github_event: str = Header(...),
        x_hub_signature_256: str = Header(None),
    ) -> Dict[str, Any]:
        """
        Handle incoming GitHub webhook.

        Args:
            request: FastAPI request object
            x_github_event: GitHub event type
            x_hub_signature_256: Webhook signature

        Returns:
            Response dict
        """
        # Read payload
        payload = await request.body()

        # Verify signature
        if x_hub_signature_256:
            if not self.verify_signature(payload, x_hub_signature_256):
                raise HTTPException(status_code=401, detail="Invalid signature")

        # Parse JSON
        data = await request.json()

        # Route to appropriate handler
        handler_method = f"_handle_{x_github_event}"
        if hasattr(self, handler_method):
            await getattr(self, handler_method)(data)
        else:
            logger.info(f"No handler for event type: {x_github_event}")

        return {"status": "received"}

    # Event Handlers

    async def _handle_pull_request(self, data: Dict[str, Any]):
        """Handle pull_request events"""
        action = data.get("action")
        pr = data.get("pull_request", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        pr_number = pr.get("number")

        logger.info(f"Pull request {action}: {owner}/{repo_name}#{pr_number}")

        # Handle specific actions
        if action == "opened":
            await self._on_pr_opened(owner, repo_name, pr_number, pr)
        elif action == "synchronize":  # New commits pushed
            await self._on_pr_synchronized(owner, repo_name, pr_number, pr)
        elif action == "labeled":
            await self._on_pr_labeled(owner, repo_name, pr_number, pr, data)
        elif action == "ready_for_review":
            await self._on_pr_ready_for_review(owner, repo_name, pr_number, pr)

    async def _handle_pull_request_review(self, data: Dict[str, Any]):
        """Handle pull_request_review events"""
        action = data.get("action")
        review = data.get("review", {})
        pr = data.get("pull_request", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        pr_number = pr.get("number")

        logger.info(
            f"Pull request review {action}: {owner}/{repo_name}#{pr_number}"
        )

        if action == "submitted":
            await self._on_review_submitted(owner, repo_name, pr_number, review)

    async def _handle_pull_request_review_comment(self, data: Dict[str, Any]):
        """Handle pull_request_review_comment events"""
        action = data.get("action")
        comment = data.get("comment", {})
        pr = data.get("pull_request", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        pr_number = pr.get("number")

        logger.info(
            f"Pull request review comment {action}: {owner}/{repo_name}#{pr_number}"
        )

        if action == "created":
            await self._on_review_comment_created(
                owner, repo_name, pr_number, comment
            )

    async def _handle_issue_comment(self, data: Dict[str, Any]):
        """Handle issue_comment events (includes PR comments)"""
        action = data.get("action")
        comment = data.get("comment", {})
        issue = data.get("issue", {})
        repo = data.get("repository", {})

        # Skip if not a PR
        if "pull_request" not in issue:
            return

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")
        pr_number = issue.get("number")

        logger.info(f"Issue comment {action}: {owner}/{repo_name}#{pr_number}")

        if action == "created":
            await self._on_issue_comment_created(
                owner, repo_name, pr_number, comment
            )

    async def _handle_check_suite(self, data: Dict[str, Any]):
        """Handle check_suite events"""
        action = data.get("action")
        check_suite = data.get("check_suite", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")

        logger.info(f"Check suite {action}: {owner}/{repo_name}")

        if action == "completed":
            await self._on_check_suite_completed(
                owner, repo_name, check_suite
            )

    async def _handle_check_run(self, data: Dict[str, Any]):
        """Handle check_run events"""
        action = data.get("action")
        check_run = data.get("check_run", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")

        logger.info(f"Check run {action}: {owner}/{repo_name}")

        if action == "completed":
            await self._on_check_run_completed(owner, repo_name, check_run)

    async def _handle_workflow_run(self, data: Dict[str, Any]):
        """Handle workflow_run events"""
        action = data.get("action")
        workflow_run = data.get("workflow_run", {})
        repo = data.get("repository", {})

        owner = repo.get("owner", {}).get("login")
        repo_name = repo.get("name")

        logger.info(f"Workflow run {action}: {owner}/{repo_name}")

        if action == "completed":
            await self._on_workflow_run_completed(
                owner, repo_name, workflow_run
            )

    # Action Methods

    async def _on_pr_opened(
        self, owner: str, repo_name: str, pr_number: int, pr: Dict
    ):
        """Handle PR opened"""
        # Auto-label based on files changed
        await self.queue.enqueue(
            PRActionType.SYNC_LABELS,
            owner,
            repo_name,
            pr_number,
            {},
            priority=PRActionPriority.BACKGROUND,
            triggered_by="webhook:pr_opened",
        )

    async def _on_pr_synchronized(
        self, owner: str, repo_name: str, pr_number: int, pr: Dict
    ):
        """Handle PR synchronized (new commits)"""
        # Check if branch needs updating
        if pr.get("mergeable_state") == "behind":
            await self.queue.enqueue(
                PRActionType.UPDATE_BRANCH,
                owner,
                repo_name,
                pr_number,
                {"method": "merge"},
                priority=PRActionPriority.HIGH,
                triggered_by="webhook:pr_synchronized",
            )

    async def _on_pr_labeled(
        self, owner: str, repo_name: str, pr_number: int, pr: Dict, data: Dict
    ):
        """Handle PR labeled"""
        label = data.get("label", {}).get("name")

        # Auto-merge labels
        auto_merge_labels = [
            "claude-auto",
            "atlas-auto",
            "docs",
            "chore",
            "tests-only",
        ]

        if label in auto_merge_labels:
            logger.info(
                f"Auto-merge label '{label}' added to PR #{pr_number}, "
                f"adding to merge queue"
            )
            await self.queue.enqueue(
                PRActionType.ADD_TO_MERGE_QUEUE,
                owner,
                repo_name,
                pr_number,
                {},
                priority=PRActionPriority.HIGH,
                triggered_by=f"webhook:labeled:{label}",
            )

    async def _on_pr_ready_for_review(
        self, owner: str, repo_name: str, pr_number: int, pr: Dict
    ):
        """Handle PR marked as ready for review"""
        # Sync labels
        await self.queue.enqueue(
            PRActionType.SYNC_LABELS,
            owner,
            repo_name,
            pr_number,
            {},
            priority=PRActionPriority.NORMAL,
            triggered_by="webhook:ready_for_review",
        )

    async def _on_review_submitted(
        self, owner: str, repo_name: str, pr_number: int, review: Dict
    ):
        """Handle review submitted"""
        state = review.get("state")

        if state == "approved":
            logger.info(f"PR #{pr_number} approved, checking auto-merge eligibility")
            # Could add to merge queue here if conditions are met

    async def _on_review_comment_created(
        self, owner: str, repo_name: str, pr_number: int, comment: Dict
    ):
        """Handle review comment created"""
        body = comment.get("body", "")

        # Check for commands in comment
        if "/resolve" in body:
            await self.queue.enqueue(
                PRActionType.RESOLVE_COMMENT,
                owner,
                repo_name,
                pr_number,
                {"comment_id": comment.get("id")},
                priority=PRActionPriority.NORMAL,
                triggered_by="webhook:comment_command",
            )

    async def _on_issue_comment_created(
        self, owner: str, repo_name: str, pr_number: int, comment: Dict
    ):
        """Handle issue comment created on PR"""
        body = comment.get("body", "")

        # Check for bot commands
        if "/update-branch" in body:
            await self.queue.enqueue(
                PRActionType.UPDATE_BRANCH,
                owner,
                repo_name,
                pr_number,
                {"method": "merge"},
                priority=PRActionPriority.HIGH,
                triggered_by="webhook:comment_command",
            )
        elif "/rerun-checks" in body:
            await self.queue.enqueue(
                PRActionType.RERUN_CHECKS,
                owner,
                repo_name,
                pr_number,
                {},
                priority=PRActionPriority.NORMAL,
                triggered_by="webhook:comment_command",
            )

    async def _on_check_suite_completed(
        self, owner: str, repo_name: str, check_suite: Dict
    ):
        """Handle check suite completed"""
        conclusion = check_suite.get("conclusion")
        pull_requests = check_suite.get("pull_requests", [])

        if conclusion == "failure":
            for pr in pull_requests:
                pr_number = pr.get("number")
                logger.info(
                    f"Check suite failed for PR #{pr_number}, removing from merge queue"
                )
                # Could remove from merge queue here

    async def _on_check_run_completed(
        self, owner: str, repo_name: str, check_run: Dict
    ):
        """Handle check run completed"""
        conclusion = check_run.get("conclusion")
        pull_requests = check_run.get("pull_requests", [])

        if conclusion == "success":
            for pr in pull_requests:
                pr_number = pr.get("number")
                # Check if all checks are passing and add to merge queue if eligible

    async def _on_workflow_run_completed(
        self, owner: str, repo_name: str, workflow_run: Dict
    ):
        """Handle workflow run completed"""
        conclusion = workflow_run.get("conclusion")
        pull_requests = workflow_run.get("pull_requests", [])

        for pr in pull_requests:
            pr_number = pr.get("number")
            if conclusion == "success":
                logger.info(f"Workflow succeeded for PR #{pr_number}")
            else:
                logger.warning(f"Workflow failed for PR #{pr_number}")


# Global handler instance
_handler_instance: Optional[GitHubWebhookHandler] = None


def get_webhook_handler() -> GitHubWebhookHandler:
    """Get the global webhook handler instance"""
    global _handler_instance
    if _handler_instance is None:
        _handler_instance = GitHubWebhookHandler()
    return _handler_instance
