// BlackRoad OS — Fleet Cross-Links Component
// Auto-injects "Meet the Fleet" agent cards + contextual links
// Include: <script src="https://blackroad.io/fleet.js" defer></script>
// (c) 2026 BlackRoad OS, Inc.

(function(d){
'use strict';

var AGENTS = [
  {name:'Alice',role:'The Operator',color:'#FF6B2B',url:'https://alice.blackroad.io',icon:'O',desc:'Gateway, DNS, deployments'},
  {name:'Cecilia',role:'The Voice',color:'#CC00AA',url:'https://cecilia.blackroad.io',icon:'V',desc:'TTS, personality, CECE engine'},
  {name:'Octavia',role:'The Architect',color:'#8844FF',url:'https://octavia.blackroad.io',icon:'A',desc:'Gitea, Swarm, orchestration'},
  {name:'Lucidia',role:'The Dreamer',color:'#00D4FF',url:'https://lucidia.blackroad.io',icon:'D',desc:'Memory, cognition, metaverse'},
  {name:'Aria',role:'The Interface',color:'#4488FF',url:'https://aria.blackroad.io',icon:'I',desc:'Portainer, Headscale, UX'},
  {name:'Shellfish',role:'The Hacker',color:'#FF2255',url:'https://shellfish.blackroad.io',icon:'H',desc:'Security, scanning, audits'},
];

var EXPLORE = [
  {label:'Search Everything',url:'https://db.blackroad.io',desc:'Full-text search across the entire ecosystem'},
  {label:'Live Fleet Stats',url:'https://stats.blackroad.io',desc:'Real-time CPU, memory, temps from all nodes'},
  {label:'AI Chat (Free)',url:'https://chat.blackroad.io',desc:'Talk to fleet models — llama, qwen, deepseek'},
  {label:'Code Index',url:'https://index.blackroad.io',desc:'354 repos, 2,524 files searchable'},
  {label:'Agent Showcase',url:'https://showcase.blackroad.io',desc:'Watch agents generate art in real-time'},
  {label:'Mesh Network',url:'https://mesh.blackroad.io',desc:'WebRTC peer-to-peer inference routing'},
  {label:'Soul Chain',url:'https://roadchain.io',desc:'Distributed identity and verification'},
  {label:'Quantum Lab',url:'https://blackroadquantum.com',desc:'Mathematical proofs and simulations'},
];

var host = window.location.hostname;

function init() {
  // Don't inject on main blackroad.io or pages that already have rich content
  var isAgentPage = host.match(/^(alice|cecilia|octavia|lucidia|aria|shellfish)\./);
  var isAgentsIndex = host === 'agents.blackroad.io';

  // Find insertion point — before footer or before consent
  var footer = d.getElementById('br-footer');
  var insertBefore = footer || d.querySelector('footer');
  if (!insertBefore) return;

  // === FLEET SECTION ===
  var section = d.createElement('div');
  section.id = 'br-fleet';
  section.style.cssText = 'max-width:1200px;margin:0 auto;padding:55px 24px';

  // Title
  var title = d.createElement('div');
  title.style.cssText = 'font-family:"Space Grotesk",system-ui;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#555;margin-bottom:24px';
  title.textContent = isAgentPage ? 'MEET THE FLEET' : 'EXPLORE THE ECOSYSTEM';
  section.appendChild(title);

  // Agent cards (show on agent pages)
  if (isAgentPage || isAgentsIndex) {
    var agentGrid = d.createElement('div');
    agentGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:32px';

    AGENTS.forEach(function(a) {
      var isSelf = a.url.indexOf(host) !== -1;
      if (isSelf) return; // Skip current agent

      var card = d.createElement('a');
      card.href = a.url;
      card.style.cssText = 'display:block;padding:16px;border:1px solid #1a1a1a;border-radius:4px;background:#0a0a0a;text-decoration:none;transition:border-color .2s,transform .2s';
      card.onmouseover = function(){this.style.borderColor=a.color;this.style.transform='translateY(-2px)'};
      card.onmouseout = function(){this.style.borderColor='#1a1a1a';this.style.transform='none'};

      card.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:28px;height:28px;border-radius:50%;border:1.5px solid '+a.color+';display:flex;align-items:center;justify-content:center;font-size:11px;color:#f5f5f5;font-family:\'JetBrains Mono\',monospace">'+a.name[0]+'</div><div style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:600;color:#f5f5f5">'+a.name+'</div></div><div style="font-size:11px;color:#888;font-family:\'JetBrains Mono\',monospace;margin-bottom:4px">'+a.role+'</div><div style="font-size:11px;color:#555;font-family:\'JetBrains Mono\',monospace">'+a.desc+'</div>';

      agentGrid.appendChild(card);
    });
    section.appendChild(agentGrid);

    // "View all agents" link
    if (isAgentPage) {
      var allLink = d.createElement('a');
      allLink.href = 'https://agents.blackroad.io';
      allLink.textContent = 'View all agents →';
      allLink.style.cssText = 'display:inline-block;font-family:"JetBrains Mono",monospace;font-size:12px;color:#555;text-decoration:none;margin-bottom:32px;transition:color .2s';
      allLink.onmouseover = function(){this.style.color='#f5f5f5'};
      allLink.onmouseout = function(){this.style.color='#555'};
      section.appendChild(allLink);
    }
  }

  // Explore links (show on all pages)
  var exploreTitle = d.createElement('div');
  exploreTitle.style.cssText = 'font-family:"Space Grotesk",system-ui;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#555;margin-bottom:16px;margin-top:'+(isAgentPage?'24px':'0');
  exploreTitle.textContent = 'GO DEEPER';
  section.appendChild(exploreTitle);

  var exploreGrid = d.createElement('div');
  exploreGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px';

  EXPLORE.forEach(function(e) {
    var isSelf = e.url.indexOf(host) !== -1;
    if (isSelf) return;

    var link = d.createElement('a');
    link.href = e.url;
    link.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid #111;border-radius:4px;text-decoration:none;transition:border-color .2s,background .2s';
    link.onmouseover = function(){this.style.borderColor='#333';this.style.background='#0a0a0a'};
    link.onmouseout = function(){this.style.borderColor='#111';this.style.background='transparent'};

    link.innerHTML = '<div style="flex:1"><div style="font-family:\'Space Grotesk\',system-ui;font-size:13px;color:#f5f5f5;font-weight:500">'+e.label+'</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#444;margin-top:2px">'+e.desc+'</div></div><div style="color:#333;font-size:14px">→</div>';

    exploreGrid.appendChild(link);
  });
  section.appendChild(exploreGrid);

  // Wiki + directory links
  var wikiRow = d.createElement('div');
  wikiRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:24px;padding-top:20px;border-top:1px solid #111';

  var extras = [
    ['https://wiki.blackroad.io', 'Wiki'],
    ['https://directory.blackroad.io', 'Directory'],
    ['https://brand.blackroad.io', 'Brand Kit'],
    ['https://pricing.blackroad.io', 'Pricing'],
    ['https://alexa.blackroad.io', 'Meet Alexa'],
    ['https://lucidia.earth', 'lucidia.earth'],
    ['https://blackroadai.com', 'blackroadai.com'],
    ['https://blackroad.io', 'blackroad.io'],
  ];

  extras.forEach(function(e) {
    if (e[0].indexOf(host) !== -1) return;
    var a = d.createElement('a');
    a.href = e[0];
    a.textContent = e[1];
    a.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#333;text-decoration:none;transition:color .2s';
    a.onmouseover = function(){this.style.color='#888'};
    a.onmouseout = function(){this.style.color='#333'};
    wikiRow.appendChild(a);
  });
  section.appendChild(wikiRow);

  // Responsive
  var ms = d.createElement('style');
  ms.textContent = '@media(max-width:600px){#br-fleet>div:nth-child(2){grid-template-columns:1fr!important}}';
  d.head.appendChild(ms);

  insertBefore.parentNode.insertBefore(section, insertBefore);
}

if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', init);
} else {
  // Small delay to ensure footer.js has run first
  setTimeout(init, 50);
}

})(document);
