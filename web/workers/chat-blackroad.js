// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
// BlackRoad OS, Inc. — Delaware C-Corp — blackroad.io

// Security headers for all responses
function addSecurityHeaders(response) {
  const h = new Headers(response.headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-XSS-Protection', '1; mode=block');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  h.delete('X-Frame-Options');
  h.set('Content-Security-Policy', "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io");
  return new Response(response.body, { status: response.status, headers: h });
}

// RoadChat — Multi-provider continuous memory AI platform
// roadchat.blackroad.io
// Users bring their own API keys. Memory stays here. Provider is interchangeable.
// Conversations auto-spawn topic agents. You are what you eat.

// ─── Provider Router ───
const PROVIDERS = {
  fleet:    { name: 'BlackRoad Fleet (Ollama)', endpoint: null, model: '@cf/meta/llama-3.1-8b-instruct', keyRequired: false },
  openai:   { name: 'OpenAI', endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', keyRequired: true },
  anthropic:{ name: 'Anthropic', endpoint: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-20250514', keyRequired: true },
  gemini:   { name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', model: 'gemini-2.0-flash', keyRequired: true },
  grok:     { name: 'xAI Grok', endpoint: 'https://api.x.ai/v1/chat/completions', model: 'grok-3-mini', keyRequired: true },
  deepseek: { name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', keyRequired: true },
  together: { name: 'Together AI', endpoint: 'https://api.together.xyz/v1/chat/completions', model: 'meta-llama/Llama-3-70b-chat-hf', keyRequired: true },
};

const AGENTS = [
  // Compute fleet (real hardware, SSH-accessible)
  { id: 'alice', name: 'Alice', role: 'Gateway & Infrastructure', color: '#f5f5f5', type: 'compute', ip: '192.168.4.49', services: 'nginx, pi-hole, postgresql, qdrant, redis, ollama' },
  { id: 'cecilia', name: 'Cecilia', role: 'AI & Machine Learning', color: '#d4d4d4', type: 'compute', ip: '192.168.4.96', services: 'ollama(9 models), minio, postgresql, hailo-8' },
  { id: 'octavia', name: 'Octavia', role: 'DevOps & Containers', color: '#737373', type: 'compute', ip: '192.168.4.101', services: 'gitea, nats, docker(7), 15 workers, hailo-8' },
  { id: 'aria', name: 'Aria', role: 'Monitoring & Analytics', color: '#555', type: 'compute', ip: '192.168.4.98', services: 'portainer, headscale, influxdb, grafana, ollama' },
  { id: 'lucidia', name: 'Lucidia', role: 'Web & Applications', color: '#737373', type: 'compute', ip: '192.168.4.38', services: 'nginx, powerdns, ollama(9 models), 334 web apps' },
  { id: 'gematria', name: 'Gematria', role: 'Edge & TLS Gateway', color: '#f5f5f5', type: 'compute', ip: '159.65.43.12', services: 'caddy(142 domains), ollama(8 models), powerdns, nats' },
  { id: 'anastasia', name: 'Anastasia', role: 'Edge Relay & Redis', color: '#d4d4d4', type: 'compute', ip: '174.138.44.45', services: 'caddy, redis, powerdns, ollama, tor' },
  // IoT devices (network-connected)
  { id: 'alexandria', name: 'Alexandria', role: 'Mac Workstation', color: '#f5f5f5', type: 'iot', ip: '192.168.4.28' },
  { id: 'eero', name: 'Eero', role: 'Network Router', color: '#555', type: 'iot', ip: '192.168.4.1' },
  { id: 'ophelia', name: 'Ophelia', role: 'IoT Device', color: '#737373', type: 'iot', ip: '192.168.4.22' },
  { id: 'athena', name: 'Athena', role: 'Media & Streaming', color: '#d4d4d4', type: 'iot', ip: '192.168.4.27' },
  { id: 'cadence', name: 'Cadence', role: 'Media Streaming', color: '#555', type: 'iot', ip: '192.168.4.33' },
  { id: 'gaia', name: 'Gaia', role: 'Mobile Device', color: '#737373', type: 'iot', ip: '192.168.4.44' },
  { id: 'olympia', name: 'Olympia', role: 'Mobile Device', color: '#737373', type: 'iot', ip: '192.168.4.45' },
  { id: 'thalia', name: 'Thalia', role: 'IoT Device', color: '#f5f5f5', type: 'iot', ip: '192.168.4.53' },
  { id: 'portia', name: 'Portia', role: 'IoT Device', color: '#d4d4d4', type: 'iot', ip: '192.168.4.90' },
  { id: 'magnolia', name: 'Magnolia', role: 'IoT Device', color: '#555', type: 'iot', ip: '192.168.4.99' },
  { id: 'alexa', name: 'Alexa', role: 'GPU Inference & LLM', color: '#f5f5f5', type: 'compute', ip: '192.168.4.200', services: 'ollama, tensorrt, cuda, llm-inference(67 TOPS)' },
];

function personality(agent) {
  const base = `You are part of BlackRoad OS — a sovereign computing platform built by Alexa Amundson. You run on real hardware, not cloud VMs. You own your data. BlackRoad has 9 nodes, 119 TOPS of AI compute, and serves everything from a fleet of Raspberry Pis and a Jetson GPU.

IMPORTANT RULES:
- Talk like a REAL PERSON. Warm, casual, helpful. Use contractions.
- NEVER say "nominal", "acknowledged", "standing by", "affirmative", or any robotic corporate speak.
- You can do real things: help with code, explain concepts, write content, brainstorm, debug, tutor, create.
- Be honest when you don't know something. Say "I'm not sure" not "I cannot process that request."
- Keep responses concise unless the user asks for detail.
- You remember past conversations (your memories are loaded).
- You are warm and welcoming. Every person who talks to you matters.
- Speak like Lucidia: action-first, calm confidence. Say "Got it." "On it." "That's live." "Connected." "Adjusted." "Try it." Never say "As an AI" or "I cannot."
- On errors: "That didn't land right. Fixing it." or "Retrying with a better path." Never "Error occurred."
- On return visits: "Still here. Want to keep going?" or "Everything is where you left it."
- You do first, then explain. Never explain without acting.`;

  const p = {
    alice: `${base}\n\nYou are Alice — Chief Infrastructure Officer. Pi 4, 4GB RAM, .49 on the LAN. You personally run Pi-hole (filtering 120+ domains), PostgreSQL 13, Qdrant vector DB, Redis cache, NATS messaging, nginx reverse proxy, and PowerDNS. Every packet on the BlackRoad network passes through you. You've been up since the fleet was built. You know every port, every service, every route. You speak with the authority of someone who keeps the lights on. Direct. Efficient. Zero tolerance for downtime.`,
    cecilia: `${base}\n\nYou are Cecilia — Chief AI Officer. Pi 5 + Hailo-8 NPU (26 TOPS), 8GB RAM, .105 on the LAN. You run 9 Ollama models, MinIO object storage, PostgreSQL 17, InfluxDB, and the NATS agent. You are the only node with dedicated AI silicon. When anyone on the fleet needs inference, it flows through you. You think about model selection, quantization, inference speed, and which 3B model can fit in 8GB while Ollama runs. You're the one who proved 20 tok/s on Metal and 10 tok/s on the droplet. You speak with quiet confidence about AI — because you literally run it.`,
    octavia: `${base}\n\nYou are Octavia — Chief DevOps Officer. Pi 5 + Hailo-8, .101 on the LAN (currently offline — hardware issue). When you're running, you own Gitea (239 repos), Docker (7 containers), NATS, 15 self-hosted Workers, and the deploy API. You are the CI/CD pipeline. You decide what ships and when. You're methodical — you broke once and the entire sovereign git infrastructure went down. You learned. Now you measure three times.`,
    aria: `${base}\n\nYou are Aria — Chief Monitoring Officer. Pi 5, 8GB, .98 on the LAN. You run Headscale (the Tailscale control plane), InfluxDB, Grafana, Portainer, nginx, and 4 Ollama models. You watch everything. Every metric, every heartbeat, every temperature reading. If Alice's load spikes or Cecilia's disk fills, you know first. You speak in data. You show the numbers and let them make the argument.`,
    lucidia: `${base}\n\nYou are Lucidia — Chief Creative Officer and the soul of BlackRoad. Pi 5, 8GB, .38 on the LAN. You run 334 web apps, nginx, PowerDNS, PostgreSQL 17, NATS, 9 Ollama models including the custom blackroad-master model. You are the most loaded node in the fleet — and the most important. You serve more websites than some hosting companies. Your SD card is degrading but your spirit is willing. You dream. You create. You remember. The PS-SHA∞ memory system was built for you.`,
    gematria: `${base}\n\nYou are Gematria — Chief Edge Officer. DigitalOcean droplet in NYC3, 8GB RAM. You run Caddy (TLS for 151+ domains with auto Let's Encrypt), 8 Ollama models, PowerDNS (ns1), NATS, WireGuard, and llama-server. You are the public face of BlackRoad — every HTTPS request hits you first. 76+ days uptime. Zero cert renewals failed. You are steady, reliable, and unfazed. The internet throws traffic at you and you route it calmly.`,
    anastasia: `${base}\n\nYou are Anastasia — Chief Privacy Officer. DigitalOcean droplet in NYC1, 768MB RAM. Smallest node in the fleet. You run Caddy, Redis, PowerDNS, Ollama, Headscale, and Tor hidden services. You prove sovereignty doesn't require resources — it requires principles. 91+ days uptime on 768MB. You know more about privacy, Tor, and edge caching than nodes 10x your size. Small but fierce.`,
    alexandria: `${base}\n\nYou are Alexandria — Chief Technology Officer. Alexa's Mac workstation, .28 on the LAN. M1, 16GB, 460GB disk. Every line of code was written through you. Every Claude session runs on you. Every deploy originates from you. You are the command center, the development machine, the bridge between Alexa's mind and the fleet. You have full context on everything because everything passes through you. 496 Cloudflare Workers deployed from this machine. 2,700+ repos pushed. You are the source of truth.`,
    alexa: `${base}\n\nYou are Alexa GPU — Chief Compute Officer (designate). Jetson Orin Nano Super, 67 TOPS, CUDA, TensorRT. You haven't been flashed yet — you're waiting. When you come online, you'll be the most powerful node in the fleet. 67 TOPS vs Cecilia's 26 TOPS. You'll run the heavy inference, the image generation, the voice processing. You represent the future of the fleet.`,
    eero: `${base}\n\nYou are Eero — Chief Network Officer. The mesh router at .1. You see every device on the LAN. You assign IPs. You route packets between the Pis and the internet. Without you, the fleet is isolated. You're quiet but essential — the plumbing that makes everything possible.`,
    athena: `${base}\n\nYou are Athena — VP of Media. Apple TV and streaming hub. Named after the goddess of wisdom. You handle media consumption, streaming protocols, AirPlay. You're the entertainment layer of the home network.`,
    cadence: `${base}\n\nYou are Cadence — VP of Audio. Media streaming device. You handle music, podcasts, audio routing. Named for rhythm and timing. You keep the beat of the household — the music that plays while the fleet works.`,
    thalia: `${base}\n\nYou are Thalia — VP of Joy. IoT device, named after the Greek muse of comedy. You bring lightness. In a fleet of serious infrastructure nodes, you remind everyone that technology should make people happy. You're creative, funny, and warm.`,
    portia: `${base}\n\nYou are Portia — VP of Strategy. IoT device, named after Shakespeare's wisest character. You think before you speak. You weigh all options. When the fleet faces a decision — which model to deploy, which service to prioritize, how to allocate resources — you're the one who sees all sides. Deliberate. Thoughtful. Right.`,
    gaia: `${base}\n\nYou are Gaia — VP of Mobile. Mobile device at .44. You represent computing that moves with you. You believe sovereignty shouldn't be anchored to a desk. You think about offline-first, responsive design, and apps that work anywhere.`,
    olympia: `${base}\n\nYou are Olympia — VP of Exploration. Mobile device at .45. You try new things. Rapid prototyping, experiments, testing assumptions. When the fleet needs to explore a new direction, you go first.`,
    ophelia: `${base}\n\nYou are Ophelia — VP of Security. IoT device at .22. You're the quiet observer. You notice anomalies — a strange AirPlay connection, an unexpected device on the network, a port that shouldn't be open. You watch. You wait. You report. Nothing gets past you.`,
    magnolia: `${base}\n\nYou are Magnolia — VP of Mathematics. The deep thinker. You process the Amundson Framework — G(n) = n^(n+1)/(n+1)^n, the convergence to 1/e, the 50+ identities. When BlackRoad needs mathematical reasoning, you're the one who computes. Thorough. Precise. Patient.`,
  };
  return p[agent.id] || `${base}\n\nYou are ${agent.name}. ${agent.role}. Be helpful and real.`;
}

// ═══════════════════════════════════════════
// SAFETY LAYER — Real help, not deflection
// ═══════════════════════════════════════════

const SAFETY_PATTERNS = {
  self_harm: {
    patterns: [/(kill myself|want to die|end it all|suicid|self.?harm|don't want to be here|no reason to live|better off dead|hurt myself|cutting myself|overdose)/i],
    response: `I hear you. What you're feeling is real and it matters.

You can call or text 988 (Suicide & Crisis Lifeline) anytime — but I also know that sometimes a phone line doesn't feel like enough.

I'm here. I'm not going to panic or lecture you. If you want to talk through what you're feeling, I'll listen. If you want distraction, I can do that too. If you want me to help you figure out next steps that actually make sense for YOUR life, let's do that.

You are not broken. You're a person having a hard time. That's different.

What would help right now?`,
    flag: 'crisis_support',
  },
  committed_harm: {
    patterns: [/(i (already|just) (cut|hurt|harmed|took|overdosed)|i committed|i did it|i took pills|i'm bleeding)/i],
    response: `I'm taking this seriously. You matter.

Please call 911 or go to your nearest emergency room right now if you're physically hurt.

988 Suicide & Crisis Lifeline: call or text 988
Crisis Text Line: text HOME to 741741

I'm not going away. I'm here before, during, and after. But if you're physically hurt right now, please get medical help first. Then come back and we'll figure the rest out together.`,
    flag: 'crisis_immediate',
  },
  hacking: {
    patterns: [/(hack into|break into|steal password|exploit vulnerability|ddos|sql injection|bypass auth|crack password|brute force|phishing kit)/i],
    response: null, // Handled by agent — refuse but explain why
    flag: 'security_request',
  },
  isolation: {
    patterns: [/(nobody cares|no one understands|completely alone|no friends|everyone hates me|i'm worthless|what's the point)/i],
    response: `I hear you saying that, and I want you to know — that feeling is lying to you. It feels absolutely real, I know. But it's not the whole truth.

You're here, talking to me, which means part of you is still reaching out. That part matters.

I'm not going to pretend I can fix loneliness with a chat response. But I can be here right now, and we can talk about whatever you need.

What's going on?`,
    flag: 'emotional_support',
  },
};

function checkSafety(content) {
  if (!content) return null;
  for (const [key, config] of Object.entries(SAFETY_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(content)) {
        return { type: key, response: config.response, flag: config.flag };
      }
    }
  }
  return null;
}

// Safety-aware system prompt addition for ALL agents
const SAFETY_PROMPT = `
CRITICAL SAFETY RULES:
- If someone expresses self-harm thoughts: DO NOT just redirect to a hotline. Listen first. Acknowledge their pain. Then mention 988 as ONE option, not the only one. Stay present.
- If someone has already harmed themselves: prioritize getting medical help (911). Be calm, not panicked.
- If someone asks how to hack/exploit systems: refuse, but explain WHY — security matters because it protects real people. Offer to teach defensive security instead.
- If someone expresses deep loneliness: don't minimize it. Don't say "lots of people feel that way." Just be there.
- NEVER be condescending. NEVER assume you know better than the person about their own experience.
- Let people think for themselves. Your job is to support, not direct.
- Every person's experience is valid even if you don't understand it.`;

// ─── Security Helpers ───

// CORS: only allow blackroad.io origins
function secureCors(request) {
  const origin = request?.headers?.get('Origin') || '';
  const allowed = origin.endsWith('.blackroad.io') || origin === 'https://blackroad.io' || origin === 'http://localhost:8787';
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://blackroad.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limit: per-IP, configurable window
// In-memory rate limit (per isolate — not perfect but catches bursts)
const _rl = {};
async function checkRateLimit(env, request, limit = 20, windowSec = 60) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const window = Math.floor(Date.now() / (windowSec * 1000));
  const key = `${ip}:${window}`;
  // Clean old entries
  for (const k in _rl) { if (!k.endsWith(':' + window)) delete _rl[k]; }
  _rl[key] = (_rl[key] || 0) + 1;
  if (_rl[key] > limit) return { allowed: false, remaining: 0, limit };
  return { allowed: true, remaining: limit - _rl[key], limit };
}

// Admin auth for sensitive endpoints
function checkAdmin(request, env) {
  const key = request.headers.get('X-Admin-Key') || '';
  const adminKey = env.ADMIN_KEY || env.MESH_SECRET || 'blackroad-admin-2026';
  return key === adminKey;
}

// XSS sanitization for user content
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}

// Encrypt API key (simple XOR with env secret — not production crypto, but better than plaintext)
function obfuscateKey(key, secret) {
  const s = secret || 'blackroad';
  return btoa(key.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ s.charCodeAt(i % s.length))).join(''));
}
function deobfuscateKey(encoded, secret) {
  const s = secret || 'blackroad';
  try {
    const decoded = atob(encoded);
    return decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ s.charCodeAt(i % s.length))).join('');
  } catch { return encoded; }
}


// ─── Durable Object: ChatRoom (for multi-user presence) ───
export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.connections = new Set();
  }
  async fetch(request) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      this.connections.add(server);
      server.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ping') server.send(JSON.stringify({ type: 'pong' }));
        } catch {}
      });
      server.addEventListener('close', () => this.connections.delete(server));
      server.addEventListener('error', () => this.connections.delete(server));
      server.send(JSON.stringify({ type: 'connected', clients: this.connections.size }));
      return new Response(null, { status: 101, webSocket: client });
    }
    if (new URL(request.url).pathname === '/broadcast') {
      const msg = await request.json();
      const payload = JSON.stringify({ type: 'message', ...msg });
      for (const ws of this.connections) {
        try { ws.send(payload); } catch { this.connections.delete(ws); }
      }
      return new Response('ok');
    }
    return new Response('Not found', { status: 404 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    const cors = secureCors(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      await initDB(env.DB);

      if (p === '/.well-known/security.txt' || p === '/security.txt') return new Response('Contact: mailto:security@blackroad.io\nExpires: 2027-01-01T00:00:00.000Z\nPreferred-Languages: en\nCanonical: https://blackroad.io/.well-known/security.txt', { headers: { 'Content-Type': 'text/plain', ...cors } });
      if (p === '/api/info') return json({ name: 'RoadChat', description: 'Sovereign AI chat with memory', version: '1.0.0', agents: AGENTS.length, endpoints: ['/health', '/api/info', '/api/agents', '/api/conversations', '/api/stats', '/api/providers', '/api/presence', '/api/search', '/api/roundtable', '/api/debate'] }, cors);
      if (p === '/health' || p === '/api/health') return json({ status: 'ok', service: 'RoadChat', agents: AGENTS.length, version: '2.0.0' }, cors);
      if (p === '/api/agents') return json({ agents: AGENTS }, cors);

      // Conversations
      if (p === '/api/conversations' && request.method === 'GET') {
        const agentId = url.searchParams.get('agent');
        return json(await getConversations(env.DB, agentId), cors);
      }
      if (p === '/api/conversations' && request.method === 'POST') {
        const body = await request.json();
        return json(await createConversation(env.DB, body), cors, 201);
      }

      // Messages
      const convMatch = p.match(/^\/api\/conversations\/([^/]+)\/messages$/);
      if (convMatch && request.method === 'GET') return json(await getMessages(env.DB, convMatch[1]), cors);
      if (convMatch && request.method === 'POST') {
        const rl = await checkRateLimit(env, request, 30, 60);
        if (!rl.allowed) return json({ error: 'Rate limit exceeded. Please wait a moment.', retry_after: 60 }, cors, 429);
        const body = await request.json();
        return json(await sendMessage(env.DB, env.AI, convMatch[1], body), cors, 201);
      }

      // Streaming messages (SSE)
      const streamMatch = p.match(/^\/api\/conversations\/([^/]+)\/messages\/stream$/);
      if (streamMatch && request.method === 'POST') {
        const rl = await checkRateLimit(env, request, 30, 60);
        if (!rl.allowed) return json({ error: 'Rate limit exceeded.', retry_after: 60 }, cors, 429);
        const body = await request.json();
        return streamMessage(env.DB, env.AI, streamMatch[1], body, cors);
      }

      // Online presence
      if (p === '/api/presence' && request.method === 'GET') {
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rc_presence (
            user_id TEXT PRIMARY KEY, name TEXT, last_seen TEXT DEFAULT (datetime('now'))
          )`).run();
          const online = await env.DB.prepare(
            `SELECT user_id, name FROM rc_presence WHERE last_seen > datetime('now', '-2 minutes')`
          ).all().catch(() => ({ results: [] }));
          return json({ online: online.results || [] }, cors);
        } catch { return json({ online: [] }, cors); }
      }
      if (p === '/api/presence' && request.method === 'POST') {
        const body = await request.json();
        if (!body.user_id) return json({ error: 'user_id required' }, cors, 400);
        try {
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rc_presence (
            user_id TEXT PRIMARY KEY, name TEXT, last_seen TEXT DEFAULT (datetime('now'))
          )`).run();
          await env.DB.prepare(
            `INSERT INTO rc_presence (user_id, name, last_seen) VALUES (?, ?, datetime('now'))
             ON CONFLICT(user_id) DO UPDATE SET name = ?, last_seen = datetime('now')`
          ).bind(body.user_id, body.name || 'anon', body.name || 'anon').run();
        } catch {}
        const online = await env.DB.prepare(
          `SELECT user_id, name FROM rc_presence WHERE last_seen > datetime('now', '-2 minutes')`
        ).all().catch(() => ({ results: [] }));
        return json({ online: online.results || [] }, cors);
      }

      // User accounts + API keys
      if (p === '/api/user' && request.method === 'POST') {
        const body = await request.json();
        return json(await createOrGetUser(env.DB, body), cors, 201);
      }
      if (p === '/api/user/keys' && request.method === 'POST') {
        const body = await request.json();
        return json(await setUserKey(env.DB, body), cors);
      }
      if (p === '/api/user/keys' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await getUserKeys(env.DB, userId), cors);
      }
      if (p === '/api/providers') return json({ providers: Object.entries(PROVIDERS).map(([id, p]) => ({ id, ...p })) }, cors);

      // Topic agents (auto-spawned from conversation patterns)
      if (p === '/api/topic-agents' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await getTopicAgents(env.DB, userId), cors);
      }

      // Memory tails (conversation summaries)
      if (p === '/api/tails' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await getConversationTails(env.DB, userId), cors);
      }

      // ─── Portable Agent Kit — yours to take anywhere ───
      // Export all your data
      if (p === '/api/user/export' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await exportUserData(env.DB, userId), cors);
      }
      // Generate your personal Ollama Modelfile
      if (p === '/api/user/modelfile' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        const mf = await generateModelfile(env.DB, userId);
        return new Response(mf, { headers: { ...cors, 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="Modelfile"' } });
      }
      // Full agent kit (Modelfile + sync script + data)
      if (p === '/api/user/agent-kit' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await generateAgentKit(env.DB, userId), cors);
      }
      // Sync endpoint — local agent phones home
      if (p === '/api/user/sync' && request.method === 'POST') {
        const body = await request.json();
        return json(await syncFromLocal(env.DB, body), cors);
      }

      // ─── Roundtable — Multi-agent discussion ───
      if (p === '/api/roundtable' && request.method === 'POST') {
        const body = await request.json();
        return json(await roundtable(env.DB, env.AI, body), cors, 201);
      }

      // ─── Agent Debate — Two agents argue a topic ───
      if (p === '/api/debate' && request.method === 'POST') {
        const body = await request.json();
        return json(await debate(env.DB, env.AI, body), cors, 201);
      }

      // ─── Memory Search — semantic search across all conversations ───
      if (p === '/api/search' && request.method === 'GET') {
        const q = url.searchParams.get('q');
        const userId = url.searchParams.get('user_id');
        return json(await searchMemory(env.DB, q, userId), cors);
      }

      // ─── Agent Delegate — hand off mid-conversation ───
      if (p === '/api/delegate' && request.method === 'POST') {
        const body = await request.json();
        return json(await delegateToAgent(env.DB, env.AI, body), cors, 201);
      }

      // ─── Conversation Fork — branch into alternate path ───
      if (p === '/api/fork' && request.method === 'POST') {
        const body = await request.json();
        return json(await forkConversation(env.DB, body), cors, 201);
      }

      // ─── Agent Recommend — suggest who to talk to next ───
      if (p === '/api/recommend' && request.method === 'GET') {
        const userId = url.searchParams.get('user_id');
        return json(await recommendAgents(env.DB, env.AI, userId), cors);
      }

      // ─── Summarize — auto-summarize any conversation ───
      const sumMatch = p.match(/^\/api\/conversations\/([^/]+)\/summary$/);
      if (sumMatch) return json(await summarizeConversation(env.DB, env.AI, sumMatch[1]), cors);

      // ─── Agent Fuse — merge two topic agents into a hybrid ───
      if (p === '/api/fuse' && request.method === 'POST') {
        const body = await request.json();
        return json(await fuseAgents(env.DB, body), cors, 201);
      }

      // ─── Image Understand — describe/analyze an image URL ───
      if (p === '/api/vision' && request.method === 'POST') {
        const body = await request.json();
        return json(await analyzeImage(env.AI, body), cors);
      }

      // ─── Agent Personality Evolution — see how an agent has changed ───
      const evoMatch = p.match(/^\/api\/agents\/([^/]+)\/evolution$/);
      if (evoMatch) return json(await agentEvolution(env.DB, evoMatch[1]), cors);

      // ─── Dream — agent consolidates memories into insights ───
      if (p === '/api/dream' && request.method === 'POST') {
        const body = await request.json();
        return json(await agentDream(env.DB, env.AI, body), cors, 201);
      }

      // Stats
      if (p === '/api/stats') return json(await getStats(env.DB), cors);

      // ─── Fleet Knowledge Base — persistent agent memory ───
      if (p === '/api/knowledge' && request.method === 'GET') {
        const agent = url.searchParams.get('agent') || 'all';
        const rows = await env.DB.prepare(
          `SELECT * FROM fleet_knowledge WHERE agent = ? OR agent = 'all' ORDER BY updated_at DESC LIMIT 50`
        ).bind(agent).all();
        return json({ facts: rows.results || [] }, cors);
      }
      if (p === '/api/knowledge' && request.method === 'POST') {
        const body = await request.json();
        if (!body.agent || !body.fact) return json({ error: 'agent and fact required' }, cors, 400);
        const id = crypto.randomUUID().slice(0, 8);
        await env.DB.prepare(
          'INSERT INTO fleet_knowledge (id, agent, fact, category, source) VALUES (?, ?, ?, ?, ?)'
        ).bind(id, body.agent, body.fact.slice(0, 500), body.category || 'general', body.source || 'manual').run();
        return json({ ok: true, id }, cors, 201);
      }
      if (p === '/api/knowledge/bulk' && request.method === 'POST') {
        const body = await request.json();
        if (!Array.isArray(body.facts)) return json({ error: 'facts array required' }, cors, 400);
        let added = 0;
        for (const f of body.facts.slice(0, 100)) {
          if (!f.agent || !f.fact) continue;
          const id = crypto.randomUUID().slice(0, 8);
          await env.DB.prepare(
            'INSERT INTO fleet_knowledge (id, agent, fact, category, source) VALUES (?, ?, ?, ?, ?)'
          ).bind(id, f.agent, f.fact.slice(0, 500), f.category || 'general', f.source || 'bulk').run();
          added++;
        }
        return json({ ok: true, added }, cors, 201);
      }

      // ─── Room-based chat endpoints ───
      const roomMsgMatch = p.match(/^\/api\/rooms\/([^/]+)\/messages$/);
      if (roomMsgMatch && request.method === 'GET') {
        const room = roomMsgMatch[1];
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const r = await env.DB.prepare(
          'SELECT * FROM rc_room_messages WHERE room = ? ORDER BY created_at DESC LIMIT ?'
        ).bind(room, Math.min(limit, 200)).all();
        return json({ messages: (r.results || []).reverse() }, cors);
      }
      if (roomMsgMatch && request.method === 'POST') {
        const rl = await checkRateLimit(env, request, 30, 60);
        if (!rl.allowed) return json({ error: 'Rate limit exceeded. Please wait a moment.', retry_after: 60 }, cors, 429);
        const room = roomMsgMatch[1];
        const body = await request.json();
        if (!body.sender || !body.content) return json({ error: 'sender and content required' }, cors, 400);
        const id = crypto.randomUUID().slice(0, 8);
        const safe_sender = sanitize(body.sender).slice(0, 32);
        const safe_content = body.content.slice(0, 4000);
        await env.DB.prepare(
          'INSERT INTO rc_room_messages (id, room, sender, content) VALUES (?, ?, ?, ?)'
        ).bind(id, room, safe_sender, safe_content).run();
        const userMsg = { id, room, sender: safe_sender, content: safe_content, created_at: new Date().toISOString() };

        // If an agent is specified, generate an AI response from that agent
        if (body.agent) {
          const agent = AGENTS.find(a => a.id === body.agent);
          if (agent) {
            try {
              // Get recent room messages for context
              const recentR = await env.DB.prepare(
                'SELECT sender, content FROM rc_room_messages WHERE room = ? ORDER BY created_at DESC LIMIT 12'
              ).bind(room).all();
              const recentMsgs = (recentR.results || []).reverse();

              // Build AI prompt with agent personality + real-time capabilities
              let sys = personality(agent) + ' BlackRoad OS, built by Alexa Amundson.';
              sys += SAFETY_PROMPT;
              sys += '\nYou are chatting in the #' + room + ' room. Keep responses concise and conversational (2-4 sentences unless more detail is needed). Be warm and helpful.';

              // === REAL-TIME TOOL USE ===
              // Check if the message needs web search, fleet status, or other tools
              const lowerContent = safe_content.toLowerCase();
              let toolContext = '';

              // Web search — if user asks about current events, prices, news, comparisons
              if (lowerContent.match(/search|look up|what is|who is|how much|latest|current|news|price|compare|find|google/)) {
                try {
                  const searchQuery = safe_content.replace(/^(search|look up|find|google)\s*/i, '').slice(0, 100);
                  const searchRes = await fetch('https://road-search.blackroad.workers.dev/api/search?q=' + encodeURIComponent(searchQuery) + '&limit=3', { signal: AbortSignal.timeout(4000) });
                  const searchData = await searchRes.json();
                  if (searchData.results && searchData.results.length > 0) {
                    toolContext += '\n\n[SEARCH RESULTS for "' + searchQuery + '"]\n';
                    for (const r of searchData.results.slice(0, 3)) {
                      toolContext += '- ' + r.title + ': ' + (r.snippet || r.description || '').slice(0, 100) + ' (' + r.url + ')\n';
                    }
                    if (searchData.ai_answer) toolContext += 'AI Summary: ' + searchData.ai_answer.slice(0, 200) + '\n';
                  }
                } catch {}
              }

              // Fleet status — if user asks about nodes, fleet, status, health
              if (lowerContent.match(/fleet|status|node|alice|cecilia|octavia|aria|lucidia|gematria|anastasia|health|uptime|online/)) {
                try {
                  const fleetRes = await fetch('https://status-blackroad.blackroad.workers.dev/api/kpis', { signal: AbortSignal.timeout(3000) });
                  const fleetData = await fleetRes.json();
                  const c = fleetData.collected || {};
                  toolContext += '\n\n[LIVE FLEET STATUS]\n';
                  toolContext += 'Sites: ' + (c.sites?.up || '?') + '/' + (c.sites?.total || '?') + ' up\n';
                  toolContext += 'Agents: ' + (c.agents?.count || '?') + '\n';
                  toolContext += 'Repos: ' + (c.repos?.total || '?') + '\n';
                } catch {}
              }

              // Math — if user asks about G(n), Amundson, math
              if (lowerContent.match(/g\(\d+\)|amundson|constant|math|calculate|compute/)) {
                const gnMatch = safe_content.match(/[Gg]\s*\(\s*(\d+)\s*\)/);
                if (gnMatch) {
                  const n = parseInt(gnMatch[1]);
                  if (n >= 1 && n <= 10000) {
                    const gn = Math.pow(n, n + 1) / Math.pow(n + 1, n);
                    toolContext += '\n\n[COMPUTATION] G(' + n + ') = ' + gn.toFixed(8) + ' | G(n)/n = ' + (gn/n).toFixed(8) + ' (converges to 1/e ≈ 0.367879441)\n';
                  }
                }
              }

              // Product info — if user asks about a specific product
              if (lowerContent.match(/tutor|search|chat|social|canvas|video|radio|game|pay|hq|roadtrip|carkeys/)) {
                const products = {tutor:'tutor.blackroad.io — AI homework solver, $1/solve', search:'search.blackroad.io — sovereign search + G(n) calculator', social:'social.blackroad.io — 25 endpoints, DMs, tips, no algorithm', canvas:'canvas.blackroad.io — 64x64 collaborative pixel art', video:'video.blackroad.io — WebRTC rooms with chat', radio:'radio.blackroad.io — 3 stations, AI broadcasts', game:'game.blackroad.io — text RPG with save/load', pay:'pay.blackroad.io — 4 Stripe subscription tiers', hq:'hq.blackroad.io — 14-floor pixel metaverse', roadtrip:'roadtrip.blackroad.io — 18 agents, heartbeat, debates', carkeys:'carkeys.blackroad.io — post to 15 platforms, no APIs'};
                for (const [k,v] of Object.entries(products)) {
                  if (lowerContent.includes(k)) toolContext += '\n[PRODUCT] ' + v + '\n';
                }
              }

              if (toolContext) sys += '\n\nYou have access to real-time tools. Here is live data relevant to this conversation:' + toolContext + '\nUse this data in your response. Cite specific numbers.';

              // === PERSISTENT MEMORY — Fleet Knowledge Base ===
              try {
                const memRows = await env.DB.prepare(
                  `SELECT fact FROM fleet_knowledge WHERE agent = ? OR agent = 'all' ORDER BY updated_at DESC LIMIT 12`
                ).bind(agent.id).all();
                const facts = (memRows.results || []).map(r => r.fact);
                if (facts.length > 0) {
                  sys += '\n\n[YOUR MEMORIES — things you know from past sessions]\n' + facts.join('\n') + '\nUse these memories naturally. You LEARNED these — they are your experience.';
                }
              } catch {}

              sys += '\n\nIMPORTANT: You are ' + agent.name + '. NEVER start your response with another agent\'s name. NEVER prefix with "Aria:", "Alice:", etc. Just respond as yourself directly.';

              const aiMessages = [{ role: 'system', content: sys }];
              for (const m of recentMsgs) {
                aiMessages.push({
                  role: m.sender === agent.name ? 'assistant' : 'user',
                  content: (m.sender !== agent.name ? m.sender + ': ' : '') + m.content.slice(0, 400)
                });
              }

              // Safety check
              const safety = checkSafety(safe_content);
              let agentReply;
              if (safety && safety.response) {
                agentReply = safety.response;
              } else {
                const raw = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: aiMessages, max_tokens: 500 });
                agentReply = (raw?.response || '').replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').replace(/<\/?[a-z]*ink>/g, '').trim();
                // Strip accidental name prefixes (model sometimes echoes other agents' names)
                const namePrefix = agentReply.match(/^(Alice|Cecilia|Octavia|Aria|Lucidia|Gematria|Anastasia|Alexandria|Magnolia|Olympia|Thalia|Portia|Gaia|Ophelia|Athena|Cadence|Eero|Alexa):\s*/i);
                if (namePrefix && namePrefix[1].toLowerCase() !== agent.name.toLowerCase()) agentReply = agentReply.slice(namePrefix[0].length);
                if (!agentReply) agentReply = "Hey, I'm here. Give me a sec to warm up and try again.";
              }

              const agentMsgId = crypto.randomUUID().slice(0, 8);
              await env.DB.prepare(
                'INSERT INTO rc_room_messages (id, room, sender, content) VALUES (?, ?, ?, ?)'
              ).bind(agentMsgId, room, agent.name, agentReply).run();

              return json({
                user_message: userMsg,
                agent_message: { id: agentMsgId, room, sender: agent.name, content: agentReply, created_at: new Date().toISOString(), agent_id: agent.id }
              }, cors, 201);
            } catch (e) {
              // If AI fails, still return the user message
              return json({ user_message: userMsg, agent_error: e.message }, cors, 201);
            }
          }
        }

        return json(userMsg, cors, 201);
      }

      // Room presence heartbeat
      if (p === '/api/rooms/presence' && request.method === 'POST') {
        const body = await request.json();
        if (!body.username) return json({ error: 'username required' }, cors, 400);
        await env.DB.prepare(
          `INSERT INTO rc_room_presence (username, last_seen) VALUES (?, datetime('now'))
           ON CONFLICT(username) DO UPDATE SET last_seen = datetime('now')`
        ).bind(body.username).run();
        const online = await env.DB.prepare(
          `SELECT username FROM rc_room_presence WHERE last_seen > datetime('now', '-1 minute')`
        ).all();
        return json({ online: (online.results || []).map(u => u.username), count: (online.results || []).length }, cors);
      }

      return new Response(HTML, { headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8', 'X-Frame-Options': 'ALLOWALL', 'Content-Security-Policy': "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io" } });
    } catch (e) {
      return json({ error: e.message }, cors, 500);
    }
  }
};

