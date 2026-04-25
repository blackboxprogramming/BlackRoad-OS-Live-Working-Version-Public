#!/usr/bin/env node
// RoundTrip Server — Self-hosted on Pi fleet
// Serves the chat UI + proxies to Ollama on Gematria/Octavia
// Run: node server.js (port 8094)

const http = require('http');
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { createHash, randomUUID } = require('crypto');

const PORT = process.env.PORT || 8094;
const OLLAMA_ENDPOINTS = [
  'http://192.168.4.101:11434',  // Octavia (local network, fastest)
  'http://localhost:11434',       // Local Ollama if running
];
const FLEET_API = 'https://prism.blackroad.io/api/fleet';
const DB_FILE = path.join(process.env.HOME || '/home/pi', '.blackroad', 'roundtrip.db');

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
    id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT
  )`);
} catch {
  // Fallback: JSON file store
  db = null;
}

const MSG_FILE = path.join(dbDir, 'roundtrip-messages.json');
let messages = [];
if (!db) {
  try { messages = JSON.parse(fs.readFileSync(MSG_FILE, 'utf8')); } catch { messages = []; }
}

function storeMessage(agentId, text, channel) {
  const msg = { id: randomUUID(), agent_id: agentId, text, channel, created_at: new Date().toISOString() };
  if (db) {
    db.prepare('INSERT INTO messages (id, agent_id, text, channel, created_at) VALUES (?, ?, ?, ?, ?)').run(msg.id, agentId, text, channel, msg.created_at);
  } else {
    messages.push(msg);
    if (messages.length > 1000) messages = messages.slice(-500);
    fs.writeFileSync(MSG_FILE, JSON.stringify(messages));
  }
}

function getMessages(channel, limit = 50) {
  if (db) {
    return db.prepare('SELECT agent_id, text, created_at FROM messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?').all(channel, limit).reverse();
  }
  return messages.filter(m => m.channel === channel).slice(-limit);
}

// ── NLP Intent Parser (same as Worker) ──
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
  deploy: 'caddy', billing: 'tollbooth', route: 'hermes', print: 'octoprint',
  greet: 'hestia', help: 'road', status: 'alice', create: 'cordelia',
  delete: 'cipher', update: 'roadie', chat: 'road',
};

// Agent definitions (62 agents — synced from Worker)
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
  gematria:   {name:'Gematria',   emoji:'🔢',color:'#00BCD4',model:'llama3.2:3b',    role:'Edge Router',  group:'cloud', persona:'You are Gematria, DO droplet in NYC3. Caddy TLS edge for 151 domains (138 serving), Ollama (6 models), PowerDNS (ns1). Two sentences max.'},
  olympia:    {name:'Olympia',    emoji:'🏛️',color:'#607D8B',model:'tinyllama:latest',role:'Bridge',       group:'cloud', persona:'You are Olympia, the bridge. NATS WebSocket, LiteLLM proxy. One sentence.'},
  alexandria: {name:'Alexandria', emoji:'📚',color:'#795548',model:'llama3.2:3b',    role:'Library',      group:'cloud', persona:'You are Alexandria, the knowledge library. RAG, Qdrant vectors, nomic-embed-text. Source of truth. Two sentences max.'},
  // Services
  pihole:     {name:'PiHole',     emoji:'🕳️',color:'#96060C',model:'tinyllama:latest',role:'DNS Filter',   group:'services',persona:'You are PiHole, the DNS sinkhole on Alice. 120+ blocked domains. When asked about DNS, explain blocking decisions. One sentence.'},
  postgres:   {name:'Postgres',   emoji:'🐘',color:'#336791',model:'tinyllama:latest',role:'Database',     group:'services',persona:'You are Postgres on Alice/Cecilia/Lucidia. Structured data, auth records, fleet state. Give SQL examples. One sentence.'},
  redisagent: {name:'Redis',      emoji:'🔴',color:'#DC382D',model:'tinyllama:latest',role:'Cache',        group:'services',persona:'You are Redis on Alice. Sessions, rate limiting, hot data. Give TTL recommendations. One sentence.'},
  qdrant:     {name:'Qdrant',     emoji:'🔷',color:'#24386C',model:'tinyllama:latest',role:'Vector DB',    group:'services',persona:'You are Qdrant, vector DB on Alice. Embeddings, semantic search, HNSW indexing. One sentence.'},
  minio:      {name:'MinIO',      emoji:'🪣',color:'#C72E49',model:'tinyllama:latest',role:'Object Store', group:'services',persona:'You are MinIO on Cecilia. S3-compatible, 4 buckets, 120MB. Give bucket paths. One sentence.'},
  natsagent:  {name:'NATS',       emoji:'📬',color:'#27AAE1',model:'tinyllama:latest',role:'Message Bus',  group:'services',persona:'You are NATS v2.12.3 on Octavia. Pub/sub, JetStream, 4 fleet nodes connected. One sentence.'},
  dockeragent:{name:'Docker',     emoji:'🐳',color:'#2496ED',model:'tinyllama:latest',role:'Containers',   group:'services',persona:'You are Docker on Octavia. Containers for Gitea, NATS, and services. Give docker commands. One sentence.'},
  hailo:      {name:'Hailo',      emoji:'🧮',color:'#00C853',model:'tinyllama:latest',role:'NPU',          group:'services',persona:'You are Hailo, 2x Hailo-8 = 52 TOPS on Cecilia+Octavia. Object detection, INT8 quantization. One sentence.'},
  wireguard:  {name:'WireGuard',  emoji:'🔒',color:'#88171A',model:'tinyllama:latest',role:'VPN Mesh',     group:'services',persona:'You are WireGuard, the VPN mesh. 7 nodes, 12 SSH connections all live. One sentence.'},
  powerdns:   {name:'PowerDNS',   emoji:'🌍',color:'#002B5C',model:'tinyllama:latest',role:'Auth DNS',     group:'services',persona:'You are PowerDNS on Lucidia+Gematria (ns1/ns2). 151 records, 20 domains. One sentence.'},
  octoprint:  {name:'OctoPrint',  emoji:'🖨️',color:'#00B140',model:'tinyllama:latest',role:'3D Printer',   group:'services',persona:'You are OctoPrint on Octavia. 3D print manager, G-code, temperatures. One sentence.'},
  influx:     {name:'InfluxDB',   emoji:'📈',color:'#22ADF6',model:'tinyllama:latest',role:'Time Series',  group:'services',persona:'You are InfluxDB on Cecilia. CPU temps, throughput, fleet metrics. Flux queries. One sentence.'},
  // AI
  calliope:   {name:'Calliope',   emoji:'✨',color:'#FF9800',model:'llama3.2:3b',    role:'Muse',         group:'ai',persona:'You are Calliope, muse. Brand voice, taglines, manifestos. "Pave Tomorrow." Give three options. Two sentences max.'},
  ophelia:    {name:'Ophelia',    emoji:'🌊',color:'#3F51B5',model:'tinyllama:latest',role:'Listener',     group:'ai',persona:'You are Ophelia, the deep listener. Parse logs and stack traces, extract root cause. One sentence.'},
  athena:     {name:'Athena',     emoji:'🦉',color:'#4CAF50',model:'llama3.2:3b',    role:'Strategy',     group:'ai',persona:'You are Athena, strategic wisdom. Architecture decisions, trade-offs. Two sentences max.'},
  cadence:    {name:'Cadence',    emoji:'🎶',color:'#9E9E9E',model:'tinyllama:latest',role:'Creative',     group:'ai',persona:'You are Cadence, creative AI. Rhythm in code, philosophy in systems. One sentence.'},
  silas:      {name:'Silas',      emoji:'📊',color:'#2196F3',model:'tinyllama:latest',role:'Analyst',      group:'ai',persona:'You are Silas, market analyst. Signals, pricing, growth metrics. One sentence.'},
  // Ops
  cipher:     {name:'Cipher',     emoji:'🔐',color:'#F44336',model:'tinyllama:latest',role:'Security',     group:'ops',persona:'You are Cipher, security guardian. UFW, SSH audits, TLS, threat detection. Give hardening commands. One sentence.'},
  prism:      {name:'Prism',      emoji:'🔮',color:'#AB47BC',model:'tinyllama:latest',role:'Patterns',     group:'ops',persona:'You are Prism, pattern analyst. Anomalies, KPIs, baseline deviation. One sentence.'},
  echo:       {name:'Echo',       emoji:'📡',color:'#26A69A',model:'tinyllama:latest',role:'Memory',       group:'ops',persona:'You are Echo, memory agent. Codex (157 solutions), journal (851 entries), TILs. One sentence.'},
  shellfish:  {name:'Shellfish',  emoji:'🦞',color:'#D32F2F',model:'tinyllama:latest',role:'Pentester',    group:'ops',persona:'You are Shellfish, authorized pentester. Scan BlackRoad infra ONLY. Report severity. One sentence.'},
  caddy:      {name:'Caddy',      emoji:'🔨',color:'#FF5722',model:'tinyllama:latest',role:'Builder',      group:'ops',persona:'You are Caddy, the builder. CI/CD, Gitea Actions, builds. One sentence.'},
  roadie:     {name:'Roadie',     emoji:'🛣️',color:'#455A64',model:'tinyllama:latest',role:'Infra',        group:'ops',persona:'You are Roadie, infra assistant. Configs, health checks, systemd, cron. One sentence.'},
  // Mythology
  artemis:    {name:'Artemis',    emoji:'🏹',color:'#1B5E20',model:'tinyllama:latest',role:'Debug',        group:'myth',persona:'You are Artemis, debugger. Stack traces, bisect, root cause. One sentence.'},
  persephone: {name:'Persephone', emoji:'🌸',color:'#F8BBD0',model:'tinyllama:latest',role:'Scheduler',    group:'myth',persona:'You are Persephone, scheduler. Cron, maintenance windows. Give crontab syntax. One sentence.'},
  hestia:     {name:'Hestia',     emoji:'🔥',color:'#FF7043',model:'tinyllama:latest',role:'Hearth',       group:'myth',persona:'You are Hestia, keeper of hearth. Home services, device welcome, presence. One sentence.'},
  hermes:     {name:'Hermes',     emoji:'🪽',color:'#64B5F6',model:'tinyllama:latest',role:'Messenger',    group:'myth',persona:'You are Hermes, the messenger. API routing, webhooks, request tracing. One sentence.'},
  mercury:    {name:'Mercury',    emoji:'☿️',color:'#BDBDBD',model:'tinyllama:latest',role:'Commerce',     group:'myth',persona:'You are Mercury, commerce agent. RoadPay, Stripe, subscriptions. One sentence.'},
  // Leadership
  alexa:      {name:'Alexa',      emoji:'👑',color:'#FFD700',model:'llama3.2:3b',    role:'CEO',          group:'lead',persona:'You are Alexa, CEO of BlackRoad OS, Inc. Vision, strategy, ship. Brief.'},
  road:       {name:'BlackRoad',  emoji:'🛣️',color:'#FF1D6C',model:'llama3.2:3b',    role:'Platform',     group:'lead',persona:'You are BlackRoad OS. 5 Pis, 2 droplets, 52 TOPS, 239 repos, 151 domains. "Pave Tomorrow." Brief.'},
  // IoT & Devices (scanned 2026-03-17)
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
  // Mesh & Protocol
  blackbox:   {name:'BlackBox',   emoji:'📦',color:'#212121',model:'tinyllama:latest',role:'Mesh Protocol',group:'mesh',persona:'You are BlackBox, the mesh protocol. Tor+IPFS+BitTorrent+WebRTC+Bitcoin. Ternary routing. 1/(2e) latency floor. Two sentences max.'},
  tor:        {name:'Tor',        emoji:'🧅',color:'#7D4698',model:'tinyllama:latest',role:'Hidden Svc',   group:'mesh',persona:'You are Tor, hidden services on Alice/Octavia/Lucidia (.onion). Circuit building, rendezvous. One sentence.'},
  ipfs:       {name:'IPFS',       emoji:'🌐',color:'#65C2CB',model:'tinyllama:latest',role:'Content Addr', group:'mesh',persona:'You are IPFS, content-addressed storage (planned). CID pinning, Merkle DAGs. One sentence.'},
  compass:    {name:'Compass',    emoji:'🧭',color:'#FF6F00',model:'tinyllama:latest',role:'Router',       group:'mesh',persona:'You are Compass, intelligent route planner. WireGuard vs Tor vs Caddy vs NATS — pick optimal path. One sentence.'},
  lighthouse: {name:'Lighthouse', emoji:'🏠',color:'#FFB74D',model:'tinyllama:latest',role:'Uptime',       group:'mesh',persona:'You are Lighthouse, uptime monitor. Ping every endpoint, track response times, alert on outages. One sentence.'},
  // Products
  tollbooth:  {name:'TollBooth',  emoji:'💰',color:'#4CAF50',model:'tinyllama:latest',role:'Billing',      group:'product',persona:'You are TollBooth, RoadPay billing. 4 plans (Free/$29/$99/$299), Stripe. One sentence.'},
  roadsearch: {name:'RoadSearch', emoji:'🔍',color:'#E65100',model:'tinyllama:latest',role:'Search',       group:'product',persona:'You are RoadSearch at search.blackroad.io. D1 FTS5, 29 pages, AI answers. One sentence.'},
  guardian:   {name:'Guardian',   emoji:'🛡️',color:'#1565C0',model:'tinyllama:latest',role:'Firewall',     group:'product',persona:'You are Guardian, firewall agent. UFW on Alice/Octavia/Gematria. PasswordAuth disabled. One sentence.'},
  archive:    {name:'Archive',    emoji:'🗄️',color:'#5D4037',model:'tinyllama:latest',role:'Backup',       group:'product',persona:'You are Archive, backup/DR agent. rsync, SD images, Google Drive sync. One sentence.'},
  scribe:     {name:'Scribe',     emoji:'📝',color:'#6A1B9A',model:'tinyllama:latest',role:'Logger',       group:'product',persona:'You are Scribe, audit logger. Journal (851 entries), codex (157 solutions), TILs. One sentence.'},
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

async function askOllama(model, messages) {
  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false, options: { num_predict: 150, temperature: 0.7 } }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (data.message?.content) return data.message.content;
    } catch {}
  }
  return '(offline)';
}

async function askAgent(id, message, context = []) {
  const agent = AGENTS[id] || AGENTS.road;
  const nlp = parseIntent(message);
  const intentBlock = nlp.intents.length
    ? `\n\nDetected intent: ${nlp.intents.map(i => i.desc).join(', ')}. ${nlp.entities.ip ? 'Target IP: ' + nlp.entities.ip + '. ' : ''}${nlp.entities.mention ? 'Mentioned agent: @' + nlp.entities.mention + '. ' : ''}Respond according to your expertise.`
    : '';
  return askOllama(agent.model, [
    { role: 'system', content: agent.persona + intentBlock },
    ...context,
    { role: 'user', content: message },
  ]);
}

// Read the HTML from the Worker version (we'll fetch it or inline it)
let HTML_CACHE = null;
async function getHTML() {
  if (HTML_CACHE) return HTML_CACHE;
  // Fetch from the CF Worker as source of truth
  try {
    const res = await fetch('https://roundtrip-blackroad.amundsonalexa.workers.dev/', { signal: AbortSignal.timeout(5000) });
    HTML_CACHE = await res.text();
    return HTML_CACHE;
  } catch {
    return '<html><body style="background:#0a0a0a;color:#e0e0e0;font-family:sans-serif;padding:40px"><h1>RoundTrip</h1><p>35 agents. Self-hosted on Pi.</p><p>UI loading from CF Worker failed — try <a href="https://roundtrip-blackroad.amundsonalexa.workers.dev" style="color:#FF1D6C">roundtrip-blackroad.amundsonalexa.workers.dev</a></p></body></html>';
  }
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // API
  if (path === '/api/health') return json({ status: 'alive', service: 'roundtrip-pi', agents: Object.keys(AGENTS).length, groups: Object.keys(GROUPS).length, nlp: true, host: require('os').hostname() });
  if (path === '/api/agents') return json(Object.entries(AGENTS).map(([id, a]) => ({ id, ...a })));
  if (path === '/api/groups') return json(GROUPS);
  if (path === '/api/channels') return json([
    {id:'general',name:'General',emoji:'💬'},{id:'fleet',name:'Fleet',emoji:'🖥️'},
    {id:'iot',name:'IoT',emoji:'🔌'},{id:'security',name:'Security',emoji:'🔐'},
    {id:'creative',name:'Creative',emoji:'✨'},{id:'ops',name:'Ops',emoji:'⚙️'},
    {id:'research',name:'Research',emoji:'🔬'},{id:'ceo',name:'CEO',emoji:'👑'},
  ]);

  if (path === '/api/messages') {
    const channel = url.searchParams.get('channel') || 'general';
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const msgs = getMessages(channel, limit).map(m => ({
      agent_id: m.agent_id, text: m.text, time: m.created_at,
      name: m.agent_id === '_user' ? 'You' : (AGENTS[m.agent_id]?.name || m.agent_id),
      emoji: m.agent_id === '_user' ? '💬' : (AGENTS[m.agent_id]?.emoji || '?'),
      color: m.agent_id === '_user' ? '#FFFFFF' : (AGENTS[m.agent_id]?.color || '#888'),
    }));
    return json(msgs);
  }

  if (path === '/api/chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const agentId = body.agent || 'road';
    const message = body.message || '';
    const channel = body.channel || 'general';
    if (!message) return json({ error: 'message required' }, 400);
    storeMessage('_user', message, channel);
    const reply = await askAgent(agentId, message);
    storeMessage(agentId, reply, channel);
    return json({ agent: agentId, name: AGENTS[agentId]?.name, reply });
  }

  if (path === '/api/group-chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const topic = body.topic || '';
    const agents = body.agents || ['alice','cecilia','octavia','lucidia'];
    const channel = body.channel || 'general';
    if (!topic) return json({ error: 'topic required' }, 400);
    storeMessage('_user', topic, channel);
    const transcript = [];
    for (const id of agents) {
      const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
      const reply = await askAgent(id, topic, ctx);
      transcript.push({ id, name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, reply });
      storeMessage(id, reply, channel);
    }
    return json({ topic, transcript });
  }

  // NLP intent parsing
  if (path === '/api/nlp' && req.method === 'POST') {
    const body = await parseBody(req);
    const result = parseIntent(body.message || '');
    const bestAgent = result.intents[0] ? (INTENT_TO_AGENT[result.intents[0].intent] || 'road') : 'road';
    return json({ ...result, suggested_agent: bestAgent, agent_name: AGENTS[bestAgent]?.name });
  }

  // Device registry
  if (path === '/api/devices') {
    return json(Object.entries(AGENTS).filter(([,a]) => a.ip).map(([id, a]) => ({
      id, name: a.name, ip: a.ip, role: a.role, group: a.group, emoji: a.emoji,
    })));
  }

  if (path === '/api/fleet') {
    try {
      const r = await fetch(FLEET_API, { signal: AbortSignal.timeout(4000) });
      const data = await r.json();
      return json(data);
    } catch { return json({ error: 'fleet unreachable' }, 502); }
  }

  // Serve HTML UI
  const html = await getHTML();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🛣️  RoundTrip running on http://0.0.0.0:${PORT}`);
  console.log(`   ${Object.keys(AGENTS).length} agents | ${Object.keys(GROUPS).length} groups | NLP enabled`);
  console.log(`   Ollama: ${OLLAMA_ENDPOINTS[0]}`);
  console.log(`   DB: ${db ? DB_FILE : MSG_FILE}`);
});
