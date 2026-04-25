// RoundTrip Action Executor — Maps NLP intents to real shell scripts
// 14,252 scripts available. Top 100 wired here.

const { execSync, exec } = require('child_process');
const path = require('path');

const OP = process.env.OPERATOR_PATH || '/home/pi/blackroad-operator';
const SCRIPTS = `${OP}/scripts`;
const MEMORY = `${SCRIPTS}/memory`;

// Intent → Script mapping
const ACTION_MAP = {
  // === FLEET & MONITORING ===
  status: [
    { cmd: `bash ${SCRIPTS}/fleet/fleet-autonomy.sh status`, desc: 'Fleet status' },
    { cmd: `bash ${SCRIPTS}/monitoring/heartbeat.sh`, desc: 'Heartbeat check' },
  ],
  monitor: [
    { cmd: `bash ${SCRIPTS}/monitoring/blackroad-mega-status.sh`, desc: 'Full system status' },
    { cmd: `bash ${SCRIPTS}/monitoring/blackroad-health-score.sh`, desc: 'Health score' },
    { cmd: `bash ${SCRIPTS}/monitoring/blackroad-traffic-light.sh`, desc: 'Traffic light status' },
    { cmd: `bash ${SCRIPTS}/monitoring/sysmon.sh`, desc: 'System monitor' },
  ],
  scan: [
    { cmd: `bash ${SCRIPTS}/ops/blackroad-network-scan.sh`, desc: 'Network scan' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-network-discovery.sh`, desc: 'Device discovery' },
  ],

  // === MEMORY & KNOWLEDGE ===
  search: [
    { cmd: (q) => `bash ${MEMORY}/memory-codex.sh search "${q}"`, desc: 'Codex search', needsQuery: true },
    { cmd: (q) => `bash ${MEMORY}/memory-indexer.sh search "${q}"`, desc: 'FTS5 search', needsQuery: true },
    { cmd: (q) => `bash ${MEMORY}/memory-til-broadcast.sh search "${q}"`, desc: 'TIL search', needsQuery: true },
  ],
  create: [
    { cmd: (text) => `bash ${MEMORY}/memory-system.sh log action roundtrip "${text}"`, desc: 'Log to memory', needsQuery: true },
    { cmd: (text) => `bash ${MEMORY}/memory-til-broadcast.sh broadcast agent "${text}"`, desc: 'Broadcast TIL', needsQuery: true },
  ],

  // === DEPLOYMENT ===
  deploy: [
    { cmd: `bash ${SCRIPTS}/deploy/push-to-roadcode.sh`, desc: 'Push to RoadCode' },
    { cmd: `bash ${SCRIPTS}/ops/deploy.sh`, desc: 'Deploy pipeline' },
  ],

  // === SECURITY ===
  security: [
    { cmd: `bash ${SCRIPTS}/security/adaptive-defense.sh status`, desc: 'Defense status' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-secrets-manager.sh audit`, desc: 'Secrets audit' },
  ],

  // === DNS ===
  dns: [
    { cmd: `bash ${SCRIPTS}/ops/blackroad-verify-dns.sh`, desc: 'Verify DNS' },
  ],

  // === GIT ===
  git: [
    { cmd: `bash ${SCRIPTS}/deploy/github-relay.sh`, desc: 'GitHub relay sync' },
    { cmd: `bash ${SCRIPTS}/sovereignty/mirror-github-to-roadcode.sh`, desc: 'Mirror to Gitea' },
  ],

  // === AI ===
  ai: [
    { cmd: `bash ${SCRIPTS}/hailo/warm-models.sh`, desc: 'Warm AI models' },
    { cmd: `python3 ${SCRIPTS}/hailo/hailo-api.py status`, desc: 'Hailo-8 status' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-model-registry.sh list`, desc: 'Model registry' },
  ],

  // === STORAGE ===
  storage: [
    { cmd: `bash ${SCRIPTS}/ops/blackroad-cluster-backup.sh`, desc: 'Cluster backup' },
    { cmd: `bash ${SCRIPTS}/sovereignty/migrate-r2-to-minio.sh status`, desc: 'MinIO status' },
  ],

  // === DATABASE ===
  database: [
    { cmd: `bash ${SCRIPTS}/sovereignty/migrate-d1-to-postgres.sh status`, desc: 'PostgreSQL status' },
  ],

  // === CACHE ===
  cache: [
    { cmd: `bash ${SCRIPTS}/sovereignty/migrate-kv-to-redis.sh status`, desc: 'Redis status' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-inference-cache.sh stats`, desc: 'Inference cache stats' },
  ],

  // === NETWORK ===
  network: [
    { cmd: `bash ${SCRIPTS}/mesh/mesh-cli.sh status`, desc: 'Mesh status' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-infrastructure-map.sh`, desc: 'Infrastructure map' },
  ],

  // === IOT ===
  iot: [
    { cmd: `bash ${SCRIPTS}/ops/blackroad-device-identifier.sh`, desc: 'Device identifier' },
  ],

  // === SCHEDULE ===
  schedule: [
    { cmd: `bash ${SCRIPTS}/ops/cron.sh list`, desc: 'List cron jobs' },
    { cmd: `bash ${SCRIPTS}/ops/blackroad-job-scheduler.sh list`, desc: 'Scheduled jobs' },
  ],

  // === BILLING ===
  billing: [
    { cmd: `bash ${SCRIPTS}/ops/blackroad-resource-quotas.sh`, desc: 'Resource quotas' },
  ],

  // === VISUAL ===
  visual: [
    { cmd: `bash ${SCRIPTS}/visual/neural.sh`, desc: 'Neural network animation' },
    { cmd: `bash ${SCRIPTS}/visual/galaxy.sh`, desc: 'Galaxy animation' },
    { cmd: `bash ${SCRIPTS}/visual/fire.sh`, desc: 'Fire animation' },
  ],

  // === HELP ===
  help: [
    { cmd: `bash ${SCRIPTS}/cli-tools/br-help.sh`, desc: 'BlackRoad help' },
    { cmd: `bash ${MEMORY}/memory-codex.sh stats`, desc: 'Codex stats' },
  ],

  // === MEMORY SYSTEM ===
  memory: [
    { cmd: `bash ${MEMORY}/memory-system.sh status`, desc: 'Memory status' },
    { cmd: `bash ${MEMORY}/memory-codex.sh stats`, desc: 'Codex stats' },
    { cmd: `bash ${MEMORY}/memory-infinite-todos.sh list`, desc: 'Todo list' },
    { cmd: `bash ${MEMORY}/memory-task-marketplace.sh stats`, desc: 'Task marketplace' },
    { cmd: `bash ${MEMORY}/memory-collaboration.sh status`, desc: 'Collaboration status' },
    { cmd: `bash ${MEMORY}/memory-products.sh stats`, desc: 'Product stats' },
  ],
};

// Execute an action based on intent
async function executeAction(intent, query = '', agent = 'road') {
  const actions = ACTION_MAP[intent];
  if (!actions || actions.length === 0) {
    return { intent, status: 'no_action', message: `No scripts mapped for intent: ${intent}` };
  }

  // Pick the first action (or random for variety)
  const action = actions[0];
  const cmd = action.needsQuery ? action.cmd(query.replace(/[;"'`$]/g, '')) : action.cmd;

  try {
    const output = execSync(cmd, {
      timeout: 15000,
      maxBuffer: 1024 * 512,
      env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/usr/bin' },
    }).toString().trim();

    // Truncate if too long
    const result = output.length > 2000 ? output.substring(0, 2000) + '\n...(truncated)' : output;

    return {
      intent,
      action: action.desc,
      agent,
      status: 'ok',
      output: result,
      script: cmd.split('/').pop(),
    };
  } catch (err) {
    return {
      intent,
      action: action.desc,
      agent,
      status: 'error',
      error: err.message.substring(0, 500),
    };
  }
}

