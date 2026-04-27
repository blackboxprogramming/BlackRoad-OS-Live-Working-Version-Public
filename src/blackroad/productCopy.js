// BlackRoad OS — Product Copy
// Marketing and UI copy for every product

import { PRODUCTS } from './products.js';

// The 8 questions every site must answer
export const SITE_RULEBOOK = [
  'What is this road?',
  'Who is it for?',
  'What does it replace?',
  'What can I do here?',
  'What does it connect to?',
  'What does it remember?',
  'What permissions does it need?',
  'How do I open it inside RoadOS?'
];

// Universal copy blocks
export const UNIVERSAL_COPY = {
  roadOsDescription: 'RoadOS is a portable browser computer. Log in from any supported device and recover your apps, agents, files, surfaces, routes, and workspace inside one controlled OS tab.',
  roadNodeConsent: 'RoadNode mode is opt-in. A device only contributes approved capabilities after clear user permission. BlackRoad does not silently capture, mine, or control devices.',
  tagline: 'Remember the Road. Pave Tomorrow!',
  brandLine: 'Build anything. Remember everything. The OS for AI orchestration.',
  architectureSentence: 'BlackRoad websites are not separate islands. They are public doors into one portable browser computer.'
};

// Generate copy for a product answering all 8 rulebook questions
export function getProductCopy(productId) {
  const p = PRODUCTS.find(pr => pr.id === productId);
  if (!p) return null;

  const connected = p.connectedProducts
    .map(id => PRODUCTS.find(pr => pr.id === id))
    .filter(Boolean);

  return {
    id: p.id,
    name: p.name,

    // 1. What is this road?
    whatIsThis: p.longDescription,

    // 2. Who is it for?
    whoIsItFor: `${p.name} is built for ${p.primaryUser}.`,

    // 3. What does it replace?
    whatDoesItReplace: p.replaces,

    // 4. What can I do here?
    whatCanIDo: `Open ${p.name} to ${p.oneLine.toLowerCase().replace(/^the /, '')}`,

    // 5. What does it connect to?
    whatDoesItConnect: connected.map(c => `${c.name}: ${c.oneLine}`),

    // 6. What does it remember?
    whatDoesItRemember: `${p.name} persists your state through RoadChain memory checkpoints. Your work follows you across devices via RoadOS.`,

    // 7. What permissions does it need?
    whatPermissions: p.surfaceKind === 'service'
      ? `${p.name} operates as a background service. It requests only the permissions needed for its specific function. All permissions are revocable.`
      : `${p.name} runs as a Surface inside RoadOS. It can access your workspace context with your permission. All permissions are revocable.`,

    // 8. How do I open it inside RoadOS?
    howToOpen: `Open RoadOS at os.blackroad.io, then launch ${p.name} from the command dock or app grid.`,

    // Hero copy
    hero: {
      eyebrow: `BlackRoad OS / ${p.name}`,
      headline: p.oneLine,
      subheadline: p.longDescription,
      primaryCTA: p.id === 'roadworld'
        ? { label: 'Open okReusePixel', url: 'https://blackroad.io/home/apps/OkReusePixel/' }
        : { label: `Open ${p.name}`, url: `https://os.blackroad.io/open/${p.id}` },
      secondaryCTA: p.id === 'roadworld'
        ? { label: 'Open PixelTown', url: 'https://blackroad.io/home/apps/PixelTown/' }
        : { label: 'Learn more', url: `https://${p.domain}/about` }
    },

    // Footer
    footer: {
      tagline: UNIVERSAL_COPY.tagline,
      backToOS: 'https://os.blackroad.io'
    }
  };
}

// Generate all product copy
export function getAllProductCopy() {
  return PRODUCTS.map(p => getProductCopy(p.id));
}