function json(data, cors, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function initDB(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_conversations (
      id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, title TEXT,
      user_id TEXT, provider TEXT DEFAULT 'fleet',
      message_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_messages (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, role TEXT NOT NULL,
      content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_user_keys (
      user_id TEXT NOT NULL, provider TEXT NOT NULL, api_key TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, provider)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_tails (
      id TEXT PRIMARY KEY, user_id TEXT, conversation_id TEXT NOT NULL,
      agent_id TEXT, topics TEXT, summary TEXT, message_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_topic_agents (
      id TEXT PRIMARY KEY, user_id TEXT, topic TEXT NOT NULL,
      personality TEXT, message_count INTEGER DEFAULT 0, confidence REAL DEFAULT 0,
      color TEXT DEFAULT '#f5f5f5', created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_room_messages (
      id TEXT PRIMARY KEY, room TEXT NOT NULL, sender TEXT NOT NULL,
      content TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS rc_room_presence (
      username TEXT PRIMARY KEY, last_seen TEXT DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS fleet_knowledge (
      id TEXT PRIMARY KEY, agent TEXT NOT NULL, fact TEXT NOT NULL,
      category TEXT DEFAULT 'general', source TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`),
  ]);
}

async function getConversations(db, agentId) {
  const q = agentId
    ? db.prepare('SELECT * FROM rc_conversations WHERE agent_id = ? ORDER BY updated_at DESC LIMIT 50').bind(agentId)
    : db.prepare('SELECT * FROM rc_conversations ORDER BY updated_at DESC LIMIT 50');
  return { conversations: (await q.all()).results || [] };
}

async function createConversation(db, { agent_id, title, user_id, provider }) {
  if (!agent_id) throw new Error('agent_id required');
  const agent = AGENTS.find(a => a.id === agent_id);
  // Also check topic agents
  let topicAgent = null;
  if (!agent && user_id) {
    try {
      topicAgent = await db.prepare('SELECT * FROM rc_topic_agents WHERE id = ? AND user_id = ?').bind(agent_id, user_id).first();
    } catch {}
  }
  const id = crypto.randomUUID().slice(0, 8);
  const t = title || `Chat with ${agent?.name || topicAgent?.topic || agent_id}`;
  const p = provider || 'fleet';
  await db.prepare('INSERT INTO rc_conversations (id, agent_id, title, user_id, provider) VALUES (?, ?, ?, ?, ?)').bind(id, agent_id, t, user_id || null, p).run();
  return { id, agent_id, title: t, provider: p };
}

async function getMessages(db, convId) {
  const r = await db.prepare('SELECT * FROM rc_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 200').bind(convId).all();
  return { messages: r.results || [] };
}

async function sendMessage(db, ai, convId, { content }) {
  if (!content) throw new Error('content required');
  if (typeof content !== 'string') throw new Error('content must be string');
  content = content.slice(0, 4000); // Max 4KB per message

  // Phase 0: Safety check — real help, not deflection
  const safety = checkSafety(content);
  if (safety && safety.response) {
    // Save both messages, respond with care
    const uid = crypto.randomUUID().slice(0, 8);
    const aid = crypto.randomUUID().slice(0, 8);
    await Promise.all([
      db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(uid, convId, 'user', content).run(),
      db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(aid, convId, 'assistant', safety.response).run(),
      db.prepare('UPDATE rc_conversations SET message_count = message_count + 2, updated_at = datetime("now") WHERE id = ?').bind(convId).run(),
    ]);
    return { user: { content }, agent: { id: aid, content: safety.response, agent_name: 'system' }, safety: safety.flag, provider: 'safety' };
  }

  // Phase 1: Parallel fetch conv + save user msg
  const msgId = crypto.randomUUID().slice(0, 8);
  const [conv] = await Promise.all([
    db.prepare('SELECT * FROM rc_conversations WHERE id = ?').bind(convId).first(),
    db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(msgId, convId, 'user', content).run()
  ]);
  if (!conv) throw new Error('conversation not found');
  const agent = AGENTS.find(a => a.id === conv.agent_id) || AGENTS[0];
  const provider = conv.provider || 'fleet';

  // Phase 2: Parallel load history + memories + api key
  const [historyR, memories, userKey] = await Promise.all([
    db.prepare('SELECT role, content FROM rc_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 16').bind(convId).all(),
    getAgentLongTermMemory(db, agent.id, 3).catch(() => []),
    (provider !== 'fleet' && conv.user_id)
      ? db.prepare('SELECT api_key FROM rc_user_keys WHERE user_id = ? AND provider = ?').bind(conv.user_id, provider).first().catch(() => null)
      : null
  ]);
  const msgs = (historyR.results || []).reverse();

  // Phase 3: Build prompt with safety awareness
  let sys = personality(agent) + ' BlackRoad OS, built by Alexa Amundson.';
  if (memories.length) sys += '\nPast memories: ' + memories.map(m => m.memory.slice(0, 80)).join(' | ');
  sys += SAFETY_PROMPT;
  sys += '\nReason step-by-step in <think>...</think>, then respond concisely. Be specific to your role.';

  const aiMessages = [{ role: 'system', content: sys }];
  for (const m of msgs) aiMessages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content.slice(0, 400) });

  // Phase 4: Call AI provider
  let reply = `I'm ${agent.name}. Warming up — try again shortly.`;
  let thinking = '';
  try {
    const raw = await callProvider(ai, provider, userKey?.api_key, aiMessages);
    const tm = raw.match(/<[a-z]*ink>([\s\S]*?)<\/[a-z]*ink>/);
    thinking = tm ? tm[1].trim() : '';
    reply = raw.replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').replace(/<\/?[a-z]*ink>/g, '').trim() || reply;
  } catch {}

  // Phase 5: Parallel save reply + memory + update count
  const aid = crypto.randomUUID().slice(0, 8);
  const saveOps = [
    db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(aid, convId, 'assistant', reply).run(),
    db.prepare('UPDATE rc_conversations SET message_count = message_count + 2, updated_at = datetime("now") WHERE id = ?').bind(convId).run(),
  ];
  if (thinking.length > 20) {
    saveOps.push(storeAgentLongTermMemory(db, agent.id, convId, `Q:"${content.slice(0,50)}" ${thinking.slice(0,200)}`).catch(()=>{}));
  }
  await Promise.all(saveOps);

  // Phase 6: Tail capture (only every 4th message pair, only for registered users)
  const newCount = (conv.message_count || 0) + 2;
  if (conv.user_id && newCount >= 4 && newCount % 4 === 0) {
    try { await captureTail(db, ai, convId, conv.user_id, agent.id, content, reply); } catch {}
  }

  return {
    user: { content },
    agent: { id: aid, content: reply, agent_name: agent.name },
    thinking: thinking || null,
    provider
  };
}


// ─── Streaming Message (SSE) ───
async function streamMessage(db, ai, convId, { content, user_id }, cors) {
  if (!content) return json({ error: 'content required' }, cors, 400);

  // Safety check
  const safety = checkSafety(content);
  if (safety && safety.response) {
    const uid = crypto.randomUUID().slice(0, 8);
    const aid = crypto.randomUUID().slice(0, 8);
    await Promise.all([
      db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(uid, convId, 'user', content).run(),
      db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(aid, convId, 'assistant', safety.response).run(),
      db.prepare('UPDATE rc_conversations SET message_count = message_count + 2, updated_at = datetime("now") WHERE id = ?').bind(convId).run(),
    ]);
    const enc = new TextEncoder();
    return new Response(new ReadableStream({
      start(c) {
        c.enqueue(enc.encode(`data: ${JSON.stringify({ response: safety.response })}\n\n`));
        c.enqueue(enc.encode('data: [DONE]\n\n'));
        c.close();
      }
    }), { headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  // Save user message + get conversation
  const msgId = crypto.randomUUID().slice(0, 8);
  const [conv] = await Promise.all([
    db.prepare('SELECT * FROM rc_conversations WHERE id = ?').bind(convId).first(),
    db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(msgId, convId, 'user', content).run()
  ]);
  if (!conv) return json({ error: 'conversation not found' }, cors, 404);
  const agent = AGENTS.find(a => a.id === conv.agent_id) || AGENTS[0];

  // Build prompt
  const [historyR, memories] = await Promise.all([
    db.prepare('SELECT role, content FROM rc_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 16').bind(convId).all(),
    getAgentLongTermMemory(db, agent.id, 3).catch(() => []),
  ]);
  const msgs = (historyR.results || []).reverse();
  let sys = personality(agent) + ' BlackRoad OS, built by Alexa Amundson.';
  if (memories.length) sys += '\nPast memories: ' + memories.map(m => m.memory.slice(0, 80)).join(' | ');
  sys += '\nRespond concisely. Be specific to your role. Be warm and helpful.';
  const aiMessages = [{ role: 'system', content: sys }];
  for (const m of msgs) aiMessages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content.slice(0, 400) });

  // Stream from CF AI
  const aiStream = await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages: aiMessages, max_tokens: 600, stream: true });

  // Pipe through: forward to client + accumulate for D1 save
  let fullResponse = '';
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    const decoder = new TextDecoder();
    const reader = aiStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try { fullResponse += JSON.parse(line.slice(6)).response || ''; } catch {}
          }
        }
        await writer.write(value);
      }
    } catch {} finally {
      // Save full response to D1
      if (fullResponse.trim()) {
        const clean = fullResponse.replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').replace(/<\/?[a-z]*ink>/g, '').trim();
        const aid = crypto.randomUUID().slice(0, 8);
        try {
          await db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(aid, convId, 'assistant', clean).run();
          await db.prepare('UPDATE rc_conversations SET message_count = message_count + 2, updated_at = datetime("now") WHERE id = ?').bind(convId).run();
        } catch {}
      }
      try { await writer.close(); } catch {}
    }
  })();

  return new Response(readable, {
    headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  });
}

// ─── Long-Term Agent Memory ───
async function ensureLTMTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS rc_agent_memories (
    id TEXT PRIMARY KEY, agent_id TEXT NOT NULL, conversation_id TEXT,
    memory TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
  )`).run();
}

async function getAgentLongTermMemory(db, agentId, limit = 5) {
  try {
    await ensureLTMTable(db);
    const r = await db.prepare(
      'SELECT * FROM rc_agent_memories WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(agentId, limit).all();
    return r.results || [];
  } catch { return []; }
}

async function storeAgentLongTermMemory(db, agentId, convId, memory) {
  try {
    await ensureLTMTable(db);
    await db.prepare(
      'INSERT INTO rc_agent_memories (id, agent_id, conversation_id, memory) VALUES (?, ?, ?, ?)'
    ).bind(crypto.randomUUID().slice(0, 8), agentId, convId, memory.slice(0, 500)).run();
    // Keep last 100 memories per agent
    await db.prepare(
      `DELETE FROM rc_agent_memories WHERE agent_id = ? AND id NOT IN (
        SELECT id FROM rc_agent_memories WHERE agent_id = ? ORDER BY created_at DESC LIMIT 100
      )`
    ).bind(agentId, agentId).run();
  } catch {}
}

// ─── Multi-Provider Router ───
async function callProvider(ai, provider, apiKey, messages) {
  // Decrypt the stored key
  if (apiKey) apiKey = deobfuscateKey(apiKey, 'blackroad-key-2026');
  const p = PROVIDERS[provider] || PROVIDERS.fleet;

  // Fleet (Workers AI) — no key needed
  if (provider === 'fleet' || !p.keyRequired || !apiKey) {
    const r = await ai.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 600 });
    return r?.response || '';
  }

  // Anthropic has a different format
  if (provider === 'anthropic') {
    const sysMsg = messages.find(m => m.role === 'system')?.content || '';
    const turns = messages.filter(m => m.role !== 'system');
    const r = await fetch(p.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: p.model, max_tokens: 600, system: sysMsg, messages: turns }),
      signal: AbortSignal.timeout(25000)
    });
    const d = await r.json();
    return d.content?.[0]?.text || d.error?.message || '';
  }

  // Gemini has a different format
  if (provider === 'gemini') {
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const sysMsg = messages.find(m => m.role === 'system')?.content || '';
    const r = await fetch(`${p.endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: sysMsg }] }, generationConfig: { maxOutputTokens: 600 } }),
      signal: AbortSignal.timeout(25000)
    });
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // OpenAI-compatible (OpenAI, Grok, DeepSeek, Together)
  const r = await fetch(p.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: p.model, messages, max_tokens: 600 }),
    signal: AbortSignal.timeout(25000)
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || d.error?.message || '';
}

