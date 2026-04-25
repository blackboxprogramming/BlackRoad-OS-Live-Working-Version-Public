import { getCurrentUser, jsonResponse } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  try {
    const user = await getCurrentUser(request, env);
    return jsonResponse({ user });
  } catch (e) {
    console.error('Me error:', e);
    return jsonResponse({ user: null }, 200);
  }
}
