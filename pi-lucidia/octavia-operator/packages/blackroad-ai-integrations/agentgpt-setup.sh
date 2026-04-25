#!/bin/bash
# AgentGPT Setup Script for BlackRoad OS
# Description: Configure and deploy AgentGPT with Docker, database, and API integration
# Usage: ./agentgpt-setup.sh [init|start|stop|status|deploy|clean]

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
AGENTGPT_DIR="$HOME/agentgpt"
AGENTGPT_REPO="https://github.com/reworkd/AgentGPT.git"
DOCKER_COMPOSE_FILE="$AGENTGPT_DIR/docker-compose.yml"
ENV_FILE="$AGENTGPT_DIR/.env"
BLACKROAD_ENV="$HOME/.blackroad-deploy-env"

# Print banner
print_banner() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}          ${AMBER}🤖 AgentGPT Setup - BlackRoad OS 🤖${RESET}          ${PINK}║${RESET}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

# Log to memory
log_to_memory() {
    local action="$1"
    local details="$2"
    if [ -x "$HOME/memory-system.sh" ]; then
        "$HOME/memory-system.sh" log "$action" "agentgpt" "$details" "ai-integration,agentgpt,setup"
    fi
}

# Check dependencies
check_dependencies() {
    echo -e "${BLUE}[1/5] Checking dependencies...${RESET}"

    local missing_deps=()

    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi

    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi

    # Check Node.js (optional but recommended)
    if ! command -v node &> /dev/null; then
        echo -e "${AMBER}⚠️  Node.js not found (optional)${RESET}"
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${RESET}"
        echo ""
        echo "Install missing dependencies:"
        echo "  Docker Desktop: https://www.docker.com/products/docker-desktop"
        echo "  Or via Homebrew: brew install docker docker-compose git"
        exit 1
    fi

    echo -e "${GREEN}✅ All dependencies installed${RESET}"
}

# Clone AgentGPT repository
clone_repository() {
    echo -e "${BLUE}[2/5] Cloning AgentGPT repository...${RESET}"

    if [ -d "$AGENTGPT_DIR" ]; then
        echo -e "${AMBER}⚠️  AgentGPT directory already exists at $AGENTGPT_DIR${RESET}"
        read -p "Do you want to update it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$AGENTGPT_DIR"
            git pull origin main
            echo -e "${GREEN}✅ Repository updated${RESET}"
        fi
    else
        git clone "$AGENTGPT_REPO" "$AGENTGPT_DIR"
        echo -e "${GREEN}✅ Repository cloned${RESET}"
    fi

    log_to_memory "configured" "Cloned/updated AgentGPT repository"
}

# Configure environment
configure_environment() {
    echo -e "${BLUE}[3/5] Configuring environment...${RESET}"

    # Load BlackRoad environment if available
    if [ -f "$BLACKROAD_ENV" ]; then
        source "$BLACKROAD_ENV"
    fi

    # Create .env file
    cat > "$ENV_FILE" <<EOF
# AgentGPT Configuration - BlackRoad OS
# Generated: $(date)

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY:-your_openai_api_key_here}
OPENAI_MODEL=${OPENAI_MODEL:-gpt-4}

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://agentgpt:agentgpt@db:5432/agentgpt
POSTGRES_USER=agentgpt
POSTGRES_PASSWORD=agentgpt
POSTGRES_DB=agentgpt

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_me_in_production")
NEXTAUTH_URL=http://localhost:3000

# Backend Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Optional: Anthropic Claude (if available)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}

# Optional: Google AI
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}

# Optional: Replicate
REPLICATE_API_KEY=${REPLICATE_API_KEY:-}

# Optional: Langchain
LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY:-}

# BlackRoad Integration
BLACKROAD_MODE=enabled
BLACKROAD_MEMORY_ENABLED=true
BLACKROAD_BLACKROAD OS_ENABLED=true

# Development/Production
NODE_ENV=development
EOF

    echo -e "${GREEN}✅ Environment configured at $ENV_FILE${RESET}"
    echo -e "${AMBER}⚠️  IMPORTANT: Edit $ENV_FILE and add your API keys${RESET}"

    log_to_memory "configured" "Created environment file with API configurations"
}

