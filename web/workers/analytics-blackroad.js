// BlackRoad Analytics — Sovereign, consent-first event capture
// No cookies. No fingerprinting. No PII. Just counts.
//
// Endpoints:
//   POST /event     — capture a single event
//   POST /pageview  — capture a page view
//   POST /session   — update session heartbeat
//   GET  /stats     — aggregated stats (public)
//   GET  /dashboard — detailed analytics (requires key)
//   GET  /health    — uptime check

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function getHeaderUrl(headers, name) {
  const value = headers.get(name);
  return parseUrl(value);
}

function parseUrl(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeTrackedPath(rawPath, headers, fallbackUrl) {
  if (!rawPath) return '';

  const value = String(rawPath).trim();
  if (!value) return '';

  try {
    const asUrl = new URL(value);
    return `${asUrl.hostname}${asUrl.pathname}`;
  } catch {
    // Not an absolute URL; continue below.
  }

  if (!value.startsWith('/')) {
    return value;
  }

  const sourceUrl =
    getHeaderUrl(headers, 'Origin') ||
    getHeaderUrl(headers, 'Referer') ||
    fallbackUrl ||
    null;

  if (!sourceUrl) {
    return value;
  }

  return `${sourceUrl.hostname}${value}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function buildMeaningfulVisitorFilter(alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return `(
    ${prefix}first_path != ''
    AND ${prefix}first_path NOT LIKE '/Users/%'
    AND ${prefix}first_path NOT LIKE 'file:%'
    AND ${prefix}first_path NOT LIKE 'localhost%'
    AND ${prefix}first_path NOT LIKE '127.0.0.1%'
    AND (
      ${prefix}pages >= 2
      OR ${prefix}duration_ms >= 10000
      OR ${prefix}signals LIKE '%"click":1%'
      OR ${prefix}signals LIKE '%"key":1%'
      OR ${prefix}signals LIKE '%"scroll":%'
    )
  )`;
}

function buildPublicBlackroadFilter(alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return `(
    ${prefix}first_path LIKE 'blackroad.io/%'
    OR ${prefix}first_path LIKE '%.blackroad.io/%'
  )`;
}

function buildPreviewFilter(alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return `(
    ${prefix}first_path LIKE '%.pages.dev/%'
    OR ${prefix}first_path LIKE '%.workers.dev/%'
  )`;
}

function buildLocalFilter(alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return `(
    ${prefix}first_path = ''
    OR ${prefix}first_path NOT LIKE '%/%'
    OR ${prefix}first_path LIKE '/Users/%'
    OR ${prefix}first_path LIKE 'file:%'
    OR ${prefix}first_path LIKE 'localhost%'
    OR ${prefix}first_path LIKE '127.0.0.1%'
  )`;
}

function buildInternalTaggedFilter(alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return `(
    ${prefix}signals LIKE '%"traffic":"internal"%'
    OR ${prefix}signals LIKE '%"traffic":"test"%'
    OR ${prefix}signals LIKE '%"traffic":"qa"%'
    OR ${prefix}signals LIKE '%"traffic":"preview"%'
  )`;
}

function parseSignals(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function classifyHumanSession(session) {
  const firstPath = String(session?.first_path || '');
  const signals = parseSignals(session?.signals);
  const context = signals.context || {};

  let source = 'other';
  if (!firstPath) {
    source = 'empty';
  } else if (firstPath.startsWith('/Users/') || firstPath.startsWith('file:')) {
    source = 'local_file';
  } else if (firstPath.startsWith('localhost') || firstPath.startsWith('127.0.0.1')) {
    source = 'localhost';
  } else if (firstPath.endsWith('.pages.dev/') || firstPath.includes('.pages.dev/')) {
    source = 'preview';
  } else if (firstPath.endsWith('.workers.dev/') || firstPath.includes('.workers.dev/')) {
    source = 'preview';
  } else if (firstPath === 'blackroad.io/' || firstPath.startsWith('blackroad.io/') || firstPath.includes('.blackroad.io/')) {
    source = 'public_blackroad';
  } else if (firstPath.includes('.')) {
    source = 'external_host';
  }

  const trafficTag = String(context.traffic || '').toLowerCase();
  const meaningful = (
    Number(session?.pages || 0) >= 2 ||
    Number(session?.duration_ms || 0) >= 10000 ||
    signals.click === 1 ||
    signals.key === 1 ||
    typeof signals.scroll !== 'undefined'
  );

  return {
    source,
    traffic_tag: trafficTag || '',
    meaningful,
    is_internal_tagged: ['internal', 'test', 'qa', 'preview'].includes(trafficTag),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // Root redirect
    if (path === '/' || path === '') {
      return new Response(null, { status: 302, headers: { Location: 'https://blackroad.io', ...CORS } })
    }

    // Country from Cloudflare headers (no fingerprinting needed)
    const country = request.headers.get('cf-ipcountry') || '';

    try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
      // ── Capture page view ──
      if (path === '/pageview' && request.method === 'POST') {
        const body = await request.json();
        const { path: pagePath, referrer, session_id, screen_w, screen_h, lang } = body;
        if (!pagePath || !session_id) return json({ error: 'path and session_id required' }, 400);
        const normalizedPath = normalizeTrackedPath(
          pagePath,
          request.headers,
          parseUrl(referrer)
        );

        await env.DB.prepare(
          `INSERT INTO page_views (path, referrer, session_id, screen_w, screen_h, lang, country)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          normalizedPath.slice(0, 500),
          (referrer || '').slice(0, 500),
          session_id.slice(0, 64),
          screen_w || 0,
          screen_h || 0,
          (lang || '').slice(0, 10),
          country
        ).run();

        // Upsert session
        await env.DB.prepare(
          `INSERT INTO sessions (id, first_path, pages, country)
           VALUES (?, ?, 1, ?)
           ON CONFLICT(id) DO UPDATE SET pages = pages + 1, last_seen = datetime('now')`
        ).bind(session_id.slice(0, 64), normalizedPath.slice(0, 500), country).run();

        return json({ ok: true });
      }

      // ── Capture event ──
      if (path === '/event' && request.method === 'POST') {
        const body = await request.json();
        const { name, path: eventPath, session_id, props } = body;
        if (!name || !session_id) return json({ error: 'name and session_id required' }, 400);
        const normalizedPath = normalizeTrackedPath(eventPath, request.headers);

        await env.DB.prepare(
          `INSERT INTO events (name, path, session_id, props, country)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(
          name.slice(0, 100),
          normalizedPath.slice(0, 500),
          session_id.slice(0, 64),
          JSON.stringify(props || {}).slice(0, 2000),
          country
        ).run();

        return json({ ok: true });
      }

      // ── Session heartbeat ──
      if (path === '/session' && request.method === 'POST') {
        const body = await request.json();
        const { session_id, duration_ms } = body;
        if (!session_id) return json({ error: 'session_id required' }, 400);

        await env.DB.prepare(
          `UPDATE sessions SET duration_ms = ?, last_seen = datetime('now') WHERE id = ?`
        ).bind(duration_ms || 0, session_id.slice(0, 64)).run();

        return json({ ok: true });
      }

      // ── Public stats ──
      if (path === '/stats' && request.method === 'GET') {
        const range = url.searchParams.get('range') || '24h';
        const since = range === '7d' ? "datetime('now', '-7 days')"
                    : range === '30d' ? "datetime('now', '-30 days')"
                    : "datetime('now', '-24 hours')";

        const [views, uniques, events, topPages, topEvents, countries] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) as c FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT COUNT(DISTINCT session_id) as c FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM events WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT path, COUNT(*) as views FROM page_views WHERE created_at > ${since} GROUP BY path ORDER BY views DESC LIMIT 10`).all(),
          env.DB.prepare(`SELECT name, COUNT(*) as count FROM events WHERE created_at > ${since} GROUP BY name ORDER BY count DESC LIMIT 10`).all(),
          env.DB.prepare(`SELECT country, COUNT(*) as views FROM page_views WHERE created_at > ${since} AND country != '' GROUP BY country ORDER BY views DESC LIMIT 10`).all(),
        ]);

        return json({
          range,
          views: views?.c || 0,
          unique_sessions: uniques?.c || 0,
          events: events?.c || 0,
          top_pages: topPages?.results || [],
          top_events: topEvents?.results || [],
          countries: countries?.results || [],
        });
      }

      // ── Dashboard (detailed, requires API key) ──
      if (path === '/dashboard' && request.method === 'GET') {
        const authKey = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!authKey || authKey !== env.ANALYTICS_KEY) return json({ error: 'unauthorized — use Authorization header' }, 401);

        const range = url.searchParams.get('range') || '7d';
        const since = range === '30d' ? "datetime('now', '-30 days')"
                    : range === '24h' ? "datetime('now', '-24 hours')"
                    : "datetime('now', '-7 days')";

        const [totals, daily, pages, eventNames, sessions, hourly] = await Promise.all([
          env.DB.prepare(`SELECT
            COUNT(*) as total_views,
            COUNT(DISTINCT session_id) as total_sessions
            FROM page_views WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT
            date(created_at) as day,
            COUNT(*) as views,
            COUNT(DISTINCT session_id) as sessions
            FROM page_views WHERE created_at > ${since}
            GROUP BY day ORDER BY day`).all(),
          env.DB.prepare(`SELECT path, COUNT(*) as views, COUNT(DISTINCT session_id) as sessions
            FROM page_views WHERE created_at > ${since}
            GROUP BY path ORDER BY views DESC LIMIT 20`).all(),
          env.DB.prepare(`SELECT name, COUNT(*) as count, COUNT(DISTINCT session_id) as sessions
            FROM events WHERE created_at > ${since}
            GROUP BY name ORDER BY count DESC LIMIT 20`).all(),
          env.DB.prepare(`SELECT
            AVG(pages) as avg_pages,
            AVG(duration_ms) as avg_duration_ms,
            COUNT(*) as total
            FROM sessions WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT
            strftime('%H', created_at) as hour,
            COUNT(*) as views
            FROM page_views WHERE created_at > ${since}
            GROUP BY hour ORDER BY hour`).all(),
        ]);

        return json({
          range,
          totals: totals || {},
          daily: daily?.results || [],
          pages: pages?.results || [],
          events: eventNames?.results || [],
          sessions: sessions || {},
          hourly: hourly?.results || [],
        });
      }

      // ── Human signal — confirms JS-capable real user ──
      if (path === '/human' && request.method === 'POST') {
        const body = await request.json();
        const { session_id, signals, screen, lang, page, duration_ms } = body;
        if (!session_id) return json({ error: 'session_id required' }, 400);
        const sid = session_id.slice(0, 64);
        const sig = JSON.stringify(signals || {}).slice(0, 500);
        await env.DB.prepare(
          `INSERT INTO human_sessions (session_id, first_path, signals, screen, lang, country, duration_ms)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(session_id) DO UPDATE SET
             signals = ?, duration_ms = ?, last_seen = datetime('now'), pages = pages + 1`
        ).bind(sid, (page||'').slice(0,200), sig, (screen||'').slice(0,20), (lang||'').slice(0,10), country, duration_ms||0, sig, duration_ms||0).run();
        // also mark in sessions table
        await env.DB.prepare(`UPDATE sessions SET is_human = 1, human_signals = ? WHERE id = ?`).bind(sig, sid).run();
        return json({ ok: true, confirmed: 'human' });
      }

      // ── Humans dashboard — real verified human sessions ──
      if (path === '/humans' && request.method === 'GET') {
        const range = url.searchParams.get('range') || '24h';
        const since = range === '7d' ? "datetime('now', '-7 days')"
                    : range === '30d' ? "datetime('now', '-30 days')"
                    : "datetime('now', '-24 hours')";
        const meaningfulFilter = buildMeaningfulVisitorFilter('human_sessions');
        const publicBlackroadFilter = buildPublicBlackroadFilter('human_sessions');
        const previewFilter = buildPreviewFilter('human_sessions');
        const localFilter = buildLocalFilter('human_sessions');
        const internalTaggedFilter = buildInternalTaggedFilter('human_sessions');
        const [total, recent, topPages, meaningful, publicWeb, publicMeaningful, previewSessions, localSessions, internalTagged] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) as c, AVG(pages) as avg_pages, AVG(duration_ms) as avg_ms FROM human_sessions WHERE created_at > ${since}`).first(),
          env.DB.prepare(`SELECT session_id, first_path, pages, duration_ms, screen, lang, country, signals, created_at FROM human_sessions WHERE created_at > ${since} ORDER BY created_at DESC LIMIT 50`).all(),
          env.DB.prepare(`SELECT first_path as path, COUNT(*) as sessions FROM human_sessions WHERE created_at > ${since} GROUP BY first_path ORDER BY sessions DESC LIMIT 10`).all(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${meaningfulFilter}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${publicBlackroadFilter}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${publicBlackroadFilter} AND ${meaningfulFilter} AND NOT ${internalTaggedFilter}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${previewFilter}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${localFilter}`).first(),
          env.DB.prepare(`SELECT COUNT(*) as c FROM human_sessions WHERE created_at > ${since} AND ${internalTaggedFilter}`).first(),
        ]);
        const classifiedRecent = (recent?.results || []).map((session) => ({
          ...session,
          classification: classifyHumanSession(session),
        }));
        const source_breakdown = classifiedRecent.reduce((acc, session) => {
          const source = session.classification.source;
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        return json({
          range,
          confirmed_humans: total?.c || 0,
          meaningful_visitors: meaningful?.c || 0,
          public_web_sessions: publicWeb?.c || 0,
          public_meaningful_visitors: publicMeaningful?.c || 0,
          preview_sessions: previewSessions?.c || 0,
          local_or_empty_sessions: localSessions?.c || 0,
          internal_tagged_sessions: internalTagged?.c || 0,
          suspicious_or_low_signal: Math.max((total?.c || 0) - (meaningful?.c || 0), 0),
          avg_pages: Math.round((total?.avg_pages || 0) * 10) / 10,
          avg_duration_s: Math.round((total?.avg_ms || 0) / 1000),
          top_landing_pages: topPages?.results || [],
          source_breakdown,
          recent_sessions: classifiedRecent,
        });
      }

      // ── Serve beacon.js ──
      if (path === '/beacon.js') {
        const beacon = `/* BlackRoad Human Beacon v2 — road.pave.tomorrow */
(function(){
  var W=window,D=document,N=navigator;
  var sid=(W.sessionStorage.getItem('_br_sid')||(function(){
    var id=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(c){
      return(c^(W.crypto||W.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16);
    });
    W.sessionStorage.setItem('_br_sid',id);
    return id;
  })());
  var start=Date.now(),signals={},hasMouse=0,hasScroll=0,hasClick=0,hasKey=0;
  var ep='https://analytics.blackroad.io';
  var params=new URLSearchParams(W.location.search||'');
  var meta=D.querySelector('meta[name="blackroad-traffic"]');
  var cfg=W.BLACKROAD_ANALYTICS||W.__BLACKROAD_ANALYTICS__||{};
  var trafficTag=(params.get('br_traffic')||cfg.traffic||(meta&&meta.content)||'').toLowerCase();
  var env='public';
  if(W.location.protocol==='file:') env='local_file';
  else if(/^(localhost|127\\.0\\.0\\.1)$/.test(W.location.hostname||'')) env='localhost';
  else if(/\\.pages\\.dev$/.test(W.location.hostname||'')||/\\.workers\\.dev$/.test(W.location.hostname||'')) env='preview';
  var page=(W.location.hostname?W.location.hostname:'')+W.location.pathname;
  if(!page && W.location.protocol==='file:') page=W.location.pathname;
  signals.context={
    beacon:2,
    env:env,
    traffic:trafficTag,
    host:W.location.host||'',
    protocol:W.location.protocol||'',
    touch:(('ontouchstart' in W)||(N.maxTouchPoints||0)>0)?1:0,
    webdriver:N.webdriver?1:0
  };

  // Fire pageview
  fetch(ep+'/pageview',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path:page,referrer:D.referrer,session_id:sid,
      screen_w:W.screen.width,screen_h:W.screen.height,lang:N.language||''})
  }).catch(function(){});

  // Listen for human signals
  function onMouse(){hasMouse=1;signals.mouse=1;D.removeEventListener('mousemove',onMouse);}
  function onScroll(){hasScroll=1;signals.scroll=Math.round(W.scrollY||0);W.removeEventListener('scroll',onScroll);}
  function onClick(){hasClick=1;signals.click=1;D.removeEventListener('click',onClick);}
  function onKey(){hasKey=1;signals.key=1;D.removeEventListener('keydown',onKey);}
  D.addEventListener('mousemove',onMouse);
  W.addEventListener('scroll',onScroll);
  D.addEventListener('click',onClick);
  D.addEventListener('keydown',onKey);

  // Fire human confirmation after first real interaction
  function fireHuman(){
    if(signals._fired)return;signals._fired=1;
    fetch(ep+'/human',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({session_id:sid,signals:signals,
        screen:W.screen.width+'x'+W.screen.height,
        lang:N.language||'',page:page,duration_ms:Date.now()-start})
    }).catch(function(){});
  }
  D.addEventListener('mousemove',function(){setTimeout(fireHuman,500)},{once:true});
  D.addEventListener('click',fireHuman,{once:true});
  D.addEventListener('keydown',fireHuman,{once:true});
  W.addEventListener('pagehide',function(){
    var dur=Date.now()-start;
    if(N.sendBeacon){
      N.sendBeacon(ep+'/session',JSON.stringify({session_id:sid,duration_ms:dur}));
    }
    if(hasMouse||hasClick||hasKey||hasScroll)fireHuman();
  });

  // Heartbeat on exit
  W.addEventListener('visibilitychange',function(){
    if(D.visibilityState==='hidden'){
      var dur=Date.now()-start;
      if(N.sendBeacon){
        N.sendBeacon(ep+'/session',JSON.stringify({session_id:sid,duration_ms:dur}));
      }
      if(hasMouse||hasClick||hasKey||hasScroll)fireHuman();
    }
  });
})();`;
        return new Response(beacon, {
          headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // ── Health check ──
      if (path === '/health') {
        const count = await env.DB.prepare('SELECT COUNT(*) as c FROM page_views').first();
        return json({ status: 'up', total_views: count?.c || 0 });
      }

      // ── Init DB ──
      if (path === '/init') {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, referrer TEXT DEFAULT '',
          session_id TEXT NOT NULL, screen_w INTEGER DEFAULT 0, screen_h INTEGER DEFAULT 0,
          lang TEXT DEFAULT '', country TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, path TEXT DEFAULT '',
          session_id TEXT NOT NULL, props TEXT DEFAULT '{}', country TEXT DEFAULT '',
          created_at TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY, first_path TEXT DEFAULT '', pages INTEGER DEFAULT 1,
          duration_ms INTEGER DEFAULT 0, country TEXT DEFAULT '',
          created_at TEXT DEFAULT (datetime('now')), last_seen TEXT DEFAULT (datetime('now'))
        )`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views(session_id)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at)`).run();
        await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at)`).run();
        return json({ ok: true, tables: ['page_views', 'events', 'sessions'] });
      }

      // ── 404 ──
      return json({ error: 'not found', endpoints: ['/beacon.js', '/pageview', '/event', '/human', '/humans', '/session', '/stats', '/dashboard', '/health'] }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
