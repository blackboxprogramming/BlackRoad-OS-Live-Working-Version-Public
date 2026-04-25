// BlackRoad OS — Site Pages
// Page-level content generation for every standard page type

import { PRODUCTS } from './products.js';
import { UNIVERSAL_COPY, SITE_RULEBOOK } from './productCopy.js';
import { buildLandingSections } from './pageSections.js';

// Page content builders — one per standard page type
export const PAGE_BUILDERS = {
  home: (product) => ({
    pageId: 'home',
    path: '/',
    title: product.name,
    layout: 'landing',
    sections: buildLandingSections(product.id)
  }),

  about: (product) => ({
    pageId: 'about',
    path: '/about',
    title: `About ${product.name}`,
    layout: 'content',
    content: {
      heading: `What is ${product.name}?`,
      body: product.longDescription,
      rulebook: SITE_RULEBOOK.map((question, i) => ({
        question,
        answer: getAnswerForRulebook(product, i)
      }))
    }
  }),

  use: (product) => ({
    pageId: 'use',
    path: '/use',
    title: `Use ${product.name}`,
    layout: 'content',
    content: {
      heading: `What you can do with ${product.name}`,
      primaryUser: product.primaryUser,
      surfaceKind: product.surfaceKind,
      openUrl: `https://os.blackroad.io/open/${product.id}`,
      connected: product.connectedProducts.map(id => {
        const p = PRODUCTS.find(pr => pr.id === id);
        return p ? { name: p.name, oneLine: p.oneLine, domain: p.domain } : null;
      }).filter(Boolean)
    }
  }),

  demo: (product) => ({
    pageId: 'demo',
    path: '/demo',
    title: `${product.name} Demo`,
    layout: 'demo',
    content: {
      heading: `Try ${product.name}`,
      placeholder: true,
      openUrl: `https://os.blackroad.io/open/${product.id}`,
      note: `This demo runs inside RoadOS. ${UNIVERSAL_COPY.roadOsDescription}`
    }
  }),

  docs: (product) => ({
    pageId: 'docs',
    path: '/docs',
    title: `${product.name} Docs`,
    layout: 'docs',
    content: {
      heading: `${product.name} Documentation`,
      sections: [
        { title: 'Overview', content: product.longDescription },
        { title: 'Getting started', content: `Open RoadOS at os.blackroad.io, then launch ${product.name} from the command dock.` },
        { title: 'What it replaces', content: product.replaces },
        { title: 'Connected products', content: product.connectedProducts.join(', ') },
        { title: 'Agent', content: `Primary agent: ${product.agentLayer}` }
      ]
    }
  }),

  status: (product) => ({
    pageId: 'status',
    path: '/status',
    title: `${product.name} Status`,
    layout: 'status',
    content: {
      heading: `${product.name} Status`,
      currentStatus: product.status,
      statusUrl: 'https://status.blackroad.io',
      systemStatus: `https://status.blackroad.io/${product.id}`
    }
  }),

  open: (product) => ({
    pageId: 'open',
    path: '/open',
    title: `Open ${product.name} in RoadOS`,
    layout: 'redirect',
    content: {
      heading: `Open ${product.name}`,
      redirectUrl: `https://os.blackroad.io/open/${product.id}`,
      roadOsCopy: UNIVERSAL_COPY.roadOsDescription,
      note: `${product.name} opens as a ${product.surfaceKind === 'service' ? 'background service' : 'Surface'} inside RoadOS.`
    }
  }),

  api: (product) => ({
    pageId: 'api',
    path: '/api',
    title: `${product.name} API`,
    layout: 'docs',
    content: {
      heading: `${product.name} API`,
      placeholder: true,
      note: 'API documentation and integration notes.',
      apiGateway: 'https://api.blackroad.io'
    }
  }),

  trust: (product) => ({
    pageId: 'trust',
    path: '/trust',
    title: `${product.name} Trust`,
    layout: 'trust',
    content: {
      heading: 'Trust & Permissions',
      dataUsage: `${product.name} uses only the data you provide within your workspace.`,
      permissions: product.surfaceKind === 'service'
        ? 'Background service permissions only. All revocable.'
        : 'Runs as a Surface inside RoadOS with workspace access. All revocable.',
      storage: 'State is persisted through RoadChain memory checkpoints. You control what is saved.',
      agentAccess: product.agentLayer === 'all'
        ? 'All 27 agents are available.'
        : `${product.agentLayer} is the primary agent.`,
      deviceCapabilities: 'Only with explicit RoadNode opt-in permission.',
      roadNodeOptional: true,
      roadNodeCopy: UNIVERSAL_COPY.roadNodeConsent,
      revocable: 'All permissions are revocable at any time from Account settings.',
      securityUrl: 'https://security.blackroad.io',
      accountUrl: 'https://account.blackroad.io/permissions'
    }
  }),

  contact: (product) => ({
    pageId: 'contact',
    path: '/contact',
    title: `${product.name} Contact`,
    layout: 'contact',
    content: {
      heading: 'Contact & Support',
      supportUrl: 'https://support.blackroad.io',
      communityNote: 'Join the community or reach out for help.',
      feedbackNote: 'We build in the open. Your feedback shapes the road.'
    }
  })
};

// Helper: answer the 8 rulebook questions for a product
function getAnswerForRulebook(product, index) {
  const connected = product.connectedProducts.map(id => {
    const p = PRODUCTS.find(pr => pr.id === id);
    return p ? p.name : id;
  });

  switch (index) {
    case 0: return product.longDescription;
    case 1: return `Built for ${product.primaryUser}.`;
    case 2: return product.replaces;
    case 3: return `Open ${product.name} to ${product.oneLine.toLowerCase().replace(/^the /, '')}`;
    case 4: return `Connects to: ${connected.join(', ')}.`;
    case 5: return 'State is persisted through RoadChain memory checkpoints. Your work follows you across devices via RoadOS.';
    case 6: return product.surfaceKind === 'service'
      ? 'Background service permissions only. All revocable.'
      : 'Runs as a Surface inside RoadOS. All permissions revocable.';
    case 7: return `Open RoadOS at os.blackroad.io, then launch ${product.name} from the command dock or app grid.`;
    default: return '';
  }
}

// Build all pages for a product
export function buildAllPages(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return [];
  return Object.values(PAGE_BUILDERS).map(builder => builder(product));
}

// Build a specific page for a product
export function buildPage(productId, pageId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;
  const builder = PAGE_BUILDERS[pageId];
  if (!builder) return null;
  return builder(product);
}
