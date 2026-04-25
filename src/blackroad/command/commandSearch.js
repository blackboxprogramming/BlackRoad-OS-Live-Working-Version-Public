// BlackRoad OS — Command Search
// Fuzzy search across products, agents, sites, and system commands

import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { AGENTS, SYSTEM_COMMANDS } from './commandRegistry.js';

// Simple fuzzy match: does target contain all chars of query in order?
function fuzzyMatch(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring
  if (t.includes(q)) return { match: true, score: q.length / t.length + 0.5 };

  // Fuzzy char-by-char
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  if (qi === q.length) return { match: true, score: q.length / t.length };
  return { match: false, score: 0 };
}

// Search all registries
export function search(query, limit = 10) {
  if (!query || query.length < 1) return [];

  const results = [];

  // Products
  for (const p of PRODUCTS) {
    const nameMatch = fuzzyMatch(query, p.name);
    const idMatch = fuzzyMatch(query, p.id);
    const lineMatch = fuzzyMatch(query, p.oneLine);
    const best = Math.max(nameMatch.score, idMatch.score, lineMatch.score * 0.7);
    if (nameMatch.match || idMatch.match || lineMatch.match) {
      results.push({ type: 'product', id: p.id, label: p.name, detail: p.oneLine, score: best });
    }
  }

  // Agents
  for (const a of AGENTS) {
    const nameMatch = fuzzyMatch(query, a.name);
    const idMatch = fuzzyMatch(query, a.id);
    const roleMatch = fuzzyMatch(query, a.role);
    const best = Math.max(nameMatch.score, idMatch.score, roleMatch.score * 0.6);
    if (nameMatch.match || idMatch.match || roleMatch.match) {
      results.push({ type: 'agent', id: a.id, label: a.name, detail: a.role, score: best });
    }
  }

  // Sites (non-agent)
  for (const s of SITES.filter(s => s.type !== 'agent')) {
    const titleMatch = fuzzyMatch(query, s.title);
    const domainMatch = fuzzyMatch(query, s.domain);
    const purposeMatch = fuzzyMatch(query, s.purpose);
    const best = Math.max(titleMatch.score, domainMatch.score, purposeMatch.score * 0.5);
    if (titleMatch.match || domainMatch.match || purposeMatch.match) {
      results.push({ type: 'site', id: s.id, label: s.title, detail: s.domain, score: best });
    }
  }

  // System commands
  for (const [key, sys] of Object.entries(SYSTEM_COMMANDS)) {
    const keyMatch = fuzzyMatch(query, key);
    const labelMatch = fuzzyMatch(query, sys.label);
    const best = Math.max(keyMatch.score, labelMatch.score);
    if (keyMatch.match || labelMatch.match) {
      results.push({ type: 'system', id: key, label: sys.label, detail: key, score: best });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
