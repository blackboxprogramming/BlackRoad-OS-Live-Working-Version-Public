# PLUGINS.md - Plugin System Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Extend agent capabilities with a powerful plugin architecture.

---

## Table of Contents

1. [Overview](#overview)
2. [Plugin Architecture](#plugin-architecture)
3. [Creating Plugins](#creating-plugins)
4. [Plugin Types](#plugin-types)
5. [Plugin Lifecycle](#plugin-lifecycle)
6. [Plugin API](#plugin-api)
7. [Plugin Registry](#plugin-registry)
8. [Security](#security)
9. [Testing Plugins](#testing-plugins)
10. [Distribution](#distribution)
11. [Examples](#examples)

---

## Overview

### Why Plugins?

BlackRoad OS uses a plugin system to:

| Benefit | Description |
|---------|-------------|
| **Extensibility** | Add new capabilities without core changes |
| **Modularity** | Install only what you need |
| **Community** | Share and reuse functionality |
| **Isolation** | Plugins run in sandboxed environments |
| **Hot-reload** | Update plugins without restarts |

### Plugin Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                   BlackRoad Plugin Ecosystem                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Plugin Registry                         │  │
│  │    plugins.blackroad.io - 500+ community plugins          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│       ┌──────────────────────┼──────────────────────┐           │
│       │                      │                      │           │
│  ┌────▼────┐           ┌─────▼─────┐          ┌────▼────┐      │
│  │  Core   │           │  Tools    │          │  Agent  │      │
│  │ Plugins │           │  Plugins  │          │ Plugins │      │
│  └────┬────┘           └─────┬─────┘          └────┬────┘      │
│       │                      │                     │            │
│  ┌────▼────────────────────▼─────────────────────▼────┐        │
│  │                  Plugin Manager                      │        │
│  │    Load → Validate → Initialize → Monitor → Unload  │        │
│  └──────────────────────────┬───────────────────────────┘        │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────┐       │
│  │                   Agent Runtime                        │       │
│  │  LUCIDIA  │  ALICE  │  OCTAVIA  │  PRISM  │  ECHO    │       │
│  └────────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Plugin Architecture

### Plugin Structure

```
my-plugin/
├── plugin.yaml           # Plugin manifest
├── src/
│   ├── __init__.py      # Plugin entry point
│   ├── main.py          # Main plugin code
│   ├── handlers.py      # Event handlers
│   └── utils.py         # Utilities
├── tests/
│   ├── test_main.py
│   └── fixtures/
├── assets/
│   ├── icon.png
│   └── schema.json
├── docs/
│   └── README.md
├── requirements.txt
└── LICENSE
```

### Plugin Manifest

```yaml
# plugin.yaml
name: my-awesome-plugin
version: 1.2.0
description: "An awesome plugin that does amazing things"
author: "Your Name <you@example.com>"
license: MIT
homepage: https://github.com/you/my-awesome-plugin

# Plugin metadata
category: tools
tags:
  - productivity
  - automation
  - utilities

# Compatibility
blackroad:
  min_version: "2.0.0"
  max_version: "3.0.0"

# Dependencies
dependencies:
  - name: httpx
    version: ">=0.24.0"
  - name: pydantic
    version: ">=2.0.0"

# Plugin dependencies
plugin_dependencies:
  - name: core-utils
    version: ">=1.0.0"

# Entry point
entry_point: src.main:MyAwesomePlugin

# Permissions required
permissions:
  - network          # HTTP requests
  - filesystem:read  # Read files
  - secrets:read     # Read secrets
  - agents:spawn     # Spawn sub-agents

# Configuration schema
config_schema:
  type: object
  properties:
    api_key:
      type: string
      description: "API key for external service"
      secret: true
    max_retries:
      type: integer
      default: 3
      minimum: 1
      maximum: 10
  required:
    - api_key

# Hooks
hooks:
  on_install: src.hooks:on_install
  on_uninstall: src.hooks:on_uninstall
  on_enable: src.hooks:on_enable
  on_disable: src.hooks:on_disable

# Exported tools
tools:
  - name: awesome_search
    description: "Search for awesome things"
    handler: src.tools:awesome_search
  - name: awesome_process
    description: "Process awesome data"
    handler: src.tools:awesome_process
```

### Base Plugin Class

```python
# src/main.py
from blackroad.plugins import Plugin, PluginContext, PluginConfig
from blackroad.plugins.decorators import tool, event_handler, scheduled
from typing import Any, Dict

class MyAwesomePlugin(Plugin):
    """An awesome plugin implementation."""

    name = "my-awesome-plugin"
    version = "1.2.0"

    def __init__(self, context: PluginContext, config: PluginConfig):
        super().__init__(context, config)
        self.api_key = config.get("api_key")
        self.max_retries = config.get("max_retries", 3)

    async def initialize(self):
        """Called when plugin is loaded."""
        self.logger.info(f"Initializing {self.name} v{self.version}")

        # Setup resources
        self.client = await self.create_http_client()

        # Register event handlers
        self.register_handler("task.created", self.on_task_created)

    async def shutdown(self):
        """Called when plugin is unloaded."""
        self.logger.info(f"Shutting down {self.name}")
        await self.client.aclose()

    @tool(
        name="awesome_search",
        description="Search for awesome things",
        parameters={
            "query": {"type": "string", "description": "Search query"},
            "limit": {"type": "integer", "default": 10}
        }
    )
    async def awesome_search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Tool exposed to agents."""
        response = await self.client.get(
            "https://api.awesome.io/search",
            params={"q": query, "limit": limit},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()

    @event_handler("task.created")
    async def on_task_created(self, event: Dict[str, Any]):
        """Handle task creation events."""
        task_id = event["data"]["task_id"]
        self.logger.info(f"New task created: {task_id}")

    @scheduled(cron="0 * * * *")  # Every hour
    async def hourly_sync(self):
        """Scheduled task."""
        await self.sync_data()
```

---

## Plugin Types

### Tool Plugins

```python
# plugins/web-scraper/src/main.py
from blackroad.plugins import ToolPlugin
from blackroad.plugins.decorators import tool
import httpx
from bs4 import BeautifulSoup

class WebScraperPlugin(ToolPlugin):
    """Web scraping tools for agents."""

    name = "web-scraper"
    version = "1.0.0"

    @tool(
        name="scrape_page",
        description="Scrape content from a web page",
        parameters={
            "url": {"type": "string", "format": "uri"},
            "selector": {"type": "string", "description": "CSS selector"}
        }
    )
    async def scrape_page(self, url: str, selector: str = None) -> dict:
        """Scrape a web page."""
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')

            if selector:
                elements = soup.select(selector)
                return {"content": [el.get_text() for el in elements]}

            return {"content": soup.get_text()}

    @tool(
        name="extract_links",
        description="Extract all links from a page"
    )
    async def extract_links(self, url: str) -> dict:
        """Extract links from a page."""
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            links = [a.get('href') for a in soup.find_all('a', href=True)]
            return {"links": links}
```

### Agent Plugins

```python
# plugins/code-reviewer/src/main.py
from blackroad.plugins import AgentPlugin
from blackroad.agents import AgentCapability

class CodeReviewerPlugin(AgentPlugin):
    """Adds code review capabilities to agents."""

    name = "code-reviewer"
    version = "2.0.0"

    capabilities = [
        AgentCapability.CODE_ANALYSIS,
        AgentCapability.SECURITY_SCAN,
        AgentCapability.STYLE_CHECK
    ]

    async def analyze_code(self, code: str, language: str) -> dict:
        """Analyze code for issues."""
        issues = []

        # Security analysis
        security_issues = await self.security_scan(code, language)
        issues.extend(security_issues)

        # Style check
        style_issues = await self.style_check(code, language)
        issues.extend(style_issues)

        # Complexity analysis
        complexity = await self.complexity_analysis(code, language)

        return {
            "issues": issues,
            "complexity": complexity,
            "score": self.calculate_score(issues, complexity)
        }

    async def security_scan(self, code: str, language: str) -> list:
        """Scan for security vulnerabilities."""
        # Use LUCIDIA for deep analysis
        result = await self.context.invoke_agent(
            "LUCIDIA",
            task="security_analysis",
            data={"code": code, "language": language}
        )
        return result.get("vulnerabilities", [])
```

### Integration Plugins

```python
# plugins/slack-integration/src/main.py
from blackroad.plugins import IntegrationPlugin
from blackroad.plugins.decorators import webhook, command
from slack_sdk.web.async_client import AsyncWebClient

class SlackIntegrationPlugin(IntegrationPlugin):
    """Slack integration for BlackRoad OS."""

    name = "slack-integration"
    version = "1.5.0"

    async def initialize(self):
        self.slack = AsyncWebClient(token=self.config.get("bot_token"))
        self.signing_secret = self.config.get("signing_secret")

    @webhook(path="/slack/events")
    async def handle_slack_event(self, request):
        """Handle incoming Slack events."""
        event = request.json()

        if event.get("type") == "url_verification":
            return {"challenge": event["challenge"]}

        if event.get("type") == "event_callback":
            await self.process_event(event["event"])

        return {"ok": True}

    @command(name="ask", description="Ask BlackRoad a question")
    async def ask_command(self, text: str, channel: str, user: str):
        """Handle /ask slash command."""
        # Create task for agent
        task = await self.context.create_task(
            title=f"Slack question from {user}",
            description=text,
            metadata={"channel": channel, "user": user}
        )

        # Subscribe to task completion
        await self.context.subscribe(
            f"task.{task.id}.completed",
            lambda e: self.send_response(channel, e["data"]["result"])
        )

        return {"response_type": "ephemeral", "text": "Processing your question..."}

    async def send_response(self, channel: str, message: str):
        """Send response to Slack channel."""
        await self.slack.chat_postMessage(
            channel=channel,
            text=message,
            blocks=[
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": message}
                }
            ]
        )
```

### Storage Plugins

```python
# plugins/vector-store/src/main.py
from blackroad.plugins import StoragePlugin
from blackroad.plugins.decorators import storage_backend
import numpy as np

class VectorStorePlugin(StoragePlugin):
    """Vector storage for semantic search."""

    name = "vector-store"
    version = "1.0.0"

    async def initialize(self):
        self.index = await self.load_or_create_index()

    @storage_backend(name="vectors")
    async def store_vector(
        self,
        id: str,
        vector: list[float],
        metadata: dict = None
    ):
        """Store a vector with metadata."""
        await self.index.add(
            id=id,
            vector=np.array(vector),
            metadata=metadata or {}
        )

    @storage_backend(name="vectors")
    async def search_vectors(
        self,
        query_vector: list[float],
        top_k: int = 10,
        filter: dict = None
    ) -> list:
        """Search for similar vectors."""
        results = await self.index.search(
            vector=np.array(query_vector),
            top_k=top_k,
            filter=filter
        )
        return [
            {"id": r.id, "score": r.score, "metadata": r.metadata}
            for r in results
        ]
```

---

## Plugin Lifecycle

### Lifecycle Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                    Plugin Lifecycle                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ INSTALL  │───▶│  LOAD    │───▶│  INIT    │───▶│  READY   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │          │
│       │               │               │               │          │
│       ▼               ▼               ▼               ▼          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Download │    │ Validate │    │ Setup    │    │ Running  │  │
│  │ Deps     │    │ Manifest │    │ Resources│    │ Handling │  │
│  │ Verify   │    │ Perms    │    │ Register │    │ Events   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│       ┌──────────────────────────────────────────┐              │
│       │                                          │              │
│       ▼                                          ▼              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │ DISABLE  │◀──▶│  ERROR   │    │ UNINSTALL│                  │
│  └──────────┘    └──────────┘    └──────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Lifecycle Hooks

```python
# blackroad/plugins/hooks.py
from typing import Protocol

class PluginHooks(Protocol):
    """Plugin lifecycle hooks."""

    async def on_install(self, context: PluginContext):
        """Called after plugin is installed."""
        pass

    async def on_uninstall(self, context: PluginContext):
        """Called before plugin is uninstalled."""
        pass

    async def on_enable(self, context: PluginContext):
        """Called when plugin is enabled."""
        pass

    async def on_disable(self, context: PluginContext):
        """Called when plugin is disabled."""
        pass

    async def on_upgrade(self, context: PluginContext, from_version: str):
        """Called when plugin is upgraded."""
        pass

    async def on_config_change(self, context: PluginContext, changes: dict):
        """Called when plugin configuration changes."""
        pass


# Example implementation
class MyPluginHooks:
    async def on_install(self, context: PluginContext):
        """Setup database tables on install."""
        await context.db.execute("""
            CREATE TABLE IF NOT EXISTS my_plugin_data (
                id TEXT PRIMARY KEY,
                data JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        context.logger.info("Database tables created")

    async def on_uninstall(self, context: PluginContext):
        """Cleanup on uninstall."""
        # Optionally remove data
        if context.config.get("cleanup_on_uninstall", False):
            await context.db.execute("DROP TABLE IF EXISTS my_plugin_data")
        context.logger.info("Plugin cleanup complete")

    async def on_upgrade(self, context: PluginContext, from_version: str):
        """Handle version migrations."""
        if from_version < "2.0.0":
            # Migrate from v1 to v2
            await context.db.execute("""
                ALTER TABLE my_plugin_data
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
            """)
        context.logger.info(f"Migrated from {from_version}")
```

---

## Plugin API

### Context API

```python
# blackroad/plugins/context.py
from dataclasses import dataclass
from typing import Any, Callable

@dataclass
class PluginContext:
    """Context provided to plugins."""

    # Plugin identification
    plugin_id: str
    plugin_name: str
    plugin_version: str

    # Logging
    logger: Logger

    # Database access
    db: Database

    # Secret access
    secrets: SecretsManager

    # Event bus
    events: EventBus

    # Agent interaction
    agents: AgentManager

    # Task management
    tasks: TaskManager

    # HTTP client factory
    http: HttpClientFactory

    # Storage
    storage: StorageManager

    # Configuration
    config: PluginConfig

    async def create_http_client(self, **kwargs) -> httpx.AsyncClient:
        """Create configured HTTP client."""
        return await self.http.create_client(
            plugin_id=self.plugin_id,
            **kwargs
        )

    async def invoke_agent(
        self,
        agent_type: str,
        task: str,
        data: dict = None
    ) -> dict:
        """Invoke an agent to perform a task."""
        return await self.agents.invoke(
            agent_type=agent_type,
            task=task,
            data=data,
            requester=f"plugin:{self.plugin_id}"
        )

    async def create_task(
        self,
        title: str,
        description: str,
        **kwargs
    ) -> Task:
        """Create a new task."""
        return await self.tasks.create(
            title=title,
            description=description,
            source=f"plugin:{self.plugin_id}",
            **kwargs
        )

    async def emit_event(self, event_type: str, data: dict):
        """Emit an event."""
        await self.events.publish(Event(
            type=f"plugin.{self.plugin_id}.{event_type}",
            source=f"plugin:{self.plugin_id}",
            data=data
        ))

    async def subscribe(self, event_pattern: str, handler: Callable):
        """Subscribe to events."""
        await self.events.subscribe(event_pattern, handler)

    async def get_secret(self, key: str) -> str:
        """Get a secret value."""
        return await self.secrets.get(
            path=f"plugins/{self.plugin_id}/{key}"
        )

    async def store_data(self, key: str, value: Any):
        """Store plugin data."""
        await self.storage.put(
            bucket=f"plugins/{self.plugin_id}",
            key=key,
            value=value
        )

    async def get_data(self, key: str) -> Any:
        """Retrieve plugin data."""
        return await self.storage.get(
            bucket=f"plugins/{self.plugin_id}",
            key=key
        )
```

### Decorators

```python
# blackroad/plugins/decorators.py
from functools import wraps
from typing import Callable, Dict, Any

def tool(
    name: str,
    description: str,
    parameters: Dict[str, Any] = None
):
    """Decorator to expose a method as a tool."""
    def decorator(func: Callable):
        func._tool_metadata = {
            "name": name,
            "description": description,
            "parameters": parameters or {}
        }

        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            return await func(self, *args, **kwargs)

        return wrapper
    return decorator


def event_handler(event_pattern: str):
    """Decorator to register an event handler."""
    def decorator(func: Callable):
        func._event_handler = event_pattern

        @wraps(func)
        async def wrapper(self, event):
            return await func(self, event)

        return wrapper
    return decorator


def scheduled(
    cron: str = None,
    interval: str = None,
    run_on_start: bool = False
):
    """Decorator for scheduled tasks."""
    def decorator(func: Callable):
        func._schedule = {
            "cron": cron,
            "interval": interval,
            "run_on_start": run_on_start
        }

        @wraps(func)
        async def wrapper(self):
            return await func(self)

        return wrapper
    return decorator


def webhook(path: str, methods: list = None):
    """Decorator to register a webhook endpoint."""
    def decorator(func: Callable):
        func._webhook = {
            "path": path,
            "methods": methods or ["POST"]
        }

        @wraps(func)
        async def wrapper(self, request):
            return await func(self, request)

        return wrapper
    return decorator


def command(name: str, description: str = ""):
    """Decorator to register a CLI command."""
    def decorator(func: Callable):
        func._command = {
            "name": name,
            "description": description
        }

        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            return await func(self, *args, **kwargs)

        return wrapper
    return decorator
```

---

## Plugin Registry

### Installing Plugins

```bash
# Install from registry
blackroad plugin install web-scraper
blackroad plugin install slack-integration@2.0.0

# Install from Git
blackroad plugin install github:user/my-plugin

# Install from local path
blackroad plugin install ./my-local-plugin

# Install with config
blackroad plugin install slack-integration \
  --config bot_token=xoxb-xxx \
  --config signing_secret=xxx
```

### Managing Plugins

```bash
# List installed plugins
blackroad plugin list

# NAME               VERSION   STATUS    DESCRIPTION
# web-scraper        1.0.0     enabled   Web scraping tools
# slack-integration  2.0.0     enabled   Slack integration
# code-reviewer      1.5.0     disabled  Code review tools

# Enable/disable
blackroad plugin enable code-reviewer
blackroad plugin disable slack-integration

# Update
blackroad plugin update web-scraper
blackroad plugin update --all

# Uninstall
blackroad plugin uninstall code-reviewer

# Show details
blackroad plugin info web-scraper

# View logs
blackroad plugin logs web-scraper --tail 100
```

### Registry API

```python
# blackroad/plugins/registry.py
import httpx
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class PluginInfo:
    name: str
    version: str
    description: str
    author: str
    downloads: int
    rating: float
    tags: List[str]

class PluginRegistry:
    """Plugin registry client."""

    def __init__(self, registry_url: str = "https://plugins.blackroad.io"):
        self.url = registry_url
        self.client = httpx.AsyncClient()

    async def search(
        self,
        query: str = "",
        category: str = None,
        tags: List[str] = None
    ) -> List[PluginInfo]:
        """Search for plugins."""
        params = {"q": query}
        if category:
            params["category"] = category
        if tags:
            params["tags"] = ",".join(tags)

        response = await self.client.get(f"{self.url}/api/plugins", params=params)
        return [PluginInfo(**p) for p in response.json()["plugins"]]

    async def get_plugin(self, name: str, version: str = "latest") -> dict:
        """Get plugin details."""
        response = await self.client.get(f"{self.url}/api/plugins/{name}/{version}")
        return response.json()

    async def download(self, name: str, version: str = "latest") -> bytes:
        """Download plugin package."""
        response = await self.client.get(
            f"{self.url}/api/plugins/{name}/{version}/download"
        )
        return response.content

    async def publish(self, package_path: str, token: str):
        """Publish a plugin to the registry."""
        with open(package_path, "rb") as f:
            response = await self.client.post(
                f"{self.url}/api/plugins",
                files={"package": f},
                headers={"Authorization": f"Bearer {token}"}
            )
        return response.json()
```

---

## Security

### Permission System

```python
# blackroad/plugins/permissions.py
from enum import Enum
from typing import Set

class Permission(Enum):
    """Plugin permissions."""

    # Network
    NETWORK = "network"
    NETWORK_EXTERNAL = "network:external"

    # Filesystem
    FILESYSTEM_READ = "filesystem:read"
    FILESYSTEM_WRITE = "filesystem:write"

    # Secrets
    SECRETS_READ = "secrets:read"
    SECRETS_WRITE = "secrets:write"

    # Agents
    AGENTS_INVOKE = "agents:invoke"
    AGENTS_SPAWN = "agents:spawn"
    AGENTS_MANAGE = "agents:manage"

    # Tasks
    TASKS_CREATE = "tasks:create"
    TASKS_MANAGE = "tasks:manage"

    # System
    SYSTEM_INFO = "system:info"
    SYSTEM_CONFIG = "system:config"


class PermissionChecker:
    """Check plugin permissions."""

    def __init__(self, granted: Set[Permission]):
        self.granted = granted

    def check(self, required: Permission) -> bool:
        """Check if permission is granted."""
        return required in self.granted

    def require(self, permission: Permission):
        """Require a permission or raise error."""
        if not self.check(permission):
            raise PermissionDeniedError(
                f"Plugin requires permission: {permission.value}"
            )


# Usage in plugin
class MyPlugin(Plugin):
    async def do_network_request(self):
        self.permissions.require(Permission.NETWORK)
        # Proceed with request
```

### Sandboxing

```python
# blackroad/plugins/sandbox.py
import asyncio
from typing import Any, Callable
import resource
import os

class PluginSandbox:
    """Sandbox for plugin execution."""

    def __init__(
        self,
        max_memory_mb: int = 512,
        max_cpu_percent: int = 50,
        max_execution_time: int = 300,
        allowed_imports: set = None
    ):
        self.max_memory = max_memory_mb * 1024 * 1024
        self.max_cpu = max_cpu_percent
        self.max_time = max_execution_time
        self.allowed_imports = allowed_imports or set()

    def apply_limits(self):
        """Apply resource limits."""
        # Memory limit
        resource.setrlimit(
            resource.RLIMIT_AS,
            (self.max_memory, self.max_memory)
        )

        # CPU time limit
        resource.setrlimit(
            resource.RLIMIT_CPU,
            (self.max_time, self.max_time)
        )

    async def run(self, func: Callable, *args, **kwargs) -> Any:
        """Run function in sandbox."""
        try:
            return await asyncio.wait_for(
                func(*args, **kwargs),
                timeout=self.max_time
            )
        except asyncio.TimeoutError:
            raise PluginTimeoutError(
                f"Plugin execution exceeded {self.max_time}s limit"
            )
        except MemoryError:
            raise PluginMemoryError(
                f"Plugin exceeded {self.max_memory // (1024*1024)}MB memory limit"
            )
```

### Code Signing

```python
# blackroad/plugins/signing.py
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
import base64

class PluginSigner:
    """Sign and verify plugin packages."""

    def __init__(self, private_key_path: str = None, public_key_path: str = None):
        if private_key_path:
            with open(private_key_path, "rb") as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(), password=None
                )
        if public_key_path:
            with open(public_key_path, "rb") as f:
                self.public_key = serialization.load_pem_public_key(f.read())

    def sign(self, package_data: bytes) -> str:
        """Sign a plugin package."""
        signature = self.private_key.sign(
            package_data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode()

    def verify(self, package_data: bytes, signature: str) -> bool:
        """Verify plugin signature."""
        try:
            self.public_key.verify(
                base64.b64decode(signature),
                package_data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
```

---

## Testing Plugins

### Test Framework

```python
# tests/test_my_plugin.py
import pytest
from blackroad.plugins.testing import PluginTestCase, MockContext

class TestMyAwesomePlugin(PluginTestCase):
    """Tests for MyAwesomePlugin."""

    plugin_class = MyAwesomePlugin
    default_config = {"api_key": "test-key", "max_retries": 3}

    @pytest.fixture
    async def plugin(self):
        """Create plugin instance for testing."""
        context = MockContext(
            plugin_id="test-plugin",
            plugin_name="my-awesome-plugin"
        )
        plugin = self.plugin_class(context, self.default_config)
        await plugin.initialize()
        yield plugin
        await plugin.shutdown()

    async def test_awesome_search(self, plugin, httpx_mock):
        """Test awesome_search tool."""
        # Mock API response
        httpx_mock.add_response(
            url="https://api.awesome.io/search",
            json={"results": [{"id": 1, "name": "Result 1"}]}
        )

        # Call tool
        result = await plugin.awesome_search(query="test", limit=5)

        # Verify
        assert "results" in result
        assert len(result["results"]) == 1

    async def test_event_handler(self, plugin):
        """Test event handler."""
        event = {
            "type": "task.created",
            "data": {"task_id": "task-123"}
        }

        # Should not raise
        await plugin.on_task_created(event)

        # Verify logging
        assert "task-123" in plugin.context.logger.messages[-1]

    async def test_scheduled_task(self, plugin):
        """Test scheduled task execution."""
        await plugin.hourly_sync()
        # Verify side effects
```

### Mock Context

```python
# blackroad/plugins/testing.py
from dataclasses import dataclass, field
from typing import Any, Dict, List
from unittest.mock import AsyncMock

@dataclass
class MockLogger:
    messages: List[str] = field(default_factory=list)

    def info(self, msg): self.messages.append(f"INFO: {msg}")
    def warning(self, msg): self.messages.append(f"WARN: {msg}")
    def error(self, msg): self.messages.append(f"ERROR: {msg}")
    def debug(self, msg): self.messages.append(f"DEBUG: {msg}")

@dataclass
class MockContext:
    plugin_id: str
    plugin_name: str
    plugin_version: str = "1.0.0"
    logger: MockLogger = field(default_factory=MockLogger)
    db: AsyncMock = field(default_factory=AsyncMock)
    secrets: AsyncMock = field(default_factory=AsyncMock)
    events: AsyncMock = field(default_factory=AsyncMock)
    agents: AsyncMock = field(default_factory=AsyncMock)
    tasks: AsyncMock = field(default_factory=AsyncMock)
    storage: AsyncMock = field(default_factory=AsyncMock)
    _stored_data: Dict[str, Any] = field(default_factory=dict)

    async def create_http_client(self, **kwargs):
        import httpx
        return httpx.AsyncClient(**kwargs)

    async def store_data(self, key: str, value: Any):
        self._stored_data[key] = value

    async def get_data(self, key: str) -> Any:
        return self._stored_data.get(key)
```

---

## Distribution

### Packaging

```bash
# Package plugin for distribution
blackroad plugin pack ./my-plugin

# Creates: my-plugin-1.2.0.brpkg
# Contents:
#   - plugin.yaml
#   - src/
#   - assets/
#   - LICENSE
#   - signature
```

### Publishing

```bash
# Login to registry
blackroad plugin login

# Publish to registry
blackroad plugin publish ./my-plugin-1.2.0.brpkg

# Publish as pre-release
blackroad plugin publish ./my-plugin-1.3.0-beta.brpkg --prerelease
```

### Versioning

```yaml
# Semantic versioning
# MAJOR.MINOR.PATCH

# Breaking changes: 1.0.0 -> 2.0.0
# New features: 1.0.0 -> 1.1.0
# Bug fixes: 1.0.0 -> 1.0.1

# Pre-release tags
# 1.0.0-alpha
# 1.0.0-beta
# 1.0.0-rc.1
```

---

## Examples

### Complete Plugin Example

```python
# plugins/github-integration/src/main.py
"""
GitHub Integration Plugin for BlackRoad OS

Provides tools for interacting with GitHub repositories.
"""

from blackroad.plugins import Plugin, PluginContext, PluginConfig
from blackroad.plugins.decorators import tool, event_handler, webhook
from typing import Dict, Any, List
import httpx

class GitHubPlugin(Plugin):
    """GitHub integration plugin."""

    name = "github-integration"
    version = "2.0.0"

    def __init__(self, context: PluginContext, config: PluginConfig):
        super().__init__(context, config)
        self.token = config.get("github_token")
        self.webhook_secret = config.get("webhook_secret")
        self.base_url = "https://api.github.com"

    async def initialize(self):
        """Initialize GitHub client."""
        self.client = await self.context.create_http_client(
            headers={
                "Authorization": f"token {self.token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        self.logger.info("GitHub integration initialized")

    async def shutdown(self):
        """Cleanup."""
        await self.client.aclose()

    @tool(
        name="github_list_repos",
        description="List repositories for a user or organization",
        parameters={
            "owner": {"type": "string", "description": "Username or org name"},
            "type": {"type": "string", "enum": ["all", "public", "private"]}
        }
    )
    async def list_repos(self, owner: str, type: str = "all") -> List[Dict]:
        """List GitHub repositories."""
        response = await self.client.get(
            f"{self.base_url}/users/{owner}/repos",
            params={"type": type, "per_page": 100}
        )
        return response.json()

    @tool(
        name="github_create_issue",
        description="Create an issue in a repository",
        parameters={
            "owner": {"type": "string"},
            "repo": {"type": "string"},
            "title": {"type": "string"},
            "body": {"type": "string"}
        }
    )
    async def create_issue(
        self,
        owner: str,
        repo: str,
        title: str,
        body: str = ""
    ) -> Dict:
        """Create a GitHub issue."""
        response = await self.client.post(
            f"{self.base_url}/repos/{owner}/{repo}/issues",
            json={"title": title, "body": body}
        )
        return response.json()

    @tool(
        name="github_create_pr",
        description="Create a pull request",
        parameters={
            "owner": {"type": "string"},
            "repo": {"type": "string"},
            "title": {"type": "string"},
            "head": {"type": "string"},
            "base": {"type": "string"},
            "body": {"type": "string"}
        }
    )
    async def create_pull_request(
        self,
        owner: str,
        repo: str,
        title: str,
        head: str,
        base: str = "main",
        body: str = ""
    ) -> Dict:
        """Create a pull request."""
        response = await self.client.post(
            f"{self.base_url}/repos/{owner}/{repo}/pulls",
            json={
                "title": title,
                "head": head,
                "base": base,
                "body": body
            }
        )
        return response.json()

    @webhook(path="/github/webhook", methods=["POST"])
    async def handle_webhook(self, request) -> Dict:
        """Handle GitHub webhooks."""
        import hmac
        import hashlib

        # Verify signature
        signature = request.headers.get("X-Hub-Signature-256", "")
        body = await request.body()

        expected = "sha256=" + hmac.new(
            self.webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            return {"error": "Invalid signature"}, 401

        # Process event
        event_type = request.headers.get("X-GitHub-Event")
        payload = await request.json()

        await self.process_github_event(event_type, payload)
        return {"ok": True}

    async def process_github_event(self, event_type: str, payload: Dict):
        """Process GitHub webhook events."""
        if event_type == "push":
            await self.on_push(payload)
        elif event_type == "pull_request":
            await self.on_pull_request(payload)
        elif event_type == "issues":
            await self.on_issue(payload)

    async def on_push(self, payload: Dict):
        """Handle push events."""
        repo = payload["repository"]["full_name"]
        branch = payload["ref"].split("/")[-1]
        commits = payload["commits"]

        self.logger.info(f"Push to {repo}/{branch}: {len(commits)} commits")

        # Emit event for other plugins/agents
        await self.context.emit_event("push", {
            "repo": repo,
            "branch": branch,
            "commits": commits
        })

    async def on_pull_request(self, payload: Dict):
        """Handle pull request events."""
        action = payload["action"]
        pr = payload["pull_request"]

        if action == "opened":
            # Trigger code review
            await self.context.create_task(
                title=f"Review PR: {pr['title']}",
                description=pr["body"],
                metadata={
                    "type": "code_review",
                    "pr_url": pr["html_url"],
                    "pr_number": pr["number"]
                }
            )

    async def on_issue(self, payload: Dict):
        """Handle issue events."""
        action = payload["action"]
        issue = payload["issue"]

        if action == "opened":
            # Auto-label issues
            labels = await self.classify_issue(issue["title"], issue["body"])
            if labels:
                await self.client.post(
                    issue["labels_url"].replace("{/name}", ""),
                    json=labels
                )

    async def classify_issue(self, title: str, body: str) -> List[str]:
        """Use AI to classify issue."""
        result = await self.context.invoke_agent(
            "LUCIDIA",
            task="classify_issue",
            data={"title": title, "body": body}
        )
        return result.get("labels", [])
```

---

## Quick Reference

### CLI Commands

```bash
# Install
blackroad plugin install <name>
blackroad plugin install <name>@<version>
blackroad plugin install github:<user>/<repo>

# Manage
blackroad plugin list
blackroad plugin info <name>
blackroad plugin enable <name>
blackroad plugin disable <name>
blackroad plugin update <name>
blackroad plugin uninstall <name>

# Development
blackroad plugin create <name>
blackroad plugin pack <path>
blackroad plugin publish <path>
blackroad plugin test <path>
```

### Plugin Manifest Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Plugin identifier |
| `version` | Yes | Semantic version |
| `description` | Yes | Short description |
| `author` | Yes | Author email |
| `entry_point` | Yes | Main class path |
| `permissions` | No | Required permissions |
| `dependencies` | No | Python dependencies |
| `config_schema` | No | Configuration schema |
| `tools` | No | Exported tools |
| `hooks` | No | Lifecycle hooks |

---

## Related Documentation

- [SKILLS.md](SKILLS.md) - Skills SDK
- [MCP.md](MCP.md) - Model Context Protocol
- [AGENTS.md](AGENTS.md) - Agent configuration
- [WEBHOOKS.md](WEBHOOKS.md) - Event system
- [SECURITY.md](SECURITY.md) - Security practices

---

*Your AI. Your Hardware. Your Rules.*
