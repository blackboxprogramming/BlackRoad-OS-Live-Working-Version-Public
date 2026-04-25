// BlackRoad OS — Open Graph Generator
// OG + Twitter Card metadata for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { UNIVERSAL_COPY } from './productCopy.js';

const DEFAULT_IMAGE = 'https://images.blackroad.io/brand/og-card-default.png';

// Build OG metadata for a domain
export function buildOpenGraph(domain, path = '/') {
  const product = PRODUCTS.find(p => p.domain === domain);
  const site = SITES.find(s => s.domain === domain);
  const item = product || site;
  if (!item) return null;

  const name = product ? product.name : item.title;
  const description = product ? product.longDescription : item.purpose;
  const oneLine = product ? product.oneLine : item.purpose;

  return {
    // Open Graph
    'og:title': `${name} — ${oneLine}`,
    'og:description': description,
    'og:image': DEFAULT_IMAGE,
    'og:url': `https://${domain}${path}`,
    'og:type': 'website',
    'og:site_name': 'BlackRoad OS',
    'og:locale': 'en_US',

    // Twitter Card
    'twitter:card': 'summary_large_image',
    'twitter:title': `${name} | BlackRoad OS`,
    'twitter:description': oneLine,
    'twitter:image': DEFAULT_IMAGE,
    'twitter:site': '@blackroados',

    // Additional
    'theme-color': '#000000',
    'application-name': `${name} — BlackRoad OS`,
    'description': description,

    // Canonical
    canonical: `https://${domain}${path}`
  };
}

// Generate HTML meta tags from OG object
export function buildMetaTags(domain, path = '/') {
  const og = buildOpenGraph(domain, path);
  if (!og) return '';

  const tags = [];

  // Standard meta
  tags.push(`<meta name="description" content="${og.description}">`);
  tags.push(`<meta name="theme-color" content="${og['theme-color']}">`);
  tags.push(`<meta name="application-name" content="${og['application-name']}">`);

  // Open Graph
  for (const [key, value] of Object.entries(og)) {
    if (key.startsWith('og:')) {
      tags.push(`<meta property="${key}" content="${value}">`);
    }
  }

  // Twitter
  for (const [key, value] of Object.entries(og)) {
    if (key.startsWith('twitter:')) {
      tags.push(`<meta name="${key}" content="${value}">`);
    }
  }

  // Canonical
  tags.push(`<link rel="canonical" href="${og.canonical}">`);

  return tags.join('\n    ');
}

// Build all OG metadata
export function buildAllOpenGraph() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({ domain: d, og: buildOpenGraph(d) }));
}
