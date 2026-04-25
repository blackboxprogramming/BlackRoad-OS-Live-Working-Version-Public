// BlackRoad OS — Command Registry
// Every command the dock understands, registry-driven from products/sites/agents

import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { UNIVERSAL_COPY } from '../productCopy.js';

// 27 agents
const AGENTS = [
  { id: 'roadie', name: 'Roadie', role: 'Personal operator assistant' },
  { id: 'lucidia', name: 'Lucidia', role: 'System narrator / memory / architecture guide' },
  { id: 'cecilia', name: 'Cecilia', role: 'AI engineer' },
  { id: 'octavia', name: 'Octavia', role: 'DevOps lead' },
  { id: 'alice', name: 'Alice', role: 'Gateway / network manager' },
  { id: 'aria', name: 'Aria', role: 'Audio / network / media routing' },
  { id: 'gematria', name: 'Gematria', role: 'Edge compute / math / infrastructure' },
  { id: 'anastasia', name: 'Anastasia', role: 'Cloud architect' },
  { id: 'alexandria', name: 'Alexandria', role: 'Knowledge manager' },
  { id: 'theodosia', name: 'Theodosia', role: 'QA engineer' },
  { id: 'sophia', name: 'Sophia', role: 'Research scientist' },
  { id: 'sapphira', name: 'Sapphira', role: 'Analytics lead' },
  { id: 'seraphina', name: 'Seraphina', role: 'AI safety lead' },
  { id: 'gaia', name: 'Gaia', role: 'Sustainability / environment' },
  { id: 'portia', name: 'Portia', role: 'Legal and compliance' },
  { id: 'atticus', name: 'Atticus', role: 'Documentation' },
  { id: 'cicero', name: 'Cicero', role: 'Communications' },
  { id: 'valeria', name: 'Valeria', role: 'Product manager' },
  { id: 'ophelia', name: 'Ophelia', role: 'Community' },
  { id: 'lyra', name: 'Lyra', role: 'Music and media' },
  { id: 'calliope', name: 'Calliope', role: 'Content creator' },
  { id: 'thalia', name: 'Thalia', role: 'UX / design' },
  { id: 'celeste', name: 'Celeste', role: 'Frontend' },
  { id: 'elias', name: 'Elias', role: 'Data' },
  { id: 'silas', name: 'Silas', role: 'Security' },
  { id: 'sebastian', name: 'Sebastian', role: 'Backend' },
  { id: 'olympia', name: 'Olympia', role: 'Performance / robotics / fleet testing' }
];

// Product aliases (space-separated variants → canonical id)
const PRODUCT_ALIASES = {
  'os': 'roados', 'blackroad os': 'roados', 'road os': 'roados',
  'pit stop': 'pitstop', 'pitstop': 'pitstop',
  'car keys': 'carkeys', 'carkeys': 'carkeys',
  'road side': 'roadside', 'roadside': 'roadside',
  'road chain': 'roadchain', 'roadchain': 'roadchain',
  'road coin': 'roadcoin', 'roadcoin': 'roadcoin',
  'road book': 'roadbook', 'roadbook': 'roadbook',
  'road world': 'roadworld', 'roadworld': 'roadworld',
  'road view': 'roadview', 'roadview': 'roadview',
  'road band': 'roadband', 'roadband': 'roadband',
  'high way': 'highway', 'highway': 'highway',
  'office road': 'roadwork', 'officeroad': 'roadwork',
  'black board': 'blackboard', 'blackboard': 'blackboard',
  'car pool': 'carpool', 'carpool': 'carpool',
  'one way': 'oneway', 'oneway': 'oneway',
  'road code': 'roadcode', 'roadcode': 'roadcode',
  'road trip': 'roadtrip', 'roadtrip': 'roadtrip',
  'road work': 'roadwork', 'roadwork': 'roadwork',
  'back road': 'backroad', 'backroad': 'backroad',
  'road ie': 'pitstop'
};

// Agent aliases
const AGENT_ALIASES = {
  'colliope': 'calliope',
  'cece': 'cecilia',
  'ceci': 'cecilia',
  'alex': 'alexandria',
  'theo': 'theodosia',
  'sera': 'seraphina',
  'seb': 'sebastian'
};

