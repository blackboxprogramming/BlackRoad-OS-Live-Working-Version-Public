# BlackRoad Agent Windows & Tmux Bridge

## Overview

Individual terminal windows for each AI agent (Alice, Lucidia, Aria) with SSH connection info, tmux integration, and interactive controls.

## Agent Windows

### 🔮 Alice - Claude Agent

**Connection:** `alice@alice`
**Type:** Anthropic Claude API
**Model:** claude-sonnet-4-5-20250929
**Capabilities:** Advanced reasoning, code generation, research
**Context:** 200K tokens
**Dock Icon:** 🔮
**Keyboard:** Alt+3

**Features:**
- Real-time status display
- SSH connection info
- Tmux pane integration
- Interactive action buttons (Test, Logs, Message, Metrics)

### 👻 Lucidia - Gemma Agent

**Connection:** `lucidia@lucidia`
**Host:** 192.168.4.38 (Raspberry Pi 4)
**Type:** Ollama Gemma 2
**Services:** ollama, nginx, blackroad-api
**Dock Icon:** 👻
**Keyboard:** Alt+4

**Features:**
- Tmux bridge commands
- Pi SSH connection
- Service status monitoring
- System metrics

### 🌟 Aria - OpenAI Agent

**Connection:** `aria@aria`
**Type:** OpenAI GPT-4
**Model:** gpt-4-turbo-2024-04-09
**Capabilities:** Text, Vision, Code, DALL-E, Web
**Context:** 128K tokens
**Dock Icon:** 🌟
**Keyboard:** Alt+5

**Features:**
- OpenAI API status
- Tmux integration
- Interactive controls
- Usage metrics

## Tmux Bridge System

### Setup Pane Names

In each tmux pane, set the pane title:

```bash
# Alice pane
tmux select-pane -T alice

# Lucidia pane
tmux select-pane -T lucidia

# Aria pane
tmux select-pane -T aria
```

### Helper Scripts

**Location:** `/Users/alexa/`

#### 1. `br-send` - Send Commands to Agents

Send commands to specific agent panes:

```bash
# Usage
~/br-send <agent> "<command>"

# Examples
~/br-send alice "hostname; uptime"
~/br-send lucidia "docker ps"
~/br-send aria "systemctl status"
```

**Features:**
- Finds pane by title automatically
- Sends command and presses Enter
- Shows confirmation message
- Lists available panes if not found

#### 2. `br-capture-all` - Capture All Pane Outputs

Capture last N lines from all agent panes:

```bash
# Capture last 40 lines (default)
~/br-capture-all

# Capture last 100 lines
~/br-capture-all 100
```

**Output Format:**
```
=========================================
BlackRoad Agent Pane Capture
=========================================

┌─────────────────────────────────────────
│ 🤖 alice (pane_id)
└─────────────────────────────────────────
[Last 40 lines from alice pane]

┌─────────────────────────────────────────
│ 🤖 lucidia (pane_id)
└─────────────────────────────────────────
[Last 40 lines from lucidia pane]

┌─────────────────────────────────────────
│ 🤖 aria (pane_id)
└─────────────────────────────────────────
[Last 40 lines from aria pane]
```

## Integration with Claude

### Option A: Manual Context Sharing

1. Run `~/br-capture-all` to get all pane outputs
2. Copy the output
3. Paste into Claude with your question
4. Claude sees full context from all agents

### Option B: Command Execution Flow

1. Ask Claude what commands to run
2. Claude responds with format:
   ```
   alice: <command>
   lucidia: <command>
   aria: <command>
   ```
3. Execute with:
   ```bash
   ~/br-send alice "<command>"
   ~/br-send lucidia "<command>"
   ~/br-send aria "<command>"
   ```

### Option C: Full Automation (Advanced)

Create a wrapper script that:
1. Captures all pane states
2. Sends to Claude
3. Parses Claude's response
4. Executes commands automatically

## Keyboard Shortcuts

