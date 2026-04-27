// ── BlackRoad Auth — Sovereign Authentication ──
// D1-backed, JWT sessions, password hashing via Web Crypto
// Zero third-party auth dependencies

// Secure token landing page — stores JWT in localStorage, never exposes in URL history
function tokenLandingHtml(jwt) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Signing in...</title>
<style>body{background:#000;color:#f5f5f5;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.c{text-align:center}.s{width:24px;height:24px;border:2px solid #333;border-top-color:#f5f5f5;border-radius:50%;animation:s .6s linear infinite;margin:0 auto 16px}
@keyframes s{to{transform:rotate(360deg)}}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head>
<body><div class="c"><div class="s"></div><p>Signing you in...</p></div>
<script>localStorage.setItem('br_token','${jwt}');window.location.replace('https://os.blackroad.io/app/');</script>
</body></html>`;
}

const CORS_HEADERS = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',');
  const o = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// ── Crypto helpers (Web Crypto API, no external deps) ──
async function hashPassword(password, salt) {
  salt = salt || crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `${saltB64}:${hash}`;
}

async function verifyPassword(password, stored) {
  const [saltB64] = stored.split(':');
  const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
  const result = await hashPassword(password, salt);
  return result === stored;
}

async function createJWT(payload, secret, expiresIn = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresIn, iss: 'blackroad.io' };

  const enc = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const bodyB64 = btoa(JSON.stringify(body)).replace(/=/g, '');
  const data = `${headerB64}.${bodyB64}`;

  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${sigB64}`;
}

async function verifyJWT(token, secret) {
  try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
    const [headerB64, bodyB64, sigB64] = token.split('.');
    const data = `${headerB64}.${bodyB64}`;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data));

    if (!valid) return null;

    const body = JSON.parse(atob(bodyB64));
    if (body.exp < Math.floor(Date.now() / 1000)) return null;

    return body;
  } catch {
    return null;
  }
}

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function decodeJwtPart(part) {
  const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

async function importClerkKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );
}

async function verifyClerkToken(token, env, origin = '') {
  if (!env.CLERK_SECRET_KEY) throw new Error('CLERK_SECRET_KEY not configured');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid Clerk token');

  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);
  if (header.alg !== 'RS256') throw new Error('Unexpected Clerk token algorithm');

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Clerk token expired');
  if (payload.nbf && payload.nbf > now) throw new Error('Clerk token not yet valid');

  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (payload.azp && allowedOrigins.length && !allowedOrigins.includes(payload.azp)) {
    throw new Error('Invalid Clerk azp claim');
  }
  if (!payload.sub) throw new Error('Missing Clerk subject');

  const jwksRes = await fetch('https://api.clerk.com/v1/jwks', {
    headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` },
  });
  if (!jwksRes.ok) throw new Error(`Unable to fetch Clerk JWKS (${jwksRes.status})`);
  const jwks = await jwksRes.json();
  const jwk = (jwks.keys || []).find(k => k.kid === header.kid);
  if (!jwk) throw new Error('Matching Clerk signing key not found');

  const key = await importClerkKey(jwk);
  const signedData = new TextEncoder().encode(parts[0] + '.' + parts[1]);
  const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, signedData);
  if (!valid) throw new Error('Invalid Clerk signature');

  return payload;
}

async function fetchClerkUser(clerkUserId, env) {
  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(clerkUserId)}`, {
    headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` },
  });
  if (!res.ok) throw new Error(`Unable to fetch Clerk user (${res.status})`);
  return await res.json();
}

function pickPrimaryEmail(clerkUser) {
  const primaryId = clerkUser.primary_email_address_id;
  const emails = clerkUser.email_addresses || [];
  const primary = emails.find(e => e.id === primaryId) || emails[0];
  return primary?.email_address || '';
}

async function upsertClerkUser(clerkUser, env) {
  const email = pickPrimaryEmail(clerkUser).toLowerCase();
  if (!email) throw new Error('Clerk user has no email address');

  const name = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ').trim()
    || clerkUser.username
    || email.split('@')[0];
  const metadata = JSON.stringify({
    provider: 'clerk',
    clerk_user_id: clerkUser.id,
    image_url: clerkUser.image_url || '',
  });

  let user = await env.DB.prepare(
    'SELECT id, email, name, plan, stripe_customer_id, created_at, last_login, metadata FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) {
    const id = generateId();
    const passwordHash = await hashPassword(crypto.randomUUID());
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash, metadata, last_login) VALUES (?, ?, ?, ?, ?, unixepoch())'
    ).bind(id, email, name, passwordHash, metadata).run();
    user = await env.DB.prepare(
      'SELECT id, email, name, plan, stripe_customer_id, created_at, last_login, metadata FROM users WHERE id = ?'
    ).bind(id).first();
  } else {
    await env.DB.prepare(
      'UPDATE users SET name = ?, metadata = ?, last_login = unixepoch(), updated_at = unixepoch() WHERE id = ?'
    ).bind(name, metadata, user.id).run();
    user = { ...user, name, metadata, last_login: Math.floor(Date.now() / 1000) };
  }

  return user;
}

// ── DB Schema ──
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'operator',
  stripe_customer_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  last_login INTEGER,
  metadata TEXT DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_resets_user ON password_resets(user_id);
CREATE TABLE IF NOT EXISTS usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  product TEXT DEFAULT 'auth',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage(user_id);
`;

// ── Rate limiting (in-memory per isolate, simple but effective) ──
const rateLimits = new Map();
function checkRateLimit(ip, limit = 10, windowSec = 60) {
  const now = Date.now();
  const key = ip;
  const entry = rateLimits.get(key);
  if (!entry || now - entry.start > windowSec * 1000) {
    rateLimits.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > limit) return false;
  return true;
}

async function safeJson(request) {
  try { return await request.json(); }
  catch { return null; }
}

// ── Route handlers ──
async function handleSignup(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip, 5, 60)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const { email, password, name } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (!email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Check if user exists
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 });
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, email.toLowerCase(), name || '', passwordHash).run();

  // Create session
  const token = await createJWT({ sub: id, email: email.toLowerCase(), name: name || '', plan: 'operator' }, env.JWT_SECRET);

  // Store session
  const sessionId = generateId();
  const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(tokenDigest), b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(sessionId, id, tokenHash, expiresAt, request.headers.get('cf-connecting-ip') || '', request.headers.get('user-agent') || '').run();

  // Notify RoadTrip about new signup (fire and forget)
  try {
    fetch('https://roadtrip-blackroad.blackroad.workers.dev/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'general', agent_id: 'alice', text: 'New user signed up: ' + (name || email.split('@')[0]) + ' (' + email.toLowerCase() + ')' }),
    }).catch(() => {});
  } catch {}

  return Response.json({
    user: { id, email: email.toLowerCase(), name: name || '', plan: 'operator' },
    token,
    expiresAt,
  });
}

