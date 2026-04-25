// BlackRoad OS — Command Parser
// Normalizes and parses raw dock input into structured command objects

// Normalize input: lowercase, trim, strip extra punctuation/spaces
export function normalize(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s:./\-@?=&]/g, '')
    .replace(/\s+/g, ' ');
}

// Parse normalized input into { verb, target, args }
export function parse(raw) {
  const input = normalize(raw);
  if (!input) return { verb: null, target: null, args: null, raw: '' };

  // Verb + target patterns
  const patterns = [
    { regex: /^open\s+(.+)$/, verb: 'open' },
    { regex: /^search\s+(.+)$/, verb: 'search' },
    { regex: /^docs?\s+(.+)$/, verb: 'docs' },
    { regex: /^agent\s+(.+)$/, verb: 'agent' },
    { regex: /^site\s+(.+)$/, verb: 'site' },
    { regex: /^product\s+(.+)$/, verb: 'product' },
    { regex: /^go\s+(.+)$/, verb: 'go' },
    { regex: /^status\s+(.+)$/, verb: 'status' },
    { regex: /^trust\s+(.+)$/, verb: 'trust' },
    { regex: /^health\s+(.+)$/, verb: 'health' },
    { regex: /^surface\s+(.+)$/, verb: 'surface' }
  ];

  for (const p of patterns) {
    const match = input.match(p.regex);
    if (match) {
      return { verb: p.verb, target: match[1].trim(), args: null, raw: input };
    }
  }

  // No verb — treat entire input as implicit search/open target
  return { verb: 'implicit', target: input, args: null, raw: input };
}
