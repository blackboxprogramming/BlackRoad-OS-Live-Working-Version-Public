const AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const PDF_EXTENSIONS = ['.pdf'];

function lowerUrl(surface) {
  return `${surface.url || surface.embedUrl || ''}`.toLowerCase();
}

function makeSource(surface) {
  return surface.url || surface.embedUrl;
}

export const directMediaAdapter = {
  id: 'direct-media',
  canHandle(surface) {
    if (surface.kind === 'direct') return true;
    const url = lowerUrl(surface);
    return (
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      AUDIO_EXTENSIONS.some((ext) => url.endsWith(ext)) ||
      IMAGE_EXTENSIONS.some((ext) => url.endsWith(ext)) ||
      PDF_EXTENSIONS.some((ext) => url.endsWith(ext))
    );
  },
  render(surface, mountNode, context) {
    const src = makeSource(surface);
    const url = lowerUrl(surface);
    if (!src) {
      context.showFallback(surface, 'Direct media source is missing.');
      return () => {};
    }

    let element;
    if (AUDIO_EXTENSIONS.some((ext) => url.endsWith(ext))) {
      element = document.createElement('audio');
      element.controls = true;
      element.className = 'surface-audio';
    } else if (IMAGE_EXTENSIONS.some((ext) => url.endsWith(ext))) {
      element = document.createElement('img');
      element.alt = surface.title;
      element.className = 'surface-image';
    } else if (PDF_EXTENSIONS.some((ext) => url.endsWith(ext))) {
      element = document.createElement('iframe');
      element.className = 'surface-frame';
      element.title = surface.title;
    } else {
      element = document.createElement('video');
      element.controls = true;
      element.playsInline = true;
      element.className = 'surface-video';
    }

    element.src = src;
    element.addEventListener?.('error', () =>
      context.showFallback(surface, 'Direct media failed to load.')
    );
    element.addEventListener?.('loadeddata', () => context.setStatus('ready'));
    mountNode.appendChild(element);
    return () => {
      if ('pause' in element) element.pause();
      if ('srcObject' in element) element.srcObject = null;
      element.remove();
    };
  },
};

