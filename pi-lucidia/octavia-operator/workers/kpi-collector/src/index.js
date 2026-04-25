/**
 * BlackRoad KPI Collector Worker
 *
 * Real-time metrics ingestion endpoint. Receives KPI data from all
 * BlackRoad services, repos, agents, and infrastructure. Stores in
 * Durable Objects for instant retrieval and Analytics Engine for
 * time-series queries.
 *
 * Endpoints:
 *   POST /ingest          — push one or more metric data points
 *   POST /ingest/batch    — push a batch of metrics (up to 1000)
 *   GET  /metrics         — latest snapshot of all metrics
 *   GET  /metrics/:domain — metrics for a specific domain
 *   GET  /stream          — SSE stream of live metrics
 *   GET  /health          — health check
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-KPI-Source',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── Durable Object: KpiStore ───────────────────────────────────────────────

export class KpiStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.metrics = new Map();
    this.subscribers = new Set();
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get('metrics');
      if (stored) this.metrics = new Map(Object.entries(stored));
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'POST' && path === '/ingest') {
      return this.handleIngest(request);
    }
    if (request.method === 'GET' && path === '/metrics') {
      return this.handleGetMetrics(url);
    }
    if (request.method === 'GET' && path === '/stream') {
      return this.handleStream(request);
    }

    return json({ error: 'not found' }, 404);
  }

  async handleIngest(request) {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400); }

    const points = Array.isArray(body) ? body : [body];
    const now = Date.now();
    let ingested = 0;

    for (const point of points) {
      if (!point.domain || !point.metric) continue;

      const key = `${point.domain}:${point.metric}`;
      const entry = {
        domain: point.domain,
        metric: point.metric,
        value: point.value ?? 0,
        unit: point.unit || '',
        tags: point.tags || {},
        source: point.source || 'unknown',
        ts: point.ts || now,
        updated_at: now,
      };

      this.metrics.set(key, entry);
      ingested++;

      // Write to Analytics Engine if available
      if (this.env.KPI_ANALYTICS) {
        this.env.KPI_ANALYTICS.writeDataPoint({
          blobs: [point.domain, point.metric, point.source || 'unknown'],
          doubles: [typeof point.value === 'number' ? point.value : 0],
          indexes: [key],
        });
      }
    }

    // Persist to durable storage
    await this.state.storage.put('metrics', Object.fromEntries(this.metrics));

    // Notify SSE subscribers
    const snapshot = JSON.stringify({ type: 'update', ts: now, count: ingested });
    for (const sub of this.subscribers) {
      try { sub.send(snapshot); } catch { this.subscribers.delete(sub); }
    }

    return json({ ok: true, ingested, total: this.metrics.size, ts: now });
  }

  handleGetMetrics(url) {
    const domain = url.searchParams.get('domain');
    const entries = [...this.metrics.values()];
    const filtered = domain ? entries.filter(m => m.domain === domain) : entries;

    return json({
      ok: true,
      count: filtered.length,
      ts: Date.now(),
      metrics: filtered,
    });
  }

  handleStream(request) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sub = {
      send: (data) => {
        writer.write(encoder.encode(`data: ${data}\n\n`));
      },
    };

    this.subscribers.add(sub);

    // Send initial snapshot
    const snapshot = JSON.stringify({
      type: 'snapshot',
      ts: Date.now(),
      metrics: [...this.metrics.values()],
    });
    sub.send(snapshot);

    // Clean up on disconnect
    request.signal?.addEventListener('abort', () => {
      this.subscribers.delete(sub);
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
}

// ─── Worker fetch handler ───────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Health check
    if (path === '/health') {
      return json({
        ok: true,
        service: 'blackroad-kpi-collector',
        ts: new Date().toISOString(),
        features: ['ingest', 'batch', 'stream', 'analytics'],
      });
    }

    // Route to Durable Object
    const id = env.KPI_STORE.idFromName('global');
    const stub = env.KPI_STORE.get(id);

    if (request.method === 'POST' && (path === '/ingest' || path === '/ingest/batch')) {
      return stub.fetch(new Request('https://kpi/ingest', {
        method: 'POST',
        body: request.body,
        headers: request.headers,
      }));
    }

    if (request.method === 'GET' && path.startsWith('/metrics')) {
      const domain = path.split('/metrics/')[1];
      const targetUrl = domain
        ? `https://kpi/metrics?domain=${encodeURIComponent(domain)}`
        : `https://kpi/metrics`;
      return stub.fetch(new Request(targetUrl));
    }

    if (request.method === 'GET' && path === '/stream') {
      return stub.fetch(new Request('https://kpi/stream', { headers: request.headers, signal: request.signal }));
    }

    return json({
      service: 'blackroad-kpi-collector',
      endpoints: [
        'POST /ingest',
        'POST /ingest/batch',
        'GET  /metrics',
        'GET  /metrics/:domain',
        'GET  /stream',
        'GET  /health',
      ],
    });
  },
};
