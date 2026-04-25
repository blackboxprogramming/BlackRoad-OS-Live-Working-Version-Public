// BlackRoad OS — Product Routes
// Maps every product to its canonical routes

import { PRODUCTS } from './products.js';

// Standard pages every product site gets
export const STANDARD_PAGES = [
  { path: '/', id: 'home', title: 'Home' },
  { path: '/about', id: 'about', title: 'About' },
  { path: '/use', id: 'use', title: 'Use' },
  { path: '/demo', id: 'demo', title: 'Demo' },
  { path: '/docs', id: 'docs', title: 'Docs' },
  { path: '/status', id: 'status', title: 'Status' },
  { path: '/open', id: 'open', title: 'Open in RoadOS' },
  { path: '/api', id: 'api', title: 'API' },
  { path: '/trust', id: 'trust', title: 'Trust' },
  { path: '/contact', id: 'contact', title: 'Contact' }
];

// Generate all routes for a product
export function getProductRoutes(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return [];

  return STANDARD_PAGES.map(page => ({
    productId: product.id,
    domain: product.domain,
    path: page.path,
    pageId: page.id,
    title: `${product.name} — ${page.title}`,
    canonicalUrl: `https://${product.domain}${page.path}`,
    seoTitle: `${product.name} — ${page.title} | BlackRoad OS`,
    seoDescription: page.id === 'home'
      ? product.longDescription
      : `${page.title} for ${product.name}: ${product.oneLine}`
  }));
}

// Generate all routes for all products
export function getAllRoutes() {
  return PRODUCTS.flatMap(p => getProductRoutes(p.id));
}

// Route count
export const TOTAL_ROUTES = PRODUCTS.length * STANDARD_PAGES.length;
