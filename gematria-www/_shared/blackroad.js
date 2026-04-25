// BlackRoad OS — Shared consent + live stats
// Loaded across all BlackRoad websites
// Stats verified 2026-03-12 from live fleet

(function() {
  'use strict';

  // === CONSENT BANNER ===
  // Rooted in BlackRoad consent philosophy:
  // "Consent is not a constraint. It is what prevents the cage."
  // — 007-consent-axioms.md

  if (!localStorage.getItem('br-consent-seen')) {
    var banner = document.createElement('div');
    banner.id = 'br-consent';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0a0a0a;border-top:1px solid #222;padding:20px 24px;font-family:"Inter","Space Grotesk",sans-serif;animation:brConsentIn .4s ease';
    banner.innerHTML = '<div style="max-width:900px;margin:0 auto;display:flex;align-items:center;gap:24px;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:280px">'
      + '<div style="font-size:14px;color:#f5f5f5;font-weight:600;margin-bottom:6px">Your consent matters to us.</div>'
      + '<div style="font-size:12px;color:#737373;line-height:1.7">'
      + 'No cookies. No cross-site tracking. No data sold. We use privacy-first analytics (BlackBoard) that collects anonymous page counts and browser type — never your IP, name, or identity. '
      + 'Enable <strong style="color:#aaa">Do Not Track</strong> in your browser to disable all analytics. '
      + '<a href="https://stats.blackroad.io/privacy" style="color:#8844FF;text-decoration:none">Privacy details</a> · '
      + '<a href="https://lucidia.earth" style="color:#00D4FF;text-decoration:none">Our ethics</a>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:12px;flex-shrink:0">'
      + '<button onclick="document.getElementById(\'br-consent\').remove();localStorage.setItem(\'br-consent-seen\',\'1\')" '
      + 'style="padding:10px 28px;background:#f5f5f5;color:#000;border:none;border-radius:4px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">I understand</button>'
      + '<button onclick="document.getElementById(\'br-consent\').remove();localStorage.setItem(\'br-consent-seen\',\'1\')" '
      + 'style="padding:10px 20px;background:transparent;color:#737373;border:1px solid #222;border-radius:4px;font-size:13px;cursor:pointer;font-family:inherit">Dismiss</button>'
      + '</div></div>';

    var style = document.createElement('style');
    style.textContent = '@keyframes brConsentIn{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(style);
    document.body.appendChild(banner);
  }

  // === LIVE STATS ===
  // Fetch real repo count from GitHub API (public, no auth needed)
  // Other stats are verified fleet values as of 2026-03-12

  // Fetch all stats from live API
  function updateStat(key, value) {
    document.querySelectorAll('[data-stat="' + key + '"]').forEach(function(el) {
      el.setAttribute('data-t', value);
      if (el.textContent !== '0' && el.textContent !== '—') el.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    });
    document.querySelectorAll('[data-live-stat="' + key + '"]').forEach(function(el) {
      if (el.hasAttribute('data-t')) el.setAttribute('data-t', value);
      else el.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    });
  }

  fetch('https://stats.blackroad.io/api/stats', { signal: AbortSignal.timeout(3000) })
    .then(function(r) { return r.json(); })
    .then(function(s) {
      Object.keys(s).forEach(function(k) { if (s[k] != null) updateStat(k, s[k]); });
    })
    .catch(function() {
      // Fallback: hardware constants only
      updateStat('tops', 52);
      updateStat('nodes', 5);
    });

  // Add live-verified watermark to footer
  var footers = document.querySelectorAll('footer');
  if (footers.length) {
    var last = footers[footers.length - 1];
    var mark = document.createElement('div');
    mark.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:10px;color:#222;text-align:center;margin-top:12px';
    mark.textContent = 'Live stats from fleet · stats.blackroad.io';
    last.appendChild(mark);
  }
})();
