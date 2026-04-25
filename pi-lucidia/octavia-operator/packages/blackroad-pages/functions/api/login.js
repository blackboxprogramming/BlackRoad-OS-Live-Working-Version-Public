import { verifyPassword, jsonResponse } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return jsonResponse({ error: 'Email and password required' }, 400);
    }

    // Find user
    const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE email = ?').bind(email).first();
    if (!user) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(sessionId, user.id, expiresAt).run();

    return jsonResponse({ success: true }, 200, {
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    });
  } catch (e) {
    console.error('Login error:', e);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}
