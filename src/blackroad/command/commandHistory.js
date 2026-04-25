// BlackRoad OS — Command History
// Stores last 50 commands in localStorage. Never stores secrets.

const STORAGE_KEY = 'blackroad:command-history';
const MAX_ENTRIES = 50;

// Patterns that should never be stored
const BLOCKED_PATTERNS = [
  /password/i, /secret/i, /token/i, /api[_-]?key/i,
  /bearer\s/i, /auth[_-]?token/i, /private[_-]?key/i,
  /sk_live/i, /sk_test/i, /ghp_/i, /gho_/i
];

function isSafe(query) {
  return !BLOCKED_PATTERNS.some(p => p.test(query));
}

function getStorage() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function addToHistory(query, result) {
  const storage = getStorage();
  if (!storage || !isSafe(query)) return;

  const history = getHistory();
  history.unshift({
    query,
    type: result?.type || 'unknown',
    label: result?.label || '',
    surfaceId: result?.surfaceId || '',
    timestamp: Date.now()
  });

  // Keep only last N
  const trimmed = history.slice(0, MAX_ENTRIES);
  storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getHistory() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearHistory() {
  const storage = getStorage();
  if (storage) storage.removeItem(STORAGE_KEY);
}

export function getRecentCommands(limit = 10) {
  return getHistory().slice(0, limit);
}
