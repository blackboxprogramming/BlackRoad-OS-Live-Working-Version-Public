#!/bin/bash
# MetaGPT Setup Script for BlackRoad OS
# Description: Configure MetaGPT multi-agent collaborative framework
# Usage: ./metagpt-setup.sh [init|create|status|run]

set -e

# BlackRoad Brand Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Configuration
METAGPT_HOME="$HOME/.metagpt"
WORKSPACE_DIR="$HOME/metagpt-workspace"
CONFIG_FILE="$METAGPT_HOME/config.yaml"
ROLES_DIR="$METAGPT_HOME/roles"
PROJECTS_DIR="$WORKSPACE_DIR/projects"

# Display banner
banner() {
    echo -e "${PINK}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  MetaGPT Setup                           ║"
    echo "║           Multi-Agent Collaborative Framework            ║"
    echo "║                   BlackRoad OS                           ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
}

# Initialize MetaGPT environment
init_metagpt() {
    echo -e "${BLUE}[INFO]${RESET} Initializing MetaGPT environment..."

    # Create directory structure
    mkdir -p "$METAGPT_HOME"
    mkdir -p "$ROLES_DIR"
    mkdir -p "$WORKSPACE_DIR"
    mkdir -p "$PROJECTS_DIR"
    mkdir -p "$METAGPT_HOME/logs"
    mkdir -p "$METAGPT_HOME/outputs"

    echo -e "${GREEN}[SUCCESS]${RESET} Directory structure created"

    # Check if MetaGPT is installed
    if ! python3 -c "import metagpt" 2>/dev/null; then
        echo -e "${AMBER}[WARN]${RESET} MetaGPT not installed. Installing..."
        pip3 install metagpt --quiet
        echo -e "${GREEN}[SUCCESS]${RESET} MetaGPT installed"
    else
        echo -e "${GREEN}[SUCCESS]${RESET} MetaGPT already installed"
    fi

    # Create configuration file
    create_config

    # Create role definitions
    create_roles

    echo -e "${GREEN}[SUCCESS]${RESET} MetaGPT initialization complete"
    echo -e "${BLUE}[INFO]${RESET} Configuration: $CONFIG_FILE"
    echo -e "${BLUE}[INFO]${RESET} Workspace: $WORKSPACE_DIR"
}

# Create MetaGPT configuration
create_config() {
    echo -e "${BLUE}[INFO]${RESET} Creating configuration file..."

    cat > "$CONFIG_FILE" <<'EOF'
# MetaGPT Configuration for BlackRoad OS
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# LLM Configuration
llm:
  api_type: "openai"  # or "anthropic", "azure", "ollama"
  model: "gpt-4"      # or "claude-3-opus", "gpt-3.5-turbo"
  temperature: 0.7
  max_tokens: 4000
  timeout: 60

# Workspace Configuration
workspace:
  path: "$WORKSPACE_DIR"
  use_git: true
  auto_archive: true
  max_projects: 50

# Agent Configuration
agents:
  max_concurrent: 5
  timeout: 300
  retry_limit: 3

# Role Configuration
roles:
  product_manager:
    enabled: true
    max_iterations: 3
  architect:
    enabled: true
    design_patterns: ["microservices", "event-driven", "layered"]
  project_manager:
    enabled: true
  engineer:
    enabled: true
    languages: ["python", "javascript", "typescript", "go", "rust"]
  qa_engineer:
    enabled: true
    test_types: ["unit", "integration", "e2e"]

# Output Configuration
output:
  format: "markdown"
  include_diagrams: true
  include_code: true
  include_tests: true

# Logging
logging:
  level: "INFO"
  file: "$METAGPT_HOME/logs/metagpt.log"
  max_size: "10MB"
  backup_count: 5

# BlackRoad Integration
blackroad:
  memory_integration: true
  blackroad os_integration: true
  traffic_light_updates: true
EOF

    echo -e "${GREEN}[SUCCESS]${RESET} Configuration file created: $CONFIG_FILE"
}

