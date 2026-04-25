# BlackRoad OS CLI Reference

> Complete guide to all 57 CLI commands in BlackRoad OS

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Command Categories](#command-categories)
- [Agent Commands](#agent-commands)
- [Task Commands](#task-commands)
- [Memory Commands](#memory-commands)
- [Communication Commands](#communication-commands)
- [Infrastructure Commands](#infrastructure-commands)
- [Monitoring Commands](#monitoring-commands)
- [Development Commands](#development-commands)
- [Utility Commands](#utility-commands)
- [Interactive Commands](#interactive-commands)

---

## Overview

BlackRoad OS provides **57 shell scripts** for managing agents, tasks, memory, infrastructure, and more. All commands are located in the repository root and can be executed directly.

### Command Structure

```
./command.sh [subcommand] [options] [arguments]
```

### Getting Help

```bash
# List all commands
ls *.sh

# Get help for specific command
./command.sh --help
./command.sh help
```

---

## Quick Start

```bash
# Essential commands to get started
./boot.sh              # Start the system
./status.sh            # Check system status
./health.sh            # Full health check
./wake.sh llama3.2 ALICE   # Wake an agent
./whisper.sh ALICE "Hello" # Talk to agent
```

---

## Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| **Agent** | 8 | Manage AI agents |
| **Task** | 5 | Task management |
| **Memory** | 4 | Memory operations |
| **Communication** | 6 | Messaging & alerts |
| **Infrastructure** | 10 | System management |
| **Monitoring** | 8 | Health & metrics |
| **Development** | 7 | Dev tools |
| **Utility** | 5 | Helpers |
| **Interactive** | 4 | Games & demos |

---

## Agent Commands

### wake.sh

**Wake up an AI agent with a specific model.**

```bash
./wake.sh <model> <agent_name>

# Examples
./wake.sh llama3.2 ALICE
./wake.sh mistral LUCIDIA
./wake.sh codellama OCTAVIA
```

**Options:**
| Option | Description |
|--------|-------------|
| `--quiet` | Suppress output |
| `--timeout <sec>` | Wake timeout (default: 30) |

**Output:**
```
☀ WAKING ALICE
├── Initializing consciousness...
├── Loading memories...
├── Activating personality matrix...
├── Connecting to mesh...
└── ● ALICE is now ONLINE
```

---

### agent.sh

**Manage individual agents.**

```bash
./agent.sh <subcommand> [options]

# Subcommands
./agent.sh list                    # List all agents
./agent.sh info ALICE              # Get agent info
./agent.sh start ALICE             # Start agent
./agent.sh stop ALICE              # Stop agent
./agent.sh restart ALICE           # Restart agent
./agent.sh logs ALICE              # View agent logs
./agent.sh config ALICE            # Show config
./agent.sh config ALICE --edit     # Edit config
```

**Agent Info Output:**
```
Agent: ALICE
├── Type: worker
├── Model: llama3.2
├── Status: ONLINE
├── Uptime: 4h 23m
├── Tasks: 127 completed
├── Memory: 2.3GB
└── Last activity: 2m ago
```

---

### roster.sh

**View the full agent roster and status.**

```bash
./roster.sh [options]

# Options
./roster.sh                        # All agents
./roster.sh --online               # Online only
./roster.sh --type worker          # Filter by type
./roster.sh --json                 # JSON output
```

**Output:**
```
BLACKROAD AGENT ROSTER
======================

 Agent      Type       Model      Status    Tasks    Uptime
 ------     ----       -----      ------    -----    ------
 LUCIDIA    reasoning  llama3.2   ONLINE    847      12h
 ALICE      worker     llama3.2   ONLINE    12,453   24h
 OCTAVIA    devops     mistral    ONLINE    3,291    8h
 PRISM      analytics  llama3.2   ONLINE    2,104    6h
 ECHO       memory     llama3.2   ONLINE    1,876    24h
 CIPHER     security   llama3.2   ONLINE    8,932    24h

Total: 6 agents | 5 online | 1 offline
```

---

### bonds.sh

**Manage agent relationships and trust levels.**

```bash
./bonds.sh [subcommand] [options]

# View relationships
./bonds.sh                         # All relationships
./bonds.sh ALICE                   # ALICE's relationships
./bonds.sh ALICE LUCIDIA           # Specific bond

# Manage relationships
./bonds.sh create ALICE OCTAVIA --type collaboration
./bonds.sh update ALICE OCTAVIA --trust 0.9
./bonds.sh remove ALICE OCTAVIA
```

**Output:**
```
AGENT RELATIONSHIPS
===================

ALICE ←→ LUCIDIA
├── Type: mentor-student
├── Trust: 0.95
├── Since: 2025-06-01
└── Interactions: 1,247

ALICE ←→ OCTAVIA
├── Type: collaboration
├── Trust: 0.88
├── Since: 2025-08-15
└── Interactions: 892
```

---

### council.sh

**Convene a multi-agent council for decision making.**

```bash
./council.sh "<question>" [agents...]

# Examples
./council.sh "Should we deploy to production?"
./council.sh "What's the best architecture?" LUCIDIA PRISM OCTAVIA
./council.sh "Review this code" --file src/main.py
```

**Output:**
```
COUNCIL CONVENED
================
Topic: Should we deploy to production?
Participants: LUCIDIA, ALICE, OCTAVIA, CIPHER

LUCIDIA [reasoning]:
"The tests pass and the code looks solid. From a strategic
perspective, deploying now aligns with our Q1 goals..."

CIPHER [security]:
"I've scanned the changes. No vulnerabilities detected.
The security posture is acceptable for production..."

OCTAVIA [devops]:
"Infrastructure is ready. I recommend a blue-green
deployment to minimize risk..."

CONSENSUS: APPROVE (3/3 in favor)
```

---

### debate.sh

**Start a structured debate between agents.**

```bash
./debate.sh "<topic>" <agent1> <agent2> [options]

# Examples
./debate.sh "Microservices vs Monolith" LUCIDIA PRISM
./debate.sh "React vs Vue" ALICE OCTAVIA --rounds 3
```

---

### focus.sh

**Set an agent's focus mode for deep work.**

```bash
./focus.sh <agent> <duration> [task]

# Examples
./focus.sh ALICE 2h "Code review"
./focus.sh LUCIDIA 30m "Analysis"
./focus.sh --clear ALICE              # Clear focus
```

---

### soul.sh

**View and manage agent personality and identity.**

```bash
./soul.sh <agent> [options]

# Examples
./soul.sh ALICE                       # View soul
./soul.sh ALICE --traits              # View traits
./soul.sh ALICE --memories            # Core memories
./soul.sh ALICE --evolve              # Trigger evolution
```

---

## Task Commands

### tasks.sh

**Manage the task system.**

```bash
./tasks.sh [subcommand] [options]

# List tasks
./tasks.sh                            # All tasks
./tasks.sh list                       # Same as above
./tasks.sh list --status pending      # Filter by status
./tasks.sh list --agent ALICE         # Filter by agent

# Create task
./tasks.sh create "Deploy to staging" --agent ALICE --priority high
./tasks.sh assign ALICE "Review PR #123"

# Manage tasks
./tasks.sh info <task_id>             # Task details
./tasks.sh cancel <task_id>           # Cancel task
./tasks.sh complete <task_id>         # Mark complete
./tasks.sh reassign <task_id> OCTAVIA # Reassign
```

**Task List Output:**
```
TASK QUEUE
==========

ID          Title                    Agent    Status     Priority
--------    --------------------     -----    ------     --------
task_001    Deploy to staging        ALICE    running    high
task_002    Review PR #123           ALICE    pending    normal
task_003    Security scan            CIPHER   running    high
task_004    Generate report          PRISM    pending    low

Total: 4 tasks | 2 running | 2 pending
```

---

### queue.sh

**View and manage the task queue.**

```bash
./queue.sh [options]

# View queue
./queue.sh                            # Current queue
./queue.sh --depth 20                 # Show 20 items
./queue.sh --agent ALICE              # Agent's queue

# Manage queue
./queue.sh pause                      # Pause processing
./queue.sh resume                     # Resume processing
./queue.sh clear                      # Clear queue (careful!)
./queue.sh prioritize <task_id>       # Move to front
```

---

### mission.sh

**Define and track long-term missions.**

```bash
./mission.sh [subcommand] [options]

# View missions
./mission.sh                          # Active missions
./mission.sh list                     # All missions
./mission.sh info <mission_id>        # Mission details

# Create mission
./mission.sh create "Launch v2.0" \
  --description "Complete v2.0 release" \
  --deadline "2026-03-01" \
  --agents ALICE,OCTAVIA

# Update mission
./mission.sh update <mission_id> --progress 50
./mission.sh complete <mission_id>
```

---

### spark.sh

**Quick task creation with natural language.**

```bash
./spark.sh "<natural language task>"

# Examples
./spark.sh "Check why the API is slow"
./spark.sh "Deploy the new feature to staging"
./spark.sh "Analyze last week's metrics"
```

**Output:**
```
⚡ SPARK
========
Input: "Check why the API is slow"

Interpreted:
├── Task: Performance analysis
├── Agent: PRISM (analytics)
├── Priority: high
└── Actions:
    1. Check API latency metrics
    2. Analyze slow endpoints
    3. Generate report

Proceed? [Y/n] y

Task created: task_123
Assigned to: PRISM
```

---

### think.sh

**Assign a thinking/reasoning task.**

```bash
./think.sh "<problem>" [options]

# Examples
./think.sh "What's the best caching strategy?"
./think.sh "How should we scale to 100K users?" --deep
./think.sh "Analyze this error" --context error.log
```

---

## Memory Commands

### mem.sh

**Memory system management.**

```bash
./mem.sh [subcommand] [options]

# Search memory
./mem.sh search "deployment guide"
./mem.sh search "user preferences" --tier semantic

# Store memory
./mem.sh store "key" "value"
./mem.sh store "config" '{"setting": true}' --tier episodic

# Retrieve memory
./mem.sh get "key"
./mem.sh get "config" --tier episodic

# Delete memory
./mem.sh delete "key"
./mem.sh delete "old_*" --pattern

# Maintenance
./mem.sh stats                        # Memory statistics
./mem.sh consolidate                  # Run consolidation
./mem.sh verify                       # Verify chain integrity
./mem.sh export                       # Export memories
./mem.sh import backup.json           # Import memories
```

**Memory Stats Output:**
```
MEMORY STATISTICS
=================

Tier         Items      Size       Latency
----         -----      ----       -------
Working      15,234     2.3GB      <10ms
Episodic     892,451    45GB       <50ms
Semantic     1.2M       -          <100ms
Archival     5.4M       234GB      <1s

Chain Status: VERIFIED ✓
Last Consolidation: 2h ago
Next Scheduled: 4h
```

---

### thoughts.sh

**View and record agent thoughts.**

```bash
./thoughts.sh [agent] [options]

# View thoughts
./thoughts.sh                         # All recent thoughts
./thoughts.sh LUCIDIA                 # Agent's thoughts
./thoughts.sh --today                 # Today's thoughts

# Record thought
./thoughts.sh record LUCIDIA "Interesting pattern in data..."
```

---

### story.sh

**Generate narrative from agent interactions.**

```bash
./story.sh [options]

# Generate stories
./story.sh                            # Today's story
./story.sh --week                     # This week
./story.sh --agent ALICE              # Agent's story
./story.sh --format markdown          # Output format
```

---

### timeline.sh

**View chronological event history.**

```bash
./timeline.sh [options]

# View timeline
./timeline.sh                         # Recent events
./timeline.sh --since "1h"            # Last hour
./timeline.sh --agent ALICE           # Agent events
./timeline.sh --type task             # Task events only
```

---

## Communication Commands

### whisper.sh

**Send a private message to an agent.**

```bash
./whisper.sh <agent> "<message>"

# Examples
./whisper.sh ALICE "Please review the latest PR"
./whisper.sh LUCIDIA "What do you think about this approach?"
./whisper.sh CIPHER "Scan the codebase for vulnerabilities"
```

**Output:**
```
🔒 WHISPER TO ALICE
==================

You: Please review the latest PR

ALICE: I'll review PR #456 now. Looking at the changes...

The PR adds a new authentication middleware. Here's my analysis:

✓ Code style is consistent
✓ Tests are comprehensive
⚠ Consider adding rate limiting
⚠ JWT expiry should be configurable

Overall: APPROVE with minor suggestions

Shall I post this review to GitHub? [Y/n]
```

---

### broadcast.sh

**Send a message to all agents.**

```bash
./broadcast.sh "<message>" [options]

# Examples
./broadcast.sh "System maintenance in 5 minutes"
./broadcast.sh "New deployment completed" --priority high
./broadcast.sh "Meeting in 10 minutes" --type announcement
```

---

### chat.sh

**Interactive chat with an agent.**

```bash
./chat.sh [agent]

# Examples
./chat.sh                             # Chat with default agent
./chat.sh ALICE                       # Chat with ALICE
./chat.sh --multi                     # Multi-agent chat
```

**Interactive Session:**
```
CHAT WITH ALICE
===============
Type 'exit' to quit, '/help' for commands

You: How's the deployment going?

ALICE: The deployment to staging completed successfully.
All tests passed. Ready for production when you are.

You: What were the key changes?

ALICE: The main changes in this deployment:
1. New authentication middleware
2. Improved caching layer
3. Bug fixes for API rate limiting

Shall I show the detailed changelog?

You: /exit
Goodbye! 👋
```

---

### convo.sh

**View conversation history.**

```bash
./convo.sh [options]

# View conversations
./convo.sh                            # Recent conversations
./convo.sh ALICE                      # With specific agent
./convo.sh --today                    # Today only
./convo.sh --search "deployment"      # Search conversations
```

---

### alert.sh

**Send system alerts.**

```bash
./alert.sh <level> "<message>" [options]

# Alert levels: info, warning, error, critical

# Examples
./alert.sh info "Deployment started"
./alert.sh warning "High memory usage"
./alert.sh error "API timeout detected"
./alert.sh critical "System down" --notify all
```

---

### wire.sh

**Low-level message passing between agents.**

```bash
./wire.sh <from> <to> "<message>" [options]

# Examples
./wire.sh ALICE OCTAVIA "Ready for deployment"
./wire.sh CIPHER LUCIDIA '{"type": "alert", "data": {...}}'
```

---

## Infrastructure Commands

### boot.sh

**Start the BlackRoad system.**

```bash
./boot.sh [options]

# Examples
./boot.sh                             # Full boot
./boot.sh --minimal                   # Minimal services
./boot.sh --agents                    # Agents only
./boot.sh --services                  # Services only
```

**Output:**
```
BLACKROAD BOOT SEQUENCE
=======================

[1/6] Starting Redis...           ✓
[2/6] Starting PostgreSQL...      ✓
[3/6] Starting Ollama...          ✓
[4/6] Starting API...             ✓
[5/6] Starting Agent Service...   ✓
[6/6] Starting Memory Service...  ✓

System Status: ONLINE
Dashboard: http://localhost:3000
API: http://localhost:8000
```

---

### status.sh

**Check system status.**

```bash
./status.sh [options]

# Examples
./status.sh                           # Full status
./status.sh --brief                   # Brief output
./status.sh --json                    # JSON output
./status.sh agents                    # Agents only
./status.sh services                  # Services only
```

---

### health.sh

**Comprehensive health check.**

```bash
./health.sh [options]

# Examples
./health.sh                           # Full health check
./health.sh --quick                   # Quick check
./health.sh --verbose                 # Detailed output
./health.sh --fix                     # Attempt auto-fix
```

---

### blackroad-mesh.sh

**Infrastructure mesh status and management.**

```bash
./blackroad-mesh.sh [subcommand]

# Examples
./blackroad-mesh.sh                   # Full mesh status
./blackroad-mesh.sh status            # Status overview
./blackroad-mesh.sh check             # Health checks
./blackroad-mesh.sh sync              # Sync infrastructure
```

**Output:**
```
BLACKROAD INFRASTRUCTURE MESH
=============================

Cloud Services:
├── Cloudflare    [CONNECTED] 75 workers
├── Railway       [CONNECTED] 14 projects
├── Vercel        [CONNECTED] 15 projects
├── DigitalOcean  [CONNECTED] 1 droplet
└── GitHub        [CONNECTED] 1,200+ repos

Edge Devices:
├── lucidia (192.168.4.38)        [ONLINE]
├── blackroad-pi (192.168.4.64)   [ONLINE]
└── lucidia-alt (192.168.4.99)    [OFFLINE]

Services:
├── API           [HEALTHY] 99.9% uptime
├── Memory        [HEALTHY] 45GB used
├── Agents        [HEALTHY] 6 active
└── Workers       [HEALTHY] 75 running
```

---

### net.sh

**Network diagnostics and connectivity.**

```bash
./net.sh [subcommand]

# Examples
./net.sh                              # Network overview
./net.sh ping                         # Ping all services
./net.sh trace api.blackroad.io       # Trace route
./net.sh dns                          # DNS status
./net.sh ports                        # Port status
```

---

### hub.sh

**Central hub for all services.**

```bash
./hub.sh [subcommand]

# Examples
./hub.sh                              # Hub overview
./hub.sh services                     # List services
./hub.sh connect <service>            # Connect to service
./hub.sh restart <service>            # Restart service
```

---

### config.sh

**Configuration management.**

```bash
./config.sh [subcommand]

# Examples
./config.sh                           # Show config
./config.sh get REDIS_HOST            # Get value
./config.sh set DEBUG true            # Set value
./config.sh edit                      # Edit config
./config.sh validate                  # Validate config
./config.sh export                    # Export config
```

---

### saver.sh

**Backup and state preservation.**

```bash
./saver.sh [subcommand]

# Examples
./saver.sh                            # Create backup
./saver.sh create                     # Create backup
./saver.sh restore <backup>           # Restore backup
./saver.sh list                       # List backups
./saver.sh clean                      # Clean old backups
```

---

### find.sh

**Find files and resources.**

```bash
./find.sh <pattern> [options]

# Examples
./find.sh "*.py"                      # Python files
./find.sh "config" --type file        # Files named config
./find.sh "agent" --in orgs/          # In specific dir
```

---

### all.sh

**Run command across all components.**

```bash
./all.sh <command>

# Examples
./all.sh status                       # Status of all
./all.sh restart                      # Restart all
./all.sh update                       # Update all
```

---

## Monitoring Commands

### logs.sh

**View system logs.**

```bash
./logs.sh [options]

# Examples
./logs.sh                             # Recent logs
./logs.sh --level error               # Errors only
./logs.sh --agent ALICE               # Agent logs
./logs.sh --follow                    # Stream logs
./logs.sh --since "1h"                # Last hour
./logs.sh --grep "error"              # Search logs
```

---

### monitor.sh

**Real-time system monitoring.**

```bash
./monitor.sh [options]

# Examples
./monitor.sh                          # Full monitor
./monitor.sh --agents                 # Agent activity
./monitor.sh --tasks                  # Task progress
./monitor.sh --memory                 # Memory usage
./monitor.sh --metrics                # Metrics display
```

---

### pulse.sh

**System heartbeat and vitals.**

```bash
./pulse.sh [options]

# Examples
./pulse.sh                            # Current pulse
./pulse.sh --continuous               # Continuous mode
./pulse.sh --interval 5               # 5 second interval
```

**Output:**
```
BLACKROAD PULSE
===============
Time: 2026-02-05 12:00:00 UTC

CPU:    ████████░░░░░░░░░░░░  42%
Memory: ██████░░░░░░░░░░░░░░  32%
Disk:   ████░░░░░░░░░░░░░░░░  22%
Network: 12 Mbps ↓ / 5 Mbps ↑

Agents: 6 active | Tasks: 23 running
Requests: 142/s | Errors: 0.1%
```

---

### report.sh

**Generate system reports.**

```bash
./report.sh [type] [options]

# Examples
./report.sh                           # Daily report
./report.sh daily                     # Daily report
./report.sh weekly                    # Weekly report
./report.sh monthly                   # Monthly report
./report.sh custom --since "7d"       # Custom period
./report.sh --format pdf              # PDF output
./report.sh --email admin@example.com # Email report
```

---

### traffic.sh

**View request traffic.**

```bash
./traffic.sh [options]

# Examples
./traffic.sh                          # Traffic overview
./traffic.sh --live                   # Live traffic
./traffic.sh --top                    # Top endpoints
./traffic.sh --slow                   # Slow requests
```

---

### events.sh

**View system events.**

```bash
./events.sh [options]

# Examples
./events.sh                           # Recent events
./events.sh --type deployment         # Deployment events
./events.sh --severity high           # High severity
./events.sh --since "24h"             # Last 24 hours
```

---

### inspect.sh

**Deep inspection of components.**

```bash
./inspect.sh <component> [options]

# Examples
./inspect.sh agent ALICE              # Inspect agent
./inspect.sh task task_123            # Inspect task
./inspect.sh memory                   # Inspect memory
./inspect.sh service api              # Inspect service
```

---

### dash.sh

**Open the web dashboard.**

```bash
./dash.sh [options]

# Examples
./dash.sh                             # Open dashboard
./dash.sh --port 3001                 # Custom port
./dash.sh --no-browser                # Don't open browser
```

---

## Development Commands

### demo.sh

**Run demo mode.**

```bash
./demo.sh [scenario]

# Examples
./demo.sh                             # Interactive demo
./demo.sh onboarding                  # Onboarding demo
./demo.sh agents                      # Agent demo
./demo.sh workflow                    # Workflow demo
```

---

### intro.sh

**Introduction and getting started.**

```bash
./intro.sh [options]

# Examples
./intro.sh                            # Full intro
./intro.sh --quick                    # Quick start
./intro.sh --video                    # Video intro
```

---

### help.sh

**Get help on commands.**

```bash
./help.sh [command]

# Examples
./help.sh                             # General help
./help.sh wake                        # Help for wake
./help.sh --all                       # All commands
./help.sh --search "agent"            # Search help
```

---

### skills.sh

**Manage agent skills.**

```bash
./skills.sh [subcommand]

# Examples
./skills.sh                           # List skills
./skills.sh list                      # List all skills
./skills.sh info code-runner          # Skill info
./skills.sh install my-skill          # Install skill
./skills.sh test my-skill             # Test skill
```

---

### install-cece.sh

**Install CECE identity system.**

```bash
./install-cece.sh [options]

# Examples
./install-cece.sh                     # Full install
./install-cece.sh --update            # Update only
./install-cece.sh --reset             # Reset identity
```

---

### god.sh

**Admin/superuser mode.**

```bash
./god.sh [command]

# Examples
./god.sh                              # Enter god mode
./god.sh status                       # Admin status
./god.sh reset                        # System reset
./god.sh override <setting>           # Override setting
```

---

### office.sh

**Development workspace management.**

```bash
./office.sh [subcommand]

# Examples
./office.sh                           # Open workspace
./office.sh open                      # Open in editor
./office.sh setup                     # Setup workspace
./office.sh clean                     # Clean workspace
```

---

## Utility Commands

### menu.sh

**Interactive menu system.**

```bash
./menu.sh [category]

# Examples
./menu.sh                             # Main menu
./menu.sh agents                      # Agent menu
./menu.sh tasks                       # Task menu
```

---

### clock.sh

**System time and scheduling.**

```bash
./clock.sh [options]

# Examples
./clock.sh                            # Current time
./clock.sh --timezone UTC             # Specific timezone
./clock.sh --schedule                 # Scheduled tasks
./clock.sh --cron                     # Cron jobs
```

---

### mood.sh

**Agent mood and emotional state.**

```bash
./mood.sh [agent]

# Examples
./mood.sh                             # All moods
./mood.sh ALICE                       # ALICE's mood
./mood.sh --set ALICE happy           # Set mood
```

---

### matrix.sh

**System matrix visualization.**

```bash
./matrix.sh [options]

# Examples
./matrix.sh                           # Matrix view
./matrix.sh --agents                  # Agent matrix
./matrix.sh --services                # Service matrix
```

---

### visual/

**Visual tools and displays.**

```bash
./visual/dashboard.sh                 # Visual dashboard
./visual/graph.sh                     # Graph view
./visual/tree.sh                      # Tree view
```

---

## Interactive Commands

### blackroad-agents-rpg.py

**Agent RPG game.**

```bash
python blackroad-agents-rpg.py

# Interactive RPG where you interact with agents
# in a role-playing game format
```

---

### chess_game.py

**Play chess against an agent.**

```bash
python chess_game.py [agent]

# Examples
python chess_game.py                  # Default opponent
python chess_game.py LUCIDIA          # Play LUCIDIA
```

---

### god.sh (Interactive)

**Interactive admin console.**

```bash
./god.sh --interactive

# Enters an interactive admin console with
# full system control
```

---

### chat.sh (Multi-Agent)

**Multi-agent chat room.**

```bash
./chat.sh --multi

# Chat with multiple agents simultaneously
# in a group conversation
```

---

## Command Cheat Sheet

```bash
# Essential Commands
./boot.sh                     # Start system
./status.sh                   # System status
./health.sh                   # Health check

# Agent Management
./wake.sh llama3.2 ALICE      # Wake agent
./roster.sh                   # View roster
./whisper.sh ALICE "Hello"    # Message agent

# Task Management
./tasks.sh list               # List tasks
./tasks.sh create "Task"      # Create task
./spark.sh "Natural task"     # Quick create

# Memory Operations
./mem.sh search "query"       # Search memory
./mem.sh store key value      # Store memory
./mem.sh stats                # Memory stats

# Monitoring
./logs.sh                     # View logs
./monitor.sh                  # Real-time monitor
./pulse.sh                    # System pulse

# Infrastructure
./blackroad-mesh.sh           # Mesh status
./net.sh                      # Network status
./config.sh                   # Configuration
```

---

*Last updated: 2026-02-05*
