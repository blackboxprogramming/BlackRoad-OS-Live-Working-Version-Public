import {
  AGENT_ENTRIES,
  DOC_ENTRIES,
  PRODUCT_ROUTES,
  SECTION_ENTRIES,
  SITE_ROUTES,
  SYSTEM_ENTRIES,
} from '../generated/canon.js';
import { SURFACE_SEED } from '../data/surfaces.js';
import { createMediaCard } from '../media/card.js';
import { archiveAdapter } from '../media/adapters/archive.js';
import { blackroadAppAdapter } from '../media/adapters/blackroad-app.js';
import { directMediaAdapter } from '../media/adapters/direct-media.js';
import { genericEmbedAdapter } from '../media/adapters/generic-embed.js';
import { noteAdapter } from '../media/adapters/note.js';
import { screenCaptureAdapter } from '../media/adapters/screen-capture.js';
import { systemPanelAdapter } from '../media/adapters/system-panel.js';
import { youtubeAdapter } from '../media/adapters/youtube.js';
import { SurfaceRegistry } from '../media/surface.js';
import { createSurfaceWindow } from '../media/window.js';
import { getProductCopy, SITE_RULEBOOK } from '../../../src/blackroad/productCopy.js';
import { PRODUCTS } from '../../../src/blackroad/products.js';
import { SITES, SITE_TYPES } from '../../../src/blackroad/sites.js';
import { route as resolveSharedCommand } from '../../../src/blackroad/command/commandRouter.js';
import { search as searchSharedCommands } from '../../../src/blackroad/command/commandSearch.js';

const HOME_APPS = [
  'RoadOS',
  'ChatGPT',
  'Drive',
  'Gmail',
  'GitHub',
  'YouTube',
  'Spotify',
  'Reddit',
  'Facebook',
  'Google',
  'Calendar',
  'Notes',
  'Tasks',
  'Files',
  'okReusePixel',
  'PixelTown',
  'Traffic',
  'Maps',
  'Photos',
  'Camera',
  'Messages',
  'Calls',
  'Music',
  'News',
  'Weather',
  'Settings',
  'Store',
  'Terminal',
];

const APP_CANON_TARGETS = {
  ChatGPT: 'open roadtrip',
  Drive: 'open roadbook',
  Gmail: 'open roadtrip',
  GitHub: 'open roadcode',
  YouTube: 'open roadband',
  Spotify: 'open roadband',
  Reddit: 'open backroad',
  Facebook: 'open backroad',
  Google: 'open roadview',
  Calendar: 'open roadwork',
  Notes: 'open codex',
  Tasks: 'open todo',
  Files: 'open roadchain',
  Maps: 'open atlas',
  Photos: 'open blackboard',
  Camera: 'open capture',
  Messages: 'open roadtrip',
  Calls: 'open roadtrip',
  Music: 'open roadband',
  News: 'open roadview',
  Weather: 'open atlas',
  Settings: 'open settings',
  Store: 'open products',
  Terminal: 'open roadcode',
};

const APP_PANEL_CONFIGS = {
  ChatGPT: {
    description: 'ChatGPT becomes a door into the multi-agent BlackRoad runtime, with RoadTrip as the primary room and RoadCode/RoadWork nearby.',
    routes: ['roadtrip', 'roadcode', 'roadwork'],
    systems: ['agents', 'collab'],
    docs: ['agent-entry', 'command dock routing'],
    agents: ['lucidia', 'cecilia', 'valeria'],
  },
  Drive: {
    description: 'Drive maps to the BlackRoad memory stack: publishing, archive, continuity, and verifiable storage surfaces.',
    routes: ['roadbook', 'roadchain', 'oneway'],
    systems: ['archive', 'memory'],
    docs: ['memory', 'blackroad index'],
    agents: ['alexandria', 'elias'],
  },
  Gmail: {
    description: 'Gmail becomes an operator inbox routed through coordination, work tracking, and accountable memory instead of a disconnected mail silo.',
    routes: ['roadtrip', 'roadwork', 'carkeys'],
    systems: ['agents', 'todo'],
    docs: ['agent-entry', 'memory'],
    agents: ['roadie', 'valeria', 'atticus'],
  },
  GitHub: {
    description: 'GitHub routes into the native coding and shipping layer, with RoadCode at the center and shared execution surfaces around it.',
    routes: ['roadcode', 'carpool', 'roadwork'],
    systems: ['status', 'collab'],
    docs: ['command dock routing', 'codex'],
    agents: ['cecilia', 'octavia', 'sebastian'],
  },
  Google: {
    description: 'Google becomes a BlackRoad discovery stack: search, citations, docs, and routeable institutional memory.',
    routes: ['roadview', 'roadbook', 'roadchain'],
    systems: ['docs', 'index'],
    docs: ['blackroad index', 'codex'],
    agents: ['alexandria', 'sophia'],
  },
  YouTube: {
    description: 'YouTube remaps to the BlackRoad media stack: live broadcast, published media, archives, and creator tooling.',
    routes: ['roadband', 'backroad', 'blackboard'],
    systems: ['live', 'archive'],
    surfaces: ['yt-periscope-1', 'yt-periscope-4'],
    agents: ['calliope', 'lyra', 'cicero'],
  },
  Spotify: {
    description: 'Spotify routes into music, media playback, and creator-native distribution surfaces across the BlackRoad shell.',
    routes: ['roadband', 'backroad', 'roadworld'],
    systems: ['live'],
    surfaces: ['direct-sample-mp4'],
    agents: ['lyra', 'aria', 'calliope'],
  },
  Reddit: {
    description: 'Reddit maps to the community-first social layer, with BackRoad, publishing, and live commentary connected together.',
    routes: ['backroad', 'roadbook', 'roadband'],
    systems: ['live', 'collab'],
    docs: ['collab'],
    agents: ['calliope', 'cicero', 'ophelia'],
  },
  Facebook: {
    description: 'Facebook becomes a memory-aware community layer that emphasizes identity, groups, publishing, and creator-first interaction.',
    routes: ['backroad', 'roadbook', 'roadtrip'],
    systems: ['collab', 'memory'],
    docs: ['collab', 'memory'],
    agents: ['ophelia', 'calliope', 'roadie'],
  },
  Calendar: {
    description: 'Calendar routes into execution, planning, and coordinated work surfaces rather than a standalone date grid.',
    routes: ['roadwork', 'carpool', 'roadtrip'],
    systems: ['todo', 'status'],
    docs: ['brtodo'],
    agents: ['valeria', 'octavia', 'theodosia'],
  },
  Settings: {
    description: 'Settings stays native to identity, permissions, memory, and the portable shell instead of imitating a generic device control panel.',
    routes: ['roados', 'carkeys', 'roadchain'],
    systems: ['settings', 'memory', 'roadnode'],
    docs: ['memory'],
    agents: ['silas', 'portia'],
  },
  Store: {
    description: 'Store becomes the BlackRoad product map: product endpoints, plans, routes, and the sites that surround them.',
    routes: ['roadside', 'highway', 'roadcoin'],
    systems: ['products', 'sites'],
    agents: ['valeria', 'sapphira'],
  },
  Notes: {
    description: 'Notes connects reusable knowledge, operating references, and continuity docs.',
    routes: ['roadbook', 'roadchain'],
    systems: ['codex', 'memory'],
    docs: ['codex', 'memory', 'blackroad index'],
    agents: ['atticus', 'alexandria'],
  },
  Tasks: {
    description: 'Tasks maps into operational work queues, shipping controls, and coordination surfaces.',
    routes: ['roadwork', 'roadtrip', 'carpool'],
    systems: ['todo', 'status'],
    docs: ['brtodo', 'command dock routing'],
    agents: ['valeria', 'theodosia', 'octavia'],
  },
  Files: {
    description: 'Files becomes a provenance-aware storage and ingestion layer with continuity, archives, and controlled imports.',
    routes: ['roadchain', 'roadbook', 'oneway'],
    systems: ['archive', 'memory'],
    docs: ['memory'],
    agents: ['alexandria', 'elias', 'portia'],
  },
  Maps: {
    description: 'Maps opens the BlackRoad topology: sites, routes, network surfaces, and ecosystem territory.',
    routes: ['roadworld', 'roadview'],
    systems: ['sites'],
    domains: ['atlas.blackroad.io', 'blackroad.network', 'fleet.blackroad.io'],
    agents: ['lucidia', 'alice', 'olympia'],
  },
  Photos: {
    description: 'Photos routes into creative production, publishing, archives, and media memory rather than a passive camera roll.',
    routes: ['blackboard', 'backroad', 'roadbook'],
    systems: ['archive', 'live'],
    surfaces: ['roadtrip-agent'],
    agents: ['lyra', 'calliope', 'alexandria'],
  },
  Camera: {
    description: 'Camera stays explicit and visible, centered on capture, live routing, and media surfaces instead of hidden background access.',
    routes: ['roadband', 'blackboard'],
    systems: ['capture', 'live'],
    surfaces: ['screen-capture', 'direct-sample-mp4'],
    agents: ['aria', 'lyra'],
  },
  Messages: {
    description: 'Messages becomes a team-and-agent coordination layer where threads become routed work instead of isolated chat bubbles.',
    routes: ['roadtrip', 'carpool', 'roadwork'],
    systems: ['agents', 'collab'],
    docs: ['agent-entry', 'collab'],
    agents: ['roadie', 'lucidia', 'valeria'],
  },
  Calls: {
    description: 'Calls routes into live coordination, agent rooms, and explicit media sessions rather than a generic phone metaphor.',
    routes: ['roadtrip', 'roadband', 'carpool'],
    systems: ['live', 'agents'],
    surfaces: ['roadtrip-agent'],
    agents: ['aria', 'roadie', 'calliope'],
  },
  Music: {
    description: 'Music centers on RoadBand, live media, and creator-native playback across the BlackRoad ecosystem.',
    routes: ['roadband', 'backroad', 'roadworld'],
    systems: ['live'],
    surfaces: ['direct-sample-mp4'],
    agents: ['lyra', 'aria', 'calliope'],
  },
  News: {
    description: 'News becomes a verified discovery and publishing stack with search, archive, and provenance in the same shell.',
    routes: ['roadview', 'roadbook', 'backroad'],
    systems: ['archive', 'docs'],
    docs: ['blackroad index'],
    agents: ['alexandria', 'cicero', 'sophia'],
  },
  Weather: {
    description: 'Weather maps to the world, fleet, and network territory layers so situational awareness lives inside the broader system map.',
    routes: ['roadworld', 'highway', 'roadview'],
    systems: ['sites', 'status'],
    domains: ['atlas.blackroad.io', 'fleet.blackroad.io'],
    agents: ['gaia', 'alice', 'olympia'],
  },
  Terminal: {
    description: 'Terminal stays native to code, deployment, ingestion, and operator control instead of a detached shell tab.',
    routes: ['roadcode', 'oneway', 'roadchain'],
    systems: ['status', 'todo'],
    docs: ['command dock routing', 'codex'],
    agents: ['cecilia', 'octavia', 'sebastian'],
  },
};

const ROADOS_CATEGORIES = [
  'Government',
  'Law',
  'Defense',
  'Energy',
  'Water',
  'Food',
  'Health',
  'Pharma',
  'Finance',
  'Banking',
  'Insurance',
  'Trade',
  'Industry',
  'Transport',
  'Logistics',
  'Telecom',
  'Internet',
  'Media',
  'Education',
  'Science',
  'Technology',
  'Agriculture',
  'Housing',
  'Labor',
  'Environment',
];

const CATEGORY_PANEL_CONFIGS = {
  Government: {
    description: 'Government routes emphasize identity, compliance, internal control, and accountable operations.',
    routes: ['roadchain', 'carkeys', 'roadwork'],
    domains: ['admin.blackroad.io', 'security.blackroad.io', 'legal.blackroad.io'],
    agents: ['portia', 'silas', 'octavia'],
    docs: ['blackroad index'],
  },
  Law: {
    description: 'Law surfaces focus on compliance, legal references, trust, provenance, and signed access.',
    routes: ['roadchain', 'carkeys', 'roadbook'],
    domains: ['legal.blackroad.io', 'security.blackroad.io', 'docs.blackroad.io'],
    agents: ['portia', 'seraphina', 'atticus'],
  },
  Defense: {
    description: 'Defense emphasizes trusted infrastructure, controlled identity, fleet visibility, and resilient command surfaces.',
    routes: ['roadchain', 'carkeys', 'roadtrip'],
    domains: ['security.blackroad.io', 'fleet.blackroad.io', 'blackroad.network'],
    agents: ['silas', 'octavia', 'alice'],
  },
  Energy: {
    description: 'Energy maps to network participation, fleet coordination, credits, and world-scale infrastructure visibility.',
    routes: ['highway', 'roadcoin', 'roadchain'],
    domains: ['fleet.blackroad.io', 'blackroad.network', 'status.blackroad.io'],
    agents: ['gaia', 'alice', 'sapphira'],
  },
  Water: {
    description: 'Water focuses on support, world awareness, and operational continuity across distributed infrastructure surfaces.',
    routes: ['roadside', 'roadworld', 'roadchain'],
    domains: ['support.blackroad.io', 'fleet.blackroad.io', 'atlas.blackroad.io'],
    agents: ['gaia', 'roadie', 'olympia'],
  },
  Food: {
    description: 'Food routes center on onboarding, collaboration, and community logistics with simple entry and coordinated support.',
    routes: ['roadside', 'carpool', 'roadwork'],
    domains: ['support.blackroad.io', 'billing.blackroad.io'],
    agents: ['roadie', 'valeria', 'ophelia'],
  },
  Health: {
    description: 'Health routes lean toward trustworthy intake, documentation, assistance, and knowledge verification.',
    routes: ['roadside', 'pitstop', 'roadbook'],
    domains: ['support.blackroad.io', 'docs.blackroad.io', 'security.blackroad.io'],
    agents: ['roadie', 'sophia', 'seraphina'],
  },
  Pharma: {
    description: 'Pharma emphasizes research, verified publishing, provenance, and controlled compliance-aware access.',
    routes: ['roadbook', 'roadchain', 'roadview'],
    domains: ['docs.blackroad.io', 'security.blackroad.io', 'legal.blackroad.io'],
    agents: ['sophia', 'portia', 'seraphina'],
  },
  Finance: {
    description: 'Finance emphasizes work operations, credits, billing, and audit-aware memory.',
    routes: ['roadwork', 'roadcoin', 'roadchain'],
    domains: ['billing.blackroad.io', 'account.blackroad.io', 'status.blackroad.io'],
    agents: ['sapphira', 'valeria', 'portia'],
  },
  Banking: {
    description: 'Banking routes focus on identity, account control, provenance, and finance-aware operational surfaces.',
    routes: ['carkeys', 'roadcoin', 'roadchain'],
    domains: ['account.blackroad.io', 'billing.blackroad.io', 'legal.blackroad.io'],
    agents: ['sapphira', 'silas', 'portia'],
  },
  Insurance: {
    description: 'Insurance emphasizes history, proof, support, and continuity across status and record surfaces.',
    routes: ['roadchain', 'roadbook', 'roadside'],
    domains: ['status.blackroad.io', 'support.blackroad.io', 'legal.blackroad.io'],
    agents: ['portia', 'theodosia', 'roadie'],
  },
  Trade: {
    description: 'Trade highlights work operations, shared execution, and network-facing routes for coordinated exchange.',
    routes: ['roadwork', 'carpool', 'highway'],
    domains: ['billing.blackroad.io', 'blackroad.network', 'status.blackroad.io'],
    agents: ['valeria', 'alice', 'sapphira'],
  },
  Industry: {
    description: 'Industry combines operator control, collaboration, and infrastructure memory across the product stack.',
    routes: ['roadwork', 'roadchain', 'carpool'],
    domains: ['admin.blackroad.io', 'fleet.blackroad.io', 'status.blackroad.io'],
    agents: ['octavia', 'valeria', 'elias'],
  },
  Transport: {
    description: 'Transport highlights network coordination, fleet visibility, collaboration, and roadside entry.',
    routes: ['roadside', 'carpool', 'highway'],
    domains: ['fleet.blackroad.io', 'blackroad.network', 'support.blackroad.io'],
    agents: ['alice', 'olympia', 'roadie'],
  },
  Logistics: {
    description: 'Logistics routes emphasize shared execution, fleet flow, roadside support, and trackable coordination.',
    routes: ['carpool', 'roadwork', 'roadside'],
    domains: ['fleet.blackroad.io', 'support.blackroad.io', 'status.blackroad.io'],
    agents: ['olympia', 'valeria', 'roadie'],
  },
  Telecom: {
    description: 'Telecom centers on live media, network routing, and agent-mediated communications surfaces.',
    routes: ['roadband', 'roadtrip', 'highway'],
    domains: ['blackroad.network', 'live.blackroad.io', 'agents.blackroad.io'],
    agents: ['aria', 'alice', 'cicero'],
  },
  Internet: {
    description: 'Internet routes into search, APIs, identity, and the web-scale territory that surrounds RoadOS.',
    routes: ['roadview', 'oneway', 'carkeys'],
    domains: ['api.blackroad.io', 'blackroad.network', 'docs.blackroad.io'],
    agents: ['alice', 'alexandria', 'anastasia'],
  },
  Media: {
    description: 'Media centers on broadcast, creation, archives, and public conversation.',
    routes: ['roadband', 'backroad', 'blackboard'],
    domains: ['live.blackroad.io', 'archive.blackroad.io', 'agents.blackroad.io'],
    agents: ['calliope', 'lyra', 'cicero'],
  },
  Education: {
    description: 'Education bundles learning, publishing, knowledge reuse, and guided support.',
    routes: ['pitstop', 'roadbook', 'blackboard'],
    domains: ['docs.blackroad.io', 'support.blackroad.io'],
    agents: ['roadie', 'atticus', 'sophia'],
    docs: ['codex', 'blackroad index'],
  },
  Technology: {
    description: 'Technology routes into code, agents, APIs, and coordinated execution.',
    routes: ['roadcode', 'roadtrip', 'oneway'],
    domains: ['api.blackroad.io', 'agents.blackroad.io', 'status.blackroad.io'],
    agents: ['cecilia', 'celeste', 'anastasia'],
    docs: ['command dock routing', 'codex'],
  },
  Science: {
    description: 'Science emphasizes research, provenance, publishing, and verifiable search.',
    routes: ['roadbook', 'roadview', 'roadchain'],
    domains: ['docs.blackroad.io', 'archive.blackroad.io'],
    agents: ['sophia', 'alexandria', 'gematria'],
  },
  Agriculture: {
    description: 'Agriculture combines world mapping, support, logistics, and environmental continuity across the network.',
    routes: ['roadworld', 'roadside', 'carpool'],
    domains: ['atlas.blackroad.io', 'support.blackroad.io', 'fleet.blackroad.io'],
    agents: ['gaia', 'roadie', 'olympia'],
  },
  Housing: {
    description: 'Housing emphasizes onboarding, shared projects, identity, and world-aware space management.',
    routes: ['roadside', 'carpool', 'roadworld'],
    domains: ['account.blackroad.io', 'support.blackroad.io', 'atlas.blackroad.io'],
    agents: ['roadie', 'valeria', 'thalia'],
  },
  Labor: {
    description: 'Labor centers on work routing, collaboration, task execution, and portable identity across teams.',
    routes: ['roadwork', 'carpool', 'carkeys'],
    domains: ['account.blackroad.io', 'support.blackroad.io', 'billing.blackroad.io'],
    agents: ['valeria', 'octavia', 'roadie'],
  },
  Environment: {
    description: 'Environment combines sustainability, fleet visibility, network awareness, and world-scale mapping.',
    routes: ['roadworld', 'roadchain', 'highway'],
    domains: ['fleet.blackroad.io', 'blackroad.network', 'atlas.blackroad.io'],
    agents: ['gaia', 'olympia', 'alice'],
  },
};

const PRODUCT_CATEGORY_CONTEXT = {
  os: { systems: ['agents', 'sites'], docs: ['blackroad index', 'memory'] },
  core: { systems: ['agents', 'collab'], docs: ['collab', 'agent-entry'] },
  work: { systems: ['todo', 'status'], docs: ['command dock routing', 'codex'] },
  knowledge: { systems: ['docs', 'index'], docs: ['blackroad index', 'codex'] },
  social: { systems: ['live', 'collab'], docs: ['collab'] },
  creative: { systems: ['live', 'archive'], docs: ['codex'] },
  education: { systems: ['docs', 'todo'], docs: ['codex', 'blackroad index'] },
  infrastructure: { systems: ['status', 'memory'], docs: ['memory', 'command dock routing'] },
  world: { systems: ['sites', 'live'], docs: ['blackroad index'] },
};

const PRODUCT_CATEGORY_PLAYBOOKS = {
  os: {
    title: 'Operating loop',
    note: 'Recover the shell, inspect the network, and re-enter memory.',
    queries: [
      { title: 'List agents', subtitle: 'Operator roster', query: 'agents' },
      { title: 'Inspect sites', subtitle: 'Domain map', query: 'sites' },
      { title: 'Open memory', subtitle: 'System continuity', query: 'memory' },
    ],
  },
  core: {
    title: 'Coordination loop',
    note: 'Coordinate operators, collaboration surfaces, and live rooms.',
    queries: [
      { title: 'Open agents', subtitle: 'Operator roster', query: 'agents' },
      { title: 'Open collab', subtitle: 'Shared execution room', query: 'collab' },
      { title: 'Open live', subtitle: 'Broadcast and room layer', query: 'live' },
    ],
  },
  work: {
    title: 'Execution loop',
    note: 'Route tasks, check status, and ship work from one panel.',
    queries: [
      { title: 'Open todo', subtitle: 'Backlog and tasks', query: 'todo' },
      { title: 'Open status', subtitle: 'Operational status', query: 'status' },
      { title: 'Open codex', subtitle: 'Execution guide', query: 'doc codex' },
    ],
  },
  knowledge: {
    title: 'Research loop',
    note: 'Read canon, verify sources, and pivot into public knowledge.',
    queries: [
      { title: 'Open docs', subtitle: 'Canon references', query: 'docs' },
      { title: 'Open index', subtitle: 'Institutional map', query: 'index' },
      { title: 'Open archive', subtitle: 'Saved media and records', query: 'archive' },
    ],
  },
  social: {
    title: 'Audience loop',
    note: 'Move between live surfaces, community context, and public-facing coordination.',
    queries: [
      { title: 'Open live', subtitle: 'Broadcast layer', query: 'live' },
      { title: 'Open collab', subtitle: 'Shared commentary room', query: 'collab' },
      { title: 'Open agents', subtitle: 'Named operators', query: 'agents' },
    ],
  },
  creative: {
    title: 'Studio loop',
    note: 'Capture, publish, and route media inside the shell.',
    queries: [
      { title: 'Open capture', subtitle: 'Screen and media capture', query: 'capture' },
      { title: 'Open archive', subtitle: 'Saved media surfaces', query: 'archive' },
      { title: 'Open live', subtitle: 'Broadcast and reaction rooms', query: 'live' },
    ],
  },
  education: {
    title: 'Learning loop',
    note: 'Read the canon, route tasks, and move through verified learning flows.',
    queries: [
      { title: 'Open docs', subtitle: 'Guides and references', query: 'docs' },
      { title: 'Open todo', subtitle: 'Assignments and tasks', query: 'todo' },
      { title: 'Open index', subtitle: 'Institutional map', query: 'index' },
    ],
  },
  infrastructure: {
    title: 'Assurance loop',
    note: 'Inspect status, memory, and proof surfaces around the network.',
    queries: [
      { title: 'Open status', subtitle: 'Operational status', query: 'status' },
      { title: 'Open memory', subtitle: 'Continuity and checkpoints', query: 'memory' },
      { title: 'Open RoadChain', subtitle: 'Proof and provenance', query: 'open roadchain' },
    ],
  },
  world: {
    title: 'World loop',
    note: 'Traverse topology, maps, and live spaces across the ecosystem.',
    queries: [
      { title: 'Open sites', subtitle: 'Domain topology', query: 'sites' },
      { title: 'Open atlas', subtitle: 'Map of products and routes', query: 'open atlas' },
      { title: 'Open live', subtitle: 'Rooms and broadcasts', query: 'live' },
    ],
  },
};

