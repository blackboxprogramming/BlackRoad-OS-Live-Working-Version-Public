// BlackRoad OS Analytics Worker
// Cloudflare Workers endpoint for custom analytics

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle OPTIONS for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const data = await request.json()

    // Validate data
    if (!data.event || !data.timestamp) {
      return new Response('Invalid data', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Store in KV or D1 (example with KV)
    const key = `analytics:${Date.now()}:${Math.random()}`
    await ANALYTICS_KV.put(key, JSON.stringify(data), {
      expirationTtl: 2592000 // 30 days
    })

    // Return success
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    return new Response('Error processing request', {
      status: 500,
      headers: corsHeaders
    })
  }
}
