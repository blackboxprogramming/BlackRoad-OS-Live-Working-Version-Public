/**
 * BlackRoad Live Stats
 * Auto-populates elements with data-live-stat attributes.
 *
 * Usage: <span data-live-stat="repos">—</span>
 * Available stats: tops, nodes, repos, domains, databases, memories,
 *   models, agents, orgs, workers, cece_personas, nodes_online
 *
 * Fetches from stats.blackroad.io, falls back to GitHub API for repos.
 */
(function () {
  const STATS_URL = 'https://stats.blackroad.io/api/stats';
  const GH_API = 'https://api.github.com/users/blackboxprogramming';

  // Hardware constants (don't change without physical changes)
  const CONSTANTS = {
    tops: 52,          // 2x Hailo-8 @ 26 TOPS each
    nodes: 5,          // Alice, Cecilia, Octavia, Aria, Lucidia
  };

  function populate(stats) {
    document.querySelectorAll('[data-live-stat]').forEach(function (el) {
      var key = el.getAttribute('data-live-stat');
      var val = stats[key];
      if (val !== undefined && val !== null) {
        // If element has data-t (counter animation), update that
        if (el.hasAttribute('data-t')) {
          el.setAttribute('data-t', val);
        } else {
          el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
        }
      }
    });
  }

  // Try stats API first, then fall back to GitHub + constants
  fetch(STATS_URL, { signal: AbortSignal.timeout(3000) })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      populate(Object.assign({}, CONSTANTS, data));
    })
    .catch(function () {
      // Fallback: GitHub API for repos + constants
      fetch(GH_API, { signal: AbortSignal.timeout(3000) })
        .then(function (r) { return r.json(); })
        .then(function (gh) {
          populate(Object.assign({}, CONSTANTS, {
            repos: gh.public_repos || '—',
            orgs: gh.public_gists !== undefined ? '—' : '—', // can't get orgs count from user endpoint
          }));
        })
        .catch(function () {
          populate(CONSTANTS);
        });
    });
})();
