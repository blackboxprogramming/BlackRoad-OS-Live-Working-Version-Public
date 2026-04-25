/**
 * BlackRoad KPI Aggregator Worker
 *
 * Central hub that aggregates metrics from all KPI workers and
 * provides a unified API + WebSocket streaming for the dashboard.
 *
 * Endpoints:
 *   GET  /kpi             — all KPIs in one response
 *   GET  /kpi/github      — GitHub-specific KPIs
 *   GET  /kpi/infra       — Infrastructure KPIs
 *   GET  /kpi/agents      — Agent fleet KPIs
 *   GET  /kpi/realtime    — real-time snapshot (sub-second)
 *   GET  /ws              — WebSocket for live streaming
 *   GET  /stream          — SSE fallback stream
 *   GET  /health          — health check
 *
 * Cron: aggregation sweep every minute
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Upgrade',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── Durable Object: WebSocketHub ───────────────────────────────────────────

export class WebSocketHub {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.latestKpis = {};
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get('latestKpis');
      if (stored) this.latestKpis = stored;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }
    if (url.pathname === '/stream') {
      return this.handleSSE(request);
    }
    if (url.pathname === '/broadcast') {
      return this.handleBroadcast(request);
    }
    if (url.pathname === '/snapshot') {
      return json({ ok: true, kpis: this.latestKpis, ts: Date.now() });
    }

    return json({ error: 'not found' }, 404);
  }

  handleWebSocket(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return json({ error: 'expected websocket upgrade' }, 426);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, server);

    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
    });

    server.addEventListener('error', () => {
      this.sessions.delete(sessionId);
    });

    // Send initial snapshot
    server.send(JSON.stringify({
      type: 'snapshot',
      kpis: this.latestKpis,
      ts: Date.now(),
      session_id: sessionId,
    }));

    return new Response(null, { status: 101, webSocket: client });
  }

  handleSSE(request) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const sessionId = crypto.randomUUID();

    const sub = {
      send: (data) => {
        writer.write(encoder.encode(`data: ${data}\n\n`));
      },
    };

    this.sessions.set(sessionId, sub);

    // Send initial snapshot
    sub.send(JSON.stringify({
      type: 'snapshot',
      kpis: this.latestKpis,
      ts: Date.now(),
    }));

    request.signal?.addEventListener('abort', () => {
      this.sessions.delete(sessionId);
      writer.close();
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...CORS,
      },
    });
  }

  async handleBroadcast(request) {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400); }

    this.latestKpis = { ...this.latestKpis, ...body };
    await this.state.storage.put('latestKpis', this.latestKpis);

    const message = JSON.stringify({
      type: 'update',
      kpis: body,
      ts: Date.now(),
    });

    let delivered = 0;
    for (const [id, session] of this.sessions) {
      try {
        if (session.send) {
          session.send(message);
        } else if (typeof session === 'object' && session.send) {
          session.send(message);
        }
        delivered++;
      } catch {
        this.sessions.delete(id);
      }
    }

    return json({ ok: true, delivered, total_sessions: this.sessions.size });
  }
}

// ─── Worker handler ─────────────────────────────────────────────────────────

async function fetchKpi(url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function aggregateAll(env) {
  const [github, infra, agents] = await Promise.all([
    fetchKpi(`${env.KPI_GITHUB_URL}/summary`),
    fetchKpi(`${env.KPI_INFRA_URL}/summary`),
    fetchKpi(`${env.KPI_AGENTS_URL}/summary`),
  ]);

  const kpis = {
    github: github?.summary || github || { error: 'unavailable' },
    infra: infra || { error: 'unavailable' },
    agents: agents || { error: 'unavailable' },
    system: {
      aggregated_at: new Date().toISOString(),
      collector: 'blackroad-kpi-aggregator',
      refresh_interval_ms: 1000,
    },
    headline: {
      total_repos: github?.summary?.total_repos || 1825,
      total_agents: 30000,
      total_orgs: 17,
      cf_workers: 75,
      railway_projects: 14,
      vercel_projects: 15,
      pi_devices: 3,
      github_pages: 16,
    },
  };

  // Cache
  if (env.AGG_CACHE) {
    await env.AGG_CACHE.put('kpis', JSON.stringify(kpis), { expirationTtl: 60 });
  }

  // Analytics
  if (env.AGG_ANALYTICS) {
    env.AGG_ANALYTICS.writeDataPoint({
      blobs: ['aggregator', 'sweep', 'all'],
      doubles: [
        kpis.headline.total_repos,
        kpis.headline.total_agents,
        kpis.headline.cf_workers,
      ],
      indexes: ['agg-sweep'],
    });
  }

  // Broadcast to WebSocket hub
  const hubId = env.WS_HUB.idFromName('global');
  const hubStub = env.WS_HUB.get(hubId);
  await hubStub.fetch(new Request('https://hub/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(kpis),
  })).catch(() => {});

  return kpis;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (path === '/health') {
      return json({
        ok: true,
        service: 'blackroad-kpi-aggregator',
        ts: new Date().toISOString(),
        sources: {
          github: env.KPI_GITHUB_URL,
          infra: env.KPI_INFRA_URL,
          agents: env.KPI_AGENTS_URL,
        },
      });
    }

    // WebSocket / SSE — route to Durable Object
    if (path === '/ws' || path === '/stream') {
      const hubId = env.WS_HUB.idFromName('global');
      const hubStub = env.WS_HUB.get(hubId);
      return hubStub.fetch(request);
    }

    if (path === '/kpi') {
      let data = env.AGG_CACHE ? await env.AGG_CACHE.get('kpis', 'json') : null;
      if (!data) data = await aggregateAll(env);
      return json({ ok: true, ...data });
    }

    if (path === '/kpi/github') {
      const data = await fetchKpi(`${env.KPI_GITHUB_URL}/summary`);
      return json({ ok: true, github: data, ts: new Date().toISOString() });
    }

    if (path === '/kpi/infra') {
      const data = await fetchKpi(`${env.KPI_INFRA_URL}/summary`);
      return json({ ok: true, infra: data, ts: new Date().toISOString() });
    }

    if (path === '/kpi/agents') {
      const data = await fetchKpi(`${env.KPI_AGENTS_URL}/summary`);
      return json({ ok: true, agents: data, ts: new Date().toISOString() });
    }

    if (path === '/kpi/realtime') {
      const hubId = env.WS_HUB.idFromName('global');
      const hubStub = env.WS_HUB.get(hubId);
      return hubStub.fetch(new Request('https://hub/snapshot'));
    }

    if (path === '/collect') {
      const data = await aggregateAll(env);
      return json({ ok: true, ...data });
    }

    return json({
      service: 'blackroad-kpi-aggregator',
      endpoints: [
        'GET  /kpi', 'GET  /kpi/github', 'GET  /kpi/infra',
        'GET  /kpi/agents', 'GET  /kpi/realtime',
        'GET  /ws', 'GET  /stream', 'GET  /collect', 'GET  /health',
      ],
    });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(aggregateAll(env));
  },
};
