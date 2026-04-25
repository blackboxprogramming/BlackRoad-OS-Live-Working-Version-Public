"""Device management router - Raspberry Pi, Jetson, and other IoT devices."""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database import get_db
from app.models.device import Device, DeviceMetric, DeviceLog
from app.models.user import User
from app.routers.auth import get_current_user
from app.utils import utc_now

router = APIRouter(prefix="/api/devices", tags=["devices"])


# Schemas
class DeviceCreate(BaseModel):
    """Schema for creating a new device."""

    device_id: str
    name: str
    device_type: str
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class DeviceUpdate(BaseModel):
    """Schema for updating device info."""

    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class DeviceHeartbeat(BaseModel):
    """Schema for device heartbeat/status update."""

    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    os_version: Optional[str] = None
    kernel_version: Optional[str] = None
    uptime_seconds: Optional[int] = None
    cpu_model: Optional[str] = None
    cpu_cores: Optional[int] = None
    ram_total_mb: Optional[int] = None
    disk_total_gb: Optional[int] = None
    cpu_usage_percent: Optional[float] = None
    ram_usage_percent: Optional[float] = None
    disk_usage_percent: Optional[float] = None
    temperature_celsius: Optional[float] = None
    services: Optional[List[str]] = None
    capabilities: Optional[List[str]] = None


class DeviceResponse(BaseModel):
    """Schema for device response."""

    id: int
    device_id: str
    name: str
    device_type: str
    ip_address: Optional[str]
    hostname: Optional[str]
    is_online: bool
    status: str
    last_seen: Optional[datetime]
    cpu_usage_percent: Optional[float]
    ram_usage_percent: Optional[float]
    disk_usage_percent: Optional[float]
    temperature_celsius: Optional[float]
    uptime_seconds: Optional[int]
    services: List[str]
    capabilities: List[str]
    location: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DeviceStats(BaseModel):
    """Overall device statistics."""

    total_devices: int
    online_devices: int
    offline_devices: int
    total_cpu_usage: float
    total_ram_usage: float
    average_temperature: float


# Routes

