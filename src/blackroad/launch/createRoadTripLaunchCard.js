// BlackRoad OS — Create RoadTrip Launch Card
// Generates a card for the RoadTrip commit room

export function createLaunchCard(tasks, doctorReport) {
  const p0 = tasks.filter(t => t.severity === 'priority-zero');
  const safe = tasks.filter(t => t.safeToAutoPatch);
  const approval = tasks.filter(t => t.requiresApproval && !t.safeToAutoPatch);
  const next = tasks.filter(t => t.status === 'queued' || t.status === 'needs-approval').slice(0, 5);

  return {
    title: 'Launch Queue',
    score: doctorReport?.score || 0,
    category: doctorReport?.category || 'unknown',
    generatedAt: new Date().toISOString(),
    priorityZero: p0.map(t => t.title),
    nextTasks: next.map(t => ({ title: t.title, priority: t.priority, safe: t.safeToAutoPatch })),
    approvalRequired: approval.map(t => t.title),
    safeLocalPatches: safe.map(t => t.title),
    totalTasks: tasks.length,
    commitRitual: {
      memory: 'reviewed',
      codex: 'updated',
      products: 'reviewed',
      brtodo: 'updated',
      collab: 'updated',
      roadtrip: 'updated'
    }
  };
}
