// BlackRoad OS — TerminalFooter
// Footer with tagline, nav links, founder line, and copyright

import { FOOTER_NAV } from '../navModel.js';

export function TerminalFooter({
  nav = FOOTER_NAV,
  founder = 'Alexa Louise Amundson',
  company = 'BlackRoad OS, Inc.'
}) {
  const links = nav.map(n => `<a href="${n.href}" class="br-footer__link">${n.label}</a>`).join('');

  return `
    <footer class="br-footer">
      <div class="br-footer__inner">
        <div class="br-footer__nav">${links}</div>
        <div class="br-footer__meta">
          <div class="br-footer__founder">Founder: ${founder}</div>
          <div class="br-footer__company">${company} · Remember the Road. Pave Tomorrow!</div>
        </div>
      </div>
    </footer>
  `;
}

export const FOOTER_CSS = `
.br-footer { border-top: 1px solid var(--br-line-soft); padding: var(--br-gap-xl) var(--br-gap-lg); }
.br-footer__inner { max-width: var(--br-max-width); margin: 0 auto; }
.br-footer__nav { display: flex; gap: var(--br-gap-lg); flex-wrap: wrap; margin-bottom: var(--br-gap-lg); }
.br-footer__link { font-size: 13px; color: var(--br-muted); border-bottom: none; }
.br-footer__link:hover { color: var(--br-text); }
.br-footer__meta { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); }
.br-footer__founder { margin-bottom: var(--br-gap-xs); }
.br-footer__company { }
`;
