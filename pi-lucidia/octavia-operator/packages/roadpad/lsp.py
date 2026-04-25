"""
RoadPad LSP Integration - Language Server Protocol.

Features:
- Diagnostics (errors, warnings)
- Completions
- Hover info
- Go to definition
"""

import os
import json
import subprocess
import threading
from dataclasses import dataclass, field
from typing import Dict, List, Any, Callable
from queue import Queue


@dataclass
class Diagnostic:
    """A diagnostic message."""
    filepath: str
    line: int
    col: int
    end_line: int = 0
    end_col: int = 0
    message: str = ""
    severity: int = 1  # 1=error, 2=warning, 3=info, 4=hint
    source: str = ""

    @property
    def severity_name(self) -> str:
        return {1: "error", 2: "warning", 3: "info", 4: "hint"}.get(self.severity, "?")

    @property
    def icon(self) -> str:
        return {1: "!", 2: "~", 3: "i", 4: "?"}.get(self.severity, "?")


@dataclass
class CompletionItem:
    """An LSP completion item."""
    label: str
    kind: int = 1
    detail: str = ""
    documentation: str = ""
    insert_text: str = ""

    @property
    def kind_name(self) -> str:
        kinds = {
            1: "text", 2: "method", 3: "function", 4: "constructor",
            5: "field", 6: "variable", 7: "class", 8: "interface",
            9: "module", 10: "property", 11: "unit", 12: "value",
            13: "enum", 14: "keyword", 15: "snippet", 16: "color",
            17: "file", 18: "reference", 19: "folder", 20: "constant"
        }
        return kinds.get(self.kind, "?")


@dataclass
class Location:
    """A source location."""
    filepath: str
    line: int
    col: int


