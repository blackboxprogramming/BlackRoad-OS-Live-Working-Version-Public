// BlackRoad OS — Navigation Model
// Consistent navigation across every BlackRoad website

// Top navigation — appears on every site
export const TOP_NAV = [
  { label: 'Open RoadOS', href: 'https://os.blackroad.io', primary: true },
  { label: 'Products', href: 'https://blackroad.io/products' },
  { label: 'Agents', href: 'https://agents.blackroad.io' },
  { label: 'Docs', href: 'https://docs.blackroad.io' },
  { label: 'Status', href: 'https://status.blackroad.io' },
  { label: 'Search', href: 'https://search.blackroad.io' }
];

// Footer navigation — appears on every site
export const FOOTER_NAV = [
  { label: 'Company', href: 'https://blackroad.company' },
  { label: 'Docs', href: 'https://docs.blackroad.io' },
  { label: 'Security', href: 'https://security.blackroad.io' },
  { label: 'Legal', href: 'https://legal.blackroad.io' },
  { label: 'Status', href: 'https://status.blackroad.io' },
  { label: 'Agents', href: 'https://agents.blackroad.io' },
  { label: 'RoadOS', href: 'https://os.blackroad.io' }
];

// Product page navigation — appears on product sites
export const PRODUCT_NAV = [
  { label: 'Overview', path: '/' },
  { label: 'Use', path: '/use' },
  { label: 'Demo', path: '/demo' },
  { label: 'Docs', path: '/docs' },
  { label: 'Trust', path: '/trust' },
  { label: 'Open in RoadOS', path: '/open', primary: true }
];

// Runtime app navigation — appears inside RoadOS surfaces
export const RUNTIME_NAV = [
  { label: 'Open', action: 'open' },
  { label: 'Command Dock', action: 'dock' },
  { label: 'Surfaces', action: 'surfaces' },
  { label: 'Agents', action: 'agents' },
  { label: 'Settings', action: 'settings' },
  { label: 'Status', action: 'status' }
];

// Get navigation for a specific site type
export function getNavForType(type) {
  switch (type) {
    case 'product': return { top: TOP_NAV, sub: PRODUCT_NAV, footer: FOOTER_NAV };
    case 'runtime': return { top: TOP_NAV, sub: RUNTIME_NAV, footer: FOOTER_NAV };
    default: return { top: TOP_NAV, sub: null, footer: FOOTER_NAV };
  }
}

// Build product sub-nav with domain-specific hrefs
export function buildProductNav(domain) {
  return PRODUCT_NAV.map(item => ({
    ...item,
    href: `https://${domain}${item.path}`
  }));
}
