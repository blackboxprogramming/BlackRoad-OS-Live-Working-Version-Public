import { getCurrentUser, jsonResponse } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const { name } = await request.json();
    if (!name) {
      return jsonResponse({ error: 'Name required' }, 400);
    }

    await env.DB.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .bind(name, user.id).run();

    return jsonResponse({ success: true });
  } catch (e) {
    console.error('Profile update error:', e);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}
