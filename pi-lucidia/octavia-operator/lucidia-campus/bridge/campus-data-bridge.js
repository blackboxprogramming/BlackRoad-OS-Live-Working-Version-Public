/**
 * Campus Data Bridge
 *
 * Lightweight WebSocket server that subscribes to NATS topics
 * and relays structured payloads to connected Unity clients.
 *
 * Deployment: olympia (Pi 4B) via PM2
 * Memory target: < 10MB RAM
 *
 * BlackRoad OS, Inc. — Confidential
 */

const WebSocket = require("ws");
const { connect } = require("nats");

// Configuration
const CONFIG = {
  ws: {
    port: parseInt(process.env.BRIDGE_WS_PORT || "9100", 10),
    host: process.env.BRIDGE_WS_HOST || "0.0.0.0",
  },
  nats: {
    servers: process.env.NATS_URL || "nats://localhost:4222",
  },
  // NATS topics mapped to campus display targets
  topics: [
    {
      subject: "system.coherence.current",
      target: "fountain.coherence",
      interval: 5000,
    },
    {
      subject: "lucidia.journal.append",
      target: "vault.journal",
      interval: 0, // real-time
    },
    {
      subject: "nats.message.flow",
      target: "commtower.eventbus",
      interval: 0,
    },
    {
      subject: "agents.registry.update",
      target: "commtower.directory",
      interval: 0,
    },
    {
      subject: "k3s.pods.health",
      target: "lab4.monitoring",
      interval: 10000,
    },
    {
      subject: "roadchain.block.new",
      target: "lab5.blockchain",
      interval: 0,
    },
    {
      subject: "tasks.queue.active",
      target: "commtower.supervisor",
      interval: 0,
    },
    {
      subject: "contradictions.queue",
      target: "quarantine.cells",
      interval: 0,
    },
    {
      subject: "agents.presence.update",
      target: "campus.presence",
      interval: 30000,
    },
    {
      subject: "community.board.post",
      target: "plaza.board",
      interval: 0,
    },
  ],
};

// Track connected Unity clients
const clients = new Set();

// Throttle state for interval-limited topics
const lastSent = new Map();

/**
 * Broadcast a message to all connected Unity clients.
 */
function broadcast(target, payload) {
  const message = JSON.stringify({
    target,
    timestamp: Date.now(),
    data: payload,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

/**
 * Check if a throttled topic should be sent.
 */
function shouldSend(subject, interval) {
  if (interval === 0) return true;
  const now = Date.now();
  const last = lastSent.get(subject) || 0;
  if (now - last >= interval) {
    lastSent.set(subject, now);
    return true;
  }
  return false;
}

async function main() {
  // Connect to NATS
  let nc;
  try {
    nc = await connect({ servers: CONFIG.nats.servers });
    console.log(`[bridge] Connected to NATS at ${CONFIG.nats.servers}`);
  } catch (err) {
    console.error(`[bridge] Failed to connect to NATS: ${err.message}`);
    console.log("[bridge] Running in offline mode — no live data");
    nc = null;
  }

  // Start WebSocket server
  const wss = new WebSocket.Server({
    port: CONFIG.ws.port,
    host: CONFIG.ws.host,
  });

  console.log(
    `[bridge] WebSocket server listening on ${CONFIG.ws.host}:${CONFIG.ws.port}`
  );

  wss.on("connection", (ws, req) => {
    const clientAddr = req.socket.remoteAddress;
    console.log(`[bridge] Unity client connected: ${clientAddr}`);
    clients.add(ws);

    // Send initial state snapshot on connect
    ws.send(
      JSON.stringify({
        target: "bridge.status",
        timestamp: Date.now(),
        data: {
          status: nc ? "connected" : "offline",
          topics: CONFIG.topics.map((t) => t.subject),
          clients: clients.size,
        },
      })
    );

    ws.on("close", () => {
      console.log(`[bridge] Unity client disconnected: ${clientAddr}`);
      clients.delete(ws);
    });

    ws.on("error", (err) => {
      console.error(`[bridge] Client error (${clientAddr}): ${err.message}`);
      clients.delete(ws);
    });
  });

  // Subscribe to NATS topics and relay to Unity clients
  if (nc) {
    for (const topic of CONFIG.topics) {
      const sub = nc.subscribe(topic.subject);
      (async () => {
        for await (const msg of sub) {
          if (!shouldSend(topic.subject, topic.interval)) continue;

          let payload;
          try {
            payload = JSON.parse(msg.data.toString());
          } catch {
            payload = { raw: msg.data.toString() };
          }

          broadcast(topic.target, payload);
        }
      })();
      console.log(
        `[bridge] Subscribed to ${topic.subject} -> ${topic.target}`
      );
    }
  }

  // Health check endpoint via WebSocket ping
  setInterval(() => {
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    }
  }, 30000);

  // Graceful shutdown
  const shutdown = async () => {
    console.log("[bridge] Shutting down...");
    wss.close();
    if (nc) {
      await nc.drain();
      await nc.close();
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(`[bridge] Fatal error: ${err.message}`);
  process.exit(1);
});
