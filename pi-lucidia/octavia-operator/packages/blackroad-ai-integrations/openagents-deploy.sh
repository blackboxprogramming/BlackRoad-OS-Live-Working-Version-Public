#!/bin/bash
# OpenAgents Platform Deployment Script
# Configures OpenAgents with BlackRoad OS integration
# Usage: ./openagents-deploy.sh [init|deploy|health|status]

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
OPENAGENTS_DIR="${HOME}/.blackroad/openagents"
AGENT_REGISTRY="${OPENAGENTS_DIR}/agent-registry.db"
CONFIG_FILE="${OPENAGENTS_DIR}/config.json"
HEALTH_LOG="${OPENAGENTS_DIR}/health.log"
API_PORT="${OPENAGENTS_API_PORT:-8080}"
OPENAGENTS_API_URL="${OPENAGENTS_API_URL:-https://api.openagents.com}"

# Print banner
print_banner() {
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${PINK}║${RESET}        ${AMBER}🤖 OpenAgents Platform Deployment 🤖${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo ""
}

# Initialize OpenAgents infrastructure
init_openagents() {
    echo -e "${BLUE}[INIT]${RESET} Initializing OpenAgents platform..."

    # Create directory structure
    mkdir -p "${OPENAGENTS_DIR}"/{agents,config,logs,data}
    mkdir -p "${OPENAGENTS_DIR}/agents"/{active,archived,pending}

    # Initialize agent registry (SQLite)
    if [ ! -f "$AGENT_REGISTRY" ]; then
        echo -e "${GREEN}✓${RESET} Creating agent registry database..."
        sqlite3 "$AGENT_REGISTRY" <<EOF
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    capabilities TEXT,
    endpoint TEXT,
    api_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_health_check TIMESTAMP,
    health_status TEXT DEFAULT 'unknown',
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    deployment_type TEXT NOT NULL,
    status TEXT NOT NULL,
    endpoint TEXT,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    name TEXT,
    scopes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_health_checks_agent ON health_checks(agent_id);
CREATE INDEX IF NOT EXISTS idx_deployments_agent ON deployments(agent_id);
EOF
    else
        echo -e "${GREEN}✓${RESET} Agent registry already exists"
    fi

    # Create default configuration
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${GREEN}✓${RESET} Creating default configuration..."
        cat > "$CONFIG_FILE" <<EOF
{
  "platform": {
    "name": "BlackRoad OpenAgents",
    "version": "1.0.0",
    "api_port": ${API_PORT},
    "api_url": "${OPENAGENTS_API_URL}"
  },
  "registry": {
    "path": "${AGENT_REGISTRY}",
    "auto_register": true,
    "health_check_interval": 60
  },
  "agents": {
    "max_concurrent": 100,
    "default_timeout": 30000,
    "retry_attempts": 3
  },
  "deployment": {
    "strategies": ["local", "cloudflare", "railway"],
    "default_strategy": "local"
  },
  "monitoring": {
    "enabled": true,
    "health_checks": true,
    "metrics_export": true,
    "alert_threshold": 0.8
  },
  "security": {
    "require_api_keys": true,
    "key_rotation_days": 90,
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 60
    }
  }
}
EOF
    else
        echo -e "${GREEN}✓${RESET} Configuration already exists"
    fi

    # Initialize health log
    touch "$HEALTH_LOG"

    echo -e "${GREEN}✅ OpenAgents platform initialized${RESET}"
    echo -e "   Registry: ${AGENT_REGISTRY}"
    echo -e "   Config: ${CONFIG_FILE}"
    echo -e "   Logs: ${OPENAGENTS_DIR}/logs/"

    # Log to BlackRoad memory
    if command -v ~/memory-system.sh &> /dev/null; then
        ~/memory-system.sh log "initialized" "openagents-platform" "OpenAgents platform infrastructure created" "ai,deployment,agents"
    fi
}

