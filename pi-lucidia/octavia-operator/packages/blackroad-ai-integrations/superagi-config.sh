#!/bin/bash
# SuperAGI Configuration Script
# Part of BlackRoad AI Infrastructure
# Usage: ./superagi-config.sh [init|deploy|monitor|status]

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
SUPERAGI_DIR="${SUPERAGI_DIR:-$HOME/superagi}"
SUPERAGI_CONFIG_DIR="$HOME/.blackroad/superagi"
SUPERAGI_DB_PATH="$SUPERAGI_CONFIG_DIR/superagi.db"
SUPERAGI_PORT="${SUPERAGI_PORT:-8000}"
SUPERAGI_API_PORT="${SUPERAGI_API_PORT:-8001}"

# Agent Templates Directory
AGENT_TEMPLATES_DIR="$SUPERAGI_CONFIG_DIR/agent-templates"
TOOL_CONFIGS_DIR="$SUPERAGI_CONFIG_DIR/tool-configs"
WORKFLOW_DIR="$SUPERAGI_CONFIG_DIR/workflows"

banner() {
    echo -e "${PINK}"
    cat << "EOF"
   _____ _   _ ____  _____ ____      _    ____ ___
  / ____| | | |  _ \| ____|  _ \    / \  / ___|_ _|
  \___ \| | | | |_) |  _| | |_) |  / _ \| |  _ | |
   ___) | |_| |  __/| |___|  _ <  / ___ \ |_| || |
  |____/ \___/|_|   |_____|_| \_\/_/   \_\____|___|

  BlackRoad AI Infrastructure - SuperAGI Integration
EOF
    echo -e "${RESET}"
}

init_directories() {
    echo -e "${BLUE}[INIT]${RESET} Creating SuperAGI directory structure..."

    mkdir -p "$SUPERAGI_CONFIG_DIR"
    mkdir -p "$AGENT_TEMPLATES_DIR"
    mkdir -p "$TOOL_CONFIGS_DIR"
    mkdir -p "$WORKFLOW_DIR"
    mkdir -p "$SUPERAGI_CONFIG_DIR/logs"
    mkdir -p "$SUPERAGI_CONFIG_DIR/data"
    mkdir -p "$SUPERAGI_CONFIG_DIR/resources"

    echo -e "${GREEN}✓${RESET} Directory structure created"
}

create_env_config() {
    echo -e "${BLUE}[CONFIG]${RESET} Creating environment configuration..."

    cat > "$SUPERAGI_CONFIG_DIR/.env" << 'ENVEOF'
# SuperAGI Environment Configuration
# BlackRoad OS Integration

# Database Configuration
DATABASE_URL=sqlite:///${HOME}/.blackroad/superagi/superagi.db

# Redis Configuration (optional - for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# API Configuration
SUPERAGI_API_KEY=${SUPERAGI_API_KEY:-superagi-api-key-change-me}
SUPERAGI_SECRET_KEY=${SUPERAGI_SECRET_KEY:-superagi-secret-key-change-me}

# Model Configuration - BlackRoad Multi-Model Support
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY:-}
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}

# Local Models (Ollama Integration)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ENABLED=true

# Default Model Selection
DEFAULT_MODEL=gpt-4-turbo-preview
DEFAULT_TEMPERATURE=0.7
DEFAULT_MAX_TOKENS=4096

# Agent Configuration
MAX_ITERATIONS=25
AGENT_TIMEOUT=300
ENABLE_MEMORY=true
ENABLE_TOOLS=true

# Tool Configuration
ENABLE_WEB_SEARCH=true
ENABLE_FILE_OPERATIONS=true
ENABLE_CODE_EXECUTION=true
ENABLE_SHELL_COMMANDS=false  # Set to true for full autonomy

# BlackRoad Integration
BLACKROAD_MEMORY_ENABLED=true
BLACKROAD_BLACKROAD OS_ENABLED=true
BLACKROAD_TRAFFIC_LIGHT_ENABLED=true

