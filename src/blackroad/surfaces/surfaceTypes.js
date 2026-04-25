// BlackRoad OS — Surface Types
// Every kind of Surface that can open inside RoadOS

export const SURFACE_KINDS = [
  'product', 'agent', 'site', 'docs', 'status', 'trust', 'health',
  'document', 'media', 'archive', 'live', 'capture', 'settings',
  'roadnode', 'system', 'external'
];

export const OPEN_MODES = [
  'internal',     // Rendered inside RoadOS
  'iframe',       // Loaded via sandboxed iframe
  'external',     // Opens in new tab with warning
  'placeholder',  // Shows metadata + action buttons
  'capture',      // Permission-gated screen capture
  'document',     // Rendered markdown/text
  'native'        // Native RoadOS component
];

export const FALLBACK_MODES = [
  'open-source',     // Show source/code if available
  'open-external',   // Link to external URL
  'screen-capture',  // Offer capture option
  'metadata-only',   // Show metadata card
  'not-available'    // Show unavailable notice
];

// Default open mode by surface kind
export const DEFAULT_OPEN_MODE = {
  product: 'placeholder',
  agent: 'native',
  site: 'placeholder',
  docs: 'native',
  status: 'native',
  trust: 'native',
  health: 'native',
  document: 'document',
  media: 'iframe',
  archive: 'placeholder',
  live: 'iframe',
  capture: 'capture',
  settings: 'native',
  roadnode: 'native',
  system: 'native',
  external: 'external'
};

// Default fallback by surface kind
export const DEFAULT_FALLBACK = {
  product: 'open-external',
  agent: 'metadata-only',
  site: 'open-external',
  docs: 'open-external',
  status: 'open-external',
  trust: 'open-external',
  health: 'metadata-only',
  document: 'metadata-only',
  media: 'metadata-only',
  archive: 'open-external',
  live: 'not-available',
  capture: 'not-available',
  settings: 'not-available',
  roadnode: 'metadata-only',
  system: 'metadata-only',
  external: 'open-external'
};
