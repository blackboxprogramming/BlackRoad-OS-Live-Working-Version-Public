"""
Persistence Manager - Save and load RoadPad state.

Handles:
- Command history persistence
- Recent files list
- Edit queue persistence
- Session state
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional


class PersistenceManager:
    """Manage persistent state for RoadPad."""
    
    def __init__(self, state_dir: str = None):
        self.state_dir = Path(state_dir or os.path.expanduser("~/.roadpad"))
        self.state_dir.mkdir(exist_ok=True)
        
        # State files
        self.history_file = self.state_dir / "history.json"
        self.recent_files_file = self.state_dir / "recent_files.json"
        self.session_file = self.state_dir / "session.json"
    
    # Command History
    def save_history(self, history: List[str]) -> bool:
        """Save command history to disk."""
        try:
            data = {
                "history": history[-100:],  # Keep last 100
                "timestamp": datetime.now().isoformat()
            }
            with open(self.history_file, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving history: {e}")
            return False
    
    def load_history(self) -> List[str]:
        """Load command history from disk."""
        try:
            if self.history_file.exists():
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    return data.get("history", [])
        except Exception as e:
            print(f"Error loading history: {e}")
        return []
    
    # Recent Files
    def add_recent_file(self, filepath: str) -> None:
        """Add a file to recent files list."""
        recent = self.load_recent_files()
        
        # Remove if already exists (will re-add at top)
        if filepath in recent:
            recent.remove(filepath)
        
        # Add to front
        recent.insert(0, filepath)
        
        # Keep only last 10
        recent = recent[:10]
        
        self.save_recent_files(recent)
    
    def save_recent_files(self, files: List[str]) -> bool:
        """Save recent files list to disk."""
        try:
            data = {
                "files": files,
                "timestamp": datetime.now().isoformat()
            }
            with open(self.recent_files_file, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving recent files: {e}")
            return False
    
    def load_recent_files(self) -> List[str]:
        """Load recent files list from disk."""
        try:
            if self.recent_files_file.exists():
                with open(self.recent_files_file, 'r') as f:
                    data = json.load(f)
                    return data.get("files", [])
        except Exception as e:
            print(f"Error loading recent files: {e}")
        return []
    
    # Session State
    def save_session(self, state: Dict) -> bool:
        """Save session state to disk."""
        try:
            state["timestamp"] = datetime.now().isoformat()
            with open(self.session_file, 'w') as f:
                json.dump(state, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving session: {e}")
            return False
    
    def load_session(self) -> Dict:
        """Load session state from disk."""
        try:
            if self.session_file.exists():
                with open(self.session_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading session: {e}")
        return {}
    
    # Edit Queue Persistence
    def save_edit_queue(self, edits: List[Dict]) -> bool:
        """Save pending edits to disk."""
        try:
            edit_file = self.state_dir / "pending_edits.json"
            data = {
                "edits": edits,
                "timestamp": datetime.now().isoformat()
            }
            with open(edit_file, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving edit queue: {e}")
            return False
    
    def load_edit_queue(self) -> List[Dict]:
        """Load pending edits from disk."""
        try:
            edit_file = self.state_dir / "pending_edits.json"
            if edit_file.exists():
                with open(edit_file, 'r') as f:
                    data = json.load(f)
                    return data.get("edits", [])
        except Exception as e:
            print(f"Error loading edit queue: {e}")
        return []
    
    # Utility
    def get_state_info(self) -> Dict:
        """Get information about saved state."""
        info = {
            "state_dir": str(self.state_dir),
            "history_exists": self.history_file.exists(),
            "recent_files_exists": self.recent_files_file.exists(),
            "session_exists": self.session_file.exists(),
        }
        
        if self.history_file.exists():
            info["history_count"] = len(self.load_history())
        
        if self.recent_files_file.exists():
            info["recent_files_count"] = len(self.load_recent_files())
        
        return info
    
    def clear_state(self) -> bool:
        """Clear all saved state."""
        try:
            for file in [self.history_file, self.recent_files_file, self.session_file]:
                if file.exists():
                    file.unlink()
            return True
        except Exception as e:
            print(f"Error clearing state: {e}")
            return False
