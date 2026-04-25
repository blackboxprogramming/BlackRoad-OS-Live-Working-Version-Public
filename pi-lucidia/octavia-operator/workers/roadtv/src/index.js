/**
 * Road TV API — Cloudflare Worker
 *
 * Endpoints:
 *   GET    /videos              — List all videos
 *   GET    /videos/:id          — Get video metadata + notes
 *   POST   /videos              — Create video metadata
 *   POST   /videos/:id/notes    — Add a note to a video
 *   PUT    /videos/:id/upload   — Upload video file to R2
 *   GET    /videos/:id/stream   — Stream video from R2
 *
 * Storage: D1 (metadata) + R2 (video files)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // GET /videos — list videos
    if (request.method === 'GET' && path === '/videos') {
      const category = url.searchParams.get('category');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      let query = 'SELECT * FROM videos WHERE status = ?';
      const params = ['published'];
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);
      const { results } = await env.DB.prepare(query).bind(...params).all();
      return json({ videos: results });
    }

    // GET /videos/:id — single video with notes
    const videoMatch = path.match(/^\/videos\/([^/]+)$/);
    if (request.method === 'GET' && videoMatch && !path.includes('/notes') && !path.includes('/stream') && !path.includes('/upload')) {
      const id = decodeURIComponent(videoMatch[1]);
      const video = await env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first();
      if (!video) return json({ error: 'Video not found' }, 404);

      const { results: notes } = await env.DB.prepare(
        'SELECT * FROM video_notes WHERE video_id = ? ORDER BY created_at DESC'
      ).bind(id).all();

      const { results: appearances } = await env.DB.prepare(
        'SELECT page_id FROM video_appearances WHERE video_id = ?'
      ).bind(id).all();

      return json({ video, notes, appearances: appearances.map((a) => a.page_id) });
    }

    // POST /videos — create video metadata
    if (request.method === 'POST' && path === '/videos') {
      const body = await request.json();
      const { id, title, description, author, duration, category, tags } = body;

      if (!id || !title || !author) {
        return json({ error: 'id, title, and author are required' }, 400);
      }

      await env.DB.prepare(
        'INSERT INTO videos (id, title, description, author, duration, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, title, description || null, author, duration || null, category || null, tags || null).run();

      return json({ ok: true, id }, 201);
    }

    // POST /videos/:id/notes — add a note
    const notesMatch = path.match(/^\/videos\/([^/]+)\/notes$/);
    if (request.method === 'POST' && notesMatch) {
      const videoId = decodeURIComponent(notesMatch[1]);
      const body = await request.json();
      const { author, content } = body;

      if (!author || !content) {
        return json({ error: 'author and content are required' }, 400);
      }

      await env.DB.prepare(
        'INSERT INTO video_notes (video_id, author, content) VALUES (?, ?, ?)'
      ).bind(videoId, author, content).run();

      return json({ ok: true }, 201);
    }

    // PUT /videos/:id/upload — upload video to R2
    const uploadMatch = path.match(/^\/videos\/([^/]+)\/upload$/);
    if (request.method === 'PUT' && uploadMatch) {
      const id = decodeURIComponent(uploadMatch[1]);
      const contentType = request.headers.get('Content-Type') || 'video/mp4';
      const r2Key = `videos/${id}`;

      await env.VIDEOS.put(r2Key, request.body, {
        httpMetadata: { contentType },
      });

      // Update R2 key in DB
      await env.DB.prepare(
        'UPDATE videos SET r2_key = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(r2Key, id).run();

      return json({ ok: true, r2_key: r2Key }, 201);
    }

    // GET /videos/:id/stream — stream from R2
    const streamMatch = path.match(/^\/videos\/([^/]+)\/stream$/);
    if (request.method === 'GET' && streamMatch) {
      const id = decodeURIComponent(streamMatch[1]);
      const video = await env.DB.prepare('SELECT r2_key FROM videos WHERE id = ?').bind(id).first();
      if (!video || !video.r2_key) return json({ error: 'Video file not found' }, 404);

      const object = await env.VIDEOS.get(video.r2_key);
      if (!object) return json({ error: 'File not in storage' }, 404);

      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType || 'video/mp4',
          'Cache-Control': 'public, max-age=86400',
          ...CORS,
        },
      });
    }

    // GET / — service info
    if (path === '/' || path === '') {
      return json({
        service: 'blackroad-roadtv',
        version: env.VERSION,
        endpoints: [
          'GET    /videos',
          'GET    /videos/:id',
          'POST   /videos',
          'POST   /videos/:id/notes',
          'PUT    /videos/:id/upload',
          'GET    /videos/:id/stream',
        ],
      });
    }

    return json({ error: 'Not found' }, 404);
  },
};