async function handleSignin(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip, 10, 60)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, name, password_hash, plan, metadata FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Update last login
  await env.DB.prepare('UPDATE users SET last_login = unixepoch(), updated_at = unixepoch() WHERE id = ?').bind(user.id).run();

  // Create session
  const token = await createJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
  }, env.JWT_SECRET, 86400 * 30);

  const sessionId = generateId();
  const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(tokenDigest), b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 * 30;
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(sessionId, user.id, tokenHash, expiresAt, request.headers.get('cf-connecting-ip') || '', request.headers.get('user-agent') || '').run();

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    token,
    expiresAt,
  });
}

async function handleMe(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const token = auth.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const user = await env.DB.prepare(
    'SELECT id, email, name, plan, stripe_customer_id, created_at, last_login, metadata FROM users WHERE id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json({ user });
}

async function handleClerkConfig(env) {
  return Response.json({
    enabled: Boolean(env.CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY),
    publishableKey: env.CLERK_PUBLISHABLE_KEY || '',
  });
}

async function handleClerkExchange(request, env) {
  if (!env.CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) {
    return Response.json({ error: 'Clerk not configured' }, { status: 503 });
  }

  const auth = request.headers.get('Authorization');
  const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const body = await safeJson(request);
  const token = bearer || body?.token || '';
  if (!token) {
    return Response.json({ error: 'Clerk token required' }, { status: 400 });
  }

  const verified = await verifyClerkToken(token, env, request.headers.get('Origin') || '');
  const clerkUser = await fetchClerkUser(verified.sub, env);
  const user = await upsertClerkUser(clerkUser, env);
  const localToken = await createJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    provider: 'clerk',
    clerk_user_id: clerkUser.id,
  }, env.JWT_SECRET, 86400 * 30);

  return Response.json({
    user,
    token: localToken,
    provider: 'clerk',
    clerk: {
      userId: clerkUser.id,
      sessionId: verified.sid || null,
    },
    expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
  });
}

async function handleSignout(request, env) {
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (payload) {
      // Delete all sessions for this user
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(payload.sub).run();
    }
  }
  return Response.json({ ok: true });
}

async function handleUpdateUser(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await safeJson(request);
  if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  const updates = [];
  const values = [];

  // Only allow safe fields
  if (typeof body.name === 'string') { updates.push('name = ?'); values.push(body.name.slice(0, 200)); }
  if (body.metadata !== undefined) { updates.push('metadata = ?'); values.push(JSON.stringify(body.metadata).slice(0, 5000)); }

  if (body.password) {
    if (body.password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const hash = await hashPassword(body.password);
    updates.push('password_hash = ?');
    values.push(hash);
  }

  if (updates.length === 0) {
    return Response.json({ error: 'Nothing to update' }, { status: 400 });
  }

  updates.push('updated_at = unixepoch()');
  values.push(payload.sub);

  await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

  return Response.json({ ok: true });
}

// ── Usage Tracking ──
async function trackUsage(env, userId, action, product) {
  try { await env.DB.prepare('INSERT INTO usage (user_id, action, product) VALUES (?, ?, ?)').bind(userId, action, product || 'auth').run(); } catch {}
}

async function handleUsage(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });

  // POST — record usage from other products
  if (request.method === 'POST') {
    const body = await safeJson(request);
    if (body?.action) await trackUsage(env, payload.sub, body.action, body.product);
    return Response.json({ ok: true });
  }

  // GET — return usage stats
  const total = await env.DB.prepare('SELECT COUNT(*) as c FROM usage WHERE user_id = ?').bind(payload.sub).first();
  const byProduct = await env.DB.prepare('SELECT product, COUNT(*) as c FROM usage WHERE user_id = ? GROUP BY product ORDER BY c DESC').bind(payload.sub).all();
  const recent = await env.DB.prepare('SELECT action, product, created_at FROM usage WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(payload.sub).all();
  return Response.json({ total: total?.c || 0, by_product: byProduct.results || [], recent: recent.results || [] });
}

async function handleStats(env) {
  const users = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  const sessions = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > unixepoch()').first();
  return Response.json({
    users: users?.count || 0,
    active_sessions: sessions?.count || 0,
    status: 'up',
  });
}

// ── Password Reset ──
async function handleForgotPassword(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(ip, 3, 60)) return Response.json({ error: 'Too many requests' }, { status: 429 });
  const body = await safeJson(request);
  if (!body?.email) return Response.json({ error: 'Email required' }, { status: 400 });
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email.toLowerCase()).first();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  if (user) {
    await env.DB.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').bind(user.id).run();
    const id = generateId();
    const expiresAt = Math.floor(Date.now() / 1000) + 900;
    await env.DB.prepare('INSERT INTO password_resets (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)').bind(id, user.id, code, expiresAt).run();
  }
  return Response.json({ ok: true, message: 'If that email exists, a reset code has been generated' });
}

async function handleResetPassword(request, env) {
  const body = await safeJson(request);
  if (!body?.email || !body?.code || !body?.new_password) return Response.json({ error: 'email, code, and new_password required' }, { status: 400 });
  if (body.new_password.length < 8) return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email.toLowerCase()).first();
  if (!user) return Response.json({ error: 'Invalid code' }, { status: 400 });
  const reset = await env.DB.prepare('SELECT * FROM password_resets WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > unixepoch()').bind(user.id, body.code).first();
  if (!reset) return Response.json({ error: 'Invalid or expired code' }, { status: 400 });
  const hash = await hashPassword(body.new_password);
  await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?').bind(hash, user.id).run();
  await env.DB.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(reset.id).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();
  return Response.json({ ok: true });
}

