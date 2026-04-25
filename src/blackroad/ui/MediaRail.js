// BlackRoad OS — MediaRail
// Generic surface cards for left/right rails

export function MediaRail({ side = 'left', title = 'Archive', items = [] }) {
  const railClass = side === 'left' ? 'br-rail-l' : 'br-rail-r';

  const cards = items.map(item => `
    <div class="br-media-card" data-id="${item.id || ''}">
      <div class="br-media-card__thumb">
        ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" loading="lazy">` : ''}
      </div>
      <div class="br-media-card__info">
        <div class="br-media-card__title">${item.title || ''}</div>
        <div class="br-media-card__meta">${item.meta || ''}</div>
      </div>
    </div>
  `).join('');

  return `
    <aside class="${railClass}">
      <div class="br-rail__title">${title}</div>
      ${cards}
    </aside>
  `;
}
