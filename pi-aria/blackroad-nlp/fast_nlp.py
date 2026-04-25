#!/usr/bin/env python3
"""
BlackRoad Fast NLP - Zero Dependencies, Instant Response
No Ollama, no ML models, just smart pattern matching

This handles 90% of agent communication needs instantly.
Falls back to Ollama only for truly ambiguous cases.
"""

import re
import socket
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

AGENT_NAME = socket.gethostname()


class Intent(Enum):
    STATUS = "status"
    EXECUTE = "execute"
    RESTART = "restart"
    STOP = "stop"
    START = "start"
    CHECK = "check"
    DEPLOY = "deploy"
    QUERY = "query"
    LIST = "list"
    HELP = "help"
    COMMUNICATE = "communicate"
    UNKNOWN = "unknown"


@dataclass
class ParsedCommand:
    intent: Intent
    target: Optional[str]  # service, file, agent, etc.
    action: Optional[str]
    parameters: Dict
    confidence: float
    original: str


# Intent patterns - order matters (most specific first)
INTENT_PATTERNS = [
    # Restart/Reload
    (Intent.RESTART, [
        r"restart\s+(\w+)",
        r"reload\s+(\w+)",
        r"reboot\s+(\w+)",
        r"bounce\s+(\w+)",
    ]),
    # Stop
    (Intent.STOP, [
        r"stop\s+(\w+)",
        r"kill\s+(\w+)",
        r"terminate\s+(\w+)",
        r"shutdown\s+(\w+)",
    ]),
    # Start
    (Intent.START, [
        r"start\s+(\w+)",
        r"launch\s+(\w+)",
        r"run\s+(\w+)",
        r"begin\s+(\w+)",
    ]),
    # Deploy
    (Intent.DEPLOY, [
        r"deploy\s+(\w+)",
        r"install\s+(\w+)",
        r"setup\s+(\w+)",
        r"provision\s+(\w+)",
    ]),
    # Check/Health
    (Intent.CHECK, [
        r"check\s+(\w+)",
        r"health\s+(\w+)",
        r"verify\s+(\w+)",
        r"test\s+(\w+)",
        r"is\s+(\w+)\s+(?:running|up|alive|ok)",
    ]),
    # Status
    (Intent.STATUS, [
        r"status\s*(?:of\s+)?(\w+)?",
        r"what(?:'s| is)\s+(?:the\s+)?status",
        r"how(?:'s| is)\s+(\w+)",
        r"show\s+(?:me\s+)?status",
        r"report",
    ]),
    # List
    (Intent.LIST, [
        r"list\s+(\w+)",
        r"show\s+(\w+)",
        r"get\s+(\w+)",
        r"what\s+(\w+)\s+(?:are|do we have)",
    ]),
    # Execute (general command)
    (Intent.EXECUTE, [
        r"execute\s+(.+)",
        r"run\s+command\s+(.+)",
        r"exec\s+(.+)",
        r"`(.+)`",  # backticks
    ]),
    # Query
    (Intent.QUERY, [
        r"what\s+is\s+(.+)",
        r"tell\s+me\s+(?:about\s+)?(.+)",
        r"explain\s+(.+)",
        r"describe\s+(.+)",
    ]),
    # Help
    (Intent.HELP, [
        r"help",
        r"what\s+can\s+you\s+do",
        r"commands",
        r"usage",
    ]),
    # Communicate (to other agent)
    (Intent.COMMUNICATE, [
        r"tell\s+(\w+)\s+to\s+(.+)",
        r"ask\s+(\w+)\s+(?:to\s+)?(.+)",
        r"message\s+(\w+)\s+(.+)",
        r"@(\w+)\s+(.+)",
    ]),
]

# Service name normalization
SERVICE_ALIASES = {
    "nginx": ["nginx", "web", "webserver", "http"],
    "docker": ["docker", "containers"],
    "ollama": ["ollama", "llm", "ai", "model"],
    "tailscale": ["tailscale", "vpn", "mesh", "tailscaled"],
    "ssh": ["ssh", "sshd", "remote"],
    "k3s": ["k3s", "kubernetes", "k8s", "cluster"],
    "postgresql": ["postgresql", "postgres", "pg", "database", "db"],
    "redis": ["redis", "cache"],
    "hailo": ["hailo", "npu", "accelerator"],
}

# Command templates
COMMAND_TEMPLATES = {
    Intent.RESTART: "sudo systemctl restart {target}",
    Intent.STOP: "sudo systemctl stop {target}",
    Intent.START: "sudo systemctl start {target}",
    Intent.CHECK: "systemctl is-active {target}",
    Intent.STATUS: "systemctl status {target} --no-pager | head -20",
    Intent.LIST: {
        "services": "systemctl list-units --type=service --state=running",
        "containers": "docker ps",
        "processes": "ps aux | head -20",
        "ports": "ss -tlnp",
        "disk": "df -h",
        "memory": "free -h",
    },
}