// ── Session Management ──
async function handleListSessions(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });
  const { results } = await env.DB.prepare('SELECT id, ip, user_agent, created_at, expires_at FROM sessions WHERE user_id = ? AND expires_at > unixepoch() ORDER BY created_at DESC').bind(payload.sub).all();
  const tokenDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(auth.slice(7)));
  const currentHash = Array.from(new Uint8Array(tokenDigest), b => b.toString(16).padStart(2, '0')).join('');
  return Response.json({ sessions: results || [] });
}

async function handleDeleteSession(request, env, sessionId) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });
  await env.DB.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').bind(sessionId, payload.sub).run();
  return Response.json({ ok: true, deleted: sessionId });
}

// ── JWT Verify (for other workers) ──
async function handleVerify(request, env) {
  let token = null;
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) token = auth.slice(7);
  if (!token && request.method === 'POST') {
    const body = await safeJson(request);
    token = body?.token;
  }
  if (!token) return Response.json({ valid: false, error: 'No token provided' });
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return Response.json({ valid: false });
  const user = await env.DB.prepare('SELECT id, email, name, plan FROM users WHERE id = ?').bind(payload.sub).first();
  return Response.json({ valid: true, user: user || payload });
}

// ── Account Deletion ──
async function handleDeleteAccount(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  const payload = await verifyJWT(auth.slice(7), env.JWT_SECRET);
  if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });
  await env.DB.prepare('DELETE FROM password_resets WHERE user_id = ?').bind(payload.sub).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(payload.sub).run();
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(payload.sub).run();
  return Response.json({ ok: true, deleted: true });
}