@router.get("/", response_model=List[DeviceResponse])
async def list_devices(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all devices for the current user."""
    result = await db.execute(
        select(Device)
        .filter(Device.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Device.created_at.desc())
    )
    devices = result.scalars().all()

    return devices


@router.get("/stats", response_model=DeviceStats)
async def get_device_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get overall device statistics."""
    # Get counts
    total_result = await db.execute(
        select(func.count(Device.id)).filter(Device.owner_id == current_user.id)
    )
    total_devices = total_result.scalar() or 0

    online_result = await db.execute(
        select(func.count(Device.id)).filter(
            Device.owner_id == current_user.id, Device.is_online == True
        )
    )
    online_devices = online_result.scalar() or 0

    # Get average metrics for online devices
    metrics_result = await db.execute(
        select(
            func.avg(Device.cpu_usage_percent),
            func.avg(Device.ram_usage_percent),
            func.avg(Device.temperature_celsius),
        ).filter(Device.owner_id == current_user.id, Device.is_online == True)
    )
    metrics = metrics_result.first()

    return DeviceStats(
        total_devices=total_devices,
        online_devices=online_devices,
        offline_devices=total_devices - online_devices,
        total_cpu_usage=round(metrics[0] or 0.0, 2),
        total_ram_usage=round(metrics[1] or 0.0, 2),
        average_temperature=round(metrics[2] or 0.0, 2),
    )


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get device by ID."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    return device


@router.post("/", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(
    device_data: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new device."""
    # Check if device already exists
    existing = await db.execute(
        select(Device).filter(Device.device_id == device_data.device_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Device with this ID already exists"
        )

    device = Device(
        device_id=device_data.device_id,
        name=device_data.name,
        device_type=device_data.device_type,
        ip_address=device_data.ip_address,
        hostname=device_data.hostname,
        mac_address=device_data.mac_address,
        location=device_data.location,
        description=device_data.description,
        owner_id=current_user.id,
        is_online=False,
        status="offline",
        services=[],
        capabilities=[],
    )

    db.add(device)
    await db.commit()
    await db.refresh(device)

    return device


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: str,
    device_data: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update device information."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Update fields
    if device_data.name is not None:
        device.name = device_data.name
    if device_data.location is not None:
        device.location = device_data.location
    if device_data.description is not None:
        device.description = device_data.description

    device.updated_at = utc_now()

    await db.commit()
    await db.refresh(device)

    return device


@router.post("/{device_id}/heartbeat", response_model=DeviceResponse)
async def device_heartbeat(
    device_id: str,
    heartbeat_data: DeviceHeartbeat,
    db: AsyncSession = Depends(get_db),
):
    """Receive device heartbeat and update status (public endpoint for devices)."""
    result = await db.execute(
        select(Device).filter(Device.device_id == device_id)
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Update device status
    device.is_online = True
    device.status = "online"
    device.last_seen = utc_now()

    # Update system info if provided
    if heartbeat_data.ip_address:
        device.ip_address = heartbeat_data.ip_address
    if heartbeat_data.hostname:
        device.hostname = heartbeat_data.hostname
    if heartbeat_data.os_version:
        device.os_version = heartbeat_data.os_version
    if heartbeat_data.kernel_version:
        device.kernel_version = heartbeat_data.kernel_version
    if heartbeat_data.uptime_seconds is not None:
        device.uptime_seconds = heartbeat_data.uptime_seconds

    # Update hardware info
    if heartbeat_data.cpu_model:
        device.cpu_model = heartbeat_data.cpu_model
    if heartbeat_data.cpu_cores:
        device.cpu_cores = heartbeat_data.cpu_cores
    if heartbeat_data.ram_total_mb:
        device.ram_total_mb = heartbeat_data.ram_total_mb
    if heartbeat_data.disk_total_gb:
        device.disk_total_gb = heartbeat_data.disk_total_gb

    # Update current metrics
    if heartbeat_data.cpu_usage_percent is not None:
        device.cpu_usage_percent = heartbeat_data.cpu_usage_percent
    if heartbeat_data.ram_usage_percent is not None:
        device.ram_usage_percent = heartbeat_data.ram_usage_percent
    if heartbeat_data.disk_usage_percent is not None:
        device.disk_usage_percent = heartbeat_data.disk_usage_percent
    if heartbeat_data.temperature_celsius is not None:
        device.temperature_celsius = heartbeat_data.temperature_celsius

    # Update services and capabilities
    if heartbeat_data.services is not None:
        device.services = heartbeat_data.services
    if heartbeat_data.capabilities is not None:
        device.capabilities = heartbeat_data.capabilities

    # Save metric snapshot
    metric = DeviceMetric(
        device_id=device.id,
        timestamp=utc_now(),
        cpu_usage=heartbeat_data.cpu_usage_percent,
        ram_usage=heartbeat_data.ram_usage_percent,
        disk_usage=heartbeat_data.disk_usage_percent,
        temperature=heartbeat_data.temperature_celsius,
    )
    db.add(metric)

    await db.commit()
    await db.refresh(device)

    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a device."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    await db.delete(device)
    await db.commit()

    return None


# ============================================================================
# SSH & REMOTE MANAGEMENT
# ============================================================================

class SSHCommand(BaseModel):
    """Schema for executing SSH commands."""
    command: str
    timeout: Optional[int] = 30


class DeploymentConfig(BaseModel):
    """Schema for deploying code to device."""
    repository: str
    branch: str = "main"
    deploy_path: str = "/home/pi/apps"
    environment_vars: Optional[dict] = {}


@router.post("/{device_id}/ssh/connect")
async def ssh_connect(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Establish SSH connection to device (returns connection token)."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if not device.is_online:
        raise HTTPException(status_code=400, detail="Device is offline")

    if not device.ip_address:
        raise HTTPException(status_code=400, detail="Device IP address not available")

    # In production, establish actual SSH connection
    # For now, return a mock connection token
    return {
        "device_id": device_id,
        "ip_address": device.ip_address,
        "hostname": device.hostname,
        "connection_token": f"ssh_token_{device_id}_{utc_now().timestamp()}",
        "status": "connected",
        "message": f"SSH connection established to {device.hostname or device.ip_address}"
    }


@router.post("/{device_id}/ssh/execute")
async def ssh_execute_command(
    device_id: str,
    command_data: SSHCommand,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute SSH command on device."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if not device.is_online:
        raise HTTPException(status_code=400, detail="Device is offline")

    # In production, execute actual SSH command
    # For now, return mock response
    mock_outputs = {
        "uptime": "up 15 days, 3:24",
        "ls": "app.py  config.json  data/  logs/  requirements.txt",
        "whoami": "pi",
        "pwd": "/home/pi",
        "df -h": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/root        29G   12G   16G  44% /",
        "free -h": "              total        used        free      shared  buff/cache   available\nMem:           3.8Gi       1.2Gi       1.5Gi        45Mi       1.1Gi       2.4Gi",
    }

    output = mock_outputs.get(command_data.command, f"Executing: {command_data.command}\nCommand output would appear here...")

    # Log the command execution
    log = DeviceLog(
        device_id=device.id,
        level="info",
        source="ssh_command",
        message=f"Executed command: {command_data.command}",
        details={"command": command_data.command, "output": output}
    )
    db.add(log)
    await db.commit()

    return {
        "device_id": device_id,
        "command": command_data.command,
        "output": output,
        "exit_code": 0,
        "executed_at": utc_now().isoformat()
    }


@router.post("/{device_id}/deploy")
async def deploy_to_device(
    device_id: str,
    deploy_config: DeploymentConfig,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deploy code from git repository to device."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if not device.is_online:
        raise HTTPException(status_code=400, detail="Device is offline")

    # In production, execute deployment steps via SSH:
    # 1. Clone/pull repository
    # 2. Install dependencies
    # 3. Set environment variables
    # 4. Restart services
    # For now, return mock deployment status

    deployment_steps = [
        {"step": 1, "action": "Connecting to device", "status": "completed"},
        {"step": 2, "action": f"Cloning {deploy_config.repository}", "status": "completed"},
        {"step": 3, "action": f"Checking out branch {deploy_config.branch}", "status": "completed"},
        {"step": 4, "action": "Installing dependencies", "status": "completed"},
        {"step": 5, "action": "Setting environment variables", "status": "completed"},
        {"step": 6, "action": "Restarting services", "status": "completed"},
    ]

    # Log the deployment
    log = DeviceLog(
        device_id=device.id,
        level="info",
        source="deployment",
        message=f"Deployed {deploy_config.repository} ({deploy_config.branch})",
        details={
            "repository": deploy_config.repository,
            "branch": deploy_config.branch,
            "deploy_path": deploy_config.deploy_path
        }
    )
    db.add(log)
    await db.commit()

    return {
        "device_id": device_id,
        "repository": deploy_config.repository,
        "branch": deploy_config.branch,
        "deploy_path": deploy_config.deploy_path,
        "steps": deployment_steps,
        "status": "success",
        "deployed_at": utc_now().isoformat(),
        "message": "Deployment completed successfully"
    }


@router.get("/{device_id}/logs")
async def get_device_logs(
    device_id: str,
    level: Optional[str] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get device logs."""
    # First verify device ownership
    device_result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = device_result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Get logs
    query = select(DeviceLog).filter(DeviceLog.device_id == device.id)

    if level:
        query = query.filter(DeviceLog.level == level)

    query = query.order_by(DeviceLog.timestamp.desc()).limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "device_id": device_id,
        "logs": [
            {
                "id": log.id,
                "level": log.level,
                "source": log.source,
                "message": log.message,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ],
        "total": len(logs)
    }


@router.get("/{device_id}/services")
async def get_device_services(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get running services on device."""
    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # In production, query actual services via SSH
    # For now, return mock services
    return {
        "device_id": device_id,
        "services": [
            {"name": "nginx", "status": "running", "uptime": "15 days"},
            {"name": "postgresql", "status": "running", "uptime": "15 days"},
            {"name": "redis", "status": "running", "uptime": "15 days"},
            {"name": "docker", "status": "running", "uptime": "15 days"},
        ]
    }


@router.post("/{device_id}/services/{service_name}/{action}")
async def control_service(
    device_id: str,
    service_name: str,
    action: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Control a service on device (start, stop, restart)."""
    if action not in ["start", "stop", "restart", "status"]:
        raise HTTPException(status_code=400, detail="Invalid action. Must be: start, stop, restart, or status")

    result = await db.execute(
        select(Device).filter(
            Device.device_id == device_id, Device.owner_id == current_user.id
        )
    )
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    if not device.is_online:
        raise HTTPException(status_code=400, detail="Device is offline")

    # In production, execute service control via SSH
    # For now, return mock response

    # Log the action
    log = DeviceLog(
        device_id=device.id,
        level="info",
        source="service_control",
        message=f"Service {service_name}: {action}",
        details={"service": service_name, "action": action}
    )
    db.add(log)
    await db.commit()

    return {
        "device_id": device_id,
        "service": service_name,
        "action": action,
        "status": "success",
        "message": f"Service {service_name} {action} successful"
    }
