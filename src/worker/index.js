/**
 * BlackRoad OS Shell - Cloudflare Worker Entry Point
 * Routes traffic to shell, manages sessions, proxies D1/KV requests
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // Extract workspace context from subdomain
    const workspaceContext = extractWorkspaceFromHost(hostname);
    
    // Route based on path and method
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, url, env, workspaceContext);
    }
    
    if (url.pathname.startsWith('/session')) {
      return handleSession(request, url, env);
    }
    
    if (url.pathname.startsWith('/analytics')) {
      return handleAnalytics(request, url, env);
    }
    
    // Default: serve shell with workspace context injected
    return handleShell(request, url, env, workspaceContext);
  },
};

/**
 * Extract workspace from subdomain
 * roadtrip.blackroad.io -> { workspace: 'roadtrip', role: 'executive' }
 */
function extractWorkspaceFromHost(hostname) {
  const parts = hostname.split('.');
  
  const workspaceMap = {
    roadtrip: { name: 'roadtrip', title: 'RoadTrip (Executive)', role: 'executive' },
    roadcode: { name: 'roadcode', title: 'RoadCode (Build)', role: 'builder' },
    roadwork: { name: 'roadwork', title: 'RoadWork (Execution)', role: 'executor' },
    roadview: { name: 'roadview', title: 'RoadView (Research)', role: 'analyst' },
    docs: { name: 'docs', title: 'Docs (Knowledge)', role: 'knowledge' },
    status: { name: 'status', title: 'Status (Health)', role: 'operator' },
    agents: { name: 'agents', title: 'Agents (Roster)', role: 'roster' },
    search: { name: 'search', title: 'Search (Discovery)', role: 'discovery' },
    atlas: { name: 'atlas', title: 'Atlas (Topology)', role: 'infrastructure' },
    carpool: { name: 'carpool', title: 'CarPool (Projects)', role: 'project' },
  };
  
  if (parts.length >= 3 && workspaceMap[parts[0]]) {
    return workspaceMap[parts[0]];
  }
  
  // Root domain: default context
  return { name: 'default', title: 'BlackRoad OS Shell', role: 'operator' };
}

/**
 * Handle /api/* requests - database and KV operations
 */
async function handleAPI(request, url, env, workspaceContext) {
  const path = url.pathname;
  
  // /api/memory/* - read/write memory entries
  if (path.startsWith('/api/memory/')) {
    return handleMemoryAPI(request, url, env);
  }
  
  // /api/codex/* - read/write codex entries
  if (path.startsWith('/api/codex/')) {
    return handleCodexAPI(request, url, env);
  }
  
  // /api/products/* - list products from D1
  if (path.startsWith('/api/products')) {
    return handleProductsAPI(request, url, env);
  }
  
  // /api/todos/* - get/update todos
  if (path.startsWith('/api/todos')) {
    return handleTodosAPI(request, url, env);
  }
  
  // /api/analytics/* - log events to Analytics Engine
  if (path.startsWith('/api/analytics')) {
    return handleAnalyticsAPI(request, url, env, workspaceContext);
  }
  
  return jsonResponse({ error: 'Not found' }, 404);
}

/**
 * Handle memory API - store/retrieve collaboration surfaces
 */
async function handleMemoryAPI(request, url, env) {
  const id = url.pathname.replace('/api/memory/', '');
  
  if (request.method === 'GET') {
    // Retrieve from KV
    const cached = await env.MEMORY.get(id);
    if (cached) {
      return jsonResponse(JSON.parse(cached));
    }
    
    // Fallback to D1
    const stmt = env.BLACKROAD_DB.prepare(
      'SELECT * FROM memory_entries WHERE id = ?'
    );
    const result = await stmt.bind(id).first();
    
    if (result) {
      await env.MEMORY.put(id, JSON.stringify(result), { expirationTtl: 86400 });
      return jsonResponse(result);
    }
    
    return jsonResponse({ error: 'Not found' }, 404);
  }
  
  if (request.method === 'POST') {
    const data = await request.json();
    
    // Write to D1
    const stmt = env.BLACKROAD_DB.prepare(
      'INSERT OR REPLACE INTO memory_entries (id, content, created_at) VALUES (?, ?, ?)'
    );
    await stmt.bind(id, JSON.stringify(data), new Date().toISOString()).run();
    
    // Cache in KV
    await env.MEMORY.put(id, JSON.stringify(data), { expirationTtl: 86400 });
    
    return jsonResponse({ success: true, id });
  }
  
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Handle codex API
 */
async function handleCodexAPI(request, url, env) {
  // Similar to memory but stores semantic documentation
  return jsonResponse({ message: 'Codex API - coming soon' });
}

/**
 * Handle products API
 */
async function handleProductsAPI(request, url, env) {
  if (request.method === 'GET') {
    const cached = await env.CACHE.get('products:list');
    if (cached) {
      return jsonResponse(JSON.parse(cached));
    }
    
    const stmt = env.BLACKROAD_DB.prepare('SELECT * FROM products LIMIT 100');
    const results = await stmt.all();
    
    await env.CACHE.put('products:list', JSON.stringify(results), { expirationTtl: 300 });
    return jsonResponse(results);
  }
  
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Handle todos API
 */
async function handleTodosAPI(request, url, env) {
  return jsonResponse({ message: 'Todos API - coming soon' });
}

/**
 * Handle Analytics Engine submissions
 */
async function handleAnalyticsAPI(request, url, env, workspaceContext) {
  if (request.method === 'POST') {
    const event = await request.json();
    
    // Log to Analytics Engine
    env.ANALYTICS.writeDataPoint({
      indexes: [workspaceContext.name, event.type],
      blobs: [JSON.stringify({
        ...event,
        workspace: workspaceContext.name,
        timestamp: new Date().toISOString(),
      })],
    });
    
    return jsonResponse({ success: true });
  }
  
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Handle /session requests
 */
async function handleSession(request, url, env) {
  const sessionId = url.searchParams.get('id') || generateId();
  
  if (request.method === 'GET') {
    const session = await env.SESSIONS.get(sessionId);
    if (session) {
      return jsonResponse(JSON.parse(session));
    }
    return jsonResponse({ id: sessionId, created: new Date().toISOString() });
  }
  
  if (request.method === 'POST') {
    const data = await request.json();
    await env.SESSIONS.put(sessionId, JSON.stringify(data), { expirationTtl: 86400 });
    return jsonResponse({ success: true, id: sessionId });
  }
  
  return jsonResponse({ error: 'Method not allowed' }, 405);
}

/**
 * Handle /analytics requests
 */
async function handleAnalytics(request, url, env) {
  return jsonResponse({ message: 'Analytics dashboard - coming soon' });
}

/**
 * Serve shell with workspace context injected
 */
async function handleShell(request, url, env, workspaceContext) {
  // For now, return HTML that includes workspace context
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${workspaceContext.title}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        window.WORKSPACE_CONTEXT = ${JSON.stringify(workspaceContext)};
      </script>
    </head>
    <body>
      <div id="app">Loading BlackRoad OS...</div>
      <script src="/shell.js"></script>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Utility functions
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function generateId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9);
}
