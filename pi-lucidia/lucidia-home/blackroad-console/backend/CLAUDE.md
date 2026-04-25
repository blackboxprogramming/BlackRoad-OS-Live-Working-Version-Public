# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlackRoad Console Backend API - Complete backend infrastructure for BlackRoad OS Console. This is a Node.js/Express REST API with WebSocket support, JWT authentication, SQLite database, and integrated AI agent management.

**Core Features:**
- Token Vault: AES-256-GCM encrypted API key storage with automatic rotation
- Agent Management: Create, monitor, and manage AI agents (Alice/Claude, Aria/OpenAI, Lucidia/Gemma)
- Memory System: PS-SHA-∞ encrypted memory graph with connections
- Health Monitoring: Real-time system health and network topology
- WebSocket Support: Live updates for all resources
- JWT Authentication: Secure user sessions with activity logging

## Architecture

### Backend Structure (Node.js/Express)

```
server.js                 # Main Express app, HTTP/WebSocket server initialization
├── api/                  # REST API route handlers
│   ├── auth.js          # Registration, login, logout, session management
│   ├── vault.js         # Token CRUD, encryption/decryption, rotation
│   ├── agents.js        # Agent CRUD, metrics, status updates
│   ├── memory.js        # Memory CRUD, graph data, PS-SHA-∞ hashing
│   └── health.js        # Health nodes, heartbeats, system stats
├── auth/
│   └── middleware.js    # JWT verification, session validation
├── db/
│   └── init.js          # SQLite schema, database initialization
├── services/
│   └── logger.js        # Activity logging utilities
└── websocket/
    └── handler.js       # WebSocket authentication, message routing, broadcast
```

### AI Agent Structure (Python/Flask)

Agents run as separate Python Flask services on different machines/IPs:
- `alice_agent.py` - Claude-powered agent (Anthropic API)
- `aria_agent.py` - OpenAI-powered agent (OpenAI API)
- `lucidia_agent.py` - Gemma-powered agent (Ollama local instance)
- `ai_neighborhood_coordinator.py` - Coordinates agent communication

Each agent exposes:
- `/health` - Health check endpoint
- `/chat` - Chat endpoint for conversation

### Database Schema

SQLite database with 9 tables:
- **users** - User accounts with bcrypt password hashing
- **vault_tokens** - Encrypted API tokens (AES-256-GCM)
- **cli_tools** - Connected CLI tools metadata
- **agents** - AI agent instances, status, capabilities
- **agent_metrics** - Time-series metrics (CPU, memory, tasks, uptime)
- **memories** - Memory vault with PS-SHA-∞ hashing and connections
- **health_nodes** - System nodes with heartbeat tracking
- **activity_log** - Audit trail for all user actions
- **sessions** - JWT session management

Uses WAL mode for better concurrency, foreign keys enabled.

## Development Commands

```bash
# Install dependencies
npm install

# Initialize database (creates data/console.db with schema)
npm run init-db

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Fresh database reset
rm data/console.db && npm run init-db
```

## Deployment

### Target: Raspberry Pi (Lucidia)
- Host: `pi@192.168.4.38`
- Deploy directory: `/home/pi/blackroad-console-backend`
- Systemd service: `blackroad-api.service`
- Nginx reverse proxy: `/api` and `/ws` endpoints

```bash
# Deploy to Pi (automated)
./deploy.sh

# Manual deployment
rsync -avz --exclude 'node_modules' --exclude 'data' . pi@192.168.4.38:/home/pi/blackroad-console-backend/
ssh pi@192.168.4.38 'cd /home/pi/blackroad-console-backend && npm install --production && npm run init-db'
ssh pi@192.168.4.38 'sudo systemctl restart blackroad-api'

# Check status
ssh pi@192.168.4.38 'sudo systemctl status blackroad-api'

# View logs
ssh pi@192.168.4.38 'sudo journalctl -u blackroad-api -f'
```

## Environment Variables

Required in `.env` (use `.env.example` as template):
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - production or development
- `JWT_SECRET` - Secret for JWT signing (MUST change in production)
- `ENCRYPTION_KEY` - AES encryption key for vault tokens (MUST change in production)
- `DB_PATH` - SQLite database path (default: ./data/console.db)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## Key Implementation Patterns

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server creates session in DB, returns JWT token
3. Client includes `Authorization: Bearer <token>` in all requests
4. `authenticateToken` middleware validates JWT, checks session, attaches `req.user`
5. Session activity timestamp updated on each request

### Token Vault Encryption
- Tokens encrypted with AES-256-GCM using `crypto-js`
- `encryptToken()` and `decryptToken()` in `api/vault.js`
- Encrypted values stored in DB, decrypted only on GET requests
- Rotation creates new token, archives old one, updates `last_rotated`

### WebSocket Communication
1. Client connects to `ws://localhost:3000`
2. Client sends `{type: 'auth', token: '<jwt>'}` message
3. Server validates JWT, adds connection to `clients` Map (userId -> Set<WebSocket>)
4. Server broadcasts updates via `broadcast(userId, message)` function
5. Event types: `agent_update`, `health_update`, `memory_update`, `vault_update`

### Memory Graph System
- Memories have `connections` field (JSON array of memory IDs)
- PS-SHA-∞ cascade hashing stored in `hash` field
- Graph data endpoint `/api/memory/graph/data` returns nodes and edges
- Supports filtering by category, agent_id, search query

## Production URLs
- https://app.blackroad.io/ (Primary Console)
- https://app.blackroad.io/api (API Endpoint)
- https://console.blackroad.systems/api (Alternative)
- https://os.blackroad.me/api (Alternative)
- https://desktop.lucidia.earth/api (Alternative)

## Infrastructure Context
- Pi runs backend API, nginx reverse proxy, Lucidia agent (Ollama/Gemma)
- Alice agent runs on separate machine (Claude/Anthropic)
- Aria agent runs on separate machine (OpenAI)
- Frontend deployed via Cloudflare Pages
