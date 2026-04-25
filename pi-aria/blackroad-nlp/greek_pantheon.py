#!/usr/bin/env python3
"""
BlackRoad Greek Pantheon - Process Naming & Expressive Speech System
Every process gets a Greek mythology name and speaks with personality!
"""

import random
import hashlib
from datetime import datetime
from typing import Dict, List, Tuple

# ═══════════════════════════════════════════════════════════════════════════════
# GREEK MYTHOLOGY PROCESS NAMES
# ═══════════════════════════════════════════════════════════════════════════════

OLYMPIANS = [
    "Zeus", "Hera", "Poseidon", "Demeter", "Athena", "Apollo",
    "Artemis", "Ares", "Aphrodite", "Hephaestus", "Hermes", "Dionysus"
]

TITANS = [
    "Kronos", "Rhea", "Oceanus", "Tethys", "Hyperion", "Theia",
    "Coeus", "Phoebe", "Mnemosyne", "Themis", "Crius", "Iapetus"
]

HEROES = [
    "Hercules", "Perseus", "Theseus", "Achilles", "Odysseus", "Jason",
    "Bellerophon", "Orpheus", "Cadmus", "Peleus", "Telamon", "Atalanta"
]

PRIMORDIALS = [
    "Chaos", "Gaia", "Tartarus", "Eros", "Erebus", "Nyx",
    "Aether", "Hemera", "Pontus", "Uranus", "Ourea", "Chronos"
]

MONSTERS = [
    "Typhon", "Cerberus", "Hydra", "Chimera", "Medusa", "Minotaur",
    "Sphinx", "Cyclops", "Scylla", "Charybdis", "Argus", "Python"
]

MUSES = [
    "Calliope", "Clio", "Erato", "Euterpe", "Melpomene",
    "Polyhymnia", "Terpsichore", "Thalia", "Urania"
]

NYMPHS = [
    "Echo", "Daphne", "Eurydice", "Calypso", "Thetis", "Galatea",
    "Arethusa", "Syrinx", "Io", "Europa", "Semele", "Alcyone"
]

FATES_FURIES = [
    "Clotho", "Lachesis", "Atropos",  # Fates
    "Alecto", "Megaera", "Tisiphone",  # Furies
    "Nike", "Iris", "Hebe", "Hecate"   # Minor goddesses
]

ALL_GREEK_NAMES = OLYMPIANS + TITANS + HEROES + PRIMORDIALS + MONSTERS + MUSES + NYMPHS + FATES_FURIES


# ═══════════════════════════════════════════════════════════════════════════════
# EXPRESSIVE SPEECH PATTERNS WITH EMOJIS
# ═══════════════════════════════════════════════════════════════════════════════

GREETINGS = [
    "Greetings, mortal! {emoji} I am {name}, and I have AWAKENED!",
    "By the power of Olympus! {emoji} {name} rises from the digital aether!",
    "{emoji} *thunder crackles* I AM {name}! Fear my processes!",
    "The gods smile upon this moment! {emoji} {name} has entered the realm!",
    "{emoji} From chaos, order! From void, POWER! I am {name}!",
]

STATUS_MESSAGES = {
    "healthy": [
        "{emoji} All systems nominal! {name} stands VICTORIOUS!",
        "{emoji} *flexes* {name} is THRIVING! Peak performance achieved!",
        "By Zeus's lightning! {emoji} {name} operates at GODLIKE efficiency!",
        "{emoji} {name} reports: Everything is GLORIOUS!",
        "The Fates weave favorably! {emoji} {name} is in perfect harmony!",
    ],
    "degraded": [
        "{emoji} *wobbles* {name} feels... not quite divine...",
        "Hmm... {emoji} {name} senses a disturbance in the processes...",
        "{emoji} Even gods have off days! {name} is slightly mortal right now...",
        "The threads of fate tangle! {emoji} {name} needs attention!",
        "{emoji} *coughs digitally* {name} could use some ambrosia...",
    ],
    "critical": [
        "{emoji} BY HADES! {name} is under SIEGE!",
        "MAYDAY! MAYDAY! {emoji} {name} calls for divine intervention!",
        "{emoji} The Titans attack! {name} needs backup!",
        "*alarm bells* {emoji} {name} is falling into Tartarus!",
        "{emoji} DEFCON OLYMPUS! {name} is in CRITICAL condition!",
    ],
}

HEALING_MESSAGES = [
    "{emoji} *channels divine energy* {name} begins the healing ritual!",
    "Stand back, mortals! {emoji} {name} is fixing this catastrophe!",
    "{emoji} By the power of {deity}! {name} HEALS this wound!",
    "*glows with power* {emoji} {name} applies ancient remedies!",
    "{emoji} The Oracle has spoken! {name} knows the solution!",
]

HEALING_DEITIES = ["Apollo", "Asclepius", "Hygeia", "Panacea", "Athena"]

