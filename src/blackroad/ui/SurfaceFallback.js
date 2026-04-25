// BlackRoad OS — SurfaceFallback
// Clean fallback when a surface isn't available

export function SurfaceFallback({ surfaceId = '', message = '' }) {
  return `
    <div class="br-fallback">
      <div class="br-eyebrow">Surface Not Available</div>
      <h2>${surfaceId || 'Unknown'}</h2>
      <p style="color:var(--br-muted);margin:var(--br-gap-md) 0">
        ${message || 'This surface is not yet available. It may be under development or require additional permissions.'}
      </p>
      <div style="display:flex;gap:var(--br-gap-sm);margin-top:var(--br-gap-lg)">
        <a href="https://os.blackroad.io" class="br-btn br-btn--secondary">Back to RoadOS</a>
        <a href="https://docs.blackroad.io" class="br-btn br-btn--secondary">Docs</a>
      </div>
    </div>
  `;
}

export const FALLBACK_CSS = `
.br-fallback {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 300px; text-align: center; padding: var(--br-gap-2xl);
}
`;
