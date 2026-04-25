"""
Edit Manager - Track and apply pending edits for RoadPad accept modes.

Handles three modes:
- manual: Show diff, user accepts/rejects
- on save: Queue edits, apply on save
- always: Apply immediately
"""

from typing import List, Tuple, Optional
from datetime import datetime


class Edit:
    """Represents a single pending edit."""
    
    def __init__(self, query: str, response: str, timestamp: str = None):
        self.query = query
        self.response = response
        self.timestamp = timestamp or datetime.now().isoformat()
        self.applied = False
        self.rejected = False
    
    def __repr__(self):
        status = "applied" if self.applied else ("rejected" if self.rejected else "pending")
        return f"Edit({self.query[:30]}..., {status})"


class EditManager:
    """Manage pending edits and apply them based on accept mode."""
    
    def __init__(self):
        self.pending_edits: List[Edit] = []
        self.applied_edits: List[Edit] = []
        self.rejected_edits: List[Edit] = []
    
    def add_edit(self, query: str, response: str) -> Edit:
        """Add a new edit to the pending queue."""
        edit = Edit(query, response)
        self.pending_edits.append(edit)
        return edit
    
    def accept_edit(self, edit: Edit) -> bool:
        """Accept and apply a specific edit."""
        if edit in self.pending_edits:
            edit.applied = True
            self.pending_edits.remove(edit)
            self.applied_edits.append(edit)
            return True
        return False
    
    def reject_edit(self, edit: Edit) -> bool:
        """Reject a specific edit."""
        if edit in self.pending_edits:
            edit.rejected = True
            self.pending_edits.remove(edit)
            self.rejected_edits.append(edit)
            return True
        return False
    
    def accept_all(self) -> int:
        """Accept all pending edits. Returns count applied."""
        count = len(self.pending_edits)
        for edit in list(self.pending_edits):
            self.accept_edit(edit)
        return count
    
    def reject_all(self) -> int:
        """Reject all pending edits. Returns count rejected."""
        count = len(self.pending_edits)
        for edit in list(self.pending_edits):
            self.reject_edit(edit)
        return count
    
    def clear_pending(self) -> None:
        """Clear all pending edits without applying."""
        self.pending_edits.clear()
    
    def get_pending_count(self) -> int:
        """Get count of pending edits."""
        return len(self.pending_edits)
    
    def get_next_edit(self) -> Optional[Edit]:
        """Get the next pending edit for review."""
        return self.pending_edits[0] if self.pending_edits else None
    
    def get_diff_preview(self, edit: Edit) -> str:
        """Generate a diff-style preview of the edit."""
        lines = []
        lines.append("=" * 80)
        lines.append("[EDIT PREVIEW]")
        lines.append("")
        lines.append(f"Query: {edit.query}")
        lines.append("")
        lines.append("Proposed changes:")
        lines.append("-" * 80)
        
        # Show response as additions
        for line in edit.response.split('\n'):
            lines.append(f"+ {line}")
        
        lines.append("-" * 80)
        lines.append("")
        lines.append("Commands:")
        lines.append("  Ctrl+Y - Accept this edit")
        lines.append("  Ctrl+N - Reject this edit")
        lines.append("  Ctrl+A - Accept all pending")
        lines.append("  Ctrl+R - Reject all pending")
        lines.append("=" * 80)
        
        return '\n'.join(lines)
    
    def apply_edits_to_buffer(self, buffer, edits: List[Edit]) -> int:
        """
        Apply accepted edits to the buffer.
        Returns count of edits applied.
        """
        count = 0
        for edit in edits:
            if edit.applied and not edit.rejected:
                # Append response to buffer
                separator = "─" * 80
                
                buffer.lines.append("")
                buffer.lines.append(separator)
                buffer.lines.append("[Applied Edit]")
                buffer.lines.append(f"  Query: {edit.query}")
                buffer.lines.append("")
                
                for line in edit.response.split('\n'):
                    buffer.lines.append(f"  {line}")
                
                buffer.lines.append("")
                buffer.lines.append(separator)
                buffer.lines.append("")
                
                count += 1
        
        return count
    
    def get_status_text(self, mode: int) -> str:
        """Get status text for the status bar."""
        mode_names = ["manual", "on save", "always"]
        mode_name = mode_names[mode]
        
        pending = self.get_pending_count()
        
        if pending > 0:
            return f"{mode_name} ({pending} pending)"
        else:
            return mode_name
