import { getCurrentUser, hashPassword, jsonResponse } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const { password } = await request.json();
    if (!password || password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
    }

    const passwordHash = await hashPassword(password);
    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(passwordHash, user.id).run();

    return jsonResponse({ success: true });
  } catch (e) {
    console.error('Password update error:', e);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}
