function playlistIdFromSurface(surface) {
  const candidates = [surface.embedUrl, surface.url].filter(Boolean);
  for (const value of candidates) {
    try {
      const parsed = new URL(value, window.location.href);
      const playlistId = parsed.searchParams.get('list');
      if (playlistId) return playlistId;
    } catch {
      const match = String(value).match(/[?&]list=([^&]+)/);
      if (match) return match[1];
    }
  }
  return null;
}

export const youtubeAdapter = {
  id: 'youtube',
  canHandle(surface) {
    return surface.provider === 'youtube' || /youtube/.test(`${surface.url} ${surface.embedUrl}`);
  },
  render(surface, mountNode, context) {
    const playlistId = playlistIdFromSurface(surface);
    if (!playlistId) {
      context.showFallback(surface, 'YouTube playlist ID is missing.');
      return () => {};
    }

    const iframe = document.createElement('iframe');
    iframe.src =
      surface.embedUrl ||
      `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(
        playlistId
      )}&autoplay=0&rel=0&modestbranding=1&playsinline=1`;
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'eager';
    iframe.referrerPolicy = 'origin';
    iframe.className = 'surface-frame';
    iframe.title = surface.title;
    iframe.addEventListener('load', () => context.setStatus('ready'));
    mountNode.appendChild(iframe);
    return () => {
      iframe.src = 'about:blank';
      iframe.remove();
    };
  },
};

