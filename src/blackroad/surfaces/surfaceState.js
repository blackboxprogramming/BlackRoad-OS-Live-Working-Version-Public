// BlackRoad OS — Surface State
// Persistent surface state (positions, sizes, preferences)

const STORAGE_KEY = 'blackroad:surface-state';

function getStorage() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function saveSurfaceState(surfaceId, state) {
  const storage = getStorage();
  if (!storage) return;
  const all = loadAllState();
  all[surfaceId] = { ...all[surfaceId], ...state, updatedAt: Date.now() };
  storage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadSurfaceState(surfaceId) {
  const all = loadAllState();
  return all[surfaceId] || null;
}

export function loadAllState() {
  const storage = getStorage();
  if (!storage) return {};
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function clearSurfaceState() {
  const storage = getStorage();
  if (storage) storage.removeItem(STORAGE_KEY);
}
