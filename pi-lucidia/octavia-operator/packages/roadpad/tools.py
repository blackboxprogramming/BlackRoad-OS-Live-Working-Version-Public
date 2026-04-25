"""
Lucidia Tools - Sovereign AI actions.

Lucidia isn't just a chat interface - she can DO things.
These tools let her interact with the system directly.

Security: All tools respect the security module's restrictions.
"""

import os
import re
import subprocess
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Callable
from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════════════
# TOOL DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Tool:
    """A tool Lucidia can use."""
    name: str
    description: str
    usage: str
    handler: Callable
    requires_confirm: bool = False  # Destructive actions need confirmation
    category: str = "general"


@dataclass
class ToolResult:
    """Result from running a tool."""
    success: bool
    output: str
    tool_name: str
    duration_ms: int = 0


# ═══════════════════════════════════════════════════════════════════════════════
# FILE TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

def tool_read_file(path: str, lines: int = 50) -> ToolResult:
    """Read contents of a file."""
    import time
    start = time.time()

    try:
        path = os.path.expanduser(path)
        if not os.path.exists(path):
            return ToolResult(False, f"File not found: {path}", "read", 0)

        if os.path.isdir(path):
            return ToolResult(False, f"Is a directory: {path}", "read", 0)

        # Size check
        size = os.path.getsize(path)
        if size > 1024 * 1024:  # 1MB limit
            return ToolResult(False, f"File too large: {size} bytes", "read", 0)

        with open(path, 'r', errors='replace') as f:
            content = f.readlines()

        if len(content) > lines:
            output = "".join(content[:lines])
            output += f"\n... ({len(content) - lines} more lines)"
        else:
            output = "".join(content)

        duration = int((time.time() - start) * 1000)
        return ToolResult(True, output, "read", duration)

    except Exception as e:
        return ToolResult(False, str(e), "read", 0)


def tool_list_dir(path: str = ".", show_hidden: bool = False) -> ToolResult:
    """List directory contents."""
    import time
    start = time.time()

    try:
        path = os.path.expanduser(path)
        if not os.path.exists(path):
            return ToolResult(False, f"Path not found: {path}", "ls", 0)

        entries = []
        for entry in sorted(os.listdir(path)):
            if not show_hidden and entry.startswith('.'):
                continue

            full_path = os.path.join(path, entry)
            if os.path.isdir(full_path):
                entries.append(f"  {entry}/")
            else:
                size = os.path.getsize(full_path)
                if size > 1024 * 1024:
                    size_str = f"{size // (1024*1024)}M"
                elif size > 1024:
                    size_str = f"{size // 1024}K"
                else:
                    size_str = f"{size}B"
                entries.append(f"  {entry} ({size_str})")

        output = f"{path}:\n" + "\n".join(entries) if entries else f"{path}: (empty)"
        duration = int((time.time() - start) * 1000)
        return ToolResult(True, output, "ls", duration)

    except Exception as e:
        return ToolResult(False, str(e), "ls", 0)


def tool_find_files(pattern: str, path: str = ".", max_results: int = 20) -> ToolResult:
    """Find files matching a pattern."""
    import time
    import fnmatch
    start = time.time()

    try:
        path = os.path.expanduser(path)
        matches = []

        for root, dirs, files in os.walk(path):
            # Skip hidden and common ignore dirs
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv']]

            for filename in files:
                if fnmatch.fnmatch(filename, pattern):
                    rel_path = os.path.relpath(os.path.join(root, filename), path)
                    matches.append(rel_path)
                    if len(matches) >= max_results:
                        break
            if len(matches) >= max_results:
                break

        if matches:
            output = f"Found {len(matches)} file(s):\n" + "\n".join(f"  {m}" for m in matches)
        else:
            output = f"No files matching '{pattern}'"

        duration = int((time.time() - start) * 1000)
        return ToolResult(True, output, "find", duration)

    except Exception as e:
        return ToolResult(False, str(e), "find", 0)


