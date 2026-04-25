import { parseCookies, jsonResponse } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const cookies = parseCookies(request.headers.get('cookie'));
    const sessionId = cookies['session'];
    
    if (sessionId) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
    }

    return jsonResponse({ success: true }, 200, {
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    });
  } catch (e) {
    console.error('Logout error:', e);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}
