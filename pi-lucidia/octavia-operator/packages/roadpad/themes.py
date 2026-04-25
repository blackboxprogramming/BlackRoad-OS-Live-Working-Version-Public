"""
RoadPad Themes - Color schemes (when enabled).

Themes:
- blackroad: Hot pink + black (brand)
- mono: Pure black & white
- amber: Retro amber terminal
- matrix: Green on black
- nord: Cool blue tones
"""

import os
import json
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class ColorPair:
    """A foreground/background color pair."""
    fg: int  # Terminal color code (0-255)
    bg: int
    bold: bool = False
    underline: bool = False


@dataclass
class Theme:
    """A complete color theme."""
    name: str
    description: str = ""

    # Core UI
    text: ColorPair = field(default_factory=lambda: ColorPair(7, 0))
    background: ColorPair = field(default_factory=lambda: ColorPair(7, 0))
    cursor: ColorPair = field(default_factory=lambda: ColorPair(0, 7))
    selection: ColorPair = field(default_factory=lambda: ColorPair(0, 7))
    line_number: ColorPair = field(default_factory=lambda: ColorPair(8, 0))
    current_line: ColorPair = field(default_factory=lambda: ColorPair(7, 235))

    # Status bar
    status_bar: ColorPair = field(default_factory=lambda: ColorPair(0, 7))
    status_mode: ColorPair = field(default_factory=lambda: ColorPair(0, 7, bold=True))

    # Syntax (for code)
    keyword: ColorPair = field(default_factory=lambda: ColorPair(5, 0, bold=True))
    string: ColorPair = field(default_factory=lambda: ColorPair(2, 0))
    comment: ColorPair = field(default_factory=lambda: ColorPair(8, 0))
    function: ColorPair = field(default_factory=lambda: ColorPair(4, 0))
    number: ColorPair = field(default_factory=lambda: ColorPair(3, 0))
    operator: ColorPair = field(default_factory=lambda: ColorPair(6, 0))

    # Special
    error: ColorPair = field(default_factory=lambda: ColorPair(1, 0, bold=True))
    warning: ColorPair = field(default_factory=lambda: ColorPair(3, 0))
    success: ColorPair = field(default_factory=lambda: ColorPair(2, 0))
    info: ColorPair = field(default_factory=lambda: ColorPair(4, 0))

    # Diff
    diff_add: ColorPair = field(default_factory=lambda: ColorPair(2, 0))
    diff_remove: ColorPair = field(default_factory=lambda: ColorPair(1, 0))
    diff_change: ColorPair = field(default_factory=lambda: ColorPair(3, 0))

    def to_dict(self) -> Dict:
        """Convert to dict for serialization."""
        result = {"name": self.name, "description": self.description}
        for key in ["text", "background", "cursor", "selection", "line_number",
                    "current_line", "status_bar", "status_mode", "keyword",
                    "string", "comment", "function", "number", "operator",
                    "error", "warning", "success", "info",
                    "diff_add", "diff_remove", "diff_change"]:
            pair = getattr(self, key)
            result[key] = {"fg": pair.fg, "bg": pair.bg,
                          "bold": pair.bold, "underline": pair.underline}
        return result

    @classmethod
    def from_dict(cls, data: Dict) -> "Theme":
        """Load from dict."""
        theme = cls(name=data.get("name", "custom"),
                   description=data.get("description", ""))
        for key in ["text", "background", "cursor", "selection", "line_number",
                    "current_line", "status_bar", "status_mode", "keyword",
                    "string", "comment", "function", "number", "operator",
                    "error", "warning", "success", "info",
                    "diff_add", "diff_remove", "diff_change"]:
            if key in data:
                pair_data = data[key]
                setattr(theme, key, ColorPair(
                    fg=pair_data.get("fg", 7),
                    bg=pair_data.get("bg", 0),
                    bold=pair_data.get("bold", False),
                    underline=pair_data.get("underline", False)
                ))
        return theme


