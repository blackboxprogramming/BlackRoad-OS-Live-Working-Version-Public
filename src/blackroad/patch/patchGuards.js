// BlackRoad OS — Patch Guards
// Hard blocks on risky operations. These never pass.

const BLOCKED_OPERATIONS = [
  'dns-change', 'ssl-cert-change', 'cloudflare-change', 'deployment-change',
  'production-env-var', 'secret-rotation', 'billing-change', 'git-commit',
  'git-push', 'delete-file', 'overwrite-human-file', 'enable-roadnode',
  'enable-capture', 'mutate-private-api', 'change-legal-copy'
];

const BLOCKED_PATH_PATTERNS = [
  /\.env/i, /credentials/i, /secrets?\./i, /\.pem$/i, /\.key$/i,
  /node_modules/i, /\.git\//i
];

export function isBlocked(operation) {
  return BLOCKED_OPERATIONS.includes(operation);
}

export function isBlockedPath(filePath) {
  return BLOCKED_PATH_PATTERNS.some(p => p.test(filePath));
}

export function isGeneratedBlock(content) {
  return content.includes('<!-- BLACKROAD:GENERATED:START -->') &&
         content.includes('<!-- BLACKROAD:GENERATED:END -->');
}

export function hasHumanContent(content) {
  if (!content) return false;
  // If file has content but no generated markers, it's human-written
  return content.trim().length > 0 && !isGeneratedBlock(content);
}

export function validatePatch(patch) {
  const errors = [];

  if (isBlocked(patch.operation)) {
    errors.push(`Blocked operation: ${patch.operation}`);
  }
  if (patch.targetFile && isBlockedPath(patch.targetFile)) {
    errors.push(`Blocked path: ${patch.targetFile}`);
  }
  if (!patch.safe) {
    errors.push('Patch is not marked safe');
  }
  if (patch.requiresApproval) {
    errors.push('Patch requires approval');
  }

  return { valid: errors.length === 0, errors };
}

export { BLOCKED_OPERATIONS };
