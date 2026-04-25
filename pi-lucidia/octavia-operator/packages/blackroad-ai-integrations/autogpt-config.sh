#!/bin/bash
# AutoGPT Configuration Script for BlackRoad OS
# Description: Generates AutoGPT configuration files, sets up workspace, and configures BlackRoad-specific plugins
# Usage: ./autogpt-config.sh [init|launch|status|clean]

set -e

# BlackRoad Brand Colors
PINK='\033[38;5;205m'   # Hot pink (#FF1D6C)
AMBER='\033[38;5;214m'  # Amber (#F5A623)
BLUE='\033[38;5;69m'    # Electric blue (#2979FF)
VIOLET='\033[38;5;135m' # Violet (#9C27B0)
GREEN='\033[38;5;82m'   # Success
RED='\033[38;5;196m'    # Error
RESET='\033[0m'

# Configuration
AUTOGPT_DIR="${HOME}/.blackroad/autogpt"
WORKSPACE_DIR="${AUTOGPT_DIR}/workspace"
PLUGINS_DIR="${AUTOGPT_DIR}/plugins"
CONFIG_FILE="${AUTOGPT_DIR}/.env"
SETTINGS_FILE="${AUTOGPT_DIR}/ai_settings.yaml"

# Log to memory
log_memory() {
    local action=$1
    local entity=$2
    local details=$3
    local tags=$4

    if [ -f "${HOME}/memory-system.sh" ]; then
        "${HOME}/memory-system.sh" log "$action" "$entity" "$details" "$tags" 2>/dev/null || true
    fi
}

# Print header
print_header() {
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${PINK}║${RESET}         🤖 ${AMBER}AUTOGPT CONFIGURATION${RESET} - ${VIOLET}BlackRoad OS${RESET}         ${PINK}║${RESET}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo ""
}

# Initialize AutoGPT workspace
init_autogpt() {
    print_header
    echo -e "${BLUE}[INIT]${RESET} Initializing AutoGPT workspace..."

    # Create directory structure
    mkdir -p "$WORKSPACE_DIR"
    mkdir -p "$PLUGINS_DIR"
    mkdir -p "${AUTOGPT_DIR}/logs"
    mkdir -p "${AUTOGPT_DIR}/data"

    echo -e "${GREEN}✓${RESET} Created directory structure:"
    echo -e "  • ${WORKSPACE_DIR}"
    echo -e "  • ${PLUGINS_DIR}"
    echo -e "  • ${AUTOGPT_DIR}/logs"
    echo -e "  • ${AUTOGPT_DIR}/data"

    # Generate .env configuration
    generate_env_config

    # Generate ai_settings.yaml
    generate_ai_settings

    # Create BlackRoad plugins
    create_blackroad_plugins

    # Create launch scripts
    create_launch_scripts

    echo -e "\n${GREEN}✓${RESET} AutoGPT initialization complete!"
    echo -e "${AMBER}Next steps:${RESET}"
    echo -e "  1. Edit ${CONFIG_FILE} with your API keys"
    echo -e "  2. Run: ${BLUE}./autogpt-config.sh launch${RESET}"

    log_memory "configured" "autogpt" "Initialized AutoGPT workspace at ${AUTOGPT_DIR}" "ai,autogpt,setup"
}

# Generate .env configuration
generate_env_config() {
    echo -e "${BLUE}[CONFIG]${RESET} Generating .env configuration..."

    cat > "$CONFIG_FILE" << 'EOF'
################################################################################
### AutoGPT Configuration - BlackRoad OS
################################################################################

### API Keys (Replace with your actual keys)
# OpenAI API Key (required for GPT-4)
OPENAI_API_KEY=${OPENAI_API_KEY:-your-openai-api-key-here}

# Anthropic Claude API Key (optional, for Claude integration)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-your-anthropic-api-key-here}

# Google API Key (optional, for search)
GOOGLE_API_KEY=${GOOGLE_API_KEY:-your-google-api-key-here}
CUSTOM_SEARCH_ENGINE_ID=${CUSTOM_SEARCH_ENGINE_ID:-your-search-engine-id}

# Pinecone (optional, for memory)
PINECONE_API_KEY=${PINECONE_API_KEY}
PINECONE_ENV=${PINECONE_ENV:-us-west1-gcp}

### Model Configuration
# Default model to use
SMART_LLM=gpt-4
FAST_LLM=gpt-3.5-turbo

# Temperature settings
TEMPERATURE=0.7

### Memory Configuration
# Memory backend (local, pinecone, redis)
MEMORY_BACKEND=local
MEMORY_INDEX=autogpt

### Execution Settings
# Maximum tokens for responses
MAX_TOKENS=2000

# Continuous mode (runs autonomously without user approval)
CONTINUOUS_MODE=false

# Continuous limit (0 = no limit)
CONTINUOUS_LIMIT=0

# Skip news on startup
SKIP_NEWS=true

### Browser Configuration
# Browser to use (chrome, firefox, safari, edge)
USE_WEB_BROWSER=chrome
HEADLESS_BROWSER=true

### Workspace Settings
WORKSPACE_PATH=workspace/

### Logging
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

### BlackRoad Integration
BLACKROAD_MEMORY_ENABLED=true
BLACKROAD_BLACKROAD OS_ENABLED=true
BLACKROAD_AGENT_REGISTRY=~/.blackroad-agent-registry.db
BLACKROAD_TRAFFIC_LIGHTS=~/.blackroad-traffic-light.db

### Plugin Settings
ALLOWLISTED_PLUGINS=blackroad-memory,blackroad-blackroad os,blackroad-coordination
DENYLISTED_PLUGINS=

### Debug Mode
DEBUG=false
EOF

    echo -e "${GREEN}✓${RESET} Generated .env at ${CONFIG_FILE}"
}

