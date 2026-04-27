function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function badge(value) {
  return `<span class="media-badge">${escapeHtml(value)}</span>`;
}

function makeBackground(surface) {
  if (surface.thumbnail) {
    return `background-image: linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.46)), url("${surface.thumbnail}");`;
  }
  return '';
}

export function createMediaCard(surface, { onOpen } = {}) {
  const element = document.createElement('div');
  element.className = 'video media-card';
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', `Open ${surface.title}`);
  element.dataset.surfaceId = surface.id;
  element.innerHTML = `
    <div class="thumb media-thumb" style="${makeBackground(surface)}">
      <div class="media-badges">
        ${badge(surface.provider)}
        ${badge(surface.kind)}
      </div>
      <div class="media-status">${escapeHtml(surface.status)}</div>
      <div class="thumb-label">${escapeHtml(surface.rights)}</div>
    </div>
    <div class="vmeta">
      <div class="name">${escapeHtml(surface.title)}</div>
      <div class="pill">${escapeHtml(surface.subtitle || surface.kind)}</div>
    </div>
  `;

  const activate = () => onOpen?.(surface, element);
  element.addEventListener('click', activate);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });

  return element;
}

