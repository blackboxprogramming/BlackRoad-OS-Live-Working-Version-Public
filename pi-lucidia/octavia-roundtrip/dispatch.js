#!/usr/bin/env node
/**
 * BlackRoad Dispatch — DoorDash for ports
 *
 * Drop off a request, get a ticket, move on.
 * The driver (worker) delivers the response when it's ready.
 *
 * POST /dispatch → 202 Accepted + ticket_id (instant)
 * GET  /ticket/:id → result (poll) or 202 (still cooking)
 * GET  /tickets → list recent tickets
 * GET  /drivers → list active workers
 *
 * Port: 8095 on Alice
 */

const http = require('http');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DISPATCH_PORT || 8095;
const DB_DIR = path.join(process.env.HOME || '/home/pi', '.blackroad', 'dispatch');
const TICKETS_FILE = path.join(DB_DIR, 'tickets.json');
const MAX_TICKETS = 500;
const WORKER_CONCURRENCY = 3; // Max parallel deliveries

// Ensure dirs
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// In-memory ticket store (backed by JSON file)
let tickets = {};
try { tickets = JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf8')); } catch { tickets = {}; }

function saveTickets() {
  // Prune old tickets
  const ids = Object.keys(tickets);
  if (ids.length > MAX_TICKETS) {
    const sorted = ids.sort((a, b) => (tickets[a].created_at || '').localeCompare(tickets[b].created_at || ''));
    for (const id of sorted.slice(0, ids.length - MAX_TICKETS)) delete tickets[id];
  }
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets));
}

// Service registry — where to deliver each type of request
const SERVICES = {
  ollama:    { url: 'http://192.168.4.101:11434', timeout: 30000, desc: 'AI Inference (Octavia)' },
  chat:      { url: 'http://localhost:8094',       timeout: 15000, desc: 'RoundTrip Agent Chat' },
  fleet:     { url: 'https://prism.blackroad.io',  timeout: 5000,  desc: 'Fleet Status (Prism)' },
  gitea:     { url: 'http://192.168.4.101:3100',   timeout: 5000,  desc: 'Git (Octavia Gitea)' },
  search:    { url: 'https://search.blackroad.io', timeout: 5000,  desc: 'RoadSearch' },
  auth:      { url: 'https://auth.blackroad.io',   timeout: 3000,  desc: 'Auth Service' },
  task:      { url: 'http://localhost:8011',        timeout: 5000,  desc: 'Task Queue v2' },
  nats:      { url: 'http://192.168.4.101:8222',   timeout: 3000,  desc: 'NATS Monitoring' },
};

// Active workers (deliveries in flight)
let activeWorkers = 0;
const workerStats = { total: 0, completed: 0, failed: 0, avg_ms: 0, times: [] };

// ── Dispatch: accept a job, return ticket ──
function dispatch(service, method, path, body, headers) {
  const id = randomUUID().split('-')[0]; // Short ticket ID
  const ticket = {
    id,
    status: 'queued',      // queued → delivering → delivered | failed
    service,
    method: method || 'GET',
    path: path || '/',
    body: body || null,
    headers: headers || {},
    result: null,
    error: null,
    created_at: new Date().toISOString(),
    delivered_at: null,
    duration_ms: null,
  };
  tickets[id] = ticket;
  saveTickets();

  // Start delivery immediately if workers available
  if (activeWorkers < WORKER_CONCURRENCY) {
    deliver(id);
  } else {
    // Queue it — will be picked up when a worker frees up
    setTimeout(() => { if (tickets[id]?.status === 'queued') deliver(id); }, 100);
  }

  return id;
}

// ── Deliver: the driver goes and gets it ──
async function deliver(ticketId) {
  const ticket = tickets[ticketId];
  if (!ticket || ticket.status !== 'queued') return;

  const svc = SERVICES[ticket.service];
  if (!svc) {
    ticket.status = 'failed';
    ticket.error = `Unknown service: ${ticket.service}`;
    saveTickets();
    return;
  }

  ticket.status = 'delivering';
  activeWorkers++;
  workerStats.total++;
  const start = Date.now();

  try {
    const url = svc.url + ticket.path;
    const opts = {
      method: ticket.method,
      headers: { 'Content-Type': 'application/json', ...ticket.headers },
      signal: AbortSignal.timeout(svc.timeout),
    };
    if (ticket.body && ticket.method !== 'GET') {
      opts.body = typeof ticket.body === 'string' ? ticket.body : JSON.stringify(ticket.body);
    }

    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') || '';
    let result;
    if (contentType.includes('json')) {
      result = await res.json();
    } else {
      result = await res.text();
    }

    ticket.status = 'delivered';
    ticket.result = result;
    ticket.delivered_at = new Date().toISOString();
    ticket.duration_ms = Date.now() - start;
    workerStats.completed++;
  } catch (e) {
    ticket.status = 'failed';
    ticket.error = e.message;
    ticket.duration_ms = Date.now() - start;
    workerStats.failed++;
  }

  activeWorkers--;
  workerStats.times.push(ticket.duration_ms);
  if (workerStats.times.length > 100) workerStats.times = workerStats.times.slice(-50);
  workerStats.avg_ms = Math.round(workerStats.times.reduce((a, b) => a + b, 0) / workerStats.times.length);
  saveTickets();

  // Pick up next queued ticket
  const next = Object.values(tickets).find(t => t.status === 'queued');
  if (next) deliver(next.id);
}

