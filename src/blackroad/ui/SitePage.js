// BlackRoad OS — SitePage
// Renders a full page from registry data inside SiteShell

import { PRODUCTS } from '../products.js';
import { buildProductPage, buildSitePage } from '../siteTemplates.js';
import { buildOpenGraph, buildMetaTags } from '../openGraph.js';
import { buildSchemaTag } from '../schemaOrg.js';
import { HeroPanel } from './HeroPanel.js';
import { SurfaceFrame } from './SurfaceFrame.js';
import { TrustNotice } from './TrustNotice.js';

// Page layout configs by type
const LAYOUTS = {
  root: { showRails: true, showHero: true, showLauncher: true, showStats: true },
  product: { showRails: false, showHero: true, showLauncher: false, showStats: false },
  runtime: { showRails: true, showHero: false, showLauncher: true, showStats: true },
  docs: { showRails: false, showHero: false, showLauncher: false, showStats: false },
  agent: { showRails: false, showHero: true, showLauncher: false, showStats: false },
  status: { showRails: false, showHero: false, showLauncher: false, showStats: true },
  trust: { showRails: false, showHero: false, showLauncher: false, showStats: false },
  legal: { showRails: false, showHero: false, showLauncher: false, showStats: false },
  archive: { showRails: true, showHero: false, showLauncher: false, showStats: false },
  live: { showRails: true, showHero: false, showLauncher: false, showStats: false },
  search: { showRails: false, showHero: false, showLauncher: false, showStats: false }
};

export function getLayout(pageType) {
  return LAYOUTS[pageType] || LAYOUTS.product;
}

// Build the <head> content for a page
export function buildHead(domain, path = '/') {
  const metaTags = buildMetaTags(domain, path);
  const schemaTag = buildSchemaTag(domain);

  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${metaTags}
    ${schemaTag}
    <link rel="manifest" href="/manifest.json">
    <link rel="sitemap" href="/sitemap.xml">
  `;
}

// Render a product page's main content
export function renderProductContent(productId, pageId = 'home') {
  const pageData = buildProductPage(productId, pageId);
  if (!pageData) return '';

  let content = '';

  if (pageId === 'home') {
    content += HeroPanel({
      eyebrow: pageData.eyebrow,
      headline: pageData.headline,
      subheadline: pageData.subheadline,
      primaryCTA: pageData.primaryCTA,
      secondaryCTA: pageData.secondaryCTA
    });

    // Render sections
    for (const section of pageData.sections) {
      content += renderSection(section);
    }
  } else if (pageId === 'trust') {
    content += `<h1>${pageData.headline}</h1>`;
    content += TrustNotice();
  } else if (pageId === 'open') {
    content += `
      <div class="br-section" style="text-align:center;padding:var(--br-gap-2xl) 0;">
        <h1>Opening ${pageData.headline}...</h1>
        <p class="br-mono" style="margin-top:var(--br-gap-md);">Redirecting to os.blackroad.io</p>
        <a href="${pageData.primaryCTA?.url || 'https://os.blackroad.io'}" class="br-btn br-btn--primary" style="margin-top:var(--br-gap-lg);">Launch in RoadOS</a>
      </div>
    `;
  } else {
    content += `
      <div class="br-section">
        <div class="br-eyebrow">${pageData.eyebrow}</div>
        <h1>${pageData.headline}</h1>
        <p style="color:var(--br-muted);margin-top:var(--br-gap-md);">${pageData.subheadline}</p>
      </div>
    `;
  }

  return SurfaceFrame({
    title: pageData.title,
    kind: 'product',
    route: pageData.path,
    children: content
  });
}

// Render a landing page section
function renderSection(section) {
  switch (section.type) {
    case 'replaces':
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div><p style="color:var(--br-muted)">${section.text}</p></div>`;

    case 'audience':
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div><p style="color:var(--br-muted)">${section.text}</p></div>`;

    case 'connects':
      const items = section.items.map(i => `<a href="https://${i.domain}" class="br-product-card"><div class="br-product-card__name">${i.name}</div><div class="br-product-card__line">${i.oneLine}</div></a>`).join('');
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:var(--br-gap-md)">${items}</div></div>`;

    case 'agent-layer':
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div><p style="color:var(--br-muted)">${section.text}</p></div>`;

    case 'os-integration':
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div><p style="color:var(--br-muted)">${section.text}</p><div style="margin-top:var(--br-gap-md)"><a href="${section.cta.url}" class="br-btn br-btn--secondary">${section.cta.label}</a></div></div>`;

    case 'trust':
      const qas = section.items.map(i => `<div style="margin-bottom:var(--br-gap-md)"><div class="br-mono" style="margin-bottom:var(--br-gap-xs)">${i.question}</div><p style="color:var(--br-muted);font-size:13px">${i.answer}</p></div>`).join('');
      return `<div class="br-section"><div class="br-section-title">${section.heading}</div>${qas}<p class="br-mono" style="margin-top:var(--br-gap-lg);font-size:11px">${section.roadNodeCopy}</p></div>`;

    default:
      return '';
  }
}