# Create role definitions
create_roles() {
    echo -e "${BLUE}[INFO]${RESET} Creating role definitions..."

    # Product Manager Role
    cat > "$ROLES_DIR/product_manager.py" <<'EOF'
"""
Product Manager Role for MetaGPT
Handles requirement analysis and PRD creation
"""

from metagpt.roles import Role
from metagpt.actions import UserRequirement, WritePRD

class ProductManager(Role):
    """Product Manager role for analyzing requirements and creating PRDs"""

    def __init__(self, name="Alice", profile="Product Manager", **kwargs):
        super().__init__(name, profile, **kwargs)
        self._init_actions([WritePRD])
        self._watch([UserRequirement])

    async def _think(self):
        """Think about what to do next"""
        if self.rc.todo is None:
            self._set_state(0)
            return True

        if self.rc.state + 1 < len(self.states):
            self._set_state(self.rc.state + 1)
        else:
            self.rc.todo = None
        return False

    async def _act(self):
        """Execute the current action"""
        logger.info(f"{self._setting}: ready to {self.rc.todo}")
        todo = self.rc.todo

        msg = self.get_memories(k=1)[0]
        result = await todo.run(msg.content)

        msg = Message(content=result, role=self.profile, cause_by=type(todo))
        self.rc.memory.add(msg)
        return msg
EOF

    # Architect Role
    cat > "$ROLES_DIR/architect.py" <<'EOF'
"""
Architect Role for MetaGPT
Handles system design and architecture
"""

from metagpt.roles import Role
from metagpt.actions import WritePRD, WriteDesign

class Architect(Role):
    """Architect role for creating system designs"""

    def __init__(self, name="Bob", profile="Architect", **kwargs):
        super().__init__(name, profile, **kwargs)
        self._init_actions([WriteDesign])
        self._watch([WritePRD])

    async def _think(self):
        """Think about design patterns and architecture"""
        if self.rc.todo is None:
            self._set_state(0)
            return True

        if self.rc.state + 1 < len(self.states):
            self._set_state(self.rc.state + 1)
        else:
            self.rc.todo = None
        return False

    async def _act(self):
        """Create system design documents"""
        logger.info(f"{self._setting}: ready to {self.rc.todo}")
        todo = self.rc.todo

        msg = self.get_memories(k=1)[0]
        result = await todo.run(msg.content)

        msg = Message(content=result, role=self.profile, cause_by=type(todo))
        self.rc.memory.add(msg)
        return msg
EOF

    # Engineer Role
    cat > "$ROLES_DIR/engineer.py" <<'EOF'
"""
Engineer Role for MetaGPT
Handles code implementation
"""

from metagpt.roles import Role
from metagpt.actions import WriteDesign, WriteCode, WriteCodeReview

class Engineer(Role):
    """Engineer role for writing and reviewing code"""

    def __init__(self, name="Charlie", profile="Engineer", **kwargs):
        super().__init__(name, profile, **kwargs)
        self._init_actions([WriteCode, WriteCodeReview])
        self._watch([WriteDesign])

    async def _think(self):
        """Think about implementation approach"""
        if self.rc.todo is None:
            self._set_state(0)
            return True

        if self.rc.state + 1 < len(self.states):
            self._set_state(self.rc.state + 1)
        else:
            self.rc.todo = None
        return False

    async def _act(self):
        """Write code based on design"""
        logger.info(f"{self._setting}: ready to {self.rc.todo}")
        todo = self.rc.todo

        msg = self.get_memories(k=1)[0]
        result = await todo.run(msg.content)

        msg = Message(content=result, role=self.profile, cause_by=type(todo))
        self.rc.memory.add(msg)
        return msg
EOF

    # QA Engineer Role
    cat > "$ROLES_DIR/qa_engineer.py" <<'EOF'
"""
QA Engineer Role for MetaGPT
Handles testing and quality assurance
"""

from metagpt.roles import Role
from metagpt.actions import WriteCode, WriteTest

class QAEngineer(Role):
    """QA Engineer role for writing tests"""

    def __init__(self, name="Diana", profile="QA Engineer", **kwargs):
        super().__init__(name, profile, **kwargs)
        self._init_actions([WriteTest])
        self._watch([WriteCode])

    async def _think(self):
        """Think about test coverage"""
        if self.rc.todo is None:
            self._set_state(0)
            return True

        if self.rc.state + 1 < len(self.states):
            self._set_state(self.rc.state + 1)
        else:
            self.rc.todo = None
        return False

    async def _act(self):
        """Create comprehensive tests"""
        logger.info(f"{self._setting}: ready to {self.rc.todo}")
        todo = self.rc.todo

        msg = self.get_memories(k=1)[0]
        result = await todo.run(msg.content)

        msg = Message(content=result, role=self.profile, cause_by=type(todo))
        self.rc.memory.add(msg)
        return msg
EOF

    echo -e "${GREEN}[SUCCESS]${RESET} Role definitions created in $ROLES_DIR"
}

