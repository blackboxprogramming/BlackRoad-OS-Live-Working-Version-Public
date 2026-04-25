"""
Sentry Error Tracking Integration Router

Provides endpoints for error tracking, performance monitoring, and release management.
Sentry is an application monitoring and error tracking platform.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sentry", tags=["sentry"])

# Sentry API configuration
SENTRY_AUTH_TOKEN = os.getenv("SENTRY_AUTH_TOKEN")
SENTRY_ORG = os.getenv("SENTRY_ORG")
SENTRY_DSN = os.getenv("SENTRY_DSN")


class SentryError(BaseModel):
    """Sentry error/event model"""
    message: str
    level: str = "error"  # debug, info, warning, error, fatal
    tags: Optional[Dict[str, str]] = None
    extra: Optional[Dict[str, Any]] = None


class SentryRelease(BaseModel):
    """Sentry release model"""
    version: str
    projects: List[str]
    ref: Optional[str] = None


class SentryClient:
    """Sentry REST API client"""

    def __init__(
        self,
        auth_token: Optional[str] = None,
        org: Optional[str] = None
    ):
        self.auth_token = auth_token or SENTRY_AUTH_TOKEN
        self.org = org or SENTRY_ORG
        self.base_url = "https://sentry.io/api/0"

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        if not self.auth_token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Sentry auth token not configured"
            )

        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request"""
        headers = self._get_headers()
        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method,
                    url,
                    headers=headers,
                    json=json_data,
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()

                # Handle 204 No Content
                if response.status_code == 204:
                    return {"success": True}

                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(f"Sentry API error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Sentry API error: {e.response.text}"
                )
            except httpx.HTTPError as e:
                logger.error(f"Sentry API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Sentry API request failed: {str(e)}"
                )

    async def get_projects(self) -> List[Dict[str, Any]]:
        """Get all projects in organization"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        return await self._request("GET", f"/organizations/{self.org}/projects/")

    async def get_issues(
        self,
        project: str,
        limit: int = 25
    ) -> List[Dict[str, Any]]:
        """Get issues for a project"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        params = {"limit": limit}
        return await self._request(
            "GET",
            f"/projects/{self.org}/{project}/issues/",
            params=params
        )

    async def get_events(
        self,
        project: str,
        limit: int = 25
    ) -> List[Dict[str, Any]]:
        """Get events for a project"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        params = {"limit": limit}
        return await self._request(
            "GET",
            f"/projects/{self.org}/{project}/events/",
            params=params
        )

    async def create_release(
        self,
        version: str,
        projects: List[str],
        ref: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new release"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        data = {
            "version": version,
            "projects": projects
        }
        if ref:
            data["ref"] = ref

        return await self._request(
            "POST",
            f"/organizations/{self.org}/releases/",
            json_data=data
        )

    async def list_releases(
        self,
        project: str,
        limit: int = 25
    ) -> List[Dict[str, Any]]:
        """List releases for a project"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        params = {"limit": limit}
        return await self._request(
            "GET",
            f"/projects/{self.org}/{project}/releases/",
            params=params
        )

    async def get_stats(
        self,
        project: str,
        stat: str = "received"
    ) -> List[Dict[str, Any]]:
        """Get project statistics"""
        if not self.org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sentry organization not configured"
            )

        params = {"stat": stat}
        return await self._request(
            "GET",
            f"/projects/{self.org}/{project}/stats/",
            params=params
        )


# Initialize client
sentry_client = SentryClient()


@router.get("/status")
async def get_sentry_status():
    """Get Sentry API connection status"""
    if not SENTRY_AUTH_TOKEN:
        return {
            "connected": False,
            "message": "Sentry auth token not configured. Set SENTRY_AUTH_TOKEN environment variable.",
            "org_configured": bool(SENTRY_ORG),
            "dsn_configured": bool(SENTRY_DSN)
        }

    try:
        # Test API connection
        projects = await sentry_client.get_projects()
        return {
            "connected": True,
            "message": "Sentry API connected successfully",
            "organization": SENTRY_ORG,
            "project_count": len(projects),
            "dsn_configured": bool(SENTRY_DSN)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Sentry API connection failed: {str(e)}",
            "org_configured": bool(SENTRY_ORG),
            "dsn_configured": bool(SENTRY_DSN)
        }


@router.get("/projects")
async def list_projects():
    """List all Sentry projects"""
    try:
        projects = await sentry_client.get_projects()
        return {
            "projects": projects,
            "count": len(projects)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )


@router.get("/projects/{project}/issues")
async def list_issues(project: str, limit: int = 25):
    """List issues for a project"""
    try:
        issues = await sentry_client.get_issues(project, limit)
        return {
            "issues": issues,
            "count": len(issues)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching issues: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch issues: {str(e)}"
        )


@router.get("/projects/{project}/events")
async def list_events(project: str, limit: int = 25):
    """List events for a project"""
    try:
        events = await sentry_client.get_events(project, limit)
        return {
            "events": events,
            "count": len(events)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}"
        )


@router.post("/releases")
async def create_release(release: SentryRelease):
    """Create a new release"""
    try:
        result = await sentry_client.create_release(
            version=release.version,
            projects=release.projects,
            ref=release.ref
        )
        return {
            "success": True,
            "release": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating release: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create release: {str(e)}"
        )


@router.get("/projects/{project}/releases")
async def list_releases(project: str, limit: int = 25):
    """List releases for a project"""
    try:
        releases = await sentry_client.list_releases(project, limit)
        return {
            "releases": releases,
            "count": len(releases)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching releases: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch releases: {str(e)}"
        )


@router.get("/projects/{project}/stats")
async def get_stats(project: str, stat: str = "received"):
    """Get project statistics"""
    try:
        stats = await sentry_client.get_stats(project, stat)
        return {
            "stats": stats,
            "stat_type": stat
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@router.get("/health")
async def sentry_health_check():
    """Sentry API health check endpoint"""
    return {
        "service": "sentry",
        "status": "operational" if SENTRY_AUTH_TOKEN else "not_configured",
        "timestamp": utc_now().isoformat()
    }
