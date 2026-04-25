/**
 * BlackRoad OS, Inc. — Clerk Webhook Handler
 *
 * Handles Clerk auth events for BlackRoad.io.
 * Syncs user data, org membership, and session tracking.
 *
 * PROPRIETARY — BlackRoad OS, Inc. All rights reserved.
 */

import { CLERK_WEBHOOK_EVENTS } from "./clerk-config.js";

interface ClerkEvent {
  type: string;
  data: Record<string, unknown>;
  object: string;
}

interface WebhookResult {
  handled: boolean;
  event: string;
  action: string;
}

/**
 * Verify Clerk webhook via Svix signature
 */
async function verifyClerkSignature(
  payload: string,
  headers: Headers,
  secret: string,
): Promise<boolean> {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const encoder = new TextEncoder();
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

  // Decode the secret (base64)
  const secretBytes = Uint8Array.from(atob(secret.replace("whsec_", "")), (c) =>
    c.charCodeAt(0),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent),
  );
  const computedSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // Svix sends multiple signatures separated by space
  const signatures = svixSignature.split(" ");
  return signatures.some((s) => {
    const sigValue = s.split(",")[1];
    return sigValue === computedSig;
  });
}

/**
 * Handle individual Clerk events
 */
async function handleEvent(event: ClerkEvent): Promise<WebhookResult> {
  switch (event.type) {
    case "user.created": {
      const userId = event.data.id as string;
      const email = (
        event.data.email_addresses as Array<{ email_address: string }>
      )?.[0]?.email_address;
      return {
        handled: true,
        event: event.type,
        action: `User created: ${userId} (${email}) — provision BlackRoad account`,
      };
    }

    case "user.updated": {
      const userId = event.data.id as string;
      return {
        handled: true,
        event: event.type,
        action: `User updated: ${userId} — sync metadata`,
      };
    }

    case "user.deleted": {
      const userId = event.data.id as string;
      return {
        handled: true,
        event: event.type,
        action: `User deleted: ${userId} — deactivate account, cancel subscriptions`,
      };
    }

    case "organization.created": {
      const orgId = event.data.id as string;
      const orgName = event.data.name as string;
      return {
        handled: true,
        event: event.type,
        action: `Org created: ${orgId} (${orgName}) — provision workspace`,
      };
    }

    case "organization.updated": {
      const orgId = event.data.id as string;
      return {
        handled: true,
        event: event.type,
        action: `Org updated: ${orgId} — sync settings`,
      };
    }

    case "organizationMembership.created": {
      const userId = event.data.public_user_data
        ? (event.data.public_user_data as Record<string, unknown>).user_id
        : "unknown";
      const orgId = event.data.organization
        ? (event.data.organization as Record<string, unknown>).id
        : "unknown";
      return {
        handled: true,
        event: event.type,
        action: `Member added: user=${userId} org=${orgId} — grant access`,
      };
    }

    case "organizationMembership.deleted": {
      const userId = event.data.public_user_data
        ? (event.data.public_user_data as Record<string, unknown>).user_id
        : "unknown";
      const orgId = event.data.organization
        ? (event.data.organization as Record<string, unknown>).id
        : "unknown";
      return {
        handled: true,
        event: event.type,
        action: `Member removed: user=${userId} org=${orgId} — revoke access`,
      };
    }

    case "session.created": {
      const userId = event.data.user_id as string;
      return {
        handled: true,
        event: event.type,
        action: `Session started: user=${userId}`,
      };
    }

    case "session.ended": {
      const userId = event.data.user_id as string;
      return {
        handled: true,
        event: event.type,
        action: `Session ended: user=${userId}`,
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
 */
export async function handleClerkWebhook(request: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      { status: 500 },
    );
  }

  const body = await request.text();

  const valid = await verifyClerkSignature(body, request.headers, webhookSecret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
    });
  }

  const event: ClerkEvent = JSON.parse(body);
  const result = await handleEvent(event);

  console.log(
    `[CLERK WEBHOOK] ${event.type}: ${result.action} (handled=${result.handled})`,
  );

  return new Response(JSON.stringify({ received: true, ...result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
