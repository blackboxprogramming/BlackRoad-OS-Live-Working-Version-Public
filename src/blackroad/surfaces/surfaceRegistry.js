// BlackRoad OS — Surface Registry
// Every Surface that can open inside RoadOS

import { PRODUCTS } from '../products.js';
import { AGENTS } from '../command/commandRegistry.js';
import { SITES } from '../sites.js';
import { DEFAULT_OPEN_MODE, DEFAULT_FALLBACK } from './surfaceTypes.js';

const OS_BASE = 'https://os.blackroad.io';

// Build a surface object
function surface(id, kind, title, subtitle, opts = {}) {
  return {
    id,
    kind,
    title,
    subtitle: subtitle || '',
    domain: opts.domain || null,
    route: opts.route || '/',
    url: opts.url || null,
    embedUrl: opts.embedUrl || null,
    status: opts.status || 'active',
    productId: opts.productId || null,
    agentId: opts.agentId || null,
    siteId: opts.siteId || null,
    icon: opts.icon || title.charAt(0),
    tags: opts.tags || [],
    permissions: opts.permissions || [],
    openMode: opts.openMode || DEFAULT_OPEN_MODE[kind] || 'placeholder',
    fallbackMode: opts.fallbackMode || DEFAULT_FALLBACK[kind] || 'metadata-only',
    lastOpenedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Product surfaces
export const PRODUCT_SURFACES = PRODUCTS.map(p => surface(
  p.id, 'product', p.name, p.oneLine, {
    domain: p.domain,
    route: p.route,
    url: `https://${p.domain}/`,
    productId: p.id,
    tags: p.tags,
    openMode: 'placeholder'
  }
));

// Agent surfaces
export const AGENT_SURFACES = AGENTS.map(a => surface(
  `agent:${a.id}`, 'agent', a.name, a.role, {
    domain: `${a.id}.blackroad.me`,
    url: `https://${a.id}.blackroad.me/`,
    agentId: a.id,
    openMode: 'native'
  }
));

// System surfaces
export const SYSTEM_SURFACES = [
  surface('system:products', 'system', 'Products', 'All BlackRoad products', { url: `${OS_BASE}/products` }),
  surface('system:agents', 'system', 'Agents', 'All 27 Roadie agents', { url: 'https://agents.blackroad.io' }),
  surface('system:sites', 'system', 'Sites', 'All BlackRoad sites', { url: 'https://atlas.blackroad.io' }),
  surface('system:docs', 'docs', 'Docs', 'Documentation', { url: 'https://docs.blackroad.io' }),
  surface('system:status', 'status', 'Status', 'System status', { url: 'https://status.blackroad.io' }),
  surface('system:archive', 'archive', 'Archive', 'Media and document archive', { url: 'https://archive.blackroad.io' }),
  surface('system:live', 'live', 'Live', 'Live broadcast', { url: 'https://live.blackroad.io' }),
  surface('system:capture', 'capture', 'Screen Capture', 'Capture permission surface', { openMode: 'capture', permissions: ['capture'] }),
  surface('system:settings', 'settings', 'Settings', 'RoadOS settings', { openMode: 'native' }),
  surface('system:trust', 'trust', 'Trust', 'Trust and permissions', { url: 'https://security.blackroad.io' }),
  surface('system:roadnode', 'roadnode', 'RoadNode Opt-In', 'Device contribution consent', { openMode: 'native', permissions: ['roadnode-consent'] }),
  surface('system:index', 'document', 'Institutional Index', 'RoadBook institutional index', { openMode: 'native' }),
  surface('system:codex', 'document', 'Codex', 'BlackRoad codex', { openMode: 'native' }),
  surface('system:todo', 'document', 'TODO', 'BlackRoad TODO', { openMode: 'native' }),
  surface('system:memory', 'document', 'Memory', 'BlackRoad memory system', { openMode: 'native' }),
  surface('system:collab', 'system', 'Collaboration', 'Cross-agent collaboration', { openMode: 'native' }),
  surface('blackroad-doctor', 'system', 'BlackRoad Doctor', 'Launch control runtime — one command that tells the truth', { openMode: 'native' }),
  surface('launch-queue', 'system', 'Launch Queue', 'Ordered work from doctor results — safe fixes vs approval-required', { openMode: 'native' }),
  surface('safe-patch-executor', 'system', 'Safe Patch Executor', 'Preview and apply safe local patches — backup always, never mutate production', { openMode: 'native' }),
  surface('release-control', 'system', 'Release Control', 'Preview deploy, release gates, staging, production approval, and rollback planning', { openMode: 'native' })
];

// All surfaces combined
export const ALL_SURFACES = [...PRODUCT_SURFACES, ...AGENT_SURFACES, ...SYSTEM_SURFACES];

// Lookups
export const getSurface = (id) => ALL_SURFACES.find(s => s.id === id);
export const getSurfacesByKind = (kind) => ALL_SURFACES.filter(s => s.kind === kind);
export const getProductSurface = (productId) => PRODUCT_SURFACES.find(s => s.productId === productId);
export const getAgentSurface = (agentId) => AGENT_SURFACES.find(s => s.agentId === agentId);

// Stats
export const SURFACE_COUNTS = {
  total: ALL_SURFACES.length,
  products: PRODUCT_SURFACES.length,
  agents: AGENT_SURFACES.length,
  system: SYSTEM_SURFACES.length
};
