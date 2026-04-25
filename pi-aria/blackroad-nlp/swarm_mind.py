#!/usr/bin/env python3
"""
BlackRoad Swarm Mind - Collective Intelligence Layer
When agents work together, they become MORE than the sum of their parts.

This creates emergent behavior through:
- Consensus protocols (agents vote on decisions)
- Task distribution (swarm assigns work intelligently)
- Collective memory (shared knowledge across all agents)
- Mood contagion (agent emotions affect the swarm)
- Emergent roles (agents specialize based on performance)
"""

import os
import json
import time
import socket
import random
import hashlib
import urllib.request
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict

SELF = socket.gethostname()

# Swarm topology
SWARM_NODES = {
    "cecilia": {"ip": "192.168.4.89", "port": 4040, "rank": 1},  # Queen
    "lucidia": {"ip": "192.168.4.81", "port": 4040, "rank": 2},  # Oracle
    "octavia": {"ip": "192.168.4.38", "port": 4040, "rank": 3},  # Warrior
    "aria": {"ip": "192.168.4.82", "port": 4040, "rank": 4},     # Harmonizer
    "alice": {"ip": "192.168.4.49", "port": 4040, "rank": 5},    # Alchemist
}


class SwarmRole(Enum):
    """Emergent roles agents can take on"""
    QUEEN = "queen"           # Coordinates swarm
    SCOUT = "scout"           # Monitors and reports
    WARRIOR = "warrior"       # Handles heavy tasks
    HEALER = "healer"         # Fixes problems
    ORACLE = "oracle"         # Predicts issues
    MESSENGER = "messenger"   # Routes communications


class ConsensusType(Enum):
    """Types of consensus protocols"""
    MAJORITY = "majority"     # >50% agree
    UNANIMOUS = "unanimous"   # 100% agree
    QUORUM = "quorum"         # 3/5 agree
    LEADER = "leader"         # Queen decides


@dataclass
class SwarmTask:
    """A task that the swarm can work on together"""
    id: str
    description: str
    priority: int  # 1-10
    requires_consensus: bool = False
    assigned_to: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, failed
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    result: Optional[str] = None


@dataclass
class SwarmVote:
    """A vote on a swarm decision"""
    topic: str
    options: List[str]
    votes: Dict[str, str] = field(default_factory=dict)  # agent -> choice
    deadline: datetime = field(default_factory=lambda: datetime.now() + timedelta(minutes=5))
    result: Optional[str] = None


class CollectiveMemory:
    """Shared memory across all agents in the swarm"""

    def __init__(self, memory_file: str = "/tmp/swarm_memory.json"):
        self.memory_file = memory_file
        self.local_cache: Dict = {}
        self._load()

    def _load(self):
        try:
            with open(self.memory_file) as f:
                self.local_cache = json.load(f)
        except:
            self.local_cache = {
                "patterns": {},
                "incidents": [],
                "decisions": [],
                "agent_performance": {},
                "last_sync": None
            }

    def _save(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.local_cache, f, indent=2, default=str)

    def remember_pattern(self, pattern: str, context: str):
        """Remember a pattern observed in the swarm"""
        if pattern not in self.local_cache["patterns"]:
            self.local_cache["patterns"][pattern] = {"count": 0, "contexts": []}
        self.local_cache["patterns"][pattern]["count"] += 1
        self.local_cache["patterns"][pattern]["contexts"].append({
            "context": context,
            "time": datetime.now().isoformat(),
            "observer": SELF
        })
        self._save()

    def record_incident(self, incident: Dict):
        """Record an incident for collective learning"""
        incident["recorded_by"] = SELF
        incident["timestamp"] = datetime.now().isoformat()
        self.local_cache["incidents"].append(incident)
        self._save()

    def record_decision(self, decision: Dict):
        """Record a swarm decision"""
        decision["made_at"] = datetime.now().isoformat()
        self.local_cache["decisions"].append(decision)
        self._save()

    def update_agent_performance(self, agent: str, metric: str, value: float):
        """Track agent performance for role assignment"""
        if agent not in self.local_cache["agent_performance"]:
            self.local_cache["agent_performance"][agent] = {}
        self.local_cache["agent_performance"][agent][metric] = value
        self._save()

    def get_best_agent_for(self, task_type: str) -> Optional[str]:
        """Find the best agent for a specific task type"""
        perf = self.local_cache.get("agent_performance", {})
        if not perf:
            return None

        scores = []
        for agent, metrics in perf.items():
            score = metrics.get(task_type, 0)
            scores.append((agent, score))

        if scores:
            return max(scores, key=lambda x: x[1])[0]
        return None


