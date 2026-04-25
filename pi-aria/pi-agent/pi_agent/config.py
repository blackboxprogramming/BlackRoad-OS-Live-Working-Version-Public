"""Configuration loader for Pi Agent."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


DEFAULT_CONFIG_PATHS = [
    Path("/etc/blackroad/pi-agent.config.json"),
    Path.home() / ".config" / "blackroad" / "pi-agent.config.json",
    Path("pi-agent.config.json"),
]


@dataclass
class OperatorConfig:
    """Operator connection settings."""
    url: str = "ws://localhost:8080/ws/agent"
    reconnect_interval: float = 5.0
    reconnect_max_attempts: int = 0  # 0 = infinite
    ping_interval: float = 30.0
    ping_timeout: float = 10.0


@dataclass
class AgentConfig:
    """Agent identity and behavior."""
    agent_id: str = ""
    agent_type: str = "pi-node"
    capabilities: List[str] = field(default_factory=lambda: ["shell", "telemetry"])
    hostname: str = ""
    tags: Dict[str, str] = field(default_factory=dict)


@dataclass
class TelemetryConfig:
    """Telemetry and heartbeat settings."""
    heartbeat_interval: float = 15.0
    metrics_interval: float = 60.0
    report_system_metrics: bool = True


@dataclass
class ExecutorConfig:
    """Task executor settings."""
    max_concurrent_tasks: int = 4
    task_timeout: float = 300.0  # 5 minutes
    allowed_commands: List[str] = field(default_factory=list)  # empty = all allowed
    blocked_commands: List[str] = field(default_factory=lambda: ["rm -rf /", "mkfs", "dd if="])


@dataclass
class LoggingConfig:
    """Logging configuration."""
    level: str = "INFO"
    file: Optional[str] = None
    format: str = "[%(asctime)s] %(levelname)s %(name)s: %(message)s"


@dataclass
class Config:
    """Root configuration object."""
    operator: OperatorConfig = field(default_factory=OperatorConfig)
    agent: AgentConfig = field(default_factory=AgentConfig)
    telemetry: TelemetryConfig = field(default_factory=TelemetryConfig)
    executor: ExecutorConfig = field(default_factory=ExecutorConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Config":
        """Create Config from dictionary."""
        operator_data = data.get("operator", {})
        agent_data = data.get("agent", {})
        telemetry_data = data.get("telemetry", {})
        executor_data = data.get("executor", {})
        logging_data = data.get("logging", {})

        return cls(
            operator=OperatorConfig(
                url=operator_data.get("url", OperatorConfig.url),
                reconnect_interval=operator_data.get("reconnect_interval", OperatorConfig.reconnect_interval),
                reconnect_max_attempts=operator_data.get("reconnect_max_attempts", OperatorConfig.reconnect_max_attempts),
                ping_interval=operator_data.get("ping_interval", OperatorConfig.ping_interval),
                ping_timeout=operator_data.get("ping_timeout", OperatorConfig.ping_timeout),
            ),
            agent=AgentConfig(
                agent_id=agent_data.get("agent_id", ""),
                agent_type=agent_data.get("agent_type", AgentConfig.agent_type),
                capabilities=agent_data.get("capabilities", ["shell", "telemetry"]),
                hostname=agent_data.get("hostname", ""),
                tags=agent_data.get("tags", {}),
            ),
            telemetry=TelemetryConfig(
                heartbeat_interval=telemetry_data.get("heartbeat_interval", TelemetryConfig.heartbeat_interval),
                metrics_interval=telemetry_data.get("metrics_interval", TelemetryConfig.metrics_interval),
                report_system_metrics=telemetry_data.get("report_system_metrics", TelemetryConfig.report_system_metrics),
            ),
            executor=ExecutorConfig(
                max_concurrent_tasks=executor_data.get("max_concurrent_tasks", ExecutorConfig.max_concurrent_tasks),
                task_timeout=executor_data.get("task_timeout", ExecutorConfig.task_timeout),
                allowed_commands=executor_data.get("allowed_commands", []),
                blocked_commands=executor_data.get("blocked_commands", ["rm -rf /", "mkfs", "dd if="]),
            ),
            logging=LoggingConfig(
                level=logging_data.get("level", LoggingConfig.level),
                file=logging_data.get("file"),
                format=logging_data.get("format", LoggingConfig.format),
            ),
        )

    @classmethod
    def load(cls, path: Optional[Path] = None) -> "Config":
        """Load configuration from file or environment."""
        # Check explicit path
        if path and path.exists():
            return cls._load_file(path)

        # Check environment variable
        env_path = os.environ.get("BLACKROAD_PI_CONFIG")
        if env_path:
            return cls._load_file(Path(env_path))

        # Check default locations
        for default_path in DEFAULT_CONFIG_PATHS:
            if default_path.exists():
                return cls._load_file(default_path)

        # Return defaults with environment overrides
        return cls._from_environment()

    @classmethod
    def _load_file(cls, path: Path) -> "Config":
        """Load config from JSON file."""
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        config = cls.from_dict(data)
        return cls._apply_environment_overrides(config)

    @classmethod
    def _from_environment(cls) -> "Config":
        """Create config from environment variables only."""
        return cls._apply_environment_overrides(cls())

    @classmethod
    def _apply_environment_overrides(cls, config: "Config") -> "Config":
        """Override config values from environment variables."""
        # Operator settings
        if url := os.environ.get("BLACKROAD_OPERATOR_URL"):
            config.operator.url = url

        # Agent settings
        if agent_id := os.environ.get("BLACKROAD_AGENT_ID"):
            config.agent.agent_id = agent_id
        if agent_type := os.environ.get("BLACKROAD_AGENT_TYPE"):
            config.agent.agent_type = agent_type
        if hostname := os.environ.get("BLACKROAD_HOSTNAME"):
            config.agent.hostname = hostname

        # Telemetry settings
        if heartbeat := os.environ.get("BLACKROAD_HEARTBEAT_INTERVAL"):
            try:
                config.telemetry.heartbeat_interval = float(heartbeat)
            except ValueError:
                pass

        # Logging
        if log_level := os.environ.get("BLACKROAD_LOG_LEVEL"):
            config.logging.level = log_level

        # Auto-generate agent_id if not set
        if not config.agent.agent_id:
            config.agent.agent_id = _generate_agent_id()

        # Auto-detect hostname if not set
        if not config.agent.hostname:
            import socket
            config.agent.hostname = socket.gethostname()

        return config


def _generate_agent_id() -> str:
    """Generate a unique agent ID from hardware."""
    import uuid
    import hashlib

    # Try to get Raspberry Pi serial
    try:
        with open("/proc/cpuinfo", "r") as f:
            for line in f:
                if line.startswith("Serial"):
                    serial = line.split(":")[1].strip()
                    return f"pi-{serial[-8:]}"
    except (FileNotFoundError, IndexError):
        pass

    # Fallback to MAC address hash
    mac = uuid.getnode()
    mac_hash = hashlib.sha256(str(mac).encode()).hexdigest()[:8]
    return f"agent-{mac_hash}"
