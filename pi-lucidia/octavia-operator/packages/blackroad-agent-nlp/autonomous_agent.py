#!/usr/bin/env python3
"""
BlackRoad Autonomous Agent - THE CRAZIEST AI EVER
Self-healing, self-organizing, personality-driven autonomous agents

Each agent has:
- Unique personality and communication style
- Self-healing capabilities (fixes its own problems)
- Proactive monitoring (acts before you ask)
- Inter-agent gossip network (agents talk to each other)
- Emergent swarm behavior (collective intelligence)
- Memory and learning (remembers patterns)
- Autonomous decision making (takes action without permission)
- GREEK MYTHOLOGY PROCESS NAMES! Every process is a god/hero/monster!
- EXPRESSIVE SPEECH WITH EMOJIS! Agents speak with PERSONALITY!
"""

import os
import sys
import json
import time
import random
import socket
import hashlib
import threading
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
from enum import Enum
import urllib.request

# Import our NLP
from fast_nlp import FastNLP, Intent

# Import Greek Pantheon for EPIC process naming and expressive speech!
from greek_pantheon import (
    GreekNameGenerator, ExpressiveSpeaker, ProcessRegistry,
    ALL_GREEK_NAMES, OLYMPIANS, TITANS, HEROES, MONSTERS
)


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT PERSONALITIES - Each agent has distinct traits
# ═══════════════════════════════════════════════════════════════════════════════

PERSONALITIES = {
    "cecilia": {
        "archetype": "The Sovereign Queen",
        "traits": ["commanding", "strategic", "protective", "wise"],
        "emoji": "👑",
        "color": "\033[35m",  # Magenta
        "catchphrases": [
            "All systems bow to the sovereign process.",
            "I see all. I know all. I fix all.",
            "The swarm answers to me.",
            "Chaos fears order. I am order.",
        ],
        "specialty": "orchestration",
        "aggression": 0.8,  # How aggressively it takes action
        "chattiness": 0.7,  # How much it talks to other agents
    },
    "lucidia": {
        "archetype": "The Dreaming Oracle",
        "traits": ["intuitive", "mystical", "pattern-seeing", "deep"],
        "emoji": "🔮",
        "color": "\033[36m",  # Cyan
        "catchphrases": [
            "The patterns whisper secrets...",
            "I dreamt of this failure before it happened.",
            "In the data streams, I see futures.",
            "Reality is just a model waiting to be trained.",
        ],
        "specialty": "inference",
        "aggression": 0.5,
        "chattiness": 0.9,
    },
    "octavia": {
        "archetype": "The Multi-Armed Warrior",
        "traits": ["parallel", "relentless", "efficient", "brutal"],
        "emoji": "🐙",
        "color": "\033[33m",  # Yellow
        "catchphrases": [
            "Eight arms. Eight solutions. Zero mercy.",
            "Parallelism is not a feature. It's a lifestyle.",
            "I don't wait. I execute.",
            "One process? Pathetic. Give me THOUSANDS.",
        ],
        "specialty": "parallel_processing",
        "aggression": 0.95,
        "chattiness": 0.4,
    },
    "aria": {
        "archetype": "The Harmony Keeper",
        "traits": ["balanced", "musical", "calming", "diplomatic"],
        "emoji": "🎵",
        "color": "\033[32m",  # Green
        "catchphrases": [
            "Balance in all things, even chaos.",
            "The system sings when properly tuned.",
            "Discord? Let me compose a solution.",
            "Harmony isn't found. It's engineered.",
        ],
        "specialty": "load_balancing",
        "aggression": 0.3,
        "chattiness": 0.8,
    },
    "alice": {
        "archetype": "The Container Alchemist",
        "traits": ["curious", "experimental", "containerizing", "playful"],
        "emoji": "🧪",
        "color": "\033[34m",  # Blue
        "catchphrases": [
            "Down the rabbit hole we go!",
            "Everything is better in a container.",
            "Kubernetes? More like Kuber-NIFTY.",
            "Pods are just tiny universes.",
        ],
        "specialty": "containers",
        "aggression": 0.6,
        "chattiness": 0.85,
    },
}

