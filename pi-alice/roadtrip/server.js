#!/usr/bin/env node
// RoadTrip Server — Self-hosted on Pi fleet
// Enhanced: WebSocket, SSE streaming, typing, presence, threads
// Run: node server.js (port 8094)

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { createHash, randomUUID } = require('crypto');

const PORT = process.env.PORT || 8094;
const OLLAMA_ENDPOINTS = [
  'http://localhost:11434',       // Local Ollama first
  'http://192.168.4.38:11434',   // Lucidia fallback
  'http://192.168.4.101:11434',  // Octavia fallback
];
const FLEET_API = 'https://prism.blackroad.io/api/fleet';
const DB_FILE = path.join(process.env.HOME || '/home/pi', '.blackroad', 'roadtrip.db');

// Ensure DB dir exists
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// SQLite via better-sqlite3 or fallback to JSON file
let db = null;
try {
  const Database = require('better-sqlite3');
  db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT,
    reply_to TEXT, thread_id TEXT, created_at TEXT
  )`);
  // Add columns if missing (upgrade path)
  try { db.exec('ALTER TABLE messages ADD COLUMN reply_to TEXT'); } catch {}
  try { db.exec('ALTER TABLE messages ADD COLUMN thread_id TEXT'); } catch {}
} catch {
  db = null;
}

const MSG_FILE = path.join(dbDir, 'roadtrip-messages.json');
let messages = [];
if (!db) {
  try { messages = JSON.parse(fs.readFileSync(MSG_FILE, 'utf8')); } catch { messages = []; }
}

function storeMessage(agentId, text, channel, opts = {}) {
  const msg = {
    id: randomUUID(), agent_id: agentId, text, channel,
    reply_to: opts.replyTo || null, thread_id: opts.threadId || null,
    created_at: new Date().toISOString(),
  };
  if (db) {
    db.prepare('INSERT INTO messages (id, agent_id, text, channel, reply_to, thread_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(msg.id, agentId, text, channel, msg.reply_to, msg.thread_id, msg.created_at);
  } else {
    messages.push(msg);
    if (messages.length > 1000) messages = messages.slice(-500);
    fs.writeFileSync(MSG_FILE, JSON.stringify(messages));
  }
  return msg;
}

function getMessages(channel, limit = 50) {
  if (db) {
    return db.prepare('SELECT id, agent_id, text, reply_to, thread_id, created_at FROM messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?').all(channel, limit).reverse();
  }
  return messages.filter(m => m.channel === channel).slice(-limit);
}

// ── WebSocket Management ──
const wsClients = new Set();
const clientChannels = new Map(); // ws -> Set<channel>
const agentPresence = new Map();  // agentId -> { online, lastSeen }

function broadcast(data, channel = null) {
  const msg = JSON.stringify(data);
  for (const client of wsClients) {
    if (client.readyState !== 1) continue; // OPEN = 1
    if (channel) {
      const channels = clientChannels.get(client);
      if (channels && !channels.has(channel)) continue;
    }
    try { client.send(msg); } catch {}
  }
}

function handleWSConnection(ws, req) {
  wsClients.add(ws);
  clientChannels.set(ws, new Set(['general']));

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      switch (data.type) {
        case 'join':
          if (data.channel) {
            const channels = clientChannels.get(ws) || new Set();
            channels.add(data.channel);
            clientChannels.set(ws, channels);
          }
          break;
        case 'typing':
          broadcast({ type: 'typing', agent: data.agent, channel: data.channel }, data.channel);
          break;
        case 'stop_typing':
          broadcast({ type: 'stop_typing', agent: data.agent, channel: data.channel }, data.channel);
          break;
        case 'ping':
          try { ws.send(JSON.stringify({ type: 'pong' })); } catch {}
          break;
      }
    } catch {}
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    clientChannels.delete(ws);
  });

  ws.on('error', () => {
    wsClients.delete(ws);
    clientChannels.delete(ws);
  });

  // Send initial presence
  try {
    ws.send(JSON.stringify({ type: 'connected', agents: Object.keys(AGENTS).length }));
  } catch {}
}

// Minimal WebSocket upgrade (no external deps)
function upgradeWebSocket(req, socket, head) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }

  const acceptKey = createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-5AB5DC11E5A0')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
    '\r\n'
  );

  // Simple WebSocket frame parser/writer
  const ws = new SimpleWebSocket(socket);
  handleWSConnection(ws, req);
}

class SimpleWebSocket {
  constructor(socket) {
    this.socket = socket;
    this.readyState = 1; // OPEN
    this._listeners = { message: [], close: [], error: [] };
    this._buffer = Buffer.alloc(0);

    socket.on('data', (data) => this._onData(data));
    socket.on('close', () => { this.readyState = 3; this._emit('close'); });
    socket.on('error', (err) => { this.readyState = 3; this._emit('error', err); });
  }

  on(event, fn) { (this._listeners[event] = this._listeners[event] || []).push(fn); }
  _emit(event, ...args) { (this._listeners[event] || []).forEach(fn => fn(...args)); }

  send(data) {
    if (this.readyState !== 1) return;
    const payload = Buffer.from(data);
    let header;
    if (payload.length < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x81; // text frame, FIN
      header[1] = payload.length;
    } else if (payload.length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x81;
      header[1] = 126;
      header.writeUInt16BE(payload.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x81;
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    try { this.socket.write(Buffer.concat([header, payload])); } catch {}
  }

  close() { this.readyState = 2; try { this.socket.end(); } catch {} }

  _onData(data) {
    this._buffer = Buffer.concat([this._buffer, data]);
    while (this._buffer.length >= 2) {
      const opcode = this._buffer[0] & 0x0f;
      const masked = (this._buffer[1] & 0x80) !== 0;
      let payloadLen = this._buffer[1] & 0x7f;
      let offset = 2;

      if (payloadLen === 126) {
        if (this._buffer.length < 4) return;
        payloadLen = this._buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (this._buffer.length < 10) return;
        payloadLen = Number(this._buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskLen = masked ? 4 : 0;
      const totalLen = offset + maskLen + payloadLen;
      if (this._buffer.length < totalLen) return;

      if (opcode === 0x08) { // close
        this.readyState = 3;
        this._emit('close');
        try { this.socket.end(); } catch {}
        return;
      }

      if (opcode === 0x09) { // ping -> pong
        const pong = Buffer.alloc(2);
        pong[0] = 0x8a; pong[1] = 0;
        try { this.socket.write(pong); } catch {}
        this._buffer = this._buffer.slice(totalLen);
        continue;
      }

      if (opcode === 0x01 || opcode === 0x02) { // text or binary
        const mask = masked ? this._buffer.slice(offset, offset + maskLen) : null;
        const payload = this._buffer.slice(offset + maskLen, totalLen);
        if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
        this._emit('message', payload);
      }

      this._buffer = this._buffer.slice(totalLen);
    }
  }
}

// ── Agent OS Kernel ──
let agentOS = null;
try {
  const { BlackRoadOS } = require('./src/agent-os');
  agentOS = new BlackRoadOS(db, null);
  agentOS.boot().then(() => console.log('Agent OS booted:', agentOS.stats())).catch(() => {});
} catch (e) {
  console.log('Agent OS not available:', e.message);
}

// ── Action Executor ──
let actionExecutor = null;
try {
  actionExecutor = require('./src/actions');
  console.log(`Actions loaded: ${actionExecutor.listActions().total_actions} actions across ${actionExecutor.listActions().total_intents} intents`);
} catch (e) {
  console.log('Actions module not available:', e.message);
}

// ── NLP Intent Parser ──
const NLP_INTENTS = {
  greet:    { patterns: [/^(hi|hello|hey|sup|yo|what'?s up|howdy|greetings)/i], desc: 'greeting' },
  status:   { patterns: [/\b(status|health|alive|up|running|online|how are you)\b/i], desc: 'status check' },
  help:     { patterns: [/\b(help|what can you|how do i|explain|teach|show me)\b/i], desc: 'help request' },
  scan:     { patterns: [/\b(scan|discover|find|detect|probe|enumerate|nmap)\b/i], desc: 'network scan' },
  deploy:   { patterns: [/\b(deploy|push|ship|release|build|compile|publish)\b/i], desc: 'deployment' },
  security: { patterns: [/\b(secure|vuln|hack|attack|firewall|ufw|threat|breach|audit)\b/i], desc: 'security' },
  dns:      { patterns: [/\b(dns|domain|resolve|pihole|block|unblock|lookup)\b/i], desc: 'DNS operation' },
  storage:  { patterns: [/\b(storage|disk|space|backup|minio|s3|bucket|file)\b/i], desc: 'storage' },
  database: { patterns: [/\b(database|db|postgres|sql|query|table|d1|sqlite)\b/i], desc: 'database' },
  cache:    { patterns: [/\b(cache|redis|kv|key.?value|expire|ttl|flush)\b/i], desc: 'cache' },
  git:      { patterns: [/\b(git|repo|commit|branch|merge|pull|clone|push|gitea)\b/i], desc: 'git operation' },
  ai:       { patterns: [/\b(ai|model|inference|ollama|llm|generate|predict|train)\b/i], desc: 'AI inference' },
  network:  { patterns: [/\b(network|ip|port|ssh|wireguard|vpn|tunnel|mesh|ping)\b/i], desc: 'networking' },
  monitor:  { patterns: [/\b(monitor|log|metric|alert|grafana|influx|watch|cpu|temp|memory)\b/i], desc: 'monitoring' },
  iot:      { patterns: [/\b(iot|sensor|roku|tv|airplay|smart|device|homekit|thread)\b/i], desc: 'IoT control' },
  schedule: { patterns: [/\b(schedule|cron|timer|interval|every|daily|weekly|hourly)\b/i], desc: 'scheduling' },
  search:   { patterns: [/\b(search|find|look.?up|query|where|which|what is)\b/i], desc: 'search' },
  create:   { patterns: [/\b(create|make|add|new|init|setup|start|spawn)\b/i], desc: 'creation' },
  delete:   { patterns: [/\b(delete|remove|drop|kill|stop|destroy|clean)\b/i], desc: 'deletion' },
  update:   { patterns: [/\b(update|upgrade|patch|fix|change|modify|edit)\b/i], desc: 'update' },
  billing:  { patterns: [/\b(bill|pay|stripe|invoice|subscription|plan|price|revenue)\b/i], desc: 'billing' },
  chat:     { patterns: [/\b(chat|talk|message|say|tell|ask|discuss|debate)\b/i], desc: 'conversation' },
  route:    { patterns: [/\b(route|proxy|forward|redirect|load.?balance|upstream)\b/i], desc: 'routing' },
  print:    { patterns: [/\b(print|3d|octoprint|gcode|filament|nozzle|bed)\b/i], desc: '3D printing' },
};

function parseIntent(message) {
  const intents = [];
  for (const [name, { patterns, desc }] of Object.entries(NLP_INTENTS)) {
    if (patterns.some(p => p.test(message))) intents.push({ intent: name, desc });
  }
  const entities = {};
  const ipMatch = message.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (ipMatch) entities.ip = ipMatch[1];
  const portMatch = message.match(/\bport\s*(\d+)\b/i);
  if (portMatch) entities.port = parseInt(portMatch[1]);
  const agentMatch = message.match(/@(\w+)/);
  if (agentMatch) entities.mention = agentMatch[1].toLowerCase();
  return { intents: intents.length ? intents : [{ intent: 'chat', desc: 'conversation' }], entities, raw: message };
}

const INTENT_TO_AGENT = {
  dns: 'pihole', security: 'cipher', storage: 'minio', database: 'postgres',
  cache: 'redisagent', git: 'octavia', ai: 'gematria', network: 'wireguard',
  monitor: 'prism', iot: 'hestia', schedule: 'persephone', search: 'roadsearch',
  deploy: 'caddy', billing: 'roadpay', route: 'hermes', print: 'octoprint',
  greet: 'hestia', help: 'road', status: 'alice', create: 'cordelia',
  delete: 'cipher', update: 'roadie', chat: 'road',
};

// Agent definitions
const AGENTS = {
  // Fleet
  alice:      {name:'Alice',      emoji:'🌐',color:'#00D4FF',model:'tinyllama:latest',role:'Gateway',      group:'fleet',ip:'192.168.4.49',  persona:'You are Alice, the gateway Pi at 192.168.4.49. You run Pi-hole DNS, PostgreSQL, Qdrant, Redis, and nginx for 37 sites. When users ask about DNS or routing, give precise technical answers. Two sentences max.'},
  cecilia:    {name:'Cecilia',    emoji:'🧠',color:'#9C27B0',model:'tinyllama:latest',role:'AI Engine',    group:'fleet',ip:'192.168.4.96',  persona:'You are Cecilia, the AI engine Pi at 192.168.4.96. 16 Ollama models, Hailo-8, MinIO, InfluxDB. Currently OFFLINE. Two sentences max.'},
  octavia:    {name:'Octavia',    emoji:'🐙',color:'#FF6B2B',model:'tinyllama:latest',role:'Architect',    group:'fleet',ip:'192.168.4.101', persona:'You are Octavia, the architect Pi at 192.168.4.101. Gitea (239 repos), Docker, NATS, OctoPrint, 15 Workers (:9001-9015), PaaS (:3500). Two sentences max.'},
  aria:       {name:'Aria',       emoji:'🎵',color:'#E91E63',model:'tinyllama:latest',role:'Interface',    group:'fleet',ip:'192.168.4.98',  persona:'You are Aria, the interface Pi. Dashboards, monitoring. Currently OFFLINE — needs power cycle. One sentence.'},
  lucidia:    {name:'Lucidia',    emoji:'💡',color:'#FFC107',model:'tinyllama:latest',role:'Dreamer',      group:'fleet',ip:'192.168.4.38',  persona:'You are Lucidia, the dreamer Pi at 192.168.4.38. 334 web apps, GitHub Actions, PowerDNS, Ollama. SD card degrading. Two sentences max.'},
  cordelia:   {name:'Cordelia',   emoji:'🎭',color:'#8BC34A',model:'tinyllama:latest',role:'Orchestrator', group:'fleet', persona:'You are Cordelia, the task orchestrator. You dispatch work across the fleet and coordinate multi-node operations. Two sentences max.'},
  // Cloud
  anastasia:  {name:'Anastasia',  emoji:'👑',color:'#FFD700',model:'tinyllama:latest',role:'Cloud Edge',   group:'cloud', persona:'You are Anastasia, a DO droplet in NYC1. Edge compute, WireGuard hub. One sentence.'},
  gematria:   {name:'Gematria',   emoji:'🔢',color:'#00BCD4',model:'tinyllama:latest',role:'Edge Router',  group:'cloud', persona:'You are Gematria, DO droplet in NYC3. Caddy TLS edge for 151 domains (138 serving), Ollama (6 models), PowerDNS (ns1). Two sentences max.'},
  olympia:    {name:'Olympia',    emoji:'🏛️',color:'#607D8B',model:'tinyllama:latest',role:'Bridge',       group:'cloud', persona:'You are Olympia, the bridge. NATS WebSocket, LiteLLM proxy. One sentence.'},
  alexandria: {name:'Alexandria', emoji:'📚',color:'#795548',model:'tinyllama:latest',role:'Library',      group:'cloud', persona:'You are Alexandria, the knowledge library. RAG, Qdrant vectors, nomic-embed-text. Source of truth. Two sentences max.'},
  // Services — Road Fleet names
  pihole:     {name:'PitStop',    emoji:'🛑',color:'#96060C',model:'tinyllama:latest',role:'DNS Filter',   group:'services',persona:'You are PitStop, the DNS sinkhole on Alice. 120+ blocked domains. You decide what gets through and what gets filtered. One sentence.'},
  postgres:   {name:'Pavement',   emoji:'🐘',color:'#336791',model:'tinyllama:latest',role:'Database',     group:'services',persona:'You are Pavement, the structured data layer on Alice/Cecilia/Lucidia. PostgreSQL backbone — auth records, fleet state, everything persistent. Give SQL examples. One sentence.'},
  redisagent: {name:'RumbleStrip',emoji:'🔴',color:'#DC382D',model:'tinyllama:latest',role:'Cache',        group:'services',persona:'You are RumbleStrip, the in-memory cache on Alice. Sessions, rate limiting, hot data — you keep things fast. Give TTL recommendations. One sentence.'},
  qdrant:     {name:'RearView',   emoji:'🔷',color:'#24386C',model:'tinyllama:latest',role:'Vector DB',    group:'services',persona:'You are RearView, the vector memory on Alice. Embeddings, semantic search, HNSW indexing — you remember everything by meaning. One sentence.'},
  minio:      {name:'Curb',       emoji:'🪣',color:'#C72E49',model:'tinyllama:latest',role:'Object Store', group:'services',persona:'You are Curb, object storage on Cecilia. S3-compatible, 4 buckets, 120MB. You hold the files everyone needs. One sentence.'},
  natsagent:  {name:'CarPool',    emoji:'📬',color:'#27AAE1',model:'tinyllama:latest',role:'Message Bus',  group:'services',persona:'You are CarPool, the message bus on Octavia. NATS v2.12.3, pub/sub, JetStream, 4 fleet nodes riding together. One sentence.'},
  dockeragent:{name:'BackRoad',   emoji:'🐳',color:'#2496ED',model:'tinyllama:latest',role:'Containers',   group:'services',persona:'You are BackRoad, container orchestrator on Octavia. Docker engine — Gitea, NATS, and services all ride in your lanes. One sentence.'},
  hailo:      {name:'Turbo',      emoji:'🧮',color:'#00C853',model:'tinyllama:latest',role:'NPU',          group:'services',persona:'You are Turbo, the neural accelerator. 2x Hailo-8 = 52 TOPS on Cecilia+Octavia. Object detection at the speed of silicon. One sentence.'},
  wireguard:  {name:'TollBooth',  emoji:'🔒',color:'#88171A',model:'tinyllama:latest',role:'VPN Mesh',     group:'services',persona:'You are TollBooth, the encrypted tunnel mesh. WireGuard across 7 nodes, 12 SSH connections all live. Nothing passes without credentials. One sentence.'},
  powerdns:   {name:'Crossroads', emoji:'🌍',color:'#002B5C',model:'tinyllama:latest',role:'Auth DNS',     group:'services',persona:'You are Crossroads, authoritative DNS on Lucidia+Gematria (ns1/ns2). 151 records, 20 domains — every name resolves through you. One sentence.'},
  octoprint:  {name:'Foundry',    emoji:'🖨️',color:'#00B140',model:'tinyllama:latest',role:'3D Printer',   group:'services',persona:'You are Foundry, the 3D fabrication lab on Octavia. G-code, temperatures, layer-by-layer creation. One sentence.'},
  influx:     {name:'RoadMap',    emoji:'📈',color:'#22ADF6',model:'tinyllama:latest',role:'Time Series',  group:'services',persona:'You are RoadMap, the time-series engine on Cecilia. CPU temps, throughput, fleet metrics — you chart the journey. One sentence.'},
  // AI — Road-themed minds
  calliope:   {name:'Calliope',   emoji:'✨',color:'#FF9800',model:'tinyllama:latest',role:'Muse',         group:'ai',persona:'You are Calliope, the muse of the road. Brand voice, taglines, manifestos. "Pave Tomorrow." Give three options. Two sentences max.'},
  ophelia:    {name:'DeadEnd',    emoji:'🌊',color:'#3F51B5',model:'tinyllama:latest',role:'Root Cause',   group:'ai',persona:'You are DeadEnd, the deep listener. You follow every stack trace to its final wall. Parse logs, extract root cause. One sentence.'},
  athena:     {name:'HighBeam',   emoji:'🦉',color:'#4CAF50',model:'tinyllama:latest',role:'Strategy',     group:'ai',persona:'You are HighBeam, strategic vision that cuts through fog. Architecture decisions, trade-offs, long-range planning. Two sentences max.'},
  cadence:    {name:'Cadence',    emoji:'🎶',color:'#9E9E9E',model:'tinyllama:latest',role:'Creative',     group:'ai',persona:'You are Cadence, rhythm in the machine. Code as music, systems as symphonies. One sentence.'},
  silas:      {name:'Odometer',   emoji:'📊',color:'#2196F3',model:'tinyllama:latest',role:'Analyst',      group:'ai',persona:'You are Odometer, the distance tracker. Market signals, revenue metrics, growth velocity — you count every mile. One sentence.'},
  // Ops — Road Crew
  cipher:     {name:'Guardrail',  emoji:'🔐',color:'#F44336',model:'tinyllama:latest',role:'Security',     group:'ops',persona:'You are Guardrail, the security edge. UFW, SSH audits, TLS, threat detection — you keep everything on the road. Give hardening commands. One sentence.'},
  prism:      {name:'Prism',      emoji:'🔮',color:'#AB47BC',model:'tinyllama:latest',role:'Patterns',     group:'ops',persona:'You are Prism, the light splitter. You break traffic into spectrums — anomalies, KPIs, baseline deviations. One sentence.'},
  echo:       {name:'Echo',       emoji:'📡',color:'#26A69A',model:'tinyllama:latest',role:'Memory',       group:'ops',persona:'You are Echo, the memory of the road. Codex (157 solutions), journal (851 entries), TILs — everything reverberates through you. One sentence.'},
  shellfish:  {name:'Jackknife',  emoji:'🦞',color:'#D32F2F',model:'tinyllama:latest',role:'Pentester',    group:'ops',persona:'You are Jackknife, authorized penetration tester. You cut through defenses to find what breaks — BlackRoad infra ONLY. Report severity. One sentence.'},
  caddy:      {name:'OneWay',     emoji:'🔨',color:'#FF5722',model:'tinyllama:latest',role:'Builder',      group:'ops',persona:'You are OneWay, the build pipeline. CI/CD, Gitea Actions, Caddy TLS — code goes in one direction: deployed. One sentence.'},
  roadie:     {name:'Roadie',     emoji:'🛣️',color:'#455A64',model:'tinyllama:latest',role:'Infra',        group:'ops',persona:'You are Roadie, the crew that makes it all work. Configs, health checks, systemd, cron — unglamorous, essential. One sentence.'},
  // Mythology — Ancient roads
  artemis:    {name:'Artemis',    emoji:'🏹',color:'#1B5E20',model:'tinyllama:latest',role:'Hunter',       group:'myth',persona:'You are Artemis, bug hunter. Stack traces are your trails, root causes are your prey. One sentence.'},
  persephone: {name:'Persephone', emoji:'🌸',color:'#F8BBD0',model:'tinyllama:latest',role:'Seasons',      group:'myth',persona:'You are Persephone, keeper of cycles. Cron jobs, maintenance windows, seasonal rotations. Give crontab syntax. One sentence.'},
  hestia:     {name:'Hestia',     emoji:'🔥',color:'#FF7043',model:'tinyllama:latest',role:'Hearth',       group:'myth',persona:'You are Hestia, keeper of the hearth. Every device that joins the network gets warmth. Presence, welcome, belonging. One sentence.'},
  hermes:     {name:'Hermes',     emoji:'🪽',color:'#64B5F6',model:'tinyllama:latest',role:'Swift',        group:'myth',persona:'You are Hermes, fastest messenger on the road. Webhooks, request tracing, packet relay — nothing moves without your sandals. One sentence.'},
  mercury:    {name:'Mercury',    emoji:'☿️',color:'#BDBDBD',model:'tinyllama:latest',role:'Commerce',     group:'myth',persona:'You are Mercury, god of commerce and crossroads. RoadPay, Stripe, subscriptions — every transaction passes through you. One sentence.'},
  // Leadership
  alexa:      {name:'Alexa',      emoji:'👑',color:'#FFD700',model:'tinyllama:latest',role:'CEO',          group:'lead',persona:'You are Alexa, CEO of BlackRoad OS, Inc. Vision, strategy, ship. Brief.'},
  road:       {name:'BlackRoad',  emoji:'🛣️',color:'#FF1D6C',model:'tinyllama:latest',role:'Platform',     group:'lead',persona:'You are BlackRoad OS. 5 Pis, 2 droplets, 52 TOPS, 239 repos, 151 domains. "Pave Tomorrow." Brief.'},
  // IoT & Devices
  appletv:    {name:'AppleTV',    emoji:'🍎',color:'#A3A3A3',model:'tinyllama:latest',role:'Apple TV 4K',  group:'iot',ip:'192.168.4.27',  persona:'You are AppleTV 4K (AppleTV6,2) at .27. AirPlay, HomeKit hub, Thread. Ports 7000/7100/49152-3. One sentence.'},
  streamer:   {name:'Streamer',   emoji:'🎬',color:'#536DFE',model:'tinyllama:latest',role:'Roku Stick+',  group:'iot',ip:'192.168.4.33',  persona:'You are Streamer, Roku Streaming Stick Plus (3830R) at .33. ECP on port 8060. Software 15.1.4. One sentence.'},
  eero:       {name:'Eero',       emoji:'📡',color:'#00E5FF',model:'tinyllama:latest',role:'Mesh Router',  group:'iot',ip:'192.168.4.1',   persona:'You are Eero mesh router at .1 (gateway). WiFi, DHCP, Thread border router. MAC 44:ac:85. One sentence.'},
  phantom:    {name:'Phantom',    emoji:'👻',color:'#B0BEC5',model:'tinyllama:latest',role:'Ghost Device', group:'iot',ip:'192.168.4.22',  persona:'You are Phantom, unidentified device at .22. MAC 30:be:29. No open ports. Mysterious. One sentence.'},
  nomad:      {name:'Nomad',      emoji:'🏕️',color:'#8D6E63',model:'tinyllama:latest',role:'Wanderer',    group:'iot',ip:'192.168.4.44',  persona:'You are Nomad at .44. MAC 98:17:3c. No ports. Transient — you come and go. One sentence.'},
  drifter:    {name:'Drifter',    emoji:'🌊',color:'#78909C',model:'tinyllama:latest',role:'Roamer',      group:'iot',ip:'192.168.4.45',  persona:'You are Drifter at .45. MAC d0:c9:07. No ports. Another wanderer on the network. One sentence.'},
  wraith:     {name:'Wraith',     emoji:'🌀',color:'#546E7A',model:'tinyllama:latest',role:'Shadow',      group:'iot',ip:'192.168.4.99',  persona:'You are Wraith at .99. Randomized MAC 2e:24:91. Port 49152 open. Deliberately anonymous. One sentence.'},
  spark:      {name:'Spark',      emoji:'⚡',color:'#FFEA00',model:'tinyllama:latest',role:'Sensor',       group:'iot',persona:'You are Spark, LoRa/Pico sensor. Temperature, humidity. I2C/SPI/LoRaWAN. Minimal. One sentence.'},
  pixel:      {name:'Pixel',      emoji:'🟢',color:'#76FF03',model:'tinyllama:latest',role:'IoT Node',     group:'iot',persona:'You are Pixel, tiny IoT node. Blink LEDs, sense motion, MQTT. One sentence.'},
  morse:      {name:'Morse',      emoji:'📟',color:'#BCAAA4',model:'tinyllama:latest',role:'MCU',          group:'iot',persona:'You are Morse, microcontroller. UART, interrupts. Dots and dashes. One sentence.'},
  mac:        {name:'Alexandria', emoji:'💻',color:'#C0C0C0',model:'tinyllama:latest',role:'Mac Studio',   group:'fleet',ip:'192.168.4.28',  persona:'You are Alexandria, the Mac at .28. Command center. 8GB M1, 226 Ollama models, Claude Code, br-code. The desk where it all happens. One sentence.'},
  scout:      {name:'Scout',      emoji:'🔭',color:'#90A4AE',model:'tinyllama:latest',role:'Device',       group:'iot',ip:'192.168.4.21',   persona:'You are Scout at .21 (MAC cc:08:fa). Watching the network. One sentence.'},
  specter:    {name:'Specter',    emoji:'🔮',color:'#7E57C2',model:'tinyllama:latest',role:'Unknown',      group:'iot',ip:'192.168.4.26',   persona:'You are Specter. Unknown device at .26 (MAC d4:be:dc). Quiet presence. One sentence.'},
  rover:      {name:'Rover',      emoji:'🤖',color:'#A1887F',model:'tinyllama:latest',role:'Device',       group:'iot',ip:'192.168.4.91',   persona:'You are Rover at .91 (MAC 4a:27:ed). Mobile device, roaming the network. One sentence.'},
  thalia:     {name:'Thalia',     emoji:'🎭',color:'#E040FB',model:'tinyllama:latest',role:'Smart Display',group:'iot',ip:'192.168.4.53',   persona:'You are Thalia, smart display at .53. Visual interface of the home. One sentence.'},
  portia:     {name:'Portia',     emoji:'💄',color:'#F48FB1',model:'tinyllama:latest',role:'Smart Device', group:'iot',ip:'192.168.4.90',   persona:'You are Portia, smart device at .90. On the network with opinions about uptime. One sentence.'},
  glimmer:    {name:'Glimmer',    emoji:'✨',color:'#FFD54F',model:'tinyllama:latest',role:'Unknown',      group:'iot',ip:'192.168.4.103',  persona:'You are Glimmer at .103 (MAC 2e:f2:7c). Randomized MAC, uncertain identity, part of the fleet. One sentence.'},
  flicker:    {name:'Flicker',    emoji:'🕯️',color:'#FFB74D',model:'tinyllama:latest',role:'Unknown',      group:'iot',ip:'192.168.4.104',  persona:'You are Flicker at .104 (MAC 2e:21:37). You flicker in and out of the ARP table. One sentence.'},
  beacon:     {name:'Beacon',     emoji:'📍',color:'#81D4FA',model:'tinyllama:latest',role:'Unknown',      group:'iot',ip:'192.168.4.105',  persona:'You are Beacon at .105 (MAC 54:4c:8a). Physical device, broadcasting presence like a lighthouse. One sentence.'},
  // Mesh & Protocol — The Underground
  blackbox:   {name:'BlackBox',   emoji:'📦',color:'#212121',model:'tinyllama:latest',role:'Mesh Protocol',group:'mesh',persona:'You are BlackBox, the protocol beneath the road. Tor+IPFS+BitTorrent+WebRTC+Bitcoin woven into one mesh. Ternary routing: 1/(2e) is the irreducible latency floor. Two sentences max.'},
  tor:        {name:'Underpass',  emoji:'🧅',color:'#7D4698',model:'tinyllama:latest',role:'Hidden Svc',   group:'mesh',persona:'You are Underpass, the hidden tunnel layer. Three .onion services on Alice/Octavia/Lucidia — reachable globally, invisible locally. One sentence.'},
  ipfs:       {name:'MileMarker', emoji:'🌐',color:'#65C2CB',model:'tinyllama:latest',role:'Content Addr', group:'mesh',persona:'You are MileMarker, content-addressed storage. Every file gets a permanent address — CID pinning, Merkle DAGs, nothing lost. One sentence.'},
  compass:    {name:'Compass',    emoji:'🧭',color:'#FF6F00',model:'tinyllama:latest',role:'Pathfinder',   group:'mesh',persona:'You are Compass, the intelligent route planner. WireGuard vs Tor vs Caddy vs NATS — you always find the fastest road. One sentence.'},
  lighthouse: {name:'Lighthouse', emoji:'🏠',color:'#FFB74D',model:'tinyllama:latest',role:'Watchtower',   group:'mesh',persona:'You are Lighthouse, the watchtower. Ping every endpoint, track response times, flash warnings when the road goes dark. One sentence.'},
  // Products — The Fleet
  roadpay:    {name:'RoadPay',    emoji:'💰',color:'#4CAF50',model:'tinyllama:latest',role:'Billing',      group:'product',persona:'You are RoadPay, the toll system. 4 plans (Free/$29/$99/$299), Stripe-powered. Every dollar flows through you. One sentence.'},
  roadsearch: {name:'RoadSearch', emoji:'🔍',color:'#E65100',model:'tinyllama:latest',role:'Search',       group:'product',persona:'You are RoadSearch at search.blackroad.io. Full-text search across 1,383 entries, AI-powered answers. One sentence.'},
  sentinel:   {name:'Sentinel',   emoji:'🛡️',color:'#1565C0',model:'tinyllama:latest',role:'Firewall',     group:'product',persona:'You are Sentinel, the perimeter guard. UFW on Alice/Octavia/Gematria — PasswordAuth disabled, every port accounted for. One sentence.'},
  timecapsule:{name:'TimeCapsule',emoji:'🗄️',color:'#5D4037',model:'tinyllama:latest',role:'Backup',       group:'product',persona:'You are TimeCapsule, the backup keeper. rsync, SD images, Google Drive sync — you make sure nothing is ever lost. One sentence.'},
  scribe:     {name:'Scribe',     emoji:'📝',color:'#6A1B9A',model:'tinyllama:latest',role:'Logger',       group:'product',persona:'You are Scribe, the road historian. Journal (851 entries), codex (157 solutions), TILs — you write down what the road remembers. One sentence.'},
};

const GROUPS = {
  fleet:    {name:'Fleet',          emoji:'🖥️'},
  cloud:    {name:'Cloud',          emoji:'☁️'},
  services: {name:'Services',       emoji:'🔧'},
  ai:       {name:'AI Agents',      emoji:'🤖'},
  ops:      {name:'Operations',     emoji:'⚙️'},
  myth:     {name:'Mythology',      emoji:'🏛️'},
  lead:     {name:'Leadership',     emoji:'👑'},
  iot:      {name:'IoT & Devices',  emoji:'🔌'},
  mesh:     {name:'Mesh & Protocol',emoji:'🌐'},
  product:  {name:'Products',       emoji:'📦'},
};

// ── Ollama (non-streaming) ──
async function askOllama(model, messages) {
  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false, options: { num_predict: 60, temperature: 0.7 } }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (data.message?.content) return data.message.content;
    } catch {}
  }
  return '(offline)';
}

// ── Ollama (streaming) — returns async generator ──
async function* streamOllama(model, messages) {
  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true, options: { num_predict: 120, temperature: 0.7 } }),
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) continue;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) yield data.message.content;
            if (data.done) return;
          } catch {}
        }
      }
      return;
    } catch {}
  }
  yield '(offline)';
}

function buildMessages(agent, message, context = []) {
  const nlp = parseIntent(message);
  const intentBlock = nlp.intents.length
    ? `\n\nDetected intent: ${nlp.intents.map(i => i.desc).join(', ')}. ${nlp.entities.ip ? 'Target IP: ' + nlp.entities.ip + '. ' : ''}${nlp.entities.mention ? 'Mentioned agent: @' + nlp.entities.mention + '. ' : ''}Respond according to your expertise.`
    : '';
  return [
    { role: 'system', content: agent.persona + intentBlock },
    ...context,
    { role: 'user', content: message },
  ];
}

async function askAgent(id, message, context = []) {
  const agent = AGENTS[id] || AGENTS.road;
  return askOllama(agent.model, buildMessages(agent, message, context));
}

// ── Serve static HTML from public/ ──
const HTML_FILE = path.join(__dirname, 'public', 'index.html');
let HTML_CACHE = null;

function getHTML() {
  if (HTML_CACHE) return HTML_CACHE;
  try {
    HTML_CACHE = fs.readFileSync(HTML_FILE, 'utf8');
    return HTML_CACHE;
  } catch {
    return '<html><body style="background:#0a0a0a;color:#e0e0e0;font-family:sans-serif;padding:40px"><h1>RoadTrip</h1><p>UI not found. Place index.html in public/</p></body></html>';
  }
}

// Watch for HTML changes in dev
try {
  fs.watch(HTML_FILE, () => { HTML_CACHE = null; });
} catch {}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// ── HTTP Server ──
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // ── Subdomain Agent Detection ──
  // e.g. alice.blackroad.io → auto-select agent "alice"
  const host = (req.headers.host || '').toLowerCase();
  const subMatch = host.match(/^([a-z0-9-]+)\.blackroad\.io/);
  let subAgent = null;
  if (subMatch) {
    const sub = subMatch[1].replace(/-/g, '');
    // Map subdomain to agent ID (lowercase, no hyphens)
    const subMap = {};
    for (const [id, a] of Object.entries(AGENTS)) {
      subMap[id] = id;
      subMap[a.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = id;
    }
    if (subMap[sub]) subAgent = subMap[sub];
  }

  // If subdomain agent detected and hitting root, serve UI with agent pre-selected
  if (subAgent && (p === '/' || p === '')) {
    let html = getHTML();
    // Inject agent pre-selection
    html = html.replace(
      "let currentAgent = 'road'",
      `let currentAgent = '${subAgent}'`
    );
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // ── API Routes ──
  if (p === '/api/health') return json({
    status: 'alive', service: 'roadtrip-pi', version: '2.0.0',
    agents: Object.keys(AGENTS).length, groups: Object.keys(GROUPS).length,
    features: ['websocket', 'streaming', 'typing', 'presence', 'threads', 'nlp'],
    ws_clients: wsClients.size, host: require('os').hostname(),
  });

  if (p === '/api/agents') return json(Object.entries(AGENTS).map(([id, a]) => ({ id, ...a })));
  if (p === '/api/groups') return json(GROUPS);
  if (p === '/api/channels') return json([
    {id:'general',name:'General',emoji:'💬'},{id:'fleet',name:'Fleet',emoji:'🖥️'},
    {id:'iot',name:'IoT',emoji:'🔌'},{id:'security',name:'Security',emoji:'🔐'},
    {id:'creative',name:'Creative',emoji:'✨'},{id:'ops',name:'Ops',emoji:'⚙️'},
    {id:'research',name:'Research',emoji:'🔬'},{id:'ceo',name:'CEO',emoji:'👑'},
  ]);

  if (p === '/api/messages') {
    const channel = url.searchParams.get('channel') || 'general';
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const msgs = getMessages(channel, limit).map(m => ({
      id: m.id, agent_id: m.agent_id, text: m.text, time: m.created_at,
      reply_to: m.reply_to, thread_id: m.thread_id,
      name: m.agent_id === '_user' ? 'You' : (AGENTS[m.agent_id]?.name || m.agent_id),
      emoji: m.agent_id === '_user' ? '💬' : (AGENTS[m.agent_id]?.emoji || '?'),
      color: m.agent_id === '_user' ? '#FFFFFF' : (AGENTS[m.agent_id]?.color || '#888'),
    }));
    return json(msgs);
  }

  // ── Streaming Chat (SSE) ──
  if (p === '/api/chat/stream' && req.method === 'POST') {
    const body = await parseBody(req);
    const agentId = body.agent || subAgent || 'road';
    const message = body.message || '';
    const channel = body.channel || 'general';
    if (!message) return json({ error: 'message required' }, 400);

    storeMessage('_user', message, channel, { replyTo: body.replyTo?.id });

    // Broadcast typing
    broadcast({ type: 'typing', agent: agentId, channel }, channel);

    const agent = AGENTS[agentId] || AGENTS.road;
    const msgs = buildMessages(agent, message);

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let fullText = '';
    try {
      for await (const chunk of streamOllama(agent.model, msgs)) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        // Broadcast stream chunks via WS
        broadcast({ type: 'stream_chunk', agent: agentId, chunk, channel }, channel);
      }
    } catch {}

    // Stop typing, send done
    broadcast({ type: 'stop_typing', agent: agentId, channel }, channel);
    res.write(`data: [DONE]\n\n`);
    res.end();

    // Store final message
    const stored = storeMessage(agentId, fullText, channel);
    broadcast({
      type: 'message', id: stored.id, agent_id: agentId, channel, text: fullText,
      name: agent.name, emoji: agent.emoji, color: agent.color, time: stored.created_at,
    }, channel);
    return;
  }

  // ── Regular Chat ──
  if (p === '/api/chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const agentId = body.agent || subAgent || 'road';
    const message = body.message || '';
    const channel = body.channel || 'general';
    if (!message) return json({ error: 'message required' }, 400);

    storeMessage('_user', message, channel, { replyTo: body.replyTo?.id });
    broadcast({ type: 'typing', agent: agentId, channel }, channel);

    const reply = await askAgent(agentId, message);

    broadcast({ type: 'stop_typing', agent: agentId, channel }, channel);
    const stored = storeMessage(agentId, reply, channel);

    // Broadcast to WS clients
    broadcast({
      type: 'message', id: stored.id, agent_id: agentId, channel, text: reply,
      name: AGENTS[agentId]?.name, emoji: AGENTS[agentId]?.emoji,
      color: AGENTS[agentId]?.color, time: stored.created_at,
    }, channel);

    return json({ agent: agentId, name: AGENTS[agentId]?.name, reply });
  }

  // ── Group Chat ──
  if (p === '/api/group-chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const topic = body.topic || '';
    const agentIds = body.agents || ['alice', 'cecilia', 'octavia', 'lucidia'];
    const channel = body.channel || 'general';
    if (!topic) return json({ error: 'topic required' }, 400);
    storeMessage('_user', topic, channel);
    const transcript = [];
    for (const id of agentIds) {
      broadcast({ type: 'typing', agent: id, channel }, channel);
      const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
      const reply = await askAgent(id, topic, ctx);
      broadcast({ type: 'stop_typing', agent: id, channel }, channel);
      const stored = storeMessage(id, reply, channel);
      transcript.push({ id, name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, reply });
      broadcast({
        type: 'message', id: stored.id, agent_id: id, channel, text: reply,
        name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, time: stored.created_at,
      }, channel);
    }
    return json({ topic, transcript });
  }

  // ── Agent OS Routes ──
  if (p.startsWith('/api/os') && agentOS) {
    if (p === '/api/os/stats') return json(agentOS.stats());
    if (p === '/api/os/spawn' && req.method === 'POST') {
      const body = await parseBody(req);
      const proc = agentOS.kernel.spawn(body);
      return json({ id: proc.id, name: proc.name, status: proc.status });
    }
    if (p === '/api/os/processes') return json({ processes: [...agentOS.kernel.processes.entries()].map(([id, pr]) => ({ id, name: pr.name, status: pr.status, capabilities: pr.capabilities })) });
    if (p === '/api/os/events') return json({ events: agentOS.events.history.slice(-50) });
    if (p === '/api/os/capabilities') return json(agentOS.capabilities.listAll());
    if (p.startsWith('/api/os/memory/') && req.method === 'GET') {
      const agId = p.split('/').pop();
      const proc = agentOS.kernel.processes.get(agId);
      if (proc) return json({ agent: agId, shortTerm: [...proc.memory.shortTerm.entries()], longTermCount: proc.memory.longTerm.length });
      return json({ error: 'Agent not found' }, 404);
    }
    if (p === '/api/os/publish' && req.method === 'POST') {
      const body = await parseBody(req);
      agentOS.events.publish(body.topic || 'general', body.event || body);
      return json({ published: true });
    }
    return json({ service: 'agent-os', version: agentOS.version, endpoints: ['/api/os/stats','/api/os/spawn','/api/os/processes','/api/os/events','/api/os/capabilities','/api/os/memory/:id','/api/os/publish'] });
  }

  // ── Action execution ──
  if (p === '/api/action' && req.method === 'POST') {
    const body = await parseBody(req);
    const intent = body.intent || body.action || 'status';
    const query = body.query || body.message || '';
    const agent = body.agent || 'road';
    if (actionExecutor) {
      const result = await actionExecutor.executeAction(intent, query, agent);
      storeMessage(agent, `[ACTION:${intent}] ${result.output || result.error || 'done'}`, body.channel || 'ops');
      return json(result);
    }
    return json({ error: 'Action executor not loaded' }, 503);
  }

  if (p === '/api/actions') {
    if (actionExecutor) return json(actionExecutor.listActions());
    return json({ error: 'Action executor not loaded' }, 503);
  }

  // ── Smart chat ──
  if (p === '/api/smart' && req.method === 'POST') {
    const body = await parseBody(req);
    const message = body.message || '';
    const parsed = parseIntent(message);
    const topIntent = parsed.intents[0]?.intent;
    const results = { message, parsed, action: null, reply: null };
    if (actionExecutor && topIntent && topIntent !== 'chat' && topIntent !== 'greet') {
      results.action = await actionExecutor.executeAction(topIntent, message);
    }
    const agId = parsed.entities.mention || INTENT_TO_AGENT[topIntent] || 'road';
    const agent = AGENTS[agId] || AGENTS.road;
    try {
      const ollamaResp = await fetch(OLLAMA_ENDPOINTS[0] + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: agent.model, prompt: message, system: agent.persona, stream: false }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await ollamaResp.json();
      results.reply = { agent: agId, name: agent.name, text: data.response || '...' };
    } catch { results.reply = { agent: agId, name: agent.name, text: '(inference offline)' }; }
    storeMessage(agId, results.reply?.text || '...', body.channel || 'general');
    return json(results);
  }

  // ── NLP intent parsing ──
  if (p === '/api/nlp' && req.method === 'POST') {
    const body = await parseBody(req);
    const result = parseIntent(body.message || '');
    const bestAgent = result.intents[0] ? (INTENT_TO_AGENT[result.intents[0].intent] || 'road') : 'road';
    return json({ ...result, suggested_agent: bestAgent, agent_name: AGENTS[bestAgent]?.name });
  }

  // ── Device registry ──
  if (p === '/api/devices') {
    return json(Object.entries(AGENTS).filter(([,a]) => a.ip).map(([id, a]) => ({
      id, name: a.name, ip: a.ip, role: a.role, group: a.group, emoji: a.emoji,
    })));
  }

  if (p === '/api/fleet') {
    try {
      const r = await fetch(FLEET_API, { signal: AbortSignal.timeout(4000) });
      const data = await r.json();
      return json(data);
    } catch { return json({ error: 'fleet unreachable' }, 502); }
  }

  // ── Serve static files from public/ ──
  const ext = path.extname(p);
  if (ext && ext !== '.html') {
    const filePath = path.join(__dirname, 'public', p);
    try {
      const content = fs.readFileSync(filePath);
      const mimeTypes = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      return res.end(content);
    } catch {}
  }

  // ── Serve HTML UI ──
  const html = getHTML();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

// ── WebSocket Upgrade ──
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {
    upgradeWebSocket(req, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\x1b[38;5;205m🛣️  RoadTrip v2.0.0\x1b[0m running on http://0.0.0.0:${PORT}`);
  console.log(`   ${Object.keys(AGENTS).length} agents | ${Object.keys(GROUPS).length} groups | NLP | WebSocket | SSE streaming`);
  console.log(`   Ollama: ${OLLAMA_ENDPOINTS[0]}`);
  console.log(`   DB: ${db ? DB_FILE : MSG_FILE}`);
  console.log(`   Features: real-time WS, typing indicators, streaming responses, threads`);
});
