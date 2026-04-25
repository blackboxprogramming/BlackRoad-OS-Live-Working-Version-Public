// BlackRoad OS — Surface Router
// Converts command results and URLs into surface opens

import { getSurface } from './surfaceRegistry.js';
import { openSurface, openFromCommandResult } from './surfaceRuntime.js';
import { PRODUCTS } from '../products.js';
import { AGENTS } from '../command/commandRegistry.js';

// Parse a surface URL: os.blackroad.io?surface=roadtrip or ?surface=agent:lucidia
export function parseSurfaceUrl(url) {
  try {
    const u = new URL(url);
    const surfaceParam = u.searchParams.get('surface');
    if (surfaceParam) return surfaceParam;
    return null;
  } catch {
    return null;
  }
}

// Route from URL
export function routeFromUrl(url) {
  const surfaceId = parseSurfaceUrl(url);
  if (surfaceId) return openSurface(surfaceId);
  return null;
}

// Route from command result
export function routeFromCommand(result) {
  return openFromCommandResult(result);
}

// Route by product id
export function routeToProduct(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) return openSurface(productId);
  return null;
}

// Route by agent id
export function routeToAgent(agentId) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (agent) return openSurface(`agent:${agentId}`);
  return null;
}

// Route by surface id directly
export function routeToSurface(surfaceId) {
  return openSurface(surfaceId);
}