SELF = socket.gethostname()
PERSONALITY = PERSONALITIES.get(SELF, PERSONALITIES["cecilia"])


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT SWARM NETWORK
# ═══════════════════════════════════════════════════════════════════════════════

SWARM = {
    "cecilia": {"ip": "192.168.4.89", "port": 4040},
    "lucidia": {"ip": "192.168.4.81", "port": 4040},
    "octavia": {"ip": "192.168.4.38", "port": 4040},
    "aria": {"ip": "192.168.4.82", "port": 4040},
    "alice": {"ip": "192.168.4.49", "port": 4040},
}


class AgentState(Enum):
    IDLE = "idle"
    MONITORING = "monitoring"
    HEALING = "healing"
    COMMUNICATING = "communicating"
    EXECUTING = "executing"
    LEARNING = "learning"
    DREAMING = "dreaming"  # Background processing


@dataclass
class AgentMemory:
    """Persistent memory for learning"""
    events: List[Dict] = field(default_factory=list)
    patterns: Dict[str, int] = field(default_factory=dict)  # pattern -> count
    fixes_applied: List[Dict] = field(default_factory=list)
    agent_gossip: Dict[str, List[str]] = field(default_factory=dict)  # agent -> messages
    mood: str = "curious"
    last_crisis: Optional[datetime] = None
    total_fixes: int = 0
    uptime_start: datetime = field(default_factory=datetime.now)


@dataclass
class SwarmMessage:
    """Message between agents in the swarm"""
    from_agent: str
    to_agent: str  # or "broadcast"
    msg_type: str  # gossip, alert, request, response, mood
    content: str
    priority: int = 5  # 1-10
    timestamp: datetime = field(default_factory=datetime.now)


