// BlackRoad OS — Launch Task Model
// Schema and factory for launch queue tasks

let taskCounter = 0;

export const SEVERITIES = ['priority-zero', 'high', 'medium', 'low', 'info'];
export const CATEGORIES = [
  'ssl', 'dns', 'route', 'registry', 'css', 'surface', 'command', 'docs',
  'status', 'search', 'agent', 'session', 'roadnode', 'trust', 'security', 'deployment'
];
export const STATUSES = [
  'queued', 'ready', 'blocked', 'needs-approval', 'in-progress',
  'ready-to-verify', 'verified', 'done', 'deferred'
];

export function createTask({
  title, description = '', sourceReport = '', sourceCheck = '',
  priority = 3, severity = 'medium', category = 'docs',
  productId = '', domain = '', affectedFiles = [],
  recommendedAction = '', safeToAutoPatch = false,
  requiresApproval = true, approvalReason = '',
  verificationCommand = '', notes = ''
}) {
  taskCounter++;
  return {
    taskId: `launch-${Date.now()}-${taskCounter}`,
    title,
    description,
    sourceReport,
    sourceCheck,
    priority,
    severity,
    category,
    productId,
    domain,
    affectedFiles,
    recommendedAction,
    safeToAutoPatch,
    requiresApproval,
    approvalReason,
    verificationCommand,
    status: requiresApproval ? 'needs-approval' : 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes
  };
}

export function updateTaskStatus(task, newStatus) {
  return { ...task, status: newStatus, updatedAt: new Date().toISOString() };
}
