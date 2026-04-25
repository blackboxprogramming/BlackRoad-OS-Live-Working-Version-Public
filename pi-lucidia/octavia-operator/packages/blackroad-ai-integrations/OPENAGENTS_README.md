# OpenAgents Platform Integration

OpenAgents deployment and orchestration for BlackRoad OS.

## Quick Start

```bash
# 1. Initialize the platform
~/blackroad-ai-integrations/openagents-deploy.sh init

# 2. Register an agent
~/blackroad-ai-integrations/openagents-deploy.sh register \
  gpt-4-agent \
  "GPT-4 Agent" \
  llm \
  "text-generation,chat,reasoning" \
  http://localhost:8080

# 3. Deploy the agent
~/blackroad-ai-integrations/openagents-deploy.sh deploy gpt-4-agent local

# 4. Check health
~/blackroad-ai-integrations/openagents-deploy.sh health

# 5. View status
~/blackroad-ai-integrations/openagents-deploy.sh status
```

## Architecture

```
~/.blackroad/openagents/
├── agent-registry.db          # SQLite database
├── config.json                # Platform configuration
├── api-endpoints.json         # API endpoint definitions
├── health.log                 # Health check logs
├── agents/
│   ├── active/                # Running agents
│   ├── archived/              # Historical agents
│   └── pending/               # Awaiting deployment
├── config/                    # Agent configurations
├── logs/                      # Runtime logs
└── data/                      # Agent data
```

## Features

### 1. Agent Registry (SQLite)
- **agents**: Core agent metadata and status
- **deployments**: Deployment history and tracking
- **health_checks**: Health monitoring data
- **api_keys**: Authentication and authorization

### 2. Deployment Strategies
- **local**: Run agents on localhost
- **cloudflare**: Deploy to Cloudflare Workers
- **railway**: Deploy to Railway.app

### 3. Health Monitoring
- Automated health checks every 60 seconds
- Response time tracking
- Status updates (healthy/unhealthy/unknown)
- Historical health data

### 4. API Configuration
Endpoints:
- `POST /api/v1/agents/register` - Register new agent
- `POST /api/v1/agents/:id/deploy` - Deploy agent
- `GET /api/v1/agents/:id/health` - Health check
- `GET /api/v1/agents/:id/status` - Agent status
- `GET /api/v1/agents` - List all agents
- `POST /api/v1/agents/:id/execute` - Execute task

## Commands

### Initialize Platform
```bash
~/blackroad-ai-integrations/openagents-deploy.sh init
```
Creates directory structure, SQLite registry, and default config.

### Register Agent
```bash
~/blackroad-ai-integrations/openagents-deploy.sh register \
  <agent_id> \
  <agent_name> \
  <agent_type> \
  [capabilities] \
  [endpoint]
```

**Agent Types:**
- `llm` - Language models (GPT, Claude, Llama)
- `vision` - Image/video processing
- `audio` - Speech/music processing
- `code` - Code generation/analysis
- `data` - Data processing/analysis
- `workflow` - Multi-step automation

**Example:**
```bash
~/blackroad-ai-integrations/openagents-deploy.sh register \
  claude-sonnet \
  "Claude Sonnet 4.5" \
  llm \
  "reasoning,coding,analysis" \
  https://api.anthropic.com/v1
```

### Deploy Agent
```bash
~/blackroad-ai-integrations/openagents-deploy.sh deploy <agent_id> [strategy]
```

**Strategies:**
- `local` (default) - Local development
- `cloudflare` - Cloudflare Workers
- `railway` - Railway.app

**Example:**
```bash
~/blackroad-ai-integrations/openagents-deploy.sh deploy claude-sonnet local
```

### Health Check
```bash
~/blackroad-ai-integrations/openagents-deploy.sh health
```
Checks all active agents, records response times, updates status.

### Platform Status
```bash
~/blackroad-ai-integrations/openagents-deploy.sh status
```
Shows:
- Agent statistics (total, active, pending, archived)
- Recent deployments
- Active agents list
- Health status summary

### List Agents
```bash
~/blackroad-ai-integrations/openagents-deploy.sh list [filter]
```

**Filters:**
- `all` (default) - All agents
- `active` - Only active agents
- `pending` - Awaiting deployment
- `unhealthy` - Failed health checks

### Start Monitoring
```bash
~/blackroad-ai-integrations/openagents-deploy.sh monitor
```
Starts background daemon for continuous health monitoring (60s intervals).