const FLAGSHIP_WORKSPACE_CONFIGS = {
  roadtrip: {
    description: 'RoadTrip workspace centers on multi-agent coordination, live rooms, collaboration surfaces, and operational context.',
    systems: ['agents', 'collab', 'live'],
    routes: ['roadwork', 'carpool', 'roadside'],
    docs: ['agent-entry', 'collab', 'command dock routing'],
    agents: ['lucidia', 'roadie', 'valeria', 'calliope'],
    surfaces: ['roadtrip-agent', 'screen-capture'],
    briefs: [
      { label: 'Mission', title: 'Open the executive room', copy: 'Center the roster, branch the operator room, and keep RoadWork and CarPool within one move.', query: 'open roadtrip' },
      { label: 'Watch', title: 'Keep the room live', copy: 'Stay on top of collaboration and live surfaces before threads fragment into separate tabs.', query: 'live' },
      { label: 'Escalate', title: 'Route execution outward', copy: 'Push concrete work into RoadWork or CarPool once the operator room has converged.', query: 'open roadwork' },
    ],
    runbooks: [
      {
        label: 'Dispatch play',
        title: 'Stabilize the active route room',
        copy: 'Pull the roster, collaboration state, and live context into one room before changing travel or execution paths.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open agents', query: 'agents' },
          { label: 'Open live', query: 'live' },
        ],
      },
      {
        label: 'Escalation play',
        title: 'Turn room consensus into owned work',
        copy: 'Once the executive room converges, push the decision into the road that will execute and keep the handoff visible.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Room protocol',
        title: 'Prime, hold, and route the executive room',
        stages: [
          { label: 'Prime', value: 'Open RoadTrip and center the roster.' },
          { label: 'Hold', value: 'Keep collaboration and live state adjacent.' },
          { label: 'Route', value: 'Push the converged decision into execution.' },
        ],
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Escalation protocol',
        title: 'Move from watch to owned follow-through',
        stages: [
          { label: 'Prime', value: 'Stabilize the room before adding more actors.' },
          { label: 'Hold', value: 'Keep agents and live context in the same lane.' },
          { label: 'Route', value: 'Hand the outcome to CarPool or RoadWork.' },
        ],
        actions: [
          { label: 'Open agents', query: 'agents' },
          { label: 'Open live', query: 'live' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Coordination tripwire',
        title: 'The room starts fragmenting into separate surfaces',
        signal: 'Operators are splitting across collab, live, and adjacent roads.',
        trigger: 'You need more than one reopen to reconstruct the current state.',
        response: 'Re-center the executive room before routing new work outward.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open agents', query: 'agents' },
        ],
      },
      {
        label: 'Execution tripwire',
        title: 'A decision is ready but still has no owning lane',
        signal: 'The room has converged, but no execution road has taken custody.',
        trigger: 'The same decision is repeated without a new owner appearing.',
        response: 'Push the outcome into RoadWork or CarPool immediately.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Room decision',
        title: 'Choose the single room that owns coordination',
        decision: 'Keep RoadTrip as the active room until the decision has a named executor.',
        condition: 'Make this choice as soon as collab, live, and adjacent roads all compete for attention.',
        rationale: 'One room must preserve the shared state before any route is handed outward.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open agents', query: 'agents' },
        ],
      },
      {
        label: 'Handoff decision',
        title: 'Choose the road that will own execution',
        decision: 'Route into RoadWork for execution or CarPool for shared delivery, but not both as peers.',
        condition: 'Make this choice once the room has converged and the next move is no longer discovery.',
        rationale: 'The executive room should create one clear owner instead of multiple adjacent lanes.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Coordination checkpoint',
        title: 'The executive room is truly centered',
        objective: 'Hold roster, collaboration, and live context in one visible room.',
        proof: 'RoadTrip, agents, and collab can explain the full current state without reopening parallel lanes.',
        exit: 'Only then push the work into RoadWork or CarPool.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open agents', query: 'agents' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
      {
        label: 'Handoff checkpoint',
        title: 'Execution custody is explicit',
        objective: 'Name the road that will actually carry the next move.',
        proof: 'RoadWork or CarPool has become the obvious owner of the converged decision.',
        exit: 'Leave the executive room only after that owner is visible.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Room dependency',
        title: 'Executive room depends on agent and collab continuity',
        reliesOn: 'Agents and collab staying legible as one shared operating context.',
        watch: 'Live surfaces or adjacent roads pulling state out of the main room.',
        unlocks: 'A clean handoff into RoadWork or CarPool once consensus forms.',
        actions: [
          { label: 'Open agents', query: 'agents' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Route dependency',
        title: 'Handoff quality depends on one visible execution owner',
        reliesOn: 'A single road taking custody instead of parallel adjacent lanes.',
        watch: 'Reopening RoadTrip to rediscover ownership after a handoff starts.',
        unlocks: 'Stable outward movement without losing executive context.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Coordination guardrail',
        title: 'Preserve one visible operating room',
        preserve: 'RoadTrip as the place where agents, collab, and live state are legible together.',
        avoid: 'Letting adjacent rooms become parallel control centers during coordination.',
        recover: 'Re-center the room by reopening RoadTrip, collab, and agents together.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open agents', query: 'agents' },
        ],
      },
      {
        label: 'Handoff guardrail',
        title: 'Preserve one explicit execution owner',
        preserve: 'A single downstream road taking custody after the room converges.',
        avoid: 'Splitting execution between RoadWork and CarPool without a lead lane.',
        recover: 'Re-name the owner and reopen only that road as the active handoff target.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    custody: [
      {
        label: 'Room custody',
        title: 'RoadTrip holds executive coordination until the route is named',
        current: 'RoadTrip keeps the active room, agents, and collab surfaces aligned while the operating decision is still forming.',
        sharedWith: 'Agents and collab stay in the loop as the visible coordination context around the room.',
        transfersTo: 'RoadWork or CarPool takes explicit custody once execution or shared delivery is clearly named.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Execution custody',
        title: 'Transfer with one downstream owner',
        current: 'The room remains with RoadTrip until a single execution lane is chosen.',
        sharedWith: 'Live and adjacent roads stay visible only as supporting context for the handoff.',
        transfersTo: 'CarPool or RoadWork becomes the next owner, but not both at once.',
        actions: [
          { label: 'Open live', query: 'live' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Execution receipt',
        title: 'RoadWork echoes the chosen route back to the room',
        sends: 'Send the named execution owner, active objective, and nearby context out of RoadTrip.',
        lands: 'Land the handoff in RoadWork with collab or live attached only if they still matter.',
        confirms: 'The handoff is real when the active task and owner are visible in the execution lane.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
        ],
      },
      {
        label: 'Crew receipt',
        title: 'CarPool confirms the room actually widened',
        sends: 'Send the shared goal and participating operators only after one-owner execution is no longer enough.',
        lands: 'Land the crew inside CarPool with the flagship room still legible as the source context.',
        confirms: 'The receipt is complete when shared delivery has one crew room instead of parallel lanes.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open agents', query: 'agents' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Room cadence',
        title: 'Re-check the flagship room whenever ownership moves',
        review: 'Review the room at each named handoff so agents, collab, and the next owner still match.',
        pulse: 'Keep RoadTrip, agents, and the active downstream road in a tight loop while the room is steering.',
        reset: 'Reset by collapsing back to one active owner if multiple lanes start acting like control rooms.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open agents', query: 'agents' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
      {
        label: 'Handoff cadence',
        title: 'Revisit execution quickly after the room widens',
        review: 'Review the downstream lane immediately after CarPool or RoadWork takes custody.',
        pulse: 'Keep the source room visible until the new owner proves it can carry the work alone.',
        reset: 'Reset by restating the owner and re-opening only the source room plus the chosen target.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Ownership fallback',
        title: 'Collapse back to RoadTrip when downstream ownership blurs',
        breaks: 'RoadWork, CarPool, or adjacent surfaces begin acting like parallel control rooms.',
        fallback: 'Return the room to RoadTrip with agents and collab as the only supporting context.',
        resume: 'Resume outward movement only after one downstream owner is named again.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open agents', query: 'agents' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Crew fallback',
        title: 'Drop back from CarPool when shared delivery was premature',
        breaks: 'The crew room widens before the task truly needs multiple owners.',
        fallback: 'Move the work back into the flagship room and hold one execution lane beside it.',
        resume: 'Resume crew expansion after the shared task and current owner are both explicit.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Weekly sync',
        title: 'Executive team alignment',
        practice: 'Gather for crew alignment on road status, blockers, and next steps',
        frequency: 'Weekly on Monday mornings',
        purpose: 'Keep crew moving together without losing executive focus',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Check agents', query: 'agents' },
        ],
      },
    ],
    primers: [
      {
        label: 'Agenda prep',
        title: 'Get ready for the briefing',
        start: 'Open RoadTrip and load the last session.',
        gather: 'Check agents, collab, and live for incoming context.',
        ready: 'Confirm with the crew that we\'re aligned on the next move.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Check live', query: 'live' },
        ],
      },
    ],
    board: {
      title: 'Room handoff board',
      note: 'Keep the executive room moving without losing shared state.',
      columns: [
        { title: 'Now', note: 'Open immediately', items: [
          { title: 'Open RoadTrip', subtitle: 'Executive room', query: 'open roadtrip' },
          { title: 'Open agents', subtitle: 'Roster context', query: 'agents' },
        ]},
        { title: 'Nearby', note: 'Keep adjacent', items: [
          { title: 'Open collab', subtitle: 'Shared execution room', query: 'collab' },
          { title: 'Open live', subtitle: 'Broadcast and rooms', query: 'live' },
        ]},
        { title: 'Escalate', note: 'Route outward', items: [
          { title: 'Open RoadWork', subtitle: 'Execution lane', query: 'open roadwork' },
          { title: 'Open CarPool', subtitle: 'Shared project room', query: 'open carpool' },
        ]},
      ],
    },
  },
  roadcode: {
    description: 'RoadCode workspace centers on coding, deployment, command routing, and execution status.',
    systems: ['status', 'todo', 'docs'],
    routes: ['carpool', 'roadwork', 'oneway'],
    docs: ['command dock routing', 'codex'],
    agents: ['cecilia', 'octavia', 'sebastian'],
    surfaces: ['screen-capture'],
    briefs: [
      { label: 'Mission', title: 'Ship from one shell', copy: 'Keep coding, docs, and status in one route so implementation stays attached to operations.', query: 'open roadcode' },
      { label: 'Watch', title: 'Track routing health', copy: 'Use status and command routing references as the live guardrails for changes.', query: 'status' },
      { label: 'Escalate', title: 'Hand off to execution', copy: 'Move from build mode into RoadWork or CarPool when the change becomes shared work.', query: 'open roadwork' },
    ],
    runbooks: [
      {
        label: 'Build play',
        title: 'Collapse code, docs, and checks into one lane',
        copy: 'Keep implementation, references, and runtime state in the same room while a change is still being shaped.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Release play',
        title: 'Promote the change into shared execution',
        copy: 'Once the code path is clear, route the work into broader execution instead of leaving delivery trapped in the build room.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Change protocol',
        title: 'Shape the change before widening the blast radius',
        stages: [
          { label: 'Prime', value: 'Open RoadCode and the matching canon guide.' },
          { label: 'Hold', value: 'Keep status and routing health in view.' },
          { label: 'Route', value: 'Promote the change into shared execution.' },
        ],
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Ingress protocol',
        title: 'Keep imports and releases attached to the build room',
        stages: [
          { label: 'Prime', value: 'Scope the change and its routing edges.' },
          { label: 'Hold', value: 'Keep OneWay and docs close while iterating.' },
          { label: 'Route', value: 'Move visible follow-through into the queue.' },
        ],
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Routing tripwire',
        title: 'The change path is no longer clear',
        signal: 'Build, docs, and routing reference disagree about the current move.',
        trigger: 'You have to reopen canon context to remember what ships next.',
        response: 'Re-anchor in RoadCode and the matching guide before continuing.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Release tripwire',
        title: 'Implementation is done but delivery is stalled',
        signal: 'The change is shaped, yet no shared execution lane owns release follow-through.',
        trigger: 'The next move is operational rather than coding work.',
        response: 'Route the handoff into RoadWork, OneWay, or the queue.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Build decision',
        title: 'Choose whether the next move is code or delivery',
        decision: 'Stay in RoadCode while the change is being shaped; switch to RoadWork once execution owns it.',
        condition: 'Make this choice when status, docs, and code all point to different next steps.',
        rationale: 'The build room is for shaping; delivery rooms are for carrying follow-through.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Ingress decision',
        title: 'Choose whether imports belong in the current lane',
        decision: 'Use OneWay only when the next step is ingress or release plumbing, not general implementation.',
        condition: 'Make this choice when routing edges or delivery concerns begin to dominate coding work.',
        rationale: 'The shell stays cleaner when ingress work is separated from core code shaping.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Build checkpoint',
        title: 'The change is shaped inside one build lane',
        objective: 'Keep code, docs, and status aligned while the implementation is still moving.',
        proof: 'RoadCode, codex, and status agree on the current next step.',
        exit: 'Only then route the change into operational delivery.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Release checkpoint',
        title: 'Delivery has a visible follow-through lane',
        objective: 'Turn a finished implementation into an owned execution path.',
        proof: 'RoadWork, OneWay, or todo clearly carries the next non-code move.',
        exit: 'Leave the build room only after a delivery lane is explicit.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Build dependency',
        title: 'RoadCode depends on canon and status staying attached',
        reliesOn: 'Codex and status remaining adjacent while the change is still being shaped.',
        watch: 'Implementation drifting into delivery concerns before the build lane is settled.',
        unlocks: 'A smoother move into RoadWork or OneWay once the change is ready.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Delivery dependency',
        title: 'Release clarity depends on one downstream lane',
        reliesOn: 'RoadWork, OneWay, or todo clearly owning the next non-code step.',
        watch: 'The build room continuing to carry operational follow-through.',
        unlocks: 'Release movement without confusing implementation and execution.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Build guardrail',
        title: 'Preserve the build room as the shaping lane',
        preserve: 'Code, docs, and status staying attached while implementation is still moving.',
        avoid: 'Turning RoadCode into a release room before the change is actually shaped.',
        recover: 'Pull the work back into RoadCode, codex, and status until the path is clear.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Release guardrail',
        title: 'Preserve a clean boundary between build and delivery',
        preserve: 'OneWay, RoadWork, or todo owning downstream operational follow-through.',
        avoid: 'Keeping release coordination trapped in the coding room.',
        recover: 'Push the next non-code move into the explicit delivery lane.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    custody: [
      {
        label: 'Build custody',
        title: 'RoadCode owns the change while implementation is still moving',
        current: 'RoadCode carries the active implementation lane while code, docs, and status are still being shaped together.',
        sharedWith: 'Codex and status stay attached so the build room keeps both explanation and health context in frame.',
        transfersTo: 'RoadWork, OneWay, or todo takes custody when the next move is no longer a code-shaping task.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Release custody',
        title: 'Leave the build room only after the route is explicit',
        current: 'RoadCode remains the owner until the downstream operational lane is identified.',
        sharedWith: 'Status and command routing stay visible so release context does not drift away from implementation.',
        transfersTo: 'OneWay or RoadWork becomes the explicit owner for rollout and follow-through.',
        actions: [
          { label: 'Open status', query: 'status' },
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Release receipt',
        title: 'RoadWork acknowledges the build is ready to leave code shaping',
        sends: 'Send the concrete change, current health, and route notes once implementation stabilizes.',
        lands: 'Land the next move in RoadWork with status still attached to the release path.',
        confirms: 'The receipt is visible when downstream execution no longer depends on reopening the coding room first.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open status', query: 'status' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Ingress receipt',
        title: 'OneWay confirms the rollout path is explicit',
        sends: 'Send the import or release route only after the downstream operational lane is chosen.',
        lands: 'Land the handoff in OneWay with command routing and delivery context still visible.',
        confirms: 'The handoff lands when rollout ownership is legible outside RoadCode.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open codex', query: 'doc codex' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Build cadence',
        title: 'Review the coding room at each change in route clarity',
        review: 'Review RoadCode whenever the work shifts from shaping code to routing release or execution.',
        pulse: 'Keep codex and status close while the implementation still changes hour to hour.',
        reset: 'Reset by pulling the work back into RoadCode if downstream activity starts driving code decisions.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Release cadence',
        title: 'Re-check downstream rollout right after the build room hands off',
        review: 'Review OneWay or RoadWork as soon as the next move leaves implementation.',
        pulse: 'Keep the route note and operational health visible until rollout ownership is stable.',
        reset: 'Reset by reopening the build room and restating the target lane when release intent becomes fuzzy.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Build fallback',
        title: 'Pull the change back into RoadCode when release motion outruns implementation',
        breaks: 'Release or routing decisions start driving code changes faster than the build lane can explain them.',
        fallback: 'Return to RoadCode with codex and status attached until the implementation path is coherent again.',
        resume: 'Resume rollout only after the change can be described cleanly from the coding room.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Ingress fallback',
        title: 'Abandon OneWay as the active path when rollout ownership stays fuzzy',
        breaks: 'The ingress lane still depends on reopening the build room for every next step.',
        fallback: 'Route back through RoadWork or todo until one operational owner is clearly holding the move.',
        resume: 'Resume the import or rollout path after downstream execution can continue without RoadCode as control.',
        actions: [
          { label: 'Open OneWay', query: 'open oneway' },
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Build review',
        title: 'Deployment readiness ritual',
        practice: 'Review build status, gates, and deployment checklist',
        frequency: 'Daily before deployment window',
        purpose: 'Ensure all code changes are ready and gates are clear',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Check status', query: 'status' },
        ],
      },
    ],
    primers: [
      {
        label: 'Build prep',
        title: 'Setup before the deployment briefing',
        start: 'Open RoadCode and pull the latest build state.',
        gather: 'Sync status, docs, and command routing contexts.',
        ready: 'Verify all deployment gates are clear.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Check status', query: 'status' },
        ],
      },
    ],
    board: {
      title: 'Ship board',
      note: 'Keep code, routing, and rollout in one shell loop.',
      columns: [
        { title: 'Now', note: 'Build context', items: [
          { title: 'Open RoadCode', subtitle: 'Primary coding lane', query: 'open roadcode' },
          { title: 'Open codex', subtitle: 'Implementation guide', query: 'doc codex' },
        ]},
        { title: 'Nearby', note: 'Guardrails', items: [
          { title: 'Open status', subtitle: 'Operational health', query: 'status' },
          { title: 'Open command routing', subtitle: 'Routing reference', query: 'doc command dock routing' },
        ]},
        { title: 'Escalate', note: 'Shared execution', items: [
          { title: 'Open RoadWork', subtitle: 'Operational follow-through', query: 'open roadwork' },
          { title: 'Open OneWay', subtitle: 'Ingress and imports', query: 'open oneway' },
        ]},
      ],
    },
  },
  roadwork: {
    description: 'RoadWork workspace centers on execution, backlog, collaboration, and accountability surfaces.',
    systems: ['todo', 'status', 'collab'],
    routes: ['carpool', 'carkeys', 'roadchain'],
    docs: ['brtodo', 'collab', 'memory'],
    agents: ['valeria', 'theodosia', 'octavia'],
    briefs: [
      { label: 'Mission', title: 'Drive the backlog', copy: 'Anchor execution in todo, status, and collaboration instead of letting tasks drift across tools.', query: 'open roadwork' },
      { label: 'Watch', title: 'Keep proofs attached', copy: 'Use RoadChain and memory references so decisions retain lineage and accountability.', query: 'open roadchain' },
      { label: 'Escalate', title: 'Unlock shared work', copy: 'Pivot into CarPool when execution needs multiple humans and agents at once.', query: 'open carpool' },
    ],
    runbooks: [
      {
        label: 'Execution play',
        title: 'Frame the current workcell before moving labor',
        copy: 'Check backlog, health, and collaboration context first so the team works from one shared state.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Recovery play',
        title: 'Route blockers into proof-backed follow-through',
        copy: 'When work stalls, pivot into lineage and shared delivery instead of letting accountability scatter.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Backlog protocol',
        title: 'Hold execution in one accountable lane',
        stages: [
          { label: 'Prime', value: 'Start from RoadWork and the active backlog.' },
          { label: 'Hold', value: 'Keep health and collaboration attached.' },
          { label: 'Route', value: 'Escalate blockers with proof and ownership.' },
        ],
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
      {
        label: 'Handoff protocol',
        title: 'Turn blocked work into shared movement',
        stages: [
          { label: 'Prime', value: 'Name the stalled lane and current owner.' },
          { label: 'Hold', value: 'Keep collaboration and lineage visible.' },
          { label: 'Route', value: 'Broaden into CarPool or access control.' },
        ],
        actions: [
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Backlog tripwire',
        title: 'Tasks are moving without proof attached',
        signal: 'Work is progressing, but lineage and ownership are getting fuzzy.',
        trigger: 'A blocker or decision appears without a linked proof surface.',
        response: 'Reconnect execution to RoadChain before broadening the room.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Crew tripwire',
        title: 'The lane now needs shared execution',
        signal: 'One owner can no longer carry the backlog alone.',
        trigger: 'New coordination surfaces are required to keep the work moving.',
        response: 'Escalate into CarPool or collaboration before the queue fragments.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Backlog decision',
        title: 'Choose whether the work still fits one accountable lane',
        decision: 'Keep the task in RoadWork until proof or collaboration needs exceed one owner.',
        condition: 'Make this choice when blockers appear or the current owner starts reopening adjacent rooms.',
        rationale: 'Execution stays legible when accountability is preserved for as long as possible.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Crew decision',
        title: 'Choose when to widen the lane into shared delivery',
        decision: 'Escalate into CarPool only when coordination becomes a first-class part of the task.',
        condition: 'Make this choice when the next move requires multiple humans or agent roles to stay in sync.',
        rationale: 'Shared rooms should appear because the work needs them, not by habit.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Execution checkpoint',
        title: 'The backlog still fits one accountable lane',
        objective: 'Keep active work, health, and proof attached to one operator path.',
        proof: 'RoadWork, status, and RoadChain can explain the task without widening the room.',
        exit: 'Only broaden into shared delivery if one lane no longer holds.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open status', query: 'status' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
      {
        label: 'Crew checkpoint',
        title: 'Shared execution is actually required',
        objective: 'Widen the room only when the task needs coordination, not out of habit.',
        proof: 'CarPool or collab is necessary to keep the next move coherent.',
        exit: 'Escalate into the broader crew lane once that need is undeniable.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Execution dependency',
        title: 'RoadWork depends on proof and health staying attached',
        reliesOn: 'Status and RoadChain continuing to explain the current work lane.',
        watch: 'Backlog movement that drops proof or accountability context.',
        unlocks: 'Reliable escalation into shared delivery only when needed.',
        actions: [
          { label: 'Open status', query: 'status' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
      {
        label: 'Crew dependency',
        title: 'Broader delivery depends on coordination being real',
        reliesOn: 'CarPool and collab only appearing once the task actually needs them.',
        watch: 'Premature room widening that obscures ownership.',
        unlocks: 'A cleaner crew lane when the work truly becomes shared.',
        actions: [
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Execution guardrail',
        title: 'Preserve proof and ownership in the work lane',
        preserve: 'RoadWork, status, and RoadChain remaining attached to the active task.',
        avoid: 'Backlog movement that loses proof, health, or ownership context.',
        recover: 'Reconnect the task to RoadChain and the current health surface before continuing.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Crew guardrail',
        title: 'Preserve shared delivery as an explicit escalation',
        preserve: 'CarPool appearing only when the task genuinely requires coordinated custody.',
        avoid: 'Widening the room before the work has truly outgrown one owner.',
        recover: 'Collapse the task back to the main work lane until shared delivery is necessary.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    custody: [
      {
        label: 'Workcell custody',
        title: 'RoadWork owns the active task while proof stays attached',
        current: 'RoadWork keeps the backlog item, current health, and lineage surfaces together as the working lane.',
        sharedWith: 'Status and RoadChain remain in the loop so execution does not separate from proof.',
        transfersTo: 'CarPool takes custody when the work truly becomes shared across a crew.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open status', query: 'status' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
      {
        label: 'Crew custody',
        title: 'Promote from one owner to shared delivery deliberately',
        current: 'The room stays with the named work owner until collaboration is actually needed.',
        sharedWith: 'Collab and CarKeys provide surrounding coordination context once the lane begins to widen.',
        transfersTo: 'CarPool becomes the persistent crew room for shared execution.',
        actions: [
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Proof receipt',
        title: 'Status confirms the task still carries health and proof',
        sends: 'Send the active task, expected proof, and current health snapshot from the work lane.',
        lands: 'Land the work in Status and RoadChain as supporting surfaces rather than a separate owner.',
        confirms: 'The receipt is complete when the task can be read with health and lineage still attached.',
        actions: [
          { label: 'Open status', query: 'status' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadWork', query: 'open roadwork' },
        ],
      },
      {
        label: 'Crew receipt',
        title: 'CarPool confirms shared execution has a durable room',
        sends: 'Send the backlog item, current owner, and collaboration need only when the work actually widens.',
        lands: 'Land the crew in CarPool with RoadWork still legible as the source lane.',
        confirms: 'The handoff lands when shared execution can continue without splitting ownership across rooms.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Task cadence',
        title: 'Re-check the work lane whenever proof or ownership changes',
        review: 'Review RoadWork when backlog priority, current owner, or proof expectations shift.',
        pulse: 'Keep todo, status, and RoadChain in a steady loop while the task remains active.',
        reset: 'Reset by narrowing back to one owner and one task when the room starts spreading into parallel work.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
      {
        label: 'Crew cadence',
        title: 'Review shared delivery faster than the backlog can drift',
        review: 'Review CarPool and collab immediately after shared execution starts.',
        pulse: 'Keep the current task and collaboration lane visible until the crew rhythm is stable.',
        reset: 'Reset by collapsing back into RoadWork if the crew room no longer needs multiple owners.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open status', query: 'status' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Task fallback',
        title: 'Shrink back to one workcell when shared execution starts diffusing ownership',
        breaks: 'Collab, CarPool, or the backlog begin moving without one operator clearly holding the task.',
        fallback: 'Return the work to RoadWork with todo, status, and RoadChain as the only active frame.',
        resume: 'Resume wider delivery after the named task, owner, and proof path are back in one lane.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open todo', query: 'todo' },
          { label: 'Open status', query: 'status' },
        ],
      },
      {
        label: 'Crew fallback',
        title: 'Step back from CarPool when the task is not truly shared yet',
        breaks: 'The crew room creates more coordination load than execution value.',
        fallback: 'Collapse back into the primary work lane and treat collaboration as support, not ownership.',
        resume: 'Resume shared delivery once multiple owners are concretely required by the task.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open CarKeys', query: 'open carkeys' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Daily standup',
        title: 'Execution team alignment',
        practice: 'Review work items, blockers, and team capacity for the day',
        frequency: 'Daily at start of work',
        purpose: 'Align crew on what is being executed and what blocks need solving',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
    ],
    primers: [
      {
        label: 'Work prep',
        title: 'Stage the execution lane before kickoff',
        start: 'Open RoadWork and clear the current task stack.',
        gather: 'Load agents, work surfaces, and shared context.',
        ready: 'Confirm the next work item and crew alignment.',
        actions: [
          { label: 'Open RoadWork', query: 'open roadwork' },
          { label: 'Check collab', query: 'collab' },
        ],
      },
    ],
    board: {
      title: 'Execution board',
      note: 'Run backlog, accountability, and shared work from one lane set.',
      columns: [
        { title: 'Now', note: 'Primary execution', items: [
          { title: 'Open RoadWork', subtitle: 'Main operations lane', query: 'open roadwork' },
          { title: 'Open todo', subtitle: 'Backlog surface', query: 'todo' },
        ]},
        { title: 'Nearby', note: 'Keep proof attached', items: [
          { title: 'Open status', subtitle: 'Current health', query: 'status' },
          { title: 'Open RoadChain', subtitle: 'Proof and lineage', query: 'open roadchain' },
        ]},
        { title: 'Escalate', note: 'Broaden the team', items: [
          { title: 'Open CarPool', subtitle: 'Shared project room', query: 'open carpool' },
          { title: 'Open CarKeys', subtitle: 'Access and identity', query: 'open carkeys' },
        ]},
      ],
    },
  },
  roadview: {
    description: 'RoadView workspace centers on search, canon references, provenance, and verified discovery context.',
    systems: ['docs', 'index', 'archive'],
    routes: ['roadbook', 'roadchain', 'backroad'],
    docs: ['blackroad index', 'codex', 'memory'],
    agents: ['alexandria', 'sophia', 'atticus'],
    surfaces: ['ia-prelinger-1'],
    briefs: [
      { label: 'Mission', title: 'Verify before opening', copy: 'Use docs, index, and archive as the first stop before turning discovery into action.', query: 'open roadview' },
      { label: 'Watch', title: 'Keep provenance visible', copy: 'Route through RoadChain and RoadBook whenever search results need trust and citation.', query: 'open roadchain' },
      { label: 'Escalate', title: 'Publish the verified result', copy: 'Push confirmed knowledge outward into RoadBook or BackRoad once the source trail is clear.', query: 'open roadbook' },
    ],
    runbooks: [
      {
        label: 'Signal play',
        title: 'Refresh the operating picture before publishing',
        copy: 'Rebuild confidence in the view by checking references, sources, and provenance before pushing the result outward.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
      {
        label: 'Publication play',
        title: 'Convert verified discovery into a shareable route',
        copy: 'Move from gathered evidence to a public or institutional surface only after the source trail is stable.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Verification protocol',
        title: 'Prove the source trail before publication',
        stages: [
          { label: 'Prime', value: 'Start with docs and the verification route.' },
          { label: 'Hold', value: 'Keep archive and provenance attached.' },
          { label: 'Route', value: 'Publish only after the trail is stable.' },
        ],
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
      {
        label: 'Discovery protocol',
        title: 'Translate search confidence into a shareable surface',
        stages: [
          { label: 'Prime', value: 'Open the strongest likely path.' },
          { label: 'Hold', value: 'Reconfirm trust with docs and archive.' },
          { label: 'Route', value: 'Push the verified result outward.' },
        ],
        actions: [
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
          { label: 'Open BackRoad', query: 'open backroad' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Trust tripwire',
        title: 'Discovery is outpacing verification',
        signal: 'You have a likely path, but the proof surface is still thin.',
        trigger: 'The team wants to publish before provenance is stable.',
        response: 'Pause and re-anchor in RoadChain, docs, and archive.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
      {
        label: 'Publication tripwire',
        title: 'A verified result still has no outward route',
        signal: 'The source trail is good, but no publication lane has been chosen.',
        trigger: 'The room keeps reviewing the same verified result instead of routing it outward.',
        response: 'Hand the result into RoadBook or BackRoad immediately.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open RoadView', query: 'open roadview' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Trust decision',
        title: 'Choose whether the result is verified enough to publish',
        decision: 'Stay in RoadView until provenance and references are stable; publish only after that point.',
        condition: 'Make this choice when the room starts discussing outward routing before the proof trail is settled.',
        rationale: 'Verification loses value if publication outruns trust.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Publication decision',
        title: 'Choose the outward lane for a verified result',
        decision: 'Send institutional results to RoadBook and public context to BackRoad, but pick one lead route first.',
        condition: 'Make this choice once the verified result no longer needs additional source gathering.',
        rationale: 'A single outward lane keeps the transition from trust to publication legible.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Trust checkpoint',
        title: 'The source trail is good enough to route outward',
        objective: 'Confirm that discovery has become verifiable knowledge.',
        proof: 'RoadView, RoadChain, and docs agree on the same trustworthy result.',
        exit: 'Only publish after the trust lane is stable.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Publication checkpoint',
        title: 'One outward route has taken custody',
        objective: 'Choose the publication surface that should carry the verified result.',
        proof: 'RoadBook or BackRoad clearly owns the next outward move.',
        exit: 'Leave verification only once that publication lane is explicit.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Trust dependency',
        title: 'RoadView depends on provenance and references staying adjacent',
        reliesOn: 'Docs, archive, and RoadChain continuing to support the current finding.',
        watch: 'Publication pressure arriving before the proof trail is coherent.',
        unlocks: 'A legitimate outward route into RoadBook or BackRoad.',
        actions: [
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
      {
        label: 'Publication dependency',
        title: 'Verified results depend on one durable downstream surface',
        reliesOn: 'RoadBook or BackRoad clearly taking custody of the verified result.',
        watch: 'Verified knowledge lingering in RoadView without an outward owner.',
        unlocks: 'Publication that stays tied to the trust lane that created it.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Trust guardrail',
        title: 'Preserve provenance while the result is still forming',
        preserve: 'RoadView, docs, archive, and RoadChain staying close until trust is stable.',
        avoid: 'Publishing from RoadView before the proof trail is coherent.',
        recover: 'Return to provenance and references before allowing outward routing.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
      {
        label: 'Publication guardrail',
        title: 'Preserve one clear outward owner for verified knowledge',
        preserve: 'RoadBook or BackRoad taking explicit custody once verification is complete.',
        avoid: 'Leaving verified results hovering inside the verification lane.',
        recover: 'Choose the publication surface and reopen it as the downstream owner.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
    ],
    custody: [
      {
        label: 'Verification custody',
        title: 'RoadView holds the result while truth is still being tested',
        current: 'RoadView keeps discovery, references, and provenance together until the result is trustworthy.',
        sharedWith: 'Docs, archive, and RoadChain remain adjacent as the evidence ring around the current finding.',
        transfersTo: 'RoadBook or BackRoad takes custody once the verified result is ready to persist outward.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open archive', query: 'archive' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
      {
        label: 'Publication custody',
        title: 'Transfer verified knowledge into one durable destination',
        current: 'The finding stays in RoadView only until the proof trail is coherent enough to publish.',
        sharedWith: 'RoadChain and docs stay visible so publication inherits the trust lane that produced it.',
        transfersTo: 'BackRoad or RoadBook becomes the outward owner for the verified result.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Proof receipt',
        title: 'RoadChain confirms the evidence ring stayed intact',
        sends: 'Send the finding, source trail, and verification notes out of RoadView together.',
        lands: 'Land the result beside RoadChain and docs so provenance remains attached to the claim.',
        confirms: 'The receipt is visible when the finding can be reopened with the same proof trail intact.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open RoadView', query: 'open roadview' },
        ],
      },
      {
        label: 'Publication receipt',
        title: 'RoadBook or BackRoad confirms verified knowledge left the lane cleanly',
        sends: 'Send the verified result only after the outward destination is explicit.',
        lands: 'Land the handoff in the publication surface with provenance still visible beside it.',
        confirms: 'The transfer lands when verified knowledge no longer has to rest inside RoadView.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Verification cadence',
        title: 'Re-check the evidence ring before every outward move',
        review: 'Review RoadView whenever the finding strengthens enough to tempt publication.',
        pulse: 'Keep docs, archive, and RoadChain nearby while the result is still being verified.',
        reset: 'Reset by reopening the source trail first if the claim gets ahead of the proof.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open archive', query: 'archive' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
      {
        label: 'Publication cadence',
        title: 'Review the destination immediately after verified knowledge moves out',
        review: 'Review RoadBook or BackRoad right after the verified result is published.',
        pulse: 'Keep provenance adjacent until the outward surface clearly carries the same truth.',
        reset: 'Reset by returning the result to RoadView if the destination loses context or proof.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Proof fallback',
        title: 'Return the result to RoadView when publication pressure outruns verification',
        breaks: 'RoadBook or BackRoad starts carrying claims whose source trail still feels incomplete.',
        fallback: 'Bring the result back into RoadView with docs, archive, and RoadChain surrounding it.',
        resume: 'Resume publication only after the evidence ring can survive a fresh re-read.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open archive', query: 'archive' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
      {
        label: 'Destination fallback',
        title: 'Switch publication surfaces if the first outward home loses provenance',
        breaks: 'The chosen destination cannot keep proof, memory, or route context legible.',
        fallback: 'Move the verified result to the publication surface that can hold both audience and provenance.',
        resume: 'Resume outward circulation after the replacement surface proves it can carry the same truth cleanly.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open BackRoad', query: 'open backroad' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Clarity checkpoint',
        title: 'Knowledge synthesis ritual',
        practice: 'Review signal sources, reconcile context, update knowledge graph',
        frequency: 'Weekly or when new data arrives',
        purpose: 'Keep the room\'s understanding of the world current and aligned',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open search', query: 'search' },
        ],
      },
    ],
    primers: [
      {
        label: 'Clarity prep',
        title: 'Prepare the sense-making surface',
        start: 'Open RoadView and load the current knowledge graph.',
        gather: 'Sync search, docs, and context surfaces.',
        ready: 'Verify all signal sources are current.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open search', query: 'search' },
        ],
      },
    ],
    board: {
      title: 'Verification board',
      note: 'Move from discovery to proof to publication without losing the source trail.',
      columns: [
        { title: 'Now', note: 'Start discovery', items: [
          { title: 'Open RoadView', subtitle: 'Verification layer', query: 'open roadview' },
          { title: 'Open docs', subtitle: 'Canon references', query: 'docs' },
        ]},
        { title: 'Nearby', note: 'Keep proof visible', items: [
          { title: 'Open RoadChain', subtitle: 'Provenance layer', query: 'open roadchain' },
          { title: 'Open archive', subtitle: 'Saved sources', query: 'archive' },
        ]},
        { title: 'Escalate', note: 'Publish outward', items: [
          { title: 'Open RoadBook', subtitle: 'Publishing layer', query: 'open roadbook' },
          { title: 'Open BackRoad', subtitle: 'Public social context', query: 'open backroad' },
        ]},
      ],
    },
  },
};

const FLAGSHIP_SITE_WORKSPACE_CONFIGS = {
  'docs-blackroad-io': {
    description: 'Docs workspace centers on canon references, key guides, and the explanation layer for humans and agents.',
    systems: ['docs', 'index', 'products'],
    docs: ['command dock routing', 'codex', 'blackroad index', 'memory'],
    agents: ['atticus', 'alexandria'],
    routes: ['roadbook', 'roadview'],
    briefs: [
      { label: 'Mission', title: 'Explain the system', copy: 'Keep the canon, index, and guides close so humans and agents share one vocabulary.', query: 'site docs.blackroad.io' },
      { label: 'Watch', title: 'Protect the references', copy: 'Use RoadBook and RoadView as the outer rings for published and verified knowledge.', query: 'open roadview' },
      { label: 'Escalate', title: 'Route into the map', copy: 'Hand off into products or the institutional index when docs needs broader navigation context.', query: 'products' },
    ],
    runbooks: [
      {
        label: 'Publishing play',
        title: 'Move from draft intent to canonical docs',
        copy: 'Use docs as the operating center for guides, references, and the currently trusted route language.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open index', query: 'index' },
        ],
      },
      {
        label: 'Alignment play',
        title: 'Tie explanations to live system reality',
        copy: 'Close gaps between written references, verification routes, and the product map before publishing changes.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Docs protocol',
        title: 'Move from explanation draft to trusted canon',
        stages: [
          { label: 'Prime', value: 'Open the docs room and core guide.' },
          { label: 'Hold', value: 'Keep index and verification nearby.' },
          { label: 'Route', value: 'Expand into products or publishing only when aligned.' },
        ],
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Alignment protocol',
        title: 'Keep references attached to live system shape',
        stages: [
          { label: 'Prime', value: 'Start from the written explanation.' },
          { label: 'Hold', value: 'Check verification and the institutional index.' },
          { label: 'Route', value: 'Publish through the connected product map.' },
        ],
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Canon tripwire',
        title: 'The explanation no longer matches the current system shape',
        signal: 'Docs, guides, and product reality are starting to drift apart.',
        trigger: 'You need to cross-check multiple rooms to explain one route.',
        response: 'Reconnect docs to verification and the product map before publishing.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Publishing tripwire',
        title: 'The writing is stable but the outward lane is unclear',
        signal: 'The docs room is ready, but no trusted publication path is holding it.',
        trigger: 'The same explanation is being reviewed without routing it outward.',
        response: 'Choose the guide, book, or product surface that owns the next move.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Canon decision',
        title: 'Choose whether the docs room still owns the explanation',
        decision: 'Keep the explanation in Docs until the product map or published book clearly becomes the primary lane.',
        condition: 'Make this choice when explanation, verification, and publishing all look equally active.',
        rationale: 'The docs room should stay primary while the wording is still being stabilized.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open products', query: 'products' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
      {
        label: 'Publication decision',
        title: 'Choose the surface that will carry the finalized explanation',
        decision: 'Use codex for core guide custody, RoadBook for outward publication, and index for map-level reference.',
        condition: 'Make this choice once the explanation is coherent and the room is deciding how it should persist.',
        rationale: 'Different explanation surfaces should have clear custody instead of overlapping by default.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Docs checkpoint',
        title: 'The explanation is canonically coherent',
        objective: 'Keep guides, references, and the product map aligned in one explanation lane.',
        proof: 'Docs, codex, and RoadView tell the same story about the route.',
        exit: 'Only publish outward once that explanation is stable.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadView', query: 'open roadview' },
        ],
      },
      {
        label: 'Publishing checkpoint',
        title: 'The explanation has a durable home',
        objective: 'Route the finalized explanation into the right persistent surface.',
        proof: 'Codex, RoadBook, or index clearly holds custody of the result.',
        exit: 'Leave the docs room only after that custody is visible.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open products', query: 'products' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Canon dependency',
        title: 'Docs depends on verification and product map alignment',
        reliesOn: 'RoadView and products continuing to agree with the current explanation.',
        watch: 'Guides and references drifting away from live system shape.',
        unlocks: 'Canon publication that retains route and product context.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
          { label: 'Open codex', query: 'doc codex' },
        ],
      },
      {
        label: 'Publishing dependency',
        title: 'Durable docs need one surface to hold custody',
        reliesOn: 'Codex, RoadBook, or index becoming the obvious persistence target.',
        watch: 'The docs room keeping finalized material without a clear long-term home.',
        unlocks: 'Cleaner publication and navigation after the explanation stabilizes.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Canon guardrail',
        title: 'Preserve agreement between docs and system reality',
        preserve: 'Docs, RoadView, and products continuing to describe the same route truthfully.',
        avoid: 'Explaining the system from stale references once the live shape has changed.',
        recover: 'Cross-check the explanation against verification and the product map before publishing.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Custody guardrail',
        title: 'Preserve a single durable home for finalized docs',
        preserve: 'Codex, RoadBook, or index clearly holding long-term custody.',
        avoid: 'Letting the docs room remain the ambiguous resting place for finalized material.',
        recover: 'Move the result into the surface built for durable reference.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    custody: [
      {
        label: 'Docs custody',
        title: 'Docs holds explanation while the route language is still changing',
        current: 'The docs room owns active explanation and guide shaping while references are being aligned with the system.',
        sharedWith: 'RoadView and products stay in the loop so explanations remain attached to verification and the map.',
        transfersTo: 'Codex, RoadBook, or index takes custody once the explanation becomes durable canon.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open products', query: 'products' },
          { label: 'Open codex', query: 'doc codex' },
        ],
      },
      {
        label: 'Canon custody',
        title: 'Finalize docs into one durable reference surface',
        current: 'The room holds drafts and active route language until the long-term home is chosen.',
        sharedWith: 'RoadBook and index remain visible so publication and navigation options stay explicit.',
        transfersTo: 'Codex, RoadBook, or index becomes the resting place for finished reference material.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Canon receipt',
        title: 'RoadView confirms the explanation still matches the system',
        sends: 'Send the draft explanation with the route claims and product context that support it.',
        lands: 'Land the check beside RoadView and products before calling the docs durable.',
        confirms: 'The receipt is visible when the published explanation and verification lane still agree.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
        ],
      },
      {
        label: 'Reference receipt',
        title: 'Codex, RoadBook, or index confirms the final home for the docs',
        sends: 'Send the finalized guide only after its long-term reference surface is chosen.',
        lands: 'Land the material in the durable canon surface rather than leaving it parked in the room.',
        confirms: 'The handoff lands when readers can find the result from its intended reference home.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Docs cadence',
        title: 'Review the explanation every time the live system changes shape',
        review: 'Review docs when route language, product structure, or operator understanding changes.',
        pulse: 'Keep RoadView and products in the loop while explanation is still being rewritten.',
        reset: 'Reset by checking the map and verification lane before shipping another doc change.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Reference cadence',
        title: 'Re-check the durable home after docs becomes canon',
        review: 'Review codex, RoadBook, or index immediately after final material moves out of the room.',
        pulse: 'Keep the chosen reference surface and docs aligned until readers are clearly landing in one place.',
        reset: 'Reset by moving the result again if it still behaves like a draft scattered across surfaces.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Explanation fallback',
        title: 'Fall back to verification when docs drifts away from the system',
        breaks: 'The written explanation no longer matches live routes, products, or operator understanding.',
        fallback: 'Return to docs plus RoadView and products until the explanation matches the current map again.',
        resume: 'Resume publishing only after the explanation can be cross-checked cleanly against the live shape.',
        actions: [
          { label: 'Open Docs', query: 'site docs.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Reference fallback',
        title: 'Re-home canon when the first durable surface is not durable enough',
        breaks: 'Codex, RoadBook, or index still leaves readers hunting across multiple places for the same result.',
        fallback: 'Move the material to the reference surface whose role best matches guide, publication, or navigation.',
        resume: 'Resume canon promotion after one reference home becomes the obvious landing point.',
        actions: [
          { label: 'Open codex', query: 'doc codex' },
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Knowledge refresh',
        title: 'Documentation currency ritual',
        practice: 'Audit and refresh documentation against current reality',
        frequency: 'Weekly',
        purpose: 'Keep docs current and operators finding what they need',
        actions: [
          { label: 'Open docs', query: 'docs' },
          { label: 'Open search', query: 'search' },
        ],
      },
    ],
    primers: [
      {
        label: 'Documentation prep',
        title: 'Get the docs surface ready',
        start: 'Open docs and refresh the knowledge base.',
        gather: 'Sync with search and knowledge surfaces.',
        ready: 'Confirm all references are up to date.',
        actions: [
          { label: 'Open docs', query: 'docs' },
          { label: 'Check search', query: 'search' },
        ],
      },
    ],
    board: {
      title: 'Documentation board',
      note: 'Keep explanation, verification, and navigation in one route set.',
      columns: [
        { title: 'Now', note: 'Primary references', items: [
          { title: 'Open Docs', subtitle: 'Explanation layer', query: 'site docs.blackroad.io' },
          { title: 'Open codex', subtitle: 'Core guide', query: 'doc codex' },
        ]},
        { title: 'Nearby', note: 'Verification ring', items: [
          { title: 'Open RoadView', subtitle: 'Verification layer', query: 'open roadview' },
          { title: 'Open RoadBook', subtitle: 'Publishing layer', query: 'open roadbook' },
        ]},
        { title: 'Escalate', note: 'Route broader context', items: [
          { title: 'Open products', subtitle: 'Product map', query: 'products' },
          { title: 'Open index', subtitle: 'Institutional map', query: 'index' },
        ]},
      ],
    },
  },
  'status-blackroad-io': {
    description: 'Status workspace centers on operational health, incidents, fleet visibility, and product/runtime checkpoints.',
    systems: ['status', 'sites'],
    docs: ['fleet-status', 'memory'],
    agents: ['octavia', 'olympia', 'alice'],
    routes: ['roados', 'roadtrip', 'roadcode', 'roadwork', 'roadview'],
    briefs: [
      { label: 'Mission', title: 'Hold the health line', copy: 'Use this room to keep runtime, fleet, and product health in one operational surface.', query: 'site status.blackroad.io' },
      { label: 'Watch', title: 'Monitor the fleet edge', copy: 'Keep Olympia and Alice adjacent when incidents reach the network and node layer.', query: 'agent olympia' },
      { label: 'Escalate', title: 'Push issues to roads', copy: 'Move from abstract status into the specific road that owns the failing surface.', query: 'open roados' },
    ],
    runbooks: [
      {
        label: 'Watch play',
        title: 'Reduce alerts into one active status narrative',
        copy: 'Start with the live status lane, then pull in the closest operator and ownership surfaces without opening parallel clutter.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open fleet doc', query: 'doc fleet-status' },
          { label: 'Open Olympia', query: 'agent olympia' },
        ],
      },
      {
        label: 'Response play',
        title: 'Carry an incident from watch to owner',
        copy: 'Keep the operator thread visible while routing the failure into the road that can actually resolve it.',
        actions: [
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Watch protocol',
        title: 'Hold one clear incident lane',
        stages: [
          { label: 'Prime', value: 'Open status and the fleet reference first.' },
          { label: 'Hold', value: 'Keep the nearest operator in view.' },
          { label: 'Route', value: 'Push the issue into its owning road.' },
        ],
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open fleet doc', query: 'doc fleet-status' },
          { label: 'Open RoadOS', query: 'open roados' },
        ],
      },
      {
        label: 'Owner protocol',
        title: 'Convert a watch signal into assigned follow-through',
        stages: [
          { label: 'Prime', value: 'Confirm the current signal and boundary.' },
          { label: 'Hold', value: 'Keep operator and topology context attached.' },
          { label: 'Route', value: 'Escalate into implementation or runtime.' },
        ],
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Incident tripwire',
        title: 'Signals are rising faster than ownership clarity',
        signal: 'Alerts are active, but the responsible road is still ambiguous.',
        trigger: 'The room keeps inspecting health without moving the issue to an owner.',
        response: 'Assign the signal to runtime or implementation immediately.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Edge tripwire',
        title: 'Fleet context is required to explain the incident',
        signal: 'The issue is reaching the network edge instead of staying inside one road.',
        trigger: 'Operator or topology context becomes necessary to explain the signal.',
        response: 'Bring Olympia, Alice, and the site graph into the same lane.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Owner decision',
        title: 'Choose the road that owns the incident',
        decision: 'Route to RoadOS when the signal is runtime-native; route to RoadCode when implementation must change.',
        condition: 'Make this choice as soon as the signal is stable enough to assign.',
        rationale: 'Status should shorten time to ownership, not prolong observation.',
        actions: [
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open Status', query: 'site status.blackroad.io' },
        ],
      },
      {
        label: 'Edge decision',
        title: 'Choose whether the incident needs fleet context',
        decision: 'Bring Olympia, Alice, and the site graph in only when the issue crosses beyond one road.',
        condition: 'Make this choice when the signal starts depending on network or edge behavior.',
        rationale: 'Fleet context is expensive; it should appear for true edge problems, not every alert.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Incident checkpoint',
        title: 'The signal has a real owner',
        objective: 'Move from observation to responsibility as quickly as possible.',
        proof: 'RoadOS or RoadCode clearly owns the next response move.',
        exit: 'Leave the watch lane once the owner is visible.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Edge checkpoint',
        title: 'Fleet context is justified',
        objective: 'Only widen into topology and fleet surfaces when the signal truly crosses one road.',
        proof: 'Olympia, Alice, and sites are all needed to explain the incident.',
        exit: 'Escalate into the edge lane once that cross-road dependency is clear.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Incident dependency',
        title: 'Status depends on fast ownership assignment',
        reliesOn: 'RoadOS or RoadCode taking custody as soon as the signal stabilizes.',
        watch: 'The watch lane remaining observational after the issue is assignable.',
        unlocks: 'A tighter move from status awareness into actual response.',
        actions: [
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open Status', query: 'site status.blackroad.io' },
        ],
      },
      {
        label: 'Edge dependency',
        title: 'Fleet escalation depends on real cross-road evidence',
        reliesOn: 'Olympia, Alice, and sites only joining when the issue truly crosses one road.',
        watch: 'Pulling topology into incidents that are still local to one owner.',
        unlocks: 'Sharper fleet response when edge context is genuinely needed.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Incident guardrail',
        title: 'Preserve fast movement from signal to owner',
        preserve: 'Status as a short watch lane that quickly resolves into runtime or implementation custody.',
        avoid: 'Observing the incident long after the owner is obvious.',
        recover: 'Assign the issue to RoadOS or RoadCode and reopen the owning lane immediately.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Edge guardrail',
        title: 'Preserve topology escalation for true edge cases only',
        preserve: 'Fleet and site context entering only when the signal crosses one road boundary.',
        avoid: 'Pulling Alice or Olympia into incidents that remain local.',
        recover: 'Reduce the room back to the owning road unless edge evidence is real.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    custody: [
      {
        label: 'Watch custody',
        title: 'Status holds the signal only until an owner is clear',
        current: 'Status carries the active watch lane while the incident is being reduced into a concrete owner.',
        sharedWith: 'Olympia, Alice, and fleet references stay near the room when the issue touches the edge.',
        transfersTo: 'RoadOS or RoadCode takes custody as soon as the response owner is obvious.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open RoadOS', query: 'open roados' },
        ],
      },
      {
        label: 'Response custody',
        title: 'Escalate fleet context only when the incident crosses boundaries',
        current: 'The owning road remains primary even when fleet and site evidence enters the room.',
        sharedWith: 'Alice and sites stay in the loop only when topology materially changes the response.',
        transfersTo: 'The chosen road continues as the responder, with fleet context as support rather than a parallel owner.',
        actions: [
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Owner receipt',
        title: 'RoadOS or RoadCode confirms the incident has a real responder',
        sends: 'Send the signal, current impact, and likely owner as soon as the watch lane stabilizes.',
        lands: 'Land the incident in the owning road with Status still visible as the reporting source.',
        confirms: 'The receipt is complete when the response can continue from the owner room instead of the watch lane.',
        actions: [
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
          { label: 'Open Status', query: 'site status.blackroad.io' },
        ],
      },
      {
        label: 'Edge receipt',
        title: 'Fleet context confirms the incident truly crossed one road boundary',
        sends: 'Send edge evidence only when the issue materially touches fleet or network topology.',
        lands: 'Land Alice, Olympia, and sites as supporting proof around the incident rather than parallel control.',
        confirms: 'The receipt lands when topology context is present for real cross-road cases and absent for local ones.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Watch cadence',
        title: 'Review the watch lane as soon as an owner becomes likely',
        review: 'Review Status whenever the incident signal sharpens or the owning road changes.',
        pulse: 'Keep the current signal, owner guess, and fleet context tight while the issue is live.',
        reset: 'Reset by reducing the room back to one owner if watch and response start splitting apart.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Edge cadence',
        title: 'Re-check fleet context only as fast as the incident crosses boundaries',
        review: 'Review Alice, Olympia, and sites only when cross-road evidence actually changes.',
        pulse: 'Keep edge operators adjacent during real boundary issues, not as a permanent watch habit.',
        reset: 'Reset by dropping fleet context if the incident collapses back to one local owner.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Incident fallback',
        title: 'Pull the issue back to Status when ownership changes faster than response',
        breaks: 'RoadOS, RoadCode, and edge operators all move at once without one responder holding the incident.',
        fallback: 'Reduce the situation back to Status plus the most likely owner until the response path is explicit.',
        resume: 'Resume escalation after one road clearly owns the incident and the others become support.',
        actions: [
          { label: 'Open Status', query: 'site status.blackroad.io' },
          { label: 'Open RoadOS', query: 'open roados' },
          { label: 'Open RoadCode', query: 'open roadcode' },
        ],
      },
      {
        label: 'Edge fallback',
        title: 'Drop fleet context when the incident turns out to be local',
        breaks: 'Alice, Olympia, and site evidence add noise without changing the owning road.',
        fallback: 'Strip the room back to the local responder and the core incident surface.',
        resume: 'Resume edge escalation only if fresh evidence shows the failure crossing boundaries again.',
        actions: [
          { label: 'Open Olympia', query: 'agent olympia' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Health check',
        title: 'System status review ritual',
        practice: 'Review metrics, alerts, and system health dashboards',
        frequency: 'Daily',
        purpose: 'Catch problems early and keep operations running smoothly',
        actions: [
          { label: 'Open status', query: 'status' },
          { label: 'Check live', query: 'live' },
        ],
      },
    ],
    primers: [
      {
        label: 'Status prep',
        title: 'Prepare the real-time status surface',
        start: 'Open status and load the health dashboard.',
        gather: 'Sync metrics, alerts, and live signals.',
        ready: 'Confirm all systems are reporting.',
        actions: [
          { label: 'Open status', query: 'status' },
          { label: 'Check live', query: 'live' },
        ],
      },
    ],
    board: {
      title: 'Incident board',
      note: 'Track health, hold the edge, and push issues into the owning road.',
      columns: [
        { title: 'Now', note: 'Check health', items: [
          { title: 'Open Status', subtitle: 'Incident layer', query: 'site status.blackroad.io' },
          { title: 'Open fleet status doc', subtitle: 'Fleet reference', query: 'doc fleet-status' },
        ]},
        { title: 'Nearby', note: 'Keep operators close', items: [
          { title: 'Open Olympia', subtitle: 'Fleet testing', query: 'agent olympia' },
          { title: 'Open Alice', subtitle: 'Network manager', query: 'agent alice' },
        ]},
        { title: 'Escalate', note: 'Push to owners', items: [
          { title: 'Open RoadOS', subtitle: 'Runtime owner', query: 'open roados' },
          { title: 'Open RoadCode', subtitle: 'Implementation owner', query: 'open roadcode' },
        ]},
      ],
    },
  },
  'agents-blackroad-io': {
    description: 'Agents workspace centers on the Roadie roster, public demos, operator context, and collaboration surfaces.',
    systems: ['agents', 'collab', 'live'],
    docs: ['agent-entry', 'collab'],
    agents: ['roadie', 'lucidia', 'cecilia', 'valeria'],
    routes: ['roadtrip', 'carpool'],
    surfaces: ['roadtrip-agent'],
    briefs: [
      { label: 'Mission', title: 'Keep the roster coherent', copy: 'Use this room to frame operators as one system instead of isolated personas.', query: 'site agents.blackroad.io' },
      { label: 'Watch', title: 'Preserve collaboration state', copy: 'Keep collab and live surfaces nearby so demos remain attached to execution context.', query: 'collab' },
      { label: 'Escalate', title: 'Open the flagship room', copy: 'Push into RoadTrip when the roster needs to become a live operating team.', query: 'open roadtrip' },
    ],
    runbooks: [
      {
        label: 'Operator play',
        title: 'Shift from agent inventory to an active crew',
        copy: 'Use the roster room to identify who is needed now, which surfaces they need, and where the team should gather.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
        ],
      },
      {
        label: 'Coordination play',
        title: 'Promote helpers into one coordinated response',
        copy: 'When individual agents stop being enough, route the crew into the flagship room or shared delivery space.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Roster protocol',
        title: 'Turn the public roster into an active crew lane',
        stages: [
          { label: 'Prime', value: 'Open the roster and anchor the current operators.' },
          { label: 'Hold', value: 'Keep collaboration and demos adjacent.' },
          { label: 'Route', value: 'Promote the right crew into the flagship room.' },
        ],
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
        ],
      },
      {
        label: 'Coordination protocol',
        title: 'Keep helpers legible while the room changes shape',
        stages: [
          { label: 'Prime', value: 'Start from the named operator set.' },
          { label: 'Hold', value: 'Preserve demo and collaboration context.' },
          { label: 'Route', value: 'Move into shared delivery when needed.' },
        ],
        actions: [
          { label: 'Open agent entry', query: 'doc agent-entry' },
          { label: 'Open live', query: 'live' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Roster tripwire',
        title: 'The named operator set is no longer enough',
        signal: 'The current helpers are clear, but the room still cannot carry the work.',
        trigger: 'You need shared delivery or a flagship room to keep coherence.',
        response: 'Promote the roster into RoadTrip or CarPool instead of adding more isolated helpers.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
      {
        label: 'Demo tripwire',
        title: 'The demo surface is drifting away from execution context',
        signal: 'Live demos are active, but the collaboration state is fading from view.',
        trigger: 'The roster room starts behaving like a gallery instead of an operator lane.',
        response: 'Reattach collab and live before continuing the demo.',
        actions: [
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Crew decision',
        title: 'Choose whether the roster remains a catalog or becomes an operating team',
        decision: 'Promote into RoadTrip when the named agents need one shared room, not separate demos.',
        condition: 'Make this choice when the roster is no longer just descriptive and the next step is coordinated work.',
        rationale: 'Operator surfaces become more useful when they resolve into one active crew lane.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
      {
        label: 'Delivery decision',
        title: 'Choose whether the crew needs shared delivery custody',
        decision: 'Use CarPool once the active crew must hold ongoing work together beyond the roster room.',
        condition: 'Make this choice when coordination needs persistent delivery context instead of just roster context.',
        rationale: 'The roster room identifies operators; CarPool carries shared delivery.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Crew checkpoint',
        title: 'The roster has become an operating team',
        objective: 'Turn named operators into one active room when the work needs it.',
        proof: 'RoadTrip or collab now carries more truth than the roster alone.',
        exit: 'Leave the catalog posture only after the team lane is explicit.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
      {
        label: 'Delivery checkpoint',
        title: 'Shared delivery truly needs custody',
        objective: 'Escalate from roster context into persistent delivery only when required.',
        proof: 'CarPool is now the right place to keep the crew aligned over time.',
        exit: 'Route onward once the roster room is no longer the primary operating surface.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Crew dependency',
        title: 'Agents depends on one room becoming the operator center',
        reliesOn: 'RoadTrip or collab taking over once the roster becomes active work.',
        watch: 'The roster remaining a catalog while coordination is already underway.',
        unlocks: 'A more coherent transition from named helpers into a working crew.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
        ],
      },
      {
        label: 'Delivery dependency',
        title: 'Shared operator work depends on delivery custody',
        reliesOn: 'CarPool becoming the downstream room when the crew needs persistent work context.',
        watch: 'The roster room carrying ongoing delivery by itself.',
        unlocks: 'Clearer separation between operator identity and delivery execution.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Crew guardrail',
        title: 'Preserve the distinction between roster and operating room',
        preserve: 'Agents as a roster until RoadTrip or collab truly becomes the active team lane.',
        avoid: 'Using the roster itself as a substitute for coordinated work.',
        recover: 'Promote the current helpers into one shared room once execution begins.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
        ],
      },
      {
        label: 'Delivery guardrail',
        title: 'Preserve delivery custody outside the roster room',
        preserve: 'CarPool holding persistent delivery context once the crew is active.',
        avoid: 'Leaving long-running execution inside the roster surface.',
        recover: 'Push the work into the delivery room and keep the roster as operator context.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    custody: [
      {
        label: 'Roster custody',
        title: 'Agents holds operator identity before the crew becomes active',
        current: 'The Agents room owns roster and operator-selection context while the team is still being assembled.',
        sharedWith: 'Collab and live stay visible as supporting surfaces for demos and coordination.',
        transfersTo: 'RoadTrip or CarPool takes custody once the roster becomes a working crew.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open RoadTrip', query: 'open roadtrip' },
        ],
      },
      {
        label: 'Delivery custody',
        title: 'Keep execution ownership outside the roster surface',
        current: 'The roster room stays the directory and briefing lane even while a crew is active.',
        sharedWith: 'Agent canon and live demos remain attached so the team stays legible during the promotion.',
        transfersTo: 'CarPool becomes the durable room for ongoing shared delivery.',
        actions: [
          { label: 'Open agent entry', query: 'doc agent-entry' },
          { label: 'Open live', query: 'live' },
          { label: 'Open CarPool', query: 'open carpool' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Crew receipt',
        title: 'RoadTrip confirms the selected operators became an active room',
        sends: 'Send the named helpers, shared objective, and required surfaces out of the roster view.',
        lands: 'Land the crew in RoadTrip with collab and live still visible as coordination support.',
        confirms: 'The handoff lands when the operators now appear as one active room instead of a list.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
        ],
      },
      {
        label: 'Delivery receipt',
        title: 'CarPool confirms the crew has a durable work room',
        sends: 'Send the active crew and shared delivery context only when the work needs to persist beyond briefing.',
        lands: 'Land the ongoing effort in CarPool while Agents remains the directory and context layer.',
        confirms: 'The receipt is visible when long-running execution has moved out of the roster room.',
        actions: [
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Roster cadence',
        title: 'Review the roster whenever operator needs change',
        review: 'Review Agents when the crew composition or required surfaces change.',
        pulse: 'Keep collab and live near the roster while the team is still moving from names to action.',
        reset: 'Reset by returning to the roster when the active room loses clarity about who is actually involved.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open live', query: 'live' },
        ],
      },
      {
        label: 'Crew-room cadence',
        title: 'Re-check the promoted crew immediately after it leaves the roster',
        review: 'Review RoadTrip or CarPool as soon as the selected operators become a working room.',
        pulse: 'Keep the source roster legible until the active room can carry the work on its own.',
        reset: 'Reset by demoting back to roster selection if the promoted room no longer has a clear task.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Roster fallback',
        title: 'Return to Agents when the active room loses who is actually involved',
        breaks: 'RoadTrip or CarPool is active, but the selected operators and needed surfaces are no longer clear.',
        fallback: 'Step back to the roster view and rebuild the crew deliberately from operator context.',
        resume: 'Resume promotion only after the room has a named crew, objective, and supporting surfaces again.',
        actions: [
          { label: 'Open Agents', query: 'site agents.blackroad.io' },
          { label: 'Open collab', query: 'collab' },
          { label: 'Open agent entry', query: 'doc agent-entry' },
        ],
      },
      {
        label: 'Crew fallback',
        title: 'Demote an active crew when delivery still belongs in a single lane',
        breaks: 'The promoted room keeps behaving like a briefing lane instead of a working crew.',
        fallback: 'Move the work back into the owning room and use Agents only for identity and selection.',
        resume: 'Resume crew promotion after the task has enough shared execution to justify a separate room.',
        actions: [
          { label: 'Open RoadTrip', query: 'open roadtrip' },
          { label: 'Open CarPool', query: 'open carpool' },
          { label: 'Open live', query: 'live' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Operator sync',
        title: 'Agent team alignment',
        practice: 'Review operator availability, capacity, and assignments',
        frequency: 'Daily',
        purpose: 'Know who is available and where resources should go',
        actions: [
          { label: 'Open agents', query: 'agents' },
          { label: 'Check live', query: 'live' },
        ],
      },
    ],
    primers: [
      {
        label: 'Agent prep',
        title: 'Ready the agent roster',
        start: 'Open agents and load the current team.',
        gather: 'Sync agent status and availability.',
        ready: 'Confirm all operators are present.',
        actions: [
          { label: 'Open agents', query: 'agents' },
          { label: 'Check live', query: 'live' },
        ],
      },
    ],
    board: {
      title: 'Roster board',
      note: 'Keep demos, collaboration, and escalation to the main room tightly coupled.',
      columns: [
        { title: 'Now', note: 'Hold the roster', items: [
          { title: 'Open Agents', subtitle: 'Roster surface', query: 'site agents.blackroad.io' },
          { title: 'Open agent entry', subtitle: 'Agent canon', query: 'doc agent-entry' },
        ]},
        { title: 'Nearby', note: 'Maintain state', items: [
          { title: 'Open collab', subtitle: 'Shared operator room', query: 'collab' },
          { title: 'Open live', subtitle: 'Demos and broadcast', query: 'live' },
        ]},
        { title: 'Escalate', note: 'Promote to flagship room', items: [
          { title: 'Open RoadTrip', subtitle: 'Executive agent room', query: 'open roadtrip' },
          { title: 'Open CarPool', subtitle: 'Shared delivery room', query: 'open carpool' },
        ]},
      ],
    },
  },
  'search-blackroad-io': {
    description: 'Search workspace centers on verified discovery, canon references, archives, and RoadView-adjacent routes.',
    systems: ['docs', 'archive', 'index'],
    docs: ['blackroad index', 'codex'],
    agents: ['alexandria', 'sophia'],
    routes: ['roadview', 'roadbook', 'roadchain'],
    surfaces: ['ia-prelinger-1'],
    briefs: [
      { label: 'Mission', title: 'Keep discovery grounded', copy: 'Use search as the entry point, but never lose the canon and archive context around it.', query: 'site search.blackroad.io' },
      { label: 'Watch', title: 'Trace the source trail', copy: 'Lean on RoadChain and RoadBook when a result needs proof, publication, or memory.', query: 'open roadchain' },
      { label: 'Escalate', title: 'Move into RoadView', copy: 'Open the full verification layer once search has found the likely path.', query: 'open roadview' },
    ],
    runbooks: [
      {
        label: 'Discovery play',
        title: 'Translate vague intent into the next exact surface',
        copy: 'Search should collapse uncertainty quickly into a route, doc, site, or operator without losing canon context.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open index', query: 'index' },
        ],
      },
      {
        label: 'Routing play',
        title: 'Use results to redirect the operating room',
        copy: 'Once the right surface appears, move into trust or publication instead of keeping discovery as a detached layer.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Discovery protocol',
        title: 'Collapse vague intent into an exact route',
        stages: [
          { label: 'Prime', value: 'Search from the strongest current clue.' },
          { label: 'Hold', value: 'Keep canon and index context visible.' },
          { label: 'Route', value: 'Hand off into trust or publication.' },
        ],
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open RoadView', query: 'open roadview' },
        ],
      },
      {
        label: 'Trust protocol',
        title: 'Convert results into a proof-backed destination',
        stages: [
          { label: 'Prime', value: 'Isolate the best candidate surface.' },
          { label: 'Hold', value: 'Reconfirm it against provenance and canon.' },
          { label: 'Route', value: 'Push the verified result into publication.' },
        ],
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Search tripwire',
        title: 'Discovery is producing options but not a destination',
        signal: 'The room is finding candidates without converging on the next exact surface.',
        trigger: 'Results keep widening instead of narrowing the move.',
        response: 'Pull the best candidate into RoadView or docs and force a trust pass.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Proof tripwire',
        title: 'A likely result still lacks canon support',
        signal: 'A destination looks right, but the supporting references are weak.',
        trigger: 'Publication is being discussed before provenance is stable.',
        response: 'Reconnect the result to RoadChain, index, and RoadBook.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Discovery decision',
        title: 'Choose whether the room needs search or verification next',
        decision: 'Stay in Search while candidates are still broad; switch to RoadView once one likely route emerges.',
        condition: 'Make this choice when the room is oscillating between finding options and validating them.',
        rationale: 'Discovery and verification are adjacent, but they should not blur into one lane.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Publication decision',
        title: 'Choose where a verified result should persist',
        decision: 'Use RoadBook for a durable outward route and index for map-level continuity once trust is established.',
        condition: 'Make this choice when the best candidate has survived a trust pass.',
        rationale: 'A verified result should land in the surface that best matches its persistence role.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Discovery checkpoint',
        title: 'The room has narrowed to one likely route',
        objective: 'Use Search to reduce uncertainty before forcing a trust pass.',
        proof: 'RoadView or docs now clearly looks like the right next lane.',
        exit: 'Leave broad discovery once one candidate dominates the move.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Persistence checkpoint',
        title: 'The verified result has a durable home',
        objective: 'Route the result into the surface that will hold it beyond the search pass.',
        proof: 'RoadBook, index, or RoadChain is clearly carrying the next state.',
        exit: 'Leave Search once persistence custody is obvious.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Discovery dependency',
        title: 'Search depends on RoadView or docs taking the next narrowing pass',
        reliesOn: 'A likely route being strong enough to justify leaving broad discovery.',
        watch: 'Search continuing to fan out results after one candidate is already leading.',
        unlocks: 'A cleaner move from search to trust or persistence.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open Search', query: 'site search.blackroad.io' },
        ],
      },
      {
        label: 'Persistence dependency',
        title: 'Verified search results need one downstream keeper',
        reliesOn: 'RoadBook, index, or RoadChain clearly taking custody of the result.',
        watch: 'Search remaining the place where a verified answer continues to live.',
        unlocks: 'Durable continuity after the discovery pass ends.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Discovery guardrail',
        title: 'Preserve Search as a narrowing lane, not a resting place',
        preserve: 'Search reducing uncertainty until RoadView or docs can take the next pass.',
        avoid: 'Keeping likely answers in Search after a stronger route has emerged.',
        recover: 'Move the best candidate into the verification or reference lane immediately.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
      {
        label: 'Persistence guardrail',
        title: 'Preserve a durable downstream home for verified results',
        preserve: 'RoadBook, index, or RoadChain taking custody once the answer stabilizes.',
        avoid: 'Allowing Search to become a permanent container for resolved knowledge.',
        recover: 'Route the answer into the persistence surface that matches its role.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    custody: [
      {
        label: 'Search custody',
        title: 'Search holds uncertainty only until a stronger lane appears',
        current: 'Search owns the broad discovery pass while the shell is still narrowing toward the right route or reference.',
        sharedWith: 'Docs, archive, and RoadChain stay near the room so discovery remains grounded in canon and proof.',
        transfersTo: 'RoadView, docs, or RoadBook takes custody once the likely answer is strong enough.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open RoadView', query: 'open roadview' },
        ],
      },
      {
        label: 'Persistence custody',
        title: 'Move resolved answers into a durable keeper',
        current: 'The room stays with Search only while the result is still being verified or redirected.',
        sharedWith: 'RoadChain and index remain visible so truth and navigation survive the transfer.',
        transfersTo: 'RoadBook, index, or RoadChain becomes the long-term owner for the verified result.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadBook', query: 'open roadbook' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Narrowing receipt',
        title: 'RoadView or docs confirms search has found the right next lane',
        sends: 'Send the strongest candidate, the relevant references, and the current source trail out of Search.',
        lands: 'Land the next pass in RoadView or docs instead of continuing to fan out inside Search.',
        confirms: 'The receipt lands when discovery has clearly narrowed into one stronger room.',
        actions: [
          { label: 'Open RoadView', query: 'open roadview' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open Search', query: 'site search.blackroad.io' },
        ],
      },
      {
        label: 'Persistence receipt',
        title: 'RoadBook, index, or RoadChain confirms the answer has a keeper',
        sends: 'Send the verified result only after the long-term role of the answer is clear.',
        lands: 'Land the answer in the persistence surface that matches publication, navigation, or proof.',
        confirms: 'The transfer is complete when Search is no longer carrying resolved knowledge.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Discovery cadence',
        title: 'Review Search whenever one candidate starts winning',
        review: 'Review the room as soon as docs or RoadView becomes the likely next lane.',
        pulse: 'Keep docs, archive, and Search in a quick loop while uncertainty is still collapsing.',
        reset: 'Reset by broadening only once if the leading candidate breaks under verification.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
      {
        label: 'Answer cadence',
        title: 'Re-check the keeper after the answer leaves discovery',
        review: 'Review RoadBook, index, or RoadChain immediately after the verified answer is handed off.',
        pulse: 'Keep the source query and persistence surface aligned until the answer becomes easy to re-find.',
        reset: 'Reset by moving the answer again if Search still feels like the only place it can be recovered.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Search fallback',
        title: 'Re-open broad discovery when the leading candidate collapses',
        breaks: 'RoadView or docs stops looking like the right next room after a closer read.',
        fallback: 'Return to Search with canon and archive still attached so the room can widen once, cleanly.',
        resume: 'Resume narrowing only after a replacement candidate clearly outranks the rest.',
        actions: [
          { label: 'Open Search', query: 'site search.blackroad.io' },
          { label: 'Open docs', query: 'docs' },
          { label: 'Open archive', query: 'archive' },
        ],
      },
      {
        label: 'Answer fallback',
        title: 'Pull a resolved answer back out of persistence when it still cannot be recovered cleanly',
        breaks: 'RoadBook, index, or RoadChain holds the answer, but users still need Search to find it again.',
        fallback: 'Return to the discovery lane, fix the route, then republish to the keeper that fits the answer best.',
        resume: 'Resume persistence after the answer is both trustworthy and easy to re-find from its final home.',
        actions: [
          { label: 'Open RoadBook', query: 'open roadbook' },
          { label: 'Open index', query: 'index' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Index refresh',
        title: 'Search quality ritual',
        practice: 'Refresh search indexes and verify operators can find what they need',
        frequency: 'Weekly',
        purpose: 'Keep search responsive and accurate for knowledge discovery',
        actions: [
          { label: 'Open search', query: 'search' },
          { label: 'Open docs', query: 'docs' },
        ],
      },
    ],
    primers: [
      {
        label: 'Search prep',
        title: 'Prime the knowledge search',
        start: 'Open search and refresh indexes.',
        gather: 'Sync with docs and knowledge surfaces.',
        ready: 'Confirm search is current and responsive.',
        actions: [
          { label: 'Open search', query: 'search' },
          { label: 'Check docs', query: 'docs' },
        ],
      },
    ],
    board: {
      title: 'Search board',
      note: 'Move from search to trust to publication without leaving the shell.',
      columns: [
        { title: 'Now', note: 'Start discovery', items: [
          { title: 'Open Search', subtitle: 'Entry surface', query: 'site search.blackroad.io' },
          { title: 'Open docs', subtitle: 'Reference layer', query: 'docs' },
        ]},
        { title: 'Nearby', note: 'Keep proof close', items: [
          { title: 'Open RoadChain', subtitle: 'Trust and provenance', query: 'open roadchain' },
          { title: 'Open archive', subtitle: 'Saved sources', query: 'archive' },
        ]},
        { title: 'Escalate', note: 'Switch to full verification', items: [
          { title: 'Open RoadView', subtitle: 'Search and verification', query: 'open roadview' },
          { title: 'Open RoadBook', subtitle: 'Publish verified result', query: 'open roadbook' },
        ]},
      ],
    },
  },
  'atlas-blackroad-io': {
    description: 'Atlas workspace centers on ecosystem topology: products, domains, agents, fleet, and network surfaces.',
    systems: ['sites', 'products', 'agents'],
    docs: ['blackroad index', 'memory'],
    agents: ['lucidia', 'alice'],
    routes: ['roadworld', 'highway', 'roadchain'],
    briefs: [
      { label: 'Mission', title: 'Map the whole territory', copy: 'Use Atlas to keep products, domains, and agents legible as one operating graph.', query: 'site atlas.blackroad.io' },
      { label: 'Watch', title: 'Track network shape', copy: 'Keep RoadChain and Alice close when topology crosses into proof or edge routing.', query: 'sites' },
      { label: 'Escalate', title: 'Pivot into the world layer', copy: 'Open RoadWorld or HighWay when the map needs to become a concrete environment or route.', query: 'open roadworld' },
    ],
    runbooks: [
      {
        label: 'Map play',
        title: 'Rebuild network context before making route decisions',
        copy: 'Atlas works best as the room where products, sites, and operators are reassembled into one readable map.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Topology play',
        title: 'Convert adjacency into a concrete next move',
        copy: 'Use nearby edges and proof surfaces to decide where the shell should move the team next.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
        ],
      },
    ],
    protocols: [
      {
        label: 'Topology protocol',
        title: 'Read the map before moving the room',
        stages: [
          { label: 'Prime', value: 'Open Atlas and the domain graph.' },
          { label: 'Hold', value: 'Keep proof and operators attached.' },
          { label: 'Route', value: 'Pivot into the concrete environment that owns the next move.' },
        ],
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open RoadWorld', query: 'open roadworld' },
        ],
      },
      {
        label: 'Adjacency protocol',
        title: 'Use network neighbors to pick the next exact surface',
        stages: [
          { label: 'Prime', value: 'Start from the nearest road or domain.' },
          { label: 'Hold', value: 'Keep Alice and proof nearby.' },
          { label: 'Route', value: 'Move the team into the chosen edge.' },
        ],
        actions: [
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open HighWay', query: 'open highway' },
        ],
      },
    ],
    tripwires: [
      {
        label: 'Map tripwire',
        title: 'The room is moving without a shared topology view',
        signal: 'Products and sites are being discussed, but the graph is no longer visible.',
        trigger: 'The next move depends on adjacency, ownership, or network shape.',
        response: 'Re-open Atlas and the site graph before routing further.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Edge tripwire',
        title: 'Proof and operator context are required to move the map',
        signal: 'The next route depends on network proof or edge ownership.',
        trigger: 'Alice or RoadChain becomes necessary to justify the move.',
        response: 'Keep proof and the nearest operator adjacent while pivoting.',
        actions: [
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open RoadWorld', query: 'open roadworld' },
        ],
      },
    ],
    decisions: [
      {
        label: 'Topology decision',
        title: 'Choose whether the room needs map context before moving',
        decision: 'Re-open Atlas whenever the next move depends on adjacency, ownership, or domain structure.',
        condition: 'Make this choice when road and site discussions stop sharing one visible graph.',
        rationale: 'Topology should lead when the room is routing through the network itself.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Edge decision',
        title: 'Choose the concrete environment that should receive the next move',
        decision: 'Pivot to RoadWorld for environment context and HighWay for route context, but choose one lead edge.',
        condition: 'Make this choice once proof and operator context have narrowed the likely path.',
        rationale: 'Atlas should resolve into one environment owner instead of remaining a permanent holding room.',
        actions: [
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    checkpoints: [
      {
        label: 'Topology checkpoint',
        title: 'The graph is visible enough to route the room',
        objective: 'Keep adjacency, ownership, and domain shape legible before choosing an edge.',
        proof: 'Atlas, sites, and products can explain the next move without guesswork.',
        exit: 'Only pivot into a concrete environment after the map is stable.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Edge checkpoint',
        title: 'A concrete environment has taken custody',
        objective: 'Resolve the map room into the environment that owns the next action.',
        proof: 'RoadWorld or HighWay clearly becomes the lead route after the map pass.',
        exit: 'Leave Atlas once that environment owner is explicit.',
        actions: [
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    dependencies: [
      {
        label: 'Map dependency',
        title: 'Atlas depends on the graph staying visible while routing',
        reliesOn: 'Sites and products continuing to explain ownership and adjacency in one view.',
        watch: 'Choosing an environment before the network shape is legible.',
        unlocks: 'A more confident pivot into RoadWorld or HighWay.',
        actions: [
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
        ],
      },
      {
        label: 'Edge dependency',
        title: 'Environment routing depends on proof and operator context',
        reliesOn: 'RoadChain and Alice remaining adjacent when the edge route is chosen.',
        watch: 'Pivoting into a world or route layer without enough network proof.',
        unlocks: 'A more stable handoff from topology into concrete environments.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open RoadWorld', query: 'open roadworld' },
        ],
      },
    ],
    guardrails: [
      {
        label: 'Map guardrail',
        title: 'Preserve the graph while the room is still routing',
        preserve: 'Atlas, sites, and products staying visible until adjacency and ownership are clear.',
        avoid: 'Pivoting into a world or route layer before the topology pass is complete.',
        recover: 'Re-open the graph and re-establish the dependency map before moving onward.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Edge guardrail',
        title: 'Preserve proof beside the chosen environment',
        preserve: 'RoadChain and Alice remaining adjacent when the edge route is selected.',
        avoid: 'Choosing RoadWorld or HighWay without enough network proof.',
        recover: 'Bring proof and operator context back before finalizing the pivot.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open HighWay', query: 'open highway' },
        ],
      },
    ],
    custody: [
      {
        label: 'Topology custody',
        title: 'Atlas holds the graph while adjacency is still being read',
        current: 'Atlas owns the mapping pass while products, sites, and agents are being recomposed into one route picture.',
        sharedWith: 'Sites and products stay in the loop so the graph remains visible during route selection.',
        transfersTo: 'RoadWorld or HighWay takes custody once the chosen environment or route is explicit.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open RoadWorld', query: 'open roadworld' },
        ],
      },
      {
        label: 'Edge custody',
        title: 'Transfer environment routing with proof still attached',
        current: 'The room stays with Atlas until the selected environment has enough operator and proof context beside it.',
        sharedWith: 'RoadChain and Alice remain visible whenever the edge route becomes the next move.',
        transfersTo: 'HighWay or RoadWorld becomes the concrete owner for the next environment step.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open HighWay', query: 'open highway' },
        ],
      },
    ],
    receipts: [
      {
        label: 'Route receipt',
        title: 'RoadWorld or HighWay confirms the graph turned into a concrete move',
        sends: 'Send the chosen environment or route together with the adjacency that justified it.',
        lands: 'Land the pivot in RoadWorld or HighWay while Atlas remains the visible source map.',
        confirms: 'The receipt is visible when the next environment step can be understood without rebuilding the graph first.',
        actions: [
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
        ],
      },
      {
        label: 'Proof receipt',
        title: 'RoadChain and Alice confirm the edge route still carries proof',
        sends: 'Send the route decision with the operator and topology evidence that makes it trustworthy.',
        lands: 'Land the environment handoff beside RoadChain and Alice when the edge path matters.',
        confirms: 'The handoff lands when the chosen route can still be traced back through proof and operator context.',
        actions: [
          { label: 'Open RoadChain', query: 'open roadchain' },
          { label: 'Open Alice', query: 'agent alice' },
          { label: 'Open sites', query: 'sites' },
        ],
      },
    ],
    cadence: [
      {
        label: 'Map cadence',
        title: 'Review Atlas whenever the chosen route changes the graph',
        review: 'Review the topology room each time a likely environment or route becomes dominant.',
        pulse: 'Keep sites, products, and Atlas visible while the graph is still being interpreted.',
        reset: 'Reset by reopening the map before committing if the route choice no longer matches the visible topology.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Environment cadence',
        title: 'Re-check the concrete route immediately after the map hands off',
        review: 'Review RoadWorld or HighWay once the environment move leaves Atlas.',
        pulse: 'Keep RoadChain and Alice adjacent until the chosen route stays trustworthy in motion.',
        reset: 'Reset by returning to Atlas if the environment step outruns the proof or operator context.',
        actions: [
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    fallbacks: [
      {
        label: 'Topology fallback',
        title: 'Return to Atlas when the chosen environment stops matching the visible graph',
        breaks: 'RoadWorld or HighWay is active, but the underlying adjacency no longer justifies the route.',
        fallback: 'Go back to Atlas with sites and products visible until the topology is legible again.',
        resume: 'Resume the environment pivot after the next route is clearly supported by the graph.',
        actions: [
          { label: 'Open Atlas', query: 'site atlas.blackroad.io' },
          { label: 'Open sites', query: 'sites' },
          { label: 'Open products', query: 'products' },
        ],
      },
      {
        label: 'Edge-route fallback',
        title: 'Abandon the current environment path when proof and operator context fall away',
        breaks: 'The route still moves forward, but RoadChain or Alice can no longer explain why it should.',
        fallback: 'Step back from RoadWorld or HighWay and rebuild the edge move with proof still adjacent.',
        resume: 'Resume the concrete route only after the chosen environment can be justified and traced again.',
        actions: [
          { label: 'Open RoadWorld', query: 'open roadworld' },
          { label: 'Open HighWay', query: 'open highway' },
          { label: 'Open RoadChain', query: 'open roadchain' },
        ],
      },
    ],
    rituals: [
      {
        label: 'Map sync',
        title: 'Knowledge topology ritual',
        practice: 'Update knowledge map with new relationships and connections',
        frequency: 'Weekly',
        purpose: 'Keep the map of how things connect up to date and navigable',
        actions: [
          { label: 'Open atlas', query: 'atlas' },
          { label: 'Open search', query: 'search' },
        ],
      },
    ],
    primers: [
      {
        label: 'Map prep',
        title: 'Prepare the knowledge map surface',
        start: 'Open atlas and load the current world view.',
        gather: 'Sync all knowledge surfaces.',
        ready: 'Confirm the map is current.',
        actions: [
          { label: 'Open atlas', query: 'atlas' },
          { label: 'Check search', query: 'search' },
        ],
      },
    ],
    board: {
      title: 'Topology board',
      note: 'Hold the map, keep proof nearby, and pivot into concrete environments.',
      columns: [
        { title: 'Now', note: 'Read the graph', items: [
          { title: 'Open Atlas', subtitle: 'Topology surface', query: 'site atlas.blackroad.io' },
          { title: 'Open sites', subtitle: 'Domain map', query: 'sites' },
        ]},
        { title: 'Nearby', note: 'Keep proof and operators', items: [
          { title: 'Open RoadChain', subtitle: 'Proof layer', query: 'open roadchain' },
          { title: 'Open Alice', subtitle: 'Network operator', query: 'agent alice' },
        ]},
        { title: 'Escalate', note: 'Pivot into environments', items: [
          { title: 'Open RoadWorld', subtitle: 'World layer', query: 'open roadworld' },
          { title: 'Open HighWay', subtitle: 'Route layer', query: 'open highway' },
        ]},
      ],
    },
  },
};

const SITE_TYPE_CONTEXT = {
  root: { systems: ['sites', 'products'], docs: ['blackroad index'] },
  runtime: { systems: ['agents', 'settings'], docs: ['memory'] },
  infrastructure: { systems: ['status', 'sites'], docs: ['command dock routing', 'memory'] },
  agent: { systems: ['agents', 'collab'], docs: ['agent-entry', 'collab'] },
  archive: { systems: ['archive', 'memory'], docs: ['memory', 'blackroad index'] },
  legal: { systems: ['docs', 'status'], docs: ['memory'] },
  support: { systems: ['docs', 'todo'], docs: ['brtodo'] },
  developer: { systems: ['docs', 'status'], docs: ['command dock routing', 'codex'] },
  brand: { systems: ['sites', 'docs'], docs: ['blackroad index'] },
  billing: { systems: ['products', 'status'], docs: ['memory'] },
  search: { systems: ['docs', 'index'], docs: ['blackroad index', 'codex'] },
  live: { systems: ['live', 'agents'], docs: ['collab'] },
};

const SITE_TYPE_PLAYBOOKS = {
  root: {
    title: 'Entry loop',
    note: 'Use the public front door to map products, agents, and canon.',
    queries: [
      { title: 'Open products', subtitle: 'Product map', query: 'products' },
      { title: 'Open sites', subtitle: 'Domain map', query: 'sites' },
      { title: 'Open docs', subtitle: 'Explanation layer', query: 'docs' },
    ],
  },
  runtime: {
    title: 'Runtime loop',
    note: 'Inspect operators, settings, and continuity around the live shell.',
    queries: [
      { title: 'Open agents', subtitle: 'Operator roster', query: 'agents' },
      { title: 'Open settings', subtitle: 'Runtime controls', query: 'settings' },
      { title: 'Open memory', subtitle: 'System continuity', query: 'memory' },
    ],
  },
  infrastructure: {
    title: 'Infrastructure loop',
    note: 'Check status, topology, and operating references across the network.',
    queries: [
      { title: 'Open status', subtitle: 'Operational health', query: 'status' },
      { title: 'Open sites', subtitle: 'Domain topology', query: 'sites' },
      { title: 'Open command routing', subtitle: 'Execution reference', query: 'doc command dock routing' },
    ],
  },
  agent: {
    title: 'Operator loop',
    note: 'Move between agent context, collaboration, and public roster views.',
    queries: [
      { title: 'Open agents', subtitle: 'Roster and demos', query: 'agents' },
      { title: 'Open collab', subtitle: 'Shared operator room', query: 'collab' },
      { title: 'Open agent entry', subtitle: 'Agent canon', query: 'doc agent-entry' },
    ],
  },
  archive: {
    title: 'Archive loop',
    note: 'Browse records, memory, and canon references from one surface.',
    queries: [
      { title: 'Open archive', subtitle: 'Archive system surface', query: 'archive' },
      { title: 'Open memory', subtitle: 'Saved continuity', query: 'memory' },
      { title: 'Open docs', subtitle: 'Canon references', query: 'docs' },
    ],
  },
  legal: {
    title: 'Compliance loop',
    note: 'Read the rules, inspect status, and keep policy context close.',
    queries: [
      { title: 'Open docs', subtitle: 'Policy references', query: 'docs' },
      { title: 'Open status', subtitle: 'Operational health', query: 'status' },
      { title: 'Open memory', subtitle: 'Retention and continuity', query: 'memory' },
    ],
  },
  support: {
    title: 'Support loop',
    note: 'Route help, backlog, and user-facing guidance in one place.',
    queries: [
      { title: 'Open docs', subtitle: 'Guides and help', query: 'docs' },
      { title: 'Open todo', subtitle: 'Support backlog', query: 'todo' },
      { title: 'Open RoadSide', subtitle: 'Simple entry route', query: 'open roadside' },
    ],
  },
  developer: {
    title: 'Developer loop',
    note: 'Move between docs, status, and implementation guidance.',
    queries: [
      { title: 'Open docs', subtitle: 'Developer references', query: 'docs' },
      { title: 'Open status', subtitle: 'Service health', query: 'status' },
      { title: 'Open codex', subtitle: 'Implementation guide', query: 'doc codex' },
    ],
  },
  brand: {
    title: 'Brand loop',
    note: 'Keep design system, canon, and creation routes connected.',
    queries: [
      { title: 'Open docs', subtitle: 'Brand references', query: 'docs' },
      { title: 'Open sites', subtitle: 'Public domain map', query: 'sites' },
      { title: 'Open BlackBoard', subtitle: 'Creation surface', query: 'open blackboard' },
    ],
  },
  billing: {
    title: 'Billing loop',
    note: 'Map plans, credits, and operational status around subscriptions.',
    queries: [
      { title: 'Open products', subtitle: 'Plan and product map', query: 'products' },
      { title: 'Open status', subtitle: 'Billing health', query: 'status' },
      { title: 'Open RoadCoin', subtitle: 'Credit utility layer', query: 'open roadcoin' },
    ],
  },
  search: {
    title: 'Search loop',
    note: 'Pivot between docs, verification, and saved discovery surfaces.',
    queries: [
      { title: 'Open docs', subtitle: 'Reference layer', query: 'docs' },
      { title: 'Open index', subtitle: 'Institutional map', query: 'index' },
      { title: 'Open archive', subtitle: 'Saved sources', query: 'archive' },
    ],
  },
  live: {
    title: 'Broadcast loop',
    note: 'Move between capture, live rooms, and operator commentary.',
    queries: [
      { title: 'Open live', subtitle: 'Broadcast layer', query: 'live' },
      { title: 'Open capture', subtitle: 'In-shell capture surface', query: 'capture' },
      { title: 'Open agents', subtitle: 'Commentary operators', query: 'agents' },
    ],
  },
};

const APP_STAGE_PAD = 8;
const registry = new SurfaceRegistry({
  surfaces: SURFACE_SEED,
  adapters: [
    systemPanelAdapter,
    noteAdapter,
    screenCaptureAdapter,
    blackroadAppAdapter,
    archiveAdapter,
    youtubeAdapter,
    directMediaAdapter,
    genericEmbedAdapter,
  ],
});

const refs = {
  grid: document.getElementById('grid'),
  q: document.getElementById('q'),
  toast: document.getElementById('toast'),
  term: document.getElementById('term'),
  cmd: document.getElementById('cmd'),
  leftVideos: document.getElementById('leftVideos'),
  rightVideos: document.getElementById('rightVideos'),
  appsHome: document.getElementById('appsHome'),
  appStage: document.getElementById('appStage'),
  appWin: document.getElementById('appWin'),
  appClose: document.getElementById('appClose'),
  appTitle: document.getElementById('appTitle'),
  appFrame: document.getElementById('appFrame'),
  appPlaceholder: document.getElementById('appPlaceholder'),
  roadosLauncher: document.getElementById('roadosLauncher'),
  roadosGrid: document.getElementById('roadosGrid'),
  surfaceRoot: document.getElementById('surfaceRoot'),
  surfaceMount: document.getElementById('surfaceMount'),
  surfaceFallback: document.getElementById('surfaceFallback'),
  surfaceBadges: document.getElementById('surfaceBadges'),
  surfaceNote: document.getElementById('surfaceNote'),
  surfaceRights: document.getElementById('surfaceRights'),
  searchButton: document.getElementById('go'),
  runButton: document.getElementById('run'),
};

const state = {
  openKind: null,
  openKey: null,
  openFromEl: null,
  roadosMode: null,
};

const BOOTSTRAP_SOURCE = refs.searchButton;
let suppressLocationSync = false;

function updateShellLocation(openValue = '', options = {}) {
  if (suppressLocationSync) return;
  const url = new URL(window.location.href);
  url.search = '';
  if (openValue) {
    url.searchParams.set('open', openValue);
  }
  const nextUrl = url.toString();
  const currentUrl = window.location.toString();
  if (nextUrl === currentUrl) return;
  const method = options.replace ? 'replaceState' : 'pushState';
  window.history[method](null, '', url);
}

const ROUTES = [...PRODUCT_ROUTES, ...SITE_ROUTES];
const AGENTS = AGENT_ENTRIES;
const SYSTEMS = SYSTEM_ENTRIES;
const DOCS = DOC_ENTRIES;
const SECTIONS = SECTION_ENTRIES;

const surfaceWindow = createSurfaceWindow({
  registry,
  mountNode: refs.surfaceMount,
  fallbackNode: refs.surfaceFallback,
  badgesNode: refs.surfaceBadges,
  noteNode: refs.surfaceNote,
  rightsNode: refs.surfaceRights,
  openSurfaceById(surfaceId) {
    const surface = registry.get(surfaceId);
    if (!surface) return;
    openSurface(surface, refs.runButton, { replace: true });
  },
  openQuery(query) {
    if (!openQueryTarget(query, { sourceEl: refs.runButton, replace: true })) {
      performSearch(query);
    }
  },
  openExternal(url) {
    window.open(url, '_blank', 'noopener');
  },
  onSurfaceChange(surface) {
    refs.appTitle.textContent = `${surface.title} · ${surface.provider}`;
  },
});

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => refs.toast.classList.remove('show'), 1600);
}

function logLine(message) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  refs.term.textContent = `${refs.term.textContent ? `${refs.term.textContent}\n` : ''}[${timestamp}] ${message}`;
  refs.term.scrollTop = refs.term.scrollHeight;
}

function pad2(number) {
  return String(number).padStart(2, '0');
}

function tickClock() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  if (hours === 0) hours = 12;
  document.getElementById('clock').textContent = `${hours}:${pad2(minutes)} ${suffix}`;
}

function setWindowFromElement(sourceEl) {
  const appsColumn = refs.appStage.parentElement;
  const columnRect = appsColumn.getBoundingClientRect();
  const sourceRect = sourceEl.getBoundingClientRect();
  const endLeft = APP_STAGE_PAD;
  const endTop = APP_STAGE_PAD;
  const endWidth = Math.max(1, appsColumn.clientWidth - APP_STAGE_PAD * 2);
  const endHeight = Math.max(1, appsColumn.clientHeight - APP_STAGE_PAD * 2);
  const startLeft = sourceRect.left - columnRect.left - endLeft;
  const startTop = sourceRect.top - columnRect.top - endTop;
  const scaleX = Math.max(1, sourceRect.width) / endWidth;
  const scaleY = Math.max(1, sourceRect.height) / endHeight;

  refs.appStage.style.left = `${endLeft}px`;
  refs.appStage.style.top = `${endTop}px`;
  refs.appStage.style.right = `${endLeft}px`;
  refs.appStage.style.bottom = `${endTop}px`;

  refs.appWin.style.setProperty('--dx', `${startLeft}px`);
  refs.appWin.style.setProperty('--dy', `${startTop}px`);
  refs.appWin.style.setProperty('--sx', `${scaleX}`);
  refs.appWin.style.setProperty('--sy', `${scaleY}`);
}

function setActiveContent(mode) {
  refs.appFrame.hidden = mode !== 'frame';
  refs.roadosLauncher.hidden = mode !== 'launcher';
  refs.appPlaceholder.hidden = mode !== 'placeholder';
  refs.surfaceRoot.hidden = mode !== 'surface';
}

function showAppsGrid() {
  state.openKind = null;
  state.openKey = null;
  state.openFromEl = null;
  state.roadosMode = null;
  refs.appsHome.classList.remove('hide');
  refs.appStage.classList.remove('show');
  refs.appStage.setAttribute('aria-hidden', 'true');
  refs.appWin.classList.remove('settled');
  refs.appFrame.removeAttribute('src');
  refs.appTitle.textContent = '—';
  refs.appPlaceholder.textContent = 'APP WINDOW';
  refs.appPlaceholder.hidden = false;
  surfaceWindow.close();
  setActiveContent('placeholder');
  updateShellLocation('', { replace: true });
}

function showStage(sourceEl) {
  refs.appsHome.classList.add('hide');
  refs.appStage.classList.add('show');
  refs.appStage.setAttribute('aria-hidden', 'false');
  setWindowFromElement(sourceEl);
  refs.appWin.classList.remove('settled');
  window.requestAnimationFrame(() => refs.appWin.classList.add('settled'));
}

function showRoadOSLauncher() {
  state.roadosMode = 'launcher';
  refs.appTitle.textContent = 'RoadOS';
  refs.appFrame.removeAttribute('src');
  surfaceWindow.close();
  setActiveContent('launcher');
  updateShellLocation('app:RoadOS');
}

function openRoadOSCategory(name, options = {}) {
  state.roadosMode = 'category';
  refs.appTitle.textContent = `RoadOS / ${name}`;
  refs.appFrame.removeAttribute('src');
  setActiveContent('surface');
  surfaceWindow.open(ensureCategorySurface(name));
  updateShellLocation(`category:${name}`, { replace: options.replaceHistory });
  if (!options.silent) {
    showToast(`OPEN ${name}`);
    logLine(`OPEN ${name} (RoadOS)`);
  }
}

function finishOpen(kind, key, sourceEl) {
  state.openKind = kind;
  state.openKey = key;
  state.openFromEl = sourceEl;
  showStage(sourceEl);
}

function openApp(name, sourceEl) {
  if (!sourceEl || state.openKey) return;
  refs.appTitle.textContent = name;
  surfaceWindow.close();
  refs.appFrame.removeAttribute('src');

  if (name === 'RoadOS') {
    showRoadOSLauncher();
  } else if (ROADOS_CATEGORIES.includes(name)) {
    openRoadOSCategory(name, { silent: true });
  } else {
    openSurface(ensureHomeAppSurface(name), sourceEl);
    return;
  }

  finishOpen('app', name, sourceEl);
  updateShellLocation(ROADOS_CATEGORIES.includes(name) ? `category:${name}` : `app:${name}`);
  showToast(`OPEN ${name}`);
  logLine(`OPEN ${name}`);
}

function openSurface(surface, sourceEl, options = {}) {
  if (!surface) return;

  if (state.openKey) {
    if (!options.replace) return;
    refs.appTitle.textContent = `${surface.title} · ${surface.provider}`;
    refs.appFrame.removeAttribute('src');
    setActiveContent('surface');
    surfaceWindow.open(surface);
    state.openKind = 'surface';
    state.openKey = surface.id;
    if (sourceEl) state.openFromEl = sourceEl;
    updateShellLocation(`surface:${surface.id}`, { replace: true });
    showToast(`OPEN ${surface.title}`);
    logLine(`OPEN ${surface.id}`);
    return;
  }

  refs.appTitle.textContent = `${surface.title} · ${surface.provider}`;
  refs.appFrame.removeAttribute('src');
  setActiveContent('surface');
  surfaceWindow.open(surface);
  finishOpen('surface', surface.id, sourceEl);
  updateShellLocation(`surface:${surface.id}`);
  showToast(`OPEN ${surface.title}`);
  logLine(`OPEN ${surface.id}`);
}

function closeRoute() {
  if (!state.openKey) return;

  if (state.openKind === 'app' && state.openKey === 'RoadOS' && state.roadosMode === 'category') {
    showRoadOSLauncher();
    showToast('RoadOS');
    logLine('RoadOS launcher');
    return;
  }

  const sourceEl = state.openFromEl;
  const openKey = state.openKey;
  setWindowFromElement(sourceEl);
  refs.appWin.classList.remove('settled');

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    showAppsGrid();
    showToast(`CLOSE ${openKey}`);
    logLine(`CLOSE ${openKey}`);
    return;
  }

  const onDone = (event) => {
    if (event?.propertyName !== 'transform') return;
    refs.appWin.removeEventListener('transitionend', onDone);
    showAppsGrid();
    showToast(`CLOSE ${openKey}`);
    logLine(`CLOSE ${openKey}`);
  };
  refs.appWin.addEventListener('transitionend', onDone);
}

function buildAppNode(name) {
  const element = document.createElement('div');
  element.className = 'app';
  element.dataset.appName = name;
  element.innerHTML = `<div class="icon" role="button" tabindex="0" aria-label="${name}"></div><div class="name">${name}</div>`;
  const icon = element.querySelector('.icon');
  const activate = () => {
    if (ROADOS_CATEGORIES.includes(name) && state.openKey === 'RoadOS' && state.roadosMode === 'launcher') {
      openRoadOSCategory(name);
      return;
    }
    openApp(name, icon);
  };
  element.addEventListener('click', activate);
  icon.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
  return element;
}

function renderApps() {
  HOME_APPS.forEach((name) => refs.grid.appendChild(buildAppNode(name)));
  ROADOS_CATEGORIES.forEach((name) => refs.roadosGrid.appendChild(buildAppNode(name)));
}

function renderRails() {
  refs.leftVideos.textContent = '';
  refs.rightVideos.textContent = '';

  registry.listByRail('left').forEach((surface) => {
    refs.leftVideos.appendChild(
      createMediaCard(surface, {
        onOpen: (entry, element) => openSurface(entry, element),
      })
    );
  });

  registry.listByRail('right').forEach((surface) => {
    refs.rightVideos.appendChild(
      createMediaCard(surface, {
        onOpen: (entry, element) => openSurface(entry, element),
      })
    );
  });
}

function routeSurfaceId(route) {
  return `route-${route.kind}-${route.id}`;
}

function ensureRouteSurface(route) {
  const id = routeSurfaceId(route);
  const existing = registry.get(id);
  if (existing) return existing;
  if (route.kind === 'product') {
    return registry.add({
      id,
      title: route.name,
      subtitle: route.domain,
      kind: 'system',
      provider: 'blackroad-product',
      url: route.url,
      embedUrl: '',
      thumbnail: null,
      status: 'ready',
      rights: 'owned',
      captureable: false,
      tags: [...(route.tags || []), route.kind, route.domain, 'product'],
      notes: route.description,
      rail: 'none',
      order: 0,
      meta: {
        routeId: route.id,
        role: 'product overview',
        panel: buildProductPanel(route),
      },
    });
  }
  if (route.kind === 'site') {
    return registry.add({
      id,
      title: route.name,
      subtitle: route.domain,
      kind: 'system',
      provider: 'blackroad-site',
      url: route.url,
      embedUrl: '',
      thumbnail: null,
      status: 'ready',
      rights: 'owned',
      captureable: false,
      tags: [...(route.tags || []), route.kind, route.domain, 'site'],
      notes: route.description,
      rail: 'none',
      order: 0,
      meta: {
        routeId: route.id,
        role: 'site overview',
        panel: buildSitePanel(route),
      },
    });
  }
  return registry.add({
    id,
    title: route.name,
    subtitle: route.domain,
    kind: 'embed',
    provider: 'blackroad',
    url: route.url,
    embedUrl: route.url,
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: [...(route.tags || []), route.kind, route.domain],
    notes: route.description,
    rail: 'none',
    order: 0,
  });
}

function ensureSystemSurface(system) {
  const id = system.id;
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: system.name,
    subtitle: system.command,
    kind: 'system',
    provider: 'blackroad-system',
    url: system.url || '',
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: [...(system.tags || []), 'system', system.command],
    notes: system.description,
    rail: 'none',
    order: 0,
    meta: {
      command: system.command,
      role: 'system route',
      panel: buildSystemPanel(system),
    },
  });
}

function ensureCommandSurface(result) {
  const key = String(result.targetId || result.surfaceId || result.label || result.query || 'result')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'result';
  const id = `command-${result.type}-${key}`;
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: result.label || result.targetId || 'Command result',
    subtitle: result.type,
    kind: result.url ? 'embed' : 'note',
    provider: 'blackroad-command',
    url: result.url || '',
    embedUrl: result.url || '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: compact(['command', result.type, result.targetId, result.surfaceId]),
    notes: result.message || `Shared command router resolved "${result.query}".`,
    rail: 'none',
    order: 0,
    meta: {
      query: result.query,
      action: result.action,
      surfaceId: result.surfaceId,
    },
  });
}

function homeAppSurfaceId(name) {
  return `app-${String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function createAction(label, surface) {
  return surface ? { label, surfaceId: surface.id } : null;
}

function categorySurfaceId(name) {
  return `sector-${String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function ensureHomeAppSurface(name) {
  const id = homeAppSurfaceId(name);
  const existing = registry.get(id);
  if (existing) return existing;

  if (name === 'okReusePixel') {
    return registry.add({
      id,
      title: 'okReusePixel',
      subtitle: 'Local launcher for asset pages',
      kind: 'embed',
      provider: 'blackroad',
      url: '/home/apps/OkReusePixel/',
      embedUrl: '/home/apps/OkReusePixel/',
      thumbnail: null,
      status: 'ready',
      rights: 'owned',
      captureable: false,
      tags: ['app', 'asset-library', 'pixel-art'],
      notes: 'Launcher for the local okReusePixel gallery and PixelTown editor.',
      rail: 'none',
      order: 0,
    });
  }

  if (name === 'PixelTown') {
    return registry.add({
      id,
      title: 'PixelTown',
      subtitle: 'Hosted tile painter',
      kind: 'embed',
      provider: 'blackroad',
      url: '/home/apps/PixelTown/',
      embedUrl: '/home/apps/PixelTown/',
      thumbnail: null,
      status: 'ready',
      rights: 'owned',
      captureable: false,
      tags: ['app', 'pixel-art', 'tiles', 'painter'],
      notes: 'A hosted version of the tile painter for quick scene blocking.',
      rail: 'none',
      order: 0,
    });
  }

  if (name === 'Traffic') {
    return registry.add({
      id,
      title: 'Traffic',
      subtitle: 'Web traffic analytics',
      kind: 'embed',
      provider: 'blackroad',
      url: '/home/apps/Traffic/',
      embedUrl: '/home/apps/Traffic/',
      thumbnail: null,
      status: 'ready',
      rights: 'owned',
      captureable: false,
      tags: ['app', 'analytics', 'traffic', 'dashboard'],
      notes: 'Live pageview, event, and human-session summaries for blackroad.io.',
      rail: 'none',
      order: 0,
    });
  }

  return registry.add({
    id,
    title: name,
    subtitle: 'BlackRoad app layer',
    kind: 'system',
    provider: 'blackroad-app',
    url: '',
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: compact(['app', 'home-app', String(name || '').toLowerCase()]),
    notes: `${name} app routes into a curated BlackRoad-native panel.`,
    rail: 'none',
    order: 0,
    meta: {
      panel: buildHomeAppPanel(name),
    },
  });
}

function ensureCategorySurface(name) {
  const id = categorySurfaceId(name);
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: `${name} sector`,
    subtitle: 'RoadOS category',
    kind: 'system',
    provider: 'blackroad-sector',
    url: '',
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: ['sector', 'category', String(name || '').toLowerCase()],
    notes: `${name} sector routes and canon anchors inside RoadOS.`,
    rail: 'none',
    order: 0,
    meta: {
      panel: buildCategoryPanel(name),
    },
  });
}

function findRouteById(id) {
  return ROUTES.find((route) => route.id === id) || null;
}

function findRouteByDomain(domain) {
  return ROUTES.find((route) => route.domain === domain) || null;
}

function findProductById(id) {
  return PRODUCTS.find((product) => product.id === id) || null;
}

function findSiteByRoute(route) {
  return SITES.find((site) => site.id === route.id || site.domain === route.domain) || null;
}

function findAgentEntry(query) {
  return AGENTS.find((entry) => canonMatchesQuery(entry, query)) || null;
}

function findDocEntry(query) {
  return DOCS.find((entry) => canonMatchesQuery(entry, query)) || null;
}

function panelItemFromSurface(surface, title, subtitle) {
  if (!surface) return null;
  return {
    title: title || surface.title,
    subtitle: subtitle || surface.subtitle || surface.notes || '',
    surfaceId: surface.id,
  };
}

function panelItemFromRoute(route) {
  if (!route) return null;
  const surface = ensureRouteSurface(route);
  return panelItemFromSurface(surface, route.name, route.domain);
}

function panelItemFromAgent(agent) {
  if (!agent) return null;
  const surface = ensureAgentSurface(agent);
  return panelItemFromSurface(surface, agent.name, agent.role);
}

function panelItemFromDoc(doc) {
  if (!doc) return null;
  const surface = ensureDocSurface(doc);
  return panelItemFromSurface(surface, doc.title, doc.path);
}

function panelItemFromSection(section) {
  if (!section) return null;
  const surface = ensureSectionSurface(section);
  return panelItemFromSurface(surface, `Section ${section.number}`, section.title);
}

function panelItemFromSystem(command) {
  const system = findSystemByCommand(command);
  if (!system) return null;
  const surface = ensureSystemSurface(system);
  return panelItemFromSurface(surface, system.name, `system · ${system.command}`);
}

function compact(items) {
  return items.filter(Boolean);
}

function uniqueList(items = []) {
  return [...new Set(compact(items))];
}

function uniqueQueryItems(items = []) {
  const seen = new Set();
  return compact(items).filter((item) => {
    const key = item.query || `${item.title}|${item.surfaceId || ''}|${item.href || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createQueryItem(title, subtitle, query) {
  return query ? { title, subtitle, query } : null;
}

function createMetric(label, value) {
  if (value === null || value === undefined || value === '') return null;
  return { label, value: String(value) };
}

function createFact(label, value) {
  if (!value) return null;
  return { label, value: String(value) };
}

function createSpotlightItem(label, title, subtitle, target = {}) {
  if (!title) return null;
  return {
    label,
    title: String(title),
    subtitle: String(subtitle || ''),
    surfaceId: target.surfaceId || null,
    href: target.href || null,
    query: target.query || null,
  };
}

function createBriefItem(label, title, copy, target = {}) {
  if (!title || !copy) return null;
  return {
    label,
    title: String(title),
    copy: String(copy),
    surfaceId: target.surfaceId || null,
    href: target.href || null,
    query: target.query || null,
  };
}

function createRunbookItem(label, title, copy, actions = []) {
  if (!title || !copy || !actions.length) return null;
  return {
    label,
    title: String(title),
    copy: String(copy),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createProtocolItem(label, title, stages = [], actions = []) {
  if (!title || !stages.length || !actions.length) return null;
  const normalizedStages = compact(stages.map((stage) => (stage?.label && stage?.value
    ? {
        label: String(stage.label),
        value: String(stage.value),
      }
    : null)));
  const normalizedActions = compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
    ? {
        label: String(action.label),
        query: action.query || null,
        href: action.href || null,
        surfaceId: action.surfaceId || null,
      }
    : null)));
  if (!normalizedStages.length || !normalizedActions.length) return null;
  return {
    label,
    title: String(title),
    stages: normalizedStages,
    actions: normalizedActions,
  };
}

function createTripwireItem(label, title, signal, trigger, response, actions = []) {
  if (!title || !signal || !trigger || !response || !actions.length) return null;
  return {
    label,
    title: String(title),
    signal: String(signal),
    trigger: String(trigger),
    response: String(response),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createDecisionItem(label, title, decision, condition, rationale, actions = []) {
  if (!title || !decision || !condition || !rationale || !actions.length) return null;
  return {
    label,
    title: String(title),
    decision: String(decision),
    condition: String(condition),
    rationale: String(rationale),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createCheckpointItem(label, title, objective, proof, exit, actions = []) {
  if (!title || !objective || !proof || !exit || !actions.length) return null;
  return {
    label,
    title: String(title),
    objective: String(objective),
    proof: String(proof),
    exit: String(exit),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createDependencyItem(label, title, reliesOn, watch, unlocks, actions = []) {
  if (!title || !reliesOn || !watch || !unlocks || !actions.length) return null;
  return {
    label,
    title: String(title),
    reliesOn: String(reliesOn),
    watch: String(watch),
    unlocks: String(unlocks),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createGuardrailItem(label, title, preserve, avoid, recover, actions = []) {
  if (!title || !preserve || !avoid || !recover || !actions.length) return null;
  return {
    label,
    title: String(title),
    preserve: String(preserve),
    avoid: String(avoid),
    recover: String(recover),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createCustodyItem(label, title, current, sharedWith, transfersTo, actions = []) {
  if (!title || !current || !sharedWith || !transfersTo || !actions.length) return null;
  return {
    label,
    title: String(title),
    current: String(current),
    sharedWith: String(sharedWith),
    transfersTo: String(transfersTo),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createReceiptItem(label, title, sends, lands, confirms, actions = []) {
  if (!title || !sends || !lands || !confirms || !actions.length) return null;
  return {
    label,
    title: String(title),
    sends: String(sends),
    lands: String(lands),
    confirms: String(confirms),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createCadenceItem(label, title, review, pulse, reset, actions = []) {
  if (!title || !review || !pulse || !reset || !actions.length) return null;
  return {
    label,
    title: String(title),
    review: String(review),
    pulse: String(pulse),
    reset: String(reset),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function createFallbackItem(label, title, breaks, fallback, resume, actions = []) {
  if (!title || !breaks || !fallback || !resume || !actions.length) return null;
  return {
    label,
    title: String(title),
    breaks: String(breaks),
    fallback: String(fallback),
    resume: String(resume),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function playbookItemsFromEntries(entries = []) {
  return entries.map((entry) => createQueryItem(entry.title, entry.subtitle, entry.query));
}

function buildSequenceItems(items = [], limit = 4) {
  return compact(items)
    .slice(0, limit)
    .map((item, index) => ({
      index: String(index + 1),
      title: item.title || `Step ${index + 1}`,
      subtitle: item.subtitle || '',
    }));
}

function buildSpotlightItems(items = [], limit = 5) {
  const seen = new Set();
  return compact(items).filter((item) => {
    const key = item.query || item.surfaceId || item.href || `${item.label}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function buildClusterGroup(title, note, items = [], limit = 3) {
  const grouped = compact(items).slice(0, limit);
  if (!grouped.length) return null;
  return { title, note, items: grouped };
}

function buildClusterGroups(groups = []) {
  return compact(groups);
}

function buildBriefItems(items = [], limit = 3) {
  return compact(items).slice(0, limit);
}

function buildRunbookItems(items = [], limit = 3) {
  return compact(items).slice(0, limit);
}

function buildProtocolItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildTripwireItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildDecisionItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildCheckpointItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildDependencyItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildGuardrailItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildCustodyItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildReceiptItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildCadenceItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildFallbackItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function createPrimerItem(label, title, start, gather, ready, actions = []) {
  if (!title || !start || !gather || !ready || !actions.length) return null;
  return {
    label,
    title: String(title),
    start: String(start),
    gather: String(gather),
    ready: String(ready),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function buildPrimerItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function createRitualItem(label, title, practice, frequency, purpose, actions = []) {
  if (!title || !practice || !frequency || !purpose || !actions.length) return null;
  return {
    label,
    title: String(title),
    practice: String(practice),
    frequency: String(frequency),
    purpose: String(purpose),
    actions: compact(actions.map((action) => (action?.label && (action?.query || action?.href || action?.surfaceId)
      ? {
          label: String(action.label),
          query: action.query || null,
          href: action.href || null,
          surfaceId: action.surfaceId || null,
        }
      : null))),
  };
}

function buildRitualItems(items = [], limit = 2) {
  return compact(items).slice(0, limit);
}

function buildBoardColumns(columns = [], limit = 3) {
  return compact(columns.map((column) => {
    const items = compact(column.items || []).slice(0, limit);
    if (!items.length) return null;
    return {
      title: column.title,
      note: column.note,
      items,
    };
  }));
}

function buildProductWorkspaceWidgets(product, config, routeIds, routeItems, docItems, agentItems, siteItems, surfaceItems, agentQueries, playbookConfig, playbookItems) {
  const operatorCount = product.agentLayer === 'all' ? AGENTS.length : agentQueries.length;
  const metrics = compact([
    createMetric('Status', product.status),
    createMetric('Category', product.category),
    createMetric('User', product.primaryUser),
    createMetric('Operators', operatorCount),
    createMetric('Routes', routeIds.length + 1),
    createMetric('Sites', siteItems.length),
  ]);

  const facts = compact([
    createFact('Domain', product.domain),
    createFact('Surface', product.surfaceKind),
    createFact('Replaces', product.replaces),
    createFact('Tags', (product.tags || []).slice(0, 5).join(' · ')),
  ]);
  const sequenceItems = buildSequenceItems(playbookItems);
  const spotlightItems = buildSpotlightItems([
    routeItems[0] ? createSpotlightItem('Road', routeItems[0].title, routeItems[0].subtitle, routeItems[0]) : null,
    siteItems[0] ? createSpotlightItem('Site', siteItems[0].title, siteItems[0].subtitle, siteItems[0]) : null,
    docItems[0] ? createSpotlightItem('Doc', docItems[0].title, docItems[0].subtitle, docItems[0]) : null,
    agentItems[0] ? createSpotlightItem('Agent', agentItems[0].title, agentItems[0].subtitle, agentItems[0]) : null,
    surfaceItems[0] ? createSpotlightItem('Media', surfaceItems[0].title, surfaceItems[0].subtitle, surfaceItems[0]) : null,
  ]);
  const clusterGroups = buildClusterGroups([
    buildClusterGroup('Launch', 'Roads and domains', compact([routeItems[0], siteItems[0], routeItems[1], siteItems[1]])),
    buildClusterGroup('Operators', 'Primary agents', agentItems),
    buildClusterGroup('References', 'Docs and canon', docItems),
    buildClusterGroup('Live', 'Media and embeds', surfaceItems),
  ]);
  const briefItems = buildBriefItems((config?.briefs || []).map((brief) => createBriefItem(
    brief.label,
    brief.title,
    brief.copy,
    { query: brief.query, href: brief.href, surfaceId: brief.surfaceId }
  )));
  const runbookItems = buildRunbookItems((config?.runbooks || []).map((runbook) => createRunbookItem(
    runbook.label,
    runbook.title,
    runbook.copy,
    runbook.actions || []
  )));
  const protocolItems = buildProtocolItems((config?.protocols || []).map((protocol) => createProtocolItem(
    protocol.label,
    protocol.title,
    protocol.stages || [],
    protocol.actions || []
  )));
  const tripwireItems = buildTripwireItems((config?.tripwires || []).map((tripwire) => createTripwireItem(
    tripwire.label,
    tripwire.title,
    tripwire.signal,
    tripwire.trigger,
    tripwire.response,
    tripwire.actions || []
  )));
  const decisionItems = buildDecisionItems((config?.decisions || []).map((decision) => createDecisionItem(
    decision.label,
    decision.title,
    decision.decision,
    decision.condition,
    decision.rationale,
    decision.actions || []
  )));
  const checkpointItems = buildCheckpointItems((config?.checkpoints || []).map((checkpoint) => createCheckpointItem(
    checkpoint.label,
    checkpoint.title,
    checkpoint.objective,
    checkpoint.proof,
    checkpoint.exit,
    checkpoint.actions || []
  )));
  const dependencyItems = buildDependencyItems((config?.dependencies || []).map((dependency) => createDependencyItem(
    dependency.label,
    dependency.title,
    dependency.reliesOn,
    dependency.watch,
    dependency.unlocks,
    dependency.actions || []
  )));
  const guardrailItems = buildGuardrailItems((config?.guardrails || []).map((guardrail) => createGuardrailItem(
    guardrail.label,
    guardrail.title,
    guardrail.preserve,
    guardrail.avoid,
    guardrail.recover,
    guardrail.actions || []
  )));
  const custodyItems = buildCustodyItems((config?.custody || []).map((custody) => createCustodyItem(
    custody.label,
    custody.title,
    custody.current,
    custody.sharedWith,
    custody.transfersTo,
    custody.actions || []
  )));
  const receiptItems = buildReceiptItems((config?.receipts || []).map((receipt) => createReceiptItem(
    receipt.label,
    receipt.title,
    receipt.sends,
    receipt.lands,
    receipt.confirms,
    receipt.actions || []
  )));
  const cadenceItems = buildCadenceItems((config?.cadence || []).map((cadence) => createCadenceItem(
    cadence.label,
    cadence.title,
    cadence.review,
    cadence.pulse,
    cadence.reset,
    cadence.actions || []
  )));
  const fallbackItems = buildFallbackItems((config?.fallbacks || []).map((fallback) => createFallbackItem(
    fallback.label,
    fallback.title,
    fallback.breaks,
    fallback.fallback,
    fallback.resume,
    fallback.actions || []
  )));
  const primerItems = buildPrimerItems((config?.primers || []).map((primer) => createPrimerItem(
    primer.label,
    primer.title,
    primer.start,
    primer.gather,
    primer.ready,
    primer.actions || []
  )));
  const boardColumns = buildBoardColumns(config?.board?.columns || []);

  return compact([
    metrics.length ? { kind: 'metrics', title: 'Workspace summary', note: 'Canon snapshot', items: metrics } : null,
    facts.length ? { kind: 'facts', title: 'Road facts', note: 'High-signal metadata', items: facts } : null,
    spotlightItems.length
      ? {
          kind: 'spotlight',
          title: 'Road spotlight',
          note: 'Highest-signal linked surfaces',
          items: spotlightItems,
        }
      : null,
    clusterGroups.length
      ? {
          kind: 'clusters',
          title: 'Road clusters',
          note: 'Grouped control-room lanes',
          groups: clusterGroups,
        }
      : null,
    briefItems.length
      ? {
          kind: 'briefs',
          title: 'Mission brief',
          note: 'Flagship-specific mission, watch, and escalation context',
          items: briefItems,
        }
      : null,
    runbookItems.length
      ? {
          kind: 'runbooks',
          title: 'Runbook cards',
          note: 'Concrete flagship plays for routing the next move',
          items: runbookItems,
        }
      : null,
    protocolItems.length
      ? {
          kind: 'protocols',
          title: 'Protocol cards',
          note: 'Stage-based flagship patterns for holding the room together',
          items: protocolItems,
        }
      : null,
    tripwireItems.length
      ? {
          kind: 'tripwires',
          title: 'Tripwire cards',
          note: 'Signals that should immediately redirect the room',
          items: tripwireItems,
        }
      : null,
    decisionItems.length
      ? {
          kind: 'decisions',
          title: 'Decision cards',
          note: 'Choices the room should make before widening the loop',
          items: decisionItems,
        }
      : null,
    checkpointItems.length
      ? {
          kind: 'checkpoints',
          title: 'Checkpoint cards',
          note: 'What this room must prove before handing work onward',
          items: checkpointItems,
        }
      : null,
    dependencyItems.length
      ? {
          kind: 'dependencies',
          title: 'Dependency cards',
          note: 'Critical upstream and downstream lanes shaping this room',
          items: dependencyItems,
        }
      : null,
    guardrailItems.length
      ? {
          kind: 'guardrails',
          title: 'Guardrail cards',
          note: 'Constraints this room should preserve while it operates',
          items: guardrailItems,
        }
      : null,
    custodyItems.length
      ? {
          kind: 'custody',
          title: 'Custody cards',
          note: 'Who currently holds the room, who stays in the loop, and where it transfers next',
          items: custodyItems,
        }
      : null,
    receiptItems.length
      ? {
          kind: 'receipts',
          title: 'Receipt cards',
          note: 'Closed-loop confirmations that prove the handoff actually landed',
          items: receiptItems,
        }
      : null,
    cadenceItems.length
      ? {
          kind: 'cadence',
          title: 'Cadence cards',
          note: 'The review rhythm that keeps the room fresh after a handoff lands',
          items: cadenceItems,
        }
      : null,
    fallbackItems.length
      ? {
          kind: 'fallbacks',
          title: 'Fallback cards',
          note: 'Contingency routes for the moment the primary lane stops holding',
          items: fallbackItems,
        }
      : null,
    primerItems.length
      ? {
          kind: 'primers',
          title: 'Primer cards',
          note: 'Setup steps before the briefing starts',
          items: primerItems,
        }
      : null,
    ritualItems.length
      ? {
          kind: 'rituals',
          title: 'Ritual cards',
          note: 'Recurring practices that keep the room moving',
          items: ritualItems,
        }
      : null,
    boardColumns.length
      ? {
          kind: 'board',
          title: config?.board?.title || 'Handoff board',
          note: config?.board?.note || 'Flagship-specific now / nearby / escalate lanes',
          columns: boardColumns,
        }
      : null,
    sequenceItems.length
      ? {
          kind: 'sequence',
          title: playbookConfig?.title || 'Operating sequence',
          note: playbookConfig?.note || `How ${product.name} typically unfolds inside the shell.`,
          items: sequenceItems,
        }
      : null,
  ]);
}

function buildSiteWorkspaceWidgets(site, config, pathItems, routeItems, docItems, agentItems, peerSiteItems, surfaceItems, agentQueries, playbookConfig, playbookItems) {
  const operatorCount = (site.connectedAgents || []).includes('all') ? AGENTS.length : agentQueries.length;
  const metrics = compact([
    createMetric('Status', site.status),
    createMetric('Type', site.type),
    createMetric('Audience', site.audience),
    createMetric('Priority', site.priority),
    createMetric('Paths', pathItems.length),
    createMetric('Operators', operatorCount),
  ]);

  const facts = compact([
    createFact('Domain', site.domain),
    createFact('Connected product', site.connectedProduct || 'none'),
    createFact('Primary CTA', site.primaryCTA),
    createFact('Adjacent roads', routeItems.length ? `${routeItems.length}` : null),
    createFact('Peer sites', peerSiteItems.length ? `${peerSiteItems.length}` : null),
    createFact('Notes', site.notes),
  ]);
  const sequenceItems = buildSequenceItems(playbookItems);
  const spotlightItems = buildSpotlightItems([
    routeItems[0] ? createSpotlightItem('Road', routeItems[0].title, routeItems[0].subtitle, routeItems[0]) : null,
    pathItems[0] ? createSpotlightItem('Path', pathItems[0].title, pathItems[0].subtitle, pathItems[0]) : null,
    docItems[0] ? createSpotlightItem('Doc', docItems[0].title, docItems[0].subtitle, docItems[0]) : null,
    agentItems[0] ? createSpotlightItem('Agent', agentItems[0].title, agentItems[0].subtitle, agentItems[0]) : null,
    peerSiteItems[0] ? createSpotlightItem('Peer', peerSiteItems[0].title, peerSiteItems[0].subtitle, peerSiteItems[0]) : null,
    surfaceItems[0] ? createSpotlightItem('Media', surfaceItems[0].title, surfaceItems[0].subtitle, surfaceItems[0]) : null,
  ]);
  const clusterGroups = buildClusterGroups([
    buildClusterGroup('Entry', 'Primary path and road', compact([pathItems[0], routeItems[0], pathItems[1]])),
    buildClusterGroup('Operators', 'Named agents', agentItems),
    buildClusterGroup('References', 'Docs and canon', docItems),
    buildClusterGroup('Network', 'Peers and linked media', compact([peerSiteItems[0], peerSiteItems[1], surfaceItems[0]])),
  ]);
  const briefItems = buildBriefItems((config?.briefs || []).map((brief) => createBriefItem(
    brief.label,
    brief.title,
    brief.copy,
    { query: brief.query, href: brief.href, surfaceId: brief.surfaceId }
  )));
  const runbookItems = buildRunbookItems((config?.runbooks || []).map((runbook) => createRunbookItem(
    runbook.label,
    runbook.title,
    runbook.copy,
    runbook.actions || []
  )));
  const protocolItems = buildProtocolItems((config?.protocols || []).map((protocol) => createProtocolItem(
    protocol.label,
    protocol.title,
    protocol.stages || [],
    protocol.actions || []
  )));
  const tripwireItems = buildTripwireItems((config?.tripwires || []).map((tripwire) => createTripwireItem(
    tripwire.label,
    tripwire.title,
    tripwire.signal,
    tripwire.trigger,
    tripwire.response,
    tripwire.actions || []
  )));
  const decisionItems = buildDecisionItems((config?.decisions || []).map((decision) => createDecisionItem(
    decision.label,
    decision.title,
    decision.decision,
    decision.condition,
    decision.rationale,
    decision.actions || []
  )));
  const checkpointItems = buildCheckpointItems((config?.checkpoints || []).map((checkpoint) => createCheckpointItem(
    checkpoint.label,
    checkpoint.title,
    checkpoint.objective,
    checkpoint.proof,
    checkpoint.exit,
    checkpoint.actions || []
  )));
  const dependencyItems = buildDependencyItems((config?.dependencies || []).map((dependency) => createDependencyItem(
    dependency.label,
    dependency.title,
    dependency.reliesOn,
    dependency.watch,
    dependency.unlocks,
    dependency.actions || []
  )));
  const guardrailItems = buildGuardrailItems((config?.guardrails || []).map((guardrail) => createGuardrailItem(
    guardrail.label,
    guardrail.title,
    guardrail.preserve,
    guardrail.avoid,
    guardrail.recover,
    guardrail.actions || []
  )));
  const custodyItems = buildCustodyItems((config?.custody || []).map((custody) => createCustodyItem(
    custody.label,
    custody.title,
    custody.current,
    custody.sharedWith,
    custody.transfersTo,
    custody.actions || []
  )));
  const receiptItems = buildReceiptItems((config?.receipts || []).map((receipt) => createReceiptItem(
    receipt.label,
    receipt.title,
    receipt.sends,
    receipt.lands,
    receipt.confirms,
    receipt.actions || []
  )));
  const cadenceItems = buildCadenceItems((config?.cadence || []).map((cadence) => createCadenceItem(
    cadence.label,
    cadence.title,
    cadence.review,
    cadence.pulse,
    cadence.reset,
    cadence.actions || []
  )));
  const fallbackItems = buildFallbackItems((config?.fallbacks || []).map((fallback) => createFallbackItem(
    fallback.label,
    fallback.title,
    fallback.breaks,
    fallback.fallback,
    fallback.resume,
    fallback.actions || []
  )));
  const primerItems = buildPrimerItems((config?.primers || []).map((primer) => createPrimerItem(
    primer.label,
    primer.title,
    primer.start,
    primer.gather,
    primer.ready,
    primer.actions || []
  )));
  const boardColumns = buildBoardColumns(config?.board?.columns || []);

  return compact([
    metrics.length ? { kind: 'metrics', title: 'Workspace summary', note: 'Canon snapshot', items: metrics } : null,
    facts.length ? { kind: 'facts', title: 'Site facts', note: 'High-signal metadata', items: facts } : null,
    spotlightItems.length
      ? {
          kind: 'spotlight',
          title: 'Site spotlight',
          note: 'Highest-signal linked surfaces',
          items: spotlightItems,
        }
      : null,
    clusterGroups.length
      ? {
          kind: 'clusters',
          title: 'Site clusters',
          note: 'Grouped control-room lanes',
          groups: clusterGroups,
        }
      : null,
    briefItems.length
      ? {
          kind: 'briefs',
          title: 'Mission brief',
          note: 'Flagship-specific mission, watch, and escalation context',
          items: briefItems,
        }
      : null,
    runbookItems.length
      ? {
          kind: 'runbooks',
          title: 'Runbook cards',
          note: 'Concrete site plays for routing the next move',
          items: runbookItems,
        }
      : null,
    protocolItems.length
      ? {
          kind: 'protocols',
          title: 'Protocol cards',
          note: 'Stage-based site patterns for maintaining the active operating lane',
          items: protocolItems,
        }
      : null,
    tripwireItems.length
      ? {
          kind: 'tripwires',
          title: 'Tripwire cards',
          note: 'Signals that should immediately redirect the current site lane',
          items: tripwireItems,
        }
      : null,
    decisionItems.length
      ? {
          kind: 'decisions',
          title: 'Decision cards',
          note: 'Choices the current site lane should make before widening the route',
          items: decisionItems,
        }
      : null,
    checkpointItems.length
      ? {
          kind: 'checkpoints',
          title: 'Checkpoint cards',
          note: 'What this site lane must prove before handing work onward',
          items: checkpointItems,
        }
      : null,
    dependencyItems.length
      ? {
          kind: 'dependencies',
          title: 'Dependency cards',
          note: 'Critical upstream and downstream lanes shaping this site',
          items: dependencyItems,
        }
      : null,
    guardrailItems.length
      ? {
          kind: 'guardrails',
          title: 'Guardrail cards',
          note: 'Constraints this site should preserve while it operates',
          items: guardrailItems,
        }
      : null,
    custodyItems.length
      ? {
          kind: 'custody',
          title: 'Custody cards',
          note: 'Who currently holds the site room, who stays in the loop, and where it transfers next',
          items: custodyItems,
        }
      : null,
    receiptItems.length
      ? {
          kind: 'receipts',
          title: 'Receipt cards',
          note: 'Closed-loop confirmations that prove the site handoff actually landed',
          items: receiptItems,
        }
      : null,
    cadenceItems.length
      ? {
          kind: 'cadence',
          title: 'Cadence cards',
          note: 'The review rhythm that keeps the site room fresh after a handoff lands',
          items: cadenceItems,
        }
      : null,
    fallbackItems.length
      ? {
          kind: 'fallbacks',
          title: 'Fallback cards',
          note: 'Contingency routes for the moment the primary site lane stops holding',
          items: fallbackItems,
        }
      : null,
    primerItems.length
      ? {
          kind: 'primers',
          title: 'Primer cards',
          note: 'Setup steps before the briefing starts',
          items: primerItems,
        }
      : null,
    ritualItems.length
      ? {
          kind: 'rituals',
          title: 'Ritual cards',
          note: 'Recurring practices that keep the room moving',
          items: ritualItems,
        }
      : null,
    boardColumns.length
      ? {
          kind: 'board',
          title: config?.board?.title || 'Handoff board',
          note: config?.board?.note || 'Flagship-specific now / nearby / escalate lanes',
          columns: boardColumns,
        }
      : null,
    sequenceItems.length
      ? {
          kind: 'sequence',
          title: playbookConfig?.title || 'Operating sequence',
          note: playbookConfig?.note || `How ${site.title} typically unfolds inside the shell.`,
          items: sequenceItems,
        }
      : null,
  ]);
}

function buildProductPanel(route) {
  const product = findProductById(route.id);
  if (!product) {
    return {
      kicker: 'Product',
      title: route.name,
      description: route.description,
      actions: compact([{ label: `Open ${route.domain}`, href: route.url }]),
      sections: [],
    };
  }

  const categoryContext = PRODUCT_CATEGORY_CONTEXT[product.category] || {};
  const connectedProductItems = compact((product.connectedProducts || []).map((id) => {
    const connected = findProductById(id);
    if (!connected) return null;
    return {
      title: connected.name,
      subtitle: connected.oneLine,
      href: `?open=query:${encodeURIComponent(connected.id)}`,
    };
  }));
  const agentItems = product.agentLayer === 'all'
    ? compact([panelItemFromSystem('agents')])
    : agentItemsFromQueries([product.agentLayer]);
  const systemItems = systemItemsFromCommands(categoryContext.systems);
  const docItems = docItemsFromQueries(categoryContext.docs);
  const relatedSiteItems = compact([
    panelItemFromRoute(findRouteByDomain('docs.blackroad.io')),
    panelItemFromRoute(findRouteByDomain('status.blackroad.io')),
  ]);
  const guideSurface = ensureProductGuideSurface(product, route);
  const workspaceSurface = ensureProductWorkspaceSurface(product, route);

  return {
    kicker: `Product · ${product.category}`,
    title: product.name,
    description: product.longDescription,
    actions: compact([
      { label: `Open ${product.domain}`, href: route.url },
      workspaceSurface ? createAction('Open workspace', workspaceSurface) : null,
      createAction('Open product guide', guideSurface),
      product.agentLayer !== 'all' ? createAction(`Open ${product.agentLayer}`, ensureAgentSurface(findAgentEntry(product.agentLayer))) : null,
      createAction('Open products', findSystemByCommand('products') ? ensureSystemSurface(findSystemByCommand('products')) : null),
    ]),
    sections: compact([
      {
        title: 'Why this road exists',
        note: `For ${product.primaryUser} · replaces ${product.replaces}`,
        items: [{ title: product.name, subtitle: product.oneLine, href: route.url }],
      },
      connectedProductItems.length
        ? {
            title: 'Connected products',
            note: `${connectedProductItems.length} linked roads`,
            items: connectedProductItems,
          }
        : null,
      agentItems.length || systemItems.length || docItems.length
        ? {
            title: 'Operating context',
            note: 'Agents, systems, and canon references',
            items: compact([
              ...agentItems,
              ...systemItems,
              ...docItems,
            ]),
          }
        : null,
      {
        title: 'Launch surfaces',
        note: 'Direct product and adjacent infrastructure routes',
        items: relatedSiteItems,
      },
    ]),
  };
}

function productGuideSurfaceId(productId) {
  return `product-guide-${productId}`;
}

function productWorkspaceSurfaceId(productId) {
  return `product-workspace-${productId}`;
}

function buildProductGuidePanel(product, route) {
  const copy = getProductCopy(product.id);
  const workspaceSurface = ensureProductWorkspaceSurface(product, route);
  if (!copy) {
    return {
      kicker: `Guide · ${product.name}`,
      title: `${product.name} guide`,
      description: product.longDescription,
      actions: compact([
        { label: `Open ${product.domain}`, href: route.url },
        workspaceSurface ? createAction('Open workspace', workspaceSurface) : null,
      ]),
      sections: [],
    };
  }

  const questionItems = compact([
    { title: SITE_RULEBOOK[0], subtitle: copy.whatIsThis },
    { title: SITE_RULEBOOK[1], subtitle: copy.whoIsItFor },
    { title: SITE_RULEBOOK[2], subtitle: copy.whatDoesItReplace },
    { title: SITE_RULEBOOK[3], subtitle: copy.whatCanIDo },
    { title: SITE_RULEBOOK[4], subtitle: copy.whatDoesItConnect.join(' · ') },
    { title: SITE_RULEBOOK[5], subtitle: copy.whatDoesItRemember },
    { title: SITE_RULEBOOK[6], subtitle: copy.whatPermissions },
    { title: SITE_RULEBOOK[7], subtitle: copy.howToOpen },
  ]);

  return {
    kicker: copy.hero.eyebrow,
    title: `${product.name} guide`,
    description: copy.hero.subheadline,
    actions: compact([
      { label: copy.hero.primaryCTA.label, href: copy.hero.primaryCTA.url },
      { label: copy.hero.secondaryCTA.label, href: copy.hero.secondaryCTA.url },
      workspaceSurface ? createAction('Open workspace', workspaceSurface) : null,
      createAction('Open products', findSystemByCommand('products') ? ensureSystemSurface(findSystemByCommand('products')) : null),
    ]),
    sections: compact([
      {
        title: 'Rulebook',
        note: 'The 8 questions every road should answer',
        items: questionItems,
      },
      {
        title: 'Road framing',
        note: copy.footer.tagline,
        items: compact([
          { title: 'Primary user', subtitle: product.primaryUser },
          { title: 'Category', subtitle: product.category },
          { title: 'Surface kind', subtitle: product.surfaceKind },
          { title: 'Back to RoadOS', href: copy.footer.backToOS },
        ]),
      },
    ]),
  };
}

function ensureProductGuideSurface(product, route) {
  const id = productGuideSurfaceId(product.id);
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: `${product.name} guide`,
    subtitle: product.oneLine,
    kind: 'system',
    provider: 'blackroad-product-guide',
    url: route.url,
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: compact([...(product.tags || []), 'product-guide', product.id]),
    notes: product.longDescription,
    rail: 'none',
    order: 0,
    meta: {
      routeId: route.id,
      role: 'product guide',
      panel: buildProductGuidePanel(product, route),
    },
  });
}

function buildProductWorkspacePanel(product, route) {
  const config = FLAGSHIP_WORKSPACE_CONFIGS[product.id];
  const categoryContext = PRODUCT_CATEGORY_CONTEXT[product.category] || {};
  const playbookConfig = PRODUCT_CATEGORY_PLAYBOOKS[product.category] || null;
  const systemCommands = uniqueList([...(categoryContext.systems || []), ...(config?.systems || [])]);
  const routeIds = uniqueList([...(product.connectedProducts || []), ...(config?.routes || [])]);
  const docQueries = uniqueList([...(categoryContext.docs || []), ...(config?.docs || [])]);
  const systemItems = systemItemsFromCommands(systemCommands);
  const routeItems = routeItemsFromIds(routeIds);
  const docItems = docItemsFromQueries(docQueries);
  const agentQueries = product.agentLayer === 'all'
    ? uniqueList(config?.agents || [])
    : uniqueList([product.agentLayer, ...(config?.agents || [])]);
  const agentItems = compact([
    ...(product.agentLayer === 'all' ? [panelItemFromSystem('agents')] : []),
    ...agentItemsFromQueries(agentQueries),
  ]);
  const surfaceItems = surfaceItemsFromIds(config?.surfaces || []);
  const siteItems = siteItemsForProduct(product.id);
  const firstSiteDomain = relatedSiteDomainsForProduct(product.id)[0];
  const quickQueryItems = compact([
    { title: 'Open product route', subtitle: product.id, query: `open ${product.id}` },
    { title: 'Open status view', subtitle: `${product.name} status`, query: `status ${product.id}` },
    { title: 'Open trust view', subtitle: `${product.name} trust`, query: `trust ${product.id}` },
    { title: 'Open health view', subtitle: `${product.name} health`, query: `health ${product.id}` },
  ]);
  const playbookItems = uniqueQueryItems([
    createQueryItem('Boot road', product.oneLine, `open ${product.id}`),
    product.agentLayer === 'all'
      ? createQueryItem('Open agents', 'Operator roster', 'agents')
      : createQueryItem(`Open ${product.agentLayer}`, 'Primary operator', `agent ${product.agentLayer}`),
    docQueries[0] ? createQueryItem('Review canon', docQueries[0], `doc ${docQueries[0]}`) : null,
    routeIds[0] ? queryItemsFromRouteIds([routeIds[0]])[0] : null,
    firstSiteDomain ? createQueryItem(`Visit ${firstSiteDomain}`, 'Connected domain', `site ${firstSiteDomain}`) : null,
    ...playbookItemsFromEntries(playbookConfig?.queries || []),
  ]);
  const widgets = buildProductWorkspaceWidgets(product, config, routeIds, routeItems, docItems, agentItems, siteItems, surfaceItems, agentQueries, playbookConfig, playbookItems);
  const commandDeckItems = compact([
    createQueryItem(`open ${product.id}`, `${product.name} route`, `open ${product.id}`),
    product.agentLayer === 'all'
      ? createQueryItem('agents', 'Roster command', 'agents')
      : createQueryItem(`agent ${product.agentLayer}`, 'Primary operator', `agent ${product.agentLayer}`),
    ...queryItemsFromSystemCommands(systemCommands),
    ...queryItemsFromDocQueries(docQueries),
    ...queryItemsFromRouteIds(routeIds),
  ]);

  return {
    kicker: `Workspace · ${product.name}`,
    title: `${product.name} workspace`,
    description: config?.description || `${product.longDescription} This workspace collects the core routes, systems, docs, and operators around ${product.name}.`,
    widgets,
    actions: compact([
      { label: `Open ${product.domain}`, href: route.url },
      createAction('Open product guide', ensureProductGuideSurface(product, route)),
      { label: 'Run open command', query: `open ${product.id}` },
      createAction('Open products', findSystemByCommand('products') ? ensureSystemSurface(findSystemByCommand('products')) : null),
    ]),
    sections: compact([
      playbookItems.length
        ? {
            title: playbookConfig?.title || 'Operational playbook',
            note: playbookConfig?.note || `High-signal actions around ${product.name}.`,
            items: playbookItems,
          }
        : null,
      quickQueryItems.length
        ? {
            title: 'Quick commands',
            note: 'Run native shell actions in place',
            items: quickQueryItems,
          }
        : null,
      systemItems.length
        ? {
            title: 'Control surfaces',
            note: 'Core operating systems for this road',
            items: systemItems,
          }
        : null,
      routeItems.length
        ? {
            title: 'Connected roads',
            note: `${routeItems.length} adjacent product routes`,
            items: routeItems,
          }
        : null,
      siteItems.length
        ? {
            title: 'Connected sites',
            note: `${siteItems.length} domain surfaces tied to this road`,
            items: siteItems,
          }
        : null,
      commandDeckItems.length
        ? {
            title: 'Command deck',
            note: 'Canon-derived shell queries',
            items: commandDeckItems,
          }
        : null,
      docItems.length || agentItems.length
        ? {
            title: 'Execution context',
            note: 'Docs and named operators',
            items: compact([
              ...docItems,
              ...agentItems,
            ]),
          }
        : null,
      surfaceItems.length
        ? {
            title: 'Media and live surfaces',
            note: 'Embedded shell-native slots',
            items: surfaceItems,
          }
        : null,
    ]),
  };
}

function ensureProductWorkspaceSurface(product, route) {
  const id = productWorkspaceSurfaceId(product.id);
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: `${product.name} workspace`,
    subtitle: product.oneLine,
    kind: 'system',
    provider: 'blackroad-product-workspace',
    url: route.url,
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: compact([...(product.tags || []), 'product-workspace', product.id]),
    notes: product.longDescription,
    rail: 'none',
    order: 0,
    meta: {
      routeId: route.id,
      role: 'product workspace',
      panel: buildProductWorkspacePanel(product, route),
    },
  });
}

function buildSiteHref(baseUrl, path) {
  if (!path || path === '/') return baseUrl;
  const normalizedBase = String(baseUrl || '').replace(/\/$/, '');
  return `${normalizedBase}${path.startsWith('/') ? path : `/${path}`}`;
}

function buildSitePanel(route) {
  const site = findSiteByRoute(route);
  if (!site) {
    return {
      kicker: 'Site',
      title: route.name,
      description: route.description,
      actions: compact([{ label: `Open ${route.domain}`, href: route.url }]),
      sections: [],
    };
  }

  const typeContext = SITE_TYPE_CONTEXT[site.type] || {};
  const productItem = site.connectedProduct ? panelItemFromRoute(findRouteById(site.connectedProduct)) : null;
  const agentItems = compact([
    ...(site.connectedAgents || []).includes('all') ? [panelItemFromSystem('agents')] : [],
    ...agentItemsFromQueries((site.connectedAgents || []).filter((entry) => entry !== 'all')),
  ]);
  const systemItems = systemItemsFromCommands(typeContext.systems);
  const docItems = docItemsFromQueries(typeContext.docs);
  const routeItems = compact((site.routes || []).slice(0, 6).map((path) => ({
    title: path,
    subtitle: site.domain,
    href: buildSiteHref(route.url, path),
  })));
  const workspaceSurface = ensureSiteWorkspaceSurface(site, route);

  return {
    kicker: `Site · ${SITE_TYPES[site.type] || site.type}`,
    title: site.title,
    description: site.purpose,
    actions: compact([
      { label: site.primaryCTA || `Open ${site.domain}`, href: route.url },
      workspaceSurface ? createAction('Open workspace', workspaceSurface) : null,
      productItem?.surfaceId ? { label: `Open ${productItem.title}`, surfaceId: productItem.surfaceId } : null,
      createAction('Open site atlas', findSystemByCommand('sites') ? ensureSystemSurface(findSystemByCommand('sites')) : null),
    ]),
    sections: compact([
      {
        title: 'Site role',
        note: `Audience: ${site.audience} · status: ${site.status}`,
        items: compact([
          { title: site.domain, subtitle: site.notes || route.description, href: route.url },
          productItem,
        ]),
      },
      routeItems.length
        ? {
            title: 'Key routes',
            note: `${routeItems.length} public paths`,
            items: routeItems,
          }
        : null,
      agentItems.length || systemItems.length || docItems.length
        ? {
            title: 'Operating context',
            note: 'Agents, systems, and canon references',
            items: compact([
              ...agentItems,
              ...systemItems,
              ...docItems,
            ]),
          }
        : null,
    ]),
  };
}

function siteWorkspaceSurfaceId(siteId) {
  return `site-workspace-${siteId}`;
}

function buildSiteWorkspacePanel(site, route) {
  const config = FLAGSHIP_SITE_WORKSPACE_CONFIGS[site.id];
  const typeContext = SITE_TYPE_CONTEXT[site.type] || {};
  const playbookConfig = SITE_TYPE_PLAYBOOKS[site.type] || null;
  const systemCommands = uniqueList([...(typeContext.systems || []), ...(config?.systems || [])]);
  const docQueries = uniqueList([...(typeContext.docs || []), ...(config?.docs || [])]);
  const systemItems = systemItemsFromCommands(systemCommands);
  const docItems = docItemsFromQueries(docQueries);
  const agentQueries = uniqueList([
    ...((site.connectedAgents || []).filter((entry) => entry !== 'all')),
    ...(config?.agents || []),
  ]);
  const agentItems = compact([
    ...(site.connectedAgents || []).includes('all') ? [panelItemFromSystem('agents')] : [],
    ...agentItemsFromQueries(agentQueries),
  ]);
  const routeIds = uniqueList([
    ...(site.connectedProduct ? [site.connectedProduct] : []),
    ...(config?.routes || []),
  ]);
  const routeItems = routeItemsFromIds(routeIds);
  const surfaceItems = surfaceItemsFromIds(config?.surfaces || []);
  const peerSiteItems = relatedSiteItemsForSite(site);
  const firstPeerDomain = relatedSiteDomainsForSite(site)[0];
  const pathItems = compact((site.routes || []).slice(0, 6).map((path) => ({
    title: path,
    subtitle: site.domain,
    href: buildSiteHref(route.url, path),
  })));
  const quickQueryItems = compact([
    { title: 'Open site route', subtitle: site.domain, query: `site ${site.domain}` },
    site.connectedProduct ? { title: 'Open connected product', subtitle: site.connectedProduct, query: `open ${site.connectedProduct}` } : null,
    { title: 'Open docs hub', subtitle: 'System docs surface', query: 'docs' },
  ]);
  const playbookItems = uniqueQueryItems([
    createQueryItem('Enter site', site.purpose, `site ${site.domain}`),
    site.connectedProduct ? createQueryItem(`Open ${site.connectedProduct}`, 'Connected product', `open ${site.connectedProduct}`) : null,
    (site.connectedAgents || []).includes('all')
      ? createQueryItem('Open agents', 'Operator roster', 'agents')
      : agentQueries[0] ? createQueryItem(`Open ${agentQueries[0]}`, 'Named operator', `agent ${agentQueries[0]}`) : null,
    docQueries[0] ? createQueryItem('Review canon', docQueries[0], `doc ${docQueries[0]}`) : null,
    firstPeerDomain ? createQueryItem(`Visit ${firstPeerDomain}`, 'Adjacent domain', `site ${firstPeerDomain}`) : null,
    ...playbookItemsFromEntries(playbookConfig?.queries || []),
  ]);
  const widgets = buildSiteWorkspaceWidgets(site, config, pathItems, routeItems, docItems, agentItems, peerSiteItems, surfaceItems, agentQueries, playbookConfig, playbookItems);
  const commandDeckItems = compact([
    createQueryItem(`site ${site.domain}`, `${site.title} route`, `site ${site.domain}`),
    site.connectedProduct ? createQueryItem(`open ${site.connectedProduct}`, 'Connected product', `open ${site.connectedProduct}`) : null,
    ...(site.connectedAgents || []).includes('all') ? [createQueryItem('agents', 'Roster command', 'agents')] : [],
    ...queryItemsFromSystemCommands(systemCommands),
    ...queryItemsFromDocQueries(docQueries),
    ...queryItemsFromAgentQueries(agentQueries),
  ]);

  return {
    kicker: `Workspace · ${site.title}`,
    title: `${site.title} workspace`,
    description: config?.description || `${site.purpose} This workspace collects the key paths, canon references, and operator context around ${site.title}.`,
    widgets,
    actions: compact([
      { label: site.primaryCTA || `Open ${site.domain}`, href: route.url },
      { label: 'Run site command', query: `site ${site.domain}` },
      createAction('Open site atlas', findSystemByCommand('sites') ? ensureSystemSurface(findSystemByCommand('sites')) : null),
      site.connectedProduct ? { label: `Open ${site.connectedProduct}`, href: `?open=query:${encodeURIComponent(site.connectedProduct)}` } : null,
    ]),
    sections: compact([
      playbookItems.length
        ? {
            title: playbookConfig?.title || 'Operational playbook',
            note: playbookConfig?.note || `High-signal actions around ${site.title}.`,
            items: playbookItems,
          }
        : null,
      quickQueryItems.length
        ? {
            title: 'Quick commands',
            note: 'Run native shell actions in place',
            items: quickQueryItems,
          }
        : null,
      systemItems.length
        ? {
            title: 'Control surfaces',
            note: 'Core operating systems for this site',
            items: systemItems,
          }
        : null,
      pathItems.length
        ? {
            title: 'Key site paths',
            note: `${pathItems.length} direct routes`,
            items: pathItems,
          }
        : null,
      routeItems.length
        ? {
            title: 'Connected roads',
            note: `${routeItems.length} adjacent product routes`,
            items: routeItems,
          }
        : null,
      peerSiteItems.length
        ? {
            title: 'Site network',
            note: `${peerSiteItems.length} adjacent domain surfaces`,
            items: peerSiteItems,
          }
        : null,
      commandDeckItems.length
        ? {
            title: 'Command deck',
            note: 'Canon-derived shell queries',
            items: commandDeckItems,
          }
        : null,
      docItems.length || agentItems.length
        ? {
            title: 'Execution context',
            note: 'Docs and named operators',
            items: compact([
              ...docItems,
              ...agentItems,
            ]),
          }
        : null,
      surfaceItems.length
        ? {
            title: 'Live and media surfaces',
            note: 'Embedded shell-native slots',
            items: surfaceItems,
          }
        : null,
    ]),
  };
}

function ensureSiteWorkspaceSurface(site, route) {
  const id = siteWorkspaceSurfaceId(site.id);
  const existing = registry.get(id);
  if (existing) return existing;

  return registry.add({
    id,
    title: `${site.title} workspace`,
    subtitle: site.purpose,
    kind: 'system',
    provider: 'blackroad-site-workspace',
    url: route.url,
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: compact([site.type, 'site-workspace', site.id]),
    notes: site.purpose,
    rail: 'none',
    order: 0,
    meta: {
      routeId: route.id,
      role: 'site workspace',
      panel: buildSiteWorkspacePanel(site, route),
    },
  });
}

function routeItemsFromIds(ids = []) {
  return compact(ids.map((id) => panelItemFromRoute(findRouteById(id) || findRouteByDomain(id))));
}

function queryItemsFromRouteIds(ids = []) {
  return compact(uniqueList(ids).map((id) => {
    const route = findRouteById(id) || findRouteByDomain(id);
    if (!route) return null;
    const site = findSiteByRoute(route);
    if (site) {
      return createQueryItem(`site ${route.domain}`, route.name, `site ${route.domain}`);
    }
    return createQueryItem(`open ${route.id}`, route.name, `open ${route.id}`);
  }));
}

function docItemsFromQueries(queries = []) {
  return compact(queries.map((query) => panelItemFromDoc(findDocEntry(query))));
}

function queryItemsFromDocQueries(queries = []) {
  return compact(uniqueList(queries).map((query) => createQueryItem(`doc ${query}`, 'Canon doc', `doc ${query}`)));
}

function agentItemsFromQueries(queries = []) {
  return compact(queries.map((query) => panelItemFromAgent(findAgentEntry(query))));
}

function queryItemsFromAgentQueries(queries = []) {
  return compact(uniqueList(queries).map((query) => createQueryItem(`agent ${query}`, 'Named operator', `agent ${query}`)));
}

function systemItemsFromCommands(commands = []) {
  return compact(commands.map((command) => panelItemFromSystem(command)));
}

function queryItemsFromSystemCommands(commands = []) {
  return compact(uniqueList(commands).map((command) => (
    findSystemByCommand(command) ? createQueryItem(command, 'System command', command) : null
  )));
}

function surfaceItemsFromIds(ids = []) {
  return compact(ids.map((id) => panelItemFromSurface(registry.get(id))));
}

function relatedSiteDomainsForProduct(productId) {
  return uniqueList([
    'docs.blackroad.io',
    'status.blackroad.io',
    ...SITE_ROUTES
      .map((route) => findSiteByRoute(route))
      .filter((site) => site && site.type !== 'agent' && site.connectedProduct === productId)
      .map((site) => site.domain),
  ]);
}

function siteItemsForProduct(productId) {
  return compact(relatedSiteDomainsForProduct(productId).map((domain) => panelItemFromRoute(findRouteByDomain(domain))));
}

function relatedSiteDomainsForSite(site) {
  return uniqueList([
    ...SITE_ROUTES
      .map((route) => findSiteByRoute(route))
      .filter((candidate) => {
        if (!candidate || candidate.id === site.id) return false;
        if (site.type !== 'agent' && candidate.type === 'agent') return false;
        if (site.connectedProduct && candidate.connectedProduct === site.connectedProduct) return true;
        return candidate.type === site.type;
      })
      .map((candidate) => candidate.domain),
  ]).slice(0, 6);
}

function relatedSiteItemsForSite(site) {
  return compact(relatedSiteDomainsForSite(site).map((domain) => panelItemFromRoute(findRouteByDomain(domain))));
}

function surfaceFromSharedCommandResult(result) {
  if (!result || result.type === 'none') return null;

  const directSurface = result.surfaceId ? registry.get(result.surfaceId) : null;
  if (directSurface) return directSurface;

  if (result.type === 'product') {
    const route = findRouteById(result.targetId);
    return route ? ensureRouteSurface(route) : null;
  }

  if (result.type === 'site') {
    const route = findRouteById(result.targetId) || findRouteByDomain(result.targetId);
    return route ? ensureRouteSurface(route) : null;
  }

  if (result.type === 'agent') {
    const agent = AGENTS.find((entry) => entry.id === result.targetId) || AGENTS.find((entry) => canonMatchesQuery(entry, result.label));
    return agent ? ensureAgentSurface(agent) : null;
  }

  if (result.type === 'system') {
    const system = findSystemByCommand(result.targetId) || findSystemBySurfaceId(result.surfaceId) || findSystem(result.label);
    return system ? ensureSystemSurface(system) : null;
  }

  if (result.type === 'surface') {
    return registry.findByIdOrTitle(result.targetId);
  }

  if (result.url || result.message) {
    return ensureCommandSurface(result);
  }

  return null;
}

function buildHomeAppPanel(name) {
  const config = APP_PANEL_CONFIGS[name] || {};
  const targetQuery = APP_CANON_TARGETS[name];
  const primaryResult = targetQuery ? resolveSharedCommand(targetQuery) : null;
  const primarySurface = surfaceFromSharedCommandResult(primaryResult);
  const routeItems = routeItemsFromIds(config.routes);
  const domainItems = routeItemsFromIds(config.domains);
  const docItems = docItemsFromQueries(config.docs);
  const agentItems = agentItemsFromQueries(config.agents);
  const systemItems = systemItemsFromCommands(config.systems);
  const extraSurfaceItems = surfaceItemsFromIds(config.surfaces);

  return {
    kicker: `App · ${name}`,
    title: `${name}, remapped for BlackRoad`,
    description: config.description || `${name} opens as a curated BlackRoad-native experience instead of a third-party clone.`,
    actions: compact([
      createAction(primarySurface ? `Open ${primarySurface.title}` : `Open ${name}`, primarySurface),
      createAction('Open products', findSystemByCommand('products') ? ensureSystemSurface(findSystemByCommand('products')) : null),
      createAction('Open docs', findSystemByCommand('docs') ? ensureSystemSurface(findSystemByCommand('docs')) : null),
    ]),
    sections: compact([
      {
        title: 'Primary route',
        note: primarySurface ? 'BlackRoad replacement' : 'No primary surface',
        items: compact([
          primarySurface ? panelItemFromSurface(primarySurface, primarySurface.title, primarySurface.subtitle || primarySurface.notes) : null,
          ...routeItems,
        ]),
      },
      docItems.length || agentItems.length || systemItems.length || domainItems.length || extraSurfaceItems.length
        ? {
            title: 'Related surfaces',
            note: 'Curated supporting context',
            items: compact([
              ...systemItems,
              ...domainItems,
              ...docItems,
              ...agentItems,
              ...extraSurfaceItems,
            ]),
          }
        : null,
    ]),
  };
}

function buildCategoryPanel(name) {
  const config = CATEGORY_PANEL_CONFIGS[name];
  const matches = config ? [] : searchRoutes(name).slice(0, 8);
  const docMatches = config ? [] : searchCanon(DOCS, name).slice(0, 4);
  const agentMatches = config ? [] : searchCanon(AGENTS, name).slice(0, 4);
  const productsSystem = findSystemByCommand('products');
  const sitesSystem = findSystemByCommand('sites');
  const docsSystem = findSystemByCommand('docs');
  const fallbackRoutes = compact([
    findRouteById('roados'),
    findRouteById('roadtrip'),
    findRouteById('roadwork'),
    findRouteById('roadview'),
    findRouteById('roadbook'),
  ]);
  const curatedRouteItems = config ? routeItemsFromIds(config.routes) : [];
  const curatedDocItems = config ? docItemsFromQueries(config.docs) : [];
  const curatedAgentItems = config ? agentItemsFromQueries(config.agents) : [];
  const curatedSiteItems = config ? routeItemsFromIds(config.domains) : [];
  const routes = matches.length ? matches : fallbackRoutes;

  return {
    kicker: `RoadOS · ${name}`,
    title: `${name} sector`,
    description: config?.description || (matches.length
      ? `Canon-backed routes related to ${name.toLowerCase()} inside the BlackRoad shell.`
      : `No exact ${name.toLowerCase()} routes are canonized yet, so this sector falls back to the closest core surfaces and references.`),
    actions: compact([
      config && curatedRouteItems[0]
        ? { label: `Open ${curatedRouteItems[0].title}`, surfaceId: curatedRouteItems[0].surfaceId }
        : routes[0]
          ? { label: `Open ${routes[0].name}`, surfaceId: ensureRouteSurface(routes[0]).id }
          : null,
      productsSystem ? { label: 'Open products', surfaceId: ensureSystemSurface(productsSystem).id } : null,
      sitesSystem ? { label: 'Open sites', surfaceId: ensureSystemSurface(sitesSystem).id } : null,
      docsSystem ? { label: 'Open docs', surfaceId: ensureSystemSurface(docsSystem).id } : null,
    ]),
    sections: compact([
      {
        title: config ? 'Curated routes' : matches.length ? 'Matched routes' : 'Core fallback routes',
        note: config ? `${curatedRouteItems.length} curated surfaces` : `${routes.length} surfaces`,
        items: config ? curatedRouteItems : compact(routes.map((route) => panelItemFromRoute(route))),
      },
      config && curatedSiteItems.length
        ? {
            title: 'Related sites',
            note: `${curatedSiteItems.length} domain routes`,
            items: curatedSiteItems,
          }
        : null,
      (config ? curatedDocItems.length : docMatches.length)
        ? {
            title: 'Related docs',
            note: `${config ? curatedDocItems.length : docMatches.length} references`,
            items: config ? curatedDocItems : compact(docMatches.map((doc) => panelItemFromDoc(doc))),
          }
        : null,
      (config ? curatedAgentItems.length : agentMatches.length)
        ? {
            title: 'Related agents',
            note: `${config ? curatedAgentItems.length : agentMatches.length} operators`,
            items: config ? curatedAgentItems : compact(agentMatches.map((agent) => panelItemFromAgent(agent))),
          }
        : null,
    ]),
  };
}

function buildSystemPanel(system) {
  const docsRoute = findRouteByDomain('docs.blackroad.io');
  const statusRoute = findRouteByDomain('status.blackroad.io');
  const archiveRoute = findRouteByDomain('archive.blackroad.io');
  const liveRoute = findRouteByDomain('live.blackroad.io');
  const agentsRoute = findRouteByDomain('agents.blackroad.io');
  const atlasRoute = findRouteByDomain('atlas.blackroad.io');

  const panels = {
    agents: {
      kicker: 'System · Agent Directory',
      title: 'Agent command center',
      description: 'Open named Roadies, inspect their roles, and route deeper into agent-facing surfaces.',
      actions: compact([
        agentsRoute ? { label: 'Open agents.blackroad.io', href: agentsRoute.url } : null,
        atlasRoute ? { label: 'Open Atlas', href: atlasRoute.url } : null,
      ]),
      sections: [
        {
          title: 'Named Roadies',
          note: `${AGENTS.length} canonical agents`,
          items: compact(AGENTS.map((agent) => panelItemFromAgent(agent))),
        },
      ],
    },
    sites: {
      kicker: 'System · Site Atlas',
      title: 'BlackRoad site map',
      description: 'Core web territory routes for brand, runtime, utility, and infrastructure surfaces.',
      actions: compact([
        atlasRoute ? { label: 'Open atlas.blackroad.io', href: atlasRoute.url } : null,
        { label: 'Open blackroad.io', href: 'https://blackroad.io' },
      ]),
      sections: [
        {
          title: 'Core territory',
          items: compact([
            panelItemFromRoute(findRouteByDomain('blackroad.io')),
            panelItemFromRoute(findRouteByDomain('os.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('blackroad.me')),
            panelItemFromRoute(findRouteByDomain('blackroad.systems')),
            panelItemFromRoute(findRouteByDomain('blackroad.network')),
            panelItemFromRoute(findRouteByDomain('docs.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('status.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('archive.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('live.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('agents.blackroad.io')),
          ]),
        },
      ],
    },
    docs: {
      kicker: 'System · Documentation',
      title: 'Docs and operating references',
      description: 'Open the key documents that define routing, products, the filesystem, fleet, and the institutional canon.',
      actions: compact([
        docsRoute ? { label: 'Open docs.blackroad.io', href: docsRoute.url } : null,
        { label: 'Search docs', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'command-dock-routing')).id },
      ]),
      sections: [
        {
          title: 'Key docs',
          items: compact(DOCS.map((doc) => panelItemFromDoc(doc))),
        },
      ],
    },
    status: {
      kicker: 'System · Status',
      title: 'Operational status surfaces',
      description: 'Jump to fleet status, active runtime routes, and the core operating docs used to assess platform health.',
      actions: compact([
        statusRoute ? { label: 'Open status.blackroad.io', href: statusRoute.url } : null,
        { label: 'Open fleet status doc', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'fleet-status')).id },
      ]),
      sections: [
        {
          title: 'Runtime checkpoints',
          items: compact([
            panelItemFromRoute(findRouteByDomain('os.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('roadtrip.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('roadcode.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('roadwork.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('roadview.blackroad.io')),
            panelItemFromRoute(findRouteByDomain('fleet.blackroad.io')),
          ]),
        },
      ],
    },
    archive: {
      kicker: 'System · Archive',
      title: 'Archive and continuity',
      description: 'Saved media, canonical records, and RoadBook-facing archive surfaces.',
      actions: compact([
        archiveRoute ? { label: 'Open archive.blackroad.io', href: archiveRoute.url } : null,
        { label: 'Open RoadBook', surfaceId: ensureRouteSurface(PRODUCT_ROUTES.find((entry) => entry.id === 'roadbook')).id },
      ]),
      sections: [
        {
          title: 'Archive surfaces',
          items: compact([
            panelItemFromSurface(registry.get('roadbook-index'), 'BlackRoad Master Index', 'RoadBook archive surface'),
            panelItemFromSurface(registry.get('ia-prelinger-1')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'blackroad-index')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'memory')),
          ]),
        },
      ],
    },
    live: {
      kicker: 'System · Live',
      title: 'Live and media routing',
      description: 'Launch the live broadcast layer, agent commentary, and in-shell capture/media surfaces.',
      actions: compact([
        liveRoute ? { label: 'Open live.blackroad.io', href: liveRoute.url } : null,
        { label: 'Open screen capture', surfaceId: 'screen-capture' },
      ]),
      sections: [
        {
          title: 'Live surfaces',
          items: compact([
            panelItemFromSurface(registry.get('roadtrip-agent')),
            panelItemFromSurface(registry.get('screen-capture')),
            panelItemFromSurface(registry.get('yt-periscope-1')),
            panelItemFromSurface(registry.get('yt-periscope-4')),
            panelItemFromSurface(registry.get('direct-sample-mp4')),
          ]),
        },
      ],
    },
    products: {
      kicker: 'System · Product map',
      title: 'Canonical product routes',
      description: 'The 18 product endpoints routed inside the BlackRoad shell.',
      actions: [{ label: 'Open blackroad.io/products', href: system.url || 'https://blackroad.io/products' }],
      sections: [
        {
          title: 'Product surfaces',
          items: compact(PRODUCT_ROUTES.map((route) => panelItemFromRoute(route))),
        },
      ],
    },
    index: {
      kicker: 'System · Institutional Index',
      title: 'Index and canon anchors',
      description: 'Navigate the institutional sections that frame BlackRoad as a university-shaped operating system.',
      actions: compact([
        { label: 'Open index doc', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'blackroad-index')).id },
      ]),
      sections: [
        {
          title: 'Key sections',
          items: compact(
            [31, 45, 46, 61, 101, 111, 201].map((number) =>
              panelItemFromSection(SECTIONS.find((entry) => entry.number === number))
            )
          ),
        },
      ],
    },
    codex: {
      kicker: 'System · Codex',
      title: 'Codex and reusable knowledge',
      description: 'Reusable patterns, codified knowledge, and shell memory references.',
      actions: [{ label: 'Open CODEX.md surface', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'codex')).id }],
      sections: [
        {
          title: 'Related references',
          items: compact([
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'codex')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'memory')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'collab')),
          ]),
        },
      ],
    },
    todo: {
      kicker: 'System · Todo',
      title: 'Execution backlog',
      description: 'Work queue, launch tasks, and adjacent operational references.',
      actions: [{ label: 'Open BRTODO surface', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'brtodo')).id }],
      sections: [
        {
          title: 'Execution docs',
          items: compact([
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'brtodo')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'agent-entry')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'command_dock_routing')),
          ]),
        },
      ],
    },
    memory: {
      kicker: 'System · Memory',
      title: 'Memory and continuity',
      description: 'Persistence surfaces and continuity references used across the shell.',
      actions: [{ label: 'Open MEMORY.md surface', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'memory')).id }],
      sections: [
        {
          title: 'Continuity references',
          items: compact([
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'memory')),
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'blackroad-index')),
            panelItemFromSection(SECTIONS.find((entry) => entry.number === 60)),
          ]),
        },
      ],
    },
    collab: {
      kicker: 'System · Collaboration',
      title: 'Collaboration routes',
      description: 'Shared work surfaces across RoadTrip, CarPool, and collaboration docs.',
      actions: compact([
        { label: 'Open COLLAB.md surface', surfaceId: ensureDocSurface(DOCS.find((entry) => entry.id === 'collab')).id },
        { label: 'Open CarPool', surfaceId: ensureRouteSurface(PRODUCT_ROUTES.find((entry) => entry.id === 'carpool')).id },
      ]),
      sections: [
        {
          title: 'Shared work',
          items: compact([
            panelItemFromDoc(DOCS.find((entry) => entry.id === 'collab')),
            panelItemFromRoute(PRODUCT_ROUTES.find((entry) => entry.id === 'roadtrip')),
            panelItemFromRoute(PRODUCT_ROUTES.find((entry) => entry.id === 'carpool')),
            panelItemFromRoute(PRODUCT_ROUTES.find((entry) => entry.id === 'roadwork')),
          ]),
        },
      ],
    },
    settings: {
      kicker: 'System · Settings',
      title: 'Shell settings and identity',
      description: 'Settings routes remain conservative: identity, permissions, and the portable OS shell.',
      actions: compact([
        { label: 'Open RoadOS', surfaceId: ensureRouteSurface(PRODUCT_ROUTES.find((entry) => entry.id === 'roados')).id },
        { label: 'Open CarKeys', surfaceId: ensureRouteSurface(PRODUCT_ROUTES.find((entry) => entry.id === 'carkeys')).id },
      ]),
      sections: [],
    },
    roadnode: {
      kicker: 'System · RoadNode Opt-In',
      title: 'RoadNode is always opt-in',
      description: 'No hidden capture, no silent compute, no surprise network participation. RoadNode commands only route to explicit opt-in surfaces.',
      actions: compact([
        panelItemFromRoute(findRouteByDomain('blackroad.network')) ? { label: 'Open blackroad.network', surfaceId: ensureRouteSurface(findRouteByDomain('blackroad.network')).id } : null,
        panelItemFromRoute(findRouteByDomain('fleet.blackroad.io')) ? { label: 'Open fleet.blackroad.io', surfaceId: ensureRouteSurface(findRouteByDomain('fleet.blackroad.io')).id } : null,
      ]),
      sections: [],
    },
    capture: {
      kicker: 'System · Capture',
      title: 'Explicit screen capture',
      description: 'Screen capture stays user-initiated and visible inside the shell.',
      actions: [{ label: 'Start capture surface', surfaceId: 'screen-capture' }],
      sections: [
        {
          title: 'Related surfaces',
          items: compact([
            panelItemFromSurface(registry.get('screen-capture')),
            panelItemFromSurface(registry.get('direct-sample-mp4')),
            panelItemFromSurface(registry.get('roadtrip-agent')),
          ]),
        },
      ],
    },
  };

  return (
    panels[system.command] || {
      kicker: 'System',
      title: system.name,
      description: system.description,
      actions: compact([system.url ? { label: 'Open external surface', href: system.url } : null]),
      sections: [],
    }
  );
}

