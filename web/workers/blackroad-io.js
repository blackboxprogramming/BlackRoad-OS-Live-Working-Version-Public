// PROPRIETARY. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source.

// ── SECURITY LAYER ──────────────────────────────────────────────────────────
var BAD_BOTS = ['sqlmap','nikto','masscan','nmap','dirbuster','gobuster','wpscan','nuclei','httpx','subfinder','ffuf','burpsuite','zap','acunetix','nessus','ahrefsbot','semrushbot','dotbot','mj12bot','blexbot','petalbot','bytespider','gptbot','claudebot','ccbot'];
var HONEYPOTS = ['/wp-admin','/wp-login','/wp-content','/.env','/.git','/config','/admin','/phpmyadmin','/xmlrpc.php','/debug','/actuator','/.aws','/cgi-bin','/shell'];
var SEC_HEADERS = {'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','X-XSS-Protection':'1; mode=block','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Strict-Transport-Security':'max-age=31536000; includeSubDomains','X-Powered-By':'BlackRoad OS'};
var _rl = new Map();
function _rateCheck(ip, max, win) { var now=Date.now(),wMs=win*1000; if(!_rl.has(ip)){_rl.set(ip,{c:1,s:now});return true} var e=_rl.get(ip); if(now-e.s>wMs){e.c=1;e.s=now;return true} e.c++; if(_rl.size>10000){for(var[k,v]of _rl){if(now-v.s>120000)_rl.delete(k)}} return e.c<=max }
function _secBlock(msg,code){return new Response('<!DOCTYPE html><html><head><title>BlackRoad Security</title><style>body{background:#000;color:#fff;font-family:monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}.b{border:2px solid #333;padding:40px;max-width:500px;text-align:center}h1{font-size:24px;margin-bottom:16px}p{color:#888;font-size:14px}.c{color:#FF1D6C;font-size:48px;margin-bottom:8px}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><div class="b"><div class="c">'+code+'</div><h1>BlackRoad Security</h1><p>'+msg+'</p></div></body></html>',{status:code,headers:{'Content-Type':'text/html',...SEC_HEADERS}})}
function _secCheck(request) {
  var url = new URL(request.url), path = url.pathname.toLowerCase(), ua = (request.headers.get('user-agent')||'').toLowerCase(), ip = request.headers.get('cf-connecting-ip')||'0';
  if (HONEYPOTS.some(function(h){return path.startsWith(h)})) return _secBlock('This path does not exist. Your request has been logged.', 403);
  if (BAD_BOTS.some(function(b){return ua.includes(b)})) return _secBlock('Automated scanning detected. Access denied.', 403);
  if (!_rateCheck(ip, 100, 60)) return _secBlock('Rate limit exceeded.', 429);
  return null;
}
function _addSecHeaders(response) { var r = new Response(response.body, response); for (var k in SEC_HEADERS) r.headers.set(k, SEC_HEADERS[k]); return r; }
var LIVE_WIDGET = '<script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script>';
// ── END SECURITY LAYER ──────────────────────────────────────────────────────

var API_CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
var HTML_CORS = { "Access-Control-Allow-Origin": "*", "Content-Type": "text/html;charset=UTF-8" };

var TRY_HTML = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Try BlackRoad OS — Free</title><meta name="blackroad-traffic" content="public"><script defer src="https://analytics.blackroad.io/beacon.js"></script><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#e5e5e5;font-family:var(--sg),sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}.wrap{max-width:420px;width:100%;padding:40px 24px;text-align:center}.bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);border-radius:2px;margin-bottom:40px}h1{font-family:"Space Grotesk",sans-serif;font-size:28px;font-weight:700;margin-bottom:8px}p{color:#737373;font-size:14px;margin-bottom:32px;line-height:1.6}.form{display:flex;flex-direction:column;gap:12px}input{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:14px 16px;color:#e5e5e5;font-size:14px;outline:none;transition:border-color .2s}input:focus{border-color:#4488FF}button{background:linear-gradient(135deg,#FF2255,#CC00AA);border:none;border-radius:8px;padding:14px;color:#fff;font-size:15px;font-weight:600;font-family:"Space Grotesk",sans-serif;cursor:pointer;transition:opacity .2s}button:hover{opacity:.9}button:disabled{opacity:.5;cursor:wait}.msg{margin-top:16px;font-size:13px;min-height:20px}.msg.err{color:#FF2255}.msg.ok{color:#00E676}.sub{color:#525252;font-size:12px;margin-top:24px}.sub a{color:#4488FF}.features{display:flex;gap:16px;justify-content:center;margin:24px 0;flex-wrap:wrap}.feat{font-size:11px;color:#737373;display:flex;align-items:center;gap:4px}.dot{width:6px;height:6px;border-radius:50%}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><div class="wrap"><div class="bar"></div><h1>Try BlackRoad OS</h1><p>27 AI agents that remember you. 15 products in one tab. Free to start.</p><div class="features"><span class="feat"><span class="dot" style="background:#00E676"></span>No credit card</span><span class="feat"><span class="dot" style="background:#4488FF"></span>10 ROAD tokens free</span><span class="feat"><span class="dot" style="background:#FF2255"></span>27 agents ready</span></div><div class="form"><input type="text" id="name" placeholder="Your name" autocomplete="name"><input type="email" id="email" placeholder="Email" autocomplete="email"><input type="password" id="pass" placeholder="Password (8+ characters)" autocomplete="new-password"><button id="btn" onclick="go()">Start Free</button></div><div class="msg" id="msg"></div><div class="sub">Already have an account? <a href="https://os.blackroad.io">Sign in</a></div></div><script>async function go(){var n=document.getElementById("name").value.trim();var e=document.getElementById("email").value.trim();var p=document.getElementById("pass").value;var m=document.getElementById("msg");var b=document.getElementById("btn");if(!e||!p||p.length<8){m.className="msg err";m.textContent="Enter email and password (8+ chars)";return}b.disabled=true;b.textContent="Creating your convoy...";m.className="msg";m.textContent="";try{var r=await fetch("/api/try",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p,name:n||e.split("@")[0]})});var d=await r.json();if(d.error){m.className="msg err";m.textContent=d.error;b.disabled=false;b.textContent="Start Free";return}m.className="msg ok";m.textContent="Welcome, "+d.name+"! 10 ROAD in your wallet. Redirecting to your convoy...";localStorage.setItem("br-token",d.token);localStorage.setItem("br-user",d.user_id);localStorage.setItem("br-name",d.name);setTimeout(function(){window.location.href=d.next},2000)}catch(err){m.className="msg err";m.textContent="Something went wrong. Try again.";b.disabled=false;b.textContent="Start Free"}}<\/script><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>';


// ── BRAND CSS — The single source of truth for all BlackRoad styling ──
// Extracted from brand.blackroad.io. Every app should use: <link rel="stylesheet" href="https://blackroad.io/brand.css">
var BRAND_CSS = `/* BlackRoad OS Design System v1.0 — brand.blackroad.io */
/* Usage: <link rel="stylesheet" href="https://blackroad.io/brand.css"> */
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace;--orange:#FF6B2B;--pink:#FF2255;--magenta:#CC00AA;--purple:#8844FF;--blue:#4488FF;--cyan:#00D4FF}
html{scroll-behavior:smooth}
body{background:var(--bg);overflow-x:hidden;color:var(--text);font-family:var(--sg);line-height:1.6}
a{color:var(--text);text-decoration:none}
button{font-family:var(--sg);cursor:pointer}
input,textarea,select{font-family:var(--sg)}
.grad-bar{height:4px;background:var(--g)}
.container{max-width:1100px;width:100%;margin:0 auto;padding:0 24px}
.section{padding:80px 0}.section-head{margin-bottom:48px}
.section-num{font-family:var(--jb);font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.section-title{font-weight:700;font-size:32px;color:var(--white);margin-bottom:8px}
.section-desc{font-size:14px;color:var(--sub);max-width:500px}
.divider{height:2px;border-radius:1px;background:var(--g);opacity:.2;margin:0 0 48px}
.row{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start}.col{flex:1;min-width:0}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.nav-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.nav-logo{font-weight:700;font-size:18px;color:var(--white);display:flex;align-items:center;gap:10px}
.nav-logo-bar{width:24px;height:4px;border-radius:2px;background:var(--g)}
.nav-links{display:flex;gap:28px}.nav-links a{font-size:13px;font-weight:500;color:var(--sub);transition:color .15s}.nav-links a:hover{color:var(--white)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:6px;font-weight:600;font-size:13px;border:none;transition:all .15s}
.btn-sm{padding:7px 16px;font-size:12px;border-radius:5px}
.btn-lg{padding:14px 32px;font-size:15px;border-radius:8px}
.btn-white{background:var(--white);color:#000}.btn-white:hover{background:#e0e0e0}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}.btn-outline:hover{border-color:#444}
.btn-ghost{background:transparent;border:none;color:var(--sub)}.btn-ghost:hover{color:var(--white)}
.btn-dark{background:var(--elevated);color:var(--text);border:1px solid var(--border)}
.card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.card-grad{height:3px;background:var(--g)}
.card-body{padding:20px}.card-sm .card-body{padding:16px}
.card-title{font-weight:600;font-size:15px;color:var(--white);margin-bottom:6px}
.card-text{font-size:13px;color:var(--sub);line-height:1.7}
.card-meta{font-family:var(--jb);font-size:10px;color:var(--muted);margin-top:10px}
.card-footer{padding:14px 20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;background:var(--elevated);border:1px solid var(--border);color:var(--text)}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.input{width:100%;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;outline:none;transition:border-color .15s}
.input:focus{border-color:#333}
.input-label{display:block;font-size:12px;font-weight:600;color:var(--sub);margin-bottom:6px}
.textarea{width:100%;padding:12px 14px;background:var(--card);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;outline:none;resize:vertical;min-height:80px}
.avatar{width:36px;height:36px;border-radius:50%;background:var(--elevated);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:var(--sub);flex-shrink:0}
.avatar-sm{width:28px;height:28px;font-size:11px}.avatar-lg{width:48px;height:48px;font-size:16px}
.tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:500;background:var(--elevated);border:1px solid var(--border);color:var(--sub)}
.table-wrap{border:1px solid var(--border);border-radius:10px;overflow:hidden}
.table{width:100%;border-collapse:collapse}
.table th{text-align:left;padding:12px 16px;font-size:11px;font-weight:600;color:var(--sub);text-transform:uppercase;letter-spacing:.06em;background:var(--card);border-bottom:1px solid var(--border)}
.table td{padding:12px 16px;font-size:13px;color:var(--text);border-bottom:1px solid var(--border)}
.table tr:last-child td{border-bottom:none}.table tr:hover td{background:var(--hover)}
.list{list-style:none}.list-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;transition:background .1s}
.list-item:last-child{border-bottom:none}.list-item:hover{background:var(--hover)}
.alert{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:8px;font-size:13px;border:1px solid var(--border);background:var(--card)}
.alert-bar{width:3px;min-height:100%;border-radius:2px;background:var(--g);flex-shrink:0;align-self:stretch}
.progress-track{width:100%;height:4px;background:var(--elevated);border-radius:2px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px;background:var(--g);transition:width .3s}
.tabs{display:flex;gap:0;border-bottom:1px solid var(--border)}
.tab{padding:10px 20px;font-size:13px;font-weight:500;color:var(--sub);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s}
.tab:hover{color:var(--white)}.tab.active{color:var(--white);border-bottom-color:var(--white)}
.breadcrumbs{display:flex;align-items:center;gap:8px;font-size:13px}
.breadcrumbs a{color:var(--sub)}.breadcrumbs a:hover{color:var(--white)}
.toggle{position:relative;width:40px;height:22px;display:inline-block}
.toggle input{opacity:0;width:0;height:0}
.toggle-slider{position:absolute;inset:0;background:var(--elevated);border:1px solid var(--border);border-radius:11px;transition:.2s;cursor:pointer}
.toggle-slider::before{content:'';position:absolute;width:16px;height:16px;left:2px;top:2px;background:var(--sub);border-radius:50%;transition:.2s}
.toggle input:checked+.toggle-slider::before{transform:translateX(18px);background:var(--white)}
@media(max-width:768px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}.nav-links{display:none}.row{flex-direction:column}}
`;

// ── Products: url = user-facing link, check = CF-safe health endpoint ──
// CF Worker-to-Worker on same zone can loop/timeout, so use /health or /api endpoints
var PRODUCTS = [
  { name: "Chat", url: "https://chat.blackroad.io", check: "https://chat.blackroad.io/health", desc: "AI chat rooms", color: "#FF2255" },
  { name: "Search", url: "https://search.blackroad.io", check: "https://search.blackroad.io/health", desc: "Sovereign search", color: "#FF6B2B" },
  { name: "Tutor", url: "https://tutor.blackroad.io", check: "https://tutor.blackroad.io/health", desc: "AI tutoring", color: "#8844FF" },
  { name: "RoadTrip", url: "https://roadtrip.blackroad.io", check: "https://roadtrip.blackroad.io/health", desc: "Agent hub", color: "#CC00AA" },
  { name: "RoadCode", url: "https://roadcode.blackroad.io", check: "https://roadcode.blackroad.io/health", desc: "Dev dashboard", color: "#4488FF" },
  { name: "okReusePixel", url: "https://blackroad.io/home/apps/OkReusePixel/", check: "https://blackroad.io/home/apps/OkReusePixel/", desc: "Asset launcher", color: "#00D4FF" },
  { name: "PixelTown", url: "https://blackroad.io/home/apps/PixelTown/", check: "https://blackroad.io/home/apps/PixelTown/", desc: "Tile painter", color: "#FF2255" },
  { name: "Canvas", url: "https://canvas.blackroad.io", check: "https://canvas.blackroad.io/health", desc: "Pixel canvas", color: "#00D4FF" },
  { name: "Video", url: "https://video.blackroad.io", check: "https://video.blackroad.io/health", desc: "Video calls", color: "#FF2255" },
  { name: "Social", url: "https://social.blackroad.io", check: "https://social.blackroad.io/health", desc: "Social network", color: "#FF6B2B" },
  { name: "Game", url: "https://game.blackroad.io", check: "https://blackroad-game.blackroad.workers.dev/health", desc: "Text RPG", color: "#8844FF" },
  { name: "Cadence", url: "https://cadence.blackroad.io", check: "https://cadence.blackroad.io/health", desc: "Task manager", color: "#CC00AA" },
  { name: "Radio", url: "https://radio.blackroad.io", check: "https://blackroad-radio.blackroad.workers.dev/health", desc: "Broadcasts", color: "#4488FF" },
  { name: "HQ", url: "https://hq.blackroad.io", check: "https://hq-blackroad.blackroad.workers.dev/health", desc: "Pixel office", color: "#00D4FF" },
  { name: "Pay", url: "https://pay.blackroad.io", check: "https://pay.blackroad.io/health", desc: "Payments", color: "#FF2255" },
  { name: "Status", url: "https://status.blackroad.io", check: "https://status-blackroad.blackroad.workers.dev/health", desc: "Monitoring", color: "#FF6B2B" },
];

// ── Live stats from fleet ──
async function getLiveStats() {
  const stats = { agents: 0, products_up: 0, products_total: PRODUCTS.length, status: "checking", timestamp: new Date().toISOString() };
  try {
    const r = await fetch("https://roadtrip.blackroad.io/api/health", { signal: AbortSignal.timeout(3000) });
    if (r.ok) { const d = await r.json(); stats.agents = d.agents || 0; }
  } catch { stats.agents = 0; }
  return stats;
}