# Built-in themes
THEMES: Dict[str, Theme] = {
    "mono": Theme(
        name="mono",
        description="Pure black & white",
        text=ColorPair(7, 0),
        cursor=ColorPair(0, 7),
        selection=ColorPair(0, 7),
        line_number=ColorPair(7, 0),
        current_line=ColorPair(7, 0, bold=True),
        status_bar=ColorPair(0, 7),
        status_mode=ColorPair(0, 7, bold=True),
        keyword=ColorPair(7, 0, bold=True),
        string=ColorPair(7, 0),
        comment=ColorPair(7, 0),
        function=ColorPair(7, 0, underline=True),
        number=ColorPair(7, 0),
        operator=ColorPair(7, 0),
    ),

    "blackroad": Theme(
        name="blackroad",
        description="Hot pink + amber on black",
        text=ColorPair(255, 0),
        cursor=ColorPair(0, 205),  # Hot pink
        selection=ColorPair(0, 214),  # Amber
        line_number=ColorPair(240, 0),
        current_line=ColorPair(255, 235),
        status_bar=ColorPair(0, 205),  # Hot pink bg
        status_mode=ColorPair(0, 214, bold=True),  # Amber bg
        keyword=ColorPair(205, 0, bold=True),  # Hot pink
        string=ColorPair(214, 0),  # Amber
        comment=ColorPair(240, 0),
        function=ColorPair(69, 0),  # Electric blue
        number=ColorPair(135, 0),  # Violet
        operator=ColorPair(205, 0),
        error=ColorPair(196, 0, bold=True),
        success=ColorPair(82, 0),
    ),

    "amber": Theme(
        name="amber",
        description="Retro amber terminal",
        text=ColorPair(214, 0),
        cursor=ColorPair(0, 214),
        selection=ColorPair(0, 172),
        line_number=ColorPair(136, 0),
        current_line=ColorPair(214, 235),
        status_bar=ColorPair(0, 214),
        status_mode=ColorPair(0, 172, bold=True),
        keyword=ColorPair(214, 0, bold=True),
        string=ColorPair(178, 0),
        comment=ColorPair(136, 0),
        function=ColorPair(214, 0, underline=True),
        number=ColorPair(220, 0),
        operator=ColorPair(214, 0),
    ),

    "matrix": Theme(
        name="matrix",
        description="Green on black",
        text=ColorPair(46, 0),
        cursor=ColorPair(0, 46),
        selection=ColorPair(0, 28),
        line_number=ColorPair(22, 0),
        current_line=ColorPair(46, 233),
        status_bar=ColorPair(0, 46),
        status_mode=ColorPair(0, 28, bold=True),
        keyword=ColorPair(46, 0, bold=True),
        string=ColorPair(34, 0),
        comment=ColorPair(22, 0),
        function=ColorPair(46, 0, underline=True),
        number=ColorPair(82, 0),
        operator=ColorPair(46, 0),
    ),

    "nord": Theme(
        name="nord",
        description="Cool blue tones",
        text=ColorPair(253, 235),
        cursor=ColorPair(235, 110),
        selection=ColorPair(253, 60),
        line_number=ColorPair(60, 235),
        current_line=ColorPair(253, 237),
        status_bar=ColorPair(253, 60),
        status_mode=ColorPair(235, 110, bold=True),
        keyword=ColorPair(110, 235, bold=True),
        string=ColorPair(108, 235),
        comment=ColorPair(60, 235),
        function=ColorPair(67, 235),
        number=ColorPair(175, 235),
        operator=ColorPair(110, 235),
    ),

    "solarized": Theme(
        name="solarized",
        description="Solarized dark",
        text=ColorPair(244, 234),
        cursor=ColorPair(234, 136),
        selection=ColorPair(244, 237),
        line_number=ColorPair(240, 234),
        current_line=ColorPair(244, 235),
        status_bar=ColorPair(234, 136),
        status_mode=ColorPair(234, 166, bold=True),
        keyword=ColorPair(136, 234, bold=True),
        string=ColorPair(37, 234),
        comment=ColorPair(240, 234),
        function=ColorPair(33, 234),
        number=ColorPair(166, 234),
        operator=ColorPair(136, 234),
    ),
}


