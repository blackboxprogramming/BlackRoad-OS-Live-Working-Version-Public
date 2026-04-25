/**
 * BlackRoad OS, Inc. — Stripe Webhook Handler
 *
 * Handles Stripe events for BlackRoad.io E2E revenue pipeline.
 * Deploy as: Cloudflare Worker, Vercel serverless, or Express route.
 *
 * PROPRIETARY — BlackRoad OS, Inc. All rights reserved.
 */

import { STRIPE_WEBHOOK_EVENTS } from "./stripe-config.js";

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

interface WebhookResult {
  handled: boolean;
  event: string;
  action: string;
  error?: string;
}

/**
 * Verify Stripe webhook signature
 */
async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !sig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload),
  );

  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedHex === sig;
}

/**
 * Handle individual Stripe events
 */
async function handleEvent(event: StripeEvent): Promise<WebhookResult> {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const customerId = obj.customer as string;
      const mode = obj.mode as string;
      return {
        handled: true,
        event: event.type,
        action: `Checkout completed: customer=${customerId} mode=${mode}`,
      };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subStatus = obj.status as string;
      const customerId = obj.customer as string;
      return {
        handled: true,
        event: event.type,
        action: `Subscription ${subStatus}: customer=${customerId}`,
      };
    }

    case "customer.subscription.deleted": {
      const customerId = obj.customer as string;
      return {
        handled: true,
        event: event.type,
        action: `Subscription cancelled: customer=${customerId}`,
      };
    }

    case "invoice.paid": {
      const amount = obj.amount_paid as number;
      const customerId = obj.customer as string;
      return {
        handled: true,
        event: event.type,
        action: `Invoice paid: $${(amount / 100).toFixed(2)} customer=${customerId}`,
      };
    }

    case "invoice.payment_failed": {
      const customerId = obj.customer as string;
      return {
        handled: true,
        event: event.type,
        action: `Payment failed: customer=${customerId} — notify and retry`,
      };
    }

    case "payment_intent.succeeded": {
      const amount = obj.amount as number;
      return {
        handled: true,
        event: event.type,
        action: `Payment succeeded: $${(amount / 100).toFixed(2)}`,
      };
    }

    default:
      return {
        handled: false,
        event: event.type,
        action: "unhandled",
      };
  }
}

/**
 * Main webhook entry point
 *
 * Usage in Next.js API route:
 *   export { handleStripeWebhook as POST } from './webhook-handler';
 *
 * Usage in Cloudflare Worker:
 *   export default { fetch: handleStripeWebhook };
 */
export async function handleStripeWebhook(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
    });
  }

  const body = await request.text();

  const valid = await verifySignature(body, signature, webhookSecret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
    });
  }

  const event: StripeEvent = JSON.parse(body);
  const result = await handleEvent(event);

  console.log(
    `[STRIPE WEBHOOK] ${event.type}: ${result.action} (handled=${result.handled})`,
  );

  return new Response(JSON.stringify({ received: true, ...result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
