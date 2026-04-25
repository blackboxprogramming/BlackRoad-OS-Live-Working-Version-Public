"""
BlackRoad Voice - Comprehensive Tool Executor
50+ tools for full system autonomy
"""
import os
import subprocess
import shutil
import sqlite3
import glob as glob_module
from typing import Dict
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from config.settings import FLEET, TIMEOUT
from config.context import load_current_context, load_recent_memory, update_context, sync_context_to_gist


class ToolExecutor:
    """Execute 50+ tools for complete system autonomy."""

    def __init__(self, working_dir: str = None):
        self.working_dir = working_dir or os.getcwd()
        self.home = os.path.expanduser("~")

    def execute(self, tool_name: str, params: str) -> str:
        """Execute tool, return result."""
        params = params.strip()

        try:
            # File operations
            if tool_name == "bash": return self._bash(params)
            if tool_name == "read": return self._read(params)
            if tool_name == "write": return self._write(params)
            if tool_name == "edit": return self._edit(params)
            if tool_name == "append": return self._append(params)
            if tool_name == "delete": return self._delete(params)
            if tool_name == "move": return self._move(params)
            if tool_name == "copy": return self._copy(params)
            if tool_name == "mkdir": return self._mkdir(params)
            if tool_name == "list": return self._list(params)
            if tool_name == "find": return self._find(params)
            if tool_name == "tree": return self._tree(params)
            if tool_name == "diff": return self._diff(params)
            if tool_name == "head": return self._head(params)
            if tool_name == "tail": return self._tail(params)

            # Git
            if tool_name == "git": return self._run(f"git {params}")

            # GitHub
            if tool_name == "github": return self._run(f"gh {params}", timeout=90)

            # Cloudflare
            if tool_name == "cloudflare": return self._run(f"wrangler {params}", timeout=180)

            # Railway
            if tool_name == "railway": return self._run(f"railway {params}", timeout=120)

            # SSH & Fleet
            if tool_name == "ssh": return self._ssh(params)
            if tool_name == "fleet": return self._fleet(params)
            if tool_name == "fleet_status": return self._fleet_status()
            if tool_name == "scp": return self._scp(params)

            # Docker
            if tool_name == "docker": return self._run(f"docker {params}")
            if tool_name == "docker_remote": return self._docker_remote(params)

            # Package managers
            if tool_name == "npm": return self._run(f"npm {params}", timeout=180)
            if tool_name == "pip": return self._run(f"pip3 {params}", timeout=180)
            if tool_name == "brew": return self._run(f"brew {params}", timeout=300)

            # Databases
            if tool_name == "sqlite": return self._sqlite(params)

            # AI
            if tool_name == "ollama": return self._run(f"ollama {params}", timeout=180)
            if tool_name == "ollama_remote": return self._ollama_remote(params)

            # Context Bridge (cross-AI continuity)
            if tool_name == "context": return load_current_context()
            if tool_name == "context_update": return "Updated" if update_context(params) else "Failed"
            if tool_name == "context_sync": return sync_context_to_gist()
            if tool_name == "context_memory": return load_recent_memory(20)

            # BlackRoad ecosystem
            if tool_name == "memory_log": return self._memory_log(params)
            if tool_name == "memory_search": return self._memory_search(params)
            if tool_name == "codex_search": return self._codex_search(params)
            if tool_name == "task_list": return self._run("~/memory-task-marketplace.sh list")
            if tool_name == "task_claim": return self._run(f'~/memory-task-marketplace.sh claim "{params}"')
            if tool_name == "task_complete": return self._task_complete(params)
            if tool_name == "traffic_light": return self._traffic_light(params)

            # Stripe
            if tool_name == "stripe": return self._run(f"stripe {params}")

            # Networking
            if tool_name == "curl": return self._run(f"curl -s {params}", timeout=30)
            if tool_name == "ping": return self._run(f"ping -c 3 {params}", timeout=15)
            if tool_name == "dns": return self._run(f"dig +short {params}")
            if tool_name == "ports": return self._run("lsof -i -P | grep LISTEN | head -20")

            # System
            if tool_name == "ps": return self._run(f"ps aux | grep -i '{params}' | head -20") if params else self._run("ps aux | head -20")
            if tool_name == "kill": return self._run(f"kill {params}") if params.isdigit() else self._run(f"pkill -f '{params}'")
            if tool_name == "env": return self._env(params)
            if tool_name == "system": return self._system()
            if tool_name == "disk": return self._run("df -h | head -10")

            # Planning
            if tool_name == "plan": return f"Plan:\n{params}"
            if tool_name == "think": return f"(thinking: {params[:100]}...)"

            return f"Unknown tool: {tool_name}"

        except Exception as e:
            return f"Tool error ({tool_name}): {e}"

    def _run(self, cmd: str, timeout: int = 60, cwd: str = None) -> str:
        """Run shell command."""
        try:
            result = subprocess.run(
                cmd, shell=True, cwd=cwd or self.working_dir,
                capture_output=True, text=True, timeout=timeout
            )
            output = result.stdout + result.stderr
            return output[:5000] if output else "(no output)"
        except subprocess.TimeoutExpired:
            return f"Timeout after {timeout}s"
        except Exception as e:
            return f"Error: {e}"

    def _resolve(self, path: str) -> str:
        """Resolve path."""
        if path.startswith("~"):
            return os.path.expanduser(path)
        if not os.path.isabs(path):
            return os.path.join(self.working_dir, path)
        return path

    def _parse(self, params: str) -> Dict[str, str]:
        """Parse key: value params."""
        result = {}
        current_key = None
        current_lines = []

        for line in params.split('\n'):
            if ':' in line and not current_key:
                key, _, value = line.partition(':')
                key = key.strip().lower()
                value = value.strip()
                if value:
                    result[key] = value
                else:
                    current_key = key
            elif current_key:
                current_lines.append(line)
            elif line.strip():
                result['_default'] = line.strip()

        if current_key and current_lines:
            result[current_key] = '\n'.join(current_lines)

        return result

    # File operations
    def _bash(self, cmd: str) -> str:
        return self._run(cmd, timeout=TIMEOUT)

    def _read(self, path: str) -> str:
        path = self._resolve(path)
        try:
            with open(path, 'r') as f:
                content = f.read()
            return content[:10000]
        except Exception as e:
            return f"Error: {e}"

    def _write(self, params: str) -> str:
        p = self._parse(params)
        path = self._resolve(p.get('path', ''))
        content = p.get('content', '')
        if not path:
            return "Error: no path"
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w') as f:
                f.write(content)
            return f"Wrote {len(content)} bytes to {path}"
        except Exception as e:
            return f"Error: {e}"

    def _edit(self, params: str) -> str:
        p = self._parse(params)
        path = self._resolve(p.get('path', ''))
        old, new = p.get('old', ''), p.get('new', '')
        try:
            with open(path, 'r') as f:
                content = f.read()
            if old not in content:
                return f"Text not found in {path}"
            with open(path, 'w') as f:
                f.write(content.replace(old, new, 1))
            return f"Edited {path}"
        except Exception as e:
            return f"Error: {e}"

    def _append(self, params: str) -> str:
        p = self._parse(params)
        path = self._resolve(p.get('path', ''))
        content = p.get('content', '')
        try:
            with open(path, 'a') as f:
                f.write(content)
            return f"Appended to {path}"
        except Exception as e:
            return f"Error: {e}"

    def _delete(self, path: str) -> str:
        path = self._resolve(path)
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
            return f"Deleted {path}"
        except Exception as e:
            return f"Error: {e}"

    def _move(self, params: str) -> str:
        p = self._parse(params)
        src, dst = self._resolve(p.get('from', '')), self._resolve(p.get('to', ''))
        try:
            shutil.move(src, dst)
            return f"Moved {src} -> {dst}"
        except Exception as e:
            return f"Error: {e}"

    def _copy(self, params: str) -> str:
        p = self._parse(params)
        src, dst = self._resolve(p.get('from', '')), self._resolve(p.get('to', ''))
        try:
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
            return f"Copied {src} -> {dst}"
        except Exception as e:
            return f"Error: {e}"

    def _mkdir(self, path: str) -> str:
        try:
            os.makedirs(self._resolve(path), exist_ok=True)
            return f"Created {path}"
        except Exception as e:
            return f"Error: {e}"

    def _list(self, path: str) -> str:
        path = self._resolve(path) if path else self.working_dir
        try:
            entries = []
            for e in sorted(os.listdir(path))[:100]:
                full = os.path.join(path, e)
                is_dir = os.path.isdir(full)
                prefix = "📁" if is_dir else "📄"
                entries.append(f"{prefix} {e}")
            return '\n'.join(entries) or "(empty)"
        except Exception as e:
            return f"Error: {e}"

    def _find(self, params: str) -> str:
        p = self._parse(params)
        path = self._resolve(p.get('path', self.working_dir))
        pattern = p.get('pattern', '**/*')
        try:
            files = list(glob_module.glob(os.path.join(path, pattern), recursive=True))[:100]
            return '\n'.join(files) if files else "No matches"
        except Exception as e:
            return f"Error: {e}"

    def _tree(self, path: str) -> str:
        return self._run(f"find '{self._resolve(path) or self.working_dir}' -maxdepth 3 | head -50")

    def _diff(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f"diff '{self._resolve(p.get('file1', ''))}' '{self._resolve(p.get('file2', ''))}'")

    def _head(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f"head -n {p.get('lines', '20')} '{self._resolve(p.get('path', ''))}'")

    def _tail(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f"tail -n {p.get('lines', '20')} '{self._resolve(p.get('path', ''))}'")

    # SSH & Fleet
    def _ssh(self, params: str) -> str:
        p = self._parse(params)
        host, cmd = p.get('host', ''), p.get('command', '')
        if not host or not cmd:
            return "Error: need host and command"
        return self._run(f"ssh -o ConnectTimeout=10 -o BatchMode=yes {host} '{cmd}'", timeout=60)

    def _fleet(self, cmd: str) -> str:
        results = []
        for host in FLEET.keys():
            try:
                result = subprocess.run(
                    f"ssh -o ConnectTimeout=5 -o BatchMode=yes {host} '{cmd}'",
                    shell=True, capture_output=True, text=True, timeout=30
                )
                out = result.stdout.strip() or result.stderr.strip() or "(no output)"
                results.append(f"[{host}] {out[:200]}")
            except:
                results.append(f"[{host}] OFFLINE")
        return '\n'.join(results)

    def _fleet_status(self) -> str:
        results = []
        for host, info in FLEET.items():
            try:
                result = subprocess.run(
                    f"ssh -o ConnectTimeout=3 -o BatchMode=yes {host} 'echo OK'",
                    shell=True, capture_output=True, text=True, timeout=10
                )
                status = "🟢" if result.returncode == 0 else "🔴"
            except:
                status = "🔴"
            results.append(f"{status} {host} ({info['role']})")
        return '\n'.join(results)

    def _scp(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f"scp -o ConnectTimeout=10 '{p.get('from', '')}' '{p.get('to', '')}'", timeout=300)

    def _docker_remote(self, params: str) -> str:
        p = self._parse(params)
        host, cmd = p.get('host', 'lucidia'), p.get('command', 'ps')
        return self._run(f"ssh -o ConnectTimeout=10 {host} 'docker {cmd}'", timeout=60)

    # Database
    def _sqlite(self, params: str) -> str:
        p = self._parse(params)
        db = self._resolve(p.get('db', ''))
        query = p.get('query', '')
        try:
            conn = sqlite3.connect(db)
            cursor = conn.cursor()
            cursor.execute(query)
            if query.strip().upper().startswith('SELECT'):
                rows = cursor.fetchall()[:50]
                cols = [d[0] for d in cursor.description] if cursor.description else []
                result = ' | '.join(cols) + '\n' + '-' * 50 + '\n'
                for row in rows:
                    result += ' | '.join(str(c) for c in row) + '\n'
                return result
            else:
                conn.commit()
                return f"Affected {cursor.rowcount} rows"
        except Exception as e:
            return f"Error: {e}"
        finally:
            conn.close()

    def _ollama_remote(self, params: str) -> str:
        p = self._parse(params)
        host = p.get('host', 'lucidia')
        model = p.get('model', 'llama3.2:3b')
        prompt = p.get('prompt', '')
        if not prompt:
            return "Error: no prompt"
        return self._run(f'''ssh -o ConnectTimeout=10 {host} "echo '{prompt}' | ollama run {model}"''', timeout=120)

    # BlackRoad
    def _memory_log(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f'~/memory-system.sh log "{p.get("action", "")}" "{p.get("entity", "")}" "{p.get("details", "")}" "{p.get("tags", "")}"')

    def _memory_search(self, query: str) -> str:
        return self._run(f'grep -i "{query}" ~/.blackroad/memory/journals/master-journal.jsonl | tail -15')

    def _codex_search(self, query: str) -> str:
        return self._run(f'python3 ~/blackroad-codex-search.py "{query}"', timeout=30)

    def _task_complete(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f'~/memory-task-marketplace.sh complete "{p.get("id", "")}" "{p.get("summary", "")}"')

    def _traffic_light(self, params: str) -> str:
        p = self._parse(params)
        return self._run(f'~/blackroad-traffic-light.sh set "{p.get("project", "")}" {p.get("status", "green")} "{p.get("reason", "")}"')

    def _env(self, params: str) -> str:
        if '=' in params:
            key, _, value = params.partition('=')
            os.environ[key.strip()] = value.strip()
            return f"Set {key.strip()}"
        elif params:
            return os.environ.get(params, "(not set)")
        return self._run("env | head -30")

    def _system(self) -> str:
        return '\n'.join([
            f"OS: {self._run('uname -a').strip()}",
            f"Uptime: {self._run('uptime').strip()}"
        ])
