// BlackRoad OS — Site Templates
// Generate consistent page structures for every BlackRoad website

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { STANDARD_PAGES } from './productRoutes.js';
import { UNIVERSAL_COPY } from './productCopy.js';
import { TOP_NAV, FOOTER_NAV, PRODUCT_NAV, RUNTIME_NAV, buildProductNav } from './navModel.js';
import { getCTAs } from './ctaModel.js';
import { buildLandingSections } from './pageSections.js';

// Design tokens — black and white first
export const DESIGN = {
  bg: '#000000',
  text: '#ffffff',
  textMuted: '#999999',
  border: '#333333',
  panel: '#111111',
  radius: '12px',
  borderWidth: '1px',
  fontBody: 'Inter, system-ui, sans-serif',
  fontHeading: 'Space Grotesk, system-ui, sans-serif',
  fontMono: 'JetBrains Mono, monospace',
  maxWidth: '1200px'
};

// Footer block — same on every site
export const FOOTER = {
  tagline: UNIVERSAL_COPY.tagline,
  nav: FOOTER_NAV,
  backToOS: 'https://os.blackroad.io',
  copyright: `${new Date().getFullYear()} BlackRoad OS, Inc.`
};

// Generate a complete page object for a product + page type
export function buildProductPage(productId, pageId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;

  const page = STANDARD_PAGES.find(p => p.id === pageId);
  if (!page) return null;

  const ctas = getCTAs(productId, pageId);
  const isHome = pageId === 'home';

  return {
    siteId: product.id,
    domain: product.domain,
    path: page.path,
    title: `${product.name} — ${page.title}`,

    // Header
    eyebrow: `BlackRoad OS / ${product.name}`,
    headline: isHome ? product.oneLine : page.title,
    subheadline: isHome ? product.longDescription : `${page.title} for ${product.name}`,

    // CTAs
    primaryCTA: ctas?.primary || null,
    secondaryCTA: ctas?.secondary || null,

    // Sections (only home page gets the full landing sections)
    sections: isHome ? buildLandingSections(productId) : [],

    // Connections
    connectedSites: product.connectedProducts.map(id => {
      const p = PRODUCTS.find(pr => pr.id === id);
      return p ? { id: p.id, name: p.name, domain: p.domain } : null;
    }).filter(Boolean),
    connectedProducts: product.connectedProducts,
    connectedAgents: [product.agentLayer],

    // SEO
    seoTitle: `${product.name} — ${page.title} | BlackRoad OS`,
    seoDescription: isHome ? product.longDescription : `${page.title} for ${product.name}: ${product.oneLine}`,
    canonicalUrl: `https://${product.domain}${page.path}`,

    // Navigation
    topNav: TOP_NAV,
    subNav: buildProductNav(product.domain),
    footer: FOOTER,

    // Design
    design: DESIGN
  };
}

// Generate all pages for a product
export function buildProductSite(productId) {
  return STANDARD_PAGES.map(page => buildProductPage(productId, page.id)).filter(Boolean);
}

// Generate a page for a non-product site (utility, agent, root)
export function buildSitePage(siteId, path = '/') {
  const site = SITES.find(s => s.id === siteId);
  if (!site) return null;

  return {
    siteId: site.id,
    domain: site.domain,
    path,
    title: site.title,
    eyebrow: site.type === 'agent' ? `The Roadies / ${site.title}` : `BlackRoad / ${site.title}`,
    headline: site.title,
    subheadline: site.purpose,
    primaryCTA: { label: site.primaryCTA, url: `https://${site.domain}/` },
    secondaryCTA: { label: 'Open RoadOS', url: 'https://os.blackroad.io' },
    sections: [],
    connectedSites: [],
    connectedProducts: site.connectedProduct ? [site.connectedProduct] : [],
    connectedAgents: site.connectedAgents,
    seoTitle: `${site.title} | BlackRoad OS`,
    seoDescription: site.purpose,
    canonicalUrl: `https://${site.domain}${path}`,
    topNav: TOP_NAV,
    subNav: null,
    footer: FOOTER,
    design: DESIGN
  };
}

// Generate all product sites
export function buildAllProductSites() {
  return PRODUCTS.map(p => ({
    productId: p.id,
    productName: p.name,
    domain: p.domain,
    pages: buildProductSite(p.id)
  }));
}

// Stats
export function getTemplateStats() {
  const allSites = buildAllProductSites();
  return {
    totalProducts: PRODUCTS.length,
    totalPages: allSites.reduce((sum, s) => sum + s.pages.length, 0),
    pagesPerProduct: STANDARD_PAGES.length,
    utilitySites: SITES.filter(s => s.type !== 'agent' && s.type !== 'product').length,
    agentSites: SITES.filter(s => s.type === 'agent').length
  };
}
