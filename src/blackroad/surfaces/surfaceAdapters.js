// BlackRoad OS — Surface Adapters
// Adapts different surface kinds into renderable content

import { PRODUCTS } from '../products.js';
import { AGENTS } from '../command/commandRegistry.js';
import { SITES } from '../sites.js';
import { UNIVERSAL_COPY } from '../productCopy.js';

// Adapt a surface into renderable content based on its kind
export function adaptSurface(surface) {
  if (!surface) return { html: '', actions: [] };

  switch (surface.kind) {
    case 'product': return adaptProduct(surface);
    case 'agent': return adaptAgent(surface);
    case 'site': return adaptSite(surface);
    case 'docs': return adaptDocs(surface);
    case 'status': return adaptStatus(surface);
    case 'trust': return adaptTrust(surface);
    case 'health': return adaptHealth(surface);
    case 'roadnode': return adaptRoadNode(surface);
    case 'capture': return adaptCapture(surface);
    case 'system': return adaptSystem(surface);
    case 'document': return adaptDocument(surface);
    case 'external': return adaptExternal(surface);
    default: return adaptFallback(surface);
  }
}

function adaptProduct(surface) {
  const product = PRODUCTS.find(p => p.id === surface.productId);
  if (!product) return adaptFallback(surface);

  return {
    html: `
      <div class="br-surface-content">
        <div class="br-eyebrow">BlackRoad OS / ${product.name}</div>
        <h2>${product.oneLine}</h2>
        <p style="color:var(--br-muted);margin:var(--br-gap-md) 0">${product.longDescription}</p>
        <div class="br-mono" style="margin-bottom:var(--br-gap-md)">Built for ${product.primaryUser} · Replaces: ${product.replaces}</div>
      </div>
    `,
    actions: [
      { label: `Open ${product.name}`, url: `https://${product.domain}/`, primary: true },
      { label: 'Docs', url: `https://${product.domain}/docs` },
      { label: 'Status', url: `https://status.blackroad.io/products/${product.id}` },
      { label: 'Trust', url: `https://${product.domain}/trust` }
    ]
  };
}

function adaptAgent(surface) {
  const agent = AGENTS.find(a => a.id === surface.agentId);
  if (!agent) return adaptFallback(surface);

  return {
    html: `
      <div class="br-surface-content">
        <div class="br-eyebrow">The Roadies / ${agent.name}</div>
        <h2>${agent.name}</h2>
        <p style="color:var(--br-muted);margin:var(--br-gap-md) 0">${agent.role}</p>
        <div class="br-mono">Agent ID: ${agent.id}</div>
      </div>
    `,
    actions: [
      { label: 'Open in RoadTrip', url: 'https://os.blackroad.io?surface=roadtrip', primary: true },
      { label: `Ask ${agent.name}`, url: `https://os.blackroad.io?surface=roadtrip&agent=${agent.id}` },
      { label: 'View tasks', url: `https://os.blackroad.io?surface=system:todo&agent=${agent.id}` }
    ]
  };
}

function adaptSite(surface) {
  const site = SITES.find(s => s.id === surface.siteId);
  const info = site || surface;

  return {
    html: `
      <div class="br-surface-content">
        <div class="br-eyebrow">Site</div>
        <h2>${info.title || surface.title}</h2>
        <p style="color:var(--br-muted);margin:var(--br-gap-md) 0">${info.purpose || surface.subtitle}</p>
        <div class="br-mono">${info.domain || surface.domain || ''} · ${info.type || ''}</div>
      </div>
    `,
    actions: [
      { label: 'Open external', url: `https://${info.domain || surface.domain}/`, primary: true },
      { label: 'Docs', url: 'https://docs.blackroad.io' },
      { label: 'Status', url: 'https://status.blackroad.io' }
    ]
  };
}

function adaptDocs(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Documentation</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">${surface.subtitle}</p></div>`,
    actions: [{ label: 'Open docs', url: surface.url || 'https://docs.blackroad.io', primary: true }]
  };
}

function adaptStatus(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Status</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">${surface.subtitle}</p></div>`,
    actions: [{ label: 'View status', url: surface.url || 'https://status.blackroad.io', primary: true }]
  };
}

function adaptTrust(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Trust & Permissions</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">${UNIVERSAL_COPY.roadNodeConsent}</p><p style="color:var(--br-muted);margin-top:var(--br-gap-md)">${UNIVERSAL_COPY.roadOsDescription}</p></div>`,
    actions: [
      { label: 'Security model', url: 'https://security.blackroad.io', primary: true },
      { label: 'Manage permissions', url: 'https://account.blackroad.io/permissions' }
    ]
  };
}

function adaptHealth(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Health</div><h2>${surface.title}</h2><div class="br-mono">Checking health...</div></div>`,
    actions: [{ label: 'View health', url: surface.url, primary: true }]
  };
}

function adaptRoadNode(surface) {
  return {
    html: `
      <div class="br-surface-content">
        <div class="br-eyebrow">RoadNode Opt-In</div>
        <h2>RoadNode Mode</h2>
        <p style="color:var(--br-muted);margin:var(--br-gap-md) 0;line-height:1.6">${UNIVERSAL_COPY.roadNodeConsent}</p>
        <div class="br-card" style="margin-top:var(--br-gap-lg);padding:var(--br-gap-lg)">
          <p style="color:var(--br-muted);font-size:13px">A device can become a RoadNode only with clear user permission. RoadNode mode may contribute approved capabilities such as display, input, compute, cache, media relay, or presence.</p>
        </div>
      </div>
    `,
    actions: [
      { label: 'Review permissions', url: 'https://account.blackroad.io/permissions', primary: true },
      { label: 'Learn more', url: 'https://docs.blackroad.io/roadnode' }
    ]
  };
}

function adaptCapture(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Screen Capture</div><h2>Capture Permission</h2><p style="color:var(--br-muted)">Screen capture requires your explicit permission. BlackRoad does not capture automatically.</p></div>`,
    actions: [{ label: 'Grant permission', url: null, primary: true }]
  };
}

function adaptSystem(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">System</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">${surface.subtitle}</p></div>`,
    actions: surface.url ? [{ label: `Open ${surface.title}`, url: surface.url, primary: true }] : []
  };
}

function adaptDocument(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Document</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">${surface.subtitle}</p></div>`,
    actions: surface.url ? [{ label: 'Open document', url: surface.url, primary: true }] : []
  };
}

function adaptExternal(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">External Link</div><h2>${surface.title}</h2><p style="color:var(--br-muted)">This link opens outside RoadOS.</p></div>`,
    actions: surface.url ? [{ label: 'Open external', url: surface.url, primary: true }] : []
  };
}

function adaptFallback(surface) {
  return {
    html: `<div class="br-surface-content"><div class="br-eyebrow">Surface</div><h2>${surface.title || surface.id}</h2><p style="color:var(--br-muted)">${surface.subtitle || 'This surface is not yet available.'}</p></div>`,
    actions: []
  };
}
