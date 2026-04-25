"""Device management models for IoT/Raspberry Pi integration."""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils import utc_now


class Device(Base):
    """IoT Device model - Raspberry Pi, Jetson, etc."""

    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), unique=True, index=True, nullable=False)  # Unique device identifier
    name = Column(String(200), nullable=False)  # User-friendly name
    device_type = Column(String(50), nullable=False)  # pi5, pi400, jetson, etc.

    # Connection info
    ip_address = Column(String(45))  # IPv4 or IPv6
    hostname = Column(String(255))
    mac_address = Column(String(17))

    # Status
    is_online = Column(Boolean, default=False)
    status = Column(String(50), default="offline")  # online, offline, error, maintenance
    last_seen = Column(DateTime)

    # System info
    os_version = Column(String(100))
    kernel_version = Column(String(100))
    uptime_seconds = Column(Integer, default=0)

    # Hardware specs
    cpu_model = Column(String(200))
    cpu_cores = Column(Integer)
    ram_total_mb = Column(Integer)
    disk_total_gb = Column(Integer)

    # Current metrics
    cpu_usage_percent = Column(Float, default=0.0)
    ram_usage_percent = Column(Float, default=0.0)
    disk_usage_percent = Column(Float, default=0.0)
    temperature_celsius = Column(Float)

    # Services running
    services = Column(JSON, default=list)  # List of active services

    # Capabilities
    capabilities = Column(JSON, default=list)  # mining, sensor, camera, etc.

    # Metadata
    location = Column(String(200))  # Physical location
    description = Column(Text)
    tags = Column(JSON, default=list)

    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="devices")

    # Timestamps
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relations
    metrics = relationship("DeviceMetric", back_populates="device", cascade="all, delete-orphan")
    logs = relationship("DeviceLog", back_populates="device", cascade="all, delete-orphan")


class DeviceMetric(Base):
    """Time-series metrics for devices."""

    __tablename__ = "device_metrics"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)

    # Metric data
    timestamp = Column(DateTime, default=utc_now, index=True)
    cpu_usage = Column(Float)
    ram_usage = Column(Float)
    disk_usage = Column(Float)
    temperature = Column(Float)
    network_bytes_sent = Column(Integer)
    network_bytes_received = Column(Integer)

    # Custom metrics (JSON for flexibility)
    custom_data = Column(JSON, default=dict)

    # Relationship
    device = relationship("Device", back_populates="metrics")


class DeviceLog(Base):
    """Device event logs."""

    __tablename__ = "device_logs"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)

    # Log data
    timestamp = Column(DateTime, default=utc_now, index=True)
    level = Column(String(20), nullable=False)  # info, warning, error, critical
    category = Column(String(50))  # system, network, service, hardware
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)

    # Relationship
    device = relationship("Device", back_populates="logs")