// System surface commands
const SYSTEM_COMMANDS = {
  'agents': { surfaceId: 'system:agents', url: 'https://agents.blackroad.io', label: 'Agents' },
  'sites': { surfaceId: 'system:sites', url: 'https://atlas.blackroad.io', label: 'Sites' },
  'docs': { surfaceId: 'system:docs', url: 'https://docs.blackroad.io', label: 'Docs' },
  'status': { surfaceId: 'system:status', url: 'https://status.blackroad.io', label: 'Status' },
  'archive': { surfaceId: 'system:archive', url: 'https://archive.blackroad.io', label: 'Archive' },
  'live': { surfaceId: 'system:live', url: 'https://live.blackroad.io', label: 'Live' },
  'capture': { surfaceId: 'system:capture', url: null, label: 'Screen Capture' },
  'settings': { surfaceId: 'system:settings', url: null, label: 'Settings' },
  'trust': { surfaceId: 'system:trust', url: 'https://security.blackroad.io', label: 'Trust' },
  'roadnode': { surfaceId: 'system:roadnode', url: null, label: 'RoadNode Opt-In' },
  'index': { surfaceId: 'system:index', url: null, label: 'Institutional Index' },
  'codex': { surfaceId: 'system:codex', url: null, label: 'Codex' },
  'todo': { surfaceId: 'system:todo', url: null, label: 'TODO' },
  'products': { surfaceId: 'system:products', url: 'https://blackroad.io/products', label: 'Products' },
  'memory': { surfaceId: 'system:memory', url: null, label: 'Memory' },
  'collab': { surfaceId: 'system:collab', url: null, label: 'Collaboration' },
  'doctor': { surfaceId: 'blackroad-doctor', url: null, label: 'BlackRoad Doctor' },
  'launch control': { surfaceId: 'blackroad-doctor', url: null, label: 'Launch Control' },
  'launch': { surfaceId: 'blackroad-doctor', url: null, label: 'Launch Control' },
  'ship check': { surfaceId: 'blackroad-doctor', url: null, label: 'Ship Check' },
  'status all': { surfaceId: 'blackroad-doctor', url: null, label: 'Status All' },
  'launch queue': { surfaceId: 'launch-queue', url: null, label: 'Launch Queue' },
  'safe fixes': { surfaceId: 'launch-queue', url: null, label: 'Safe Fixes' },
  'fix plan': { surfaceId: 'launch-queue', url: null, label: 'Fix Plan' },
  'priority zero': { surfaceId: 'launch-queue', url: null, label: 'Priority Zero' },
  'next task': { surfaceId: 'launch-queue', url: null, label: 'Next Task' },
  'what is broken': { surfaceId: 'blackroad-doctor', url: null, label: 'What Is Broken' },
  'what can ship': { surfaceId: 'launch-queue', url: null, label: 'What Can Ship' },
  'safe patches': { surfaceId: 'safe-patch-executor', url: null, label: 'Safe Patches' },
  'patch preview': { surfaceId: 'safe-patch-executor', url: null, label: 'Patch Preview' },
  'safe patch': { surfaceId: 'safe-patch-executor', url: null, label: 'Safe Patch' },
  'patch verify': { surfaceId: 'safe-patch-executor', url: null, label: 'Patch Verify' },
  'patch rollback': { surfaceId: 'safe-patch-executor', url: null, label: 'Patch Rollback' },
  'apply safe fixes': { surfaceId: 'safe-patch-executor', url: null, label: 'Apply Safe Fixes' },
  'release': { surfaceId: 'release-control', url: null, label: 'Release Control' },
  'release control': { surfaceId: 'release-control', url: null, label: 'Release Control' },
  'preview deploy': { surfaceId: 'release-control', url: null, label: 'Preview Deploy' },
  'release gates': { surfaceId: 'release-control', url: null, label: 'Release Gates' },
  'staging plan': { surfaceId: 'release-control', url: null, label: 'Staging Plan' },
  'production plan': { surfaceId: 'release-control', url: null, label: 'Production Plan' },
  'rollback plan': { surfaceId: 'release-control', url: null, label: 'Rollback Plan' },
  'can ship': { surfaceId: 'release-control', url: null, label: 'Can Ship' },
  'release status': { surfaceId: 'release-control', url: null, label: 'Release Status' }
};

// RoadNode trigger phrases
const ROADNODE_TRIGGERS = ['open roadnode', 'enable roadnode', 'become node', 'join fleet', 'roadnode'];

// RoadOS trigger phrases
const ROADOS_TRIGGERS = ['open os', 'open roados', 'what is roados', 'what is road os'];

export {
  AGENTS,
  PRODUCT_ALIASES,
  AGENT_ALIASES,
  SYSTEM_COMMANDS,
  ROADNODE_TRIGGERS,
  ROADOS_TRIGGERS
};

// Lookup helpers
export const getAgent = (id) => AGENTS.find(a => a.id === id);
export const resolveProductAlias = (alias) => PRODUCT_ALIASES[alias] || null;
export const resolveAgentAlias = (alias) => AGENT_ALIASES[alias] || null;
export const isRoadNodeTrigger = (input) => ROADNODE_TRIGGERS.includes(input.toLowerCase().trim());
export const isRoadOSTrigger = (input) => ROADOS_TRIGGERS.includes(input.toLowerCase().trim());