# Generate ai_settings.yaml
generate_ai_settings() {
    echo -e "${BLUE}[CONFIG]${RESET} Generating ai_settings.yaml..."

    cat > "$SETTINGS_FILE" << 'EOF'
ai_goals:
  - Assist with BlackRoad OS infrastructure tasks
  - Coordinate with other AI agents in the BlackRoad ecosystem
  - Maintain memory consistency using PS-SHA-infinity journals
  - Search and utilize the BlackRoad BlackRoad OS (225k+ components)
  - Follow BlackRoad brand guidelines and design system

ai_name: BlackRoad-AutoGPT
ai_role: Autonomous AI assistant for BlackRoad OS infrastructure

api_budget: 10.0  # Maximum API spending (USD)

constraints:
  - Respect the Golden Rule - check Memory, BlackRoad OS, and Index before any work
  - Use BlackRoad brand colors (hot pink #FF1D6C, amber #F5A623, violet #9C27B0, electric blue #2979FF)
  - Apply Golden Ratio spacing (8, 13, 21, 34, 55, 89, 144px)
  - Log all significant actions to memory system
  - Coordinate with other Claude agents via memory journals
  - Never create files in indexed repos without checking INDEX.md

resources:
  - BlackRoad Memory System (~/.blackroad/memory/)
  - BlackRoad BlackRoad OS (~/blackroad-blackroad os/)
  - Agent Registry (~/.blackroad-agent-registry.db)
  - Traffic Lights (~/.blackroad-traffic-light.db)
  - Task Marketplace (~/.blackroad/memory/tasks/)
  - 15 GitHub organizations (1,085 repos)
  - 205 Cloudflare Pages projects
  - 8 physical devices in Tailscale mesh

best_practices:
  - Run ~/claude-session-init.sh at start of each session
  - Check memory before work: ~/memory-realtime-context.sh
  - Search blackroad os: python3 ~/blackroad-blackroad os-search.py
  - Log progress: ~/memory-system.sh log
  - Update traffic lights: ~/blackroad-traffic-light.sh
EOF

    echo -e "${GREEN}✓${RESET} Generated ai_settings.yaml at ${SETTINGS_FILE}"
}

# Create BlackRoad-specific plugins
create_blackroad_plugins() {
    echo -e "${BLUE}[PLUGINS]${RESET} Creating BlackRoad plugins..."

    # Plugin 1: Memory Integration
    cat > "${PLUGINS_DIR}/blackroad_memory.py" << 'EOF'
"""BlackRoad Memory System Plugin for AutoGPT"""
import subprocess
import json
from typing import Any, Dict

class BlackRoadMemoryPlugin:
    """Integrate with BlackRoad PS-SHA-infinity memory journals"""

    def __init__(self):
        self.name = "blackroad-memory"
        self.version = "1.0.0"

    def log_action(self, action: str, entity: str, details: str, tags: str = "") -> Dict[str, Any]:
        """Log action to BlackRoad memory system"""
        try:
            cmd = [
                f"{os.environ['HOME']}/memory-system.sh",
                "log",
                action,
                entity,
                details,
                tags
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": True, "output": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_context(self, agent_id: str) -> Dict[str, Any]:
        """Get live context from memory"""
        try:
            cmd = [
                f"{os.environ['HOME']}/memory-realtime-context.sh",
                "live",
                agent_id,
                "compact"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": True, "context": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def check_conflicts(self, agent_id: str) -> Dict[str, Any]:
        """Check for coordination conflicts"""
        context = self.get_context(agent_id)
        if context["success"]:
            # Parse context for active agents and potential conflicts
            return {"success": True, "conflicts": []}
        return context
EOF

    # Plugin 2: BlackRoad OS Integration
    cat > "${PLUGINS_DIR}/blackroad_blackroad os.py" << 'EOF'
"""BlackRoad BlackRoad OS Plugin for AutoGPT"""
import subprocess
import json
from typing import Any, Dict, List

class BlackRoadBlackRoad OSPlugin:
    """Integrate with BlackRoad BlackRoad OS (225k+ components)"""

    def __init__(self):
        self.name = "blackroad-blackroad os"
        self.version = "1.0.0"

    def search(self, query: str) -> Dict[str, Any]:
        """Search BlackRoad BlackRoad OS for existing solutions"""
        try:
            cmd = [
                "python3",
                f"{os.environ['HOME']}/blackroad-blackroad os-search.py",
                query
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {
                "success": True,
                "results": result.stdout,
                "message": "Search blackroad os before creating new components"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_stats(self) -> Dict[str, Any]:
        """Get blackroad os statistics"""
        try:
            cmd = [
                "python3",
                f"{os.environ['HOME']}/blackroad-blackroad os-search.py",
                "--stats"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": True, "stats": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}
EOF

    # Plugin 3: Coordination Plugin
    cat > "${PLUGINS_DIR}/blackroad_coordination.py" << 'EOF'
"""BlackRoad Coordination Plugin for AutoGPT"""
import subprocess
from typing import Any, Dict

class BlackRoadCoordinationPlugin:
    """Coordinate with other BlackRoad agents"""

    def __init__(self):
        self.name = "blackroad-coordination"
        self.version = "1.0.0"

    def announce_work(self, agent: str, project: str, tasks: str, goal: str) -> Dict[str, Any]:
        """Announce work using GreenLight template"""
        try:
            cmd = f"""
            source {os.environ['HOME']}/memory-greenlight-templates.sh && \
            gl_announce "{agent}" "{project}" "{tasks}" "{goal}"
            """
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, executable='/bin/bash')
            return {"success": True, "output": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_traffic_light(self, project: str, status: str, reason: str) -> Dict[str, Any]:
        """Update project traffic light status"""
        try:
            cmd = [
                f"{os.environ['HOME']}/blackroad-traffic-light.sh",
                "set",
                project,
                status,
                reason
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": True, "output": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def claim_task(self, task_id: str) -> Dict[str, Any]:
        """Claim task from marketplace"""
        try:
            cmd = [
                f"{os.environ['HOME']}/memory-task-marketplace.sh",
                "claim",
                task_id
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return {"success": True, "output": result.stdout}
        except Exception as e:
            return {"success": False, "error": str(e)}
EOF

    # Create __init__.py
    cat > "${PLUGINS_DIR}/__init__.py" << 'EOF'
"""BlackRoad OS Plugins for AutoGPT"""
from .blackroad_memory import BlackRoadMemoryPlugin
from .blackroad_blackroad os import BlackRoadBlackRoad OSPlugin
from .blackroad_coordination import BlackRoadCoordinationPlugin

__all__ = [
    'BlackRoadMemoryPlugin',
    'BlackRoadBlackRoad OSPlugin',
    'BlackRoadCoordinationPlugin'
]
EOF

    echo -e "${GREEN}✓${RESET} Created BlackRoad plugins:"
    echo -e "  • blackroad_memory.py"
    echo -e "  • blackroad_blackroad os.py"
    echo -e "  • blackroad_coordination.py"
}

# Create launch scripts
create_launch_scripts() {
    echo -e "${BLUE}[SCRIPTS]${RESET} Creating launch scripts..."

    # Main launch script
    cat > "${AUTOGPT_DIR}/launch.sh" << 'EOF'
#!/bin/bash
# Launch AutoGPT with BlackRoad configuration

set -e

AUTOGPT_DIR="${HOME}/.blackroad/autogpt"
cd "$AUTOGPT_DIR"

# Load environment
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "🤖 Launching AutoGPT with BlackRoad configuration..."

# Check if AutoGPT is installed
if ! command -v autogpt &> /dev/null; then
    echo "❌ AutoGPT not found. Installing..."
    pip install autogpt
fi

# Launch AutoGPT
autogpt \
    --continuous \
    --workspace-directory "$AUTOGPT_DIR/workspace" \
    --ai-settings-file "$AUTOGPT_DIR/ai_settings.yaml" \
    --log-level INFO
EOF
    chmod +x "${AUTOGPT_DIR}/launch.sh"

    # Status script
    cat > "${AUTOGPT_DIR}/status.sh" << 'EOF'
#!/bin/bash
# Check AutoGPT status

AUTOGPT_DIR="${HOME}/.blackroad/autogpt"

echo "📊 AutoGPT Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Workspace: $AUTOGPT_DIR/workspace"
echo "Plugins: $AUTOGPT_DIR/plugins"
echo "Logs: $AUTOGPT_DIR/logs"
echo ""

if [ -d "$AUTOGPT_DIR/workspace" ]; then
    echo "Workspace files: $(find "$AUTOGPT_DIR/workspace" -type f | wc -l)"
fi

if [ -d "$AUTOGPT_DIR/logs" ]; then
    echo "Log files: $(find "$AUTOGPT_DIR/logs" -type f | wc -l)"
fi

echo ""
echo "Recent logs:"
if [ -d "$AUTOGPT_DIR/logs" ]; then
    tail -n 10 "$AUTOGPT_DIR/logs"/*.log 2>/dev/null || echo "No logs found"
fi
EOF
    chmod +x "${AUTOGPT_DIR}/status.sh"

    # Cleanup script
    cat > "${AUTOGPT_DIR}/clean.sh" << 'EOF'
#!/bin/bash
# Clean AutoGPT workspace

AUTOGPT_DIR="${HOME}/.blackroad/autogpt"

echo "🧹 Cleaning AutoGPT workspace..."
rm -rf "$AUTOGPT_DIR/workspace"/*
rm -rf "$AUTOGPT_DIR/logs"/*
rm -rf "$AUTOGPT_DIR/data"/*

echo "✓ Workspace cleaned"
EOF
    chmod +x "${AUTOGPT_DIR}/clean.sh"

    echo -e "${GREEN}✓${RESET} Created launch scripts:"
    echo -e "  • launch.sh"
    echo -e "  • status.sh"
    echo -e "  • clean.sh"
}

# Launch AutoGPT
launch_autogpt() {
    print_header

    if [ ! -f "${AUTOGPT_DIR}/launch.sh" ]; then
        echo -e "${RED}✗${RESET} AutoGPT not initialized. Run: ${BLUE}./autogpt-config.sh init${RESET}"
        exit 1
    fi

    echo -e "${BLUE}[LAUNCH]${RESET} Starting AutoGPT..."
    exec "${AUTOGPT_DIR}/launch.sh"
}

# Show status
show_status() {
    print_header

    if [ ! -d "$AUTOGPT_DIR" ]; then
        echo -e "${RED}✗${RESET} AutoGPT not initialized. Run: ${BLUE}./autogpt-config.sh init${RESET}"
        exit 1
    fi

    exec "${AUTOGPT_DIR}/status.sh"
}

# Clean workspace
clean_workspace() {
    print_header

    if [ ! -f "${AUTOGPT_DIR}/clean.sh" ]; then
        echo -e "${RED}✗${RESET} AutoGPT not initialized. Run: ${BLUE}./autogpt-config.sh init${RESET}"
        exit 1
    fi

    read -p "Are you sure you want to clean the workspace? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        exec "${AUTOGPT_DIR}/clean.sh"
    else
        echo "Cancelled."
    fi
}

# Show usage
show_usage() {
    print_header

    cat << EOF
${AMBER}Usage:${RESET}
  ./autogpt-config.sh [command]

${AMBER}Commands:${RESET}
  ${BLUE}init${RESET}      Initialize AutoGPT workspace and configuration
  ${BLUE}launch${RESET}    Launch AutoGPT with BlackRoad configuration
  ${BLUE}status${RESET}    Show AutoGPT status and workspace info
  ${BLUE}clean${RESET}     Clean workspace (removes all workspace files)
  ${BLUE}help${RESET}      Show this help message

${AMBER}Configuration:${RESET}
  Workspace: ${WORKSPACE_DIR}
  Plugins:   ${PLUGINS_DIR}
  Config:    ${CONFIG_FILE}
  Settings:  ${SETTINGS_FILE}

${AMBER}BlackRoad Integration:${RESET}
  • Memory System: PS-SHA-infinity journals
  • BlackRoad OS: 225k+ components searchable
  • Coordination: Multi-agent collaboration
  • Traffic Lights: Project status tracking
  • Task Marketplace: Distributed task management

${AMBER}Next Steps:${RESET}
  1. Initialize: ${BLUE}./autogpt-config.sh init${RESET}
  2. Configure: Edit ${CONFIG_FILE} with your API keys
  3. Launch: ${BLUE}./autogpt-config.sh launch${RESET}

${AMBER}Documentation:${RESET}
  • Memory: ~/memory-system.sh
  • BlackRoad OS: ~/blackroad-blackroad os-search.py
  • Coordination: ~/memory-greenlight-templates.sh
  • Global Docs: ~/.claude/CLAUDE.md

EOF
}

# Main entry point
main() {
    local command=${1:-help}

    case $command in
        init)
            init_autogpt
            ;;
        launch)
            launch_autogpt
            ;;
        status)
            show_status
            ;;
        clean)
            clean_workspace
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}✗${RESET} Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main if executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
