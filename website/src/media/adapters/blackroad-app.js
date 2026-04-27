export const blackroadAppAdapter = {
  id: 'blackroad-app',
  canHandle(surface) {
    return surface.kind === 'app' && surface.provider === 'blackroad';
  },
  render(surface, mountNode, context) {
    if (!surface.embedUrl && !surface.url) {
      context.showFallback(surface, 'Internal app route is missing.');
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

