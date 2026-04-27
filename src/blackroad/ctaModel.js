// BlackRoad OS — CTA Model
// Call-to-action patterns for every page type

import { PRODUCTS } from './products.js';

// Standard CTA patterns by page type
export const CTA_PATTERNS = {
  home: (product) => ({
    ...(product.id === 'roadworld'
      ? {
          primary: { label: 'Open okReusePixel', url: 'https://blackroad.io/home/apps/OkReusePixel/' },
          secondary: { label: 'Open PixelTown', url: 'https://blackroad.io/home/apps/PixelTown/' }
        }
      : {
          primary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` },
          secondary: { label: 'Learn more', url: `https://${product.domain}/about` }
        })
  }),
  about: (product) => ({
    primary: { label: `Try ${product.name}`, url: `https://${product.domain}/demo` },
    secondary: { label: 'Read docs', url: `https://${product.domain}/docs` }
  }),
  use: (product) => ({
    primary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` },
    secondary: { label: 'See demo', url: `https://${product.domain}/demo` }
  }),
  demo: (product) => ({
    primary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` },
    secondary: { label: 'Back to overview', url: `https://${product.domain}/` }
  }),
  docs: (product) => ({
    primary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` },
    secondary: { label: 'Full docs', url: 'https://docs.blackroad.io' }
  }),
  status: (product) => ({
    primary: { label: 'System status', url: 'https://status.blackroad.io' },
    secondary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` }
  }),
  open: (product) => ({
    primary: { label: `Launch ${product.name} in RoadOS`, url: `https://os.blackroad.io/open/${product.id}` },
    secondary: { label: 'What is RoadOS?', url: 'https://os.blackroad.io/about' }
  }),
  api: (product) => ({
    primary: { label: 'API reference', url: 'https://api.blackroad.io' },
    secondary: { label: `Open ${product.name}`, url: `https://os.blackroad.io/open/${product.id}` }
  }),
  trust: (product) => ({
    primary: { label: 'Security model', url: 'https://security.blackroad.io' },
    secondary: { label: 'Manage permissions', url: 'https://account.blackroad.io/permissions' }
  }),
  contact: (product) => ({
    primary: { label: 'Get support', url: 'https://support.blackroad.io' },
    secondary: { label: 'Community', url: `https://${product.domain}/contact` }
  })
};

// Generate CTAs for a specific product and page
export function getCTAs(productId, pageId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;
  const pattern = CTA_PATTERNS[pageId];
  if (!pattern) return null;
  return pattern(product);
}
