"""
Vercel API Integration Router

Provides endpoints for managing Vercel deployments, projects, and domains.
Vercel is a cloud platform for static sites and serverless functions.
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

router = APIRouter(prefix="/api/vercel", tags=["vercel"])

# Vercel API configuration
VERCEL_API_URL = "https://api.vercel.com"
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN")
VERCEL_TEAM_ID = os.getenv("VERCEL_TEAM_ID")


class VercelProject(BaseModel):
    """Vercel project model"""
    id: str
    name: str
    framework: Optional[str] = None
    created_at: int
    updated_at: int


class VercelDeployment(BaseModel):
    """Vercel deployment model"""
    uid: str
    name: str
    url: str
    state: str
    created_at: int
    ready: Optional[int] = None


class VercelDomain(BaseModel):
    """Vercel domain model"""
    name: str
    verified: bool
    created_at: int


class DeploymentTrigger(BaseModel):
    """Trigger deployment request"""
    project_id: str
    git_branch: Optional[str] = "main"


class VercelClient:
    """Vercel REST API client"""

    def __init__(self, token: Optional[str] = None, team_id: Optional[str] = None):
        self.token = token or VERCEL_TOKEN
        self.team_id = team_id or VERCEL_TEAM_ID
        self.base_url = VERCEL_API_URL

    def _get_headers(self) -> Dict[str, str]:
        """Get API request headers"""
        if not self.token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Vercel API token not configured"
            )

        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def _get_params(self) -> Dict[str, str]:
        """Get query parameters (team ID if configured)"""
        params = {}
        if self.team_id:
            params["teamId"] = self.team_id
        return params

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make API request"""
        headers = self._get_headers()
        params = kwargs.pop("params", {})
        params.update(self._get_params())

        url = f"{self.base_url}{endpoint}"

        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method,
                    url,
                    headers=headers,
                    params=params,
                    timeout=30.0,
                    **kwargs
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(f"Vercel API error: {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Vercel API error: {e.response.text}"
                )
            except httpx.HTTPError as e:
                logger.error(f"Vercel API request failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Vercel API request failed: {str(e)}"
                )

    async def get_projects(self) -> List[Dict[str, Any]]:
        """Get all projects"""
        data = await self._request("GET", "/v9/projects")
        return data.get("projects", [])

    async def get_project(self, project_id: str) -> Dict[str, Any]:
        """Get project by ID or name"""
        return await self._request("GET", f"/v9/projects/{project_id}")

    async def get_deployments(
        self,
        project_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get deployments"""
        params = {"limit": limit}
        if project_id:
            params["projectId"] = project_id

        data = await self._request("GET", "/v6/deployments", params=params)
        return data.get("deployments", [])

    async def get_deployment(self, deployment_id: str) -> Dict[str, Any]:
        """Get deployment by ID"""
        return await self._request("GET", f"/v13/deployments/{deployment_id}")

    async def create_deployment(
        self,
        name: str,
        git_source: Optional[Dict[str, str]] = None,
        env_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Create a new deployment"""
        payload = {"name": name}

        if git_source:
            payload["gitSource"] = git_source

        if env_vars:
            payload["env"] = [
                {"key": k, "value": v}
                for k, v in env_vars.items()
            ]

        return await self._request("POST", "/v13/deployments", json=payload)

    async def get_domains(self) -> List[Dict[str, Any]]:
        """Get all domains"""
        data = await self._request("GET", "/v5/domains")
        return data.get("domains", [])

    async def add_domain(self, name: str, project_id: str) -> Dict[str, Any]:
        """Add a domain to a project"""
        payload = {"name": name}
        return await self._request(
            "POST",
            f"/v10/projects/{project_id}/domains",
            json=payload
        )

    async def get_env_vars(self, project_id: str) -> List[Dict[str, Any]]:
        """Get environment variables for a project"""
        data = await self._request("GET", f"/v9/projects/{project_id}/env")
        return data.get("envs", [])

    async def create_env_var(
        self,
        project_id: str,
        key: str,
        value: str,
        target: List[str] = None
    ) -> Dict[str, Any]:
        """Create environment variable"""
        payload = {
            "key": key,
            "value": value,
            "type": "encrypted",
            "target": target or ["production", "preview", "development"]
        }
        return await self._request(
            "POST",
            f"/v10/projects/{project_id}/env",
            json=payload
        )


# Initialize client
vercel_client = VercelClient()


@router.get("/status")
async def get_vercel_status():
    """Get Vercel API connection status"""
    if not VERCEL_TOKEN:
        return {
            "connected": False,
            "message": "Vercel API token not configured. Set VERCEL_TOKEN environment variable."
        }

    try:
        # Try to fetch user info as a health check
        await vercel_client._request("GET", "/v2/user")
        return {
            "connected": True,
            "message": "Vercel API connected successfully",
            "team_configured": bool(VERCEL_TEAM_ID)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Vercel API connection failed: {str(e)}"
        }


@router.get("/projects")
async def list_projects():
    """List all Vercel projects"""
    try:
        projects = await vercel_client.get_projects()
        return {"projects": projects, "count": len(projects)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )


@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    try:
        project = await vercel_client.get_project(project_id)
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch project: {str(e)}"
        )