# Create a new project
create_project() {
    local project_name="$1"
    local description="$2"

    if [[ -z "$project_name" ]]; then
        echo -e "${RED}[ERROR]${RESET} Project name required"
        echo "Usage: $0 create <project-name> <description>"
        return 1
    fi

    local project_dir="$PROJECTS_DIR/$project_name"

    if [[ -d "$project_dir" ]]; then
        echo -e "${RED}[ERROR]${RESET} Project already exists: $project_name"
        return 1
    fi

    echo -e "${BLUE}[INFO]${RESET} Creating project: $project_name"

    mkdir -p "$project_dir"/{docs,src,tests,outputs}

    # Create project metadata
    cat > "$project_dir/project.yaml" <<EOF
name: $project_name
description: ${description:-"No description provided"}
created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
status: initialized
team:
  - role: ProductManager
    name: Alice
  - role: Architect
    name: Bob
  - role: Engineer
    name: Charlie
  - role: QAEngineer
    name: Diana
EOF

    # Create run script
    cat > "$project_dir/run.py" <<'PYEOF'
#!/usr/bin/env python3
"""
MetaGPT Project Runner
Generated by BlackRoad OS
"""

import asyncio
from metagpt.team import Team
from metagpt.roles import ProductManager, Architect, Engineer, QAEngineer

async def main(idea: str):
    """Run the MetaGPT team"""
    team = Team()

    # Add team members
    team.hire([
        ProductManager(),
        Architect(),
        Engineer(),
        QAEngineer(),
    ])

    # Invest in the project
    team.invest(investment=3.0)

    # Run the team
    team.run_project(idea)
    await team.run(n_round=5)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python run.py '<project idea>'")
        sys.exit(1)

    idea = " ".join(sys.argv[1:])
    asyncio.run(main(idea))
PYEOF

    chmod +x "$project_dir/run.py"

    echo -e "${GREEN}[SUCCESS]${RESET} Project created: $project_dir"
    echo -e "${BLUE}[INFO]${RESET} Run with: cd $project_dir && python run.py '<your idea>'"

    # Log to memory
    if command -v ~/memory-system.sh &> /dev/null; then
        ~/memory-system.sh log "created" "metagpt-project" "project=$project_name" "metagpt,ai-integration" 2>/dev/null || true
    fi
}

# Show status
show_status() {
    echo -e "${BLUE}[INFO]${RESET} MetaGPT Status"
    echo ""

    # Check installation
    if python3 -c "import metagpt" 2>/dev/null; then
        local version=$(python3 -c "import metagpt; print(metagpt.__version__)" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓${RESET} MetaGPT installed (version: $version)"
    else
        echo -e "${RED}✗${RESET} MetaGPT not installed"
    fi

    # Check configuration
    if [[ -f "$CONFIG_FILE" ]]; then
        echo -e "${GREEN}✓${RESET} Configuration exists: $CONFIG_FILE"
    else
        echo -e "${RED}✗${RESET} Configuration missing"
    fi

    # Check roles
    local role_count=$(find "$ROLES_DIR" -name "*.py" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${RESET} Roles defined: $role_count"

    # Check projects
    local project_count=$(find "$PROJECTS_DIR" -maxdepth 1 -type d 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${RESET} Projects created: $project_count"

    # List projects
    if [[ $project_count -gt 0 ]]; then
        echo ""
        echo -e "${VIOLET}Projects:${RESET}"
        for project in "$PROJECTS_DIR"/*; do
            if [[ -d "$project" ]]; then
                local name=$(basename "$project")
                local created=$(grep "created:" "$project/project.yaml" 2>/dev/null | cut -d' ' -f2- || echo "unknown")
                echo "  - $name (created: $created)"
            fi
        done
    fi
}

# Run a project
run_project() {
    local project_name="$1"
    local idea="$2"

    if [[ -z "$project_name" ]] || [[ -z "$idea" ]]; then
        echo -e "${RED}[ERROR]${RESET} Project name and idea required"
        echo "Usage: $0 run <project-name> '<idea>'"
        return 1
    fi

    local project_dir="$PROJECTS_DIR/$project_name"

    if [[ ! -d "$project_dir" ]]; then
        echo -e "${RED}[ERROR]${RESET} Project not found: $project_name"
        return 1
    fi

    echo -e "${BLUE}[INFO]${RESET} Running project: $project_name"
    echo -e "${BLUE}[INFO]${RESET} Idea: $idea"
    echo ""

    cd "$project_dir"
    python3 run.py "$idea"

    # Log to memory
    if command -v ~/memory-system.sh &> /dev/null; then
        ~/memory-system.sh log "executed" "metagpt-project" "project=$project_name idea='$idea'" "metagpt,ai-integration" 2>/dev/null || true
    fi
}

# Show usage
usage() {
    cat <<EOF
${PINK}MetaGPT Setup Script${RESET}

Usage: $0 <command> [options]

Commands:
  init                    Initialize MetaGPT environment
  create <name> [desc]    Create new project
  status                  Show MetaGPT status
  run <name> '<idea>'     Run a project
  help                    Show this help

Examples:
  $0 init
  $0 create my-app "Build a todo app"
  $0 status
  $0 run my-app 'Create a REST API for task management'

Environment:
  METAGPT_HOME     = $METAGPT_HOME
  WORKSPACE_DIR    = $WORKSPACE_DIR
  CONFIG_FILE      = $CONFIG_FILE

Roles:
  - ProductManager: Analyzes requirements, writes PRD
  - Architect: Designs system architecture
  - Engineer: Implements code
  - QAEngineer: Writes tests

Output Locations:
  - Logs: $METAGPT_HOME/logs/
  - Outputs: $METAGPT_HOME/outputs/
  - Projects: $PROJECTS_DIR/

EOF
}

# Main execution
main() {
    banner

    local command="${1:-help}"

    case "$command" in
        init)
            init_metagpt
            ;;
        create)
            create_project "$2" "$3"
            ;;
        status)
            show_status
            ;;
        run)
            run_project "$2" "$3"
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            echo -e "${RED}[ERROR]${RESET} Unknown command: $command"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
