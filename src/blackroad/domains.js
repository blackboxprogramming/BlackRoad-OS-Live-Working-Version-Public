// BlackRoad OS — Domain Registry
// Every domain mapped to its site and routing config

import { SITES } from './sites.js';
import { PRODUCTS } from './products.js';

// All root domains BlackRoad controls
export const ROOT_DOMAINS = [
  'blackroad.io',
  'blackroad.company',
  'blackroad.systems',
  'blackroad.network',
  'blackroad.me',
  'blackroadai.com',
  'blackboxprogramming.io',
  'roadchain.io',
  'roadcoin.io',
  'lucidia.studio',
  'lucidia.earth',
  'lucidiaqi.com'
];

// Build complete domain map from sites + products
export function buildDomainMap() {
  const map = {};

  // Sites (root + utility + agent)
  for (const site of SITES) {
    map[site.domain] = {
      siteId: site.id,
      type: site.type,
      title: site.title,
      purpose: site.purpose,
      primaryCTA: site.primaryCTA,
      routes: site.routes,
      priority: site.priority,
      status: site.status
    };
  }

  // Products (auto-generate subdomain entries)
  for (const product of PRODUCTS) {
    if (!map[product.domain]) {
      map[product.domain] = {
        siteId: product.id,
        type: 'product',
        title: product.name,
        purpose: product.longDescription,
        primaryCTA: `Open ${product.name}`,
        routes: ['/', '/about', '/use', '/demo', '/docs', '/status', '/open', '/api', '/trust', '/contact'],
        priority: product.id === 'roados' ? 1 : 2,
        status: product.status
      };
    }
  }

  return map;
}

// Flat list of all domains
export function getAllDomains() {
  const map = buildDomainMap();
  return Object.keys(map).sort();
}

// Domain count
export const DOMAIN_MAP = buildDomainMap();
export const TOTAL_DOMAINS = Object.keys(DOMAIN_MAP).length;