| Shortcut | Window |
|----------|--------|
| Alt+1 | Terminal |
| Alt+2 | Agent Registry |
| Alt+3 | Alice Agent |
| Alt+4 | Lucidia Agent |
| Alt+5 | Aria Agent |
| Alt+6 | Health Monitor |
| Alt+7 | Memory Vault |
| Alt+8 | Token Vault |
| Alt+9 | Agent Builder |
| Alt+0 | Billing |

## Agent Window Features

### Interactive Buttons

**Alice, Aria, Lucidia:**
- 🔌 **Test Connection** - Verify agent connectivity
- 📋 **View Logs** - Show recent activity logs
- 💬 **Send Message** - Interactive message prompt
- 📊 **View Metrics** - Display usage statistics

**Lucidia Additional:**
- ⚙️ **View Services** - Show Pi service status
- 🤖 **Check Ollama** - Ollama-specific status

### Tmux Commands (Clickable)

Each agent window displays tmux commands that can be copied:

```bash
# Set pane name
tmux select-pane -T <agent>

# Send command
~/br-send <agent> "command"

# Capture output
tmux capture-pane -p -S -40 -t <agent>

# SSH connection
ssh <agent>@<host>
```

Click any command to copy it to clipboard.

## File Locations

```
blackroad-console-deploy/
├── agent-alice.html           # Alice terminal window
├── agent-lucidia-terminal.html # Lucidia terminal window
├── agent-aria.html            # Aria terminal window
└── index.html                 # Main desktop (includes dock items)

/Users/alexa/
├── br-send                    # Command sender script
└── br-capture-all             # Pane capture script
```

## SSH Connections

### Alice
```bash
# TBD - awaiting deployment info
ssh alice@alice.local
```

### Lucidia
```bash
ssh lucidia@192.168.4.38
# or
ssh pi@192.168.4.38
```

### Aria
```bash
# TBD - awaiting deployment info
ssh aria@aria.local
```

## Troubleshooting

**Pane not found:**
```bash
# List all panes
tmux list-panes -a -F '#{pane_id} #{pane_title}'

# Set pane title
tmux select-pane -T <agent>
```

**Command not executing:**
```bash
# Verify tmux is running
tmux list-sessions

# Check pane title is set
tmux list-panes -a -F '#{pane_id} #{pane_title}' | grep <agent>
```

**Script permission denied:**
```bash
chmod +x ~/br-send
chmod +x ~/br-capture-all
```

## Production URLs

**Agent Windows:**
- https://app.blackroad.io/ (click agent dock icons)
- https://blackroad-console.pages.dev/

**Direct Access:**
- https://app.blackroad.io/agent-alice.html
- https://app.blackroad.io/agent-lucidia-terminal.html
- https://app.blackroad.io/agent-aria.html

## Example Workflow

### 1. Setup Tmux Panes

```bash
# In alice pane
tmux select-pane -T alice

# In lucidia pane
tmux select-pane -T lucidia

# In aria pane
tmux select-pane -T aria
```

### 2. Capture Current State

```bash
~/br-capture-all > context.txt
cat context.txt
```

### 3. Send to Claude

Paste context.txt content into Claude with your question.

### 4. Execute Claude's Commands

```bash
~/br-send alice "systemctl status alice-agent"
~/br-send lucidia "docker ps"
~/br-send aria "tail -f /var/log/aria-agent.log"
```

### 5. Capture Results

```bash
~/br-capture-all
```

## Security Notes

- SSH keys should be configured for passwordless access
- Tmux panes are local to your Mac terminal
- `br-send` only works with active tmux sessions
- Agent windows display connection info but don't execute commands (read-only)

## Future Enhancements

- [ ] WebSocket connection from agent windows to tmux panes
- [ ] Real-time log streaming in browser
- [ ] Execute commands directly from agent windows
- [ ] Integrated terminal emulator (xterm.js)
- [ ] Agent chat interface in windows
- [ ] Metrics graphs and charts
- [ ] Alert notifications from agents

---

**Version:** 1.0.0
**Created:** December 21, 2025
**Author:** Alexa Amundson
**Scripts:** `/Users/alexa/br-send`, `/Users/alexa/br-capture-all`
