// BlackRoad OS — Embedded Search Component
// Adds a floating search button that opens a full-screen search overlay
// Searches db.blackroad.io in real-time
// Include: <script src="https://blackroad.io/search.js" defer></script>
// (c) 2026 BlackRoad OS, Inc.

(function(d,w){
'use strict';

var API = 'https://db.blackroad.io/api/search';
var ICONS = {repos:'R',agents:'A',domains:'D',models:'M',workers:'W',scripts:'S'};
var timer = null;

function init() {
  // FAB button
  var fab = d.createElement('button');
  fab.id = 'br-search-fab';
  fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
  fab.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9990;width:48px;height:48px;border-radius:50%;border:1px solid #333;background:#111;color:#888;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,.5)';
  fab.onmouseover = function(){this.style.borderColor='#666';this.style.color='#fff'};
  fab.onmouseout = function(){this.style.borderColor='#333';this.style.color='#888'};
  fab.onclick = openSearch;
  d.body.appendChild(fab);

  // Keyboard shortcut: / to open, Esc to close
  d.addEventListener('keydown', function(e) {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && d.activeElement.tagName !== 'INPUT' && d.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });

  // Overlay
  var overlay = d.createElement('div');
  overlay.id = 'br-search-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);display:none;flex-direction:column;align-items:center;padding:80px 24px 40px;overflow-y:auto';
  overlay.onclick = function(e){if(e.target===overlay)closeSearch()};

  var container = d.createElement('div');
  container.style.cssText = 'width:100%;max-width:640px';

  // Search input
  var inputWrap = d.createElement('div');
  inputWrap.style.cssText = 'position:relative;margin-bottom:24px';

  var input = d.createElement('input');
  input.id = 'br-search-input';
  input.type = 'text';
  input.placeholder = 'Search everything... (press / anywhere)';
  input.style.cssText = 'width:100%;padding:16px 20px 16px 48px;background:#111;border:1px solid #333;border-radius:4px;color:#f5f5f5;font-family:"JetBrains Mono",monospace;font-size:15px;outline:none;transition:border-color .2s';
  input.onfocus = function(){this.style.borderColor='#666'};
  input.onblur = function(){this.style.borderColor='#333'};
  input.oninput = function(){
    clearTimeout(timer);
    timer = setTimeout(function(){doSearch(input.value)}, 200);
  };

  var icon = d.createElement('div');
  icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
  icon.style.cssText = 'position:absolute;left:16px;top:50%;transform:translateY(-50%)';
  inputWrap.appendChild(icon);
  inputWrap.appendChild(input);
  container.appendChild(inputWrap);

  // Hint
  var hint = d.createElement('div');
  hint.id = 'br-search-hint';
  hint.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:#444;margin-bottom:20px;text-align:center';
  hint.textContent = '56 items indexed \u2022 repos \u2022 agents \u2022 domains \u2022 models \u2022 workers \u2022 scripts';
  container.appendChild(hint);

  // Results container
  var results = d.createElement('div');
  results.id = 'br-search-results';
  container.appendChild(results);

  // Quick links when empty
  var quick = d.createElement('div');
  quick.id = 'br-search-quick';
  quick.style.cssText = 'margin-top:16px';
  quick.innerHTML = '<div style="font-family:\'Space Grotesk\',system-ui;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#444;margin-bottom:12px">QUICK LINKS</div>';

  var quickLinks = [
    ['https://blackroad.io','Platform'],['https://blackroadai.com','AI'],['https://lucidia.earth','Lucidia'],
    ['https://db.blackroad.io','Database'],['https://agents.blackroad.io','Agents'],['https://stats.blackroad.io','Live Stats'],
    ['https://chat.blackroad.io','Chat'],['https://index.blackroad.io','Code Index'],['https://showcase.blackroad.io','Showcase'],
    ['https://mesh.blackroad.io','Mesh'],['https://roadchain.io','Chain'],['https://blackroadquantum.com','Quantum'],
    ['https://wiki.blackroad.io','Wiki'],['https://github.com/blackboxprogramming','GitHub'],['https://brand.blackroad.io','Brand'],
  ];

  var qg = d.createElement('div');
  qg.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
  quickLinks.forEach(function(l){
    var a = d.createElement('a');
    a.href = l[0];
    a.textContent = l[1];
    a.style.cssText = 'padding:6px 14px;border:1px solid #1a1a1a;border-radius:4px;font-family:"JetBrains Mono",monospace;font-size:12px;color:#555;text-decoration:none;transition:all .2s;background:#0a0a0a';
    a.onmouseover = function(){this.style.borderColor='#444';this.style.color='#f5f5f5'};
    a.onmouseout = function(){this.style.borderColor='#1a1a1a';this.style.color='#555'};
    qg.appendChild(a);
  });
  quick.appendChild(qg);

  // Agent cards
  var agentSection = d.createElement('div');
  agentSection.style.cssText = 'margin-top:24px';
  agentSection.innerHTML = '<div style="font-family:\'Space Grotesk\',system-ui;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#444;margin-bottom:12px">FLEET AGENTS</div>';

  var agents = [
    {n:'Alice',c:'#FF6B2B',r:'The Operator',u:'https://alice.blackroad.io'},
    {n:'Cecilia',c:'#CC00AA',r:'The Voice',u:'https://cecilia.blackroad.io'},
    {n:'Octavia',c:'#8844FF',r:'The Architect',u:'https://octavia.blackroad.io'},
    {n:'Lucidia',c:'#00D4FF',r:'The Dreamer',u:'https://lucidia.blackroad.io'},
    {n:'Aria',c:'#4488FF',r:'The Interface',u:'https://aria.blackroad.io'},
    {n:'Shellfish',c:'#FF2255',r:'The Hacker',u:'https://shellfish.blackroad.io'},
  ];

  var ag = d.createElement('div');
  ag.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px';
  agents.forEach(function(a){
    var card = d.createElement('a');
    card.href = a.u;
    card.style.cssText = 'display:block;padding:12px;border:1px solid #1a1a1a;border-radius:4px;text-decoration:none;transition:all .2s;background:#0a0a0a';
    card.onmouseover = function(){this.style.borderColor=a.c};
    card.onmouseout = function(){this.style.borderColor='#1a1a1a'};
    card.innerHTML = '<div style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;color:#f5f5f5;font-weight:600">'+a.n+'</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#888">'+a.r+'</div>';
    ag.appendChild(card);
  });
  agentSection.appendChild(ag);
  quick.appendChild(agentSection);

  container.appendChild(quick);
  overlay.appendChild(container);
  d.body.appendChild(overlay);

  // Close button
  var close = d.createElement('button');
  close.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  close.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9996;background:none;border:none;color:#555;cursor:pointer;padding:8px';
  close.onclick = closeSearch;
  overlay.appendChild(close);

  // ESC hint
  var esc = d.createElement('div');
  esc.style.cssText = 'position:fixed;top:28px;left:24px;z-index:9996;font-family:"JetBrains Mono",monospace;font-size:11px;color:#333';
  esc.innerHTML = '<kbd style="padding:2px 6px;border:1px solid #333;border-radius:4px;font-size:10px">ESC</kbd> to close';
  overlay.appendChild(esc);
}

function openSearch() {
  var o = d.getElementById('br-search-overlay');
  o.style.display = 'flex';
  setTimeout(function(){d.getElementById('br-search-input').focus()},100);
  d.body.style.overflow = 'hidden';
}

function closeSearch() {
  var o = d.getElementById('br-search-overlay');
  if (o) {
    o.style.display = 'none';
    d.body.style.overflow = '';
  }
}

function doSearch(q) {
  q = q.trim();
  var results = d.getElementById('br-search-results');
  var quick = d.getElementById('br-search-quick');

  if (!q) {
    results.innerHTML = '';
    if (quick) quick.style.display = '';
    return;
  }

  if (quick) quick.style.display = 'none';

  fetch(API + '?q=' + encodeURIComponent(q) + '&limit=20')
    .then(function(r){return r.json()})
    .then(function(data){
      if (!data.results || data.results.length === 0) {
        results.innerHTML = '<div style="text-align:center;padding:40px;color:#444;font-family:\'JetBrains Mono\',monospace;font-size:13px">No results for "'+q+'"<br><a href="https://db.blackroad.io?q='+encodeURIComponent(q)+'" style="color:#666;font-size:12px">Try full search \u2192</a></div>';
        return;
      }

      var html = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#444;margin-bottom:12px">'+data.total+' results</div>';

      data.results.forEach(function(item){
        var icon = ICONS[item.type] || 'X';
        html += '<a href="'+(item.url||'#')+'" style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid #1a1a1a;border-radius:4px;margin-bottom:8px;text-decoration:none;transition:all .15s;background:#0a0a0a" onmouseover="this.style.borderColor=\'#444\';this.style.background=\'#111\'" onmouseout="this.style.borderColor=\'#1a1a1a\';this.style.background=\'#0a0a0a\'">'
          + '<div style="font-size:12px;flex-shrink:0;margin-top:4px;width:24px;height:24px;border:1px solid #333;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:\'JetBrains Mono\',monospace;color:#888">'+icon+'</div>'
          + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-family:\'Space Grotesk\',system-ui;font-size:14px;color:#f5f5f5;font-weight:600">'+item.name+'</span><span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#444;padding:2px 8px;border:1px solid #222;border-radius:4px">'+item.type+'</span></div>'
          + '<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:#555;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+item.description+'</div>'
          + '</div>'
          + '<div style="color:#333;font-size:14px;flex-shrink:0">\u2192</div>'
          + '</a>';
      });

      if (data.total > 20) {
        html += '<div style="text-align:center;margin-top:12px"><a href="https://db.blackroad.io?q='+encodeURIComponent(q)+'" style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:#666;text-decoration:none">View all '+data.total+' results \u2192</a></div>';
      }

      results.innerHTML = html;
    })
    .catch(function(){
      results.innerHTML = '<div style="text-align:center;padding:20px;color:#444;font-family:\'JetBrains Mono\',monospace;font-size:12px">Search unavailable</div>';
    });
}

if (d.readyState === 'loading') {
  d.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})(document,window);
