import { hashPassword, jsonResponse } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return jsonResponse({ error: 'All fields required' }, 400);
    }
    if (password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Check if user exists
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return jsonResponse({ error: 'Email already registered' }, 400);
    }

    // Create user
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    
    await env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', 0, datetime('now'), datetime('now'))
    `).bind(userId, email, passwordHash, name).run();

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(sessionId, userId, expiresAt).run();

    return jsonResponse({ success: true }, 200, {
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    });
  } catch (e) {
    console.error('Signup error:', e);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}