# Setup Docker configuration
setup_docker() {
    echo -e "${BLUE}[4/5] Setting up Docker configuration...${RESET}"

    # Create custom docker-compose.yml if needed
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        cat > "$DOCKER_COMPOSE_FILE" <<EOF
version: '3.9'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: agentgpt-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-agentgpt}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-agentgpt}
      POSTGRES_DB: \${POSTGRES_DB:-agentgpt}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agentgpt"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: agentgpt-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # AgentGPT Backend
  backend:
    build:
      context: ./platform
      dockerfile: Dockerfile
    container_name: agentgpt-backend
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    ports:
      - "\${BACKEND_PORT:-8000}:8000"
    volumes:
      - ./platform:/app
      - /app/node_modules
    command: npm run dev

  # AgentGPT Frontend
  frontend:
    build:
      context: ./next
      dockerfile: Dockerfile
    container_name: agentgpt-frontend
    restart: unless-stopped
    env_file:
      - .env
    depends_on:
      - backend
    ports:
      - "\${FRONTEND_PORT:-3000}:3000"
    volumes:
      - ./next:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  default:
    name: agentgpt-network
EOF
    fi

    echo -e "${GREEN}✅ Docker configuration ready${RESET}"
    log_to_memory "configured" "Setup Docker Compose with PostgreSQL and Redis"
}

# Create API wrapper scripts
create_api_wrappers() {
    echo -e "${BLUE}[5/5] Creating API wrapper scripts...${RESET}"

    # Create API client wrapper
    cat > "$AGENTGPT_DIR/blackroad-agentgpt-api.sh" <<'EOF'
#!/bin/bash
# AgentGPT API Wrapper for BlackRoad OS
# Usage: ./blackroad-agentgpt-api.sh [create|status|list|delete] [args]

API_URL="${AGENTGPT_API_URL:-http://localhost:3000/api}"

# Colors
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

# Create a new agent
create_agent() {
    local name="$1"
    local goal="$2"

    echo -e "${BLUE}Creating agent: $name${RESET}"

    curl -s -X POST "$API_URL/agent/create" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"goal\": \"$goal\"
        }" | jq .
}

# Get agent status
get_status() {
    local agent_id="$1"

    echo -e "${BLUE}Getting status for agent: $agent_id${RESET}"

    curl -s "$API_URL/agent/$agent_id/status" | jq .
}

# List all agents
list_agents() {
    echo -e "${BLUE}Listing all agents:${RESET}"

    curl -s "$API_URL/agent/list" | jq .
}

# Delete agent
delete_agent() {
    local agent_id="$1"

    echo -e "${BLUE}Deleting agent: $agent_id${RESET}"

    curl -s -X DELETE "$API_URL/agent/$agent_id" | jq .
}

# Main command router
case "$1" in
    create)
        create_agent "$2" "$3"
        ;;
    status)
        get_status "$2"
        ;;
    list)
        list_agents
        ;;
    delete)
        delete_agent "$2"
        ;;
    *)
        echo "Usage: $0 [create|status|list|delete] [args]"
        echo ""
        echo "Examples:"
        echo "  $0 create 'Research Agent' 'Research latest AI developments'"
        echo "  $0 status agent-id-123"
        echo "  $0 list"
        echo "  $0 delete agent-id-123"
        exit 1
        ;;
esac
EOF

    chmod +x "$AGENTGPT_DIR/blackroad-agentgpt-api.sh"

    # Create Python API wrapper
    cat > "$AGENTGPT_DIR/blackroad_agentgpt_client.py" <<'EOF'
#!/usr/bin/env python3
"""
AgentGPT Python Client for BlackRoad OS
Usage: python3 blackroad_agentgpt_client.py
"""

import os
import requests
import json
from typing import Dict, List, Optional

