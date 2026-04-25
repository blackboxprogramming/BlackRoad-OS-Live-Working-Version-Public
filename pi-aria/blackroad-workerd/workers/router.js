/**
 * BlackRoad OS — Self-Hosted Edge Router Worker
 * Routes requests to appropriate service workers
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = request.headers.get('host') || '';

    // Route by subdomain
    if (host.startsWith('stripe.')) {
      return env.STRIPE_SERVICE.fetch(request);
    }

    return Response.json({ 
      status: 'BlackRoad Edge Router',
      host,
      path: url.pathname,
      routes: ['stripe.*', 'brand.*', 'api.*']
    });
  }
};
