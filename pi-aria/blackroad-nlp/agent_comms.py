#!/usr/bin/env python3
"""
BlackRoad Agent Inter-Communication
NLP-powered agent-to-agent communication
"""

import json
import os
import socket
import urllib.request
from typing import Dict, List, Optional
from dataclasses import dataclass

# Fleet configuration
FLEET = {
    "cecilia": {"ip": "192.168.4.89", "nlp_port": 4020, "role": "primary"},
    "lucidia": {"ip": "192.168.4.81", "nlp_port": 4020, "role": "inference"},
    "octavia": {"ip": "192.168.4.38", "nlp_port": 4020, "role": "multiarm"},
    "aria": {"ip": "192.168.4.82", "nlp_port": 4020, "role": "harmony"},
    "alice": {"ip": "192.168.4.49", "nlp_port": 4020, "role": "k8s"},
    "gematria": {"ip": "159.65.43.12", "nlp_port": 4020, "role": "cloud"},
    "anastasia": {"ip": "174.138.44.45", "nlp_port": 4020, "role": "api"},
}

SELF = socket.gethostname()


@dataclass
class AgentMessage:
    """Message between agents"""
    from_agent: str
    to_agent: str
    content: str
    intent: Optional[str] = None
    context: Optional[Dict] = None


class AgentComms:
    """Inter-agent NLP communication"""

    def __init__(self):
        self.name = SELF
        self.fleet = FLEET

    def _call_nlp(self, host: str, endpoint: str, data: Dict) -> Dict:
        """Call NLP endpoint on a host"""
        info = self.fleet.get(host)
        if not info:
            return {"error": f"Unknown host: {host}"}

        url = f"http://{info['ip']}:{info['nlp_port']}{endpoint}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode(),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except Exception as e:
            return {"error": str(e)}

    def send(self, to_agent: str, message: str) -> Dict:
        """Send natural language message to another agent"""
        msg = AgentMessage(
            from_agent=self.name,
            to_agent=to_agent,
            content=message
        )

        # Process message on target agent
        result = self._call_nlp(to_agent, "/process", {"text": message})
        result["from"] = self.name
        result["to"] = to_agent
        return result

    def ask(self, agent: str, question: str) -> str:
        """Ask another agent a question"""
        result = self._call_nlp(agent, "/ask", {"question": question})
        return result.get("answer", result.get("error", "No response"))

    def execute_on(self, agent: str, command: str) -> Dict:
        """Execute natural language command on another agent"""
        return self._call_nlp(agent, "/execute", {"command": command})

    def broadcast(self, message: str, exclude_self: bool = True) -> Dict[str, Dict]:
        """Broadcast message to all agents"""
        results = {}
        for agent in self.fleet:
            if exclude_self and agent == self.name:
                continue
            results[agent] = self.send(agent, message)
        return results

    def fleet_status(self) -> Dict[str, bool]:
        """Check NLP status of all agents"""
        status = {}
        for agent, info in self.fleet.items():
            try:
                url = f"http://{info['ip']}:{info['nlp_port']}/health"
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=2) as resp:
                    data = json.loads(resp.read().decode())
                    status[agent] = data.get("ok", False)
            except:
                status[agent] = False
        return status

    def delegate_task(self, task: str) -> Dict:
        """
        Use NLP to determine best agent for a task,
        then delegate to that agent
        """
        # Map task types to agent roles
        role_keywords = {
            "primary": ["coordinate", "main", "control", "orchestrate"],
            "inference": ["ai", "model", "inference", "predict"],
            "multiarm": ["process", "parallel", "multi"],
            "harmony": ["balance", "sync", "harmony"],
            "k8s": ["kubernetes", "container", "deploy", "scale"],
            "cloud": ["cloud", "remote", "external"],
            "api": ["api", "web", "request", "http"],
        }

        task_lower = task.lower()
        best_agent = None
        best_score = 0

        for agent, info in self.fleet.items():
            role = info["role"]
            keywords = role_keywords.get(role, [])
            score = sum(1 for kw in keywords if kw in task_lower)
            if score > best_score:
                best_score = score
                best_agent = agent

        if not best_agent:
            best_agent = "cecilia"  # Default to primary

        return {
            "delegated_to": best_agent,
            "task": task,
            "result": self.execute_on(best_agent, task)
        }


# CLI
if __name__ == "__main__":
    import sys

    comms = AgentComms()
    print(f"BlackRoad Agent Comms ({comms.name})")
    print("-" * 40)

    if len(sys.argv) < 2:
        print("Usage:")
        print("  agent_comms.py status           - Fleet NLP status")
        print("  agent_comms.py ask <agent> <q>  - Ask agent a question")
        print("  agent_comms.py send <agent> <m> - Send message to agent")
        print("  agent_comms.py exec <agent> <c> - Execute command on agent")
        print("  agent_comms.py delegate <task>  - Auto-delegate task")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "status":
        status = comms.fleet_status()
        for agent, ok in status.items():
            mark = "✓" if ok else "✗"
            print(f"  {mark} {agent}: {'NLP ready' if ok else 'offline'}")

    elif cmd == "ask" and len(sys.argv) >= 4:
        agent = sys.argv[2]
        question = " ".join(sys.argv[3:])
        answer = comms.ask(agent, question)
        print(f"Q: {question}")
        print(f"A ({agent}): {answer}")

    elif cmd == "send" and len(sys.argv) >= 4:
        agent = sys.argv[2]
        message = " ".join(sys.argv[3:])
        result = comms.send(agent, message)
        print(json.dumps(result, indent=2))

    elif cmd == "exec" and len(sys.argv) >= 4:
        agent = sys.argv[2]
        command = " ".join(sys.argv[3:])
        result = comms.execute_on(agent, command)
        print(json.dumps(result, indent=2))

    elif cmd == "delegate" and len(sys.argv) >= 3:
        task = " ".join(sys.argv[2:])
        result = comms.delegate_task(task)
        print(json.dumps(result, indent=2))

    else:
        print("Invalid command")
