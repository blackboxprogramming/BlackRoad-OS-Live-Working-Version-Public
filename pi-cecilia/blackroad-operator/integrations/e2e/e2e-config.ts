/**
 * BlackRoad OS, Inc. — E2E Integration Config
 *
 * Master config connecting Stripe + Clerk + Deploy targets.
 * Everything routes back to BlackRoad-OS-Inc.
 *
 * PROPRIETARY — BlackRoad OS, Inc. All rights reserved.
 */

import { buildStripeConfig, STRIPE_ENV_VARS } from "../stripe/stripe-config.js";
import { buildClerkConfig, CLERK_ENV_VARS } from "../clerk/clerk-config.js";

export interface DeployTarget {
  platform: string;
  projectId: string;
  envVar: string;
  region?: string;
  gpu?: boolean;
}

export interface E2EConfig {
  stripe: ReturnType<typeof buildStripeConfig>;
  clerk: ReturnType<typeof buildClerkConfig>;
  deployTargets: DeployTarget[];
  domains: string[];
  owner: string;
}

/**
 * All BlackRoad.io deploy targets
 */
export const DEPLOY_TARGETS: DeployTarget[] = [
  {
    platform: "railway",
    projectId: "RAILWAY_PROJECT_ID",
    envVar: "RAILWAY_TOKEN",
    region: "us-west-2",
    gpu: true,
  },
  {
    platform: "vercel",
    projectId: "VERCEL_PROJECT_ID",
    envVar: "VERCEL_TOKEN",
    region: "iad1",
  },
  {
    platform: "cloudflare-workers",
    projectId: "CLOUDFLARE_ACCOUNT_ID",
    envVar: "CLOUDFLARE_API_TOKEN",
  },
  {
    platform: "cloudflare-pages",
    projectId: "CLOUDFLARE_ACCOUNT_ID",
    envVar: "CLOUDFLARE_API_TOKEN",
  },
  {
    platform: "digitalocean",
    projectId: "DO_DROPLET_NAME",
    envVar: "DIGITALOCEAN_ACCESS_TOKEN",
    region: "nyc1",
  },
];

/**
 * BlackRoad.io domains
 */
export const BLACKROAD_DOMAINS = [
  "blackroad.io",
  "blackroad.ai",
  "blackroad.network",
  "blackroad.systems",
  "blackroad.me",
  "blackroad.inc",
  "lucidia.earth",
  "lucidia.studio",
] as const;

/**
 * All env vars needed for full E2E deployment
 */
export const ALL_E2E_ENV_VARS = [
  // Stripe
  ...STRIPE_ENV_VARS,
  // Clerk
  ...CLERK_ENV_VARS,
  // Deploy targets
  "RAILWAY_TOKEN",
  "RAILWAY_PROJECT_ID",
  "VERCEL_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "DIGITALOCEAN_ACCESS_TOKEN",
  // Database
  "DATABASE_URL",
  "REDIS_URL",
  // Monitoring
  "SENTRY_DSN",
  "POSTHOG_KEY",
  // App
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_SECRET",
  "JWT_SECRET",
] as const;

/**
 * Build complete E2E config
 */
export function buildE2EConfig(): E2EConfig {
  return {
    stripe: buildStripeConfig(),
    clerk: buildClerkConfig(),
    deployTargets: DEPLOY_TARGETS,
    domains: [...BLACKROAD_DOMAINS],
    owner: "BlackRoad OS, Inc.",
  };
}

/**
 * Validate E2E config — checks all required env vars are set
 */
export function validateE2EConfig(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ALL_E2E_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.includes("STRIPE_SECRET_KEY")) {
    warnings.push("CRITICAL: Stripe not configured — no revenue processing");
  }
  if (missing.includes("CLERK_SECRET_KEY")) {
    warnings.push("CRITICAL: Clerk not configured — no authentication");
  }
  if (missing.includes("DATABASE_URL")) {
    warnings.push("CRITICAL: No database configured");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
