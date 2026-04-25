using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    ( name = "stripe",   worker = .stripeWorker ),
    ( name = "router",   worker = .routerWorker ),
    ( name = "gateway",  worker = .gatewayWorker ),
  ],

  sockets = [
    ( name = "stripe-http",  address = "*:9081", http = (), service = "stripe" ),
    ( name = "router-http",  address = "*:9082", http = (), service = "router" ),
    ( name = "gateway-http", address = "*:9083", http = (), service = "gateway" ),
  ]
);

const stripeWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "workers/stripe.js" ),
  ],
  compatibilityDate = "2024-12-01",
  compatibilityFlags = ["nodejs_compat"],
  bindings = [
    ( name = "STRIPE_SECRET_KEY",     text = "" ),
    ( name = "STRIPE_WEBHOOK_SECRET", text = "" ),
    ( name = "ALLOWED_ORIGIN",        text = "https://blackroad-brand-kit.pages.dev" ),
    ( name = "ENV",                   text = "production" ),
  ],
);

const routerWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "workers/router.js" ),
  ],
  compatibilityDate = "2024-12-01",
  bindings = [
    ( name = "STRIPE_SERVICE", service = "stripe" ),
  ],
);

const gatewayWorker :Workerd.Worker = (
  modules = [
    ( name = "worker", esModule = embed "workers/gateway.js" ),
  ],
  compatibilityDate = "2024-12-01",
  compatibilityFlags = ["nodejs_compat"],
);