# Monitoring & Logging
LOG_LEVEL=INFO
ENABLE_TELEMETRY=true
PROMETHEUS_PORT=9090

# Web UI Configuration
FRONTEND_URL=http://localhost:${SUPERAGI_PORT}
BACKEND_URL=http://localhost:${SUPERAGI_API_PORT}
ENVEOF

    echo -e "${GREEN}✓${RESET} Environment configuration created at $SUPERAGI_CONFIG_DIR/.env"
    echo -e "${AMBER}⚠${RESET}  Remember to set your API keys!"
}

create_agent_templates() {
    echo -e "${BLUE}[TEMPLATES]${RESET} Creating agent templates..."

    # BlackRoad DevOps Agent
    cat > "$AGENT_TEMPLATES_DIR/blackroad-devops-agent.json" << 'JSONEOF'
{
  "name": "BlackRoad DevOps Agent",
  "description": "Autonomous DevOps agent for infrastructure management",
  "agent_workflow": "Goal Based Workflow",
  "goals": [
    "Monitor infrastructure health",
    "Deploy applications to Cloudflare/Railway",
    "Maintain CI/CD pipelines",
    "Update DNS and routing configurations"
  ],
  "tools": [
    "WebScraperTool",
    "GoogleSearchTool",
    "FileReadTool",
    "FileWriteTool",
    "ShellTool",
    "GitHubTool",
    "CloudflareTool",
    "RailwayTool"
  ],
  "model": "gpt-4-turbo-preview",
  "max_iterations": 20,
  "constraints": [
    "Always check memory system before making changes",
    "Update traffic light status after deployments",
    "Log all actions to BlackRoad memory",
    "Coordinate with other agents via memory system"
  ],
  "memory_settings": {
    "memory_window": 10,
    "enable_ltm": true,
    "enable_episodic": true
  }
}
JSONEOF

    # BlackRoad Researcher Agent
    cat > "$AGENT_TEMPLATES_DIR/blackroad-researcher-agent.json" << 'JSONEOF'
{
  "name": "BlackRoad Researcher Agent",
  "description": "Research and analysis agent for technical documentation",
  "agent_workflow": "Goal Based Workflow",
  "goals": [
    "Research technical topics and best practices",
    "Generate comprehensive documentation",
    "Analyze codebases and dependencies",
    "Provide architectural recommendations"
  ],
  "tools": [
    "WebScraperTool",
    "GoogleSearchTool",
    "FileReadTool",
    "FileWriteTool",
    "CodeAnalysisTool",
    "DocumentationGeneratorTool"
  ],
  "model": "claude-3-sonnet-20240229",
  "max_iterations": 15,
  "constraints": [
    "Cite all sources",
    "Verify information accuracy",
    "Follow BlackRoad brand guidelines for documentation",
    "Index findings in BlackRoad OS"
  ]
}
JSONEOF

    # BlackRoad Code Agent
    cat > "$AGENT_TEMPLATES_DIR/blackroad-code-agent.json" << 'JSONEOF'
{
  "name": "BlackRoad Code Agent",
  "description": "Software development and code generation agent",
  "agent_workflow": "Task Queue Workflow",
  "goals": [
    "Write clean, maintainable code",
    "Follow repository conventions and patterns",
    "Create comprehensive tests",
    "Generate documentation"
  ],
  "tools": [
    "FileReadTool",
    "FileWriteTool",
    "CodeExecutionTool",
    "TestRunnerTool",
    "GitHubTool",
    "LinterTool"
  ],
  "model": "gpt-4-turbo-preview",
  "max_iterations": 25,
  "constraints": [
    "Check BlackRoad OS for existing solutions before creating new code",
    "Follow INDEX.md patterns when present",
    "Run tests before committing",
    "Update memory with significant changes"
  ]
}
JSONEOF

    # BlackRoad Monitor Agent
    cat > "$AGENT_TEMPLATES_DIR/blackroad-monitor-agent.json" << 'JSONEOF'
{
  "name": "BlackRoad Monitor Agent",
  "description": "System monitoring and alerting agent",
  "agent_workflow": "Scheduled Workflow",
  "goals": [
    "Monitor service health across infrastructure",
    "Track performance metrics",
    "Alert on anomalies and failures",
    "Generate status reports"
  ],
  "tools": [
    "HTTPRequestTool",
    "LogAnalysisTool",
    "MetricsCollectorTool",
    "SlackNotificationTool"
  ],
  "model": "gpt-3.5-turbo",
  "max_iterations": 10,
  "schedule": "*/15 * * * *",
  "constraints": [
    "Update traffic light database",
    "Log health checks to memory",
    "Escalate critical issues immediately"
  ]
}
JSONEOF

    # BlackRoad Social Agent
    cat > "$AGENT_TEMPLATES_DIR/blackroad-social-agent.json" << 'JSONEOF'
{
  "name": "BlackRoad Social Agent",
  "description": "Social media management and content creation agent",
  "agent_workflow": "Goal Based Workflow",
  "goals": [
    "Create engaging social media content",
    "Schedule posts across platforms",
    "Respond to community engagement",
    "Track analytics and performance"
  ],
  "tools": [
    "LinkedInTool",
    "TwitterTool",
    "ContentGeneratorTool",
    "ImageGeneratorTool",
    "AnalyticsTool"
  ],
  "model": "gpt-4-turbo-preview",
  "max_iterations": 15,
  "constraints": [
    "Follow BlackRoad brand voice",
    "Use approved color palette",
    "Include relevant hashtags",
    "Track engagement metrics"
  ]
}
JSONEOF

    echo -e "${GREEN}✓${RESET} Created 5 agent templates"
}

