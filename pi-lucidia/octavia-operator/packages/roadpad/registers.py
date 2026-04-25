"""
RoadPad Registers - Vim-style yank registers.

Features:
- Named registers (a-z)
- Numbered registers (0-9)
- Special registers (", +, *, /)
- Clipboard integration
"""

import os
import json
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List
from datetime import datetime


@dataclass
class Register:
    """A yank register."""
    name: str
    content: str = ""
    linewise: bool = False  # True if yanked whole lines
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "content": self.content,
            "linewise": self.linewise,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Register":
        return cls(
            name=data["name"],
            content=data.get("content", ""),
            linewise=data.get("linewise", False),
            timestamp=data.get("timestamp", "")
        )


class RegisterManager:
    """Manages vim-style registers."""

    def __init__(self, registers_dir: str | None = None):
        self.registers_dir = registers_dir or os.path.expanduser("~/.roadpad/registers")
        os.makedirs(self.registers_dir, exist_ok=True)

        # Named registers (a-z)
        self.named: Dict[str, Register] = {}

        # Numbered registers (0-9)
        # 0 = last yank
        # 1-9 = last deletes (shifted)
        self.numbered: List[Register] = [Register(name=str(i)) for i in range(10)]

        # Special registers
        # " = unnamed (default)
        # + = system clipboard
        # * = selection clipboard (X11)
        # / = last search pattern
        # : = last command
        # . = last inserted text
        # % = current filename
        # # = alternate filename
        self.unnamed = Register(name='"')
        self.last_search = Register(name="/")
        self.last_command = Register(name=":")
        self.last_insert = Register(name=".")
        self.current_file = Register(name="%")
        self.alternate_file = Register(name="#")

        # Current register for next operation
        self.selected_register: str = '"'

        self._load()

    def _load(self) -> None:
        """Load registers from disk."""
        filepath = os.path.join(self.registers_dir, "registers.json")
        if os.path.exists(filepath):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)

                for name, reg_data in data.get("named", {}).items():
                    self.named[name] = Register.from_dict(reg_data)

                for i, reg_data in enumerate(data.get("numbered", [])):
                    if i < 10:
                        self.numbered[i] = Register.from_dict(reg_data)

                if "unnamed" in data:
                    self.unnamed = Register.from_dict(data["unnamed"])
            except:
                pass

    def _save(self) -> None:
        """Save registers to disk."""
        filepath = os.path.join(self.registers_dir, "registers.json")
        data = {
            "named": {name: reg.to_dict() for name, reg in self.named.items()},
            "numbered": [reg.to_dict() for reg in self.numbered],
            "unnamed": self.unnamed.to_dict()
        }
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    def select(self, name: str) -> None:
        """Select register for next operation."""
        self.selected_register = name

    def yank(self, content: str, linewise: bool = False, register: str | None = None) -> None:
        """Yank content to register."""
        reg_name = register or self.selected_register
        self.selected_register = '"'  # Reset

        reg = Register(name=reg_name, content=content, linewise=linewise)

        if reg_name == '"':
            # Unnamed - also goes to "0
            self.unnamed = reg
            self.numbered[0] = Register(name="0", content=content, linewise=linewise)
        elif reg_name == '+' or reg_name == '*':
            # System clipboard
            self._set_clipboard(content)
            return
        elif reg_name.islower():
            # Named register
            self.named[reg_name] = reg
        elif reg_name.isupper():
            # Append to named register
            lower = reg_name.lower()
            if lower in self.named:
                self.named[lower].content += content
            else:
                self.named[lower] = reg
        elif reg_name.isdigit():
            # Direct to numbered
            self.numbered[int(reg_name)] = reg

        self._save()

    def delete(self, content: str, linewise: bool = False, register: str | None = None) -> None:
        """Delete content to register (shifts numbered registers)."""
        reg_name = register or self.selected_register
        self.selected_register = '"'

        reg = Register(name=reg_name, content=content, linewise=linewise)

        if reg_name == '"':
            # Unnamed - shift numbered registers
            self.unnamed = reg
            # Shift 1-9
            for i in range(9, 0, -1):
                self.numbered[i] = self.numbered[i - 1]
            self.numbered[1] = Register(name="1", content=content, linewise=linewise)
        elif reg_name == '+' or reg_name == '*':
            self._set_clipboard(content)
            return
        elif reg_name.islower():
            self.named[reg_name] = reg
        elif reg_name.isupper():
            lower = reg_name.lower()
            if lower in self.named:
                self.named[lower].content += content
            else:
                self.named[lower] = reg

        self._save()

    def get(self, register: str | None = None) -> Register:
        """Get register content."""
        reg_name = register or self.selected_register
        self.selected_register = '"'

        if reg_name == '"':
            return self.unnamed
        elif reg_name == '+' or reg_name == '*':
            content = self._get_clipboard()
            return Register(name=reg_name, content=content)
        elif reg_name == '/':
            return self.last_search
        elif reg_name == ':':
            return self.last_command
        elif reg_name == '.':
            return self.last_insert
        elif reg_name == '%':
            return self.current_file
        elif reg_name == '#':
            return self.alternate_file
        elif reg_name.lower() in self.named:
            return self.named[reg_name.lower()]
        elif reg_name.isdigit():
            return self.numbered[int(reg_name)]

        return Register(name=reg_name)

    def paste(self, register: str | None = None) -> tuple[str, bool]:
        """Get content for pasting. Returns (content, linewise)."""
        reg = self.get(register)
        return reg.content, reg.linewise

    def set_search(self, pattern: str) -> None:
        """Set last search pattern."""
        self.last_search.content = pattern

    def set_command(self, command: str) -> None:
        """Set last command."""
        self.last_command.content = command

    def set_insert(self, text: str) -> None:
        """Set last inserted text."""
        self.last_insert.content = text

    def set_current_file(self, filepath: str) -> None:
        """Set current filename."""
        old = self.current_file.content
        self.current_file.content = filepath
        self.alternate_file.content = old

    def _get_clipboard(self) -> str:
        """Get system clipboard content."""
        try:
            # macOS
            result = subprocess.run(["pbpaste"], capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                return result.stdout
        except:
            pass

        try:
            # Linux
            result = subprocess.run(["xclip", "-o", "-selection", "clipboard"],
                                   capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                return result.stdout
        except:
            pass

        return ""

    def _set_clipboard(self, content: str) -> None:
        """Set system clipboard content."""
        try:
            # macOS
            subprocess.run(["pbcopy"], input=content.encode(), timeout=2)
            return
        except:
            pass

        try:
            # Linux
            subprocess.run(["xclip", "-selection", "clipboard"],
                          input=content.encode(), timeout=2)
        except:
            pass

    def list_registers(self) -> List[Register]:
        """List all non-empty registers."""
        regs = []

        # Unnamed
        if self.unnamed.content:
            regs.append(self.unnamed)

        # Named
        for name in sorted(self.named.keys()):
            if self.named[name].content:
                regs.append(self.named[name])

        # Numbered
        for reg in self.numbered:
            if reg.content:
                regs.append(reg)

        return regs

    def format_list(self) -> str:
        """Format register list for display."""
        lines = ["Registers", "=" * 40, ""]

        regs = self.list_registers()
        if not regs:
            lines.append("All registers empty")
            return "\n".join(lines)

        for reg in regs:
            content = reg.content.replace("\n", "\\n")
            if len(content) > 50:
                content = content[:47] + "..."
            linewise = " [line]" if reg.linewise else ""
            lines.append(f'  "{reg.name}  {content}{linewise}')

        lines.append("")
        lines.append('Use "<reg> before yank/delete/paste')

        return "\n".join(lines)


# Global manager
_manager: RegisterManager | None = None

def get_register_manager() -> RegisterManager:
    """Get global register manager."""
    global _manager
    if _manager is None:
        _manager = RegisterManager()
    return _manager
