export const genericEmbedAdapter = {
  id: 'generic-embed',
  canHandle(surface) {
    return surface.kind === 'embed' || surface.kind === 'live';
  },
  render(surface, mountNode, context) {
    if (!surface.embedUrl && !surface.url) {
      context.showFallback(surface, 'This surface is registered, but no live source is attached yet.');
      return () => {};
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'surface-frame';
    iframe.title = surface.title;
    iframe.src = surface.embedUrl || surface.url || 'about:blank';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
    iframe.referrerPolicy = 'origin';

    const timer = window.setTimeout(() => {
      if (!iframe.dataset.loaded) {
        context.showFallback(surface, 'Embed blocked or unavailable from this origin.');
      }
    }, 5000);

    iframe.addEventListener('load', () => {
      iframe.dataset.loaded = 'true';
      window.clearTimeout(timer);
      context.setStatus('ready');
    });

    mountNode.appendChild(iframe);
    return () => {
      window.clearTimeout(timer);
      iframe.src = 'about:blank';
      iframe.remove();
    };
  },
};
