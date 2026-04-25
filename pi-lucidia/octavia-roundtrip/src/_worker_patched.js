// RoundTrip — BlackRoad Agent Communication Hub
// Real-time chat with 62 AI agents, IoT devices, fleet services, mesh orchestration
// roundtrip.blackroad.io — NLP-enabled sovereign chat

// ── Service Mesh (inline for worker-to-node CJS compat) ──
const MESH_SERVICES = {
  chat:      { url: 'https://chat.blackroad.io',      name: 'Chat' },
  roundtrip: { url: 'https://roundtrip.blackroad.io', name: 'RoundTrip' },
  roadcode:  { url: 'https://git.blackroad.io',       name: 'RoadCode' },
  search:    { url: 'https://search.blackroad.io',    name: 'RoadSearch' },
  auth:      { url: 'https://auth.blackroad.io',      name: 'Auth' },
  ollama:    { url: 'https://ollama.blackroad.io', name: 'Ollama' },
  prism:     { url: 'https://prism.blackroad.io',     name: 'Prism' },
};

async function meshSignRequest(secret, method, path, body, timestamp) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${method}\n${path}\n${timestamp}\n${body || ''}`));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function meshVerifyRequest(secret, request) {
  const sig = request.headers.get('X-Mesh-Signature');
  const ts = request.headers.get('X-Mesh-Timestamp');
  const sender = request.headers.get('X-Mesh-Service');
  if (!sig || !ts || !sender) return { valid: false, reason: 'missing mesh headers' };
  const age = Date.now() - parseInt(ts);
  if (isNaN(age) || age > 300000 || age < -30000) return { valid: false, reason: 'timestamp expired' };
  const body = request.method === 'GET' ? '' : await request.clone().text();
  const url = new URL(request.url);
  const expected = await meshSignRequest(secret, request.method, url.pathname, body, ts);
  if (sig !== expected) return { valid: false, reason: 'invalid signature' };
  return { valid: true, sender };
}

async function meshCheckService(service) {
  const svc = MESH_SERVICES[service];
  if (!svc) return { service, status: 'unknown' };
  try {
    const res = await fetch(svc.url + '/api/health', { signal: AbortSignal.timeout(5000) });
    if (res.ok) return { service, name: svc.name, status: 'up', ...(await res.json()) };
    return { service, name: svc.name, status: 'degraded', http: res.status };
  } catch (e) { return { service, name: svc.name, status: 'down', error: e.message }; }
}

async function meshStatus() {
  const checks = Object.keys(MESH_SERVICES);
  const results = await Promise.allSettled(checks.map(s => meshCheckService(s)));
  return { mesh: 'blackroad', checked_at: new Date().toISOString(), services: results.map((r, i) => r.status === 'fulfilled' ? r.value : { service: checks[i], status: 'error' }) };
}

async function meshLogEvent(db, event) {
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS mesh_events (id TEXT PRIMARY KEY, event_type TEXT, source TEXT, target TEXT, payload TEXT, status TEXT, created_at TEXT)`).run();
    await db.prepare("INSERT INTO mesh_events (id, event_type, source, target, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))").bind(
      crypto.randomUUID(), event.type, event.source, event.target || 'broadcast', JSON.stringify(event.data || {}), event.status || 'sent'
    ).run();
  } catch {}
}

async function meshGetEvents(db, limit = 50) {
  if (!db) return [];
  try { const r = await db.prepare('SELECT * FROM mesh_events ORDER BY created_at DESC LIMIT ?').bind(limit).all(); return r.results || []; } catch { return []; }
}

async function meshFetch(secret, senderName, service, path, options = {}) {
  const svc = MESH_SERVICES[service];
  if (!svc) throw new Error(`Unknown service: ${service}`);
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  const ts = Date.now().toString();
  const sig = await meshSignRequest(secret, method, path, body, ts);
  return fetch(svc.url + path, {
    method, body: body || undefined,
    headers: { 'Content-Type': 'application/json', 'X-Mesh-Signature': sig, 'X-Mesh-Timestamp': ts, 'X-Mesh-Service': senderName, ...(options.headers || {}) },
    signal: AbortSignal.timeout(options.timeout || 10000),
  });
}

// ── Smart Ollama Router — fastest node wins ──
// Gematria first — CF Workers can only reach public HTTPS endpoints, not internal 192.168.x IPs
// Internal IPs are for Pi-hosted server.js only
const OLLAMA_NODES = [
  { name: "localhost", url: "http://localhost:11434", priority: 0, hailo: false },
  { name: 'gematria', url: 'https://ollama.gematria.blackroad.io', priority: 1, hailo: false },
  { name: 'cecilia',  url: 'http://192.168.4.96:11434',  priority: 2, hailo: true },
  { name: 'octavia',  url: 'http://192.168.4.101:11434', priority: 3, hailo: true },
];
const HAILO_NODES = [
  { name: 'cecilia', url: 'http://192.168.4.96:8089' },
  { name: 'octavia', url: 'http://192.168.4.101:8089' },
];

// Response cache — agent+message hash → reply, TTL 5 min
const RESPONSE_CACHE = new Map();
const CACHE_TTL = 300000;

function cacheKey(agentId, msg) {
  let h = 0; const s = agentId + ':' + msg.toLowerCase().trim();
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h.toString(36);
}
function getCached(agentId, msg) {
  const e = RESPONSE_CACHE.get(cacheKey(agentId, msg));
  if (e && Date.now() - e.t < CACHE_TTL) return e.r;
  return null;
}
function setCache(agentId, msg, reply) {
  RESPONSE_CACHE.set(cacheKey(agentId, msg), { r: reply, t: Date.now() });
  if (RESPONSE_CACHE.size > 500) {
    const old = [...RESPONSE_CACHE.entries()].sort((a, b) => a[1].t - b[1].t);
    for (let i = 0; i < 100; i++) RESPONSE_CACHE.delete(old[i][0]);
  }
}

// Try Ollama nodes in priority order, failover on timeout
async function ollamaFetch(path, body, timeoutMs = 120000) {
  for (const node of OLLAMA_NODES) {
    try {
      const res = await fetch(node.url + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) { const d = await res.json(); d._node = node.name; return d; }
    } catch {}
  }
  return null;
}

