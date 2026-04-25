// BlackRoad OS — TrustNotice
// RoadNode consent + RoadOS description notice

import { UNIVERSAL_COPY } from '../productCopy.js';

export function TrustNotice() {
  return `
    <div class="br-trust-notice br-card">
      <div class="br-trust-notice__section">
        <div class="br-trust-notice__label">RoadOS</div>
        <p class="br-trust-notice__text">${UNIVERSAL_COPY.roadOsDescription}</p>
      </div>
      <div class="br-trust-notice__section">
        <div class="br-trust-notice__label">RoadNode</div>
        <p class="br-trust-notice__text">${UNIVERSAL_COPY.roadNodeConsent}</p>
      </div>
    </div>
  `;
}

export const TRUST_CSS = `
.br-trust-notice { display: flex; flex-direction: column; gap: var(--br-gap-lg); }
.br-trust-notice__label { font-family: var(--br-font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--br-dim); margin-bottom: var(--br-gap-xs); }
.br-trust-notice__text { font-size: 13px; color: var(--br-muted); line-height: 1.6; }
`;
