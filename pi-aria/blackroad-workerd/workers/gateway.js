/**
 * BlackRoad OS — Self-Hosted AI Gateway Worker
 * Proxy to Ollama / Claude / OpenAI backends
 */

const BACKENDS = {
  ollama:    'http://127.0.0.1:11434',
  claude:    'https://api.anthropic.com',
  openai:    'https://api.openai.com',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider') || 'ollama';
    const backend = BACKENDS[provider];

    if (!backend) {
      return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    // Forward to backend
    const targetUrl = `${backend}${url.pathname}${url.search}`;
    const headers = new Headers(request.headers);
    
    // Inject auth for cloud providers
    if (provider === 'claude' && env.ANTHROPIC_API_KEY) {
      headers.set('x-api-key', env.ANTHROPIC_API_KEY);
    } else if (provider === 'openai' && env.OPENAI_API_KEY) {
      headers.set('Authorization', `Bearer ${env.OPENAI_API_KEY}`);
    }

    try {
      const res = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== 'GET' ? request.body : undefined,
      });
      return res;
    } catch (err) {
      return Response.json({ error: err.message, backend }, { status: 502 });
    }
  }
};
