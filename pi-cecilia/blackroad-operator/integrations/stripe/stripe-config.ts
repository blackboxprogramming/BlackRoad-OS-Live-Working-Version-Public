/**
 * BlackRoad OS, Inc. — Stripe Integration Config
 *
 * E2E Stripe setup for BlackRoad.io products.
 * All revenue returns to BlackRoad-OS-Inc.
 *
 * PROPRIETARY — BlackRoad OS, Inc. All rights reserved.
 */

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  priceId: string;
  mode: "payment" | "subscription";
  interval?: "month" | "year";
  amount: number; // cents
  currency: string;
  features: string[];
  metadata: Record<string, string>;
}

export interface StripeConfig {
  publishableKey: string;
  webhookEndpoint: string;
  webhookEvents: string[];
  products: StripeProduct[];
  portalEnabled: boolean;
  taxCollection: boolean;
}

/**
 * BlackRoad.io Products — Stripe catalog
 */
export const BLACKROAD_PRODUCTS: StripeProduct[] = [
  {
    id: "prod_blackroad_os_pro",
    name: "BlackRoad OS Pro",
    description:
      "Full access to BlackRoad OS platform, 30K agent coordination, all CLI tools",
    priceId: "", // Set via STRIPE_PRICE_PRO_MONTHLY
    mode: "subscription",
    interval: "month",
    amount: 4900, // $49/mo
    currency: "usd",
    features: [
      "30,000 AI Agent coordination",
      "All 57 CLI tools",
      "Multi-cloud deployment",
      "Priority support",
      "Custom agent training",
    ],
    metadata: {
      org: "BlackRoad-OS-Inc",
      tier: "pro",
      agent_limit: "30000",
    },
  },
  {
    id: "prod_blackroad_os_enterprise",
    name: "BlackRoad OS Enterprise",
    description:
      "Enterprise tier with dedicated infrastructure, SLA, and white-label options",
    priceId: "", // Set via STRIPE_PRICE_ENTERPRISE_MONTHLY
    mode: "subscription",
    interval: "month",
    amount: 29900, // $299/mo
    currency: "usd",
    features: [
      "Unlimited AI agents",
      "Dedicated GPU infrastructure",
      "99.9% SLA",
      "White-label support",
      "Custom model training",
      "Priority phone support",
      "SOC 2 compliance",
    ],
    metadata: {
      org: "BlackRoad-OS-Inc",
      tier: "enterprise",
      agent_limit: "unlimited",
    },
  },
  {
    id: "prod_agent_credits",
    name: "Agent Credits",
    description: "Pay-as-you-go agent compute credits for BlackRoad OS",
    priceId: "", // Set via STRIPE_PRICE_CREDITS
    mode: "payment",
    amount: 1000, // $10 per credit pack
    currency: "usd",
    features: [
      "1,000 agent-minutes per credit",
      "No expiration",
      "Any model",
      "Priority queue",
    ],
    metadata: {
      org: "BlackRoad-OS-Inc",
      tier: "credits",
      credit_amount: "1000",
    },
  },
  {
    id: "prod_blackroad_api",
    name: "BlackRoad API Access",
    description: "API access to BlackRoad agent infrastructure",
    priceId: "", // Set via STRIPE_PRICE_API_MONTHLY
    mode: "subscription",
    interval: "month",
    amount: 9900, // $99/mo
    currency: "usd",
    features: [
      "REST + WebSocket API",
      "Agent orchestration endpoints",
      "Memory system access",
      "Webhook integrations",
      "100K requests/month",
    ],
    metadata: {
      org: "BlackRoad-OS-Inc",
      tier: "api",
      rate_limit: "100000",
    },
  },
];

/**
 * Stripe webhook events we listen to
 */
export const STRIPE_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.created",
  "customer.updated",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
] as const;

/**
 * Build Stripe config from environment
 */
export function buildStripeConfig(): StripeConfig {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const webhookEndpoint =
    process.env.STRIPE_WEBHOOK_ENDPOINT ?? "/api/webhooks/stripe";

  // Map env vars to product price IDs
  const products = BLACKROAD_PRODUCTS.map((p) => {
    const envMap: Record<string, string> = {
      prod_blackroad_os_pro: "STRIPE_PRICE_PRO_MONTHLY",
      prod_blackroad_os_enterprise: "STRIPE_PRICE_ENTERPRISE_MONTHLY",
      prod_agent_credits: "STRIPE_PRICE_CREDITS",
      prod_blackroad_api: "STRIPE_PRICE_API_MONTHLY",
    };
    const envKey = envMap[p.id];
    return {
      ...p,
      priceId: envKey ? (process.env[envKey] ?? "") : "",
    };
  });

  return {
    publishableKey,
    webhookEndpoint,
    webhookEvents: [...STRIPE_WEBHOOK_EVENTS],
    products,
    portalEnabled: true,
    taxCollection: true,
  };
}

/**
 * Env vars required for Stripe integration
 */
export const STRIPE_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_ENTERPRISE_MONTHLY",
  "STRIPE_PRICE_CREDITS",
  "STRIPE_PRICE_API_MONTHLY",
] as const;
