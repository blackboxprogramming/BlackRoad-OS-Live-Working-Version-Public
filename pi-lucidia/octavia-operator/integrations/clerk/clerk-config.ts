/**
 * BlackRoad OS, Inc. — Clerk Integration Config
 *
 * E2E Clerk auth for BlackRoad.io — SSO, MFA, org management.
 * All user data governed by BlackRoad-OS-Inc.
 *
 * PROPRIETARY — BlackRoad OS, Inc. All rights reserved.
 */

export interface ClerkOrg {
  slug: string;
  name: string;
  maxMembers: number;
  features: string[];
}

export interface ClerkConfig {
  publishableKey: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  organizations: ClerkOrg[];
  ssoProviders: string[];
  mfaEnabled: boolean;
  userMetadataFields: string[];
}

/**
 * BlackRoad org tiers mapped to Clerk organizations
 */
export const BLACKROAD_CLERK_ORGS: ClerkOrg[] = [
  {
    slug: "blackroad-os-inc",
    name: "BlackRoad OS, Inc.",
    maxMembers: 100,
    features: [
      "admin",
      "billing",
      "agent-management",
      "deploy",
      "all-orgs-access",
    ],
  },
  {
    slug: "blackroad-os",
    name: "BlackRoad OS",
    maxMembers: 500,
    features: [
      "platform",
      "agents",
      "cli",
      "deploy",
      "memory",
      "collaboration",
    ],
  },
  {
    slug: "blackroad-ai",
    name: "BlackRoad AI",
    maxMembers: 50,
    features: ["models", "inference", "training", "vector-db", "gpu-access"],
  },
  {
    slug: "blackroad-cloud",
    name: "BlackRoad Cloud",
    maxMembers: 50,
    features: [
      "infrastructure",
      "orchestration",
      "networking",
      "storage",
      "secrets",
    ],
  },
  {
    slug: "blackroad-security",
    name: "BlackRoad Security",
    maxMembers: 30,
    features: ["scanning", "audit", "compliance", "waf", "ids"],
  },
];

/**
 * SSO providers for BlackRoad.io
 */
export const SSO_PROVIDERS = [
  "google",
  "github",
  "microsoft",
  "apple",
  "saml",
] as const;

/**
 * User metadata fields synced with BlackRoad systems
 */
export const USER_METADATA_FIELDS = [
  "blackroad_tier",
  "agent_limit",
  "stripe_customer_id",
  "org_ids",
  "api_key_hash",
  "last_deploy_at",
  "credits_balance",
  "preferred_model",
  "cece_identity_hash",
] as const;

/**
 * Clerk webhook events we handle
 */
export const CLERK_WEBHOOK_EVENTS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "organization.created",
  "organization.updated",
  "organizationMembership.created",
  "organizationMembership.deleted",
  "session.created",
  "session.ended",
] as const;

/**
 * Build Clerk config from environment
 */
export function buildClerkConfig(): ClerkConfig {
  return {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
    afterSignInUrl:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/dashboard",
    afterSignUpUrl:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/onboarding",
    organizations: BLACKROAD_CLERK_ORGS,
    ssoProviders: [...SSO_PROVIDERS],
    mfaEnabled: true,
    userMetadataFields: [...USER_METADATA_FIELDS],
  };
}

/**
 * Env vars required for Clerk integration
 */
export const CLERK_ENV_VARS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
] as const;
