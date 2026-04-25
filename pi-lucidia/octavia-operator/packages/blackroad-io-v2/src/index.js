export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'OPTIONS') return handleCORS();
    if (path.startsWith('/api/')) return addCORSHeaders(await handleAPI(path, request, env, url));
    return new Response(APP_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};

function handleCORS() {
  return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400'
  }});
}

function addCORSHeaders(response) {
  const h = new Headers(response.headers);
  h.set('Access-Control-Allow-Origin', '*');
  return new Response(response.body, { status: response.status, headers: h });
}

async function handleAPI(path, request, env, url) {
  const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data, null, 2), {
    status, headers: { 'Content-Type': 'application/json', ...headers }
  });

  try {
    if (path === '/api/health') {
      const checks = { status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0', services: { worker: 'ok', database: 'unknown' } };
      try { if (env.DB) { await env.DB.prepare('SELECT 1').first(); checks.services.database = 'ok'; } } catch (e) { checks.services.database = 'error'; }
      return json(checks);
    }

    if (path === '/api/docs' || path === '/api') {
      return json({
        name: 'BlackRoad API', version: '2.0.0', base_url: url.origin,
        endpoints: {
          'GET /api/health': { description: 'Health check', auth: false },
          'GET /api/docs': { description: 'API documentation', auth: false },
          'GET /api/me': { description: 'Current user', auth: 'session' },
          'POST /api/signup': { description: 'Create account', body: { name: 'string?', email: 'string', password: 'string' } },
          'POST /api/login': { description: 'Login', body: { email: 'string', password: 'string' } },
          'POST /api/logout': { description: 'Logout', auth: 'session' },
          'GET /api/stats': { description: 'Platform stats', auth: false },
          'GET /api/domains': { description: 'List domains', auth: false }
        }
      });
    }

    if (path === '/api/me') { return json({ user: await getUser(request, env) }); }

    if (path === '/api/signup' && request.method === 'POST') {
      const { name, email, password } = await request.json();
      if (!email || !password) return json({ error: 'Email and password required' }, 400);
      if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
      if (existing) return json({ error: 'Email already registered' }, 400);
      const userId = crypto.randomUUID();
      const hash = await hashPassword(password);
      await env.DB.prepare('INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))').bind(userId, email.toLowerCase(), hash, name || null, 'user').run();
      const sessionId = crypto.randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))').bind(sessionId, userId, expires).run();
      return json({ success: true, user: { id: userId, name, email } }, 200, {
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
      });
    }

    if (path === '/api/login' && request.method === 'POST') {
      const { email, password } = await request.json();
      if (!email || !password) return json({ error: 'Email and password required' }, 400);
      const user = await env.DB.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').bind(email.toLowerCase()).first();
      if (!user || !await verifyPassword(password, user.password_hash)) return json({ error: 'Invalid credentials' }, 401);
      const sessionId = crypto.randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))').bind(sessionId, user.id, expires).run();
      return json({ success: true, user: { id: user.id, name: user.name, email: user.email } }, 200, {
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
      });
    }

    if (path === '/api/logout' && request.method === 'POST') {
      const sessionId = getSessionId(request);
      if (sessionId) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
      return json({ success: true }, 200, { 'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' });
    }

    if (path === '/api/stats') {
      let stats = { agents: '1000', domains: '21', github_orgs: '16', repositories: '40+' }, domains = [];
      try {
        const sr = await env.DB.prepare('SELECT key, value FROM stats').all();
        if (sr.results?.length) stats = { ...stats, ...Object.fromEntries(sr.results.map(r => [r.key, r.value])) };
        const dr = await env.DB.prepare('SELECT name FROM domains ORDER BY created_at DESC LIMIT 10').all();
        domains = dr.results?.map(d => d.name) || [];
      } catch (e) {}
      return json({ stats, domains });
    }

    if (path === '/api/domains') {
      try {
        const r = await env.DB.prepare('SELECT name, status, created_at FROM domains ORDER BY created_at DESC').all();
        return json({ domains: r.results || [] });
      } catch (e) {
        return json({ domains: [{ name: 'blackroad.io', status: 'active' }, { name: 'lucidia.earth', status: 'active' }] });
      }
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error('API Error:', e);
    return json({ error: 'Server error', message: e.message }, 500);
  }
}