// ── HTML Login/Signup Page ──
function renderAuthPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In - BlackRoad OS</title>
<link rel="icon" type="image/x-icon" href="https://images.blackroad.io/brand/favicon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="https://images.blackroad.io/brand/br-square-192.png" />
<link rel="apple-touch-icon" sizes="180x180" href="https://images.blackroad.io/brand/apple-touch-icon.png" />
<meta property="og:image" content="https://images.blackroad.io/brand/blackroad-icon-512.png" />
<meta property="og:title" content="Sign In - BlackRoad OS" />
<meta property="og:description" content="Sovereign authentication. Your identity, your keys, your data." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --g:linear-gradient(135deg,#F5A623 0%,#FF1D6C 38.2%,#9C27B0 61.8%,#2979FF 100%);
  --bg:#000;--card:#0a0a0a;--border:#1a1a1a;--text:#f5f5f5;--muted:#737373;--dim:#999;
  --sg:'-apple-system','SF Pro Display','Segoe UI',sans-serif;--jb:'JetBrains Mono',monospace;
}
html{height:100%}
body{font-family:var(--sg);background:var(--bg);color:var(--text);min-height:100%;display:flex;align-items:center;justify-content:center;-webkit-font-smoothing:antialiased;overflow:hidden}
canvas#bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
.wrap{position:relative;z-index:1;width:420px;max-width:92vw}
.logo{text-align:center;margin-bottom:32px}
.logo span{font-size:28px;font-weight:700;color:#fff}
.logo p{color:var(--muted);font-size:13px;margin-top:6px}
.card{padding:40px 36px;border-radius:10px;border:1px solid #1a1a1a;background:var(--card)}
.tabs{display:flex;gap:0;margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.tab{flex:1;padding:10px;text-align:center;font-size:14px;font-weight:600;cursor:pointer;background:transparent;color:var(--muted);transition:all 0.3s;border:none;font-family:var(--sg)}
.tab.active{background:rgba(255,255,255,0.06);color:#fff}
.tab:hover:not(.active){color:var(--dim)}
.field{margin-bottom:16px}
.field label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px}
.field input{width:100%;padding:12px 16px;border-radius:6px;border:1px solid var(--border);background:rgba(255,255,255,0.03);color:#fff;font-family:var(--jb);font-size:14px;outline:none;transition:border-color 0.3s}
.field input:focus{border-color:#333}
.field input::placeholder{color:rgba(255,255,255,0.2)}
.name-field{display:none}
.signup-mode .name-field{display:block}
.submit-btn{width:100%;margin-top:24px;padding:14px;border:none;border-radius:6px;background:#fff;color:#000;font-family:var(--sg);font-size:15px;font-weight:700;cursor:pointer;transition:opacity 0.3s,transform 0.2s}
.submit-btn:hover{opacity:0.9;transform:translateY(-1px)}
.submit-btn:active{transform:translateY(0)}
.submit-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.error-msg{color:#fff;font-size:13px;text-align:center;margin-top:12px;min-height:20px;transition:opacity 0.3s}
.success-msg{color:#fff;font-size:13px;text-align:center;margin-top:12px;min-height:20px}
.footer-links{text-align:center;margin-top:20px;display:flex;justify-content:center;gap:16px}
.footer-links a{color:var(--muted);text-decoration:none;font-size:12px;transition:color 0.3s}
.footer-links a:hover{color:#fff}
.eco{text-align:center;margin-top:32px;color:rgba(255,255,255,0.15);font-size:12px}
.eco a{color:rgba(255,255,255,0.25);text-decoration:none}
.eco a:hover{color:rgba(255,255,255,0.5)}
.password-rules{font-size:11px;color:var(--muted);margin-top:4px;display:none}
.signup-mode .password-rules{display:block}
.alt-auth-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border:1px solid #1a1a1a;border-radius:8px;background:#0a0a0a;color:#ccc;text-decoration:none;font-size:14px;font-weight:600;font-family:-apple-system,'SF Pro Display','Segoe UI',sans-serif;cursor:pointer}
.alt-auth-btn.secondary{color:#888;font-size:13px;font-weight:500}
.alt-auth-btn:hover{border-color:#333;color:#fff}
.clerk-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.82);backdrop-filter:blur(10px);z-index:10000}
.clerk-modal.open{display:flex}
.clerk-shell{width:min(96vw,460px);background:#050505;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.45)}
.clerk-shell-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #1a1a1a}
.clerk-shell-title{font-size:13px;font-weight:600;color:#f5f5f5}
.clerk-shell-close{border:none;background:none;color:#737373;cursor:pointer;font-size:20px;line-height:1}
.clerk-shell-close:hover{color:#fff}
.clerk-shell-body{padding:16px;min-height:160px}
.clerk-status{font-size:12px;color:#737373;text-align:center;padding:20px 10px}
</style>
</head>
<body><style id="br-nav-style">#br-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif}#br-nav .ni{max-width:1200px;margin:0 auto;padding:0 20px;height:48px;display:flex;align-items:center;justify-content:space-between}#br-nav .nl{display:flex;align-items:center;gap:12px}#br-nav .nb{color:#666;font-size:12px;padding:6px 8px;border-radius:6px;display:flex;align-items:center;cursor:pointer;border:none;background:none;transition:color .15s}#br-nav .nb:hover{color:#f5f5f5}#br-nav .nh{text-decoration:none;display:flex;align-items:center;gap:8px}#br-nav .nm{display:flex;gap:2px}#br-nav .nm span{width:6px;height:6px;border-radius:50%}#br-nav .nt{color:#f5f5f5;font-weight:600;font-size:14px}#br-nav .ns{color:#333;font-size:14px}#br-nav .np{color:#999;font-size:13px}#br-nav .nk{display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none}#br-nav .nk::-webkit-scrollbar{display:none}#br-nav .nk a{color:#888;text-decoration:none;font-size:12px;padding:6px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s}#br-nav .nk a:hover{color:#f5f5f5;background:#111}#br-nav .nk a.ac{color:#f5f5f5;background:#1a1a1a}#br-nav .mm{display:none;background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:6px}#br-dd{display:none;position:fixed;top:48px;left:0;right:0;background:rgba(0,0,0,0.96);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;z-index:9998;padding:12px 20px}#br-dd.open{display:flex;flex-wrap:wrap;gap:4px}#br-dd a{color:#888;text-decoration:none;font-size:13px;padding:8px 14px;border-radius:6px;transition:color .15s,background .15s}#br-dd a:hover,#br-dd a.ac{color:#f5f5f5;background:#111}body{padding-top:48px!important}@media(max-width:768px){#br-nav .nk{display:none}#br-nav .mm{display:block}}</style><nav id="br-nav"><div class="ni"><div class="nl"><button class="nb" onclick="history.length>1?history.back():location.href='https://blackroad.io'" title="Back">&larr;</button><a href="https://blackroad.io" class="nh"><div class="nm"><span style="background:#F5A623"></span><span style="background:#FF1D6C"></span><span style="background:#9C27B0"></span><span style="background:#9C27B0"></span><span style="background:#2979FF"></span><span style="background:#00D4FF"></span></div><span class="nt">BlackRoad</span></a><span class="ns">/</span><span class="np">Auth</span></div><div class="nk"><a href="https://blackroad.io">Home</a><a href="https://chat.blackroad.io">Chat</a><a href="https://search.blackroad.io">Search</a><a href="https://tutor.blackroad.io">Tutor</a><a href="https://pay.blackroad.io">Pay</a><a href="https://canvas.blackroad.io">Canvas</a><a href="https://cadence.blackroad.io">Cadence</a><a href="https://video.blackroad.io">Video</a><a href="https://radio.blackroad.io">Radio</a><a href="https://game.blackroad.io">Game</a><a href="https://roundtrip.blackroad.io">Agents</a><a href="https://roadcode.blackroad.io">RoadCode</a><a href="https://hq.blackroad.io">HQ</a><a href="https://os.blackroad.io/app/">Dashboard</a></div><button class="mm" onclick="document.getElementById('br-dd').classList.toggle('open')">&#9776;</button></div></nav><div id="br-dd"><a href="https://blackroad.io">Home</a><a href="https://chat.blackroad.io">Chat</a><a href="https://search.blackroad.io">Search</a><a href="https://tutor.blackroad.io">Tutor</a><a href="https://pay.blackroad.io">Pay</a><a href="https://canvas.blackroad.io">Canvas</a><a href="https://cadence.blackroad.io">Cadence</a><a href="https://video.blackroad.io">Video</a><a href="https://radio.blackroad.io">Radio</a><a href="https://game.blackroad.io">Game</a><a href="https://roundtrip.blackroad.io">Agents</a><a href="https://roadcode.blackroad.io">RoadCode</a><a href="https://hq.blackroad.io">HQ</a><a href="https://os.blackroad.io/app/">Dashboard</a></div><script>document.addEventListener('click',function(e){var d=document.getElementById('br-dd');if(d&&d.classList.contains('open')&&!e.target.closest('#br-nav')&&!e.target.closest('#br-dd'))d.classList.remove('open')});</script>
<canvas id="bg"></canvas>
<div class="wrap">
  <div class="logo">
    <span>BlackRoad OS</span>
    <p>Sovereign Authentication</p>
  </div>
  <div class="card" id="auth-card">
    <div class="tabs">
      <button class="tab active" data-mode="signin">Sign In</button>
      <button class="tab" data-mode="signup">Sign Up</button>
    </div>
    <form id="auth-form" autocomplete="off">
      <div class="field name-field">
        <label>Name</label>
        <input type="text" id="f-name" placeholder="Your name (optional)" autocomplete="name">
      </div>
      <div class="field">
        <label>Email</label>
        <input type="email" id="f-email" placeholder="you@example.com" required autocomplete="email">
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="f-pass" placeholder="Enter password" required autocomplete="current-password">
        <div class="password-rules">Minimum 8 characters</div>
      </div>
      <button type="submit" class="submit-btn" id="submit-btn">Sign In</button>
      <div style="display:flex;align-items:center;gap:12px;margin:20px 0 12px"><div style="flex:1;height:1px;background:#1a1a1a"></div><span style="color:#444;font-size:12px">or</span><div style="flex:1;height:1px;background:#1a1a1a"></div></div>
      <div style="display:flex;flex-direction:column;gap:8px">
      <button type="button" class="alt-auth-btn" onclick="openClerkAuth()"><span style="font-weight:700">C</span>Continue with Clerk</button>
      <a href="/api/auth/google" class="alt-auth-btn"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Sign in with Google</a>
      <a href="/api/auth/github" class="alt-auth-btn"><svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>Sign in with GitHub</a>
      <a href="/api/auth/magic-link" onclick="event.preventDefault();var e=document.getElementById('f-email').value.trim();if(!e){alert('Enter email first');return}fetch('/api/auth/magic-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})}).then(r=>r.json()).then(d=>{if(d.ok)document.getElementById('success-msg').textContent='Magic link sent! Check your email.';else document.getElementById('error-msg').textContent=d.error||'Failed'})" class="alt-auth-btn secondary">Send magic link (no password)</a>
      </div>
      <div class="error-msg" id="error-msg"></div>
      <div class="success-msg" id="success-msg"></div>
    </form>
    <div class="footer-links">
      <a href="https://blackroad.io">Home</a>
      <a href="https://guide.blackroad.io">Getting Started</a>
      <a href="https://help.blackroad.io">Help</a>
    </div>
  </div>
  <div style="max-width:860px;margin:0 auto;padding:32px 20px">
<div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#525252;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">BlackRoad Ecosystem</div>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px">
<a href="https://blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">BlackRoad OS</a>
<a href="https://chat.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Chat</a>
<a href="https://search.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Search</a>
<a href="https://pay.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Pay</a>
<a href="https://tutor.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Tutor</a>
<a href="https://video.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Video</a>
<a href="https://canvas.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Canvas</a>
<a href="https://roundtrip.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">RoundTrip</a>
<a href="https://hq.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">HQ</a>
<a href="https://git.blackroad.io" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Git</a>
<a href="https://lucidia.earth" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">Lucidia</a>
<a href="https://github.com/BlackRoad-OS-Inc" style="background:#131313;border:1px solid #1a1a1a;border-radius:6px;padding:8px 14px;text-decoration:none;font-family:'-apple-system','SF Pro Display','Segoe UI',sans-serif;font-size:13px;color:#737373;font-weight:500">GitHub</a>
</div>
<div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#262626"><span data-stat="repos">2,194</span> repos · <span data-stat="orgs">18</span> orgs · <span data-stat="domains">19</span> domains · <span data-stat="agents">200</span> agents</div>
</div>
  <div class="eco">
    <p>BlackRoad OS &mdash; Remember the Road. Pave Tomorrow.</p>
    <p>Incorporated 2025. &copy;-2026 <a href="https://blackroad.company">BlackRoad OS, Inc.</a></p>
  </div>
</div>
<div class="clerk-modal" id="clerk-modal" onclick="if(event.target===this)closeClerkAuth()">
  <div class="clerk-shell">
    <div class="clerk-shell-header">
      <div class="clerk-shell-title">Continue with Clerk</div>
      <button class="clerk-shell-close" type="button" onclick="closeClerkAuth()">&times;</button>
    </div>
    <div class="clerk-shell-body">
      <div id="clerk-mount"></div>
      <div class="clerk-status" id="clerk-status">Loading Clerk…</div>
    </div>
  </div>
</div>
<script>
(function(){
  const c=document.getElementById('bg'),x=c.getContext('2d');
  let w,h,pts=[];
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=[];for(let i=0;i<30;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*1.5+0.5})}
  resize();addEventListener('resize',resize);
  function draw(){x.clearRect(0,0,w,h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle='rgba(255,255,255,0.04)';x.fill()});
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<150){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.strokeStyle='rgba(255,255,255,'+0.02*(1-d/150)+')';x.stroke()}}
  requestAnimationFrame(draw)}draw()
})();

let mode='signin';
const card=document.getElementById('auth-card');
const form=document.getElementById('auth-form');
const btn=document.getElementById('submit-btn');
const errEl=document.getElementById('error-msg');
const successEl=document.getElementById('success-msg');
const tabs=document.querySelectorAll('.tab');
let clerkInitPromise = null;
let clerkPolling = null;

tabs.forEach(t=>t.addEventListener('click',()=>{
  mode=t.dataset.mode;
  tabs.forEach(tb=>tb.classList.toggle('active',tb===t));
  card.classList.toggle('signup-mode',mode==='signup');
  btn.textContent=mode==='signin'?'Sign In':'Create Account';
  errEl.textContent='';successEl.textContent='';
  document.getElementById('f-pass').autocomplete=mode==='signin'?'current-password':'new-password';
}));

form.addEventListener('submit',async function(e){
  e.preventDefault();
  errEl.textContent='';successEl.textContent='';
  const email=document.getElementById('f-email').value.trim();
  const password=document.getElementById('f-pass').value;
  const name=document.getElementById('f-name').value.trim();

  if(!email||!password){errEl.textContent='Email and password are required.';return}
  if(mode==='signup'&&password.length<8){errEl.textContent='Password must be at least 8 characters.';return}

  btn.disabled=true;
  btn.textContent=mode==='signin'?'Signing in...':'Creating account...';

  try{
    const endpoint=mode==='signin'?'/api/signin':'/api/signup';
    const body=mode==='signin'?{email,password}:{email,password,name};
    const res=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const data=await res.json();

    if(res.ok&&data.token){
      localStorage.setItem('br_token',data.token);
      localStorage.setItem('br_email',data.user?.email||email);
      localStorage.setItem('br_user',JSON.stringify(data.user||{}));
      successEl.textContent=mode==='signin'?'Signed in. Redirecting...':'Account created. Redirecting...';
      const returnTo=new URLSearchParams(window.location.search).get('return_to')||'https://os.blackroad.io/app/';
      const sep=returnTo.includes('?')?'&':'?';
      setTimeout(()=>{window.location.href=returnTo},1200);
    } else {
      errEl.textContent=data.error||'Something went wrong. Try again.';
    }
  }catch(err){
    errEl.textContent='Connection error. Please try again.';
  }

  btn.disabled=false;
  btn.textContent=mode==='signin'?'Sign In':'Create Account';
});

// If already logged in, show a message
const existing=localStorage.getItem('br_token');
if(existing){
  successEl.textContent='You are already signed in.';
}

async function ensureClerk(){
  if(clerkInitPromise) return clerkInitPromise;
  clerkInitPromise = (async function(){
    const configRes = await fetch('/api/clerk/config');
    const config = await configRes.json();
    if(!config.enabled || !config.publishableKey){
      throw new Error('Clerk is not configured');
    }
    const publishableKey = config.publishableKey;
    const clerkDomain = atob(publishableKey.split('_')[2]).slice(0, -1);
    await Promise.all([
      loadScript('https://' + clerkDomain + '/npm/@clerk/ui@1/dist/ui.browser.js'),
      loadScript('https://' + clerkDomain + '/npm/@clerk/clerk-js@6/dist/clerk.browser.js', {'data-clerk-publishable-key': publishableKey}),
    ]);
    await Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
    return Clerk;
  })();
  return clerkInitPromise;
}

function loadScript(src, attrs){
  return new Promise(function(resolve, reject){
    var existing = document.querySelector('script[src="' + src + '"]');
    if(existing){ existing.addEventListener('load', resolve, { once: true }); if(existing.dataset.loaded === '1') resolve(); return; }
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    Object.entries(attrs || {}).forEach(function(entry){ script.setAttribute(entry[0], entry[1]); });
    script.onload = function(){ script.dataset.loaded = '1'; resolve(); };
    script.onerror = function(){ reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(script);
  });
}

async function openClerkAuth(){
  var modal = document.getElementById('clerk-modal');
  var mount = document.getElementById('clerk-mount');
  var status = document.getElementById('clerk-status');
  modal.classList.add('open');
  mount.innerHTML = '';
  status.textContent = 'Loading Clerk…';
  status.style.display = 'block';
  try {
    var clerk = await ensureClerk();
    status.style.display = 'none';
    if(mode === 'signup' && clerk.mountSignUp){
      clerk.mountSignUp(mount);
    } else {
      clerk.mountSignIn(mount);
    }
    startClerkPolling();
  } catch(err){
    status.textContent = err.message || 'Unable to load Clerk right now.';
  }
}

function closeClerkAuth(){
  var modal = document.getElementById('clerk-modal');
  modal.classList.remove('open');
  stopClerkPolling();
  try {
    var mount = document.getElementById('clerk-mount');
    mount.innerHTML = '';
  } catch(e){}
}

function startClerkPolling(){
  stopClerkPolling();
  clerkPolling = setInterval(async function(){
    try {
      if(!window.Clerk || !Clerk.session) return;
      var token = await Clerk.session.getToken();
      if(!token) return;
      stopClerkPolling();
      await exchangeClerkToken(token);
    } catch(e){}
  }, 1000);
}

function stopClerkPolling(){
  if(clerkPolling){ clearInterval(clerkPolling); clerkPolling = null; }
}

async function exchangeClerkToken(token){
  var status = document.getElementById('clerk-status');
  status.textContent = 'Completing sign-in…';
  status.style.display = 'block';
  const res = await fetch('/api/clerk/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ token: token }),
  });
  const data = await res.json();
  if(!res.ok || !data.token){
    throw new Error(data.error || 'Unable to exchange Clerk token');
  }
  localStorage.setItem('br_token', data.token);
  localStorage.setItem('br_email', data.user?.email || '');
  localStorage.setItem('br_user', JSON.stringify(data.user || {}));
  successEl.textContent = 'Signed in with Clerk. Redirecting...';
  closeClerkAuth();
  const returnTo=new URLSearchParams(window.location.search).get('return_to')||'https://os.blackroad.io/app/';
  const sep=returnTo.includes('?')?'&':'?';
  setTimeout(function(){ window.location.href = returnTo; }, 800);
}
</script>
<script>fetch('https://stats-blackroad.blackroad.workers.dev/live').then(r=>r.json()).then(d=>{const e=d.ecosystem;document.querySelectorAll('[data-stat]').forEach(el=>{const k=el.dataset.stat;if(k==='agents')el.textContent=e.agents;if(k==='repos')el.textContent=e.repos.toLocaleString();if(k==='orgs')el.textContent=e.orgs;if(k==='nodes')el.textContent=e.nodes;if(k==='domains')el.textContent=e.domains;if(k==='tops')el.textContent=e.tops;if(k==='workers')el.textContent=e.workers;if(k==='users')el.textContent=d.auth?.users||0;if(k==='messages')el.textContent=(d.chat?.total_messages||0).toLocaleString();if(k==='queries')el.textContent=(d.search?.total_queries||0).toLocaleString();if(k==='pages')el.textContent=(d.search?.indexed_pages||0).toLocaleString()})}).catch(()=>{});</script>
</body>
</html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// ── Main ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt')
      return new Response('User-agent: *\nAllow: /\nSitemap: https://auth.blackroad.io/sitemap.xml', {headers:{'Content-Type':'text/plain'}});
    if (url.pathname === '/sitemap.xml') {
      const d = new Date().toISOString().split('T')[0];
      return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://auth.blackroad.io/</loc><lastmod>${d}</lastmod><priority>1.0</priority></url></urlset>`, {headers:{'Content-Type':'application/xml'}});
    }
    const path = url.pathname;
    const origin = request.headers.get('Origin') || '';
    const cors = CORS_HEADERS(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Init DB on first request
    if (path === '/api/init' || path === '/init') {
      const statements = SCHEMA.split(';').filter(s => s.trim());
      for (const sql of statements) {
        await env.DB.prepare(sql).run();
      }
      return Response.json({ ok: true, message: 'Schema initialized' }, { headers: cors });
    }

    try {
      let response;

      switch (path) {
        case '/':
          // Serve HTML login/signup page for browser requests
          if (request.method === 'GET') {
            return renderAuthPage();
          }
          response = Response.json({
            service: 'BlackRoad Auth',
            version: '1.0.0',
            endpoints: ['/api/signup', '/api/signin', '/api/me', '/api/signout', '/api/user', '/api/stats', '/api/health'],
          });
          break;

        case '/api/signup':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleSignup(request, env);
          break;

        case '/api/signin':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleSignin(request, env);
          break;

        case '/api/clerk/config':
          if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
          response = await handleClerkConfig(env);
          break;

        case '/api/clerk/exchange':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleClerkExchange(request, env);
          break;

        case '/api/me':
          response = await handleMe(request, env);
          break;

        case '/api/signout':
          response = await handleSignout(request, env);
          break;

        case '/api/user':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleUpdateUser(request, env);
          break;

        case '/api/usage':
          response = await handleUsage(request, env);
          break;

        case '/api/stats':
          response = await handleStats(env);
          break;

        case '/api/forgot-password':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleForgotPassword(request, env);
          break;

        case '/api/reset-password':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          response = await handleResetPassword(request, env);
          break;

        case '/api/sessions':
          if (request.method === 'GET') response = await handleListSessions(request, env);
          else return new Response('Method not allowed', { status: 405 });
          break;

        case '/api/verify':
          response = await handleVerify(request, env);
          break;

        case '/api/account':
          if (request.method === 'DELETE') response = await handleDeleteAccount(request, env);
          else return new Response('Method not allowed', { status: 405 });
          break;

        case '/api/webhook/stripe':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          try {
            const body = await request.json();
            const event = body;
            if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created') {
              const email = event.data?.object?.customer_email || event.data?.object?.customer_details?.email;
              const plan = event.data?.object?.metadata?.plan || 'pro';
              if (email) {
                await env.DB.prepare('UPDATE users SET plan = ?, stripe_customer_id = ?, updated_at = unixepoch() WHERE email = ?')
                  .bind(plan, event.data?.object?.customer || '', email.toLowerCase()).run();
                await trackUsage(env, email, 'subscription_' + plan, 'stripe');
              }
            }
            if (event.type === 'customer.subscription.deleted') {
              const email = event.data?.object?.customer_email;
              if (email) {
                await env.DB.prepare('UPDATE users SET plan = ?, updated_at = unixepoch() WHERE email = ?')
                  .bind('operator', email.toLowerCase()).run();
              }
            }
            response = Response.json({ received: true });
          } catch (e) { response = Response.json({ error: e.message }, { status: 500 }); }
          break;

        case '/api/health':
          response = Response.json({ status: 'up', service: 'auth-blackroad', version: '2.1.0' });
          break;

        case '/docs':
        case '/api/docs':
          return new Response(renderDocs(), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });

        case '/api/auth/google':
          // Google OAuth — 1.8 billion users, one click
          if (!env.GOOGLE_CLIENT_ID) return Response.json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' }, { status: 500 });
          response = Response.redirect(
            'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + env.GOOGLE_CLIENT_ID +
            '&redirect_uri=' + encodeURIComponent('https://auth.blackroad.io/api/auth/google/callback') +
            '&response_type=code&scope=openid%20email%20profile&state=' + crypto.randomUUID().slice(0, 8), 302);
          break;

        case '/api/auth/google/callback':
          try {
            const gCode = new URL(request.url).searchParams.get('code');
            if (!gCode) return Response.json({ error: 'No code' }, { status: 400 });
            const gTokenRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ code: gCode, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: 'https://auth.blackroad.io/api/auth/google/callback', grant_type: 'authorization_code' }),
            });
            const gTokenData = await gTokenRes.json();
            if (!gTokenData.access_token) return Response.json({ error: 'Google auth failed' }, { status: 401 });
            const gUser = await (await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { 'Authorization': 'Bearer ' + gTokenData.access_token } })).json();
            const gEmail = gUser.email;
            if (!gEmail) return Response.json({ error: 'No email from Google' }, { status: 400 });
            let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(gEmail.toLowerCase()).first();
            if (!user) {
              const id = generateId();
              const pw = await hashPassword(crypto.randomUUID());
              await env.DB.prepare('INSERT INTO users (id, email, name, password_hash, metadata) VALUES (?, ?, ?, ?, ?)').bind(id, gEmail.toLowerCase(), gUser.name || gEmail.split('@')[0], pw, JSON.stringify({ google_id: gUser.id, picture: gUser.picture })).run();
              user = { id, email: gEmail.toLowerCase(), name: gUser.name || gEmail.split('@')[0], plan: 'operator' };
            }
            const jwt = await createJWT({ sub: user.id, email: user.email, name: user.name, plan: user.plan || 'operator' }, env.JWT_SECRET, 86400 * 30);
            return new Response(tokenLandingHtml(jwt), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
          } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }

        case '/api/auth/magic-link':
          // Passwordless magic link — email a login link
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          try {
            const mlBody = await safeJson(request);
            if (!mlBody?.email) return Response.json({ error: 'Email required' }, { status: 400 });
            const mlUser = await env.DB.prepare('SELECT id, email, name, plan FROM users WHERE email = ?').bind(mlBody.email.toLowerCase()).first();
            if (!mlUser) return Response.json({ ok: true, message: 'If that email exists, a magic link has been sent' });
            const mlToken = await createJWT({ sub: mlUser.id, email: mlUser.email, name: mlUser.name, plan: mlUser.plan, type: 'magic_link' }, env.JWT_SECRET, 900);
            const mlUrl = 'https://auth.blackroad.io/api/auth/verify?t=' + mlToken;
            // In production, send via email. For now, return the link directly.
            return Response.json({ ok: true, message: 'Magic link generated', link: mlUrl, expires_in: 900 });
          } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }

        case '/api/auth/github':
          // Redirect to GitHub OAuth
          if (!env.GITHUB_CLIENT_ID) return Response.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
          response = Response.redirect(
            'https://github.com/login/oauth/authorize?client_id=' + env.GITHUB_CLIENT_ID +
            '&redirect_uri=' + encodeURIComponent('https://auth.blackroad.io/api/auth/github/callback') +
            '&scope=read:user,user:email&state=' + crypto.randomUUID().slice(0, 8), 302);
          break;

        case '/api/auth/github/callback':
          try {
            const ghCode = new URL(request.url).searchParams.get('code');
            if (!ghCode) return Response.json({ error: 'No code' }, { status: 400 });
            // Exchange code for token
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code: ghCode }),
            });
            const tokenData = await tokenRes.json();
            if (!tokenData.access_token) return Response.json({ error: 'GitHub auth failed' }, { status: 401 });
            // Get user info
            const ghUser = await (await fetch('https://api.github.com/user', { headers: { 'Authorization': 'Bearer ' + tokenData.access_token, 'User-Agent': 'BlackRoad-Auth' } })).json();
            const ghEmails = await (await fetch('https://api.github.com/user/emails', { headers: { 'Authorization': 'Bearer ' + tokenData.access_token, 'User-Agent': 'BlackRoad-Auth' } })).json();
            const primaryEmail = (ghEmails.find(e => e.primary) || ghEmails[0] || {}).email || ghUser.email || ghUser.login + '@github.com';
            // Find or create user
            let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(primaryEmail.toLowerCase()).first();
            if (!user) {
              const id = generateId();
              const pw = await hashPassword(crypto.randomUUID());
              await env.DB.prepare('INSERT INTO users (id, email, name, password_hash, metadata) VALUES (?, ?, ?, ?, ?)').bind(id, primaryEmail.toLowerCase(), ghUser.name || ghUser.login, pw, JSON.stringify({ github_id: ghUser.id, github_login: ghUser.login, avatar: ghUser.avatar_url })).run();
              user = { id, email: primaryEmail.toLowerCase(), name: ghUser.name || ghUser.login, plan: 'operator' };
            }
            const jwt = await createJWT({ sub: user.id, email: user.email, name: user.name, plan: user.plan || 'operator' }, env.JWT_SECRET, 86400 * 30);
            return new Response(tokenLandingHtml(jwt), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
          } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }

        default:
          // Handle session deletion: DELETE /api/sessions/:id
          if (path.startsWith('/api/sessions/') && request.method === 'DELETE') {
            const sessionId = path.split('/')[3];
            response = await handleDeleteSession(request, env, sessionId);
            break;
          }
          response = Response.json({
            service: 'BlackRoad Auth',
            version: '2.1.0',
            endpoints: ['/api/signup', '/api/signin', '/api/me', '/api/signout', '/api/user', '/api/stats', '/api/health', '/api/forgot-password', '/api/reset-password', '/api/sessions', '/api/verify', '/api/account'],
          });
      }

      // Add CORS headers to response
      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(response.body, { status: response.status, headers });

    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: cors });
    }
  },
};

