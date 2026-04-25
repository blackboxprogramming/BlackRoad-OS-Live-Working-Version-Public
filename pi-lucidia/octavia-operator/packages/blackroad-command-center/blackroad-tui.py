#!/usr/bin/env python3
"""
BLACKROAD OS - Terminal User Interface
======================================
Terminal-native operating interface.
Runs in any xterm-256color terminal, tmux, SSH.

Requirements: pip install textual
Run: python3 blackroad-tui.py
"""

import asyncio
import subprocess
import socket
from datetime import datetime
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical, ScrollableContainer
from textual.widgets import Static, Input, Footer, Header
from textual.binding import Binding
from textual.reactive import reactive

# ============================================================================
# COLOR SYSTEM - SEMANTIC ONLY
# ============================================================================
# Grayscale: background BLACK, panels dark gray, text WHITE
# Orange  = actions/decisions
# Pink    = memory/state
# Purple  = logic/orchestration
# Blue    = system/IO

COLORS = {
    "bg": "#000000",
    "panel": "#111111",
    "border": "#333333",
    "text": "#ffffff",
    "muted": "#666666",
    "orange": "#F5A623",   # actions
    "pink": "#FF1D6C",     # memory/state
    "purple": "#9C27B0",   # logic
    "blue": "#2979FF",     # system
}

# ============================================================================
# FLEET CONFIGURATION
# ============================================================================
FLEET = {
    "cecilia":  {"ip": "192.168.4.89", "role": "primary",   "status": "online"},
    "lucidia":  {"ip": "192.168.4.81", "role": "inference", "status": "online"},
    "aria":     {"ip": "192.168.4.82", "role": "harmony",   "status": "online"},
    "octavia":  {"ip": "192.168.4.83", "role": "multi-arm", "status": "online"},
    "alice":    {"ip": "192.168.4.84", "role": "gateway",   "status": "offline"},
    "shellfish":{"ip": "vps",          "role": "edge",      "status": "online"},
    "blackroad os":    {"ip": "vps",          "role": "cloud",     "status": "online"},
}

TABS = ["chat", "github", "projects", "sales", "web", "ops", "council"]

# ============================================================================
# CSS - TERMINAL NATIVE STYLING
# ============================================================================
CSS = """
Screen {
    background: #000000;
}

#top-bar {
    dock: top;
    height: 1;
    background: #1a1a1a;
    color: #ffffff;
    padding: 0 1;
}

.brand {
    color: #FF1D6C;
    text-style: bold;
}

.status-text {
    color: #666666;
}

.status-ok {
    color: #4ade80;
}

#main-container {
    height: 100%;
}

#left-panel {
    width: 70%;
    border-right: solid #333333;
    background: #0a0a0a;
}

#right-panel {
    width: 30%;
    background: #0a0a0a;
}

.panel-header {
    height: 1;
    background: #1a1a1a;
    color: #666666;
    padding: 0 1;
    text-style: bold;
}

#output-area {
    height: 1fr;
    padding: 0 1;
    background: #000000;
}

.output-line {
    color: #cccccc;
}

.output-prompt {
    color: #ffffff;
}

.output-system {
    color: #2979FF;
}

.output-agent {
    color: #FF1D6C;
}

.output-action {
    color: #F5A623;
}

#input-area {
    dock: bottom;
    height: 3;
    background: #111111;
    border-top: solid #333333;
    padding: 0 1;
}

#command-input {
    background: #1a1a1a;
    border: none;
    color: #ffffff;
}

#command-input:focus {
    border: none;
}

#agents-list {
    height: 1fr;
    padding: 0 1;
}

.agent-row {
    height: 1;
    padding: 0 1;
}

.agent-name {
    color: #ffffff;
}

.agent-role {
    color: #666666;
}

.agent-online {
    color: #4ade80;
}

.agent-offline {
    color: #666666;
}

#tabs-area {
    height: auto;
    padding: 0 1;
    background: #111111;
    border-top: solid #333333;
}

.tab {
    color: #666666;
    padding: 0 1;
}

.tab-active {
    color: #ffffff;
    background: #333333;
}

#bottom-bar {
    dock: bottom;
    height: 1;
    background: #1a1a1a;
    color: #666666;
    padding: 0 1;
}

.key-hint {
    color: #F5A623;
}
"""

# ============================================================================
# WIDGETS
# ============================================================================

