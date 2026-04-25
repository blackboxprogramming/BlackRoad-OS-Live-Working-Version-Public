# BlackRoad OS Skills SDK

> Build custom capabilities for your AI agents

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Skill Structure](#skill-structure)
- [Built-in Skills](#built-in-skills)
- [Creating Skills](#creating-skills)
- [Skill Lifecycle](#skill-lifecycle)
- [Skill Communication](#skill-communication)
- [Testing Skills](#testing-skills)
- [Publishing Skills](#publishing-skills)
- [Mobile Installation](MOBILE_SKILL_INSTALL.md)
- [Skill Registry](#skill-registry)
- [Best Practices](#best-practices)

---

## Overview

Skills are **modular capabilities** that extend what agents can do. Think of them as plugins that give agents new abilities - from executing code to searching the web to managing infrastructure.

### What is a Skill?

```
┌──────────────────────────────────────────────────────────────────┐
│                          SKILL                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐  │
│  │    Manifest    │   │    Handler     │   │    Resources   │  │
│  │                │   │                │   │                │  │
│  │ • name         │   │ • execute()    │   │ • prompts      │  │
│  │ • version      │   │ • validate()   │   │ • templates    │  │
│  │ • capabilities │   │ • cleanup()    │   │ • assets       │  │
│  └────────────────┘   └────────────────┘   └────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Skill Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Code** | Execute and analyze code | `code-runner`, `linter`, `formatter` |
| **Data** | Process and transform data | `csv-parser`, `json-transformer`, `aggregator` |
| **Web** | Interact with the internet | `web-scraper`, `api-client`, `search` |
| **Infrastructure** | Manage systems | `docker`, `kubernetes`, `terraform` |
| **Communication** | Send messages | `email`, `slack`, `discord` |
| **Storage** | Manage files | `file-manager`, `s3`, `database` |

---

## Quick Start

### Install the SDK

```bash
# Via npm
npm install @blackroad/skills-sdk

# Via pip
pip install blackroad-skills

# Via cargo
cargo add blackroad-skills
```

### Create Your First Skill

```python
# skills/hello_world/skill.py
from blackroad.skills import Skill, SkillContext, SkillResult

class HelloWorldSkill(Skill):
    """A simple greeting skill."""

    name = "hello-world"
    version = "1.0.0"
    description = "Greets the user"

    async def execute(self, ctx: SkillContext) -> SkillResult:
        name = ctx.params.get("name", "World")
        return SkillResult(
            success=True,
            data={"message": f"Hello, {name}!"}
        )
```

### Register and Use

```python
from blackroad.agents import Agent
from skills.hello_world import HelloWorldSkill

# Register skill with agent
agent = Agent({"name": "ALICE"})
agent.register_skill(HelloWorldSkill())

# Use skill
result = await agent.use_skill("hello-world", {"name": "BlackRoad"})
print(result.data["message"])  # "Hello, BlackRoad!"
```

---

## Skill Structure

### Directory Layout

```
skills/
└── my-skill/
    ├── skill.yaml           # Manifest
    ├── skill.py             # Main handler
    ├── requirements.txt     # Python dependencies
    ├── resources/
    │   ├── prompts/
    │   │   └── default.txt  # Prompt templates
    │   └── templates/
    │       └── output.jinja # Output templates
    ├── tests/
    │   ├── test_skill.py
    │   └── fixtures/
    └── README.md
```

### Manifest (skill.yaml)

```yaml
# skill.yaml
name: my-skill
version: 1.0.0
description: Description of what this skill does

# Author information
author:
  name: Your Name
  email: you@example.com
  url: https://github.com/you

# Skill metadata
category: code
tags:
  - development
  - automation

# Required capabilities
capabilities:
  - file_read
  - file_write
  - shell_execute

# Parameters schema
parameters:
  type: object
  required:
    - input_file
  properties:
    input_file:
      type: string
      description: Path to input file
    options:
      type: object
      properties:
        verbose:
          type: boolean
          default: false

# Output schema
output:
  type: object
  properties:
    result:
      type: string
    metrics:
      type: object

# Resource requirements
resources:
  memory: 256MB
  cpu: 0.5
  timeout: 60s

# Dependencies
dependencies:
  python: ">=3.10"
  packages:
    - requests>=2.28.0
    - pyyaml>=6.0
```

### Skill Handler

```python
# skill.py
from blackroad.skills import (
    Skill,
    SkillContext,
    SkillResult,
    SkillError,
    capability
)

class MySkill(Skill):
    """My custom skill implementation."""

    name = "my-skill"
    version = "1.0.0"

    async def setup(self):
        """Initialize skill resources."""
        self.client = await self.create_client()
        self.logger.info(f"{self.name} initialized")

    async def teardown(self):
        """Cleanup skill resources."""
        await self.client.close()

    @capability("file_read")
    async def execute(self, ctx: SkillContext) -> SkillResult:
        """Main execution entry point."""
        try:
            # Validate input
            self.validate_params(ctx.params)

            # Do work
            input_file = ctx.params["input_file"]
            content = await ctx.fs.read(input_file)
            result = self.process(content)

            return SkillResult(
                success=True,
                data={"result": result}
            )

        except Exception as e:
            self.logger.error(f"Skill failed: {e}")
            raise SkillError(f"Failed to process: {e}")

    def validate_params(self, params: dict):
        """Validate input parameters."""
        if "input_file" not in params:
            raise SkillError("input_file is required")

    def process(self, content: str) -> str:
        """Process the content."""
        # Your logic here
        return content.upper()
```

---

## Built-in Skills

### Code Execution

```python
# Execute Python code
result = await agent.use_skill("code-runner", {
    "language": "python",
    "code": "print('Hello, World!')",
    "timeout": 30
})

# Execute with dependencies
result = await agent.use_skill("code-runner", {
    "language": "python",
    "code": "import pandas as pd; print(pd.__version__)",
    "dependencies": ["pandas"]
})
```

### Web Search

```python
# Search the web
result = await agent.use_skill("web-search", {
    "query": "BlackRoad OS documentation",
    "max_results": 10
})

for item in result.data["results"]:
    print(f"- {item['title']}: {item['url']}")
```

### File Operations

```python
# Read file
content = await agent.use_skill("file-manager", {
    "action": "read",
    "path": "/path/to/file.txt"
})

# Write file
await agent.use_skill("file-manager", {
    "action": "write",
    "path": "/path/to/output.txt",
    "content": "Hello, World!"
})

# List directory
files = await agent.use_skill("file-manager", {
    "action": "list",
    "path": "/path/to/directory",
    "pattern": "*.py"
})
```

### HTTP Client

```python
# GET request
response = await agent.use_skill("http-client", {
    "method": "GET",
    "url": "https://api.example.com/data",
    "headers": {"Authorization": "Bearer token"}
})

# POST request
response = await agent.use_skill("http-client", {
    "method": "POST",
    "url": "https://api.example.com/submit",
    "json": {"key": "value"}
})
```

### Shell Commands

```python
# Execute command
result = await agent.use_skill("shell", {
    "command": "ls -la",
    "cwd": "/home/user",
    "timeout": 30
})

print(result.data["stdout"])
print(result.data["stderr"])
print(result.data["exit_code"])
```

### Database

```python
# Query database
result = await agent.use_skill("database", {
    "connection": "postgresql://...",
    "query": "SELECT * FROM users WHERE active = true",
    "params": []
})

for row in result.data["rows"]:
    print(row)
```

---

## Creating Skills

### Step-by-Step Guide

#### 1. Create Skill Directory

```bash
mkdir -p skills/my-analyzer
cd skills/my-analyzer
```

#### 2. Define Manifest

```yaml
# skill.yaml
name: code-analyzer
version: 1.0.0
description: Analyzes code for patterns and issues

category: code
tags:
  - analysis
  - linting
  - quality

capabilities:
  - file_read

parameters:
  type: object
  required:
    - path
  properties:
    path:
      type: string
      description: Path to analyze
    language:
      type: string
      enum: [python, javascript, typescript, rust]
    rules:
      type: array
      items:
        type: string

output:
  type: object
  properties:
    issues:
      type: array
    metrics:
      type: object
    summary:
      type: string
```

#### 3. Implement Handler

```python
# skill.py
from blackroad.skills import Skill, SkillContext, SkillResult
from pathlib import Path
import ast

class CodeAnalyzerSkill(Skill):
    name = "code-analyzer"
    version = "1.0.0"

    # Supported languages
    ANALYZERS = {
        "python": "analyze_python",
        "javascript": "analyze_javascript",
    }

    async def execute(self, ctx: SkillContext) -> SkillResult:
        path = Path(ctx.params["path"])
        language = ctx.params.get("language") or self.detect_language(path)
        rules = ctx.params.get("rules", ["all"])

        # Read file
        content = await ctx.fs.read(path)

        # Analyze
        analyzer = getattr(self, self.ANALYZERS.get(language, "analyze_generic"))
        issues = await analyzer(content, rules)

        # Calculate metrics
        metrics = self.calculate_metrics(content, issues)

        return SkillResult(
            success=True,
            data={
                "issues": issues,
                "metrics": metrics,
                "summary": f"Found {len(issues)} issues"
            }
        )

    def detect_language(self, path: Path) -> str:
        extensions = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".rs": "rust"
        }
        return extensions.get(path.suffix, "generic")

    async def analyze_python(self, content: str, rules: list) -> list:
        issues = []

        try:
            tree = ast.parse(content)

            # Check for common issues
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if len(node.args.args) > 5:
                        issues.append({
                            "rule": "too-many-arguments",
                            "line": node.lineno,
                            "message": f"Function {node.name} has too many arguments"
                        })

        except SyntaxError as e:
            issues.append({
                "rule": "syntax-error",
                "line": e.lineno,
                "message": str(e)
            })

        return issues

    def calculate_metrics(self, content: str, issues: list) -> dict:
        lines = content.split("\n")
        return {
            "lines": len(lines),
            "issues_count": len(issues),
            "issues_per_100_lines": len(issues) / len(lines) * 100
        }
```

#### 4. Add Tests

```python
# tests/test_skill.py
import pytest
from skill import CodeAnalyzerSkill

@pytest.fixture
def skill():
    return CodeAnalyzerSkill()

@pytest.mark.asyncio
async def test_analyze_python_syntax_error(skill, mock_context):
    mock_context.params = {"path": "test.py"}
    mock_context.fs.read.return_value = "def broken("

    result = await skill.execute(mock_context)

    assert result.success
    assert len(result.data["issues"]) == 1
    assert result.data["issues"][0]["rule"] == "syntax-error"

@pytest.mark.asyncio
async def test_analyze_python_too_many_args(skill, mock_context):
    mock_context.params = {"path": "test.py"}
    mock_context.fs.read.return_value = """
def foo(a, b, c, d, e, f, g):
    pass
"""

    result = await skill.execute(mock_context)

    assert result.success
    assert any(i["rule"] == "too-many-arguments" for i in result.data["issues"])
```

#### 5. Register Skill

```python
# In your agent configuration
from skills.my_analyzer import CodeAnalyzerSkill

agent.register_skill(CodeAnalyzerSkill())

# Use it
result = await agent.use_skill("code-analyzer", {
    "path": "src/main.py",
    "language": "python"
})
```

---

## Skill Lifecycle

### Lifecycle Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     SKILL LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ CREATED │───▶│ SETUP   │───▶│  READY  │───▶│EXECUTING│      │
│  └─────────┘    └─────────┘    └────┬────┘    └────┬────┘      │
│                                      │              │            │
│                                      │  execute()   │            │
│                                      │◀─────────────┘            │
│                                      │                           │
│                                      │  shutdown                 │
│                                      ▼                           │
│                                 ┌─────────┐                      │
│                                 │TEARDOWN │                      │
│                                 └────┬────┘                      │
│                                      │                           │
│                                      ▼                           │
│                                 ┌─────────┐                      │
│                                 │DESTROYED│                      │
│                                 └─────────┘                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Lifecycle Hooks

```python
class MySkill(Skill):

    async def on_register(self, agent):
        """Called when skill is registered with an agent."""
        self.agent = agent
        self.logger.info(f"Registered with {agent.name}")

    async def setup(self):
        """Called once before first execution."""
        self.connection = await self.create_connection()
        self.cache = {}

    async def before_execute(self, ctx: SkillContext):
        """Called before each execution."""
        self.logger.info(f"Starting execution with params: {ctx.params}")

    async def execute(self, ctx: SkillContext) -> SkillResult:
        """Main execution logic."""
        return SkillResult(success=True, data={})

    async def after_execute(self, ctx: SkillContext, result: SkillResult):
        """Called after each execution."""
        self.logger.info(f"Execution completed: {result.success}")

    async def teardown(self):
        """Called on shutdown."""
        await self.connection.close()

    async def on_error(self, ctx: SkillContext, error: Exception):
        """Called when execution fails."""
        self.logger.error(f"Error: {error}")
        # Optionally recover or cleanup
```

---

## Skill Communication

### Between Skills

```python
class OrchestratorSkill(Skill):
    name = "orchestrator"

    async def execute(self, ctx: SkillContext) -> SkillResult:
        # Use another skill
        analysis = await ctx.invoke_skill("code-analyzer", {
            "path": ctx.params["path"]
        })

        # Use result in another skill
        if analysis.data["issues"]:
            fix_result = await ctx.invoke_skill("code-fixer", {
                "path": ctx.params["path"],
                "issues": analysis.data["issues"]
            })

        return SkillResult(
            success=True,
            data={
                "analyzed": True,
                "fixed": fix_result.success if analysis.data["issues"] else False
            }
        )
```

### Skill Events

```python
from blackroad.skills import SkillEvent

class MySkill(Skill):

    async def execute(self, ctx: SkillContext) -> SkillResult:
        # Emit progress event
        await ctx.emit(SkillEvent(
            type="progress",
            data={"percent": 50, "status": "Processing..."}
        ))

        # Do work...

        await ctx.emit(SkillEvent(
            type="progress",
            data={"percent": 100, "status": "Complete"}
        ))

        return SkillResult(success=True, data={})
```

### Subscribing to Events

```python
# In agent code
@agent.on_skill_event("my-skill", "progress")
async def handle_progress(event):
    print(f"Progress: {event.data['percent']}%")
```

---

## Testing Skills

### Unit Tests

```python
# tests/test_skill.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from blackroad.skills.testing import MockSkillContext

@pytest.fixture
def mock_context():
    ctx = MockSkillContext()
    ctx.params = {}
    ctx.fs = AsyncMock()
    ctx.logger = MagicMock()
    return ctx

@pytest.fixture
def skill():
    return MySkill()

@pytest.mark.asyncio
async def test_skill_success(skill, mock_context):
    mock_context.params = {"input": "test"}
    mock_context.fs.read.return_value = "file content"

    result = await skill.execute(mock_context)

    assert result.success
    assert "output" in result.data

@pytest.mark.asyncio
async def test_skill_validation_error(skill, mock_context):
    mock_context.params = {}  # Missing required param

    with pytest.raises(SkillError):
        await skill.execute(mock_context)
```

### Integration Tests

```python
# tests/integration/test_skill_integration.py
import pytest
from blackroad.agents import Agent
from skills.my_skill import MySkill

@pytest.fixture
async def agent_with_skill():
    agent = Agent({"name": "TEST"})
    agent.register_skill(MySkill())
    await agent.start()
    yield agent
    await agent.stop()

@pytest.mark.asyncio
async def test_skill_in_agent(agent_with_skill, tmp_path):
    # Create test file
    test_file = tmp_path / "test.txt"
    test_file.write_text("test content")

    # Use skill
    result = await agent_with_skill.use_skill("my-skill", {
        "path": str(test_file)
    })

    assert result.success
```

### Skill Test Runner

```bash
# Run skill tests
blackroad-skills test skills/my-skill

# Run with coverage
blackroad-skills test skills/my-skill --coverage

# Run specific test
blackroad-skills test skills/my-skill -k "test_success"
```

---

## Publishing Skills

### Package Your Skill

```bash
# Create distribution
cd skills/my-skill
blackroad-skills package

# Output: my-skill-1.0.0.tar.gz
```

### Publish to Registry

```bash
# Authenticate
blackroad-skills login

# Publish
blackroad-skills publish my-skill-1.0.0.tar.gz

# Published to: https://registry.blackroad.io/skills/my-skill
```

### Install Published Skills

```bash
# Install from registry
blackroad-skills install my-skill

# Install specific version
blackroad-skills install my-skill@1.0.0

# Install from git
blackroad-skills install git+https://github.com/user/my-skill
```

### Install on Mobile

Skills can be installed directly from the Claude mobile app. See the full walkthrough in [MOBILE_SKILL_INSTALL.md](MOBILE_SKILL_INSTALL.md).

**Quick steps:**
1. Download the `.skill` file to your phone
2. Open Claude app → **Settings** → **Skills**
3. Tap **+** / **Install** and select the file

Skills install to your account — once installed, they work on all devices.

---

## Skill Registry

### Browsing Skills

```bash
# Search skills
blackroad-skills search "code analysis"

# List all skills
blackroad-skills list

# Get skill info
blackroad-skills info code-analyzer
```

### Registry API

```python
from blackroad.skills import SkillRegistry

registry = SkillRegistry()

# Search skills
skills = await registry.search("code")

# Get skill details
skill = await registry.get("code-analyzer")
print(skill.name, skill.version, skill.downloads)

# Install skill
await registry.install("code-analyzer")
```

### Popular Skills

| Skill | Category | Downloads | Description |
|-------|----------|-----------|-------------|
| `code-runner` | Code | 50K | Execute code in sandboxed environment |
| `web-scraper` | Web | 35K | Scrape and parse web pages |
| `sql-query` | Database | 28K | Execute SQL queries safely |
| `git-ops` | DevOps | 22K | Git operations and analysis |
| `image-gen` | AI | 18K | Generate images with AI |

---

## Best Practices

### 1. Single Responsibility

```python
# Good: One clear purpose
class FileLinterSkill(Skill):
    """Lints a single file."""
    pass

# Bad: Too many responsibilities
class DoEverythingSkill(Skill):
    """Lints, formats, tests, and deploys."""
    pass
```

### 2. Clear Error Messages

```python
class MySkill(Skill):
    async def execute(self, ctx: SkillContext) -> SkillResult:
        if not ctx.params.get("path"):
            raise SkillError(
                "Missing required parameter 'path'. "
                "Please provide a file path to analyze."
            )
```

### 3. Proper Resource Cleanup

```python
class MySkill(Skill):
    async def execute(self, ctx: SkillContext) -> SkillResult:
        connection = await self.connect()
        try:
            result = await self.process(connection)
            return SkillResult(success=True, data=result)
        finally:
            await connection.close()
```

### 4. Timeout Handling

```python
import asyncio

class MySkill(Skill):
    async def execute(self, ctx: SkillContext) -> SkillResult:
        timeout = ctx.params.get("timeout", 30)

        try:
            result = await asyncio.wait_for(
                self.long_operation(),
                timeout=timeout
            )
            return SkillResult(success=True, data=result)
        except asyncio.TimeoutError:
            raise SkillError(f"Operation timed out after {timeout}s")
```

### 5. Progress Reporting

```python
class MySkill(Skill):
    async def execute(self, ctx: SkillContext) -> SkillResult:
        items = ctx.params["items"]
        total = len(items)

        for i, item in enumerate(items):
            await ctx.emit_progress(
                percent=(i + 1) / total * 100,
                message=f"Processing {item}"
            )
            await self.process(item)

        return SkillResult(success=True, data={"processed": total})
```

### 6. Comprehensive Logging

```python
class MySkill(Skill):
    async def execute(self, ctx: SkillContext) -> SkillResult:
        self.logger.info(f"Starting with params: {ctx.params}")

        try:
            result = await self.process()
            self.logger.info(f"Completed successfully: {result}")
            return SkillResult(success=True, data=result)

        except Exception as e:
            self.logger.error(f"Failed: {e}", exc_info=True)
            raise
```

---

## TypeScript Skills

### TypeScript Skill Example

```typescript
// skill.ts
import { Skill, SkillContext, SkillResult } from '@blackroad/skills-sdk';

export class MySkill extends Skill {
  name = 'my-skill';
  version = '1.0.0';

  async execute(ctx: SkillContext): Promise<SkillResult> {
    const { input } = ctx.params;

    if (!input) {
      throw new SkillError('input is required');
    }

    const result = await this.process(input);

    return {
      success: true,
      data: { result }
    };
  }

  private async process(input: string): Promise<string> {
    return input.toUpperCase();
  }
}
```

### TypeScript Configuration

```json
{
  "name": "@myorg/my-skill",
  "version": "1.0.0",
  "main": "dist/skill.js",
  "types": "dist/skill.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  },
  "dependencies": {
    "@blackroad/skills-sdk": "^1.0.0"
  }
}
```

---

*Last updated: 2026-02-05*
