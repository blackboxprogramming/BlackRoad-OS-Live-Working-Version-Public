"""
RoadPad Plugin System - Extensible functionality.

Features:
- Load plugins from ~/.roadpad/plugins/
- Hook system for events
- Command registration
- Plugin manifest
"""

import os
import sys
import json
import importlib.util
from dataclasses import dataclass, field
from typing import Dict, List, Callable, Any
from datetime import datetime


@dataclass
class PluginManifest:
    """Plugin metadata."""
    name: str
    version: str = "1.0.0"
    author: str = ""
    description: str = ""
    hooks: List[str] = field(default_factory=list)
    commands: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)


@dataclass
class Plugin:
    """A loaded plugin."""
    manifest: PluginManifest
    module: Any
    enabled: bool = True
    load_time: str = field(default_factory=lambda: datetime.now().isoformat())
    error: str = ""


# Hook types
HOOK_TYPES = [
    "on_load",           # Editor loaded
    "on_quit",           # Editor quitting
    "on_buffer_open",    # Buffer opened
    "on_buffer_save",    # Buffer saved
    "on_buffer_close",   # Buffer closed
    "on_key",            # Key pressed (can intercept)
    "on_command",        # Command executed
    "on_prompt_send",    # Before prompt sent to AI
    "on_response",       # After AI response received
    "on_mode_change",    # Mode changed
    "on_render",         # Before render (can modify display)
]


