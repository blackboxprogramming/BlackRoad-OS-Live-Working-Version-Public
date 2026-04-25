"""
Railway API Integration Router

Provides endpoints for managing Railway deployments, projects, and services.
Railway is a deployment platform that simplifies infrastructure management.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import httpx
import os
import logging

from app.utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/railway", tags=["railway"])

# Railway API configuration
RAILWAY_API_URL = "https://backboard.railway.app/graphql"
RAILWAY_TOKEN = os.getenv("RAILWAY_TOKEN")


class RailwayProject(BaseModel):
    """Railway project model"""
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class RailwayService(BaseModel):
    """Railway service model"""
    id: str
    name: str
    project_id: str
    status: str
    created_at: datetime


class RailwayDeployment(BaseModel):
    """Railway deployment model"""
    id: str
    service_id: str
    status: str
    created_at: datetime
    url: Optional[str] = None
    environment: str = "production"


class DeploymentCreate(BaseModel):
    """Create deployment request"""
    project_id: str
    service_id: str
    environment: Optional[str] = "production"


class RailwayVariable(BaseModel):
    """Environment variable"""
    key: str
    value: str


class RailwayClient:
    """Railway GraphQL API client"""

    def __init__(self, token: Optional[str] = None):
        self.token = token or RAILWAY_TOKEN
        self.api_url = RAILWAY_API_URL

    async def _graphql_request(self, query: str, variables: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute GraphQL request"""
        if not self.token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Railway API token not configured"
            )

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        payload = {
            "query": query,
            "variables": variables or {}
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()

                if "errors" in data:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"GraphQL error: {data['errors']}"
                    )

                return data.get("data", {})

            except httpx.HTTPError as e:
                logger.error(f"Railway API error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Railway API request failed: {str(e)}"
                )

    async def get_projects(self) -> List[Dict[str, Any]]:
        """Get all projects"""
        query = """
        query {
            projects {
                edges {
                    node {
                        id
                        name
                        description
                        createdAt
                        updatedAt
                    }
                }
            }
        }
        """
        result = await self._graphql_request(query)
        edges = result.get("projects", {}).get("edges", [])
        return [edge["node"] for edge in edges]

    async def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project by ID"""
        query = """
        query($id: String!) {
            project(id: $id) {
                id
                name
                description
                createdAt
                updatedAt
            }
        }
        """
        result = await self._graphql_request(query, {"id": project_id})
        return result.get("project")

    async def get_services(self, project_id: str) -> List[Dict[str, Any]]:
        """Get services for a project"""
        query = """
        query($projectId: String!) {
            project(id: $projectId) {
                services {
                    edges {
                        node {
                            id
                            name
                            createdAt
                        }
                    }
                }
            }
        }
        """
        result = await self._graphql_request(query, {"projectId": project_id})
        edges = result.get("project", {}).get("services", {}).get("edges", [])
        return [edge["node"] for edge in edges]

    async def get_deployments(self, service_id: str) -> List[Dict[str, Any]]:
        """Get deployments for a service"""
        query = """
        query($serviceId: String!) {
            service(id: $serviceId) {
                deployments {
                    edges {
                        node {
                            id
                            status
                            createdAt
                            url
                        }
                    }
                }
            }
        }
        """
        result = await self._graphql_request(query, {"serviceId": service_id})
        edges = result.get("service", {}).get("deployments", {}).get("edges", [])
        return [edge["node"] for edge in edges]

    async def trigger_deployment(self, service_id: str) -> Dict[str, Any]:
        """Trigger a new deployment"""
        query = """
        mutation($serviceId: String!) {
            serviceDeploy(serviceId: $serviceId) {
                id
                status
                createdAt
            }
        }
        """
        result = await self._graphql_request(query, {"serviceId": service_id})
        return result.get("serviceDeploy", {})

    async def set_variables(
        self,
        project_id: str,
        environment_id: str,
        variables: Dict[str, str]
    ) -> bool:
        """Set environment variables"""
        query = """
        mutation($projectId: String!, $environmentId: String!, $variables: String!) {
            variableCollectionUpsert(
                input: {
                    projectId: $projectId
                    environmentId: $environmentId
                    variables: $variables
                }
            )
        }
        """
        import json
        variables_json = json.dumps(variables)

        result = await self._graphql_request(
            query,
            {
                "projectId": project_id,
                "environmentId": environment_id,
                "variables": variables_json
            }
        )
        return bool(result.get("variableCollectionUpsert"))


# Initialize client
railway_client = RailwayClient()


@router.get("/status")
async def get_railway_status():
    """Get Railway API connection status"""
    if not RAILWAY_TOKEN:
        return {
            "connected": False,
            "message": "Railway API token not configured. Set RAILWAY_TOKEN environment variable."
        }

    try:
        # Try to fetch projects as a health check
        projects = await railway_client.get_projects()
        return {
            "connected": True,
            "message": "Railway API connected successfully",
            "project_count": len(projects)
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Railway API connection failed: {str(e)}"
        }


@router.get("/projects", response_model=List[Dict[str, Any]])
async def list_projects():
    """List all Railway projects"""
    try:
        projects = await railway_client.get_projects()
        return projects
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
    project = await railway_client.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.get("/projects/{project_id}/services")
async def list_services(project_id: str):
    """List services in a project"""
    try:
        services = await railway_client.get_services(project_id)
        return services
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch services: {str(e)}"
        )


@router.get("/services/{service_id}/deployments")
async def list_deployments(service_id: str):
    """List deployments for a service"""
    try:
        deployments = await railway_client.get_deployments(service_id)
        return deployments
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deployments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch deployments: {str(e)}"
        )


@router.post("/services/{service_id}/deploy")
async def deploy_service(service_id: str):
    """Trigger a new deployment for a service"""
    try:
        deployment = await railway_client.trigger_deployment(service_id)
        return {
            "success": True,
            "deployment": deployment,
            "message": "Deployment triggered successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering deployment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger deployment: {str(e)}"
        )


@router.post("/projects/{project_id}/variables")
async def update_variables(
    project_id: str,
    environment_id: str,
    variables: List[RailwayVariable]
):
    """Update environment variables for a project"""
    try:
        variables_dict = {var.key: var.value for var in variables}
        success = await railway_client.set_variables(
            project_id,
            environment_id,
            variables_dict
        )

        if success:
            return {
                "success": True,
                "message": "Variables updated successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update variables"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating variables: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update variables: {str(e)}"
        )


@router.get("/health")
async def railway_health_check():
    """Railway API health check endpoint"""
    return {
        "service": "railway",
        "status": "operational" if RAILWAY_TOKEN else "not_configured",
        "timestamp": utc_now().isoformat()
    }
