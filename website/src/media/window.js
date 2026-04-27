function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function openInNewTabButton(surface) {
  if (!surface.url && !surface.embedUrl) return '';
  return `<button type="button" class="surface-action" data-action="open-source">Open Source</button>`;
}

export function createSurfaceWindow({
  registry,
  mountNode,
  fallbackNode,
  badgesNode,
  noteNode,
  rightsNode,
  openSurfaceById,
  openQuery,
  openExternal,
  onSurfaceChange,
}) {
  let destroyCurrent = null;
  let activeSurface = null;

  function setBadges(surface) {
    badgesNode.innerHTML = `
      <span class="surface-badge">${surface.provider}</span>
      <span class="surface-badge">${surface.kind}</span>
      <span class="surface-badge">${surface.status}</span>
    `;
  }

  function setRights(surface) {
    rightsNode.textContent =
      `Rights: ${surface.rights}. Record or rebroadcast only what you own, created, licensed, or were permitted to capture.`;
  }

  function openSource() {
    if (!activeSurface) return;
    const target = activeSurface.url || activeSurface.embedUrl;
    if (target) window.open(target, '_blank', 'noopener');
  }

  fallbackNode.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-source') openSource();
  });

  function renderFallback(surface, reason) {
    fallbackNode.hidden = false;
    fallbackNode.innerHTML = `
      <div class="surface-fallback-copy">
        <div class="surface-fallback-title">Surface unavailable</div>
        <div>${reason}</div>
      </div>
      <div class="surface-actions">
        ${openInNewTabButton(surface)}
      </div>
    `;
  }

  function updateSurface(patch) {
    if (!activeSurface) return;
    const updated = registry.update(activeSurface.id, patch);
    if (!updated) return;
    activeSurface = updated;
    setBadges(updated);
    onSurfaceChange?.(updated);
  }

  return {
    open(surface) {
      if (destroyCurrent) {
        destroyCurrent();
        destroyCurrent = null;
      }

      clearNode(mountNode);
      clearNode(fallbackNode);
      fallbackNode.hidden = true;

      activeSurface = surface;
      setBadges(surface);
      noteNode.textContent = surface.notes || surface.subtitle || '';
      setRights(surface);
      onSurfaceChange?.(surface);

      const adapter = registry.resolveAdapter(surface);
      if (!adapter) {
        renderFallback(surface, 'No adapter is registered for this surface.');
        return;
      }

      destroyCurrent =
        adapter.render(surface, mountNode, {
          setStatus(status) {
            updateSurface({ status });
          },
          openSurfaceById,
          openQuery(query) {
            if (!query) return;
            openQuery?.(query);
          },
          openExternal(url) {
            if (!url) return;
            openExternal?.(url);
          },
          showFallback(targetSurface, reason) {
            updateSurface({ status: 'blocked' });
            clearNode(mountNode);
            renderFallback(targetSurface, reason);
          },
        }) || null;
    },
    close() {
      if (destroyCurrent) {
        destroyCurrent();
        destroyCurrent = null;
      }
      activeSurface = null;
      clearNode(mountNode);
      clearNode(fallbackNode);
      clearNode(badgesNode);
      noteNode.textContent = '';
      rightsNode.textContent = '';
      fallbackNode.hidden = true;
    },
  };
}
