"""
BlackRoad Voice - Context Bridge
Loads persistent context so all AI sessions share the same state.

Sources:
  ~/CURRENT_CONTEXT.md          - What's happening NOW (read first)
  ~/.blackroad/memory/journals/ - Historical memory (4000+ entries)
  ~/blackroad-codex/            - Code index (22,244 components)
  ~/.claude/CLAUDE.md           - Claude-specific instructions
"""
import os
from pathlib import Path
from datetime import datetime

HOME = Path.home()

CONTEXT_SOURCES = {
    "current": HOME / "CURRENT_CONTEXT.md",
    "claude_md": HOME / ".claude" / "CLAUDE.md",
    "memory_journal": HOME / ".blackroad" / "memory" / "journals" / "master-journal.jsonl",
}


def load_current_context() -> str:
    """Load CURRENT_CONTEXT.md - the most important context file."""
    path = CONTEXT_SOURCES["current"]
    if path.exists():
        try:
            content = path.read_text()
            return f"\n═══ CURRENT CONTEXT (from ~/CURRENT_CONTEXT.md) ═══\n{content}\n═══ END CONTEXT ═══\n"
        except:
            pass
    return ""


def load_recent_memory(lines: int = 20) -> str:
    """Load recent memory entries."""
    path = CONTEXT_SOURCES["memory_journal"]
    if path.exists():
        try:
            with open(path) as f:
                entries = f.readlines()[-lines:]
            return f"\n═══ RECENT MEMORY ({len(entries)} entries) ═══\n{''.join(entries)}═══ END MEMORY ═══\n"
        except:
            pass
    return ""


def get_context_summary() -> str:
    """Get a compact context summary for the system prompt."""
    ctx = load_current_context()

    # Extract key info
    lines = ctx.split('\n')
    summary_lines = []
    for line in lines:
        if line.startswith('**') or line.startswith('- ✅') or line.startswith('- [ ]'):
            summary_lines.append(line)

    if summary_lines:
        return "\n".join(summary_lines[:15])
    return ""


def update_context(update: str) -> bool:
    """Append update to CURRENT_CONTEXT.md."""
    path = CONTEXT_SOURCES["current"]
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        with open(path, 'a') as f:
            f.write(f"\n## Update {timestamp}\n{update}\n")
        return True
    except:
        return False


def sync_context_to_gist() -> str:
    """Sync context to GitHub Gist for cross-AI access."""
    import subprocess
    try:
        result = subprocess.run(
            ["gh", "gist", "edit", "blackroad-context", "-f", "CURRENT_CONTEXT.md", str(CONTEXT_SOURCES["current"])],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return "Context synced to gist"
        # Try creating if doesn't exist
        result = subprocess.run(
            ["gh", "gist", "create", str(CONTEXT_SOURCES["current"]), "-d", "BlackRoad Context Bridge", "-p"],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout or result.stderr
    except Exception as e:
        return f"Sync error: {e}"
