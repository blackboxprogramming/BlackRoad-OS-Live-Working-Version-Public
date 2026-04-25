// BlackRoad Service Mesh — Inter-service auth, discovery, event bus
// Shared between chat.blackroad.io, roundtrip.blackroad.io, and future services

// Service registry — all BlackRoad services and their endpoints
const SERVICES = {
  chat:      { url: 'https://chat.blackroad.io',      name: 'Chat',      desc: 'AI Chat + Pipelines + MoA' },
  roundtrip: { url: 'https://roundtrip.blackroad.io', name: 'RoundTrip', desc: '35 Agent Hub + Deploy Orchestration' },
  roadcode:  { url: 'https://git.blackroad.io',       name: 'RoadCode',  desc: 'Gitea (239 repos)' },
  search:    { url: 'https://search.blackroad.io',    name: 'RoadSearch', desc: 'FTS5 Search' },
  auth:      { url: 'https://auth.blackroad.io',      name: 'Auth',      desc: 'JWT Auth (42 users)' },
  dispatch:  { url: 'http://192.168.4.49:8095',       name: 'Dispatch',  desc: 'Async Job Queue (Alice)' },
  ollama:    { url: 'https://ollama.gematria.blackroad.io', name: 'Ollama', desc: 'AI Inference' },
  prism:     { url: 'https://prism.blackroad.io',     name: 'Prism',     desc: 'Fleet Status' },
};

// HMAC signing for service-to-service requests
async function signRequest(secret, method, path, body, timestamp) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const payload = `${method}\n${path}\n${timestamp}\n${body || ''}`;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyRequest(secret, request) {
  const sig = request.headers.get('X-Mesh-Signature');
  const ts = request.headers.get('X-Mesh-Timestamp');
  const sender = request.headers.get('X-Mesh-Service');
  if (!sig || !ts || !sender) return { valid: false, reason: 'missing mesh headers' };

  // Reject requests older than 5 minutes (replay protection)
  const age = Date.now() - parseInt(ts);
  if (isNaN(age) || age > 300000 || age < -30000) return { valid: false, reason: 'timestamp expired' };

  const body = request.method === 'GET' ? '' : await request.clone().text();
  const url = new URL(request.url);
  const expected = await signRequest(secret, request.method, url.pathname, body, ts);
  if (sig !== expected) return { valid: false, reason: 'invalid signature' };
  return { valid: true, sender };
}

// Send a signed request to another mesh service
async function meshFetch(secret, senderName, service, path, options = {}) {
  const svc = SERVICES[service];
  if (!svc) throw new Error(`Unknown service: ${service}`);

  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  const ts = Date.now().toString();
  const sig = await signRequest(secret, method, path, body, ts);

  const headers = {
    'Content-Type': 'application/json',
    'X-Mesh-Signature': sig,
    'X-Mesh-Timestamp': ts,
    'X-Mesh-Service': senderName,
    ...(options.headers || {}),
  };

  const url = svc.url + path;
  const res = await fetch(url, {
    method,
    headers,
    body: body || undefined,
    signal: AbortSignal.timeout(options.timeout || 10000),
  });
  return res;
}

// Health check a service (no auth needed, public endpoint)
async function checkService(service) {
  const svc = SERVICES[service];
  if (!svc) return { service, status: 'unknown', error: 'not in registry' };
  try {
    const res = await fetch(svc.url + '/api/health', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      return { service, name: svc.name, status: 'up', ...data };
    }
    return { service, name: svc.name, status: 'degraded', http: res.status };
  } catch (e) {
    return { service, name: svc.name, status: 'down', error: e.message };
  }
}

// Check all services in the mesh
async function meshStatus() {
  const checks = ['chat', 'roundtrip', 'roadcode', 'search', 'auth', 'ollama', 'prism'];
  const results = await Promise.allSettled(checks.map(s => checkService(s)));
  return {
    mesh: 'blackroad',
    checked_at: new Date().toISOString(),
    services: results.map((r, i) => r.status === 'fulfilled' ? r.value : { service: checks[i], status: 'error', error: r.reason?.message }),
  };
}

// Log mesh event to D1
async function logMeshEvent(db, event) {
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS mesh_events (
      id TEXT PRIMARY KEY, event_type TEXT, source TEXT, target TEXT,
      payload TEXT, status TEXT, created_at TEXT
    )`).run();
    await db.prepare(
      "INSERT INTO mesh_events (id, event_type, source, target, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
    ).bind(crypto.randomUUID(), event.type, event.source, event.target || 'broadcast', JSON.stringify(event.data || {}), event.status || 'sent').run();
  } catch {}
}

// Get recent mesh events from D1
async function getMeshEvents(db, limit = 50) {
  if (!db) return [];
  try {
    const r = await db.prepare('SELECT * FROM mesh_events ORDER BY created_at DESC LIMIT ?').bind(limit).all();
    return r.results || [];
  } catch { return []; }
}

export { SERVICES, signRequest, verifyRequest, meshFetch, checkService, meshStatus, logMeshEvent, getMeshEvents };