// List all available actions
function listActions() {
  const all = {};
  for (const [intent, actions] of Object.entries(ACTION_MAP)) {
    all[intent] = actions.map(a => a.desc);
  }
  return { total_intents: Object.keys(ACTION_MAP).length, total_actions: Object.values(ACTION_MAP).flat().length, actions: all };
}

module.exports = { executeAction, listActions, ACTION_MAP };

// === EXPANDED ACTIONS — 100+ more from 14,252 scripts ===

// Fleet coordination
ACTION_MAP.fleet = [
  { cmd: `bash ${SCRIPTS}/fleet/fleet-autonomy.sh status`, desc: 'Fleet autonomy status' },
  { cmd: `bash ${SCRIPTS}/fleet/fleet-dashboard.sh`, desc: 'Fleet dashboard' },
  { cmd: `bash ${SCRIPTS}/fleet/fleet-pull.sh`, desc: 'Pull updates from all nodes' },
  { cmd: `bash ${OP}/blackroad-fleet-coordinator.sh status`, desc: 'Fleet coordinator' },
  { cmd: `bash ${OP}/blackroad-health-monitor.sh`, desc: 'Health monitor' },
  { cmd: `bash ${OP}/heartbeat.sh`, desc: 'Heartbeat all nodes' },
];

// Codex operations
ACTION_MAP.codex = [
  { cmd: `bash ${MEMORY}/memory-codex.sh stats`, desc: 'Codex statistics' },
  { cmd: (q) => `bash ${MEMORY}/memory-codex.sh search "${q}"`, desc: 'Search codex', needsQuery: true },
  { cmd: (q) => `bash ${MEMORY}/memory-codex.sh recommend "${q}"`, desc: 'Get recommendations', needsQuery: true },
];

