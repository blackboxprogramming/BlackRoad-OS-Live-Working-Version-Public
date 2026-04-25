#!/usr/bin/env python3
"""
BlackRoad Agent NLP Service
HTTP API for natural language processing in autonomous agents
"""

import json
import os
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import subprocess
import threading

from nlp_core import AgentNLP, Intent

# Config
PORT = int(os.getenv("NLP_PORT", "4020"))
AGENT_NAME = os.getenv("AGENT_NAME", socket.gethostname())
SAFE_MODE = os.getenv("SAFE_MODE", "true").lower() == "true"


class NLPRequestHandler(BaseHTTPRequestHandler):
    nlp = None  # Set by server

    def log_message(self, format, *args):
        print(f"[NLP] {args[0]}")

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/health":
            self.send_json({
                "ok": self.nlp.is_ready(),
                "agent": AGENT_NAME,
                "service": "nlp",
                "port": PORT
            })

        elif path == "/models":
            models = self.nlp.client.list_models()
            self.send_json({"models": models, "default": self.nlp.model})

        elif path == "/intents":
            intents = [i.value for i in Intent]
            self.send_json({"intents": intents})

        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode() if content_len else "{}"

        try:
            data = json.loads(body)
        except:
            self.send_json({"error": "Invalid JSON"}, 400)
            return

        if path == "/process":
            # Full NLP processing
            text = data.get("text", "")
            if not text:
                self.send_json({"error": "Missing 'text'"}, 400)
                return

            result = self.nlp.process(text)
            result["agent"] = AGENT_NAME
            self.send_json(result)

        elif path == "/ask":
            # Simple Q&A
            question = data.get("question", "")
            if not question:
                self.send_json({"error": "Missing 'question'"}, 400)
                return

            answer = self.nlp.ask(question)
            self.send_json({"question": question, "answer": answer, "agent": AGENT_NAME})

        elif path == "/execute":
            # Execute natural language command
            command_text = data.get("command", "")
            if not command_text:
                self.send_json({"error": "Missing 'command'"}, 400)
                return

            result = self.nlp.process(command_text)

            # Only execute if it's a command intent and safe
            if result["intent"] == "execute_command":
                cmd_info = result.get("generated_command", {})

                if SAFE_MODE and not cmd_info.get("safe", False):
                    self.send_json({
                        "error": "Command not safe",
                        "command": cmd_info.get("command"),
                        "description": cmd_info.get("description")
                    }, 403)
                    return

                shell_cmd = cmd_info.get("command")
                if shell_cmd:
                    try:
                        output = subprocess.run(
                            shell_cmd,
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=30
                        )
                        result["execution"] = {
                            "command": shell_cmd,
                            "stdout": output.stdout[:2000],
                            "stderr": output.stderr[:500],
                            "returncode": output.returncode
                        }
                    except subprocess.TimeoutExpired:
                        result["execution"] = {"error": "Timeout"}
                    except Exception as e:
                        result["execution"] = {"error": str(e)}

            self.send_json(result)

        elif path == "/summarize":
            text = data.get("text", "")
            if not text:
                self.send_json({"error": "Missing 'text'"}, 400)
                return

            summary = self.nlp.summarize(text)
            self.send_json({"summary": summary, "agent": AGENT_NAME})

        elif path == "/chat":
            # Multi-turn chat
            messages = data.get("messages", [])
            model = data.get("model", self.nlp.model)

            response = self.nlp.client.chat(messages, model)
            self.send_json({
                "response": response,
                "model": model,
                "agent": AGENT_NAME
            })

        else:
            self.send_json({"error": "Not found"}, 404)


def run_server():
    nlp = AgentNLP()

    if not nlp.is_ready():
        print(f"WARNING: Ollama not available, NLP will fail")

    NLPRequestHandler.nlp = nlp

    server = HTTPServer(("0.0.0.0", PORT), NLPRequestHandler)
    print(f"[NLP] BlackRoad Agent NLP Service")
    print(f"[NLP] Agent: {AGENT_NAME}")
    print(f"[NLP] Port: {PORT}")
    print(f"[NLP] Safe mode: {SAFE_MODE}")
    print(f"[NLP] Ollama: {'ready' if nlp.is_ready() else 'not available'}")
    print(f"[NLP] Models: {nlp.client.list_models()}")
    print("-" * 40)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[NLP] Shutting down...")
        server.shutdown()


if __name__ == "__main__":
    run_server()