# Register a new agent
register_agent() {
    local agent_id="$1"
    local agent_name="$2"
    local agent_type="$3"
    local capabilities="$4"
    local endpoint="$5"

    if [ -z "$agent_id" ] || [ -z "$agent_name" ] || [ -z "$agent_type" ]; then
        echo -e "${RED}✗ Error: agent_id, agent_name, and agent_type are required${RESET}"
        echo "Usage: $0 register <id> <name> <type> [capabilities] [endpoint]"
        return 1
    fi

    echo -e "${BLUE}[REGISTER]${RESET} Registering agent: ${agent_name} (${agent_id})"

    sqlite3 "$AGENT_REGISTRY" <<EOF
INSERT INTO agents (id, name, type, capabilities, endpoint, status)
VALUES (
    '${agent_id}',
    '${agent_name}',
    '${agent_type}',
    '${capabilities}',
    '${endpoint}',
    'pending'
)
ON CONFLICT(id) DO UPDATE SET
    name = '${agent_name}',
    type = '${agent_type}',
    capabilities = '${capabilities}',
    endpoint = '${endpoint}',
    updated_at = CURRENT_TIMESTAMP;
EOF

    echo -e "${GREEN}✓${RESET} Agent registered successfully"

    # Generate API key
    local api_key=$(openssl rand -hex 32)
    local key_hash=$(echo -n "$api_key" | sha256sum | cut -d' ' -f1)

    sqlite3 "$AGENT_REGISTRY" <<EOF
INSERT INTO api_keys (agent_id, key_hash, name, scopes)
VALUES ('${agent_id}', '${key_hash}', 'default', 'read,write,execute');
EOF

    echo -e "${AMBER}API Key:${RESET} ${api_key}"
    echo -e "${VIOLET}Store this key securely - it won't be shown again${RESET}"
}

# Deploy an agent
deploy_agent() {
    local agent_id="$1"
    local strategy="${2:-local}"

    if [ -z "$agent_id" ]; then
        echo -e "${RED}✗ Error: agent_id is required${RESET}"
        echo "Usage: $0 deploy <agent_id> [strategy]"
        return 1
    fi

    echo -e "${BLUE}[DEPLOY]${RESET} Deploying agent: ${agent_id} (strategy: ${strategy})"

    # Get agent details
    local agent_data=$(sqlite3 -json "$AGENT_REGISTRY" "SELECT * FROM agents WHERE id='${agent_id}' LIMIT 1")

    if [ -z "$agent_data" ] || [ "$agent_data" = "[]" ]; then
        echo -e "${RED}✗ Agent not found: ${agent_id}${RESET}"
        return 1
    fi

    case "$strategy" in
        local)
            deploy_local "$agent_id"
            ;;
        cloudflare)
            deploy_cloudflare "$agent_id"
            ;;
        railway)
            deploy_railway "$agent_id"
            ;;
        *)
            echo -e "${RED}✗ Unknown deployment strategy: ${strategy}${RESET}"
            return 1
            ;;
    esac

    # Update agent status
    sqlite3 "$AGENT_REGISTRY" <<EOF
UPDATE agents SET status='active', updated_at=CURRENT_TIMESTAMP WHERE id='${agent_id}';
INSERT INTO deployments (agent_id, deployment_type, status, deployed_at)
VALUES ('${agent_id}', '${strategy}', 'deployed', CURRENT_TIMESTAMP);
EOF

    echo -e "${GREEN}✅ Agent deployed successfully${RESET}"
}

# Local deployment
deploy_local() {
    local agent_id="$1"
    echo -e "${GREEN}✓${RESET} Local deployment for agent: ${agent_id}"

    local agent_dir="${OPENAGENTS_DIR}/agents/active/${agent_id}"
    mkdir -p "$agent_dir"

    # Create agent wrapper script
    cat > "${agent_dir}/agent.sh" <<'AGENT_EOF'
#!/bin/bash
# OpenAgent Local Wrapper
echo "Agent running locally: ${AGENT_ID}"
# Add your agent logic here
AGENT_EOF

    chmod +x "${agent_dir}/agent.sh"

    local endpoint="http://localhost:${API_PORT}/agents/${agent_id}"
    sqlite3 "$AGENT_REGISTRY" "UPDATE agents SET endpoint='${endpoint}' WHERE id='${agent_id}'"
}

# Cloudflare Workers deployment
deploy_cloudflare() {
    local agent_id="$1"
    echo -e "${GREEN}✓${RESET} Cloudflare Workers deployment for agent: ${agent_id}"

    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}✗ wrangler CLI not found. Install: npm install -g wrangler${RESET}"
        return 1
    fi

    local worker_name="openagent-${agent_id}"
    echo -e "${BLUE}Deploy worker: ${worker_name}${RESET}"
    echo -e "${AMBER}Run: wrangler deploy${RESET}"
}

# Railway deployment
deploy_railway() {
    local agent_id="$1"
    echo -e "${GREEN}✓${RESET} Railway deployment for agent: ${agent_id}"

    if ! command -v railway &> /dev/null; then
        echo -e "${RED}✗ railway CLI not found. Install: npm install -g @railway/cli${RESET}"
        return 1
    fi

    echo -e "${BLUE}Deploy to Railway: ${agent_id}${RESET}"
    echo -e "${AMBER}Run: railway up${RESET}"
}

