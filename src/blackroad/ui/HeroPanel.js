// BlackRoad OS — HeroPanel
// Eyebrow, headline, subheadline, CTAs, quick actions

export function HeroPanel({
  eyebrow = 'SOVEREIGN SYSTEM SURFACE',
  headline = '',
  subheadline = '',
  primaryCTA = null,
  secondaryCTA = null,
  quickActions = []
}) {
  const ctaHtml = [
    primaryCTA ? `<a href="${primaryCTA.url}" class="br-btn br-btn--primary">${primaryCTA.label}</a>` : '',
    secondaryCTA ? `<a href="${secondaryCTA.url}" class="br-btn br-btn--secondary">${secondaryCTA.label}</a>` : ''
  ].filter(Boolean).join('');

  const quickHtml = quickActions.map(a => `
    <a href="${a.url}" class="br-quick-card">${a.label}</a>
  `).join('');

  return `
    <section class="br-hero br-section">
      <div class="br-eyebrow">${eyebrow}</div>
      <h1 class="br-hero__headline">${headline}</h1>
      <p class="br-hero__sub">${subheadline}</p>
      ${ctaHtml ? `<div class="br-hero__ctas">${ctaHtml}</div>` : ''}
      ${quickHtml ? `<div class="br-hero__quick">${quickHtml}</div>` : ''}
    </section>
  `;
}

export const HERO_CSS = `
.br-hero { max-width: 720px; }
.br-hero__headline { margin-bottom: var(--br-gap-md); }
.br-hero__sub { color: var(--br-muted); font-size: 15px; line-height: 1.6; margin-bottom: var(--br-gap-lg); }
.br-hero__ctas { display: flex; gap: var(--br-gap-md); margin-bottom: var(--br-gap-lg); flex-wrap: wrap; }
.br-hero__quick { display: flex; gap: var(--br-gap-sm); flex-wrap: wrap; }
`;