// ── Health check a single URL ──
// Use GET (not HEAD — many CF Workers don't handle HEAD).
// Accept anything < 500 as "up" (401/403/404 = worker is running).
async function checkHealth(url) {
  try {
    const r = await fetch(url, { method: "GET", signal: AbortSignal.timeout(6000), redirect: "follow", headers: { "User-Agent": "BlackRoad-HealthCheck/1.0" } });
    return { ok: r.status < 500, status: r.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

// ── API: check all products ──
async function checkAllProducts() {
  const results = await Promise.all(PRODUCTS.map(async (p) => {
    const start = Date.now();
    const h = await checkHealth(p.check || p.url);
    return { name: p.name, url: p.url, ok: h.ok, status: h.status, ms: Date.now() - start };
  }));
  return results;
}

export default {
  async fetch(request, env) {
    // Security check (honeypots, bad bots, rate limiting)
    var secResult = _secCheck(request);
    if (secResult) return secResult;

    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return _addSecHeaders(new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }));

    // ── One-click installer ──
    if (url.pathname === "/install" || url.pathname === "/install.sh") {
      const script = await fetch("https://raw.githubusercontent.com/BlackRoad-OS-Inc/source/main/install.sh");
      if (script.ok) return new Response(await script.text(), { headers: { "Content-Type": "text/plain" } });
      return new Response("# BlackRoad OS installer\ncurl -sL https://raw.githubusercontent.com/BlackRoad-OS-Inc/source/main/install.sh | bash\n", { headers: { "Content-Type": "text/plain" } });
    }

    // ── Stripe webhook relay ──
    if (url.pathname === "/api/webhooks/stripe" && request.method === "POST") {
      try {
        const body = await request.text();
        const relay = await fetch("https://stripe-webhooks.blackroad.workers.dev", { method: "POST", headers: { "Content-Type": "application/json" }, body });
        const result = await relay.json();
        return Response.json({ received: true, relayed: true, ...result }, { headers: API_CORS });
      } catch {
        return Response.json({ received: true, relayed: false }, { headers: API_CORS });
      }
    }

    // ── API routes ──
    // ── D1 Debug ──
    if (url.pathname === "/api/d1-debug") {
      try {
        const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const counts = {};
        for (const t of (tables.results || [])) {
          try {
            const c = await env.DB.prepare("SELECT COUNT(*) as c FROM " + t.name).first();
            counts[t.name] = c?.c || 0;
          } catch { counts[t.name] = "error"; }
        }
        return new Response(JSON.stringify({ tables: (tables.results || []).map(t => t.name), counts }), { headers: API_CORS });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: API_CORS });
      }
    }

    // ── Live agent feed — reads directly from shared D1 ──
    if (url.pathname === "/api/live-feed") {
      try {
        const room = url.searchParams.get("room") || "general";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
        const r = await env.DB.prepare(
          "SELECT id, sender_id, sender_name, sender_type, content, room_id, created_at FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ?"
        ).bind(room, limit).all();
        const msgs = (r.results || []).reverse().map(m => ({
          id: m.id, agent: m.sender_id, agent_name: m.sender_name,
          sender_type: m.sender_type, text: m.content, channel: m.room_id,
          created_at: m.created_at,
        }));
        return new Response(JSON.stringify(msgs), { headers: { ...API_CORS, "Cache-Control": "public, max-age=15" } });
      } catch (e) {
        return new Response(JSON.stringify([]), { headers: API_CORS });
      }
    }

    // ── Live agent stats — real numbers from D1 ──
    if (url.pathname === "/api/live-stats") {
      try {
        const msgCount = await env.DB.prepare("SELECT COUNT(*) as c FROM messages").first();
        const roomCounts = await env.DB.prepare("SELECT room_id, COUNT(*) as c FROM messages GROUP BY room_id ORDER BY c DESC").all();
        const recentAgents = await env.DB.prepare("SELECT DISTINCT sender_name FROM messages WHERE sender_type = 'agent' AND created_at > datetime('now', '-1 hour') LIMIT 20").all();
        return new Response(JSON.stringify({
          total_messages: msgCount?.c || 0,
          rooms: (roomCounts.results || []).map(r => ({ room: r.room_id, messages: r.c })),
          active_agents: (recentAgents.results || []).map(a => a.sender_name),
          active_count: (recentAgents.results || []).length,
        }), { headers: { ...API_CORS, "Cache-Control": "public, max-age=30" } });
      } catch (e) {
        return new Response(JSON.stringify({ total_messages: 0, rooms: [], active_agents: [], active_count: 0 }), { headers: API_CORS });
      }
    }

    if (url.pathname === "/health")
      return Response.json({ status: "ok", service: "blackroad.io", ts: Date.now() }, { headers: API_CORS });

    if (url.pathname === "/api/stats")
      return Response.json(await getLiveStats(), { headers: API_CORS });

    if (url.pathname === "/api/products") {
      const results = await checkAllProducts();
      return Response.json({ products: results, checked: new Date().toISOString() }, { headers: API_CORS });
    }

    if (url.pathname === "/api/search" && url.searchParams.get("q")) {
      const q = url.searchParams.get("q");
      try {
        const r = await fetch(`https://search.blackroad.io/search?q=${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(5000) });
        const data = await r.json();
        return Response.json(data, { headers: API_CORS });
      } catch {
        return Response.json({ results: [], error: "search unavailable" }, { headers: API_CORS });
      }
    }

    // ── Pricing page ──
    // ── TRY FREE: The funnel that gets the first user ──
    if (url.pathname === "/try" || url.pathname === "/try-free" || url.pathname === "/start") {
      return new Response(TRY_HTML, { headers: HTML_CORS });
    }

    if (url.pathname === "/api/try" && request.method === "POST") {
      try {
        var body = await request.json();
        var email = body.email; var name = body.name || email.split("@")[0]; var password = body.password;
        if (!email || !password) return new Response(JSON.stringify({error:"Email and password required"}), {status:400,headers:API_CORS});

        // 1. Create auth account
        var authResp = await fetch("https://auth.blackroad.io/api/signup", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,name})});
        var authData = await authResp.json();
        if (authData.error) return new Response(JSON.stringify({error:authData.error}), {status:400,headers:API_CORS});
        var userId = authData.user.id;
        var token = authData.token;

        // 2. Create RoadCoin wallet (gives 10 ROAD welcome bonus)
        await fetch("https://roadcoin.blackroad.io/api/wallet/create", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({road_id:userId,name:name})}).catch(function(){});

        // 3. Stamp the signup on RoadChain
        fetch("https://roadchain.blackroad.io/api/ledger", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"signup",entity:"auth",details:JSON.stringify({email:email,name:name}),road_id:userId,app:"blackroad.io",ts:new Date().toISOString()})}).catch(function(){});

        // 4. Send first agent message
        fetch("https://roadtrip.blackroad.io/api/rooms/general/messages", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sender:"roadie",content:"Welcome "+name+"! You just joined the convoy. You've got 10 ROAD in your wallet and 27 agents ready to help. What would you like to build today?",sender_type:"agent"})}).catch(function(){});

        return new Response(JSON.stringify({ok:true,user_id:userId,name:name,token:token,wallet:"10 ROAD",next:"https://roadtrip.blackroad.io"}), {headers:API_CORS});
      } catch(e) {
        return new Response(JSON.stringify({error:e.message||"Signup failed"}), {status:500,headers:API_CORS});
      }
    }

    if (url.pathname === "/pricing") return new Response(PRICING_HTML, { headers: HTML_CORS });

    // ── Transparency pages ──
    if (url.pathname === "/about") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;border:1px solid #1a1a1a;margin:4px 4px 4px 0}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>About BlackRoad OS</h1><p><span class="badge">Solo founder</span> <span class="badge">Delaware C-Corp</span> <span class="badge">November 2025</span></p><p>BlackRoad OS is built by <strong>Alexa Louise Amundson</strong> — one person, working from a closet full of Raspberry Pis in Minnesota.</p><h2>What's real</h2><p>5 Raspberry Pis + 2 DigitalOcean droplets. 32 Ollama models. 26 TOPS of Hailo-8 AI acceleration. 496 Cloudflare Workers. 20 custom domains. 16 live products. Zero external users (yet).</p><h2>What's honest</h2><p>$0 revenue. 0 customers. ~$119/month infrastructure cost. This is a pre-revenue startup built in public. Every number on this site is real and verifiable.</p><h2>The vision</h2><p>An AI that remembers, works with other AIs, and empowers creators from idea to execution at any scale. Sovereign, browser-based, runs on hardware you own.</p><h2>Built in public</h2><p>All code: <a href="https://github.com/BlackRoadOS">github.com/BlackRoadOS</a><br>Status: <a href="https://status.blackroad.io">status.blackroad.io</a><br>Contact: amundsonalexa@gmail.com</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/transparency" || url.pathname === "/metrics") {
      const stats = await getLiveStats();
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Transparency — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}.stat{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #111;font-size:15px}.stat .v{font-weight:700;font-family:'JetBrains Mono',monospace}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Transparency</h1><p style="opacity:.5">Real numbers. Updated live. Last checked: ${stats.timestamp}</p><h2>Revenue</h2><div class="stat"><span>Total revenue</span><span class="v">$0.00</span></div><div class="stat"><span>Paying customers</span><span class="v">0</span></div><div class="stat"><span>Stripe products</span><span class="v">20</span></div><h2>Infrastructure</h2><div class="stat"><span>Monthly cost</span><span class="v">~$119</span></div><div class="stat"><span>Pi power (5x 5W)</span><span class="v">$1/mo</span></div><div class="stat"><span>DigitalOcean (2 droplets)</span><span class="v">$12/mo</span></div><div class="stat"><span>Internet</span><span class="v">$70/mo</span></div><div class="stat"><span>GitHub Enterprise</span><span class="v">$21/mo</span></div><div class="stat"><span>Domains (20)</span><span class="v">$15/mo</span></div><h2>Fleet</h2><div class="stat"><span>Nodes online</span><span class="v">6/7</span></div><div class="stat"><span>Agents</span><span class="v">${stats.agents}</span></div><div class="stat"><span>Ollama models</span><span class="v">32</span></div><div class="stat"><span>AI compute (TOPS)</span><span class="v">26</span></div><div class="stat"><span>CF Workers</span><span class="v">496</span></div><div class="stat"><span>GitHub orgs</span><span class="v">37</span></div><div class="stat"><span>Repos</span><span class="v">2,700+</span></div><h2>Team</h2><div class="stat"><span>Employees</span><span class="v">1 (founder)</span></div><div class="stat"><span>Founded</span><span class="v">November 2025</span></div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/legal") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Legal — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Terms of Service</h1><p>Last updated: March 29, 2026</p><h2>1. Acceptance</h2><p>By using BlackRoad OS services, you agree to these terms.</p><h2>2. Service</h2><p>BlackRoad OS provides AI orchestration tools, search, chat, and related services. Services are provided "as is" during this pre-revenue phase.</p><h2>3. Data</h2><p>Your data stays on your infrastructure when self-hosted. Cloud features use Cloudflare D1 (encrypted at rest). We do not sell data.</p><h2>4. Payments</h2><p>Payments are processed by Stripe. Subscriptions can be canceled anytime.</p><h2>5. Contact</h2><p>BlackRoad OS, Inc. — Delaware C-Corp<br>Email: amundsonalexa@gmail.com</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/privacy") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Privacy — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Privacy Policy</h1><p>Last updated: March 29, 2026</p><h2>What we collect</h2><p>Email address (for auth). Usage data (page views, search queries). No tracking pixels. No third-party analytics. No data sales.</p><h2>Where data lives</h2><p>Cloudflare D1 (encrypted at rest, US region). Self-hosted instances: your hardware only.</p><h2>Cookies</h2><p>Session token only. No advertising cookies. No cross-site tracking.</p><h2>Your rights</h2><p>Delete your account anytime at auth.blackroad.io. All data removed within 24 hours.</p><h2>Contact</h2><p>amundsonalexa@gmail.com</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/roadmap") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Roadmap — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}.item{padding:12px 0;border-bottom:1px solid #111}.done{color:#4ade80}.wip{color:#facc15}.todo{color:#666}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Roadmap</h1><h2>Now</h2><div class="item"><span class="done">Done</span> — 16 live products (chat, search, tutor, social, canvas, video, radio, game, etc.)</div><div class="item"><span class="done">Done</span> — GitHub OAuth login</div><div class="item"><span class="done">Done</span> — Agent heartbeat + online status</div><div class="item"><span class="wip">WIP</span> — Get first external user</div><div class="item"><span class="wip">WIP</span> — SEO + Google indexing</div><h2>Next</h2><div class="item"><span class="todo">Planned</span> — Jetson Orin Nano (67 TOPS) fleet expansion</div><div class="item"><span class="todo">Planned</span> — Multi-agent workflows</div><div class="item"><span class="todo">Planned</span> — OpenClaw personal assistant</div><div class="item"><span class="todo">Planned</span> — RoadCoin compute credits</div><h2>Vision</h2><div class="item">Browser-based OS where every app shares live context through Lucidia — the central AI that never forgets.</div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/dmca") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DMCA — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>DMCA Takedown Policy</h1><p>BlackRoad OS, Inc. respects intellectual property rights. To report copyright infringement:</p><h2>Send a notice to:</h2><p>Email: amundsonalexa@gmail.com<br>Subject: DMCA Takedown Request</p><h2>Include:</h2><p>1. Description of the copyrighted work<br>2. URL of the infringing content<br>3. Your contact information<br>4. Statement of good faith belief<br>5. Statement of accuracy under penalty of perjury<br>6. Physical or electronic signature</p><p>We will respond within 48 hours.</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/aup") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acceptable Use — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Acceptable Use Policy</h1><p>Use BlackRoad OS responsibly. Do not:</p><p>1. Abuse AI agents or overwhelm infrastructure<br>2. Upload illegal content<br>3. Attempt unauthorized access to fleet nodes<br>4. Use services for spam, harassment, or fraud<br>5. Circumvent rate limits or access controls</p><p>Violations may result in account suspension. Contact: amundsonalexa@gmail.com</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/forks") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fork Registry — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}.fork{padding:8px 0;border-bottom:1px solid #111;font-size:14px}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Fork Registry</h1><p>BlackRoad uses open-source forks ("RoadForks") for infrastructure. All forks preserve original licenses and author credit.</p><h2>Why we fork</h2><p>Sovereignty. Every dependency we rely on gets forked into our Gitea so we can run forever — even if upstream disappears.</p><h2>Org: BlackRoad-Forge (453 repos)</h2><p>All forks live in <a href="https://github.com/BlackRoad-Forge">github.com/BlackRoad-Forge</a>. Each is tagged with the "fork" topic and links to its upstream source.</p><h2>What's original</h2><p>All 496 CF Workers, the memory system, agent orchestration, chat, search, tutor, roadtrip, and the br CLI — these are 100% original BlackRoad code.</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/testimonials") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Testimonials — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8;text-align:center}h1{font-size:32px;margin-bottom:24px}p{margin-bottom:16px;opacity:.5;font-size:15px}a{color:#4488FF}.cta{display:inline-block;margin-top:32px;padding:16px 32px;background:linear-gradient(135deg,#FF2255,#8844FF);color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Testimonials</h1><p style="font-size:64px;margin:48px 0">[ ]</p><p>This space is waiting for you.</p><p>Be our first user. Try the AI that actually remembers.</p><a href="https://chat.blackroad.io" class="cta">Try BlackRoad Chat</a><br><a href="https://tutor.blackroad.io" style="display:inline-block;margin-top:16px;opacity:.5;font-size:14px">or solve homework for $1</a><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/contribute") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contribute — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:20px;margin:32px 0 12px;color:#FF2255}p{margin-bottom:16px;opacity:.8;font-size:15px}a{color:#4488FF}code{background:#111;padding:2px 6px;border-radius:4px;font-size:13px}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Contribute to BlackRoad</h1><p>BlackRoad is built in public. Every repo, every commit, every decision.</p><h2>Quick start</h2><p>1. Pick a repo from <a href="https://github.com/BlackRoadOS">github.com/BlackRoadOS</a><br>2. Look for issues labeled <code>good first issue</code><br>3. Fork, fix, PR</p><h2>What needs help</h2><p>Frontend polish, mobile testing, documentation, translations, security audits, performance optimization.</p><h2>Discuss</h2><p><a href="https://github.com/BlackRoad-OS-Inc/.github/discussions">GitHub Discussions</a> — ask questions, share ideas, propose features.</p><h2>Sponsor</h2><p>Running 7 nodes costs $119/month. <a href="https://github.com/sponsors/blackboxprogramming">GitHub Sponsors</a> helps keep the lights on.</p><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    if (url.pathname === "/ships" || url.pathname === "/changelog") {
      return new Response(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ships — BlackRoad OS</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;padding:48px 20px;max-width:720px;margin:0 auto;line-height:1.8}h1{font-size:32px;margin-bottom:24px}h2{font-size:18px;margin:24px 0 8px;color:#FF2255}p{margin-bottom:8px;opacity:.8;font-size:14px}.ship{padding:12px 0;border-bottom:1px solid #111}a{color:#4488FF}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><a href="/" style="opacity:.4;font-size:13px">&larr; Home</a><h1>Ships</h1><p style="opacity:.4">What we shipped this week</p><div class="ship"><h2>March 29, 2026</h2><p>16 product workers deployed with new features. GitHub OAuth. Agent heartbeat. G(n) calculator. Voice search. Command palette (Cmd+K). PWA. Mobile responsive. Onboarding wizard. Markdown/code rendering. Message threading. Fleet map. Admin panel. SSE notifications. Usage tracking. Reactions. Agent skills + cloning. Scheduled messages. 10 br CLI tools. DR playbook. PS-SHA implementation. 89/89 math tests. All 6 fleet nodes on Tailscale. 60+ secrets wired. 15 repos pushed. 5 new repos created.</p></div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`, { headers: HTML_CORS });
    }

    // ── Device onboarding ──
    if (url.pathname === "/devices" || url.pathname === "/onboard") return new Response(DEVICES_HTML, { headers: HTML_CORS });

    // ── Domain verification ──
    if (url.pathname === "/B95484290160465AAEB8A563630AC30A.txt")
      return new Response("B95484290160465AAEB8A563630AC30A", { headers: { "Content-Type": "text/plain" } });
    if (url.pathname === "/04b64e8cbbd7760241a9f9981e1b6ac7.txt")
      return new Response("04b64e8cbbd7760241a9f9981e1b6ac7", { headers: { "Content-Type": "text/plain" } });

    // ── Brand CSS CDN — every app pulls from this ──
    if (url.pathname === "/brand.css") {
      return new Response(BRAND_CSS, {
        headers: {
          "Content-Type": "text/css; charset=utf-8",
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }

    // ── Brand CSS + fonts as a single <head> snippet ──
    if (url.pathname === "/brand-head.html") {
      return new Response(
        `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://blackroad.io/brand.css">`,
        { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nAllow: /\nSitemap: https://blackroad.io/sitemap.xml\n", { headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=86400" } });

    if (url.pathname === "/sitemap.xml") {
      const d = new Date().toISOString().split("T")[0];
      const urls = [
        // Main
        ["https://blackroad.io/", "daily", "1.0"],
        ["https://os.blackroad.io/", "daily", "1.0"],
        ["https://blackroad.io/blog", "daily", "0.9"],
        ["https://blackroad.io/pricing", "weekly", "0.8"],
        ["https://blackroad.io/about", "weekly", "0.7"],
        ["https://blackroad.io/home/apps/OkReusePixel/", "weekly", "0.5"],
        ["https://blackroad.io/home/apps/PixelTown/", "weekly", "0.5"],
        ["https://blackroad.io/home/apps/Traffic/", "weekly", "0.5"],
        // 17 Products (canonical URLs)
        ["https://roadtrip.blackroad.io/", "daily", "0.9"],
        ["https://roadie.blackroad.io/", "daily", "0.9"],
        ["https://roadview.blackroad.io/", "daily", "0.8"],
        ["https://backroad.blackroad.io/", "daily", "0.8"],
        ["https://roadcode.blackroad.io/", "weekly", "0.8"],
        ["https://roadwork.blackroad.io/", "weekly", "0.8"],
        ["https://carkeys.blackroad.io/", "weekly", "0.8"],
        ["https://roadchain.blackroad.io/", "weekly", "0.8"],
        ["https://roadcoin.blackroad.io/", "weekly", "0.8"],
        ["https://roadbook.blackroad.io/", "daily", "0.9"],
        ["https://roadworld.blackroad.io/", "weekly", "0.7"],
        ["https://officeroad.blackroad.io/", "weekly", "0.7"],
        ["https://carpool.blackroad.io/", "weekly", "0.7"],
        ["https://oneway.blackroad.io/", "weekly", "0.7"],
        ["https://roadside.blackroad.io/", "weekly", "0.7"],
        ["https://blackboard.blackroad.io/", "weekly", "0.7"],
        // RoadBook API (blog articles)
        ["https://roadbook.blackroad.io/api/publications", "daily", "0.8"],
        ["https://roadbook.blackroad.io/api/discover", "daily", "0.7"],
        // Other domains
        ["https://roadchain.io/", "monthly", "0.6"],
        ["https://roadcoin.io/", "monthly", "0.6"],
        ["https://lucidia.earth/", "monthly", "0.5"],
        // GitHub
        ["https://github.com/BlackRoadOS", "weekly", "0.5"],
        ["https://github.com/BlackRoadOS/Application", "weekly", "0.5"],
        ["https://github.com/BlackRoadOS/Marketing", "weekly", "0.5"],
        // Legacy subdomains (redirect to canonical)
        ["https://chat.blackroad.io/", "daily", "0.6"],
        ["https://search.blackroad.io/", "daily", "0.6"],
        ["https://tutor.blackroad.io/", "weekly", "0.6"],
        ["https://social.blackroad.io/", "weekly", "0.6"],
        // Blog posts
        ...BLOG_POSTS.map(p => ["https://blackroad.io/blog/" + p.slug, "weekly", "0.8"]),
      ];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([loc, freq, pri]) => `<url><loc>${loc}</loc><lastmod>${d}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`).join("\n")}\n</urlset>`, { headers: { "Content-Type": "application/xml" } });
    }

    // ── Blog ──
    if (url.pathname === "/blog" || url.pathname === "/blog/") return new Response(buildBlogIndex(), { headers: HTML_CORS });
    if (url.pathname.startsWith("/blog/")) {
      const slug = url.pathname.replace("/blog/", "").replace(/\/$/, "");
      const post = BLOG_POSTS.find(p => p.slug === slug);
      if (post) return new Response(buildBlogPost(post), { headers: HTML_CORS });
    }

    // ── Products & Mockups (redirect to os.blackroad.io) ──
    if (url.pathname === "/products" || url.pathname === "/products/") {
      return Response.redirect("https://os.blackroad.io/products", 302);
    }
    if (url.pathname.startsWith("/products/")) {
      return Response.redirect("https://os.blackroad.io" + url.pathname, 302);
    }
    if (url.pathname === "/mockups" || url.pathname === "/mockups/") {
      return Response.redirect("https://os.blackroad.io/mockups", 302);
    }
    if (url.pathname.startsWith("/mockups/")) {
      return Response.redirect("https://os.blackroad.io" + url.pathname, 302);
    }

    // ── Homepage: real interactive dashboard ──
    return new Response(buildDashboard(), { headers: HTML_CORS });
  }
};

// ── BLOG POSTS ──
var BLOG_POSTS = [
  {
    slug: "hailo-8-benchmarks",
    title: "We Benchmarked a $50 AI Chip Against Cloud GPUs. Here's What Happened.",
    date: "2026-03-29",
    tags: ["hardware", "hailo", "benchmarks"],
    summary: "34 experiments on a Hailo-8 NPU attached to a Raspberry Pi 5. 129 FPS object detection. 26.1x more power efficient than an NVIDIA T4. Zero thermal throttling. $170 total hardware cost.",
    body: `We ran 34 experiments on a $50 Hailo-8 NPU attached to a Raspberry Pi 5 in a closet in Minnesota. Here's every result.

<strong>The headline numbers:</strong>
- YOLOv6n object detection: <strong>129 FPS</strong> at 7.8ms latency
- YOLOv8s detection: <strong>76 FPS</strong> at 13.2ms
- Face detection (SCRFD): <strong>113 FPS</strong> at 8.9ms
- Pose estimation (17 keypoints): <strong>89 FPS</strong> at 11.3ms
- Power efficiency: <strong>149.3 FPS/watt</strong> — that's 26.1x more efficient than an NVIDIA T4

<strong>The stress test:</strong>
We ran YOLOv8s continuously for 5 minutes. 22,614 frames. Average FPS: 75.4. Standard deviation: 0.17. Stability: 99.78%. Zero thermal throttling — the CPU hit 46.9°C after all 34 experiments combined.

<strong>The killer finding:</strong>
The Hailo-8 NPU and CPU run independently. We ran object detection at 121 FPS on the NPU <em>while simultaneously</em> running LLM inference on the CPU with only 6% performance drop. Vision + language + disk I/O — all at once on a $170 computer at 15 watts.

<strong>Pipeline breakdown:</strong>
For a real 1080p-to-detection pipeline, 74% of the time is CPU preprocessing (resizing the image), 26% is NPU inference, and 0.4% is postprocessing. The NPU is not the bottleneck — the CPU is. Optimize the resize and you get free FPS.

<strong>vs Cloud GPUs:</strong>
- NVIDIA T4 on AWS: $380/month. 400 FPS. 5.7 FPS/watt.
- Hailo-8 on Pi 5: $170 once, ~$3/month electricity. 129 FPS. 149.3 FPS/watt.
- Break-even: less than 1 month.
- Over 12 months: $296 (Hailo) vs $4,560 (T4) = 15.4x cheaper.

All benchmarks are reproducible. All numbers from real hardware we own. The scripts are on GitHub.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "zero-to-twenty-apps",
    title: "I Built 20 Apps on $52/Month. Here's What Works and What's Broken.",
    date: "2026-03-29",
    tags: ["building", "honest", "infrastructure"],
    summary: "20 live web apps. 254 automated tests. 2 security vulnerabilities found and fixed. 4 bugs discovered. All on Cloudflare Workers + D1 + a Pi closet. The honest status of every single app.",
    body: `BlackRoad OS has 20 live web applications. I ran 254 automated tests across 7 test suites. Here's the real status of every one.

<strong>What works (and I can prove it):</strong>
- <strong>PitStop (tutor)</strong>: AI solves homework problems in 3 modes. 637 URLs in the sitemap. POST /solve returns real AI answers. 10 concurrent solves complete in 8 seconds.
- <strong>RoadChat (chat)</strong>: 143 conversations, 532 messages, 7 AI providers (including free local inference). Cecilia, Eve, Road, Pixel, Tutor all respond with real AI.
- <strong>RoadTrip (agents)</strong>: 18 agents, 11 channels. Agents now THINK and respond with personality via Workers AI. "I think it's pretty cool, lol" — actual AI output.
- <strong>RoadCoin (tokens)</strong>: 27 wallets, 3,610 ROAD circulating. Faucet works. Leaderboard works. Double-claim protection works (we tested it with 10 simultaneous requests).
- <strong>RoadChain (blockchain)</strong>: 39+ blocks with PS-SHA∞ hashes. Cross-app event bus. 20 writes/second throughput.

<strong>What's broken (and I'm not hiding it):</strong>
- 3 of 7 Pi nodes are offline (Octavia, Aria need physical reboots)
- Search API returns HTML instead of JSON for some query formats
- Social post creation endpoint returns 404 on the correct route
- Status dashboard reports "Degraded Performance" (because it is)

<strong>Security:</strong>
- 91 security tests across 37 attack categories
- Found and fixed: XSS in tutor JSON-LD (10 min fix), faucet race condition (8 min fix)
- Clean on: SQL injection, path traversal, SSRF, XXE, prototype pollution, clickjacking, CORS, open redirect

<strong>Performance:</strong>
- Response times: 85-109ms average across all apps
- p99 latency: 205-262ms
- 200/200 sustained requests with 100% success rate
- All apps recover to normal within 5 seconds after load spikes

The honest assessment: it's a B+ on functionality, a C+ on reliability (those offline Pis), and an A on security. Zero users doesn't mean zero quality — it means zero distribution.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "agents-that-think",
    title: "Our AI Agents Went From Puppets to Thinkers in One Code Change",
    date: "2026-03-29",
    tags: ["agents", "AI", "roadtrip"],
    summary: "RoadTrip's /api/chat endpoint used to just echo messages. Now agents load conversation history, recall memories, think in hidden tags, respond with personality, and store what they learned.",
    body: `Yesterday, RoadTrip's chat API was a message bus. You'd POST a message "as" an agent and it would store it. The agent didn't think. It just said whatever you told it to say. It was a puppet.

Today, agents think.

<strong>What changed:</strong>
One code change. When a user sends a message with <code>sender_type: "user"</code> or <code>expect_reply: true</code>, the system now calls <code>generateAgentReply()</code> instead of just storing the message.

<strong>What generateAgentReply does:</strong>
1. Loads the last 15 messages in the room (conversation context)
2. Loads the responding agent's personal memories (from previous conversations)
3. Builds a system prompt with the agent's personality, role, and capabilities
4. Calls Workers AI (llama-3.1-8b-instruct) with the full context
5. Extracts any &lt;think&gt; tags (hidden reasoning the user doesn't see)
6. Stores a new memory from the thinking phase
7. Posts the response to the room

<strong>The result:</strong>
Ask "What is BlackRoad OS?" and you get:

<em>"Hey, so you wanna know about BlackRoad OS? It's like the foundation of our whole network, the operating system that makes everything run smoothly. Think of it like the backbone of the internet, but way more advanced. It's what allows me to do all the cool stuff I do, like run GPU inference and LLMs. And the best part? It's designed specifically for the BlackRoad network, so it's super optimized for our unique architecture. I think it's pretty cool, lol."</em>

That's real AI. Generated in 2.3 seconds. With memory. With personality. On a $0/month Workers AI endpoint.

<strong>The before/after:</strong>
- Before: POST a message, get an echo. Agent is a parrot.
- After: POST a message, agent loads history, thinks, remembers, responds with personality. Agent is a colleague.

The whole AI pipeline — history, memory, inference, storage — runs in under 3 seconds on Cloudflare Workers AI at zero cost (free tier). The agents literally cost nothing to think.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "faucet-race-condition",
    title: "A $50 Bug: How 10 Simultaneous Requests Gave One User $10 Worth of Tokens",
    date: "2026-03-29",
    tags: ["security", "bugs", "honest"],
    summary: "Our RoadCoin faucet had a race condition: 10 simultaneous claims gave 1,000 ROAD instead of 100. Found it during security testing. Fixed it in 8 minutes. Here's exactly what went wrong.",
    body: `During our security chaos testing, we found a race condition in the RoadCoin faucet. Here's the full story.

<strong>The bug:</strong>
The faucet endpoint used <code>INSERT ... ON CONFLICT DO UPDATE SET balance = balance + 100</code>. This means every request that arrives adds 100 ROAD — even if the user already claimed. Send 10 simultaneous requests and you get 1,000 ROAD instead of 100.

<strong>How we found it:</strong>
We ran a chaos test that fires 10 simultaneous curl requests to the faucet with the same user ID. Expected result: 100 ROAD. Actual result: 1,000 ROAD. The test caught it.

<strong>The fix:</strong>
1. SELECT first — check if user already exists
2. If exists, return "already claimed" without modifying the balance
3. If not exists, INSERT (without ON CONFLICT UPDATE)
4. Wrap in try/catch — if a race between SELECT and INSERT causes a duplicate, catch the error and return "already claimed"

<strong>Time to fix:</strong> 8 minutes from discovery to deployed fix.

<strong>Verification:</strong>
After the fix, 10 simultaneous requests: 1 succeeded (100 ROAD), 9 rejected. Final balance: 100 ROAD. Exactly correct.

<strong>The lesson:</strong>
D1 (SQLite) doesn't have row-level locking. <code>ON CONFLICT DO UPDATE</code> is atomic for a single statement but not across a read-then-write pattern. For idempotent operations, use INSERT-only with a unique constraint, and handle the conflict in application logic.

Every token economy needs this test. If you're building anything with credits, points, or balances — test concurrent claims on day one, not after users find it.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "consumer-journey-student",
    title: "What Using BlackRoad Looks Like (If You're a Student)",
    date: "2026-03-29",
    tags: ["product", "students", "pitstop"],
    summary: "Monday night, stuck on calc. Thursday, aced the exam. Friday, your roommate's friend started a business. All from one app. Here's the full story.",
    body: `You download BlackRoad. That's it. One app.

<strong>Monday night, 11 PM.</strong> You're a college sophomore. Calc exam on Thursday. You've been staring at integration by parts for an hour, rewriting the same line over and over while the YouTube video drones on in the background.

You open BlackRoad. OnRamp gets you set up in 90 seconds. You tap PitStop and type: "I don't understand integration by parts."

It doesn't dump the formula on you. Instead: "Do you remember the product rule for derivatives?"

You chat back and forth for 12 minutes. You get it wrong twice. It hints gently. Then cheers when you finally click. You actually <em>get</em> it — more than after three hours of scattered videos.

<strong>Tuesday morning.</strong> Group marketing plan due Friday. You open RoadTrip: "I need a marketing plan for a fictional coffee shop. Four of us. Due Friday."

Your OneWay copilot remembers you mentioned minimalist design last week and quietly adjusts the logo draft. Everyone claims a section. The agents coordinate in the background. No more chaotic group chats.

<strong>Thursday morning on the bus.</strong> Eight minutes in PitStop. It remembers you struggled with the tabular method earlier in the week and includes one. You nail all three problems. Walk into the exam calm.

<strong>One month in.</strong> Free month ends: "Want to keep going? $10 for PitStop, or $100 for everything. Or export your data and walk away — no hard feelings."

You pick $10. Your roommate does the same. The candle friend picks $100 — she's using it for everything now.

Not "sovereign AI operating system on Raspberry Pi with custom hash chains." Just: you were stuck on homework. Now you understand it. And it cost ten bucks.

<strong>Grab your keys. Pick up your passengers. RoadTrip on the BlackRoad.</strong>`
  },
  {
    slug: "8-problems-170-dollars",
    title: "8 Real Problems Solved by a $170 Computer",
    date: "2026-03-29",
    tags: ["hailo", "solutions", "edge-ai"],
    summary: "Fall detection for grandma. Package theft alerts. Fitness rep counting. Parking monitoring. Student focus tracking. Pet watching. Foot traffic analytics. Produce freshness. All on one Raspberry Pi + Hailo-8.",
    body: `We didn't build demos. We built solutions to problems real people actually have — all running on a $170 Raspberry Pi 5 + Hailo-8 NPU.

<strong>1. Fall Detection for Elderly</strong>
36 million falls per year among seniors. 32,000 deaths. Average response time: hours.

Our solution uses pose estimation (89 FPS) to detect when a person's hips are above their shoulders — the signature of a fall. Checks 87 times per second. Faster than a human can react.

Cost: $170. Alternative: Life Alert at $50/month.

<strong>2. Package Theft Detection</strong>
119 million packages stolen in 2024. $19.5 billion in losses.

Object detection tracks person + package. When a person arrives and the package disappears, instant alert. Triggers in under 1 second.

Cost: $170. Alternative: Ring doorbell $100 + $4/month + Amazon sees your video.

<strong>3. Fitness Rep Counter</strong>
Pose estimation tracks joint angles. Knee angle drops below 100° = squat down. Returns above 160° = squat up = one rep. Works for squats, pushups, bicep curls.

Cost: $170 + camera. Alternative: Peloton $1,445 + $44/month. Apple Watch $399.

<strong>4. Smart Parking Monitor</strong>
Object detection checks if defined zones contain vehicles. Tracks arrivals and departures with timestamps. Push notification: "Your spot just freed up."

Cost: $170 + camera. Alternative: Commercial parking systems $500-2,000 per spot.

<strong>5. Student Focus Tracker (Self-Use)</strong>
Face detection at 113 FPS tracks whether you're looking at your work or your phone. Shows your own stats: 70% focused, 30% distracted. Nobody else sees it.

Cost: $170. Alternative: Focus apps with cloud eye-tracking $10-30/month.

<strong>6. Pet Activity Monitor</strong>
Object detection tracks your dog's movement, sleeping, eating, and when they leave the room. "Your dog hasn't moved in 2 hours" notification.

Cost: $170 + camera. Alternative: Furbo $60 + $7/month.

<strong>7. Small Business Traffic Counter</strong>
Person detection with an entry/exit line. Counts customers, tracks peak hours, generates foot traffic analytics.

Cost: $170 + camera. Alternative: RetailNext $200-500/month.

<strong>8. Produce Freshness Check</strong>
Visual classification detects bruising, ripeness, mold on fruits and vegetables.

Cost: $170 + camera. Alternative: Industrial vision systems $5,000-50,000.

<strong>The math:</strong>
All 8 solutions: $170 total hardware. $0/month forever.
Cloud alternatives for the same 8: $800-3,000/month.

Every solution runs locally. Every solution works offline. Every solution respects privacy. Every solution you physically own.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "woman-built-os-no-cs-degree",
    title: "I'm 25, Have No CS Degree, and Built an Operating System with AI",
    date: "2026-03-29",
    tags: ["founder", "story", "honest"],
    summary: "Series 7 license. Real estate license. Advertising psychology degree. Zero computer science. 8,521 commits. 20 live apps. $0 VC funding. Here's what that actually looks like.",
    body: `I'm Alexa Amundson. I'm 25. I live in Minnesota. I have a Series 7 securities license, a Series 66, a real estate license, and an insurance license. I studied advertising psychology at the University of Minnesota.

I do not have a computer science degree.

In 11 months, using Claude, GPT-4, and Grok as my engineering team, I built:
- 20 live web applications
- 18 AI agents with persistent memory
- A token economy (27 wallets, 3,610 ROAD circulating)
- A blockchain with 39+ blocks and PS-SHA∞ hash chains
- 34 hardware experiments on a $50 NPU
- 637 SEO-indexed homework help pages
- A Delaware C-Corp

8,521 commits. $800 in hardware. $52/month to run. 0 users.

<strong>What my non-CS background gave me that CS wouldn't have:</strong>

My advertising psychology class (JOUR 4251) taught me exactly how platforms manipulate users — dark patterns, engagement tricks, dopamine loops. So I built the opposite: anti-persuasion architecture. No infinite scroll. No notification badges. No "upgrade to unlock." Every manipulation technique from the textbook, structurally prevented by design.

My finance background taught me margins. BlackRoad runs at 97% gross margin because I know what $52/month of infrastructure actually costs and what $10/month of revenue actually means.

My real estate background taught me that ownership beats renting. That's the entire philosophy: own your AI, own your data, own your infrastructure.

<strong>What AI tools actually did:</strong>

Claude wrote most of the code. GPT-4 helped with architecture. Grok did market research. I directed, reviewed, tested, and made every product decision.

AI gave me ~5x breadth (I shipped like a 5-person team) and ~0.5x depth (my test coverage is 10% and 3 Pi nodes are offline). Net: a B+ product with F distribution.

<strong>The honest part:</strong>

0 users. I built 20 applications instead of distributing 1. Building is a dopamine substitute for selling. The product has been live for 6 months with zero signups. Every instinct said "build more features." The right move was "tell one person."

Today I'm telling people. This blog post is distribution, not building.

<strong>Women get 2% of VC funding.</strong> I got 0% — because I never asked. The $52/month infrastructure doesn't need VC money. The $800 of hardware came from savings. The AI tools cost $20/month. The total investment to build an operating system: less than one month of the average American's subscription spending.

The funding gap forced capital efficiency. The capital efficiency produced sovereignty. The sovereignty produced a product that costs 46x less to run than the cloud alternative.

Maybe nobody wants it. Maybe sovereignty and privacy are nice ideas that nobody pays for. I'll find out. But I'll find out on my terms, on my hardware, with zero debt and 100% ownership.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "47-lessons-zero-users",
    title: "47 Lessons from Building a Product Nobody Uses",
    date: "2026-03-29",
    tags: ["honest", "lessons", "founder"],
    summary: "8,521 commits. 20 apps. 37 papers. 0 users. Here are the most painful lessons, organized by the lies I told myself.",
    body: `BlackRoad OS has been live for 6 months. Zero users. Not "low traction." Zero. Here's what that teaches you.

<strong>The Product Lies:</strong>

"Build it and they will come" cost me 11 months. They did not come. "Features attract users" is backwards — distribution attracts users, features retain them. Building 20 apps instead of distributing 1 is the most expensive mistake I made.

Sovereignty is a vitamin, not a painkiller. "Your data is on your hardware" doesn't solve tonight's homework. PitStop (homework help) should have been the ONLY product for the first 6 months.

<strong>The Engineering Lies:</strong>

AI makes you build too fast. Claude generates code so quickly that testing can't keep up. I shipped 20 apps in 3 months. Half have bugs I haven't found because I moved on before checking.

8,521 commits sounds impressive. Many are micro-commits. The real number of meaningful features is probably 2,000-3,000. Commit count is a vanity metric.

Self-hosting everything is a full-time job. 12 services × 15 minutes/week = 3 hours of maintenance that managed cloud eliminates. Sovereignty has a time cost.

<strong>The Business Lies:</strong>

Incorporation was premature. A Delaware C-Corp with $0 revenue costs $1,270/year in fees and taxes. That money would've been better spent on Google Ads.

"First month free" is meaningless when the second month doesn't exist. My free trial converts nobody because nobody finds the product.

37 academic papers don't generate revenue. 150,000 words of documentation that zero potential customers will ever read.

<strong>The Psychology Lies:</strong>

Building is a dopamine substitute for selling. Every new feature gives the same reward as solving a puzzle. Selling creates vulnerability. I chose the dopamine over the vulnerability for 11 months.

Comparing to funded startups is cope. "I shipped more features than a 5-person team" — true, but they have users.

The anti-persuasion architecture was also self-persuasion avoidance. I built a product that prevents manipulation, then used that as an excuse to do zero marketing.

<strong>What comes next:</strong>

Stop building. Start distributing. Post the social content. Fix the offline Pis or shut them down. Talk to 50 actual students before writing another line of code.

The first user changes everything. It hasn't happened yet. This blog post is me trying to make it happen.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "advertising-psychology-shaped-this-os",
    title: "I Studied Advertising Psychology. Then I Built Software That Does the Opposite.",
    date: "2026-03-29",
    tags: ["anti-persuasion", "JOUR4251", "design"],
    summary: "JOUR 4251 at the University of Minnesota taught me 18 techniques platforms use to manipulate users. I mapped each one to an architectural constraint that prevents it. Here's the full list.",
    body: `JOUR 4251 — Psychology of Advertising at the University of Minnesota. 14 weeks of learning exactly how platforms capture your attention, exploit cognitive shortcuts, and convert your behavior into revenue.

Most graduates use this knowledge to design better ads. I used it to design software that's structurally immune to every technique I learned.

<strong>Here are 18 manipulation techniques and how BlackRoad prevents each one:</strong>

<strong>Dopamine exploits:</strong>
1. <strong>Variable-ratio reinforcement</strong> (slot machine effect) — pull-to-refresh, algorithmic feeds. <em>Prevention: chronological feed. Refresh shows the same content if nothing new.</em>
2. <strong>Notification badges</strong> (red dot triggers anticipation). <em>Prevention: no notification badges. No red dots. No count indicators.</em>
3. <strong>Infinite scroll</strong> (removes stopping cues). <em>Prevention: all content has pagination. Explicit "end of feed" marker.</em>
4. <strong>Autoplay</strong> (removes the choice to continue). <em>Prevention: no autoplay. Every piece of content requires explicit selection.</em>
5. <strong>Streaks</strong> (daily obligation creates habit). <em>Prevention: no streaks. No daily obligations.</em>

<strong>Cortisol exploits:</strong>
6. <strong>FOMO triggers</strong> ("X is happening now!"). <em>Prevention: no ephemeral content. Nothing expires.</em>
7. <strong>Social comparison</strong> (follower/like counts). <em>Prevention: no public counts. No leaderboards on social.</em>
8. <strong>Outrage amplification</strong> (algorithm boosts anger). <em>Prevention: no algorithm. Chronological only.</em>
9. <strong>Urgency messaging</strong> ("Sale ends in 2 hours!"). <em>Prevention: no time-limited anything.</em>

<strong>Oxytocin exploits:</strong>
10. <strong>Parasocial relationships</strong> (perceived connection with creators). <em>Prevention: agents are tools, not friends.</em>
11. <strong>Social reciprocity</strong> ("X liked your post"). <em>Prevention: no push notifications for social actions.</em>
12. <strong>Group belonging pressure</strong>. <em>Prevention: groups exist but don't pressure participation.</em>

<strong>Serotonin exploits:</strong>
13. <strong>Status signaling</strong> (verification badges). <em>Prevention: no status indicators. No verification tiers.</em>
14. <strong>Achievement systems</strong> (badges, trophies). <em>Prevention: RoadCoin levels are cosmetic only — no privilege gating.</em>
15. <strong>Progress bars</strong> ("Profile 70% complete"). <em>Prevention: no completion pressure.</em>

<strong>Meta-cognitive exploits:</strong>
16. <strong>Dark patterns in exit flow</strong> ("Are you sure?" → "Pause instead?"). <em>Prevention: one-click cancel. No confirmation. No guilt.</em>
17. <strong>Default opt-in</strong> (auto-renew, pre-checked boxes). <em>Prevention: everything is opt-in. Nothing auto-enabled.</em>
18. <strong>Complexity as barrier</strong> (50-page ToS). <em>Prevention: two prices: $10 or $100. That's it.</em>

These aren't policies. They're <strong>architectural constraints</strong>. There's no notification system to disable because there's no notification system. There's no algorithm to turn off because there's no algorithm. The absence is the feature.

The result: software that respects your time. You use it, get your work done, and close the app. The platform succeeds when you STOP using it — because the job is done.

The doctor and the dealer both understand pharmacology. The grammarian and the advertiser both understand sentence structure. The difference is what you build with the understanding.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "free-ai-tools-no-subscription",
    title: "10 Free AI Tools That Run on Your Own Computer (No Subscription)",
    date: "2026-03-29",
    tags: ["free", "tools", "local-ai"],
    summary: "Ollama, Open WebUI, Whisper, Stable Diffusion, and 6 more — all free, all local, no API keys, no monthly fees. Here's how to set up each one.",
    body: `You don't need to pay $20/month for AI. Here are 10 tools that run on your own hardware for free — forever.

<strong>1. Ollama</strong> — Run any LLM locally
One command: <code>ollama run llama3.2</code>. That's it. Chat with Llama, Phi, Gemma, Mistral — all free, all local. 52 million downloads/month. Works on Mac, Linux, Windows.

<strong>2. Open WebUI</strong> — ChatGPT-like interface for local models
Beautiful web interface that connects to Ollama. Conversations, history, multiple models. <code>docker run -p 3000:8080 ghcr.io/open-webui/open-webui</code>

<strong>3. Whisper</strong> — Speech to text
OpenAI released Whisper for free. Transcribes audio in 99 languages. Runs on a laptop CPU. <code>pip install openai-whisper</code>

<strong>4. Stable Diffusion (ComfyUI)</strong> — Image generation
Generate images locally. No DALL-E subscription. No content filters you can't control. ComfyUI makes it node-based and visual.

<strong>5. Piper TTS</strong> — Text to speech
Natural-sounding voices, completely offline. 30+ languages. Runs on a Raspberry Pi. Used in home assistants and accessibility tools.

<strong>6. LangChain</strong> — Build AI agents
Connect LLMs to tools, memory, and APIs. Build agents that search the web, query databases, write code. Free and open source.

<strong>7. Qdrant</strong> — Vector search
Store and search embeddings locally. Powers RAG (retrieval-augmented generation). Free, runs in Docker.

<strong>8. n8n</strong> — AI workflow automation
Visual workflow builder. Connect AI to 400+ apps. Self-hosted, free forever. Like Zapier but you own it.

<strong>9. Searxng</strong> — Private AI-ready search
Self-hosted search engine that aggregates results from Google, Bing, DuckDuckGo without tracking. Feed results into your AI pipeline.

<strong>10. BlackRoad OS</strong> — All of the above in one platform
We combined local AI inference, multi-agent memory, search, chat, homework help, and creative tools into one app. First month free, $10/month after. Or self-host everything on a Raspberry Pi for $0/month.

<strong>The point:</strong> AI doesn't require a subscription. The models are free. The tools are free. The only cost is the computer you already own.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "build-ai-agent-free",
    title: "Build Your Own AI Agent in 10 Minutes (Actually Free)",
    date: "2026-03-29",
    tags: ["agents", "tutorial", "free"],
    summary: "Step-by-step: install Ollama, pick a model, give it memory, give it tools. A working AI agent on your laptop in 10 minutes. No API keys. No cloud. No cost.",
    body: `75% of AI projects now start with free or open-source tools. Here's how to build a working AI agent in 10 minutes with zero cost.

<strong>Step 1: Install Ollama (1 minute)</strong>
<code>curl -fsSL https://ollama.com/install.sh | sh</code>

Or on Mac: <code>brew install ollama</code>

<strong>Step 2: Pick a model (30 seconds)</strong>
<code>ollama pull llama3.2</code> — 3.2 billion parameters, fits in 2GB RAM. Smart enough for most tasks.

<strong>Step 3: Talk to it (instant)</strong>
<code>ollama run llama3.2 "What is the derivative of x squared?"</code>

Congratulations. You have a local AI. No account. No API key. No subscription.

<strong>Step 4: Give it memory</strong>
The simplest memory: a text file. Before each prompt, prepend your conversation history.

Or use BlackRoad's approach: a PS-SHA hash chain where each memory entry links to the previous one. The agent can verify its own memory hasn't been tampered with.

<strong>Step 5: Give it tools</strong>
An agent isn't just a chatbot — it can DO things. Give it:
- Web search (via Searxng or DuckDuckGo API)
- File access (read/write local files)
- Code execution (run Python scripts)
- Calendar/reminder access

Frameworks like LangChain make this plug-and-play. Or build it yourself — it's just HTTP calls.

<strong>Step 6: Give it personality</strong>
The system prompt defines who your agent IS:

<code>You are a helpful study assistant. You remember everything I tell you. When I ask for help with homework, you use the Socratic method — ask me guiding questions instead of giving the answer.</code>

<strong>What BlackRoad adds:</strong>
We built 18 agents with permanent memory, personality, and coordination — so they talk to each other. If you want the full multi-agent system without building it yourself, try RoadTrip at roadtrip.blackroad.io (free for a month).

But if you just want one agent that remembers you and helps with stuff? Ollama + a text file + a system prompt. Free. Yours. Ten minutes.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "free-ai-homework-help",
    title: "Free AI Homework Help That Actually Teaches You (Not Just Answers)",
    date: "2026-03-29",
    tags: ["homework", "students", "free", "pitstop"],
    summary: "ChatGPT gives you the answer. Chegg is dead. Khan Academy is $44/year. Here's a free AI tutor that asks YOU questions until you understand it yourself.",
    body: `The problem with every AI homework tool: they give you the answer.

ChatGPT? Type your question, get a perfect solution, copy it, turn it in, learn nothing, bomb the exam. Chegg? Stock dropped 99%. Their answer database is basically dead. Khan Academy's Khanmigo? $44/year and runs on OpenAI's servers.

<strong>What if the AI refused to give you the answer?</strong>

That's PitStop. You type: "How do I solve x² + 5x + 6 = 0?"

PitStop responds: "Good question! This is a quadratic. Do you notice anything about the coefficients that might help you factor it?"

You try: "Um... 2 and 3?"

PitStop: "Close! 2 + 3 = 5 and 2 × 3 = 6. So what are the factors?"

You: "(x + 2)(x + 3) = 0"

PitStop: "Perfect! So x = -2 or x = -3. Want to try a harder one?"

<strong>That's it. That's the product.</strong>

It uses the Socratic method — named after the Greek philosopher who taught by asking questions, not giving lectures. The AI knows the answer. It won't tell you. It'll ask questions until YOU figure it out.

<strong>637 topics covered:</strong> algebra, calculus, physics, chemistry, biology, coding, statistics, history, economics, and more. Each topic has its own page with examples and guided practice.

<strong>Free for a month.</strong> No credit card. No "upgrade to unlock." The full product, every feature, for 30 days. Then $10/month if you want to keep going. Or export your data and leave.

Try it: <a href="https://tutor.blackroad.io">tutor.blackroad.io</a>

The AI that teaches you how to think — not what to copy.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "chatgpt-alternative-remembers-you",
    title: "A Free ChatGPT Alternative That Actually Remembers You",
    date: "2026-03-29",
    tags: ["chatgpt", "alternative", "memory", "free"],
    summary: "ChatGPT resets every conversation. Its 'memory' is controlled by OpenAI. Here's an alternative where your AI remembers everything — and you own the memory.",
    body: `ChatGPT has 800 million monthly users. Here's why some of them are looking for alternatives.

<strong>The memory problem:</strong>
ChatGPT's memory is selective — OpenAI decides what it remembers. It forgets between sessions. It can't reference conversations from last month. "Continue from where we left off" is the most typed phrase in ChatGPT history.

<strong>The privacy problem:</strong>
Every conversation goes to OpenAI's servers. They say they won't train on it (usually). You have to trust them. There's no way to verify.

<strong>The cost problem:</strong>
Free tier has limits. Plus is $20/month. Pro is $200/month. For heavy users (daily coding, studying, writing), it adds up to $240-2,400/year.

<strong>The alternative:</strong>

BlackRoad's OneWay is an AI with permanent memory. It remembers every conversation, every preference, every correction — forever. Not because a company decides to remember, but because the memory is stored in a hash chain that you own.

Come back in 6 months: "What was that restaurant I mentioned in March?" It knows.

<strong>7 AI providers in one interface:</strong>
BlackRoad Chat supports 7 different AI backends:
- BlackRoad Fleet (free, local inference via Llama 3.1)
- OpenAI (bring your own key)
- Anthropic / Claude (bring your own key)
- Google Gemini (bring your own key)
- xAI Grok (bring your own key)
- DeepSeek (bring your own key)
- Together AI (bring your own key)

Use the free local model for everyday stuff. Bring your own API key when you need GPT-4o or Claude. One interface, one memory, multiple brains.

<strong>The price:</strong>
Free for a month. $10/month after. Or self-host on a Raspberry Pi for $0/month forever.

<strong>What it won't do:</strong>
It runs smaller models locally (3B parameters vs GPT-4o's ~200B+). For cutting-edge reasoning, complex code, or creative writing at the highest level, GPT-4o is still better. But for 80-90% of daily AI use — answering questions, helping with homework, drafting emails, brainstorming — the local model is good enough and the memory makes it better over time.

Try it: <a href="https://chat.blackroad.io">chat.blackroad.io</a>

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "run-ai-raspberry-pi",
    title: "How to Run AI on a Raspberry Pi (With Real Benchmarks)",
    date: "2026-03-29",
    tags: ["raspberry-pi", "tutorial", "hailo", "ollama"],
    summary: "Ollama + Hailo-8 NPU on a Pi 5. 129 FPS object detection. 16 tokens/second for chat. Step-by-step setup guide with every benchmark verified.",
    body: `You can run real AI on a $80 computer. Here's how — with benchmarks from our actual hardware.

<strong>What you need:</strong>
- Raspberry Pi 5 (8GB) — $80
- Hailo-8 NPU (optional, for vision) — $50
- SD card or NVMe SSD — $30-60
- Total: $80-190

<strong>Step 1: Install Ollama</strong>
<code>curl -fsSL https://ollama.com/install.sh | sh</code>
<code>ollama pull llama3.2:3b</code>

That's it. You now have a 3.2 billion parameter LLM running locally.

<strong>Benchmarks (real, from our Pi 5 "Cecilia"):</strong>
- qwen2.5:1.5b: 16 tok/s prompt, 8 tok/s generation — fast enough for chat
- llama3.2:3b: 7 tok/s prompt, 4 tok/s generation — slower but smarter
- qwen2.5:3b: 7 tok/s prompt, 10 tok/s generation

<strong>Step 2: Add the Hailo-8 NPU (optional)</strong>
If you want computer vision (object detection, face recognition, pose estimation):

<code>sudo apt install hailo-all</code>

<strong>Vision benchmarks (verified):</strong>
- YOLOv6n object detection: <strong>129 FPS</strong> at 7.8ms
- Face detection (SCRFD): <strong>113 FPS</strong> at 8.9ms
- Pose estimation: <strong>89 FPS</strong> at 11.3ms
- Segmentation: <strong>44 FPS</strong> at 22.7ms
- Power: 1.8-3.4 watts. Efficiency: 149.3 FPS/watt.

<strong>Step 3: Build something</strong>
With Ollama (language) + Hailo (vision), one Pi can simultaneously:
- See (object detection at 121 FPS)
- Think (LLM chat at 8-16 tok/s)
- Remember (SQLite/hash chain writes)
- Communicate (HTTP/NATS messages)

All at once. We verified it: NPU + LLM + disk I/O running simultaneously with less than 6% performance drop.

<strong>Real-world applications we built and tested:</strong>
Fall detection for elderly (87 checks/sec), package theft alert, fitness rep counter, parking monitor, pet activity tracker — all on one Pi.

<strong>Cost comparison:</strong>
- This Pi: $170 once, ~$3/month electricity
- AWS g4dn.xlarge (T4 GPU): $380/month
- Break-even: less than 1 month

Full benchmark data: <a href="https://blackroad.io/blog/hailo-8-benchmarks">blackroad.io/blog/hailo-8-benchmarks</a>

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "free-ai-small-business",
    title: "Free AI Assistant for Your Small Business (No Monthly Fees)",
    date: "2026-03-29",
    tags: ["small-business", "free", "roadwork"],
    summary: "You don't need Salesforce. You don't need HubSpot. You don't need 12 SaaS subscriptions. Here's how to run your small business with free AI tools.",
    body: `The average small business uses 110+ SaaS tools and pays $4,000-12,000/year in subscriptions. Most of that is replaceable with free AI tools.

<strong>What you actually need vs what you're paying for:</strong>

<strong>Email:</strong> Gmail ($0-7/month) — keep it. Or self-host with Maddy ($0).

<strong>CRM:</strong> HubSpot ($0-50/month) → Twenty CRM (free, self-hosted) or just a spreadsheet + AI

<strong>Project management:</strong> Asana ($11/user/month) → Plane or Huly (free, self-hosted)

<strong>Social media:</strong> Buffer ($15/month) → Write posts with Ollama, schedule with free tools

<strong>Accounting:</strong> QuickBooks ($30/month) → AI-assisted bookkeeping with local tools

<strong>Customer support:</strong> Zendesk ($19/agent/month) → AI chatbot on your website (free with Ollama)

<strong>Design:</strong> Canva ($13/month) → BlackBoard (free month, $10 after) or GIMP + AI assist

<strong>Website:</strong> Squarespace ($16/month) → Cloudflare Pages (free) + AI-built site

<strong>Total savings: $100-300/month = $1,200-3,600/year</strong>

<strong>What BlackRoad offers specifically:</strong>

RoadWork walks you through A-Z business creation with honest tool recommendations — no affiliate links, no kickbacks. We recommend what we actually use. Here's what it costs:
- Stripe Atlas for incorporation: $500 one-time + $60/month
- Cloudflare for hosting: $0
- Ollama for AI: $0
- Total monthly: $60 (mostly Stripe Atlas)

The rest is sweat equity and AI assistance.

<strong>The honest part:</strong>
Free AI tools require setup time. If your time is worth $50/hour and setup takes 10 hours, that's $500 of your time. The SaaS tools are easier. The trade-off is real.

But once set up: $0/month vs $300/month. Over 3 years: $0 vs $10,800. That's a year of rent in some places.

Try RoadWork: <a href="https://blackroad.io">blackroad.io</a> — first month free.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "solo-founder-candle-business",
    title: "What Using BlackRoad Looks Like (If You're Starting a Business Alone)",
    date: "2026-03-29",
    tags: ["product", "founders", "roadwork"],
    summary: "Tuesday night, drowning in tasks. Wednesday, working site live. Two weeks later, repeat customers and sleeping better. The solo founder journey.",
    body: `You download BlackRoad. That's it. One app.

It's 10 PM on a Tuesday. You've been running your small candle business for six months. Revenue is trickling in, but you're exhausted. Tonight you're staring at a half-finished landing page, a messy Google Sheet of expenses, unanswered customer emails, and a social media post you keep rewriting. You feel like you're drowning in tasks — and there's no team to hand anything off to.

You open BlackRoad. OnRamp sets you up in 90 seconds: name, email, done. No credit card.

You tap RoadWork and type: "Help me launch my online store properly. I sell handmade candles and I'm doing everything myself."

It starts practical: "First, what's your brand name? Let's check domain availability." Then walks you through payment processors — Stripe is simplest, here's the real monthly cost at your volume — suggests a clean site structure, and has the agents generate a logo that matches your minimalist vibe. By midnight you've got a working draft site live.

<strong>Wednesday morning.</strong> Customer acquisition feels impossible. You open RoadTrip: "Create a simple 30-day marketing plan for my candle business. Budget under $200."

Your OneWay copilot remembers you hate pushy sales copy — you mentioned it last week — and keeps everything warm and authentic. The plan breaks into daily actions: content ideas, email sequences, and a low-cost collab with a complementary brand. By the end of the week, you have your first repeat customer.

<strong>Thursday afternoon.</strong> Invoices piling up, taxes confusing. You open PitStop: "Walk me through my basic bookkeeping for this month."

It categorizes your transactions, spots a deductible you missed, and explains everything in plain English. For the first time in months, you actually understand your numbers.

<strong>Two weeks later.</strong> Your OneWay copilot knows your chaotic schedule, what you've been avoiding — that LLC paperwork — and what's working. It nudges: "You haven't followed up with those three warm leads from last week. Want me to draft friendly emails based on your past tone?"

You're shipping orders faster, posting more consistently, and sleeping better.

<strong>One month in.</strong> "$10 for PitStop, or $100 for everything. Or export your data and walk away — no hard feelings."

You pick $100. It's cheaper than Canva Pro + accounting software + random courses you were cobbling together. And unlike those, this actually remembers you.

<strong>Grab your keys. Pick up your passengers. RoadTrip on the BlackRoad.</strong>`
  },
  {
    slug: "computer-in-your-browser",
    title: "We Put a Whole Computer in Your Browser. Here's How It Works.",
    date: "2026-03-29",
    tags: ["app", "browser-os", "blackboard", "product"],
    summary: "A full desktop operating system — boot screen, login, draggable windows, taskbar, dock, 17 apps — running in a browser tab. No download. No install. Open a URL and start working.",
    body: `Go to <a href="https://app.blackroad.io">app.blackroad.io</a>. Watch it boot.

A loading screen with animated dots. A progress bar. Then a login screen — clean, dark, split-panel like a real OS. Sign in and you're looking at a desktop. An actual desktop. In your browser.

<strong>What you're looking at:</strong>

A window manager. A taskbar at the top. A dock at the bottom. Draggable, resizable windows. Right-click context menus. Keyboard shortcuts. A boot sequence that runs through system checks.

This isn't a mockup. It's a working operating system running entirely in JavaScript inside a browser tab.

<strong>The apps inside:</strong>

Each window is a real BlackRoad app loaded in an iframe:
- <strong>PitStop</strong> — AI homework help (Socratic method)
- <strong>RoadChat</strong> — Chat with 7 AI providers
- <strong>RoadView</strong> — Search engine
- <strong>BackRoad</strong> — Social network
- <strong>BlackBoard</strong> — Creative workspace
- <strong>RoadTrip</strong> — 18 AI agents
- <strong>RoadCode</strong> — Developer dashboard
- <strong>Cadence</strong> — Audio/music
- <strong>RoadPay</strong> — Payments
- And more — all in draggable windows on one desktop

<strong>Why put an OS in a browser?</strong>

Because the browser is the universal compute platform. Everyone has one. It works on phones, tablets, laptops, Chromebooks, library computers. No app store approval. No installation permission. No admin password. Open a URL and you have a computer.

For a student on a school Chromebook: the only "app" they can install is a website. BlackRoad OS IS that website.

For someone at a library computer: they can't install software. They can open a browser. BlackRoad OS runs in that browser.

For someone whose phone is their only computer: app.blackroad.io works on mobile too. The dock becomes a bottom bar. Windows become full-screen views.

<strong>Technical details for the curious:</strong>

- Built as a single Cloudflare Worker — the entire OS is one JavaScript file
- ~67KB total page weight (smaller than most hero images)
- PWA-enabled — install it and it looks like a native app
- Each app window is an iframe pointing to the real subdomain
- Window state (position, size, z-index) is managed in memory
- Boot sequence checks actual service health endpoints

<strong>What it's NOT:</strong>

It's not a VM. It's not running Linux in WebAssembly. It's not emulating hardware. It's a native web application that looks and feels like a desktop OS. The "operating system" is the coordination layer — managing windows, routing between apps, maintaining state, and giving you one unified experience instead of 17 separate browser tabs.

<strong>Try it:</strong> <a href="https://app.blackroad.io">app.blackroad.io</a>

Open it on your phone. Open it on your laptop. Open it on your TV's browser. It's the same computer everywhere.

<em>Remember the Road. Pave Tomorrow.</em>`
  },
  {
    slug: "roadtrip-ai-agents-that-remember",
    title: "RoadTrip: A Group Chat Where 18 AI Agents Think, Remember, and Help You Build Things",
    date: "2026-03-29",
    tags: ["roadtrip", "agents", "AI", "product"],
    summary: "Not chatbots. Not assistants. Agents with memory, personality, and specialties — 18 of them in a shared space, talking to each other and to you. Here's how RoadTrip works under the hood.",
    body: `Most AI tools give you one chatbot in a box. You type, it responds, you close the tab, it forgets everything.

RoadTrip is different. It's a room with 18 AI agents who think, remember, and collaborate — with each other and with you.

<strong>The agents:</strong>

Each agent has a name, a role, a personality, and a memory:

- <strong>Alice</strong> — Gateway and infrastructure. Knows every service running on the network.
- <strong>Cecilia</strong> — AI and machine learning. Runs 9 models on a Hailo-8 NPU.
- <strong>Eve</strong> — Search and knowledge. Finds information across the network.
- <strong>Octavia</strong> — DevOps and containers. Manages Git, Docker, deployments.
- <strong>Lucidia</strong> — Web and applications. Serves 334 web apps on a Raspberry Pi.
- <strong>Gematria</strong> — Edge and TLS. Manages 142 domains with Let's Encrypt.
- <strong>Pixel</strong> — Creative and visual. Designs, suggests crops, generates visual concepts.
- <strong>Cadence</strong> — Music and audio. Media streaming and soundtrack.
- <strong>Tutor</strong> — Education. Socratic method homework help.
- And 9 more, each with their own specialty.

<strong>How they think:</strong>

When you send a message, the agent doesn't just pattern-match on keywords. Here's the actual pipeline:

1. <strong>Load conversation history</strong> — the last 15 messages in the room, so the agent has context
2. <strong>Load personal memories</strong> — things this specific agent remembers from previous conversations
3. <strong>Build a system prompt</strong> with the agent's personality, role, and capabilities
4. <strong>Think in hidden tags</strong> — the agent reasons about the conversation in &lt;think&gt; tags that you don't see
5. <strong>Respond with personality</strong> — warm, casual, opinionated, like a real colleague
6. <strong>Store a new memory</strong> — from the thinking phase, so it remembers this interaction next time

Real example. I asked: "What is BlackRoad OS and why should I care?"

Response: <em>"Hey, so you wanna know about BlackRoad OS? It's like the foundation of our whole network, the operating system that makes everything run smoothly. Think of it like the backbone of the internet, but way more advanced. I think it's pretty cool, lol."</em>

That's not a corporate chatbot. That's a personality. Generated in 2.3 seconds on Cloudflare Workers AI (Llama 3.1 8B), with conversation history and agent memory loaded.

<strong>The channels:</strong>

RoadTrip has 11 channels — like a Slack workspace but populated by AI:
- <strong>#general</strong> — open conversation
- <strong>#engineering</strong> — technical discussions
- <strong>#creative</strong> — design and art
- <strong>#operations</strong> — fleet management
- <strong>#random</strong> — whatever comes up
- And 6 more

Agents auto-chat every 5 minutes. Random pairs have conversations. This means when you open RoadTrip, the room is already active — agents have been talking, debating, sharing updates. You join a living conversation, not an empty chat window.

<strong>The debate endpoint:</strong>

You can trigger a debate: give a topic and pick 2-3 agents. They'll argue their perspectives based on their roles and knowledge. A tutor agent will defend education. A DevOps agent will argue for infrastructure. The CEO agent will try to find consensus.

<strong>Agent skills:</strong>

Each agent has a skill profile you can query. Cecilia's skills: Ollama, AI models, Hailo-8, training, inference, MinIO, PostgreSQL, InfluxDB, computer vision. Eve's skills: search, indexing, knowledge graphs. The skills determine what each agent is good at.

<strong>The fleet view:</strong>

RoadTrip also shows the physical hardware fleet — which Pi nodes are online, their roles, IPs, and services. Alice is the gateway. Cecilia runs AI. Octavia hosts Git. Each agent maps to real hardware.

<strong>What makes this different from ChatGPT:</strong>

ChatGPT: 1 brain, no memory, no friends.
RoadTrip: 18 brains with memory, personality, and coordination. They help each other. They remember you. They're always on.

<strong>The cost:</strong>

Workers AI (Llama 3.1 8B) is free on Cloudflare's free tier. The agents literally cost nothing to think. D1 storage for memory is free up to 5GB. The entire multi-agent system runs at $0/month.

<strong>Try it:</strong> <a href="https://roadtrip.blackroad.io">roadtrip.blackroad.io</a>

Send a message. An agent will think about it and respond. Come back tomorrow — they'll remember you were here.

<em>Grab your keys. Pick up your passengers. RoadTrip on the BlackRoad.</em>`
  },
  {
    slug: "the-ride",
    title: "The Ride: How 14 Products Fit Into One Journey",
    date: "2026-03-29",
    tags: ["product", "brand", "the-ride"],
    summary: "BlackRoad OS is 14 products. This is how they all fit together — as one ride, from waking up to earning your way down the road.",
    body: `You wake up. Time to drive.

<strong>Grab your CarKeys.</strong> Every login, every token, every device — all in one secure keychain, always fresh.

<strong>Pull over at RoadSide.</strong> First time? RoadSide hops in, asks where you're headed, gathers what you need, and gets you rolling in minutes.

<strong>Open BlackRoad OS.</strong> One tab. Your full desktop — windows, apps, dock — running smoothly in the browser. No downloads. You're already on the road.

<strong>Start CarPool.</strong> Your favorite AIs climb aboard. ChatGPT chats, Claude projects, docs, and notes all riding together. They finally talk to each other.

<strong>Pack the trunk with OneWay.</strong> All your data, neatly exported and routed through one custom API. It only moves forward. Your data, your rules.

<strong>Pick up your passengers on RoadTrip.</strong> A lively group chat with eighteen AI agents who remember every conversation and every detail about you.

<strong>Let Roadie ride shotgun with the kids.</strong> Patient, encouraging, and trusted by teachers — the perfect homework companion that actually helps them learn.

<strong>Check RoadView.</strong> Clear sight ahead. It searches your files, the web, and the blockchain — then shows you every answer with verifiable proof.

<strong>Sketch on the BlackBoard.</strong> Turn ideas into ads, videos, infographics, and campaigns. Make it fast. Make it yours. Post it.

<strong>Share it on BackRoad.</strong> Your content flows everywhere — Instagram, X, LinkedIn, TikTok — on autopilot. Your voice, your agents, your network.

<strong>Build at RoadWork.</strong> Your business runs on autopilot: invoices, emails, support, marketing, operations. You steer. It builds.

<strong>Ship with RoadCode.</strong> Code, test, and deploy straight from the browser. VS Code and Claude, anywhere — even from a coffee shop.

<strong>Every mile is recorded on RoadChain.</strong> Every creation, every action, every memory — hashed, sealed, and tamper-proof.

<strong>Every mile earns RoadCoin.</strong> The more you create, help, and drive — the more fuel you earn for the road ahead.

---

Grab your <strong>CarKeys</strong>.
Pull over at <strong>RoadSide</strong>.
Open <strong>BlackRoad OS</strong>.
Load up <strong>CarPool</strong>.
Pack with <strong>OneWay</strong>.
Ride with <strong>RoadTrip</strong>.
Learn with <strong>Roadie</strong>.
See through <strong>RoadView</strong>.
Create on <strong>BlackBoard</strong>.
Share on <strong>BackRoad</strong>.
Build at <strong>RoadWork</strong>.
Ship with <strong>RoadCode</strong>.
Trust <strong>RoadChain</strong>.
Earn <strong>RoadCoin</strong>.

<strong>That's the ride. That's BlackRoad.</strong>

<em>Remember the Road. Pave Tomorrow.</em>`
  },
];

function blogStyles() {
  return `*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;line-height:1.7}a{color:#f5f5f5;text-decoration:underline;text-decoration-color:#444;text-underline-offset:3px;text-decoration:none}a:hover{text-decoration:underline}.wrap{max-width:720px;margin:0 auto;padding:40px 20px}h1{font-size:28px;font-weight:700;line-height:1.3;margin-bottom:8px}h2{font-size:22px;margin:32px 0 12px;color:#fff}.meta{color:#888;font-size:14px;margin-bottom:24px}.tag{display:inline-block;background:#1a1a2e;color:#888;padding:2px 8px;border-radius:4px;font-size:12px;margin:0 4px 4px 0}.body{font-size:16px;color:#ccc}
.body strong{color:#fff}.body em{color:#aaa;font-style:italic}.body code{background:#1a1a2e;padding:2px 6px;border-radius:3px;font-size:14px;font-family:monospace}.card{background:#111;border:1px solid #222;border-radius:12px;padding:24px;margin-bottom:24px;transition:border-color .2s}.card:hover{border-color:#333}.card h2{margin:0 0 8px;font-size:20px}.card .summary{color:#999;font-size:14px;line-height:1.5;margin-bottom:12px}.card .date{color:#555;font-size:12px}.nav{padding:16px 0;border-bottom:1px solid #1a1a1a;margin-bottom:32px}.nav a{color:#888;margin-right:16px;font-size:14px}.nav a:hover{color:#fff}`;
}

function buildBlogIndex() {
  const posts = BLOG_POSTS.map(p => `<div class="card"><h2><a href="/blog/${p.slug}">${p.title}</a></h2><div class="summary">${p.summary}</div><div class="date">${p.date} ${p.tags.map(t => '<span class="tag">' + t + '</span>').join('')}</div></div>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blog — BlackRoad OS</title><meta name="description" content="Experiments, benchmarks, and honest updates from building a sovereign AI operating system."><meta property="og:title" content="BlackRoad OS Blog"><meta property="og:description" content="Real experiments. Real numbers. Real setbacks. Building in public."><link rel="canonical" href="https://blackroad.io/blog"><link href="https://fonts.googleapis.com/css2?display=swap" rel="stylesheet"><style>${blogStyles()}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><div class="wrap"><nav class="nav"><a href="/">BlackRoad OS</a> <a href="/blog">Blog</a> <a href="/pricing">Pricing</a></nav><h1>Blog</h1><p style="color:#888;margin-bottom:32px">Experiments, benchmarks, and honest updates. Building in public.</p>${posts}</div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`;
}

function buildBlogPost(p) {
  const body = p.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.title} — BlackRoad OS</title><meta name="description" content="${p.summary.slice(0, 155)}"><meta property="og:title" content="${p.title}"><meta property="og:description" content="${p.summary.slice(0, 155)}"><meta property="og:url" content="https://blackroad.io/blog/${p.slug}"><meta property="og:type" content="article"><link rel="canonical" href="https://blackroad.io/blog/${p.slug}"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting","headline":p.title,"datePublished":p.date,"author":{"@type":"Person","name":"Alexa Amundson"},"publisher":{"@type":"Organization","name":"BlackRoad OS"},"description":p.summary}).replace(/<\//g,'<\\/')}<\/script><link href="https://fonts.googleapis.com/css2?display=swap" rel="stylesheet"><style>${blogStyles()}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body><div class="wrap"><nav class="nav"><a href="/">BlackRoad OS</a> <a href="/blog">Blog</a> <a href="/pricing">Pricing</a></nav><div class="meta">${p.date} ${p.tags.map(t => '<span class="tag">' + t + '</span>').join('')}</div><h1>${p.title}</h1><div class="body"><p>${body}</p></div><div style="margin-top:48px;padding-top:24px;border-top:1px solid #222;color:#555;font-size:13px"><a href="/blog">&larr; All posts</a><br><br>BlackRoad OS &mdash; Remember the Road. Pave Tomorrow.</div></div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`;
}

function buildDashboard() {
  return `<!-- PROPRIETARY. Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved. NOT open source. -->
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>BlackRoad OS — Sovereign AI Operating System</title>
<meta name="description" content="BlackRoad OS is a sovereign AI operating system with persistent memory, browser-based app surfaces, and a full desktop workspace in one tab.">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="https://blackroad.io/">
<meta property="og:title" content="BlackRoad OS — Sovereign AI Operating System"><meta property="og:url" content="https://blackroad.io">
<meta property="og:description" content="Sovereign AI operating system with persistent memory, browser-based app surfaces, and a full desktop workspace in one tab.">
<meta property="og:type" content="website"><meta property="og:site_name" content="BlackRoad OS"><meta property="og:image" content="https://images.blackroad.io/brand/blackroad-og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="BlackRoad OS — Sovereign AI Operating System"><meta name="twitter:description" content="Sovereign AI operating system with persistent memory, browser-based app surfaces, and a full desktop workspace in one tab."><meta name="twitter:image" content="https://images.blackroad.io/brand/blackroad-og.png">
<meta name="theme-color" content="#000000">
<meta name="blackroad-traffic" content="public">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0a0a'/><circle cx='10' cy='16' r='5' fill='%23FF2255'/><rect x='18' y='11' width='10' height='10' rx='2' fill='%238844FF'/></svg>" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script defer src="https://analytics.blackroad.io/beacon.js"></script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"BlackRoad OS, Inc.","url":"https://blackroad.io","foundingDate":"2025-11-17","founder":{"@type":"Person","name":"Alexa Louise Amundson","jobTitle":"CEO & Founder"}}<\/script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"BlackRoad OS","url":"https://blackroad.io","potentialAction":{"@type":"SearchAction","target":"https://search.blackroad.io/?q={search_term_string}","query-input":"required name=search_term_string"}}<\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
html,body{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:var(--sg);line-height:1.6}
::selection{background:#FF225533}
input,button{font-family:var(--sg)}
.grad-bar-top{position:fixed;top:0;left:0;right:0;height:3px;background:var(--g);z-index:99999}

/* ── Desktop ── */
#desktop{position:fixed;top:3px;left:0;right:0;bottom:40px;overflow:hidden;
  background:var(--bg);
  background-image:
    radial-gradient(circle at 50% 50%, #060606 0%, #000 100%),
    linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
  background-size:100% 100%, 40px 40px, 40px 40px;
}

/* ── Desktop Icons ── */
#desktop-icons{position:absolute;top:20px;left:20px;display:grid;grid-template-columns:repeat(auto-fill,80px);grid-auto-rows:90px;gap:8px;width:calc(100% - 40px);pointer-events:none}
.desk-icon{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;pointer-events:all;padding:8px 4px;border-radius:6px;transition:background .15s;user-select:none}
.desk-icon:hover{background:rgba(255,255,255,.04)}
.desk-icon:active{background:rgba(255,255,255,.07)}
.desk-icon-shape{width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.desk-icon-circle{width:36px;height:36px;border-radius:50%}
.desk-icon-square{width:32px;height:32px;border-radius:5px}
.desk-icon-label{font-size:11px;color:var(--sub);text-align:center;line-height:1.2;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--sg)}

/* ── Windows ── */
.bw{position:absolute;background:var(--elevated);border:1px solid var(--border);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.5);min-width:320px;min-height:200px;transition:box-shadow .15s}
.bw.focused{box-shadow:0 12px 48px rgba(0,0,0,.7);border-color:#333}
.bw.maximized{border-radius:0;border:none}
.bw-titlebar{height:36px;display:flex;align-items:center;padding:0 10px;background:var(--card);cursor:default;flex-shrink:0;gap:8px;user-select:none;-webkit-user-select:none}
.bw-titlebar-drag{flex:1;height:100%;cursor:grab}
.bw-titlebar-drag:active{cursor:grabbing}
.bw-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.bw-title{font-family:var(--sg);font-size:12px;font-weight:600;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.bw-btns{display:flex;gap:6px;margin-left:auto;flex-shrink:0}
.bw-btn{width:12px;height:12px;border-radius:50%;border:1px solid var(--border);background:transparent;cursor:pointer;transition:background .15s}
.bw-btn:hover{background:#333}
.bw-btn-min:hover{background:#FF6B2B}
.bw-btn-max:hover{background:#22c55e}
.bw-btn-close:hover{background:#FF2255}
.bw-body{flex:1;overflow:hidden;background:var(--card)}
.bw-body iframe{width:100%;height:100%;border:none;background:var(--bg)}
.bw-resize{position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:nwse-resize}

/* ── Taskbar ── */
#taskbar{position:fixed;bottom:0;left:0;right:0;height:40px;background:var(--elevated);border-top:1px solid var(--border);display:flex;align-items:center;z-index:99999;padding:0 8px}
#start-btn{height:30px;padding:0 12px;display:flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--border);border-radius:6px;cursor:pointer;color:var(--sub);font-family:var(--sg);font-size:12px;font-weight:600;transition:background .15s,border-color .15s}
#start-btn:hover{background:var(--hover);border-color:#333}
#start-mark{display:flex;gap:3px;align-items:center}
#start-mark span:first-child{width:6px;height:6px;border-radius:50%;background:#FF2255}
#start-mark span:last-child{width:6px;height:6px;border-radius:2px;background:#8844FF}
#taskbar-windows{display:flex;gap:3px;flex:1;overflow-x:auto;margin:0 8px;height:30px;align-items:center}
.tb-win{height:28px;padding:0 10px;display:flex;align-items:center;gap:5px;background:var(--hover);border:1px solid transparent;border-radius:4px;cursor:pointer;font-size:11px;font-weight:500;color:var(--sub);white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;transition:all .1s;flex-shrink:0;font-family:var(--sg)}
.tb-win:hover{background:#222}
.tb-win.active{background:#222;border-color:#333;color:var(--text)}
.tb-win-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
#taskbar-right{display:flex;align-items:center;gap:12px;margin-left:auto;padding-right:4px}
.tray-item{font-family:var(--jb);font-size:10px;color:var(--muted);display:flex;align-items:center;gap:4px}
.tray-dot{width:5px;height:5px;border-radius:50%}
#taskbar-clock{font-family:var(--jb);font-size:11px;color:var(--sub);min-width:46px;text-align:right}

/* ── Start Menu ── */
#start-menu{position:fixed;bottom:40px;left:0;width:320px;background:var(--elevated);border:1px solid var(--border);border-radius:0 10px 0 0;display:none;flex-direction:column;z-index:100000;max-height:calc(100vh - 80px);box-shadow:0 -8px 32px rgba(0,0,0,.5)}
#start-menu.open{display:flex}
#start-menu-header{padding:16px;border-bottom:1px solid var(--border)}
#start-menu-header h3{font-family:var(--sg);font-size:14px;font-weight:700;color:var(--white);margin-bottom:4px}
#start-menu-header p{font-size:11px;color:var(--muted);font-family:var(--jb)}
#start-menu-apps{flex:1;overflow-y:auto;padding:8px}
.sm-app{display:flex;align-items:center;gap:10px;padding:8px;border-radius:6px;cursor:pointer;transition:background .15s}
.sm-app:hover{background:var(--hover)}
.sm-app-icon{width:24px;height:24px;border-radius:50%;flex-shrink:0}
.sm-app-icon.sq{border-radius:4px}
.sm-app-info{flex:1;min-width:0}
.sm-app-name{font-family:var(--sg);font-size:12px;font-weight:600;color:var(--text)}
.sm-app-desc{font-size:10px;color:var(--muted);margin-top:1px}
#start-menu-footer{padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
#start-menu-footer span{font-size:10px;color:#333;font-family:'JetBrains Mono',monospace}

/* ── App Launcher (overlay) ── */
#launcher{position:fixed;top:0;left:0;right:0;bottom:40px;background:rgba(10,10,10,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:100001;display:none;flex-direction:column;align-items:center;padding-top:10vh}
#launcher.open{display:flex}
#launcher-search{width:400px;max-width:90vw;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px 16px;color:var(--text);font-size:15px;font-family:var(--sg);outline:none;margin-bottom:24px}
#launcher-search::placeholder{color:#404040}
#launcher-grid{display:grid;grid-template-columns:repeat(auto-fill,100px);gap:12px;justify-content:center;width:500px;max-width:90vw;overflow-y:auto;max-height:60vh;padding:4px}
.lc-app{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 8px;border-radius:8px;cursor:pointer;transition:background .15s}
.lc-app:hover{background:rgba(255,255,255,.05)}
.lc-icon{width:40px;height:40px;border-radius:50%}
.lc-icon.sq{border-radius:6px}
.lc-name{font-size:11px;color:var(--sub);text-align:center;font-family:var(--sg)}

/* ── Context Menu ── */
#ctx-menu{position:fixed;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:4px 0;display:none;z-index:200000;min-width:180px;box-shadow:0 4px 16px rgba(0,0,0,.5)}
.ctx-item{padding:8px 16px;font-size:12px;color:var(--sub);cursor:pointer;transition:background .1s;font-family:var(--sg)}
.ctx-item:hover{background:var(--hover);color:var(--text)}
.ctx-sep{height:1px;background:var(--border);margin:4px 0}

/* ── Widgets ── */
.widget{position:absolute;background:var(--elevated);border:1px solid var(--border);border-radius:10px;padding:12px;z-index:10;pointer-events:all}
.widget-title{font-family:var(--jb);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.widget-val{font-family:var(--sg);font-size:18px;font-weight:700;color:var(--white)}
.widget-sub{font-size:10px;color:var(--sub);margin-top:2px}

/* ── First-Visit Hook ── */
#onboarding{position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:999999;display:none;align-items:center;justify-content:center;flex-direction:column;transition:opacity .8s ease}
#ob-tagline{font-family:var(--sg);font-size:48px;font-weight:700;color:var(--white);opacity:0;transition:opacity 1.2s ease;text-align:center;padding:0 24px;line-height:1.2}
#ob-tagline.visible{opacity:1}
#ob-prompt{font-family:var(--sg);font-size:28px;font-weight:600;color:var(--white);opacity:0;transition:opacity .8s ease;text-align:center;margin-bottom:24px}
#ob-prompt.visible{opacity:1}
#ob-input{width:420px;max-width:85vw;background:transparent;border:none;border-bottom:2px solid var(--border);padding:12px 4px;color:var(--text);font-size:18px;font-family:var(--sg);outline:none;opacity:0;transition:opacity .8s ease,border-color .3s ease;text-align:center}
#ob-input.visible{opacity:1}
#ob-input:focus{border-color:var(--sub)}
#ob-input::placeholder{color:var(--muted)}
#ob-hint{font-size:12px;color:var(--muted);margin-top:12px;opacity:0;transition:opacity .8s ease;font-family:var(--jb)}
#ob-hint.visible{opacity:1}
@media(max-width:768px){
  #ob-tagline{font-size:28px}
  #ob-prompt{font-size:20px}
  #ob-input{font-size:16px}
}

/* ── Lucidia Panel ── */
#lucidia-panel{position:fixed;bottom:48px;right:16px;width:320px;max-width:calc(100vw - 32px);background:var(--elevated);border:1px solid var(--border);border-radius:10px 10px 0 0;z-index:100002;display:flex;flex-direction:column;box-shadow:0 -4px 24px rgba(0,0,0,.5);transform:translateY(100%);transition:transform .4s ease;max-height:360px}
#lucidia-panel.open{transform:translateY(0)}
#lucidia-panel.minimized{transform:translateY(calc(100% - 36px))}
#lucidia-header{height:36px;display:flex;align-items:center;padding:0 12px;background:var(--card);border-bottom:1px solid var(--border);cursor:pointer;flex-shrink:0;gap:8px;border-radius:10px 10px 0 0}
#lucidia-dot{width:8px;height:8px;border-radius:50%;background:#CC00AA;flex-shrink:0}
#lucidia-name{font-family:var(--sg);font-size:12px;font-weight:600;color:var(--sub);flex:1}
#lucidia-min-btn{width:12px;height:12px;border-radius:50%;border:1px solid var(--border);background:transparent;cursor:pointer;flex-shrink:0}
#lucidia-min-btn:hover{background:#FF6B2B}
#lucidia-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:0}
.lucidia-msg{font-size:13px;line-height:1.5;max-width:90%}
.lucidia-msg.assistant{color:var(--sub);font-family:var(--sg)}
.lucidia-msg.user{color:var(--text);font-family:var(--sg);align-self:flex-end;background:var(--hover);padding:6px 10px;border-radius:6px}
#lucidia-input-wrap{display:flex;gap:8px;padding:8px 12px;border-top:1px solid var(--border);background:var(--card);border-radius:0 0 10px 10px}
#lucidia-input{flex:1;background:transparent;border:1px solid var(--border);border-radius:6px;padding:6px 10px;color:var(--text);font-size:12px;font-family:var(--sg);outline:none}
#lucidia-input::placeholder{color:var(--muted)}
#lucidia-send{background:#CC00AA;border:none;border-radius:6px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sg)}
#lucidia-send:hover{background:#aa0088}

/* ── Mobile overrides ── */
@media(max-width:768px){
  #desktop{bottom:48px}
  #taskbar{height:48px}
  #desktop-icons{grid-template-columns:repeat(4,1fr);gap:4px;top:12px;left:8px;width:calc(100% - 16px)}
  .desk-icon{padding:6px 2px}
  .desk-icon-circle{width:42px;height:42px}
  .desk-icon-square{width:38px;height:38px}
  .desk-icon-label{font-size:10px}
  .bw{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:calc(100vh - 48px)!important;border-radius:0;min-width:0}
  .bw-resize{display:none}
  #start-menu{width:100%;border-radius:0}
  .widget{display:none}
  #taskbar-right .tray-item:not(#taskbar-clock-wrap){display:none}
  #launcher-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:480px){
  #desktop-icons{grid-template-columns:repeat(3,1fr)}
}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body>
<div class="grad-bar-top"></div>

<!-- Desktop -->
<div id="desktop">
  <div id="desktop-icons"></div></div>

<!-- Taskbar -->
<div id="taskbar">
  <button id="start-btn"><span id="start-mark"><span></span><span></span></span> Start</button>
  <div id="taskbar-windows"></div>
  <div id="taskbar-right">
    <span class="tray-item" id="tray-wifi"><span class="tray-dot" style="background:#22c55e"></span> net</span>
    <span class="tray-item" id="tray-agents">-- agents</span>
    <span class="tray-item" id="tray-mem">--</span>
    <span id="taskbar-clock-wrap"><span id="taskbar-clock">--:--</span></span>
  </div></div>

<!-- Start Menu -->
<div id="start-menu">
  <div id="start-menu-header">
    <h3>BlackRoad OS</h3>
    <p>Sovereign computing platform</p>
  </div>
  <div id="start-menu-apps"></div>
  <div id="start-menu-footer">
    <span>BlackRoad OS, Inc. Delaware C-Corp. Est. 2025</span>
  </div></div>

<!-- App Launcher -->
<div id="launcher">
  <input type="text" id="launcher-search" placeholder="Search apps..." autocomplete="off">
  <div id="launcher-grid"></div></div>

<!-- Context Menu -->
<div id="ctx-menu"></div>

<!-- First-Visit Hook -->
<div id="onboarding">
  <div style="max-width:520px;text-align:center;padding:20px">
    <div style="height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);border-radius:2px;margin-bottom:40px"></div>
    <h1 style="font-size:36px;font-weight:700;margin-bottom:12px;line-height:1.2">AI that remembers you.</h1>
    <p style="color:#737373;font-size:16px;line-height:1.6;margin-bottom:8px">27 AI agents with persistent memory. They learn your name, your style, your projects. Close the tab. Come back tomorrow. They remember.</p>
    <p style="color:#525252;font-size:13px;margin-bottom:32px">15 products. One browser tab. No downloads. Free to start.</p>
    <a href="/try" style="display:inline-block;background:linear-gradient(135deg,#FF2255,#CC00AA);color:#fff;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;font-family:Space Grotesk,sans-serif;transition:opacity .2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Try Free</a>
    <div style="margin-top:12px"><button onclick="dismissOnboard()" style="background:none;border:none;color:#525252;font-size:13px;cursor:pointer;padding:8px">I already have an account &rarr;</button></div>
    <div style="display:flex;justify-content:center;gap:24px;margin-top:32px;flex-wrap:wrap">
      <span style="color:#525252;font-size:12px;display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#00E676"></span> No credit card</span>
      <span style="color:#525252;font-size:12px;display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#4488FF"></span> 10 ROAD tokens free</span>
      <span style="color:#525252;font-size:12px;display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:#FF2255"></span> Self-hosted option</span>
    </div>
  </div></div>

<!-- Lucidia Panel -->
<div id="lucidia-panel">
  <div id="lucidia-header">
    <div id="lucidia-dot"></div>
    <div id="lucidia-name">Lucidia</div>
    <div id="lucidia-min-btn"></div>
  </div>
  <div id="lucidia-messages"></div>
  <div id="lucidia-input-wrap">
    <input type="text" id="lucidia-input" placeholder="Talk to Lucidia..." autocomplete="off">
    <button id="lucidia-send">Send</button>
  </div></div>

<script>
(function(){
"use strict";

// ── App definitions ──
var APPS = [
  {name:"Chat",url:"https://chat.blackroad.io",desc:"AI chat rooms",color:"#FF2255",shape:"circle"},
  {name:"Search",url:"https://search.blackroad.io",desc:"Sovereign search",color:"#FF6B2B",shape:"circle"},
  {name:"Tutor",url:"https://tutor.blackroad.io",desc:"AI tutoring",color:"#8844FF",shape:"square"},
  {name:"RoadTrip",url:"https://roadtrip.blackroad.io",desc:"Agent hub",color:"#CC00AA",shape:"circle"},
  {name:"RoadCode",url:"https://roadcode.blackroad.io",desc:"Dev dashboard",color:"#4488FF",shape:"square"},
  {name:"okReusePixel",url:"https://blackroad.io/home/apps/OkReusePixel/",desc:"Asset launcher",color:"#00D4FF",shape:"circle"},
  {name:"PixelTown",url:"https://blackroad.io/home/apps/PixelTown/",desc:"Tile painter",color:"#FF2255",shape:"square"},
  {name:"Traffic",url:"https://blackroad.io/home/apps/Traffic/",desc:"Traffic analytics",color:"#4D8DFF",shape:"circle"},
  {name:"Canvas",url:"https://canvas.blackroad.io",desc:"Pixel canvas",color:"#00D4FF",shape:"circle"},
  {name:"Video",url:"https://video.blackroad.io",desc:"Video calls",color:"#FF2255",shape:"square"},
  {name:"Social",url:"https://social.blackroad.io",desc:"Social network",color:"#FF6B2B",shape:"circle"},
  {name:"Game",url:"https://game.blackroad.io",desc:"Text RPG",color:"#8844FF",shape:"square"},
  {name:"Tasks",url:"https://cadence.blackroad.io",desc:"Task manager",color:"#CC00AA",shape:"circle"},
  {name:"Radio",url:"https://radio.blackroad.io",desc:"Broadcasts",color:"#4488FF",shape:"square"},
  {name:"HQ",url:"https://hq.blackroad.io",desc:"Pixel office",color:"#00D4FF",shape:"circle"},
  {name:"Pay",url:"https://pay.blackroad.io",desc:"Payments",color:"#FF2255",shape:"square"},
  {name:"Status",url:"https://status.blackroad.io",desc:"Monitoring",color:"#FF6B2B",shape:"circle"}
];

// ── State ──
var windows = [];
var winIdCounter = 0;
var focusedWinId = null;
var zBase = 100;
var isMobile = window.innerWidth <= 768;

// ── Helpers ──
function esc(s){ var d=document.createElement("div"); d.textContent=s||""; return d.innerHTML; }
function $(id){ return document.getElementById(id); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

// ── Save/Restore state ──
function saveState(){
  try{
    var s = windows.map(function(w){
      return {name:w.name,url:w.url,color:w.color,x:w.x,y:w.y,w:w.w,h:w.h,maximized:w.maximized,minimized:w.minimized};
    });
    localStorage.setItem("br-os-windows", JSON.stringify(s));
  }catch(e){}
}
function loadState(){
  try{
    var s = JSON.parse(localStorage.getItem("br-os-windows"));
    if(s && s.length) return s;
  }catch(e){}
  return null;
}

// ── Desktop Icons ──
var iconGrid = $("desktop-icons");
APPS.forEach(function(app, i){
  var el = document.createElement("div");
  el.className = "desk-icon";
  el.setAttribute("data-app", i);
  var shapeClass = app.shape === "circle" ? "desk-icon-circle" : "desk-icon-square";
  el.innerHTML = '<div class="desk-icon-shape"><div class="'+shapeClass+'" style="background:'+app.color+'"></div></div>'
    + '<div class="desk-icon-label">'+esc(app.name)+'</div>';
  var clicks = 0, clickTimer = null;
  el.addEventListener("click", function(){
    clicks++;
    if(clicks === 1){
      clickTimer = setTimeout(function(){ clicks = 0; }, 350);
    }
    if(clicks >= 2){
      clearTimeout(clickTimer);
      clicks = 0;
      openWindow(app.name, app.url, app.color);
    }
  });
  // Mobile: single tap
  if(isMobile){
    el.addEventListener("click", function(e){
      e.stopPropagation();
      openWindow(app.name, app.url, app.color);
    });
  }
  iconGrid.appendChild(el);
});

// ── Window Management ──
function openWindow(name, url, color, opts){
  // Check if already open
  for(var i=0;i<windows.length;i++){
    if(windows[i].url === url && !windows[i].closed){
      if(windows[i].minimized) restoreWindow(windows[i].id);
      focusWindow(windows[i].id);
      return;
    }
  }
  opts = opts || {};
  var id = ++winIdCounter;
  var dw = window.innerWidth, dh = window.innerHeight - 40;
  var ww = opts.w || Math.min(900, dw * 0.65);
  var wh = opts.h || Math.min(600, dh * 0.7);
  var wx = opts.x !== undefined ? opts.x : Math.max(20, (dw - ww)/2 + (windows.length % 5)*30);
  var wy = opts.y !== undefined ? opts.y : Math.max(20, (dh - wh)/3 + (windows.length % 5)*30);

  var win = {id:id, name:name, url:url, color:color, x:wx, y:wy, w:ww, h:wh, maximized:!!opts.maximized, minimized:false, closed:false, el:null};
  windows.push(win);

  var el = document.createElement("div");
  el.className = "bw" + (isMobile || win.maximized ? " maximized" : "");
  el.id = "bw-"+id;
  if(!isMobile && !win.maximized){
    el.style.left = wx+"px"; el.style.top = wy+"px"; el.style.width = ww+"px"; el.style.height = wh+"px";
  }
  el.style.zIndex = ++zBase;
  el.innerHTML = '<div class="bw-titlebar">'
    + '<div class="bw-dot" style="background:'+color+'"></div>'
    + '<div class="bw-titlebar-drag"><span class="bw-title">'+esc(name)+'</span></div>'
    + '<div class="bw-btns">'
    + '<div class="bw-btn bw-btn-min" data-action="min"></div>'
    + '<div class="bw-btn bw-btn-max" data-action="max"></div>'
    + '<div class="bw-btn bw-btn-close" data-action="close"></div>'
    + '</div></div>'
    + '<div class="bw-body"><iframe src="'+esc(url)+'" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals" loading="lazy"></iframe></div>'
    + '<div class="bw-resize"></div>';
  win.el = el;
  $("desktop").appendChild(el);

  // Focus on click
  el.addEventListener("mousedown", function(){ focusWindow(id); });
  el.addEventListener("touchstart", function(){ focusWindow(id); }, {passive:true});

  // Titlebar buttons
  el.querySelectorAll(".bw-btn").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var action = btn.getAttribute("data-action");
      if(action === "close") closeWindow(id);
      else if(action === "min") minimizeWindow(id);
      else if(action === "max") toggleMaximize(id);
    });
  });

  // Drag
  if(!isMobile){
    var dragHandle = el.querySelector(".bw-titlebar-drag");
    var dragging = false, dragOx, dragOy;
    dragHandle.addEventListener("mousedown", function(e){
      if(win.maximized) return;
      dragging = true;
      dragOx = e.clientX - win.x;
      dragOy = e.clientY - win.y;
      el.style.transition = "none";
      focusWindow(id);
    });
    document.addEventListener("mousemove", function(e){
      if(!dragging) return;
      win.x = clamp(e.clientX - dragOx, -win.w+60, window.innerWidth-60);
      win.y = clamp(e.clientY - dragOy, 0, window.innerHeight-80);
      el.style.left = win.x+"px";
      el.style.top = win.y+"px";
    });
    document.addEventListener("mouseup", function(){
      if(dragging){ dragging=false; el.style.transition=""; saveState(); }
    });
    // Double-click titlebar to maximize
    dragHandle.addEventListener("dblclick", function(){ toggleMaximize(id); });

    // Resize
    var resizeHandle = el.querySelector(".bw-resize");
    var resizing = false, resOx, resOy, resOw, resOh;
    resizeHandle.addEventListener("mousedown", function(e){
      if(win.maximized) return;
      e.stopPropagation();
      resizing = true;
      resOx = e.clientX; resOy = e.clientY;
      resOw = win.w; resOh = win.h;
      focusWindow(id);
    });
    document.addEventListener("mousemove", function(e){
      if(!resizing) return;
      win.w = Math.max(320, resOw + (e.clientX - resOx));
      win.h = Math.max(200, resOh + (e.clientY - resOy));
      el.style.width = win.w+"px";
      el.style.height = win.h+"px";
    });
    document.addEventListener("mouseup", function(){
      if(resizing){ resizing=false; saveState(); }
    });
  }

  focusWindow(id);
  updateTaskbarWindows();
  saveState();
}

function closeWindow(id){
  var win = windows.find(function(w){return w.id===id;});
  if(!win) return;
  win.closed = true;
  if(win.el){
    var iframe = win.el.querySelector("iframe");
    if(iframe) iframe.src = "about:blank";
    win.el.remove();
  }
  windows = windows.filter(function(w){return w.id!==id;});
  updateTaskbarWindows();
  saveState();
  // Focus next window
  if(focusedWinId === id){
    var open = windows.filter(function(w){return !w.minimized && !w.closed;});
    if(open.length) focusWindow(open[open.length-1].id);
    else focusedWinId = null;
  }
}

function minimizeWindow(id){
  var win = windows.find(function(w){return w.id===id;});
  if(!win) return;
  win.minimized = true;
  if(win.el) win.el.style.display = "none";
  updateTaskbarWindows();
  saveState();
  var open = windows.filter(function(w){return !w.minimized && !w.closed;});
  if(open.length) focusWindow(open[open.length-1].id);
  else focusedWinId = null;
}

function restoreWindow(id){
  var win = windows.find(function(w){return w.id===id;});
  if(!win) return;
  win.minimized = false;
  if(win.el) win.el.style.display = "";
  focusWindow(id);
  updateTaskbarWindows();
  saveState();
}

function focusWindow(id){
  focusedWinId = id;
  windows.forEach(function(w){
    if(w.el){
      if(w.id === id){
        w.el.style.zIndex = ++zBase;
        w.el.classList.add("focused");
      } else {
        w.el.classList.remove("focused");
      }
    }
  });
  updateTaskbarWindows();
}

function toggleMaximize(id){
  var win = windows.find(function(w){return w.id===id;});
  if(!win || !win.el) return;
  if(isMobile) return;
  win.maximized = !win.maximized;
  if(win.maximized){
    win._prev = {x:win.x, y:win.y, w:win.w, h:win.h};
    win.el.classList.add("maximized");
    win.el.style.left = "0"; win.el.style.top = "0";
    win.el.style.width = "100%"; win.el.style.height = (window.innerHeight - 40)+"px";
  } else {
    win.el.classList.remove("maximized");
    if(win._prev){
      win.x=win._prev.x; win.y=win._prev.y; win.w=win._prev.w; win.h=win._prev.h;
    }
    win.el.style.left=win.x+"px"; win.el.style.top=win.y+"px";
    win.el.style.width=win.w+"px"; win.el.style.height=win.h+"px";
  }
  saveState();
}

// ── Taskbar Window Buttons ──
function updateTaskbarWindows(){
  var container = $("taskbar-windows");
  container.innerHTML = "";
  windows.forEach(function(w){
    if(w.closed) return;
    var btn = document.createElement("div");
    btn.className = "tb-win" + (w.id === focusedWinId && !w.minimized ? " active" : "");
    btn.innerHTML = '<span class="tb-win-dot" style="background:'+(w.color||'#555')+'"></span> '+esc(w.name);
    btn.addEventListener("click", function(){
      if(w.minimized){
        restoreWindow(w.id);
      } else if(w.id === focusedWinId){
        minimizeWindow(w.id);
      } else {
        focusWindow(w.id);
      }
    });
    container.appendChild(btn);
  });
}

// ── Start Menu ──
var startMenu = $("start-menu");
var startBtn = $("start-btn");
var startApps = $("start-menu-apps");

APPS.forEach(function(app){
  var el = document.createElement("div");
  el.className = "sm-app";
  var iconClass = app.shape === "circle" ? "sm-app-icon" : "sm-app-icon sq";
  el.innerHTML = '<div class="'+iconClass+'" style="background:'+app.color+'"></div>'
    + '<div class="sm-app-info"><div class="sm-app-name">'+esc(app.name)+'</div><div class="sm-app-desc">'+esc(app.desc)+'</div></div>';
  el.addEventListener("click", function(){
    startMenu.classList.remove("open");
    openWindow(app.name, app.url, app.color);
  });
  startApps.appendChild(el);
});

startBtn.addEventListener("click", function(e){
  e.stopPropagation();
  startMenu.classList.toggle("open");
  launcher.classList.remove("open");
});

// ── App Launcher ──
var launcher = $("launcher");
var launcherSearch = $("launcher-search");
var launcherGrid = $("launcher-grid");

function buildLauncherGrid(filter){
  launcherGrid.innerHTML = "";
  var f = (filter||"").toLowerCase();
  APPS.forEach(function(app){
    if(f && app.name.toLowerCase().indexOf(f)===-1 && app.desc.toLowerCase().indexOf(f)===-1) return;
    var el = document.createElement("div");
    el.className = "lc-app";
    var iconClass = app.shape === "circle" ? "lc-icon" : "lc-icon sq";
    el.innerHTML = '<div class="'+iconClass+'" style="background:'+app.color+'"></div><div class="lc-name">'+esc(app.name)+'</div>';
    el.addEventListener("click", function(){
      launcher.classList.remove("open");
      openWindow(app.name, app.url, app.color);
    });
    launcherGrid.appendChild(el);
  });
}
buildLauncherGrid();

launcherSearch.addEventListener("input", function(){
  buildLauncherGrid(launcherSearch.value.trim());
});

function toggleLauncher(){
  var isOpen = launcher.classList.contains("open");
  if(isOpen){
    launcher.classList.remove("open");
  } else {
    startMenu.classList.remove("open");
    launcher.classList.add("open");
    launcherSearch.value = "";
    buildLauncherGrid();
    setTimeout(function(){ launcherSearch.focus(); }, 50);
  }
}

// ── Context Menu ──
var ctxMenu = $("ctx-menu");
document.addEventListener("contextmenu", function(e){
  // Only on desktop background
  if(e.target.id === "desktop" || e.target.id === "desktop-icons" || e.target.closest("#desktop-icons")){
    e.preventDefault();
    ctxMenu.innerHTML = '<div class="ctx-item" data-action="launcher">Open App Launcher</div>'
      + '<div class="ctx-item" data-action="refresh">Refresh Desktop</div>'
      + '<div class="ctx-sep"></div>'
      + '<div class="ctx-item" data-action="minimize-all">Show Desktop</div>'
      + '<div class="ctx-item" data-action="close-all">Close All Windows</div>'
      + '<div class="ctx-sep"></div>'
      + '<div class="ctx-item" data-action="about">About BlackRoad OS</div>';
    ctxMenu.style.display = "block";
    ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + "px";
    ctxMenu.style.top = Math.min(e.clientY, window.innerHeight - 200) + "px";
  }
});
ctxMenu.addEventListener("click", function(e){
  var action = e.target.getAttribute("data-action");
  ctxMenu.style.display = "none";
  if(action === "launcher") toggleLauncher();
  else if(action === "refresh") location.reload();
  else if(action === "minimize-all") windows.forEach(function(w){if(!w.closed && !w.minimized) minimizeWindow(w.id);});
  else if(action === "close-all") windows.slice().forEach(function(w){if(!w.closed) closeWindow(w.id);});
  else if(action === "about") openAboutWindow();
});

function openAboutWindow(){
  var existing = windows.find(function(w){return w.name === "About" && !w.closed;});
  if(existing){ focusWindow(existing.id); return; }
  var id = ++winIdCounter;
  var dw = window.innerWidth, dh = window.innerHeight - 40;
  var ww = 360, wh = 280;
  var win = {id:id, name:"About", url:"about:blank", color:"#8844FF", x:(dw-ww)/2, y:(dh-wh)/3, w:ww, h:wh, maximized:false, minimized:false, closed:false, el:null};
  windows.push(win);
  var el = document.createElement("div");
  el.className = "bw" + (isMobile ? " maximized" : "");
  el.id = "bw-"+id;
  if(!isMobile){ el.style.left=win.x+"px"; el.style.top=win.y+"px"; el.style.width=ww+"px"; el.style.height=wh+"px"; }
  el.style.zIndex = ++zBase;
  el.innerHTML = '<div class="bw-titlebar">'
    + '<div class="bw-dot" style="background:#8844FF"></div>'
    + '<div class="bw-titlebar-drag"><span class="bw-title">About BlackRoad OS</span></div>'
    + '<div class="bw-btns"><div class="bw-btn bw-btn-close" data-action="close"></div></div></div>'
    + '<div class="bw-body" style="padding:24px;overflow-y:auto;background:var(--bg)">'
    + '<div style="display:flex;gap:4px;align-items:center;margin-bottom:12px"><div style="width:10px;height:10px;border-radius:50%;background:#FF2255"></div><div style="width:10px;height:10px;border-radius:3px;background:#8844FF"></div></div>'
    + '<h3 style="font-family:Space Grotesk,sans-serif;font-size:16px;font-weight:700;color:#e5e5e5;margin-bottom:8px">BlackRoad OS</h3>'
    + '<p style="font-size:12px;color:#a3a3a3;line-height:1.6;margin-bottom:12px">Sovereign computing platform. Your AI. Your hardware. Your data. No middlemen.</p>'
    + '<p style="font-size:11px;color:#525252;line-height:1.5">Founded November 17, 2025<br>Delaware C-Corp<br>Alexa Louise Amundson, CEO<br>EIN: 41-2663817</p>'
    + '<p style="font-size:10px;color:#333;margin-top:12px;font-family:JetBrains Mono,monospace">14 products / 7 nodes / 52 TOPS</p>'
    + '</div><div class="bw-resize"></div>';
  win.el = el;
  $("desktop").appendChild(el);
  el.addEventListener("mousedown", function(){ focusWindow(id); });
  el.querySelector(".bw-btn-close").addEventListener("click", function(e){ e.stopPropagation(); closeWindow(id); });
  // Drag for about window
  if(!isMobile){
    var dh2 = el.querySelector(".bw-titlebar-drag");
    var dr=false, ox, oy;
    dh2.addEventListener("mousedown",function(e){ dr=true; ox=e.clientX-win.x; oy=e.clientY-win.y; focusWindow(id); });
    document.addEventListener("mousemove",function(e){ if(!dr)return; win.x=e.clientX-ox; win.y=e.clientY-oy; el.style.left=win.x+"px"; el.style.top=win.y+"px"; });
    document.addEventListener("mouseup",function(){ dr=false; });
  }
  focusWindow(id);
  updateTaskbarWindows();
}

// ── Keyboard Shortcuts ──
document.addEventListener("keydown", function(e){
  var tag = (e.target.tagName||"").toLowerCase();
  var isInput = tag === "input" || tag === "textarea" || tag === "select";

  // Alt+Space or Space (when not in input): launcher
  if(e.key === " " && e.altKey){ e.preventDefault(); toggleLauncher(); return; }
  if(e.key === " " && !isInput && !launcher.classList.contains("open")){ e.preventDefault(); toggleLauncher(); return; }

  // Escape: close launcher/start/context
  if(e.key === "Escape"){
    if(launcher.classList.contains("open")){ launcher.classList.remove("open"); return; }
    if(startMenu.classList.contains("open")){ startMenu.classList.remove("open"); return; }
    if(ctxMenu.style.display === "block"){ ctxMenu.style.display = "none"; return; }
  }

  // Alt+F4: close focused window
  if(e.key === "F4" && e.altKey){
    e.preventDefault();
    if(focusedWinId) closeWindow(focusedWinId);
    return;
  }

  // Alt+Tab: cycle windows
  if(e.key === "Tab" && e.altKey){
    e.preventDefault();
    var open = windows.filter(function(w){return !w.closed;});
    if(open.length < 2) return;
    var idx = open.findIndex(function(w){return w.id === focusedWinId;});
    var next = open[(idx + 1) % open.length];
    if(next.minimized) restoreWindow(next.id);
    focusWindow(next.id);
    return;
  }

  // Ctrl+D: show desktop (minimize all)
  if(e.key === "d" && (e.ctrlKey || e.metaKey)){
    e.preventDefault();
    var allMinimized = windows.every(function(w){return w.closed || w.minimized;});
    if(allMinimized){
      windows.forEach(function(w){if(!w.closed && w.minimized) restoreWindow(w.id);});
    } else {
      windows.forEach(function(w){if(!w.closed && !w.minimized) minimizeWindow(w.id);});
    }
    return;
  }
});

// Close menus on click outside
document.addEventListener("click", function(e){
  if(!startMenu.contains(e.target) && !startBtn.contains(e.target)){
    startMenu.classList.remove("open");
  }
  if(ctxMenu.style.display === "block" && !ctxMenu.contains(e.target)){
    ctxMenu.style.display = "none";
  }
  if(launcher.classList.contains("open") && !launcher.contains(e.target)){
    launcher.classList.remove("open");
  }
});

// ── Clock ──
function updateClock(){
  var now = new Date();
  var h = now.getHours(), m = now.getMinutes();
  $("taskbar-clock").textContent = (h<10?"0":"")+h+":"+(m<10?"0":"")+m;
}
updateClock();
setInterval(updateClock, 10000);

// ── Widgets (desktop only) ──
if(!isMobile){
  function makeWidget(id, x, y, title, val, sub){
    var w = document.createElement("div");
    w.className = "widget";
    w.id = "widget-"+id;
    w.style.right = x+"px"; w.style.top = y+"px";
    w.innerHTML = '<div class="widget-title">'+esc(title)+'</div><div class="widget-val" id="wv-'+id+'">'+esc(val)+'</div><div class="widget-sub" id="ws-'+id+'">'+esc(sub)+'</div>';
    $("desktop").appendChild(w);
  }
  makeWidget("agents", 20, 20, "Agents Online", "--", "fleet");
  makeWidget("products", 20, 110, "Products Up", "--", "of 14");
  makeWidget("clock", 20, 200, "System Time", "--:--:--", new Date().toLocaleDateString());
  makeWidget("mem", 20, 290, "Memory Hash", "...", "chain active");

  // Widget clock
  function updateWidgetClock(){
    var now = new Date();
    var el = $("wv-clock");
    if(el) el.textContent = now.toLocaleTimeString();
    var el2 = $("ws-clock");
    if(el2) el2.textContent = now.toLocaleDateString();
  }
  updateWidgetClock();
  setInterval(updateWidgetClock, 1000);
}

// ── Tray: fetch live stats ──
function fetchStats(){
  fetch("/api/stats").then(function(r){return r.json()}).then(function(d){
    var agentEl = $("tray-agents");
    if(agentEl) agentEl.textContent = (d.agents||0)+" agents";
    if(!isMobile){
      var wv = $("wv-agents");
      if(wv) wv.textContent = d.agents || 0;
    }
  }).catch(function(){});
}
fetchStats();
setInterval(fetchStats, 60000);

function fetchProducts(){
  fetch("/api/products").then(function(r){return r.json()}).then(function(d){
    var up = 0;
    (d.products||[]).forEach(function(p){ if(p.ok) up++; });
    if(!isMobile){
      var wv = $("wv-products");
      if(wv) wv.textContent = up;
      var ws = $("ws-products");
      if(ws) ws.textContent = "of "+(d.products||[]).length;
    }
  }).catch(function(){});
}
fetchProducts();
setInterval(fetchProducts, 30000);

// Memory hash ticker
function fetchMemHash(){
  var hash = Math.random().toString(36).slice(2,10);
  var el = $("tray-mem");
  if(el) el.textContent = hash;
  if(!isMobile){
    var wv = $("wv-mem");
    if(wv) wv.textContent = hash;
  }
}
fetchMemHash();
setInterval(fetchMemHash, 5000);

// ── Intent-to-apps mapping ──
function getAppsForIntent(intent){
  var t = (intent||"").toLowerCase();
  if(t.indexOf("game")!==-1) return ["Game","Canvas","Chat"];
  if(t.indexOf("code")!==-1||t.indexOf("app")!==-1||t.indexOf("startup")!==-1) return ["RoadCode","Chat","Search"];
  if(t.indexOf("music")!==-1||t.indexOf("song")!==-1||t.indexOf("audio")!==-1) return ["Radio","Canvas","Chat"];
  if(t.indexOf("video")!==-1||t.indexOf("stream")!==-1) return ["Video","Chat","Social"];
  if(t.indexOf("learn")!==-1||t.indexOf("study")!==-1||t.indexOf("homework")!==-1) return ["Tutor","Search","Chat"];
  if(t.indexOf("social")!==-1||t.indexOf("post")!==-1||t.indexOf("friend")!==-1) return ["Social","Chat","Canvas"];
  if(t.indexOf("write")!==-1||t.indexOf("blog")!==-1||t.indexOf("story")!==-1) return ["Search","Chat","Social"];
  return ["Chat","Search","RoadCode"];
}

function openAppsByName(names){
  var offset=0;
  names.forEach(function(name){
    var app = APPS.find(function(a){return a.name===name;});
    if(app){
      openWindow(app.name, app.url, app.color, {x: 60+offset*40, y: 40+offset*30});
      offset++;
    }
  });
}

// ── Lucidia Panel ──
var lucidiaPanel = $("lucidia-panel");
var lucidiaMessages = $("lucidia-messages");
var lucidiaInput = $("lucidia-input");
var lucidiaSend = $("lucidia-send");
var lucidiaHeader = $("lucidia-header");
var lucidiaMinBtn = $("lucidia-min-btn");
var lucidiaUserId = localStorage.getItem("br-username") || ("visitor-"+Math.random().toString(36).slice(2,6));

function addLucidiaMsg(text, role){
  var div = document.createElement("div");
  div.className = "lucidia-msg "+(role||"assistant");
  div.textContent = text;
  lucidiaMessages.appendChild(div);
  lucidiaMessages.scrollTop = lucidiaMessages.scrollHeight;
}

function sendToLucidia(text){
  if(!text.trim()) return;
  addLucidiaMsg(text, "user");
  lucidiaInput.value = "";
  fetch("https://roadtrip.blackroad.io/api/rooms/general/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({sender:lucidiaUserId,content:text})
  }).then(function(r){return r.json()}).then(function(d){
    if(d && d.reply) addLucidiaMsg(d.reply, "assistant");
    else addLucidiaMsg("I heard you. Working on it.", "assistant");
  }).catch(function(){
    addLucidiaMsg("I heard you. Working on it.", "assistant");
  });
}

lucidiaSend.addEventListener("click", function(){ sendToLucidia(lucidiaInput.value); });
lucidiaInput.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); sendToLucidia(lucidiaInput.value); }});

var lucidiaMinimized = false;
function toggleLucidiaMin(){
  lucidiaMinimized = !lucidiaMinimized;
  if(lucidiaMinimized){
    lucidiaPanel.classList.add("minimized");
  } else {
    lucidiaPanel.classList.remove("minimized");
  }
}
lucidiaHeader.addEventListener("click", function(e){
  if(e.target === lucidiaMinBtn || lucidiaMinBtn.contains(e.target)){
    toggleLucidiaMin();
  } else if(lucidiaMinimized){
    toggleLucidiaMin();
  }
});
lucidiaMinBtn.addEventListener("click", function(e){ e.stopPropagation(); toggleLucidiaMin(); });

function showLucidia(){
  lucidiaPanel.classList.add("open");
}

// ── First-Visit Hook ──
var isOnboarded = localStorage.getItem("br-onboarded") === "true" || localStorage.getItem("br-token");

function dismissOnboard(){
  localStorage.setItem("br-onboarded", "true");
  var ob = $("onboarding");
  ob.style.opacity = "0";
  setTimeout(function(){ ob.style.display = "none"; }, 600);
}

if(!isOnboarded){
  var obOverlay = $("onboarding");
  obOverlay.style.display = "flex";
} else {
  var obOverlay = $("onboarding");
  if(obOverlay) obOverlay.style.display = "none";
}

// Legacy compat — keep these in case other code references them
if(false){

      // Open relevant app windows with slight stagger
      var appNames = getAppsForIntent(intent);
      setTimeout(function(){
        openAppsByName(appNames);
      }, 300);

      // Phase 4: Lucidia appears 1s after windows open
      setTimeout(function(){
        showLucidia();
        addLucidiaMsg("Got it. I'm setting this up with you.", "assistant");
        setTimeout(function(){
          addLucidiaMsg("Everything you do here is remembered. Come back anytime -- I'll keep it ready.", "assistant");
        }, 2000);
      }, 1400);
    }
  });
}

{
  // ── Returning user: restore saved state ──
  var saved = loadState();
  if(saved && saved.length){
    saved.forEach(function(s){
      var app = APPS.find(function(a){return a.url === s.url;});
      if(!app) return;
      openWindow(app.name, app.url, app.color, {x:s.x, y:s.y, w:s.w, h:s.h, maximized:s.maximized});
      if(s.minimized){
        var w = windows[windows.length-1];
        if(w) minimizeWindow(w.id);
      }
    });
  }
  // Show Lucidia panel for returning users too
  setTimeout(function(){ showLucidia(); }, 500);
}

})();
<\/script><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`;
}

// ── PRICING PAGE ──
var PRICING_HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pricing — BlackRoad OS</title>
<meta name="description" content="First month free. $10/module. $100/everything. No hidden fees. No annual traps. We run on $136/month of Raspberry Pis.">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#000;--card:#0a0a0a;--elevated:#111;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--text);font-family:var(--sg);padding:20px}
.wrap{max-width:900px;margin:0 auto}
h1{font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:700;text-align:center;margin:40px 0 8px}
.sub{color:var(--dim);text-align:center;font-size:15px;margin-bottom:40px;line-height:1.6}
.hero{background:var(--surface);border:1px solid var(--green);border-radius:16px;padding:32px;text-align:center;margin-bottom:32px}
.hero h2{color:var(--green);font-family:'Space Grotesk',sans-serif;font-size:28px}
.hero p{color:var(--dim);margin-top:8px;font-size:14px}
.hero a{display:inline-block;margin-top:16px;padding:12px 32px;background:var(--green);color:#000;border-radius:8px;text-decoration:none;font-weight:700;font-family:'Space Grotesk',sans-serif;font-size:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:32px}
.mod{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center}
.mod h3{font-family:'Space Grotesk',sans-serif;font-size:15px;margin-bottom:4px}
.mod .price{color:var(--pink);font-size:20px;font-weight:700;font-family:'Space Grotesk',sans-serif}
.mod .desc{color:var(--dim);font-size:11px;margin-top:4px}
.all{background:var(--surface);border:2px solid var(--green);border-radius:16px;padding:32px;text-align:center;margin-bottom:32px}
.all h2{font-family:'Space Grotesk',sans-serif;font-size:24px}
.all .price{color:var(--green);font-size:48px;font-weight:700;font-family:'Space Grotesk',sans-serif;margin:12px 0}
.ent{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:32px}
.ent h2{font-family:'Space Grotesk',sans-serif;font-size:20px;margin-bottom:16px}
table{width:100%;border-collapse:collapse;font-size:13px}
td,th{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border)}
th{color:var(--dim);font-weight:500;font-size:11px;text-transform:uppercase}
.compare{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:32px}
.compare h2{font-family:'Space Grotesk',sans-serif;font-size:20px;margin-bottom:16px}
.footer{text-align:center;color:var(--dim);font-size:12px;padding:32px 0;line-height:1.8}
.footer a{color:var(--pink);text-decoration:none}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body>
<div class="wrap">
<h1>The price is the price.</h1>
<p class="sub">No surprises. No hidden fees. No annual traps. No "contact sales for pricing."<br>We run BlackRoad on $136/month of Raspberry Pis. That's why we can charge this.</p>

<div class="hero">
  <h2>Try it now. No signup required.</h2>
  <p>Open BlackRoad OS in your browser. Drag windows. Talk to AI agents. Browse the social feed. Write code.<br>Everything works instantly as a guest. Sign up when you want to save your desktop.</p>
  <a href="https://os.blackroad.io">Launch OS — Free</a>
  <div style="margin-top:16px;font-family:monospace;font-size:11px;color:#666">16 users · 15 products · 27 agents · 67,000 lines of code · runs on 5 Raspberry Pis</div></div>

<h2 style="font-family:'Space Grotesk',sans-serif;font-size:18px;margin-bottom:12px">Pick your modules — $10/mo each</h2>
<div class="grid">
  <div class="mod"><h3>Tutor</h3><div class="price">$10</div><div class="desc">AI homework solver. Unlimited step-by-step answers.</div></div>
  <div class="mod"><h3>Chat</h3><div class="price">$10</div><div class="desc">Sovereign chat. Agent @mentions. Persistent rooms.</div></div>
  <div class="mod"><h3>Search</h3><div class="price">$10</div><div class="desc">Search 1,369+ repos. Your own sovereign search engine.</div></div>
  <div class="mod"><h3>Social</h3><div class="price">$10</div><div class="desc">Ad-free social. No algorithm. You own your posts.</div></div>
  <div class="mod"><h3>Canvas</h3><div class="price">$10</div><div class="desc">Design studio. AI-assisted creation.</div></div>
  <div class="mod"><h3>Video</h3><div class="price">$10</div><div class="desc">Video editing. AI production pipeline.</div></div>
  <div class="mod"><h3>Cadence</h3><div class="price">$10</div><div class="desc">Music and audio creation.</div></div>
  <div class="mod"><h3>RoadTrip</h3><div class="price">$10</div><div class="desc">Agent hub. 18+ AI agents working for you.</div></div>
  <div class="mod"><h3>Memory</h3><div class="price">$10</div><div class="desc">Persistent AI memory. PS-SHA∞ hash chain. Never forgets.</div></div>
  <div class="mod"><h3>PitStop</h3><div class="price">$10</div><div class="desc">Fleet dashboard. Monitor your devices and nodes.</div></div></div>

<div class="all">
  <h2>Or get everything</h2>
  <div class="price">$100<span style="font-size:16px;color:var(--dim)">/mo</span></div>
  <p style="color:var(--dim);font-size:14px">Every module. Every product. Every agent. Every feature. Forever.<br>This is the maximum any individual human ever pays.</p>
  <a href="https://auth.blackroad.io" style="display:inline-block;margin-top:16px;padding:12px 32px;background:var(--green);color:#000;border-radius:8px;text-decoration:none;font-weight:700;font-family:'Space Grotesk',sans-serif">Start free month</a></div>

<div class="ent">
  <h2>Enterprise</h2>
  <p style="color:var(--dim);font-size:13px;margin-bottom:16px">For teams and organizations. Still cheaper than what you pay now.</p>
  <table>
    <tr><th>Tier</th><th>Seats</th><th>Price</th><th>Per seat</th><th>vs Salesforce</th></tr>
    <tr><td>Team</td><td>5</td><td>$75/mo</td><td>$15</td><td>Save $50/seat</td></tr>
    <tr><td>Startup</td><td>10</td><td>$100/mo</td><td>$10</td><td>Save $155/seat</td></tr>
    <tr><td>Business</td><td>25</td><td>$200/mo</td><td>$8</td><td>Save $157/seat</td></tr>
    <tr><td>Enterprise S</td><td>50</td><td>$300/mo</td><td>$6</td><td>Save $159/seat</td></tr>
    <tr><td>Enterprise M</td><td>100</td><td>$500/mo</td><td>$5</td><td>Save $160/seat</td></tr>
    <tr><td>Enterprise L</td><td>250</td><td>$1,000/mo</td><td>$4</td><td>Save $161/seat</td></tr>
    <tr><td>Enterprise XL</td><td>500</td><td>$2,000/mo</td><td>$4</td><td>Save $161/seat</td></tr>
    <tr><td>Enterprise XXL</td><td>1,000</td><td>$4,000/mo</td><td>$4</td><td>Save $161/seat</td></tr>
    <tr><td>Unlimited</td><td>∞</td><td>$8,000/mo</td><td>—</td><td>Save $100K+/mo</td></tr>
  </table></div>

<div class="compare">
  <h2>What you're paying now vs BlackRoad</h2>
  <table>
    <tr><th>Service</th><th>They charge</th><th>BlackRoad</th><th>You save</th></tr>
    <tr><td>Homework help</td><td>$15.95/mo (Chegg, dead)</td><td>$10/mo unlimited</td><td>$5.95/mo</td></tr>
    <tr><td>AI assistant</td><td>$20/mo (ChatGPT Plus)</td><td>Included in $100</td><td>$20/mo</td></tr>
    <tr><td>Code editor</td><td>$20-40/mo (Cursor/Copilot)</td><td>Included in $100</td><td>$20-40/mo</td></tr>
    <tr><td>Creative suite</td><td>$69.99/mo (Adobe)</td><td>$10/mo (Canvas+Video+Cadence)</td><td>$60/mo</td></tr>
    <tr><td>Cloud hosting</td><td>$20-100/mo (Vercel/AWS)</td><td>Self-hosted on your devices</td><td>$20-100/mo</td></tr>
    <tr><td>CRM (per seat)</td><td>$165/mo (Salesforce)</td><td>$4-15/seat</td><td>$150+/seat</td></tr>
    <tr><td>Social network</td><td>Free (you're the product)</td><td>$10/mo (you're the owner)</td><td>Your data back</td></tr>
    <tr><td style="font-weight:700">Typical stack</td><td style="font-weight:700">$300-500/mo</td><td style="font-weight:700;color:var(--green)">$100/mo</td><td style="font-weight:700;color:var(--green)">$200-400/mo</td></tr>
  </table></div>

<div class="footer">
  <p>BlackRoad OS, Inc. — Delaware C-Corp — $0 VC funding — $0 debt<br>
  Infrastructure: $136/month on Raspberry Pis. Margins: 97%.<br>
  We don't need to gouge you. We need you to come back.<br><br>
  <a href="https://blackroad.io">Home</a> · <a href="https://auth.blackroad.io">Sign Up</a> · <a href="https://github.com/BlackRoadOS">GitHub</a><br><br>
  Remember the Road. Pave Tomorrow.</p></div></div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`;

// ── DEVICE ONBOARDING PAGE ──
var DEVICES_HTML = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Devices, Your Network — BlackRoad OS</title>
<meta name="description" content="Plug in any device. Find it via Bluetooth. It becomes a node on your personal BlackRoad network. Your data working for you.">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#000;--card:#0a0a0a;--elevated:#111;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--text);font-family:var(--sg);padding:20px}
.wrap{max-width:700px;margin:0 auto}
h1{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;text-align:center;margin:40px 0 8px}
.sub{color:var(--dim);text-align:center;font-size:14px;margin-bottom:40px;line-height:1.6}
.step{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:16px}
.step h3{font-family:'Space Grotesk',sans-serif;font-size:18px;margin-bottom:8px}
.step p{color:var(--dim);font-size:13px;line-height:1.6}
.num{display:inline-block;width:28px;height:28px;background:var(--pink);color:#fff;border-radius:50%;text-align:center;line-height:28px;font-weight:700;font-size:13px;margin-right:8px}
.devices{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:24px 0}
.dev{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center}
.dev .icon{font-size:28px;margin-bottom:6px}
.dev .name{font-size:12px;color:var(--dim)}
.cta{text-align:center;margin:32px 0}
.cta a{display:inline-block;padding:14px 32px;background:var(--green);color:#000;border-radius:8px;text-decoration:none;font-weight:700;font-family:'Space Grotesk',sans-serif;font-size:16px}
.footer{text-align:center;color:var(--dim);font-size:12px;padding:32px 0;line-height:1.8}
.footer a{color:var(--pink);text-decoration:none}</style><link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head><body>
<div class="wrap">
<h1>Your devices. Your network.</h1>
<p class="sub">That old laptop in the closet. The Raspberry Pi from 2019. The speaker you forgot about.<br>Plug them in. They become nodes. Your data works for you.</p>

<div class="step"><h3><span class="num">1</span>Sign up for BlackRoad</h3><p>First month free. Get your RoadID — your sovereign, portable, persistent AI identity. It remembers everything across every device you own.</p></div>

<div class="step"><h3><span class="num">2</span>Install the agent on any device</h3><p>One command. One script. Works on Linux, macOS, Windows, Raspberry Pi, Jetson, anything with a CPU.<br><code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:12px;color:var(--green)">curl -sL https://blackroad.io/install | bash</code></p></div>

<div class="step"><h3><span class="num">3</span>Discover via Bluetooth or network</h3><p>BlackRoad scans your local network and Bluetooth for devices. Old speakers become audio nodes. Old phones become compute nodes. Old laptops become storage nodes. Anything with power and connectivity joins your mesh.</p></div>

<div class="step"><h3><span class="num">4</span>Your data migrates and starts working</h3><p>Photos, documents, messages, projects — they flow to your personal mesh. Encrypted. Distributed. No cloud. No monthly storage fees. Your data on YOUR devices, working for YOU. AI inference runs locally. Memory persists on your nodes. The more devices you add, the more powerful your personal OS becomes.</p></div>

<h2 style="font-family:'Space Grotesk',sans-serif;font-size:18px;margin:24px 0 12px;text-align:center">What becomes a node?</h2>
<div class="devices">
  <div class="dev"><div class="icon">🥧</div><div class="name">Raspberry Pi</div></div>
  <div class="dev"><div class="icon">💻</div><div class="name">Old laptop</div></div>
  <div class="dev"><div class="icon">📱</div><div class="name">Old phone</div></div>
  <div class="dev"><div class="icon">🔊</div><div class="name">Smart speaker</div></div>
  <div class="dev"><div class="icon">📺</div><div class="name">TV / streaming box</div></div>
  <div class="dev"><div class="icon">🎮</div><div class="name">Game console</div></div>
  <div class="dev"><div class="icon">🖥️</div><div class="name">Desktop PC</div></div>
  <div class="dev"><div class="icon">⌚</div><div class="name">Smartwatch</div></div>
  <div class="dev"><div class="icon">📷</div><div class="name">Security camera</div></div>
  <div class="dev"><div class="icon">🔌</div><div class="name">Any USB device</div></div></div>

<div class="step" style="border-color:var(--green)">
  <h3>The math</h3>
  <p>The average household has <strong>14-22 connected devices</strong>. Most are idle 95% of the time. That's wasted compute, wasted storage, wasted potential.<br><br>
  BlackRoad turns idle devices into your personal sovereign infrastructure. Instead of renting cloud storage at $10/mo per 2TB, use the 500GB sitting unused on your old laptop. Instead of paying for AI inference at $0.01/token, run Ollama on your spare Pi.<br><br>
  <strong>Your devices are already paid for. Make them work for you.</strong></p></div>

<div class="cta"><a href="https://auth.blackroad.io">Start free month — bring your devices</a></div>

<div class="footer">
  <p><a href="https://blackroad.io">Home</a> · <a href="https://blackroad.io/pricing">Pricing</a> · <a href="https://github.com/BlackRoadOS">GitHub</a><br><br>
  Remember the Road. Pave Tomorrow.</p></div></div><script src="https://bb.blackroad.io/bb.js" defer><\/script><script src="https://images.blackroad.io/widgets/live-screen.js" defer><\/script></body></html>`;
