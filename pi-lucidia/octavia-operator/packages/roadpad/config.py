"""
RoadPad Configuration.
"""

import os
import json

CONFIG_DIR = os.path.expanduser("~/.roadpad")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")

DEFAULT_CONFIG = {
    "accept_mode": 0,           # 0=manual, 1=on save, 2=always
    "tab_width": 4,
    "auto_indent": True,
    "show_line_numbers": False,
    "default_extension": ".road",
    "recent_files": [],
    "max_recent": 10,
}


def ensure_config_dir() -> None:
    """Create config directory if needed."""
    os.makedirs(CONFIG_DIR, exist_ok=True)


def load_config() -> dict:
    """Load config from disk, or return defaults."""
    ensure_config_dir()
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                user_config = json.load(f)
                return {**DEFAULT_CONFIG, **user_config}
        except (json.JSONDecodeError, IOError):
            pass
    return DEFAULT_CONFIG.copy()


def save_config(config: dict) -> bool:
    """Save config to disk."""
    ensure_config_dir()
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except IOError:
        return False


def add_recent_file(filepath: str) -> None:
    """Add file to recent files list."""
    config = load_config()
    recent = config.get("recent_files", [])

    # Remove if already present
    if filepath in recent:
        recent.remove(filepath)

    # Add to front
    recent.insert(0, filepath)

    # Trim to max
    config["recent_files"] = recent[:config.get("max_recent", 10)]
    save_config(config)