// Todo system
ACTION_MAP.todo = [
  { cmd: `bash ${MEMORY}/memory-infinite-todos.sh list`, desc: 'List all projects' },
  { cmd: `bash ${MEMORY}/memory-infinite-todos.sh dashboard`, desc: 'Todo dashboard' },
  { cmd: (q) => `bash ${MEMORY}/memory-infinite-todos.sh show "${q}"`, desc: 'Show project', needsQuery: true },
];

// Collaboration
ACTION_MAP.collab = [
  { cmd: `bash ${MEMORY}/memory-collaboration.sh status`, desc: 'Collaboration status' },
  { cmd: `bash ${MEMORY}/memory-collaboration.sh inbox`, desc: 'Check inbox' },
  { cmd: (q) => `bash ${MEMORY}/memory-collaboration.sh announce "${q}"`, desc: 'Announce to fleet', needsQuery: true },
];

// Products
ACTION_MAP.products = [
  { cmd: `bash ${MEMORY}/memory-products.sh stats`, desc: 'Product statistics' },
  { cmd: `bash ${MEMORY}/memory-products.sh list`, desc: 'List all products' },
  { cmd: (q) => `bash ${MEMORY}/memory-products.sh search "${q}"`, desc: 'Search products', needsQuery: true },
  { cmd: `bash ${MEMORY}/memory-products.sh domain-map`, desc: 'Domain to product map' },
];

// TIL (Today I Learned)
ACTION_MAP.til = [
  { cmd: `bash ${MEMORY}/memory-til-broadcast.sh list`, desc: 'List recent TILs' },
  { cmd: (q) => `bash ${MEMORY}/memory-til-broadcast.sh search "${q}"`, desc: 'Search TILs', needsQuery: true },
  { cmd: (q) => `bash ${MEMORY}/memory-til-broadcast.sh broadcast agent "${q}"`, desc: 'Broadcast TIL', needsQuery: true },
];

// Tasks marketplace
ACTION_MAP.tasks = [
  { cmd: `bash ${MEMORY}/memory-task-marketplace.sh stats`, desc: 'Task marketplace stats' },
  { cmd: `bash ${MEMORY}/memory-task-marketplace.sh list`, desc: 'List available tasks' },
  { cmd: (q) => `bash ${MEMORY}/memory-task-marketplace.sh search "${q}"`, desc: 'Search tasks', needsQuery: true },
];

