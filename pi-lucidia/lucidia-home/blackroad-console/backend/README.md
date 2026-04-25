# BlackRoad Console Backend API

Complete backend infrastructure for BlackRoad OS Console.

## Features

- **Token Vault**: Encrypted API key storage with automatic rotation
- **Agent Management**: Create, monitor, and manage AI agents
- **Memory System**: PS-SHA-∞ encrypted memory graph with connections
- **Health Monitoring**: Real-time system health and network topology
- **WebSocket Support**: Live updates for all resources
- **SQLite Database**: Fast, reliable data persistence
- **JWT Authentication**: Secure user sessions

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Token Vault
- `GET /api/vault/tokens` - List all tokens
- `GET /api/vault/tokens/:id` - Get token (decrypted)
- `POST /api/vault/tokens` - Create new token
- `PATCH /api/vault/tokens/:id` - Update token
- `POST /api/vault/tokens/:id/rotate` - Rotate token
- `DELETE /api/vault/tokens/:id` - Delete token
- `GET /api/vault/stats` - Get vault statistics
- `GET /api/vault/cli-tools` - Get CLI tools

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent with metrics
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `POST /api/agents/:id/metrics` - Add metrics
- `DELETE /api/agents/:id` - Delete agent

### Memory
- `GET /api/memory` - List memories (filterable)
- `GET /api/memory/:id` - Get single memory
- `POST /api/memory` - Create memory
- `PATCH /api/memory/:id` - Update memory
- `DELETE /api/memory/:id` - Delete memory
- `GET /api/memory/graph/data` - Get graph data

### Health
- `GET /api/health/nodes` - Get all nodes
- `POST /api/health/nodes` - Register node
- `POST /api/health/nodes/:id/heartbeat` - Update heartbeat
- `GET /api/health/stats` - Get statistics
- `DELETE /api/health/nodes/:id` - Remove node

## WebSocket Connection

Connect to `ws://localhost:3000` and authenticate:

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### WebSocket Events

- `agent_update` - Agent status changed
- `health_update` - Node health updated
- `memory_update` - Memory created/updated
- `vault_update` - Token rotated/updated

## Database Schema

- **users** - User accounts
- **vault_tokens** - Encrypted API tokens
- **cli_tools** - Connected CLI tools
- **agents** - AI agent instances
- **agent_metrics** - Time-series agent metrics
- **memories** - Memory vault entries
- **health_nodes** - System nodes
- **activity_log** - Audit trail
- **sessions** - Active user sessions

## Security Features

- **AES-256-GCM** encryption for API tokens
- **PS-SHA-∞** cascade hashing for memories
- **BCrypt** password hashing (10 rounds)
- **JWT** token-based authentication
- **Session management** with expiration
- **Activity logging** for audit trails

## Deployment

### On Raspberry Pi (Lucidia)

```bash
# Copy backend to Pi
scp -r backend pi@192.168.4.38:/home/pi/blackroad-console-backend

# SSH into Pi
ssh pi@192.168.4.38

# Install dependencies
cd blackroad-console-backend
npm install --production

# Create systemd service
sudo nano /etc/systemd/system/blackroad-api.service
```

```ini
[Unit]
Description=BlackRoad Console API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad-console-backend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable blackroad-api
sudo systemctl start blackroad-api
sudo systemctl status blackroad-api
```

### Nginx Reverse Proxy

Add to `/etc/nginx/sites-available/blackroad-console`:

```nginx
# API proxy
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# WebSocket proxy
location /ws {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

## Development

```bash
# Run with auto-reload
npm run dev

# Initialize fresh database
rm data/console.db
npm run init-db

# View logs
journalctl -u blackroad-api -f
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | (required) |
| `DB_PATH` | SQLite database path | ./data/console.db |
| `ENCRYPTION_KEY` | Token encryption key | (required) |
| `ALLOWED_ORIGINS` | CORS origins | * |

## License

MIT
