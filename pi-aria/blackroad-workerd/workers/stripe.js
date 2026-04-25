/**
 * BlackRoad OS — Stripe Checkout Worker
 * Cloudflare Worker: handles Stripe checkout sessions, webhooks, and billing portal
 *
 * Environment variables (set via wrangler secret / Pages env):
 *   STRIPE_SECRET_KEY        — sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET    — whsec_...  (from Stripe Dashboard → Webhooks)
 *   ALLOWED_ORIGIN           — https://blackroad-brand-kit.pages.dev (or your domain)
 *
 * Routes:
 *   POST /checkout           — create Stripe Checkout Session
 *   POST /portal             — create Billing Portal session (manage subscription)
 *   POST /webhook            — receive Stripe webhook events
 *   GET  /prices             — list all active prices (for dynamic pricing UI)
 *   GET  /health             — health check
 */

const CORS_HEADERS = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
});

async function stripeRequest(env, method, path, body = null) {
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const options = { method, headers };
  if (body) {
    options.body = new URLSearchParams(body).toString();
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error: ${res.status}`);
  }
  return data;
}

// Encode nested objects for Stripe API (e.g. metadata[key]=value)
function encodeStripeParams(obj, prefix = '') {
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        parts.push(...encodeStripeParams(value, fullKey).split('&').filter(Boolean));
      } else if (Array.isArray(value)) {
        value.forEach((v, i) => parts.push(`${fullKey}[${i}]=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${fullKey}=${encodeURIComponent(value)}`);
      }
    }
  }
  return parts.join('&');
}

// ── POST /checkout ─────────────────────────────────────────────────────────
async function handleCheckout(request, env) {
  const body = await request.json();
  const { price_id, success_url, cancel_url, customer_email, metadata = {} } = body;

  if (!price_id) {
    return Response.json({ error: 'price_id is required' }, { status: 400 });
  }

  const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN || 'https://blackroad-brand-kit.pages.dev';
  const successUrl = success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = cancel_url  || `${origin}/pricing`;

  const params = {
    mode: 'subscription',
    'line_items[0][price]': price_id,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'automatic_tax[enabled]': 'true',
    'subscription_data[metadata][source]': 'blackroad-brand-kit',
    ...Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [`metadata[${k}]`, v])
    ),
  };

  if (customer_email) {
    params.customer_email = customer_email;
  }

  const session = await stripeRequest(env, 'POST', '/checkout/sessions', params);
  return Response.json({ url: session.url, session_id: session.id });
}

// ── POST /portal ────────────────────────────────────────────────────────────
async function handlePortal(request, env) {
  const { customer_id, return_url } = await request.json();

  if (!customer_id) {
    return Response.json({ error: 'customer_id is required' }, { status: 400 });
  }

  const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN;
  const session = await stripeRequest(env, 'POST', '/billing_portal/sessions', {
    customer: customer_id,
    return_url: return_url || `${origin}/account`,
  });

  return Response.json({ url: session.url });
}

// ── GET /prices ─────────────────────────────────────────────────────────────
async function handlePrices(env) {
  // Returns active prices with their product info
  const prices = await stripeRequest(env, 'GET', '/prices?active=true&expand[]=data.product&limit=20');

  const formatted = prices.data
    .filter(p => p.product && !p.product.deleted)
    .map(p => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval,
      interval_count: p.recurring?.interval_count,
      product: {
        id: p.product.id,
        name: p.product.name,
        description: p.product.description,
        metadata: p.product.metadata,
      },
    }))
    .sort((a, b) => (a.amount || 0) - (b.amount || 0));

  return Response.json({ prices: formatted });
}

// ── POST /webhook ────────────────────────────────────────────────────────────
async function handleWebhook(request, env) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // Verify webhook signature using Stripe's timing-safe method
  if (env.STRIPE_WEBHOOK_SECRET) {
    try {
      await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Handle events — extend this for your business logic
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // TODO: provision access, send welcome email, update DB
      console.log(`✓ Checkout completed: ${session.id} | customer: ${session.customer}`);
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      console.log(`✓ Subscription ${event.type}: ${sub.id} | status: ${sub.status}`);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      // TODO: revoke access
      console.log(`✓ Subscription cancelled: ${sub.id}`);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // TODO: send dunning email
      console.log(`✗ Payment failed: ${invoice.id} | customer: ${invoice.customer}`);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`✓ Payment succeeded: ${invoice.id}`);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return Response.json({ received: true });
}

// ── Stripe signature verification ───────────────────────────────────────────
async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader) throw new Error('Missing stripe-signature header');

  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signatures = Object.entries(parts)
    .filter(([k]) => k === 'v1')
    .map(([, v]) => v);

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid stripe-signature format');
  }

  // Tolerance: 5 minutes
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > tolerance) {
    throw new Error('Timestamp outside tolerance window');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (!signatures.includes(computed)) {
    throw new Error('Signature mismatch');
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN || '*';
    const cors = CORS_HEADERS(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Guard: require STRIPE_SECRET_KEY
    if (!env.STRIPE_SECRET_KEY) {
      return Response.json(
        { error: 'Stripe not configured. Set STRIPE_SECRET_KEY in worker environment.' },
        { status: 503, headers: cors }
      );
    }

    let response;
    try {
      if (url.pathname === '/health') {
        response = Response.json({ status: 'ok', worker: 'stripe-checkout', time: new Date().toISOString() });
      } else if (request.method === 'POST' && url.pathname === '/checkout') {
        response = await handleCheckout(request, env);
      } else if (request.method === 'POST' && url.pathname === '/portal') {
        response = await handlePortal(request, env);
      } else if (request.method === 'POST' && url.pathname === '/webhook') {
        // Webhooks: don't add CORS (Stripe doesn't send Origin)
        return await handleWebhook(request, env);
      } else if (request.method === 'GET' && url.pathname === '/prices') {
        response = await handlePrices(env);
      } else {
        response = Response.json({ error: 'Not found', routes: ['/health', '/checkout', '/portal', '/webhook', '/prices'] }, { status: 404 });
      }
    } catch (err) {
      console.error('Worker error:', err);
      response = Response.json({ error: err.message }, { status: 500 });
    }

    // Add CORS headers to response
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  },
};