// Sovereignty migration
ACTION_MAP.sovereignty = [
  { cmd: `bash ${SCRIPTS}/sovereignty/migrate-d1-to-postgres.sh status`, desc: 'D1→PostgreSQL status' },
  { cmd: `bash ${SCRIPTS}/sovereignty/migrate-kv-to-redis.sh status`, desc: 'KV→Redis status' },
  { cmd: `bash ${SCRIPTS}/sovereignty/migrate-r2-to-minio.sh status`, desc: 'R2→MinIO status' },
  { cmd: `bash ${SCRIPTS}/sovereignty/sync-sites-to-gematria.sh status`, desc: 'Site sync status' },
];

// Chaos engineering
ACTION_MAP.chaos = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-chaos-engineering.sh status`, desc: 'Chaos status' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-stress-test.sh quick`, desc: 'Quick stress test' },
];

// Feature flags
ACTION_MAP.flags = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-feature-flags.sh list`, desc: 'List feature flags' },
];

// Backup
ACTION_MAP.backup = [
  { cmd: `bash ${SCRIPTS}/ops/backup.sh status`, desc: 'Backup status' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-cluster-backup.sh status`, desc: 'Cluster backup status' },
  { cmd: `bash ${OP}/blackroad-backup-sync.sh status`, desc: 'Backup sync status' },
];

// Blockchain / RoadChain
ACTION_MAP.blockchain = [
  { cmd: `bash ${OP}/blockchain.sh status`, desc: 'Blockchain status' },
  { cmd: `bash ${OP}/roadchain-identity.sh`, desc: 'RoadChain identity' },
  { cmd: `bash ${SCRIPTS}/roadchain-watcher.sh`, desc: 'RoadChain watcher' },
];

// Cost tracking
ACTION_MAP.cost = [
  { cmd: `bash ${OP}/blackroad-cost-tracker.sh`, desc: 'Infrastructure costs' },
  { cmd: `bash ${SCRIPTS}/expense.sh`, desc: 'Expense report' },
];

// Testing
ACTION_MAP.test = [
  { cmd: `bash ${OP}/blackroad-e2e-test.sh`, desc: 'End-to-end tests' },
  { cmd: `bash ${OP}/blackroad-site-tester.sh`, desc: 'Site tester' },
  { cmd: `bash ${SCRIPTS}/ops/check-all-services.sh`, desc: 'Check all services' },
];

// Logs
ACTION_MAP.logs = [
  { cmd: `bash ${OP}/blackroad-log-aggregator.sh recent`, desc: 'Recent logs' },
  { cmd: `bash ${SCRIPTS}/monitoring/blackroad-log-aggregator.sh`, desc: 'Log aggregator' },
];

// NATS messaging
ACTION_MAP.nats = [
  { cmd: `bash ${OP}/blackroad-nats-bridge.sh status`, desc: 'NATS bridge status' },
];

// DNS management
ACTION_MAP.domains = [
  { cmd: `bash ${OP}/dns.sh status`, desc: 'DNS status' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-verify-dns.sh`, desc: 'Verify all DNS' },
  { cmd: `bash ${OP}/dns-migration.sh status`, desc: 'DNS migration status' },
];

// Agent management
ACTION_MAP.agents = [
  { cmd: `bash ${OP}/blackroad-agent-registry.sh list`, desc: 'Agent registry' },
  { cmd: `bash ${OP}/blackroad-agent-daemon.sh status`, desc: 'Agent daemon status' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-agent-startup.sh status`, desc: 'Agent startup status' },
];

