// BlackRoad OS — llms.txt Generator
// AI-readable documentation for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';
import { UNIVERSAL_COPY } from './productCopy.js';

// Build llms.txt for a product site
export function buildProductLlmsText(productId) {
  const p = PRODUCTS.find(pr => pr.id === productId);
  if (!p) return '';

  const connected = p.connectedProducts
    .map(id => PRODUCTS.find(pr => pr.id === id))
    .filter(Boolean);

  return `# ${p.name} — BlackRoad OS

> ${p.oneLine}

## What this site is

${p.name} is a product within BlackRoad OS, a portable browser computer and sovereign edge AI ecosystem. ${p.longDescription}

## What users can do here

- Open ${p.name} inside RoadOS at os.blackroad.io
- ${p.oneLine.charAt(0).toLowerCase() + p.oneLine.slice(1).replace(/\.$/, '')}
- Access connected products and agents from within ${p.name}
- Use the command dock to search and navigate

## Who it is for

${p.name} is built for ${p.primaryUser}.

## What it replaces

${p.replaces}

## Connected products

${connected.map(c => `- ${c.name}: ${c.oneLine}`).join('\n')}

## Connected agents

- Primary agent: ${p.agentLayer}
- All 27 Roadie agents are accessible through RoadTrip

## Data and permissions

${p.surfaceKind === 'service'
  ? `${p.name} operates as a background service. It requests only the permissions needed for its specific function.`
  : `${p.name} runs as a Surface inside RoadOS. It can access your workspace context with your permission.`}
All permissions are revocable at any time from Account settings.

${UNIVERSAL_COPY.roadNodeConsent}

## RoadOS integration

${UNIVERSAL_COPY.roadOsDescription}

${p.name} opens as a ${p.surfaceKind === 'service' ? 'background service' : 'Surface'} inside RoadOS. Launch it from the command dock or app grid at os.blackroad.io.

## Canonical links

- Product: https://${p.domain}/
- Open in RoadOS: https://os.blackroad.io/open/${p.id}
- Docs: https://${p.domain}/docs
- Trust: https://${p.domain}/trust
- Status: https://status.blackroad.io
- Full docs: https://docs.blackroad.io

## About BlackRoad OS

BlackRoad OS is not trying to be another app. BlackRoad OS is the road underneath the apps.

BlackRoad OS, Inc.
Remember the Road. Pave Tomorrow!
`;
}

// Build llms.txt for a non-product site
export function buildSiteLlmsText(siteId) {
  const s = SITES.find(si => si.id === siteId);
  if (!s) return '';

  return `# ${s.title} — BlackRoad OS

> ${s.purpose}

## What this site is

${s.title} is part of BlackRoad OS, a portable browser computer and sovereign edge AI ecosystem. ${s.purpose}

## What users can do here

- ${s.primaryCTA}
- Navigate to connected products and agents
- Use the command dock to search the ecosystem

## Who it is for

This site is built for ${s.audience}.

## Connected agents

${s.connectedAgents.map(a => `- ${a}`).join('\n')}

## Data and permissions

This site follows BlackRoad OS trust and permission standards. All permissions are revocable.

${UNIVERSAL_COPY.roadNodeConsent}

## RoadOS integration

${UNIVERSAL_COPY.roadOsDescription}

This site connects back to os.blackroad.io. Use the command dock or top navigation to return to RoadOS.

## Canonical links

- Site: https://${s.domain}/
- RoadOS: https://os.blackroad.io
- Docs: https://docs.blackroad.io
- Status: https://status.blackroad.io

## About BlackRoad OS

BlackRoad OS is not trying to be another app. BlackRoad OS is the road underneath the apps.

BlackRoad OS, Inc.
Remember the Road. Pave Tomorrow!
`;
}

// Build llms.txt for any domain
export function buildLlmsText(domain) {
  const product = PRODUCTS.find(p => p.domain === domain);
  if (product) return buildProductLlmsText(product.id);

  const site = SITES.find(s => s.domain === domain);
  if (site) return buildSiteLlmsText(site.id);

  return '';
}

// Build all llms.txt files
export function buildAllLlmsText() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({ domain: d, content: buildLlmsText(d) }));
}
