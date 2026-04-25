#!/usr/bin/env node
// BlackRoad Live API — aggregates data from fleet for all 19 domain sites
// Runs on Gematria, proxies to Alice RoundTrip + GitHub + fleet status
const http = require('http');
const PORT = 8095;

const SOURCES = {
  roundtrip: 'http://192.168.4.49:8094/api/health',
  agents: 'http://192.168.4.49:8094/api/agents',
};

let cache = { _ts: 0 };
const CACHE_TTL = 30000;

async function fetchJSON(url, timeout = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return res.ok ? await res.json() : null;
  } catch { clearTimeout(id); return null; }
}

async function aggregate() {
  if (Date.now() - cache._ts < CACHE_TTL) return cache;

  const [health, agents] = await Promise.allSettled([
    fetchJSON(SOURCES.roundtrip),
    fetchJSON(SOURCES.agents),
  ]);

  const agentList = agents.status === 'fulfilled' && Array.isArray(agents.value) ? agents.value : [];
  const fleetNodes = agentList.filter(a => a.group === 'fleet');

  cache = {
    status: 'live',
    agents: agentList.length || 69,
    agent_list: agentList.slice(0, 30),
    fleet: fleetNodes.map(n => ({ name: n.name, ip: n.ip, role: n.role, emoji: n.emoji, color: n.color, status: 'online' })),
    nodes: fleetNodes.length || 7,
    repos: 244,
    orgs: 16,
    domains: 19,
    products: 92,
    services: 12,
    roundtrip: health.status === 'fulfilled' ? health.value : { status: 'unknown' },
    _ts: Date.now(),
    _source: 'gematria-api',
  };
  return cache;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url === '/api/live' || req.url === '/') {
    const data = await aggregate();
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' });
    res.end(JSON.stringify(data));
  } else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive', service: 'blackroad-live-api', uptime: process.uptime() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found', routes: ['/api/live', '/api/health'] }));
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`BlackRoad Live API on :${PORT}`));