function getSessionId(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

async function getUser(request, env) {
  const sessionId = getSessionId(request);
  if (!sessionId) return null;
  return await env.DB.prepare(`SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')`).bind(sessionId).first() || null;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const combined = new Uint8Array(16 + 32);
  combined.set(salt);
  combined.set(new Uint8Array(hash), 16);
  return btoa(String.fromCharCode(...combined));
}

async function verifyPassword(password, stored) {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const original = combined.slice(16);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(hash).every((b, i) => b === original[i]);
}

const APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad</title>
  <meta name="description" content="Browser-native OS for AI agent orchestration">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛤️</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root{--bg:#0a0a0a;--surface:#171717;--border:#262626;--border-hover:#404040;--text:#f5f5f5;--text-muted:#737373;--text-dim:#525252;--accent:#1e90ff;--gradient:linear-gradient(135deg,#ff8700 0%,#ff0087 50%,#1e90ff 100%);--font-display:'Space Grotesk',sans-serif;--font-body:'Inter',sans-serif;--font-mono:'JetBrains Mono',monospace}
    *{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text);font-family:var(--font-body);line-height:1.6;min-height:100vh}a{color:var(--accent);text-decoration:none}.container{max-width:1200px;margin:0 auto;padding:0 24px}
    header{padding:16px 0;border-bottom:1px solid var(--border);background:rgba(10,10,10,0.95);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100}.header-inner{display:flex;justify-content:space-between;align-items:center}.logo{font-family:var(--font-display);font-size:24px;font-weight:700;cursor:pointer}.logo-text{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.nav{display:flex;gap:24px;align-items:center}.nav a,.nav button{font-size:14px;color:var(--text-muted);background:none;border:none;cursor:pointer}.nav a:hover,.nav button:hover{color:var(--text)}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;font-size:14px;font-weight:500;border-radius:8px;border:none;cursor:pointer;transition:all 0.2s}.btn-primary{background:var(--text);color:var(--bg)}.btn-primary:hover{opacity:0.9;transform:translateY(-1px)}.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text-muted)}.btn-ghost:hover{border-color:var(--border-hover);color:var(--text)}.btn-full{width:100%;justify-content:center}.btn-sm{padding:8px 16px;font-size:13px}
    .hero{padding:120px 0 80px;text-align:center;position:relative}.hero h1{font-family:var(--font-display);font-size:72px;font-weight:700;letter-spacing:-3px;margin-bottom:24px;line-height:1.1}.hero h1 .gradient{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.hero p{font-size:20px;color:var(--text-muted);max-width:520px;margin:0 auto 40px}.hero-buttons{display:flex;gap:16px;justify-content:center}.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--surface);border:1px solid var(--border);border-radius:20px;font-size:13px;color:var(--text-muted);margin-bottom:24px}.hero-badge .dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:64px 0;border-top:1px solid var(--border)}.stat{text-align:center;padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:12px}.stat:hover{border-color:var(--border-hover);transform:translateY(-2px)}.stat-value{font-family:var(--font-display);font-size:48px;font-weight:700;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.stat-label{font-size:14px;color:var(--text-dim);margin-top:8px;text-transform:uppercase;letter-spacing:1px}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:64px 0}.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;transition:all 0.25s}.card:hover{border-color:var(--border-hover);transform:translateY(-4px)}.card-icon{font-size:32px;margin-bottom:20px}.card-title{font-family:var(--font-display);font-size:18px;font-weight:600;margin-bottom:8px}.card-desc{font-size:14px;color:var(--text-muted);line-height:1.7}
    .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.auth-box{width:100%;max-width:400px}.auth-header{text-align:center;margin-bottom:40px}.auth-header h1{font-family:var(--font-display);font-size:32px;margin:20px 0 8px}.auth-header p{color:var(--text-muted);font-size:15px}.auth-form{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px}.form-group{margin-bottom:20px}.form-group label{display:block;font-size:13px;color:var(--text-muted);margin-bottom:8px}.form-group input{width:100%;padding:14px 16px;background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:15px}.form-group input:focus{outline:none;border-color:var(--accent)}.auth-footer{text-align:center;margin-top:24px;font-size:14px;color:var(--text-muted)}.error-msg{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:20px}
    .dashboard{padding:48px 0}.page-title{font-family:var(--font-display);font-size:36px;font-weight:700;margin-bottom:8px}.page-subtitle{color:var(--text-muted);font-size:16px;margin-bottom:48px}.section-title{font-family:var(--font-display);font-size:20px;font-weight:600;margin:32px 0 16px}.domains-grid{display:grid;gap:12px}.domain-item{display:flex;justify-content:space-between;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px}.domain-name{font-family:var(--font-mono);font-size:14px}.domain-badge{font-family:var(--font-mono);font-size:11px;padding:4px 10px;border-radius:6px;background:rgba(34,197,94,0.15);color:#22c55e;text-transform:uppercase}
    footer{padding:48px 0;border-top:1px solid var(--border)}.footer-inner{display:flex;justify-content:space-between;align-items:center}.footer-links{display:flex;gap:32px}.footer-links a{font-size:14px;color:var(--text-muted)}.footer-copy{font-size:13px;color:var(--text-dim)}
    @media(max-width:768px){.hero h1{font-size:44px}.stats{grid-template-columns:repeat(2,1fr)}.stat-value{font-size:36px}.footer-inner{flex-direction:column;gap:24px}}
    [hidden]{display:none!important}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const App={user:null,stats:{agents:'1,000',domains:'21',github_orgs:'16',repositories:'40+'},domainsList:[],
    async init(){await this.checkAuth();this.router();window.addEventListener('popstate',()=>this.router())},
    async checkAuth(){try{const r=await fetch('/api/me');const d=await r.json();this.user=d.user}catch(e){this.user=null}},
    async loadStats(){try{const r=await fetch('/api/stats');const d=await r.json();if(d.stats)this.stats={agents:d.stats.agents||'1000',domains:d.stats.domains||'21',github_orgs:d.stats.github_orgs||'16',repositories:d.stats.repositories||'40+'};if(d.domains?.length)this.domainsList=d.domains}catch(e){}},
    navigate(p){history.pushState({},'',p);this.router()},
    router(){const p=location.pathname;if(p==='/login')this.renderLogin();else if(p==='/signup')this.renderSignup();else if(p==='/dashboard')this.renderDashboard();else this.renderHome()},
    renderHome(){this.loadStats().then(()=>{document.getElementById('app').innerHTML=\`
      <header><div class="container header-inner"><div class="logo" onclick="App.navigate('/')"><span class="logo-text">BlackRoad</span></div><nav class="nav"><a href="/api/docs" target="_blank">API</a>\${this.user?\`<button onclick="App.navigate('/dashboard')">Dashboard</button><button onclick="App.logout()">Sign out</button>\`:\`<a href="/login" onclick="event.preventDefault();App.navigate('/login')">Sign in</a><button class="btn btn-primary btn-sm" onclick="App.navigate('/signup')">Get Started</button>\`}</nav></div></header>
      <main><section class="hero"><div class="container"><div class="hero-badge"><span class="dot"></span>Now serving 1,000+ AI agents</div><h1>The Road Ahead<br>Is <span class="gradient">Infinite</span></h1><p>Browser-native operating system for AI agent orchestration. Build, deploy, and manage intelligent agents at scale.</p><div class="hero-buttons">\${this.user?\`<button class="btn btn-primary" onclick="App.navigate('/dashboard')">Open Dashboard →</button>\`:\`<button class="btn btn-primary" onclick="App.navigate('/signup')">Start Building →</button>\`}<a href="/api/docs" target="_blank" class="btn btn-ghost">View API</a></div></div></section>
      <section class="container"><div class="stats"><div class="stat"><div class="stat-value">\${this.stats.agents}</div><div class="stat-label">AI Agents</div></div><div class="stat"><div class="stat-value">\${this.stats.domains}</div><div class="stat-label">Domains</div></div><div class="stat"><div class="stat-value">\${this.stats.github_orgs}</div><div class="stat-label">GitHub Orgs</div></div><div class="stat"><div class="stat-value">\${this.stats.repositories}</div><div class="stat-label">Repositories</div></div></div></section>
      <section class="container"><div class="cards"><div class="card"><div class="card-icon">🤖</div><div class="card-title">Agent Orchestration</div><div class="card-desc">LangGraph + CrewAI powering 1,000 unique agents with individual identities and capabilities.</div></div><div class="card"><div class="card-icon">🧠</div><div class="card-title">Lucidia Core</div><div class="card-desc">Recursive AI with trinary logic and PS-SHA∞ cryptographic memory persistence.</div></div><div class="card"><div class="card-icon">⛓️</div><div class="card-title">RoadChain</div><div class="card-desc">Hyperledger Besu blockchain for agent identity and trust verification.</div></div><div class="card"><div class="card-icon">🌐</div><div class="card-title">Edge Network</div><div class="card-desc">Cloudflare Workers + K3s for global deployment and sub-100ms responses.</div></div></div></section></main>
      <footer><div class="container footer-inner"><div class="footer-links"><a href="https://github.com/BlackRoad-OS" target="_blank">GitHub</a><a href="https://instagram.com/blackroad.io" target="_blank">Instagram</a><a href="/api/docs" target="_blank">API</a></div><p class="footer-copy">© 2026 BlackRoad OS, Inc.</p></div></footer>\`})},
    renderLogin(){document.getElementById('app').innerHTML=\`<div class="auth-page"><div class="auth-box"><div class="auth-header"><div class="logo" onclick="App.navigate('/')"><span class="logo-text">BlackRoad</span></div><h1>Welcome back</h1><p>Sign in to continue</p></div><form class="auth-form" onsubmit="App.handleLogin(event)"><div id="login-error"></div><div class="form-group"><label>Email</label><input type="email" name="email" required></div><div class="form-group"><label>Password</label><input type="password" name="password" required></div><button type="submit" class="btn btn-primary btn-full">Sign In</button></form><p class="auth-footer">No account? <a href="/signup" onclick="event.preventDefault();App.navigate('/signup')">Create one</a></p></div></div>\`},
    renderSignup(){document.getElementById('app').innerHTML=\`<div class="auth-page"><div class="auth-box"><div class="auth-header"><div class="logo" onclick="App.navigate('/')"><span class="logo-text">BlackRoad</span></div><h1>Create account</h1><p>Start building with AI agents</p></div><form class="auth-form" onsubmit="App.handleSignup(event)"><div id="signup-error"></div><div class="form-group"><label>Name</label><input type="text" name="name" placeholder="Optional"></div><div class="form-group"><label>Email</label><input type="email" name="email" required></div><div class="form-group"><label>Password</label><input type="password" name="password" required minlength="8" placeholder="Min 8 characters"></div><button type="submit" class="btn btn-primary btn-full">Create Account</button></form><p class="auth-footer">Have an account? <a href="/login" onclick="event.preventDefault();App.navigate('/login')">Sign in</a></p></div></div>\`},
    renderDashboard(){if(!this.user){this.navigate('/login');return}this.loadStats().then(()=>{const domains=this.domainsList.length?this.domainsList:['blackroad.io','lucidia.earth','roadchain.io','aliceqi.com'];document.getElementById('app').innerHTML=\`<header><div class="container header-inner"><div class="logo" onclick="App.navigate('/')"><span class="logo-text">BlackRoad</span></div><nav class="nav"><a href="/api/docs" target="_blank">API</a><button onclick="App.logout()">Sign out</button></nav></div></header><main class="dashboard"><div class="container"><h1 class="page-title">Dashboard</h1><p class="page-subtitle">Welcome back, \${this.user.name||this.user.email.split('@')[0]}</p><div class="stats"><div class="stat"><div class="stat-value">\${this.stats.agents}</div><div class="stat-label">AI Agents</div></div><div class="stat"><div class="stat-value">\${this.stats.domains}</div><div class="stat-label">Domains</div></div><div class="stat"><div class="stat-value">\${this.stats.github_orgs}</div><div class="stat-label">GitHub Orgs</div></div><div class="stat"><div class="stat-value">\${this.stats.repositories}</div><div class="stat-label">Repositories</div></div></div><h2 class="section-title">Domains</h2><div class="domains-grid">\${domains.map(d=>\`<div class="domain-item"><span class="domain-name">\${d}</span><span class="domain-badge">Active</span></div>\`).join('')}</div></div></main>\`})},
    async handleLogin(e){e.preventDefault();const f=e.target;const err=document.getElementById('login-error');try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.email.value,password:f.password.value})});const d=await r.json();if(d.success){this.user=d.user;this.navigate('/dashboard')}else{err.innerHTML='<div class="error-msg">'+(d.error||'Login failed')+'</div>'}}catch(e){err.innerHTML='<div class="error-msg">Network error</div>'}},
    async handleSignup(e){e.preventDefault();const f=e.target;const err=document.getElementById('signup-error');try{const r=await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name.value,email:f.email.value,password:f.password.value})});const d=await r.json();if(d.success){this.user=d.user;this.navigate('/dashboard')}else{err.innerHTML='<div class="error-msg">'+(d.error||'Signup failed')+'</div>'}}catch(e){err.innerHTML='<div class="error-msg">Network error</div>'}},
    async logout(){await fetch('/api/logout',{method:'POST'});this.user=null;this.navigate('/')}};
    App.init();
  <\/script>
</body>
</html>`;
