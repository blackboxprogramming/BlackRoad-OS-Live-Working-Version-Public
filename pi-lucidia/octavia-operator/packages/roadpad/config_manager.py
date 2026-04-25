"""
Config Manager - Load and save RoadPad configuration.

Handles:
- User preferences
- Default settings
- CLI flag overrides
- Environment variables
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional


DEFAULT_CONFIG = {
    "accept_mode": 0,           # 0=manual, 1=on-save, 2=always
    "tab_width": 4,             # Spaces per tab
    "auto_indent": True,        # Auto-indent new lines
    "default_extension": ".txt", # Default file extension
    "max_history": 100,         # Max command history
    "max_recent_files": 10,     # Max recent files
    "copilot_enabled": True,    # Enable Copilot integration
    "auto_save": False,         # Auto-save on edit (future)
    "theme": "default",         # Color theme (future)
}


class ConfigManager:
    """Manage RoadPad configuration."""
    
    def __init__(self, config_dir: str = None):
        self.config_dir = Path(config_dir or os.path.expanduser("~/.roadpad"))
        self.config_dir.mkdir(exist_ok=True)
        self.config_file = self.config_dir / "config.json"
        
        # Load config or create default
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load config from disk or create default."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded = json.load(f)
                    # Merge with defaults (add any new keys)
                    config = DEFAULT_CONFIG.copy()
                    config.update(loaded)
                    return config
            except Exception as e:
                print(f"Error loading config: {e}, using defaults")
        
        # Create default config file
        self.save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()
    
    def save_config(self, config: Dict[str, Any] = None) -> bool:
        """Save config to disk."""
        try:
            config_to_save = config or self.config
            with open(self.config_file, 'w') as f:
                json.dump(config_to_save, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get config value."""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set config value."""
        self.config[key] = value
    
    def update(self, updates: Dict[str, Any]) -> None:
        """Update multiple config values."""
        self.config.update(updates)
    
    def reset_to_defaults(self) -> None:
        """Reset config to defaults."""
        self.config = DEFAULT_CONFIG.copy()
        self.save_config()
    
    def apply_env_overrides(self) -> None:
        """Apply environment variable overrides."""
        # ROADPAD_ACCEPT_MODE
        if 'ROADPAD_ACCEPT_MODE' in os.environ:
            mode_map = {'manual': 0, 'on-save': 1, 'onsave': 1, 'always': 2}
            mode = os.environ['ROADPAD_ACCEPT_MODE'].lower()
            if mode in mode_map:
                self.config['accept_mode'] = mode_map[mode]
            elif mode.isdigit():
                self.config['accept_mode'] = int(mode)
        
        # ROADPAD_NO_COPILOT
        if 'ROADPAD_NO_COPILOT' in os.environ:
            self.config['copilot_enabled'] = False
        
        # ROADPAD_TAB_WIDTH
        if 'ROADPAD_TAB_WIDTH' in os.environ:
            try:
                self.config['tab_width'] = int(os.environ['ROADPAD_TAB_WIDTH'])
            except ValueError:
                pass
    
    def apply_cli_args(self, args: Dict[str, Any]) -> None:
        """Apply CLI argument overrides."""
        # Map CLI args to config keys
        if 'no_copilot' in args and args['no_copilot']:
            self.config['copilot_enabled'] = False
        
        if 'accept_mode' in args and args['accept_mode'] is not None:
            mode_map = {'manual': 0, 'on-save': 1, 'onsave': 1, 'always': 2}
            mode = args['accept_mode'].lower()
            if mode in mode_map:
                self.config['accept_mode'] = mode_map[mode]
            elif mode.isdigit():
                self.config['accept_mode'] = int(mode)
        
        if 'tab_width' in args and args['tab_width'] is not None:
            self.config['tab_width'] = args['tab_width']
    
    def get_config_info(self) -> Dict[str, Any]:
        """Get config information for display."""
        return {
            "config_file": str(self.config_file),
            "exists": self.config_file.exists(),
            "current_config": self.config.copy()
        }