create_tool_configs() {
    echo -e "${BLUE}[TOOLS]${RESET} Creating tool configurations..."

    # BlackRoad Memory Tool
    cat > "$TOOL_CONFIGS_DIR/blackroad-memory-tool.yaml" << 'YAMLEOF'
name: BlackRoadMemoryTool
description: Interface to BlackRoad PS-SHA-infinity memory system
version: 1.0.0
enabled: true

configuration:
  memory_script: ~/memory-system.sh
  realtime_script: ~/memory-realtime-context.sh
  marketplace_script: ~/memory-task-marketplace.sh

actions:
  - name: log_action
    command: "~/memory-system.sh log {action} {entity} {details} {tags}"
    description: "Log an action to memory system"

  - name: get_context
    command: "~/memory-realtime-context.sh live {agent} compact"
    description: "Get current context for coordination"

  - name: claim_task
    command: "~/memory-task-marketplace.sh claim {task_id}"
    description: "Claim a task from marketplace"

  - name: complete_task
    command: "~/memory-task-marketplace.sh complete {task_id} {summary}"
    description: "Mark task as complete"

permissions:
  - read_memory
  - write_memory
  - task_management
YAMLEOF

    # BlackRoad BlackRoad OS Tool
    cat > "$TOOL_CONFIGS_DIR/blackroad-blackroad os-tool.yaml" << 'YAMLEOF'
name: BlackRoadBlackRoad OSTool
description: Search 22,244 indexed components
version: 1.0.0
enabled: true

configuration:
  search_script: ~/blackroad-blackroad os-search.py
  verification_script: ~/blackroad-blackroad os-verification-suite.sh

actions:
  - name: search
    command: "python3 ~/blackroad-blackroad os-search.py {query}"
    description: "Search indexed components"

  - name: stats
    command: "python3 ~/blackroad-blackroad os-search.py --stats"
    description: "Get component statistics"

  - name: verify
    command: "~/blackroad-blackroad os-verification-suite.sh stats"
    description: "Get verification stats"

permissions:
  - read_blackroad os
YAMLEOF

    # BlackRoad Traffic Light Tool
    cat > "$TOOL_CONFIGS_DIR/blackroad-traffic-light-tool.yaml" << 'YAMLEOF'
name: BlackRoadTrafficLightTool
description: Project status tracking system
version: 1.0.0
enabled: true

configuration:
  traffic_light_script: ~/blackroad-traffic-light.sh

actions:
  - name: get_status
    command: "~/blackroad-traffic-light.sh summary"
    description: "Get all project statuses"

  - name: set_status
    command: "~/blackroad-traffic-light.sh set {project} {status} {reason}"
    description: "Update project status (green/yellow/red)"

  - name: list_projects
    command: "~/blackroad-traffic-light.sh list"
    description: "List all tracked projects"

permissions:
  - read_status
  - write_status
YAMLEOF

    # Cloudflare Deployment Tool
    cat > "$TOOL_CONFIGS_DIR/cloudflare-deploy-tool.yaml" << 'YAMLEOF'
name: CloudflareDeployTool
description: Deploy to Cloudflare Pages and Workers
version: 1.0.0
enabled: true

configuration:
  wrangler_path: wrangler

actions:
  - name: deploy_pages
    command: "wrangler pages deploy {directory} --project-name={project}"
    description: "Deploy to Cloudflare Pages"

  - name: deploy_worker
    command: "cd {directory} && wrangler deploy"
    description: "Deploy Cloudflare Worker"

  - name: list_projects
    command: "wrangler pages project list"
    description: "List all Pages projects"

  - name: list_deployments
    command: "wrangler pages deployment list --project-name={project}"
    description: "List deployments for a project"

permissions:
  - cloudflare_deploy
  - cloudflare_read
YAMLEOF

    # GitHub Operations Tool
    cat > "$TOOL_CONFIGS_DIR/github-ops-tool.yaml" << 'YAMLEOF'
name: GitHubOpsTool
description: GitHub repository and workflow management
version: 1.0.0
enabled: true

configuration:
  gh_path: gh

actions:
  - name: list_repos
    command: "gh repo list {org} --limit {limit}"
    description: "List organization repositories"

  - name: clone_repo
    command: "gh repo clone {org}/{repo}"
    description: "Clone a repository"

  - name: create_pr
    command: "gh pr create --title {title} --body {body}"
    description: "Create a pull request"

  - name: workflow_status
    command: "gh workflow list"
    description: "List GitHub Actions workflows"

permissions:
  - github_read
  - github_write
  - github_actions
YAMLEOF

    echo -e "${GREEN}✓${RESET} Created 5 tool configurations"
}

