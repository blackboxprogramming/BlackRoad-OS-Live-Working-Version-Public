// BlackRoad OS — Related Pages Component
// Shows "You might also like" contextual links based on current page
// Include: <script src="https://blackroad.io/related.js" defer></script>
// (c) 2026 BlackRoad OS, Inc.

(function(d){
'use strict';

var PAGES = {
  'blackroad.io': [
    {url:'https://blackroadai.com',title:'BlackRoad AI',desc:'OpenAI-compatible API on sovereign hardware'},
    {url:'https://db.blackroad.io',title:'Database',desc:'Search 95+ ecosystem items'},
    {url:'https://stats.blackroad.io',title:'Live Stats',desc:'Real-time fleet telemetry'},
    {url:'https://agents.blackroad.io',title:'Meet the Fleet',desc:'6 autonomous agents'},
  ],
  'blackroadai.com': [
    {url:'https://blackroad.io/chat',title:'Free Chat',desc:'Try AI with no login required'},
    {url:'https://lucidia.earth',title:'Lucidia',desc:'AI cognition and persistent memory'},
    {url:'https://agents.blackroad.io',title:'Agents',desc:'Meet the fleet behind the AI'},
    {url:'https://mesh.blackroad.io',title:'Mesh Network',desc:'Distributed inference routing'},
  ],
  'lucidia.earth': [
    {url:'https://blackroadai.com',title:'BlackRoad AI',desc:'The platform powering Lucidia'},
    {url:'https://showcase.blackroad.io',title:'Showcase',desc:'See what agents create'},
    {url:'https://wiki.blackroad.io/agents/lucidia',title:'Wiki: Lucidia',desc:'Full agent profile and lore'},
    {url:'https://blackroadquantum.com',title:'Quantum',desc:'Mathematical foundations'},
  ],
  'agents.blackroad.io': [
    {url:'https://blackroad.io',title:'Platform',desc:'BlackRoad OS home'},
    {url:'https://wiki.blackroad.io',title:'Wiki',desc:'Agent profiles and lore'},
    {url:'https://showcase.blackroad.io',title:'Showcase',desc:'Agent-generated art'},
    {url:'https://stats.blackroad.io',title:'Fleet Stats',desc:'Real-time node monitoring'},
  ],
  'alice.blackroad.io': [
    {url:'https://cecilia.blackroad.io',title:'Cecilia',desc:'The Voice — TTS and personality'},
    {url:'https://octavia.blackroad.io',title:'Octavia',desc:'The Architect — Gitea and orchestration'},
    {url:'https://stats.blackroad.io',title:'Fleet Stats',desc:'See Alice\'s node in real-time'},
    {url:'https://wiki.blackroad.io/agents/alice',title:'Wiki: Alice',desc:'Full profile'},
  ],
  'cecilia.blackroad.io': [
    {url:'https://alice.blackroad.io',title:'Alice',desc:'The Operator — gateway and DNS'},
    {url:'https://lucidia.blackroad.io',title:'Lucidia',desc:'The Dreamer — memory and cognition'},
    {url:'https://blackroad.io/chat',title:'Chat',desc:'Talk to fleet models'},
    {url:'https://wiki.blackroad.io/agents/cecilia',title:'Wiki: Cecilia',desc:'Full profile'},
  ],
  'octavia.blackroad.io': [
    {url:'https://aria.blackroad.io',title:'Aria',desc:'The Interface — Portainer and UX'},
    {url:'https://shellfish.blackroad.io',title:'Shellfish',desc:'The Hacker — security audits'},
    {url:'https://git.blackroad.io',title:'Gitea',desc:'207 repos self-hosted'},
    {url:'https://wiki.blackroad.io/agents/octavia',title:'Wiki: Octavia',desc:'Full profile'},
  ],
  'db.blackroad.io': [
    {url:'https://index.blackroad.io',title:'Code Index',desc:'354 repos, 2,524 files searchable'},
    {url:'https://blackroad.io',title:'Platform',desc:'BlackRoad OS home'},
    {url:'https://agents.blackroad.io',title:'Agents',desc:'Browse fleet agents'},
    {url:'https://stats.blackroad.io',title:'Live Stats',desc:'Fleet telemetry'},
  ],
  'stats.blackroad.io': [
    {url:'https://blackroad.network',title:'Network',desc:'Infrastructure dashboard'},
    {url:'https://blackroad.systems',title:'Fleet Status',desc:'System health'},
    {url:'https://agents.blackroad.io',title:'Agents',desc:'Meet the nodes'},
    {url:'https://db.blackroad.io',title:'Database',desc:'Search everything'},
  ],
  'wiki.blackroad.io': [
    {url:'https://agents.blackroad.io',title:'Agents',desc:'Agent pages with live status'},
    {url:'https://showcase.blackroad.io',title:'Showcase',desc:'Agent-generated art'},
    {url:'https://blackroad.io',title:'Platform',desc:'BlackRoad OS home'},
    {url:'https://db.blackroad.io',title:'Database',desc:'Search 95+ items'},
  ],
  'showcase.blackroad.io': [
    {url:'https://agents.blackroad.io',title:'Agents',desc:'Meet the creators'},
    {url:'https://lucidia.earth',title:'Lucidia',desc:'The Dreamer behind the art'},
    {url:'https://images.blackroad.io',title:'Images CDN',desc:'Full resolution gallery'},
    {url:'https://wiki.blackroad.io',title:'Wiki',desc:'Agent lore and backstory'},
  ],
  'brand.blackroad.io': [
    {url:'https://blackroad.io',title:'Platform',desc:'See the brand in action'},
    {url:'https://showcase.blackroad.io',title:'Showcase',desc:'Visual identity examples'},
    {url:'https://blackroad.company',title:'Company',desc:'Corporate presence'},
    {url:'https://alexa.blackroad.io',title:'Founder',desc:'Meet Alexa'},
  ],
  'pricing.blackroad.io': [
    {url:'https://blackroad.io/signup',title:'Join Beta',desc:'Get early access'},
    {url:'https://blackroadai.com',title:'AI Platform',desc:'API pricing details'},
    {url:'https://blackroad.io/chat',title:'Free Chat',desc:'Try before you buy'},
    {url:'https://blackroad.company',title:'Enterprise',desc:'Custom plans'},
  ],
};

// Default fallback for any BlackRoad page
var DEFAULT = [
  {url:'https://blackroad.io',title:'Platform',desc:'BlackRoad OS home'},
  {url:'https://db.blackroad.io',title:'Database',desc:'Search everything'},
  {url:'https://agents.blackroad.io',title:'Agents',desc:'Meet the fleet'},
  {url:'https://stats.blackroad.io',title:'Live Stats',desc:'Real-time fleet data'},
];

function init() {
  var host = window.location.hostname;

  // Get relevant links for this page
  var links = PAGES[host] || DEFAULT;

  // Filter out self-links
  links = links.filter(function(l) {
    return l.url.indexOf(host) === -1;
  });

  if (links.length === 0) links = DEFAULT;

  // Find insertion point — before fleet section or before footer
  var fleet = d.getElementById('br-fleet');
  var footer = d.getElementById('br-footer') || d.querySelector('footer');
  var insertBefore = fleet || footer;
  if (!insertBefore) return;

  var section = d.createElement('div');
  section.id = 'br-related';
  section.style.cssText = 'max-width:1200px;margin:0 auto;padding:40px 24px 0';

  var title = d.createElement('div');
  title.style.cssText = 'font-family:"Space Grotesk",system-ui;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#333;margin-bottom:16px';
  title.textContent = 'YOU MIGHT ALSO LIKE';
  section.appendChild(title);

  var grid = d.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px';

  links.forEach(function(l) {
    var card = d.createElement('a');
    card.href = l.url;
    card.style.cssText = 'display:block;padding:16px 20px;border:1px solid #111;border-radius:4px;text-decoration:none;transition:border-color .2s,background .2s';
    card.onmouseover = function(){this.style.borderColor='#333';this.style.background='#0a0a0a'};
    card.onmouseout = function(){this.style.borderColor='#111';this.style.background='transparent'};

    card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:\'Space Grotesk\',system-ui;font-size:13px;color:#f5f5f5;font-weight:500">'+l.title+'</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#444;margin-top:2px">'+l.desc+'</div></div><div style="color:#333;font-size:14px;flex-shrink:0;margin-left:12px">→</div></div>';

    grid.appendChild(card);
  });

  section.appendChild(grid);
  insertBefore.parentNode.insertBefore(section, insertBefore);
}

if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 80);
}

})(document);