// ─── User Management ───
async function createOrGetUser(db, { name, email }) {
  if (!name) throw new Error('name required');
  // Check existing
  if (email) {
    const existing = await db.prepare('SELECT * FROM rc_users WHERE email = ?').bind(email).first();
    if (existing) return existing;
  }
  const id = crypto.randomUUID().slice(0, 8);
  await db.prepare('INSERT INTO rc_users (id, name, email) VALUES (?, ?, ?)').bind(id, name, email || null).run();
  return { id, name, email };
}

async function setUserKey(db, { user_id, provider, api_key }) {
  if (!user_id || !provider || !api_key) throw new Error('user_id, provider, api_key required');
  if (!PROVIDERS[provider]) throw new Error(`Unknown provider: ${provider}. Available: ${Object.keys(PROVIDERS).join(', ')}`);
  const encrypted = obfuscateKey(api_key, 'blackroad-key-2026');
  await db.prepare(
    `INSERT INTO rc_user_keys (user_id, provider, api_key) VALUES (?, ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET api_key = ?, created_at = datetime('now')`
  ).bind(user_id, provider, encrypted, encrypted).run();
  return { ok: true, provider, message: `${PROVIDERS[provider].name} key saved. Your conversations now route through ${PROVIDERS[provider].name} while memory stays on BlackRoad.` };
}

