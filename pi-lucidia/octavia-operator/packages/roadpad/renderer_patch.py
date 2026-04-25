# Update renderer.py to support status_text parameter
import sys

with open('renderer.py', 'r') as f:
    lines = f.readlines()

# Find and update draw_status_bar
for i, line in enumerate(lines):
    if 'def draw_status_bar(self, accept_mode: int, mode: str = "editor")' in line:
        lines[i] = '    def draw_status_bar(self, accept_mode: int, mode: str = "editor", status_text: str = None) -> None:\n'
    
    if 'left = f"  ⏵⏵ accept edits {ACCEPT_MODES[accept_mode]}' in line:
        # Replace with conditional logic
        indent = '        '
        lines[i] = indent + 'if status_text:\n'
        lines.insert(i+1, indent + '    left = f"  ⏵⏵ accept edits {status_text} (shift+tab to cycle)"\n')
        lines.insert(i+2, indent + 'else:\n')
        lines.insert(i+3, indent + '    left = f"  ⏵⏵ accept edits {ACCEPT_MODES[accept_mode]} (shift+tab to cycle)"\n')
        break

# Find and update render method
for i, line in enumerate(lines):
    if 'def render(self, buffer, input_text: str, accept_mode: int, scroll_offset: int = 0, mode: str = "editor")' in line:
        lines[i] = '    def render(self, buffer, input_text: str, accept_mode: int, scroll_offset: int = 0, mode: str = "editor", status_text: str = None) -> None:\n'
    
    if 'self.draw_status_bar(accept_mode, mode)' in line:
        lines[i] = '        self.draw_status_bar(accept_mode, mode, status_text)\n'

with open('renderer.py', 'w') as f:
    f.writelines(lines)

print("✅ Renderer updated")
