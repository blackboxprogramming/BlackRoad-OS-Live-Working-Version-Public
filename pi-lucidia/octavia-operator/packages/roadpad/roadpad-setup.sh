#!/bin/bash
# RoadPad Setup Script
# Sets up aliases, environment variables, and configuration

set -e

echo "🌌 RoadPad Setup"
echo "================================"
echo ""

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [ "$SHELL_NAME" = "zsh" ]; then
    RC_FILE="$HOME/.zshrc"
elif [ "$SHELL_NAME" = "bash" ]; then
    RC_FILE="$HOME/.bashrc"
else
    echo "⚠️  Unknown shell: $SHELL_NAME"
    echo "Please manually add aliases to your shell config"
    exit 1
fi

echo "Detected shell: $SHELL_NAME"
echo "Config file: $RC_FILE"
echo ""

# Check if RoadPad is installed
if ! command -v roadpad &> /dev/null; then
    echo "❌ RoadPad not found in PATH"
    echo "Make sure ~/bin/roadpad exists and is executable"
    exit 1
fi

echo "✅ RoadPad found: $(which roadpad)"
echo ""

# Create config directory
mkdir -p ~/.roadpad
echo "✅ Created ~/.roadpad directory"

# Create default config
if [ ! -f ~/.roadpad/config.json ]; then
    cat > ~/.roadpad/config.json << 'EOF'
{
  "accept_mode": 0,
  "tab_width": 4,
  "auto_indent": true,
  "default_extension": ".txt",
  "max_history": 100,
  "max_recent_files": 10,
  "copilot_enabled": true,
  "auto_save": false,
  "theme": "default"
}
EOF
    echo "✅ Created default config.json"
else
    echo "✅ Config file already exists"
fi

echo ""
echo "Setting up shell integration..."
echo ""

# Check if already configured
if grep -q "# RoadPad aliases" "$RC_FILE" 2>/dev/null; then
    echo "⚠️  RoadPad aliases already configured in $RC_FILE"
    echo "Skipping alias setup"
else
    # Add aliases
    cat >> "$RC_FILE" << 'EOF'

# RoadPad aliases
export PATH="$HOME/bin:$PATH"
export EDITOR="roadpad"
export VISUAL="roadpad"
alias rp="roadpad"
alias roadpad-manual="roadpad --accept-mode=manual"
alias roadpad-always="roadpad --accept-mode=always"
alias roadpad-no-copilot="roadpad --no-copilot"
EOF
    echo "✅ Added aliases to $RC_FILE"
fi

echo ""
echo "================================"
echo "🎉 Setup Complete!"
echo ""
echo "New aliases available:"
echo "  rp                    → roadpad"
echo "  roadpad-manual        → Start in manual mode"
echo "  roadpad-always        → Start in always mode"
echo "  roadpad-no-copilot    → Disable Copilot"
echo ""
echo "Environment variables:"
echo "  EDITOR=roadpad"
echo "  VISUAL=roadpad"
echo ""
echo "To activate now, run:"
echo "  source $RC_FILE"
echo ""
echo "Or restart your terminal"
