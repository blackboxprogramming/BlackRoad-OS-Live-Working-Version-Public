// BlackRoad OS — Command Telemetry
// Local-only command usage tracking. No external reporting.

const LOG_PREFIX = '[BlackRoad Command]';

let sessionLog = [];

export function logCommand(result) {
  const entry = {
    timestamp: new Date().toISOString(),
    query: result.query,
    type: result.type,
    action: result.action,
    targetId: result.targetId,
    surfaceId: result.surfaceId,
    confidence: result.confidence
  };

  sessionLog.push(entry);

  if (result.action === 'error' || result.type === 'none') {
    console.log(`${LOG_PREFIX} NO ROUTE "${result.query}"`);
  } else {
    console.log(`${LOG_PREFIX} routed "${result.query}" -> ${result.surfaceId || result.url}`);
  }

  return entry;
}

export function getSessionLog() {
  return [...sessionLog];
}

export function clearSessionLog() {
  sessionLog = [];
}

export function getStats() {
  const total = sessionLog.length;
  const routed = sessionLog.filter(e => e.action !== 'error').length;
  const noRoute = sessionLog.filter(e => e.action === 'error').length;
  const byType = {};
  for (const e of sessionLog) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }
  return { total, routed, noRoute, byType };
}

// Signal ready
export function ready() {
  console.log(`${LOG_PREFIX} ready`);
}
