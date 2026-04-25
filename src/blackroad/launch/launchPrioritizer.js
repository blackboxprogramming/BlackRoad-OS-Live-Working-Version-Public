// BlackRoad OS — Launch Prioritizer
// Converts doctor check results into prioritized launch tasks

import { createTask } from './launchTaskModel.js';
import { classify } from './approvalClassifier.js';
import { PRODUCTS } from '../products.js';

// Convert a single doctor check result into launch task(s)
export function checkToTasks(checkResult) {
  const tasks = [];
  const { id, name, status, detail, priority: checkPriority, suggestion } = checkResult;

  if (status === 'pass') return tasks; // No work needed

  if (status === 'fail') {
    tasks.push(createTask({
      title: `Fix: ${name}`,
      description: detail || '',
      sourceCheck: id,
      priority: checkPriority === 'p0' ? 0 : 1,
      severity: checkPriority === 'p0' ? 'priority-zero' : 'high',
      category: mapCheckToCategory(id),
      recommendedAction: detail || `Run npm run check for ${id}`,
      safeToAutoPatch: false,
      requiresApproval: true,
      verificationCommand: `npm run check:${id.replace(/-/g, '-')}`
    }));
  }

  if (status === 'missing') {
    const actionType = mapCheckToActionType(id);
    const classification = classify(actionType);
    tasks.push(createTask({
      title: `Add: ${name}`,
      description: suggestion || `Implement ${id} check`,
      sourceCheck: id,
      priority: 2,
      severity: 'medium',
      category: mapCheckToCategory(id),
      recommendedAction: suggestion || `Create npm script for ${id}`,
      safeToAutoPatch: classification.safe,
      requiresApproval: classification.requiresApproval,
      approvalReason: classification.reason,
      verificationCommand: suggestion ? `npm run ${suggestion.match(/"([^"]+)"/)?.[1] || id}` : ''
    }));
  }

  if (status === 'needs-approval') {
    tasks.push(createTask({
      title: `Verify: ${name}`,
      description: detail || '',
      sourceCheck: id,
      priority: checkPriority === 'p0' ? 0 : 1,
      severity: checkPriority === 'p0' ? 'priority-zero' : 'high',
      category: mapCheckToCategory(id),
      recommendedAction: checkResult.approval?.recommendedAction || 'Manual verification required',
      safeToAutoPatch: false,
      requiresApproval: true,
      approvalReason: checkResult.approval?.reason || 'Requires manual verification',
      verificationCommand: checkResult.approval?.recommendedAction || ''
    }));
  }

  if (status === 'warning') {
    tasks.push(createTask({
      title: `Review: ${name}`,
      description: detail || '',
      sourceCheck: id,
      priority: 3,
      severity: 'low',
      category: mapCheckToCategory(id),
      recommendedAction: detail || 'Review and address warning',
      safeToAutoPatch: false,
      requiresApproval: false
    }));
  }

  return tasks;
}

// Convert all doctor results into a prioritized task list
export function prioritize(doctorReport) {
  const allTasks = [];

  for (const check of doctorReport.reports || []) {
    allTasks.push(...checkToTasks(check));
  }

  // Add P0 blocker tasks from doctor
  for (const blocker of doctorReport.priorityZero || []) {
    const exists = allTasks.some(t => t.title.includes(blocker.label) || t.sourceCheck === blocker.id);
    if (!exists) {
      allTasks.push(createTask({
        title: `P0: ${blocker.label}`,
        description: blocker.fix,
        priority: 0,
        severity: 'priority-zero',
        category: mapBlockerToCategory(blocker.id),
        recommendedAction: blocker.fix,
        safeToAutoPatch: false,
        requiresApproval: true,
        approvalReason: 'Priority 0 blocker — blocks launch'
      }));
    }
  }

  // Sort: P0 first, then by priority, then severity
  allTasks.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const sevOrder = { 'priority-zero': 0, high: 1, medium: 2, low: 3, info: 4 };
    return (sevOrder[a.severity] || 4) - (sevOrder[b.severity] || 4);
  });

  return allTasks;
}

function mapCheckToCategory(checkId) {
  const map = {
    'index-import': 'registry', 'registry-reconciliation': 'registry',
    'product-routes': 'route', 'roadchain-ssl': 'ssl',
    'base-css': 'css', 'command-dock': 'command',
    'surfaces': 'surface', 'carkeys': 'session',
    'roadnode': 'roadnode', 'status-runtime': 'status',
    'roadview': 'search', 'roadbook': 'docs',
    'roadtrip': 'agent', 'commit-ritual': 'docs',
    'secret-scan': 'security', 'tagline-scan': 'docs'
  };
  return map[checkId] || 'docs';
}

function mapCheckToActionType(checkId) {
  const map = {
    'carkeys': 'generate-docs', 'roadnode': 'generate-docs',
    'status-runtime': 'create-health-json', 'roadview': 'generate-docs',
    'roadbook': 'create-roadbook-doc', 'roadtrip': 'generate-docs',
    'commit-ritual': 'generate-docs'
  };
  return map[checkId] || 'generate-docs';
}

function mapBlockerToCategory(blockerId) {
  const map = {
    'roadchain-ssl': 'ssl', 'missing-roados-route': 'route',
    'broken-command-dock': 'command', 'missing-product-registry': 'registry',
    'missing-base-css': 'css', 'suspected-secret': 'security',
    'old-tagline': 'docs', 'roadnode-auto-enable': 'roadnode',
    'hidden-capture': 'trust', 'roadcoin-investment-language': 'trust'
  };
  return map[blockerId] || 'docs';
}
