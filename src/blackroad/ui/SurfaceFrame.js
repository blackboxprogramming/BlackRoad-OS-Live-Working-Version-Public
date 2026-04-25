// BlackRoad OS — SurfaceFrame
// Standard window wrapper for product/app surfaces

export function SurfaceFrame({
  title = '',
  kind = 'app',
  route = '/',
  status = 'active',
  children = ''
}) {
  return `
    <div class="br-surface">
      <div class="br-surface__bar">
        <div class="br-surface__controls">
          <span class="br-surface__dot" data-status="${status}"></span>
          <span class="br-surface__title">${title}</span>
        </div>
        <div class="br-surface__meta">
          <span class="br-surface__kind">${kind}</span>
          <span class="br-surface__route">${route}</span>
        </div>
      </div>
      <div class="br-surface__body">
        ${children}
      </div>
      <div class="br-surface__footer">
        <span class="br-mono">${title} · ${kind} · ${route}</span>
      </div>
    </div>
  `;
}

export const SURFACE_CSS = `
.br-surface {
  background: var(--br-panel);
  border: 1px solid var(--br-line);
  border-radius: var(--br-radius-md);
  overflow: hidden;
  box-shadow: var(--br-shadow);
}
.br-surface__bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--br-gap-sm) var(--br-gap-md);
  border-bottom: 1px solid var(--br-line-soft);
  background: var(--br-chip);
}
.br-surface__controls { display: flex; align-items: center; gap: var(--br-gap-sm); }
.br-surface__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--br-dim); }
.br-surface__dot[data-status="active"] { background: #5a5a5a; }
.br-surface__title { font-size: 13px; color: var(--br-text); }
.br-surface__meta { display: flex; gap: var(--br-gap-md); }
.br-surface__kind { font-family: var(--br-font-mono); font-size: 10px; color: var(--br-dim); text-transform: uppercase; letter-spacing: 0.08em; }
.br-surface__route { font-family: var(--br-font-mono); font-size: 10px; color: var(--br-dim); }
.br-surface__body { padding: var(--br-gap-lg); min-height: 200px; }
.br-surface__footer {
  padding: var(--br-gap-sm) var(--br-gap-md);
  border-top: 1px solid var(--br-line-soft);
  background: var(--br-chip);
}
`;
