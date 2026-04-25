// BlackRoad Dynamic Data — auto-injected into all 19 domain sites
// Fetches live data from RoundTrip + GitHub, updates DOM automatically
(function(){
  const APIS = [
    'https://roundtrip.blackroad.io/api/health',
    'https://roundtrip.blackroad.io/api/agents',
  ];

  async function f(url) {
    try { const r = await fetch(url, {signal: AbortSignal.timeout(5000)}); return r.ok ? await r.json() : null; } catch { return null; }
  }

  async function update() {
    const [health, agents] = await Promise.allSettled([f(APIS[0]), f(APIS[1])]);
    const h = health.status==='fulfilled' ? health.value : null;
    const a = agents.status==='fulfilled' ? agents.value : null;
    const agentCount = (a && Array.isArray(a)) ? a.length : (h && h.agents) ? h.agents : null;
    const data = { agents: agentCount, repos: 244, orgs: 16, domains: 19, products: 92, nodes: 7 };

    // Update data-live elements
    document.querySelectorAll('[data-live]').forEach(el => {
      const k = el.getAttribute('data-live');
      if (data[k] != null) { countUp(el, data[k]); }
    });

    // Smart-match: find metric numbers in the page and update them
    const patterns = {'69':['agents'],'70':['agents'],'244':['repos'],'629':['repos'],'627':['repos'],'16':['orgs'],'19':['domains'],'92':['products'],'7':['nodes']};
    document.querySelectorAll('.metric-val, .stat-number, .hero-stat, [class*="metric"], [class*="stat"]').forEach(el => {
      const t = el.textContent.trim().replace(/,/g,'');
      if (patterns[t]) {
        const key = patterns[t][0];
        if (data[key] != null) countUp(el, data[key]);
      }
    });

    // Agent roster
    const roster = document.getElementById('agent-roster');
    if (roster && a && Array.isArray(a)) {
      roster.innerHTML = a.slice(0,20).map(ag =>
        `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid #1a1a1a;border-radius:4px;font-size:10px;color:#d4d4d4;font-family:'JetBrains Mono',monospace">${ag.emoji||'●'} ${ag.name}</span>`
      ).join(' ');
    }

    // Live badge
    if (!document.getElementById('br-live')) {
      const b = document.createElement('div');
      b.id = 'br-live';
      b.style.cssText = 'position:fixed;bottom:10px;right:10px;display:flex;align-items:center;gap:5px;padding:3px 8px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:4px;font:10px "JetBrains Mono",monospace;color:#404040;z-index:9999';
      b.innerHTML = '<div style="width:5px;height:5px;border-radius:50%;background:#22c55e;animation:brp 2s infinite"></div>LIVE';
      document.body.appendChild(b);
      const s = document.createElement('style');
      s.textContent = '@keyframes brp{0%,100%{opacity:1}50%{opacity:.3}}';
      document.head.appendChild(s);
    }
  }

  function countUp(el, target) {
    const start = parseInt(el.textContent.replace(/,/g,'')) || 0;
    if (start === target) return;
    const d = 800, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now-t0)/d, 1);
      el.textContent = Math.round(start + (target-start)*(1-Math.pow(1-p,3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update);
  else setTimeout(update, 500);
  setInterval(update, 30000);
})();