class LSPClient:
    """Language Server Protocol client."""

    def __init__(self, language: str, command: List[str]):
        self.language = language
        self.command = command
        self.process: subprocess.Popen | None = None
        self.request_id = 0
        self.pending: Dict[int, Any] = {}
        self.initialized = False

        self.diagnostics: Dict[str, List[Diagnostic]] = {}
        self.on_diagnostics: Callable[[str, List[Diagnostic]], None] | None = None

        self._reader_thread: threading.Thread | None = None
        self._running = False

    def start(self) -> bool:
        """Start the language server."""
        try:
            self.process = subprocess.Popen(
                self.command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self._running = True
            self._reader_thread = threading.Thread(target=self._read_loop, daemon=True)
            self._reader_thread.start()
            return True
        except Exception as e:
            return False

    def stop(self) -> None:
        """Stop the language server."""
        self._running = False
        if self.process:
            self.process.terminate()
            self.process = None

    def _send(self, method: str, params: Dict) -> int:
        """Send a request."""
        if not self.process or not self.process.stdin:
            return -1

        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method,
            "params": params
        }
        content = json.dumps(request)
        message = f"Content-Length: {len(content)}\r\n\r\n{content}"

        try:
            self.process.stdin.write(message.encode())
            self.process.stdin.flush()
            return self.request_id
        except:
            return -1

    def _notify(self, method: str, params: Dict) -> None:
        """Send a notification (no response expected)."""
        if not self.process or not self.process.stdin:
            return

        notification = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params
        }
        content = json.dumps(notification)
        message = f"Content-Length: {len(content)}\r\n\r\n{content}"

        try:
            self.process.stdin.write(message.encode())
            self.process.stdin.flush()
        except:
            pass

    def _read_loop(self) -> None:
        """Read responses from server."""
        if not self.process or not self.process.stdout:
            return

        while self._running:
            try:
                # Read headers
                headers = {}
                while True:
                    line = self.process.stdout.readline().decode().strip()
                    if not line:
                        break
                    if ": " in line:
                        key, value = line.split(": ", 1)
                        headers[key] = value

                if "Content-Length" not in headers:
                    continue

                # Read content
                length = int(headers["Content-Length"])
                content = self.process.stdout.read(length).decode()
                message = json.loads(content)

                self._handle_message(message)
            except:
                if not self._running:
                    break

    def _handle_message(self, message: Dict) -> None:
        """Handle incoming message."""
        if "id" in message and message["id"] in self.pending:
            # Response to our request
            callback = self.pending.pop(message["id"])
            if callback:
                callback(message.get("result"), message.get("error"))
        elif "method" in message:
            # Notification from server
            self._handle_notification(message["method"], message.get("params", {}))

    def _handle_notification(self, method: str, params: Dict) -> None:
        """Handle server notification."""
        if method == "textDocument/publishDiagnostics":
            uri = params.get("uri", "")
            filepath = uri.replace("file://", "")
            diagnostics = []

            for d in params.get("diagnostics", []):
                rng = d.get("range", {})
                start = rng.get("start", {})
                end = rng.get("end", {})

                diagnostics.append(Diagnostic(
                    filepath=filepath,
                    line=start.get("line", 0),
                    col=start.get("character", 0),
                    end_line=end.get("line", 0),
                    end_col=end.get("character", 0),
                    message=d.get("message", ""),
                    severity=d.get("severity", 1),
                    source=d.get("source", "")
                ))

            self.diagnostics[filepath] = diagnostics
            if self.on_diagnostics:
                self.on_diagnostics(filepath, diagnostics)

    def initialize(self, root_path: str) -> None:
        """Initialize the server."""
        params = {
            "processId": os.getpid(),
            "rootPath": root_path,
            "rootUri": f"file://{root_path}",
            "capabilities": {
                "textDocument": {
                    "completion": {"completionItem": {"snippetSupport": True}},
                    "hover": {},
                    "definition": {},
                    "references": {},
                    "diagnostics": {}
                }
            }
        }
        self._send("initialize", params)
        self.initialized = True
        self._notify("initialized", {})

    def did_open(self, filepath: str, content: str, language: str = "") -> None:
        """Notify file opened."""
        self._notify("textDocument/didOpen", {
            "textDocument": {
                "uri": f"file://{filepath}",
                "languageId": language or self.language,
                "version": 1,
                "text": content
            }
        })

    def did_change(self, filepath: str, content: str, version: int = 1) -> None:
        """Notify file changed."""
        self._notify("textDocument/didChange", {
            "textDocument": {"uri": f"file://{filepath}", "version": version},
            "contentChanges": [{"text": content}]
        })

    def did_close(self, filepath: str) -> None:
        """Notify file closed."""
        self._notify("textDocument/didClose", {
            "textDocument": {"uri": f"file://{filepath}"}
        })

    def completion(self, filepath: str, line: int, col: int,
                   callback: Callable[[List[CompletionItem]], None]) -> None:
        """Request completions."""
        def handle_response(result, error):
            items = []
            if result:
                item_list = result.get("items", result) if isinstance(result, dict) else result
                for item in item_list:
                    items.append(CompletionItem(
                        label=item.get("label", ""),
                        kind=item.get("kind", 1),
                        detail=item.get("detail", ""),
                        documentation=str(item.get("documentation", "")),
                        insert_text=item.get("insertText", item.get("label", ""))
                    ))
            callback(items)

        req_id = self._send("textDocument/completion", {
            "textDocument": {"uri": f"file://{filepath}"},
            "position": {"line": line, "character": col}
        })
        if req_id > 0:
            self.pending[req_id] = handle_response

    def hover(self, filepath: str, line: int, col: int,
              callback: Callable[[str], None]) -> None:
        """Request hover info."""
        def handle_response(result, error):
            if result and "contents" in result:
                contents = result["contents"]
                if isinstance(contents, str):
                    callback(contents)
                elif isinstance(contents, dict):
                    callback(contents.get("value", ""))
                elif isinstance(contents, list):
                    callback("\n".join(str(c) for c in contents))
            else:
                callback("")

        req_id = self._send("textDocument/hover", {
            "textDocument": {"uri": f"file://{filepath}"},
            "position": {"line": line, "character": col}
        })
        if req_id > 0:
            self.pending[req_id] = handle_response

    def definition(self, filepath: str, line: int, col: int,
                   callback: Callable[[Location | None], None]) -> None:
        """Go to definition."""
        def handle_response(result, error):
            if result:
                loc = result[0] if isinstance(result, list) else result
                uri = loc.get("uri", "")
                rng = loc.get("range", {}).get("start", {})
                callback(Location(
                    filepath=uri.replace("file://", ""),
                    line=rng.get("line", 0),
                    col=rng.get("character", 0)
                ))
            else:
                callback(None)

        req_id = self._send("textDocument/definition", {
            "textDocument": {"uri": f"file://{filepath}"},
            "position": {"line": line, "character": col}
        })
        if req_id > 0:
            self.pending[req_id] = handle_response


# Language server configurations
LSP_SERVERS: Dict[str, List[str]] = {
    "python": ["pyright-langserver", "--stdio"],
    "typescript": ["typescript-language-server", "--stdio"],
    "javascript": ["typescript-language-server", "--stdio"],
    "rust": ["rust-analyzer"],
    "go": ["gopls"],
    "c": ["clangd"],
    "cpp": ["clangd"],
}


class LSPManager:
    """Manages LSP clients."""

    def __init__(self):
        self.clients: Dict[str, LSPClient] = {}
        self.root_path = os.getcwd()

    def get_client(self, language: str) -> LSPClient | None:
        """Get or create client for language."""
        if language in self.clients:
            return self.clients[language]

        if language not in LSP_SERVERS:
            return None

        client = LSPClient(language, LSP_SERVERS[language])
        if client.start():
            client.initialize(self.root_path)
            self.clients[language] = client
            return client
        return None

    def detect_language(self, filepath: str) -> str:
        """Detect language from file extension."""
        ext = os.path.splitext(filepath)[1].lower()
        return {
            ".py": "python",
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".rs": "rust",
            ".go": "go",
            ".c": "c",
            ".h": "c",
            ".cpp": "cpp",
            ".hpp": "cpp",
        }.get(ext, "")

    def stop_all(self) -> None:
        """Stop all clients."""
        for client in self.clients.values():
            client.stop()
        self.clients.clear()


# Global manager
_manager: LSPManager | None = None

def get_lsp_manager() -> LSPManager:
    """Get global LSP manager."""
    global _manager
    if _manager is None:
        _manager = LSPManager()
    return _manager