class TopBar(Static):
    """System top bar with brand and status."""

    def compose(self) -> ComposeResult:
        yield Static(self.render_bar())

    def render_bar(self) -> str:
        online = sum(1 for a in FLEET.values() if a["status"] == "online")
        total = len(FLEET)
        time_str = datetime.now().strftime("%H:%M")
        return f"[bold #FF1D6C]BLACKROAD[/] [#666666]OS[/]  [#666666]|[/]  [#4ade80]{online}[/][#666666]/{total} nodes[/]  [#666666]|[/]  [#666666]{time_str}[/]"


class OutputArea(ScrollableContainer):
    """Main output/chat area."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.lines = []

    def on_mount(self):
        # Initial system messages
        self.add_line("[#2979FF]system:[/] blackroad os initialized", "system")
        self.add_line("[#2979FF]system:[/] fleet scan complete", "system")
        self.add_line("[#FF1D6C]lucidia:[/] hailo-8 ready, 26 TOPS available", "agent")
        self.add_line("[#FF1D6C]cecilia:[/] primary node online", "agent")
        self.add_line("[#666666]─────────────────────────────────────[/]", "divider")

    def add_line(self, text: str, line_type: str = "output"):
        line = Static(text, classes=f"output-{line_type}")
        self.mount(line)
        self.scroll_end()

    def add_command(self, cmd: str):
        self.add_line(f"[#ffffff]>[/] {cmd}", "prompt")

    def add_response(self, text: str):
        self.add_line(f"  {text}", "line")


class AgentsList(Static):
    """Fleet agents status panel."""

    def compose(self) -> ComposeResult:
        yield Static("[#666666]FLEET AGENTS[/]", classes="panel-header")
        for name, info in FLEET.items():
            status_color = "#4ade80" if info["status"] == "online" else "#666666"
            status_char = "●" if info["status"] == "online" else "○"
            yield Static(
                f"[{status_color}]{status_char}[/] [{('#ffffff' if info['status'] == 'online' else '#666666')}]{name:10}[/] [#666666]{info['role']}[/]",
                classes="agent-row"
            )


class TabsBar(Static):
    """Mode/tab selector."""

    current_tab = reactive(0)

    def render(self) -> str:
        parts = []
        for i, tab in enumerate(TABS):
            if i == self.current_tab:
                parts.append(f"[bold #ffffff on #333333] {i+1}:{tab} [/]")
            else:
                parts.append(f"[#666666] {i+1}:{tab} [/]")
        return " ".join(parts)

    def set_tab(self, index: int):
        if 0 <= index < len(TABS):
            self.current_tab = index


class BottomBar(Static):
    """Key bindings and mode indicator."""

    def render(self) -> str:
        return "[#F5A623]1-7[/][#666666]:tabs[/]  [#F5A623]/[/][#666666]:cmd[/]  [#F5A623]s[/][#666666]:status[/]  [#F5A623]r[/][#666666]:refresh[/]  [#F5A623]q[/][#666666]:quit[/]  [#666666]|[/]  [#9C27B0]MODE:[/] [#ffffff]normal[/]"


# ============================================================================
# MAIN APPLICATION
# ============================================================================

class BlackRoadOS(App):
    """BlackRoad OS Terminal Interface."""

    CSS = CSS
    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("1", "tab_1", "Chat", show=False),
        Binding("2", "tab_2", "GitHub", show=False),
        Binding("3", "tab_3", "Projects", show=False),
        Binding("4", "tab_4", "Sales", show=False),
        Binding("5", "tab_5", "Web", show=False),
        Binding("6", "tab_6", "Ops", show=False),
        Binding("7", "tab_7", "Council", show=False),
        Binding("s", "status", "Status", show=False),
        Binding("r", "refresh", "Refresh", show=False),
        Binding("/", "focus_input", "Command", show=False),
    ]

    def compose(self) -> ComposeResult:
        yield Static(id="top-bar")
        with Horizontal(id="main-container"):
            with Vertical(id="left-panel"):
                yield Static("[#666666]TERMINAL[/]", classes="panel-header")
                yield OutputArea(id="output-area")
                with Container(id="input-area"):
                    yield Input(placeholder="> enter command...", id="command-input")
            with Vertical(id="right-panel"):
                yield AgentsList(id="agents-list")
                yield TabsBar(id="tabs-area")
        yield Static(id="bottom-bar")

    def on_mount(self):
        # Render top bar
        top = self.query_one("#top-bar", Static)
        online = sum(1 for a in FLEET.values() if a["status"] == "online")
        total = len(FLEET)
        time_str = datetime.now().strftime("%H:%M")
        top.update(f"[bold #FF1D6C]BLACKROAD[/] [#666666]OS[/]  [#666666]|[/]  [#4ade80]{online}[/][#666666]/{total} nodes[/]  [#666666]|[/]  [#666666]{time_str}[/]")

        # Render bottom bar
        bottom = self.query_one("#bottom-bar", Static)
        bottom.update("[#F5A623]1-7[/][#666666]:tabs[/]  [#F5A623]/[/][#666666]:cmd[/]  [#F5A623]s[/][#666666]:status[/]  [#F5A623]r[/][#666666]:refresh[/]  [#F5A623]q[/][#666666]:quit[/]  [#666666]|[/]  [#9C27B0]MODE:[/] [#ffffff]normal[/]")

    def on_input_submitted(self, event: Input.Submitted):
        """Handle command input."""
        cmd = event.value.strip()
        if not cmd:
            return

        output = self.query_one("#output-area", OutputArea)
        output.add_command(cmd)

        # Process commands
        if cmd == "status" or cmd == "s":
            self.show_status(output)
        elif cmd == "fleet":
            self.show_fleet(output)
        elif cmd == "help" or cmd == "?":
            self.show_help(output)
        elif cmd.startswith("ssh "):
            self.ssh_command(cmd[4:], output)
        elif cmd.startswith("ask "):
            self.ask_agent(cmd[4:], output)
        elif cmd == "clear":
            output.remove_children()
        else:
            # Execute as shell command
            self.run_shell(cmd, output)

        # Clear input
        event.input.value = ""

    def show_status(self, output: OutputArea):
        output.add_response("[#2979FF]SYSTEM STATUS[/]")
        online = sum(1 for a in FLEET.values() if a["status"] == "online")
        output.add_response(f"  nodes: {online}/{len(FLEET)} online")
        output.add_response(f"  mode:  normal")
        output.add_response(f"  tab:   {TABS[self.query_one('#tabs-area', TabsBar).current_tab]}")

    def show_fleet(self, output: OutputArea):
        output.add_response("[#2979FF]FLEET[/]")
        for name, info in FLEET.items():
            status = "[#4ade80]online[/]" if info["status"] == "online" else "[#666666]offline[/]"
            output.add_response(f"  {name:10} {status:20} {info['role']}")

    def show_help(self, output: OutputArea):
        output.add_response("[#F5A623]COMMANDS[/]")
        output.add_response("  status     show system status")
        output.add_response("  fleet      list fleet nodes")
        output.add_response("  ssh <node> connect to node")
        output.add_response("  ask <msg>  query agents")
        output.add_response("  clear      clear output")
        output.add_response("  <cmd>      run shell command")

    def ssh_command(self, node: str, output: OutputArea):
        if node in FLEET:
            if FLEET[node]["status"] == "online":
                output.add_response(f"[#F5A623]connecting to {node}...[/]")
                # In real use, this would open SSH
            else:
                output.add_response(f"[#666666]{node} is offline[/]")
        else:
            output.add_response(f"[#666666]unknown node: {node}[/]")

    def ask_agent(self, msg: str, output: OutputArea):
        output.add_response(f"[#FF1D6C]lucidia:[/] processing: {msg}")
        output.add_response(f"[#666666]  (agent response would appear here)[/]")

    def run_shell(self, cmd: str, output: OutputArea):
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=10
            )
            if result.stdout:
                for line in result.stdout.strip().split('\n')[:20]:
                    output.add_response(line)
            if result.stderr:
                output.add_response(f"[#666666]{result.stderr.strip()}[/]")
        except subprocess.TimeoutExpired:
            output.add_response("[#666666]command timed out[/]")
        except Exception as e:
            output.add_response(f"[#666666]error: {e}[/]")

    # Tab actions
    def action_tab_1(self): self.query_one("#tabs-area", TabsBar).set_tab(0)
    def action_tab_2(self): self.query_one("#tabs-area", TabsBar).set_tab(1)
    def action_tab_3(self): self.query_one("#tabs-area", TabsBar).set_tab(2)
    def action_tab_4(self): self.query_one("#tabs-area", TabsBar).set_tab(3)
    def action_tab_5(self): self.query_one("#tabs-area", TabsBar).set_tab(4)
    def action_tab_6(self): self.query_one("#tabs-area", TabsBar).set_tab(5)
    def action_tab_7(self): self.query_one("#tabs-area", TabsBar).set_tab(6)

    def action_status(self):
        output = self.query_one("#output-area", OutputArea)
        self.show_status(output)

    def action_refresh(self):
        output = self.query_one("#output-area", OutputArea)
        output.add_line("[#2979FF]system:[/] refreshing fleet status...", "system")

    def action_focus_input(self):
        self.query_one("#command-input", Input).focus()


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    app = BlackRoadOS()
    app.run()
