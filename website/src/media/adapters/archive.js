export const archiveAdapter = {
  id: 'archive',
  canHandle(surface) {
    return surface.kind === 'archive' || /archive\.org/.test(`${surface.url} ${surface.embedUrl}`);
  },
  render(surface, mountNode, context) {
    if (!surface.embedUrl && !surface.url) {
      context.showFallback(surface, 'Archive surface is registered but has no openable source yet.');
      return () => {};
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'surface-frame';
    iframe.title = surface.title;
    iframe.src = surface.embedUrl || surface.url;
    iframe.addEventListener('load', () => context.setStatus('ready'));
    mountNode.appendChild(iframe);
    return () => {
      iframe.src = 'about:blank';
      iframe.remove();
    };
  },
};

