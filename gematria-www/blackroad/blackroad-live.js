// BlackRoad Live Data Layer — fetched by all 19 domain sites
// Provides real-time stats from RoundTrip, GitHub, Fleet
(function() {
  const ENDPOINTS = {
    roundtrip: 'https://roundtrip.blackroad.io/api/health',
    roundtripLocal: 'http://192.168.4.49:8094/api/health',
    agents: 'https://roundtrip.blackroad.io/api/agents',
    agentsLocal: 'http://192.168.4.49:8094/api/agents',
    github: 'https://api.github.com/orgs/BlackRoad-OS-Inc',
  };

  const CACHE_KEY = 'blackroad_live_data';
  const CACHE_TTL = 60000; // 60s

  // Fallback data if APIs are unreachable
  const FALLBACK = {
    agents: 69,
    repos: 244,
    orgs: 16,
    domains: 19,
    nodes: 7,
    uptime: '99.2%',
    fleet: [
      { name: 'Alice', ip: '192.168.4.49', role: 'Gateway', status: 'online' },
      { name: 'Cecilia', ip: '192.168.4.96', role: 'AI Engine', status: 'online' },
      { name: 'Octavia', ip: '192.168.4.101', role: 'Architect', status: 'online' },
      { name: 'Aria', ip: '192.168.4.98', role: 'Interface', status: 'offline' },
      { name: 'Lucidia', ip: '192.168.4.38', role: 'Dreamer', status: 'online' },
      { name: 'Gematria', ip: 'nyc3', role: 'Edge Router', status: 'online' },
      { name: 'Anastasia', ip: 'nyc1', role: 'Cloud Edge', status: 'online' },
    ],
    products: 92,
    services: 12,
    topped: Date.now(),
  };

  async function fetchWithFallback(primary, fallback, timeout = 5000) {
    try {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(primary, { signal: ctrl.signal });
      clearTimeout(id);
      if (res.ok) return await res.json();
    } catch {}
    if (fallback) {
      try {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeout);
        const res = await fetch(fallback, { signal: ctrl.signal });
        clearTimeout(id);
        if (res.ok) return await res.json();
      } catch {}
    }
    return null;
  }

  async function loadLiveData() {
    // Check cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && (Date.now() - cached._ts) < CACHE_TTL) {
        applyData(cached);
        return cached;
      }
    } catch {}

    const [health, agents] = await Promise.allSettled([
      fetchWithFallback(ENDPOINTS.roundtrip, ENDPOINTS.roundtripLocal),
      fetchWithFallback(ENDPOINTS.agents, ENDPOINTS.agentsLocal),
    ]);

    const data = { ...FALLBACK };

    if (health.status === 'fulfilled' && health.value) {
      data.agents = health.value.agents || data.agents;
      data.host = health.value.host;
      data.nlp = health.value.nlp;
      data.roundtrip_status = health.value.status;
    }

    if (agents.status === 'fulfilled' && agents.value) {
      data.agents = Array.isArray(agents.value) ? agents.value.length : data.agents;
      data.agent_list = Array.isArray(agents.value) ? agents.value : [];
      // Extract fleet nodes from agent list
      const fleetAgents = (agents.value || []).filter(a => a.group === 'fleet');
      if (fleetAgents.length > 0) {
        data.fleet = fleetAgents.map(a => ({
          name: a.name, ip: a.ip || '', role: a.role || '', status: 'online',
          emoji: a.emoji || '', color: a.color || ''
        }));
        data.nodes = fleetAgents.length;
      }
    }

    data._ts = Date.now();
    data._live = true;

    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}

    applyData(data);
    return data;
  }

  function applyData(data) {
    // Update any element with data-live attribute
    document.querySelectorAll('[data-live]').forEach(el => {
      const key = el.getAttribute('data-live');
      if (data[key] !== undefined) {
        const val = data[key];
        if (typeof val === 'number') {
          animateCounter(el, val);
        } else {
          el.textContent = val;
        }
      }
    });

    // Update fleet status indicators
    document.querySelectorAll('[data-fleet-node]').forEach(el => {
      const nodeName = el.getAttribute('data-fleet-node').toLowerCase();
      const node = (data.fleet || []).find(n => n.name.toLowerCase() === nodeName);
      if (node) {
        const dot = el.querySelector('.status-dot');
        if (dot) {
          dot.style.background = node.status === 'online' ? '#22c55e' : '#ef4444';
        }
        const label = el.querySelector('.status-label');
        if (label) label.textContent = node.status;
      }
    });

    // Update agent roster
    const roster = document.getElementById('agent-roster');
    if (roster && data.agent_list && data.agent_list.length > 0) {
      roster.innerHTML = data.agent_list.slice(0, 24).map(a =>
        `<div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid #1a1a1a;border-radius:6px;font-size:11px;color:#d4d4d4;font-family:'JetBrains Mono',monospace">
          <span>${a.emoji || '●'}</span>
          <span>${a.name}</span>
          <span style="color:#404040">${a.role || ''}</span>
        </div>`
      ).join('');
    }

    // Fire custom event
    window.dispatchEvent(new CustomEvent('blackroad:data', { detail: data }));
  }

  function animateCounter(el, target) {
    const start = parseInt(el.textContent) || 0;
    if (start === target) return;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Expose globally
  window.BlackRoadLive = { load: loadLiveData, FALLBACK };

  // Auto-load on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLiveData);
  } else {
    loadLiveData();
  }

  // Refresh every 60s
  setInterval(loadLiveData, CACHE_TTL);
})();