function renderDocs() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BlackRoad Auth — API Docs</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#e0e0e0;font-family:'-apple-system',-apple-system,sans-serif;padding:40px 20px;max-width:800px;margin:0 auto;line-height:1.7}
h1{font-size:28px;font-weight:700;margin-bottom:8px}h2{font-size:18px;font-weight:600;margin:32px 0 12px;padding-top:16px;border-top:1px solid #1a1a1a}
.subtitle{opacity:.4;font-size:14px;margin-bottom:32px}
.endpoint{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:16px;margin-bottom:12px}
.method{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;font-family:monospace;margin-right:8px}
.post{background:#1a3a1a;color:#4ade80}.get{background:#1a2a3a;color:#60a5fa}.delete{background:#3a1a1a;color:#f87171}
.path{font-family:monospace;font-size:14px;color:#f5f5f5}
.desc{font-size:13px;opacity:.5;margin-top:6px}
.param{font-family:monospace;font-size:12px;color:#f5a623;margin-top:4px}
a{color:#a3a3a3;text-decoration:none}a:hover{text-decoration:underline}
</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body>
<h1>BlackRoad Auth</h1>
<p class="subtitle">Sovereign authentication. Zero third-party dependencies. JWT + Web Crypto.</p>

<h2>Authentication</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/signup</span><div class="desc">Create account. Returns JWT token.</div><div class="param">Body: { email, password, name? }</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/signin</span><div class="desc">Sign in. Returns JWT token. Rate limited: 5/min.</div><div class="param">Body: { email, password }</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/me</span><div class="desc">Get current user. Requires Authorization: Bearer token.</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/signout</span><div class="desc">Invalidate session.</div></div>

<h2>Account Management</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/user</span><div class="desc">Update profile (name, password).</div><div class="param">Body: { name?, password? }</div></div>
<div class="endpoint"><span class="method delete">DELETE</span><span class="path">/api/account</span><div class="desc">Delete account permanently. Requires Authorization.</div></div>

<h2>Password Reset</h2>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/forgot-password</span><div class="desc">Generate reset code. Rate limited: 3/min.</div><div class="param">Body: { email }</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/reset-password</span><div class="desc">Reset password with code.</div><div class="param">Body: { email, code, new_password }</div></div>

<h2>Sessions & Security</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/sessions</span><div class="desc">List active sessions with device info.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/verify</span><div class="desc">Verify email address.</div></div>

<h2>OAuth</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/auth/github</span><div class="desc">Start GitHub OAuth flow. Redirects to GitHub.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/auth/github/callback</span><div class="desc">GitHub OAuth callback. Creates/links account, returns token.</div></div>

<h2>System</h2>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/health</span><div class="desc">Health check.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/stats</span><div class="desc">User count, session count, system stats.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/init</span><div class="desc">Initialize database schema.</div></div>

<div style="margin-top:48px;padding-top:16px;border-top:1px solid #1a1a1a;font-size:12px;opacity:.3">BlackRoad OS, Inc. — Sovereign Auth — <a href="https://blackroad.io">blackroad.io</a></div>
<script>!function(){var A="https://analytics-blackroad.blackroad.workers.dev",s=sessionStorage.getItem("br_sid")||crypto.randomUUID().slice(0,12);sessionStorage.setItem("br_sid",s);function ev(n,p){fetch(A+"/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,path:location.pathname,session_id:s,props:p||{}})}).catch(function(){});}fetch(A+"/pageview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:location.hostname+location.pathname,referrer:document.referrer,session_id:s,screen_w:screen.width,screen_h:screen.height,lang:navigator.language})}).catch(function(){});var t0=Date.now(),maxScroll=0,engaged=0;window.addEventListener("scroll",function(){var pct=Math.round(100*(window.scrollY+window.innerHeight)/document.documentElement.scrollHeight);if(pct>maxScroll){maxScroll=pct;if(pct>=25&&pct<50)ev("scroll_25");if(pct>=50&&pct<75)ev("scroll_50");if(pct>=75&&pct<100)ev("scroll_75");if(pct>=100)ev("scroll_100");}});setInterval(function(){engaged++;},30000);window.addEventListener("beforeunload",function(){var dur=Date.now()-t0;fetch(A+"/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:s,duration_ms:dur}),keepalive:true}).catch(function(){});ev("exit",{duration_s:Math.round(dur/1000),scroll_max:maxScroll,engaged_intervals:engaged});if(dur<10000)ev("bounce");});document.addEventListener("click",function(e){var a=e.target.closest("a");if(a&&a.hostname!==location.hostname)ev("outbound_click",{url:a.href});});}();</script></body></html>`;
}
