// BlackRoad OS — Sitemap Generator
// Generates sitemap.xml content for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { STANDARD_PAGES } from './productRoutes.js';

// Standard product pages
const PRODUCT_PATHS = [
  ...STANDARD_PAGES.map(p => p.path),
  '/features',
  '/pricing',
  '/roadmap',
  '/changelog',
  '/integrations'
];

// Special site paths
const SPECIAL_PATHS = {
  'docs-blackroad-io': ['/', '/products', '/agents', '/sites', '/routes', '/glossary', '/security', '/roadnode', '/surfaces', '/api'],
  'os-blackroad-io': ['/', '/live', '/surfaces', '/apps', '/agents', '/capture', '/archive', '/settings', '/status'],
  'agents-blackroad-io': [
    '/', '/agents',
    '/agents/roadie', '/agents/lucidia', '/agents/cecilia', '/agents/alexandria',
    '/agents/gematria', '/agents/gaia', '/agents/portia', '/agents/atticus', '/agents/ophelia',
    '/agents/octavia', '/agents/alice', '/agents/aria', '/agents/anastasia',
    '/agents/theodosia', '/agents/sophia', '/agents/sapphira', '/agents/seraphina',
    '/agents/cicero', '/agents/valeria', '/agents/lyra', '/agents/calliope',
    '/agents/thalia', '/agents/celeste', '/agents/elias', '/agents/silas',
    '/agents/sebastian', '/agents/olympia'
  ],
  'status-blackroad-io': ['/', '/fleet', '/incidents', '/history'],
  'blackroad-io': ['/', '/products', '/agents', '/about', '/demo', '/docs', '/open', '/trust']
};

// Priority by path
function getPriority(path) {
  if (path === '/') return '1.0';
  if (['/about', '/use', '/docs'].includes(path)) return '0.8';
  if (['/demo', '/trust', '/status'].includes(path)) return '0.7';
  if (['/features', '/pricing'].includes(path)) return '0.6';
  return '0.5';
}

// Generate sitemap XML for a domain
export function buildSitemap(domain) {
  let paths;

  // Check if it's a product domain
  const product = PRODUCTS.find(p => p.domain === domain);
  if (product) {
    paths = PRODUCT_PATHS;
  } else {
    // Check special paths
    const site = SITES.find(s => s.domain === domain);
    if (site && SPECIAL_PATHS[site.id]) {
      paths = SPECIAL_PATHS[site.id];
    } else if (site) {
      paths = site.routes.filter(r => !r.includes(':') && !r.includes('*'));
    } else {
      paths = ['/'];
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const urls = paths.map(path => `  <url>
    <loc>https://${domain}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${getPriority(path)}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Generate sitemap index for all BlackRoad domains
export function buildSitemapIndex() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  const today = new Date().toISOString().split('T')[0];

  const sitemaps = unique.map(d => `  <sitemap>
    <loc>https://${d}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

// Get all sitemaps as { domain, xml } pairs
export function buildAllSitemaps() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({ domain: d, xml: buildSitemap(d) }));
}
