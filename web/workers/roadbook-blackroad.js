// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// RoadBook — Open Publishing & Knowledge Platform
// book.blackroad.io

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    summary TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'draft',
    word_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER REFERENCES articles(id),
    user_ip TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
];

function secHeaders(resp) {
  const h = new Headers(resp.headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Content-Security-Policy', "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io");
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(resp.body, { status: resp.status, headers: h });
}

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function md(text) {
  let html = esc(text);
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  // Bold, italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color:#f5f5f5">$1</a>');
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #333;padding-left:16px;color:#999;margin:12px 0">$1</blockquote>');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #222;margin:24px 0">');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><(h[123]|ul|pre|blockquote|hr)/g, '<$1');
  html = html.replace(/<\/(h[123]|ul|pre|blockquote)><\/p>/g, '</$1>');
  return html;
}


// Brand-matched HTML from Desktop/templates
const BRAND_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoadBook — Open Knowledge Publishing</title>
<meta name="description" content="Open knowledge publishing platform. Write articles, research papers, tutorials. Full versioning, citations, and RoadChain provenance.">
<meta property="og:title" content="RoadBook — Open Knowledge Publishing">
<meta property="og:description" content="Write articles, research papers, tutorials. DOI generation, version control, citations, and RoadChain provenance.">
<meta property="og:url" content="https://roadbook.blackroad.io">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--g135:linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--elevated:#111;--hover:#181818;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--sg);line-height:1.6;overflow-x:hidden}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}
a{color:var(--text);text-decoration:none}
button{font-family:var(--sg);cursor:pointer}
.grad-bar{height:3px;background:var(--g)}
.container{max-width:1000px;width:100%;margin:0 auto;padding:0 24px}
.section{padding:72px 0}
.section-num{font-family:var(--jb);font-size:10px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
.section-title{font-weight:700;font-size:28px;color:var(--white);margin-bottom:8px}
.section-desc{font-size:14px;color:var(--sub);max-width:460px;line-height:1.7}
.divider{height:1px;background:var(--border)}

/* NAV */
nav{position:fixed;top:3px;left:0;right:0;z-index:100;padding:0 24px}
.nav-inner{max-width:1000px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(0,0,0,.9);backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:10px}
.nav-logo{font-weight:700;font-size:16px;color:var(--white);display:flex;align-items:center;gap:10px}
.nav-logo-bar{width:20px;height:3px;border-radius:2px;background:var(--g)}
.nav-links{display:flex;gap:24px}
.nav-links a{font-size:12px;font-weight:500;color:var(--sub);transition:color .15s}
.nav-links a:hover{color:var(--white)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:6px;font-weight:600;font-size:12px;border:none;transition:all .15s}
.btn-white{background:var(--white);color:#000}
.btn-white:hover{background:#e0e0e0}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
.btn-outline:hover{border-color:#444}
.btn-lg{padding:13px 32px;font-size:14px;border-radius:8px}

/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 80px;position:relative}
.hero-tag{font-family:var(--jb);font-size:10px;color:var(--sub);letter-spacing:.15em;text-transform:uppercase;margin-bottom:28px;display:flex;align-items:center;gap:8px}
.hero-dot{width:5px;height:5px;border-radius:50%;background:var(--white);animation:pulse 2.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero-title{font-size:clamp(48px,9vw,96px);font-weight:700;line-height:.92;color:var(--white);letter-spacing:-.04em;margin-bottom:20px}
.hero-sub{font-size:clamp(15px,1.8vw,18px);color:var(--sub);max-width:520px;margin:0 auto 40px;line-height:1.7}
.hero-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}

/* LIVE WIDGET */
.live-widget{margin-top:64px;width:100%;max-width:480px}
.desktop-preview{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
.window-bar{display:flex;align-items:center;gap:6px;padding:10px 14px;background:var(--elevated);border-bottom:1px solid var(--border)}
.window-dot{width:8px;height:8px;border-radius:50%}
.window-dot-red{background:#ff5f57}
.window-dot-yellow{background:#febc2e}
.window-dot-green{background:#28c840}
.window-bar-title{margin-left:8px;font-family:var(--jb);font-size:10px;color:var(--muted)}
.desktop-body{padding:20px;display:flex;flex-direction:column;gap:14px}
.desktop-stat{display:flex;justify-content:space-between;align-items:center}
.desktop-stat-label{font-size:12px;color:var(--sub)}
.desktop-stat-value{font-family:var(--jb);font-size:12px;color:var(--white)}
.desktop-status{display:flex;align-items:center;gap:8px;padding-top:8px;border-top:1px solid var(--border)}
.status-dot{width:6px;height:6px;border-radius:50%;background:#28c840;flex-shrink:0}
.status-dot.offline{background:#ff5f57}
.status-text{font-family:var(--jb);font-size:10px;color:var(--muted)}

/* FEATURE CARDS */
.feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:28px}
.feature-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:28px 24px;transition:border-color .15s}
.feature-card:hover{border-color:#333}
.feature-icon{width:32px;height:32px;border-radius:6px;background:var(--elevated);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-family:var(--jb);font-size:14px;color:var(--sub)}
.feature-card h3{font-weight:600;font-size:15px;color:var(--white);margin-bottom:6px}
.feature-card p{font-size:12px;color:var(--sub);line-height:1.7}

/* AGENT GRID */
.agent-grid{display:flex;flex-wrap:wrap;gap:5px;margin-top:24px}
.agent{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:var(--card);border:1px solid var(--border);border-radius:5px;transition:border-color .15s}
.agent:hover{border-color:#333}
.agent-name{font-size:11px;font-weight:600;color:var(--text)}
.agent-role{font-family:var(--jb);font-size:8px;color:var(--muted)}

/* HOW IT WORKS */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:28px}
.step{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:28px 24px;text-align:center;transition:border-color .15s}
.step:hover{border-color:#333}
.step-num{font-family:var(--jb);font-size:28px;font-weight:700;color:var(--white);margin-bottom:12px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.step h3{font-weight:600;font-size:14px;color:var(--white);margin-bottom:6px}
.step p{font-size:12px;color:var(--sub);line-height:1.6}

/* PRICING */
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:28px}
.pricing-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:32px 24px;transition:border-color .15s;position:relative}
.pricing-card:hover{border-color:#333}
.pricing-card.featured{border-color:#333}
.pricing-card.featured::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g);border-radius:8px 8px 0 0}
.pricing-tier{font-family:var(--jb);font-size:10px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
.pricing-price{font-size:32px;font-weight:700;color:var(--white);margin-bottom:4px}
.pricing-price span{font-size:14px;font-weight:400;color:var(--sub)}
.pricing-desc{font-size:12px;color:var(--sub);margin-bottom:20px;line-height:1.6}
.pricing-features{list-style:none;margin-bottom:24px}
.pricing-features li{font-size:12px;color:var(--sub);padding:5px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px}
.pricing-features li::before{content:'';width:4px;height:4px;border-radius:50%;background:var(--muted);flex-shrink:0}
.pricing-card .btn{width:100%;justify-content:center}

/* CONNECTED PRODUCTS */
.connected-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin-top:28px}
.connected{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:16px;transition:border-color .15s;display:block}
.connected:hover{border-color:#333}
.connected-name{font-weight:600;font-size:14px;color:var(--white);margin-bottom:3px}
.connected-line{font-size:12px;color:var(--sub)}
.connected-url{font-family:var(--jb);font-size:9px;color:var(--muted);margin-top:8px}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:40px 0}
.footer-inner{max-width:1000px;margin:0 auto;padding:0 24px}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px;margin-bottom:32px}
.footer-brand{font-weight:700;font-size:15px;color:var(--white);margin-bottom:6px;display:flex;align-items:center;gap:8px}
.footer-brand-bar{width:16px;height:3px;border-radius:2px;background:var(--g)}
.footer-tagline{font-family:var(--jb);font-size:9px;color:var(--muted);letter-spacing:.1em}
.footer-col h4{font-family:var(--jb);font-size:9px;color:var(--muted);letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px}
.footer-col a{display:block;font-size:12px;color:var(--sub);padding:3px 0;transition:color .15s}
.footer-col a:hover{color:var(--white)}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:20px;border-top:1px solid var(--border);flex-wrap:wrap;gap:12px}
.footer-copy{font-family:var(--jb);font-size:9px;color:var(--muted)}

@media(max-width:768px){
  .nav-links{display:none}
  .hero{padding:80px 16px 48px}
  .feature-grid{grid-template-columns:1fr}
  .steps{grid-template-columns:1fr}
  .pricing-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr 1fr;gap:24px}
  .hero-title{font-size:clamp(36px,8vw,64px)}
}
</style>
<link rel="stylesheet" href="../blackroad-brand-base.css">
</head>
<body>

<div class="grad-bar"></div>

<!-- NAV -->
<nav>
<div class="nav-inner">
  <a href="/" class="nav-logo"><span class="nav-logo-bar"></span>BlackRoad</a>
  <div class="nav-links">
    <a href="https://os.blackroad.io">OS</a>
    <a href="https://roadtrip.blackroad.io">Agents</a>
    <a href="https://roadie.blackroad.io">Tutor</a>
    <a href="https://roadwork.blackroad.io">Work</a>
    <a href="https://highway.blackroad.io">Dashboard</a>
    <a href="#products">Products</a>
    <a href="#connect">Connect</a>
  </div>
  <a href="https://os.blackroad.io"><button class="btn btn-white">Open OS</button></a>
</div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-tag"><span class="hero-dot"></span>The Publisher</div>
  <h1 class="hero-title">RoadBook</h1>
  <p class="hero-sub">Open knowledge publishing platform. Write articles, research papers, tutorials. Full versioning, citations, and RoadChain provenance.</p>
  <div class="hero-actions">
    <a href="https://roadbook.blackroad.io"><button class="btn btn-white btn-lg">Open RoadBook</button></a>
    <a href="https://pay.blackroad.io"><button class="btn btn-outline btn-lg">Go Pro — $19/mo</button></a>
  </div>

  <!-- LIVE WIDGET -->
  <div class="live-widget">
    <div class="desktop-preview">
      <div class="window-bar">
        <div class="window-dot window-dot-red"></div>
        <div class="window-dot window-dot-yellow"></div>
        <div class="window-dot window-dot-green"></div>
        <div class="window-bar-title">roadbook — featured</div>
      </div>
      <div class="desktop-body">
        <div class="desktop-stat">
          <span class="desktop-stat-label">Publications</span>
          <span class="desktop-stat-value" id="pub-count">--</span>
        </div>
        <div class="desktop-stat">
          <span class="desktop-stat-label">Featured title</span>
          <span class="desktop-stat-value" id="feat-title">Loading...</span>
        </div>
        <div class="desktop-stat">
          <span class="desktop-stat-label">Featured author</span>
          <span class="desktop-stat-value" id="feat-author">--</span>
        </div>
        <div class="desktop-status">
          <div class="status-dot" id="health-dot"></div>
          <span class="status-text" id="health-text">Checking status...</span>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="divider"></div>

<!-- FEATURES -->
<section class="section">
<div class="container">
  <div class="section-num">01 — Features</div>
  <div class="section-title">Publish With Provenance</div>
  <div class="section-desc">Every word versioned. Every citation verified. Every publication anchored to the chain.</div>
  <div class="feature-grid">
    <div class="feature-card">
      <div class="feature-icon">D</div>
      <h3>DOI Generation</h3>
      <p>Every published work receives a unique Digital Object Identifier. Permanent, citable, globally resolvable. Your research gets a real address on the internet that never expires and never moves.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">V</div>
      <h3>Version Control</h3>
      <p>Full git-style history for every document. Branch, merge, diff, and roll back. See exactly what changed, when, and by whom. Co-authors work on branches and merge cleanly with conflict resolution.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">C</div>
      <h3>Citations</h3>
      <p>Inline citation engine with automatic bibliography generation. Import from DOI, ISBN, arXiv, or paste raw references. Export to BibTeX, APA, MLA, Chicago. Cross-link citations across RoadBook publications.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">R</div>
      <h3>Reading Lists</h3>
      <p>Curate and share collections of publications. Build syllabi, research bibliographies, or personal reading queues. Follow other readers and discover work through the network of what people actually read.</p>
    </div>
  </div>
</div>
</section>

<div class="divider"></div>

<!-- AGENTS -->
<section class="section">
<div class="container">
  <div class="section-num">02 — Agents</div>
  <div class="section-title">Your Publishing Crew</div>
  <div class="section-desc">Four agents dedicated to helping you write, archive, review, and refine your work.</div>
  <div class="agent-grid">
    <div class="agent"><span class="agent-name">Calliope</span><span class="agent-role">Storyteller</span></div>
    <div class="agent"><span class="agent-name">Alexandria</span><span class="agent-role">Archive</span></div>
    <div class="agent"><span class="agent-name">Portia</span><span class="agent-role">Review</span></div>
    <div class="agent"><span class="agent-name">Sophia</span><span class="agent-role">Wisdom</span></div>
  </div>
</div>
</section>

<div class="divider"></div>

<!-- HOW IT WORKS -->
<section class="section">
<div class="container">
  <div class="section-num">03 — How It Works</div>
  <div class="section-title">Write. Publish. Earn.</div>
  <div class="section-desc">From draft to DOI to RoadCoin in three steps.</div>
  <div class="steps">
    <div class="step">
      <div class="step-num">01</div>
      <h3>Write</h3>
      <p>Open the editor. Write articles, research papers, or tutorials with full Markdown support, LaTeX math, inline citations, and agent assistance from Calliope and Sophia.</p>
    </div>
    <div class="step">
      <div class="step-num">02</div>
      <h3>Publish with DOI</h3>
      <p>Hit publish. Your work gets a permanent DOI, is anchored to RoadChain for provenance, and becomes discoverable across the entire RoadBook network with full version history.</p>
    </div>
    <div class="step">
      <div class="step-num">03</div>
      <h3>Earn RoadCoin</h3>
      <p>Readers cite your work, add it to reading lists, and share it. Every interaction earns RoadCoin. Quality publications compound value over time through the citation graph.</p>
    </div>
  </div>
</div>
</section>

<div class="divider"></div>

<!-- PRICING -->
<section class="section">
<div class="container">
  <div class="section-num">04 — Pricing</div>
  <div class="section-title">Choose Your Lane</div>
  <div class="section-desc">Start free. Go pro when you need more power.</div>
  <div class="pricing-grid">
    <div class="pricing-card">
      <div class="pricing-tier">Free</div>
      <div class="pricing-price">$0<span>/mo</span></div>
      <div class="pricing-desc">Start publishing today.</div>
      <ul class="pricing-features">
        <li>3 publications</li>
        <li>Basic editor</li>
        <li>Public reading lists</li>
        <li>Community citations</li>
        <li>RoadCoin earnings</li>
      </ul>
      <a href="https://roadbook.blackroad.io"><button class="btn btn-outline" style="width:100%;justify-content:center">Open RoadBook</button></a>
    </div>
    <div class="pricing-card featured">
      <div class="pricing-tier">Pro</div>
      <div class="pricing-price">$19<span>/mo</span></div>
      <div class="pricing-desc">Full publishing power.</div>
      <ul class="pricing-features">
        <li>Unlimited publications</li>
        <li>DOI generation</li>
        <li>Full version control</li>
        <li>All 4 agents</li>
        <li>LaTeX + advanced editor</li>
        <li>Private drafts</li>
      </ul>
      <a href="https://pay.blackroad.io"><button class="btn btn-white" style="width:100%;justify-content:center">Go Pro</button></a>
    </div>
    <div class="pricing-card">
      <div class="pricing-tier">Institution</div>
      <div class="pricing-price">$49<span>/mo</span></div>
      <div class="pricing-desc">For research teams and universities.</div>
      <ul class="pricing-features">
        <li>Everything in Pro</li>
        <li>Team workspaces</li>
        <li>Peer review workflows</li>
        <li>Bulk DOI issuance</li>
        <li>Analytics dashboard</li>
        <li>SSO + admin controls</li>
      </ul>
      <a href="https://pay.blackroad.io"><button class="btn btn-outline" style="width:100%;justify-content:center">Contact Us</button></a>
    </div>
  </div>
</div>
</section>

<div class="divider"></div>

<!-- CONNECTED PRODUCTS -->
<section class="section" id="products">
<div class="container">
  <div class="section-num">05 — Connected Products</div>
  <div class="section-title">Part of the Highway</div>
  <div class="section-desc">RoadBook connects to the rest of the BlackRoad ecosystem.</div>
  <div class="connected-grid">
    <a href="https://backroad.blackroad.io" class="connected"><div class="connected-name">BackRoad</div><div class="connected-line">The blog engine</div><div class="connected-url">backroad.blackroad.io</div></a>
    <a href="https://roadchain.blackroad.io" class="connected"><div class="connected-name">RoadChain</div><div class="connected-line">The provenance ledger</div><div class="connected-url">roadchain.blackroad.io</div></a>
    <a href="https://blackboard.blackroad.io" class="connected"><div class="connected-name">BlackBoard</div><div class="connected-line">The classroom</div><div class="connected-url">blackboard.blackroad.io</div></a>
  </div>
</div>
</section>

<!-- FOOTER -->
<div class="grad-bar"></div>
<footer>
<div class="footer-inner">
  <div class="footer-grid">
    <div>
      <div class="footer-brand"><span class="footer-brand-bar"></span>BlackRoad OS</div>
      <div class="footer-tagline">Remember the Road. Pave Tomorrow.</div>
    </div>
    <div class="footer-col">
      <h4>Products</h4>
      <a href="https://os.blackroad.io">BlackRoad OS</a>
      <a href="https://roadtrip.blackroad.io">RoadTrip</a>
      <a href="https://roadie.blackroad.io">Roadie</a>
      <a href="https://roadview.blackroad.io">RoadView</a>
      <a href="https://roadwork.blackroad.io">RoadWork</a>
      <a href="https://roadcode.blackroad.io">RoadCode</a>
    </div>
    <div class="footer-col">
      <h4>More</h4>
      <a href="https://backroad.blackroad.io">BackRoad</a>
      <a href="https://roadbook.blackroad.io">RoadBook</a>
      <a href="https://roadworld.blackroad.io">RoadWorld</a>
      <a href="https://carkeys.blackroad.io">CarKeys</a>
      <a href="https://roadcoin.blackroad.io">RoadCoin</a>
      <a href="https://highway.blackroad.io">Highway</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="https://pay.blackroad.io">Pricing</a>
      <a href="https://github.com/BlackRoadOS">GitHub</a>
      <a href="https://huggingface.co/BlackRoad-OS">HuggingFace</a>
      <a href="https://roadside.blackroad.io">Support</a>
      <a href="mailto:alexa@blackroad.io">Contact</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">&copy; 2026 BlackRoad OS, Inc. Delaware C-Corp. All rights reserved.</div>
  </div>
</div>
</footer>

<script>
(function(){
  var dot = document.getElementById('health-dot');
  var txt = document.getElementById('health-text');
  var pubCount = document.getElementById('pub-count');
  var featTitle = document.getElementById('feat-title');
  var featAuthor = document.getElementById('feat-author');

  function fetchFeatured(){
    fetch('https://roadbook.blackroad.io/api/featured',{mode:'cors'})
      .then(function(r){return r.json()})
      .then(function(d){
        dot.className='status-dot';
        txt.textContent='roadbook.blackroad.io — online';
        if(d.count!==undefined) pubCount.textContent=d.count;
        if(d.featured && d.featured.length>0){
          featTitle.textContent=d.featured[0].title||'--';
          featAuthor.textContent=d.featured[0].author||'--';
        }
      })
      .catch(function(){
        dot.className='status-dot offline';
        txt.textContent='roadbook.blackroad.io — connecting...';
        pubCount.textContent='--';
        featTitle.textContent='--';
        featAuthor.textContent='--';
      });
  }
  fetchFeatured();
  setInterval(fetchFeatured,10000);
})();
<\/script>

</body>
</html>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") return new Response(BRAND_HTML, {headers:{"Content-Type":"text/html;charset=UTF-8","Access-Control-Allow-Origin":"*"}});
    const p = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // Init DB
    if (env.DB) {
      try { for (const s of SCHEMA) await env.DB.prepare(s).run(); } catch {}
    }

    if (p === '/api/health') return json({ status: 'ok', service: 'roadbook' });

    // API: Create article
    if (p === '/api/articles' && request.method === 'POST') {
      try {
        const body = await request.json();
        const wc = (body.content || '').split(/\s+/).filter(Boolean).length;
        const r = await env.DB.prepare(
          'INSERT INTO articles (title, author, content, summary, tags, status, word_count) VALUES (?,?,?,?,?,?,?)'
        ).bind(body.title||'Untitled', body.author||'Anonymous', body.content||'', body.summary||'', JSON.stringify(body.tags||[]), body.status||'draft', wc).run();
        return json({ id: r.meta.last_row_id, status: 'created' }, 201);
      } catch (e) { return json({ error: e.message }, 500); }
    }

    // API: List articles
    if (p === '/api/articles' && request.method === 'GET') {
      const status = url.searchParams.get('status') || 'published';
      const tag = url.searchParams.get('tag');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 20;
      const offset = (page - 1) * limit;
      let q = 'SELECT id, title, author, summary, tags, word_count, views, created_at FROM articles WHERE status = ?';
      const params = [status];
      if (tag) { q += " AND tags LIKE ?"; params.push('%' + tag + '%'); }
      q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      const rows = await env.DB.prepare(q).bind(...params).all();
      return json(rows.results);
    }

    // API: Get single article
    if (p.match(/^\/api\/articles\/(\d+)$/) && request.method === 'GET') {
      const id = p.split('/').pop();
      const row = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();
      if (!row) return json({ error: 'not found' }, 404);
      await env.DB.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').bind(id).run();
      return json({ ...row, tags: JSON.parse(row.tags || '[]') });
    }

    // API: Update article
    if (p.match(/^\/api\/articles\/(\d+)$/) && request.method === 'PUT') {
      const id = p.split('/').pop();
      const body = await request.json();
      const wc = (body.content || '').split(/\s+/).filter(Boolean).length;
      await env.DB.prepare(
        "UPDATE articles SET title=?, content=?, summary=?, tags=?, status=?, word_count=?, updated_at=datetime('now') WHERE id=?"
      ).bind(body.title, body.content, body.summary||'', JSON.stringify(body.tags||[]), body.status||'draft', wc, id).run();
      return json({ id, status: 'updated' });
    }

    // API: Search
    if (p === '/api/search' && request.method === 'GET') {
      const q = url.searchParams.get('q') || '';
      if (!q) return json([]);
      const rows = await env.DB.prepare(
        "SELECT id, title, author, summary, tags, word_count, views, created_at FROM articles WHERE status='published' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?) ORDER BY created_at DESC LIMIT 50"
      ).bind('%'+q+'%', '%'+q+'%', '%'+q+'%').all();
      return json(rows.results);
    }

    // API: Stats
    if (p === '/api/stats') {
      const total = await env.DB.prepare("SELECT COUNT(*) as c FROM articles WHERE status='published'").first();
      const views = await env.DB.prepare("SELECT SUM(views) as v FROM articles").first();
      const words = await env.DB.prepare("SELECT SUM(word_count) as w FROM articles WHERE status='published'").first();
      return json({ articles: total?.c || 0, total_views: views?.v || 0, total_words: words?.w || 0 });
    }

    // Serve HTML
    return secHeaders(new Response(renderApp(), { headers: { 'Content-Type': 'text/html;charset=utf-8' } }));
  }
};

function renderApp() {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RoadBook — Open Knowledge Platform</title>
<meta name="description" content="Publish, discover, and preserve articles, research, and knowledge on BlackRoad OS.">
<link rel="icon" href="https://images.blackroad.io/pixel-art/road-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--g:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);--bg:#000;--card:#0a0a0a;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--white:#fff;--sg:'Space Grotesk',sans-serif;--jb:'JetBrains Mono',monospace}
body{background:var(--bg);color:var(--text);font-family:var(--sg);line-height:1.7;min-height:100vh}
h1,h2,h3{font-family:var(--sg);color:var(--white);line-height:1.3}
code,pre{font-family:'JetBrains Mono',monospace}
pre{background:#111;border:1px solid var(--border);border-radius:10px;padding:16px;overflow-x:auto;margin:16px 0;font-size:13px;color:var(--text)}
code{background:#111;padding:2px 6px;border-radius:4px;font-size:13px}
a{color:var(--text);text-decoration:none}a:hover{color:var(--white)}
.wrap{max-width:800px;margin:0 auto;padding:24px 20px}
.grad-bar{position:fixed;top:0;left:0;right:0;height:4px;background:var(--g);z-index:1000}
.header{display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #1a1a1a;margin-bottom:32px}
.logo{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;color:#fff;cursor:pointer}
.logo-dot{width:24px;height:4px;border-radius:2px;background:var(--g)}
.nav-btns{display:flex;gap:8px}
.btn{padding:8px 16px;border:1px solid #222;border-radius:6px;background:transparent;color:var(--text);font-size:13px;font-family:var(--sg);cursor:pointer;transition:all .15s}
.btn:hover{border-color:#444;color:#fff}
.btn-primary{background:#fff;color:#000;border-color:#fff}
.btn-primary:hover{opacity:.9}
.search-bar{width:100%;padding:10px 16px;border:1px solid #222;border-radius:6px;background:#111;color:#fff;font-size:14px;font-family:var(--sg);outline:none;margin-bottom:24px}
.search-bar:focus{border-color:#333}
.search-bar::placeholder{color:#444}
.article-list{display:flex;flex-direction:column;gap:16px}
.article-card{background:#111;border:1px solid #1a1a1a;border-radius:10px;padding:20px;cursor:pointer;transition:border-color .15s}
.article-card:hover{border-color:#333}
.article-card h3{font-size:18px;margin-bottom:6px}
.article-card .meta{font-size:12px;color:var(--muted);display:flex;gap:12px;margin-bottom:8px}
.article-card .summary{font-size:14px;color:var(--sub);line-height:1.6}
.article-card .tags{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.tag{font-size:11px;padding:3px 10px;border-radius:12px;background:#1a1a1a;color:#888}
.article-view{display:none}
.article-view h1{font-size:28px;margin-bottom:8px}
.article-view .meta{font-size:13px;color:var(--muted);margin-bottom:24px;display:flex;gap:16px}
.article-view .content{font-size:15px;line-height:1.8;color:var(--text)}
.article-view .content h1{font-size:24px;margin:24px 0 12px}
.article-view .content h2{font-size:20px;margin:20px 0 10px}
.article-view .content h3{font-size:17px;margin:16px 0 8px}
.article-view .content p{margin-bottom:12px}
.article-view .content ul{margin:8px 0 16px 24px}
.article-view .content li{margin-bottom:4px}
.article-view .content strong{color:#fff}
.editor{display:none}
.editor textarea{width:100%;height:400px;background:#111;border:1px solid #222;border-radius:6px;padding:16px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:14px;resize:vertical;outline:none;line-height:1.6}
.editor textarea:focus{border-color:#333}
.editor input{width:100%;padding:10px 16px;border:1px solid #222;border-radius:6px;background:#111;color:#fff;font-size:14px;font-family:var(--sg);outline:none;margin-bottom:12px}
.editor input:focus{border-color:#333}
.stats{display:flex;gap:24px;margin-bottom:24px}
.stat{text-align:center}
.stat .num{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#fff}
.stat .label{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px}
.empty{text-align:center;padding:60px 20px;color:#555}
.empty h3{color:#666;margin-bottom:8px}
.back-btn{font-size:13px;color:#666;cursor:pointer;margin-bottom:16px;display:inline-flex;align-items:center;gap:4px}
.back-btn:hover{color:#999}
.footer{text-align:center;padding:32px 0 16px;border-top:1px solid #1a1a1a;margin-top:48px;font-size:12px;color:#444}
</style></head><body><div class="grad-bar"></div>
<div class="wrap">
  <div class="header">
    <div class="logo" onclick="showList()"><div class="logo-dot"></div> RoadBook</div>
    <div class="nav-btns">
      <button class="btn" onclick="showList()">Browse</button>
      <button class="btn btn-primary" onclick="showEditor()">Publish</button>
    </div>
  </div>

  <!-- LIST VIEW -->
  <div id="list-view">
    <input class="search-bar" placeholder="Search articles, research, tutorials..." id="search-input" oninput="debounceSearch()">
    <div class="stats" id="stats-bar"></div>
    <div class="article-list" id="article-list">
      <div class="empty"><h3>The knowledge highway is open</h3><p>Be the first to publish. Click "Publish" above.</p></div>
    </div>
  </div>

  <!-- ARTICLE VIEW -->
  <div class="article-view" id="article-view">
    <div class="back-btn" onclick="showList()">&larr; Back to articles</div>
    <h1 id="av-title"></h1>
    <div class="meta">
      <span id="av-author"></span>
      <span id="av-date"></span>
      <span id="av-words"></span>
      <span id="av-views"></span>
    </div>
    <div id="av-tags" style="margin-bottom:20px"></div>
    <div class="content" id="av-content"></div>
  </div>

  <!-- EDITOR -->
  <div class="editor" id="editor-view">
    <div class="back-btn" onclick="showList()">&larr; Back</div>
    <h2 style="margin-bottom:16px">Publish to RoadBook</h2>
    <input id="ed-title" placeholder="Title">
    <input id="ed-author" placeholder="Author name">
    <input id="ed-tags" placeholder="Tags (comma separated)">
    <input id="ed-summary" placeholder="Short summary (optional)">
    <textarea id="ed-content" placeholder="Write your article in Markdown...

# Heading
## Subheading

**Bold text** and *italic text*

- List item one
- List item two

> Blockquote

\`inline code\`

---

[Link text](https://example.com)"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" onclick="saveArticle('draft')">Save Draft</button>
      <button class="btn btn-primary" onclick="saveArticle('published')">Publish</button>
    </div>
  </div>

  <footer class="footer">
    <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px">
      <div style="width:8px;height:8px;border-radius:50%;background:#f5f5f5"></div>
      <div style="width:8px;height:8px;border-radius:3px;background:#737373"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:#555"></div>
      <div style="width:8px;height:8px;border-radius:3px;background:#737373"></div>
    </div>
    BlackRoad OS, Inc. 2025-2026 &mdash; Pave Tomorrow.
  </footer>
</div>

<script>
const API = '';
let searchTimer;

async function loadArticles(query) {
  try {
    const url = query ? API+'/api/search?q='+encodeURIComponent(query) : API+'/api/articles?status=published';
    const r = await fetch(url);
    const articles = await r.json();
    renderList(articles);
  } catch { renderList([]); }
}

async function loadStats() {
  try {
    const r = await fetch(API+'/api/stats');
    const s = await r.json();
    document.getElementById('stats-bar').innerHTML =
      '<div class="stat"><div class="num">'+s.articles+'</div><div class="label">Articles</div></div>' +
      '<div class="stat"><div class="num">'+s.total_views+'</div><div class="label">Views</div></div>' +
      '<div class="stat"><div class="num">'+(s.total_words > 1000 ? Math.round(s.total_words/1000)+'K' : s.total_words)+'</div><div class="label">Words</div></div>';
  } catch {}
}

function renderList(articles) {
  const el = document.getElementById('article-list');
  if (!articles.length) {
    el.innerHTML = '<div class="empty"><h3>No articles yet</h3><p>Be the first to publish. Click "Publish" above.</p></div>';
    return;
  }
  el.innerHTML = articles.map(a => {
    const tags = JSON.parse(a.tags || '[]');
    const readTime = Math.max(1, Math.round((a.word_count||0) / 250));
    return '<div class="article-card" onclick="viewArticle('+a.id+')">' +
      '<h3>'+esc(a.title)+'</h3>' +
      '<div class="meta"><span>'+esc(a.author)+'</span><span>'+new Date(a.created_at).toLocaleDateString()+'</span><span>'+readTime+' min read</span><span>'+a.views+' views</span></div>' +
      (a.summary ? '<div class="summary">'+esc(a.summary)+'</div>' : '') +
      (tags.length ? '<div class="tags">'+tags.map(t => '<span class="tag">'+esc(t)+'</span>').join('')+'</div>' : '') +
      '</div>';
  }).join('');
}

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function viewArticle(id) {
  try {
    const r = await fetch(API+'/api/articles/'+id);
    const a = await r.json();
    document.getElementById('av-title').textContent = a.title;
    document.getElementById('av-author').textContent = a.author;
    document.getElementById('av-date').textContent = new Date(a.created_at).toLocaleDateString();
    document.getElementById('av-words').textContent = a.word_count + ' words';
    document.getElementById('av-views').textContent = (a.views+1) + ' views';
    document.getElementById('av-tags').innerHTML = (a.tags||[]).map(t => '<span class="tag">'+esc(t)+'</span>').join(' ');
    document.getElementById('av-content').innerHTML = renderMarkdown(a.content);
    showView('article');
  } catch (e) { alert('Error loading article'); }
}

function renderMarkdown(text) {
  let html = esc(text);
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  html = html.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #333;padding-left:16px;color:#999;margin:12px 0">$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #222;margin:24px 0">');
  html = html.replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/\\n\\n/g, '</p><p>');
  return '<p>' + html + '</p>';
}

async function saveArticle(status) {
  const title = document.getElementById('ed-title').value.trim();
  const content = document.getElementById('ed-content').value.trim();
  if (!title || !content) { alert('Title and content are required'); return; }
  const body = {
    title, content, status,
    author: document.getElementById('ed-author').value.trim() || 'Anonymous',
    summary: document.getElementById('ed-summary').value.trim(),
    tags: document.getElementById('ed-tags').value.split(',').map(t => t.trim()).filter(Boolean),
  };
  try {
    const r = await fetch(API+'/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.id) {
      alert(status === 'published' ? 'Published!' : 'Draft saved!');
      ['ed-title','ed-author','ed-tags','ed-summary','ed-content'].forEach(id => document.getElementById(id).value = '');
      showList();
    } else { alert('Error: ' + (d.error || 'unknown')); }
  } catch (e) { alert('Error saving: ' + e.message); }
}

function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = document.getElementById('search-input').value.trim();
    loadArticles(q || null);
  }, 300);
}

function showView(view) {
  document.getElementById('list-view').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('article-view').style.display = view === 'article' ? 'block' : 'none';
  document.getElementById('editor-view').style.display = view === 'editor' ? 'block' : 'none';
}

function showList() { showView('list'); loadArticles(); loadStats(); }
function showEditor() { showView('editor'); }

// Init
showList();
</script><script src="https://bb.blackroad.io/bb.js" defer><\/script>
</body></html>`;
}