class AgentGPTClient:
    def __init__(self, base_url: str = "http://localhost:3000/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def create_agent(self, name: str, goal: str) -> Dict:
        """Create a new agent"""
        endpoint = f"{self.base_url}/agent/create"
        payload = {
            "name": name,
            "goal": goal
        }
        response = self.session.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()

    def get_status(self, agent_id: str) -> Dict:
        """Get agent status"""
        endpoint = f"{self.base_url}/agent/{agent_id}/status"
        response = self.session.get(endpoint)
        response.raise_for_status()
        return response.json()

    def list_agents(self) -> List[Dict]:
        """List all agents"""
        endpoint = f"{self.base_url}/agent/list"
        response = self.session.get(endpoint)
        response.raise_for_status()
        return response.json()

    def delete_agent(self, agent_id: str) -> Dict:
        """Delete an agent"""
        endpoint = f"{self.base_url}/agent/{agent_id}"
        response = self.session.delete(endpoint)
        response.raise_for_status()
        return response.json()

    def execute_task(self, agent_id: str, task: str) -> Dict:
        """Execute a task with an agent"""
        endpoint = f"{self.base_url}/agent/{agent_id}/execute"
        payload = {"task": task}
        response = self.session.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()

def main():
    """Example usage"""
    client = AgentGPTClient()

    # Create an agent
    print("Creating agent...")
    agent = client.create_agent(
        name="BlackRoad Research Agent",
        goal="Research and summarize AI developments"
    )
    print(f"Created agent: {json.dumps(agent, indent=2)}")

    # List agents
    print("\nListing agents...")
    agents = client.list_agents()
    print(f"Found {len(agents)} agents")

if __name__ == "__main__":
    main()
EOF

    chmod +x "$AGENTGPT_DIR/blackroad_agentgpt_client.py"

    echo -e "${GREEN}✅ API wrappers created${RESET}"
    echo -e "  - Bash: $AGENTGPT_DIR/blackroad-agentgpt-api.sh"
    echo -e "  - Python: $AGENTGPT_DIR/blackroad_agentgpt_client.py"

    log_to_memory "created" "API wrapper scripts for bash and Python"
}

# Initialize AgentGPT
init_agentgpt() {
    print_banner
    echo -e "${VIOLET}Initializing AgentGPT setup...${RESET}\n"

    check_dependencies
    clone_repository
    configure_environment
    setup_docker
    create_api_wrappers

    echo ""
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}                  ${GREEN}✅ Setup Complete!${RESET}                     ${PINK}║${RESET}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${AMBER}Next steps:${RESET}"
    echo -e "  1. Edit environment: ${BLUE}$ENV_FILE${RESET}"
    echo -e "  2. Add your OpenAI API key"
    echo -e "  3. Start services: ${GREEN}$0 start${RESET}"
    echo -e "  4. Access UI: ${BLUE}http://localhost:3000${RESET}"
    echo ""

    log_to_memory "milestone" "AgentGPT setup initialized successfully"
}

# Start AgentGPT services
start_services() {
    echo -e "${BLUE}Starting AgentGPT services...${RESET}"

    if [ ! -d "$AGENTGPT_DIR" ]; then
        echo -e "${RED}❌ AgentGPT not initialized. Run: $0 init${RESET}"
        exit 1
    fi

    cd "$AGENTGPT_DIR"

    # Start Docker containers
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker-compose up -d
        echo -e "${GREEN}✅ Services started${RESET}"
        echo -e "  - Frontend: ${BLUE}http://localhost:3000${RESET}"
        echo -e "  - Backend: ${BLUE}http://localhost:8000${RESET}"
        echo -e "  - Database: ${BLUE}postgresql://localhost:5432${RESET}"
        echo -e "  - Redis: ${BLUE}redis://localhost:6379${RESET}"
    else
        echo -e "${AMBER}⚠️  Using default docker-compose from repository${RESET}"
        docker-compose up -d
    fi

    log_to_memory "deployed" "Started AgentGPT services via Docker Compose"
}

# Stop AgentGPT services
stop_services() {
    echo -e "${BLUE}Stopping AgentGPT services...${RESET}"

    if [ ! -d "$AGENTGPT_DIR" ]; then
        echo -e "${RED}❌ AgentGPT not initialized${RESET}"
        exit 1
    fi

    cd "$AGENTGPT_DIR"
    docker-compose down

    echo -e "${GREEN}✅ Services stopped${RESET}"
    log_to_memory "progress" "Stopped AgentGPT services"
}

# Check service status
check_status() {
    echo -e "${BLUE}Checking AgentGPT status...${RESET}\n"

    if [ ! -d "$AGENTGPT_DIR" ]; then
        echo -e "${RED}❌ AgentGPT not initialized${RESET}"
        exit 1
    fi

    cd "$AGENTGPT_DIR"

    echo -e "${VIOLET}Docker Containers:${RESET}"
    docker-compose ps

    echo ""
    echo -e "${VIOLET}Service Health:${RESET}"

    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  Frontend: ${GREEN}✅ Running${RESET}"
    else
        echo -e "  Frontend: ${RED}❌ Down${RESET}"
    fi

    # Check backend
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo -e "  Backend: ${GREEN}✅ Running${RESET}"
    else
        echo -e "  Backend: ${RED}❌ Down${RESET}"
    fi

    # Check database
    if docker exec agentgpt-db pg_isready -U agentgpt > /dev/null 2>&1; then
        echo -e "  Database: ${GREEN}✅ Running${RESET}"
    else
        echo -e "  Database: ${RED}❌ Down${RESET}"
    fi

    # Check Redis
    if docker exec agentgpt-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "  Redis: ${GREEN}✅ Running${RESET}"
    else
        echo -e "  Redis: ${RED}❌ Down${RESET}"
    fi
}

