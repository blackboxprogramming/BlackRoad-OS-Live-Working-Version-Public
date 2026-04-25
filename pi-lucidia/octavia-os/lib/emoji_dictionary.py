#!/usr/bin/env python3
"""
BlackRoad OS Universal Emoji Dictionary
Standard meanings across all devices in the fleet
"""

# =============================================================================
# BLACKROAD EMOJI DICTIONARY v1.0
# =============================================================================

EMOJI_DICT = {
    # ─────────────────────────────────────────────────────────────────────────
    # STATUS INDICATORS
    # ─────────────────────────────────────────────────────────────────────────
    "🟢": {"name": "green_circle", "meaning": "Online/Active/OK/Go", "category": "status"},
    "🔴": {"name": "red_circle", "meaning": "Offline/Error/Stop/Critical", "category": "status"},
    "🟡": {"name": "yellow_circle", "meaning": "Warning/Caution/Pending", "category": "status"},
    "🟠": {"name": "orange_circle", "meaning": "Degraded/Slow/Attention", "category": "status"},
    "🔵": {"name": "blue_circle", "meaning": "Info/Running/Processing", "category": "status"},
    "⚪": {"name": "white_circle", "meaning": "Unknown/Unset/Neutral", "category": "status"},
    "⚫": {"name": "black_circle", "meaning": "Disabled/Off/Inactive", "category": "status"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # SYSTEM & HARDWARE
    # ─────────────────────────────────────────────────────────────────────────
    "🖥️": {"name": "desktop", "meaning": "Server/Node/Computer", "category": "hardware"},
    "💻": {"name": "laptop", "meaning": "Workstation/Client", "category": "hardware"},
    "🧠": {"name": "brain", "meaning": "AI/ML/Intelligence/Hailo", "category": "hardware"},
    "💾": {"name": "floppy", "meaning": "Storage/Disk/Save", "category": "hardware"},
    "💿": {"name": "cd", "meaning": "NVMe/SSD/Fast Storage", "category": "hardware"},
    "🔌": {"name": "plug", "meaning": "Power/Connection/USB", "category": "hardware"},
    "📡": {"name": "antenna", "meaning": "Network/Wireless/Signal", "category": "hardware"},
    "🌡️": {"name": "thermometer", "meaning": "Temperature/Thermal", "category": "hardware"},
    "❄️": {"name": "snowflake", "meaning": "Cool/Cold/Under 40°C", "category": "hardware"},
    "🔥": {"name": "fire", "meaning": "Hot/Over 60°C/Critical Temp", "category": "hardware"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # BLACKROAD SPECIFIC
    # ─────────────────────────────────────────────────────────────────────────
    "🛣️": {"name": "road", "meaning": "BlackRoad/Infrastructure/Path", "category": "blackroad"},
    "🚗": {"name": "car", "meaning": "Service/Process/Worker", "category": "blackroad"},
    "🚚": {"name": "truck", "meaning": "Heavy Task/Batch Job/Migration", "category": "blackroad"},
    "🚌": {"name": "bus", "meaning": "Message Bus/Queue/NATS", "category": "blackroad"},
    "🚧": {"name": "construction", "meaning": "Maintenance/WIP/Building", "category": "blackroad"},
    "🚦": {"name": "traffic_light", "meaning": "Traffic Control/Rate Limit", "category": "blackroad"},
    "⛽": {"name": "fuel", "meaning": "Resources/Power/Energy", "category": "blackroad"},
    "🅿️": {"name": "parking", "meaning": "Paused/Standby/Idle", "category": "blackroad"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # ACTIONS & OPERATIONS
    # ─────────────────────────────────────────────────────────────────────────
    "🚀": {"name": "rocket", "meaning": "Deploy/Launch/Start", "category": "action"},
    "⚡": {"name": "lightning", "meaning": "Fast/Instant/Quick Action", "category": "action"},
    "🔧": {"name": "wrench", "meaning": "Config/Settings/Tune", "category": "action"},
    "🔨": {"name": "hammer", "meaning": "Build/Compile/Construct", "category": "action"},
    "🔩": {"name": "bolt", "meaning": "Fix/Repair/Patch", "category": "action"},
    "⚙️": {"name": "gear", "meaning": "Process/Running/Engine", "category": "action"},
    "🔄": {"name": "arrows_cycle", "meaning": "Sync/Refresh/Update", "category": "action"},
    "⬆️": {"name": "arrow_up", "meaning": "Upload/Upgrade/Increase", "category": "action"},
    "⬇️": {"name": "arrow_down", "meaning": "Download/Downgrade/Decrease", "category": "action"},
    "▶️": {"name": "play", "meaning": "Start/Resume/Run", "category": "action"},
    "⏸️": {"name": "pause", "meaning": "Pause/Hold/Suspend", "category": "action"},
    "⏹️": {"name": "stop", "meaning": "Stop/Halt/Kill", "category": "action"},
    "🔁": {"name": "repeat", "meaning": "Loop/Retry/Recurring", "category": "action"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # SECURITY
    # ─────────────────────────────────────────────────────────────────────────
    "🔒": {"name": "lock", "meaning": "Secure/Locked/Encrypted", "category": "security"},
    "🔓": {"name": "unlock", "meaning": "Unlocked/Open/Decrypted", "category": "security"},
    "🔑": {"name": "key", "meaning": "API Key/Credentials/Auth", "category": "security"},
    "🛡️": {"name": "shield", "meaning": "Protected/Firewall/Defense", "category": "security"},
    "⚠️": {"name": "warning", "meaning": "Security Alert/Caution", "category": "security"},
    "🚨": {"name": "siren", "meaning": "Critical Alert/Breach", "category": "security"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # DATA & FILES
    # ─────────────────────────────────────────────────────────────────────────
    "📁": {"name": "folder", "meaning": "Directory/Folder", "category": "data"},
    "📂": {"name": "folder_open", "meaning": "Open Directory/Expanded", "category": "data"},
    "📄": {"name": "document", "meaning": "File/Document/Config", "category": "data"},
    "📊": {"name": "chart", "meaning": "Metrics/Stats/Analytics", "category": "data"},
    "📈": {"name": "chart_up", "meaning": "Growth/Increase/Trending Up", "category": "data"},
    "📉": {"name": "chart_down", "meaning": "Decline/Decrease/Trending Down", "category": "data"},
    "📦": {"name": "package", "meaning": "Package/Container/Bundle", "category": "data"},
    "🗃️": {"name": "cabinet", "meaning": "Database/Archive/Storage", "category": "data"},
    "🗄️": {"name": "file_cabinet", "meaning": "Backup/Archive", "category": "data"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # NETWORK & CLOUD
    # ─────────────────────────────────────────────────────────────────────────
    "🌐": {"name": "globe", "meaning": "Internet/Global/Network", "category": "network"},
    "☁️": {"name": "cloud", "meaning": "Cloud/Remote/Cloudflare", "category": "network"},
    "🔗": {"name": "link", "meaning": "Connection/Link/URL", "category": "network"},
    "📶": {"name": "signal", "meaning": "WiFi/Signal Strength", "category": "network"},
    "🏠": {"name": "house", "meaning": "Local/Home/LAN", "category": "network"},
    "🌍": {"name": "earth", "meaning": "Region/Zone/Geographic", "category": "network"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # FLEET NODES (DEVICE IDENTIFIERS)
    # ─────────────────────────────────────────────────────────────────────────
    "👸": {"name": "princess", "meaning": "Cecilia - Primary Node", "category": "fleet"},
    "🌙": {"name": "moon", "meaning": "Lucidia - AI Node", "category": "fleet"},
    "🎵": {"name": "music", "meaning": "Aria - Harmony Node", "category": "fleet"},
    "🐙": {"name": "octopus", "meaning": "Octavia - Multi-arm Node", "category": "fleet"},
    "👧": {"name": "girl", "meaning": "Alice - Gateway Node", "category": "fleet"},
    "🐚": {"name": "shell", "meaning": "Shellfish - Edge Node", "category": "fleet"},
    "♾️": {"name": "infinity", "meaning": "Codex-Infinity - Cloud Node", "category": "fleet"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # RESULTS & OUTCOMES
    # ─────────────────────────────────────────────────────────────────────────
    "✅": {"name": "check_green", "meaning": "Success/Done/Passed", "category": "result"},
    "❌": {"name": "cross_red", "meaning": "Failed/Error/Rejected", "category": "result"},
    "✓": {"name": "check", "meaning": "Completed/Verified", "category": "result"},
    "✗": {"name": "cross", "meaning": "Failed/Cancelled", "category": "result"},
    "⭐": {"name": "star", "meaning": "Important/Favorite/Featured", "category": "result"},
    "🎯": {"name": "target", "meaning": "Goal/Target/Objective", "category": "result"},
    "🏆": {"name": "trophy", "meaning": "Achievement/Victory/Complete", "category": "result"},
    "💯": {"name": "100", "meaning": "Perfect/Full/Complete", "category": "result"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # TIME & SCHEDULE
    # ─────────────────────────────────────────────────────────────────────────
    "⏰": {"name": "alarm", "meaning": "Scheduled/Timer/Cron", "category": "time"},
    "🕐": {"name": "clock", "meaning": "Time/Duration/Wait", "category": "time"},
    "📅": {"name": "calendar", "meaning": "Date/Schedule/Plan", "category": "time"},
    "⏱️": {"name": "stopwatch", "meaning": "Performance/Latency/Speed", "category": "time"},
    
    # ─────────────────────────────────────────────────────────────────────────
    # COMMUNICATION
    # ─────────────────────────────────────────────────────────────────────────
    "💬": {"name": "speech", "meaning": "Message/Chat/Log", "category": "comm"},
    "📢": {"name": "megaphone", "meaning": "Announce/Broadcast/Alert", "category": "comm"},
    "📧": {"name": "email", "meaning": "Email/Notification", "category": "comm"},
    "🔔": {"name": "bell", "meaning": "Notification/Alert", "category": "comm"},
    "🔕": {"name": "bell_off", "meaning": "Muted/Silent/DND", "category": "comm"},
}

# =============================================================================
# CATEGORY COLORS (xterm-256)
# =============================================================================
CATEGORY_COLORS = {
    "status": 46,      # Green
    "hardware": 39,    # Blue
    "blackroad": 204,  # Hot Pink
    "action": 215,     # Amber
    "security": 196,   # Red
    "data": 141,       # Purple
    "network": 69,     # Electric Blue
    "fleet": 213,      # Pink
    "result": 46,      # Green
    "time": 226,       # Yellow
    "comm": 51,        # Cyan
}

# =============================================================================
# FUNCTIONS
# =============================================================================

def c(text, fg=None, bold=False):
    """Colorize text."""
    codes = []
    if bold: codes.append('1')
    if fg is not None: codes.append(f'38;5;{fg}')
    return f"\033[{';'.join(codes)}m{text}\033[0m" if codes else text

def lookup(emoji):
    """Look up emoji meaning."""
    if emoji in EMOJI_DICT:
        info = EMOJI_DICT[emoji]
        return f"{emoji} {info['name']}: {info['meaning']} [{info['category']}]"
    return f"{emoji}: Unknown emoji"

def by_category(category):
    """Get all emojis in a category."""
    return {e: d for e, d in EMOJI_DICT.items() if d['category'] == category}

def print_category(category):
    """Print all emojis in a category."""
    color = CATEGORY_COLORS.get(category, 255)
    print(c(f"\n═══ {category.upper()} ═══", fg=color, bold=True))
    for emoji, info in by_category(category).items():
        print(f"  {emoji}  {c(info['name'], fg=240):20} {info['meaning']}")

def print_all():
    """Print the complete dictionary."""
    print(c("╔══════════════════════════════════════════════════════════════╗", fg=204))
    print(c("║        BLACKROAD OS UNIVERSAL EMOJI DICTIONARY              ║", fg=204))
    print(c("╚══════════════════════════════════════════════════════════════╝", fg=204))
    
    for cat in CATEGORY_COLORS.keys():
        print_category(cat)
    print()

def search(term):
    """Search for emojis by name or meaning."""
    term = term.lower()
    results = []
    for emoji, info in EMOJI_DICT.items():
        if term in info['name'].lower() or term in info['meaning'].lower():
            results.append((emoji, info))
    return results

def fleet_legend():
    """Print fleet node legend."""
    print(c("\n🛣️  BLACKROAD FLEET LEGEND", fg=204, bold=True))
    print(c("─" * 40, fg=240))
    fleet = by_category("fleet")
    for emoji, info in fleet.items():
        print(f"  {emoji}  {info['meaning']}")
    print()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "all":
            print_all()
        elif cmd == "fleet":
            fleet_legend()
        elif cmd == "search" and len(sys.argv) > 2:
            for emoji, info in search(sys.argv[2]):
                print(f"{emoji} {info['name']}: {info['meaning']}")
        elif cmd == "cat" and len(sys.argv) > 2:
            print_category(sys.argv[2])
        elif cmd in EMOJI_DICT:
            print(lookup(cmd))
        else:
            # Try as category
            if cmd in CATEGORY_COLORS:
                print_category(cmd)
            else:
                print(f"Usage: emoji_dictionary.py [all|fleet|search <term>|cat <category>|<emoji>]")
    else:
        print_all()