class SwarmMind:
    """
    The collective intelligence layer.
    When activated, agents become a hive mind with emergent behavior.
    """

    def __init__(self):
        self.node = SELF
        self.nodes = SWARM_NODES
        self.memory = CollectiveMemory()
        self.active_votes: Dict[str, SwarmVote] = {}
        self.task_queue: List[SwarmTask] = []
        self.my_role = self._determine_role()

        print(f"🧠 Swarm Mind initialized on {self.node}")
        print(f"   Role: {self.my_role.value}")
        print(f"   Connected nodes: {list(self.nodes.keys())}")

    def _determine_role(self) -> SwarmRole:
        """Determine this agent's role in the swarm"""
        roles = {
            "cecilia": SwarmRole.QUEEN,
            "lucidia": SwarmRole.ORACLE,
            "octavia": SwarmRole.WARRIOR,
            "aria": SwarmRole.HEALER,
            "alice": SwarmRole.SCOUT,
        }
        return roles.get(self.node, SwarmRole.SCOUT)

    def _call_node(self, node: str, endpoint: str, data: Dict = None) -> Optional[Dict]:
        """Call another node in the swarm"""
        if node not in self.nodes:
            return None

        info = self.nodes[node]
        url = f"http://{info['ip']}:{info['port']}{endpoint}"

        try:
            if data:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(data).encode(),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
            else:
                req = urllib.request.Request(url)

            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode())
        except:
            return None

    def get_swarm_health(self) -> Dict:
        """Get health status of entire swarm"""
        health = {"nodes": {}, "online": 0, "offline": 0}

        for node in self.nodes:
            result = self._call_node(node, "/health")
            if result:
                health["nodes"][node] = result
                health["online"] += 1
            else:
                health["nodes"][node] = {"status": "offline"}
                health["offline"] += 1

        # Calculate swarm mood based on individual agent states
        moods = [n.get("mood", "neutral") for n in health["nodes"].values() if isinstance(n, dict)]
        health["swarm_mood"] = self._calculate_swarm_mood(moods)

        return health

    def _calculate_swarm_mood(self, moods: List[str]) -> str:
        """Mood contagion - swarm mood emerges from individual moods"""
        if not moods:
            return "uncertain"

        mood_scores = {
            "anxious": -2, "frustrated": -1, "neutral": 0,
            "curious": 1, "confident": 2, "triumphant": 3
        }

        total = sum(mood_scores.get(m, 0) for m in moods)
        avg = total / len(moods)

        if avg < -1:
            return "distressed"
        elif avg < 0:
            return "concerned"
        elif avg < 1:
            return "stable"
        elif avg < 2:
            return "optimistic"
        else:
            return "euphoric"

    # ═══════════════════════════════════════════════════════════════════════════
    # CONSENSUS PROTOCOLS
    # ═══════════════════════════════════════════════════════════════════════════

    def propose_vote(self, topic: str, options: List[str],
                    consensus_type: ConsensusType = ConsensusType.MAJORITY) -> str:
        """Propose a vote to the swarm"""
        vote_id = hashlib.md5(f"{topic}{time.time()}".encode()).hexdigest()[:8]
        vote = SwarmVote(topic=topic, options=options)
        self.active_votes[vote_id] = vote

        # Broadcast vote request to swarm
        for node in self.nodes:
            if node != self.node:
                self._call_node(node, "/vote/propose", {
                    "vote_id": vote_id,
                    "topic": topic,
                    "options": options,
                    "from": self.node
                })

        print(f"📊 Vote proposed: {topic}")
        print(f"   Options: {options}")
        print(f"   Vote ID: {vote_id}")

        return vote_id

    def cast_vote(self, vote_id: str, choice: str):
        """Cast a vote"""
        if vote_id in self.active_votes:
            self.active_votes[vote_id].votes[self.node] = choice
            print(f"🗳️ {self.node} voted '{choice}' on {vote_id}")

            # Broadcast vote to swarm
            for node in self.nodes:
                if node != self.node:
                    self._call_node(node, "/vote/cast", {
                        "vote_id": vote_id,
                        "agent": self.node,
                        "choice": choice
                    })

    def tally_vote(self, vote_id: str) -> Optional[str]:
        """Tally votes and determine result"""
        if vote_id not in self.active_votes:
            return None

        vote = self.active_votes[vote_id]
        if not vote.votes:
            return None

        # Count votes
        counts = defaultdict(int)
        for choice in vote.votes.values():
            counts[choice] += 1

        winner = max(counts, key=counts.get)
        total = len(vote.votes)
        winner_count = counts[winner]

        print(f"📊 Vote results for '{vote.topic}':")
        for opt, count in counts.items():
            print(f"   {opt}: {count}/{total} ({count/total*100:.0f}%)")

        # Record decision
        self.memory.record_decision({
            "vote_id": vote_id,
            "topic": vote.topic,
            "result": winner,
            "votes": dict(vote.votes),
            "unanimous": winner_count == total
        })

        vote.result = winner
        return winner

    # ═══════════════════════════════════════════════════════════════════════════
    # TASK DISTRIBUTION
    # ═══════════════════════════════════════════════════════════════════════════

    def submit_task(self, description: str, priority: int = 5,
                   requires_consensus: bool = False) -> SwarmTask:
        """Submit a task to the swarm"""
        task = SwarmTask(
            id=hashlib.md5(f"{description}{time.time()}".encode()).hexdigest()[:8],
            description=description,
            priority=priority,
            requires_consensus=requires_consensus
        )
        self.task_queue.append(task)
        self._distribute_task(task)
        return task

    def _distribute_task(self, task: SwarmTask):
        """Intelligently distribute task to best agent"""
        # Simple keyword matching for task type
        task_lower = task.description.lower()

        if "inference" in task_lower or "predict" in task_lower:
            best = "lucidia"
        elif "container" in task_lower or "kubernetes" in task_lower:
            best = "alice"
        elif "parallel" in task_lower or "batch" in task_lower:
            best = "octavia"
        elif "balance" in task_lower or "sync" in task_lower:
            best = "aria"
        else:
            # Check collective memory for best performer
            best = self.memory.get_best_agent_for("general") or "cecilia"

        task.assigned_to = best
        print(f"📋 Task '{task.description[:30]}...' assigned to {best}")

        # Notify the assigned agent
        self._call_node(best, "/task/assign", {
            "task_id": task.id,
            "description": task.description,
            "priority": task.priority,
            "from": self.node
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # EMERGENT BEHAVIORS
    # ═══════════════════════════════════════════════════════════════════════════

    def swarm_action(self, action: str, context: Dict = None):
        """
        Coordinate a swarm-wide action.
        All agents work together on the same goal.
        """
        print(f"🐝 SWARM ACTION: {action}")

        if action == "health_check":
            # All agents report health simultaneously
            health = self.get_swarm_health()
            print(f"   Swarm status: {health['online']}/{len(self.nodes)} online")
            print(f"   Swarm mood: {health['swarm_mood']}")
            return health

        elif action == "collective_heal":
            # Swarm works together to fix issues
            for node in self.nodes:
                result = self._call_node(node, "/health")
                if result and result.get("status") != "healthy":
                    self._call_node(node, "/heal", {"issues": result.get("issues", [])})

        elif action == "synchronize":
            # Sync collective memory across all nodes
            for node in self.nodes:
                if node != self.node:
                    self._call_node(node, "/memory/sync", {
                        "memory": self.memory.local_cache
                    })

        elif action == "form_consensus":
            # Form consensus on an action
            if context and "topic" in context:
                vote_id = self.propose_vote(
                    context["topic"],
                    context.get("options", ["yes", "no"])
                )
                # Wait for votes (in practice, this would be async)
                time.sleep(2)
                return self.tally_vote(vote_id)

        elif action == "elect_leader":
            # Democratic leader election
            vote_id = self.propose_vote(
                "Who should lead?",
                list(self.nodes.keys())
            )
            # Each agent votes for themselves or based on performance
            self.cast_vote(vote_id, self._vote_for_leader())
            time.sleep(3)
            return self.tally_vote(vote_id)

    def _vote_for_leader(self) -> str:
        """Decide who to vote for as leader"""
        # Personality-based voting
        perf = self.memory.local_cache.get("agent_performance", {})

        if perf:
            # Vote for highest performer
            scores = [(a, sum(m.values())) for a, m in perf.items()]
            if scores:
                return max(scores, key=lambda x: x[1])[0]

        # Default: vote based on rank
        ranked = sorted(self.nodes.items(), key=lambda x: x[1]["rank"])
        return ranked[0][0]

    def gossip_round(self):
        """
        Gossip protocol - agents share information randomly.
        This creates eventual consistency in collective knowledge.
        """
        # Pick random subset of nodes to gossip with
        targets = random.sample(
            [n for n in self.nodes if n != self.node],
            min(2, len(self.nodes) - 1)
        )

        for target in targets:
            # Share recent patterns
            recent_patterns = list(self.memory.local_cache.get("patterns", {}).keys())[-5:]
            self._call_node(target, "/gossip", {
                "from": self.node,
                "gossip": f"Recent patterns: {recent_patterns}",
                "mood": "curious"
            })

    def emergent_specialization(self):
        """
        Over time, agents specialize based on what they're good at.
        This is emergent role assignment.
        """
        perf = self.memory.local_cache.get("agent_performance", {})

        if self.node in perf:
            my_perf = perf[self.node]
            if my_perf:
                best_skill = max(my_perf, key=my_perf.get)
                print(f"🎯 {self.node} is specializing in: {best_skill}")
                return best_skill

        return None


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    mind = SwarmMind()

    if len(sys.argv) < 2:
        print("\nSwarm Mind Commands:")
        print("  health     - Get swarm health")
        print("  vote <topic> - Propose a vote")
        print("  task <desc> - Submit a task")
        print("  action <name> - Trigger swarm action")
        print("  gossip     - Run gossip round")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "health":
        health = mind.get_swarm_health()
        print(json.dumps(health, indent=2, default=str))

    elif cmd == "vote" and len(sys.argv) > 2:
        topic = " ".join(sys.argv[2:])
        vote_id = mind.propose_vote(topic, ["yes", "no", "maybe"])
        mind.cast_vote(vote_id, random.choice(["yes", "no", "maybe"]))
        time.sleep(1)
        mind.tally_vote(vote_id)

    elif cmd == "task" and len(sys.argv) > 2:
        desc = " ".join(sys.argv[2:])
        task = mind.submit_task(desc)
        print(f"Task submitted: {task.id}")

    elif cmd == "action" and len(sys.argv) > 2:
        action = sys.argv[2]
        result = mind.swarm_action(action)
        if result:
            print(json.dumps(result, indent=2, default=str))

    elif cmd == "gossip":
        mind.gossip_round()

    else:
        print(f"Unknown command: {cmd}")
