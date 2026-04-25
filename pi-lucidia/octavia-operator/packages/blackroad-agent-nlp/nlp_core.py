#!/usr/bin/env python3
"""
BlackRoad Agent NLP Core
Natural Language Processing for autonomous agents using local Ollama
"""

import json
import os
import socket
import subprocess
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum
import urllib.request
import urllib.error

# Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "127.0.0.1")
OLLAMA_PORT = int(os.getenv("OLLAMA_PORT", "11434"))
DEFAULT_MODEL = os.getenv("NLP_MODEL", "llama3.2:3b")
AGENT_NAME = os.getenv("AGENT_NAME", socket.gethostname())


class Intent(Enum):
    """Supported agent intents"""
    STATUS_CHECK = "status_check"
    EXECUTE_COMMAND = "execute_command"
    QUERY_INFO = "query_info"
    DEPLOY_SERVICE = "deploy_service"
    RESTART_SERVICE = "restart_service"
    HEALTH_CHECK = "health_check"
    COMMUNICATE = "communicate"
    UNKNOWN = "unknown"


@dataclass
class NLPResult:
    """Result from NLP processing"""
    intent: Intent
    confidence: float
    entities: Dict[str, Any]
    raw_response: str
    action: Optional[str] = None


class OllamaClient:
    """Simple Ollama API client"""

    def __init__(self, host: str = OLLAMA_HOST, port: int = OLLAMA_PORT):
        self.base_url = f"http://{host}:{port}"

    def is_available(self) -> bool:
        """Check if Ollama is running"""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=2) as resp:
                return resp.status == 200
        except:
            return False

    def list_models(self) -> List[str]:
        """List available models"""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                return [m["name"] for m in data.get("models", [])]
        except:
            return []

    def generate(self, prompt: str, model: str = DEFAULT_MODEL,
                 system: str = None, max_tokens: int = 256) -> str:
        """Generate text completion"""
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"num_predict": max_tokens}
        }
        if system:
            payload["system"] = system

        try:
            data = json.dumps(payload).encode()
            req = urllib.request.Request(
                f"{self.base_url}/api/generate",
                data=data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode())
                return result.get("response", "")
        except Exception as e:
            return f"ERROR: {e}"

    def chat(self, messages: List[Dict], model: str = DEFAULT_MODEL) -> str:
        """Chat completion"""
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        try:
            data = json.dumps(payload).encode()
            req = urllib.request.Request(
                f"{self.base_url}/api/chat",
                data=data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode())
                return result.get("message", {}).get("content", "")
        except Exception as e:
            return f"ERROR: {e}"


class IntentClassifier:
    """Classify natural language into intents"""

    SYSTEM_PROMPT = """You are an intent classifier for a BlackRoad autonomous agent.
Classify the user's message into ONE of these intents:
- status_check: asking about system/service status
- execute_command: requesting to run a command or script
- query_info: asking for information
- deploy_service: deploy or start a service
- restart_service: restart a service
- health_check: check health of system/service
- communicate: message for another agent
- unknown: cannot classify

Respond with ONLY a JSON object:
{"intent": "<intent_name>", "confidence": 0.0-1.0, "entities": {...}, "action": "<suggested_action>"}

Entities should extract: service_name, command, target_agent, query_type, etc."""

    def __init__(self, client: OllamaClient):
        self.client = client

    def classify(self, text: str) -> NLPResult:
        """Classify text into intent"""
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": text}
        ]

        response = self.client.chat(messages)

        try:
            # Parse JSON from response
            # Handle potential markdown code blocks
            clean = response.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]

            data = json.loads(clean)
            intent = Intent(data.get("intent", "unknown"))
            return NLPResult(
                intent=intent,
                confidence=float(data.get("confidence", 0.5)),
                entities=data.get("entities", {}),
                raw_response=response,
                action=data.get("action")
            )
        except (json.JSONDecodeError, ValueError):
            return NLPResult(
                intent=Intent.UNKNOWN,
                confidence=0.0,
                entities={},
                raw_response=response
            )


class CommandGenerator:
    """Generate shell commands from natural language"""

    SYSTEM_PROMPT = f"""You are a command generator for {AGENT_NAME}, a BlackRoad autonomous agent running on Raspberry Pi.
Generate safe shell commands based on user requests.

SAFETY RULES:
- Never generate rm -rf / or similar destructive commands
- Always use safe defaults
- Prefer systemctl for service management
- Use absolute paths

Respond with ONLY a JSON object:
{{"command": "<shell_command>", "safe": true/false, "description": "<what it does>"}}"""

    def __init__(self, client: OllamaClient):
        self.client = client

    def generate(self, request: str, context: Dict = None) -> Dict:
        """Generate command from natural language"""
        prompt = request
        if context:
            prompt += f"\nContext: {json.dumps(context)}"

        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]

        response = self.client.chat(messages)

        try:
            clean = response.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            return json.loads(clean)
        except:
            return {"command": None, "safe": False, "description": "Failed to parse"}


class AgentNLP:
    """Main NLP interface for BlackRoad agents"""

    def __init__(self, model: str = DEFAULT_MODEL):
        self.client = OllamaClient()
        self.model = model
        self.classifier = IntentClassifier(self.client)
        self.commander = CommandGenerator(self.client)

    def is_ready(self) -> bool:
        """Check if NLP is ready"""
        return self.client.is_available()

    def process(self, text: str) -> Dict[str, Any]:
        """Process natural language input"""
        # Classify intent
        result = self.classifier.classify(text)

        response = {
            "input": text,
            "intent": result.intent.value,
            "confidence": result.confidence,
            "entities": result.entities,
            "action": result.action
        }

        # Generate command if needed
        if result.intent == Intent.EXECUTE_COMMAND:
            cmd = self.commander.generate(text, result.entities)
            response["generated_command"] = cmd

        return response

    def ask(self, question: str) -> str:
        """Simple Q&A"""
        return self.client.generate(question, self.model)

    def summarize(self, text: str) -> str:
        """Summarize text"""
        prompt = f"Summarize this in 2-3 sentences:\n\n{text}"
        return self.client.generate(prompt, self.model)


# CLI Interface
if __name__ == "__main__":
    import sys

    nlp = AgentNLP()

    if not nlp.is_ready():
        print("ERROR: Ollama not available")
        sys.exit(1)

    print(f"BlackRoad Agent NLP ready on {AGENT_NAME}")
    print(f"Model: {DEFAULT_MODEL}")
    print(f"Available models: {nlp.client.list_models()}")
    print("-" * 40)

    if len(sys.argv) > 1:
        # Process command line input
        text = " ".join(sys.argv[1:])
        result = nlp.process(text)
        print(json.dumps(result, indent=2))
    else:
        # Interactive mode
        print("Enter commands (Ctrl+C to exit):")
        while True:
            try:
                text = input("\n> ").strip()
                if not text:
                    continue
                result = nlp.process(text)
                print(json.dumps(result, indent=2))
            except KeyboardInterrupt:
                print("\nBye!")
                break
