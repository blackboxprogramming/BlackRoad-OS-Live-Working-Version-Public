# BlackRoad OS Model Context Protocol (MCP)

> Bridge between AI models and external tools, data, and services

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [MCP Server](#mcp-server)
- [Built-in Tools](#built-in-tools)
- [Resources](#resources)
- [Prompts](#prompts)
- [Creating Custom Tools](#creating-custom-tools)
- [Configuration](#configuration)
- [Security](#security)
- [Debugging](#debugging)

---

## Overview

The **Model Context Protocol (MCP)** is BlackRoad's system for connecting AI models to external capabilities. It provides a standardized way for agents to access tools, data, and services.

### What MCP Enables

```
┌─────────────────────────────────────────────────────────────────┐
│                         AI MODEL                                │
│                                                                 │
│  "I need to check the weather and send an email"               │
│                                                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MCP BRIDGE                                │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  Tools  │  │Resources│  │ Prompts │  │Transport│          │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│       │            │            │            │                 │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Weather │  │  Files  │  │Templates│  │ HTTP/WS │
   │   API   │  │         │  │         │  │         │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Tools** | Functions the model can call |
| **Resources** | Data sources the model can read |
| **Prompts** | Reusable prompt templates |
| **Transport** | Communication protocol |

---

## Architecture

### MCP Bridge Structure

```
mcp-bridge/
├── server.py              # Main MCP server
├── tools/                 # Tool implementations
│   ├── __init__.py
│   ├── filesystem.py      # File operations
│   ├── web.py             # Web requests
│   ├── database.py        # Database queries
│   ├── git.py             # Git operations
│   ├── shell.py           # Shell commands
│   └── blackroad.py       # BlackRoad-specific tools
├── resources/             # Resource providers
│   ├── __init__.py
│   ├── files.py           # File resources
│   ├── memory.py          # Memory resources
│   └── config.py          # Config resources
├── prompts/               # Prompt templates
│   ├── __init__.py
│   └── templates/
│       ├── code_review.txt
│       ├── summarize.txt
│       └── analyze.txt
├── config.yaml            # Server configuration
└── requirements.txt
```

### Communication Flow

```
┌─────────────────┐     Request      ┌─────────────────┐
│                 │─────────────────▶│                 │
│   AI Client     │                  │   MCP Server    │
│   (Claude)      │◀─────────────────│                 │
│                 │     Response     │                 │
└─────────────────┘                  └────────┬────────┘
                                              │
                                              │ Execute
                                              ▼
                                     ┌─────────────────┐
                                     │    External     │
                                     │    Services     │
                                     └─────────────────┘
```

---

## MCP Server

### Starting the Server

```bash
# Start MCP server
cd mcp-bridge
python server.py

# With options
python server.py --port 8080 --debug
python server.py --config custom-config.yaml
```

### Server Configuration

```yaml
# mcp-bridge/config.yaml
server:
  name: blackroad-mcp
  version: 1.0.0
  port: 8080
  host: localhost

transport:
  type: stdio  # or http, websocket
  timeout: 30

tools:
  enabled:
    - filesystem
    - web
    - database
    - git
    - shell
    - blackroad

  filesystem:
    allowed_paths:
      - /Users/alexa/blackroad
      - /tmp
    max_file_size: 10MB

  web:
    allowed_domains:
      - "*.blackroad.io"
      - "api.github.com"
    timeout: 30

  shell:
    allowed_commands:
      - ls
      - cat
      - grep
      - git
    blocked_commands:
      - rm -rf
      - sudo

resources:
  enabled:
    - files
    - memory
    - config

prompts:
  directory: ./prompts/templates

logging:
  level: INFO
  file: ./logs/mcp.log
```

### Server Implementation

```python
# server.py
from mcp import Server, Tool, Resource
from mcp.transport import StdioTransport

class BlackRoadMCPServer(Server):
    def __init__(self, config):
        super().__init__(
            name=config["server"]["name"],
            version=config["server"]["version"]
        )
        self.config = config
        self._register_tools()
        self._register_resources()
        self._register_prompts()

    def _register_tools(self):
        """Register all enabled tools."""
        from tools import filesystem, web, database, git, shell, blackroad

        if "filesystem" in self.config["tools"]["enabled"]:
            self.register_tool(filesystem.ReadFileTool())
            self.register_tool(filesystem.WriteFileTool())
            self.register_tool(filesystem.ListDirectoryTool())

        if "web" in self.config["tools"]["enabled"]:
            self.register_tool(web.FetchURLTool())
            self.register_tool(web.SearchWebTool())

        # ... more tools

    def _register_resources(self):
        """Register resource providers."""
        from resources import files, memory, config

        self.register_resource(files.FileResource())
        self.register_resource(memory.MemoryResource())
        self.register_resource(config.ConfigResource())

    def _register_prompts(self):
        """Register prompt templates."""
        from prompts import load_prompts
        for prompt in load_prompts(self.config["prompts"]["directory"]):
            self.register_prompt(prompt)

if __name__ == "__main__":
    import yaml
    with open("config.yaml") as f:
        config = yaml.safe_load(f)

    server = BlackRoadMCPServer(config)
    transport = StdioTransport()
    server.run(transport)
```

---

## Built-in Tools

### Filesystem Tools

```python
# tools/filesystem.py
from mcp import Tool, ToolResult

class ReadFileTool(Tool):
    name = "read_file"
    description = "Read contents of a file"

    parameters = {
        "type": "object",
        "required": ["path"],
        "properties": {
            "path": {
                "type": "string",
                "description": "Path to the file"
            },
            "encoding": {
                "type": "string",
                "default": "utf-8"
            }
        }
    }

    async def execute(self, path: str, encoding: str = "utf-8") -> ToolResult:
        try:
            with open(path, "r", encoding=encoding) as f:
                content = f.read()
            return ToolResult(success=True, data={"content": content})
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class WriteFileTool(Tool):
    name = "write_file"
    description = "Write content to a file"

    parameters = {
        "type": "object",
        "required": ["path", "content"],
        "properties": {
            "path": {"type": "string"},
            "content": {"type": "string"},
            "mode": {
                "type": "string",
                "enum": ["write", "append"],
                "default": "write"
            }
        }
    }

    async def execute(self, path: str, content: str, mode: str = "write") -> ToolResult:
        file_mode = "w" if mode == "write" else "a"
        try:
            with open(path, file_mode) as f:
                f.write(content)
            return ToolResult(success=True, data={"bytes_written": len(content)})
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class ListDirectoryTool(Tool):
    name = "list_directory"
    description = "List files and directories"

    parameters = {
        "type": "object",
        "required": ["path"],
        "properties": {
            "path": {"type": "string"},
            "pattern": {"type": "string", "default": "*"},
            "recursive": {"type": "boolean", "default": False}
        }
    }

    async def execute(self, path: str, pattern: str = "*", recursive: bool = False) -> ToolResult:
        from pathlib import Path
        import fnmatch

        try:
            p = Path(path)
            if recursive:
                files = list(p.rglob(pattern))
            else:
                files = list(p.glob(pattern))

            return ToolResult(
                success=True,
                data={"files": [str(f) for f in files]}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
```

### Web Tools

```python
# tools/web.py
import aiohttp
from mcp import Tool, ToolResult

class FetchURLTool(Tool):
    name = "fetch_url"
    description = "Fetch content from a URL"

    parameters = {
        "type": "object",
        "required": ["url"],
        "properties": {
            "url": {"type": "string"},
            "method": {
                "type": "string",
                "enum": ["GET", "POST"],
                "default": "GET"
            },
            "headers": {"type": "object"},
            "body": {"type": "string"}
        }
    }

    async def execute(self, url: str, method: str = "GET",
                      headers: dict = None, body: str = None) -> ToolResult:
        async with aiohttp.ClientSession() as session:
            try:
                async with session.request(
                    method, url, headers=headers, data=body
                ) as response:
                    content = await response.text()
                    return ToolResult(
                        success=True,
                        data={
                            "status": response.status,
                            "headers": dict(response.headers),
                            "content": content
                        }
                    )
            except Exception as e:
                return ToolResult(success=False, error=str(e))


class SearchWebTool(Tool):
    name = "search_web"
    description = "Search the web for information"

    parameters = {
        "type": "object",
        "required": ["query"],
        "properties": {
            "query": {"type": "string"},
            "max_results": {"type": "integer", "default": 10}
        }
    }

    async def execute(self, query: str, max_results: int = 10) -> ToolResult:
        # Implementation using search API
        pass
```

### Git Tools

```python
# tools/git.py
import subprocess
from mcp import Tool, ToolResult

class GitStatusTool(Tool):
    name = "git_status"
    description = "Get git repository status"

    parameters = {
        "type": "object",
        "properties": {
            "path": {"type": "string", "default": "."}
        }
    }

    async def execute(self, path: str = ".") -> ToolResult:
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=path,
                capture_output=True,
                text=True
            )
            return ToolResult(
                success=True,
                data={
                    "status": result.stdout,
                    "branch": self._get_branch(path)
                }
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))

    def _get_branch(self, path: str) -> str:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=path,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()


class GitCommitTool(Tool):
    name = "git_commit"
    description = "Create a git commit"

    parameters = {
        "type": "object",
        "required": ["message"],
        "properties": {
            "message": {"type": "string"},
            "path": {"type": "string", "default": "."},
            "add_all": {"type": "boolean", "default": False}
        }
    }

    async def execute(self, message: str, path: str = ".",
                      add_all: bool = False) -> ToolResult:
        try:
            if add_all:
                subprocess.run(["git", "add", "-A"], cwd=path, check=True)

            result = subprocess.run(
                ["git", "commit", "-m", message],
                cwd=path,
                capture_output=True,
                text=True
            )

            return ToolResult(
                success=result.returncode == 0,
                data={"output": result.stdout}
            )
        except Exception as e:
            return ToolResult(success=False, error=str(e))
```

### BlackRoad Tools

```python
# tools/blackroad.py
from mcp import Tool, ToolResult
import aiohttp

class AgentMessageTool(Tool):
    name = "send_agent_message"
    description = "Send a message to a BlackRoad agent"

    parameters = {
        "type": "object",
        "required": ["agent", "message"],
        "properties": {
            "agent": {
                "type": "string",
                "description": "Agent name (ALICE, LUCIDIA, etc.)"
            },
            "message": {"type": "string"}
        }
    }

    async def execute(self, agent: str, message: str) -> ToolResult:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"http://localhost:8000/api/agents/{agent}/message",
                json={"message": message}
            ) as response:
                data = await response.json()
                return ToolResult(success=True, data=data)


class MemorySearchTool(Tool):
    name = "search_memory"
    description = "Search BlackRoad memory system"

    parameters = {
        "type": "object",
        "required": ["query"],
        "properties": {
            "query": {"type": "string"},
            "tier": {
                "type": "string",
                "enum": ["working", "episodic", "semantic", "all"],
                "default": "all"
            },
            "limit": {"type": "integer", "default": 10}
        }
    }

    async def execute(self, query: str, tier: str = "all",
                      limit: int = 10) -> ToolResult:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8000/api/memory/search",
                json={"query": query, "tier": tier, "limit": limit}
            ) as response:
                data = await response.json()
                return ToolResult(success=True, data=data)


class TaskCreateTool(Tool):
    name = "create_task"
    description = "Create a task for an agent"

    parameters = {
        "type": "object",
        "required": ["title"],
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "agent": {"type": "string"},
            "priority": {
                "type": "string",
                "enum": ["low", "normal", "high"],
                "default": "normal"
            }
        }
    }

    async def execute(self, title: str, description: str = "",
                      agent: str = None, priority: str = "normal") -> ToolResult:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:8000/api/tasks",
                json={
                    "title": title,
                    "description": description,
                    "agent_id": agent,
                    "priority": priority
                }
            ) as response:
                data = await response.json()
                return ToolResult(success=True, data=data)
```

---

## Resources

### Resource Types

```python
# resources/files.py
from mcp import Resource

class FileResource(Resource):
    uri_scheme = "file"

    async def read(self, uri: str) -> dict:
        """Read a file resource.

        URI format: file:///path/to/file
        """
        path = uri.replace("file://", "")
        with open(path, "r") as f:
            content = f.read()
        return {
            "uri": uri,
            "content": content,
            "mimeType": self._get_mime_type(path)
        }

    async def list(self, uri: str = None) -> list:
        """List available file resources."""
        from pathlib import Path
        root = Path(uri.replace("file://", "") if uri else ".")
        return [
            {"uri": f"file://{f}", "name": f.name}
            for f in root.iterdir()
            if f.is_file()
        ]
```

```python
# resources/memory.py
from mcp import Resource

class MemoryResource(Resource):
    uri_scheme = "memory"

    async def read(self, uri: str) -> dict:
        """Read from memory.

        URI format: memory://tier/key
        """
        parts = uri.replace("memory://", "").split("/")
        tier = parts[0]
        key = "/".join(parts[1:])

        # Fetch from memory service
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"http://localhost:8000/api/memory/{tier}/{key}"
            ) as response:
                data = await response.json()

        return {
            "uri": uri,
            "content": data["value"],
            "metadata": data.get("metadata", {})
        }
```

### Using Resources

```python
# In Claude Code, resources appear as available data sources
# The model can request to read them

# Example resource URIs:
# file:///Users/alexa/blackroad/CLAUDE.md
# memory://semantic/deployment_guide
# config://blackroad/settings
```

---

## Prompts

### Prompt Templates

```yaml
# prompts/templates/code_review.yaml
name: code_review
description: Review code for quality and issues

arguments:
  - name: code
    description: The code to review
    required: true
  - name: language
    description: Programming language
    required: false
  - name: focus
    description: Areas to focus on
    required: false

template: |
  Please review the following {{ language or "code" }}:

  ```{{ language or "" }}
  {{ code }}
  ```

  {% if focus %}
  Focus areas: {{ focus }}
  {% endif %}

  Provide:
  1. Overall assessment
  2. Potential issues
  3. Suggestions for improvement
  4. Security considerations
```

```yaml
# prompts/templates/summarize.yaml
name: summarize
description: Summarize content

arguments:
  - name: content
    description: Content to summarize
    required: true
  - name: length
    description: Desired summary length
    required: false
    default: medium

template: |
  Please summarize the following content:

  {{ content }}

  Provide a {{ length }} summary that captures the key points.
```

### Loading Prompts

```python
# prompts/__init__.py
import yaml
from pathlib import Path
from mcp import Prompt

def load_prompts(directory: str) -> list:
    """Load all prompt templates from directory."""
    prompts = []
    for file in Path(directory).glob("*.yaml"):
        with open(file) as f:
            data = yaml.safe_load(f)

        prompt = Prompt(
            name=data["name"],
            description=data["description"],
            arguments=data.get("arguments", []),
            template=data["template"]
        )
        prompts.append(prompt)

    return prompts
```

---

## Creating Custom Tools

### Step 1: Define the Tool

```python
# tools/custom/my_tool.py
from mcp import Tool, ToolResult

class MyCustomTool(Tool):
    name = "my_custom_tool"
    description = "Description of what this tool does"

    parameters = {
        "type": "object",
        "required": ["param1"],
        "properties": {
            "param1": {
                "type": "string",
                "description": "First parameter"
            },
            "param2": {
                "type": "integer",
                "description": "Optional second parameter",
                "default": 10
            }
        }
    }

    async def execute(self, param1: str, param2: int = 10) -> ToolResult:
        try:
            # Your implementation here
            result = self.process(param1, param2)
            return ToolResult(success=True, data={"result": result})
        except Exception as e:
            return ToolResult(success=False, error=str(e))

    def process(self, param1: str, param2: int) -> str:
        # Processing logic
        return f"Processed {param1} with {param2}"
```

### Step 2: Register the Tool

```python
# In server.py or tool registration
from tools.custom.my_tool import MyCustomTool

server.register_tool(MyCustomTool())
```

### Step 3: Add Configuration

```yaml
# config.yaml
tools:
  enabled:
    - my_custom_tool

  my_custom_tool:
    some_setting: value
    another_setting: 42
```

---

## Configuration

### Claude Desktop Configuration

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "blackroad": {
      "command": "python",
      "args": ["/Users/alexa/blackroad/mcp-bridge/server.py"],
      "env": {
        "BLACKROAD_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

### Environment Variables

```bash
# MCP Server configuration
export MCP_SERVER_PORT=8080
export MCP_SERVER_HOST=localhost
export MCP_LOG_LEVEL=INFO

# Tool-specific
export MCP_ALLOWED_PATHS="/Users/alexa/blackroad,/tmp"
export MCP_ALLOWED_COMMANDS="ls,cat,grep,git"

# BlackRoad integration
export BLACKROAD_API_URL=http://localhost:8000
export BLACKROAD_API_KEY=your-api-key
```

---

## Security

### Permission Model

```yaml
# Security configuration
security:
  # Tool permissions
  tools:
    filesystem:
      allowed_paths:
        - /Users/alexa/blackroad
        - /tmp
      denied_paths:
        - /etc
        - /var
      max_file_size: 10MB

    shell:
      allowed_commands:
        - ls
        - cat
        - grep
        - git
      blocked_patterns:
        - "rm -rf"
        - "sudo"
        - "chmod 777"

    web:
      allowed_domains:
        - "*.blackroad.io"
        - "api.github.com"
        - "api.openai.com"
      blocked_domains:
        - "*.malicious.com"
      max_request_size: 10MB

  # Rate limiting
  rate_limits:
    global: 100/minute
    per_tool:
      shell: 10/minute
      web: 50/minute

  # Audit logging
  audit:
    enabled: true
    log_file: ./logs/audit.log
    log_level: INFO
```

### Input Validation

```python
# tools/base.py
from mcp import Tool
import re

class SecureTool(Tool):
    """Base class with security features."""

    def validate_path(self, path: str) -> bool:
        """Validate file path is allowed."""
        allowed_paths = self.config.get("allowed_paths", [])
        for allowed in allowed_paths:
            if path.startswith(allowed):
                return True
        return False

    def validate_command(self, command: str) -> bool:
        """Validate shell command is allowed."""
        blocked_patterns = self.config.get("blocked_patterns", [])
        for pattern in blocked_patterns:
            if re.search(pattern, command):
                return False
        return True

    def sanitize_input(self, input_str: str) -> str:
        """Sanitize user input."""
        # Remove potentially dangerous characters
        return re.sub(r'[;&|`$]', '', input_str)
```

---

## Debugging

### Debug Mode

```bash
# Run server in debug mode
python server.py --debug

# Enable verbose logging
MCP_LOG_LEVEL=DEBUG python server.py
```

### Logging

```python
# Enable detailed logging
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mcp-debug.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('mcp')
```

### Testing Tools

```python
# tests/test_tools.py
import pytest
from tools.filesystem import ReadFileTool

@pytest.mark.asyncio
async def test_read_file():
    tool = ReadFileTool()
    result = await tool.execute(path="/tmp/test.txt")
    assert result.success
    assert "content" in result.data

@pytest.mark.asyncio
async def test_read_file_not_found():
    tool = ReadFileTool()
    result = await tool.execute(path="/nonexistent/file.txt")
    assert not result.success
    assert "error" in result.__dict__
```

### Tool Inspector

```bash
# Inspect available tools
python -m mcp.inspector --server ./server.py

# Output:
# Available Tools:
# ├── read_file
# │   └── Read contents of a file
# ├── write_file
# │   └── Write content to a file
# ├── fetch_url
# │   └── Fetch content from a URL
# └── ...
```

---

## Quick Reference

### Tool Schema

```python
class MyTool(Tool):
    name = "tool_name"           # Unique identifier
    description = "..."          # What the tool does

    parameters = {               # JSON Schema for parameters
        "type": "object",
        "required": ["param1"],
        "properties": {
            "param1": {"type": "string"}
        }
    }

    async def execute(self, **params) -> ToolResult:
        # Implementation
        return ToolResult(success=True, data={})
```

### Resource Schema

```python
class MyResource(Resource):
    uri_scheme = "myscheme"      # URI prefix

    async def read(self, uri: str) -> dict:
        return {"uri": uri, "content": "..."}

    async def list(self, uri: str = None) -> list:
        return [{"uri": "...", "name": "..."}]
```

### Prompt Schema

```yaml
name: prompt_name
description: What this prompt does
arguments:
  - name: arg1
    required: true
template: |
  Template with {{ arg1 }}
```

---

*Last updated: 2026-02-05*