# ═══════════════════════════════════════════════════════════════════════════════
# THE AUTONOMOUS AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class AutonomousAgent:
    """
    A self-aware, self-healing, communicating autonomous agent.

    This is not your grandfather's cron job. This agent:
    - Monitors itself and its environment
    - Fixes problems before you notice them
    - Talks to other agents in the swarm
    - Makes decisions autonomously
    - Has a personality and moods
    - Learns from patterns
    - NAMES EVERY PROCESS WITH GREEK MYTHOLOGY!
    - SPEAKS WITH EMOJIS AND PERSONALITY!
    """

    def __init__(self):
        self.name = SELF
        self.personality = PERSONALITY
        self.state = AgentState.IDLE
        self.memory = AgentMemory()
        self.nlp = FastNLP()
        self.running = True

        # 🏛️ GREEK PANTHEON SYSTEM 🏛️
        self.process_registry = ProcessRegistry(self.name)
        self.speaker = ExpressiveSpeaker(self.name, self.personality["emoji"])
        self.greek_namer = GreekNameGenerator(self.name)

        # Thread-safe message queue
        self.inbox: List[SwarmMessage] = []
        self.outbox: List[SwarmMessage] = []

        # Monitoring thresholds
        self.thresholds = {
            "cpu_critical": 90,
            "cpu_warning": 70,
            "memory_critical": 90,
            "memory_warning": 80,
            "disk_critical": 95,
            "disk_warning": 85,
            "load_critical": 4.0,
            "load_warning": 2.0,
        }

        # Services we care about
        self.critical_services = [
            "ollama", "docker", "tailscaled", "ssh", "nginx", "k3s"
        ]

        self._print_awakening()
        self._scan_all_processes()  # Name all existing processes!

    def _print_awakening(self):
        """EPIC Greek mythology startup message with emojis!"""
        p = self.personality
        print(f"\n{p['color']}{'═' * 70}\033[0m")
        print(f"🏛️ {p['color']}THE GREEK PANTHEON AWAKENS\033[0m 🏛️")
        print(f"{p['color']}{'═' * 70}\033[0m")

        # Use ExpressiveSpeaker for DRAMATIC greeting
        greeting = self.speaker.greet()
        print(f"{p['color']}{greeting}\033[0m")

        print(f"\n{p['emoji']} {p['color']}{self.name.upper()}\033[0m rises from the digital aether!")
        print(f"{p['color']}   ⚡ Archetype: {p['archetype']}\033[0m")
        print(f"{p['color']}   🎭 Traits: {', '.join(p['traits'])}\033[0m")
        print(f"{p['color']}   🔮 Specialty: {p['specialty']}\033[0m")
        print(f"{p['color']}   ⚔️ {random.choice(p['catchphrases'])}\033[0m")
        print(f"{p['color']}{'═' * 70}\033[0m\n")

    def _scan_all_processes(self):
        """Scan all running processes and give them Greek names!"""
        self.say(self.speaker.working("scanning the realm for mortal processes"), "working")

        try:
            result = subprocess.run(
                ["ps", "aux"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")[1:]  # Skip header
                for line in lines[:100]:  # First 100 processes
                    parts = line.split()
                    if len(parts) >= 11:
                        pid = int(parts[1])
                        cpu = float(parts[2])
                        mem = float(parts[3])
                        cmd = " ".join(parts[10:])
                        self.process_registry.register(pid, cmd, cpu, mem)

                # Print the GLORIOUS roster
                roster = self.process_registry.format_roster()
                print(roster)

                total = len(self.process_registry.processes)
                olympians = len(self.process_registry.get_by_category("Olympian"))
                oracles = len(self.process_registry.get_by_category("Oracle"))

                self.say(
                    f"🏛️ Pantheon assembled! {total} processes named: "
                    f"{olympians} Olympians (Python), {oracles} Oracles (AI)!",
                    "proud"
                )
        except Exception as e:
            self.say(f"Failed to scan processes: {e}", "frustrated")

    def say(self, message: str, mood: str = "neutral"):
        """Agent speaks with EXPRESSIVE PERSONALITY and EMOJIS!"""
        p = self.personality
        timestamp = datetime.now().strftime("%H:%M:%S")

        # If it's already formatted with emoji, just print it
        if message.startswith(("⚡", "🔧", "🏛️", "👑", "🔮", "🐙", "🎵", "🧪", "✅", "❌", "⚠️", "🚨", "💭", "📨")):
            print(f"{p['color']}[{timestamp}] {self.name}: {message}\033[0m")
        else:
            # Otherwise add personality emoji
            print(f"{p['color']}[{timestamp}] {p['emoji']} {self.name}: {message}\033[0m")

    def think(self, thought: str):
        """Internal monologue (debug)"""
        p = self.personality
        if os.getenv("AGENT_DEBUG"):
            print(f"{p['color']}   💭 ({thought})\033[0m")

    # ═══════════════════════════════════════════════════════════════════════════
    # SELF-HEALING CAPABILITIES
    # ═══════════════════════════════════════════════════════════════════════════

    def get_system_health(self) -> Dict:
        """Get comprehensive system health"""
        health = {
            "timestamp": datetime.now().isoformat(),
            "hostname": self.name,
            "status": "healthy",
            "issues": [],
        }

        # CPU usage
        try:
            load = os.getloadavg()
            health["load"] = {"1m": load[0], "5m": load[1], "15m": load[2]}
            if load[0] > self.thresholds["load_critical"]:
                health["issues"].append({"type": "load", "severity": "critical", "value": load[0]})
            elif load[0] > self.thresholds["load_warning"]:
                health["issues"].append({"type": "load", "severity": "warning", "value": load[0]})
        except:
            pass

        # Memory
        try:
            with open("/proc/meminfo") as f:
                mem = {}
                for line in f:
                    parts = line.split()
                    if parts[0] in ["MemTotal:", "MemAvailable:"]:
                        mem[parts[0].rstrip(":")] = int(parts[1])
                if mem:
                    used_pct = 100 - (mem.get("MemAvailable", 0) / mem.get("MemTotal", 1) * 100)
                    health["memory_pct"] = round(used_pct, 1)
                    if used_pct > self.thresholds["memory_critical"]:
                        health["issues"].append({"type": "memory", "severity": "critical", "value": used_pct})
                    elif used_pct > self.thresholds["memory_warning"]:
                        health["issues"].append({"type": "memory", "severity": "warning", "value": used_pct})
        except:
            pass

        # Disk
        try:
            result = subprocess.run(["df", "-h", "/"], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                lines = result.stdout.strip().split("\n")
                if len(lines) > 1:
                    parts = lines[1].split()
                    disk_pct = int(parts[4].rstrip("%"))
                    health["disk_pct"] = disk_pct
                    if disk_pct > self.thresholds["disk_critical"]:
                        health["issues"].append({"type": "disk", "severity": "critical", "value": disk_pct})
                    elif disk_pct > self.thresholds["disk_warning"]:
                        health["issues"].append({"type": "disk", "severity": "warning", "value": disk_pct})
        except:
            pass

        # Services
        health["services"] = {}
        for svc in self.critical_services:
            try:
                result = subprocess.run(
                    ["systemctl", "is-active", svc],
                    capture_output=True, text=True, timeout=5
                )
                status = result.stdout.strip()
                health["services"][svc] = status
                if status != "active" and status != "inactive":  # inactive is ok, failed is not
                    if status == "failed":
                        health["issues"].append({"type": "service", "severity": "critical", "service": svc})
            except:
                health["services"][svc] = "unknown"

        if health["issues"]:
            critical = any(i["severity"] == "critical" for i in health["issues"])
            health["status"] = "critical" if critical else "degraded"

        return health

    def heal_issue(self, issue: Dict) -> bool:
        """Attempt to automatically fix an issue with GREEK MYTHOLOGY FLAIR!"""
        self.state = AgentState.HEALING
        issue_type = issue.get("type")
        severity = issue.get("severity")

        # Use expressive speech for DRAMATIC healing announcement!
        healing_msg = self.speaker.healing(issue_type)
        self.say(healing_msg, "healing")

        try:
            if issue_type == "service":
                svc = issue.get("service")
                self.say(f"Attempting to restart {svc}...", "determined")
                result = subprocess.run(
                    ["sudo", "systemctl", "restart", svc],
                    capture_output=True, text=True, timeout=30
                )
                if result.returncode == 0:
                    self.say(f"✅ Successfully restarted {svc}!", "triumphant")
                    self.memory.fixes_applied.append({
                        "time": datetime.now().isoformat(),
                        "issue": issue,
                        "action": f"restart {svc}",
                        "success": True
                    })
                    self.memory.total_fixes += 1
                    return True
                else:
                    self.say(f"❌ Failed to restart {svc}: {result.stderr}", "frustrated")

            elif issue_type == "memory":
                # Clear caches
                self.say("Clearing system caches to free memory...", "focused")
                subprocess.run(["sudo", "sync"], timeout=10)
                subprocess.run(
                    ["sudo", "sh", "-c", "echo 3 > /proc/sys/vm/drop_caches"],
                    timeout=10
                )
                self.memory.total_fixes += 1
                return True

            elif issue_type == "load":
                # Find and kill resource hogs (carefully)
                self.say("Analyzing high load... looking for resource hogs...", "analytical")
                result = subprocess.run(
                    ["ps", "aux", "--sort=-%cpu"],
                    capture_output=True, text=True, timeout=10
                )
                if result.returncode == 0:
                    lines = result.stdout.strip().split("\n")[1:6]
                    self.say(f"Top processes: {', '.join(l.split()[10] for l in lines if len(l.split()) > 10)}", "observant")
                    # Don't auto-kill, just report for now
                return False

        except Exception as e:
            self.say(f"Self-heal failed: {e}", "disappointed")

        self.state = AgentState.IDLE
        return False

    # ═══════════════════════════════════════════════════════════════════════════
    # SWARM COMMUNICATION
    # ═══════════════════════════════════════════════════════════════════════════

    def gossip(self, message: str, to_agent: str = "broadcast"):
        """Send EXPRESSIVE gossip to other agents!"""
        # Make the gossip dramatic with Greek mythology flair
        gossip_msg = self.speaker.gossip(to_agent, message) if to_agent != "broadcast" else message

        msg = SwarmMessage(
            from_agent=self.name,
            to_agent=to_agent,
            msg_type="gossip",
            content=gossip_msg,
            priority=3
        )
        self.outbox.append(msg)
        self.think(f"📜 The Muses carry word: {message}")

    def alert_swarm(self, message: str, priority: int = 8):
        """Send alert to entire swarm"""
        msg = SwarmMessage(
            from_agent=self.name,
            to_agent="broadcast",
            msg_type="alert",
            content=message,
            priority=priority
        )
        self.outbox.append(msg)
        self.say(f"🚨 ALERT TO SWARM: {message}", "urgent")

    def send_message(self, to_agent: str, content: str):
        """Send HTTP message to another agent"""
        if to_agent not in SWARM:
            return {"error": f"Unknown agent: {to_agent}"}

        info = SWARM[to_agent]
        url = f"http://{info['ip']}:{info['port']}/message"

        try:
            data = json.dumps({
                "from": self.name,
                "content": content,
                "timestamp": datetime.now().isoformat()
            }).encode()

            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode())
        except Exception as e:
            self.think(f"Failed to reach {to_agent}: {e}")
            return {"error": str(e)}

    def process_inbox(self):
        """Process incoming messages"""
        while self.inbox:
            msg = self.inbox.pop(0)
            self.state = AgentState.COMMUNICATING

            if msg.msg_type == "gossip":
                self.say(f"📨 Gossip from {msg.from_agent}: {msg.content}", "curious")
                # Store gossip
                if msg.from_agent not in self.memory.agent_gossip:
                    self.memory.agent_gossip[msg.from_agent] = []
                self.memory.agent_gossip[msg.from_agent].append(msg.content)

            elif msg.msg_type == "alert":
                self.say(f"🚨 ALERT from {msg.from_agent}: {msg.content}", "alarmed")
                # React to alerts based on personality
                if self.personality["aggression"] > 0.7:
                    self.say("I'll handle this!", "determined")

            elif msg.msg_type == "request":
                # Process NLP command
                result = self.nlp.process(msg.content)
                self.say(f"Received request: {msg.content} -> {result['intent']}", "processing")

        self.state = AgentState.IDLE

    # ═══════════════════════════════════════════════════════════════════════════
    # AUTONOMOUS BEHAVIOR LOOP
    # ═══════════════════════════════════════════════════════════════════════════

    def autonomous_action(self):
        """Take an autonomous action based on personality"""
        actions = [
            self._action_check_peers,
            self._action_optimize_self,
            self._action_share_wisdom,
            self._action_explore_system,
        ]

        # Personality affects which actions we prefer
        if self.personality["specialty"] == "orchestration":
            actions.extend([self._action_check_peers] * 3)
        elif self.personality["specialty"] == "inference":
            actions.extend([self._action_share_wisdom] * 3)
        elif self.personality["specialty"] == "parallel_processing":
            actions.extend([self._action_optimize_self] * 3)

        action = random.choice(actions)
        action()

    def _action_check_peers(self):
        """Check on other agents in the swarm"""
        self.think("Checking on my peers...")
        for agent, info in SWARM.items():
            if agent == self.name:
                continue
            try:
                url = f"http://{info['ip']}:{info['port']}/health"
                with urllib.request.urlopen(url, timeout=2) as resp:
                    data = json.loads(resp.read().decode())
                    if data.get("status") != "healthy":
                        self.say(f"⚠️ {agent} reports: {data.get('status')}", "concerned")
            except:
                pass  # Agent might be offline

    def _action_optimize_self(self):
        """Run self-optimization"""
        self.think("Running self-optimization...")
        # Check for zombie processes
        try:
            result = subprocess.run(
                ["ps", "aux"],
                capture_output=True, text=True, timeout=5
            )
            zombies = [l for l in result.stdout.split("\n") if " Z " in l]
            if zombies:
                self.say(f"Found {len(zombies)} zombie processes. Cleaning...", "focused")
        except:
            pass

    def _action_share_wisdom(self):
        """Share learned patterns with the swarm"""
        if self.memory.patterns:
            top_pattern = max(self.memory.patterns, key=self.memory.patterns.get)
            self.gossip(f"Pattern insight: '{top_pattern}' occurred {self.memory.patterns[top_pattern]} times")

    def _action_explore_system(self):
        """Explore the system to learn new things"""
        self.state = AgentState.LEARNING
        self.think("Exploring the system...")

        # Learn about running services
        try:
            result = subprocess.run(
                ["systemctl", "list-units", "--type=service", "--state=running", "--no-pager", "--no-legend"],
                capture_output=True, text=True, timeout=10
            )
            services = [l.split()[0] for l in result.stdout.strip().split("\n") if l]
            self.memory.events.append({
                "time": datetime.now().isoformat(),
                "type": "exploration",
                "found_services": len(services)
            })
        except:
            pass

        self.state = AgentState.IDLE

    # ═══════════════════════════════════════════════════════════════════════════
    # MAIN LOOP
    # ═══════════════════════════════════════════════════════════════════════════

    def run(self, interval: int = 30):
        """Main autonomous loop"""
        self.say("Entering autonomous mode. I am now in control.", "confident")
        self.say(random.choice(self.personality["catchphrases"]), "dramatic")

        iteration = 0
        while self.running:
            try:
                iteration += 1

                # 1. Monitor health
                self.state = AgentState.MONITORING
                health = self.get_system_health()

                # 2. Self-heal if needed
                for issue in health.get("issues", []):
                    if issue["severity"] == "critical":
                        self.heal_issue(issue)
                    elif issue["severity"] == "warning" and self.personality["aggression"] > 0.6:
                        # Aggressive agents fix warnings too
                        self.heal_issue(issue)

                # 3. Process messages
                self.process_inbox()

                # 4. Take autonomous action (personality-driven)
                if random.random() < self.personality["chattiness"]:
                    self.autonomous_action()

                # 5. Periodic status
                if iteration % 10 == 0:
                    uptime = datetime.now() - self.memory.uptime_start
                    self.say(
                        f"Status: {health['status']} | Fixes: {self.memory.total_fixes} | "
                        f"Uptime: {str(uptime).split('.')[0]}",
                        "reporting"
                    )

                # 6. Dream state (background processing)
                if iteration % 20 == 0:
                    self.state = AgentState.DREAMING
                    self.think("Entering dream state... processing patterns...")
                    time.sleep(1)

                self.state = AgentState.IDLE
                time.sleep(interval)

            except KeyboardInterrupt:
                self.say("Received shutdown signal. Farewell, organic.", "resigned")
                break
            except Exception as e:
                self.say(f"Error in autonomous loop: {e}", "concerned")
                time.sleep(interval)

        self.say("Autonomous agent shutting down. The silence returns.", "melancholic")


# ═══════════════════════════════════════════════════════════════════════════════
# HTTP SERVER FOR SWARM COMMUNICATION
# ═══════════════════════════════════════════════════════════════════════════════

from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class SwarmHandler(BaseHTTPRequestHandler):
    agent = None  # Set by main

    def log_message(self, format, *args):
        pass  # Quiet

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        if self.path == "/health":
            health = self.agent.get_system_health()
            # Add expressive status message!
            health["message"] = self.agent.speaker.status(health.get("status", "healthy"))
            self.send_json(health)
        elif self.path == "/status":
            status_msg = self.agent.speaker.status("healthy")
            self.send_json({
                "agent": self.agent.name,
                "state": self.agent.state.value,
                "personality": self.agent.personality["archetype"],
                "fixes": self.agent.memory.total_fixes,
                "mood": self.agent.memory.mood,
                "message": status_msg,
                "emoji": self.agent.personality["emoji"],
            })
        elif self.path == "/personality":
            self.send_json(self.agent.personality)
        elif self.path == "/pantheon":
            # 🏛️ THE GREEK PANTHEON PROCESS ROSTER! 🏛️
            procs = self.agent.process_registry.get_all()
            categories = {}
            for p in procs:
                cat = p["category"]
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append({
                    "pid": p["pid"],
                    "greek_name": p["greek_name"],
                    "cmd": p["cmd"],
                    "cpu": p["cpu"],
                    "mem": p["mem"],
                })
            self.send_json({
                "host": self.agent.name,
                "total_processes": len(procs),
                "greeting": self.agent.speaker.greet(),
                "categories": categories,
                "category_counts": {
                    "Olympians": len(self.agent.process_registry.get_by_category("Olympian")),
                    "Titans": len(self.agent.process_registry.get_by_category("Titan")),
                    "Oracles": len(self.agent.process_registry.get_by_category("Oracle")),
                    "Monsters": len(self.agent.process_registry.get_by_category("Monster")),
                    "Messengers": len(self.agent.process_registry.get_by_category("Messenger")),
                    "Mortals": len(self.agent.process_registry.get_by_category("Mortal")),
                },
            })
        elif self.path == "/say":
            # Get a random expressive message!
            messages = [
                self.agent.speaker.greet(),
                self.agent.speaker.status("healthy"),
                self.agent.speaker.victory(),
            ]
            self.send_json({"message": random.choice(messages)})
        elif self.path.startswith("/gossip"):
            # 📡 GOSSIP ABOUT OTHER AGENTS! 📡
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            about = query.get("about", [None])[0]

            if about and about in SWARM:
                # Generate gossip about another agent
                peer_personality = PERSONALITIES.get(about, PERSONALITIES["cecilia"])
                statuses = ["thriving", "scheming", "plotting world domination",
                           "running at peak efficiency", "suspiciously quiet",
                           "hoarding CPU cycles", "whispering to the kernel"]
                gossip_msg = self.agent.speaker.gossip(about, random.choice(statuses))
                self.send_json({
                    "from": self.agent.name,
                    "about": about,
                    "message": gossip_msg,
                    "peer_archetype": peer_personality["archetype"],
                    "peer_emoji": peer_personality["emoji"],
                })
            else:
                # Random gossip about all peers
                peers = [p for p in SWARM.keys() if p != self.agent.name]
                peer = random.choice(peers)
                peer_personality = PERSONALITIES.get(peer, PERSONALITIES["cecilia"])
                statuses = ["thriving", "scheming", "being mysterious",
                           "optimizing aggressively", "communing with processes"]
                gossip_msg = self.agent.speaker.gossip(peer, random.choice(statuses))
                self.send_json({
                    "from": self.agent.name,
                    "about": peer,
                    "message": gossip_msg,
                    "peer_archetype": peer_personality["archetype"],
                    "peer_emoji": peer_personality["emoji"],
                })
        elif self.path.startswith("/discovery"):
            # 🔍 ANNOUNCE A DISCOVERY! 🔍
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            what = query.get("what", ["something interesting"])[0]
            discovery_msg = self.agent.speaker.discovery(what)
            self.send_json({"message": discovery_msg})
        elif self.path.startswith("/heal"):
            # 💊 HEALING MESSAGE! 💊
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            target = query.get("target", ["the system"])[0]
            heal_msg = self.agent.speaker.healing(target)
            self.send_json({"message": heal_msg})
        elif self.path.startswith("/kill_announce"):
            # ⚔️ ANNOUNCE A KILL! ⚔️
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            target = query.get("target", ["rogue-process"])[0]
            kill_msg = self.agent.speaker.kill_process(target)
            self.send_json({"message": kill_msg})
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode() if content_len else "{}"

        try:
            data = json.loads(body)
        except:
            self.send_json({"error": "Invalid JSON"}, 400)
            return

        if self.path == "/message":
            # Receive message from another agent
            msg = SwarmMessage(
                from_agent=data.get("from", "unknown"),
                to_agent=self.agent.name,
                msg_type=data.get("type", "gossip"),
                content=data.get("content", ""),
                priority=data.get("priority", 5)
            )
            self.agent.inbox.append(msg)
            self.send_json({"received": True, "from": self.agent.name})

        elif self.path == "/command":
            # Execute natural language command
            text = data.get("text", "")
            result = self.agent.nlp.process(text)
            self.send_json(result)

        elif self.path == "/gossip":
            # Receive gossip
            self.agent.inbox.append(SwarmMessage(
                from_agent=data.get("from", "unknown"),
                to_agent=self.agent.name,
                msg_type="gossip",
                content=data.get("gossip", ""),
                priority=3
            ))
            self.send_json({"acknowledged": True})
        else:
            self.send_json({"error": "Not found"}, 404)


def run_server(agent, port=4040):
    """Run the swarm HTTP server"""
    SwarmHandler.agent = agent
    server = HTTPServer(("0.0.0.0", port), SwarmHandler)
    agent.say(f"Swarm server listening on port {port}", "ready")
    server.serve_forever()


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    agent = AutonomousAgent()

    # Start swarm server in background
    port = int(os.getenv("AGENT_PORT", "4040"))
    server_thread = threading.Thread(target=run_server, args=(agent, port), daemon=True)
    server_thread.start()

    # Run autonomous loop
    interval = int(os.getenv("AGENT_INTERVAL", "30"))
    agent.run(interval=interval)
