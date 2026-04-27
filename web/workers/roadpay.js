var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
var VERSION = "2.0.0";
var SCHEMA = [
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    stripe_customer_id TEXT,
    metadata TEXT DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    interval TEXT DEFAULT 'month',
    interval_count INTEGER DEFAULT 1,
    features TEXT DEFAULT '[]',
    stripe_price_id TEXT,
    tier INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS addons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    interval TEXT DEFAULT 'month',
    stripe_price_id TEXT,
    active INTEGER DEFAULT 1,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    plan_id TEXT NOT NULL REFERENCES plans(id),
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active',
    current_period_start TEXT,
    current_period_end TEXT,
    cancel_at TEXT,
    canceled_at TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS subscription_addons (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
    addon_id TEXT NOT NULL REFERENCES addons(id),
    stripe_subscription_item_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    subscription_id TEXT REFERENCES subscriptions(id),
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'draft',
    description TEXT,
    line_items TEXT DEFAULT '[]',
    due_date TEXT,
    paid_at TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    invoice_id TEXT REFERENCES invoices(id),
    stripe_payment_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    method TEXT DEFAULT 'card',
    status TEXT DEFAULT 'pending',
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    customer_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`,
  `CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)`,
  `CREATE INDEX IF NOT EXISTS idx_events_customer ON events(customer_id)`,
  // v2: API keys for customers
  `CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    name TEXT DEFAULT 'default',
    scopes TEXT DEFAULT '["api:read"]',
    rate_limit INTEGER DEFAULT 1000,
    last_used TEXT,
    usage_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  // v2: Usage metering
  `CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    api_key_id TEXT REFERENCES api_keys(id),
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    status_code INTEGER,
    latency_ms INTEGER,
    tokens_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_api_keys_customer ON api_keys(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix)`,
  `CREATE INDEX IF NOT EXISTS idx_usage_customer ON usage(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_usage_date ON usage(created_at)`
];
var SEED_PLANS = [
  {
    id: "plan_starter",
    name: "Starter",
    slug: "starter",
    description: "Get started with sovereign AI. Self-hosted cluster, 5 agents, 50 skills.",
    amount: 0,
    interval: "month",
    tier: 0,
    features: JSON.stringify([
      "Self-hosted cluster",
      "5 core agents",
      "50 AI skills",
      "90 CLI tools",
      "Sovereign fleet models"
    ]),
    stripe_price_id: "price_1TAjzB3e5FMFdlFwJrJaGhtK"
  },
  {
    id: "plan_sovereign",
    name: "Sovereign",
    slug: "sovereign",
    description: "Full sovereign infrastructure. All agents, priority support, SLA.",
    amount: 4900,
    interval: "month",
    tier: 1,
    features: JSON.stringify([
      "Everything in Starter",
      "Full agent fleet",
      "Priority infrastructure",
      "99.9% SLA guarantee",
      "Direct support line",
      "Custom agent configs",
      "Advanced analytics"
    ]),
    stripe_price_id: "price_1TAjzC3e5FMFdlFwPFUMCzSI"
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom deployment. White-label, on-prem, air-gapped.",
    amount: 0,
    interval: "month",
    tier: 2,
    features: JSON.stringify([
      "Everything in Sovereign",
      "White-label OS",
      "On-prem or air-gapped",
      "Dedicated success team",
      "Custom integrations",
      "Volume licensing",
      "24/7 phone support"
    ]),
    stripe_price_id: null
  }
];
var SEED_ADDONS = [
  {
    id: "addon_lucidia",
    name: "Lucidia Enhanced",
    slug: "lucidia-enhanced",
    description: "Advanced AI companion with memory, personality, and learning.",
    amount: 999,
    interval: "month",
    stripe_price_id: "price_1TAk3e3e5FMFdlFwGi46sMNf"
  },
  {
    id: "addon_roadauth",
    name: "RoadAuth",
    slug: "roadauth",
    description: "Decentralized identity and auth for your apps.",
    amount: 499,
    interval: "month",
    stripe_price_id: "price_1TAk3f3e5FMFdlFwfYwLHZVk"
  },
  {
    id: "addon_context_bridge",
    name: "Context Bridge",
    slug: "context-bridge",
    description: "Cross-agent memory sharing and context persistence.",
    amount: 799,
    interval: "month",
    stripe_price_id: "price_1TAk3g3e5FMFdlFwNkgWv2tU"
  },
  {
    id: "addon_knowledge_hub",
    name: "Knowledge Hub",
    slug: "knowledge-hub",
    description: "RAG pipeline with vector search across your data.",
    amount: 1499,
    interval: "month",
    stripe_price_id: "price_1TAk3i3e5FMFdlFwlGXxMWFJ"
  }
];
function uid() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
__name(uid, "uid");
function json(data, status = 200) {
  return Response.json(data, { status });
}
__name(json, "json");
function err(message, status = 400) {
  return Response.json({ error: message }, { status });
}
__name(err, "err");
var SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-RoadPay-Key",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
async function logEvent(db, type, customerId, entityType, entityId, data = {}) {
  await db.prepare(
    "INSERT INTO events (id, type, customer_id, entity_type, entity_id, data) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(`evt_${uid()}`, type, customerId, entityType, entityId, JSON.stringify(data)).run();
}
__name(logEvent, "logEvent");
async function stripeRequest(env, method, path, body = null) {
  if (!env.STRIPE_SECRET_KEY) return null;
  const url = `https://api.stripe.com/v1${path}`;
  const headers = {
    "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };
  const options = { method, headers };
  if (body) options.body = new URLSearchParams(body).toString();
  const res = await fetch(url, options);
  return res.json();
}
__name(stripeRequest, "stripeRequest");
async function authenticate(request, env) {
  const apiKey = request.headers.get("X-RoadPay-Key");
  if (apiKey && env.ROADPAY_ADMIN_KEY && apiKey === env.ROADPAY_ADMIN_KEY) {
    return { role: "admin", email: "admin" };
  }
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      const requestId = crypto.randomUUID().slice(0, 8);
      const res = await fetch(`${env.AUTH_API || "https://auth.blackroad.io"}/api/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        return { role: "user", email: user.email, userId: user.id };
      }
    } catch {
    }
  }
  return null;
}
__name(authenticate, "authenticate");
async function handleInit(db) {
  for (const sql of SCHEMA) {
    await db.prepare(sql).run();
  }
  for (const plan of SEED_PLANS) {
    await db.prepare(
      `INSERT OR IGNORE INTO plans (id, name, slug, description, amount, interval, tier, features, stripe_price_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(plan.id, plan.name, plan.slug, plan.description, plan.amount, plan.interval, plan.tier, plan.features, plan.stripe_price_id).run();
  }
  for (const addon of SEED_ADDONS) {
    await db.prepare(
      `INSERT OR IGNORE INTO addons (id, name, slug, description, amount, interval, stripe_price_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(addon.id, addon.name, addon.slug, addon.description, addon.amount, addon.interval, addon.stripe_price_id).run();
  }
  return json({ ok: true, tables: SCHEMA.length, plans: SEED_PLANS.length, addons: SEED_ADDONS.length });
}
__name(handleInit, "handleInit");
async function handleCustomers(request, db, env) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    const email = url.searchParams.get("email");
    const id = url.searchParams.get("id");
    if (id) {
      const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
      if (!customer) return err("Customer not found", 404);
      const subs = await db.prepare(
        `SELECT s.*, p.name as plan_name, p.slug as plan_slug, p.amount as plan_amount
         FROM subscriptions s JOIN plans p ON s.plan_id = p.id
         WHERE s.customer_id = ? ORDER BY s.created_at DESC`
      ).bind(id).all();
      return json({ customer, subscriptions: subs.results });
    }
    if (email) {
      const customer = await db.prepare("SELECT * FROM customers WHERE email = ?").bind(email).first();
      if (!customer) return err("Customer not found", 404);
      return json({ customer });
    }
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const customers = await db.prepare(
      "SELECT * FROM customers ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const count = await db.prepare("SELECT COUNT(*) as total FROM customers").first();
    return json({ customers: customers.results, total: count.total });
  }
  if (request.method === "POST") {
    const body = await request.json();
    const { email, name, metadata } = body;
    if (!email) return err("email is required");
    const existing = await db.prepare("SELECT id FROM customers WHERE email = ?").bind(email).first();
    if (existing) return err("Customer already exists", 409);
    const id = `cus_${uid()}`;
    let stripeId = null;
    if (env.STRIPE_SECRET_KEY) {
      const stripeCustomer = await stripeRequest(env, "POST", "/customers", {
        email,
        name: name || "",
        "metadata[roadpay_id]": id,
        "metadata[source]": "roadpay"
      });
      stripeId = stripeCustomer?.id;
    }
    await db.prepare(
      "INSERT INTO customers (id, email, name, stripe_customer_id, metadata) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, email, name || null, stripeId, JSON.stringify(metadata || {})).run();
    await logEvent(db, "customer.created", id, "customer", id, { email });
    return json({ id, email, name, stripe_customer_id: stripeId }, 201);
  }
  return err("Method not allowed", 405);
}
__name(handleCustomers, "handleCustomers");
async function handlePlans(db) {
  const plans = await db.prepare("SELECT * FROM plans WHERE active = 1 ORDER BY tier ASC").all();
  return json({
    plans: plans.results.map((p) => ({
      ...p,
      features: JSON.parse(p.features || "[]"),
      metadata: JSON.parse(p.metadata || "{}")
    }))
  });
}
__name(handlePlans, "handlePlans");
async function handleAddons(db) {
  const addons = await db.prepare("SELECT * FROM addons WHERE active = 1 ORDER BY amount ASC").all();
  return json({
    addons: addons.results.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata || "{}")
    }))
  });
}
__name(handleAddons, "handleAddons");
async function handlePublicCheckout(request, db, env) {
  const body = await request.json();
  const { email, plan_slug, success_url, cancel_url } = body;
  if (!email) return err("Email is required");
  if (!plan_slug) return err("Plan is required");
  const plan = await db.prepare("SELECT * FROM plans WHERE slug = ?").bind(plan_slug).first();
  if (!plan) return err("Plan not found", 404);
  if (plan.amount === 0 || !plan.stripe_price_id) {
    let customer2 = await db.prepare("SELECT * FROM customers WHERE email = ?").bind(email).first();
    if (!customer2) {
      const custId = `cust_${uid()}`;
      await db.prepare("INSERT INTO customers (id, email, status) VALUES (?, ?, ?)").bind(custId, email, "active").run();
      customer2 = { id: custId, email };
    }
    const subId2 = `sub_${uid()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
    await db.prepare(
      `INSERT INTO subscriptions (id, customer_id, plan_id, status, current_period_start, current_period_end) VALUES (?, ?, ?, 'active', ?, ?)`
    ).bind(subId2, customer2.id, plan.id, now, periodEnd).run();
    await db.prepare(
      `INSERT INTO invoices (id, customer_id, subscription_id, amount, status, description, paid_at) VALUES (?, ?, ?, 0, 'paid', ?, ?)`
    ).bind(`inv_${uid()}`, customer2.id, subId2, `${plan.name} \u2014 Free`, now).run();
    await logEvent(db, "subscription.created", customer2.id, "subscription", subId2, { plan: plan.slug, source: "public-checkout" });
    return json({ subscription_id: subId2, plan: plan.slug, status: "active", message: "Welcome to BlackRoad! You belong here." });
  }
  if (!env.STRIPE_SECRET_KEY) return err("Payment processing not available", 503);
  let customer = await db.prepare("SELECT * FROM customers WHERE email = ?").bind(email).first();
  if (!customer) {
    const custId = `cust_${uid()}`;
    await db.prepare("INSERT INTO customers (id, email, status) VALUES (?, ?, ?)").bind(custId, email, "active").run();
    customer = { id: custId, email };
  }
  const existing = await db.prepare("SELECT id FROM subscriptions WHERE customer_id = ? AND status = 'active'").bind(customer.id).first();
  if (existing) return err("You already have an active subscription. Contact us to change plans.", 409);
  const origin = new URL(request.url).origin;
  const subId = `sub_${uid()}`;
  const session = await stripeRequest(env, "POST", "/checkout/sessions", {
    mode: "subscription",
    "line_items[0][price]": plan.stripe_price_id,
    "line_items[0][quantity]": "1",
    ...customer.stripe_customer_id ? { customer: customer.stripe_customer_id } : { customer_email: email },
    success_url: success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancel_url || `${origin}/pricing`,
    "subscription_data[metadata][roadpay_sub_id]": subId,
    "subscription_data[metadata][roadpay_customer_id]": customer.id,
    "subscription_data[metadata][plan]": plan.slug,
    "automatic_tax[enabled]": "true"
  });
  if (session.error) return err(session.error.message, 500);
  await db.prepare(
    `INSERT INTO subscriptions (id, customer_id, plan_id, status, metadata) VALUES (?, ?, ?, 'pending', ?)`
  ).bind(subId, customer.id, plan.id, JSON.stringify({ stripe_checkout_session: session.id })).run();
  await logEvent(db, "checkout.started", customer.id, "subscription", subId, { plan: plan.slug, source: "public-checkout" });
  return json({ checkout_url: session.url, subscription_id: subId });
}
__name(handlePublicCheckout, "handlePublicCheckout");
async function handleSubscribe(request, db, env) {
  const body = await request.json();
  const { customer_id, plan_slug, addon_slugs = [], success_url, cancel_url } = body;
  if (!customer_id || !plan_slug) return err("customer_id and plan_slug are required");
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(customer_id).first();
  if (!customer) return err("Customer not found", 404);
  const plan = await db.prepare("SELECT * FROM plans WHERE slug = ?").bind(plan_slug).first();
  if (!plan) return err("Plan not found", 404);
  const existing = await db.prepare(
    "SELECT id FROM subscriptions WHERE customer_id = ? AND status = 'active'"
  ).bind(customer_id).first();
  if (existing) return err("Customer already has an active subscription. Cancel first or upgrade.", 409);
  if (plan.amount === 0 && !plan.stripe_price_id) {
    const subId2 = `sub_${uid()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString();
    await db.prepare(
      `INSERT INTO subscriptions (id, customer_id, plan_id, status, current_period_start, current_period_end)
       VALUES (?, ?, ?, 'active', ?, ?)`
    ).bind(subId2, customer_id, plan.id, now, periodEnd).run();
    await db.prepare(
      `INSERT INTO invoices (id, customer_id, subscription_id, amount, status, description, paid_at)
       VALUES (?, ?, ?, 0, 'paid', ?, ?)`
    ).bind(`inv_${uid()}`, customer_id, subId2, `${plan.name} \u2014 Free`, now).run();
    await logEvent(db, "subscription.created", customer_id, "subscription", subId2, { plan: plan.slug });
    return json({ subscription_id: subId2, plan: plan.slug, status: "active" });
  }
  if (!env.STRIPE_SECRET_KEY) {
    return err("Payment processing not configured", 503);
  }
  const lineItems = {};
  lineItems["line_items[0][price]"] = plan.stripe_price_id;
  lineItems["line_items[0][quantity]"] = "1";
  if (addon_slugs.length > 0) {
    const addons = await db.prepare(
      `SELECT * FROM addons WHERE slug IN (${addon_slugs.map(() => "?").join(",")}) AND active = 1`
    ).bind(...addon_slugs).all();
    addons.results.forEach((addon, i) => {
      lineItems[`line_items[${i + 1}][price]`] = addon.stripe_price_id;
      lineItems[`line_items[${i + 1}][quantity]`] = "1";
    });
  }
  const origin = new URL(request.url).origin;
  const subId = `sub_${uid()}`;
  const session = await stripeRequest(env, "POST", "/checkout/sessions", {
    mode: "subscription",
    ...lineItems,
    ...customer.stripe_customer_id ? { customer: customer.stripe_customer_id } : { customer_email: customer.email },
    success_url: success_url || `${origin}/success?session_id={CHECKOUT_SESSION_ID}&sub=${subId}`,
    cancel_url: cancel_url || `${origin}/pricing`,
    "subscription_data[metadata][roadpay_sub_id]": subId,
    "subscription_data[metadata][roadpay_customer_id]": customer_id,
    "subscription_data[metadata][plan]": plan.slug,
    "automatic_tax[enabled]": "true"
  });
  if (session.error) {
    return err(session.error.message, 500);
  }
  await db.prepare(
    `INSERT INTO subscriptions (id, customer_id, plan_id, status, metadata)
     VALUES (?, ?, ?, 'pending', ?)`
  ).bind(subId, customer_id, plan.id, JSON.stringify({ stripe_checkout_session: session.id })).run();
  await logEvent(db, "checkout.started", customer_id, "subscription", subId, { plan: plan.slug });
  return json({ checkout_url: session.url, subscription_id: subId, session_id: session.id });
}
__name(handleSubscribe, "handleSubscribe");
async function handleSubscription(request, db, env) {
  const url = new URL(request.url);
  const subId = url.pathname.split("/").pop();
  if (request.method === "GET") {
    const sub = await db.prepare(
      `SELECT s.*, p.name as plan_name, p.slug as plan_slug, p.amount as plan_amount, p.features
       FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.id = ?`
    ).bind(subId).first();
    if (!sub) return err("Subscription not found", 404);
    const addons = await db.prepare(
      `SELECT sa.*, a.name as addon_name, a.slug as addon_slug, a.amount as addon_amount
       FROM subscription_addons sa JOIN addons a ON sa.addon_id = a.id
       WHERE sa.subscription_id = ? AND sa.status = 'active'`
    ).bind(subId).all();
    return json({
      subscription: {
        ...sub,
        features: JSON.parse(sub.features || "[]"),
        metadata: JSON.parse(sub.metadata || "{}")
      },
      addons: addons.results
    });
  }
  if (request.method === "DELETE") {
    const sub = await db.prepare("SELECT * FROM subscriptions WHERE id = ?").bind(subId).first();
    if (!sub) return err("Subscription not found", 404);
    if (sub.stripe_subscription_id && env.STRIPE_SECRET_KEY) {
      await stripeRequest(env, "DELETE", `/subscriptions/${sub.stripe_subscription_id}`);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.prepare(
      "UPDATE subscriptions SET status = 'canceled', canceled_at = ?, updated_at = ? WHERE id = ?"
    ).bind(now, now, subId).run();
    await logEvent(db, "subscription.canceled", sub.customer_id, "subscription", subId);
    return json({ ok: true, status: "canceled" });
  }
  return err("Method not allowed", 405);
}
__name(handleSubscription, "handleSubscription");
async function handleInvoices(request, db) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  if (!customerId) return err("customer_id is required");
  const invoices = await db.prepare(
    "SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(customerId).all();
  return json({
    invoices: invoices.results.map((inv) => ({
      ...inv,
      line_items: JSON.parse(inv.line_items || "[]"),
      metadata: JSON.parse(inv.metadata || "{}")
    }))
  });
}
__name(handleInvoices, "handleInvoices");
async function handlePayments(request, db) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  if (!customerId) return err("customer_id is required");
  const payments = await db.prepare(
    "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(customerId).all();
  return json({ payments: payments.results });
}
__name(handlePayments, "handlePayments");
async function handlePortal(request, db) {
  const { customer_id } = await request.json();
  if (!customer_id) return err("customer_id is required");
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(customer_id).first();
  if (!customer) return err("Customer not found", 404);
  const subs = await db.prepare(
    `SELECT s.*, p.name as plan_name, p.slug as plan_slug, p.amount as plan_amount, p.features
     FROM subscriptions s JOIN plans p ON s.plan_id = p.id
     WHERE s.customer_id = ? ORDER BY s.created_at DESC`
  ).bind(customer_id).all();
  const invoices = await db.prepare(
    "SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10"
  ).bind(customer_id).all();
  const payments = await db.prepare(
    "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10"
  ).bind(customer_id).all();
  return json({
    customer: { ...customer, metadata: JSON.parse(customer.metadata || "{}") },
    subscriptions: subs.results.map((s) => ({
      ...s,
      features: JSON.parse(s.features || "[]"),
      metadata: JSON.parse(s.metadata || "{}")
    })),
    invoices: invoices.results.map((i) => ({
      ...i,
      line_items: JSON.parse(i.line_items || "[]")
    })),
    payments: payments.results
  });
}
__name(handlePortal, "handlePortal");
async function handleWebhook(request, db, env) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  if (env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      await verifySignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (e) {
      return err(`Webhook verification failed: ${e.message}`, 400);
    }
  }
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return err("Invalid JSON", 400);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const subId = session.metadata?.roadpay_sub_id;
      const customerId = session.metadata?.roadpay_customer_id;
      if (subId) {
        await db.prepare(
          `UPDATE subscriptions SET status = 'active', stripe_subscription_id = ?,
           current_period_start = ?, updated_at = ? WHERE id = ?`
        ).bind(session.subscription, now, now, subId).run();
      }
      if (customerId && session.customer) {
        await db.prepare(
          "UPDATE customers SET stripe_customer_id = ?, updated_at = ? WHERE id = ? AND stripe_customer_id IS NULL"
        ).bind(session.customer, now, customerId).run();
      }
      await logEvent(db, "checkout.completed", customerId, "subscription", subId, {
        stripe_session: session.id
      });
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const stripeSubId = invoice.subscription;
      const sub = await db.prepare(
        "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?"
      ).bind(stripeSubId).first();
      if (sub) {
        await db.prepare(
          `INSERT INTO invoices (id, customer_id, subscription_id, stripe_invoice_id, amount, status, description, paid_at)
           VALUES (?, ?, ?, ?, ?, 'paid', ?, ?)`
        ).bind(
          `inv_${uid()}`,
          sub.customer_id,
          sub.id,
          invoice.id,
          invoice.amount_paid,
          `Payment for ${invoice.lines?.data?.[0]?.description || "subscription"}`,
          now
        ).run();
        await db.prepare(
          `INSERT INTO payments (id, customer_id, invoice_id, stripe_payment_id, amount, status)
           VALUES (?, ?, ?, ?, ?, 'succeeded')`
        ).bind(`pay_${uid()}`, sub.customer_id, invoice.id, invoice.payment_intent, invoice.amount_paid).run();
        const periodEnd = invoice.lines?.data?.[0]?.period?.end;
        if (periodEnd) {
          await db.prepare(
            "UPDATE subscriptions SET current_period_end = ?, updated_at = ? WHERE id = ?"
          ).bind(new Date(periodEnd * 1e3).toISOString(), now, sub.id).run();
        }
        await logEvent(db, "payment.succeeded", sub.customer_id, "payment", invoice.payment_intent, {
          amount: invoice.amount_paid
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const sub = await db.prepare(
        "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?"
      ).bind(invoice.subscription).first();
      if (sub) {
        await db.prepare(
          "UPDATE subscriptions SET status = 'past_due', updated_at = ? WHERE id = ?"
        ).bind(now, sub.id).run();
        await logEvent(db, "payment.failed", sub.customer_id, "subscription", sub.id, {
          amount: invoice.amount_due
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const stripeSub = event.data.object;
      const sub = await db.prepare(
        "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?"
      ).bind(stripeSub.id).first();
      if (sub) {
        await db.prepare(
          "UPDATE subscriptions SET status = 'canceled', canceled_at = ?, updated_at = ? WHERE id = ?"
        ).bind(now, now, sub.id).run();
        await logEvent(db, "subscription.canceled", sub.customer_id, "subscription", sub.id);
      }
      break;
    }
    case "customer.subscription.updated": {
      const stripeSub = event.data.object;
      const sub = await db.prepare(
        "SELECT * FROM subscriptions WHERE stripe_subscription_id = ?"
      ).bind(stripeSub.id).first();
      if (sub) {
        await db.prepare(
          "UPDATE subscriptions SET status = ?, updated_at = ? WHERE id = ?"
        ).bind(stripeSub.status, now, sub.id).run();
      }
      break;
    }
    default:
      console.log(`Unhandled webhook: ${event.type}`);
  }
  return json({ received: true });
}
__name(handleWebhook, "handleWebhook");
async function verifySignature(payload, sigHeader, secret) {
  if (!sigHeader) throw new Error("Missing signature");
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts.t;
  const sigs = Object.entries(parts).filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || !sigs.length) throw new Error("Invalid signature format");
  const tolerance = 300;
  if (Math.abs(Math.floor(Date.now() / 1e3) - parseInt(timestamp)) > tolerance) {
    throw new Error("Timestamp outside tolerance");
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  const computed = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (!sigs.includes(computed)) throw new Error("Signature mismatch");
}
__name(verifySignature, "verifySignature");
async function handleStats(db) {
  const customers = await db.prepare("SELECT COUNT(*) as total FROM customers").first();
  const activeSubs = await db.prepare("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'active'").first();
  const totalRevenue = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'succeeded'").first();
  const invoicesPaid = await db.prepare("SELECT COUNT(*) as total FROM invoices WHERE status = 'paid'").first();
  const recentEvents = await db.prepare("SELECT * FROM events ORDER BY created_at DESC LIMIT 20").all();
  const mrr = await db.prepare(
    `SELECT COALESCE(SUM(p.amount), 0) as mrr
     FROM subscriptions s JOIN plans p ON s.plan_id = p.id
     WHERE s.status = 'active'`
  ).first();
  const planBreakdown = await db.prepare(
    `SELECT p.name, p.slug, COUNT(s.id) as subscribers, p.amount
     FROM plans p LEFT JOIN subscriptions s ON s.plan_id = p.id AND s.status = 'active'
     GROUP BY p.id ORDER BY p.tier ASC`
  ).all();
  return json({
    stats: {
      customers: customers.total,
      active_subscriptions: activeSubs.total,
      total_revenue_cents: totalRevenue.total,
      total_revenue: `$${(totalRevenue.total / 100).toFixed(2)}`,
      mrr_cents: mrr.mrr,
      mrr: `$${(mrr.mrr / 100).toFixed(2)}`,
      invoices_paid: invoicesPaid.total
    },
    plan_breakdown: planBreakdown.results,
    recent_events: recentEvents.results.map((e) => ({
      ...e,
      data: JSON.parse(e.data || "{}")
    }))
  });
}
__name(handleStats, "handleStats");
async function handleLookup(request, db) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) return err("email is required");
  const customer = await db.prepare("SELECT id, email, name, status, created_at FROM customers WHERE email = ?").bind(email).first();
  if (!customer) return json({ found: false });
  const sub = await db.prepare(
    `SELECT s.id, s.status, s.current_period_end, p.name as plan_name, p.slug as plan_slug, p.tier
     FROM subscriptions s JOIN plans p ON s.plan_id = p.id
     WHERE s.customer_id = ? AND s.status = 'active'
     ORDER BY s.created_at DESC LIMIT 1`
  ).bind(customer.id).first();
  return json({
    found: true,
    customer_id: customer.id,
    email: customer.email,
    name: customer.name,
    plan: sub ? { name: sub.plan_name, slug: sub.plan_slug, tier: sub.tier, status: sub.status, period_end: sub.current_period_end } : null
  });
}
__name(handleLookup, "handleLookup");
async function handleUpgrade(request, db, env) {
  const { customer_id, new_plan_slug } = await request.json();
  if (!customer_id || !new_plan_slug) return err("customer_id and new_plan_slug required");
  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(customer_id).first();
  if (!customer) return err("Customer not found", 404);
  const newPlan = await db.prepare("SELECT * FROM plans WHERE slug = ?").bind(new_plan_slug).first();
  if (!newPlan) return err("Plan not found", 404);
  const currentSub = await db.prepare(
    "SELECT * FROM subscriptions WHERE customer_id = ? AND status = 'active'"
  ).bind(customer_id).first();
  if (!currentSub) return err("No active subscription to upgrade", 404);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!newPlan.stripe_price_id || newPlan.amount === 0) {
    if (currentSub.stripe_subscription_id && env.STRIPE_SECRET_KEY) {
      await stripeRequest(env, "DELETE", `/subscriptions/${currentSub.stripe_subscription_id}`);
    }
    await db.prepare(
      "UPDATE subscriptions SET status = 'canceled', canceled_at = ?, updated_at = ? WHERE id = ?"
    ).bind(now, now, currentSub.id).run();
    const newSubId = `sub_${uid()}`;
    await db.prepare(
      `INSERT INTO subscriptions (id, customer_id, plan_id, status, current_period_start, current_period_end)
       VALUES (?, ?, ?, 'active', ?, ?)`
    ).bind(newSubId, customer_id, newPlan.id, now, new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString()).run();
    await logEvent(db, "subscription.changed", customer_id, "subscription", newSubId, {
      from: currentSub.plan_id,
      to: newPlan.id
    });
    return json({ subscription_id: newSubId, plan: newPlan.slug, status: "active" });
  }
  if (currentSub.stripe_subscription_id && env.STRIPE_SECRET_KEY) {
    const stripeSub = await stripeRequest(env, "GET", `/subscriptions/${currentSub.stripe_subscription_id}`);
    if (stripeSub?.items?.data?.[0]) {
      await stripeRequest(env, "POST", `/subscriptions/${currentSub.stripe_subscription_id}`, {
        "items[0][id]": stripeSub.items.data[0].id,
        "items[0][price]": newPlan.stripe_price_id,
        proration_behavior: "create_prorations"
      });
    }
    await db.prepare(
      "UPDATE subscriptions SET plan_id = ?, updated_at = ? WHERE id = ?"
    ).bind(newPlan.id, now, currentSub.id).run();
    await logEvent(db, "subscription.upgraded", customer_id, "subscription", currentSub.id, {
      from: currentSub.plan_id,
      to: newPlan.id
    });
    return json({ subscription_id: currentSub.id, plan: newPlan.slug, status: "active", prorated: true });
  }
  return err("Cannot upgrade \u2014 no active Stripe subscription", 400);
}
__name(handleUpgrade, "handleUpgrade");
function handleLandingPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoadPay \u2014 Pricing &amp; Plans | BlackRoad OS</title>
  <link rel="icon" type="image/x-icon" href="https://images.blackroad.io/brand/favicon.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="https://images.blackroad.io/brand/br-square-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="https://images.blackroad.io/brand/apple-touch-icon.png" />
  <meta property="og:image" content="https://images.blackroad.io/brand/blackroad-icon-512.png" />
  <meta property="og:title" content="RoadPay \u2014 Pricing &amp; Plans" />
  <meta property="og:description" content="Choose your plan. AI agents, fleet tools, and full API access \u2014 starting free." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="description" content="RoadPay pricing plans and add-ons. AI agents, fleet management, and full API access \u2014 starting free." />
  <link rel="canonical" href="https://pay.blackroad.io/">
  <meta name="robots" content="index, follow">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"RoadPay","url":"https://pay.blackroad.io","applicationCategory":"FinanceApplication","operatingSystem":"Web","description":"BlackRoad OS pricing, plans, and payment processing","author":{"@type":"Organization","name":"BlackRoad OS, Inc."}}</script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --g: linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
      --g135: linear-gradient(135deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF);
      --bg: #000; --card: #0a0a0a; --elevated: #111; --hover: #181818;
      --border: #1a1a1a; --muted: #444; --sub: #737373; --text: #f5f5f5; --white: #fff;
      --sg: 'Space Grotesk', sans-serif; --jb: 'JetBrains Mono', monospace;
    }
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: var(--sg); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#000; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#FF6B2B,#FF2255,#8844FF,#00D4FF); border-radius:3px; }
    .gradient-text { color: #f5f5f5; }
    .gradient-border { border:1px solid transparent; background-origin:border-box; background-clip:padding-box,border-box; background-image:linear-gradient(#0a0a0a,#0a0a0a), var(--g); }
    .gradient-line { height:1px; background: linear-gradient(90deg,transparent,#FF2255,#8844FF,#00D4FF,transparent); }

    /* Nav */
    nav { position:fixed; top:0; left:0; right:0; z-index:100; padding:16px 40px; display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,.85); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); }
    .nav-logo { font-family:var(--jb); font-size:14px; letter-spacing:2px; text-transform:uppercase; opacity:.6; }
    .nav-links { display:flex; gap:24px; }
    .nav-links a { color:rgba(255,255,255,.5); text-decoration:none; font-size:14px; transition:color .3s; }
    .nav-links a:hover { color:#fff; }

    /* Hero */
    .hero { padding:160px 40px 80px; text-align:center; max-width:900px; margin:0 auto; }
    .hero h1 { font-size:clamp(48px,8vw,88px); font-weight:700; letter-spacing:-2px; line-height:1; }
    .hero p { font-size:clamp(16px,2vw,20px); opacity:.5; margin-top:20px; max-width:560px; margin-left:auto; margin-right:auto; line-height:1.6; }
    .badge { display:inline-block; font-family:var(--jb); font-size:12px; letter-spacing:3px; text-transform:uppercase; opacity:.35; margin-bottom:16px; }

    /* Pricing Section */
    .section { padding:80px 40px; max-width:1200px; margin:0 auto; }
    .section-label { font-family:var(--jb); font-size:12px; letter-spacing:4px; text-transform:uppercase; opacity:.35; margin-bottom:12px; }
    .section-title { font-size:clamp(32px,4vw,52px); font-weight:700; line-height:1.1; margin-bottom:16px; }
    .section-sub { font-size:16px; opacity:.45; max-width:560px; line-height:1.6; margin-bottom:48px; }

    /* Plan Cards */
    .plans-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    @media(max-width:1024px) { .plans-grid { grid-template-columns:repeat(2,1fr); } }
    @media(max-width:600px) { .plans-grid { grid-template-columns:1fr; } }

    .plan-card { padding:32px 28px; border-radius:16px; position:relative; transition:transform .3s, box-shadow .3s; display:flex; flex-direction:column; }
    .plan-card:hover { transform:translateY(-6px); }
    .plan-card.featured { box-shadow:0 0 80px rgba(255,34,85,.08); }
    .plan-card.featured::before { content:'Most Popular'; position:absolute; top:-12px; left:50%; transform:translateX(-50%); font-family:var(--jb); font-size:11px; letter-spacing:2px; text-transform:uppercase; background:var(--g); color:#000; padding:4px 16px; border-radius:20px; font-weight:700; }
    .plan-name { font-size:20px; font-weight:700; margin-bottom:4px; }
    .plan-desc { font-size:13px; opacity:.4; margin-bottom:20px; min-height:36px; }
    .plan-price { font-size:48px; font-weight:700; letter-spacing:-2px; }
    .plan-price span { font-size:16px; opacity:.4; font-weight:400; letter-spacing:0; }
    .plan-period { font-family:var(--jb); font-size:12px; opacity:.3; margin-bottom:24px; }
    .plan-features { list-style:none; flex:1; margin-bottom:24px; }
    .plan-features li { padding:8px 0; font-size:14px; opacity:.55; border-bottom:1px solid rgba(255,255,255,.04); display:flex; align-items:center; gap:8px; }
    .plan-features li::before { content:'\\2713'; color:#f5f5f5; font-size:12px; flex-shrink:0; }
    .plan-cta { display:block; text-align:center; padding:14px 24px; border-radius:12px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; transition:all .3s; border:1px solid rgba(255,255,255,.15); }
    .plan-cta:hover { border-color:#FF2255; background:rgba(255,34,85,.1); transform:translateY(-1px); }
    .plan-cta.primary { background:var(--g); border:none; color:#000; font-weight:700; }
    .plan-cta.primary:hover { opacity:.9; }

    /* Add-ons */
    .addons-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
    .addon-card { padding:24px; border-radius:14px; display:flex; flex-direction:column; gap:8px; transition:transform .3s; }
    .addon-card:hover { transform:translateY(-3px); }
    .addon-header { display:flex; justify-content:space-between; align-items:center; }
    .addon-name { font-weight:700; font-size:16px; }
    .addon-price { font-family:var(--jb); font-size:14px; opacity:.5; }
    .addon-desc { font-size:13px; opacity:.4; line-height:1.5; }

    /* FAQ */
    .faq-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:24px; }
    .faq-item { padding:28px; border-radius:14px; }
    .faq-q { font-weight:700; font-size:16px; margin-bottom:8px; }
    .faq-a { font-size:14px; opacity:.45; line-height:1.7; }

    /* Footer */
    .footer { border-top:1px solid var(--border); padding:60px 40px; text-align:center; margin-top:80px; }
    .footer-links { display:flex; flex-wrap:wrap; justify-content:center; gap:24px; margin-bottom:24px; }
    .footer-links a { color:rgba(255,255,255,.4); text-decoration:none; font-size:14px; transition:color .3s; }
    .footer-links a:hover { color:#fff; }

    /* Checkout modal */
    .checkout-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:1000; align-items:center; justify-content:center; }
    .checkout-overlay.active { display:flex; }
    .checkout-box { background:#111; border:1px solid #222; border-radius:16px; padding:40px; max-width:420px; width:90%; text-align:center; }
    .checkout-box h3 { font-size:24px; font-weight:700; margin-bottom:8px; }
    .checkout-box .checkout-plan { font-family:var(--jb); font-size:14px; opacity:.5; margin-bottom:24px; }
    .checkout-box input { width:100%; padding:14px 16px; background:#0a0a0a; border:1px solid #333; border-radius:8px; color:#fff; font-size:16px; margin-bottom:16px; outline:none; font-family:var(--sg); }
    .checkout-box input:focus { border-color:#FF2255; }
    .checkout-box .checkout-btn { width:100%; padding:14px; background:var(--g); border:none; border-radius:8px; color:#000; font-weight:700; font-size:16px; cursor:pointer; font-family:var(--sg); }
    .checkout-box .checkout-btn:disabled { opacity:.5; cursor:wait; }
    .checkout-box .checkout-cancel { display:block; margin-top:12px; color:#555; font-size:13px; cursor:pointer; background:none; border:none; font-family:var(--sg); }
    .checkout-box .checkout-msg { font-size:13px; margin-top:12px; color:#f5f5f5; }
    .checkout-box .checkout-err { font-size:13px; margin-top:12px; color:#f5f5f5; }

    /* Animations */
    .fade-up { opacity:0; transform:translateY(30px); transition:opacity .7s ease, transform .7s ease; }
    .fade-up.visible { opacity:1; transform:translateY(0); }
    @media(max-width:768px) { .section { padding:60px 20px; } nav { padding:14px 20px; } .hero { padding:120px 20px 60px; } }
  </style>
<link rel="stylesheet" href="https://images.blackroad.io/brand/brand.css"></head>
<body><style id="br-nav-style">#br-nav{position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;font-family:'Space Grotesk',-apple-system,sans-serif}#br-nav .ni{max-width:1200px;margin:0 auto;padding:0 20px;height:48px;display:flex;align-items:center;justify-content:space-between}#br-nav .nl{display:flex;align-items:center;gap:12px}#br-nav .nb{color:#666;font-size:12px;padding:6px 8px;border-radius:6px;display:flex;align-items:center;cursor:pointer;border:none;background:none;transition:color .15s}#br-nav .nb:hover{color:#f5f5f5}#br-nav .nh{text-decoration:none;display:flex;align-items:center;gap:8px}#br-nav .nm{display:flex;gap:2px}#br-nav .nm span{width:6px;height:6px;border-radius:50%}#br-nav .nt{color:#f5f5f5;font-weight:600;font-size:14px}#br-nav .ns{color:#333;font-size:14px}#br-nav .np{color:#999;font-size:13px}#br-nav .nk{display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none}#br-nav .nk::-webkit-scrollbar{display:none}#br-nav .nk a{color:#888;text-decoration:none;font-size:12px;padding:6px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s}#br-nav .nk a:hover{color:#f5f5f5;background:#111}#br-nav .nk a.ac{color:#f5f5f5;background:#1a1a1a}#br-nav .mm{display:none;background:none;border:none;color:#888;font-size:20px;cursor:pointer;padding:6px}#br-dd{display:none;position:fixed;top:48px;left:0;right:0;background:rgba(0,0,0,0.96);backdrop-filter:blur(12px);border-bottom:1px solid #1a1a1a;z-index:9998;padding:12px 20px}#br-dd.open{display:flex;flex-wrap:wrap;gap:4px}#br-dd a{color:#888;text-decoration:none;font-size:13px;padding:8px 14px;border-radius:6px;transition:color .15s,background .15s}#br-dd a:hover,#br-dd a.ac{color:#f5f5f5;background:#111}body{padding-top:48px!important}@media(max-width:768px){#br-nav .nk{display:none}#br-nav .mm{display:block}}</style><nav id="br-nav"><div class="ni"><div class="nl"><button class="nb" onclick="history.length>1?history.back():location.href='https://blackroad.io'" title="Back">&larr;</button><a href="https://blackroad.io" class="nh"><div class="nm"><span style="background:#FF6B2B"></span><span style="background:#FF2255"></span><span style="background:#CC00AA"></span><span style="background:#8844FF"></span><span style="background:#4488FF"></span><span style="background:#00D4FF"></span></div><span class="nt">BlackRoad</span></a><span class="ns">/</span><span class="np">Pay</span></div><div class="nk"><a href="https://blackroad.io">Home</a><a href="https://chat.blackroad.io">Chat</a><a href="https://search.blackroad.io">Search</a><a href="https://tutor.blackroad.io">Tutor</a><a href="https://pay.blackroad.io" class="ac">Pay</a><a href="https://canvas.blackroad.io">Canvas</a><a href="https://cadence.blackroad.io">Cadence</a><a href="https://video.blackroad.io">Video</a><a href="https://radio.blackroad.io">Radio</a><a href="https://game.blackroad.io">Game</a><a href="https://roundtrip.blackroad.io">Agents</a><a href="https://roadcode.blackroad.io">RoadCode</a><a href="https://hq.blackroad.io">HQ</a><a href="https://app.blackroad.io">Dashboard</a></div><button class="mm" onclick="document.getElementById('br-dd').classList.toggle('open')">&#9776;</button></div></nav><div id="br-dd"><a href="https://blackroad.io">Home</a><a href="https://chat.blackroad.io">Chat</a><a href="https://search.blackroad.io">Search</a><a href="https://tutor.blackroad.io">Tutor</a><a href="https://pay.blackroad.io" class="ac">Pay</a><a href="https://canvas.blackroad.io">Canvas</a><a href="https://cadence.blackroad.io">Cadence</a><a href="https://video.blackroad.io">Video</a><a href="https://radio.blackroad.io">Radio</a><a href="https://game.blackroad.io">Game</a><a href="https://roundtrip.blackroad.io">Agents</a><a href="https://roadcode.blackroad.io">RoadCode</a><a href="https://hq.blackroad.io">HQ</a><a href="https://app.blackroad.io">Dashboard</a></div><script>document.addEventListener('click',function(e){var d=document.getElementById('br-dd');if(d&&d.classList.contains('open')&&!e.target.closest('#br-nav')&&!e.target.closest('#br-dd'))d.classList.remove('open')});</script>

<nav>
  <div class="nav-logo">RoadPay</div>
  <div class="nav-links">
    <a href="https://blackroad.io">Home</a>
    <a href="#plans">Plans</a>
    <a href="#addons">Add-ons</a>
    <a href="#faq">FAQ</a>
    <a href="/health">API</a>
  </div>
</nav>

<section class="hero">
  <div class="badge">Billing by BlackRoad</div>
  <h1 class="gradient-text">Choose your road.</h1>
  <p>AI agents, fleet management, and full API access. Start free, scale when you need to. Your data stays yours.</p>
</section>
<div class="gradient-line"></div>

<section class="section" id="plans">
  <div class="fade-up">
    <p class="section-label">Plans</p>
    <h2 class="section-title">Simple pricing. No surprises.</h2>
    <p class="section-sub">Every plan includes access to BlackRoad's AI agent platform. Upgrade or downgrade anytime.</p>
  </div>
  <div class="plans-grid fade-up" id="plans-grid">
    <div class="plan-card gradient-border">
      <div class="plan-name">Starter</div>
      <div class="plan-desc">Get started with AI agents at no cost.</div>
      <div class="plan-price">$0</div>
      <div class="plan-period">free forever</div>
      <ul class="plan-features">
        <li>1 AI agent</li>
        <li>Community support</li>
        <li>Basic RoadSearch</li>
        <li>Public dashboard</li>
      </ul>
      <button class="plan-cta" onclick="openCheckout('starter','Starter','Free')">Get Started</button>
    </div>
    <div class="plan-card gradient-border featured">
      <div class="plan-name">Sovereign</div>
      <div class="plan-desc">For builders who need more power.</div>
      <div class="plan-price">$29<span>/mo</span></div>
      <div class="plan-period">billed monthly</div>
      <ul class="plan-features">
        <li>5 AI agents</li>
        <li>Priority support</li>
        <li>Full API access</li>
        <li>RoadSearch Pro</li>
        <li>Custom dashboards</li>
        <li>Webhook integrations</li>
      </ul>
      <button class="plan-cta primary" onclick="openCheckout('rider','Sovereign','$29/mo')">Subscribe \u2014 $29/mo</button>
    </div>
    <div class="plan-card gradient-border">
      <div class="plan-name">Enterprise</div>
      <div class="plan-desc">For teams that build together.</div>
      <div class="plan-price">$99<span>/mo</span></div>
      <div class="plan-period">billed monthly</div>
      <ul class="plan-features">
        <li>25 AI agents</li>
        <li>Dedicated support</li>
        <li>Fleet management</li>
        <li>Team workspaces</li>
        <li>Advanced analytics</li>
        <li>Priority inference</li>
        <li>Custom models</li>
      </ul>
      <button class="plan-cta" onclick="openCheckout('paver','Enterprise','$99/mo')">Subscribe \u2014 $99/mo</button>
    </div>
    <div class="plan-card gradient-border">
      <div class="plan-name">Enterprise</div>
      <div class="plan-desc">Tailored to your organization.</div>
      <div class="plan-price">Custom</div>
      <div class="plan-period">per agreement</div>
      <ul class="plan-features">
        <li>Unlimited agents</li>
        <li>Dedicated infrastructure</li>
        <li>Custom SLAs</li>
        <li>White-label option</li>
        <li>Private deployment</li>
        <li>Direct engineering support</li>
        <li>Custom integrations</li>
      </ul>
      <a href="mailto:alexa@blackroad.io?subject=Enterprise%20Plan" class="plan-cta">Contact Us</a>
    </div>
  </div>
</section>
<div class="gradient-line"></div>

<section class="section" id="addons">
  <div class="fade-up">
    <p class="section-label">Add-ons</p>
    <h2 class="section-title">Extend your plan.</h2>
    <p class="section-sub">Stack capabilities on top of any paid plan. Each add-on is billed monthly.</p>
  </div>
  <div class="addons-grid fade-up">
    <div class="addon-card gradient-border">
      <div class="addon-header"><span class="addon-name">Lucidia Enhanced</span><span class="addon-price">$9.99/mo</span></div>
      <div class="addon-desc">Advanced AI companion with memory, personality, and continuous learning.</div>
    </div>
    <div class="addon-card gradient-border">
      <div class="addon-header"><span class="addon-name">RoadAuth</span><span class="addon-price">$4.99/mo</span></div>
      <div class="addon-desc">Identity and authentication for your apps. Your data stays yours.</div>
    </div>
    <div class="addon-card gradient-border">
      <div class="addon-header"><span class="addon-name">Context Bridge</span><span class="addon-price">$7.99/mo</span></div>
      <div class="addon-desc">Cross-agent memory sharing and context that persists between sessions.</div>
    </div>
    <div class="addon-card gradient-border">
      <div class="addon-header"><span class="addon-name">Knowledge Hub</span><span class="addon-price">$14.99/mo</span></div>
      <div class="addon-desc">RAG pipeline with vector search across all your data. Answers grounded in your content.</div>
    </div>
  </div>
</section>
<div class="gradient-line"></div>

<section class="section" id="faq">
  <div class="fade-up">
    <p class="section-label">FAQ</p>
    <h2 class="section-title">Common questions.</h2>
  </div>
  <div class="faq-grid fade-up">
    <div class="faq-item gradient-border">
      <div class="faq-q">How does billing work?</div>
      <div class="faq-a">All plans are billed monthly. You can upgrade, downgrade, or cancel anytime from your dashboard. Upgrades are prorated automatically.</div>
    </div>
    <div class="faq-item gradient-border">
      <div class="faq-q">What payment methods do you accept?</div>
      <div class="faq-a">We accept all major credit and debit cards through our secure payment processor. No cryptocurrency at this time.</div>
    </div>
    <div class="faq-item gradient-border">
      <div class="faq-q">Can I try before I buy?</div>
      <div class="faq-a">The Starter plan is free to get started. Use it as long as you like. When you need more agents or features, upgrade in one click.</div>
    </div>
    <div class="faq-item gradient-border">
      <div class="faq-q">Where does my data live?</div>
      <div class="faq-a">Your data stays yours, always. It runs on your device or on edge infrastructure close to you. We never sell or share your data.</div>
    </div>
    <div class="faq-item gradient-border">
      <div class="faq-q">What happens if I cancel?</div>
      <div class="faq-a">Your account downgrades to the Starter plan at the end of your billing period. No data is deleted. You can re-subscribe anytime.</div>
    </div>
    <div class="faq-item gradient-border">
      <div class="faq-q">Do add-ons require a paid plan?</div>
      <div class="faq-a">Add-ons are available on the Rider plan and above. They stack on top of your base plan and are billed separately each month.</div>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="footer-links">
    <a href="https://blackroad.io">Home</a>
    <a href="https://lucidia.earth">Lucidia</a>
    <a href="https://blackroadai.com">AI</a>
    <a href="https://blackroad.network">Network</a>
    <a href="https://blackroad.systems">Cloud</a>
    <a href="https://status.blackroad.io">Status</a>
    <a href="https://blackroad.company">Company</a>
    <a href="https://search.blackroad.io">Search</a>
    <a href="https://github.com/blackboxprogramming">GitHub</a>
  </div>
  <p style="color:rgba(255,255,255,.3);font-size:14px">BlackRoad OS &mdash; Remember the Road. Pave Tomorrow.</p>
  <p style="color:rgba(255,255,255,.15);font-size:12px;margin-top:8px">&copy; 2025&ndash;2026 BlackRoad OS, Inc. All rights reserved.</p>
</footer>

<div class="checkout-overlay" id="checkoutOverlay">
  <div class="checkout-box">
    <h3 id="checkoutTitle">Subscribe</h3>
    <div class="checkout-plan" id="checkoutPlan"></div>
    <input type="email" id="checkoutEmail" placeholder="your@email.com" autocomplete="email" />
    <button class="checkout-btn" id="checkoutBtn" onclick="doCheckout()">Continue to Payment</button>
    <button class="checkout-cancel" onclick="closeCheckout()">Cancel</button>
    <div class="checkout-msg" id="checkoutMsg" style="display:none"></div>
    <div class="checkout-err" id="checkoutErr" style="display:none"></div>
  </div>
</div>

<script>
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

let currentPlanSlug = '';
function openCheckout(slug, name, price) {
  currentPlanSlug = slug;
  document.getElementById('checkoutTitle').textContent = name;
  document.getElementById('checkoutPlan').textContent = price === 'Free' ? 'Free forever' : price + ' \u2014 cancel anytime';
  document.getElementById('checkoutEmail').value = '';
  document.getElementById('checkoutMsg').style.display = 'none';
  document.getElementById('checkoutErr').style.display = 'none';
  document.getElementById('checkoutBtn').textContent = price === 'Free' ? 'Get Started \u2014 Free' : 'Continue to Payment';
  document.getElementById('checkoutOverlay').classList.add('active');
  setTimeout(() => document.getElementById('checkoutEmail').focus(), 100);
}
function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
}
async function doCheckout() {
  const email = document.getElementById('checkoutEmail').value.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('checkoutErr').textContent = 'Please enter a valid email.';
    document.getElementById('checkoutErr').style.display = 'block';
    return;
  }
  const btn = document.getElementById('checkoutBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  document.getElementById('checkoutErr').style.display = 'none';
  try {
    const res = await fetch('/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, plan_slug: currentPlanSlug })
    });
    const data = await res.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else if (data.status === 'active') {
      document.getElementById('checkoutMsg').textContent = data.message || 'Welcome to BlackRoad! You are subscribed.';
      document.getElementById('checkoutMsg').style.display = 'block';
      btn.textContent = 'Done!';
      setTimeout(() => closeCheckout(), 2000);
    } else {
      document.getElementById('checkoutErr').textContent = data.error || 'Something went wrong.';
      document.getElementById('checkoutErr').style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Try Again';
    }
  } catch (e) {
    document.getElementById('checkoutErr').textContent = 'Network error. Please try again.';
    document.getElementById('checkoutErr').style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Try Again';
  }
}
document.getElementById('checkoutOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeCheckout();
});
<\/script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html;charset=utf-8", "Content-Security-Policy": "frame-ancestors 'self' https://blackroad.io https://*.blackroad.io" }
  });
}
__name(handleLandingPage, "handleLandingPage");
function handleHealth() {
  return json({
    status: "ok",
    service: "pay.blackroad.io",
    ts: Date.now(),
    version: VERSION,
    endpoints: [
      "GET  / (landing page or health)",
      "GET  /pricing",
      "GET  /health",
      "GET  /init",
      "GET  /plans",
      "GET  /addons",
      "GET  /stats",
      "GET  /lookup?email=",
      "GET  /customers?email=|id=",
      "POST /customers",
      "POST /subscribe",
      "GET  /subscriptions/:id",
      "DELETE /subscriptions/:id",
      "POST /upgrade",
      "POST /portal",
      "GET  /invoices?customer_id=",
      "GET  /payments?customer_id=",
      "POST /webhook",
      "GET  /keys?customer_id=",
      "POST /keys",
      "DELETE /keys?id=",
      "GET  /usage?customer_id=&days=30",
      "POST /usage/record"
    ]
  });
}
__name(handleHealth, "handleHealth");
async function handleApiKeys(request, db) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    const customerId = url.searchParams.get("customer_id");
    if (!customerId) return err("customer_id required");
    const keys = await db.prepare(
      "SELECT id, customer_id, key_prefix, name, scopes, rate_limit, last_used, usage_count, status, expires_at, created_at FROM api_keys WHERE customer_id = ? ORDER BY created_at DESC"
    ).bind(customerId).all();
    return json({ keys: keys.results.map((k) => ({ ...k, scopes: JSON.parse(k.scopes || "[]") })) });
  }
  if (request.method === "POST") {
    const body = await request.json();
    const { customer_id, name, scopes, rate_limit, expires_in_days } = body;
    if (!customer_id) return err("customer_id required");
    const rawKey = `rp_live_${randHex(16)}`;
    const keyPrefix = rawKey.slice(0, 12);
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest("SHA-256", enc.encode(rawKey));
    const keyHash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const id = `key_${uid()}`;
    const expiresAt = expires_in_days ? new Date(Date.now() + expires_in_days * 864e5).toISOString() : null;
    await db.prepare(
      "INSERT INTO api_keys (id, customer_id, key_hash, key_prefix, name, scopes, rate_limit, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, customer_id, keyHash, keyPrefix, name || "default", JSON.stringify(scopes || ["api:read"]), rate_limit || 1e3, expiresAt).run();
    return json({ id, key: rawKey, prefix: keyPrefix, name: name || "default", warning: "Save this key now. It cannot be retrieved again." }, 201);
  }
  if (request.method === "DELETE") {
    const keyId = url.searchParams.get("id");
    if (!keyId) return err("id required");
    await db.prepare("UPDATE api_keys SET status = 'revoked' WHERE id = ?").bind(keyId).run();
    return json({ ok: true, revoked: keyId });
  }
  return err("Method not allowed", 405);
}
__name(handleApiKeys, "handleApiKeys");
async function handleUsage(request, db) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  if (!customerId) return err("customer_id required");
  const days = parseInt(url.searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const daily = await db.prepare(
    `SELECT date(created_at) as day, COUNT(*) as requests, SUM(tokens_used) as tokens,
     AVG(latency_ms) as avg_latency, SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors
     FROM usage WHERE customer_id = ? AND created_at >= ? GROUP BY day ORDER BY day DESC`
  ).bind(customerId, since).all();
  const totals = await db.prepare(
    `SELECT COUNT(*) as total_requests, SUM(tokens_used) as total_tokens,
     AVG(latency_ms) as avg_latency, COUNT(DISTINCT endpoint) as unique_endpoints
     FROM usage WHERE customer_id = ? AND created_at >= ?`
  ).bind(customerId, since).first();
  const endpoints = await db.prepare(
    `SELECT endpoint, method, COUNT(*) as count, AVG(latency_ms) as avg_latency
     FROM usage WHERE customer_id = ? AND created_at >= ?
     GROUP BY endpoint, method ORDER BY count DESC LIMIT 10`
  ).bind(customerId, since).all();
  return json({
    customer_id: customerId,
    period: { days, since },
    totals,
    daily: daily.results,
    top_endpoints: endpoints.results
  });
}
__name(handleUsage, "handleUsage");
async function handleRecordUsage(request, db) {
  const body = await request.json();
  const { customer_id, api_key_id, endpoint, method, status_code, latency_ms, tokens_used } = body;
  if (!customer_id || !endpoint) return err("customer_id and endpoint required");
  await db.prepare(
    "INSERT INTO usage (customer_id, api_key_id, endpoint, method, status_code, latency_ms, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(customer_id, api_key_id || null, endpoint, method || "GET", status_code || 200, latency_ms || 0, tokens_used || 0).run();
  if (api_key_id) {
    await db.prepare(
      "UPDATE api_keys SET usage_count = usage_count + 1, last_used = datetime('now') WHERE id = ?"
    ).bind(api_key_id).run();
  }
  return json({ ok: true });
}
__name(handleRecordUsage, "handleRecordUsage");
function randHex(bytes) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(randHex, "randHex");
var rl = /* @__PURE__ */ new Map();
function rateLimit(ip, max = 30, windowSec = 60) {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now - entry.t > windowSec * 1e3) {
    rl.set(ip, { t: now, c: 1 });
    return true;
  }
  return ++entry.c <= max;
}
__name(rateLimit, "rateLimit");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";
    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...cors, ...SECURITY_HEADERS } });
    }
    const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
    if (!rateLimit(clientIp)) {
      return addHeaders(err("Too many requests \u2014 slow down", 429), cors);
    }
    const db = env.DB;
    let response;
    try {
      const path = url.pathname;
      if ((path === "/" || path === "/pricing") && request.method === "GET") {
        const accept = request.headers.get("Accept") || "";
        if (!accept.includes("application/json")) {
          return addHeaders(handleLandingPage(), cors);
        }
      }
      if (path === "/" && request.method === "GET") return addHeaders(handleHealth(), cors);
      if (path === "/health") return addHeaders(handleHealth(), cors);
      if (path === "/init") return addHeaders(await handleInit(db), cors);
      if (path === "/plans") return addHeaders(await handlePlans(db), cors);
      if (path === "/addons") return addHeaders(await handleAddons(db), cors);
      if (path === "/webhook" && request.method === "POST") return addHeaders(await handleWebhook(request, db, env), cors);
      if (path === "/lookup") return addHeaders(await handleLookup(request, db), cors);
      if (path === "/checkout" && request.method === "POST") return addHeaders(await handlePublicCheckout(request, db, env), cors);
      const user = await authenticate(request, env);
      if (!user) {
        return addHeaders(err("Unauthorized \u2014 provide Bearer token or X-RoadPay-Key", 401), cors);
      }
      switch (true) {
        case path === "/customers":
          response = await handleCustomers(request, db, env);
          break;
        case (path === "/subscribe" && request.method === "POST"):
          response = await handleSubscribe(request, db, env);
          break;
        case path.startsWith("/subscriptions/"):
          response = await handleSubscription(request, db, env);
          break;
        case (path === "/upgrade" && request.method === "POST"):
          response = await handleUpgrade(request, db, env);
          break;
        case (path === "/portal" && request.method === "POST"):
          response = await handlePortal(request, db);
          break;
        case path === "/invoices":
          response = await handleInvoices(request, db);
          break;
        case path === "/payments":
          response = await handlePayments(request, db);
          break;
        case path === "/stats":
          response = await handleStats(db);
          break;
        case (path === "/keys" || path === "/api-keys"):
          response = await handleApiKeys(request, db);
          break;
        case path === "/usage":
          response = await handleUsage(request, db);
          break;
        case (path === "/usage/record" && request.method === "POST"):
          response = await handleRecordUsage(request, db);
          break;
        default:
          response = err("Not found", 404);
      }
    } catch (e) {
      console.error("RoadPay error:", e);
      response = err(e.message, 500);
    }
    return addHeaders(response, cors);
  }
};
function addHeaders(response, cors) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries({ ...cors, ...SECURITY_HEADERS })) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}
__name(addHeaders, "addHeaders");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map