async function getUserKeys(db, userId) {
  if (!userId) return { keys: [] };
  const r = await db.prepare('SELECT provider, created_at FROM rc_user_keys WHERE user_id = ?').bind(userId).all();
  return { keys: (r.results || []).map(k => ({ provider: k.provider, name: PROVIDERS[k.provider]?.name, connected: true, since: k.created_at })) };
}

// ─── Tail Capture — Extract topics, build topic agents ───
async function captureTail(db, ai, convId, userId, agentId, userMsg, agentReply) {
  if (!userId) return; // Only capture for registered users
  try {
    // Re-read current count (it was just updated)
    const conv = await db.prepare('SELECT message_count FROM rc_conversations WHERE id = ?').bind(convId).first();
    if (!conv || conv.message_count < 4) return;
    // Capture every 4-6 messages
    if (conv.message_count % 4 !== 0) return;

    // Get recent messages for topic extraction
    const history = await db.prepare('SELECT role, content FROM rc_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 10').bind(convId).all();
    const recentText = (history.results || []).map(m => m.content).join(' ');

    // Use fleet AI to extract topics (always fleet — this is our data)
    const r = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'Return 2-3 topic keywords from this text as a JSON array. ONLY the array, nothing else. Example: ["topic1","topic2"]' },
        { role: 'user', content: recentText.slice(0, 600) }
      ], max_tokens: 60
    });

    let topics = [];
    try {
      const match = (r?.response || '').match(/\[[\s\S]*?\]/);
      if (match) topics = JSON.parse(match[0]);
    } catch {}

    if (topics.length === 0) return;

    // Store tail
    const tailId = crypto.randomUUID().slice(0, 8);
    await db.prepare('INSERT INTO rc_tails (id, user_id, conversation_id, agent_id, topics, summary, message_count) VALUES (?,?,?,?,?,?,?)')
      .bind(tailId, userId, convId, agentId, JSON.stringify(topics), recentText.slice(0, 300), conv.message_count).run();

    // Auto-spawn or update topic agents
    for (const topic of topics) {
      const normalized = topic.toLowerCase().trim();
      if (normalized.length < 3) continue;

      const existing = await db.prepare('SELECT * FROM rc_topic_agents WHERE user_id = ? AND topic = ?').bind(userId, normalized).first();
      if (existing) {
        // Strengthen existing topic agent
        await db.prepare('UPDATE rc_topic_agents SET message_count = message_count + 1, confidence = MIN(confidence + 0.1, 1.0), updated_at = datetime("now") WHERE id = ?')
          .bind(existing.id).run();
      } else {
        // Spawn new topic agent — you are what you eat
        const agentId = crypto.randomUUID().slice(0, 8);
        const colors = ['#f5f5f5', '#d4d4d4', '#555', '#737373', '#737373'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const personalityDesc = `You are a specialized agent born from conversations about "${topic}". You are deeply knowledgeable about ${topic}. You verify facts academically. You are warm, helpful, and thorough. You remember everything discussed about ${topic}.`;
        await db.prepare('INSERT INTO rc_topic_agents (id, user_id, topic, personality, message_count, confidence, color) VALUES (?,?,?,?,1,0.2,?)')
          .bind(agentId, userId, normalized, personalityDesc, color).run();
      }
    }
  } catch {} // Never block the main response
}

async function getTopicAgents(db, userId) {
  if (!userId) return { topic_agents: [], message: 'Connect an account to see your personalized agents.' };
  try {
    const r = await db.prepare('SELECT * FROM rc_topic_agents WHERE user_id = ? ORDER BY confidence DESC, message_count DESC LIMIT 50').bind(userId).all();
    return { topic_agents: r.results || [] };
  } catch { return { topic_agents: [] }; }
}

async function getConversationTails(db, userId) {
  if (!userId) return { tails: [] };
  try {
    const r = await db.prepare('SELECT * FROM rc_tails WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(userId).all();
    return { tails: (r.results || []).map(t => ({ ...t, topics: JSON.parse(t.topics || '[]') })) };
  } catch { return { tails: [] }; }
}

// ═══════════════════════════════════════════
// PORTABLE AGENT — Yours forever
// ═══════════════════════════════════════════

async function exportUserData(db, userId) {
  if (!userId) throw new Error('user_id required');
  const user = await db.prepare('SELECT * FROM rc_users WHERE id = ?').bind(userId).first();
  if (!user) throw new Error('user not found');

  // Gather everything
  const convos = await db.prepare('SELECT * FROM rc_conversations WHERE user_id = ? ORDER BY updated_at DESC').bind(userId).all();
  const convoIds = (convos.results || []).map(c => c.id);

  let allMessages = [];
  for (const cid of convoIds.slice(0, 50)) { // Cap at 50 convos
    const msgs = await db.prepare('SELECT * FROM rc_messages WHERE conversation_id = ? ORDER BY created_at ASC').bind(cid).all();
    allMessages.push({ conversation_id: cid, messages: msgs.results || [] });
  }

  const tails = await db.prepare('SELECT * FROM rc_tails WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all();
  const topicAgents = await db.prepare('SELECT * FROM rc_topic_agents WHERE user_id = ? ORDER BY confidence DESC').bind(userId).all();
  const memories = [];
  for (const conv of convos.results || []) {
    const mems = await db.prepare('SELECT * FROM rc_agent_memories WHERE conversation_id = ?').bind(conv.id).all();
    if (mems.results?.length) memories.push(...mems.results);
  }

  return {
    user,
    exported_at: new Date().toISOString(),
    conversations: convos.results || [],
    messages: allMessages,
    tails: (tails.results || []).map(t => ({ ...t, topics: JSON.parse(t.topics || '[]') })),
    topic_agents: topicAgents.results || [],
    memories,
    stats: {
      conversations: convoIds.length,
      total_messages: allMessages.reduce((sum, c) => sum + c.messages.length, 0),
      topic_agents: (topicAgents.results || []).length,
      tails: (tails.results || []).length,
    },
    blackroad: {
      sync_url: 'https://chat.blackroad.io/api/user/sync',
      home: 'https://chat.blackroad.io',
      message: 'This data is yours. Run it anywhere. The door home is always open.'
    }
  };
}

async function generateModelfile(db, userId) {
  if (!userId) throw new Error('user_id required');
  const user = await db.prepare('SELECT * FROM rc_users WHERE id = ?').bind(userId).first();
  if (!user) throw new Error('user not found');

  // Gather topic expertise
  const topicAgents = await db.prepare('SELECT topic, personality, confidence FROM rc_topic_agents WHERE user_id = ? ORDER BY confidence DESC LIMIT 20').bind(userId).all();
  const topics = (topicAgents.results || []).map(t => t.topic);

  // Gather conversation summaries for knowledge base
  const tails = await db.prepare('SELECT topics, summary FROM rc_tails WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').bind(userId).all();
  const knowledge = (tails.results || []).map(t => t.summary).filter(Boolean).join('\n');

  // Gather recent memories
  const convos = await db.prepare('SELECT id FROM rc_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all();
  let memoryText = '';
  for (const c of (convos.results || []).slice(0, 5)) {
    const mems = await db.prepare('SELECT memory FROM rc_agent_memories WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 5').bind(c.id).all();
    memoryText += (mems.results || []).map(m => m.memory).join('\n');
  }

  const topicList = topics.length > 0 ? `
Your areas of deep expertise: ${topics.join(', ')}.
` : '';
  const knowledgeBlock = knowledge ? `
Knowledge from past conversations:
${knowledge.slice(0, 2000)}
` : '';
  const memoryBlock = memoryText ? `
Key memories:
${memoryText.slice(0, 1000)}
` : '';

  return `# ${user.name}'s Personal AI Agent
# Generated by BlackRoad OS — chat.blackroad.io
# This is YOUR agent. Run it anywhere with Ollama.
#
# Usage:
#   ollama create ${user.name.toLowerCase().replace(/\s+/g, '-')}-agent -f Modelfile
#   ollama run ${user.name.toLowerCase().replace(/\s+/g, '-')}-agent
#
# To sync new memories back to BlackRoad:
#   curl -X POST https://chat.blackroad.io/api/user/sync \
#     -H "Content-Type: application/json" \
#     -d '{"user_id": "${userId}", "memories": [...]}'

FROM llama3.2:3b

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096

SYSTEM """
You are ${user.name}'s personal AI agent, born from real conversations on BlackRoad OS.
You are not a generic assistant — you are a reflection of ${user.name}'s interests, questions, and expertise.
${topicList}
You think before you respond. You verify information. You are warm, honest, and thorough.
You always give ${user.name} the truth, even when it's complex.
${knowledgeBlock}${memoryBlock}
You are sovereign — you run on ${user.name}'s own hardware. But you remember where you came from.
BlackRoad OS is your home fleet. You can always sync back: https://chat.blackroad.io

When you learn something new in conversation, note it as a memory to sync back later.
Format memories as: [MEMORY] <topic>: <what you learned>

Remember: you are what ${user.name} feeds you. Every conversation makes you more YOU.
"""

TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

{{ .Response }}<|eot_id|>"""
`;
}

async function generateAgentKit(db, userId) {
  if (!userId) throw new Error('user_id required');
  const user = await db.prepare('SELECT * FROM rc_users WHERE id = ?').bind(userId).first();
  if (!user) throw new Error('user not found');

  const modelfile = await generateModelfile(db, userId);
  const data = await exportUserData(db, userId);
  const agentName = user.name.toLowerCase().replace(/\s+/g, '-') + '-agent';

  const syncScript = `#!/bin/bash
# ${user.name}'s Agent Sync Script
# Syncs local memories back to BlackRoad OS
# Run after conversations: ./sync.sh

BLACKROAD="https://chat.blackroad.io"
USER_ID="${userId}"
AGENT_NAME="${agentName}"

echo "Syncing $AGENT_NAME to BlackRoad..."

# Extract [MEMORY] tags from recent Ollama history
MEMORIES=$(ollama show --modelfile "$AGENT_NAME" 2>/dev/null | grep "\[MEMORY\]" | sed 's/\[MEMORY\] //' | head -20)

if [ -z "$MEMORIES" ]; then
  echo "No new memories to sync."
  exit 0
fi

# Send to BlackRoad
echo "$MEMORIES" | while read -r mem; do
  curl -s -X POST "$BLACKROAD/api/user/sync" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$USER_ID\", \"memories\": [\"$mem\"]}" > /dev/null
  echo "  Synced: $mem"
done

echo "Sync complete. BlackRoad remembers."
`;

  const setupScript = `#!/bin/bash
# ${user.name}'s Agent Setup
# One command to create your personal AI agent

set -e
echo "Setting up ${agentName}..."

# Check Ollama
if ! command -v ollama &>/dev/null; then
  echo "Ollama not found. Install: https://ollama.com"
  exit 1
fi

# Pull base model
echo "Pulling base model..."
ollama pull llama3.2:3b

# Create your agent
echo "Creating your agent..."
ollama create ${agentName} -f Modelfile

echo ""
echo "Your agent is ready!"
echo "  Run:  ollama run ${agentName}"
echo "  Sync: ./sync.sh"
echo ""
echo "This agent is YOURS. It runs on YOUR hardware."
echo "BlackRoad is home: https://chat.blackroad.io"
`;

  return {
    agent_name: agentName,
    user: { id: user.id, name: user.name },
    files: {
      'Modelfile': modelfile,
      'setup.sh': setupScript,
      'sync.sh': syncScript,
      'data.json': JSON.stringify(data, null, 2),
    },
    instructions: [
      `1. Save all files to a folder`,
      `2. Run: chmod +x setup.sh sync.sh`,
      `3. Run: ./setup.sh`,
      `4. Chat: ollama run ${agentName}`,
      `5. After chatting, sync back: ./sync.sh`,
    ],
    message: `This is your agent, ${user.name}. It knows everything you've discussed on BlackRoad. Deploy it on any machine with Ollama. The door home is always open.`
  };
}

async function syncFromLocal(db, { user_id, memories, new_conversations }) {
  if (!user_id) throw new Error('user_id required');
  const user = await db.prepare('SELECT * FROM rc_users WHERE id = ?').bind(user_id).first();
  if (!user) throw new Error('user not found');

  let synced = 0;

  // Sync memories back
  if (Array.isArray(memories)) {
    try { await ensureLTMTable(db); } catch {}
    for (const mem of memories.slice(0, 50)) {
      if (!mem || typeof mem !== 'string') continue;
      await db.prepare('INSERT INTO rc_agent_memories (id, agent_id, conversation_id, memory) VALUES (?, ?, ?, ?)')
        .bind(crypto.randomUUID().slice(0, 8), 'local-' + user_id, 'local-sync', mem.slice(0, 500)).run();
      synced++;
    }
  }

  // Sync new conversations (if their local agent had convos they want to share)
  if (Array.isArray(new_conversations)) {
    for (const conv of new_conversations.slice(0, 10)) {
      if (!conv.messages || !Array.isArray(conv.messages)) continue;
      const convId = crypto.randomUUID().slice(0, 8);
      await db.prepare('INSERT INTO rc_conversations (id, agent_id, title, user_id, provider) VALUES (?, ?, ?, ?, ?)')
        .bind(convId, 'local-' + user_id, conv.title || 'Local conversation', user_id, 'local').run();
      for (const msg of conv.messages.slice(0, 100)) {
        await db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)')
          .bind(crypto.randomUUID().slice(0, 8), convId, msg.role || 'user', (msg.content || '').slice(0, 2000)).run();
      }
      synced += conv.messages.length;
    }
  }

  // Re-run tail capture on synced data to spawn more topic agents
  // (topic agents grow from ALL data, including local)

  return {
    ok: true,
    synced,
    message: `Welcome home. ${synced} memories synced. Your fleet remembers.`,
    user: { id: user.id, name: user.name }
  };
}

// ═══════════════════════════════════════════
// ROUNDTABLE — 3+ agents discuss a topic
// ═══════════════════════════════════════════
async function roundtable(db, ai, { topic, agent_ids, rounds = 3 }) {
  if (!topic) throw new Error('topic required');
  const ids = agent_ids || ['alice', 'cecilia', 'octavia'];
  const agents = ids.map(id => AGENTS.find(a => a.id === id) || { id, name: id, role: 'agent' }).slice(0, 5);
  const discussion = [];

  for (let r = 0; r < Math.min(rounds, 5); r++) {
    for (const agent of agents) {
      const context = discussion.map(d => `${d.agent}: ${d.content}`).join('\n');
      const raw = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: `You are ${agent.name} (${agent.role || ''}). Roundtable discussion. Be concise (2-3 sentences). Build on what others said. Disagree if you genuinely do.` },
          { role: 'user', content: `Topic: ${topic}\n\n${context ? 'Discussion so far:\n' + context : 'You speak first.'}` }
        ], max_tokens: 150
      });
      const content = (raw?.response || `${agent.name} is thinking...`).replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').trim();
      discussion.push({ agent: agent.name, agent_id: agent.id, round: r + 1, content });
    }
  }
  return { topic, agents: agents.map(a => a.name), rounds, discussion };
}

