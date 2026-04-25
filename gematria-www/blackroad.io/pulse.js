// BlackRoad OS — Fleet Pulse Component
// Shows live fleet status bar with node health indicators
// Include: <script src="https://blackroad.io/pulse.js" defer></script>
// (c) 2026 BlackRoad OS, Inc.

(function(d){
'use strict';

var STATS_API = 'https://stats.blackroad.io/api/stats';
var NODES = [
  {name:'Alice',role:'Gateway',color:'#FF6B2B',host:'alice'},
  {name:'Cecilia',role:'Voice',color:'#CC00AA',host:'cecilia'},
  {name:'Octavia',role:'Architect',color:'#8844FF',host:'octavia'},
  {name:'Aria',role:'Interface',color:'#4488FF',host:'aria'},
  {name:'Lucidia',role:'Dreamer',color:'#00D4FF',host:'lucidia'},
];

function init() {
  var host = window.location.hostname;
  // Don't show on stats page itself
  if (host === 'stats.blackroad.io') return;

  // Find insertion point — after metrics or after hero
  var metrics = d.querySelector('.metrics');
  var hero = d.querySelector('.hero, .splash, [class*="hero"]');
  var insertAfter = metrics || hero;
  if (!insertAfter) {
    // Fallback: insert after first section or at start of body
    insertAfter = d.querySelector('section') || d.querySelector('.z') || d.body.firstChild;
  }

  var pulse = d.createElement('div');
  pulse.id = 'br-pulse';
  pulse.style.cssText = 'border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:16px 24px;background:#050505';

  var inner = d.createElement('div');
  inner.style.cssText = 'max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap';

  // Label
  var label = d.createElement('div');
  label.style.cssText = 'font-family:"Space Grotesk",system-ui;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#333;flex-shrink:0';
  label.textContent = 'FLEET';
  inner.appendChild(label);

  // Separator
  var sep = d.createElement('div');
  sep.style.cssText = 'width:1px;height:20px;background:#1a1a1a;flex-shrink:0';
  inner.appendChild(sep);

  // Node indicators
  var nodesWrap = d.createElement('div');
  nodesWrap.id = 'br-pulse-nodes';
  nodesWrap.style.cssText = 'display:flex;gap:16px;flex:1;flex-wrap:wrap';

  NODES.forEach(function(n) {
    var node = d.createElement('a');
    node.href = 'https://' + n.host + '.blackroad.io';
    node.style.cssText = 'display:flex;align-items:center;gap:6px;text-decoration:none;transition:opacity .2s';
    node.onmouseover = function(){this.style.opacity='1'};
    node.onmouseout = function(){this.style.opacity='.7'};
    node.style.opacity = '.7';

    var dot = d.createElement('div');
    dot.className = 'br-pulse-dot';
    dot.setAttribute('data-node', n.host);
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#333;transition:background .3s,box-shadow .3s';

    var name = d.createElement('span');
    name.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#444;transition:color .3s';
    name.textContent = n.name;
    name.className = 'br-pulse-name';

    node.appendChild(dot);
    node.appendChild(name);
    nodesWrap.appendChild(node);
  });
  inner.appendChild(nodesWrap);

  // Right side: aggregate stats
  var stats = d.createElement('div');
  stats.id = 'br-pulse-stats';
  stats.style.cssText = 'display:flex;gap:16px;flex-shrink:0';

  var statItems = [
    {id:'pulse-cpu',label:'CPU'},
    {id:'pulse-mem',label:'MEM'},
    {id:'pulse-temp',label:'TEMP'},
  ];

  statItems.forEach(function(s) {
    var item = d.createElement('div');
    item.style.cssText = 'text-align:center';

    var val = d.createElement('div');
    val.id = s.id;
    val.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#333;font-weight:600';
    val.textContent = '--';

    var lbl = d.createElement('div');
    lbl.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:8px;color:#222;letter-spacing:.1em';
    lbl.textContent = s.label;

    item.appendChild(val);
    item.appendChild(lbl);
    stats.appendChild(item);
  });
  inner.appendChild(stats);

  // Live link
  var liveLink = d.createElement('a');
  liveLink.href = 'https://stats.blackroad.io';
  liveLink.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:10px;color:#333;text-decoration:none;transition:color .2s;flex-shrink:0';
  liveLink.textContent = 'LIVE →';
  liveLink.onmouseover = function(){this.style.color='#888'};
  liveLink.onmouseout = function(){this.style.color='#333'};
  inner.appendChild(liveLink);

  pulse.appendChild(inner);

  // Insert
  if (insertAfter && insertAfter.nextSibling) {
    insertAfter.parentNode.insertBefore(pulse, insertAfter.nextSibling);
  } else if (insertAfter && insertAfter.parentNode) {
    insertAfter.parentNode.appendChild(pulse);
  }

  // Fetch stats
  fetchStats();
  // Refresh every 30s
  setInterval(fetchStats, 30000);
}

function fetchStats() {
  fetch(STATS_API, {signal: AbortSignal.timeout(5000)})
    .then(function(r){return r.json()})
    .then(function(data) {
      // Update node dots
      if (data.nodes) {
        NODES.forEach(function(n) {
          var dot = d.querySelector('.br-pulse-dot[data-node="'+n.host+'"]');
          if (!dot) return;
          var nodeData = data.nodes[n.host];
          var isUp = nodeData && nodeData.online;
          dot.style.background = isUp ? n.color : '#333';
          dot.style.boxShadow = isUp ? '0 0 6px '+n.color : 'none';
          var nameEl = dot.nextSibling;
          if (nameEl) nameEl.style.color = isUp ? '#888' : '#333';
        });
      }

      // Update aggregate stats
      var cpuEl = d.getElementById('pulse-cpu');
      var memEl = d.getElementById('pulse-mem');
      var tempEl = d.getElementById('pulse-temp');

      if (data.cpu_avg != null && cpuEl) {
        cpuEl.textContent = Math.round(data.cpu_avg) + '%';
        cpuEl.style.color = data.cpu_avg > 80 ? '#FF2255' : data.cpu_avg > 50 ? '#FF6B2B' : '#444';
      }
      if (data.mem_avg != null && memEl) {
        memEl.textContent = Math.round(data.mem_avg) + '%';
        memEl.style.color = data.mem_avg > 80 ? '#FF2255' : data.mem_avg > 50 ? '#FF6B2B' : '#444';
      }
      if (data.temp_avg != null && tempEl) {
        tempEl.textContent = Math.round(data.temp_avg) + '°';
        tempEl.style.color = data.temp_avg > 70 ? '#FF2255' : data.temp_avg > 55 ? '#FF6B2B' : '#444';
      }
    })
    .catch(function() {
      // Silently fail — pulse just shows dashes
    });
}

// Responsive styles
var ms = d.createElement('style');
ms.textContent = '@media(max-width:600px){#br-pulse-stats{display:none!important}#br-pulse-nodes{gap:10px!important}}';
d.head.appendChild(ms);

if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}

})(document);
