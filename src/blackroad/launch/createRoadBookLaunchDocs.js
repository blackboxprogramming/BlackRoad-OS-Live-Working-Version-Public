// BlackRoad OS — Create RoadBook Launch Docs
// Generates publishable launch documentation

export function createLaunchDocs(tasks, plan, doctorReport) {
  const score = doctorReport?.score || 0;
  const category = doctorReport?.category || 'unknown';

  return {
    title: 'BlackRoad Launch Status',
    generatedAt: new Date().toISOString(),
    score,
    category,
    sections: [
      {
        heading: 'Launch Readiness',
        content: `BlackRoad OS launch score: ${score}/100 — ${category}. ${tasks.length} tasks in queue.`
      },
      {
        heading: 'Priority 0',
        content: tasks.filter(t => t.severity === 'priority-zero').length > 0
          ? tasks.filter(t => t.severity === 'priority-zero').map(t => `- ${t.title}`).join('\n')
          : 'No Priority 0 blockers.'
      },
      {
        heading: 'Safe Local Fixes',
        content: `${plan.summary.safeLocal} tasks can be auto-patched locally without approval.`
      },
      {
        heading: 'Approval Required',
        content: `${plan.summary.needsApproval} tasks require human approval before execution.`
      },
      {
        heading: 'DNS/SSL',
        content: `${plan.summary.needsDNS} tasks require DNS or SSL changes.`
      }
    ],
    tagline: 'Remember the Road. Pave Tomorrow!'
  };
}
