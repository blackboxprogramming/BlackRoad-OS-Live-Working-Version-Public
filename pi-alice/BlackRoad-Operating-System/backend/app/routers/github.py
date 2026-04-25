"""
GitHub Integration API Router

Provides integration with GitHub:
- Repository browsing
- Commits history
- Pull requests
- Issues tracking
- File browsing
- Code search
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import httpx
import os
import base64

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/github", tags=["github"])

# GitHub API configuration
GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")


class RepoCreate(BaseModel):
    name: str
    description: Optional[str] = None
    private: bool = False
    auto_init: bool = True


class IssueCreate(BaseModel):
    title: str
    body: Optional[str] = None
    labels: Optional[List[str]] = None


@router.get("/user")
async def get_github_user(
    current_user: User = Depends(get_current_user)
):
    """Get authenticated GitHub user information"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(f"{GITHUB_API_URL}/user", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch GitHub user")

        return response.json()


@router.get("/repos")
async def list_repositories(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List user's GitHub repositories"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/user/repos",
            headers=headers,
            params={"page": page, "per_page": per_page, "sort": "updated"}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repositories")

        repos = response.json()
        return {
            "repositories": repos,
            "total": len(repos),
            "page": page
        }


@router.post("/repos")
async def create_repository(
    repo_data: RepoCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new GitHub repository"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
        payload = repo_data.dict()

        response = await client.post(
            f"{GITHUB_API_URL}/user/repos",
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail="Failed to create repository")

        return response.json()


@router.get("/repos/{owner}/{repo}")
async def get_repository(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user)
):
    """Get repository details"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}",
            headers=headers
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Repository not found")

        return response.json()


@router.get("/repos/{owner}/{repo}/commits")
async def list_commits(
    owner: str,
    repo: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List repository commits"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/commits",
            headers=headers,
            params={"page": page, "per_page": per_page}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits")

        return {
            "commits": response.json(),
            "page": page
        }


@router.get("/repos/{owner}/{repo}/pulls")
async def list_pull_requests(
    owner: str,
    repo: str,
    state: str = Query("open", pattern="^(open|closed|all)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List pull requests"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/pulls",
            headers=headers,
            params={"state": state, "page": page, "per_page": per_page}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch pull requests")

        return {
            "pull_requests": response.json(),
            "state": state,
            "page": page
        }


@router.get("/repos/{owner}/{repo}/issues")
async def list_issues(
    owner: str,
    repo: str,
    state: str = Query("open", pattern="^(open|closed|all)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """List repository issues"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/issues",
            headers=headers,
            params={"state": state, "page": page, "per_page": per_page}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch issues")

        return {
            "issues": response.json(),
            "state": state,
            "page": page
        }


@router.post("/repos/{owner}/{repo}/issues")
async def create_issue(
    owner: str,
    repo: str,
    issue_data: IssueCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new issue"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
        payload = issue_data.dict(exclude_none=True)

        response = await client.post(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/issues",
            headers=headers,
            json=payload
        )

        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail="Failed to create issue")

        return response.json()


@router.get("/repos/{owner}/{repo}/contents/{path:path}")
async def get_file_contents(
    owner: str,
    repo: str,
    path: str,
    current_user: User = Depends(get_current_user)
):
    """Get file or directory contents"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{path}",
            headers=headers
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="File or directory not found")

        data = response.json()

        # If it's a file, decode the content
        if isinstance(data, dict) and data.get("type") == "file":
            try:
                content = base64.b64decode(data.get("content", "")).decode("utf-8")
                data["decoded_content"] = content
            except:
                data["decoded_content"] = None

        return data


@router.get("/repos/{owner}/{repo}/branches")
async def list_branches(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user)
):
    """List repository branches"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/branches",
            headers=headers
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch branches")

        return {"branches": response.json()}


@router.get("/search/repositories")
async def search_repositories(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Search GitHub repositories"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/search/repositories",
            headers=headers,
            params={"q": q, "page": page, "per_page": per_page}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Search failed")

        return response.json()


@router.get("/search/code")
async def search_code(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """Search code across GitHub"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        response = await client.get(
            f"{GITHUB_API_URL}/search/code",
            headers=headers,
            params={"q": q, "page": page, "per_page": per_page}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Code search failed")

        return response.json()


@router.get("/notifications")
async def get_notifications(
    all: bool = Query(False),
    participating: bool = Query(False),
    current_user: User = Depends(get_current_user)
):
    """Get user's GitHub notifications"""
    if not GITHUB_TOKEN:
        raise HTTPException(status_code=400, detail="GitHub token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"token {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        params = {}
        if all:
            params["all"] = "true"
        if participating:
            params["participating"] = "true"

        response = await client.get(
            f"{GITHUB_API_URL}/notifications",
            headers=headers,
            params=params
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch notifications")

        return {"notifications": response.json()}
