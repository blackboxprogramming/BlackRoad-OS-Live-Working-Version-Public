// BlackRoad OS — Shared Footer Component
// Include on any BlackRoad site: <script src="https://blackroad.io/footer.js" defer></script>
// Auto-injects a deep-linking footer with ecosystem map
// (c) 2026 BlackRoad OS, Inc.

(function(d){
'use strict';

var GRAD = 'linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)';

var COLS = [
  {
    title: 'Platform',
    links: [
      ['https://blackroad.io', 'Home'],
      ['https://blackroad.io/chat', 'Chat'],
      ['https://blackroad.io/signup', 'Join Beta'],
      ['https://stats.blackroad.io', 'Live Stats'],
      ['https://db.blackroad.io', 'Database'],
      ['https://images.blackroad.io', 'Images'],
    ]
  },
  {
    title: 'AI & Agents',
    links: [
      ['https://blackroadai.com', 'BlackRoad AI'],
      ['https://lucidia.earth', 'Lucidia'],
      ['https://agents.blackroad.io', 'All Agents'],
      ['https://alice.blackroad.io', 'Alice'],
      ['https://cecilia.blackroad.io', 'Cecilia'],
      ['https://octavia.blackroad.io', 'Octavia'],
      ['https://aria.blackroad.io', 'Aria'],
      ['https://shellfish.blackroad.io', 'Shellfish'],
    ]
  },
  {
    title: 'Ecosystem',
    links: [
      ['https://blackroad.network', 'Mesh Network'],
      ['https://roadchain.io', 'Soul Chain'],
      ['https://blackroadquantum.com', 'Quantum'],
      ['https://blackroad.systems', 'Fleet Status'],
      ['https://blackroad.company', 'Company'],
      ['https://blackroadinc.us', 'US Corp'],
      ['https://bb.blackroad.io', 'Analytics'],
    ]
  },
  {
    title: 'Resources',
    links: [
      ['https://github.com/blackboxprogramming', 'GitHub'],
      ['https://git.blackroad.io', 'Gitea'],
      ['https://index.blackroad.io', 'Code Index'],
      ['https://wiki.blackroad.io', 'Wiki'],
      ['https://showcase.blackroad.io', 'Showcase'],
      ['https://brand.blackroad.io', 'Brand Kit'],
      ['https://blackroad.me', 'Identity'],
    ]
  },
  {
    title: 'Domains',
    links: [
      ['https://lucidia.studio', 'lucidia.studio'],
      ['https://lucidiaqi.com', 'lucidiaqi.com'],
      ['https://blackroad.network', 'blackroad.network'],
      ['https://blackroad.systems', 'blackroad.systems'],
      ['https://mesh.blackroad.io', 'mesh.blackroad.io'],
      ['https://roadcoin.io', 'roadcoin.io'],
    ]
  }
];

var BOTTOM_LINKS = [
  ['https://blackroad.io', 'Platform'],
  ['https://blackroadai.com', 'AI'],
  ['https://lucidia.earth', 'Lucidia'],
  ['https://db.blackroad.io', 'Database'],
  ['https://agents.blackroad.io', 'Agents'],
  ['https://blackroad.network', 'Network'],
  ['https://roadchain.io', 'Chain'],
  ['https://blackroadquantum.com', 'Quantum'],
  ['https://github.com/blackboxprogramming', 'GitHub'],
];

function init() {
  // Remove any existing footer
  var old = d.querySelector('footer');
  if (old) old.remove();

  var host = window.location.hostname;

  // Build footer
  var f = d.createElement('footer');
  f.id = 'br-footer';

  // Gradient line
  var gl = d.createElement('div');
  gl.style.cssText = 'height:2px;background:'+GRAD+';background-size:200% 100%;animation:brfgs 4s linear infinite';
  f.appendChild(gl);

  // Add keyframes
  var sk = d.createElement('style');
  sk.textContent = '@keyframes brfgs{0%{background-position:0%}100%{background-position:200%}}';
  d.head.appendChild(sk);

  // Container
  var c = d.createElement('div');
  c.style.cssText = 'max-width:1200px;margin:0 auto;padding:48px 24px 24px';

  // Columns grid
  var grid = d.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:32px;margin-bottom:40px';

  COLS.forEach(function(col) {
    var div = d.createElement('div');

    var h = d.createElement('div');
    h.textContent = col.title;
    h.style.cssText = 'font-family:"Space Grotesk",system-ui,sans-serif;font-size:13px;font-weight:600;color:#f5f5f5;margin-bottom:16px;letter-spacing:0.5px;text-transform:uppercase';
    div.appendChild(h);

    col.links.forEach(function(l) {
      var a = d.createElement('a');
      a.href = l[0];
      a.textContent = l[1];
      var isActive = l[0].indexOf(host) !== -1;
      a.style.cssText = 'display:block;font-family:"JetBrains Mono","Fira Code",monospace;font-size:12px;color:'+(isActive?'#f5f5f5':'#666')+';text-decoration:none;padding:3px 0;transition:color .2s';
      a.onmouseover = function(){this.style.color='#f5f5f5'};
      a.onmouseout = function(){this.style.color=isActive?'#f5f5f5':'#666'};
      if (l[0].indexOf(host) === -1) a.target = '_self';
      div.appendChild(a);
    });

    grid.appendChild(div);
  });
  c.appendChild(grid);

  // Divider
  var hr = d.createElement('div');
  hr.style.cssText = 'height:1px;background:#1a1a1a;margin-bottom:24px';
  c.appendChild(hr);

  // Bottom row: quick links + tagline + copyright
  var bot = d.createElement('div');
  bot.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px';

  // Quick links row
  var ql = d.createElement('div');
  ql.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 16px';
  BOTTOM_LINKS.forEach(function(l) {
    var a = d.createElement('a');
    a.href = l[0];
    a.textContent = l[1];
    a.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#444;text-decoration:none;transition:color .2s';
    a.onmouseover = function(){this.style.color='#888'};
    a.onmouseout = function(){this.style.color='#444'};
    ql.appendChild(a);
  });
  bot.appendChild(ql);

  // Right side: tagline + copyright
  var right = d.createElement('div');
  right.style.cssText = 'text-align:right';

  var tag = d.createElement('div');
  tag.textContent = 'BlackRoad OS \u2014 Pave Tomorrow.';
  tag.style.cssText = 'font-family:"Space Grotesk",sans-serif;font-size:13px;font-weight:600;color:#f5f5f5;margin-bottom:6px';
  right.appendChild(tag);

  var copy = d.createElement('div');
  copy.textContent = '\u00A9 2026 BlackRoad OS, Inc.';
  copy.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#333';
  right.appendChild(copy);

  bot.appendChild(right);
  c.appendChild(bot);

  f.appendChild(c);

  // Footer styles
  f.style.cssText = 'background:#000;border-top:none;margin-top:60px';

  // Responsive: stack columns on mobile
  var ms = d.createElement('style');
  ms.textContent = '@media(max-width:768px){#br-footer>div>div:first-child{grid-template-columns:repeat(2,1fr)!important;gap:24px!important}#br-footer>div>div:last-child{flex-direction:column!important;align-items:flex-start!important}#br-footer>div>div:last-child>div:last-child{text-align:left!important}}@media(max-width:480px){#br-footer>div>div:first-child{grid-template-columns:1fr!important}}';
  d.head.appendChild(ms);

  // Insert before consent banner or at end of body
  var consent = d.getElementById('br-consent');
  if (consent) {
    d.body.insertBefore(f, consent);
  } else {
    // Find the last script tag (usually bb beacon) and insert before it
    var scripts = d.querySelectorAll('body > script');
    if (scripts.length > 0) {
      d.body.insertBefore(f, scripts[scripts.length - 1]);
    } else {
      d.body.appendChild(f);
    }
  }
}

if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})(document);