# ═══════════════════════════════════════════════════════════════════════════════
# SHELL TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

# Safe commands that don't modify anything
SAFE_COMMANDS = {
    'ls', 'pwd', 'cat', 'head', 'tail', 'wc', 'grep', 'find', 'which', 'whoami',
    'date', 'uptime', 'df', 'du', 'free', 'top', 'ps', 'env', 'echo', 'hostname',
    'uname', 'git', 'python3', 'node', 'npm', 'cargo', 'go', 'rustc', 'pip3',
}

# Blocked patterns (even if command looks safe)
BLOCKED_PATTERNS = [
    r'rm\s+-rf',
    r'>\s*/',
    r'\|\s*sh',
    r'\|\s*bash',
    r'sudo',
    r'chmod\s+777',
    r'curl.*\|',
    r'wget.*\|',
]


def is_safe_command(cmd: str) -> Tuple[bool, str]:
    """Check if a shell command is safe to run."""
    # Check blocked patterns
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, cmd, re.IGNORECASE):
            return False, f"blocked pattern: {pattern}"

    # Check first word is safe command
    parts = cmd.split()
    if not parts:
        return False, "empty command"

    first_cmd = parts[0].split('/')[-1]  # Handle full paths
    if first_cmd not in SAFE_COMMANDS:
        return False, f"unknown command: {first_cmd}"

    return True, "ok"


def tool_shell(cmd: str, timeout: int = 30) -> ToolResult:
    """Execute a shell command (read-only operations)."""
    import time
    start = time.time()

    # Safety check
    safe, reason = is_safe_command(cmd)
    if not safe:
        return ToolResult(False, f"Blocked: {reason}", "shell", 0)

    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=os.getcwd()
        )

        output = result.stdout or result.stderr
        if len(output) > 5000:
            output = output[:5000] + f"\n... (truncated)"

        duration = int((time.time() - start) * 1000)
        success = result.returncode == 0
        return ToolResult(success, output.strip(), "shell", duration)

    except subprocess.TimeoutExpired:
        return ToolResult(False, f"Command timed out after {timeout}s", "shell", timeout * 1000)
    except Exception as e:
        return ToolResult(False, str(e), "shell", 0)


# ═══════════════════════════════════════════════════════════════════════════════
# GIT TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

def tool_git_status() -> ToolResult:
    """Get git repository status."""
    return tool_shell("git status --short")


def tool_git_log(count: int = 10) -> ToolResult:
    """Get recent git commits."""
    return tool_shell(f"git log --oneline -n {count}")


def tool_git_diff(file: str = None) -> ToolResult:
    """Show git diff."""
    cmd = f"git diff {file}" if file else "git diff"
    return tool_shell(cmd)


def tool_git_branch() -> ToolResult:
    """List git branches."""
    return tool_shell("git branch -a")


# ═══════════════════════════════════════════════════════════════════════════════
# CODE SEARCH TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

def tool_grep(pattern: str, path: str = ".", file_pattern: str = "*") -> ToolResult:
    """Search for pattern in files."""
    import time
    start = time.time()

    try:
        path = os.path.expanduser(path)
        matches = []

        for root, dirs, files in os.walk(path):
            # Skip hidden and ignore dirs
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.git']]

            import fnmatch
            for filename in files:
                if not fnmatch.fnmatch(filename, file_pattern):
                    continue

                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', errors='replace') as f:
                        for i, line in enumerate(f, 1):
                            if re.search(pattern, line, re.IGNORECASE):
                                rel_path = os.path.relpath(filepath, path)
                                matches.append(f"{rel_path}:{i}: {line.strip()[:80]}")
                                if len(matches) >= 50:
                                    break
                except:
                    continue

                if len(matches) >= 50:
                    break
            if len(matches) >= 50:
                break

        if matches:
            output = f"Found {len(matches)} match(es):\n" + "\n".join(matches)
        else:
            output = f"No matches for '{pattern}'"

        duration = int((time.time() - start) * 1000)
        return ToolResult(True, output, "grep", duration)

    except Exception as e:
        return ToolResult(False, str(e), "grep", 0)


