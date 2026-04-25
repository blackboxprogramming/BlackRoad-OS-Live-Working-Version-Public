# BlackRoad OS Filesystem

> Every directory is a permanent address. Adding the 207th product is the same pattern as the 1st.

## Root Structure

```
BlackRoad-OS-Live-Monorepo-Private/
  packages/           209 product packages (code)
  agents/             28 agent workspaces (memory, tasks, config)
  fleet/              7 node configs (config, logs, deploy)
  orgs/               44 GitHub org mirrors
  gateway/            Routing tiers and mesh configs
  domains/            Root + subdomain directories
  sections/           17,290 Index sections (expandable)
  docs/               224 documentation files
  metrics/            KPIs, dashboards, daily/weekly/monthly/quarterly/yearly reports
  web/                Workers, pages, APIs, SEO, analytics, themes, brand assets
  data/               Databases, memory system, feeds, raw/processed/exports
  ops/                Runbooks, incidents, deploys, monitoring, security, backups
  economy/            RoadCoin, RoadChain, RoadPay -- circulation, stamps, revenue
  users/              Personas, journeys, feedback, onboarding, retention, segments
  brand/              Voice, vocabulary, colors, typography, campaigns, content
  legal/              Corporate, compliance, trademarks, contracts, privacy, terms
  research/           Papers, experiments, benchmarks, competitors, AI, quantum
  community/          Contributors, events, roadhouses, convoys, governance
  integrations/       AI providers, platforms, hardware configs
  curriculum/         Courses, lessons, challenges, certifications, schools
  archive/            Historical snapshots by year, sessions
  templates/          Scaffolds for products, agents, nodes, routes
  scripts/            Expansion scripts (new-product, new-agent, new-node)
```

## Detailed Breakdown

### packages/ (209 product packages)
Each has `src/`, `package.json`, `wrangler.toml`. Code lives here.

### agents/ (28 agent workspaces)
Each has `memory/`, `tasks/`, `config/`. Agent state lives here.

### fleet/ (7 node configs)
Each has `config/`, `logs/`, `deploy/`. Hardware state lives here.

### metrics/
```
metrics/
  daily/              Daily fleet and product snapshots
  weekly/             Weekly agent workload and product status
  monthly/            Monthly economy and growth reports
  quarterly/          Quarterly reviews and roadmap check-ins
  yearly/             Annual retrospectives
  kpis/
    fleet/            Uptime, latency, cost, utilization
    products/         Response time, error rate, deploy frequency
    agents/           Tasks completed, blockers, hand-offs
    economy/          RoadCoin circulation, revenue, transactions
    users/            DAU/WAU/MAU, retention, onboarding completion
    growth/           Commits, stars, traffic, community size
  dashboards/         Prism Console dashboard configs
```

### web/
```
web/
  workers/            CF Worker source and routing configs
  pages/              Static page content
  sites/              Per-domain site configs
  apis/
    public/           External API specs (OpenAPI)
    internal/         Fleet-only APIs
    webhooks/         Inbound webhook handlers
  seo/
    sitemaps/         Per-domain sitemaps
    robots/           robots.txt per domain
    meta/             og:tags, descriptions, structured data
    schema/           JSON-LD schema markup
  analytics/
    traffic/          Visitors, page views, uniques
    funnels/          User flow analysis
    conversions/      Goal completion rates
    referrers/        Traffic sources
  assets/             Shared images, fonts, icons
  themes/             BlackTop theme definitions
  brand/              Brand CSS, design tokens, components
```

### data/
```
data/
  databases/
    d1/               Cloudflare D1 schemas
    r2/               R2 bucket configs
    kv/               KV namespace definitions
    qdrant/           Vector collections (RearView)
    sqlite/           Local SQLite databases
  memory/
    journal/          7,693+ hash-chained entries
    codex/            791 solutions, 59 patterns
    todos/            2,563 todos across 119 projects
    tasks/            Claimable task marketplace
    til/              Today I Learned broadcasts
    collaboration/    Agent-to-agent logs
  feeds/
    commits/          GitHub activity across 44 orgs
    deploys/          Deploy events
    agents/           Agent status updates
    products/         Product health changes
    social/           BackRoad engagement
  raw/                Unprocessed incoming data
  processed/          Cleaned and structured data
  exports/            OneWay exports with provenance
  imports/            External data imports
  migrations/         Database migration scripts
```

### ops/
```
ops/
  runbooks/           Step-by-step operational procedures
  incidents/          Active incident tracking
  postmortems/        Incident reviews
  changelogs/         Per-product changelogs
  releases/           Release notes and versions
  deploy/
    cloudflare/       Worker deploy configs
    huggingface/      HF Space Dockerfiles
    digitalocean/     Droplet provisioning
    pis/              Pi setup and update scripts
    github-pages/     Static deploy configs
  monitoring/
    alerts/           Alert rules
    logs/             Log aggregation
    traces/           Distributed tracing
    health-checks/    Fleet Heartbeat probes
  security/
    audits/           Security audit reports
    keys/             Key management policies
    certificates/     TLS cert configs
    policies/         Access control policies
  backups/
    schedules/        Automated backup schedules
    snapshots/        Point-in-time configs
    disaster-recovery/ DR procedures
```

### economy/
```
economy/
  roadcoin/           Token supply, rewards, staking, treasury
  roadchain/          Stamps, validators, contracts, proofs
  roadpay/            Plans, invoices, revenue, subscriptions
  reports/            Daily, monthly, quarterly economy reports
```

### users/
```
users/
  personas/           User archetypes
  journeys/           End-to-end flow maps
  feedback/           Collection and action tracking
  onboarding/         Trailhead flows, OnRamp sequences
  retention/          Cohort analysis, churn signals
  segments/           creators, learners, developers, enterprises, families
```

### curriculum/
```
curriculum/
  courses/            Course definitions and syllabi
  lessons/            Individual lesson content
  challenges/         Code challenges and creative prompts
  certifications/     Mastery credentials
  portfolios/         Student portfolio templates
  schools/            Mirrors the 9 schools from Index sections 111-200
```

## Expansion Scripts

```bash
# Add a new product
./scripts/new-product.sh <name> <tier> <domain> <agent>

# Add a new agent
./scripts/new-agent.sh <name> <category> <channel>

# Add a new fleet node
./scripts/new-node.sh <name> <type> <agent>
```

## The Rule

Nothing gets deleted. Everything is an address in the tree.
Adding the 207th product follows the same pattern as the 1st.
The filesystem is the operating system.
