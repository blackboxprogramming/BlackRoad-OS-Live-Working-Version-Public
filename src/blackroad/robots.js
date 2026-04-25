// BlackRoad OS — robots.txt Generator
// Controls crawler access for every BlackRoad site

import { PRODUCTS } from './products.js';
import { SITES } from './sites.js';

// Universal disallow paths
const DISALLOW_PATHS = [
  '/admin',
  '/account',
  '/settings',
  '/session',
  '/private',
  '/internal',
  '/api/private',
  '/api/write',
  '/api/mutate',
  '/api/internal'
];

// Universal allow paths
const ALLOW_PATHS = [
  '/',
  '/about',
  '/use',
  '/demo',
  '/docs',
  '/status',
  '/trust',
  '/contact',
  '/open',
  '/sitemap.xml',
  '/llms.txt',
  '/robots.txt',
  '/manifest.json',
  '/site.json'
];

// Generate robots.txt for a domain
export function buildRobots(domain) {
  const disallows = DISALLOW_PATHS.map(p => `Disallow: ${p}`).join('\n');
  const allows = ALLOW_PATHS.map(p => `Allow: ${p}`).join('\n');

  return `# BlackRoad OS — ${domain}
# https://${domain}

User-agent: *
${allows}
${disallows}

# AI crawlers welcome on public pages
User-agent: GPTBot
${allows}
${disallows}

User-agent: ChatGPT-User
${allows}
${disallows}

User-agent: Claude-Web
${allows}
${disallows}

User-agent: Applebot-Extended
${allows}
${disallows}

User-agent: Google-Extended
${allows}
${disallows}

Sitemap: https://${domain}/sitemap.xml

# BlackRoad OS, Inc.
# Remember the Road. Pave Tomorrow!
`;
}

// Generate robots.txt for all domains
export function buildAllRobots() {
  const allDomains = [
    ...PRODUCTS.map(p => p.domain),
    ...SITES.filter(s => s.type !== 'agent').map(s => s.domain)
  ];
  const unique = [...new Set(allDomains)];
  return unique.map(d => ({ domain: d, content: buildRobots(d) }));
}
