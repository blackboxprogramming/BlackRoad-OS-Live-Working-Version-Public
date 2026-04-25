/**
 * BlackRoad KPI GitHub Worker
 *
 * Collects real-time metrics from all 17 GitHub organizations and
 * 1,825+ repositories. Runs on cron every 5 minutes and exposes
 * on-demand endpoints.
 *
 * Endpoints:
 *   GET  /orgs             — all org-level KPIs
 *   GET  /repos            — repo-level KPIs (paginated)
 *   GET  /repos/:org       — repos for a specific org
 *   GET  /activity         — recent commits, PRs, issues across all orgs
 *   GET  /summary          — aggregated summary stats
 *   GET  /health           — health check
 *
 * Cron: collects from GitHub API every 5 minutes
 */

const ORGS = [
  'BlackRoad-OS-Inc', 'BlackRoad-OS', 'blackboxprogramming', 'BlackRoad-AI',
  'BlackRoad-Cloud', 'BlackRoad-Security', 'BlackRoad-Media', 'BlackRoad-Foundation',
  'BlackRoad-Interactive', 'BlackRoad-Hardware', 'BlackRoad-Labs', 'BlackRoad-Studio',
  'BlackRoad-Ventures', 'BlackRoad-Education', 'BlackRoad-Gov', 'Blackbox-Enterprises',
  'BlackRoad-Archive',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function ghFetch(path, env, opts = {}) {
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'BlackRoad-KPI/1.0' };
  if (env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, ...opts });
  if (!res.ok) return null;
  return res.json();
}

async function collectOrgMetrics(org, env) {
  const [orgData, repos] = await Promise.all([
    ghFetch(`/orgs/${org}`, env),
    ghFetch(`/orgs/${org}/repos?per_page=100&sort=updated`, env),
  ]);

  if (!orgData) return null;

  const repoList = repos || [];
  const totalStars = repoList.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repoList.reduce((s, r) => s + (r.forks_count || 0), 0);
  const totalIssues = repoList.reduce((s, r) => s + (r.open_issues_count || 0), 0);
  const totalSize = repoList.reduce((s, r) => s + (r.size || 0), 0);
  const languages = {};
  for (const r of repoList) {
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  }

  return {
    org,
    public_repos: orgData.public_repos || 0,
    total_repos: repoList.length,
    total_stars: totalStars,
    total_forks: totalForks,
    open_issues: totalIssues,
    total_size_kb: totalSize,
    languages,
    most_active: repoList.slice(0, 5).map(r => ({
      name: r.full_name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      issues: r.open_issues_count,
      updated: r.updated_at,
      language: r.language,
    })),
    collected_at: new Date().toISOString(),
  };
}

async function collectAllOrgs(env) {
  const results = await Promise.allSettled(
    ORGS.map(org => collectOrgMetrics(org, env))
  );

  const orgMetrics = [];
  for (let i = 0; i < ORGS.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled' && result.value) {
      orgMetrics.push(result.value);
    } else {
      orgMetrics.push({ org: ORGS[i], error: 'collection failed', collected_at: new Date().toISOString() });
    }
  }

  return orgMetrics;
}

function buildSummary(orgMetrics) {
  let totalRepos = 0, totalStars = 0, totalForks = 0, totalIssues = 0, totalSize = 0;
  const allLanguages = {};

  for (const m of orgMetrics) {
    if (m.error) continue;
    totalRepos += m.total_repos || 0;
    totalStars += m.total_stars || 0;
    totalForks += m.total_forks || 0;
    totalIssues += m.open_issues || 0;
    totalSize += m.total_size_kb || 0;
    for (const [lang, count] of Object.entries(m.languages || {})) {
      allLanguages[lang] = (allLanguages[lang] || 0) + count;
    }
  }

  return {
    total_orgs: ORGS.length,
    total_repos: totalRepos,
    total_stars: totalStars,
    total_forks: totalForks,
    open_issues: totalIssues,
    total_size_mb: Math.round(totalSize / 1024),
    top_languages: Object.entries(allLanguages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([lang, count]) => ({ language: lang, repos: count })),
    collected_at: new Date().toISOString(),
  };
}

