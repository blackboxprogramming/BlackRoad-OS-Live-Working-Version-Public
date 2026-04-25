// BlackRoad OS — Route Registry
// Every route across every domain

import { SITES } from './sites.js';
import { PRODUCTS } from './products.js';
import { STANDARD_PAGES } from './productRoutes.js';

// Build complete route table
export function buildRouteTable() {
  const routes = [];

  // Site routes
  for (const site of SITES) {
    for (const route of site.routes) {
      routes.push({
        domain: site.domain,
        path: route,
        siteId: site.id,
        type: site.type,
        title: site.title
      });
    }
  }

  // Product routes (10 standard pages each)
  for (const product of PRODUCTS) {
    for (const page of STANDARD_PAGES) {
      // Skip if already added from sites
      const exists = routes.some(r => r.domain === product.domain && r.path === page.path);
      if (!exists) {
        routes.push({
          domain: product.domain,
          path: page.path,
          siteId: product.id,
          type: 'product',
          title: `${product.name} — ${page.title}`
        });
      }
    }
  }

  return routes;
}

// RoadOS internal routes (open any product as a Surface)
export function buildOSRoutes() {
  return PRODUCTS.map(p => ({
    path: `/open/${p.id}`,
    productId: p.id,
    productName: p.name,
    surfaceKind: p.surfaceKind,
    domain: p.domain
  }));
}

export const ROUTE_TABLE = buildRouteTable();
export const OS_ROUTES = buildOSRoutes();
export const TOTAL_ROUTES = ROUTE_TABLE.length;
