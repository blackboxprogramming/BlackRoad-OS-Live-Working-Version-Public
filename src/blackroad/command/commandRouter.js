// BlackRoad OS — Command Router
// Routes parsed commands to destinations using registries

import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';
import { UNIVERSAL_COPY } from '../productCopy.js';
import {
  AGENTS, PRODUCT_ALIASES, AGENT_ALIASES, SYSTEM_COMMANDS,
  isRoadNodeTrigger, isRoadOSTrigger, resolveProductAlias, resolveAgentAlias
} from './commandRegistry.js';
import { parse } from './commandParser.js';

const OS_BASE = 'https://os.blackroad.io';

// Build a command result
function result(query, type, targetId, label, url, surfaceId, confidence, action, message = '') {
  return { query, type, targetId, label, url, surfaceId, confidence, action, message };
}

// Try to match a product by id or alias
function matchProduct(target) {
  // Direct id match
  const direct = PRODUCTS.find(p => p.id === target);
  if (direct) return direct;

  // Alias match
  const aliasId = resolveProductAlias(target);
  if (aliasId) return PRODUCTS.find(p => p.id === aliasId);

  // Name match (case-insensitive)
  return PRODUCTS.find(p => p.name.toLowerCase() === target);
}

// Try to match an agent by id or alias
function matchAgent(target) {
  const resolved = resolveAgentAlias(target) || target;
  return AGENTS.find(a => a.id === resolved);
}

// Try to match a site by domain or id
function matchSite(target) {
  return SITES.find(s =>
    s.domain === target ||
    s.id === target ||
    s.domain.startsWith(target + '.') ||
    s.title.toLowerCase() === target
  );
}

// Main routing function
export function route(raw) {
  const cmd = parse(raw);
  const { verb, target } = cmd;
  const query = cmd.raw;

  if (!target && !verb) {
    return result(query, 'none', null, null, null, null, 0, 'error', 'Empty command');
  }

  // RoadNode safety gate
  if (isRoadNodeTrigger(query)) {
    return result(query, 'system', 'roadnode', 'RoadNode Opt-In', null, 'system:roadnode', 1.0, 'open',
      UNIVERSAL_COPY.roadNodeConsent);
  }

  // RoadOS info
  if (isRoadOSTrigger(query)) {
    return result(query, 'product', 'roados', 'RoadOS', OS_BASE, 'roados', 1.0, 'open',
      UNIVERSAL_COPY.roadOsDescription);
  }

  const effectiveTarget = target || '';

  switch (verb) {
    case 'open': {
      // System commands
      if (SYSTEM_COMMANDS[effectiveTarget]) {
        const sys = SYSTEM_COMMANDS[effectiveTarget];
        return result(query, 'system', effectiveTarget, sys.label, sys.url, sys.surfaceId, 1.0, 'open');
      }
      // Product
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'product', product.id, product.name,
          `${OS_BASE}?surface=${product.id}`, product.id, 1.0, 'open');
      }
      // Agent
      const agent = matchAgent(effectiveTarget);
      if (agent) {
        return result(query, 'agent', agent.id, agent.name,
          `${OS_BASE}?surface=agent:${agent.id}`, `agent:${agent.id}`, 1.0, 'open');
      }
      // Site
      const site = matchSite(effectiveTarget);
      if (site) {
        return result(query, 'site', site.id, site.title,
          `${OS_BASE}?surface=site:${site.id}`, `site:${site.id}`, 1.0, 'open');
      }
      break;
    }

    case 'search': {
      return result(query, 'search', null, `Search: ${effectiveTarget}`,
        `${OS_BASE}?surface=roadview&q=${encodeURIComponent(effectiveTarget)}`,
        'roadview', 0.9, 'search');
    }

    case 'docs': {
      return result(query, 'docs', null, `Docs: ${effectiveTarget}`,
        `https://docs.blackroad.io/search?q=${encodeURIComponent(effectiveTarget)}`,
        'system:docs', 0.9, 'search');
    }

    case 'agent': {
      const agent = matchAgent(effectiveTarget);
      if (agent) {
        return result(query, 'agent', agent.id, agent.name,
          `${OS_BASE}?surface=agent:${agent.id}`, `agent:${agent.id}`, 1.0, 'open');
      }
      break;
    }

    case 'site': {
      const site = matchSite(effectiveTarget);
      if (site) {
        return result(query, 'site', site.id, site.title,
          `${OS_BASE}?surface=site:${site.id}`, `site:${site.id}`, 1.0, 'open');
      }
      break;
    }

    case 'product': {
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'product', product.id, product.name,
          `${OS_BASE}?surface=${product.id}`, product.id, 1.0, 'open');
      }
      break;
    }

    case 'go': {
      return result(query, 'site', null, effectiveTarget,
        `https://${effectiveTarget}`, `site:${effectiveTarget}`, 0.7, 'open');
    }

    case 'status': {
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'status', product.id, `${product.name} Status`,
          `https://status.blackroad.io/products/${product.id}`,
          `status:${product.id}`, 1.0, 'open');
      }
      return result(query, 'status', null, 'Status',
        'https://status.blackroad.io', 'system:status', 0.8, 'open');
    }

    case 'trust': {
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'trust', product.id, `${product.name} Trust`,
          `https://${product.domain}/trust`, `trust:${product.id}`, 1.0, 'open');
      }
      return result(query, 'trust', null, 'Trust',
        'https://security.blackroad.io', 'system:trust', 0.8, 'open');
    }

    case 'health': {
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'health', product.id, `${product.name} Health`,
          `https://${product.domain}/health.json`, `health:${product.id}`, 1.0, 'open');
      }
      break;
    }

    case 'surface': {
      return result(query, 'surface', effectiveTarget, effectiveTarget,
        `${OS_BASE}?surface=${effectiveTarget}`, effectiveTarget, 0.8, 'open');
    }

    case 'implicit': {
      // Try product, agent, site, system in order
      const product = matchProduct(effectiveTarget);
      if (product) {
        return result(query, 'product', product.id, product.name,
          `${OS_BASE}?surface=${product.id}`, product.id, 0.9, 'open');
      }
      const agent = matchAgent(effectiveTarget);
      if (agent) {
        return result(query, 'agent', agent.id, agent.name,
          `${OS_BASE}?surface=agent:${agent.id}`, `agent:${agent.id}`, 0.9, 'open');
      }
      if (SYSTEM_COMMANDS[effectiveTarget]) {
        const sys = SYSTEM_COMMANDS[effectiveTarget];
        return result(query, 'system', effectiveTarget, sys.label, sys.url, sys.surfaceId, 0.8, 'open');
      }
      const site = matchSite(effectiveTarget);
      if (site) {
        return result(query, 'site', site.id, site.title,
          `${OS_BASE}?surface=site:${site.id}`, `site:${site.id}`, 0.7, 'open');
      }
      // Fall through to search
      return result(query, 'search', null, `Search: ${effectiveTarget}`,
        `${OS_BASE}?surface=roadview&q=${encodeURIComponent(effectiveTarget)}`,
        'roadview', 0.5, 'search');
    }
  }

  // No match
  return result(query, 'none', null, null, null, null, 0, 'error',
    `No route found for: ${query}`);
}