class ThemeManager:
    """Manages themes."""

    def __init__(self, themes_dir: str | None = None):
        self.themes_dir = themes_dir or os.path.expanduser("~/.roadpad/themes")
        os.makedirs(self.themes_dir, exist_ok=True)

        self.themes = THEMES.copy()
        self.current_theme: Theme = THEMES["mono"]
        self.colors_enabled: bool = False

        self._load_custom_themes()
        self._load_preferences()

    def _load_custom_themes(self) -> None:
        """Load custom themes from disk."""
        if not os.path.exists(self.themes_dir):
            return

        for filename in os.listdir(self.themes_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.themes_dir, filename)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                    theme = Theme.from_dict(data)
                    self.themes[theme.name] = theme
                except:
                    pass

    def _load_preferences(self) -> None:
        """Load theme preferences."""
        prefs_file = os.path.join(self.themes_dir, "preferences.json")
        if os.path.exists(prefs_file):
            try:
                with open(prefs_file, "r") as f:
                    prefs = json.load(f)
                theme_name = prefs.get("theme", "mono")
                if theme_name in self.themes:
                    self.current_theme = self.themes[theme_name]
                self.colors_enabled = prefs.get("colors_enabled", False)
            except:
                pass

    def save_preferences(self) -> None:
        """Save theme preferences."""
        prefs_file = os.path.join(self.themes_dir, "preferences.json")
        with open(prefs_file, "w") as f:
            json.dump({
                "theme": self.current_theme.name,
                "colors_enabled": self.colors_enabled
            }, f)

    def set_theme(self, name: str) -> bool:
        """Set current theme."""
        if name in self.themes:
            self.current_theme = self.themes[name]
            self.save_preferences()
            return True
        return False

    def enable_colors(self) -> None:
        """Enable colors."""
        self.colors_enabled = True
        self.save_preferences()

    def disable_colors(self) -> None:
        """Disable colors (mono mode)."""
        self.colors_enabled = False
        self.current_theme = THEMES["mono"]
        self.save_preferences()

    def toggle_colors(self) -> bool:
        """Toggle colors on/off."""
        if self.colors_enabled:
            self.disable_colors()
        else:
            self.enable_colors()
            if self.current_theme.name == "mono":
                self.set_theme("blackroad")
        return self.colors_enabled

    def get_color(self, element: str) -> ColorPair:
        """Get color for UI element."""
        if not self.colors_enabled:
            return ColorPair(7, 0)
        return getattr(self.current_theme, element, ColorPair(7, 0))

    def list_themes(self) -> List[str]:
        """List available themes."""
        return sorted(self.themes.keys())

    def save_theme(self, theme: Theme) -> None:
        """Save custom theme."""
        filepath = os.path.join(self.themes_dir, f"{theme.name}.json")
        with open(filepath, "w") as f:
            json.dump(theme.to_dict(), f, indent=2)
        self.themes[theme.name] = theme

    def format_list(self) -> str:
        """Format theme list for display."""
        lines = ["Themes", "=" * 40, ""]

        for name in self.list_themes():
            theme = self.themes[name]
            active = ">" if theme.name == self.current_theme.name else " "
            lines.append(f"{active} {name:15} {theme.description}")

        lines.append("")
        lines.append(f"Colors: {'ON' if self.colors_enabled else 'OFF'}")
        lines.append("")
        lines.append(":theme <name>  - Switch theme")
        lines.append(":colors        - Toggle colors")

        return "\n".join(lines)


# Global manager
_manager: ThemeManager | None = None

def get_theme_manager() -> ThemeManager:
    """Get global theme manager."""
    global _manager
    if _manager is None:
        _manager = ThemeManager()
    return _manager
