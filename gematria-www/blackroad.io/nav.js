// BlackRoad OS — Shared Navigation Component
// Include on any BlackRoad site: <script src="https://blackroad.io/nav.js"></script>
// Automatically injects nav, mobile menu, gradient bar, brand bars, clock
// Active state auto-detected from window.location.hostname
// (c) 2026 BlackRoad OS, Inc.

(function(d,w){
'use strict';

// ── CONFIG ──
var SITES = [
  {domain:'blackroad.io',label:'Platform',path:'/'},
  {domain:'blackroad.io',label:'Chat',path:'/chat',parent:'blackroad.io'},
  {domain:'blackroad.io',label:'Docs',path:'/docs',parent:'blackroad.io'},
  {domain:'blackroadai.com',label:'AI',path:null},
  {domain:'lucidia.earth',label:'Lucidia',path:null},
  {domain:'db.blackroad.io',label:'Database',path:null},
];
var ECO = [
  {domain:'blackroad.io',label:'Platform Hub'},
  {domain:'blackroad.io/chat',label:'Free AI Chat'},
  {domain:'blackroad.io/docs',label:'Documentation'},
  {domain:'blackroad.io/api',label:'API Reference'},
  {domain:'blackroadai.com',label:'AI Models & Agents'},
  {domain:'lucidia.earth',label:'Cognition Engine'},
  {domain:'db.blackroad.io',label:'Search Everything'},
  {domain:'blackroad.network',label:'Mesh Network'},
  {domain:'roadchain.io',label:'Soul Chain'},
  {domain:'blackroadquantum.com',label:'Quantum Math'},
  {domain:'blackroad.systems',label:'Fleet Status'},
  {domain:'stats.blackroad.io',label:'Fleet Stats'},
  {domain:'images.blackroad.io',label:'Image CDN'},
  {domain:'api.blackroad.io',label:'API Gateway'},
];
var COLORS = ['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
var host = w.location.hostname;

// ── Detect active page ──
function isActive(site) {
  if (site.domain === host) return true;
  if (site.parent === host && site.path && w.location.pathname === site.path) return true;
  // blackroad.io subpages
  if (host === 'blackroad.io' && site.domain === 'blackroad.io' && site.path === '/') {
    return w.location.pathname === '/' || w.location.pathname === '/index.html';
  }
  if (host === 'blackroad.io' && site.path && w.location.pathname === site.path) return true;
  return false;
}

function getHref(site) {
  if (site.parent === host && site.path) return site.path;
  if (site.domain === host && site.path) return site.path;
  return 'https://' + site.domain;
}

// ── Inject CSS ──
var css = d.createElement('style');
css.textContent = [
  'nav.br-nav{position:sticky;top:0;z-index:100;background:rgba(0,0,0,.97);backdrop-filter:blur(20px);border-bottom:1px solid #111}',
  '.br-ni{display:flex;align-items:center;padding:0 32px;height:56px;max-width:1200px;margin:0 auto;gap:8px}',
  '.br-brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:#f5f5f5;flex-shrink:0}',
  '.br-bars{display:flex;gap:2px;align-items:center}',
  '.br-brand span{font-weight:700;font-size:17px;letter-spacing:-.03em}',
  '.br-links{display:flex;align-items:center;gap:4px;margin-left:32px}',
  '.br-link{font-family:var(--in,"Inter",sans-serif);font-size:13px;font-weight:500;color:#737373;text-decoration:none;padding:6px 12px;border-radius:6px;transition:color .15s,background .15s;position:relative;cursor:pointer}',
  '.br-link:hover{color:#f5f5f5;background:rgba(255,255,255,.04)}',
  '.br-link.active{color:#f5f5f5}',
  '.br-link.active::after{content:"";position:absolute;bottom:-14px;left:12px;right:12px;height:2px;background:var(--g,linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF));border-radius:1px}',
  '.br-dd{position:relative}',
  '.br-dd-trigger{display:flex;align-items:center;gap:4px}',
  '.br-dd-trigger svg{width:10px;height:10px;fill:#737373;transition:transform .2s}',
  '.br-dd.open .br-dd-trigger svg{transform:rotate(180deg)}',
  '.br-dd-menu{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:8px;min-width:420px;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s;display:grid;grid-template-columns:1fr 1fr;gap:2px}',
  '.br-dd.open .br-dd-menu{opacity:1;visibility:visible}',
  '.br-dd-item{display:block;padding:10px 14px;border-radius:8px;text-decoration:none;transition:background .15s}',
  '.br-dd-item:hover{background:rgba(255,255,255,.04)}',
  '.br-dd-item .dd-d{font-family:var(--jb,"JetBrains Mono",monospace);font-size:11px;color:#555}',
  '.br-dd-item .dd-l{font-size:13px;color:#999;margin-top:2px}',
  '.br-right{display:flex;align-items:center;gap:12px;margin-left:auto}',
  '.br-clock{font-family:var(--jb,"JetBrains Mono",monospace);font-size:11px;color:#333}',
  '.br-cta{padding:7px 18px;border-radius:6px;background:#f5f5f5;color:#000;font-size:13px;font-weight:600;text-decoration:none;font-family:"Space Grotesk",sans-serif;transition:opacity .15s}',
  '.br-cta:hover{opacity:.85}',
  '.br-gh{color:#555;transition:color .15s;display:flex}',
  '.br-gh:hover{color:#f5f5f5}',
  '.br-ham{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:8px;margin-left:auto;background:none;border:none}',
  '.br-ham span{width:18px;height:2px;background:#f5f5f5;border-radius:1px;transition:transform .2s,opacity .2s;display:block}',
  '.br-ham.open span:nth-child(1){transform:translateY(6px) rotate(45deg)}',
  '.br-ham.open span:nth-child(2){opacity:0}',
  '.br-ham.open span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}',
  '.br-mob{display:none;position:fixed;top:59px;left:0;right:0;bottom:0;background:rgba(0,0,0,.98);backdrop-filter:blur(20px);z-index:99;padding:24px;overflow-y:auto}',
  '.br-mob.open{display:flex;flex-direction:column;animation:brfu .3s ease}',
  '@keyframes brfu{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}',
  '.br-mob-sec{margin-bottom:24px}',
  '.br-mob-label{font-family:var(--jb,"JetBrains Mono",monospace);font-size:10px;color:#444;text-transform:uppercase;letter-spacing:.18em;margin-bottom:12px}',
  '.br-mob-link{display:block;padding:14px 16px;font-size:16px;font-weight:500;color:#999;text-decoration:none;border-bottom:1px solid #111;transition:color .15s}',
  '.br-mob-link:hover,.br-mob-link:active{color:#f5f5f5}',
  '.br-mob-link.active{color:#f5f5f5}',
  '.br-mob-sub{display:block;padding:10px 16px;font-size:14px;color:#555;text-decoration:none;transition:color .15s}',
  '.br-mob-sub:hover{color:#999}',
  '.br-mob-sub .sub-d{font-family:var(--jb,"JetBrains Mono",monospace);font-size:11px;color:#333;display:block}',
  '.br-mob-cta{display:block;text-align:center;padding:14px;background:#f5f5f5;color:#000;font-weight:600;font-size:15px;border-radius:8px;text-decoration:none;margin-top:auto}',
  '@media(max-width:768px){.br-links,.br-clock,.br-cta,.br-gh{display:none!important}.br-ham{display:flex!important}.br-ni{padding:0 16px}}',
  '.br-gb{height:3px;background:var(--g,linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF));background-size:200% 100%;animation:brgs 4s linear infinite}',
  '@keyframes brgs{0%{background-position:0%}100%{background-position:200%}}',
  '@keyframes brbp{0%,100%{opacity:1;transform:scaleY(1)}50%{opacity:.4;transform:scaleY(.6)}}',
].join('\n');
d.head.appendChild(css);

// ── Build nav HTML ──
function buildNav() {
  // Gradient bar
  var gb = d.createElement('div');
  gb.className = 'br-gb';

  // Nav element
  var nav = d.createElement('nav');
  nav.className = 'br-nav';
  var inner = d.createElement('div');
  inner.className = 'br-ni';

  // Brand
  var brand = d.createElement('a');
  brand.className = 'br-brand';
  brand.href = 'https://blackroad.io';
  var bars = d.createElement('div');
  bars.className = 'br-bars';
  COLORS.forEach(function(c, i) {
    var b = d.createElement('div');
    b.style.cssText = 'width:3px;height:16px;border-radius:2px;background:'+c+';animation:brbp 2.5s ease-in-out '+i*.15+'s infinite';
    bars.appendChild(b);
  });
  var brandText = d.createElement('span');
  brandText.textContent = 'BlackRoad';
  brand.appendChild(bars);
  brand.appendChild(brandText);
  inner.appendChild(brand);

  // Desktop links
  var links = d.createElement('div');
  links.className = 'br-links';
  SITES.forEach(function(site) {
    var a = d.createElement('a');
    a.className = 'br-link' + (isActive(site) ? ' active' : '');
    a.href = getHref(site);
    a.textContent = site.label;
    links.appendChild(a);
  });

  // Ecosystem dropdown
  var dd = d.createElement('div');
  dd.className = 'br-dd';
  dd.id = 'brEcoDD';
  var trigger = d.createElement('a');
  trigger.className = 'br-link br-dd-trigger';
  trigger.innerHTML = 'Ecosystem <svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
  trigger.onclick = function(e) {
    e.preventDefault();
    dd.classList.toggle('open');
  };
  var menu = d.createElement('div');
  menu.className = 'br-dd-menu';
  ECO.forEach(function(e) {
    var a = d.createElement('a');
    a.className = 'br-dd-item';
    a.href = 'https://' + e.domain;
    a.innerHTML = '<div class="dd-d">' + e.domain + '</div><div class="dd-l">' + e.label + '</div>';
    menu.appendChild(a);
  });
  dd.appendChild(trigger);
  dd.appendChild(menu);
  links.appendChild(dd);
  inner.appendChild(links);

  // Right side
  var right = d.createElement('div');
  right.className = 'br-right';

  // Clock
  var clock = d.createElement('span');
  clock.className = 'br-clock';
  clock.id = 'brClock';
  right.appendChild(clock);

  // GitHub
  var gh = d.createElement('a');
  gh.className = 'br-gh';
  gh.href = 'https://github.com/blackboxprogramming';
  gh.target = '_blank';
  gh.rel = 'noopener';
  gh.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>';
  right.appendChild(gh);

  // CTA
  var cta = d.createElement('a');
  cta.className = 'br-cta';
  cta.href = 'https://blackroad.io/signup';
  cta.textContent = 'Join Beta';
  right.appendChild(cta);
  inner.appendChild(right);

  // Hamburger
  var ham = d.createElement('button');
  ham.className = 'br-ham';
  ham.innerHTML = '<span></span><span></span><span></span>';
  ham.onclick = function() {
    ham.classList.toggle('open');
    mob.classList.toggle('open');
  };
  inner.appendChild(ham);
  nav.appendChild(inner);

  // Mobile menu
  var mob = d.createElement('div');
  mob.className = 'br-mob';

  // Navigate section
  var navSec = d.createElement('div');
  navSec.className = 'br-mob-sec';
  navSec.innerHTML = '<div class="br-mob-label">Navigate</div>';
  SITES.forEach(function(site) {
    var a = d.createElement('a');
    a.className = 'br-mob-link' + (isActive(site) ? ' active' : '');
    a.href = getHref(site);
    a.textContent = site.label;
    navSec.appendChild(a);
  });
  mob.appendChild(navSec);

  // Ecosystem section
  var ecoSec = d.createElement('div');
  ecoSec.className = 'br-mob-sec';
  ecoSec.innerHTML = '<div class="br-mob-label">Ecosystem</div>';
  ECO.forEach(function(e) {
    var a = d.createElement('a');
    a.className = 'br-mob-sub';
    a.href = 'https://' + e.domain;
    a.innerHTML = e.label + '<span class="sub-d">' + e.domain + '</span>';
    ecoSec.appendChild(a);
  });
  mob.appendChild(ecoSec);

  // Mobile CTA
  var mCta = d.createElement('a');
  mCta.className = 'br-mob-cta';
  mCta.href = 'https://blackroad.io/signup';
  mCta.textContent = 'Join the Beta';
  mob.appendChild(mCta);

  // Close dropdown on outside click
  d.addEventListener('click', function(e) {
    if (!dd.contains(e.target)) dd.classList.remove('open');
  });

  // Insert into page — find the first .z element or prepend to body
  var container = d.querySelector('.z');
  if (container) {
    // Remove existing gb and nav if present
    var existingGb = container.querySelector('.gb');
    var existingNav = container.querySelector('nav');
    if (existingGb) existingGb.remove();
    if (existingNav) existingNav.remove();
    container.insertBefore(nav, container.firstChild);
    container.insertBefore(gb, container.firstChild);
    // Insert mobile menu after nav
    nav.parentNode.insertBefore(mob, nav.nextSibling);
  } else {
    d.body.insertBefore(mob, d.body.firstChild);
    d.body.insertBefore(nav, d.body.firstChild);
    d.body.insertBefore(gb, d.body.firstChild);
  }

  // Clock
  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// Wait for DOM
if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', buildNav);
} else {
  buildNav();
}

})(document, window);