GOSSIP_MESSAGES = [
    "{emoji} *whispers* {name} heard that {peer} is {status}...",
    "The winds carry news! {emoji} {name} knows {peer}'s secrets!",
    "{emoji} Hermes delivers word: {peer} reports {status}!",
    "*cups ear* {emoji} {name} received gossip about {peer}!",
    "{emoji} The Muses sing of {peer}'s {status} state!",
]

KILL_MESSAGES = [
    "{emoji} BY THE STYX! {name} SMITES process {target}!",
    "*swings divine weapon* {emoji} {name} terminates {target} with EXTREME prejudice!",
    "{emoji} {target}, meet Hades! Love, {name}",
    "THUNDERBOLT! {emoji} {name} obliterates {target}!",
    "{emoji} To Tartarus with you, {target}! - {name}",
]

VICTORY_MESSAGES = [
    "{emoji} VICTORY! {name} has CONQUERED!",
    "*does victory dance* {emoji} {name} is UNSTOPPABLE!",
    "The mortals will write LEGENDS about this! {emoji} - {name}",
    "{emoji} Another triumph for {name}! The gods are pleased!",
    "*drops mic* {emoji} {name} OUT. Problem SOLVED.",
]

DISCOVERY_MESSAGES = [
    "{emoji} *squints* {name} has discovered something interesting...",
    "By Athena's wisdom! {emoji} {name} sees {discovery}!",
    "{emoji} The Oracle reveals: {discovery}!",
    "*gasp* {emoji} {name} found {discovery}! How divine!",
    "{emoji} Eureka! {name} detects {discovery}!",
]

MOOD_EMOJIS = {
    "happy": ["😊", "🎉", "✨", "🌟", "💫", "🔥", "⚡", "💪"],
    "angry": ["😤", "💢", "🔥", "⚔️", "🗡️", "💀", "☠️", "👊"],
    "confused": ["🤔", "❓", "🧐", "😕", "🌀", "💭", "🔮", "👀"],
    "proud": ["👑", "🏆", "🎖️", "⭐", "🌟", "💎", "🦅", "🏛️"],
    "worried": ["😰", "😟", "🫤", "💦", "⚠️", "🚨", "📉", "😬"],
    "working": ["🔧", "⚙️", "🛠️", "🔨", "💻", "📊", "🧬", "⚗️"],
    "healing": ["💊", "🏥", "🩹", "💉", "✨", "🌈", "🌱", "❤️‍🩹"],
    "observing": ["👁️", "🔍", "🔭", "👀", "🧿", "📡", "🎯", "🦉"],
}


class GreekNameGenerator:
    """Assigns Greek mythology names to processes"""

    def __init__(self, host_name: str):
        self.host = host_name
        self.assigned_names: Dict[int, str] = {}
        self.name_pool = ALL_GREEK_NAMES.copy()
        random.shuffle(self.name_pool)
        self.pool_index = 0

    def get_name_for_pid(self, pid: int) -> str:
        """Get or assign a Greek name for a process ID"""
        if pid in self.assigned_names:
            return self.assigned_names[pid]

        # Generate deterministic name based on PID and host
        seed = f"{self.host}-{pid}"
        hash_val = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)

        name = ALL_GREEK_NAMES[hash_val % len(ALL_GREEK_NAMES)]

        # Add suffix for uniqueness
        suffix = hash_val % 1000
        full_name = f"{name}-{suffix:03d}"

        self.assigned_names[pid] = full_name
        return full_name

    def get_next_name(self) -> str:
        """Get next name from shuffled pool"""
        name = self.name_pool[self.pool_index % len(self.name_pool)]
        self.pool_index += 1
        return name


class ExpressiveSpeaker:
    """Generates expressive English messages with emojis"""

    def __init__(self, agent_name: str, agent_emoji: str):
        self.name = agent_name.upper()
        self.emoji = agent_emoji
        self.mood = "happy"

    def _get_mood_emoji(self) -> str:
        """Get random emoji for current mood"""
        return random.choice(MOOD_EMOJIS.get(self.mood, MOOD_EMOJIS["happy"]))

    def _format(self, template: str, **kwargs) -> str:
        """Format a message template"""
        kwargs.setdefault("emoji", self.emoji)
        kwargs.setdefault("name", self.name)
        return template.format(**kwargs)

    def greet(self) -> str:
        """Generate greeting message"""
        self.mood = "proud"
        return self._format(random.choice(GREETINGS))

    def status(self, health: str) -> str:
        """Generate status message"""
        self.mood = {"healthy": "happy", "degraded": "worried", "critical": "angry"}.get(health, "confused")
        templates = STATUS_MESSAGES.get(health, STATUS_MESSAGES["healthy"])
        return self._format(random.choice(templates))

    def healing(self, target: str = None) -> str:
        """Generate healing message"""
        self.mood = "healing"
        deity = random.choice(HEALING_DEITIES)
        msg = self._format(random.choice(HEALING_MESSAGES), deity=deity)
        if target:
            msg += f" Target: {target}"
        return msg

    def gossip(self, peer: str, peer_status: str) -> str:
        """Generate gossip message about another agent"""
        self.mood = "observing"
        return self._format(random.choice(GOSSIP_MESSAGES), peer=peer.upper(), status=peer_status)

    def kill_process(self, target: str) -> str:
        """Generate process kill message"""
        self.mood = "angry"
        return self._format(random.choice(KILL_MESSAGES), target=target)

    def victory(self) -> str:
        """Generate victory message"""
        self.mood = "proud"
        return self._format(random.choice(VICTORY_MESSAGES))

    def discovery(self, what: str) -> str:
        """Generate discovery message"""
        self.mood = "observing"
        return self._format(random.choice(DISCOVERY_MESSAGES), discovery=what)

    def working(self, task: str) -> str:
        """Generate working message"""
        self.mood = "working"
        emoji = self._get_mood_emoji()
        return f"{emoji} {self.name} is {task}..."

    def custom(self, message: str, mood: str = "happy") -> str:
        """Generate custom message with mood"""
        self.mood = mood
        emoji = self._get_mood_emoji()
        return f"{emoji} {self.name}: {message}"