function routeMatchesQuery(route, query) {
  const lower = String(query || '').trim().toLowerCase();
  if (!lower) return false;
  return [route.id, route.name, route.domain, route.url, route.route, ...(route.aliases || []), ...(route.tags || [])]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase() === lower);
}

function searchRoutes(query) {
  const lower = String(query || '').trim().toLowerCase();
  if (!lower) return [];
  return ROUTES.filter((route) =>
    [route.id, route.name, route.domain, route.url, route.route, route.description, ...(route.aliases || []), ...(route.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(lower)
  );
}

function findRoute(query) {
  return ROUTES.find((route) => routeMatchesQuery(route, query)) || null;
}

function findSystemByCommand(command) {
  return SYSTEMS.find((entry) => entry.command === command) || null;
}

function findSystemBySurfaceId(surfaceId) {
  return SYSTEMS.find((entry) => entry.id === surfaceId) || null;
}

function findSystem(query) {
  return SYSTEMS.find((entry) => canonMatchesQuery(entry, query)) || null;
}

function canonMatchesQuery(entry, query) {
  const lower = String(query || '').trim().toLowerCase();
  if (!lower) return false;
  return [entry.id, entry.title, entry.name, entry.path, entry.domain, entry.role, entry.product, entry.description, ...(entry.aliases || []), ...(entry.tags || [])]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase() === lower);
}

function searchCanon(entries, query) {
  const lower = String(query || '').trim().toLowerCase();
  if (!lower) return [];
  return entries.filter((entry) =>
    [entry.id, entry.title, entry.name, entry.path, entry.domain, entry.role, entry.product, entry.description, entry.summary, ...(entry.aliases || []), ...(entry.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(lower)
  );
}

function createCanonSurfaceId(prefix, id) {
  return `${prefix}-${id}`;
}

function openSharedCommandResult(result, sourceEl, options = {}) {
  if (!result || result.type === 'none') return false;
  const surface = surfaceFromSharedCommandResult(result);
  if (!surface) return false;
  openSurface(surface, sourceEl, options);
  return true;
}

function openSharedSuggestion(suggestion, sourceEl) {
  const queryBuilders = {
    product: () => `open ${suggestion.id}`,
    agent: () => `agent ${suggestion.id}`,
    site: () => `site ${suggestion.id}`,
    system: () => `open ${suggestion.id}`,
  };
  const buildQuery = queryBuilders[suggestion.type];
  if (!buildQuery) return false;
  return openSharedCommandResult(resolveSharedCommand(buildQuery()), sourceEl);
}

function ensureAgentSurface(agent) {
  const id = createCanonSurfaceId('agent', agent.id);
  const existing = registry.get(id);
  if (existing) return existing;
  return registry.add({
    id,
    title: agent.name,
    subtitle: agent.role,
    kind: 'note',
    provider: 'blackroad-canon',
    url: agent.url,
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: agent.tags || ['agent'],
    notes: agent.description,
    rail: 'none',
    order: 0,
    meta: {
      role: agent.role,
      product: agent.product,
      domain: agent.domain,
    },
  });
}

function ensureDocSurface(doc) {
  const id = createCanonSurfaceId('doc', doc.id);
  const existing = registry.get(id);
  if (existing) return existing;
  return registry.add({
    id,
    title: doc.title,
    subtitle: doc.summary,
    kind: 'note',
    provider: 'blackroad-canon',
    url: '',
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: doc.tags || ['doc'],
    notes: doc.description,
    rail: 'none',
    order: 0,
    meta: {
      path: doc.path,
    },
  });
}

function ensureSectionSurface(section) {
  const id = createCanonSurfaceId('section', section.id);
  const existing = registry.get(id);
  if (existing) return existing;
  return registry.add({
    id,
    title: `Section ${section.number}: ${section.title}`,
    subtitle: 'Institutional Index',
    kind: 'note',
    provider: 'blackroad-canon',
    url: '',
    embedUrl: '',
    thumbnail: null,
    status: 'ready',
    rights: 'owned',
    captureable: false,
    tags: section.tags || ['section'],
    notes: section.description,
    rail: 'none',
    order: 0,
    meta: {
      number: section.number,
    },
  });
}

function findAppIcon(name) {
  const match = document.querySelector(`.app[data-app-name="${CSS.escape(name)}"] .icon`);
  if (!match) return refs.searchButton;
  const rect = match.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? match : refs.searchButton;
}

function sanitizeBootstrapValue(value) {
  return String(value || '').trim().replace(/\+/g, ' ');
}

function openBootstrapTarget(kind, target, options = {}) {
  const value = sanitizeBootstrapValue(target);
  if (!value) return false;

  if (kind === 'category') {
    if (!ROADOS_CATEGORIES.includes(value)) return false;
    openRoadOSCategory(value, { silent: true, replaceHistory: options.replaceHistory });
    finishOpen('app', 'RoadOS', BOOTSTRAP_SOURCE);
    return true;
  }

  if (kind === 'app') {
    const match = HOME_APPS.find((entry) => entry.toLowerCase() === value.toLowerCase());
    if (!match) return false;
    openApp(match, findAppIcon(match));
    return true;
  }

  if (kind === 'surface') {
    const surface = registry.get(value) || registry.findByIdOrTitle(value);
    if (!surface) return false;
    openSurface(surface, BOOTSTRAP_SOURCE);
    return true;
  }

  if (kind === 'query') {
    return openQueryTarget(value);
  }

  return false;
}

function applyLocationState(options = {}) {
  const params = new URLSearchParams(window.location.search);
  const openParam = sanitizeBootstrapValue(params.get('open'));
  if (openParam) {
    const [kind, ...rest] = openParam.split(':');
    if (openBootstrapTarget(kind, rest.join(':'), options)) return true;
  }

  const surfaceParam = sanitizeBootstrapValue(params.get('surface'));
  if (surfaceParam && openBootstrapTarget('surface', surfaceParam, options)) return true;

  const queryParam = sanitizeBootstrapValue(params.get('q'));
  if (queryParam) return openBootstrapTarget('query', queryParam, options);
  return false;
}

function handleBootstrapNavigation() {
  return applyLocationState({ replaceHistory: true });
}

function restoreLocationState() {
  suppressLocationSync = true;
  try {
    if (state.openKey || state.roadosMode) {
      showAppsGrid();
    }
    if (!applyLocationState({ replaceHistory: true })) {
      showAppsGrid();
    }
  } finally {
    suppressLocationSync = false;
  }
}

function openQueryTarget(query, options = {}) {
  const sourceEl = options.sourceEl || refs.searchButton;
  const replace = Boolean(options.replace);
  const directSurface = registry.findByIdOrTitle(query);
  if (directSurface) {
    openSurface(
      directSurface,
      document.querySelector(`[data-surface-id="${directSurface.id}"]`) || sourceEl,
      { replace }
    );
    return true;
  }

  const exactApp = [...HOME_APPS, ...ROADOS_CATEGORIES].find(
    (entry) => entry.toLowerCase() === query.toLowerCase()
  );
  if (exactApp) {
    if (replace) return false;
    openApp(exactApp, findAppIcon(exactApp));
    return true;
  }

  const sharedResult = resolveSharedCommand(query);
  if (sharedResult.type !== 'search' && openSharedCommandResult(sharedResult, sourceEl, { replace })) {
    return true;
  }

  const doc = DOCS.find((entry) => canonMatchesQuery(entry, query));
  if (doc) {
    openSurface(ensureDocSurface(doc), sourceEl, { replace });
    return true;
  }

  const section = SECTIONS.find((entry) => canonMatchesQuery(entry, query));
  if (section) {
    openSurface(ensureSectionSurface(section), sourceEl, { replace });
    return true;
  }

  return false;
}

function describeMatches(label, items) {
  if (!items.length) return;
  logLine(`${label}: ${items.map((item) => item.title || item).join(', ')}`);
}

function performSearch(query) {
  const value = String(query || '').trim();
  if (!value) {
    showToast('TYPE A QUERY');
    return;
  }

  if (openQueryTarget(value)) return;

  const sharedResult = resolveSharedCommand(value);
  const surfaceMatches = registry.search(value);
  const appMatches = [...HOME_APPS, ...ROADOS_CATEGORIES].filter((entry) =>
    entry.toLowerCase().includes(value.toLowerCase())
  );
  const commandMatches = searchSharedCommands(value, 12);
  const docMatches = searchCanon(DOCS, value);
  const sectionMatches = searchCanon(SECTIONS, value);

  if (surfaceMatches.length === 1 && !appMatches.length && !commandMatches.length && !docMatches.length && !sectionMatches.length) {
    openSurface(
      surfaceMatches[0],
      document.querySelector(`[data-surface-id="${surfaceMatches[0].id}"]`) || refs.searchButton
    );
    return;
  }

  if (appMatches.length === 1 && !surfaceMatches.length && !commandMatches.length && !docMatches.length && !sectionMatches.length) {
    openApp(appMatches[0], findAppIcon(appMatches[0]));
    return;
  }

  if (commandMatches.length === 1 && !surfaceMatches.length && !appMatches.length && !docMatches.length && !sectionMatches.length) {
    if (openSharedSuggestion(commandMatches[0], refs.searchButton)) return;
  }

  if (docMatches.length === 1 && !surfaceMatches.length && !appMatches.length && !commandMatches.length && !sectionMatches.length) {
    openSurface(ensureDocSurface(docMatches[0]), refs.searchButton);
    return;
  }

  if (sectionMatches.length === 1 && !surfaceMatches.length && !appMatches.length && !commandMatches.length && !docMatches.length) {
    openSurface(ensureSectionSurface(sectionMatches[0]), refs.searchButton);
    return;
  }

  if (!surfaceMatches.length && !appMatches.length && !commandMatches.length && !docMatches.length && !sectionMatches.length) {
    if (sharedResult.type === 'search' && openSharedCommandResult(sharedResult, refs.searchButton)) return;
    showToast(`NO MATCH FOR ${value.toUpperCase()}`);
    logLine(`SEARCH ${value} (no matches)`);
    return;
  }

  showToast(`${surfaceMatches.length + appMatches.length + commandMatches.length + docMatches.length + sectionMatches.length} RESULTS`);
  logLine(`SEARCH ${value}`);
  describeMatches('surfaces', surfaceMatches);
  describeMatches('apps', appMatches);
  describeMatches('shared', commandMatches.map((entry) => `${entry.type} · ${entry.label} · ${entry.detail}`));
  describeMatches('docs', docMatches.map((doc) => doc.title));
  describeMatches('sections', sectionMatches.map((section) => `${section.number} · ${section.title}`));
}

function listSurfaces() {
  logLine(`SURFACES ${registry.list().length}`);
  registry.list().forEach((surface) => {
    logLine(`- ${surface.id} · ${surface.kind} · ${surface.provider} · ${surface.status}`);
  });
}

function listRoutes(kind) {
  const routes = kind ? ROUTES.filter((route) => route.kind === kind) : ROUTES;
  logLine(`${kind ? kind.toUpperCase() : 'ROUTES'} ${routes.length}`);
  routes.forEach((route) => {
    logLine(`- ${route.name} · ${route.domain}`);
  });
}

function listCanon(label, entries, formatter) {
  logLine(`${label.toUpperCase()} ${entries.length}`);
  entries.forEach((entry) => {
    logLine(`- ${formatter(entry)}`);
  });
}

function openFirstCanonMatch(entries, query, ensureSurface, label) {
  const direct = entries.find((entry) => canonMatchesQuery(entry, query));
  const match = direct || searchCanon(entries, query)[0];
  if (!match) {
    logLine(`${label.toUpperCase()} ${query} (not found)`);
    return false;
  }
  openSurface(ensureSurface(match), refs.runButton);
  return true;
}

function runCommand() {
  const value = String(refs.cmd.value || '').trim();
  if (!value) return;

  logLine(`~ $ ${value}`);
  refs.cmd.value = '';
  const lower = value.toLowerCase();

  if (lower === 'help') {
    logLine('commands: help, clear, open <name|surface-id|domain>, search <query>, surfaces, routes, products, domains, systems, agents, docs, sections, agent <name>, doc <name>, section <id>, site <domain>, product <name>, capture, record');
    return;
  }

  if (['agents', 'sites', 'docs', 'status', 'archive', 'live', 'settings', 'roadnode', 'index', 'codex', 'todo', 'products', 'memory', 'collab'].includes(lower)) {
    if (!openQueryTarget(lower)) logLine(`${lower.toUpperCase()} (not found)`);
    return;
  }

  if (lower === 'clear') {
    refs.term.textContent = '';
    return;
  }

  if (lower === 'surfaces') {
    listSurfaces();
    return;
  }

  if (lower === 'routes') {
    listRoutes();
    return;
  }

  if (lower === 'products') {
    listRoutes('product');
    return;
  }

  if (lower === 'domains') {
    listRoutes('site');
    return;
  }

  if (lower === 'systems') {
    listCanon('systems', SYSTEMS, (entry) => `${entry.command} · ${entry.name}`);
    return;
  }

  if (lower === 'agents') {
    listCanon('agents', AGENTS, (entry) => `${entry.name} · ${entry.role}`);
    return;
  }

  if (lower === 'docs') {
    listCanon('docs', DOCS, (entry) => `${entry.title} · ${entry.path}`);
    return;
  }

  if (lower === 'sections') {
    listCanon('sections', SECTIONS, (entry) => `${entry.number} · ${entry.title}`);
    return;
  }

  if (lower === 'capture') {
    openSurface(registry.get('screen-capture'), document.querySelector('[data-surface-id="screen-capture"]') || refs.runButton);
    return;
  }

  if (lower === 'record') {
    logLine('RECORD is reserved for a later MediaRecorder pass. Rights warning remains in effect.');
    return;
  }

  if (lower.startsWith('doc ')) {
    openFirstCanonMatch(DOCS, value.slice(4).trim(), ensureDocSurface, 'doc');
    return;
  }

  if (lower.startsWith('section ')) {
    openFirstCanonMatch(SECTIONS, value.slice(8).trim(), ensureSectionSurface, 'section');
    return;
  }

  if (openSharedCommandResult(resolveSharedCommand(value), refs.runButton)) {
    return;
  }

  logLine(`UNKNOWN: ${value}`);
}

function bindEvents() {
  refs.appClose.addEventListener('click', closeRoute);
  refs.searchButton.addEventListener('click', () => performSearch(refs.q.value));
  refs.runButton.addEventListener('click', runCommand);
  window.addEventListener('popstate', restoreLocationState);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement === refs.q) performSearch(refs.q.value);
    if (event.key === 'Enter' && document.activeElement === refs.cmd) runCommand();
    if (event.key === '/' && document.activeElement !== refs.q) {
      event.preventDefault();
      refs.q.focus();
    }
    if (event.key === 'Escape' && state.openKey) {
      event.preventDefault();
      closeRoute();
    }
  });
}

tickClock();
window.setInterval(tickClock, 1000);
renderApps();
renderRails();
bindEvents();
handleBootstrapNavigation();
logLine(`ready · ${registry.list().length} surfaces loaded`);
window.setTimeout(() => refs.q.focus(), 250);