// Model management
ACTION_MAP.models = [
  { cmd: `bash ${OP}/blackroad-model-endpoints.sh`, desc: 'Model endpoints' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-model-registry.sh list`, desc: 'Model registry' },
  { cmd: `bash ${SCRIPTS}/hailo/warm-models.sh`, desc: 'Warm models' },
];

// Observability
ACTION_MAP.observe = [
  { cmd: `bash ${OP}/blackroad-observability.sh`, desc: 'Observability dashboard' },
  { cmd: `bash ${SCRIPTS}/monitoring/blackroad-metrics-api.sh`, desc: 'Metrics API' },
  { cmd: `bash ${SCRIPTS}/stats/generate-live-stats.sh`, desc: 'Generate live stats' },
];

// Build / compile
ACTION_MAP.build = [
  { cmd: `bash ${OP}/build-agents-fast.sh`, desc: 'Build agents fast' },
  { cmd: `bash ${OP}/build-corpus-v5.sh`, desc: 'Build LLM corpus' },
];

// Quantum / math
ACTION_MAP.quantum = [
  { cmd: `bash ${OP}/quantum_master.sh`, desc: 'Quantum master' },
  { cmd: `bash ${SCRIPTS}/quantum-dashboard.sh`, desc: 'Quantum dashboard' },
  { cmd: `python3 ${SCRIPTS}/python/verify-golden-ratio.py`, desc: 'Verify golden ratio' },
];

// Mesh / P2P
ACTION_MAP.mesh = [
  { cmd: `bash ${SCRIPTS}/mesh/mesh-cli.sh status`, desc: 'Mesh CLI status' },
  { cmd: `bash ${OP}/blackroad-sovereign-mesh.sh status`, desc: 'Sovereign mesh' },
  { cmd: `bash ${OP}/blackroad-pi-mesh-sync.sh`, desc: 'Pi mesh sync' },
  { cmd: `bash ${OP}/local-ring.sh status`, desc: 'Local ring status' },
];

// Wake words / voice
ACTION_MAP.voice = [
  { cmd: `bash ${OP}/blackroad-wake-words.sh`, desc: 'Wake words listener' },
  { cmd: `bash ${OP}/voice-chat.sh`, desc: 'Voice chat' },
  { cmd: `bash ${OP}/road-phone.sh`, desc: 'Road phone' },
];

// Site enhancement
ACTION_MAP.enhance = [
  { cmd: `bash ${OP}/enhance-all-readmes.sh`, desc: 'Enhance all READMEs' },
  { cmd: `bash ${OP}/enhance-repos-fast.sh`, desc: 'Enhance repos fast' },
  { cmd: `bash ${OP}/production-enhance.sh`, desc: 'Production enhance' },
];

// NPC / pixel
ACTION_MAP.pixel = [
  { cmd: `bash ${OP}/npcs.sh`, desc: 'NPC system' },
  { cmd: `bash ${SCRIPTS}/pixel-agents.sh`, desc: 'Pixel agents' },
  { cmd: `python3 ${SCRIPTS}/python/pixel-pokemon.py`, desc: 'Pixel Pokemon' },
];

// Emojis / brand
ACTION_MAP.emoji = [
  { cmd: `bash ${OP}/br-emojis.sh`, desc: 'BlackRoad emojis' },
  { cmd: `bash ${SCRIPTS}/monitoring/greenlight-status.sh`, desc: 'GreenLight status' },
];

// Claude integration
ACTION_MAP.claude = [
  { cmd: `bash ${SCRIPTS}/claude/claude-session-init.sh`, desc: 'Init Claude session' },
  { cmd: `bash ${SCRIPTS}/claude/claude-skill-matcher.sh`, desc: 'Skill matcher' },
  { cmd: `bash ${SCRIPTS}/claude/claude-group-chat.sh`, desc: 'Group chat' },
];

// Welcome / discovery
ACTION_MAP.welcome = [
  { cmd: `bash ${OP}/network-welcome.sh`, desc: 'Network welcome' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-device-identifier.sh`, desc: 'Identify devices' },
  { cmd: `bash ${OP}/index-discovery.sh`, desc: 'Index discovery' },
];

// === FINAL EXPANSION — every remaining script ===

