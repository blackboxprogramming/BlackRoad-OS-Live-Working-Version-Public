"""
RoadPad Macro System - Record and replay keystrokes.

Features:
- Record key sequences
- Named macros
- Persistence
- Repeat count
"""

import os
import json
from dataclasses import dataclass, field
from typing import List, Dict, Callable
from datetime import datetime


@dataclass
class Keystroke:
    """A single keystroke."""
    key: int
    char: str = ""
    timestamp: float = 0.0

    def to_dict(self) -> dict:
        return {"key": self.key, "char": self.char}

    @classmethod
    def from_dict(cls, d: dict) -> "Keystroke":
        return cls(key=d["key"], char=d.get("char", ""))


@dataclass
class Macro:
    """A recorded macro."""
    name: str
    keystrokes: List[Keystroke] = field(default_factory=list)
    description: str = ""
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    run_count: int = 0

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "keystrokes": [k.to_dict() for k in self.keystrokes],
            "description": self.description,
            "created": self.created,
            "run_count": self.run_count
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Macro":
        return cls(
            name=d["name"],
            keystrokes=[Keystroke.from_dict(k) for k in d.get("keystrokes", [])],
            description=d.get("description", ""),
            created=d.get("created", ""),
            run_count=d.get("run_count", 0)
        )


class MacroRecorder:
    """Records and plays macros."""

    def __init__(self, macros_dir: str | None = None):
        self.macros_dir = macros_dir or os.path.expanduser("~/.roadpad/macros")
        os.makedirs(self.macros_dir, exist_ok=True)

        self.macros: Dict[str, Macro] = {}
        self.recording: bool = False
        self.current_recording: List[Keystroke] = []
        self.current_name: str = ""

        # Quick slots (q-z)
        self.slots: Dict[str, str] = {}  # slot -> macro name

        self._load_macros()

    def _load_macros(self) -> None:
        """Load macros from disk."""
        macros_file = os.path.join(self.macros_dir, "macros.json")
        if os.path.exists(macros_file):
            try:
                with open(macros_file, "r") as f:
                    data = json.load(f)
                for item in data.get("macros", []):
                    macro = Macro.from_dict(item)
                    self.macros[macro.name] = macro
                self.slots = data.get("slots", {})
            except:
                pass

    def _save_macros(self) -> None:
        """Save macros to disk."""
        macros_file = os.path.join(self.macros_dir, "macros.json")
        data = {
            "macros": [m.to_dict() for m in self.macros.values()],
            "slots": self.slots
        }
        with open(macros_file, "w") as f:
            json.dump(data, f, indent=2)

    def start_recording(self, name: str = "") -> None:
        """Start recording a macro."""
        self.recording = True
        self.current_recording = []
        self.current_name = name or f"macro_{len(self.macros) + 1}"

    def stop_recording(self, description: str = "") -> Macro | None:
        """Stop recording and save macro."""
        if not self.recording:
            return None

        self.recording = False
        if not self.current_recording:
            return None

        macro = Macro(
            name=self.current_name,
            keystrokes=self.current_recording,
            description=description
        )
        self.macros[macro.name] = macro
        self._save_macros()

        self.current_recording = []
        self.current_name = ""
        return macro

    def cancel_recording(self) -> None:
        """Cancel current recording."""
        self.recording = False
        self.current_recording = []
        self.current_name = ""

    def record_key(self, key: int, char: str = "") -> None:
        """Record a keystroke."""
        if self.recording:
            self.current_recording.append(Keystroke(key=key, char=char))

    def play(self, name: str, key_handler: Callable[[int, str], None], repeat: int = 1) -> bool:
        """Play a macro."""
        macro = self.macros.get(name)
        if not macro:
            return False

        for _ in range(repeat):
            for keystroke in macro.keystrokes:
                key_handler(keystroke.key, keystroke.char)

        macro.run_count += 1
        self._save_macros()
        return True

    def play_slot(self, slot: str, key_handler: Callable[[int, str], None], repeat: int = 1) -> bool:
        """Play macro from slot."""
        name = self.slots.get(slot)
        if not name:
            return False
        return self.play(name, key_handler, repeat)

    def assign_slot(self, slot: str, name: str) -> bool:
        """Assign macro to quick slot."""
        if name not in self.macros:
            return False
        self.slots[slot] = name
        self._save_macros()
        return True

    def delete(self, name: str) -> bool:
        """Delete a macro."""
        if name in self.macros:
            del self.macros[name]
            # Remove from slots
            self.slots = {k: v for k, v in self.slots.items() if v != name}
            self._save_macros()
            return True
        return False

    def rename(self, old_name: str, new_name: str) -> bool:
        """Rename a macro."""
        if old_name not in self.macros or new_name in self.macros:
            return False
        macro = self.macros.pop(old_name)
        macro.name = new_name
        self.macros[new_name] = macro
        # Update slots
        for slot, name in self.slots.items():
            if name == old_name:
                self.slots[slot] = new_name
        self._save_macros()
        return True

    def list_macros(self) -> List[Macro]:
        """List all macros."""
        return sorted(self.macros.values(), key=lambda m: m.name)

    def get_status(self) -> str:
        """Get recording status."""
        if self.recording:
            return f"REC [{self.current_name}] {len(self.current_recording)} keys"
        return ""

    def format_list(self) -> str:
        """Format macro list for display."""
        lines = ["Macros", "=" * 40, ""]

        if not self.macros:
            lines.append("No macros recorded")
            lines.append("")
            lines.append("Press Ctrl+R to start recording")
            return "\n".join(lines)

        # Quick slots
        if self.slots:
            lines.append("[Quick Slots]")
            for slot, name in sorted(self.slots.items()):
                lines.append(f"  @{slot} -> {name}")
            lines.append("")

        # All macros
        lines.append("[All Macros]")
        for macro in self.list_macros():
            slot_mark = ""
            for s, n in self.slots.items():
                if n == macro.name:
                    slot_mark = f" [@{s}]"
                    break
            lines.append(f"  {macro.name}{slot_mark}")
            lines.append(f"    {len(macro.keystrokes)} keys, run {macro.run_count}x")
            if macro.description:
                lines.append(f"    {macro.description}")

        lines.append("")
        lines.append("Commands: @<slot> to play, Ctrl+R to record")

        return "\n".join(lines)


# Global recorder
_recorder: MacroRecorder | None = None

def get_macro_recorder() -> MacroRecorder:
    """Get global macro recorder."""
    global _recorder
    if _recorder is None:
        _recorder = MacroRecorder()
    return _recorder
