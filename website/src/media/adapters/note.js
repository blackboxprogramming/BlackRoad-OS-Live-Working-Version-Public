function line(label, value) {
  if (!value) return '';
  return `<div class="surface-note-row"><span class="surface-note-label">${label}</span><span>${value}</span></div>`;
}

function list(label, values) {
  if (!values?.length) return '';
  return `<div class="surface-note-row"><span class="surface-note-label">${label}</span><span>${values.join(', ')}</span></div>`;
}

export const noteAdapter = {
  id: 'note',
  canHandle(surface) {
    return surface.kind === 'note' || surface.provider === 'blackroad-canon';
  },
  render(surface, mountNode) {
    const wrap = document.createElement('div');
    wrap.className = 'surface-note-panel';
    wrap.innerHTML = `
      <div class="surface-note-copy">${surface.notes || surface.subtitle || ''}</div>
      <div class="surface-note-grid">
        ${line('Path', surface.meta?.path)}
        ${line('Domain', surface.meta?.domain)}
        ${line('Role', surface.meta?.role)}
        ${line('Product', surface.meta?.product)}
        ${line('Section', surface.meta?.number)}
        ${list('Tags', surface.tags)}
      </div>
    `;
    mountNode.appendChild(wrap);
    return () => wrap.remove();
  },
};