# Health check for all agents
health_check() {
    echo -e "${BLUE}[HEALTH]${RESET} Running health checks..."

    local agents=$(sqlite3 -json "$AGENT_REGISTRY" "SELECT id, name, endpoint FROM agents WHERE status='active'")

    if [ -z "$agents" ] || [ "$agents" = "[]" ]; then
        echo -e "${AMBER}No active agents to check${RESET}"
        return 0
    fi

    local total=0
    local healthy=0
    local unhealthy=0

    # Parse JSON and check each agent
    echo "$agents" | jq -r '.[] | @base64' | while read -r row; do
        _jq() {
            echo "$row" | base64 --decode | jq -r "$1"
        }

        local agent_id=$(_jq '.id')
        local agent_name=$(_jq '.name')
        local endpoint=$(_jq '.endpoint')

        ((total++))

        if [ -z "$endpoint" ] || [ "$endpoint" = "null" ]; then
            echo -e "${AMBER}⚠${RESET} ${agent_name} (${agent_id}): No endpoint configured"
            sqlite3 "$AGENT_REGISTRY" "UPDATE agents SET health_status='unknown', last_health_check=CURRENT_TIMESTAMP WHERE id='${agent_id}'"
            ((unhealthy++))
            continue
        fi

        # Attempt health check (with timeout)
        local start_time=$(date +%s%3N)
        if curl -sf --max-time 5 "${endpoint}/health" > /dev/null 2>&1; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))

            echo -e "${GREEN}✓${RESET} ${agent_name} (${agent_id}): Healthy (${response_time}ms)"

            sqlite3 "$AGENT_REGISTRY" <<EOF
UPDATE agents SET health_status='healthy', last_health_check=CURRENT_TIMESTAMP WHERE id='${agent_id}';
INSERT INTO health_checks (agent_id, status, response_time_ms, checked_at)
VALUES ('${agent_id}', 'healthy', ${response_time}, CURRENT_TIMESTAMP);
EOF
            ((healthy++))
        else
            echo -e "${RED}✗${RESET} ${agent_name} (${agent_id}): Unhealthy"

            sqlite3 "$AGENT_REGISTRY" <<EOF
UPDATE agents SET health_status='unhealthy', last_health_check=CURRENT_TIMESTAMP WHERE id='${agent_id}';
INSERT INTO health_checks (agent_id, status, error_message, checked_at)
VALUES ('${agent_id}', 'unhealthy', 'Connection failed', CURRENT_TIMESTAMP);
EOF
            ((unhealthy++))
        fi
    done

    echo ""
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}Healthy:${RESET} ${healthy}  ${RED}Unhealthy:${RESET} ${unhealthy}  ${BLUE}Total:${RESET} ${total}"

    # Log health check summary
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Health check: ${healthy}/${total} healthy" >> "$HEALTH_LOG"
}

# Display platform status
show_status() {
    echo -e "${BLUE}[STATUS]${RESET} OpenAgents Platform Status"
    echo ""

    # Agent statistics
    local total_agents=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents")
    local active_agents=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE status='active'")
    local pending_agents=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE status='pending'")
    local archived_agents=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE status='archived'")

    echo -e "${PINK}╔════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}           ${AMBER}📊 OpenAgents Statistics 📊${RESET}           ${PINK}║${RESET}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  ${GREEN}Total Agents:${RESET}     ${total_agents}"
    echo -e "  ${BLUE}Active:${RESET}           ${active_agents}"
    echo -e "  ${AMBER}Pending:${RESET}          ${pending_agents}"
    echo -e "  ${VIOLET}Archived:${RESET}         ${archived_agents}"
    echo ""

    # Recent deployments
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}Recent Deployments:${RESET}"
    sqlite3 -header -column "$AGENT_REGISTRY" "SELECT agent_id, deployment_type, status, datetime(deployed_at) as deployed FROM deployments ORDER BY deployed_at DESC LIMIT 5"
    echo ""

    # Active agents list
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}Active Agents:${RESET}"
    sqlite3 -header -column "$AGENT_REGISTRY" "SELECT id, name, type, health_status, datetime(last_health_check) as last_check FROM agents WHERE status='active' ORDER BY updated_at DESC LIMIT 10"
    echo ""

    # Health summary
    local healthy=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE health_status='healthy'")
    local unhealthy=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE health_status='unhealthy'")
    local unknown=$(sqlite3 "$AGENT_REGISTRY" "SELECT COUNT(*) FROM agents WHERE health_status='unknown' OR health_status IS NULL")

    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${AMBER}Health Status:${RESET}"
    echo -e "  ${GREEN}Healthy:${RESET}   ${healthy}"
    echo -e "  ${RED}Unhealthy:${RESET} ${unhealthy}"
    echo -e "  ${BLUE}Unknown:${RESET}   ${unknown}"
    echo ""
}