@router.get("/deployments")
async def list_deployments(project_id: Optional[str] = None, limit: int = 20):
    """List deployments"""
    try:
        deployments = await vercel_client.get_deployments(project_id, limit)
        return {"deployments": deployments, "count": len(deployments)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deployments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch deployments: {str(e)}"
        )


@router.get("/deployments/{deployment_id}")
async def get_deployment(deployment_id: str):
    """Get deployment details"""
    try:
        deployment = await vercel_client.get_deployment(deployment_id)
        return deployment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deployment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch deployment: {str(e)}"
        )


@router.post("/deployments")
async def create_deployment(
    name: str,
    git_repo: Optional[str] = None,
    git_branch: Optional[str] = "main"
):
    """Create a new deployment"""
    try:
        git_source = None
        if git_repo:
            git_source = {
                "type": "github",
                "repo": git_repo,
                "ref": git_branch
            }

        deployment = await vercel_client.create_deployment(name, git_source)
        return {
            "success": True,
            "deployment": deployment,
            "message": "Deployment created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deployment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create deployment: {str(e)}"
        )


@router.get("/domains")
async def list_domains():
    """List all domains"""
    try:
        domains = await vercel_client.get_domains()
        return {"domains": domains, "count": len(domains)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching domains: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch domains: {str(e)}"
        )


@router.post("/projects/{project_id}/domains")
async def add_domain(project_id: str, domain: str):
    """Add a domain to a project"""
    try:
        result = await vercel_client.add_domain(domain, project_id)
        return {
            "success": True,
            "domain": result,
            "message": "Domain added successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding domain: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add domain: {str(e)}"
        )


@router.get("/projects/{project_id}/env")
async def get_env_vars(project_id: str):
    """Get environment variables for a project"""
    try:
        env_vars = await vercel_client.get_env_vars(project_id)
        return {"variables": env_vars, "count": len(env_vars)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching env vars: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch env vars: {str(e)}"
        )


@router.post("/projects/{project_id}/env")
async def create_env_var(
    project_id: str,
    key: str,
    value: str,
    target: Optional[List[str]] = None
):
    """Create an environment variable"""
    try:
        result = await vercel_client.create_env_var(
            project_id,
            key,
            value,
            target
        )
        return {
            "success": True,
            "variable": result,
            "message": "Environment variable created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating env var: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create env var: {str(e)}"
        )


@router.get("/health")
async def vercel_health_check():
    """Vercel API health check endpoint"""
    return {
        "service": "vercel",
        "status": "operational" if VERCEL_TOKEN else "not_configured",
        "timestamp": utc_now().isoformat()
    }
