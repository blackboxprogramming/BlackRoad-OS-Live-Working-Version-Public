// BlackRoad OS — Site Manifest Generator
// manifest.json and site.json for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { UNIVERSAL_COPY } from './productCopy.js';

// Build manifest.json (PWA web app manifest)
export function buildManifest(domain) {
  const product = PRODUCTS.find(p => p.domain === domain);
  const site = SITES.find(s => s.domain === domain);
  const item = product || site;
  if (!item) return null;

  const name = product ? product.name : item.title;
  const description = product ? product.longDescription : item.purpose;

  return {
    name: `${name} — BlackRoad OS`,
    short_name: name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    categories: product ? [product.category] : [item.type],
    related_applications: [],
    prefer_related_applications: false
  };
}

// Build site.json (BlackRoad-specific site descriptor)
export function buildSiteJson(domain) {
  const product = PRODUCTS.find(p => p.domain === domain);
  const site = SITES.find(s => s.domain === domain);

  if (product) {
    const connected = product.connectedProducts
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter(Boolean);

    return {
      blackroad: true,
      version: '1.0',
      id: product.id,
      name: product.name,
      domain: product.domain,
      type: 'product',
      category: product.category,
      oneLine: product.oneLine,
      description: product.longDescription,
      primaryUser: product.primaryUser,
      replaces: product.replaces,
      surfaceKind: product.surfaceKind,
      agentLayer: product.agentLayer,
      connectedProducts: connected.map(c => ({ id: c.id, name: c.name, domain: c.domain })),
      openInRoadOS: `https://os.blackroad.io/open/${product.id}`,
      canonicalUrl: `https://${product.domain}/`,
      docs: `https://${product.domain}/docs`,
      trust: `https://${product.domain}/trust`,
      status: 'https://status.blackroad.io',
      roadOsDescription: UNIVERSAL_COPY.roadOsDescription,
      roadNodeConsent: UNIVERSAL_COPY.roadNodeConsent,
      organization: 'BlackRoad OS, Inc.',
      tagline: UNIVERSAL_COPY.tagline
    };
  }

  if (site) {
    return {
      blackroad: true,
      version: '1.0',
      id: site.id,
      name: site.title,
      domain: site.domain,
      type: site.type,
      purpose: site.purpose,
      primaryCTA: site.primaryCTA,
      audience: site.audience,
      connectedProduct: site.connectedProduct,
      connectedAgents: site.connectedAgents,
      canonicalUrl: `https://${site.domain}/`,
      roadOsUrl: 'https://os.blackroad.io',
      docs: 'https://docs.blackroad.io',
      status: 'https://status.blackroad.io',
      roadOsDescription: UNIVERSAL_COPY.roadOsDescription,
      roadNodeConsent: UNIVERSAL_COPY.roadNodeConsent,
      organization: 'BlackRoad OS, Inc.',
      tagline: UNIVERSAL_COPY.tagline
    };
  }

  return null;
}

// Build all manifests
export function buildAllManifests() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({
    domain: d,
    manifest: buildManifest(d),
    siteJson: buildSiteJson(d)
  }));
}