create_workflows() {
    echo -e "${BLUE}[WORKFLOWS]${RESET} Creating workflow definitions..."

    # Infrastructure Deployment Workflow
    cat > "$WORKFLOW_DIR/infrastructure-deploy.yaml" << 'YAMLEOF'
name: Infrastructure Deployment
description: Deploy applications across BlackRoad infrastructure
version: 1.0.0

steps:
  - name: pre_deployment_check
    agent: BlackRoad DevOps Agent
    actions:
      - Check memory for conflicts
      - Verify no other deployments in progress
      - Update traffic light to yellow

  - name: build
    agent: BlackRoad Code Agent
    actions:
      - Run tests
      - Build application
      - Generate deployment artifacts

  - name: deploy
    agent: BlackRoad DevOps Agent
    actions:
      - Deploy to Cloudflare/Railway
      - Update DNS if needed
      - Verify deployment health

  - name: post_deployment
    agent: BlackRoad Monitor Agent
    actions:
      - Run health checks
      - Update traffic light to green
      - Log deployment to memory
      - Announce completion

triggers:
  - type: manual
  - type: github_webhook
    event: push
    branch: main
YAMLEOF

    # Daily Health Check Workflow
    cat > "$WORKFLOW_DIR/daily-health-check.yaml" << 'YAMLEOF'
name: Daily Health Check
description: Comprehensive infrastructure health monitoring
version: 1.0.0

schedule: "0 9 * * *"  # 9 AM daily

steps:
  - name: service_health
    agent: BlackRoad Monitor Agent
    actions:
      - Check all Cloudflare Pages projects
      - Check Railway services
      - Check device fleet status
      - Check GitHub Actions status

  - name: performance_metrics
    agent: BlackRoad Monitor Agent
    actions:
      - Collect response times
      - Check error rates
      - Review resource usage

  - name: report_generation
    agent: BlackRoad Researcher Agent
    actions:
      - Generate daily health report
      - Update dashboards
      - Alert on anomalies

  - name: memory_maintenance
    agent: BlackRoad DevOps Agent
    actions:
      - Clean up old tasks
      - Archive completed sessions
      - Update statistics

notifications:
  - type: slack
    channel: "#infrastructure-health"
  - type: email
    recipients: ["admin@blackroad.io"]
YAMLEOF

    # Content Creation Workflow
    cat > "$WORKFLOW_DIR/content-creation.yaml" << 'YAMLEOF'
name: Content Creation & Publishing
description: Automated content generation and social media posting
version: 1.0.0

schedule: "0 10,14,18 * * *"  # 10 AM, 2 PM, 6 PM daily

steps:
  - name: topic_research
    agent: BlackRoad Researcher Agent
    actions:
      - Research trending topics
      - Analyze competitor content
      - Generate content ideas

  - name: content_generation
    agent: BlackRoad Social Agent
    actions:
      - Create post content
      - Generate visuals
      - Review for brand compliance

  - name: publishing
    agent: BlackRoad Social Agent
    actions:
      - Schedule LinkedIn posts
      - Schedule Twitter posts
      - Update website blog

  - name: engagement_tracking
    agent: BlackRoad Social Agent
    actions:
      - Monitor post performance
      - Respond to comments
      - Log analytics to memory

approval_required: false
auto_publish: true
YAMLEOF

    echo -e "${GREEN}✓${RESET} Created 3 workflow definitions"
}