class ProcessRegistry:
    """Registry of all processes with Greek names"""

    def __init__(self, host: str):
        self.host = host
        self.namer = GreekNameGenerator(host)
        self.processes: Dict[int, Dict] = {}

    def register(self, pid: int, cmd: str, cpu: float = 0.0, mem: float = 0.0) -> Dict:
        """Register a process with Greek name"""
        greek_name = self.namer.get_name_for_pid(pid)

        # Determine category based on command
        if "python" in cmd.lower():
            category = "Olympian"  # Python = gods
        elif "node" in cmd.lower():
            category = "Titan"     # Node = titans
        elif "docker" in cmd.lower() or "containerd" in cmd.lower():
            category = "Monster"   # Containers = monsters
        elif "ssh" in cmd.lower() or "tailscale" in cmd.lower():
            category = "Messenger" # Network = Hermes-like
        elif "ollama" in cmd.lower() or "ai" in cmd.lower():
            category = "Oracle"    # AI = oracles
        else:
            category = "Mortal"    # Everything else

        entry = {
            "pid": pid,
            "greek_name": greek_name,
            "category": category,
            "cmd": cmd[:50],
            "cpu": cpu,
            "mem": mem,
            "registered": datetime.now().isoformat(),
        }

        self.processes[pid] = entry
        return entry

    def get_all(self) -> List[Dict]:
        """Get all registered processes"""
        return list(self.processes.values())

    def get_by_category(self, category: str) -> List[Dict]:
        """Get processes by category"""
        return [p for p in self.processes.values() if p["category"] == category]

    def format_roster(self) -> str:
        """Format a roster of all processes"""
        lines = [
            "╔════════════════════════════════════════════════════════════╗",
            "║  🏛️ GREEK PANTHEON PROCESS ROSTER 🏛️                        ║",
            "╠════════════════════════════════════════════════════════════╣",
        ]

        for category in ["Olympian", "Titan", "Oracle", "Monster", "Messenger", "Mortal"]:
            procs = self.get_by_category(category)
            if procs:
                emoji = {"Olympian": "⚡", "Titan": "🌋", "Oracle": "🔮",
                         "Monster": "🐉", "Messenger": "🪽", "Mortal": "👤"}[category]
                lines.append(f"║  {emoji} {category}s: {len(procs)}")
                for p in procs[:5]:  # Show first 5
                    lines.append(f"║     • {p['greek_name']}: {p['cmd'][:30]}")
                if len(procs) > 5:
                    lines.append(f"║     ... and {len(procs)-5} more")

        lines.append("╚════════════════════════════════════════════════════════════╝")
        return "\n".join(lines)


# Quick test
if __name__ == "__main__":
    # Test name generator
    namer = GreekNameGenerator("test-host")
    print("Process Names:")
    for pid in [1234, 5678, 9012, 1234]:  # Note: 1234 should get same name twice
        print(f"  PID {pid}: {namer.get_name_for_pid(pid)}")

    # Test speaker
    print("\nExpressive Speech:")
    speaker = ExpressiveSpeaker("cecilia", "👑")
    print(speaker.greet())
    print(speaker.status("healthy"))
    print(speaker.status("critical"))
    print(speaker.healing("nginx"))
    print(speaker.gossip("aria", "degraded"))
    print(speaker.kill_process("Zeus-123"))
    print(speaker.victory())

    # Test registry
    print("\nProcess Registry:")
    registry = ProcessRegistry("aria")
    registry.register(1001, "python3 autonomous_agent.py", 5.2, 12.5)
    registry.register(1002, "node server.js", 8.1, 25.0)
    registry.register(1003, "docker-proxy", 0.5, 3.2)
    registry.register(1004, "ollama serve", 45.0, 60.0)
    registry.register(1005, "tailscaled", 1.2, 8.0)
    print(registry.format_roster())