def tool_search_definition(name: str, path: str = ".") -> ToolResult:
    """Search for function/class definitions."""
    patterns = [
        f"def {name}",
        f"class {name}",
        f"function {name}",
        f"const {name}",
        f"let {name}",
        f"var {name}",
    ]

    all_matches = []
    for pattern in patterns:
        result = tool_grep(pattern, path)
        if result.success and "Found" in result.output:
            # Extract just the matches
            lines = result.output.split('\n')[1:]  # Skip "Found X matches" line
            all_matches.extend(lines)

    if all_matches:
        output = f"Found {len(all_matches)} definition(s):\n" + "\n".join(all_matches[:20])
        return ToolResult(True, output, "search_def", 0)
    else:
        return ToolResult(True, f"No definitions found for '{name}'", "search_def", 0)


# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

def tool_system_info() -> ToolResult:
    """Get system information."""
    import time
    start = time.time()

    try:
        info = []
        info.append(f"Hostname: {os.uname().nodename}")
        info.append(f"System: {os.uname().sysname} {os.uname().release}")
        info.append(f"User: {os.environ.get('USER', 'unknown')}")
        info.append(f"CWD: {os.getcwd()}")
        info.append(f"Home: {os.path.expanduser('~')}")

        # Python version
        import sys
        info.append(f"Python: {sys.version.split()[0]}")

        # Disk space
        df = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
        if df.returncode == 0:
            lines = df.stdout.strip().split('\n')
            if len(lines) > 1:
                info.append(f"Disk: {lines[1].split()[3]} available")

        output = "\n".join(info)
        duration = int((time.time() - start) * 1000)
        return ToolResult(True, output, "sysinfo", duration)

    except Exception as e:
        return ToolResult(False, str(e), "sysinfo", 0)


def tool_processes(filter_str: str = None) -> ToolResult:
    """List running processes."""
    cmd = "ps aux"
    if filter_str:
        cmd += f" | grep -i {filter_str}"
    return tool_shell(cmd)


# ═══════════════════════════════════════════════════════════════════════════════
# TOOL REGISTRY
# ═══════════════════════════════════════════════════════════════════════════════

TOOLS = {
    # File tools
    "read": Tool(
        name="read",
        description="Read contents of a file",
        usage="read <filepath> [lines]",
        handler=lambda args: tool_read_file(args[0], int(args[1]) if len(args) > 1 else 50),
        category="file"
    ),
    "ls": Tool(
        name="ls",
        description="List directory contents",
        usage="ls [path] [-a]",
        handler=lambda args: tool_list_dir(args[0] if args else ".", "-a" in args),
        category="file"
    ),
    "find": Tool(
        name="find",
        description="Find files matching pattern",
        usage="find <pattern> [path]",
        handler=lambda args: tool_find_files(args[0], args[1] if len(args) > 1 else "."),
        category="file"
    ),

    # Shell tools
    "shell": Tool(
        name="shell",
        description="Execute shell command (read-only)",
        usage="shell <command>",
        handler=lambda args: tool_shell(" ".join(args)),
        category="shell"
    ),

    # Git tools
    "git-status": Tool(
        name="git-status",
        description="Show git status",
        usage="git-status",
        handler=lambda args: tool_git_status(),
        category="git"
    ),
    "git-log": Tool(
        name="git-log",
        description="Show recent commits",
        usage="git-log [count]",
        handler=lambda args: tool_git_log(int(args[0]) if args else 10),
        category="git"
    ),
    "git-diff": Tool(
        name="git-diff",
        description="Show git diff",
        usage="git-diff [file]",
        handler=lambda args: tool_git_diff(args[0] if args else None),
        category="git"
    ),
    "git-branch": Tool(
        name="git-branch",
        description="List branches",
        usage="git-branch",
        handler=lambda args: tool_git_branch(),
        category="git"
    ),

    # Search tools
    "grep": Tool(
        name="grep",
        description="Search for pattern in files",
        usage="grep <pattern> [path] [file-pattern]",
        handler=lambda args: tool_grep(args[0], args[1] if len(args) > 1 else ".", args[2] if len(args) > 2 else "*"),
        category="search"
    ),
    "def": Tool(
        name="def",
        description="Search for function/class definitions",
        usage="def <name> [path]",
        handler=lambda args: tool_search_definition(args[0], args[1] if len(args) > 1 else "."),
        category="search"
    ),

    # System tools
    "sysinfo": Tool(
        name="sysinfo",
        description="Show system information",
        usage="sysinfo",
        handler=lambda args: tool_system_info(),
        category="system"
    ),
    "ps": Tool(
        name="ps",
        description="List processes",
        usage="ps [filter]",
        handler=lambda args: tool_processes(args[0] if args else None),
        category="system"
    ),
}


