// RoundTrip Proxy Worker — routes all requests to Alice via direct fetch
// This is a thin proxy; Alice runs the full RoundTrip server

const ALICE_ROUNDTRIP = 'http://10.8.0.6:8094';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    
    // Try to proxy to Alice's self-hosted RoundTrip
    try {
      const proxyUrl = ALICE_ROUNDTRIP + path;
      const proxyReq = new Request(proxyUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? request.body : undefined,
        signal: AbortSignal.timeout(30000),
      });
      
      const res = await fetch(proxyReq);
      const body = await res.text();
      
      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Mesh-Signature, X-Mesh-Timestamp, X-Mesh-Service',
          'X-Served-By': 'BlackRoad RoundTrip Proxy → Alice',
        },
      });
    } catch (err) {
      // Alice unreachable — return cached agent list from KV or fallback
      if (path === '/api/health' || path === '/api/health/') {
        return Response.json({ status: 'degraded', service: 'roundtrip-proxy', error: 'Alice unreachable', agents: 69 }, { headers: { 'Access-Control-Allow-Origin': '*' } });
      }
      return Response.json({ error: 'RoundTrip backend unavailable', detail: err.message }, { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
  },
  
  async scheduled(event, env, ctx) {
    // Cron: check Alice health periodically
    try {
      const res = await fetch(ALICE_ROUNDTRIP + '/api/health', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        console.log(`RoundTrip health: ${data.agents} agents, status: ${data.status}`);
      }
    } catch (e) {
      console.log(`RoundTrip health check failed: ${e.message}`);
    }
  }
};