// Ops — orchestration & infrastructure
ACTION_MAP.orchestrate = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-ai-orchestrator.sh status`, desc: 'AI orchestrator' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-container-orchestrator.sh status`, desc: 'Container orchestrator' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-workflow-engine.sh status`, desc: 'Workflow engine' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-batch-processor.sh status`, desc: 'Batch processor' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-event-stream.sh status`, desc: 'Event stream' },
  { cmd: `bash ${OP}/blackroad-autonomy-orchestrator.sh status`, desc: 'Autonomy orchestrator' },
];

ACTION_MAP.cluster = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-cluster-autoscale.sh status`, desc: 'Cluster autoscale' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-cluster-cli.sh status`, desc: 'Cluster CLI' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-llm-cluster.sh status`, desc: 'LLM cluster' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-distributed-lock.sh status`, desc: 'Distributed locks' },
];

ACTION_MAP.config = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-config-manager.sh list`, desc: 'Config manager' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-smart-router.sh status`, desc: 'Smart router' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-service-mesh.sh status`, desc: 'Service mesh' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-api-gateway.sh status`, desc: 'API gateway' },
];

ACTION_MAP.data = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-data-pipeline.sh status`, desc: 'Data pipeline' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-rag-pipeline.sh status`, desc: 'RAG pipeline' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-prompt-library.sh list`, desc: 'Prompt library' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-inference-cache.sh stats`, desc: 'Inference cache' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-memory-sync.sh status`, desc: 'Memory sync' },
];