create_docker_compose() {
    echo -e "${BLUE}[DOCKER]${RESET} Creating Docker Compose configuration..."

    cat > "$SUPERAGI_CONFIG_DIR/docker-compose.yml" << 'DOCKEREOF'
version: '3.8'

services:
  superagi:
    image: superagi/superagi:latest
    container_name: blackroad-superagi
    ports:
      - "${SUPERAGI_PORT:-8000}:8000"
      - "${SUPERAGI_API_PORT:-8001}:8001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=${REDIS_HOST:-redis}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ${SUPERAGI_CONFIG_DIR}/data:/app/data
      - ${SUPERAGI_CONFIG_DIR}/resources:/app/resources
      - ${SUPERAGI_CONFIG_DIR}/logs:/app/logs
      - ${HOME}/.blackroad:/root/.blackroad:ro
      - ${SUPERAGI_CONFIG_DIR}/.env:/app/.env
    networks:
      - blackroad-network
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    container_name: blackroad-superagi-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - blackroad-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: blackroad-superagi-postgres
    environment:
      POSTGRES_DB: superagi
      POSTGRES_USER: superagi
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-superagi-change-me}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - blackroad-network
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    container_name: blackroad-superagi-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ${SUPERAGI_CONFIG_DIR}/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - blackroad-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: blackroad-superagi-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - blackroad-network
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  redis-data:
  postgres-data:
  prometheus-data:
  grafana-data:

networks:
  blackroad-network:
    driver: bridge
DOCKEREOF

    # Prometheus configuration
    cat > "$SUPERAGI_CONFIG_DIR/prometheus.yml" << 'PROMEOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'superagi'
    static_configs:
      - targets: ['superagi:8001']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
PROMEOF

    echo -e "${GREEN}✓${RESET} Docker Compose configuration created"
}