class PluginManager:
    """Manages plugins."""

    def __init__(self, plugins_dir: str | None = None):
        self.plugins_dir = plugins_dir or os.path.expanduser("~/.roadpad/plugins")
        os.makedirs(self.plugins_dir, exist_ok=True)

        self.plugins: Dict[str, Plugin] = {}
        self.hooks: Dict[str, List[Callable]] = {hook: [] for hook in HOOK_TYPES}
        self.commands: Dict[str, Callable] = {}

        # Context passed to plugins
        self.context: Dict[str, Any] = {}

    def discover_plugins(self) -> List[str]:
        """Discover available plugins."""
        plugins = []
        if not os.path.exists(self.plugins_dir):
            return plugins

        for item in os.listdir(self.plugins_dir):
            path = os.path.join(self.plugins_dir, item)
            if os.path.isdir(path):
                # Package-style plugin
                if os.path.exists(os.path.join(path, "__init__.py")):
                    plugins.append(item)
                elif os.path.exists(os.path.join(path, "plugin.py")):
                    plugins.append(item)
            elif item.endswith(".py") and item != "__init__.py":
                # Single-file plugin
                plugins.append(item[:-3])

        return plugins

    def load_plugin(self, name: str) -> Plugin | None:
        """Load a plugin by name."""
        if name in self.plugins:
            return self.plugins[name]

        # Find plugin path
        plugin_path = None
        module_name = f"roadpad_plugin_{name}"

        # Check for directory plugin
        dir_path = os.path.join(self.plugins_dir, name)
        if os.path.isdir(dir_path):
            init_path = os.path.join(dir_path, "__init__.py")
            plugin_path = os.path.join(dir_path, "plugin.py")
            if os.path.exists(init_path):
                plugin_path = init_path
        else:
            # Single-file plugin
            plugin_path = os.path.join(self.plugins_dir, f"{name}.py")

        if not plugin_path or not os.path.exists(plugin_path):
            return None

        # Load manifest if exists
        manifest_path = os.path.join(os.path.dirname(plugin_path), "manifest.json")
        if os.path.exists(manifest_path):
            try:
                with open(manifest_path, "r") as f:
                    manifest_data = json.load(f)
                manifest = PluginManifest(**manifest_data)
            except:
                manifest = PluginManifest(name=name)
        else:
            manifest = PluginManifest(name=name)

        # Load module
        try:
            spec = importlib.util.spec_from_file_location(module_name, plugin_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                sys.modules[module_name] = module
                spec.loader.exec_module(module)

                plugin = Plugin(manifest=manifest, module=module)
                self.plugins[name] = plugin

                # Register hooks
                self._register_hooks(plugin)

                # Register commands
                self._register_commands(plugin)

                # Call on_load if exists
                if hasattr(module, "on_load"):
                    module.on_load(self.context)

                return plugin
        except Exception as e:
            plugin = Plugin(
                manifest=manifest,
                module=None,
                enabled=False,
                error=str(e)
            )
            self.plugins[name] = plugin
            return plugin

        return None

    def _register_hooks(self, plugin: Plugin) -> None:
        """Register plugin hooks."""
        if not plugin.module:
            return

        for hook_name in HOOK_TYPES:
            if hasattr(plugin.module, hook_name):
                handler = getattr(plugin.module, hook_name)
                if callable(handler):
                    self.hooks[hook_name].append(handler)

    def _register_commands(self, plugin: Plugin) -> None:
        """Register plugin commands."""
        if not plugin.module:
            return

        if hasattr(plugin.module, "COMMANDS"):
            commands = plugin.module.COMMANDS
            if isinstance(commands, dict):
                for cmd_name, handler in commands.items():
                    if callable(handler):
                        self.commands[cmd_name] = handler

    def unload_plugin(self, name: str) -> bool:
        """Unload a plugin."""
        if name not in self.plugins:
            return False

        plugin = self.plugins[name]

        # Call on_unload if exists
        if plugin.module and hasattr(plugin.module, "on_unload"):
            try:
                plugin.module.on_unload(self.context)
            except:
                pass

        # Remove hooks
        for hook_name in HOOK_TYPES:
            if plugin.module:
                self.hooks[hook_name] = [
                    h for h in self.hooks[hook_name]
                    if not (hasattr(h, "__module__") and h.__module__.endswith(name))
                ]

        # Remove commands
        if plugin.module and hasattr(plugin.module, "COMMANDS"):
            for cmd_name in plugin.module.COMMANDS:
                self.commands.pop(cmd_name, None)

        del self.plugins[name]
        return True

    def load_all(self) -> int:
        """Load all discovered plugins."""
        count = 0
        for name in self.discover_plugins():
            if self.load_plugin(name):
                count += 1
        return count

    def trigger_hook(self, hook_name: str, *args, **kwargs) -> List[Any]:
        """Trigger a hook and collect results."""
        results = []
        if hook_name not in self.hooks:
            return results

        for handler in self.hooks[hook_name]:
            try:
                result = handler(*args, **kwargs)
                if result is not None:
                    results.append(result)
            except Exception as e:
                # Log error but continue
                pass

        return results

    def run_command(self, name: str, *args, **kwargs) -> Any:
        """Run a plugin command."""
        if name in self.commands:
            return self.commands[name](*args, **kwargs)
        return None

    def set_context(self, key: str, value: Any) -> None:
        """Set context value for plugins."""
        self.context[key] = value

    def get_status(self) -> str:
        """Get plugin status summary."""
        enabled = sum(1 for p in self.plugins.values() if p.enabled)
        total = len(self.plugins)
        return f"Plugins: {enabled}/{total}"

    def format_list(self) -> str:
        """Format plugin list for display."""
        lines = ["Plugins", "=" * 40, ""]

        discovered = self.discover_plugins()
        loaded = set(self.plugins.keys())

        if not discovered:
            lines.append("No plugins found")
            lines.append("")
            lines.append(f"Plugin directory: {self.plugins_dir}")
            lines.append("")
            lines.append("Create a plugin:")
            lines.append("  1. Create ~/.roadpad/plugins/myplugin.py")
            lines.append("  2. Define hook functions (on_load, on_key, etc.)")
            return "\n".join(lines)

        # Loaded plugins
        lines.append("[Loaded]")
        for name, plugin in self.plugins.items():
            status = "OK" if plugin.enabled else f"ERR: {plugin.error[:30]}"
            lines.append(f"  {name} v{plugin.manifest.version} [{status}]")
            if plugin.manifest.description:
                lines.append(f"    {plugin.manifest.description}")

        # Available but not loaded
        not_loaded = set(discovered) - loaded
        if not_loaded:
            lines.append("")
            lines.append("[Available]")
            for name in sorted(not_loaded):
                lines.append(f"  {name}")

        # Hook counts
        lines.append("")
        lines.append("[Hooks]")
        for hook_name, handlers in self.hooks.items():
            if handlers:
                lines.append(f"  {hook_name}: {len(handlers)}")

        # Commands
        if self.commands:
            lines.append("")
            lines.append("[Commands]")
            for cmd in sorted(self.commands.keys()):
                lines.append(f"  :{cmd}")

        return "\n".join(lines)


# Global manager
_manager: PluginManager | None = None

def get_plugin_manager() -> PluginManager:
    """Get global plugin manager."""
    global _manager
    if _manager is None:
        _manager = PluginManager()
    return _manager


# Example plugin template
PLUGIN_TEMPLATE = '''"""
Example RoadPad plugin.

Place this in ~/.roadpad/plugins/example.py
"""

def on_load(context):
    """Called when plugin loads."""
    pass

def on_buffer_save(filepath, content):
    """Called when buffer is saved."""
    pass

def on_key(key, char):
    """Called on keypress. Return True to consume key."""
    return False

def on_prompt_send(prompt):
    """Called before prompt sent. Return modified prompt or None."""
    return prompt

# Register commands (optional)
COMMANDS = {
    "example": lambda: "Hello from example plugin!"
}
'''