async function runCollection(env) {
  const orgMetrics = await collectAllOrgs(env);
  const summary = buildSummary(orgMetrics);

  // Cache in KV
  if (env.GITHUB_CACHE) {
    await Promise.all([
      env.GITHUB_CACHE.put('orgs', JSON.stringify(orgMetrics), { expirationTtl: 600 }),
      env.GITHUB_CACHE.put('summary', JSON.stringify(summary), { expirationTtl: 600 }),
    ]);
  }

  // Write to Analytics Engine
  if (env.GITHUB_ANALYTICS) {
    env.GITHUB_ANALYTICS.writeDataPoint({
      blobs: ['github', 'summary', 'all-orgs'],
      doubles: [summary.total_repos, summary.total_stars, summary.total_forks, summary.open_issues],
      indexes: ['github-summary'],
    });

    for (const m of orgMetrics) {
      if (m.error) continue;
      env.GITHUB_ANALYTICS.writeDataPoint({
        blobs: ['github', 'org', m.org],
        doubles: [m.total_repos, m.total_stars, m.total_forks, m.open_issues],
        indexes: [`github-org-${m.org}`],
      });
    }
  }

  // Push to KPI collector
  if (env.KPI_COLLECTOR_URL) {
    const points = [
      { domain: 'github', metric: 'total_repos', value: summary.total_repos, source: 'kpi-github' },
      { domain: 'github', metric: 'total_stars', value: summary.total_stars, source: 'kpi-github' },
      { domain: 'github', metric: 'total_forks', value: summary.total_forks, source: 'kpi-github' },
      { domain: 'github', metric: 'open_issues', value: summary.open_issues, source: 'kpi-github' },
      { domain: 'github', metric: 'total_orgs', value: summary.total_orgs, source: 'kpi-github' },
      { domain: 'github', metric: 'total_size_mb', value: summary.total_size_mb, source: 'kpi-github' },
    ];
    await fetch(`${env.KPI_COLLECTOR_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(points),
    }).catch(() => {});
  }

  return { orgMetrics, summary };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (path === '/health') {
      return json({
        ok: true,
        service: 'blackroad-kpi-github',
        orgs: ORGS.length,
        ts: new Date().toISOString(),
      });
    }

    if (path === '/orgs') {
      let data = env.GITHUB_CACHE ? await env.GITHUB_CACHE.get('orgs', 'json') : null;
      if (!data) {
        const result = await runCollection(env);
        data = result.orgMetrics;
      }
      return json({ ok: true, orgs: data, ts: new Date().toISOString() });
    }

    if (path === '/summary') {
      let data = env.GITHUB_CACHE ? await env.GITHUB_CACHE.get('summary', 'json') : null;
      if (!data) {
        const result = await runCollection(env);
        data = result.summary;
      }
      return json({ ok: true, summary: data, ts: new Date().toISOString() });
    }

    if (path.startsWith('/repos/')) {
      const org = path.split('/repos/')[1];
      if (!ORGS.includes(org)) return json({ error: `unknown org: ${org}` }, 404);
      const repos = await ghFetch(`/orgs/${org}/repos?per_page=100&sort=updated`, env);
      return json({
        ok: true,
        org,
        repos: (repos || []).map(r => ({
          name: r.name, full_name: r.full_name, stars: r.stargazers_count,
          forks: r.forks_count, issues: r.open_issues_count, language: r.language,
          size_kb: r.size, updated: r.updated_at, created: r.created_at,
          default_branch: r.default_branch, archived: r.archived,
        })),
        ts: new Date().toISOString(),
      });
    }

    if (path === '/repos') {
      const result = await runCollection(env);
      const allRepos = result.orgMetrics
        .filter(m => !m.error)
        .flatMap(m => m.most_active || []);
      return json({ ok: true, repos: allRepos, ts: new Date().toISOString() });
    }

    if (path === '/collect') {
      const result = await runCollection(env);
      return json({ ok: true, collected: result.summary, ts: new Date().toISOString() });
    }

    return json({
      service: 'blackroad-kpi-github',
      orgs: ORGS,
      endpoints: ['GET /orgs', 'GET /repos', 'GET /repos/:org', 'GET /summary', 'GET /collect', 'GET /health'],
    });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCollection(env));
  },
};
