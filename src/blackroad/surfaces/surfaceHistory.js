// BlackRoad OS — Surface History
// Tracks last 50 opened surfaces locally

const STORAGE_KEY = 'blackroad:surface-history';
const MAX_ENTRIES = 50;

function getStorage() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function addToSurfaceHistory(surface) {
  const storage = getStorage();
  if (!storage) return;

  const history = getSurfaceHistory();
  history.unshift({
    id: surface.id,
    kind: surface.kind,
    title: surface.title,
    timestamp: Date.now()
  });

  const trimmed = history.slice(0, MAX_ENTRIES);
  storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getSurfaceHistory() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearSurfaceHistory() {
  const storage = getStorage();
  if (storage) storage.removeItem(STORAGE_KEY);
}

export function getRecentSurfaces(limit = 10) {
  return getSurfaceHistory().slice(0, limit);
}