// ── HTTP Server ──
function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body || null); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // ── POST /dispatch — Drop off a request ──
  if (p === '/dispatch' && req.method === 'POST') {
    const body = await parseBody(req);
    const { service, method, path, payload, headers } = body;
    if (!service) return json({ error: 'service required. Options: ' + Object.keys(SERVICES).join(', ') }, 400);
    if (!SERVICES[service]) return json({ error: `Unknown service. Options: ${Object.keys(SERVICES).join(', ')}` }, 400);

    const ticketId = dispatch(service, method || 'GET', path || '/', payload, headers);
    return json({
      ticket: ticketId,
      status: 'queued',
      message: `Dispatched to ${service}. Pick up at /ticket/${ticketId}`,
      eta: `~${Math.round(SERVICES[service].timeout / 1000)}s max`,
    }, 202);
  }

  // ── GET /ticket/:id — Check your order ──
  if (p.startsWith('/ticket/')) {
    const id = p.split('/')[2];
    const ticket = tickets[id];
    if (!ticket) return json({ error: 'Ticket not found' }, 404);

    if (ticket.status === 'delivered') {
      return json({
        ticket: id,
        status: 'delivered',
        result: ticket.result,
        duration_ms: ticket.duration_ms,
        service: ticket.service,
      });
    }
    if (ticket.status === 'failed') {
      return json({
        ticket: id,
        status: 'failed',
        error: ticket.error,
        duration_ms: ticket.duration_ms,
        service: ticket.service,
      });
    }
    // Still in progress
    return json({
      ticket: id,
      status: ticket.status,
      service: ticket.service,
      message: 'Still cooking... check back in a moment',
    }, 202);
  }

  // ── GET /tickets — Recent orders ──
  if (p === '/tickets') {
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const status = url.searchParams.get('status');
    let list = Object.values(tickets);
    if (status) list = list.filter(t => t.status === status);
    list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return json(list.slice(0, limit).map(t => ({
      ticket: t.id,
      status: t.status,
      service: t.service,
      path: t.path,
      duration_ms: t.duration_ms,
      created_at: t.created_at,
    })));
  }

  // ── GET /drivers — Worker stats ──
  if (p === '/drivers') {
    return json({
      active: activeWorkers,
      max_concurrency: WORKER_CONCURRENCY,
      total_deliveries: workerStats.total,
      completed: workerStats.completed,
      failed: workerStats.failed,
      avg_delivery_ms: workerStats.avg_ms,
    });
  }

  // ── GET /services — What's on the menu ──
  if (p === '/services') {
    return json(Object.entries(SERVICES).map(([id, s]) => ({
      id, url: s.url, timeout: s.timeout, desc: s.desc,
    })));
  }

  // ── Shortcut routes — dispatch common requests instantly ──

  // POST /ask — dispatch to RoundTrip chat
  if (p === '/ask' && req.method === 'POST') {
    const body = await parseBody(req);
    const id = dispatch('chat', 'POST', '/api/chat', body);
    return json({ ticket: id, status: 'queued', message: 'Agent is thinking...' }, 202);
  }

  // GET /fleet — dispatch fleet status
  if (p === '/fleet') {
    const id = dispatch('fleet', 'GET', '/api/fleet');
    return json({ ticket: id, status: 'queued' }, 202);
  }

  // POST /infer — dispatch Ollama inference
  if (p === '/infer' && req.method === 'POST') {
    const body = await parseBody(req);
    const id = dispatch('ollama', 'POST', '/api/chat', body);
    return json({ ticket: id, status: 'queued', message: 'Inference queued...' }, 202);
  }

  // GET /health
  if (p === '/health') {
    return json({
      status: 'alive',
      service: 'dispatch',
      version: '1.0.0',
      host: require('os').hostname(),
      active_workers: activeWorkers,
      total_tickets: Object.keys(tickets).length,
      queued: Object.values(tickets).filter(t => t.status === 'queued').length,
      delivering: Object.values(tickets).filter(t => t.status === 'delivering').length,
    });
  }

  // Landing
  return json({
    service: 'BlackRoad Dispatch',
    tagline: 'Drop it off. Get a ticket. Move on.',
    endpoints: {
      'POST /dispatch': 'Submit a job → 202 + ticket_id',
      'GET /ticket/:id': 'Check your order',
      'POST /ask': 'Quick: agent chat → ticket',
      'POST /infer': 'Quick: Ollama inference → ticket',
      'GET /fleet': 'Quick: fleet status → ticket',
      'GET /tickets': 'Recent orders',
      'GET /drivers': 'Worker stats',
      'GET /services': 'Available services',
    },
    services: Object.keys(SERVICES),
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 BlackRoad Dispatch running on http://0.0.0.0:${PORT}`);
  console.log(`   Drop it off. Get a ticket. Move on.`);
  console.log(`   Services: ${Object.keys(SERVICES).join(', ')}`);
  console.log(`   Workers: ${WORKER_CONCURRENCY} concurrent`);
});
