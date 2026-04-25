// BlackRoad OS — Command Suggestions
// Live suggestions as user types in the dock

import { search } from './commandSearch.js';
import { getRecentCommands } from './commandHistory.js';

// Get suggestions for current input
export function getSuggestions(input, limit = 8) {
  if (!input || input.length < 1) {
    // Show recent commands when empty
    return getRecentCommands(limit).map(h => ({
      type: h.type,
      id: h.surfaceId,
      label: h.label || h.query,
      detail: h.query,
      source: 'history'
    }));
  }

  // Strip verb prefix for search
  const searchQuery = input
    .replace(/^(open|search|docs?|agent|site|product|go|status|trust|health|surface)\s+/i, '')
    .trim();

  if (!searchQuery) return [];

  const results = search(searchQuery, limit);
  return results.map(r => ({
    type: r.type,
    id: r.id,
    label: r.label,
    detail: r.detail,
    source: 'search'
  }));
}

// Format suggestion for display
export function formatSuggestion(suggestion) {
  const typeLabel = {
    product: 'Product',
    agent: 'Agent',
    site: 'Site',
    system: 'System',
    history: 'Recent'
  };
  return {
    ...suggestion,
    typeLabel: typeLabel[suggestion.type] || suggestion.type,
    command: suggestion.type === 'agent'
      ? `open ${suggestion.id}`
      : suggestion.type === 'product'
        ? `open ${suggestion.id}`
        : suggestion.type === 'system'
          ? `open ${suggestion.id}`
          : `open ${suggestion.id}`
  };
}
