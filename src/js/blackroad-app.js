// blackroad-app.js — Shared runtime for all BlackRoad product apps
// Adds: localStorage persistence, Ollama chat, agent identity, nav, interactivity
// Include this in any mockup to make it a working app.

(function() {
  'use strict';

  const BR = window.BR = {
    version: '1.0.0',
    appName: document.title || 'BlackRoad',
    ollama: 'https://network-scheduler.blackroad.workers.dev',

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

    // ── Chat (connects to Ollama via Cecilia or scheduler) ──
    chat: async function(message, agent) {
      agent = agent || 'roadie';
      const ollamaUrls = [
        'http://192.168.4.113:11434/api/generate', // Cecilia
        'http://localhost:11434/api/generate',       // Local
      ];
      for (const url of ollamaUrls) {
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: agent, prompt: message, stream: false, options: { num_predict: 500 } })
          });
          if (resp.ok) {
            const data = await resp.json();
            return data.response || '';
          }
        } catch(e) { continue; }
      }
      // Fallback: return a canned response
      return "I'm currently offline. The Ollama fleet isn't reachable from your browser. Try again when connected to the local network.";
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

    // ── Add BlackRoad nav bar ──
    addNav() {
      if (document.getElementById('br-nav')) return;
      const nav = document.createElement('div');
      nav.id = 'br-nav';
      nav.style.cssText = 'position:fixed;top:0;left:0;right:0;height:36px;background:#000;border-bottom:1px solid #191919;display:flex;align-items:center;padding:0 16px;gap:12px;z-index:99998;font-family:system-ui;';
      nav.innerHTML = `
        <span style="display:flex;gap:3px">
          <span style="width:5px;height:5px;border-radius:50%;background:#aaa"></span>
          <span style="width:5px;height:5px;border-radius:50%;background:#888"></span>
          <span style="width:5px;height:5px;border-radius:50%;background:#666"></span>
        </span>
        <a href="https://os.blackroad.io" style="color:#d4d4d4!important;font-size:13px;font-weight:700;text-decoration:none">BlackRoad</a>
        <span style="color:#333;font-size:12px">/</span>
        <span style="color:#777;font-size:12px">${BR.appName}</span>
        <a href="https://os.blackroad.io/live" style="margin-left:auto;color:#555!important;font-size:11px;text-decoration:none">Live</a>
        <a href="https://blackroad-products.github.io/roadie/" style="color:#555!important;font-size:11px;text-decoration:none">Roadie</a>
      `;
      document.body.prepend(nav);
      document.body.style.paddingTop = '36px';
    },

    // ── Boot ──
    init() {
      BR.addNav();
      BR.activateInputs();
      BR.activateLists();
      BR.activateEditing();
      BR.toast(BR.appName + ' — online');

      // Track visit
      fetch('https://network-scheduler.blackroad.workers.dev/visit').catch(() => {});
    }
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BR.init);
  } else {
    BR.init();
  }
})();
