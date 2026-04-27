/**
 * Cloudflare Pages routing function
 * Serves index.html for all routes (SPA behavior)
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // API requests go to Worker
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/session') ||
      url.pathname.startsWith('/analytics')) {
    return new Response('Not found', { status: 404 });
  }
  
  // Serve index.html for all other requests (SPA)
  try {
    const indexResponse = await context.env.ASSETS.fetch(
      new Request(new URL('/index.html', url), request)
    );
    return new Response(indexResponse.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(indexResponse.headers),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return new Response('Shell loading...', { status: 200 });
  }
}
