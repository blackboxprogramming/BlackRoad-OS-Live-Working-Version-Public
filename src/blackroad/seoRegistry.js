// BlackRoad OS — SEO Registry
// Search engine and social metadata for every site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { UNIVERSAL_COPY } from './productCopy.js';

const DEFAULT_OG_IMAGE = 'https://images.blackroad.io/brand/og-card-default.png';

const SCHEMA_TYPE_MAP = {
  'blackroad-io': ['Organization', 'WebSite'],
  'os-blackroad-io': ['SoftwareApplication'],
  'blackroad-company': ['Organization'],
  'blackroad-network': ['WebSite', 'Service'],
  'docs-blackroad-io': ['TechArticle', 'WebSite'],
  'status-blackroad-io': ['WebPage'],
  'agents-blackroad-io': ['SoftwareApplication'],
  'roadchain-io': ['SoftwareApplication', 'DataCatalog'],
  'roadcoin-io': ['Service']
};

// Product schema types
const PRODUCT_SCHEMA = {
  roadbook: ['SoftwareApplication', 'CreativeWork'],
  default: ['SoftwareApplication']
};

function buildKeywords(item) {
  const base = ['BlackRoad OS', 'portable browser computer', 'sovereign AI', 'edge computing'];
  if (item.tags) return [...base, ...item.tags];
  if (item.type) return [...base, item.type, item.title];
  return base;
}

// Build SEO object for a product
export function buildProductSEO(productId) {
  const p = PRODUCTS.find(pr => pr.id === productId);
  if (!p) return null;

  const connected = p.connectedProducts
    .map(id => PRODUCTS.find(pr => pr.id === id))
    .filter(Boolean);

  return {
    siteId: p.id,
    domain: p.domain,
    title: `${p.name} — ${p.oneLine} | BlackRoad OS`,
    description: p.longDescription,
    canonicalUrl: `https://${p.domain}/`,
    keywords: buildKeywords(p),
    product: p.name,
    audience: p.primaryUser,
    category: p.category,
    replaces: p.replaces,
    connectsTo: connected.map(c => c.name),
    primaryCTA: `Open ${p.name}`,
    ogTitle: `${p.name} — ${p.oneLine}`,
    ogDescription: p.longDescription,
    ogImage: DEFAULT_OG_IMAGE,
    twitterTitle: `${p.name} | BlackRoad OS`,
    twitterDescription: p.oneLine,
    schemaType: PRODUCT_SCHEMA[p.id] || PRODUCT_SCHEMA.default,
    llmsSummary: p.longDescription,
    aiInstructions: `${p.name} is a product within BlackRoad OS. ${p.longDescription} It is built for ${p.primaryUser}. It replaces: ${p.replaces}. ${UNIVERSAL_COPY.roadOsDescription} ${UNIVERSAL_COPY.roadNodeConsent}`
  };
}

// Build SEO object for a non-product site
export function buildSiteSEO(siteId) {
  const s = SITES.find(si => si.id === siteId);
  if (!s) return null;

  return {
    siteId: s.id,
    domain: s.domain,
    title: `${s.title} | BlackRoad OS`,
    description: s.purpose,
    canonicalUrl: `https://${s.domain}/`,
    keywords: buildKeywords(s),
    product: s.connectedProduct || null,
    audience: s.audience,
    category: s.type,
    replaces: null,
    connectsTo: s.connectedAgents,
    primaryCTA: s.primaryCTA,
    ogTitle: `${s.title} — BlackRoad OS`,
    ogDescription: s.purpose,
    ogImage: DEFAULT_OG_IMAGE,
    twitterTitle: `${s.title} | BlackRoad OS`,
    twitterDescription: s.purpose,
    schemaType: SCHEMA_TYPE_MAP[s.id] || ['WebPage'],
    llmsSummary: s.purpose,
    aiInstructions: `${s.title} is part of BlackRoad OS. ${s.purpose} ${UNIVERSAL_COPY.roadOsDescription} ${UNIVERSAL_COPY.roadNodeConsent}`
  };
}

// Build all SEO objects
export function buildAllSEO() {
  const productSEO = PRODUCTS.map(p => buildProductSEO(p.id));
  const siteSEO = SITES.filter(s => s.type !== 'agent').map(s => buildSiteSEO(s.id));
  return [...productSEO, ...siteSEO];
}

// Default OG meta
export const DEFAULT_OG = {
  title: 'BlackRoad OS — Remember the Road. Pave Tomorrow!',
  description: 'A portable browser computer for apps, agents, media, memory, work, publishing, search, and sovereign edge AI.',
  image: DEFAULT_OG_IMAGE,
  type: 'website',
  siteName: 'BlackRoad OS'
};
