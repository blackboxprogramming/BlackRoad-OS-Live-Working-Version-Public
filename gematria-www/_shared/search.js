// BlackRoad Search Widget — Cmd+K search overlay for any page
// Include: <script src="../_shared/search.js" defer></script>
// Or: <script src="https://blackroad.io/_shared/search.js" defer></script>

(function() {
  'use strict';

  var SEARCH_API = 'https://road-search.amundsonalexa.workers.dev';
  var overlay, input, results, debounceTimer;

  function init() {
    // Create overlay
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = [
      '<button class="search-overlay-close" onclick="window._brSearch.close()">&times;</button>',
      '<input class="search-overlay-input" placeholder="Search BlackRoad..." autofocus>',
      '<div class="search-overlay-results"></div>'
    ].join('');
    document.body.appendChild(overlay);

    input = overlay.querySelector('.search-overlay-input');
    results = overlay.querySelector('.search-overlay-results');

    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() { search(input.value); }, 200);
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') {
        var first = results.querySelector('.search-result-title');
        if (first) window.open(first.href, '_blank');
      }
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });

    // Cmd+K / Ctrl+K shortcut
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        close();
      }
    });

    // Add search hint to nav if exists
    var nav = document.querySelector('nav');
    if (nav) {
      var hint = document.createElement('div');
      hint.className = 'nav-search';
      hint.innerHTML = '<input placeholder="Search..." onclick="window._brSearch.open()" readonly><button onclick="window._brSearch.open()">&#8984;K</button>';
      hint.style.cursor = 'pointer';
      hint.addEventListener('click', function() { open(); });
      // Insert before CTA or at end
      var cta = nav.querySelector('.nav-cta');
      if (cta) nav.insertBefore(hint, cta);
      else nav.appendChild(hint);
    }
  }

  function open() {
    overlay.classList.add('active');
    input.value = '';
    input.focus();
    results.innerHTML = '<div style="text-align:center;color:#444;font-size:0.85rem;padding:40px 0">Type to search across the entire BlackRoad ecosystem</div>';
  }

  function close() {
    overlay.classList.remove('active');
  }

  async function search(query) {
    if (!query || query.length < 2) {
      results.innerHTML = '<div style="text-align:center;color:#444;font-size:0.85rem;padding:40px 0">Type to search across the entire BlackRoad ecosystem</div>';
      return;
    }

    results.innerHTML = '<div style="text-align:center;color:#444;font-size:0.85rem;padding:20px 0">Searching...</div>';

    try {
      var res = await fetch(SEARCH_API + '/search?q=' + encodeURIComponent(query) + '&limit=15', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      var data = await res.json();

      if (!data.results || data.results.length === 0) {
        results.innerHTML = '<div style="text-align:center;color:#444;font-size:0.85rem;padding:40px 0">No results for "' + esc(query) + '"</div>';
        return;
      }

      var html = '<div style="font-size:0.75rem;color:#444;margin-bottom:16px">' + data.results.length + ' results in ' + (data.duration || '?') + 'ms</div>';

      data.results.forEach(function(r) {
        var title = esc(r.title || r.name || 'Untitled');
        var url = r.url || '#';
        var snippet = esc(r.snippet || r.description || '').slice(0, 200);
        var cat = r.category || '';
        html += '<div class="search-result">';
        html += '<a class="search-result-title" href="' + esc(url) + '" target="_blank">' + title + '</a>';
        html += '<div class="search-result-url">' + esc(url) + '</div>';
        html += '<div class="search-result-snippet">' + snippet + '</div>';
        if (cat) html += '<span class="search-result-tag">' + esc(cat) + '</span>';
        html += '</div>';
      });

      results.innerHTML = html;
    } catch (e) {
      // Fallback: redirect to search page
      results.innerHTML = '<div style="text-align:center;padding:20px 0"><a href="https://search.blackroad.io?q=' + encodeURIComponent(query) + '" style="color:#f5f5f5;text-decoration:underline">Search on search.blackroad.io &rarr;</a></div>';
    }
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Public API
  window._brSearch = { open: open, close: close, search: search };

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