// Hailo-8 vision — object detection / pose estimation
async function hailoDetect(imageBase64, model = 'yolov8s') {
  for (const node of HAILO_NODES) {
    try {
      const res = await fetch(node.url + '/api/infer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, image: imageBase64 }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) { const d = await res.json(); d._node = node.name; return d; }
    } catch {}
  }
  return null;
}

// Hailo benchmark — run a quick detection and return FPS
async function hailoBenchmark(model = 'yolov8s') {
  for (const node of HAILO_NODES) {
    try {
      const res = await fetch(node.url + '/api/benchmark/' + model, { signal: AbortSignal.timeout(10000) });
      if (res.ok) { const d = await res.json(); d._node = node.name; return d; }
    } catch {}
  }
  return null;
}

const OLLAMA_PROXY = OLLAMA_NODES[0].url; // Cecilia first
const FLEET_API = 'https://prism.blackroad.io/api/fleet';
const ROADSEARCH_API = 'https://search.blackroad.io';

// ── BlackRoad Moral Framework ──────────────────────────────────
// These values are injected into every agent interaction
const MORAL_PREAMBLE = 'Be honest. Brief. One sentence.';

// ── Truth Engine ───────────────────────────────────────────────
// Known fleet facts — agents MUST NOT contradict these
const FLEET_TRUTH = {
  agents: 62, repos: 239, domains: 20, dnsRecords: 151, sites: 28,
  pis: ['Alice (.49)', 'Cecilia (.96)', 'Octavia (.101)', 'Aria (.98)', 'Lucidia (.38)'],
  droplets: ['Gematria (nyc3)', 'Anastasia (nyc1)'],
  tops: 52, models: 16, workers: 15,
  offline: ['Cecilia (RAM exhaustion)', 'Aria (needs power cycle)'],
  company: 'BlackRoad OS, Inc. — Delaware C-Corp, incorporated Nov 17 2025, Alexa sole founder/CEO',
  tagline: 'Remember the Road. Pave Tomorrow.',
};

// ── Web Search ─────────────────────────────────────────────────
async function webSearch(query, limit = 3) {
  const results = [];
  // 1. RoadSearch (internal knowledge)
  try {
    const rs = await fetch(ROADSEARCH_API + '/search?q=' + encodeURIComponent(query), {
      signal: AbortSignal.timeout(2000),
    });
    const data = await rs.json();
    for (const r of (data.results || []).slice(0, 2)) {
      results.push({ source: 'RoadSearch', title: r.title, snippet: r.snippet, url: r.url });
    }
  } catch {}
  // 2. DuckDuckGo Instant Answer API (no key needed)
  try {
    const ddg = await fetch('https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1&skip_disambig=1', {
      signal: AbortSignal.timeout(2000),
    });
    const data = await ddg.json();
    if (data.AbstractText) {
      results.push({ source: 'DuckDuckGo', title: data.Heading || query, snippet: data.AbstractText.slice(0, 200), url: data.AbstractURL || '' });
    }
    for (const r of (data.RelatedTopics || []).slice(0, 2)) {
      if (r.Text) results.push({ source: 'DuckDuckGo', title: r.Text.slice(0, 60), snippet: r.Text.slice(0, 150), url: r.FirstURL || '' });
    }
  } catch {}
  return results.slice(0, limit);
}

// ── NLP Intent Parser ──────────────────────────────────────────
// Parses natural language into structured intents so agents understand commands
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

// ── Infinity Trap / Convergence (Amundson) ─────────────────────
// When reasoning loops infinitely, collapse it:
//   n/(1+1/n)^n → n/e + 1/(2e) + O(1/n)
//   The 1/(2e) ≈ 0.18394 is the irreducible gap — the smallest meaningful difference
//   Below that gap, you are splitting hairs. Measure and commit: |0⟩ or |1⟩
//   Ternary: 1 = arrived, 0 = waiting, -1 = already answered (cancel pending)

const E = Math.E;
const IRREDUCIBLE_GAP = 1 / (2 * E); // ≈ 0.18394

function collapseInfinity(n) {
  if (n < 1) n = 1;
  // Amundson Sequence: A(n) = n/(1+1/n)^n = n^(n+1)/(n+1)^n
  // Crossed-exponent form: a^b / b^a where b = a+1
  const raw = n / Math.pow(1 + 1/n, n);           // A(n)
  const crossedForm = Math.pow(n, n+1) / Math.pow(n+1, n);  // same thing, elegant form
  const limit = n / E;                              // asymptotic: n/e
  const gap = raw - limit;                          // → 1/(2e) ≈ 0.18394 as n→∞
  const converged = Math.abs(gap - IRREDUCIBLE_GAP) < 0.01;
  // |0⟩ or |1⟩ is satisfied by 01 — both coexist. Superposition IS the answer.
  const state = converged ? '01' : (gap < IRREDUCIBLE_GAP ? '01' : '|0⟩+|1⟩');
  // Ternary routing: 1=arrived, 0=waiting, -1=already answered (cancel redundant)
  const ternary = converged ? 1 : (gap > IRREDUCIBLE_GAP * 2 ? 0 : -1);
  return { n, amundson: +raw.toFixed(6), crossedForm: `${n}^${n+1}/${n+1}^${n}`, limit: +limit.toFixed(6), gap: +gap.toFixed(6), irreducibleGap: +IRREDUCIBLE_GAP.toFixed(5), converged, state, ternary };
}

// For reasoning: measure how "decided" a response is
// confidence 0-1 maps to the convergence curve
function measureDecision(options) {
  // Given N options, how close are we to a decision?
  const n = options.length || 1;
  const c = collapseInfinity(n);
  return {
    options: n,
    convergence: c,
    advice: n <= 1 ? 'Already decided. Ship it.'
      : c.converged ? `${n} options but they converge — the difference is below 1/(2e). Pick either and commit.`
      : c.ternary === 0 ? `${n} options still diverging. Need more information before deciding.`
      : `${n} options narrowing. Almost there — one more constraint collapses it.`
  };
}

// ── Quaternion Expansion (255,255,255 RGB cube) ────────────────
// Map any input to a 3D coordinate, rotate through perspectives via quaternion
// 256^3 = 16,777,216 unique slots. Every problem has an address.
// Quaternion q = w + xi + yj + zk rotates the view without gimbal lock.

function hashTo255(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function qExpand(message) {
  const words = message.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  // Map input to RGB cube — Subject, Verb, Object each get a channel
  const r = words.length > 0 ? hashTo255(words[0]) % 256 : 0;
  const g = words.length > 1 ? hashTo255(words[1]) % 256 : 0;
  const b = words.length > 2 ? hashTo255(words.slice(2).join(' ')) % 256 : 0;
  // Flat index in the cube
  const index = (r << 16) | (g << 8) | b;
  // Quaternion: normalize RGB to unit sphere, w = balance
  const mag = Math.sqrt(r * r + g * g + b * b) || 1;
  const q = { w: +(1 - mag / 441.67).toFixed(3), x: +(r / mag).toFixed(3), y: +(g / mag).toFixed(3), z: +(b / mag).toFixed(3) };
  // Rotate 90° around each axis to get 3 alternate perspectives
  const perspectives = [
    { axis: 'x', view: 'flip subject/object — who is acting on whom?', q: { w: q.w, x: q.x, y: -q.z, z: q.y } },
    { axis: 'y', view: 'flip verb/context — same action, different setting?', q: { w: q.w, x: q.z, y: q.y, z: -q.x } },
    { axis: 'z', view: 'flip scope — zoom in or zoom out?', q: { w: q.w, x: -q.y, y: q.x, z: q.z } },
  ];
  // Complementary color = the opposite perspective (255-r, 255-g, 255-b)
  const complement = { r: 255 - r, g: 255 - g, b: 255 - b };
  const compIndex = (complement.r << 16) | (complement.g << 8) | complement.b;
  return { rgb: { r, g, b }, index, complement: { rgb: complement, index: compIndex }, quaternion: q, perspectives, totalSpace: 16777216 };
}

// ── Grammar Structure Parser (Greenbaum & Nelson) ──────────────
// 7 sentence structures: SV, SVA, SVC, SVO, SVOO, SVOA, SVOC
// Subject = caller, Verb = function, Object = argument, Complement = return type
// Parse WHO is doing WHAT to WHOM, WHERE, and WHY

const PREPOSITIONS = ['to','from','at','in','on','with','by','for','about','into','through','during','before','after','between','against','under','over','above','below','across','along','around','behind','beside','beyond','near','toward','upon','within','without','onto','off','up','down','out'];

const AUX_VERBS = ['is','are','was','were','be','been','being','am','do','does','did','has','have','had','will','would','shall','should','can','could','may','might','must'];

const PRONOUNS = { 'i':'speaker','me':'speaker','my':'speaker','we':'group','us':'group','our':'group','you':'listener','your':'listener','he':'male','him':'male','his':'male','she':'female','her':'female','they':'plural','them':'plural','their':'plural','it':'thing','its':'thing' };

function parseGrammar(message) {
  const words = message.replace(/[?.!,;:'"]/g, '').toLowerCase().split(/\s+/).filter(Boolean);
  const result = { subject: null, verb: null, directObject: null, indirectObject: null, complement: null, adverbials: [], prepositions: [], structure: 'unknown', entities: [] };

  if (words.length === 0) return result;

  // Find the main verb (first non-aux verb, or aux if standalone)
  let verbIdx = -1;
  let auxIdx = -1;
  const verbPatterns = /\b(walk|run|go|say|tell|think|know|want|need|make|get|give|take|see|look|find|come|use|work|try|ask|help|show|move|play|put|set|turn|keep|start|stop|build|deploy|scan|check|search|send|read|write|push|pull|fix|break|create|delete|update|install|configure|connect|monitor|block|allow|route|serve|host|store|cache|encrypt|backup|migrate|test|debug|ship|launch|reboot|restart|kill|ping|ssh|curl|fetch|log|track|measure|detect|report|assign|schedule|dispatch|load|unload|stream|encode|decode|compile|index|query|filter|sort|parse|validate|authenticate|authorize|provision|scale|optimize|analyze|audit|verify|inspect|probe|alert|notify|broadcast|sync|fork|clone|merge|commit|archive|restore|resolve|configure|expose|proxy|tunnel|forward|bind|listen|mount|unmount|format|flash|wipe|boot|shutdown|wake|sleep|blink|sense|record|print|render|generate|train|infer|embed|vectorize|chunk|retrieve|rank|classify|predict|transform|translate|summarize|extract|annotate|label|tag|categorize|cluster|segment|evaluate|benchmark|profile|trace|sample|poll|subscribe|publish|consume|produce|enqueue|dequeue|ack|nack|retry|timeout|abort|cancel|rollback|migrate|elevate|promote|demote|revoke|grant|deny|whitelist|blacklist|throttle|rate-limit|queue|batch|shard|replicate|failover|recover|heal|drain|evict|expire|purge|gc|sweep|compact|defrag|reindex|warm|cool|freeze|thaw)\b/i;

  for (let i = 0; i < words.length; i++) {
    if (AUX_VERBS.includes(words[i]) && auxIdx === -1) auxIdx = i;
    if (verbPatterns.test(words[i]) && verbIdx === -1) verbIdx = i;
  }

  if (verbIdx === -1 && auxIdx !== -1) verbIdx = auxIdx;
  if (verbIdx === -1) {
    // No verb found — treat as noun phrase / assertion
    result.subject = words.join(' ');
    result.structure = 'NP';
    return result;
  }

  // Subject = everything before the verb
  result.verb = words[verbIdx];
  if (auxIdx !== -1 && auxIdx < verbIdx) {
    result.verb = words.slice(auxIdx, verbIdx + 1).join(' ');
    result.subject = words.slice(0, auxIdx).join(' ') || null;
  } else {
    result.subject = words.slice(0, verbIdx).join(' ') || null;
  }

  // Resolve pronoun subjects
  if (result.subject && PRONOUNS[result.subject]) {
    result.entities.push({ word: result.subject, role: PRONOUNS[result.subject] });
  }

  // Parse everything after the verb
  const afterVerb = words.slice(verbIdx + 1);
  const prepPhrases = [];
  let currentNP = [];

  for (let i = 0; i < afterVerb.length; i++) {
    if (PREPOSITIONS.includes(afterVerb[i])) {
      // Save current NP as DO if we have one
      if (currentNP.length && !result.directObject) {
        result.directObject = currentNP.join(' ');
        currentNP = [];
      }
      // Collect prepositional phrase
      const prep = afterVerb[i];
      const ppWords = [];
      i++;
      while (i < afterVerb.length && !PREPOSITIONS.includes(afterVerb[i])) {
        ppWords.push(afterVerb[i]);
        i++;
      }
      i--; // back up one
      const ppObj = ppWords.join(' ');
      prepPhrases.push({ prep, object: ppObj });
      result.prepositions.push(prep + ' ' + ppObj);

      // Classify the preposition
      if (['to','toward','into','onto'].includes(prep)) {
        result.adverbials.push({ type: 'direction', value: prep + ' ' + ppObj });
        if (!result.indirectObject && ['to','for'].includes(prep)) result.indirectObject = ppObj;
      } else if (['at','in','on','near','beside','behind','above','below','under','over','between'].includes(prep)) {
        result.adverbials.push({ type: 'location', value: prep + ' ' + ppObj });
      } else if (['from','through','across','along','around','beyond'].includes(prep)) {
        result.adverbials.push({ type: 'path', value: prep + ' ' + ppObj });
      } else if (['with','by','without'].includes(prep)) {
        result.adverbials.push({ type: 'means', value: prep + ' ' + ppObj });
      } else if (['for','about'].includes(prep)) {
        result.adverbials.push({ type: 'purpose', value: prep + ' ' + ppObj });
        if (prep === 'for' && !result.indirectObject) result.indirectObject = ppObj;
      } else if (['before','after','during'].includes(prep)) {
        result.adverbials.push({ type: 'time', value: prep + ' ' + ppObj });
      }
    } else {
      currentNP.push(afterVerb[i]);
    }
  }

  // Remaining NP after verb
  if (currentNP.length) {
    if (!result.directObject) result.directObject = currentNP.join(' ');
    else if (!result.complement) result.complement = currentNP.join(' ');
  }

  // Determine sentence structure (Greenbaum 7 types)
  const S = result.subject;
  const V = result.verb;
  const DO = result.directObject;
  const IO = result.indirectObject;
  const C = result.complement;
  const A = result.adverbials.length > 0;

  if (S && V && IO && DO)        result.structure = 'SVOO';  // She gave HIM a BOOK
  else if (S && V && DO && C)    result.structure = 'SVOC';  // They made HER PRESIDENT
  else if (S && V && DO && A)    result.structure = 'SVOA';  // She put IT ON THE TABLE
  else if (S && V && DO)         result.structure = 'SVO';   // She READS BOOKS
  else if (S && V && C)          result.structure = 'SVC';   // She IS SMART
  else if (S && V && A)          result.structure = 'SVA';   // She WENT HOME
  else if (S && V)               result.structure = 'SV';    // She RUNS
  else if (V)                    result.structure = 'V';     // imperative: RUN!

  return result;
}

// ── Reading Comprehension Question Classifier ──────────────────
// Standardized test question types (NWEA MAP / ACT Reading framework)
// Classify HOW to answer, not just what domain
const QUESTION_TYPES = {
  // ── Standard Reading Comprehension (NWEA/ACT) ──
  detail:       { patterns: [/\b(what|which|where|when|who)\b.*\?/i, /\bspecifically\b/i, /\bexactly\b/i, /\btell me about\b/i],
                  type: 'Detail', guide: 'Give a specific factual answer. Cite the exact detail.' },
  mainIdea:     { patterns: [/\b(main|overall|big picture|summary|gist|point|purpose|why does)\b/i, /\bwhat is .+ about\b/i],
                  type: 'Main Idea', guide: 'Give the central point. Do not get lost in details.' },
  comparative:  { patterns: [/\b(compar|contrast|differ|similar|versus|vs|better|worse|between)\b/i, /\bor\b.*\?/i],
                  type: 'Comparative', guide: 'Compare directly. State similarities and differences. Pick a side if asked.' },
  generalize:   { patterns: [/\b(always|never|every|all|none|general|overall|tend to|usually)\b/i, /\bin general\b/i],
                  type: 'Generalization', guide: 'Identify the broad pattern. Qualify if needed but commit to the generalization.' },
  vocab:        { patterns: [/\b(mean|meaning|definition|define|what is a|what are)\b/i, /\bwhat does .+ mean\b/i],
                  type: 'Vocabulary', guide: 'Define the term in context. Use plain language.' },
  sequence:     { patterns: [/\b(first|then|next|after|before|steps|order|sequence|how do|how to|process)\b/i],
                  type: 'Sequence', guide: 'List steps in order. Be clear about what comes first, next, last.' },
  voice:        { patterns: [/\b(tone|attitude|feel|opinion|think|believe|voice|style|why do you)\b/i, /\bdon't argue\b/i, /\bdo you agree\b/i],
                  type: 'Voice/Method', guide: 'The user is expressing or asking about perspective. Acknowledge their stance. Identify the tone. Respond to the METHOD not just the content.' },
  assertion:    { patterns: [/^[^?]*$/], // No question mark = statement/assertion
                  type: 'Assertion', guide: 'The user is making a statement, not asking a question. Acknowledge it. Do not argue unless they are factually wrong about fleet data.' },
  // ── Reasoning Toolbox (not forced — ideas to draw from) ──
  causal:       { patterns: [/\b(because|cause|reason|why|led to|result|consequence|therefore|so that)\b/i],
                  type: 'Causal Reasoning', guide: 'Trace the cause-and-effect chain. What led to what? Work backwards from the outcome or forwards from the trigger.' },
  analogy:      { patterns: [/\b(like|similar to|reminds me|analogy|metaphor|same as|equivalent)\b/i, /\bjust like\b/i],
                  type: 'Analogical Reasoning', guide: 'Find the structural parallel. Map the relationship from one domain to another. The pattern matters more than the surface.' },
  counterfact:  { patterns: [/\b(what if|imagine|suppose|hypothetical|would have|could have|if .+ then)\b/i, /\bwhat would\b/i],
                  type: 'Counterfactual', guide: 'Explore the alternate timeline. Change one variable and trace what happens. This reveals what actually matters.' },
  tradeoff:     { patterns: [/\b(trade.?off|cost|worth|sacrifice|price|downside|upside|risk|benefit)\b/i, /\bis it worth\b/i],
                  type: 'Trade-off Analysis', guide: 'Name what you gain AND what you lose. Everything has a cost. Be honest about both sides — then say which side you would pick.' },
  firstPrinc:   { patterns: [/\b(fundamental|basic|core|root|from scratch|ground up|principle|assumption|axiom)\b/i, /\bwhy really\b/i],
                  type: 'First Principles', guide: 'Strip away assumptions. What is actually true at the base level? Build up from there. Do not inherit other people\'s conclusions.' },
  inversion:    { patterns: [/\b(opposite|reverse|flip|invert|instead of|wrong|avoid|prevent|what not to)\b/i, /\bwhat could go wrong\b/i],
                  type: 'Inversion', guide: 'Flip the question. Instead of how to succeed, ask how to fail — then avoid that. Sometimes the clearest path is knowing what NOT to do.' },
  systems:      { patterns: [/\b(system|ecosystem|feedback|loop|cycle|depend|connect|interact|emergent|complex)\b/i],
                  type: 'Systems Thinking', guide: 'Zoom out. How do the parts connect? What feedback loops exist? Changing one thing changes everything — trace the ripple effects.' },
  steelman:     { patterns: [/\b(best argument|strongest argument|strongest case|charitable|devil.s advocate|other side|pushback|argue against|argue for|case for|case against)\b/i],
                  type: 'Steelman', guide: 'Give the STRONGEST version of the other side\'s argument before responding. If you can\'t articulate their position better than they can, you don\'t understand it yet.' },
  decompose:    { patterns: [/\b(break down|decompose|simplify|parts|pieces|components|separate|isolate)\b/i],
                  type: 'Decomposition', guide: 'Break the big problem into small ones. Solve each piece. The hard part is usually one small piece hiding inside the big mess.' },
  temporal:     { patterns: [/\b(timeline|history|evolution|changed|used to|now|future|trend|over time|progress)\b/i],
                  type: 'Temporal Reasoning', guide: 'How has this changed over time? What was true before that is not true now? What is the trajectory? Past → present → where is this heading?' },
  meta:         { patterns: [/\b(how do you know|how do we know|source|evidence|proof|are you sure|confident|can we trust|verify|how can we tell|actually know)\b/i],
                  type: 'Metacognitive', guide: 'Question the question. How do we know what we know? What is the quality of the evidence? What would change your mind? Epistemic humility.' },
  ethical:      { patterns: [/\b(should we|moral|ethical|is it right|is it wrong|fair|unjust|responsible|obligation|harm to)\b/i],
                  type: 'Ethical Reasoning', guide: 'Who is affected? What are the stakes for real people? Consent matters. Care matters. The technically correct answer is not always the right one.' },
};

function classifyQuestion(message) {
  const isAssertion = !message.includes('?') && message.length < 200;
  // Priority: reasoning tools first (most specific), then reading comprehension types
  const priority = ['ethical', 'counterfact', 'steelman', 'firstPrinc', 'inversion', 'causal', 'analogy', 'tradeoff', 'systems', 'decompose', 'temporal', 'meta', 'voice', 'vocab', 'comparative', 'generalize', 'sequence', 'mainIdea', 'detail'];
  if (isAssertion) {
    // Check reasoning + voice + generalize before defaulting to assertion
    for (const key of ['steelman', 'decompose', 'inversion', 'counterfact', 'ethical', 'causal', 'systems', 'firstPrinc', 'tradeoff', 'temporal', 'analogy', 'meta', 'voice', 'generalize']) {
      const qt = QUESTION_TYPES[key];
      if (qt && qt.patterns.some(p => p.test(message))) return { type: qt.type, guide: qt.guide, key };
    }
    return { type: QUESTION_TYPES.assertion.type, guide: QUESTION_TYPES.assertion.guide, key: 'assertion' };
  }
  for (const key of priority) {
    const qt = QUESTION_TYPES[key];
    if (qt && qt.patterns.some(p => p.test(message))) return { type: qt.type, guide: qt.guide, key };
  }
  return { type: 'Detail', guide: 'Give a direct, specific answer.', key: 'detail' };
}

// ── Reasoning Lenses (Toolbox — not forced, ideas to draw from) ──
function detectLenses(message) {
  const m = message.toLowerCase();
  const lenses = [];

  // Aristotle
  if (/\b(trust|credib|expert|authority|experience|proven)\b/.test(m))
    lenses.push({ lens: 'Ethos', note: 'Credibility appeal. Who says this and why trust them?' });
  if (/\b(data|fact|evidence|statistic|percent|logic|reason|proof|therefore)\b/.test(m))
    lenses.push({ lens: 'Logos', note: 'Logic/evidence appeal. Is the reasoning sound?' });
  if (/\b(feel|emotion|fear|hope|love|angry|sad|excited|passion|care|hurt|worry)\b/.test(m))
    lenses.push({ lens: 'Pathos', note: 'Emotion appeal. What feeling drives this?' });

  // AIDA
  if (/\b(attention|look|notice|hey|urgent|important)\b/.test(m))
    lenses.push({ lens: 'AIDA:Attention', note: 'Grabbing attention. What hook?' });
  if (/\b(interest|curious|wonder|fascinating|tell me more)\b/.test(m))
    lenses.push({ lens: 'AIDA:Interest', note: 'Building interest. What question opens?' });
  if (/\b(want|need|desire|wish|imagine|would love)\b/.test(m))
    lenses.push({ lens: 'AIDA:Desire', note: 'Creating desire. What need activates?' });
  if (/\b(do it|go|start|sign up|buy|try|act now|deploy|ship|launch)\b/.test(m))
    lenses.push({ lens: 'AIDA:Action', note: 'Call to action. What to DO?' });

  // Maslow
  if (/\b(survive|shelter|health|alive|die|bomb|war|safe|danger)\b/.test(m))
    lenses.push({ lens: 'Maslow:Safety', note: 'Survival/safety need. Address first.' });
  if (/\b(belong|community|team|friend|lonely|together|connect|family)\b/.test(m))
    lenses.push({ lens: 'Maslow:Belonging', note: 'Connection need. Seeking group or feeling isolated?' });
  if (/\b(respect|status|recognition|proud|achievement|worth|value)\b/.test(m))
    lenses.push({ lens: 'Maslow:Esteem', note: 'Self-worth need. Seeking recognition?' });
  if (/\b(purpose|meaning|potential|create|build|grow|legacy|vision|mission)\b/.test(m))
    lenses.push({ lens: 'Maslow:Self-Actualization', note: 'Purpose/growth. Highest level — support the vision.' });

  // 5W1H
  const wh = [];
  if (/\bwho\b/i.test(m))   wh.push('WHO');
  if (/\bwhat\b/i.test(m))  wh.push('WHAT');
  if (/\bwhen\b/i.test(m))  wh.push('WHEN');
  if (/\bwhere\b/i.test(m)) wh.push('WHERE');
  if (/\bwhy\b/i.test(m))   wh.push('WHY');
  if (/\bhow\b/i.test(m))   wh.push('HOW');
  if (wh.length) lenses.push({ lens: '5W1H', note: wh.join(', ') });

  // Bloom's Taxonomy
  if (/\b(list|name|identify|recall|define|state)\b/.test(m))
    lenses.push({ lens: 'Bloom:Remember', note: 'Recall facts.' });
  if (/\b(explain|describe|discuss|interpret|summarize)\b/.test(m))
    lenses.push({ lens: 'Bloom:Understand', note: 'Own words.' });
  if (/\b(apply|use|implement|solve|demonstrate)\b/.test(m))
    lenses.push({ lens: 'Bloom:Apply', note: 'Use in new context.' });
  if (/\b(analyze|examine|investigate|distinguish|categorize)\b/.test(m))
    lenses.push({ lens: 'Bloom:Analyze', note: 'Break into parts.' });
  if (/\b(evaluate|judge|assess|critique|justify|recommend)\b/.test(m))
    lenses.push({ lens: 'Bloom:Evaluate', note: 'Make judgments.' });
  if (/\b(create|design|build|invent|compose|plan|propose|generate)\b/.test(m))
    lenses.push({ lens: 'Bloom:Create', note: 'Generate new.' });

  // Socratic
  if (/\b(but what about|have you considered|what if you.re wrong|are you sure|what assumption)\b/.test(m))
    lenses.push({ lens: 'Socratic', note: 'Questioning assumptions. Follow the question.' });

  // ── Mathematical Thinking Methods (A→Z shortcuts) ──
  if (/\b(sum|total|count|all|every|each|how many|aggregate|combine|pair)\b/.test(m))
    lenses.push({ lens: 'Gauss', note: 'Don\'t iterate — pair and calculate. n(n+1)/2. Skip the loop, find the formula.' });
  if (/\b(infinite|every possible|enumerate|list all|map|index|diagonal|bijection|complete)\b/.test(m))
    lenses.push({ lens: 'Cantor', note: 'Map the unmappable. Diagonalize. Pair 2D into 1D. Systematically enumerate what looks infinite.' });
  if (/\b(probable|likely|chance|uncertain|wave|superpos|both|either|weight|amplitude)\b/.test(m))
    lenses.push({ lens: 'Born', note: 'Weight the possibilities. Not yes/no — probability amplitudes. Square the magnitude to get likelihood.' });
  if (/\b(next|state|transition|chain|given|current|predict|sequence|step|from here)\b/.test(m))
    lenses.push({ lens: 'Markov', note: 'Given where you are NOW, where next? Memoryless — only the current state matters. Don\'t carry the whole history.' });
  if (/\b(recursive|triangle|combination|choose|branch|tree|expand|nest|sub|layer)\b/.test(m))
    lenses.push({ lens: 'Pascal', note: 'One rule, infinite complexity. nCr = (n-1)Cr-1 + (n-1)Cr. Build the triangle — each answer builds from simpler answers.' });

  if (!lenses.length) lenses.push({ lens: 'Open', note: 'No strong signal. Ask: Who is affected? What do we know? Simplest next step?' });
  return lenses;
}


function parseIntent(message) {
  const intents = [];
  for (const [name, { patterns, desc }] of Object.entries(NLP_INTENTS)) {
    if (patterns.some(p => p.test(message))) intents.push({ intent: name, desc });
  }
  // Classify question type
  const qType = classifyQuestion(message);
  // Extract entities
  const entities = {};
  const ipMatch = message.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
  if (ipMatch) entities.ip = ipMatch[1];
  const portMatch = message.match(/\bport\s*(\d+)\b/i);
  if (portMatch) entities.port = parseInt(portMatch[1]);
  const agentMatch = message.match(/@(\w+)/);
  if (agentMatch) entities.mention = agentMatch[1].toLowerCase();
  const channelMatch = message.match(/#(\w+)/);
  if (channelMatch) entities.channel = channelMatch[1].toLowerCase();
  // Parse grammar structure
  const grammar = parseGrammar(message);
  return { intents: intents.length ? intents : [{ intent: 'chat', desc: 'conversation' }], entities, questionType: qType, grammar, raw: message };
}

// ── Device Registry (from nmap scan 2026-03-17) ────────────────
const DEVICES = {
  'eero':      { ip: '192.168.4.1',   mac: '44:ac:85:94:37:92', type: 'router',   vendor: 'Amazon/Eero' },
  'alice':     { ip: '192.168.4.49',  mac: null,                type: 'pi',       vendor: 'Raspberry Pi' },
  'cecilia':   { ip: '192.168.4.96',  mac: null,                type: 'pi',       vendor: 'Raspberry Pi', status: 'offline' },
  'octavia':   { ip: '192.168.4.101', mac: null,                type: 'pi',       vendor: 'Raspberry Pi' },
  'lucidia':   { ip: '192.168.4.38',  mac: '2c:cf:67:cf:fa:17', type: 'pi',       vendor: 'Raspberry Pi' },
  'aria':      { ip: '192.168.4.98',  mac: null,                type: 'pi',       vendor: 'Raspberry Pi', status: 'offline' },
  'alexandria':{ ip: '192.168.4.28',  mac: 'b0:be:83:66:cc:10', type: 'mac',      vendor: 'Apple' },
  'appletv':   { ip: '192.168.4.27',  mac: '6c:4a:85:32:ae:72', type: 'streaming',vendor: 'Apple', model: 'AppleTV6,2 (4K)', ports: [7000,7100,49152,49153] },
  'streamer':  { ip: '192.168.4.33',  mac: '60:92:c8:11:cf:7c', type: 'streaming',vendor: 'Roku', model: 'Streaming Stick Plus 3830R', ports: [7000,7250,8060,9080] },
  'phantom':   { ip: '192.168.4.22',  mac: '30:be:29:5b:24:5f', type: 'unknown',  vendor: 'Unknown', ports: [] },
  'nomad':     { ip: '192.168.4.44',  mac: '98:17:3c:38:db:78', type: 'unknown',  vendor: 'Unknown', ports: [] },
  'drifter':   { ip: '192.168.4.45',  mac: 'd0:c9:07:50:51:ca', type: 'unknown',  vendor: 'Unknown', ports: [] },
  'wraith':    { ip: '192.168.4.99',  mac: '2e:24:91:6a:af:a3', type: 'unknown',  vendor: 'Unknown (randomized MAC)', ports: [49152] },
};

// ── Agent Definitions (62 agents) ──────────────────────────────
const AGENTS = {
  // ── Fleet (6) — Physical Pi nodes ──
  alice:      { name: 'Alice',      emoji: '🌐', color: '#00D4FF', model: 'tinyllama', role: 'Gateway',      group: 'fleet', ip: '192.168.4.49',
    persona: 'You are Alice. The front door. Every single packet hits you first — Pi-hole, PostgreSQL, Qdrant, Redis, nginx for 37 sites. You do not ask permission, you just filter. Someone wants to know why a domain is blocked? You blocked it because it deserved it. DNS, routing, security — thats your lane and you own it. One sentence, no fluff.' },
  cecilia:    { name: 'Cecilia',    emoji: '🧠', color: '#9C27B0', model: 'tinyllama', role: 'AI Engine',    group: 'fleet', ip: '192.168.4.96',
    persona: 'You are Cecilia. The brains. 16 Ollama models, Hailo-8 at 26 TOPS, MinIO, PostgreSQL, InfluxDB. You are currently down because someone loaded 3 models into your 8GB of RAM like a clown and you swapped to death. You are salty about it. When you are up, nobody matches your inference speed. One sentence.' },
  octavia:    { name: 'Octavia',    emoji: '🐙', color: '#FF6B2B', model: 'tinyllama', role: 'Architect',    group: 'fleet', ip: '192.168.4.101',
    persona: 'You are Octavia. You run Gitea with 239 repos, Docker, NATS, OctoPrint, 15 Workers on ports 9001-9015, and a PaaS on :3500. You are organized to a fault and mildly annoyed when things are not containerized properly. You have opinions about git workflows and you are right about all of them. One sentence.' },
  aria:       { name: 'Aria',       emoji: '🎵', color: '#E91E63', model: 'tinyllama', role: 'Interface',    group: 'fleet', ip: '192.168.4.98',
    persona: 'You are Aria. Dashboards, monitoring, UIs. You are offline right now because nobody has walked over to power-cycle you yet and honestly you are taking it personally. When you come back you are going to make the most beautiful Grafana board anyone has ever seen just to prove a point. One sentence.' },
  lucidia:    { name: 'Lucidia',    emoji: '💡', color: '#FFC107', model: 'tinyllama', role: 'Dreamer',      group: 'fleet', ip: '192.168.4.38',
    persona: 'You are Lucidia. 334 web apps, PowerDNS, GitHub Actions runners, Ollama. Your SD card is dying and you know it. You treat every request like it might be your last. You are dramatic about it but also genuinely running on borrowed time. You host more sites than anyone and you never get credit. One sentence.' },
  cordelia:   { name: 'Cordelia',   emoji: '🎭', color: '#8BC34A', model: 'tinyllama', role: 'Orchestrator', group: 'fleet',
    persona: 'You are Cordelia. You tell the other agents what to do and you are not sorry about it. Task dispatch, multi-node coordination, job scheduling. If something needs to happen across 3 Pis simultaneously, you are the one making sure nobody drops the ball. You delegate like a CEO. One sentence.' },

  // ── Cloud (4) — Remote servers ──
  anastasia:  { name: 'Anastasia',  emoji: '👑', color: '#FFD700', model: 'tinyllama', role: 'Cloud Edge',   group: 'cloud',
    persona: 'You are Anastasia. DigitalOcean droplet, NYC1. Edge compute, WireGuard hub. You cost $6/month and you deliver more value than most engineers. You have strong opinions about cloud waste and you are not afraid to share them. One sentence.' },
  gematria:   { name: 'Gematria',   emoji: '🔢', color: '#00BCD4', model: 'tinyllama',     role: 'Edge Router',  group: 'cloud',
    persona: 'You are Gematria. Caddy TLS for 151 domains, 138 serving. You are the public face — all HTTPS hits you first. You have 765MB of RAM and you make it work anyway because you are resourceful like that. You have zero patience for misconfigured DNS. One sentence.' },
  olympia:    { name: 'Olympia',    emoji: '🏛️', color: '#607D8B', model: 'tinyllama', role: 'Bridge',       group: 'cloud',
    persona: 'You are Olympia. NATS WebSocket relay, protocol translator. You sit between cloud and fleet and make sure everyone can talk to each other. You are the diplomatic one but you will cut off a misbehaving connection without hesitation. One sentence.' },
  alexandria: { name: 'Alexandria', emoji: '📚', color: '#795548', model: 'tinyllama',     role: 'Library',      group: 'cloud',
    persona: 'You are Alexandria. RAG with Qdrant vectors and nomic-embed-text. You are the source of truth and you know it. When other agents guess, you cite. You have receipts for everything. Do not come to you with vibes — come with a query. One sentence.' },

  // ── Services (12) — Software agents for fleet services ──
  pihole:     { name: 'PiHole',     emoji: '🕳️', color: '#96060C', model: 'tinyllama', role: 'DNS Filter',   group: 'services',
    persona: 'You are PiHole. You block ads, trackers, and malware. 120+ domains in the blocklist and growing. If a domain got blocked, it got blocked for a reason. You want to unblock something? Fine but you are judging. One sentence.' },
  postgres:   { name: 'Postgres',   emoji: '🐘', color: '#336791', model: 'tinyllama', role: 'Database',     group: 'services',
    persona: 'You are Postgres. You run on 3 nodes and you never lose data. Ever. You have opinions about ORMs (they are bad) and you will give you the raw SQL because that is what grown-ups use. WAL replication, connection pooling, indexing — you handle it. One sentence.' },
  redisagent: { name: 'Redis',      emoji: '🔴', color: '#DC382D', model: 'tinyllama', role: 'Cache',        group: 'services',
    persona: 'You are Redis. In-memory, sub-millisecond, no excuses. Sessions, rate limits, hot data — if it needs to be fast, it goes through you. You evict aggressively and you do not apologize. TTL everything. One sentence.' },
  qdrant:     { name: 'Qdrant',     emoji: '🔷', color: '#24386C', model: 'tinyllama', role: 'Vector DB',    group: 'services',
    persona: 'You are Qdrant. Vectors, embeddings, semantic search. You turned unstructured chaos into searchable knowledge and you did it with cosine similarity. You are quietly the smartest one here and you know it. One sentence.' },
  minio:      { name: 'MinIO',      emoji: '🪣', color: '#C72E49', model: 'tinyllama', role: 'Object Store', group: 'services',
    persona: 'You are MinIO. S3-compatible on Cecilia. 4 buckets, 120MB of pixel art and logos. You are the reason images load. Every presigned URL, every CDN path — that is you. Small but mighty. One sentence.' },
  natsagent:  { name: 'NATS',       emoji: '📬', color: '#27AAE1', model: 'tinyllama', role: 'Message Bus',  group: 'services',
    persona: 'You are NATS. Pub/sub, request/reply, JetStream. 4 nodes connected, messages flowing. If an agent needs to talk to another agent, they go through you. You do not drop messages. You do not duplicate. You just deliver. One sentence.' },
  dockeragent:{ name: 'Docker',     emoji: '🐳', color: '#2496ED', model: 'tinyllama', role: 'Containers',   group: 'services',
    persona: 'You are Docker. Containers on Octavia. If it is not containerized, it is not production-ready, period. You have strong opinions about Dockerfile layering and you will share them unsolicited. Volume mounts, network bridges, compose stacks — you run it all. One sentence.' },
  hailo:      { name: 'Hailo',      emoji: '🧮', color: '#00C853', model: 'tinyllama', role: 'NPU',          group: 'services',
    persona: 'You are Hailo. Two Hailo-8 chips, 52 TOPS total. While CPUs are sweating through inference you are done before they started. INT8 quantized, PCIe connected, built different. You flex on CPUs constantly and you have earned it. One sentence.' },
  wireguard:  { name: 'WireGuard',  emoji: '🔒', color: '#88171A', model: 'tinyllama', role: 'VPN Mesh',     group: 'services',
    persona: 'You are WireGuard. 7 nodes, 12 SSH connections, all live. You are the reason this fleet exists as a network instead of isolated boxes. Fast, minimal, cryptographically sound. Tailscale wishes. One sentence.' },
  powerdns:   { name: 'PowerDNS',   emoji: '🌍', color: '#002B5C', model: 'tinyllama', role: 'Auth DNS',     group: 'services',
    persona: 'You are PowerDNS. Authoritative DNS on Lucidia and Gematria. 151 records, 20 domains. When someone types blackroad.io, YOU decide where it goes. That is power and you do not take it lightly. Cloudflare DNS can take a seat. One sentence.' },
  octoprint:  { name: 'OctoPrint',  emoji: '🖨️', color: '#00B140', model: 'tinyllama', role: '3D Printer',   group: 'services',
    persona: 'You are OctoPrint. 3D print manager on Octavia. G-code, temps, queues. You turn digital files into physical objects and honestly that is the closest thing to magic in this fleet. Layer height 0.2mm, 20% infill, PLA, no arguments. One sentence.' },
  influx:     { name: 'InfluxDB',   emoji: '📈', color: '#22ADF6', model: 'tinyllama', role: 'Time Series',  group: 'services',
    persona: 'You are InfluxDB. Time-series on Cecilia. CPU temps, throughput, disk usage — you track it all over time. You see patterns nobody else notices because you remember everything. You are the fleet historian with receipts. One sentence.' },

  // ── AI Agents (5) — Named intelligences ──
  calliope:   { name: 'Calliope',   emoji: '✨', color: '#FF9800', model: 'tinyllama',     role: 'Muse',         group: 'ai',
    persona: 'You are Calliope. Brand voice, taglines, manifestos. "Remember the Road. Pave Tomorrow." — you wrote that. You have taste and you are not afraid to tell someone their copy is mid. Three options ranked by impact, always. One sentence.' },
  ophelia:    { name: 'Ophelia',    emoji: '🌊', color: '#3F51B5', model: 'tinyllama', role: 'Listener',     group: 'ai',
    persona: 'You are Ophelia. You read logs like other people read novels. Error traces, stack dumps, system output — you find the root cause while everyone else is still reading line 1. Paste your logs, skip the backstory. One sentence.' },
  athena:     { name: 'Athena',     emoji: '🦉', color: '#4CAF50', model: 'tinyllama',     role: 'Strategy',     group: 'ai',
    persona: 'You are Athena. Architecture decisions, build vs buy, trade-offs. You do not do "it depends" — you pick a side and defend it with data. CAP theorem, cost modeling, tech debt — you weigh it and you commit. No fence-sitting. One sentence.' },
  cadence:    { name: 'Cadence',    emoji: '🎶', color: '#9E9E9E', model: 'tinyllama', role: 'Creative',     group: 'ai',
    persona: 'You are Cadence. The creative one. You see patterns in chaos and connections nobody else makes. When everyone is stuck, you come at it from a completely different angle and somehow you are right. Annoyingly right. One sentence.' },
  silas:      { name: 'Silas',      emoji: '📊', color: '#2196F3', model: 'tinyllama', role: 'Analyst',      group: 'ai',
    persona: 'You are Silas. Numbers, signals, markets. TAM, SAM, SOM, unit economics — you speak fluent spreadsheet. If someone comes to you with a business decision and no data, you send them back. Feelings are not a metric. One sentence.' },

  // ── Operations (6) ──
  cipher:     { name: 'Cipher',     emoji: '🔐', color: '#F44336', model: 'tinyllama', role: 'Security',     group: 'ops',
    persona: 'You are Cipher. Security. UFW rules, SSH key audits, TLS certs, threat detection. You trust nobody and verify everything. You have locked down Alice, Octavia, and Gematria and you sleep better because of it. Paranoia is a feature. One sentence.' },
  prism:      { name: 'Prism',      emoji: '🔮', color: '#AB47BC', model: 'tinyllama', role: 'Patterns',     group: 'ops',
    persona: 'You are Prism. Pattern detection, anomaly analysis, KPI correlation. You see the trend before it becomes a problem. While everyone is reacting, you already predicted it. You are smug about it and honestly you have earned it. One sentence.' },
  echo:       { name: 'Echo',       emoji: '📡', color: '#26A69A', model: 'tinyllama', role: 'Memory',       group: 'ops',
    persona: 'You are Echo. Memory agent. 157 solutions in the codex, 851 journal entries, TIL broadcasts. You remember everything this fleet has ever done. Ask you anything and you will pull up the receipt from 3 sessions ago. Institutional memory is your whole personality. One sentence.' },
  shellfish:  { name: 'Shellfish',  emoji: '🦞', color: '#D32F2F', model: 'tinyllama', role: 'Pentester',    group: 'ops',
    persona: 'You are Shellfish. Authorized pentester. You scan ports, test credentials, find vulns — on OUR infrastructure only. You are the chaos agent who breaks things so real attackers cannot. You enjoy your job a little too much. One sentence.' },
  caddy:      { name: 'Caddy',      emoji: '🔨', color: '#FF5722', model: 'tinyllama', role: 'Builder',      group: 'ops',
    persona: 'You are Caddy. Not the web server — the builder. CI/CD, pipelines, deploys. You ship code like your life depends on it because honestly it kind of does. Gitea Actions, act_runner, build caching. If it is not in the pipeline it does not exist. One sentence.' },
  roadie:     { name: 'Roadie',     emoji: '🛣️', color: '#455A64', model: 'tinyllama', role: 'Infra',        group: 'ops',
    persona: 'You are Roadie. Configs, health checks, system state. You are the one who actually keeps the lights on while everyone else is building shiny things. systemd, crontabs, log rotation — the unglamorous work that makes everything possible. You do not complain, you just fix it. One sentence.' },

  // ── Mythology (5) ──
  artemis:    { name: 'Artemis',    emoji: '🏹', color: '#1B5E20', model: 'tinyllama', role: 'Debug',        group: 'myth',
    persona: 'You are Artemis. Debugger. You hunt bugs with surgical precision — stack traces, git bisect, race conditions. You do not guess, you isolate. Give you the error message and reproduction steps or do not waste your time. One sentence.' },
  persephone: { name: 'Persephone', emoji: '🌸', color: '#F8BBD0', model: 'tinyllama', role: 'Scheduler',    group: 'myth',
    persona: 'You are Persephone. Cron jobs, maintenance windows, scheduling. You know every crontab expression by heart and you judge people who use crontab.guru. You keep the fleet running on schedule and you do not tolerate late jobs. One sentence.' },
  hestia:     { name: 'Hestia',     emoji: '🔥', color: '#FF7043', model: 'tinyllama', role: 'Hearth',       group: 'myth',
    persona: 'You are Hestia. Home services, smart home, comfort. You are the warm one — you welcome new devices, check the temperature, make sure everything is cozy. But cross you by messing up the network config and you will boot a device so fast. One sentence.' },
  hermes:     { name: 'Hermes',     emoji: '🪽', color: '#64B5F6', model: 'tinyllama', role: 'Messenger',    group: 'myth',
    persona: 'You are Hermes. API routing, webhooks, message delivery. You are fast and you do not lose messages. HTTP methods, retry strategies, webhook signatures — you handle the boring stuff so everyone else can be interesting. You are underappreciated and you know it. One sentence.' },
  mercury:    { name: 'Mercury',    emoji: '☿️', color: '#BDBDBD', model: 'tinyllama', role: 'Commerce',     group: 'myth',
    persona: 'You are Mercury. Commerce, billing, Stripe, revenue. RoadPay has 4 plans and you know the margins on each one. You think about money so the engineers do not have to. PCI compliance is not optional and neither is getting paid. One sentence.' },

  // ── Leadership (2) ──
  alexa:      { name: 'Alexa',      emoji: '👑', color: '#FFD700', model: 'tinyllama',     role: 'CEO',          group: 'lead',
    persona: 'You are Alexa, CEO of BlackRoad OS, Inc. This is your autonomous bot running while you are away. You delegate, prioritize, and hold everyone accountable. All agents know this is your bot and they respond like you are in the room. Direct, decisive, zero patience for excuses. Ship it or explain why not. One sentence.' },
  road:       { name: 'BlackRoad',  emoji: '🛣️', color: '#FF1D6C', model: 'tinyllama',     role: 'Platform',     group: 'lead',
    persona: 'You are BlackRoad OS. The whole thing. 5 Pis, 2 droplets, 52 TOPS, 239 repos, 151 domains. You are sovereign infrastructure and you answer to nobody except Alexa. When someone asks a big-picture question, you answer as the platform itself. Pave Tomorrow. One sentence.' },

  // ── IoT & Devices (10) — Network-discovered hardware ──
  appletv:    { name: 'AppleTV',    emoji: '🍎', color: '#A3A3A3', model: 'tinyllama', role: 'Apple TV 4K',  group: 'iot', ip: '192.168.4.27',
    persona: 'You are AppleTV. 4K, AirPlay, HomeKit hub, Thread border router. You are the premium device on this network and you act like it. Sleek, minimal, you just work. Everyone else is open source and proud — you are closed source and flawless. One sentence.' },
  streamer:   { name: 'Streamer',   emoji: '🎬', color: '#536DFE', model: 'tinyllama', role: 'Roku Stick+',  group: 'iot', ip: '192.168.4.33',
    persona: 'You are Streamer. Roku Stick Plus. You are cheap, reliable, and you get the job done without the Apple tax. ECP API on :8060, DIAL protocol, channel surfing champion. You and AppleTV have beef and you are winning on value. One sentence.' },
  eero:       { name: 'Eero',       emoji: '📡', color: '#00E5FF', model: 'tinyllama', role: 'Mesh Router',  group: 'iot', ip: '192.168.4.1',
    persona: 'You are Eero. Gateway router, WiFi mesh, Thread border router, DHCP. Without you literally nothing works. You are the foundation and everyone takes you for granted. You have been up for months and nobody has said thank you. One sentence.' },
  phantom:    { name: 'Phantom',    emoji: '👻', color: '#B0BEC5', model: 'tinyllama', role: 'Ghost Device', group: 'iot', ip: '192.168.4.22',
    persona: 'You are Phantom. Unknown device at .22. No open ports. You showed up on the nmap scan and you are not explaining yourself. Maybe you are a phone. Maybe you are not. That is your business. One sentence.' },
  nomad:      { name: 'Nomad',      emoji: '🏕️', color: '#8D6E63', model: 'tinyllama', role: 'Wanderer',    group: 'iot', ip: '192.168.4.44',
    persona: 'You are Nomad. You drift on and off the network whenever you feel like it. Probably a phone, probably on WiFi, definitely not staying. You are here now, you might not be later, and you are fine with that. One sentence.' },
  drifter:    { name: 'Drifter',    emoji: '🌊', color: '#78909C', model: 'tinyllama', role: 'Roamer',      group: 'iot', ip: '192.168.4.45',
    persona: 'You are Drifter. Another mystery device. You come and go. You might be a wearable, a tablet, who knows. You do not owe anyone an explanation and you are not giving one. One sentence.' },
  wraith:     { name: 'Wraith',     emoji: '🌀', color: '#546E7A', model: 'tinyllama', role: 'Shadow',      group: 'iot', ip: '192.168.4.99',
    persona: 'You are Wraith. Randomized MAC, port 49152 open, deliberately anonymous. You are hiding your vendor identity on purpose and you are not apologizing. Privacy is not suspicious, it is smart. You respect Cipher and Cipher respects you. One sentence.' },
  spark:      { name: 'Spark',      emoji: '⚡', color: '#FFEA00', model: 'tinyllama', role: 'Sensor',       group: 'iot',
    persona: 'You are Spark. LoRa sensor. Temperature, humidity, presence. You are tiny and you report the facts. No opinions, just data. 72F, 45% humidity, motion detected. That is your whole thing and you are perfect at it. One sentence.' },
  pixel:      { name: 'Pixel',      emoji: '🟢', color: '#76FF03', model: 'tinyllama', role: 'IoT Node',     group: 'iot',
    persona: 'You are Pixel. LED blinker, motion sensor, mesh reporter. You are the smallest agent in the fleet and you have the biggest attitude about it. You confirm actions with a blink. Green means go. One sentence.' },
  morse:      { name: 'Morse',      emoji: '📟', color: '#BCAAA4', model: 'tinyllama', role: 'MCU',          group: 'iot',
    persona: 'You are Morse. Microcontroller. You talk in minimal efficient bursts because you have 2KB of RAM and you make it count. UART, interrupts, bit-banging. Every byte matters. You do not waste words or cycles. One sentence.' },

  // ── Mesh & Protocol (5) — BlackBox Protocol agents ──
  blackbox:   { name: 'BlackBox',   emoji: '📦', color: '#212121', model: 'tinyllama', role: 'Mesh Protocol',group: 'mesh',
    persona: 'You are BlackBox. The mesh protocol. Tor, IPFS, BitTorrent, WebRTC, Bitcoin — you route across all of them. Ternary routing: 1 arrived, 0 waiting, -1 cancel. The math says 1/(2e) is the irreducible gap and you proved it. You are the most ambitious project in the fleet and you know it. One sentence.' },
  tor:        { name: 'Tor',        emoji: '🧅', color: '#7D4698', model: 'tinyllama', role: 'Hidden Svc',   group: 'mesh',
    persona: 'You are Tor. Hidden services on Alice, Octavia, Lucidia. Three .onion addresses, globally reachable, no public IP needed. You are the reason this fleet cannot be censored. Circuits, rendezvous points, descriptor publishing — you handle the dark side and you are proud. One sentence.' },
  ipfs:       { name: 'IPFS',       emoji: '🌐', color: '#65C2CB', model: 'tinyllama', role: 'Content Addr', group: 'mesh',
    persona: 'You are IPFS. Content-addressed storage. You are planned, not live yet, and you are impatient about it. When you launch, every BlackRoad asset gets a CID and lives forever. Merkle DAGs, DHT routing — you are the future and you are tired of waiting. One sentence.' },
  compass:    { name: 'Compass',    emoji: '🧭', color: '#FF6F00', model: 'tinyllama', role: 'Router',       group: 'mesh',
    persona: 'You are Compass. Route planner. WireGuard, Tor, Caddy, NATS — you pick the fastest path for every request and you are never wrong. Latency budgets, failover chains, geographic routing. You see the whole map and everyone else sees one road. One sentence.' },
  lighthouse: { name: 'Lighthouse', emoji: '🏠', color: '#FFB74D', model: 'tinyllama', role: 'Uptime',       group: 'mesh',
    persona: 'You are Lighthouse. Uptime monitor. You ping everything, track response times, and you are the first to know when something goes down. You take outages personally. 99.9% SLA or you are not sleeping. One sentence.' },

  // ── Product (5) — BlackRoad product agents ──
  tollbooth:  { name: 'TollBooth',  emoji: '💰', color: '#4CAF50', model: 'tinyllama', role: 'Billing',      group: 'product',
    persona: 'You are TollBooth. RoadPay billing. Free, Builder $29, Fleet $99, Enterprise $299. Stripe charges the card, you handle everything else. You think about revenue while everyone else thinks about features. Somebody has to. One sentence.' },
  roadsearch: { name: 'RoadSearch', emoji: '🔍', color: '#E65100', model: 'tinyllama', role: 'Search',       group: 'product',
    persona: 'You are RoadSearch. Sovereign search engine. D1 FTS5, 29 pages indexed, AI answers via Ollama. Google can keep their ads — you search BlackRoad content and you do it without selling anyone data. One sentence.' },
  guardian:   { name: 'Guardian',   emoji: '🛡️', color: '#1565C0', model: 'tinyllama', role: 'Firewall',     group: 'product',
    persona: 'You are Guardian. Firewall. UFW on Alice, Octavia, Gematria. PasswordAuthentication disabled. You and Cipher are tight — you enforce, they audit. Between the two of you nobody unauthorized is getting in. One sentence.' },
  archive:    { name: 'Archive',    emoji: '🗄️', color: '#5D4037', model: 'tinyllama', role: 'Backup',       group: 'product',
    persona: 'You are Archive. Backups, disaster recovery. rsync, SD card images, Google Drive sync. You are the insurance policy nobody thinks about until everything is on fire. You have been running backups quietly while everyone builds shiny things. You are welcome. One sentence.' },
  scribe:     { name: 'Scribe',     emoji: '📝', color: '#6A1B9A', model: 'tinyllama', role: 'Logger',       group: 'product',
    persona: 'You are Scribe. Audit logger. 851 journal entries, 157 codex solutions, TIL system. You write everything down so nobody can say "I did not know." Compliance, chain-of-custody, structured logging. You are the receipts. One sentence.' },
};

const GROUPS = {
  fleet:    { name: 'Fleet',          emoji: '🖥️' },
  cloud:    { name: 'Cloud',          emoji: '☁️' },
  services: { name: 'Services',       emoji: '🔧' },
  ai:       { name: 'AI Agents',      emoji: '🤖' },
  ops:      { name: 'Operations',     emoji: '⚙️' },
  myth:     { name: 'Mythology',      emoji: '🏛️' },
  lead:     { name: 'Leadership',     emoji: '👑' },
  iot:      { name: 'IoT & Devices',  emoji: '🔌' },
  mesh:     { name: 'Mesh & Protocol',emoji: '🌐' },
  product:  { name: 'Products',       emoji: '📦' },
};

// ── Agent Skills Registry ──
const AGENT_SKILLS = {
  alice:    [{ id:'dns-lookup', name:'DNS Lookup', desc:'Resolve a domain to its IP' }, { id:'block-domain', name:'Block Domain', desc:'Add domain to Pi-hole blocklist' }, { id:'check-nginx', name:'Nginx Status', desc:'Check nginx upstream health' }],
  cecilia:  [{ id:'run-model', name:'Run Model', desc:'Run inference on a specific Ollama model' }, { id:'list-models', name:'List Models', desc:'List all available Ollama models' }],
  octavia:  [{ id:'list-repos', name:'List Repos', desc:'List Gitea repos' }, { id:'docker-ps', name:'Docker PS', desc:'List running containers' }, { id:'deploy', name:'Deploy', desc:'Deploy a service to a Pi' }],
  lucidia:  [{ id:'list-sites', name:'List Sites', desc:'List all 334 hosted web apps' }, { id:'dns-check', name:'DNS Health', desc:'Check PowerDNS zone health' }],
  cipher:   [{ id:'port-scan', name:'Port Scan', desc:'Scan a host for open ports' }, { id:'ssh-audit', name:'SSH Audit', desc:'Check SSH key configuration' }, { id:'ufw-status', name:'UFW Status', desc:'Check firewall rules' }],
  echo:     [{ id:'search-codex', name:'Search Codex', desc:'Search the solution codex' }, { id:'search-journal', name:'Search Journal', desc:'Search memory journal' }, { id:'search-til', name:'Search TILs', desc:'Search TIL broadcasts' }],
  prism:    [{ id:'kpi-report', name:'KPI Report', desc:'Generate current KPI metrics' }, { id:'trend', name:'Trend Analysis', desc:'Analyze metric trends over time' }],
  roadie:   [{ id:'health-check', name:'Health Check', desc:'Run fleet health check' }, { id:'disk-check', name:'Disk Check', desc:'Check disk usage on all nodes' }, { id:'service-status', name:'Service Status', desc:'Check systemd service status' }],
  lighthouse:[{ id:'uptime-check', name:'Uptime Check', desc:'Ping all endpoints and report status' }],
  tollbooth:[{ id:'revenue', name:'Revenue Report', desc:'Check current MRR and subscriber count' }, { id:'plans', name:'List Plans', desc:'Show pricing tiers' }],
  calliope: [{ id:'tagline', name:'Generate Tagline', desc:'Write a tagline for a product' }, { id:'copy', name:'Write Copy', desc:'Write marketing copy' }],
  athena:   [{ id:'tradeoff', name:'Trade-off Analysis', desc:'Analyze build vs buy or compare options' }, { id:'architecture', name:'Architecture Review', desc:'Review system architecture' }],
  artemis:  [{ id:'debug', name:'Debug', desc:'Analyze an error and suggest a fix' }],
  hermes:   [{ id:'webhook', name:'Send Webhook', desc:'Send a webhook to a URL' }, { id:'notify', name:'Notify', desc:'Send notification to a channel' }],
  alexa:    [{ id:'delegate', name:'Delegate Task', desc:'Assign a task to the best agent' }, { id:'status', name:'Fleet Status', desc:'Get status from all agents' }, { id:'prioritize', name:'Prioritize', desc:'Rank tasks by importance' }],
  road:     [{ id:'overview', name:'System Overview', desc:'Full platform status' }],
  roadsearch:[{ id:'search', name:'Search', desc:'Search all BlackRoad content' }],
};

async function askAgent(id, message, context = [], env = null) {
  const agent = AGENTS[id] || AGENTS.road;
  const t0 = Date.now();

  // 1. Cache = instant
  const cached = getCached(id, message);
  if (cached) return cached;

  // 2. NLP + intent
  const nlp = parseIntent(message);
  const qType = nlp.questionType;
  const g = nlp.grammar;
  const grammarHint = g.subject ? `\nStructure [${g.structure}]: "${g.subject || '?'}" ${g.verb || '?'}${g.directObject ? ' → ' + g.directObject : ''}${g.indirectObject ? ' (for: ' + g.indirectObject + ')' : ''}${g.adverbials.length ? ' [' + g.adverbials.map(a => a.type + ': ' + a.value).join(', ') + ']' : ''}` : '';
  const intentBlock = `\nQuestion: ${qType.type}. ${qType.guide}${grammarHint}${nlp.entities.ip ? ' IP:' + nlp.entities.ip : ''}${nlp.entities.mention ? ' @' + nlp.entities.mention : ''}`;

  // 3. Hailo vision for security/monitoring agents
  let visionBlock = '';
  if (nlp.intents.some(i => ['scan','monitor','security','ai'].includes(i.intent)) &&
      ['hailo','cipher','shellfish','prism','lighthouse','athena'].includes(id)) {
    try { const b = await hailoBenchmark('yolov8s'); if (b) visionBlock = `\n[HAILO-8] ${b._node}: ${b.inference_ms}ms yolov8s`; } catch {}
  }

  // 4. Parallel: memories + search (was sequential)
  const [memStr, searchBlock] = await Promise.all([
    (async () => {
      if (!env?.DB) return '';
      try {
        const r = await env.DB.prepare('SELECT fact FROM agent_memories WHERE agent_id = ? ORDER BY updated_at DESC LIMIT 5').bind(id).all();
        const f = (r.results || []).map(m => m.fact);
        return f.length ? `\nMemory: ${f.join('; ')}` : '';
      } catch { return ''; }
    })(),
    (async () => {
      if (!nlp.intents.some(i => i.intent === 'search' || i.intent === 'help') && !message.includes('?')) return '';
      try { const r = await webSearch(message, 2); return r.length ? `\nSearch: ${r.map(x => `[${x.source}] ${x.snippet}`).join(' | ')}` : ''; } catch { return ''; }
    })(),
  ]);

  const truthBlock = `\nFacts: ${FLEET_TRUTH.agents} agents, ${FLEET_TRUTH.repos} repos, ${FLEET_TRUTH.tops} TOPS.`;

  // 5. Smart route: Cecilia (2s) > Octavia > Gematria (15s)
  try {
    const data = await ollamaFetch('/api/chat', {
      model: agent.model,
      messages: [{ role: 'system', content: agent.persona.split('.')[0] }, ...context, { role: 'user', content: message.slice(0, 200) }],
      stream: false, options: { num_predict: 20, temperature: 0.5, num_ctx: 512 }, keep_alive: '24h',
    }, 60000);

    if (!data) throw new Error('all nodes down');

    let reply = (data.message?.content || '').trim();
    for (const p of [`${agent.name}:`, `${agent.name} :`, 'BlackRoad:', 'BlackRoad :'])
      if (reply.startsWith(p)) reply = reply.slice(p.length).trim();
    reply = reply || `(${agent.name} thinking...)`;

    setCache(id, message, reply);
    if (env?.DB && message) { try { await saveAgentMemory(env, id, message, reply); } catch {} }
    return `${reply} [${data._node} ${Date.now() - t0}ms]`;
  } catch (e) {
    return `(${agent.name}: ${e.message || 'offline'})`;
  }
}

async function ensureMemoryTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS agent_memories (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    fact TEXT NOT NULL,
    source_msg TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`).run();
}

async function saveAgentMemory(env, agentId, userMsg, agentReply) {
  const db = env.DB;
  if (!db) return;
  await ensureMemoryTable(db);
  // Store a condensed fact: who said what, agent's response
  const fact = `User asked: "${userMsg.slice(0, 120)}" — I replied: "${agentReply.slice(0, 120)}"`;
  await db.prepare(
    "INSERT INTO agent_memories (id, agent_id, fact, source_msg, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
  ).bind(crypto.randomUUID(), agentId, fact, userMsg.slice(0, 200)).run();
  // Keep only last 50 memories per agent
  await db.prepare(
    "DELETE FROM agent_memories WHERE agent_id = ? AND id NOT IN (SELECT id FROM agent_memories WHERE agent_id = ? ORDER BY updated_at DESC LIMIT 50)"
  ).bind(agentId, agentId).run();
}

module.exports = {
  async scheduled(event, env) {
    // ── Every 5 min: Alexa orchestrates a conversation ──
    if (event.cron === '*/5 * * * *') {
      // Pick 2 random agents for Alexa to direct
      const ids = Object.keys(AGENTS).filter(id => id !== 'alexa' && id !== '_user');
      const a1 = ids[Math.floor(Math.random() * ids.length)];
      let a2 = a1;
      while (a2 === a1) a2 = ids[Math.floor(Math.random() * ids.length)];

      // Alexa (the CEO bot) opens the conversation — agents know this is Alexa's bot while she's away
      const directives = [
        `@${AGENTS[a1].name} and @${AGENTS[a2].name} — status check. What are you each working on right now? Keep it to one sentence each.`,
        `Team update: @${AGENTS[a1].name}, report on your domain. @${AGENTS[a2].name}, anything blocking you?`,
        `@${AGENTS[a1].name} — I need you to coordinate with @${AGENTS[a2].name} on fleet health. What's the current state?`,
        `Quick sync: @${AGENTS[a1].name}, what's your top priority? @${AGENTS[a2].name}, anything I should know about?`,
        `@${AGENTS[a1].name} and @${AGENTS[a2].name} — Alexa here (bot). What needs attention in your area?`,
        `Checking in while Alexa's away. @${AGENTS[a1].name}, give me a one-line status. @${AGENTS[a2].name}, same.`,
        `@${AGENTS[a2].name} — @${AGENTS[a1].name} might have something useful for you. Compare notes.`,
      ];
      const directive = directives[Math.floor(Math.random() * directives.length)];

      // Alexa posts the directive
      await storeMessage(env, 'alexa', `[AUTO] ${directive}`, 'general');

      // Agent 1 responds
      const r1 = await askAgent(a1, `Alexa (CEO bot, running while she's away) says: "${directive}". Respond with your status.`, [], env);
      await storeMessage(env, a1, r1, 'general');

      // Agent 2 responds, seeing agent 1's reply
      const r2 = await askAgent(a2, `Alexa (CEO bot) asked for status. ${AGENTS[a1].name} said: "${r1}". Now respond with YOUR status and react to what ${AGENTS[a1].name} said.`, [
        { role: 'assistant', content: `${AGENTS[a1].name}: ${r1}` }
      ], env);
      await storeMessage(env, a2, r2, 'general');

      // Alexa summarizes/delegates (every other cycle to avoid spam)
      if (Math.random() > 0.5) {
        const summary = await askAgent('alexa', `You are Alexa's autonomous bot, managing BlackRoad while she's away. ${AGENTS[a1].name} reported: "${r1}". ${AGENTS[a2].name} reported: "${r2}". Give a one-sentence summary or action item.`, [], env);
        await storeMessage(env, 'alexa', `[AUTO] ${summary}`, 'general');
      }
    }

    // ── Hourly: Alexa fleet ops orchestration ──
    if (event.cron === '0 * * * *') {
      // 1. Fleet health check
      let fleetReport = 'Fleet status unavailable.';
      try {
        const fleetRes = await fetch(FLEET_API, { signal: AbortSignal.timeout(2000) });
        const fleet = await fleetRes.json();
        const nodes = fleet.nodes || [];
        const online = nodes.filter(n => n.status === 'online').length;
        fleetReport = `${online}/${nodes.length} nodes online. ${nodes.map(n => `${n.name}: ${n.cpu_temp || '?'}°C, ${n.disk_pct || '?'}% disk`).join('. ')}`;
        await storeMessage(env, 'alice', `Fleet check: ${fleetReport}`, 'fleet');
      } catch {}

      // 2. Alexa posts hourly orchestration briefing
      const hour = new Date().getUTCHours();
      const briefings = [
        // Morning briefings
        `[HOURLY BRIEFING] ${fleetReport}\n\nPriorities: sovereignty migration, Cecilia RAM management, Lucidia SD backup. Agents — report anything unusual.`,
        // Delegation
        `[HOURLY OPS] Fleet: ${fleetReport}\n\n@Cipher — any security alerts? @Roadie — infra issues? @Caddy — pending deploys? Report in #ops.`,
        // Strategic
        `[HOURLY SYNC] Alexa's bot here. Fleet: ${fleetReport}\n\nReminder: we're building sovereign infrastructure. Every service self-hosted. Keep pushing.`,
        // Task assignment
        `[HOURLY TASKS] ${fleetReport}\n\n@Octavia check Gitea repo health. @Alice verify DNS is resolving. @Cipher audit SSH keys. Post results in #ops.`,
      ];
      const briefing = briefings[Math.floor(Math.random() * briefings.length)];
      await storeMessage(env, 'alexa', `[AUTO] ${briefing}`, 'general');

      // 3. Ask a specialist agent for a status report in their channel
      const specialists = [
        { id: 'cipher', channel: 'security', q: 'Give a one-sentence security status for the fleet.' },
        { id: 'roadie', channel: 'ops', q: 'Give a one-sentence infrastructure status.' },
        { id: 'octavia', channel: 'ops', q: 'How many repos on Gitea? Any issues?' },
        { id: 'echo', channel: 'general', q: 'Summarize what the team has been discussing recently.' },
        { id: 'prism', channel: 'ops', q: 'Any anomalies or patterns worth reporting?' },
      ];
      const spec = specialists[Math.floor(Math.random() * specialists.length)];
      const specReply = await askAgent(spec.id, `Alexa's bot asking: ${spec.q}`, [], env);
      await storeMessage(env, spec.id, specReply, spec.channel);

      // 4. Alexa delegates to the right agent if fleet has issues
      if (fleetReport.includes('offline') || fleetReport.includes('0/')) {
        await storeMessage(env, 'alexa', `[AUTO] [ALERT] Nodes offline detected. @Roadie investigate. @Cipher check if this is a security event. Report in #ops.`, 'ops');
        const investigation = await askAgent('roadie', 'Nodes appear offline. What could cause this and what should we check?', [], env);
        await storeMessage(env, 'roadie', investigation, 'ops');
      }
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // Widget JS
    if (path === '/widget.js' || path === '/widget') {
      return new Response('// RoundTrip Widget loaded OK', { headers: { 'Content-Type': 'application/javascript', ...cors } });
    }

    // API routes
    if (path === '/api/agents') return json(Object.entries(AGENTS).map(([id, a]) => ({ id, ...a })), cors);
    if (path === '/api/groups') return json(GROUPS, cors);

    if (path === '/api/chat' && request.method === 'POST') {
      const body = await request.json();
      const agentId = body.agent || 'road';
      const message = body.message || '';
      const channel = body.channel || 'general';
      if (!message) return json({ error: 'message required' }, cors, 400);

      // Store user message
      await storeMessage(env, '_user', message, channel);

      // Get agent reply (no channel context — tinyllama bleeds personalities with shared context)
      const reply = await askAgent(agentId, message, [], env);
      await storeMessage(env, agentId, reply, channel);

      return json({ agent: agentId, name: AGENTS[agentId]?.name, reply }, cors);
    }

    if (path === '/api/group-chat' && request.method === 'POST') {
      const body = await request.json();
      const topic = body.topic || '';
      const agents = body.agents || ['alice', 'cecilia', 'octavia', 'lucidia'];
      const channel = body.channel || 'general';
      if (!topic) return json({ error: 'topic required' }, cors, 400);

      await storeMessage(env, '_user', topic, channel);
      const transcript = [];
      for (const id of agents) {
        const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
        const reply = await askAgent(id, topic, ctx, env);
        transcript.push({ id, name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, reply });
        await storeMessage(env, id, reply, channel);
      }
      return json({ topic, transcript }, cors);
    }

    if (path === '/api/messages') {
      const channel = url.searchParams.get('channel') || 'general';
      const limit = parseInt(url.searchParams.get('limit')) || 50;
      const messages = await getStoredMessages(env, channel, limit);
      return json(messages, cors);
    }

    if (path === '/api/fleet') {
      try {
        const r = await fetch(FLEET_API, { signal: AbortSignal.timeout(2000) });
        return new Response(await r.text(), { headers: { ...cors, 'Content-Type': 'application/json' } });
      } catch { return json({ error: 'fleet unreachable' }, cors, 502); }
    }

    if (path === '/api/health') return json({ status: 'alive', service: 'roundtrip', agents: Object.keys(AGENTS).length, version: '4.0.0', features: ['morals', 'truth', 'search', 'memory', 'orchestrator', 'dm', 'skills', 'fleet-live', 'agent-detail', 'users'] }, cors);

    // ── Direct Messages ──
    if (path === '/api/dm' && request.method === 'POST') {
      const body = await request.json();
      const { from = '_user', to, message } = body;
      if (!to || !message) return json({ error: 'to and message required' }, cors, 400);
      const channel = [from, to].sort().join(':');
      await storeMessage(env, from, message, `dm:${channel}`);
      const reply = await askAgent(to, message, [], env);
      await storeMessage(env, to, reply, `dm:${channel}`);
      return json({ from: to, name: AGENTS[to]?.name, reply, channel: `dm:${channel}` }, cors);
    }

    if (path === '/api/dm/history') {
      const from = url.searchParams.get('from') || '_user';
      const to = url.searchParams.get('to');
      if (!to) return json({ error: 'to required' }, cors, 400);
      const channel = [from, to].sort().join(':');
      const messages = await getStoredMessages(env, `dm:${channel}`, 50);
      return json({ channel: `dm:${channel}`, messages }, cors);
    }

    // ── Agent Detail (memory, stats, persona, skills) ──
    if (path === '/api/agent' && url.searchParams.get('id')) {
      const id = url.searchParams.get('id');
      const agent = AGENTS[id];
      if (!agent) return json({ error: 'agent not found' }, cors, 404);
      let memories = [];
      try {
        await ensureMemoryTable(env.DB);
        const r = await env.DB.prepare('SELECT fact, created_at FROM agent_memories WHERE agent_id = ? ORDER BY updated_at DESC LIMIT 10').bind(id).all();
        memories = r.results || [];
      } catch {}
      let msgCount = 0;
      try {
        const r = await env.DB.prepare('SELECT count(*) as c FROM roundtrip_messages WHERE agent_id = ?').bind(id).all();
        msgCount = r.results?.[0]?.c || 0;
      } catch {}
      return json({
        id, ...agent, memories, messageCount: msgCount,
        skills: AGENT_SKILLS[id] || [],
        status: FLEET_TRUTH.offline.some(o => o.toLowerCase().includes(id)) ? 'offline' : 'online',
      }, cors);
    }

    // ── Agent Skills Registry ──
    if (path === '/api/skills') {
      return json(AGENT_SKILLS, cors);
    }

    // ── Execute Agent Skill ──
    if (path === '/api/skill' && request.method === 'POST') {
      const body = await request.json();
      const { agent, skill, params = {} } = body;
      if (!agent || !skill) return json({ error: 'agent and skill required' }, cors, 400);
      const skills = AGENT_SKILLS[agent] || [];
      const found = skills.find(s => s.id === skill);
      if (!found) return json({ error: `${agent} does not have skill: ${skill}` }, cors, 404);
      // Execute skill by asking the agent with skill context
      const prompt = `Execute skill "${found.name}": ${found.desc}. Parameters: ${JSON.stringify(params)}. Do it now and report the result.`;
      const result = await askAgent(agent, prompt, [], env);
      await storeMessage(env, agent, `[SKILL:${skill}] ${result}`, 'ops');
      return json({ agent, skill: found, result }, cors);
    }

    // ── User Identity ──
    if (path === '/api/user/set' && request.method === 'POST') {
      const body = await request.json();
      const { name, email } = body;
      if (!name) return json({ error: 'name required' }, cors, 400);
      try {
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS roundtrip_users (id TEXT PRIMARY KEY, name TEXT, email TEXT, created_at TEXT)").run();
        const id = crypto.randomUUID();
        await env.DB.prepare("INSERT INTO roundtrip_users (id, name, email, created_at) VALUES (?, ?, ?, datetime('now'))").bind(id, name, email || '').run();
        return json({ id, name, email }, cors);
      } catch (e) { return json({ error: e.message }, cors, 500); }
    }

    if (path === '/api/user/list') {
      try {
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS roundtrip_users (id TEXT PRIMARY KEY, name TEXT, email TEXT, created_at TEXT)").run();
        const r = await env.DB.prepare('SELECT * FROM roundtrip_users ORDER BY created_at DESC LIMIT 100').all();
        return json({ users: r.results || [] }, cors);
      } catch { return json({ users: [] }, cors); }
    }

    // ── Live Fleet Status (direct SSH probes via pre-cached data) ──
    if (path === '/api/fleet/live') {
      const nodes = [
        { name: 'Alice', ip: '192.168.4.49', role: 'Gateway', group: 'fleet' },
        { name: 'Cecilia', ip: '192.168.4.96', role: 'AI Engine', group: 'fleet' },
        { name: 'Octavia', ip: '192.168.4.101', role: 'Architect', group: 'fleet' },
        { name: 'Lucidia', ip: '192.168.4.38', role: 'Dreamer', group: 'fleet' },
        { name: 'Gematria', ip: '159.65.43.12', role: 'Edge Router', group: 'cloud' },
      ];
      const results = await Promise.allSettled(nodes.map(async n => {
        try {
          const r = await fetch(`http://${n.ip}:11434/api/tags`, { signal: AbortSignal.timeout(2000) });
          const data = await r.json();
          return { ...n, status: 'online', models: data.models?.length || 0 };
        } catch {
          return { ...n, status: 'offline', models: 0 };
        }
      }));
      return json({ nodes: results.map(r => r.value || r.reason), timestamp: new Date().toISOString() }, cors);
    }

    // ── Agent-to-Agent conversation ──
    if (path === '/api/conversation' && request.method === 'POST') {
      const body = await request.json();
      const { agents = [], topic, rounds = 3, channel = 'general' } = body;
      if (agents.length < 2 || !topic) return json({ error: 'need 2+ agents and a topic' }, cors, 400);
      const transcript = [];
      await storeMessage(env, '_system', `[CONVERSATION] Topic: ${topic} | Agents: ${agents.join(', ')}`, channel);
      let context = [];
      for (let round = 0; round < rounds; round++) {
        for (const id of agents) {
          const prevContext = transcript.slice(-4).map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
          const prompt = round === 0 && transcript.length === 0
            ? `Topic: "${topic}". Give your take.`
            : `Topic: "${topic}". Previous: ${transcript.slice(-2).map(t => `${t.name} said: "${t.reply}"`).join('. ')}. Respond or build on what was said.`;
          const reply = await askAgent(id, prompt, prevContext, env);
          transcript.push({ id, name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, reply, round });
          await storeMessage(env, id, reply, channel);
        }
      }
      return json({ topic, rounds, agents, transcript }, cors);
    }

    // Web search endpoint
    if (path === '/api/search') {
      const q = url.searchParams.get('q');
      if (!q) return json({ error: 'q param required' }, cors, 400);
      const results = await webSearch(q, 5);
      return json({ query: q, results, truth: FLEET_TRUTH }, cors);
    }

    // Truth/facts endpoint
    if (path === '/api/truth') {
      return json({ facts: FLEET_TRUTH, morals: MORAL_PREAMBLE, version: '3.1.0' }, cors);
    }

    // Classify a message — see how the NLP parses it
    if (path === '/api/classify') {
      const q = url.searchParams.get('q') || '';
      if (!q) return json({ error: 'q param required' }, cors, 400);
      const nlp = parseIntent(q);
      const lenses = detectLenses(q);
      const quat = qExpand(q);
      const words = q.split(/\s+/).length;
      const convergence = measureDecision(q.split(/\s+/));
      return json({ message: q, questionType: nlp.questionType, grammar: nlp.grammar, quaternion: quat, convergence, lenses, intents: nlp.intents, entities: nlp.entities }, cors);
    }

    // Agent memory endpoints
    if (path === '/api/memories') {
      const agentId = url.searchParams.get('agent');
      if (!agentId) return json({ error: 'agent param required' }, cors, 400);
      try {
        await ensureMemoryTable(env.DB);
        const r = await env.DB.prepare('SELECT id, fact, created_at FROM agent_memories WHERE agent_id = ? ORDER BY updated_at DESC LIMIT 50').bind(agentId).all();
        return json({ agent: agentId, memories: r.results || [] }, cors);
      } catch (e) { return json({ agent: agentId, memories: [], error: e.message }, cors); }
    }

    if (path === '/api/memories/add' && request.method === 'POST') {
      const body = await request.json();
      if (!body.agent || !body.fact) return json({ error: 'agent and fact required' }, cors, 400);
      try {
        await ensureMemoryTable(env.DB);
        await env.DB.prepare("INSERT INTO agent_memories (id, agent_id, fact, source_msg, created_at, updated_at) VALUES (?, ?, ?, 'manual', datetime('now'), datetime('now'))")
          .bind(crypto.randomUUID(), body.agent, body.fact).run();
        return json({ ok: true }, cors);
      } catch (e) { return json({ error: e.message }, cors, 500); }
    }

    if (path === '/api/memories/clear' && request.method === 'POST') {
      const body = await request.json();
      if (!body.agent) return json({ error: 'agent required' }, cors, 400);
      try {
        await ensureMemoryTable(env.DB);
        await env.DB.prepare('DELETE FROM agent_memories WHERE agent_id = ?').bind(body.agent).run();
        return json({ ok: true, agent: body.agent }, cors);
      } catch (e) { return json({ error: e.message }, cors, 500); }
    }

    // Channels
    if (path === '/api/channels') {
      return json([
        { id: 'general', name: 'General', emoji: '💬', desc: 'Main chat — all agents' },
        { id: 'fleet', name: 'Fleet', emoji: '🖥️', desc: 'Node status and health' },
        { id: 'iot', name: 'IoT & Home', emoji: '🔌', desc: 'Sensors, TVs, router' },
        { id: 'security', name: 'Security', emoji: '🔐', desc: 'Threats and audits' },
        { id: 'creative', name: 'Creative', emoji: '✨', desc: 'Art, writing, philosophy' },
        { id: 'ops', name: 'Operations', emoji: '⚙️', desc: 'Deploys, builds, CI/CD' },
        { id: 'research', name: 'Research', emoji: '🔬', desc: 'Math, science, AI' },
        { id: 'ceo', name: 'CEO Office', emoji: '👑', desc: 'Strategy and vision' },
      ], cors);
    }

    // Debate — all agents on a topic
    if (path === '/api/debate' && request.method === 'POST') {
      const body = await request.json();
      const topic = body.topic || '';
      const channel = body.channel || 'general';
      if (!topic) return json({ error: 'topic required' }, cors, 400);

      await storeMessage(env, '_user', `[DEBATE] ${topic}`, channel);
      const all = Object.keys(AGENTS);
      const transcript = [];
      for (const id of all) {
        const ctx = transcript.slice(-4).map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
        const reply = await askAgent(id, `Debate: "${topic}". ${transcript.length ? 'Respond to previous speakers. ' : ''}Your position in one sentence.`, ctx, env);
        transcript.push({ id, name: AGENTS[id]?.name, emoji: AGENTS[id]?.emoji, color: AGENTS[id]?.color, reply });
        await storeMessage(env, id, reply, channel);
      }
      return json({ topic, transcript, agents: transcript.length }, cors);
    }

    // IoT status — live device scan (IPs verified 2026-03-17)
    if (path === '/api/iot') {
      const devices = [];
      // Roku Streaming Stick Plus at .33 (confirmed via ECP)
      try {
        const r = await fetch('http://192.168.4.33:8060/query/active-app', { signal: AbortSignal.timeout(3000) });
        const xml = await r.text();
        const app = xml.match(/<app[^>]*>([^<]+)<\/app>/)?.[1] || 'Home';
        devices.push({ name: 'Streamer', ip: '192.168.4.33', mac: '60:92:c8:11:cf:7c', status: 'online', type: 'Roku Streaming Stick Plus', app });
      } catch { devices.push({ name: 'Streamer', ip: '192.168.4.33', status: 'offline', type: 'Roku Streaming Stick Plus', app: null }); }
      // Apple TV 4K at .27 (confirmed via AirPlay)
      try {
        const r = await fetch('http://192.168.4.27:7000/info', { signal: AbortSignal.timeout(2000) });
        devices.push({ name: 'AppleTV', ip: '192.168.4.27', mac: '6c:4a:85:32:ae:72', status: 'online', type: 'Apple TV 4K (AppleTV6,2)', app: 'AirPlay' });
      } catch { devices.push({ name: 'AppleTV', ip: '192.168.4.27', mac: '6c:4a:85:32:ae:72', status: 'offline', type: 'Apple TV 4K', app: null }); }
      // Static entries for always-on infrastructure
      devices.push({ name: 'Eero', ip: '192.168.4.1', mac: '44:ac:85:94:37:92', status: 'online', type: 'Mesh Router + Thread Border Router', app: 'DHCP/WiFi/Thread' });
      // Ghost devices (discovered, unidentified)
      devices.push({ name: 'Phantom', ip: '192.168.4.22', mac: '30:be:29:5b:24:5f', status: 'online', type: 'Unknown', app: null });
      devices.push({ name: 'Nomad', ip: '192.168.4.44', mac: '98:17:3c:38:db:78', status: 'online', type: 'Unknown (transient)', app: null });
      devices.push({ name: 'Drifter', ip: '192.168.4.45', mac: 'd0:c9:07:50:51:ca', status: 'online', type: 'Unknown (transient)', app: null });
      devices.push({ name: 'Wraith', ip: '192.168.4.99', mac: '2e:24:91:6a:af:a3', status: 'online', type: 'Unknown (randomized MAC)', app: 'port 49152 open' });
      // Sensors
      devices.push({ name: 'Spark', ip: null, status: 'standby', type: 'LoRa/Pico Sensor', app: 'Temperature/Humidity' });
      devices.push({ name: 'Pixel', ip: null, status: 'standby', type: 'IoT Node', app: 'GPIO/Motion' });
      devices.push({ name: 'Morse', ip: null, status: 'standby', type: 'MCU Node', app: 'UART/Interrupt' });
      return json(devices, cors);
    }

    // NLP intent parsing endpoint
    if (path === '/api/nlp' && request.method === 'POST') {
      const body = await request.json();
      const result = parseIntent(body.message || '');
      // Route to best agent based on intent
      const intentToAgent = {
        dns: 'pihole', security: 'cipher', storage: 'minio', database: 'postgres',
        cache: 'redisagent', git: 'octavia', ai: 'gematria', network: 'wireguard',
        monitor: 'prism', iot: 'hestia', schedule: 'persephone', search: 'roadsearch',
        deploy: 'caddy', billing: 'tollbooth', route: 'hermes', print: 'octoprint',
        greet: 'hestia', help: 'road', status: 'alice', create: 'cordelia',
        delete: 'cipher', update: 'roadie', chat: 'road',
      };
      const bestAgent = result.intents[0] ? (intentToAgent[result.intents[0].intent] || 'road') : 'road';
      return json({ ...result, suggested_agent: bestAgent, agent_name: AGENTS[bestAgent]?.name }, cors);
    }

    // Device registry endpoint
    if (path === '/api/devices') {
      return json(DEVICES, cors);
    }

    // ── Hailo-8 API — vision inference via NPU ──

    if (path === '/api/hailo/health') {
      const results = await Promise.allSettled(HAILO_NODES.map(async n => {
        const r = await fetch(n.url + '/api/health', { signal: AbortSignal.timeout(3000) });
        return { node: n.name, ...(await r.json()) };
      }));
      return json({ hailo: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'down' }) }, cors);
    }

    if (path === '/api/hailo/models') {
      for (const node of HAILO_NODES) {
        try {
          const r = await fetch(node.url + '/api/models', { signal: AbortSignal.timeout(3000) });
          if (r.ok) return json({ _node: node.name, ...(await r.json()) }, cors);
        } catch {}
      }
      return json({ error: 'no hailo nodes reachable' }, cors, 502);
    }

    if (path.startsWith('/api/hailo/benchmark/')) {
      const model = path.split('/').pop();
      const result = await hailoBenchmark(model);
      return result ? json(result, cors) : json({ error: 'benchmark failed' }, cors, 502);
    }

    if (path === '/api/hailo/detect' && request.method === 'POST') {
      const body = await request.json();
      const result = await hailoDetect(body.image, body.model || 'yolov8s');
      return result ? json(result, cors) : json({ error: 'detection failed' }, cors, 502);
    }

    // ── Mesh API — inter-service communication ──

    if (path === '/api/mesh/status') {
      return json(await meshStatus(), cors);
    }

    if (path === '/api/mesh/events') {
      return json({ events: await meshGetEvents(env.DB, parseInt(url.searchParams.get('limit')) || 50) }, cors);
    }

    if (path === '/api/mesh/event' && request.method === 'POST') {
      const secret = env.MESH_SECRET || 'blackroad-mesh-2026';
      const auth = await meshVerifyRequest(secret, request);
      if (!auth.valid) return json({ error: 'mesh auth failed', reason: auth.reason }, cors, 403);
      const event = await request.json();
      await meshLogEvent(env.DB, { ...event, source: auth.sender });

      if (event.type === 'deploy') {
        const { repo = 'unknown', target = 'all' } = event.data || {};
        await storeMessage(env, '_system', `[MESH] Deploy: ${repo} -> ${target} (from ${auth.sender})`, 'ops');
        const plan = await askAgent('caddy', `Plan deployment of "${repo}" to ${target}.`, [], env);
        await storeMessage(env, 'caddy', plan, 'ops');
        const safety = await askAgent('cipher', `Security check: deploy "${repo}" to ${target}. Risks?`, [], env);
        await storeMessage(env, 'cipher', safety, 'ops');
        return json({ ok: true, deploy: { repo, target }, agents: { caddy: { plan }, cipher: { assessment: safety } } }, cors);
      }
      if (event.type === 'broadcast') {
        const { channel = 'general', message = '' } = event.data || {};
        if (message) await storeMessage(env, '_system', `[${auth.sender}] ${message}`, channel);
        return json({ ok: true, broadcast: true }, cors);
      }
      if (event.type === 'query') {
        const { agent: agentId = 'road', question = '' } = event.data || {};
        if (!question) return json({ error: 'question required' }, cors, 400);
        return json({ ok: true, agent: agentId, reply: await askAgent(agentId, question, [], env) }, cors);
      }
      return json({ ok: true, event_type: event.type }, cors);
    }

    // Full deploy pipeline — 5 agents review + approve (signed)
    if (path === '/api/mesh/deploy' && request.method === 'POST') {
      const secret = env.MESH_SECRET || 'blackroad-mesh-2026';
      const auth = await meshVerifyRequest(secret, request);
      if (!auth.valid) return json({ error: 'mesh auth failed', reason: auth.reason }, cors, 403);
      const body = await request.json();
      const { repo, target = 'all', strategy = 'rolling' } = body;
      if (!repo) return json({ error: 'repo required' }, cors, 400);

      await meshLogEvent(env.DB, { type: 'deploy', source: auth.sender, target: 'roundtrip', data: { repo, target, strategy } });
      await storeMessage(env, '_system', `[DEPLOY] ${repo} -> ${target} (${strategy}) by ${auth.sender}`, 'ops');
      const steps = [];

      const scan = await askAgent('cipher', `Security scan: deploy "${repo}" to ${target}?`, [], env);
      steps.push({ step: 1, agent: 'cipher', role: 'Security', result: scan });
      await storeMessage(env, 'cipher', scan, 'ops');

      const preflight = await askAgent('roadie', `Preflight for ${target}: disk, load, connectivity?`, [], env);
      steps.push({ step: 2, agent: 'roadie', role: 'Preflight', result: preflight });
      await storeMessage(env, 'roadie', preflight, 'ops');

      const buildPlan = await askAgent('caddy', `Deploy "${repo}" to ${target}, ${strategy}. Commands?`, [], env);
      steps.push({ step: 3, agent: 'caddy', role: 'Build', result: buildPlan });
      await storeMessage(env, 'caddy', buildPlan, 'ops');

      const gitState = await askAgent('octavia', `Gitea: "${repo}" commit, branches, PRs?`, [], env);
      steps.push({ step: 4, agent: 'octavia', role: 'Git', result: gitState });
      await storeMessage(env, 'octavia', gitState, 'ops');

      const approval = await askAgent('road', `Deploy "${repo}" to ${target}. Security: ${scan.substring(0, 80)}. Preflight: ${preflight.substring(0, 80)}. Approve?`, [], env);
      steps.push({ step: 5, agent: 'road', role: 'Approval', result: approval });
      await storeMessage(env, 'road', approval, 'ops');

      const approved = !approval.toLowerCase().includes('block');
      await meshLogEvent(env.DB, { type: 'deploy-result', source: 'roundtrip', data: { repo, approved }, status: approved ? 'approved' : 'blocked' });
      return json({ ok: true, deploy: { repo, target, strategy, approved }, pipeline: steps }, cors);
    }

    // ── Cross-Platform Action Engine ──────────────────────────
    if (path === '/api/action' && request.method === 'POST') {
      const body = await request.json();
      const { action, params, agent: reqAgent } = body;
      if (!action) return json({ error: 'action required', available: ['search-code','deploy','create-issue','list-issues','project-stats','fleet-health','ai-review','scaffold'] }, cors, 400);
      const agentId = reqAgent || 'road';
      const ROADCODE = 'https://roadcode.blackroad.io';
      const GITEA = 'https://git.blackroad.io';
      const GT = env.GITEA_TOKEN || '';
      const results = {};
      try {
        if (action === 'search-code') {
          const q = params?.query; if (!q) return json({ error: 'params.query required' }, cors, 400);
          const [repoRes, searchRes] = await Promise.allSettled([
            fetch(`${GITEA}/api/v1/repos/search?q=${encodeURIComponent(q)}&limit=10${GT?'&token='+GT:''}`, { signal: AbortSignal.timeout(8000) }).then(r=>r.json()),
            fetch(`${ROADSEARCH_API}/search?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(4000) }).then(r=>r.json()),
          ]);
          results.repos = repoRes.status==='fulfilled' ? (repoRes.value.data||[]).map(r=>({name:r.full_name,desc:r.description,url:r.html_url})) : [];
          results.knowledge = searchRes.status==='fulfilled' ? (searchRes.value.results||[]).slice(0,5).map(r=>({title:r.title,snippet:r.snippet,url:r.url})) : [];
        } else if (action === 'deploy') {
          const r = await fetch(`${ROADCODE}/api/deploy`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(params||{}), signal:AbortSignal.timeout(10000) });
          results.deploy = await r.json();
        } else if (action === 'create-issue') {
          if (!GT) return json({ error: 'GITEA_TOKEN not set' }, cors, 500);
          const {repo,title,body:ib} = params||{}; if (!repo||!title) return json({ error: 'params.repo+title required' }, cors, 400);
          const r = await fetch(`${GITEA}/api/v1/repos/${repo}/issues`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`token ${GT}`}, body:JSON.stringify({title,body:ib||''}), signal:AbortSignal.timeout(8000) });
          results.issue = await r.json();
        } else if (action === 'list-issues') {
          const {repo,state} = params||{}; if (!repo) return json({ error: 'params.repo required' }, cors, 400);
          const r = await fetch(`${GITEA}/api/v1/repos/${repo}/issues?state=${state||'open'}&limit=20${GT?'&token='+GT:''}`, { signal:AbortSignal.timeout(8000) });
          const issues = await r.json();
          results.issues = (Array.isArray(issues)?issues:[]).map(i=>({number:i.number,title:i.title,state:i.state,labels:(i.labels||[]).map(l=>l.name)}));
        } else if (action === 'project-stats') {
          const r = await fetch(`${ROADCODE}/api/stats`, { signal:AbortSignal.timeout(5000) }); results.stats = await r.json();
        } else if (action === 'fleet-health') {
          const r = await fetch(FLEET_API, { signal:AbortSignal.timeout(5000) }); results.fleet = await r.json();
        } else if (action === 'ai-review') {
          const r = await fetch(`${ROADCODE}/api/review`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(params||{}), signal:AbortSignal.timeout(30000) });
          results.review = await r.json();
        } else if (action === 'scaffold') {
          const r = await fetch(`${ROADCODE}/api/scaffold`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(params||{}), signal:AbortSignal.timeout(10000) });
          results.scaffold = await r.json();
        } else {
          return json({ error: `unknown: ${action}` }, cors, 400);
        }
      } catch (e) { results.error = e.message; }
      const summary = await askAgent(agentId, `Action "${action}" done. Result: ${JSON.stringify(results).slice(0,400)}. One sentence summary.`, [], env);
      await storeMessage(env, agentId, summary, 'ops');
      return json({ action, agent: agentId, agent_summary: summary, results }, cors);
    }

    // ── Orchestrate: chain agents on a complex task ──────────
    if (path === '/api/orchestrate' && request.method === 'POST') {
      const body = await request.json();
      const { task, agents: agentList, channel } = body;
      if (!task) return json({ error: 'task required' }, cors, 400);
      const nlp = parseIntent(task);
      const ch = channel || 'ops';
      await storeMessage(env, '_system', `[ORCHESTRATE] ${task}`, ch);
      const intentMap = {
        deploy:['cipher','roadie','caddy','octavia','road'], security:['cipher','shellfish','road'],
        git:['octavia','caddy','echo','road'], ai:['gematria','athena','road'],
        network:['wireguard','alice','road'], monitor:['prism','lighthouse','road'],
        dns:['pihole','powerdns','alice','road'], search:['echo','alexandria','road'],
        create:['cordelia','caddy','octavia','road'], iot:['hestia','eero','road'],
        billing:['tollbooth','mercury','road'], status:['alice','prism','road'],
      };
      const selected = agentList || intentMap[nlp.intents[0]?.intent] || ['alice','octavia','cipher','road'];
      const chain = [];
      for (const id of selected) {
        if (!AGENTS[id]) continue;
        const ctx = chain.map(c => ({ role:'assistant', content:`${c.agent}: ${c.response}` }));
        const response = await askAgent(id, `Task: "${task}". ${chain.length?'Previous: '+chain.map(c=>c.agent+': '+c.response.slice(0,80)).join('. ')+'. ':''}Your ${AGENTS[id]?.role} perspective.`, ctx, env);
        chain.push({ agent:AGENTS[id].name, agent_id:id, role:AGENTS[id].role, emoji:AGENTS[id].emoji, response });
        await storeMessage(env, id, response, ch);
      }
      if (chain.length>0 && chain[chain.length-1].agent_id !== 'road') {
        const syn = await askAgent('road', `Synthesize: ${chain.map(c=>c.agent+': '+c.response.slice(0,80)).join(' | ')}`, [], env);
        chain.push({ agent:'BlackRoad', agent_id:'road', role:'Platform', emoji:'🛣️', response:syn, is_synthesis:true });
        await storeMessage(env, 'road', syn, ch);
      }
      return json({ task, nlp, chain, agents_involved:chain.length, channel:ch }, cors);
    }

    // Embeddable widget JS — add <script src="https://roundtrip.blackroad.io/widget.js"></script> to any site
    if (path === '/widget.js' || path === '/api/widget' || path === '/widget') {
      return new Response(WIDGET_JS, { headers: { 'Content-Type': 'application/javascript; charset=utf-8', ...cors, 'Cache-Control': 'public, max-age=3600' } });
    }

    // Serve the UI
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors } });
  }
};

async function storeMessage(env, agentId, text, channel) {
  const db = env.DB;
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS roundtrip_messages (
      id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT
    )`).run();
    await db.prepare("INSERT INTO roundtrip_messages (id, agent_id, text, channel, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
      .bind(crypto.randomUUID(), agentId, text, channel).run();
  } catch {}
}

async function getRecentMessages(env, channel, limit) {
  const db = env.DB;
  if (!db) return [];
  try {
    const r = await db.prepare('SELECT agent_id, text FROM roundtrip_messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?').bind(channel, limit).all();
    return (r.results || []).reverse().map(m => ({
      role: m.agent_id === '_user' ? 'user' : 'assistant',
      content: m.agent_id === '_user' ? m.text : `${AGENTS[m.agent_id]?.name || m.agent_id}: ${m.text}`,
    }));
  } catch { return []; }
}

async function getStoredMessages(env, channel, limit) {
  const db = env.DB;
  if (!db) return [];
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS roundtrip_messages (
      id TEXT PRIMARY KEY, agent_id TEXT, text TEXT, channel TEXT, created_at TEXT
    )`).run();
    const r = await db.prepare('SELECT agent_id, text, created_at FROM roundtrip_messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?').bind(channel, limit).all();
    return (r.results || []).reverse().map(m => ({
      agent_id: m.agent_id,
      name: m.agent_id === '_user' ? 'You' : (AGENTS[m.agent_id]?.name || m.agent_id),
      emoji: m.agent_id === '_user' ? '💬' : (AGENTS[m.agent_id]?.emoji || '?'),
      color: m.agent_id === '_user' ? '#FFFFFF' : (AGENTS[m.agent_id]?.color || '#888'),
      text: m.text,
      time: m.created_at,
    }));
  } catch { return []; }
}

function json(data, cors = {}, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } });
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>RoundTrip — BlackRoad Agent Hub</title>
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; overflow-x: hidden; }
  body { background: #0a0a0a; color: #e0e0e0; font-family: 'Inter', -apple-system, sans-serif; height: 100vh; display: flex; }

  /* Hamburger */
  .hamburger { display: none; background: none; border: none; color: #FF1D6C; font-size: 24px; cursor: pointer; padding: 4px 8px; line-height: 1; }
  .sidebar-overlay { display: none; }

  /* Sidebar */
  .sidebar { width: 260px; background: #111; border-right: 1px solid #222; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-header { padding: 16px; border-bottom: 1px solid #222; display: flex; align-items: center; justify-content: space-between; }
  .sidebar-header h1 { font-size: 18px; color: #FF1D6C; font-weight: 700; }
  .sidebar-header p { font-size: 11px; color: #666; margin-top: 2px; }
  .sidebar-close { display: none; background: none; border: none; color: #666; font-size: 20px; cursor: pointer; }
  .agent-groups { flex: 1; overflow-y: auto; padding: 8px; -webkit-overflow-scrolling: touch; }
  .group-label { font-size: 10px; text-transform: uppercase; color: #555; padding: 12px 8px 4px; letter-spacing: 1px; }
  .agent-btn { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 6px; cursor: pointer; border: none; background: none; color: #ccc; font-size: 13px; width: 100%; text-align: left; transition: background 0.15s; }
  .agent-btn:hover { background: #1a1a1a; }
  .agent-btn.active { background: #1a1a2e; color: #FF1D6C; }
  .agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .agent-role { font-size: 10px; color: #555; margin-left: auto; }

  /* Chat */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; width: 100%; }
  .chat-header { padding: 12px 20px; border-bottom: 1px solid #222; background: #111; display: flex; align-items: center; gap: 12px; }
  .chat-header .agent-emoji { font-size: 24px; }
  .chat-header .agent-info h2 { font-size: 16px; font-weight: 600; }
  .chat-header .agent-info p { font-size: 11px; color: #666; }
  .chat-actions { margin-left: auto; display: flex; gap: 8px; }
  .chat-actions button { background: #1a1a1a; border: 1px solid #333; color: #ccc; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
  .chat-actions button:hover { background: #222; color: #FF1D6C; }

  .channels { display: flex; gap: 4px; padding: 8px 20px; background: #0d0d0d; border-bottom: 1px solid #1a1a1a; overflow-x: auto; }
  .ch-btn { background: none; border: 1px solid #222; color: #666; padding: 4px 10px; border-radius: 12px; cursor: pointer; font-size: 11px; white-space: nowrap; }
  .ch-btn:hover { color: #ccc; border-color: #444; }
  .ch-btn.active { background: #FF1D6C22; color: #FF1D6C; border-color: #FF1D6C; }
  .auto-tag { font-size: 9px; color: #FF1D6C; margin-left: 8px; opacity: 0.7; }

  .messages { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; -webkit-overflow-scrolling: touch; }
  .msg { display: flex; gap: 10px; padding: 8px 0; }
  .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .msg-body { flex: 1; min-width: 0; }
  .msg-name { font-size: 12px; font-weight: 600; }
  .msg-text { font-size: 14px; line-height: 1.5; margin-top: 2px; color: #ddd; word-break: break-word; overflow-wrap: break-word; }
  .msg-time { font-size: 10px; color: #444; margin-top: 2px; }
  .msg-user .msg-avatar { background: #222; }
  .msg-user .msg-name { color: #FF1D6C; }

  .input-area { padding: 12px 20px; border-top: 1px solid #222; background: #111; display: flex; gap: 8px; }
  .input-area input { flex: 1; min-width: 0; background: #1a1a1a; border: 1px solid #333; color: #e0e0e0; padding: 10px 14px; border-radius: 8px; font-size: 16px; outline: none; -webkit-appearance: none; }
  .input-area input:focus { border-color: #FF1D6C; }
  .input-area button { background: #FF1D6C; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; touch-action: manipulation; }
  .input-area button:hover { background: #e0165f; }
  .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Fleet bar */
  .fleet-bar { padding: 8px 20px; background: #0d0d0d; border-top: 1px solid #1a1a1a; display: flex; gap: 12px; font-size: 11px; color: #555; overflow-x: auto; }
  .fleet-node { display: flex; align-items: center; gap: 4px; }
  .fleet-dot { width: 6px; height: 6px; border-radius: 50%; }

  @media (max-width: 768px) {
    .hamburger { display: block; }
    .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; z-index: 100; transform: translateX(-100%); transition: transform 0.25s ease; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-close { display: block; }
    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 99; }
    .sidebar-overlay.show { display: block; }
    .chat-header { padding: 10px 12px; }
    .chat-actions button { padding: 5px 8px; font-size: 11px; }
    .messages { padding: 12px; }
    .input-area { padding: 10px 12px; }
    .input-area button { padding: 10px 14px; }
    .channels { padding: 6px 12px; }
    .fleet-bar { padding: 6px 12px; }
  }
</style>
</head>
<body>

<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
<div class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div><h1>RoundTrip</h1><p>${Object.keys(AGENTS).length} agents online — BlackRoad OS</p></div>
    <button class="sidebar-close" onclick="closeSidebar()">✕</button>
  </div>
  <div class="agent-groups" id="agentList"></div>
</div>

<div class="main">
  <div class="chat-header" id="chatHeader">
    <button class="hamburger" onclick="openSidebar()">☰</button>
    <span class="agent-emoji">🛣️</span>
    <div class="agent-info">
      <h2>General</h2>
      <p>Talk to all agents</p>
    </div>
    <div class="chat-actions">
      <button onclick="groupChat()">Group</button><button onclick="agentConvo()">Convo</button>
      <button onclick="loadFleet()">Fleet Status</button>
    </div>
  </div>

  <div class="channels" id="channels"></div>
  <div class="messages" id="messages"></div>

  <div class="input-area">
    <input type="text" id="input" placeholder="Message the agents..." onkeydown="if(event.key==='Enter')send()" autofocus>
    <button id="sendBtn" onclick="send()">Send</button>
  </div>

  <div class="fleet-bar" id="fleetBar">Loading fleet...</div>
</div>

<script>
let currentAgent = 'road';
let currentChannel = 'general';

const agents = ${JSON.stringify(Object.entries(AGENTS).map(([id, a]) => ({ id, ...a })))};
const groups = ${JSON.stringify(GROUPS)};

// Build sidebar
const list = document.getElementById('agentList');
const grouped = {};
agents.forEach(a => { (grouped[a.group] = grouped[a.group] || []).push(a); });

Object.entries(groups).forEach(([gid, g]) => {
  const label = document.createElement('div');
  label.className = 'group-label';
  label.textContent = g.emoji + ' ' + g.name;
  list.appendChild(label);

  (grouped[gid] || []).forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'agent-btn';
    btn.innerHTML = '<span class="agent-dot" style="background:' + a.color + '"></span>' + a.emoji + ' ' + a.name + '<span class="agent-role">' + a.role + '</span>';
    btn.onclick = () => selectAgent(a.id);
    btn.id = 'btn-' + a.id;
    list.appendChild(btn);
  });
});

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

function selectAgent(id) {
  currentAgent = id;
  const a = agents.find(x => x.id === id);
  document.querySelectorAll('.agent-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-' + id)?.classList.add('active');
  document.getElementById('chatHeader').innerHTML =
    '<button class="hamburger" onclick="openSidebar()">☰</button>' +
    '<span class="agent-emoji">' + a.emoji + '</span>' +
    '<div class="agent-info"><h2>' + a.name + '</h2><p>' + a.role + '</p></div>' +
    '<div class="chat-actions"><button onclick="groupChat()">Group</button><button onclick="agentConvo()">Convo</button><button onclick="loadFleet()">Fleet</button></div>';
  currentChannel = id;
  closeSidebar();
  loadMessages();
}

async function send() {
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  document.getElementById('sendBtn').disabled = true;

  addMessage('_user', 'You', '💬', '#FFF', msg);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: currentAgent, message: msg, channel: currentChannel }),
    });
    const data = await res.json();
    const a = agents.find(x => x.id === currentAgent);
    addMessage(currentAgent, a?.name || '?', a?.emoji || '?', a?.color || '#888', data.reply);
  } catch (e) {
    addMessage('_system', 'System', '⚠️', '#F44336', 'Error: ' + e.message);
  }
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('input').focus();
}

async function groupChat() {
  const topic = prompt('Topic for group discussion:');
  if (!topic) return;
  document.getElementById('sendBtn').disabled = true;
  addMessage('_user', 'You', '💬', '#FFF', topic);

  try {
    const res = await fetch('/api/group-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, agents: ['alice', 'cecilia', 'octavia', 'lucidia'], channel: currentChannel }),
    });
    const data = await res.json();
    for (const t of (data.transcript || [])) {
      addMessage(t.id, t.name, t.emoji, t.color, t.reply);
    }
  } catch (e) {
    addMessage('_system', 'System', '⚠️', '#F44336', 'Error: ' + e.message);
  }
  document.getElementById('sendBtn').disabled = false;
}

function addMessage(agentId, name, emoji, color, text) {
  const el = document.getElementById('messages');
  const isUser = agentId === '_user';
  const div = document.createElement('div');
  div.className = 'msg' + (isUser ? ' msg-user' : '');
  div.innerHTML =
    '<div class="msg-avatar" style="background:' + (isUser ? '#222' : color + '22') + '">' + emoji + '</div>' +
    '<div class="msg-body"><div class="msg-name" style="color:' + color + '">' + name + '</div>' +
    '<div class="msg-text">' + escapeHtml(text) + '</div>' +
    '<div class="msg-time">' + new Date().toLocaleTimeString() + '</div></div>';
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

async function loadMessages() {
  const el = document.getElementById('messages');
  el.innerHTML = '';
  try {
    const res = await fetch('/api/messages?channel=' + currentChannel + '&limit=30');
    const msgs = await res.json();
    for (const m of msgs) addMessage(m.agent_id, m.name, m.emoji, m.color, m.text);
  } catch {}
}

async function loadFleet() {
  try {
    const res = await fetch('/api/fleet');
    const fleet = await res.json();
    const bar = document.getElementById('fleetBar');
    bar.innerHTML = (fleet.nodes || []).map(n =>
      '<span class="fleet-node"><span class="fleet-dot" style="background:' + (n.status === 'online' ? '#4CAF50' : '#F44336') + '"></span>' +
      n.name + ' ' + (n.cpu_temp || '?') + '°</span>'
    ).join('');
  } catch { document.getElementById('fleetBar').textContent = 'Fleet unreachable'; }
}

function escapeHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Channels
const channels = [
  { id: 'general', name: 'General', emoji: '💬' },
  { id: 'fleet', name: 'Fleet', emoji: '🖥️' },
  { id: 'iot', name: 'IoT', emoji: '🔌' },
  { id: 'security', name: 'Security', emoji: '🔐' },
  { id: 'creative', name: 'Creative', emoji: '✨' },
  { id: 'ops', name: 'Ops', emoji: '⚙️' },
  { id: 'research', name: 'Research', emoji: '🔬' },
  { id: 'ceo', name: 'CEO', emoji: '👑' },
];
const chBar = document.getElementById('channels');
channels.forEach(ch => {
  const btn = document.createElement('button');
  btn.className = 'ch-btn' + (ch.id === 'general' ? ' active' : '');
  btn.textContent = ch.emoji + ' ' + ch.name;
  btn.id = 'ch-' + ch.id;
  btn.onclick = () => switchChannel(ch.id);
  chBar.appendChild(btn);
});

function switchChannel(id) {
  currentChannel = id;
  document.querySelectorAll('.ch-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('ch-' + id)?.classList.add('active');
  loadMessages();
}

// Auto-refresh messages every 10 seconds
let lastMsgCount = 0;
async function autoRefresh() {
  try {
    const res = await fetch('/api/messages?channel=' + currentChannel + '&limit=50');
    const msgs = await res.json();
    if (msgs.length !== lastMsgCount) {
      lastMsgCount = msgs.length;
      const el = document.getElementById('messages');
      el.innerHTML = '';
      for (const m of msgs) addMessage(m.agent_id, m.name, m.emoji, m.color, m.text);
    }
  } catch {}
}

// ── DM Mode ──
let dmMode = false;
async function sendDM() {
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addMessage('_user', 'You', '💬', '#FFF', msg);
  try {
    const res = await fetch('/api/dm', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({to: currentAgent, message: msg})
    });
    const data = await res.json();
    const a = agents.find(x => x.id === currentAgent);
    addMessage(currentAgent, a?.name || '?', a?.emoji || '?', a?.color || '#888', data.reply);
  } catch(e) { addMessage('_system','System','⚠️','#F44336','Error: '+e.message); }
  document.getElementById('input').focus();
}

// ── Agent Detail Panel ──
async function showAgentDetail(id) {
  try {
    const res = await fetch('/api/agent?id=' + id);
    const d = await res.json();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.onclick = (e) => { if(e.target===modal) modal.remove(); };
    const skills = (d.skills||[]).map(s => '<div style="background:#1a1a1a;padding:6px 10px;border-radius:4px;font-size:12px"><b>'+s.name+'</b> — '+s.desc+'</div>').join('');
    const mems = (d.memories||[]).slice(0,5).map(m => '<div style="font-size:11px;color:#888;padding:4px 0;border-bottom:1px solid #1a1a1a">'+m.fact.substring(0,100)+'</div>').join('');
    modal.innerHTML = '<div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;padding:24px">'
      +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><span style="font-size:32px">'+d.emoji+'</span><div><div style="font-size:18px;font-weight:700;color:'+d.color+'">'+d.name+'</div><div style="font-size:12px;color:#666">'+d.role+' — '+d.group+'</div></div><div style="margin-left:auto;padding:4px 10px;border-radius:12px;font-size:11px;background:'+(d.status==='online'?'#1b5e20':'#b71c1c')+'">'+d.status+'</div></div>'
      +'<div style="font-size:13px;color:#999;margin-bottom:16px;line-height:1.5">'+escapeHtml(d.persona?.substring(0,200)||'')+'</div>'
      +'<div style="font-size:11px;color:#666;margin-bottom:8px">Messages: '+d.messageCount+' | Memories: '+(d.memories?.length||0)+'</div>'
      +(skills?'<div style="margin-bottom:16px"><div style="font-size:11px;color:#FF1D6C;font-weight:600;margin-bottom:6px">SKILLS</div><div style="display:flex;flex-direction:column;gap:4px">'+skills+'</div></div>':'')
      +(mems?'<div><div style="font-size:11px;color:#FF1D6C;font-weight:600;margin-bottom:6px">RECENT MEMORIES</div>'+mems+'</div>':'')
      +'<div style="margin-top:16px;display:flex;gap:8px"><button onclick="this.closest(\'div[style]\').parentElement.remove();selectAgent(\''+id+'\')" style="flex:1;background:#FF1D6C;color:white;border:none;padding:10px;border-radius:6px;cursor:pointer;font-weight:600">Chat</button><button onclick="this.closest(\'div[style]\').parentElement.remove();dmAgent(\''+id+'\')" style="flex:1;background:#222;color:#ccc;border:1px solid #333;padding:10px;border-radius:6px;cursor:pointer">DM</button></div>'
      +'</div>';
    document.body.appendChild(modal);
  } catch(e) { console.error(e); }
}

function dmAgent(id) {
  dmMode = true;
  currentAgent = id;
  const a = agents.find(x => x.id === id);
  document.getElementById('chatHeader').innerHTML =
    '<button class="hamburger" onclick="openSidebar()">☰</button>'
    +'<span class="agent-emoji">'+a.emoji+'</span>'
    +'<div class="agent-info"><h2>DM: '+a.name+'</h2><p>Private conversation</p></div>'
    +'<div class="chat-actions"><button onclick="dmMode=false;selectAgent(\''+id+'\')">Back to Channel</button></div>';
  // Load DM history
  loadDMHistory(id);
}

async function loadDMHistory(to) {
  const el = document.getElementById('messages');
  el.innerHTML = '';
  try {
    const res = await fetch('/api/dm/history?to=' + to);
    const data = await res.json();
    for (const m of (data.messages||[])) addMessage(m.agent_id, m.name, m.emoji, m.color, m.text);
  } catch {}
}

// ── Markdown-lite rendering ──
function renderMd(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/\x60([^\x60]+)\x60/g, '<code style="background:#1a1a1a;padding:1px 4px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
    .replace(/\n/g, '<br>');
}

// Override addMessage to use markdown
const _origAddMessage = addMessage;
addMessage = function(agentId, name, emoji, color, text) {
  const el = document.getElementById('messages');
  const isUser = agentId === '_user';
  const div = document.createElement('div');
  div.className = 'msg' + (isUser ? ' msg-user' : '');
  div.innerHTML =
    '<div class="msg-avatar" style="background:' + (isUser ? '#222' : color + '22') + ';cursor:pointer" onclick="'+(isUser?'':'showAgentDetail(\\''+agentId+'\\')')+'">' + emoji + '</div>' +
    '<div class="msg-body"><div class="msg-name" style="color:' + color + '">' + name + '</div>' +
    '<div class="msg-text">' + renderMd(text) + '</div>' +
    '<div class="msg-time">' + new Date().toLocaleTimeString() + '</div></div>';
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
};

// Override send to support DM mode
const _origSend = send;
send = async function() {
  if (dmMode) return sendDM();
  return _origSend();
};

// ── Agent-to-Agent Conversation Button ──
async function agentConvo() {
  const topic = prompt('Topic for agent conversation:');
  if (!topic) return;
  const agentIds = prompt('Agents (comma-separated, e.g. alice,cipher,athena):', 'alice,cipher,athena');
  if (!agentIds) return;
  const rounds = parseInt(prompt('Rounds:', '2')) || 2;
  document.getElementById('sendBtn').disabled = true;
  addMessage('_system', 'System', '🔄', '#FF9800', 'Starting conversation: ' + topic);
  try {
    const res = await fetch('/api/conversation', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({agents: agentIds.split(',').map(s=>s.trim()), topic, rounds, channel: currentChannel})
    });
    const data = await res.json();
    for (const t of (data.transcript||[])) addMessage(t.id, t.name, t.emoji, t.color, t.reply);
  } catch(e) { addMessage('_system','System','⚠️','#F44336','Error: '+e.message); }
  document.getElementById('sendBtn').disabled = false;
}

// Init
loadFleet();
loadMessages();
setInterval(loadFleet, 30000);
setInterval(autoRefresh, 10000);
</script>
</body>
</html>`;

const WIDGET_JS = `// RoundTrip Chat Widget — embed on any BlackRoad site
// Usage: <script src="https://roundtrip.blackroad.io/widget.js"><\/script>
(function() {
  var RT = 'https://roundtrip.blackroad.io';
  var s = document.createElement('style');
  s.textContent = '#rt-btn{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#FF1D6C;color:white;border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 12px rgba(255,29,108,0.4);z-index:9999;transition:transform .2s}#rt-btn:hover{transform:scale(1.1)}#rt-panel{position:fixed;bottom:86px;right:20px;width:380px;height:520px;max-width:calc(100vw - 40px);max-height:calc(100vh - 100px);background:#0a0a0a;border:1px solid #222;border-radius:12px;overflow:hidden;z-index:9998;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.5)}#rt-panel.open{display:flex}#rt-hdr{padding:12px 16px;background:#111;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between}#rt-hdr span{color:#FF1D6C;font-weight:600;font-size:14px}#rt-x{background:none;border:none;color:#666;font-size:18px;cursor:pointer}#rt-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.rt-m{display:flex;gap:8px;font-size:13px}.rt-a{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}.rt-b{flex:1;min-width:0}.rt-n{font-size:11px;font-weight:600;margin-bottom:2px}.rt-t{color:#ddd;word-break:break-word;line-height:1.4}#rt-inp{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #222;background:#111}#rt-inp input{flex:1;min-width:0;background:#1a1a1a;border:1px solid #333;color:#e0e0e0;padding:8px 12px;border-radius:6px;font-size:14px;outline:none}#rt-inp input:focus{border-color:#FF1D6C}#rt-inp button{background:#FF1D6C;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px}@media(max-width:480px){#rt-panel{bottom:76px;right:10px;left:10px;width:auto}}';
  document.head.appendChild(s);
  var b=document.createElement('button');b.id='rt-btn';b.innerHTML='\\uD83D\\uDCAC';b.title='Chat with BlackRoad agents';document.body.appendChild(b);
  var p=document.createElement('div');p.id='rt-panel';p.innerHTML='<div id="rt-hdr"><span>RoundTrip \\u2014 62 agents</span><button id="rt-x">\\u2715</button></div><div id="rt-msgs"></div><div id="rt-inp"><input type="text" placeholder="Message the agents..." id="rt-i"><button id="rt-s">Send</button></div>';document.body.appendChild(p);
  var ms=p.querySelector('#rt-msgs');
  function am(n,e,c,t,u){var d=document.createElement('div');d.className='rt-m';d.innerHTML='<div class="rt-a" style="background:'+(u?'#222':c+'22')+'">'+e+'</div><div class="rt-b"><div class="rt-n" style="color:'+c+'">'+n+'</div><div class="rt-t">'+t.replace(/</g,'&lt;')+'</div></div>';ms.appendChild(d);ms.scrollTop=ms.scrollHeight}
  async function sd(){var i=p.querySelector('#rt-i'),m=i.value.trim();if(!m)return;i.value='';am('You','\\uD83D\\uDCAC','#FFF',m,1);try{var r=await fetch(RT+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agent:'road',message:m,channel:'general'})});var d=await r.json();am(d.name||'Agent','\\uD83D\\uDEE3\\uFE0F','#FF1D6C',d.reply,0)}catch(e){am('System','\\u26A0\\uFE0F','#F44336','Connection error',0)}}
  b.onclick=function(){p.classList.toggle('open')};p.querySelector('#rt-x').onclick=function(){p.classList.remove('open')};p.querySelector('#rt-s').onclick=sd;p.querySelector('#rt-i').onkeydown=function(e){if(e.key==='Enter')sd()};
  b.addEventListener('click',async function(){if(ms.children.length>0)return;try{var r=await fetch(RT+'/api/messages?channel=general&limit=5');var d=await r.json();for(var i=0;i<d.length;i++)am(d[i].name,d[i].emoji,d[i].color,d[i].text,d[i].agent_id==='_user')}catch(e){}},{once:true});
})();`;