# Deploy to production (Railway/Cloudflare)
deploy_production() {
    echo -e "${BLUE}Deploying AgentGPT to production...${RESET}"

    read -p "Deploy to Railway (r) or Cloudflare (c)? " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Rr]$ ]]; then
        deploy_railway
    elif [[ $REPLY =~ ^[Cc]$ ]]; then
        deploy_cloudflare
    else
        echo -e "${RED}Invalid option${RESET}"
        exit 1
    fi
}

# Deploy to Railway
deploy_railway() {
    echo -e "${BLUE}Deploying to Railway...${RESET}"

    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not installed${RESET}"
        echo "Install: npm install -g @railway/cli"
        exit 1
    fi

    cd "$AGENTGPT_DIR"

    # Initialize Railway project
    railway init

    # Set environment variables
    railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
    railway variables set DATABASE_URL="postgresql://\${{POSTGRES_USER}}:\${{POSTGRES_PASSWORD}}@\${{RAILWAY_TCP_PROXY_DOMAIN}}:\${{RAILWAY_TCP_PROXY_PORT}}/\${{POSTGRES_DB}}"

    # Deploy
    railway up

    echo -e "${GREEN}✅ Deployed to Railway${RESET}"
    log_to_memory "deployed" "AgentGPT deployed to Railway"
}

# Deploy to Cloudflare
deploy_cloudflare() {
    echo -e "${BLUE}Deploying to Cloudflare Pages...${RESET}"

    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}❌ Wrangler CLI not installed${RESET}"
        echo "Install: npm install -g wrangler"
        exit 1
    fi

    cd "$AGENTGPT_DIR/next"

    # Build for production
    npm run build

    # Deploy to Cloudflare Pages
    wrangler pages deploy out --project-name=agentgpt

    echo -e "${GREEN}✅ Deployed to Cloudflare Pages${RESET}"
    log_to_memory "deployed" "AgentGPT deployed to Cloudflare Pages"
}

# Clean up AgentGPT installation
clean_install() {
    echo -e "${RED}⚠️  WARNING: This will remove all AgentGPT data${RESET}"
    read -p "Are you sure? (yes/no) " -r
    echo

    if [[ $REPLY == "yes" ]]; then
        echo -e "${BLUE}Cleaning up...${RESET}"

        if [ -d "$AGENTGPT_DIR" ]; then
            cd "$AGENTGPT_DIR"
            docker-compose down -v
            cd ..
            rm -rf "$AGENTGPT_DIR"
            echo -e "${GREEN}✅ Cleanup complete${RESET}"
            log_to_memory "progress" "Cleaned up AgentGPT installation"
        else
            echo -e "${AMBER}Nothing to clean${RESET}"
        fi
    else
        echo -e "${BLUE}Cleanup cancelled${RESET}"
    fi
}

# Show usage
show_usage() {
    cat <<EOF
AgentGPT Setup Script - BlackRoad OS

Usage: $0 [command]

Commands:
  init      Initialize AgentGPT (clone repo, configure env, setup Docker)
  start     Start AgentGPT services (Docker Compose)
  stop      Stop AgentGPT services
  status    Check service status
  deploy    Deploy to production (Railway/Cloudflare)
  clean     Remove AgentGPT installation
  help      Show this help message

Examples:
  $0 init                    # First-time setup
  $0 start                   # Start all services
  $0 status                  # Check if running
  $0 stop                    # Stop services

After init, edit: $ENV_FILE
EOF
}

# Main command router
case "${1:-help}" in
    init)
        init_agentgpt
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    status)
        check_status
        ;;
    deploy)
        deploy_production
        ;;
    clean)
        clean_install
        ;;
    help|--help|-h)
        print_banner
        show_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${RESET}"
        show_usage
        exit 1
        ;;
esac
