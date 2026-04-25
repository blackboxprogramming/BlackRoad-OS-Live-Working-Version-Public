// BlackRoad OS — SiteShell
// The master layout component. Every BlackRoad website renders inside this.
//
// BLACKROAD VISUAL CONTRACT
// Every BlackRoad website must look like a window, surface, road, dock,
// rail, terminal, or launcher inside the same operating system.
// No isolated landing pages. No random templates. No detached brands.
// The web is the OS. The OS is the website. The dock routes everything.

import { PRODUCTS } from '../products.js';
import { UNIVERSAL_COPY } from '../productCopy.js';
import { FOOTER_NAV } from '../navModel.js';
import { TopBar, TOP_BAR_CSS } from './TopBar.js';
import { MediaRail } from './MediaRail.js';
import { HeroPanel, HERO_CSS } from './HeroPanel.js';
import { QuickActions, QUICK_CSS } from './QuickActions.js';
import { StatsRow, DEFAULT_STATS, STATS_CSS } from './StatsRow.js';
import { ProductLauncherGrid, LAUNCHER_CSS } from './ProductLauncherGrid.js';
import { CommandDock } from './CommandDock.js';
import { TerminalFooter, FOOTER_CSS } from './TerminalFooter.js';
import { SurfaceFrame, SURFACE_CSS } from './SurfaceFrame.js';
import { TrustNotice, TRUST_CSS } from './TrustNotice.js';
import { getLayout, buildHead } from './SitePage.js';

export function SiteShell({
  site = {},
  pageType = 'root',
  currentSurface = null,
  products = PRODUCTS,
  agents = [],
  mediaItems = [],
  stats = DEFAULT_STATS,
  quickActions = [],
  children = ''
}) {
  const layout = getLayout(pageType);
  const section = site.title || '';
  const title = currentSurface || site.purpose || '';

  // TopBar
  const topbar = TopBar({ section, title });

  // Media rails
  const leftRail = layout.showRails
    ? MediaRail({ side: 'left', title: 'Archive', items: mediaItems.slice(0, 6) })
    : '';
  const rightRail = layout.showRails
    ? MediaRail({ side: 'right', title: 'Live', items: mediaItems.slice(6, 12) })
    : '';

  // Main content
  let main = '';

  if (!children) {
    // Default homepage content
    if (pageType === 'root') {
      main += HeroPanel({
        eyebrow: 'SOVEREIGN SYSTEM SURFACE',
        headline: 'Products, agents, archive search, and live reactions in one dock.',
        subheadline: 'Use the launcher for fast entry, search the archive from the bottom bar, or jump straight into the core system surfaces from the quick actions.',
        primaryCTA: { label: 'Open RoadOS', url: 'https://os.blackroad.io' },
        secondaryCTA: { label: 'Browse products', url: 'https://blackroad.io/products' },
        quickActions
      });

      if (layout.showStats) {
        main += StatsRow({ stats });
      }

      if (layout.showLauncher) {
        main += ProductLauncherGrid({ products });
      }
    }
  } else {
    main = children;
  }

  // Footer (inside main, above dock)
  const footer = TerminalFooter({});

  // Command dock
  const dock = CommandDock({});

  return `
    <div class="br-shell" data-page-type="${pageType}">
      ${topbar}
      ${leftRail || '<div class="br-rail-l" style="display:none"></div>'}
      <main class="br-main">
        ${main}
        ${footer}
      </main>
      ${rightRail || '<div class="br-rail-r" style="display:none"></div>'}
      ${dock}
    </div>
  `;
}

// Full HTML page generator
export function renderFullPage({
  domain = 'blackroad.io',
  path = '/',
  pageType = 'root',
  site = {},
  children = '',
  products = PRODUCTS,
  mediaItems = [],
  stats = DEFAULT_STATS,
  quickActions = []
}) {
  const head = buildHead(domain, path);
  const title = site.title ? `${site.title} | BlackRoad OS` : 'BlackRoad OS — Remember the Road. Pave Tomorrow!';

  const shell = SiteShell({
    site,
    pageType,
    products,
    mediaItems,
    stats,
    quickActions,
    children
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${title}</title>
  ${head}
  <style>
    @import url('./styles/tokens.css');
    @import url('./styles/shell.css');
    @import url('./styles/cards.css');
    @import url('./styles/dock.css');
    @import url('./styles/rails.css');
    @import url('./styles/responsive.css');
    ${TOP_BAR_CSS}
    ${HERO_CSS}
    ${QUICK_CSS}
    ${STATS_CSS}
    ${LAUNCHER_CSS}
    ${FOOTER_CSS}
    ${SURFACE_CSS}
    ${TRUST_CSS}
  </style>
</head>
<body>
  ${shell}
  <script>
    // Command dock keyboard shortcut
    document.addEventListener('keydown', function(e) {
      if (e.key === '/') {
        const input = document.querySelector('.br-dock__input');
        if (input && document.activeElement !== input) {
          e.preventDefault();
          input.focus();
        }
      }
      if (e.key === 'Escape') {
        const input = document.querySelector('.br-dock__input');
        if (input) { input.blur(); input.value = ''; }
      }
    });
  </script>
</body>
</html>`;
}

// Export all component CSS for external use
export const ALL_COMPONENT_CSS = [
  TOP_BAR_CSS, HERO_CSS, QUICK_CSS, STATS_CSS,
  LAUNCHER_CSS, FOOTER_CSS, SURFACE_CSS, TRUST_CSS
].join('\n');
