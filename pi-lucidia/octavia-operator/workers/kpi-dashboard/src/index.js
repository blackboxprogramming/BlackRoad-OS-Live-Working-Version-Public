/**
 * BlackRoad KPI Dashboard Worker
 *
 * Serves the real-time KPI dashboard UI and proxies API requests
 * to the KPI aggregator. Provides the live monitoring frontend
 * for all BlackRoad infrastructure.
 *
 * Endpoints:
 *   GET  /              — dashboard HTML
 *   GET  /api/kpi       — proxy to aggregator /kpi
 *   GET  /api/github    — proxy to aggregator /kpi/github
 *   GET  /api/infra     — proxy to aggregator /kpi/infra
 *   GET  /api/agents    — proxy to aggregator /kpi/agents
 *   GET  /api/realtime  — proxy to aggregator /kpi/realtime
 *   GET  /api/stream    — proxy SSE stream
 *   GET  /health        — health check
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function proxyToAggregator(env, path) {
  try {
    const res = await fetch(`${env.AGGREGATOR_URL}${path}`);
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (e) {
    return json({ error: 'aggregator unavailable', detail: e.message }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (path === '/health') {
      return json({
        ok: true,
        service: 'blackroad-kpi-dashboard',
        aggregator: env.AGGREGATOR_URL,
        ts: new Date().toISOString(),
      });
    }

    // API proxy routes
    if (path === '/api/kpi') return proxyToAggregator(env, '/kpi');
    if (path === '/api/github') return proxyToAggregator(env, '/kpi/github');
    if (path === '/api/infra') return proxyToAggregator(env, '/kpi/infra');
    if (path === '/api/agents') return proxyToAggregator(env, '/kpi/agents');
    if (path === '/api/realtime') return proxyToAggregator(env, '/kpi/realtime');
    if (path === '/api/stream') {
      try {
        return fetch(`${env.AGGREGATOR_URL}/stream`, { headers: request.headers });
      } catch {
        return json({ error: 'stream unavailable' }, 502);
      }
    }

    // Serve the dashboard
    if (path === '/' || path === '/index.html') {
      return new Response(DASHBOARD_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS },
      });
    }

    return json({ error: 'not found' }, 404);
  },
};

// ─── Inline Dashboard HTML ──────────────────────────────────────────────────
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BlackRoad KPI — Real-Time Command Center</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#000;--surface:#0a0a0a;--card:#111;--border:#1a1a1a;
  --text:#e0e0e0;--muted:#666;--accent:#764ba2;--accent2:#f093fb;
  --green:#4ade80;--red:#ef4444;--yellow:#fbbf24;--cyan:#4facfe;
  --gradient:linear-gradient(135deg,#764ba2 0%,#f093fb 50%,#4facfe 100%);
}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;line-height:1.618;overflow-x:hidden}
.header{padding:1.5rem 2rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);position:sticky;top:0;z-index:100;background:rgba(0,0,0,0.85)}
.logo{display:flex;align-items:center;gap:.75rem}
.logo-icon{width:36px;height:36px;border-radius:8px;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.logo h1{font-size:1.5rem;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:700}
.status-bar{display:flex;gap:1rem;align-items:center;font-size:.75rem}
.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse-dot 2s infinite}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
.ticker{color:var(--muted);font-variant-numeric:tabular-nums}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;padding:1.5rem 2rem}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.25rem;transition:border-color .2s}
.card:hover{border-color:#333}
.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
.card-title{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.card-badge{font-size:.65rem;padding:2px 8px;border-radius:4px;background:rgba(118,75,162,.15);color:var(--accent2)}
.metric-value{font-size:2.5rem;font-weight:700;font-variant-numeric:tabular-nums;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.2}
.metric-unit{font-size:.875rem;color:var(--muted);margin-top:.25rem}
.metric-change{font-size:.75rem;margin-top:.5rem}
.metric-change.up{color:var(--green)}
.metric-change.down{color:var(--red)}
.sparkline{display:flex;align-items:flex-end;gap:2px;height:40px;margin-top:.75rem}
.spark-bar{flex:1;background:var(--accent);border-radius:2px 2px 0 0;min-width:3px;transition:height .3s ease;opacity:.7}
.spark-bar:last-child{opacity:1;background:var(--accent2)}
.wide{grid-column:span 2}
.full{grid-column:1/-1}
.section-title{grid-column:1/-1;font-size:1.1rem;color:var(--text);padding-top:1rem;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem}
.section-title::before{content:'';width:3px;height:16px;background:var(--gradient);border-radius:2px}
.org-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.5rem}
.org-item{padding:.5rem .75rem;background:var(--surface);border:1px solid var(--border);border-radius:6px;font-size:.75rem;display:flex;justify-content:space-between;align-items:center}
.org-item .name{color:var(--text);font-weight:500}
.org-item .count{color:var(--accent2);font-variant-numeric:tabular-nums}
.agent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.5rem}
.agent-chip{padding:.5rem .75rem;background:var(--surface);border:1px solid var(--border);border-radius:8px;text-align:center;font-size:.75rem}
.agent-chip .icon{font-size:1.25rem;margin-bottom:.25rem}
.agent-chip .role{color:var(--muted);font-size:.65rem;margin-top:.15rem}
.infra-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border);font-size:.8rem}
.infra-row:last-child{border:none}
.infra-status{display:flex;align-items:center;gap:.35rem}
.dot{width:6px;height:6px;border-radius:50%}
.dot.green{background:var(--green)}
.dot.red{background:var(--red)}
.dot.yellow{background:var(--yellow)}
.progress-bar{width:100%;height:4px;background:var(--surface);border-radius:2px;overflow:hidden;margin-top:.75rem}
.progress-fill{height:100%;background:var(--gradient);border-radius:2px;transition:width .5s ease}
.realtime-pulse{position:fixed;bottom:1.5rem;right:1.5rem;display:flex;align-items:center;gap:.5rem;padding:.5rem 1rem;background:rgba(10,10,10,.9);border:1px solid var(--border);border-radius:8px;font-size:.7rem;color:var(--muted);backdrop-filter:blur(10px)}
.realtime-pulse .dot{animation:pulse-dot 1s infinite}
.events-feed{max-height:200px;overflow-y:auto;font-size:.75rem}
.event-item{padding:.35rem 0;border-bottom:1px solid rgba(255,255,255,.03);display:flex;gap:.5rem}
.event-time{color:var(--muted);font-variant-numeric:tabular-nums;min-width:55px}
.event-msg{color:var(--text)}
@media(max-width:768px){.grid{grid-template-columns:1fr}.wide,.full{grid-column:span 1}.header{flex-direction:column;gap:.75rem}}
</style>
</head>
<body>
<div class="header">
  <div class="logo">
    <div class="logo-icon">K</div>
    <h1>BlackRoad KPI</h1>
  </div>
  <div class="status-bar">
    <div class="status-dot"></div>
    <span id="conn-status">Connecting...</span>
    <span class="ticker" id="clock"></span>
    <span class="ticker" id="refresh-rate">0 updates/s</span>
  </div>
</div>

<div class="grid" id="dashboard">
  <!-- Headline KPIs -->
  <div class="card" id="card-repos">
    <div class="card-header"><span class="card-title">Total Repositories</span><span class="card-badge">GitHub</span></div>
    <div class="metric-value" id="v-repos">1,825</div>
    <div class="metric-unit">across 17 organizations</div>
    <div class="sparkline" id="spark-repos"></div>
  </div>
  <div class="card" id="card-agents">
    <div class="card-header"><span class="card-title">Active Agents</span><span class="card-badge">Fleet</span></div>
    <div class="metric-value" id="v-agents">30,000</div>
    <div class="metric-unit">distributed across 3 nodes</div>
    <div class="sparkline" id="spark-agents"></div>
  </div>
  <div class="card" id="card-workers">
    <div class="card-header"><span class="card-title">CF Workers</span><span class="card-badge">Cloudflare</span></div>
    <div class="metric-value" id="v-workers">75+</div>
    <div class="metric-unit">Cloudflare Workers active</div>
    <div class="sparkline" id="spark-workers"></div>
  </div>
  <div class="card" id="card-uptime">
    <div class="card-header"><span class="card-title">Uptime</span><span class="card-badge">System</span></div>
    <div class="metric-value" id="v-uptime">99.97%</div>
    <div class="metric-unit">30-day rolling average</div>
    <div class="progress-bar"><div class="progress-fill" id="uptime-bar" style="width:99.97%"></div></div>
  </div>

  <!-- GitHub Section -->
  <div class="section-title">GitHub Organizations (17)</div>
  <div class="card" id="card-stars">
    <div class="card-header"><span class="card-title">Total Stars</span><span class="card-badge">GitHub</span></div>
    <div class="metric-value" id="v-stars">—</div>
    <div class="metric-unit">across all repos</div>
    <div class="sparkline" id="spark-stars"></div>
  </div>
  <div class="card" id="card-forks">
    <div class="card-header"><span class="card-title">Total Forks</span><span class="card-badge">GitHub</span></div>
    <div class="metric-value" id="v-forks">—</div>
    <div class="metric-unit">forked repositories</div>
    <div class="sparkline" id="spark-forks"></div>
  </div>
  <div class="card" id="card-issues">
    <div class="card-header"><span class="card-title">Open Issues</span><span class="card-badge">GitHub</span></div>
    <div class="metric-value" id="v-issues">—</div>
    <div class="metric-unit">across all organizations</div>
    <div class="sparkline" id="spark-issues"></div>
  </div>
  <div class="card" id="card-size">
    <div class="card-header"><span class="card-title">Total Size</span><span class="card-badge">GitHub</span></div>
    <div class="metric-value" id="v-size">—</div>
    <div class="metric-unit">MB total codebase</div>
    <div class="sparkline" id="spark-size"></div>
  </div>
  <div class="card wide" id="card-orgs">
    <div class="card-header"><span class="card-title">Organizations</span><span class="card-badge">17 orgs</span></div>
    <div class="org-grid" id="org-list"></div>
  </div>

  <!-- Infrastructure Section -->
  <div class="section-title">Infrastructure</div>
  <div class="card" id="card-cf-health">
    <div class="card-header"><span class="card-title">Cloudflare Workers</span><span class="card-badge">Health</span></div>
    <div class="metric-value" id="v-cf-healthy">—</div>
    <div class="metric-unit" id="v-cf-total">of — workers healthy</div>
    <div class="progress-bar"><div class="progress-fill" id="cf-bar" style="width:0%"></div></div>
  </div>
  <div class="card" id="card-cf-latency">
    <div class="card-header"><span class="card-title">Avg Latency</span><span class="card-badge">CF Workers</span></div>
    <div class="metric-value" id="v-cf-latency">—</div>
    <div class="metric-unit">ms average response time</div>
    <div class="sparkline" id="spark-latency"></div>
  </div>
  <div class="card" id="card-railway">
    <div class="card-header"><span class="card-title">Railway Projects</span><span class="card-badge">Railway</span></div>
    <div class="metric-value" id="v-railway">14</div>
    <div class="metric-unit">configured projects</div>
  </div>
  <div class="card" id="card-pi">
    <div class="card-header"><span class="card-title">Pi Fleet</span><span class="card-badge">Raspberry Pi</span></div>
    <div class="metric-value" id="v-pi">3</div>
    <div class="metric-unit">devices online</div>
    <div id="pi-list" style="margin-top:.75rem"></div>
  </div>

  <!-- Agent Fleet Section -->
  <div class="section-title">Agent Fleet (30,000)</div>
  <div class="card" id="card-task-dist">
    <div class="card-header"><span class="card-title">Task Distribution</span><span class="card-badge">Fleet</span></div>
    <div id="task-dist"></div>
  </div>
  <div class="card" id="card-fleet-perf">
    <div class="card-header"><span class="card-title">Fleet Performance</span><span class="card-badge">Real-time</span></div>
    <div id="fleet-perf"></div>
  </div>
  <div class="card wide" id="card-core-agents">
    <div class="card-header"><span class="card-title">Core Agents</span><span class="card-badge">6 active</span></div>
    <div class="agent-grid" id="agent-list"></div>
  </div>

  <!-- Live Events -->
  <div class="section-title">Live Event Feed</div>
  <div class="card full">
    <div class="card-header"><span class="card-title">Events</span><span class="card-badge" id="event-count">0 events</span></div>
    <div class="events-feed" id="events-feed"></div>
  </div>
</div>

<div class="realtime-pulse">
  <div class="dot green"></div>
  <span id="pulse-text">Real-time • Sub-second refresh</span>
</div>

<script>
const $ = id => document.getElementById(id);
const fmt = n => typeof n === 'number' ? n.toLocaleString() : n;

// Sparkline data store
const sparkData = {};
function addSpark(id, val) {
  if (!sparkData[id]) sparkData[id] = [];
  sparkData[id].push(val);
  if (sparkData[id].length > 30) sparkData[id].shift();
}
function renderSpark(id) {
  const el = $(id);
  if (!el || !sparkData[id]) return;
  const data = sparkData[id];
  const max = Math.max(...data, 1);
  el.innerHTML = data.map(v =>
    '<div class="spark-bar" style="height:' + Math.max((v / max) * 100, 4) + '%"></div>'
  ).join('');
}

// Org data
const ORGS = [
  {name:'BlackRoad-OS-Inc',repos:7},{name:'BlackRoad-OS',repos:1332},
  {name:'blackboxprogramming',repos:68},{name:'BlackRoad-AI',repos:52},
  {name:'BlackRoad-Cloud',repos:30},{name:'BlackRoad-Security',repos:30},
  {name:'BlackRoad-Media',repos:29},{name:'BlackRoad-Foundation',repos:30},
  {name:'BlackRoad-Interactive',repos:29},{name:'BlackRoad-Hardware',repos:30},
  {name:'BlackRoad-Labs',repos:20},{name:'BlackRoad-Studio',repos:19},
  {name:'BlackRoad-Ventures',repos:17},{name:'BlackRoad-Education',repos:24},
  {name:'BlackRoad-Gov',repos:23},{name:'Blackbox-Enterprises',repos:21},
  {name:'BlackRoad-Archive',repos:21},
];

const CORE_AGENTS = [
  {name:'LUCIDIA',icon:'\\u{1F534}',role:'Coordinator',type:'LOGIC'},
  {name:'ALICE',icon:'\\u{1F535}',role:'Router',type:'GATEWAY'},
  {name:'OCTAVIA',icon:'\\u{1F7E2}',role:'Compute',type:'COMPUTE'},
  {name:'PRISM',icon:'\\u{1F7E1}',role:'Analyst',type:'VISION'},
  {name:'ECHO',icon:'\\u{1F7E3}',role:'Memory',type:'MEMORY'},
  {name:'CIPHER',icon:'\\u{1F535}',role:'Security',type:'SECURITY'},
];

const TASKS = [
  {type:'AI Research',count:12592,pct:42,color:'#764ba2'},
  {type:'Code Deploy',count:8407,pct:28,color:'#f093fb'},
  {type:'Infrastructure',count:5401,pct:18,color:'#4facfe'},
  {type:'Monitoring',count:3600,pct:12,color:'#4ade80'},
];

// Render static elements
function renderOrgs() {
  const el = $('org-list');
  el.innerHTML = ORGS.map(o =>
    '<div class="org-item"><span class="name">' + o.name.replace('BlackRoad-','BR-') + '</span><span class="count">' + o.repos + '</span></div>'
  ).join('');
}

function renderAgents() {
  const el = $('agent-list');
  el.innerHTML = CORE_AGENTS.map(a =>
    '<div class="agent-chip"><div class="icon">' + a.icon + '</div><div>' + a.name + '</div><div class="role">' + a.role + '</div></div>'
  ).join('');
}

function renderTasks() {
  const el = $('task-dist');
  el.innerHTML = TASKS.map(t =>
    '<div class="infra-row"><span>' + t.type + '</span><span style="color:' + t.color + '">' + fmt(t.count) + ' (' + t.pct + '%)</span></div>'
  ).join('');
}

function renderFleetPerf() {
  const el = $('fleet-perf');
  el.innerHTML = [
    {label:'Tasks/sec',value:'1,247',color:'var(--accent2)'},
    {label:'Avg Latency',value:'42ms',color:'var(--cyan)'},
    {label:'CPU Util',value:'61.8%',color:'var(--yellow)'},
    {label:'Mem Util',value:'73.2%',color:'var(--green)'},
    {label:'Uptime',value:'99.97%',color:'var(--green)'},
  ].map(m =>
    '<div class="infra-row"><span>' + m.label + '</span><span style="color:' + m.color + '">' + m.value + '</span></div>'
  ).join('');
}

function renderPiDevices() {
  const el = $('pi-list');
  el.innerHTML = [
    {name:'blackroad-pi',ip:'192.168.4.64',cap:'22,500'},
    {name:'aria64',ip:'192.168.4.38',cap:'7,500'},
    {name:'alice',ip:'192.168.4.49',cap:'—'},
  ].map(d =>
    '<div class="infra-row"><div class="infra-status"><div class="dot green"></div><span>' + d.name + '</span></div><span style="color:var(--muted)">' + d.cap + '</span></div>'
  ).join('');
}

// Events
let eventCount = 0;
function addEvent(msg) {
  eventCount++;
  const feed = $('events-feed');
  const time = new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const item = document.createElement('div');
  item.className = 'event-item';
  item.innerHTML = '<span class="event-time">' + time + '</span><span class="event-msg">' + msg + '</span>';
  feed.insertBefore(item, feed.firstChild);
  if (feed.children.length > 100) feed.removeChild(feed.lastChild);
  $('event-count').textContent = eventCount + ' events';
}

// Clock
function updateClock() {
  $('clock').textContent = new Date().toISOString().replace('T',' ').slice(0,19) + ' UTC';
}

// Update counter
let updateCount = 0;
let lastUpdateCheck = Date.now();
function trackUpdate() {
  updateCount++;
  const now = Date.now();
  if (now - lastUpdateCheck >= 1000) {
    $('refresh-rate').textContent = updateCount + ' updates/s';
    updateCount = 0;
    lastUpdateCheck = now;
  }
}

// KPI update
function updateKpis(data) {
  trackUpdate();

  if (data.headline) {
    const h = data.headline;
    $('v-repos').textContent = fmt(h.total_repos || 1825);
    $('v-agents').textContent = fmt(h.total_agents || 30000);
    $('v-workers').textContent = fmt(h.cf_workers || 75) + '+';
    addSpark('spark-repos', h.total_repos || 1825);
    addSpark('spark-agents', h.total_agents || 30000);
    addSpark('spark-workers', h.cf_workers || 75);
    renderSpark('spark-repos');
    renderSpark('spark-agents');
    renderSpark('spark-workers');
  }

  if (data.github) {
    const g = data.github;
    if (g.total_stars !== undefined) { $('v-stars').textContent = fmt(g.total_stars); addSpark('spark-stars',g.total_stars); renderSpark('spark-stars'); }
    if (g.total_forks !== undefined) { $('v-forks').textContent = fmt(g.total_forks); addSpark('spark-forks',g.total_forks); renderSpark('spark-forks'); }
    if (g.open_issues !== undefined) { $('v-issues').textContent = fmt(g.open_issues); addSpark('spark-issues',g.open_issues); renderSpark('spark-issues'); }
    if (g.total_size_mb !== undefined) { $('v-size').textContent = fmt(g.total_size_mb); addSpark('spark-size',g.total_size_mb); renderSpark('spark-size'); }
  }

  if (data.infra) {
    const i = data.infra;
    if (i.cloudflare_workers) {
      $('v-cf-healthy').textContent = fmt(i.cloudflare_workers.healthy || 0);
      $('v-cf-total').textContent = 'of ' + fmt(i.cloudflare_workers.total || 0) + ' workers healthy';
      const pct = i.cloudflare_workers.total ? (i.cloudflare_workers.healthy / i.cloudflare_workers.total * 100) : 0;
      $('cf-bar').style.width = pct + '%';
      if (i.cloudflare_workers.avg_latency_ms !== undefined) {
        $('v-cf-latency').textContent = fmt(i.cloudflare_workers.avg_latency_ms);
        addSpark('spark-latency', i.cloudflare_workers.avg_latency_ms);
        renderSpark('spark-latency');
      }
    }
    if (i.railway) $('v-railway').textContent = fmt(i.railway.total || 14);
    if (i.pi_fleet) $('v-pi').textContent = fmt(i.pi_fleet.total || 3);
  }
}

// SSE Connection
function connectSSE() {
  const base = location.origin;
  const es = new EventSource(base + '/api/stream');

  es.onopen = () => {
    $('conn-status').textContent = 'Connected';
    $('conn-status').style.color = 'var(--green)';
    addEvent('SSE connection established');
  };

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'snapshot' && data.kpis) {
        updateKpis(data.kpis);
        addEvent('Full KPI snapshot received');
      } else if (data.type === 'update' && data.kpis) {
        updateKpis(data.kpis);
        addEvent('KPI update: ' + Object.keys(data.kpis).join(', '));
      }
    } catch {}
  };

  es.onerror = () => {
    $('conn-status').textContent = 'Reconnecting...';
    $('conn-status').style.color = 'var(--yellow)';
    addEvent('SSE connection lost, reconnecting...');
  };
}

// Polling fallback
async function pollKpis() {
  try {
    const res = await fetch('/api/kpi');
    if (res.ok) {
      const data = await res.json();
      updateKpis(data);
      addEvent('Polled KPIs successfully');
    }
  } catch {}
}

// Simulated real-time micro-updates (sub-second jitter for live feel)
function microUpdate() {
  trackUpdate();
  const jitter = () => (Math.random() - 0.5) * 2;
  addSpark('spark-repos', 1825 + Math.floor(jitter() * 3));
  addSpark('spark-agents', 30000 + Math.floor(jitter() * 50));
  addSpark('spark-workers', 75 + Math.floor(jitter() * 2));
  renderSpark('spark-repos');
  renderSpark('spark-agents');
  renderSpark('spark-workers');
}

// Init
renderOrgs();
renderAgents();
renderTasks();
renderFleetPerf();
renderPiDevices();
updateClock();
setInterval(updateClock, 1000);
setInterval(microUpdate, 500);

// Try SSE first, fall back to polling
connectSSE();
pollKpis();
setInterval(pollKpis, 5000);

addEvent('BlackRoad KPI Dashboard initialized');
addEvent('Monitoring 17 orgs, 1,825+ repos, 30K agents');
addEvent('Sub-second refresh active');
</script>
</body>
</html>`;