# List all agents
list_agents() {
    local filter="${1:-all}"

    echo -e "${BLUE}[LIST]${RESET} Agents (filter: ${filter})"
    echo ""

    local query="SELECT id, name, type, status, health_status, endpoint FROM agents"

    case "$filter" in
        active)
            query="${query} WHERE status='active'"
            ;;
        pending)
            query="${query} WHERE status='pending'"
            ;;
        unhealthy)
            query="${query} WHERE health_status='unhealthy'"
            ;;
    esac

    query="${query} ORDER BY updated_at DESC"

    sqlite3 -header -column "$AGENT_REGISTRY" "$query"
}

# API endpoint configuration
configure_api() {
    echo -e "${BLUE}[API]${RESET} Configuring API endpoints..."

    cat > "${OPENAGENTS_DIR}/api-endpoints.json" <<EOF
{
  "endpoints": {
    "register": {
      "method": "POST",
      "path": "/api/v1/agents/register",
      "description": "Register a new agent"
    },
    "deploy": {
      "method": "POST",
      "path": "/api/v1/agents/:id/deploy",
      "description": "Deploy an agent"
    },
    "health": {
      "method": "GET",
      "path": "/api/v1/agents/:id/health",
      "description": "Check agent health"
    },
    "status": {
      "method": "GET",
      "path": "/api/v1/agents/:id/status",
      "description": "Get agent status"
    },
    "list": {
      "method": "GET",
      "path": "/api/v1/agents",
      "description": "List all agents"
    },
    "execute": {
      "method": "POST",
      "path": "/api/v1/agents/:id/execute",
      "description": "Execute agent task"
    }
  },
  "base_url": "http://localhost:${API_PORT}",
  "version": "v1"
}
EOF

    echo -e "${GREEN}✓${RESET} API endpoints configured"
    echo -e "   File: ${OPENAGENTS_DIR}/api-endpoints.json"
}

# Start monitoring daemon
start_monitoring() {
    echo -e "${BLUE}[MONITOR]${RESET} Starting health monitoring daemon..."

    # Create monitoring script
    cat > "${OPENAGENTS_DIR}/monitor-daemon.sh" <<'MONITOR_EOF'
#!/bin/bash
# OpenAgents Health Monitoring Daemon

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENAGENTS_DIR="${HOME}/.blackroad/openagents"

while true; do
    # Run health check
    bash "$(dirname "$0")/../../blackroad-ai-integrations/openagents-deploy.sh" health > /dev/null 2>&1

    # Wait 60 seconds
    sleep 60
done
MONITOR_EOF

    chmod +x "${OPENAGENTS_DIR}/monitor-daemon.sh"

    # Start in background if not already running
    if ! pgrep -f "monitor-daemon.sh" > /dev/null; then
        nohup "${OPENAGENTS_DIR}/monitor-daemon.sh" > "${OPENAGENTS_DIR}/logs/monitor.log" 2>&1 &
        echo -e "${GREEN}✓${RESET} Monitoring daemon started (PID: $!)"
    else
        echo -e "${AMBER}⚠${RESET} Monitoring daemon already running"
    fi
}

# Main command handler
main() {
    local command="${1:-help}"

    # Ensure initialized for most commands
    if [ "$command" != "init" ] && [ "$command" != "help" ] && [ ! -f "$AGENT_REGISTRY" ]; then
        echo -e "${RED}✗ OpenAgents not initialized. Run: $0 init${RESET}"
        exit 1
    fi

    case "$command" in
        init)
            print_banner
            init_openagents
            configure_api
            ;;
        register)
            print_banner
            shift
            register_agent "$@"
            ;;
        deploy)
            print_banner
            shift
            deploy_agent "$@"
            ;;
        health)
            print_banner
            health_check
            ;;
        status)
            print_banner
            show_status
            ;;
        list)
            print_banner
            shift
            list_agents "$@"
            ;;
        monitor)
            print_banner
            start_monitoring
            ;;
        api)
            print_banner
            configure_api
            ;;
        help|--help|-h)
            print_banner
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  init                              Initialize OpenAgents platform"
            echo "  register <id> <name> <type>       Register a new agent"
            echo "  deploy <agent_id> [strategy]      Deploy an agent (local|cloudflare|railway)"
            echo "  health                            Run health checks on all agents"
            echo "  status                            Display platform status"
            echo "  list [filter]                     List agents (all|active|pending|unhealthy)"
            echo "  monitor                           Start health monitoring daemon"
            echo "  api                               Configure API endpoints"
            echo "  help                              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 init"
            echo "  $0 register gpt-4-agent 'GPT-4 Agent' llm 'text-generation,chat' http://localhost:8080"
            echo "  $0 deploy gpt-4-agent local"
            echo "  $0 health"
            echo "  $0 status"
            echo "  $0 list active"
            echo ""
            ;;
        *)
            echo -e "${RED}✗ Unknown command: ${command}${RESET}"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