# ═══════════════════════════════════════════════════════════════════════════════
# TOOL EXECUTOR
# ═══════════════════════════════════════════════════════════════════════════════

class ToolExecutor:
    """
    Executes tools for Lucidia.
    Handles parsing, safety, and execution.
    """

    def __init__(self):
        self.tools = TOOLS
        self.history: List[Dict] = []

    def list_tools(self) -> str:
        """List available tools."""
        output = ["Available Tools:"]

        categories = {}
        for name, tool in self.tools.items():
            cat = tool.category
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(tool)

        for cat, tools in sorted(categories.items()):
            output.append(f"\n  [{cat}]")
            for tool in tools:
                output.append(f"    {tool.name:12} - {tool.description}")

        return "\n".join(output)

    def parse_command(self, text: str) -> Tuple[Optional[str], List[str]]:
        """Parse a tool command from text."""
        # Check for @tool syntax
        if text.startswith('@'):
            parts = text[1:].split(None, 1)
            tool_name = parts[0].lower()
            args = parts[1].split() if len(parts) > 1 else []
            return tool_name, args

        # Check for natural language tool triggers
        triggers = {
            r"read\s+file\s+(\S+)": ("read", lambda m: [m.group(1)]),
            r"list\s+files?\s*(?:in\s+)?(\S*)": ("ls", lambda m: [m.group(1)] if m.group(1) else []),
            r"find\s+(\S+)\s+files?": ("find", lambda m: [f"*{m.group(1)}*"]),
            r"search\s+for\s+['\"]?([^'\"]+)['\"]?": ("grep", lambda m: [m.group(1)]),
            r"git\s+status": ("git-status", lambda m: []),
            r"git\s+log": ("git-log", lambda m: []),
            r"git\s+diff": ("git-diff", lambda m: []),
            r"system\s+info": ("sysinfo", lambda m: []),
            r"show\s+processes": ("ps", lambda m: []),
        }

        for pattern, (tool_name, arg_fn) in triggers.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return tool_name, arg_fn(match)

        return None, []

    def execute(self, tool_name: str, args: List[str]) -> ToolResult:
        """Execute a tool."""
        if tool_name not in self.tools:
            return ToolResult(False, f"Unknown tool: {tool_name}\nUse @tools to list available tools", "executor", 0)

        tool = self.tools[tool_name]

        try:
            result = tool.handler(args)

            # Log to history
            self.history.append({
                "tool": tool_name,
                "args": args,
                "success": result.success,
                "timestamp": datetime.now().isoformat()
            })

            return result

        except Exception as e:
            return ToolResult(False, f"Tool error: {str(e)}", tool_name, 0)

    def run(self, text: str) -> Optional[ToolResult]:
        """Parse and run a tool command."""
        tool_name, args = self.parse_command(text)
        if tool_name:
            return self.execute(tool_name, args)
        return None

    def get_stats(self) -> Dict:
        """Get executor statistics."""
        return {
            "tools_available": len(self.tools),
            "commands_run": len(self.history),
            "successful": sum(1 for h in self.history if h["success"]),
        }