### Configure API
```bash
~/blackroad-ai-integrations/openagents-deploy.sh api
```
Regenerates API endpoint configuration.

## Integration with BlackRoad OS

### Memory System
The script automatically logs to BlackRoad memory:
```bash
~/memory-system.sh log "initialized" "openagents-platform" "..."
```

### Traffic Lights
Set project status:
```bash
~/blackroad-traffic-light.sh set openagents-platform green "All agents healthy"
```

### Agent Registry
Query agent registry:
```bash
ssh cecilia
cece-registry list openagents
```

## Example Workflows

### Deploying Multiple Agents
```bash
# GPT-4
~/blackroad-ai-integrations/openagents-deploy.sh register \
  gpt-4 "GPT-4" llm "reasoning,chat" https://api.openai.com/v1

# Claude Sonnet
~/blackroad-ai-integrations/openagents-deploy.sh register \
  claude-sonnet "Claude Sonnet" llm "reasoning,coding" https://api.anthropic.com/v1

# Stable Diffusion
~/blackroad-ai-integrations/openagents-deploy.sh register \
  stable-diffusion "Stable Diffusion XL" vision "image-generation" http://localhost:7860

# Deploy all
~/blackroad-ai-integrations/openagents-deploy.sh deploy gpt-4 local
~/blackroad-ai-integrations/openagents-deploy.sh deploy claude-sonnet local
~/blackroad-ai-integrations/openagents-deploy.sh deploy stable-diffusion local

# Start monitoring
~/blackroad-ai-integrations/openagents-deploy.sh monitor
```

### Querying Agent Registry
```bash
# SQLite direct access
sqlite3 ~/.blackroad/openagents/agent-registry.db

# List all agents
SELECT * FROM agents;

# Active agents with health status
SELECT name, type, health_status, last_health_check
FROM agents
WHERE status='active';

# Health check history
SELECT a.name, h.status, h.response_time_ms, h.checked_at
FROM health_checks h
JOIN agents a ON h.agent_id = a.id
ORDER BY h.checked_at DESC
LIMIT 10;

# Deployment history
SELECT a.name, d.deployment_type, d.status, d.deployed_at
FROM deployments d
JOIN agents a ON d.agent_id = a.id
ORDER BY d.deployed_at DESC;
```

## Configuration

Edit `~/.blackroad/openagents/config.json`:

```json
{
  "platform": {
    "api_port": 8080,
    "api_url": "https://api.openagents.com"
  },
  "registry": {
    "health_check_interval": 60
  },
  "agents": {
    "max_concurrent": 100,
    "default_timeout": 30000
  },
  "monitoring": {
    "enabled": true,
    "health_checks": true
  },
  "security": {
    "require_api_keys": true,
    "key_rotation_days": 90
  }
}
```

## Environment Variables

```bash
# API port (default: 8080)
export OPENAGENTS_API_PORT=8080

# API URL
export OPENAGENTS_API_URL=https://api.openagents.com
```

## Troubleshooting

### Registry Database Locked
```bash
# Kill any processes accessing the database
lsof ~/.blackroad/openagents/agent-registry.db

# Rebuild if corrupted
rm ~/.blackroad/openagents/agent-registry.db
~/blackroad-ai-integrations/openagents-deploy.sh init
```

### Health Checks Failing
```bash
# Check agent endpoint
curl http://localhost:8080/agents/<agent_id>/health

# View detailed logs
tail -f ~/.blackroad/openagents/health.log

# Manual health check
~/blackroad-ai-integrations/openagents-deploy.sh health
```

### Monitoring Daemon Not Running
```bash
# Check if running
pgrep -f monitor-daemon.sh

# Stop
pkill -f monitor-daemon.sh

# Restart
~/blackroad-ai-integrations/openagents-deploy.sh monitor
```

## Next Steps

1. **Build API Server**: Create REST API for agent orchestration
2. **Add Authentication**: Implement API key verification
3. **Create Web UI**: Dashboard for agent management
4. **Add Metrics**: Prometheus/Grafana integration
5. **Implement Queues**: Redis/RabbitMQ for task distribution
6. **Add Rate Limiting**: Prevent abuse
7. **Create SDKs**: Python, TypeScript, Go clients

## Resources

- OpenAgents Documentation: https://docs.openagents.com
- BlackRoad OS: ~/BLACKROAD_BRAND_SYSTEM.md
- Agent Registry Schema: See `init_openagents()` in deployment script
- API Endpoints: `~/.blackroad/openagents/api-endpoints.json`
