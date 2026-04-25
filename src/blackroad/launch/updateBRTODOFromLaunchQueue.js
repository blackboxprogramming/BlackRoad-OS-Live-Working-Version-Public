// BlackRoad OS — Update BRTODO from Launch Queue
// Drafts TODO entries from launch queue tasks (does not auto-commit)

export function generateTodoEntries(tasks) {
  const sections = {
    'priority-zero': { label: '## Priority 0', items: [] },
    'launch-queue': { label: '## Launch Queue', items: [] },
    'safe-local': { label: '## Safe Local Fixes', items: [] },
    'approval-required': { label: '## Approval Required', items: [] },
    'verification': { label: '## Verification Commands', items: [] },
    'deferred': { label: '## Deferred Polish', items: [] }
  };

  for (const task of tasks) {
    const entry = `- [ ] ${task.title}${task.verificationCommand ? ` — \`${task.verificationCommand}\`` : ''}`;

    if (task.severity === 'priority-zero') {
      sections['priority-zero'].items.push(entry);
    } else if (task.safeToAutoPatch) {
      sections['safe-local'].items.push(entry);
    } else if (task.requiresApproval) {
      sections['approval-required'].items.push(entry);
    } else if (task.severity === 'low' || task.severity === 'info') {
      sections['deferred'].items.push(entry);
    } else {
      sections['launch-queue'].items.push(entry);
    }

    if (task.verificationCommand) {
      sections['verification'].items.push(`- [ ] Verify: \`${task.verificationCommand}\` (${task.title})`);
    }
  }

  const lines = ['# Launch Queue TODO', '', `Generated: ${new Date().toISOString()}`, ''];
  for (const section of Object.values(sections)) {
    if (section.items.length === 0) continue;
    lines.push(section.label);
    lines.push(...section.items);
    lines.push('');
  }
  lines.push('Remember the Road. Pave Tomorrow!');
  return lines.join('\n');
}
