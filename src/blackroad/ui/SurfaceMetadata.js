// BlackRoad OS — SurfaceMetadata
// Metadata panel shown at the bottom of surfaces

export function SurfaceMetadata({ surface }) {
  if (!surface) return '';

  return `
    <div class="br-surface-meta">
      <span class="br-surface-meta__item">ID: ${surface.id}</span>
      <span class="br-surface-meta__item">Kind: ${surface.kind}</span>
      ${surface.domain ? `<span class="br-surface-meta__item">Domain: ${surface.domain}</span>` : ''}
      <span class="br-surface-meta__item">Mode: ${surface.openMode}</span>
      ${surface.lastOpenedAt ? `<span class="br-surface-meta__item">Opened: ${new Date(surface.lastOpenedAt).toLocaleTimeString()}</span>` : ''}
    </div>
  `;
}

export const METADATA_CSS = `
.br-surface-meta {
  display: flex; gap: var(--br-gap-lg); flex-wrap: wrap;
  font-family: var(--br-font-mono); font-size: 10px; color: var(--br-dim);
  padding: var(--br-gap-sm) 0;
}
.br-surface-meta__item { white-space: nowrap; }
`;
