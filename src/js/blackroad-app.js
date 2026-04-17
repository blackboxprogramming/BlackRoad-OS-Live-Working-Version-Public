// blackroad-app.js — Shared runtime for all BlackRoad product apps
// Adds: localStorage persistence, Ollama chat, agent identity, nav, interactivity
// Include this in any mockup to make it a working app.

(function() {
  'use strict';

  // Agent assignment — which agent hosts which product
  var AGENT_MAP = {
    'roadie':{agent:'roadie',name:'Roadie',role:'Your AI tutor'},'roadtrip':{agent:'roadie',name:'Roadie',role:'Agent convoy host'},
    'backroad':{agent:'sophia',name:'Sophia',role:'Social wisdom'},'blackboard':{agent:'calliope',name:'Calliope',role:'Creative instructor'},
    'roadwork':{agent:'octavia',name:'Octavia',role:'Task orchestrator'},'roadcode':{agent:'silas',name:'Silas',role:'Code reviewer'},
    'roadview':{agent:'olympia',name:'Olympia',role:'Search commander'},'roadbook':{agent:'lucidia',name:'Lucidia',role:'Memory publisher'},
    'officeroad':{agent:'aria',name:'Aria',role:'Office coordinator'},'carpool':{agent:'elias',name:'Elias',role:'Model router'},
    'carkeys':{agent:'celeste',name:'Celeste',role:'Vault guardian'},'roadside':{agent:'thalia',name:'Thalia',role:'Support guide'},
    'oneway':{agent:'valeria',name:'Valeria',role:'Export enforcer'},'roadchain':{agent:'cicero',name:'Cicero',role:'Ledger keeper'},
    'roadcoin':{agent:'atticus',name:'Atticus',role:'Token auditor'},'roadworld':{agent:'gaia',name:'Gaia',role:'World builder'},
    'roadpay':{agent:'atticus',name:'Atticus',role:'Payment auditor'},'highway':{agent:'gematria',name:'Gematria',role:'Analytics'},
    'blackroad-os':{agent:'roadie',name:'Roadie',role:'System host'},
    'roadtube':{agent:'sebastian',name:'Sebastian',role:'Video curator'},'roadflix':{agent:'seraphina',name:'Seraphina',role:'Film director'},
    'roadradio':{agent:'lyra',name:'Lyra',role:'Audio curator'},'roadpulse':{agent:'thalia',name:'Thalia',role:'Social spark'},
    'roadgram':{agent:'sapphira',name:'Sapphira',role:'Visual curator'},'roadnet':{agent:'sebastian',name:'Sebastian',role:'Network host'},
    'roadsnap':{agent:'thalia',name:'Thalia',role:'Stories host'},'roadclips':{agent:'seraphina',name:'Seraphina',role:'Short form'},
    'roadnotes':{agent:'alexandria',name:'Alexandria',role:'Knowledge keeper'},'roadkanban':{agent:'octavia',name:'Octavia',role:'Board manager'},
    'roadboard':{agent:'calliope',name:'Calliope',role:'Whiteboard host'},'roaddrive':{agent:'lucidia',name:'Lucidia',role:'File memory'},
    'roadlinear':{agent:'silas',name:'Silas',role:'Project tracker'},'roadtasks':{agent:'octavia',name:'Octavia',role:'Task runner'},
    'roadschool':{agent:'elias',name:'Elias',role:'Teacher'},'roadcast':{agent:'aria',name:'Aria',role:'Recorder'},
    'roadship':{agent:'gaia',name:'Gaia',role:'Deploy master'},'roaddeploy':{agent:'gaia',name:'Gaia',role:'CI/CD'},
    'roadchat':{agent:'roadie',name:'Roadie',role:'Chat host'},'roadim':{agent:'aria',name:'Aria',role:'Messenger'},
    'roaddb':{agent:'gematria',name:'Gematria',role:'Data explorer'},'roadapi':{agent:'silas',name:'Silas',role:'API guide'},
    'roadamp':{agent:'gematria',name:'Gematria',role:'Analytics'},'roadarcade':{agent:'thalia',name:'Thalia',role:'Game host'},
    'roadid':{agent:'valeria',name:'Valeria',role:'Identity guard'},'roadphone':{agent:'aria',name:'Aria',role:'Mobile voice'},
    'roadspace':{agent:'ophelia',name:'Ophelia',role:'Profile depth'},'roadstock':{agent:'atticus',name:'Atticus',role:'Market auditor'},
    'roadweather':{agent:'gaia',name:'Gaia',role:'Weather monitor'},
    'roadnapster':{agent:'lyra',name:'Lyra',role:'Retro DJ'},'roadmsn':{agent:'alice',name:'Alice',role:'Retro chat'},
    'roadlimewire':{agent:'lyra',name:'Lyra',role:'Retro P2P'}
  };

  const BR = window.BR = {
    version: '2.0.0',
    appName: document.title || 'BlackRoad',
    api: 'http://192.168.4.113:8089',
    scheduler: 'https://network-scheduler.blackroad.workers.dev',

    // ── Storage ──
    store: {
      get(key, fallback) {
        try { const v = localStorage.getItem('br.' + key); return v ? JSON.parse(v) : fallback; }
        catch(e) { return fallback; }
      },
      set(key, val) { localStorage.setItem('br.' + key, JSON.stringify(val)); },
      push(key, item, max) {
        const arr = BR.store.get(key, []);
        arr.unshift(item);
        if (max && arr.length > max) arr.length = max;
        BR.store.set(key, arr);
        return arr;
      },
      remove(key) { localStorage.removeItem('br.' + key); }
    },

    // ── Chat (connects to Product API on Cecilia) ──
    chat: async function(message, agent) {
      agent = agent || 'roadie';
      var product = BR.appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      try {
        var resp = await fetch(BR.api + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent: agent, message: message, product: product })
        });
        if (resp.ok) {
          var data = await resp.json();
          return data.response || '';
        }
      } catch(e) {}
      return "Agent offline. Connect to BlackRoad local network for AI features.";
    },

    // ── Server-side items (syncs to Cecilia SQLite) ──
    serverItems: {
      async list(product) {
        try {
          var r = await fetch(BR.api + '/items/' + product);
          return (await r.json()).items || [];
        } catch(e) { return []; }
      },
      async add(product, data) {
        try {
          await fetch(BR.api + '/items/' + product, {
            method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ data: data })
          });
        } catch(e) {}
      },
      async search(q) {
        try {
          var r = await fetch(BR.api + '/search?q=' + encodeURIComponent(q));
          return (await r.json()).results || [];
        } catch(e) { return []; }
      }
    },

    // ── Tasks / Items (generic CRUD) ──
    items: {
      list(collection) { return BR.store.get(collection, []); },
      add(collection, item) {
        item.id = item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        item.created = item.created || new Date().toISOString();
        return BR.store.push(collection, item, 500);
      },
      remove(collection, id) {
        const items = BR.store.get(collection, []).filter(i => i.id !== id);
        BR.store.set(collection, items);
        return items;
      },
      update(collection, id, updates) {
        const items = BR.store.get(collection, []).map(i =>
          i.id === id ? { ...i, ...updates, updated: new Date().toISOString() } : i
        );
        BR.store.set(collection, items);
        return items;
      }
    },

    // ── Toast notifications ──
    toast(msg, duration) {
      duration = duration || 3000;
      let el = document.getElementById('br-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'br-toast';
        el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a1a;color:#d4d4d4;padding:12px 20px;border-radius:8px;font-family:system-ui;font-size:13px;z-index:99999;opacity:0;transition:opacity .3s;border:1px solid #333;';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      clearTimeout(el._timer);
      el._timer = setTimeout(() => el.style.opacity = '0', duration);
    },

    // ── Make inputs work ──
    activateInputs() {
      // Find all input/textarea elements and make them editable
      document.querySelectorAll('input, textarea').forEach(el => {
        el.removeAttribute('disabled');
        el.removeAttribute('readonly');
      });

      // Find send buttons and wire them to chat
      document.querySelectorAll('[class*="send"], [class*="submit"], button').forEach(btn => {
        if (btn._brWired) return;
        btn._brWired = true;
        btn.addEventListener('click', async function(e) {
          const form = btn.closest('form, [class*="input"], [class*="compose"], [class*="chat"]');
          const input = form ? form.querySelector('input, textarea') : document.querySelector('input, textarea');
          if (!input || !input.value.trim()) return;

          const msg = input.value.trim();
          input.value = '';

          // Find message container
          const container = document.querySelector('[class*="messages"], [class*="chat-body"], [class*="feed"], [class*="content"], main');
          if (container) {
            // Add user message
            const userDiv = document.createElement('div');
            userDiv.style.cssText = 'padding:12px 16px;margin:8px 0;background:#111;border-radius:8px;border:1px solid #222;color:#d4d4d4;font-size:14px;';
            userDiv.textContent = msg;
            container.appendChild(userDiv);

            // Get AI response
            const response = await BR.chat(msg);

            // Add AI message
            const aiDiv = document.createElement('div');
            aiDiv.style.cssText = 'padding:12px 16px;margin:8px 0;background:#0a0a0a;border-radius:8px;border:1px solid #191919;color:#999;font-size:14px;';
            aiDiv.textContent = response;
            container.appendChild(aiDiv);

            container.scrollTop = container.scrollHeight;
          }

          BR.store.push('chat_history', { msg, agent: 'roadie', ts: Date.now() }, 100);
        });
      });
    },

    // ── Make lists interactive (add/remove items) ──
    activateLists() {
      document.querySelectorAll('[class*="list"], [class*="board"], [class*="feed"], [class*="grid"]').forEach(list => {
        if (list._brWired) return;
        list._brWired = true;

        // Make items clickable
        list.querySelectorAll('[class*="item"], [class*="card"], [class*="row"], [class*="post"]').forEach(item => {
          item.style.cursor = 'pointer';
          item.addEventListener('click', function() {
            // Toggle selected state
            if (item.style.borderColor === 'rgb(153, 153, 153)') {
              item.style.borderColor = '#191919';
            } else {
              item.style.borderColor = '#999';
            }
          });
        });
      });
    },

    // ── Make everything contenteditable where appropriate ──
    activateEditing() {
      document.querySelectorAll('[class*="body"], [class*="content"], [class*="editor"], [class*="note"]').forEach(el => {
        if (el.tagName === 'IFRAME' || el.tagName === 'VIDEO' || el.tagName === 'IMG') return;
        if (el.querySelector('input, textarea, button, video, iframe')) return;
        el.setAttribute('contenteditable', 'true');
        el.style.outline = 'none';
      });
    },

    // ── Resolve agent for this product ──
    getAgent() {
      var slug = BR.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      // Try matching by slug, then by partial match
      if (AGENT_MAP[slug]) return AGENT_MAP[slug];
      for (var k in AGENT_MAP) { if (slug.indexOf(k) >= 0 || k.indexOf(slug) >= 0) return AGENT_MAP[k]; }
      return {agent:'roadie', name:'Roadie', role:'Assistant'};
    },

    // ── Add BlackRoad nav bar with agent ──
    addNav() {
      if (document.getElementById('br-nav')) return;
      var a = BR.getAgent();
      var nav = document.createElement('div');
      nav.id = 'br-nav';
      nav.style.cssText = 'position:fixed;top:0;left:0;right:0;height:36px;background:#000;border-bottom:1px solid #191919;display:flex;align-items:center;padding:0 16px;gap:12px;z-index:99998;font-family:system-ui;';
      nav.innerHTML =
        '<span style="display:flex;gap:3px">' +
        '<span style="width:5px;height:5px;border-radius:50%;background:#aaa"></span>' +
        '<span style="width:5px;height:5px;border-radius:50%;background:#888"></span>' +
        '<span style="width:5px;height:5px;border-radius:50%;background:#666"></span></span>' +
        '<a href="https://os.blackroad.io" style="color:#d4d4d4!important;font-size:13px;font-weight:700;text-decoration:none">BlackRoad</a>' +
        '<span style="color:#333;font-size:12px">/</span>' +
        '<span style="color:#777;font-size:12px">' + BR.appName + '</span>' +
        '<span style="color:#333;font-size:10px;margin-left:4px">hosted by</span>' +
        '<span style="color:#999;font-size:11px;font-weight:600">' + a.name + '</span>' +
        '<span style="color:#444;font-size:10px">' + a.role + '</span>' +
        '<a href="https://os.blackroad.io/live" style="margin-left:auto;color:#555!important;font-size:11px;text-decoration:none">Live</a>';
      document.body.prepend(nav);
      document.body.style.paddingTop = '36px';
    },

    // ── Add agent chat widget (bottom right) ──
    addChatWidget() {
      if (document.getElementById('br-chat-widget')) return;
      var a = BR.getAgent();
      var w = document.createElement('div');
      w.id = 'br-chat-widget';
      w.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99997;font-family:system-ui;';
      w.innerHTML =
        '<div id="br-chat-panel" style="display:none;width:320px;height:400px;background:#0a0a0a;border:1px solid #222;border-radius:12px;overflow:hidden;flex-direction:column;margin-bottom:8px">' +
          '<div style="padding:10px 14px;border-bottom:1px solid #191919;display:flex;align-items:center;gap:8px">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:#888"></span>' +
            '<span style="color:#d4d4d4;font-size:13px;font-weight:600">' + a.name + '</span>' +
            '<span style="color:#444;font-size:11px">' + a.role + '</span>' +
            '<span onclick="document.getElementById(\'br-chat-panel\').style.display=\'none\'" style="margin-left:auto;color:#555;cursor:pointer;font-size:16px">×</span>' +
          '</div>' +
          '<div id="br-chat-messages" style="flex:1;overflow-y:auto;padding:12px;min-height:280px"></div>' +
          '<div style="padding:8px;border-top:1px solid #191919;display:flex;gap:6px">' +
            '<input id="br-chat-input" type="text" placeholder="Ask ' + a.name + '..." style="flex:1;background:#111;border:1px solid #222;color:#d4d4d4;padding:8px 12px;border-radius:6px;font-size:13px;outline:none">' +
            '<button id="br-chat-send" style="background:#1a1a1a;border:1px solid #333;color:#999;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:12px">Send</button>' +
          '</div>' +
        '</div>' +
        '<button id="br-chat-toggle" style="width:48px;height:48px;border-radius:50%;background:#111;border:1px solid #333;color:#999;font-size:20px;cursor:pointer;float:right" title="Chat with ' + a.name + '">●</button>';
      document.body.appendChild(w);

      document.getElementById('br-chat-toggle').onclick = function() {
        var panel = document.getElementById('br-chat-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      };

      var sendMsg = async function() {
        var input = document.getElementById('br-chat-input');
        var msg = input.value.trim();
        if (!msg) return;
        input.value = '';
        var msgs = document.getElementById('br-chat-messages');
        msgs.innerHTML += '<div style="padding:8px 12px;margin:4px 0;background:#111;border-radius:6px;color:#d4d4d4;font-size:13px">' + msg + '</div>';
        msgs.scrollTop = msgs.scrollHeight;
        var response = await BR.chat(msg, a.agent);
        msgs.innerHTML += '<div style="padding:8px 12px;margin:4px 0;background:#0a0a0a;border:1px solid #191919;border-radius:6px;color:#888;font-size:13px">' + response + '</div>';
        msgs.scrollTop = msgs.scrollHeight;
      };

      document.getElementById('br-chat-send').onclick = sendMsg;
      document.getElementById('br-chat-input').onkeydown = function(e) { if (e.key === 'Enter') sendMsg(); };
    },

    // ── Analytics ──
    track(type, data) {
      var event = Object.assign({
        type: type,
        page: location.pathname,
        product: BR.appName,
        referrer: document.referrer || 'direct',
        device: /Mobile|iPhone|iPad|Android/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        ts: Date.now()
      }, data || {});
      fetch(BR.ollama + '/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(function(){});
    },

    // ── Boot ──
    init() {
      var a = BR.getAgent();
      BR.addNav();
      BR.addChatWidget();
      BR.activateInputs();
      BR.activateLists();
      BR.activateEditing();
      BR.toast(a.name + ' — ' + a.role + ' — online');

      // Track visit + page view
      fetch(BR.ollama + '/visit').catch(function(){});
      BR.track('page_view');
      BR.track('product_visit', { product: BR.appName.toLowerCase().replace(/[^a-z0-9]/g, '-') });

      // Track audio/video plays
      document.querySelectorAll('audio, video').forEach(function(el) {
        el.addEventListener('play', function() {
          var src = el.querySelector('source') ? el.querySelector('source').src : el.src;
          var id = src.split('/').pop().replace(/\.\w+$/, '');
          BR.track(el.tagName === 'AUDIO' ? 'podcast_play' : 'video_play', { id: id });
        });
      });

      // Track outbound links
      document.addEventListener('click', function(e) {
        var a = e.target.closest('a[href]');
        if (a && a.hostname !== location.hostname) {
          BR.track('outbound_click', { url: a.href });
        }
      });
    }
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BR.init);
  } else {
    BR.init();
  }
})();
