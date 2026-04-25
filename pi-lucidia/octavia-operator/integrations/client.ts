/**
 * BlackRoad OS — Unified Integration Client
 *
 * Single entry point for all 30 integrations.
 * AI provider requests route through the tokenless gateway at :8787.
 * Non-AI integrations connect directly with env-based credentials.
 *
 * © BlackRoad OS, Inc. All rights reserved.
 */

import { readFileSync } from "fs";
import { join } from "path";

// ─── Gateway Config ─────────────────────────────────────────────────
const GATEWAY_URL =
  process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

/** Categories whose requests must route through the tokenless gateway */
const GATEWAY_ROUTED_CATEGORIES = new Set(["ai-providers"]);

// ─── Types ──────────────────────────────────────────────────────────
interface IntegrationConfig {
  id: string;
  name: string;
  category: string;
  status: string;
  api_base: string;
  auth_type: string;
  env_vars: string[];
  capabilities: string[];
}

interface Manifest {
  integrations: IntegrationConfig[];
  categories: Record<string, string[]>;
}

interface RequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

interface IntegrationResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  integration: string;
  latency_ms: number;
}

interface HealthResult {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down" | "unconfigured";
  latency_ms: number;
  error?: string;
}

// ─── Manifest Loader ────────────────────────────────────────────────
function loadManifest(): Manifest {
  const raw = readFileSync(
    join(__dirname, "manifest.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

// ─── Auth Resolver ──────────────────────────────────────────────────
function resolveAuth(
  config: IntegrationConfig
): Record<string, string> {
  const headers: Record<string, string> = {};

  switch (config.auth_type) {
    case "bearer_token": {
      const token = process.env[config.env_vars[0]];
      if (token) headers["Authorization"] = `Bearer ${token}`;
      break;
    }
    case "api_key": {
      const key = process.env[config.env_vars[0]];
      if (config.id === "claude") {
        if (key) headers["x-api-key"] = key;
        headers["anthropic-version"] = "2024-10-22";
      } else if (config.id === "gemini") {
        // Gemini uses query param — handled in request
      }
      break;
    }
    case "basic_auth": {
      const email = process.env[config.env_vars[1]];
      const token = process.env[config.env_vars[2]];
      if (email && token) {
        headers["Authorization"] =
          `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
      }
      break;
    }
    case "oauth2": {
      const token = process.env[config.env_vars[0]];
      if (token) headers["Authorization"] = `Bearer ${token}`;
      break;
    }
  }

  return headers;
}

// ─── Integration Client ─────────────────────────────────────────────
export class BlackRoadIntegrations {
  private manifest: Manifest;
  private configs: Map<string, IntegrationConfig>;

  constructor() {
    this.manifest = loadManifest();
    this.configs = new Map();
    for (const config of this.manifest.integrations) {
      this.configs.set(config.id, config);
    }
  }

  /** List all registered integrations */
  list(): IntegrationConfig[] {
    return this.manifest.integrations;
  }

  /** List integrations by category */
  listByCategory(category: string): IntegrationConfig[] {
    const ids = this.manifest.categories[category] || [];
    return ids
      .map((id) => this.configs.get(id))
      .filter(Boolean) as IntegrationConfig[];
  }

  /** Get a specific integration config */
  get(id: string): IntegrationConfig | undefined {
    return this.configs.get(id);
  }

  /** Check if an integration is configured (env vars present) */
  isConfigured(id: string): boolean {
    const config = this.configs.get(id);
    if (!config) return false;
    if (config.env_vars.length === 0) return true; // local tools
    return config.env_vars.some((v) => !!process.env[v]);
  }

  /** Make an authenticated request to an integration */
  async request<T = unknown>(
    integrationId: string,
    options: RequestOptions
  ): Promise<IntegrationResponse<T>> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new Error(`Unknown integration: ${integrationId}`);
    }

    const start = Date.now();

    // AI providers route through the tokenless gateway — never call
    // provider APIs directly from agent/operator code.
    const useGateway =
      GATEWAY_ROUTED_CATEGORIES.has(config.category) &&
      (config as unknown as Record<string, string>).gateway_route;

    let url: string;
    let headers: Record<string, string>;

    if (useGateway) {
      const gatewayRoute = (
        config as unknown as Record<string, string>
      ).gateway_route;
      url = `${GATEWAY_URL}${gatewayRoute}${options.path}`;
      // Gateway handles auth — no API keys leave this process
      headers = {
        "Content-Type": "application/json",
        "X-BlackRoad-Agent": integrationId,
        ...options.headers,
      };
    } else {
      // Non-AI integrations use direct auth
      const authHeaders = resolveAuth(config);
      url = `${config.api_base}${options.path}`;
      headers = {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      };

      // Gemini API key as query param (only when gateway is unavailable)
      if (config.id === "gemini") {
        const key = process.env["GOOGLE_AI_API_KEY"];
        if (key) {
          const sep = url.includes("?") ? "&" : "?";
          url += `${sep}key=${key}`;
        }
      }
    }

    // Replace path params
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const latency = Date.now() - start;
    const data = (await response.json()) as T;

    return {
      ok: response.ok,
      status: response.status,
      data,
      integration: integrationId,
      latency_ms: latency,
    };
  }

  /** Health check all configured integrations */
  async healthCheck(): Promise<HealthResult[]> {
    const results: HealthResult[] = [];

    for (const config of this.manifest.integrations) {
      if (!this.isConfigured(config.id)) {
        results.push({
          id: config.id,
          name: config.name,
          status: "unconfigured",
          latency_ms: 0,
        });
        continue;
      }

      // Skip local/mobile tools
      if (
        ["local", "ssh_key"].includes(config.auth_type) &&
        !config.api_base
      ) {
        results.push({
          id: config.id,
          name: config.name,
          status: "healthy",
          latency_ms: 0,
        });
        continue;
      }

      try {
        const start = Date.now();

        const useGateway =
          GATEWAY_ROUTED_CATEGORIES.has(config.category) &&
          (config as unknown as Record<string, string>).gateway_route;

        let healthUrl: string;
        let healthHeaders: Record<string, string>;

        if (useGateway) {
          const gatewayRoute = (
            config as unknown as Record<string, string>
          ).gateway_route;
          healthUrl = `${GATEWAY_URL}${gatewayRoute}`;
          healthHeaders = {
            "Content-Type": "application/json",
            "X-BlackRoad-Agent": config.id,
          };
        } else {
          const authHeaders = resolveAuth(config);
          healthUrl = config.api_base;
          healthHeaders = {
            "Content-Type": "application/json",
            ...authHeaders,
          };
        }

        const response = await fetch(healthUrl, {
          method: "GET",
          headers: healthHeaders,
          signal: AbortSignal.timeout(10000),
        });

        const latency = Date.now() - start;
        results.push({
          id: config.id,
          name: config.name,
          status: response.ok ? "healthy" : "degraded",
          latency_ms: latency,
        });
      } catch (err) {
        results.push({
          id: config.id,
          name: config.name,
          status: "down",
          latency_ms: 0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return results;
  }

  // ─── Convenience Methods ────────────────────────────────────────

  /** Mercury: List accounts */
  async mercuryAccounts() {
    return this.request("mercury", { path: "/accounts" });
  }

  /** Mercury: List transactions */
  async mercuryTransactions(accountId: string) {
    return this.request("mercury", {
      path: `/account/${accountId}/transactions`,
    });
  }

  /** Stripe: Create payment intent */
  async stripePaymentIntent(amount: number, currency = "usd") {
    return this.request("stripe", {
      method: "POST",
      path: "/payment_intents",
      body: { amount, currency },
    });
  }

  /** Stripe: List customers */
  async stripeCustomers(limit = 10) {
    return this.request("stripe", {
      path: `/customers?limit=${limit}`,
    });
  }

  /** Hugging Face: Run inference */
  async hfInference(modelId: string, inputs: string) {
    return this.request("huggingface", {
      method: "POST",
      path: "",
      headers: {},
      body: { inputs },
    });
  }

  /** Notion: Query database */
  async notionQuery(databaseId: string, filter?: unknown) {
    return this.request("notion", {
      method: "POST",
      path: `/databases/${databaseId}/query`,
      headers: { "Notion-Version": "2022-06-28" },
      body: filter ? { filter } : {},
    });
  }

  /** Linear: Create issue */
  async linearCreateIssue(
    title: string,
    teamId: string,
    description?: string
  ) {
    return this.request("linear", {
      method: "POST",
      path: "",
      body: {
        query: `mutation { issueCreate(input: { title: "${title}", teamId: "${teamId}", description: "${description || ""}" }) { success issue { id identifier title url } } }`,
      },
    });
  }

  /** Slack: Post message */
  async slackPostMessage(channel: string, text: string) {
    return this.request("slack", {
      method: "POST",
      path: "/chat.postMessage",
      body: { channel, text },
    });
  }

  /** Email: Send via SendGrid */
  async sendEmail(to: string, subject: string, html: string) {
    return this.request("email", {
      method: "POST",
      path: "/mail/send",
      body: {
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: process.env.EMAIL_FROM_ADDRESS || "noreply@blackroad.io",
          name: process.env.EMAIL_FROM_NAME || "BlackRoad OS",
        },
        subject,
        content: [{ type: "text/html", value: html }],
      },
    });
  }

  /** Claude: Send message */
  async claudeMessage(content: string, model = "claude-sonnet-4-6") {
    return this.request("claude", {
      method: "POST",
      path: "/messages",
      body: {
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content }],
      },
    });
  }

  /** ChatGPT: Send message */
  async chatgptMessage(content: string, model = "gpt-4o") {
    return this.request("chatgpt", {
      method: "POST",
      path: "/chat/completions",
      body: {
        model,
        messages: [{ role: "user", content }],
      },
    });
  }

  /** Gemini: Generate content */
  async geminiGenerate(content: string, model = "gemini-2.5-flash") {
    return this.request("gemini", {
      method: "POST",
      path: `/models/${model}:generateContent`,
      body: {
        contents: [{ parts: [{ text: content }] }],
      },
    });
  }

  /** Grok/xAI: Send message */
  async grokMessage(content: string, model = "grok-3") {
    return this.request("grok", {
      method: "POST",
      path: "/chat/completions",
      body: {
        model,
        messages: [{ role: "user", content }],
      },
    });
  }

  /** Cloudflare: List workers */
  async cfListWorkers() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    return this.request("cloudflare", {
      path: `/accounts/${accountId}/workers/scripts`,
    });
  }

  /** Railway: List projects */
  async railwayProjects() {
    return this.request("railway", {
      method: "POST",
      path: "",
      body: {
        query:
          "{ projects { edges { node { id name description createdAt } } } }",
      },
    });
  }

  /** Vercel: List deployments */
  async vercelDeployments(limit = 10) {
    return this.request("vercel", {
      path: `/v6/deployments?limit=${limit}`,
    });
  }

  /** Tailscale: List devices */
  async tailscaleDevices() {
    const tailnet = process.env.TAILSCALE_TAILNET;
    return this.request("tailscale", {
      path: `/tailnet/${tailnet}/devices`,
    });
  }

  /** DigitalOcean: List droplets */
  async doListDroplets() {
    return this.request("digitalocean", { path: "/droplets" });
  }

  /** Clerk: List users */
  async clerkListUsers(limit = 10) {
    return this.request("clerk", { path: `/users?limit=${limit}` });
  }

  /** Salesforce: SOQL query */
  async salesforceQuery(soql: string) {
    return this.request("salesforce", {
      path: `/query?q=${encodeURIComponent(soql)}`,
    });
  }

  /** Jira: Search issues */
  async jiraSearch(jql: string) {
    return this.request("jira", {
      method: "POST",
      path: "/search",
      body: { jql, maxResults: 50 },
    });
  }

  /** Google Drive: List files */
  async driveListFiles(query?: string) {
    const q = query ? `&q=${encodeURIComponent(query)}` : "";
    return this.request("google-drive", {
      path: `/files?pageSize=20${q}`,
    });
  }
}

// ─── Default Export ─────────────────────────────────────────────────
export default new BlackRoadIntegrations();
