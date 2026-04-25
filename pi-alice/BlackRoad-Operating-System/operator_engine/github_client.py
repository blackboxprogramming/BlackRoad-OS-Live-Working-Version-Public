"""
GitHub API Client

Provides a unified interface for interacting with the GitHub API.
Handles authentication, rate limiting, and common operations.
"""

import os
import asyncio
from typing import Dict, Any, List, Optional
import logging
import httpx

logger = logging.getLogger(__name__)


class GitHubClient:
    """Async GitHub API client"""

    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv("GITHUB_TOKEN")
        if not self.token:
            raise ValueError("GITHUB_TOKEN environment variable is required")

        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

        # Rate limiting
        self._rate_limit_remaining = None
        self._rate_limit_reset = None

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Any:
        """Make an authenticated request to the GitHub API"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method,
                    url,
                    headers=self.headers,
                    json=data,
                    params=params,
                    timeout=30.0,
                )

                # Update rate limit info
                self._rate_limit_remaining = int(
                    response.headers.get("X-RateLimit-Remaining", 0)
                )
                self._rate_limit_reset = int(
                    response.headers.get("X-RateLimit-Reset", 0)
                )

                # Check rate limit
                if response.status_code == 429:
                    logger.warning("Rate limit exceeded, waiting...")
                    await asyncio.sleep(60)
                    return await self._request(method, endpoint, data, params)

                response.raise_for_status()

                # Return JSON if present
                if response.headers.get("Content-Type", "").startswith("application/json"):
                    return response.json()
                return response.text
        except httpx.TimeoutException:
            logger.error(f"Request to {url} timed out")
            raise
        except httpx.NetworkError as e:
            logger.error(f"Network error accessing {url}: {e}")
            raise
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error for {url}: {e}")
            raise

    # Pull Request Operations

    async def get_pull_request(
        self, owner: str, repo: str, pr_number: int
    ) -> Optional[Dict]:
        """Get a pull request"""
        try:
            return await self._request(
                "GET", f"/repos/{owner}/{repo}/pulls/{pr_number}"
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise

    async def update_branch(
        self, owner: str, repo: str, pr_number: int, method: str = "merge"
    ) -> Dict:
        """Update a PR branch with the base branch"""
        # GitHub API endpoint for updating PR branch
        return await self._request(
            "PUT",
            f"/repos/{owner}/{repo}/pulls/{pr_number}/update-branch",
            data={"expected_head_sha": None},  # Use latest
        )

    async def is_branch_behind(
        self, owner: str, repo: str, head: str, base: str
    ) -> bool:
        """Check if head branch is behind base branch"""
        comparison = await self._request(
            "GET", f"/repos/{owner}/{repo}/compare/{base}...{head}"
        )
        return comparison.get("behind_by", 0) > 0

    async def merge_pull_request(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        merge_method: str = "merge",
        commit_title: Optional[str] = None,
        commit_message: Optional[str] = None,
    ) -> Dict:
        """Merge a pull request"""
        data = {"merge_method": merge_method}
        if commit_title:
            data["commit_title"] = commit_title
        if commit_message:
            data["commit_message"] = commit_message

        return await self._request(
            "PUT", f"/repos/{owner}/{repo}/pulls/{pr_number}/merge", data=data
        )

    # Review Comment Operations

    async def get_review_comment(
        self, owner: str, repo: str, comment_id: int
    ) -> Optional[Dict]:
        """Get a review comment"""
        try:
            return await self._request(
                "GET", f"/repos/{owner}/{repo}/pulls/comments/{comment_id}"
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise

    async def resolve_review_comment(
        self, owner: str, repo: str, comment_id: int
    ) -> Dict:
        """Resolve a review comment thread"""
        # This requires the GitHub GraphQL API
        # For now, we'll use a placeholder
        # In production, use PyGithub or the GraphQL API directly
        raise NotImplementedError(
            "Resolving comments requires GraphQL API. "
            "Use PyGithub or implement GraphQL client."
        )

    async def apply_suggestion(
        self,
        owner: str,
        repo: str,
        pr_number: int,
        comment_id: int,
        commit_message: Optional[str] = None,
    ) -> Dict:
        """Apply a code suggestion from a review comment"""
        # This requires the GitHub GraphQL API
        # For now, we'll use a placeholder
        # In production, use PyGithub or the GraphQL API directly
        raise NotImplementedError(
            "Applying suggestions requires GraphQL API. "
            "Use PyGithub or implement GraphQL client."
        )

    # Check Run Operations

    async def get_check_runs(
        self, owner: str, repo: str, ref: str
    ) -> List[Dict]:
        """Get check runs for a commit"""
        result = await self._request(
            "GET", f"/repos/{owner}/{repo}/commits/{ref}/check-runs"
        )
        return result.get("check_runs", [])

    async def rerun_check(self, owner: str, repo: str, check_run_id: int) -> Dict:
        """Rerun a check"""
        return await self._request(
            "POST", f"/repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"
        )

    async def get_required_checks(
        self, owner: str, repo: str, branch: str
    ) -> List[str]:
        """Get required status checks for a branch"""
        try:
            protection = await self._request(
                "GET", f"/repos/{owner}/{repo}/branches/{branch}/protection"
            )
            required_checks = protection.get(
                "required_status_checks", {}
            ).get("contexts", [])
            return required_checks
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return []
            raise

    # Label Operations

    async def add_labels(
        self, owner: str, repo: str, issue_number: int, labels: List[str]
    ) -> List[Dict]:
        """Add labels to an issue/PR"""
        return await self._request(
            "POST",
            f"/repos/{owner}/{repo}/issues/{issue_number}/labels",
            data={"labels": labels},
        )

    async def remove_label(
        self, owner: str, repo: str, issue_number: int, label: str
    ) -> None:
        """Remove a label from an issue/PR"""
        await self._request(
            "DELETE",
            f"/repos/{owner}/{repo}/issues/{issue_number}/labels/{label}",
        )

    # Issue Operations

    async def create_issue(
        self,
        owner: str,
        repo: str,
        title: str,
        body: str = "",
        labels: List[str] = None,
        assignees: List[str] = None,
    ) -> Dict:
        """Create an issue"""
        data = {"title": title, "body": body}
        if labels:
            data["labels"] = labels
        if assignees:
            data["assignees"] = assignees

        return await self._request(
            "POST", f"/repos/{owner}/{repo}/issues", data=data
        )

    async def close_issue(self, owner: str, repo: str, issue_number: int) -> Dict:
        """Close an issue"""
        return await self._request(
            "PATCH",
            f"/repos/{owner}/{repo}/issues/{issue_number}",
            data={"state": "closed"},
        )

    async def create_issue_comment(
        self, owner: str, repo: str, issue_number: int, body: str
    ) -> Dict:
        """Create a comment on an issue/PR"""
        return await self._request(
            "POST",
            f"/repos/{owner}/{repo}/issues/{issue_number}/comments",
            data={"body": body},
        )


# Global client instance
_client_instance: Optional[GitHubClient] = None


async def get_github_client() -> GitHubClient:
    """Get the global GitHub client instance"""
    global _client_instance
    if _client_instance is None:
        _client_instance = GitHubClient()
    return _client_instance
