// BlackRoad OS — Page Sections
// Universal landing page section definitions

import { PRODUCTS } from './products.js';
import { UNIVERSAL_COPY } from './productCopy.js';

// The 11 sections every product landing page uses
export const LANDING_SECTIONS = [
  {
    id: 'hero',
    label: 'Hero',
    required: true,
    build: (product) => ({
      type: 'hero',
      eyebrow: `BlackRoad OS / ${product.name}`,
      headline: product.oneLine,
      subheadline: product.longDescription,
      primaryCTA: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` },
      secondaryCTA: { label: 'Learn more', url: `https://${product.domain}/about` }
    })
  },
  {
    id: 'explanation',
    label: 'One-line explanation',
    required: true,
    build: (product) => ({
      type: 'explanation',
      text: product.oneLine,
      detail: product.longDescription
    })
  },
  {
    id: 'replaces',
    label: 'What it replaces',
    required: true,
    build: (product) => ({
      type: 'replaces',
      heading: 'What it replaces',
      text: product.replaces
    })
  },
  {
    id: 'connects',
    label: 'What it connects to',
    required: true,
    build: (product) => ({
      type: 'connects',
      heading: 'Connected products',
      items: product.connectedProducts.map(id => {
        const p = PRODUCTS.find(pr => pr.id === id);
        return p ? { id: p.id, name: p.name, oneLine: p.oneLine, domain: p.domain } : null;
      }).filter(Boolean)
    })
  },
  {
    id: 'audience',
    label: 'Who it is for',
    required: true,
    build: (product) => ({
      type: 'audience',
      heading: 'Built for',
      primaryUser: product.primaryUser,
      text: `${product.name} is built for ${product.primaryUser}.`
    })
  },
  {
    id: 'actions',
    label: 'Main actions',
    required: true,
    build: (product) => ({
      type: 'actions',
      heading: 'What you can do',
      items: [
        { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}`, primary: true },
        { label: 'Try demo', url: `https://${product.domain}/demo` },
        { label: 'Read docs', url: `https://${product.domain}/docs` }
      ]
    })
  },
  {
    id: 'screenshots',
    label: 'Product screenshots',
    required: false,
    build: (product) => ({
      type: 'screenshots',
      heading: product.name,
      placeholder: true,
      note: 'Screenshots or interactive preview goes here.'
    })
  },
  {
    id: 'agentLayer',
    label: 'Agent layer',
    required: true,
    build: (product) => ({
      type: 'agent-layer',
      heading: 'Agent',
      agentId: product.agentLayer,
      text: product.agentLayer === 'all'
        ? 'All 27 Roadie agents are available in this product.'
        : `${product.agentLayer.charAt(0).toUpperCase() + product.agentLayer.slice(1)} is the primary agent for ${product.name}.`
    })
  },
  {
    id: 'osIntegration',
    label: 'RoadOS integration',
    required: true,
    build: (product) => ({
      type: 'os-integration',
      heading: 'Works inside RoadOS',
      text: UNIVERSAL_COPY.roadOsDescription,
      cta: { label: 'Open in RoadOS', url: `https://os.blackroad.io/open/${product.id}` }
    })
  },
  {
    id: 'trust',
    label: 'Trust and permissions',
    required: true,
    build: (product) => ({
      type: 'trust',
      heading: 'Trust & Permissions',
      items: [
        { question: 'What data does it use?', answer: `${product.name} uses only the data you provide within your workspace.` },
        { question: 'What permissions does it need?', answer: product.surfaceKind === 'service' ? 'Background service permissions only.' : 'Runs as a Surface inside RoadOS with workspace access.' },
        { question: 'Does it store anything?', answer: 'State is persisted through RoadChain memory checkpoints. You control what is saved.' },
        { question: 'Does it connect to agents?', answer: product.agentLayer === 'all' ? 'Yes, all 27 agents are available.' : `Yes, ${product.agentLayer} is the primary agent.` },
        { question: 'Can it access device capabilities?', answer: 'Only with explicit RoadNode opt-in permission.' },
        { question: 'Is RoadNode mode optional?', answer: 'Yes. Always opt-in.' },
        { question: 'What can you revoke?', answer: 'All permissions are revocable at any time from Account settings.' }
      ],
      roadNodeCopy: UNIVERSAL_COPY.roadNodeConsent
    })
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    required: false,
    build: (product) => ({
      type: 'roadmap',
      heading: 'Roadmap',
      status: product.status,
      placeholder: true
    })
  }
];

// Build all sections for a product landing page
export function buildLandingSections(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return [];
  return LANDING_SECTIONS.map(section => ({
    sectionId: section.id,
    label: section.label,
    required: section.required,
    ...section.build(product)
  }));
}

// Validate that all required sections are present
export function validateSections(productId) {
  const sections = buildLandingSections(productId);
  const required = LANDING_SECTIONS.filter(s => s.required).map(s => s.id);
  const present = sections.map(s => s.sectionId);
  const missing = required.filter(id => !present.includes(id));
  return { valid: missing.length === 0, missing };
}
