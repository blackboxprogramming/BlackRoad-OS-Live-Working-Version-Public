"""
DigitalOcean Integration API Router

Provides integration with DigitalOcean services:
- Droplet management (create, list, monitor)
- Spaces (object storage)
- Kubernetes clusters
- Databases
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
import httpx
import os

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/digitalocean", tags=["digitalocean"])

# DigitalOcean API configuration
DO_API_URL = "https://api.digitalocean.com/v2"


def get_digital_ocean_token() -> str:
    """Return the configured DigitalOcean API key, preferring the canonical name."""

    return os.getenv("DIGITAL_OCEAN_API_KEY") or os.getenv("DIGITALOCEAN_TOKEN", "")


DO_TOKEN = get_digital_ocean_token()


class DropletCreate(BaseModel):
    name: str
    region: str = "nyc1"
    size: str = "s-1vcpu-1gb"
    image: str = "ubuntu-22-04-x64"
    ssh_keys: Optional[List[str]] = None


class SpacesCreate(BaseModel):
    name: str
    region: str = "nyc3"


@router.get("/droplets")
async def list_droplets(
    current_user: User = Depends(get_current_user)
):
    """List all droplets for the authenticated user"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(f"{DO_API_URL}/droplets", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch droplets")

        data = response.json()
        return {
            "droplets": data.get("droplets", []),
            "total": len(data.get("droplets", []))
        }


@router.post("/droplets")
async def create_droplet(
    droplet_data: DropletCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new droplet"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {DO_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "name": droplet_data.name,
            "region": droplet_data.region,
            "size": droplet_data.size,
            "image": droplet_data.image,
            "ssh_keys": droplet_data.ssh_keys or [],
            "backups": False,
            "ipv6": True,
            "monitoring": True,
            "tags": ["blackroad-os", f"user-{current_user.username}"]
        }

        response = await client.post(
            f"{DO_API_URL}/droplets",
            headers=headers,
            json=payload
        )

        if response.status_code not in [200, 201, 202]:
            raise HTTPException(status_code=response.status_code, detail="Failed to create droplet")

        return response.json()


@router.get("/droplets/{droplet_id}")
async def get_droplet(
    droplet_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get details about a specific droplet"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(
            f"{DO_API_URL}/droplets/{droplet_id}",
            headers=headers
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Droplet not found")

        return response.json()


@router.delete("/droplets/{droplet_id}")
async def delete_droplet(
    droplet_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a droplet"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.delete(
            f"{DO_API_URL}/droplets/{droplet_id}",
            headers=headers
        )

        if response.status_code not in [204, 200]:
            raise HTTPException(status_code=response.status_code, detail="Failed to delete droplet")

        return {"message": "Droplet deleted successfully"}


@router.get("/spaces")
async def list_spaces(
    current_user: User = Depends(get_current_user)
):
    """List all Spaces (object storage buckets)"""
    # Note: Spaces use S3-compatible API, not the main DO API
    # For now, return a placeholder
    return {
        "spaces": [],
        "message": "Spaces integration requires S3-compatible client configuration"
    }


@router.get("/regions")
async def list_regions(
    current_user: User = Depends(get_current_user)
):
    """List available DigitalOcean regions"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(f"{DO_API_URL}/regions", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch regions")

        data = response.json()
        return {"regions": data.get("regions", [])}


@router.get("/sizes")
async def list_sizes(
    current_user: User = Depends(get_current_user)
):
    """List available droplet sizes"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(f"{DO_API_URL}/sizes", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch sizes")

        data = response.json()
        return {"sizes": data.get("sizes", [])}


@router.get("/images")
async def list_images(
    current_user: User = Depends(get_current_user)
):
    """List available images (OS distributions)"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(
            f"{DO_API_URL}/images?type=distribution",
            headers=headers
        )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch images")

        data = response.json()
        return {"images": data.get("images", [])}


@router.get("/account")
async def get_account_info(
    current_user: User = Depends(get_current_user)
):
    """Get DigitalOcean account information"""
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {DO_TOKEN}"}
        response = await client.get(f"{DO_API_URL}/account", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch account info")

        return response.json()


@router.post("/droplets/{droplet_id}/actions/{action}")
async def perform_droplet_action(
    droplet_id: int,
    action: str,
    current_user: User = Depends(get_current_user)
):
    """
    Perform actions on a droplet
    Actions: reboot, power_cycle, shutdown, power_on, power_off, snapshot
    """
    if not DO_TOKEN:
        raise HTTPException(status_code=400, detail="DigitalOcean API token not configured")

    valid_actions = ["reboot", "power_cycle", "shutdown", "power_on", "power_off", "snapshot"]
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {', '.join(valid_actions)}")

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {DO_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {"type": action}

        response = await client.post(
            f"{DO_API_URL}/droplets/{droplet_id}/actions",
            headers=headers,
            json=payload
        )

        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to perform action: {action}")

        return response.json()