class FastNLP:
    """Instant NLP without ML models"""

    def __init__(self):
        self.agent = AGENT_NAME
        self._compile_patterns()

    def _compile_patterns(self):
        """Pre-compile regex patterns"""
        self.compiled_patterns = []
        for intent, patterns in INTENT_PATTERNS:
            compiled = [(intent, re.compile(p, re.IGNORECASE)) for p in patterns]
            self.compiled_patterns.extend(compiled)

    def _normalize_service(self, name: str) -> str:
        """Normalize service name"""
        name = name.lower().strip()
        for canonical, aliases in SERVICE_ALIASES.items():
            if name in aliases:
                return canonical
        return name

    def parse(self, text: str) -> ParsedCommand:
        """Parse natural language into structured command"""
        text = text.strip()

        for intent, pattern in self.compiled_patterns:
            match = pattern.search(text)
            if match:
                groups = match.groups()
                target = groups[0] if groups else None

                if target:
                    target = self._normalize_service(target)

                # Handle communicate intent (has two captures)
                params = {}
                if intent == Intent.COMMUNICATE and len(groups) >= 2:
                    params["to_agent"] = groups[0]
                    params["message"] = groups[1]
                    target = groups[0]

                return ParsedCommand(
                    intent=intent,
                    target=target,
                    action=self._generate_action(intent, target),
                    parameters=params,
                    confidence=0.9,
                    original=text
                )

        # Unknown intent
        return ParsedCommand(
            intent=Intent.UNKNOWN,
            target=None,
            action=None,
            parameters={},
            confidence=0.0,
            original=text
        )

    def _generate_action(self, intent: Intent, target: str) -> Optional[str]:
        """Generate shell command for intent"""
        template = COMMAND_TEMPLATES.get(intent)

        if template is None:
            return None

        if isinstance(template, dict):
            # LIST has sub-commands
            return template.get(target, template.get("services"))

        if target:
            return template.format(target=target)

        return None

    def process(self, text: str) -> Dict:
        """Process text and return structured response"""
        parsed = self.parse(text)

        return {
            "input": text,
            "intent": parsed.intent.value,
            "target": parsed.target,
            "action": parsed.action,
            "parameters": parsed.parameters,
            "confidence": parsed.confidence,
            "agent": self.agent,
            "needs_llm": parsed.intent == Intent.UNKNOWN
        }

    def respond(self, text: str) -> str:
        """Generate a response (for simple queries)"""
        parsed = self.parse(text)

        responses = {
            Intent.HELP: f"I'm {self.agent}. I can: restart/stop/start services, check status, list resources, deploy apps.",
            Intent.STATUS: f"Use 'status <service>' to check a specific service, or 'status' for system overview.",
        }

        if parsed.intent in responses and not parsed.target:
            return responses[parsed.intent]

        if parsed.action:
            return f"Would execute: {parsed.action}"

        return "I didn't understand that. Try 'help' for options."


class HybridNLP:
    """Hybrid NLP: Fast patterns first, Ollama fallback"""

    def __init__(self, ollama_fallback: bool = True):
        self.fast = FastNLP()
        self.use_ollama = ollama_fallback
        self._ollama_client = None

    @property
    def ollama(self):
        if self._ollama_client is None and self.use_ollama:
            try:
                from nlp_core import OllamaClient
                self._ollama_client = OllamaClient()
            except ImportError:
                self._ollama_client = None
        return self._ollama_client

    def process(self, text: str) -> Dict:
        """Process with fast NLP, fallback to Ollama if needed"""
        result = self.fast.process(text)

        # If confident, return fast result
        if result["confidence"] >= 0.7:
            result["source"] = "fast"
            return result

        # Fallback to Ollama for ambiguous cases
        if self.use_ollama and self.ollama and self.ollama.is_available():
            try:
                from nlp_core import AgentNLP
                nlp = AgentNLP()
                ollama_result = nlp.process(text)
                ollama_result["source"] = "ollama"
                return ollama_result
            except:
                pass

        result["source"] = "fast"
        return result


# CLI
if __name__ == "__main__":
    import sys
    import json

    nlp = FastNLP()

    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        result = nlp.process(text)
        print(json.dumps(result, indent=2))
    else:
        print(f"BlackRoad Fast NLP on {AGENT_NAME}")
        print("No ML models required - instant response")
        print("-" * 40)
        print("Try: 'restart nginx', 'check docker', 'list services'")
        print()

        while True:
            try:
                text = input("> ").strip()
                if not text:
                    continue
                if text in ("quit", "exit"):
                    break
                result = nlp.process(text)
                print(json.dumps(result, indent=2))
            except (KeyboardInterrupt, EOFError):
                print("\nBye!")
                break