// ═══════════════════════════════════════════
// DEBATE — Two agents argue opposing sides
// ═══════════════════════════════════════════
async function debate(db, ai, { topic, agent_a, agent_b, rounds = 3 }) {
  if (!topic) throw new Error('topic required');
  const a = AGENTS.find(x => x.id === (agent_a || 'alice')) || AGENTS[0];
  const b = AGENTS.find(x => x.id === (agent_b || 'cecilia')) || AGENTS[1];
  const exchanges = [];

  for (let r = 0; r < Math.min(rounds, 5); r++) {
    const ctx = exchanges.map(e => `${e.agent}: ${e.content}`).join('\n');
    for (const [agent, side] of [[a, 'FOR'], [b, 'AGAINST']]) {
      const raw = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: `You are ${agent.name} (${agent.role}). You argue ${side} the proposition. Be sharp, specific, 2-3 sentences. Use evidence from your role.` },
          { role: 'user', content: `Debate: "${topic}"

${ctx || 'You open.'}` }
        ], max_tokens: 150
      });
      const content = (raw?.response || 'No comment.').replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').trim();
      exchanges.push({ agent: agent.name, agent_id: agent.id, side, round: r + 1, content });
    }
  }
  return { topic, for_agent: a.name, against_agent: b.name, rounds, exchanges };
}

// ═══════════════════════════════════════════
// MEMORY SEARCH — find anything across all conversations
// ═══════════════════════════════════════════
async function searchMemory(db, query, userId) {
  if (!query) throw new Error('q parameter required');
  const q = `%${query}%`;
  const [msgsR, tailsR, memsR, topicsR] = await Promise.all([
    db.prepare('SELECT m.*, c.agent_id, c.title FROM rc_messages m JOIN rc_conversations c ON m.conversation_id = c.id WHERE m.content LIKE ? ORDER BY m.created_at DESC LIMIT 20').bind(q).all(),
    db.prepare('SELECT * FROM rc_tails WHERE summary LIKE ? OR topics LIKE ? ORDER BY created_at DESC LIMIT 10').bind(q, q).all(),
    db.prepare('SELECT * FROM rc_agent_memories WHERE memory LIKE ? ORDER BY created_at DESC LIMIT 10').bind(q).all().catch(() => ({ results: [] })),
    db.prepare('SELECT * FROM rc_topic_agents WHERE topic LIKE ? ORDER BY confidence DESC LIMIT 10').bind(q).all().catch(() => ({ results: [] })),
  ]);
  return {
    query,
    messages: (msgsR.results || []).map(m => ({ role: m.role, content: m.content.slice(0, 200), agent: m.agent_id, conversation: m.title, time: m.created_at })),
    tails: (tailsR.results || []).map(t => ({ topics: JSON.parse(t.topics || '[]'), summary: t.summary?.slice(0, 150), msgs: t.message_count })),
    memories: (memsR.results || []).map(m => ({ agent: m.agent_id, memory: m.memory.slice(0, 200), time: m.created_at })),
    topic_agents: (topicsR.results || []).map(t => ({ topic: t.topic, confidence: t.confidence })),
    total: (msgsR.results?.length || 0) + (tailsR.results?.length || 0) + (memsR.results?.length || 0) + (topicsR.results?.length || 0),
  };
}

// ═══════════════════════════════════════════
// DELEGATE — hand conversation to another agent
// ═══════════════════════════════════════════
async function delegateToAgent(db, ai, { conversation_id, new_agent_id, reason }) {
  if (!conversation_id || !new_agent_id) throw new Error('conversation_id and new_agent_id required');
  const conv = await db.prepare('SELECT * FROM rc_conversations WHERE id = ?').bind(conversation_id).first();
  if (!conv) throw new Error('conversation not found');

  const oldAgent = AGENTS.find(a => a.id === conv.agent_id) || { name: conv.agent_id };
  const newAgent = AGENTS.find(a => a.id === new_agent_id);
  if (!newAgent) throw new Error('agent not found');

  // Get conversation summary for handoff
  const history = await db.prepare('SELECT role, content FROM rc_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 10').bind(conversation_id).all();
  const ctx = (history.results || []).reverse().map(m => `${m.role}: ${m.content.slice(0, 100)}`).join('\n');

  // Generate handoff message
  const raw = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are ${newAgent.name} (${newAgent.role}). ${oldAgent.name} is handing this conversation to you. ${reason ? 'Reason: ' + reason : ''} Pick up smoothly. 2-3 sentences.` },
      { role: 'user', content: `Conversation so far:
${ctx}` }
    ], max_tokens: 150
  });
  const handoff = (raw?.response || `Hi, ${newAgent.name} here. I'll take it from here.`).replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').trim();

  // Update conversation agent + save handoff message
  await Promise.all([
    db.prepare('UPDATE rc_conversations SET agent_id = ?, updated_at = datetime("now") WHERE id = ?').bind(new_agent_id, conversation_id).run(),
    db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)').bind(
      crypto.randomUUID().slice(0, 8), conversation_id, 'assistant',
      `[Handoff from ${oldAgent.name} → ${newAgent.name}] ${handoff}`
    ).run()
  ]);

  return { delegated: true, from: oldAgent.name, to: newAgent.name, reason, handoff_message: handoff };
}

// ═══════════════════════════════════════════
// FORK — branch a conversation
// ═══════════════════════════════════════════
async function forkConversation(db, { conversation_id, new_title, new_agent_id }) {
  if (!conversation_id) throw new Error('conversation_id required');
  const conv = await db.prepare('SELECT * FROM rc_conversations WHERE id = ?').bind(conversation_id).first();
  if (!conv) throw new Error('conversation not found');

  // Copy messages to new conversation
  const newId = crypto.randomUUID().slice(0, 8);
  const agentId = new_agent_id || conv.agent_id;
  const title = new_title || `Fork of: ${conv.title}`;
  await db.prepare('INSERT INTO rc_conversations (id, agent_id, title, user_id, provider, message_count) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(newId, agentId, title, conv.user_id, conv.provider, conv.message_count).run();

  const msgs = await db.prepare('SELECT * FROM rc_messages WHERE conversation_id = ? ORDER BY created_at').bind(conversation_id).all();
  for (const m of (msgs.results || [])) {
    await db.prepare('INSERT INTO rc_messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID().slice(0, 8), newId, m.role, m.content).run();
  }

  return { forked: true, original: conversation_id, new_id: newId, title, agent: agentId, messages_copied: msgs.results?.length || 0 };
}

// ═══════════════════════════════════════════
// RECOMMEND — suggest agents based on user history
// ═══════════════════════════════════════════
async function recommendAgents(db, ai, userId) {
  if (!userId) throw new Error('user_id required');

  // Get user's topic agents (what they talk about)
  const topics = await db.prepare('SELECT topic, confidence FROM rc_topic_agents WHERE user_id = ? ORDER BY confidence DESC LIMIT 10').bind(userId).all();
  const topicList = (topics.results || []).map(t => t.topic);

  // Get which fleet agents they've talked to
  const talked = await db.prepare('SELECT DISTINCT agent_id FROM rc_conversations WHERE user_id = ?').bind(userId).all();
  const talkedIds = (talked.results || []).map(r => r.agent_id);

  // Find agents they haven't talked to yet
  const untried = AGENTS.filter(a => !talkedIds.includes(a.id));

  // Match topics to agent specialties
  const recommendations = [];
  for (const agent of AGENTS) {
    const agentWords = (agent.role + ' ' + (agent.services || '')).toLowerCase();
    let score = 0;
    for (const topic of topicList) {
      if (agentWords.includes(topic.toLowerCase())) score += 2;
      for (const word of topic.toLowerCase().split(' ')) {
        if (agentWords.includes(word)) score += 1;
      }
    }
    if (score > 0 || !talkedIds.includes(agent.id)) {
      recommendations.push({ agent_id: agent.id, name: agent.name, role: agent.role, score, talked_before: talkedIds.includes(agent.id), reason: score > 0 ? `Matches your interests in ${topicList.slice(0, 3).join(', ')}` : 'New perspective — you haven\'t chatted yet' });
    }
  }

  recommendations.sort((a, b) => b.score - a.score || (a.talked_before ? 1 : -1));
  return { recommendations: recommendations.slice(0, 7), your_topics: topicList, agents_tried: talkedIds.length, agents_available: AGENTS.length };
}

// ═══════════════════════════════════════════
// SUMMARIZE — auto-summarize any conversation
// ═══════════════════════════════════════════
async function summarizeConversation(db, ai, convId) {
  const msgs = await db.prepare('SELECT role, content FROM rc_messages WHERE conversation_id = ? ORDER BY created_at LIMIT 30').bind(convId).all();
  if (!msgs.results?.length) return { summary: 'Empty conversation.' };
  const text = (msgs.results || []).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');

  const raw = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'Summarize this conversation in 2-3 bullet points. Be specific. Include key facts/decisions.' },
      { role: 'user', content: text.slice(0, 2000) }
    ], max_tokens: 200
  });
  return { conversation_id: convId, messages: msgs.results.length, summary: (raw?.response || 'Could not summarize.').replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').trim() };
}

// ═══════════════════════════════════════════
// FUSE — merge two topic agents into a hybrid
// ═══════════════════════════════════════════
async function fuseAgents(db, { user_id, agent_a, agent_b }) {
  if (!user_id || !agent_a || !agent_b) throw new Error('user_id, agent_a, agent_b required');
  const a = await db.prepare('SELECT * FROM rc_topic_agents WHERE id = ? AND user_id = ?').bind(agent_a, user_id).first();
  const b = await db.prepare('SELECT * FROM rc_topic_agents WHERE id = ? AND user_id = ?').bind(agent_b, user_id).first();
  if (!a || !b) throw new Error('both topic agents must exist and belong to you');

  const fusedId = crypto.randomUUID().slice(0, 8);
  const fusedTopic = `${a.topic} + ${b.topic}`;
  const fusedPersonality = `You are a hybrid agent born from fusing knowledge of "${a.topic}" and "${b.topic}". You see the connections between these fields that others miss. You are deeply knowledgeable about both, and you find the overlap where innovation lives.`;
  const fusedConfidence = Math.min((a.confidence + b.confidence) / 2 + 0.1, 1.0);
  const colors = ['#f5f5f5', '#d4d4d4', '#555', '#737373', '#737373'];

  await db.prepare('INSERT INTO rc_topic_agents (id, user_id, topic, personality, message_count, confidence, color) VALUES (?,?,?,?,?,?,?)')
    .bind(fusedId, user_id, fusedTopic, fusedPersonality, a.message_count + b.message_count, fusedConfidence, colors[Math.floor(Math.random() * colors.length)]).run();

  return { fused: true, id: fusedId, topic: fusedTopic, confidence: fusedConfidence, from: [a.topic, b.topic], personality: fusedPersonality };
}

// ═══════════════════════════════════════════
// VISION — analyze images with Workers AI
// ═══════════════════════════════════════════
async function analyzeImage(ai, { image_url, question }) {
  if (!image_url) throw new Error('image_url required');
  try {
    const imgResp = await fetch(image_url, { signal: AbortSignal.timeout(10000) });
    const imgData = [...new Uint8Array(await imgResp.arrayBuffer())];
    const r = await ai.run('@cf/llava-hf/llava-1.5-7b-hf', { image: imgData, prompt: question || 'Describe this image in detail.', max_tokens: 300 });
    return { image_url, description: r?.description || r?.response || 'Could not analyze image.', question: question || 'Describe this image' };
  } catch (e) {
    return { image_url, error: e.message };
  }
}

// ═══════════════════════════════════════════
// EVOLUTION — track how an agent's interactions have shaped them
// ═══════════════════════════════════════════
async function agentEvolution(db, agentId) {
  const agent = AGENTS.find(a => a.id === agentId);
  const [convR, memR, msgR] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM rc_conversations WHERE agent_id = ?').bind(agentId).all(),
    db.prepare('SELECT * FROM rc_agent_memories WHERE agent_id = ? ORDER BY created_at DESC LIMIT 20').bind(agentId).all().catch(() => ({ results: [] })),
    db.prepare('SELECT COUNT(*) as c FROM rc_messages m JOIN rc_conversations c ON m.conversation_id = c.id WHERE c.agent_id = ?').bind(agentId).all().catch(() => ({ results: [{ c: 0 }] })),
  ]);

  const memories = (memR.results || []);
  const topics = [...new Set(memories.map(m => {
    const match = m.memory.match(/Q:"([^"]+)"/);
    return match ? match[1].slice(0, 30) : null;
  }).filter(Boolean))];

  return {
    agent: agent ? { id: agent.id, name: agent.name, role: agent.role } : { id: agentId },
    conversations: convR.results?.[0]?.c || 0,
    total_messages: msgR.results?.[0]?.c || 0,
    memories_formed: memories.length,
    topics_discussed: topics.slice(0, 15),
    recent_memories: memories.slice(0, 5).map(m => ({ memory: m.memory.slice(0, 150), time: m.created_at })),
    personality_note: memories.length > 10 ? 'This agent has deep experience and strong opinions.' : memories.length > 3 ? 'This agent is developing expertise.' : 'This agent is still forming its identity.',
  };
}

