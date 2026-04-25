"""
Agent Configuration Management

Handles configuration, environment variables, and settings for agents.
"""

import json
import os
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, Optional


@dataclass
class AgentConfig:
    """Agent configuration."""
    # Execution settings
    default_timeout: int = 300
    max_retries: int = 3
    retry_delay: int = 5

    # Resource limits
    max_memory_mb: int = 512
    max_cpu_percent: int = 80

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # API settings
    api_base_url: str = "http://localhost:8000"
    api_timeout: int = 30

    # Storage
    data_dir: str = "./data/agents"
    cache_dir: str = "./cache/agents"
    cache_ttl: int = 3600

    # Security
    enable_auth: bool = True
    api_key: Optional[str] = None

    # Feature flags
    enable_telemetry: bool = True
    enable_caching: bool = True
    enable_rate_limiting: bool = True

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60

    # Orchestration
    max_concurrent_agents: int = 10
    enable_distributed_execution: bool = False

    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9090


class ConfigManager:
    """
    Manages agent configuration from multiple sources:
    - Environment variables
    - Configuration files
    - Runtime overrides

    Priority (highest to lowest):
    1. Runtime overrides
    2. Environment variables
    3. Config file
    4. Defaults
    """

    def __init__(
        self,
        config_file: Optional[Path] = None,
        env_prefix: str = "BLACKROAD_AGENT_"
    ):
        """
        Initialize configuration manager.

        Args:
            config_file: Path to config file (JSON)
            env_prefix: Prefix for environment variables
        """
        self.config_file = config_file
        self.env_prefix = env_prefix
        self._config = AgentConfig()
        self._overrides: Dict[str, Any] = {}

        self.load_config()

    def load_config(self) -> None:
        """Load configuration from all sources."""
        # 1. Load from file
        if self.config_file and self.config_file.exists():
            self._load_from_file()

        # 2. Load from environment
        self._load_from_env()

        # 3. Apply overrides
        self._apply_overrides()

    def _load_from_file(self) -> None:
        """Load configuration from JSON file."""
        try:
            with open(self.config_file, 'r') as f:
                data = json.load(f)
                for key, value in data.items():
                    if hasattr(self._config, key):
                        setattr(self._config, key, value)
        except Exception as e:
            print(f"Failed to load config file: {e}")

    def _load_from_env(self) -> None:
        """Load configuration from environment variables."""
        for key in asdict(self._config).keys():
            env_key = f"{self.env_prefix}{key.upper()}"
            if env_key in os.environ:
                value = os.environ[env_key]

                # Type conversion
                current_value = getattr(self._config, key)
                if isinstance(current_value, bool):
                    value = value.lower() in ('true', '1', 'yes')
                elif isinstance(current_value, int):
                    value = int(value)
                elif isinstance(current_value, float):
                    value = float(value)

                setattr(self._config, key, value)

    def _apply_overrides(self) -> None:
        """Apply runtime overrides."""
        for key, value in self._overrides.items():
            if hasattr(self._config, key):
                setattr(self._config, key, value)

    def set(self, key: str, value: Any) -> None:
        """
        Set a configuration value (runtime override).

        Args:
            key: Configuration key
            value: Configuration value
        """
        self._overrides[key] = value
        if hasattr(self._config, key):
            setattr(self._config, key, value)

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value.

        Args:
            key: Configuration key
            default: Default value if not found

        Returns:
            Configuration value
        """
        return getattr(self._config, key, default)

    def get_all(self) -> Dict[str, Any]:
        """Get all configuration as dictionary."""
        return asdict(self._config)

    def save_to_file(self, file_path: Path) -> None:
        """
        Save current configuration to file.

        Args:
            file_path: Path to save configuration
        """
        with open(file_path, 'w') as f:
            json.dump(asdict(self._config), f, indent=2)

    def reset(self) -> None:
        """Reset configuration to defaults."""
        self._config = AgentConfig()
        self._overrides = {}


# Global configuration instance
_global_config: Optional[ConfigManager] = None


def get_config() -> ConfigManager:
    """Get the global configuration instance."""
    global _global_config
    if _global_config is None:
        _global_config = ConfigManager()
    return _global_config


def init_config(
    config_file: Optional[Path] = None,
    **kwargs
) -> ConfigManager:
    """
    Initialize global configuration.

    Args:
        config_file: Path to configuration file
        **kwargs: Configuration overrides

    Returns:
        ConfigManager instance
    """
    global _global_config
    _global_config = ConfigManager(config_file=config_file)

    # Apply overrides
    for key, value in kwargs.items():
        _global_config.set(key, value)

    return _global_config