create_monitoring_dashboard() {
    echo -e "${BLUE}[MONITOR]${RESET} Creating monitoring dashboard..."

    cat > "$SUPERAGI_CONFIG_DIR/monitor-dashboard.sh" << 'MONITOREOF'
#!/bin/bash
# SuperAGI Monitoring Dashboard
# BlackRoad OS Integration

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RED='\033[38;5;196m'
RESET='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}  SuperAGI Status Dashboard - BlackRoad OS${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Docker Status
echo -e "${BLUE}[DOCKER SERVICES]${RESET}"
if command -v docker &> /dev/null; then
    docker ps --filter "name=blackroad-superagi" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | while IFS= read -r line; do
        if [[ $line == *"Up"* ]]; then
            echo -e "${GREEN}✓${RESET} $line"
        else
            echo -e "${RED}✗${RESET} $line"
        fi
    done
else
    echo -e "${AMBER}⚠${RESET} Docker not installed"
fi
echo ""

# Service Health Checks
echo -e "${BLUE}[SERVICE HEALTH]${RESET}"

# SuperAGI API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓${RESET} SuperAGI API (http://localhost:8001)"
else
    echo -e "${RED}✗${RESET} SuperAGI API (http://localhost:8001) - Not responding"
fi

# SuperAGI UI
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓${RESET} SuperAGI UI (http://localhost:8000)"
else
    echo -e "${RED}✗${RESET} SuperAGI UI (http://localhost:8000) - Not responding"
fi

# Grafana
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓${RESET} Grafana (http://localhost:3000)"
else
    echo -e "${AMBER}⚠${RESET} Grafana (http://localhost:3000) - Not responding"
fi

echo ""

# Active Agents
echo -e "${BLUE}[ACTIVE AGENTS]${RESET}"
AGENT_COUNT=$(find ~/.blackroad/memory/active-agents/ -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}✓${RESET} $AGENT_COUNT active agents"
echo ""

# Recent Memory Logs
echo -e "${BLUE}[RECENT ACTIVITY]${RESET}"
if [ -f ~/.blackroad/memory/journals/master-journal.jsonl ]; then
    tail -5 ~/.blackroad/memory/journals/master-journal.jsonl | jq -r '.action + " | " + .entity + " | " + .agent' 2>/dev/null | while read -r line; do
        echo -e "${GREEN}→${RESET} $line"
    done
fi
echo ""

# Task Marketplace
echo -e "${BLUE}[TASK MARKETPLACE]${RESET}"
if command -v ~/memory-task-marketplace.sh &> /dev/null; then
    ~/memory-task-marketplace.sh stats 2>/dev/null | grep -E "(Available|Claimed|Completed)" | while read -r line; do
        echo -e "${GREEN}→${RESET} $line"
    done
fi
echo ""

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
MONITOREOF

    chmod +x "$SUPERAGI_CONFIG_DIR/monitor-dashboard.sh"
    echo -e "${GREEN}✓${RESET} Monitoring dashboard created"
}

create_deployment_script() {
    echo -e "${BLUE}[DEPLOY]${RESET} Creating deployment script..."

    cat > "$SUPERAGI_CONFIG_DIR/deploy.sh" << 'DEPLOYEOF'
#!/bin/bash
# SuperAGI Deployment Script
# BlackRoad OS Integration

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

SUPERAGI_CONFIG_DIR="$HOME/.blackroad/superagi"

echo -e "${PINK}[DEPLOY]${RESET} Starting SuperAGI deployment..."

# Check prerequisites
echo -e "${BLUE}[CHECK]${RESET} Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is required. Install from https://docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is required"
    exit 1
fi

# Load environment
if [ -f "$SUPERAGI_CONFIG_DIR/.env" ]; then
    set -a
    source "$SUPERAGI_CONFIG_DIR/.env"
    set +a
    echo -e "${GREEN}✓${RESET} Environment loaded"
else
    echo "Error: .env file not found. Run init first."
    exit 1
fi

# Start services
echo -e "${BLUE}[START]${RESET} Starting Docker services..."
cd "$SUPERAGI_CONFIG_DIR"

if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi

echo -e "${GREEN}✓${RESET} Services started"

# Wait for services
echo -e "${BLUE}[WAIT]${RESET} Waiting for services to be ready..."
sleep 10

# Health check
echo -e "${BLUE}[HEALTH]${RESET} Running health checks..."
bash "$SUPERAGI_CONFIG_DIR/monitor-dashboard.sh"

# Update memory
if command -v ~/memory-system.sh &> /dev/null; then
    ~/memory-system.sh log "deployed" "superagi" "SuperAGI deployed with BlackRoad integration" "superagi,ai,deployment"
fi

# Update traffic light
if command -v ~/blackroad-traffic-light.sh &> /dev/null; then
    ~/blackroad-traffic-light.sh set superagi green "SuperAGI deployed and running"
fi

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}✓ SuperAGI deployed successfully!${RESET}"
echo ""
echo -e "  UI:         ${BLUE}http://localhost:${SUPERAGI_PORT}${RESET}"
echo -e "  API:        ${BLUE}http://localhost:${SUPERAGI_API_PORT}${RESET}"
echo -e "  Grafana:    ${BLUE}http://localhost:3000${RESET}"
echo -e "  Prometheus: ${BLUE}http://localhost:9090${RESET}"
echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
DEPLOYEOF

    chmod +x "$SUPERAGI_CONFIG_DIR/deploy.sh"
    echo -e "${GREEN}✓${RESET} Deployment script created"
}

create_readme() {
    echo -e "${BLUE}[DOCS]${RESET} Creating README..."

    cat > "$SUPERAGI_CONFIG_DIR/README.md" << 'READMEEOF'
# SuperAGI - BlackRoad OS Integration

Autonomous AI agent framework integrated with BlackRoad infrastructure.

## Quick Start

```bash
# Initialize configuration
~/blackroad-ai-integrations/superagi-config.sh init

# Edit .env and add your API keys
nano ~/.blackroad/superagi/.env

# Deploy SuperAGI
~/blackroad-ai-integrations/superagi-config.sh deploy

# Monitor status
~/blackroad-ai-integrations/superagi-config.sh monitor

# Access UI
open http://localhost:8000
```

## Architecture

- **SuperAGI Core**: Agent orchestration and execution
- **Redis**: Task queue and caching
- **PostgreSQL**: Persistent storage
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards

## Agent Templates

Five pre-configured agent templates:

1. **BlackRoad DevOps Agent** - Infrastructure management
2. **BlackRoad Researcher Agent** - Research and documentation
3. **BlackRoad Code Agent** - Software development
4. **BlackRoad Monitor Agent** - System monitoring
5. **BlackRoad Social Agent** - Social media management

## Tool Integrations

- **BlackRoad Memory Tool**: PS-SHA-infinity memory system
- **BlackRoad BlackRoad OS Tool**: 22,244 component search
- **BlackRoad Traffic Light Tool**: Project status tracking
- **Cloudflare Deploy Tool**: Pages and Workers deployment
- **GitHub Ops Tool**: Repository and workflow management

## Workflows

Three automated workflows:

1. **Infrastructure Deployment**: End-to-end deployment automation
2. **Daily Health Check**: Comprehensive monitoring (9 AM daily)
3. **Content Creation**: Social media posting (10 AM, 2 PM, 6 PM)

## Configuration

Environment variables in `~/.blackroad/superagi/.env`:

- API keys for OpenAI, Anthropic, Hugging Face, Google
- Ollama integration for local models
- BlackRoad system integration toggles
- Model defaults and agent settings

## Monitoring

```bash
# Dashboard
~/.blackroad/superagi/monitor-dashboard.sh

# Logs
docker logs blackroad-superagi -f

# Metrics
open http://localhost:9090  # Prometheus
open http://localhost:3000  # Grafana
```

## Management Commands

```bash
# Start services
cd ~/.blackroad/superagi && docker compose up -d

# Stop services
cd ~/.blackroad/superagi && docker compose down

# View logs
docker logs blackroad-superagi -f

# Restart
cd ~/.blackroad/superagi && docker compose restart
```

## BlackRoad Integration

SuperAGI agents automatically:

- Check memory system before actions
- Update traffic light status
- Log to PS-SHA-infinity journals
- Search BlackRoad OS for solutions
- Coordinate via task marketplace

## Directory Structure

```
~/.blackroad/superagi/
├── .env                    # Environment configuration
├── docker-compose.yml      # Service definitions
├── prometheus.yml          # Metrics configuration
├── agent-templates/        # Pre-configured agents
├── tool-configs/           # Tool definitions
├── workflows/              # Automated workflows
├── data/                   # Application data
├── logs/                   # Application logs
└── resources/              # Agent resources
```

## Next Steps

1. Configure API keys in `.env`
2. Deploy with `deploy.sh`
3. Access UI at http://localhost:8000
4. Create your first agent from templates
5. Monitor via Grafana dashboard
6. Check memory logs for coordination

## Support

- Documentation: https://docs.superagi.com
- BlackRoad Memory: `~/memory-system.sh summary`
- Traffic Lights: `~/blackroad-traffic-light.sh summary`
- Task Marketplace: `~/memory-task-marketplace.sh list`
READMEEOF

    echo -e "${GREEN}✓${RESET} README created"
}

# Main command handler
case "${1:-init}" in
    init)
        banner
        init_directories
        create_env_config
        create_agent_templates
        create_tool_configs
        create_workflows
        create_docker_compose
        create_monitoring_dashboard
        create_deployment_script
        create_readme

        echo ""
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        echo -e "${GREEN}✓ SuperAGI configuration complete!${RESET}"
        echo ""
        echo -e "${BLUE}Next steps:${RESET}"
        echo -e "  1. Edit ${AMBER}~/.blackroad/superagi/.env${RESET} and add your API keys"
        echo -e "  2. Run ${AMBER}$0 deploy${RESET} to start services"
        echo -e "  3. Access UI at ${BLUE}http://localhost:8000${RESET}"
        echo ""
        echo -e "${BLUE}Configuration location:${RESET} ~/.blackroad/superagi/"
        echo -e "${BLUE}Agent templates:${RESET} 5 pre-configured"
        echo -e "${BLUE}Tool configs:${RESET} 5 integrations"
        echo -e "${BLUE}Workflows:${RESET} 3 automated"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
        ;;

    deploy)
        banner
        bash "$SUPERAGI_CONFIG_DIR/deploy.sh"
        ;;

    monitor|status)
        bash "$SUPERAGI_CONFIG_DIR/monitor-dashboard.sh"
        ;;

    stop)
        echo -e "${BLUE}[STOP]${RESET} Stopping SuperAGI services..."
        cd "$SUPERAGI_CONFIG_DIR"
        if docker compose version &> /dev/null; then
            docker compose down
        else
            docker-compose down
        fi
        echo -e "${GREEN}✓${RESET} Services stopped"
        ;;

    restart)
        echo -e "${BLUE}[RESTART]${RESET} Restarting SuperAGI services..."
        cd "$SUPERAGI_CONFIG_DIR"
        if docker compose version &> /dev/null; then
            docker compose restart
        else
            docker-compose restart
        fi
        echo -e "${GREEN}✓${RESET} Services restarted"
        ;;

    logs)
        docker logs blackroad-superagi -f
        ;;

    help|--help|-h)
        banner
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  init      - Initialize SuperAGI configuration (default)"
        echo "  deploy    - Deploy SuperAGI services with Docker"
        echo "  monitor   - Show status dashboard"
        echo "  status    - Alias for monitor"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - View SuperAGI logs"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 init           # Initialize configuration"
        echo "  $0 deploy         # Deploy services"
        echo "  $0 monitor        # Check status"
        echo ""
        ;;

    *)
        echo "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
