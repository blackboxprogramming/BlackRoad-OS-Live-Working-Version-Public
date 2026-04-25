#!/bin/bash
# Deploy RoadPad to all Pi devices
# Usage: ./deploy-to-pis.sh

ROADPAD_DIR="$HOME/roadpad"

# Pi fleet (hostname or IP)
PIS=(
    "cecilia"
    "lucidia"
    "octavia"
    "alice"
    "aria"
)

# Files to deploy
FILES=(
    "roadpad.py"
    "buffer.py"
    "renderer.py"
    "bridge.py"
    "config.py"
    "tunnels.py"
    "circuits.py"
    "session.py"
    "commands.py"
    "health.py"
    "search.py"
    "browser.py"
    "snippets.py"
    "git.py"
    "history.py"
    "macro.py"
    "marks.py"
    "completion.py"
    "plugins.py"
    "sync.py"
    "modes.py"
    "splits.py"
    "themes.py"
    "repl.py"
    "chat.py"
    "lsp.py"
    "tree.py"
    "fuzzy.py"
    "registers.py"
    "terminal.py"
    "workspace.py"
    "lucidia.py"
    "lucidia_curses.py"
    "security.py"
    "lucidia"
    "lucidia-shell"
    "roadpad"
    "roadpad.env"
)

echo "═══════════════════════════════════════════════════"
echo "  RoadPad Deployment to Pi Fleet"
echo "═══════════════════════════════════════════════════"

for pi in "${PIS[@]}"; do
    echo ""
    echo "──────────────────────────────────────────────────"
    echo "  Deploying to: $pi"
    echo "──────────────────────────────────────────────────"

    # Check if reachable
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$pi" "echo ok" &>/dev/null; then
        echo "  ✗ Cannot reach $pi - skipping"
        continue
    fi

    # Create directories using ~ (remote home)
    echo "  → Creating directories..."
    ssh "$pi" 'mkdir -p ~/roadpad ~/bin'

    # Copy files
    echo "  → Copying files..."
    for file in "${FILES[@]}"; do
        if [[ -f "$ROADPAD_DIR/$file" ]]; then
            scp -q "$ROADPAD_DIR/$file" "$pi:~/roadpad/"
        fi
    done

    # Make executable
    echo "  → Setting permissions..."
    ssh "$pi" 'chmod +x ~/roadpad/roadpad ~/roadpad/roadpad.py ~/roadpad/lucidia ~/roadpad/lucidia-shell'

    # Create symlinks in bin
    echo "  → Creating symlinks..."
    ssh "$pi" 'ln -sf ~/roadpad/roadpad ~/bin/roadpad && ln -sf ~/roadpad/lucidia ~/bin/lucidia'

    # Verify
    if ssh "$pi" 'python3 -c "import sys; sys.path.insert(0, \"$HOME/roadpad\"); from buffer import Buffer; print(\"OK\")"' 2>/dev/null; then
        echo "  ✓ $pi - deployed"
    else
        echo "  ! $pi - deployed (verify manually)"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Deployment complete"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Run on any Pi:"
echo "  roadpad      # Plain-text editor"
echo "  lucidia      # AI shell with Claude backend"
echo "  lucidia -c   # Full-screen curses UI"
