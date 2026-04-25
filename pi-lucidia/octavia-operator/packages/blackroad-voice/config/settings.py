"""
BlackRoad Voice - Configuration
~/blackroad-voice/config/settings.py

ARCHITECTURE:
  BlackRoad OS (sovereign orchestration layer)
    └── AI Backends (swappable)
        ├── ollama://localhost (default)
        ├── ollama://cecilia, ollama://lucidia
        ├── anthropic://claude.ai
        └── openai://, copilot://, etc.
"""
import os
from pathlib import Path

# Base paths
HOME = Path.home()
BLACKROAD_HOME = HOME / ".blackroad"
VOICE_DATA = HOME / "blackroad-voice" / "data"

# Ensure directories exist
VOICE_DATA.mkdir(parents=True, exist_ok=True)
BLACKROAD_HOME.mkdir(parents=True, exist_ok=True)

# Models
MODEL = os.environ.get("BLACKROAD_MODEL", "llama3.1:latest")
FAST_MODEL = os.environ.get("BLACKROAD_FAST_MODEL", "qwen2.5:1.5b")
CODE_MODEL = os.environ.get("BLACKROAD_CODE_MODEL", "qwen2.5:3b")
USE_FAST = os.environ.get("BLACKROAD_FAST", "false").lower() == "true"

# Voice
VOICE_NAME = os.environ.get("BLACKROAD_VOICE", "Samantha")
TTS_ENABLED = os.environ.get("BLACKROAD_TTS", "true").lower() == "true"
AUTO_LISTEN = os.environ.get("BLACKROAD_AUTO_LISTEN", "true").lower() == "true"
WHISPER_MODEL = os.environ.get("BLACKROAD_WHISPER", "base")

# Paths
WORKING_DIR = Path.cwd()
HISTORY_FILE = VOICE_DATA / "history"
SESSION_FILE = VOICE_DATA / "session.json"

# Behavior
MAX_RETRIES = 3
TIMEOUT = 120
STREAM = True
AUTONOMOUS = True
MAX_CONTEXT = 50

# Fleet
FLEET = {
    "alice": {"ip": "192.168.4.49", "ts": "100.77.210.18", "role": "worker"},
    "aria": {"ip": "192.168.4.82", "ts": "100.109.14.17", "role": "harmony"},
    "lucidia": {"ip": "192.168.4.81", "ts": "100.83.149.86", "role": "ai-inference"},
    "cecilia": {"ip": "192.168.4.89", "ts": "100.72.180.98", "role": "primary-ai"},
    "octavia": {"ip": "192.168.4.38", "ts": "100.66.235.47", "role": "multi-arm"},
    "shellfish": {"ip": "174.138.44.45", "ts": "100.94.33.37", "role": "edge"},
    "codex-infinity": {"ip": "159.65.43.12", "ts": "100.108.132.8", "role": "oracle"},
}

# GitHub orgs
GITHUB_ORGS = [
    "BlackRoad-OS", "BlackRoad-AI", "BlackRoad-Cloud", "BlackRoad-Security",
    "BlackRoad-Media", "BlackRoad-Foundation", "BlackRoad-Interactive",
    "BlackRoad-Labs", "BlackRoad-Hardware", "BlackRoad-Studio",
    "BlackRoad-Ventures", "BlackRoad-Education", "BlackRoad-Gov",
    "BlackRoad-Archive", "Blackbox-Enterprises"
]
