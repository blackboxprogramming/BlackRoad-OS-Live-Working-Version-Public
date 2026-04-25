// BlackRoad OS — TopBar
// Displays: BLACKROAD / section, page title, status chips, time, Open RoadOS

export function TopBar({ section = '', title = '', status = 'active' }) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return `
    <header class="br-topbar">
      <div class="br-topbar__left">
        <span class="br-topbar__brand">BLACKROAD</span>
        ${section ? `<span class="br-topbar__sep">/</span><span class="br-topbar__section">${section}</span>` : ''}
      </div>
      <div class="br-topbar__center">
        <span class="br-topbar__title">${title}</span>
      </div>
      <div class="br-topbar__right">
        <span class="br-topbar__status" data-status="${status}"></span>
        <span class="br-topbar__time">${time}</span>
        <a href="https://os.blackroad.io" class="br-btn br-btn--primary br-topbar__cta">Open RoadOS</a>
      </div>
    </header>
  `;
}

export const TOP_BAR_CSS = `
.br-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--br-gap-lg);
  border-bottom: 1px solid var(--br-line-soft);
  background: var(--br-bg);
  height: var(--br-topbar-height);
  position: sticky;
  top: 0;
  z-index: 90;
}
.br-topbar__left { display: flex; align-items: center; gap: var(--br-gap-sm); }
.br-topbar__brand { font-family: var(--br-font-mono); font-size: 12px; letter-spacing: 0.15em; color: var(--br-muted); }
.br-topbar__sep { color: var(--br-dim); font-size: 12px; }
.br-topbar__section { font-family: var(--br-font-mono); font-size: 12px; color: var(--br-dim); }
.br-topbar__center { flex: 1; text-align: center; }
.br-topbar__title { font-size: 13px; color: var(--br-muted); }
.br-topbar__right { display: flex; align-items: center; gap: var(--br-gap-md); }
.br-topbar__status { width: 6px; height: 6px; border-radius: 50%; background: var(--br-dim); }
.br-topbar__status[data-status="active"] { background: #4a4a4a; }
.br-topbar__time { font-family: var(--br-font-mono); font-size: 11px; color: var(--br-dim); }
.br-topbar__cta { font-size: 11px; padding: 4px 12px; border-radius: 6px; border-bottom: none; }
@media (max-width: 640px) {
  .br-topbar__center { display: none; }
  .br-topbar__time { display: none; }
}
`;