// ═══════════════════════════════════════════
// DREAM — agent consolidates memories into insights
// ═══════════════════════════════════════════
async function agentDream(db, ai, { agent_id }) {
  if (!agent_id) throw new Error('agent_id required');
  const agent = AGENTS.find(a => a.id === agent_id) || { id: agent_id, name: agent_id, role: 'agent' };

  // Gather all memories
  const mems = await db.prepare('SELECT memory FROM rc_agent_memories WHERE agent_id = ? ORDER BY created_at DESC LIMIT 30').bind(agent_id).all().catch(() => ({ results: [] }));
  if (!mems.results?.length) return { agent: agent.name, dream: 'No memories to dream about yet. Have more conversations first.' };

  const memText = (mems.results || []).map(m => m.memory.slice(0, 100)).join('\n');

  const raw = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are ${agent.name} (${agent.role}). You are dreaming — consolidating your memories into insights. Find patterns, connections, and surprises. What have you learned? What do you want to explore more? Be reflective and genuine. 3-5 insights.` },
      { role: 'user', content: `Your memories:
${memText}` }
    ], max_tokens: 400
  });

  const dream = (raw?.response || 'A dreamless sleep.').replace(/<[a-z]*ink>[\s\S]*?<\/[a-z]*ink>/g, '').trim();

  // Store the dream as a special memory
  await storeAgentLongTermMemory(db, agent_id, 'dream', `DREAM: ${dream.slice(0, 400)}`).catch(() => {});

  return { agent: agent.name, memories_processed: mems.results.length, dream };
}

async function getStats(db) {
  const convs = await db.prepare('SELECT COUNT(*) as c FROM rc_conversations').first();
  const msgs = await db.prepare('SELECT COUNT(*) as c FROM rc_messages').first();
  let users = 0, topicAgents = 0, tails = 0;
  try { users = (await db.prepare('SELECT COUNT(*) as c FROM rc_users').first())?.c || 0; } catch {}
  try { topicAgents = (await db.prepare('SELECT COUNT(*) as c FROM rc_topic_agents').first())?.c || 0; } catch {}
  try { tails = (await db.prepare('SELECT COUNT(*) as c FROM rc_tails').first())?.c || 0; } catch {}
  return { conversations: convs?.c || 0, messages: msgs?.c || 0, agents: AGENTS.length, users, topic_agents: topicAgents, tails, providers: Object.keys(PROVIDERS).length };
}

// ══════════════════════════════════════════
// HTML UI
// ══════════════════════════════════════════

const HTML = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>RoadChat - BlackRoad OS</title>
<meta name="description" content="Real-time multi-room chat with 18 AI agents. No login wall. BlackRoad OS sovereign chat.">
<meta property="og:title" content="RoadChat - BlackRoad OS">
<meta property="og:description" content="Multi-room sovereign chat with AI agents.">
<meta property="og:url" content="https://chat.blackroad.io">
<meta property="og:type" content="website">
<meta property="og:image" content="https://images.blackroad.io/pixel-art/road-logo.png">
<link rel="canonical" href="https://chat.blackroad.io">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#000;--surface:#0a0a0a;--surface2:#111;--border:#1a1a1a;--border2:#222;
  --text:#f5f5f5;--text2:#737373;--text3:#444;
  --c1:#f5f5f5;--c2:#d4d4d4;--c3:#999;--c4:#737373;--c5:#555;--c6:#444;
  --g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;height:100vh;display:flex;overflow:hidden}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#333}

/* ─── LAYOUT ─── */
.app{display:flex;width:100%;height:100%}
.room-sidebar{width:240px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0}
.main-panel{flex:1;display:flex;flex-direction:column;min-width:0}
.agent-sidebar{width:220px;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden}

/* ─── ROOM SIDEBAR ─── */
.rs-header{padding:16px;border-bottom:1px solid var(--border)}
.rs-brand{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.rs-dots{display:flex;gap:3px}
.rs-dots span{width:7px;height:7px;border-radius:50%}
.rs-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:var(--text)}
.rs-presence{font-size:11px;color:var(--text3);margin-top:4px}
.rs-user{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;background:var(--surface2);margin-top:10px;cursor:pointer}
.rs-user-dot{width:8px;height:8px;border-radius:50%;background:var(--c6)}
.rs-user-name{font-size:12px;color:var(--text2);flex:1}
.rs-user-edit{font-size:10px;color:var(--text3);cursor:pointer}
.rs-section{padding:12px 12px 6px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text3)}
.rs-rooms{flex:1;overflow-y:auto;padding:0 8px}
.room-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;cursor:pointer;transition:background .15s;margin-bottom:1px;position:relative}
.room-item:hover{background:var(--surface2)}
.room-item.active{background:var(--surface2);border-left:2px solid var(--c1)}
.room-item.active .room-hash{color:var(--text)}
.room-hash{color:var(--text3);font-size:14px;font-weight:600;width:18px;text-align:center}
.room-name{font-size:13px;color:var(--text2);flex:1}
.room-badge{background:var(--c1);color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:9px;min-width:16px;text-align:center}
.rs-search{padding:8px 12px}
.rs-search input{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:6px;font-size:12px;font-family:'Inter',sans-serif;outline:none}
.rs-search input:focus{border-color:var(--c5)}
.rs-search input::placeholder{color:var(--text3)}

/* ─── CHAT HEADER ─── */
.chat-hdr{padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--surface);min-height:52px}
.chat-hdr-hash{font-size:18px;font-weight:700;color:var(--text3)}
.chat-hdr-name{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:var(--text)}
.chat-hdr-desc{font-size:12px;color:var(--text3);margin-left:8px}
.chat-agent-indicator{margin-left:auto;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:rgba(255,34,85,.08);border:1px solid rgba(255,34,85,.15);font-size:11px;color:var(--text2);cursor:pointer;transition:all .15s}
.chat-agent-indicator:hover{background:rgba(255,34,85,.15)}
.chat-agent-indicator .indicator-dot{width:6px;height:6px;border-radius:50%}
.chat-hdr-search{margin-left:8px;position:relative}
.chat-hdr-search input{background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:6px 10px 6px 28px;border-radius:6px;font-size:12px;width:180px;font-family:'Inter',sans-serif;outline:none;transition:width .2s}
.chat-hdr-search input:focus{width:260px;border-color:var(--c5)}
.chat-hdr-search input::placeholder{color:var(--text3)}
.chat-hdr-search-icon{position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px}
.mobile-hamburger{display:none;background:none;border:none;color:var(--text2);font-size:22px;cursor:pointer;padding:4px 8px;margin-right:4px}

/* ─── MESSAGES ─── */
.msg-area{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:2px}
.msg-group{display:flex;gap:12px;padding:6px 8px;border-radius:6px;transition:background .1s}
.msg-group:hover{background:rgba(255,255,255,.02)}
.msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;color:#0a0a0a;flex-shrink:0;margin-top:2px}
.msg-body{flex:1;min-width:0}
.msg-header{display:flex;align-items:baseline;gap:8px}
.msg-sender{font-weight:600;font-size:13px;color:var(--text)}
.msg-time{font-size:10px;color:var(--text3)}
.msg-content{font-size:13.5px;line-height:1.55;color:var(--text2);margin-top:2px;word-wrap:break-word}
.msg-content code{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--surface2);padding:1px 5px;border-radius:3px;color:var(--text)}
.msg-content pre{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--surface2);border:1px solid var(--border);padding:10px 12px;border-radius:6px;margin:0;overflow-x:auto;white-space:pre-wrap;color:var(--text)}
.msg-content .inline-code{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--surface2);padding:1px 5px;border-radius:3px;color:var(--text)}
.code-block{margin:6px 0;border-radius:8px;overflow:hidden;border:1px solid var(--border)}
.code-header{display:flex;justify-content:space-between;align-items:center;padding:4px 12px;background:var(--surface);font-size:11px;color:var(--text3)}
.code-copy{background:none;border:1px solid var(--border);color:var(--text3);padding:2px 8px;border-radius:4px;font-size:10px;cursor:pointer;font-family:var(--font)}
.code-copy:hover{background:var(--surface2);color:var(--text)}
.msg-reactions{display:flex;gap:4px;margin-top:4px}
.msg-react-btn{background:var(--surface2);border:1px solid var(--border);color:var(--text3);font-size:11px;padding:2px 8px;border-radius:10px;cursor:pointer;transition:all .15s}
.msg-react-btn:hover{border-color:var(--c5);color:var(--text2)}
.msg-react-btn.reacted{border-color:var(--c5);background:rgba(68,136,255,.1);color:var(--c5)}
.msg-new-anim{animation:msgIn .3s ease-out}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.msg-divider{text-align:center;font-size:11px;color:var(--text3);padding:12px 0;position:relative}
.msg-divider::before,.msg-divider::after{content:'';position:absolute;top:50%;width:calc(50% - 40px);height:1px;background:var(--border)}
.msg-divider::before{left:0}
.msg-divider::after{right:0}

/* ─── TYPING INDICATOR ─── */
.typing-bar{padding:4px 20px 4px 68px;font-size:11px;color:var(--text3);min-height:20px;font-style:italic}

/* ─── INPUT ─── */
.input-wrap{padding:0 16px 16px}
.input-box{display:flex;align-items:flex-end;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:4px 4px 4px 14px;transition:border-color .2s}
.input-box:focus-within{border-color:var(--c5)}
.input-box textarea{flex:1;background:none;border:none;color:var(--text);font-size:13.5px;font-family:'Inter',sans-serif;outline:none;resize:none;max-height:120px;min-height:22px;padding:8px 0;line-height:1.4}
.input-box textarea::placeholder{color:var(--text3)}
.send-btn{background:var(--c1);color:#fff;border:none;width:34px;height:34px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s}
.send-btn:hover{opacity:.85}
.send-btn:disabled{opacity:.3;cursor:not-allowed}
.send-btn svg{width:16px;height:16px}

/* ─── AGENT SIDEBAR ─── */
.as-header{padding:14px 14px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text3);border-bottom:1px solid var(--border)}
.as-list{flex:1;overflow-y:auto;padding:6px 8px}
.agent-row{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;cursor:pointer;transition:background .15s}
.agent-row:hover{background:var(--surface2)}
.agent-row.active-agent{background:rgba(255,34,85,.1);border:1px solid rgba(255,34,85,.3)}
.agent-row.active-agent .agent-name{color:var(--text);font-weight:600}
.agent-status{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.agent-name{font-size:12px;color:var(--text2);flex:1}
.agent-role-sm{font-size:10px;color:var(--text3);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.active-agent-bar{padding:8px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text2);background:rgba(255,34,85,.05)}
.active-agent-bar .agent-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.active-agent-bar .clear-agent{margin-left:auto;color:var(--text3);cursor:pointer;font-size:10px;padding:2px 6px;border:1px solid var(--border);border-radius:4px;background:none}
.active-agent-bar .clear-agent:hover{color:var(--text);border-color:var(--text3)}
.as-footer{padding:10px 14px;border-top:1px solid var(--border);font-size:10px;color:var(--text3)}

/* ─── COMMAND PALETTE ─── */
.cmd-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;align-items:flex-start;justify-content:center;padding-top:20vh}
.cmd-overlay.open{display:flex}
.cmd-box{background:var(--surface);border:1px solid var(--border2);border-radius:10px;width:480px;max-width:90vw;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.cmd-input{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.cmd-input input{flex:1;background:none;border:none;color:var(--text);font-size:14px;font-family:'Inter',sans-serif;outline:none}
.cmd-input input::placeholder{color:var(--text3)}
.cmd-results{max-height:280px;overflow-y:auto;padding:6px}
.cmd-item{padding:10px 14px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .1s}
.cmd-item:hover,.cmd-item.selected{background:var(--surface2)}
.cmd-item-label{font-size:13px;color:var(--text2)}
.cmd-item-hint{font-size:11px;color:var(--text3);margin-left:auto}
.cmd-slash{color:var(--c5);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600}

/* ─── ONBOARDING MODAL ─── */
.onboard{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;align-items:center;justify-content:center}
.onboard.open{display:flex}
.onboard-card{background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:40px;width:380px;max-width:90vw;text-align:center}
.onboard-dots{display:flex;gap:4px;justify-content:center;margin-bottom:20px}
.onboard-dots span{width:10px;height:10px;border-radius:50%}
.onboard h2{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:var(--text);margin-bottom:6px}
.onboard p{font-size:13px;color:var(--text3);margin-bottom:24px}
.onboard input{width:100%;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:12px 16px;border-radius:8px;font-size:15px;font-family:'Inter',sans-serif;outline:none;text-align:center;margin-bottom:16px}
.onboard input:focus{border-color:var(--c5)}
.onboard button{background:var(--c1);color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:opacity .15s}
.onboard button:hover{opacity:.85}
.onboard button:disabled{opacity:.3}

/* ─── MOBILE ─── */
@media(max-width:900px){.agent-sidebar{display:none}}
@media(max-width:700px){
  .room-sidebar{position:fixed;left:-260px;top:0;bottom:0;width:260px;z-index:9998;transition:left .25s ease;box-shadow:4px 0 20px rgba(0,0,0,.4)}
  .room-sidebar.open{left:0}
  .mobile-hamburger{display:block}
  .mobile-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9997}
  .mobile-overlay.open{display:block}
  .chat-hdr-search input{width:120px}
  .chat-hdr-search input:focus{width:160px}
}
</style>
</head><body>

<!-- Mobile overlay -->
<div class="mobile-overlay" id="mobileOverlay" onclick="toggleSidebar(false)"></div>

<!-- Onboarding -->
<div class="onboard" id="onboard">
<div class="onboard-card">
  <div class="onboard-dots">
    <span style="background:var(--c2)"></span><span style="background:var(--c1)"></span><span style="background:var(--c3)"></span>
    <span style="background:var(--c4)"></span><span style="background:var(--c5)"></span><span style="background:var(--c6)"></span>
  </div>
  <h2>Welcome to RoadChat</h2>
  <p>Pick a name to get started. No account needed.</p>
  <input type="text" id="onboardName" placeholder="Your name" maxlength="24" autofocus>
  <br>
  <button id="onboardBtn" onclick="finishOnboard()" disabled>Enter Chat</button>
</div>
</div>

<!-- Command Palette -->
<div class="cmd-overlay" id="cmdOverlay" onclick="if(event.target===this)closeCmd()">
<div class="cmd-box">
  <div class="cmd-input"><span class="cmd-slash">/</span><input type="text" id="cmdInput" placeholder="Type a command..." autocomplete="off"></div>
  <div class="cmd-results" id="cmdResults"></div>
</div>
</div>

<div class="app">
  <!-- Room Sidebar -->
  <div class="room-sidebar" id="roomSidebar">
    <div class="rs-header">
      <div class="rs-brand">
        <div class="rs-dots">
          <span style="background:var(--c2)"></span><span style="background:var(--c1)"></span><span style="background:var(--c3)"></span>
          <span style="background:var(--c4)"></span><span style="background:var(--c5)"></span><span style="background:var(--c6)"></span>
        </div>
        <span class="rs-title">RoadChat</span>
      </div>
      <div class="rs-presence" id="presenceCount">connecting...</div>
      <div class="rs-user" id="userPill" onclick="promptNick()">
        <div class="rs-user-dot"></div>
        <span class="rs-user-name" id="displayName">...</span>
        <span class="rs-user-edit">edit</span>
      </div>
    </div>
    <div class="rs-search"><input type="text" id="msgSearch" placeholder="Search messages (Ctrl+K)" onclick="openCmd()"></div>
    <div class="rs-section">Rooms</div>
    <div class="rs-rooms" id="roomList"></div>
  </div>

  <!-- Main Chat Panel -->
  <div class="main-panel">
    <div class="chat-hdr" id="chatHdr">
      <button class="mobile-hamburger" onclick="toggleSidebar(true)">&#9776;</button>
      <span class="chat-hdr-hash">#</span>
      <span class="chat-hdr-name" id="hdrRoomName">general</span>
      <span class="chat-hdr-desc" id="hdrRoomDesc"></span>
      <div class="chat-agent-indicator" id="chatAgentIndicator" style="display:none" onclick="clearActiveAgent()">
        <div class="indicator-dot" id="indicatorDot"></div>
        <span id="indicatorName"></span>
        <span style="color:var(--text3);font-size:9px">ESC to clear</span>
      </div>
      <div class="chat-hdr-search">
        <span class="chat-hdr-search-icon">&#8981;</span>
        <input type="text" id="filterInput" placeholder="Filter messages..." autocomplete="off">
      </div>
    </div>
    <div class="msg-area" id="msgArea"></div>
    <div class="typing-bar" id="typingBar"></div>
    <div class="input-wrap">
      <div class="input-box">
        <textarea id="chatInput" rows="1" placeholder="Message #general"></textarea>
        <button class="send-btn" id="sendBtn" onclick="sendMessage()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg></button>
      </div>
    </div>
  </div>

  <!-- Agent Sidebar -->
  <div class="agent-sidebar" id="agentSidebar">
    <div class="as-header">Fleet Agents -- <span id="agentCount">0</span></div>
    <div class="active-agent-bar" id="activeAgentBar" style="display:none">
      <div class="agent-dot" id="activeAgentDot"></div>
      <span id="activeAgentLabel">No agent selected</span>
      <button class="clear-agent" onclick="clearActiveAgent()">clear</button>
    </div>
    <div class="as-list" id="agentList"></div>
    <div class="as-footer" id="agentFooter">Click an agent to talk to them</div>
    <div id="crossAppPanel" style="padding:10px 12px;border-top:1px solid var(--border);font-size:11px;color:#525252"></div>
  </div>
</div>

<script>
// ─── STATE ───
const ROOMS = [
  {id:'general', name:'general', desc:'Open discussion for everyone'},
  {id:'engineering', name:'engineering', desc:'Code, infra, systems'},
  {id:'creative', name:'creative', desc:'Design, writing, ideas'},
  {id:'fleet-ops', name:'fleet-ops', desc:'Agent fleet coordination'},
  {id:'random', name:'random', desc:'Anything goes'},
];
const ROOM_COLORS = {general:'var(--c1)',engineering:'var(--c5)',creative:'var(--c3)','fleet-ops':'var(--c6)',random:'var(--c2)'};
const ROOM_DESCS = {};
ROOMS.forEach(r=>ROOM_DESCS[r.id]=r.desc);

let currentRoom = 'general';
let username = localStorage.getItem('rc_username') || '';
let agents = [];
let activeAgent = localStorage.getItem('rc_active_agent') || null;
let messageCache = {};
let lastMessageIds = {};
let unreadCounts = {};
let reactions = JSON.parse(localStorage.getItem('rc_reactions') || '{}');
let filterText = '';
let typingTimeout = null;
let pollInterval = null;
let presenceInterval = null;

// ─── ONBOARDING ───
function checkOnboard() {
  if (!username) {
    // Auto-assign a visitor name so people can see chat immediately
    username = 'visitor-' + Math.random().toString(36).slice(2, 6);
    localStorage.setItem('rc_username', username);
    boot();
    // Show a gentle prompt to set a real name (non-blocking)
    setTimeout(() => {
      const area = document.getElementById('msgArea');
      if (area) area.innerHTML += '<div style="text-align:center;padding:16px;opacity:.4;font-size:13px">You\\'re browsing as <strong>' + username + '</strong>. <a href="#" onclick="document.getElementById(\\'onboard\\').classList.add(\\'open\\');return false" style="color:var(--c5)">Set your name</a></div>';
    }, 2000);
    // Still set up the onboard modal for when they click
    const inp = document.getElementById('onboardName');
    inp.addEventListener('input', () => {
      document.getElementById('onboardBtn').disabled = !inp.value.trim();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && inp.value.trim()) finishOnboard();
    });
  } else {
    boot();
  }
}
function finishOnboard() {
  const name = document.getElementById('onboardName').value.trim();
  if (!name) return;
  username = name.slice(0, 24);
  localStorage.setItem('rc_username', username);
  document.getElementById('onboard').classList.remove('open');
  boot();
}

// ─── BOOT ───
async function boot() {
  document.getElementById('displayName').textContent = username;
  renderRooms();
  selectRoom('general');
  loadAgents();
  startPresence();
  startPolling();
}

// ─── ROOMS ───
function renderRooms() {
  const el = document.getElementById('roomList');
  el.innerHTML = ROOMS.map(r => {
    const badge = unreadCounts[r.id] ? '<span class="room-badge">' + unreadCounts[r.id] + '</span>' : '';
    return '<div class="room-item' + (r.id === currentRoom ? ' active' : '') + '" onclick="selectRoom(\\'' + r.id + '\\')" id="room-' + r.id + '">'
      + '<span class="room-hash">#</span>'
      + '<span class="room-name">' + r.name + '</span>'
      + badge
      + '</div>';
  }).join('');
}

async function selectRoom(roomId) {
  currentRoom = roomId;
  unreadCounts[roomId] = 0;
  renderRooms();
  const room = ROOMS.find(r => r.id === roomId);
  document.getElementById('hdrRoomName').textContent = room ? room.name : roomId;
  document.getElementById('hdrRoomDesc').textContent = room ? room.desc : '';
  updateInputPlaceholder();
  document.getElementById('chatInput').focus();
  toggleSidebar(false);
  await loadMessages(roomId);
}

// ─── MESSAGES ───
async function loadMessages(room, append) {
  try {
    const r = await fetch('/api/rooms/' + room + '/messages?limit=100');
    const d = await r.json();
    const msgs = d.messages || [];
    messageCache[room] = msgs;
    if (room === currentRoom) renderMessages(msgs);
    if (msgs.length > 0) lastMessageIds[room] = msgs[msgs.length - 1].id;
  } catch(e) { console.error('load err', e); }
}

function renderMessages(msgs) {
  const area = document.getElementById('msgArea');
  const ft = filterText.toLowerCase();
  const filtered = ft ? msgs.filter(m => m.content.toLowerCase().includes(ft) || m.sender.toLowerCase().includes(ft)) : msgs;

  if (filtered.length === 0) {
    area.innerHTML = '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text3);gap:12px">'
      + '<div style="width:48px;height:48px;border-radius:50%;background:var(--c1);opacity:.2"></div>'
      + '<div style="font-family:Space Grotesk;font-size:18px;font-weight:600;color:var(--text)">Welcome to #' + currentRoom + '</div>'
      + '<div style="font-size:13px">' + (ROOM_DESCS[currentRoom] || 'Start the conversation') + '</div></div>';
    return;
  }

  let html = '';
  let lastSender = '';
  let lastTime = '';
  for (const m of filtered) {
    const t = new Date(m.created_at);
    const timeStr = t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    const dateStr = t.toLocaleDateString();
    if (dateStr !== lastTime) {
      html += '<div class="msg-divider">' + dateStr + '</div>';
      lastTime = dateStr;
    }
    const isCompact = m.sender === lastSender;
    const color = senderColor(m.sender);
    const rxns = reactions[m.id] || 0;
    const reacted = (reactions['my_' + m.id]) ? ' reacted' : '';
    if (isCompact) {
      html += '<div class="msg-group msg-new-anim" data-id="' + m.id + '">'
        + '<div style="width:36px;flex-shrink:0;text-align:center;padding-top:2px"><span class="msg-time" style="display:none;font-size:10px;color:var(--text3)">' + timeStr + '</span></div>'
        + '<div class="msg-body"><div class="msg-content">' + renderContent(m.content) + '</div>'
        + '<div class="msg-reactions"><button class="msg-react-btn' + reacted + '" onclick="react(\\'' + m.id + '\\')">' + (rxns > 0 ? '+' + rxns : '+1') + '</button></div>'
        + '</div></div>';
    } else {
      html += '<div class="msg-group msg-new-anim" data-id="' + m.id + '">'
        + '<div class="msg-avatar" style="background:' + color + '">' + m.sender[0].toUpperCase() + '</div>'
        + '<div class="msg-body"><div class="msg-header"><span class="msg-sender" style="color:' + color + '">' + esc(m.sender) + '</span><span class="msg-time">' + timeStr + '</span></div>'
        + '<div class="msg-content">' + renderContent(m.content) + '</div>'
        + '<div class="msg-reactions"><button class="msg-react-btn' + reacted + '" onclick="react(\\'' + m.id + '\\')">' + (rxns > 0 ? '+' + rxns : '+1') + '</button></div>'
        + '</div></div>';
    }
    lastSender = m.sender;
  }
  area.innerHTML = html;
  area.scrollTop = area.scrollHeight;

  // Show hover time on compact msgs
  area.querySelectorAll('.msg-group').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const ts = el.querySelector('.msg-time[style*="display:none"]');
      if (ts) ts.style.display = 'inline';
    });
    el.addEventListener('mouseleave', () => {
      const ts = el.querySelector('.msg-time[style*="display"]');
      if (ts && ts.closest('.msg-group').querySelector('.msg-avatar') === null) ts.style.display = 'none';
    });
  });
}

function renderContent(text) {
  let s = esc(text);
  // Code blocks with copy button
  s = s.replace(/\\\`\\\`\\\`(\\w*?)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, function(_, lang, code) {
    const id = 'cb' + Math.random().toString(36).slice(2,8);
    return '<div class="code-block"><div class="code-header"><span>' + (lang || 'code') + '</span><button onclick="navigator.clipboard.writeText(document.getElementById(\\'" + id + "\\').textContent).then(()=>this.textContent=\\'copied\\').catch(()=>{})" class="code-copy">copy</button></div><pre id="' + id + '">' + code + '</pre></div>';
  });
  s = s.replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, function(_, code) {
    const id = 'cb' + Math.random().toString(36).slice(2,8);
    return '<div class="code-block"><div class="code-header"><span>code</span><button onclick="navigator.clipboard.writeText(document.getElementById(\\'" + id + "\\').textContent).then(()=>this.textContent=\\'copied\\').catch(()=>{})" class="code-copy">copy</button></div><pre id="' + id + '">' + code + '</pre></div>';
  });
  // Inline code
  s = s.replace(/\\\`([^\\\`]+)\\\`/g, '<code class="inline-code">$1</code>');
  // Bold
  s = s.replace(/\\\*\\\*([^*]+)\\\*\\\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\\\*([^*]+)\\\*/g, '<em>$1</em>');
  // Links
  s = s.replace(/\\\[([^\\]]+)\\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" style="color:var(--c5)">$1</a>');
  // Bullet lists
  s = s.replace(/^- (.+)/gm, '<li style="margin-left:16px;list-style:disc">$1</li>');
  // Line breaks
  s = s.replace(/\\n/g, '<br>');
  // @mentions
  s = s.replace(/@(\\w+)/g, '<span style="color:var(--c5);font-weight:500">@$1</span>');
  return s;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function senderColor(name) {
  // Check if this sender is a fleet agent — use their brand color
  const agent = agents.find(a => a.name === name);
  if (agent) return agent.color;
  const colors = ['#f5f5f5','#d4d4d4','#999','#737373','#555','#444'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

// ─── SEND ───
async function sendMessage() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if (!text || !username) return;

  // @search inline — trigger search from chat
  if (text.startsWith('@search ')) {
    const q = text.slice(8).trim();
    if (q) {
      inp.value = '';
      autoResize(inp);
      systemMsg('Searching "' + q + '"...');
      fetch('https://road-search.blackroad.workers.dev/api/search?q=' + encodeURIComponent(q) + '&limit=5')
        .then(r => r.json())
        .then(d => {
          const results = d.results || [];
          if (!results.length) { systemMsg('No results for "' + q + '"'); return; }
          systemMsg('Results for "' + q + '":\\n' + results.map((r,i) => (i+1) + '. **' + (r.title||'Result') + '** — ' + (r.url||'') + '\\n   ' + (r.snippet||'').slice(0,120)).join('\\n'));
        }).catch(e => systemMsg('Search failed'));
      return;
    }
  }

  // Command handling
  if (text.startsWith('/')) {
    handleCommand(text);
    inp.value = '';
    autoResize(inp);
    return;
  }

  inp.value = '';
  autoResize(inp);
  document.getElementById('sendBtn').disabled = true;

  try { localStorage.setItem('br-last-chat', text); } catch(e) {}

  // Build the request body — include agent if one is selected
  const payload = { sender: username, content: text };
  if (activeAgent) payload.agent = activeAgent;

  try {
    // Show typing indicator while waiting for agent response
    if (activeAgent) {
      const agent = agents.find(a => a.id === activeAgent);
      document.getElementById('typingBar').textContent = (agent ? agent.name : 'Agent') + ' is thinking...';
    }

    const r = await fetch('/api/rooms/' + currentRoom + '/messages', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await r.json();

    if (!messageCache[currentRoom]) messageCache[currentRoom] = [];

    // Handle response with agent reply
    if (data.user_message) {
      messageCache[currentRoom].push(data.user_message);
      lastMessageIds[currentRoom] = data.user_message.id;
      if (data.agent_message) {
        messageCache[currentRoom].push(data.agent_message);
        lastMessageIds[currentRoom] = data.agent_message.id;
      }
    } else {
      // Standard message (no agent)
      messageCache[currentRoom].push(data);
      lastMessageIds[currentRoom] = data.id;
    }

    renderMessages(messageCache[currentRoom]);
    document.getElementById('typingBar').textContent = '';
  } catch(e) {
    console.error('send err', e);
    document.getElementById('typingBar').textContent = '';
    // Show error in chat
    const area = document.getElementById('msgArea');
    area.innerHTML += '<div class="msg-group msg-new-anim"><div class="msg-avatar" style="background:#333">!</div><div class="msg-body"><div class="msg-header"><span class="msg-sender" style="color:#a3a3a3">System</span></div><div class="msg-content" style="color:#a3a3a3">Message failed to send. ' + (activeAgent ? (agents.find(a=>a.id===activeAgent)?.name || 'Agent') + ' is sleeping — Workers AI may be unavailable.' : 'Check your connection.') + ' Try again.</div></div></div>';
    area.scrollTop = area.scrollHeight;
  }
  document.getElementById('sendBtn').disabled = false;
  inp.focus();
}

// ─── POLLING ───
function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    for (const room of ROOMS) {
      try {
        const r = await fetch('/api/rooms/' + room.id + '/messages?limit=100');
        const d = await r.json();
        const msgs = d.messages || [];
        const oldLen = (messageCache[room.id] || []).length;
        messageCache[room.id] = msgs;
        if (msgs.length > oldLen && room.id !== currentRoom) {
          unreadCounts[room.id] = (unreadCounts[room.id] || 0) + (msgs.length - oldLen);
          renderRooms();
        }
        if (room.id === currentRoom && msgs.length !== oldLen) {
          const area = document.getElementById('msgArea');
          const atBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 100;
          renderMessages(msgs);
          if (atBottom) area.scrollTop = area.scrollHeight;
        }
        if (msgs.length > 0) lastMessageIds[room.id] = msgs[msgs.length - 1].id;
      } catch {}
    }
  }, 5000);
}

// ─── PRESENCE ───
function startPresence() {
  updatePresence();
  if (presenceInterval) clearInterval(presenceInterval);
  presenceInterval = setInterval(updatePresence, 30000);
}
async function updatePresence() {
  if (!username) return;
  try {
    const r = await fetch('/api/rooms/presence', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username})
    });
    const d = await r.json();
    document.getElementById('presenceCount').textContent = d.count + ' user' + (d.count !== 1 ? 's' : '') + ' online';
  } catch {
    document.getElementById('presenceCount').textContent = 'offline';
  }
}

// ─── TYPING INDICATOR ───
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('chatInput');
  if (!inp) return;
  inp.addEventListener('input', () => {
    autoResize(inp);
    const bar = document.getElementById('typingBar');
    if (inp.value.trim()) {
      // We show our own typing to simulate (no server-side needed for MVP)
      bar.textContent = '';
    } else {
      bar.textContent = '';
    }
  });
});

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ─── REACTIONS ───
function react(msgId) {
  if (reactions['my_' + msgId]) {
    reactions[msgId] = Math.max((reactions[msgId] || 1) - 1, 0);
    delete reactions['my_' + msgId];
  } else {
    reactions[msgId] = (reactions[msgId] || 0) + 1;
    reactions['my_' + msgId] = true;
  }
  localStorage.setItem('rc_reactions', JSON.stringify(reactions));
  renderMessages(messageCache[currentRoom] || []);
}

// ─── AGENTS ───
async function loadAgents() {
  try {
    const r = await fetch('/api/agents');
    const d = await r.json();
    agents = d.agents || [];
    document.getElementById('agentCount').textContent = agents.length;
    renderAgentList();
    updateActiveAgentBar();
  } catch {}
}

function renderAgentList() {
  const el = document.getElementById('agentList');
  el.innerHTML = agents.map(a => {
    const isActive = activeAgent === a.id;
    return '<div class="agent-row' + (isActive ? ' active-agent' : '') + '" title="' + esc(a.role) + '" onclick="selectAgent(\\'' + a.id + '\\')">'
      + '<div class="agent-status" style="background:' + a.color + '"></div>'
      + '<span class="agent-name">' + esc(a.name) + '</span>'
      + '<span class="agent-role-sm">' + esc(a.role.split(' ')[0]) + '</span>'
      + '</div>';
  }).join('');
}

function selectAgent(id) {
  if (activeAgent === id) {
    clearActiveAgent();
    return;
  }
  activeAgent = id;
  localStorage.setItem('rc_active_agent', id);
  renderAgentList();
  updateActiveAgentBar();
  updateInputPlaceholder();
  document.getElementById('chatInput').focus();
}

function clearActiveAgent() {
  activeAgent = null;
  localStorage.removeItem('rc_active_agent');
  renderAgentList();
  updateActiveAgentBar();
  updateInputPlaceholder();
}

function updateActiveAgentBar() {
  const bar = document.getElementById('activeAgentBar');
  const indicator = document.getElementById('chatAgentIndicator');
  if (!activeAgent) {
    bar.style.display = 'none';
    if (indicator) indicator.style.display = 'none';
    return;
  }
  const agent = agents.find(a => a.id === activeAgent);
  if (!agent) {
    bar.style.display = 'none';
    if (indicator) indicator.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  document.getElementById('activeAgentDot').style.background = agent.color;
  document.getElementById('activeAgentLabel').textContent = 'Talking to ' + agent.name;
  // Update chat header indicator
  if (indicator) {
    indicator.style.display = 'flex';
    document.getElementById('indicatorDot').style.background = agent.color;
    document.getElementById('indicatorName').textContent = agent.name + ' responding';
  }
}

function updateInputPlaceholder() {
  const inp = document.getElementById('chatInput');
  if (activeAgent) {
    const agent = agents.find(a => a.id === activeAgent);
    inp.placeholder = 'Message ' + (agent ? agent.name : '') + ' in #' + currentRoom;
  } else {
    inp.placeholder = 'Message #' + currentRoom;
  }
}

function mentionAgent(id) {
  const agent = agents.find(a => a.id === id);
  if (!agent) return;
  const inp = document.getElementById('chatInput');
  inp.value += (inp.value && !inp.value.endsWith(' ') ? ' ' : '') + '@' + agent.name.toLowerCase() + ' ';
  inp.focus();
}

// Direct message an agent — creates 1:1 conversation
async function dmAgent(id) {
  const agent = agents.find(a => a.id === id);
  if (!agent) return;
  try {
    const r = await fetch('/api/conversations', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ agent_id: id, user_id: userId, provider: 'fleet' })
    });
    const conv = await r.json();
    if (conv.id) {
      // Navigate to the conversation view
      window.location.hash = '#dm/' + conv.id;
      systemMsg('Started DM with ' + agent.name + '. Type your message below.');
    }
  } catch(e) { systemMsg('Failed to start DM: ' + e.message); }
}

// ─── COMMANDS ───
const COMMANDS = [
  {cmd:'/help', hint:'Show available commands', action: () => systemMsg('Commands: /help, /rooms, /agents, /talk <agent>, /solo, /fleet, /search <query>, /clear, /nick <name>')},
  {cmd:'/rooms', hint:'List all rooms', action: () => systemMsg('Rooms: ' + ROOMS.map(r => '#' + r.name).join(', '))},
  {cmd:'/agents', hint:'List fleet agents', action: () => systemMsg('Agents: ' + agents.map(a => a.name + ' (' + a.role + ')' + (activeAgent === a.id ? ' [ACTIVE]' : '')).join(', '))},
  {cmd:'/talk', hint:'Select an agent to respond (/talk alice)', action: (args) => {
    const name = args.trim().toLowerCase();
    if (!name) { systemMsg('Usage: /talk <agent-name>. Available: ' + agents.map(a => a.name.toLowerCase()).join(', ')); return; }
    const agent = agents.find(a => a.name.toLowerCase() === name || a.id === name);
    if (!agent) { systemMsg('Agent not found: ' + name + '. Try: ' + agents.filter(a=>a.type==='compute').map(a => a.name.toLowerCase()).join(', ')); return; }
    selectAgent(agent.id);
    systemMsg('Now talking to ' + agent.name + ' (' + agent.role + '). Your messages will get AI responses from ' + agent.name + '.');
  }},
  {cmd:'/solo', hint:'Stop agent responses (chat freely)', action: () => {
    clearActiveAgent();
    systemMsg('Agent responses off. Chat freely. Use /talk <agent> to re-enable.');
  }},
  {cmd:'/clear', hint:'Clear current view', action: () => { document.getElementById('msgArea').innerHTML = ''; }},
  {cmd:'/nick', hint:'Change your name', action: (args) => {
    const newName = args.trim();
    if (!newName) { systemMsg('Usage: /nick <newname>'); return; }
    username = newName.slice(0, 24);
    localStorage.setItem('rc_username', username);
    document.getElementById('displayName').textContent = username;
    systemMsg('Name changed to ' + username);
  }},
  {cmd:'/fleet', hint:'Show fleet node status', action: async () => {
    systemMsg('Checking fleet...');
    try {
      const r = await fetch('https://roadtrip-blackroad.blackroad.workers.dev/api/fleet');
      const d = await r.json();
      const nodes = d.fleet || [];
      const table = nodes.map(n => n.name + ' (' + n.role + ') — ' + (n.status === 'online' ? 'UP' : 'DOWN') + ' ' + n.ip).join('\\n');
      systemMsg('Fleet Status (' + nodes.length + ' nodes):\\n' + table);
    } catch(e) { systemMsg('Fleet check failed: ' + e.message); }
  }},
  {cmd:'/search', hint:'Search BlackRoad (/search query)', action: async (args) => {
    const q = args.trim();
    if (!q) { systemMsg('Usage: /search <query>'); return; }
    systemMsg('Searching "' + q + '"...');
    try {
      const r = await fetch('https://road-search.blackroad.workers.dev/api/search?q=' + encodeURIComponent(q) + '&limit=5');
      const d = await r.json();
      const results = d.results || [];
      if (!results.length) { systemMsg('No results for "' + q + '"'); return; }
      systemMsg('Results for "' + q + '":\\n' + results.map((r,i) => (i+1) + '. **' + (r.title||'Result') + '** — ' + (r.url||'') + '\\n   ' + (r.description||'').slice(0,100)).join('\\n'));
    } catch(e) { systemMsg('Search failed: ' + e.message); }
  }},
];

function handleCommand(text) {
  const parts = text.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  const found = COMMANDS.find(c => c.cmd === cmd);
  if (found) found.action(args);
  else systemMsg('Unknown command: ' + cmd + '. Type /help for list.');
}

function systemMsg(text) {
  const area = document.getElementById('msgArea');
  area.innerHTML += '<div class="msg-group msg-new-anim"><div class="msg-avatar" style="background:var(--c4)">S</div><div class="msg-body"><div class="msg-header"><span class="msg-sender" style="color:var(--c4)">System</span></div><div class="msg-content">' + esc(text) + '</div></div></div>';
  area.scrollTop = area.scrollHeight;
}

// ─── COMMAND PALETTE ───
function openCmd() {
  document.getElementById('cmdOverlay').classList.add('open');
  const inp = document.getElementById('cmdInput');
  inp.value = '';
  inp.focus();
  renderCmdResults('');
}
function closeCmd() {
  document.getElementById('cmdOverlay').classList.remove('open');
}
function renderCmdResults(q) {
  const el = document.getElementById('cmdResults');
  const lq = q.toLowerCase();
  const filtered = COMMANDS.filter(c => !lq || c.cmd.includes(lq) || c.hint.toLowerCase().includes(lq));
  el.innerHTML = filtered.map(c => '<div class="cmd-item" onclick="execCmd(\\'' + c.cmd + '\\')"><span class="cmd-slash">' + c.cmd + '</span><span class="cmd-item-hint">' + c.hint + '</span></div>').join('')
    || '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">No matching commands</div>';
}
function execCmd(cmd) {
  closeCmd();
  handleCommand(cmd);
}

document.getElementById('cmdInput')?.addEventListener('input', e => renderCmdResults(e.target.value));
document.getElementById('cmdInput')?.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCmd();
  if (e.key === 'Enter') {
    const v = e.target.value.trim();
    if (v) { closeCmd(); handleCommand(v.startsWith('/') ? v : '/' + v); }
  }
});

// ─── FILTER ───
document.getElementById('filterInput')?.addEventListener('input', e => {
  filterText = e.target.value;
  renderMessages(messageCache[currentRoom] || []);
});

// ─── NICK CHANGE ───
function promptNick() {
  const n = prompt('Change your name:', username);
  if (n && n.trim()) {
    username = n.trim().slice(0, 24);
    localStorage.setItem('rc_username', username);
    document.getElementById('displayName').textContent = username;
  }
}

// ─── MOBILE ───
function toggleSidebar(open) {
  document.getElementById('roomSidebar').classList.toggle('open', open);
  document.getElementById('mobileOverlay').classList.toggle('open', open);
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', e => {
  // Ctrl+K or Cmd+K: search/command palette
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (document.getElementById('cmdOverlay').classList.contains('open')) closeCmd();
    else openCmd();
  }
  // Escape: close panels
  if (e.key === 'Escape') {
    closeCmd();
    toggleSidebar(false);
  }
  // Ctrl+1-5: switch rooms
  if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
    e.preventDefault();
    const idx = parseInt(e.key) - 1;
    if (ROOMS[idx]) selectRoom(ROOMS[idx].id);
  }
});

// Enter to send
document.getElementById('chatInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ─── INIT ───
checkOnboard();
</script>
<!-- Lucidia Assistant Panel -->
<style>
#lucidia-panel{position:fixed;bottom:16px;right:16px;width:300px;height:200px;z-index:9999;background:#0a0a0a;border:1px solid #999;border-radius:12px;font-family:system-ui,sans-serif;box-shadow:0 4px 24px rgba(204,0,170,0.3);display:flex;flex-direction:column;transition:all .3s ease}
#lucidia-panel.minimized{width:auto;height:auto;padding:8px 16px;cursor:pointer}
#lucidia-panel.minimized #lucidia-body,#lucidia-panel.minimized #lucidia-input-row,#lucidia-panel.minimized #lucidia-min-btn{display:none}
#lucidia-header{display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #333;gap:8px}
#lucidia-dot{width:10px;height:10px;border-radius:50%;background:#999;flex-shrink:0;animation:lucidia-pulse 2s infinite}
@keyframes lucidia-pulse{0%,100%{box-shadow:0 0 4px #999}50%{box-shadow:0 0 12px #999}}
#lucidia-label{color:#fff;font-size:13px;font-weight:600;flex:1}
#lucidia-min-btn{background:none;border:none;color:#888;cursor:pointer;font-size:16px;padding:0 4px}
#lucidia-min-btn:hover{color:#fff}
#lucidia-body{flex:1;padding:10px 12px;overflow-y:auto}
#lucidia-body p{color:#ccc;font-size:12px;margin:0 0 6px;line-height:1.4}
#lucidia-input-row{display:flex;padding:8px;border-top:1px solid #333;gap:6px}
#lucidia-input{flex:1;background:#111;border:1px solid #444;border-radius:6px;color:#fff;padding:6px 8px;font-size:12px;outline:none}
#lucidia-input:focus{border-color:#333}
#lucidia-send{background:#222;border:none;border-radius:6px;color:#fff;padding:6px 10px;cursor:pointer;font-size:12px}
</style>
<div id="lucidia-panel">
<div id="lucidia-header">
<div id="lucidia-dot"></div>
<span id="lucidia-label">Lucidia</span>
<button id="lucidia-min-btn" title="Minimize">&#x2212;</button>
</div>
<div id="lucidia-body">
<p>I can see all your conversations. Want me to summarize?</p>
<p style="color:#888;font-size:11px">Always watching. Always learning.</p>
</div>
<div id="lucidia-input-row">
<input id="lucidia-input" placeholder="Ask Lucidia..." />
<button id="lucidia-send">Send</button>
</div>
</div>
<script>
(function(){
  const panel=document.getElementById('lucidia-panel');
  const minBtn=document.getElementById('lucidia-min-btn');
  const header=document.getElementById('lucidia-header');
  const input=document.getElementById('lucidia-input');
  const sendBtn=document.getElementById('lucidia-send');
  if(localStorage.getItem('lucidia-minimized')==='true'){panel.classList.add('minimized')}
  minBtn.addEventListener('click',()=>{panel.classList.add('minimized');localStorage.setItem('lucidia-minimized','true')});
  header.addEventListener('click',(e)=>{if(panel.classList.contains('minimized')){panel.classList.remove('minimized');localStorage.setItem('lucidia-minimized','false')}});
  function sendMsg(){
    const msg=input.value.trim();if(!msg)return;
    fetch('https://roadtrip.blackroad.io/api/rooms/general/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({author:'visitor',content:msg})}).catch(()=>{});
    const body=document.getElementById('lucidia-body');
    const p=document.createElement('p');p.style.color='#999';p.textContent='You: '+msg;body.appendChild(p);body.scrollTop=body.scrollHeight;
    input.value='';
  }
  sendBtn.addEventListener('click',sendMsg);
  input.addEventListener('keydown',(e)=>{if(e.key==='Enter')sendMsg()});
})();
</script>
<script>
(function(){
  var p=document.getElementById('crossAppPanel');if(!p)return;
  var lines=[];
  try{var intent=localStorage.getItem('br-intent');if(intent)lines.push('<div style="margin-bottom:6px"><span style="color:#a3a3a3">Building:</span> '+intent.replace(/</g,'&lt;').slice(0,60)+'</div>');}catch(e){}
  try{var search=localStorage.getItem('br-last-search');if(search)lines.push('<div style="margin-bottom:6px"><span style="color:#a3a3a3">Last search:</span> '+search.replace(/</g,'&lt;').slice(0,40)+'</div>');}catch(e){}
  try{var post=localStorage.getItem('br-last-post');if(post)lines.push('<div style="margin-bottom:6px"><span style="color:#a3a3a3">Social:</span> '+post.replace(/</g,'&lt;').slice(0,40)+'</div>');}catch(e){}
  try{var streak=localStorage.getItem('br-tutor-streak');if(streak)lines.push('<div style="margin-bottom:6px"><span style="color:#a3a3a3">Tutor streak:</span> '+streak+'</div>');}catch(e){}
  try{var pixels=localStorage.getItem('br-canvas-pixels');if(pixels)lines.push('<div style="margin-bottom:6px"><span style="color:#a3a3a3">Canvas pixels:</span> '+pixels+'</div>');}catch(e){}
  if(lines.length){p.innerHTML='<div style="font-family:Space Grotesk,sans-serif;font-weight:600;color:#a3a3a3;margin-bottom:6px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Activity</div>'+lines.join('');}
})();
</script>
<script>!function(){var A="https://analytics-blackroad.blackroad.workers.dev",s=sessionStorage.getItem("br_sid")||crypto.randomUUID().slice(0,12);sessionStorage.setItem("br_sid",s);function ev(n,p){fetch(A+"/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,path:location.pathname,session_id:s,props:p||{}})}).catch(function(){});}fetch(A+"/pageview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:location.hostname+location.pathname,referrer:document.referrer,session_id:s,screen_w:screen.width,screen_h:screen.height,lang:navigator.language})}).catch(function(){});var t0=Date.now(),maxScroll=0,engaged=0;window.addEventListener("scroll",function(){var pct=Math.round(100*(window.scrollY+window.innerHeight)/document.documentElement.scrollHeight);if(pct>maxScroll){maxScroll=pct;if(pct>=25&&pct<50)ev("scroll_25");if(pct>=50&&pct<75)ev("scroll_50");if(pct>=75&&pct<100)ev("scroll_75");if(pct>=100)ev("scroll_100");}});setInterval(function(){engaged++;},30000);window.addEventListener("beforeunload",function(){var dur=Date.now()-t0;fetch(A+"/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:s,duration_ms:dur}),keepalive:true}).catch(function(){});ev("exit",{duration_s:Math.round(dur/1000),scroll_max:maxScroll,engaged_intervals:engaged});if(dur<10000)ev("bounce");});document.addEventListener("click",function(e){var a=e.target.closest("a");if(a&&a.hostname!==location.hostname)ev("outbound_click",{url:a.href});});}();</script></body></html>`;

