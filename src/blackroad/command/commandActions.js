// BlackRoad OS — Command Actions
// Executes routed commands: open surfaces, emit events, log

import { route } from './commandRouter.js';

// Event emitter (browser-compatible)
function emit(name, detail) {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

// Console log prefix
const LOG = '[BlackRoad Command]';

// Execute a raw command string
export function execute(raw) {
  const result = route(raw);

  emit('blackroad:command-submitted', { query: raw, result });

  if (result.action === 'error' || result.type === 'none') {
    console.log(`${LOG} no route "${raw}"`);
    emit('blackroad:command-no-route', { query: raw });
    return result;
  }

  console.log(`${LOG} routed "${raw}" -> ${result.surfaceId || result.url}`);

  if (result.action === 'open') {
    emit('blackroad:command-routed', result);
    emit('blackroad:surface-opened', { surfaceId: result.surfaceId, url: result.url });
  }

  if (result.action === 'search') {
    emit('blackroad:search-started', { query: result.targetId, url: result.url });
  }

  return result;
}

// Navigate to result (browser only)
export function navigate(result) {
  if (result.url && typeof window !== 'undefined') {
    window.location.href = result.url;
  }
}

// Open result as surface (emits event for SurfaceRuntime to handle)
export function openSurface(result) {
  emit('blackroad:surface-opened', {
    surfaceId: result.surfaceId,
    url: result.url,
    type: result.type,
    label: result.label,
    message: result.message
  });
  return result;
}
