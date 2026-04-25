// BlackRoad OS — Surface Runtime
// Opens, manages, and tracks surfaces inside RoadOS

import { getSurface, ALL_SURFACES } from './surfaceRegistry.js';
import { UNIVERSAL_COPY } from '../productCopy.js';

// Active surfaces (in-memory state)
let activeSurfaces = [];
let focusedSurfaceId = null;

// Open a surface by id
export function openSurface(surfaceId) {
  let surface = getSurface(surfaceId);

  if (!surface) {
    // Unknown surface — create a fallback
    surface = {
      id: surfaceId,
      kind: 'external',
      title: surfaceId,
      subtitle: 'Unknown surface',
      openMode: 'placeholder',
      fallbackMode: 'not-available',
      status: 'unknown'
    };
  }

  // Security gates
  if (surface.kind === 'capture') {
    // Do NOT auto-start — just show the permission surface
    surface = { ...surface, _gated: true, _gateMessage: 'Screen capture requires explicit permission.' };
  }

  if (surface.kind === 'roadnode') {
    // Do NOT auto-enable — show opt-in surface
    surface = { ...surface, _gated: true, _gateMessage: UNIVERSAL_COPY.roadNodeConsent };
  }

  // Track
  surface.lastOpenedAt = new Date().toISOString();
  const existing = activeSurfaces.findIndex(s => s.id === surfaceId);
  if (existing >= 0) {
    activeSurfaces[existing] = surface;
  } else {
    activeSurfaces.push(surface);
  }
  focusedSurfaceId = surfaceId;

  console.log(`[BlackRoad Surface] opened ${surfaceId} (${surface.kind})`);
  return surface;
}

// Close a surface
export function closeSurface(surfaceId) {
  activeSurfaces = activeSurfaces.filter(s => s.id !== surfaceId);
  if (focusedSurfaceId === surfaceId) {
    focusedSurfaceId = activeSurfaces.length > 0 ? activeSurfaces[activeSurfaces.length - 1].id : null;
  }
}

// Focus a surface
export function focusSurface(surfaceId) {
  if (activeSurfaces.some(s => s.id === surfaceId)) {
    focusedSurfaceId = surfaceId;
  }
}

// Get active surfaces
export function getActiveSurfaces() { return [...activeSurfaces]; }
export function getFocusedSurface() { return activeSurfaces.find(s => s.id === focusedSurfaceId) || null; }
export function getFocusedId() { return focusedSurfaceId; }

// Open from command result
export function openFromCommandResult(result) {
  if (!result || result.action === 'error') return null;

  const surfaceId = result.surfaceId;
  if (surfaceId) return openSurface(surfaceId);

  // Fallback: create an external surface from URL
  if (result.url) {
    return openSurface(result.url);
  }

  return null;
}

// Reset
export function resetRuntime() {
  activeSurfaces = [];
  focusedSurfaceId = null;
}
