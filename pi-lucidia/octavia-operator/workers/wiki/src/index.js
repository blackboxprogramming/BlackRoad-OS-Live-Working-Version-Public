/**
 * BlackRoad Wiki API — Cloudflare Worker
 *
 * Endpoints:
 *   GET  /pages              — List all wiki pages
 *   GET  /pages/:id          — Get a single page with blocks
 *   POST /pages/:id/blocks   — Append a block (note, activity, edit)
 *   GET  /pages/:id/blocks   — Get blocks for a page
 *
 * Storage: D1 (blackroad-platform)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function hashBlock(content, prevHash, timestamp) {
  const raw = `${content}|${prevHash || 'genesis'}|${timestamp}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // GET /pages — list all pages
    if (request.method === 'GET' && path === '/pages') {
      const type = url.searchParams.get('type'); // 'agent' or 'human'
      let query = 'SELECT * FROM pages';
      const params = [];
      if (type) {
        query += ' WHERE type = ?';
        params.push(type);
      }
      query += ' ORDER BY name';
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json({ pages: results });
    }

    // GET /pages/:id — single page with skills + connections
    const pageMatch = path.match(/^\/pages\/(.+?)$/);
    if (request.method === 'GET' && pageMatch && !path.includes('/blocks')) {
      const id = decodeURIComponent(pageMatch[1]);
      const page = await env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
      if (!page) return json({ error: 'Page not found' }, 404);

      const { results: skills } = await env.DB.prepare(
        'SELECT skill, is_primary FROM page_skills WHERE page_id = ? ORDER BY is_primary DESC, skill'
      ).bind(id).all();

      const { results: connections } = await env.DB.prepare(
        'SELECT to_id, strength FROM page_connections WHERE from_id = ? ORDER BY strength DESC'
      ).bind(id).all();

      const { results: blocks } = await env.DB.prepare(
        'SELECT * FROM page_blocks WHERE page_id = ? ORDER BY created_at DESC LIMIT 20'
      ).bind(id).all();

      return json({ page, skills, connections, blocks });
    }

    // GET /pages/:id/blocks — get blocks
    const blocksMatch = path.match(/^\/pages\/(.+?)\/blocks$/);
    if (request.method === 'GET' && blocksMatch) {
      const id = decodeURIComponent(blocksMatch[1]);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const { results } = await env.DB.prepare(
        'SELECT * FROM page_blocks WHERE page_id = ? ORDER BY created_at DESC LIMIT ?'
      ).bind(id, limit).all();
      return json({ blocks: results });
    }

    // POST /pages/:id/blocks — append a block
    if (request.method === 'POST' && blocksMatch) {
      const id = decodeURIComponent(blocksMatch[1]);
      const body = await request.json();
      const { block_type, author, content } = body;

      if (!block_type || !author || !content) {
        return json({ error: 'block_type, author, and content are required' }, 400);
      }

      // Get the last block's hash for chain linking
      const lastBlock = await env.DB.prepare(
        'SELECT hash FROM page_blocks WHERE page_id = ? ORDER BY id DESC LIMIT 1'
      ).bind(id).first();

      const prevHash = lastBlock ? lastBlock.hash : null;
      const timestamp = new Date().toISOString();
      const hash = await hashBlock(content, prevHash, timestamp);

      await env.DB.prepare(
        'INSERT INTO page_blocks (page_id, prev_hash, hash, block_type, author, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, prevHash, hash, block_type, author, content, timestamp).run();

      // Update page timestamp
      await env.DB.prepare(
        'UPDATE pages SET updated_at = ? WHERE id = ?'
      ).bind(timestamp, id).run();

      return json({ ok: true, hash, prev_hash: prevHash }, 201);
    }

    // GET / — service info
    if (path === '/' || path === '') {
      return json({
        service: 'blackroad-wiki',
        version: env.VERSION,
        endpoints: [
          'GET  /pages',
          'GET  /pages/:id',
          'GET  /pages/:id/blocks',
          'POST /pages/:id/blocks',
        ],
      });
    }

    return json({ error: 'Not found' }, 404);
  },
};
