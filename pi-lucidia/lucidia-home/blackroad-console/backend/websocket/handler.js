import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const clients = new Map(); // userId -> Set of WebSocket connections

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection attempt');

    // Authenticate via query param or first message
    let userId = null;
    let authenticated = false;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        // Handle authentication
        if (message.type === 'auth' && !authenticated) {
          try {
            const decoded = jwt.verify(message.token, JWT_SECRET);
            userId = decoded.userId;
            authenticated = true;

            // Add to clients map
            if (!clients.has(userId)) {
              clients.set(userId, new Set());
            }
            clients.get(userId).add(ws);

            ws.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authenticated successfully'
            }));

            console.log(`User ${userId} connected via WebSocket`);
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Invalid token'
            }));
            ws.close();
          }
          return;
        }

        if (!authenticated) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Not authenticated'
          }));
          return;
        }

        // Handle other message types
        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;

          case 'subscribe':
            // Subscribe to specific events
            ws.subscriptions = ws.subscriptions || new Set();
            ws.subscriptions.add(message.channel);
            ws.send(JSON.stringify({
              type: 'subscribed',
              channel: message.channel
            }));
            break;

          case 'unsubscribe':
            if (ws.subscriptions) {
              ws.subscriptions.delete(message.channel);
            }
            ws.send(JSON.stringify({
              type: 'unsubscribed',
              channel: message.channel
            }));
            break;

          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      if (userId && clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) {
          clients.delete(userId);
        }
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');
}

// Broadcast to all connected clients for a user
export function broadcastToUser(userId, message) {
  if (!clients.has(userId)) return;

  const userClients = clients.get(userId);
  const data = JSON.stringify(message);

  userClients.forEach(ws => {
    if (ws.readyState === 1) { // OPEN
      ws.send(data);
    }
  });
}

// Broadcast to all connected clients
export function broadcastToAll(message) {
  const data = JSON.stringify(message);

  clients.forEach(userClients => {
    userClients.forEach(ws => {
      if (ws.readyState === 1) {
        ws.send(data);
      }
    });
  });
}

// Specific broadcast functions
export function broadcastAgentUpdate(agentData) {
  broadcastToAll({
    type: 'agent_update',
    data: agentData,
    timestamp: Date.now()
  });
}

export function broadcastHealthUpdate(healthData) {
  broadcastToAll({
    type: 'health_update',
    data: healthData,
    timestamp: Date.now()
  });
}

export function broadcastMemoryUpdate(memoryData) {
  broadcastToAll({
    type: 'memory_update',
    data: memoryData,
    timestamp: Date.now()
  });
}

export function broadcastVaultUpdate(vaultData) {
  broadcastToAll({
    type: 'vault_update',
    data: vaultData,
    timestamp: Date.now()
  });
}