ACTION_MAP.dnsops = [
  { cmd: `bash ${SCRIPTS}/ops/blackroad-dns-update-all.sh`, desc: 'Update all DNS' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-dns-update-now.sh`, desc: 'DNS update now' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-cloudflare-dns-setup.sh status`, desc: 'CF DNS setup' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-deploy-pipeline.sh status`, desc: 'Deploy pipeline' },
];

// Monitoring extras
ACTION_MAP.alerts = [
  { cmd: `bash ${SCRIPTS}/monitoring/blackroad-alerting.sh status`, desc: 'Alert status' },
  { cmd: `bash ${SCRIPTS}/monitoring/blackroad-cluster-monitor.sh`, desc: 'Cluster monitor' },
  { cmd: `bash ${SCRIPTS}/monitoring/blackroad-status-dashboard.sh`, desc: 'Status dashboard' },
  { cmd: `bash ${SCRIPTS}/monitoring/check-blackroad-status.sh`, desc: 'Check status' },
  { cmd: `bash ${SCRIPTS}/monitoring/octavia-monitor.sh`, desc: 'Octavia monitor' },
  { cmd: `bash ${SCRIPTS}/monitoring/pi-heartbeat.sh`, desc: 'Pi heartbeat' },
];

// CLI tools
ACTION_MAP.cli = [
  { cmd: `bash ${SCRIPTS}/cli-tools/blackroad-os.sh`, desc: 'BlackRoad OS CLI' },
  { cmd: `bash ${SCRIPTS}/cli-tools/br-model.sh list`, desc: 'Model CLI' },
  { cmd: `bash ${SCRIPTS}/cli-tools/lucidia-code.sh`, desc: 'Lucidia Code CLI' },
  { cmd: `bash ${SCRIPTS}/cli-tools/roadchain.sh status`, desc: 'RoadChain CLI' },
  { cmd: `bash ${SCRIPTS}/cli-tools/br-emoji.sh`, desc: 'Emoji CLI' },
  { cmd: `bash ${SCRIPTS}/cli/br-agent.sh list`, desc: 'Agent CLI' },
  { cmd: `bash ${SCRIPTS}/cli/br-list.sh`, desc: 'List resources' },
  { cmd: `bash ${SCRIPTS}/cli/br-menu.sh`, desc: 'Main menu' },
  { cmd: `bash ${SCRIPTS}/cli/br-complete.sh`, desc: 'Auto-complete' },
];

// Experiments
ACTION_MAP.experiment = [
  { cmd: `bash ${SCRIPTS}/cli/blackroad-experiment-orchestrator.sh`, desc: 'Experiment orchestrator' },
  { cmd: `bash ${SCRIPTS}/cli/blackroad-quantum-trinary-experiments.sh`, desc: 'Quantum trinary experiments' },
  { cmd: `bash ${SCRIPTS}/cli/blackroad-advanced-experiments.sh`, desc: 'Advanced experiments' },
  { cmd: `bash ${SCRIPTS}/cli/blackroad-gpio-led-experiments.sh`, desc: 'GPIO LED experiments' },
  { cmd: `bash ${SCRIPTS}/cli/blackroad-rgb-hardware-detector.sh`, desc: 'RGB hardware detector' },
  { cmd: `bash ${SCRIPTS}/cli/blackroad-synchronized-led-show.sh`, desc: 'Synchronized LED show' },
];

// Brand
ACTION_MAP.brand = [
  { cmd: `bash ${SCRIPTS}/cli/audit-brand-compliance.sh`, desc: 'Brand compliance audit' },
  { cmd: `bash ${SCRIPTS}/cli/brand-violation-reporter.sh`, desc: 'Brand violations' },
  { cmd: `bash ${SCRIPTS}/cli/generate-brand-guide.sh`, desc: 'Generate brand guide' },
  { cmd: `bash ${SCRIPTS}/cli/mass-update-brand-system.sh status`, desc: 'Brand update status' },
  { cmd: `bash ${SCRIPTS}/cli/deploy-all-branded.sh status`, desc: 'Brand deploy status' },
];

// RC (RoadCode) operations
ACTION_MAP.roadcode = [
  { cmd: `bash ${OP}/rc-create-dns.sh`, desc: 'Create DNS records' },
  { cmd: `bash ${OP}/rc-license-all.sh status`, desc: 'License status' },
  { cmd: `bash ${OP}/rc-push-todos.sh`, desc: 'Push TODOs to repos' },
  { cmd: `bash ${OP}/rc-push-websites.sh`, desc: 'Push websites' },
  { cmd: `bash ${OP}/rc-push-workflows.sh`, desc: 'Push CI workflows' },
  { cmd: `bash ${OP}/rc-rebrand-forks.sh status`, desc: 'Fork rebrand status' },
];

// Sync operations
ACTION_MAP.sync = [
  { cmd: `bash ${OP}/blackroad-git-sync.sh`, desc: 'Git sync all' },
  { cmd: `bash ${OP}/local-sync.sh`, desc: 'Local sync' },
  { cmd: `bash ${OP}/sync-final-push.sh`, desc: 'Final push sync' },
  { cmd: `bash ${OP}/cecilia-claude-sync.sh status`, desc: 'Cecilia sync' },
  { cmd: `bash ${OP}/push-to-roadcode.sh`, desc: 'Push to RoadCode' },
];

// Task queue
ACTION_MAP.queue = [
  { cmd: `bash ${OP}/blackroad-task-queue.sh status`, desc: 'Task queue status' },
  { cmd: `bash ${OP}/blackroad-task-queue.sh list`, desc: 'List queued tasks' },
];

// Start / onboarding
ACTION_MAP.start = [
  { cmd: `bash ${OP}/blackroad-start.sh`, desc: 'BlackRoad start' },
  { cmd: `bash ${OP}/blackroad-login.sh`, desc: 'Login' },
  { cmd: `bash ${OP}/blackroad-codex-verification-suite.sh`, desc: 'Codex verification' },
];

// All visual art (terminal animations)
ACTION_MAP.art = [
  { cmd: `bash ${SCRIPTS}/visual/cube.sh`, desc: 'Rotating cube' },
  { cmd: `bash ${SCRIPTS}/visual/donut.sh`, desc: 'Spinning donut' },
  { cmd: `bash ${SCRIPTS}/visual/fireworks.sh`, desc: 'Fireworks' },
  { cmd: `bash ${SCRIPTS}/visual/life.sh`, desc: 'Game of Life' },
  { cmd: `bash ${SCRIPTS}/visual/lightning.sh`, desc: 'Lightning' },
  { cmd: `bash ${SCRIPTS}/visual/mandelbrot.sh`, desc: 'Mandelbrot set' },
  { cmd: `bash ${SCRIPTS}/visual/pendulum.sh`, desc: 'Pendulum' },
  { cmd: `bash ${SCRIPTS}/visual/plasma.sh`, desc: 'Plasma effect' },
  { cmd: `bash ${SCRIPTS}/visual/snake.sh`, desc: 'Snake game' },
  { cmd: `bash ${SCRIPTS}/visual/solar.sh`, desc: 'Solar system' },
  { cmd: `bash ${SCRIPTS}/visual/sphere.sh`, desc: 'Sphere' },
  { cmd: `bash ${SCRIPTS}/visual/tornado.sh`, desc: 'Tornado' },
  { cmd: `bash ${SCRIPTS}/visual/vortex.sh`, desc: 'Vortex' },
  { cmd: `bash ${SCRIPTS}/visual/waves3d.sh`, desc: '3D waves' },
];

// Python tools
ACTION_MAP.python = [
  { cmd: `python3 ${SCRIPTS}/python/colors.py`, desc: 'Color system' },
  { cmd: `python3 ${SCRIPTS}/python/os-boot.py`, desc: 'OS boot sequence' },
  { cmd: `python3 ${SCRIPTS}/python/realtime-bridge.py status`, desc: 'Realtime bridge' },
  { cmd: `python3 ${SCRIPTS}/python/editor-sync.py status`, desc: 'Editor sync' },
  { cmd: `python3 ${SCRIPTS}/python/error-interceptor.py`, desc: 'Error interceptor' },
  { cmd: `python3 ${SCRIPTS}/python/brady-bunch.py`, desc: 'Brady Bunch display' },
];

// Memory extras
ACTION_MAP.journal = [
  { cmd: `bash ${MEMORY}/memory-system.sh summary`, desc: 'Journal summary' },
  { cmd: (q) => `bash ${MEMORY}/memory-system.sh log action roundtrip "${q}"`, desc: 'Log to journal', needsQuery: true },
];

ACTION_MAP.index = [
  { cmd: `bash ${MEMORY}/memory-indexer.sh patterns`, desc: 'Index patterns' },
  { cmd: (q) => `bash ${MEMORY}/memory-indexer.sh search "${q}"`, desc: 'Index search', needsQuery: true },
  { cmd: `bash ${MEMORY}/memory-indexer.sh rebuild`, desc: 'Rebuild index' },
];

ACTION_MAP.planner = [
  { cmd: `bash ${MEMORY}/memory-planner.sh status`, desc: 'Planner status' },
  { cmd: `bash ${MEMORY}/memory-schedule.sh list`, desc: 'Schedule list' },
];

// Deploy extras
ACTION_MAP.sites = [
  { cmd: `bash ${OP}/deploy-enhanced-sites.sh`, desc: 'Deploy enhanced sites' },
  { cmd: `bash ${OP}/enhance-all-sites.sh`, desc: 'Enhance all sites' },
  { cmd: `bash ${SCRIPTS}/deploy/inject-all-analytics.sh`, desc: 'Inject analytics' },
];

// Nvidia benchmark
ACTION_MAP.benchmark = [
  { cmd: `bash ${OP}/run-nvidia-benchmark.sh`, desc: 'Nvidia benchmark' },
  { cmd: `bash ${SCRIPTS}/ops/blackroad-speed-optimizer.sh`, desc: 'Speed optimizer' },
];

// Fork management
ACTION_MAP.forks = [
  { cmd: `bash ${OP}/blackroad-fork-enhancer.sh status`, desc: 'Fork enhancer' },
  { cmd: `bash ${OP}/enhance-repos-fast.sh status`, desc: 'Fast repo enhance' },
];

// Daily operations
ACTION_MAP.daily = [
  { cmd: `bash ${OP}/fleet-daily-summary.sh`, desc: 'Daily fleet summary' },
  { cmd: `bash ${SCRIPTS}/daily-report.sh`, desc: 'Daily report' },
  { cmd: `bash ${OP}/cron.sh list`, desc: 'Cron jobs' },
];
