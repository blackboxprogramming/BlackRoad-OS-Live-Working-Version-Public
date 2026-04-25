"""
BlackRoad Voice - Main CLI
"""
import os
import re
import json
import threading
import time
from datetime import datetime
from typing import Tuple
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.table import Table

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings
from config.prompt import SYSTEM_PROMPT
from config.context import load_current_context, get_context_summary, update_context
from src.engines.speech import VoiceRecognizer, TextToSpeech
from src.engines.llm import OllamaClient
from src.tools.executor import ToolExecutor

console = Console()


class Session:
    """Conversation session manager."""

    def __init__(self):
        self.file = settings.SESSION_FILE
        self.history = []
        self._load()

    def _load(self):
        try:
            if self.file.exists():
                data = json.loads(self.file.read_text())
                self.history = data.get('messages', [])[-settings.MAX_CONTEXT:]
        except:
            self.history = []

    def save(self):
        try:
            self.file.parent.mkdir(parents=True, exist_ok=True)
            self.file.write_text(json.dumps({
                'messages': self.history[-settings.MAX_CONTEXT:],
                'timestamp': datetime.now().isoformat()
            }))
        except:
            pass

    def add(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        if len(self.history) > settings.MAX_CONTEXT:
            self.history = self.history[-settings.MAX_CONTEXT:]

    def clear(self):
        self.history = []
        self.save()


class BlackRoadCLI:
    """Complete voice-first AI CLI."""

    def __init__(self):
        self.running = True
        self.use_fast = settings.USE_FAST
        self.auto_listen = settings.AUTO_LISTEN
        self.tts_enabled = settings.TTS_ENABLED

        # Initialize components
        self.voice = VoiceRecognizer(settings.WHISPER_MODEL)
        self.tts = TextToSpeech(settings.VOICE_NAME, enabled=self.tts_enabled)
        self.tools = ToolExecutor(str(settings.WORKING_DIR))
        self.session = Session()

        # LLM
        model = settings.FAST_MODEL if self.use_fast else settings.MODEL
        self.llm = OllamaClient(model)

        # System prompt with live context
        context_summary = get_context_summary()
        prompt = SYSTEM_PROMPT.format(
            cwd=settings.WORKING_DIR,
            home=settings.HOME
        )
        if context_summary:
            prompt += f"\n\n═══ LIVE CONTEXT (from ~/CURRENT_CONTEXT.md) ═══\n{context_summary}\n═══ END ═══"

        if not self.session.history or self.session.history[0].get('role') != 'system':
            self.session.history.insert(0, {"role": "system", "content": prompt})
        else:
            # Update system prompt with fresh context
            self.session.history[0]["content"] = prompt

    def banner(self):
        banner = """
[bold #FF1D6C]╔══════════════════════════════════════════════════════════════════════════╗[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]██████╗ ██╗      █████╗  ██████╗██╗  ██╗[/][bold #F5A623]██████╗  ██████╗  █████╗ ██████╗[/]   [bold #FF1D6C]║[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝[/][bold #F5A623]██╔══██╗██╔═══██╗██╔══██╗██╔══██╗[/]  [bold #FF1D6C]║[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]██████╔╝██║     ███████║██║     █████╔╝ [/][bold #F5A623]██████╔╝██║   ██║███████║██║  ██║[/]  [bold #FF1D6C]║[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]██╔══██╗██║     ██╔══██║██║     ██╔═██╗ [/][bold #F5A623]██╔══██╗██║   ██║██╔══██║██║  ██║[/]  [bold #FF1D6C]║[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]██████╔╝███████╗██║  ██║╚██████╗██║  ██╗[/][bold #F5A623]██║  ██║╚██████╔╝██║  ██║██████╔╝[/]  [bold #FF1D6C]║[/]
[bold #FF1D6C]║[/]  [bold #FF1D6C]╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝[/][bold #F5A623]╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ [/]   [bold #FF1D6C]║[/]
[bold #FF1D6C]╚══════════════════════════════════════════════════════════════════════════╝[/]
"""
        console.print(banner)
        console.print(f"[bold #2979FF]Sovereign AI Operating System[/] • [dim]backend:[/] [bold #9C27B0]{self.llm.model}[/]")
        console.print(f"[dim]BlackRoad > Ollama > {self.llm.model}[/dim]")
        console.print(f"[dim]{settings.WORKING_DIR}[/dim]\n")

        table = Table(show_header=False, box=None, padding=(0, 1))
        table.add_column(width=18)
        table.add_column(width=18)
        table.add_column(width=18)
        table.add_column(width=18)
        table.add_row("[cyan]📂 Files[/]", "[yellow]🐙 GitHub[/]", "[green]☁️ Cloudflare[/]", "[magenta]🚂 Railway[/]")
        table.add_row("[cyan]💾 Git[/]", "[yellow]🖥️ SSH Fleet[/]", "[green]🐳 Docker[/]", "[magenta]🧠 AI/Ollama[/]")
        table.add_row("[cyan]📦 npm/pip[/]", "[yellow]💳 Stripe[/]", "[green]🗄️ SQLite[/]", "[magenta]📝 Memory[/]")
        console.print(table)
        console.print()
        console.print("[bold green]🎤 Voice[/] on • [bold yellow]⌨️ Type[/] anytime • [bold magenta]/help[/] • [bold red]/quit[/]\n")

    def process_response(self, response: str) -> Tuple[str, int]:
        """Execute tools in response."""
        tool_pattern = r'<tool name="(\w+)">([\s\S]*?)</tool>'
        matches = re.findall(tool_pattern, response)

        if not matches:
            return response, 0

        tool_results = []
        for tool_name, params in matches:
            console.print(f"[yellow]⚡ {tool_name}[/]")
            result = self.tools.execute(tool_name, params)
            tool_results.append(f"[{tool_name}]\n{result}")

            display = result[:400] + "..." if len(result) > 400 else result
            console.print(Panel(display, title=f"[yellow]{tool_name}[/]", border_style="yellow", padding=(0, 1)))

        # Get summary
        self.session.add("assistant", response)
        self.session.add("user", "Tool results:\n" + "\n\n".join(tool_results) + "\n\nBrief spoken summary.")

        try:
            followup = self.llm.chat(self.session.history)

            if '<tool' in followup:
                nested_result, nested_count = self.process_response(followup)
                return nested_result, len(matches) + nested_count

            self.session.add("assistant", followup)
            return followup, len(matches)
        except Exception as e:
            return f"Error: {e}", len(matches)

    def chat(self, user_input: str):
        """Process user input."""
        if not user_input.strip():
            return

        console.print(f"\n[bold cyan]You:[/] {user_input}")
        self.session.add("user", user_input)

        with console.status(f"[bold yellow]Thinking ({self.llm.model})...[/]"):
            try:
                response = self.llm.chat(self.session.history)
            except Exception as e:
                console.print(f"[bold red]Error: {e}[/]")
                return

        final_response, tool_count = self.process_response(response)

        if tool_count == 0:
            self.session.add("assistant", final_response)

        console.print()
        title = f"[bold #FF1D6C]BlackRoad[/] [dim]({tool_count} tools)[/]" if tool_count else "[bold #FF1D6C]BlackRoad[/]"
        console.print(Panel(Markdown(final_response), title=title, border_style="#FF1D6C", padding=(0, 1)))

        self.tts.speak(final_response)
        self.session.save()

    def voice_loop(self):
        """Background voice listener."""
        while self.running and self.auto_listen:
            try:
                text = self.voice.listen()
                if text:
                    self.tts.stop()
                    self.chat(text)
            except:
                time.sleep(1)

    def help(self):
        help_text = """
[bold cyan]COMMANDS[/]
  /quit      Exit
  /voice     Toggle voice
  /tts       Toggle speech
  /fast      Toggle fast model
  /model X   Set model
  /clear     Clear history
  /fleet     Fleet status
  /status    System status
  /help      This help

[bold cyan]50+ TOOLS[/]
  Files, Git, GitHub, Cloudflare, Railway
  SSH Fleet, Docker, npm/pip/brew, SQLite
  Ollama, Memory, Codex, Stripe, Network
"""
        console.print(Panel(help_text, title="[bold]Help[/]", border_style="cyan"))

    def run(self):
        """Main loop."""
        self.banner()

        if self.auto_listen:
            threading.Thread(target=self.voice_loop, daemon=True).start()
            self.tts.speak("BlackRoad ready.")

        while self.running:
            try:
                user_input = input("\n> ").strip()

                if user_input.lower() in ['/quit', '/q', '/exit']:
                    self.running = False
                    self.session.save()
                    self.tts.speak("Goodbye")
                    break
                elif user_input.lower() == '/voice':
                    self.auto_listen = not self.auto_listen
                    console.print(f"[yellow]Voice: {'on' if self.auto_listen else 'off'}[/]")
                elif user_input.lower() == '/tts':
                    self.tts_enabled = self.tts.toggle()
                    console.print(f"[yellow]TTS: {'on' if self.tts_enabled else 'off'}[/]")
                elif user_input.lower() == '/fast':
                    self.use_fast = not self.use_fast
                    model = settings.FAST_MODEL if self.use_fast else settings.MODEL
                    self.llm.set_model(model)
                elif user_input.lower().startswith('/model '):
                    self.llm.set_model(user_input[7:].strip())
                elif user_input.lower() == '/clear':
                    self.session.clear()
                    console.print("[yellow]Cleared[/]")
                elif user_input.lower() == '/fleet':
                    console.print(self.tools._fleet_status())
                elif user_input.lower() == '/status':
                    console.print(self.tools._system())
                elif user_input.lower() == '/help':
                    self.help()
                elif user_input:
                    self.tts.stop()
                    self.chat(user_input)

            except KeyboardInterrupt:
                self.tts.stop()
                console.print("\n[dim](Ctrl+C stops speech, /quit to exit)[/]")
            except EOFError:
                break


def main():
    try:
        import ollama
        ollama.list()
    except:
        console.print("[bold red]Ollama not running![/] Start with: [cyan]ollama serve[/]")
        return

    cli = BlackRoadCLI()
    cli.run()


if __name__ == "__main__":
    main()
