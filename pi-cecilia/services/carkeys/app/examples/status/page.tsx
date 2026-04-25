import { StatusTemplate } from '../../_components/blackroad-templates'

export default function StatusTemplatePage() {
  return (
    <StatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'Human-Facing Status Surface',
        description: 'Use this for status pages that explain uptime, degradation, incidents, and next checkpoints without forcing users to inspect raw logs.',
        actions: [
          { label: 'Open incident', href: '/status/incidents/current' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Overall', value: 'degraded', note: 'A single plain-language status should exist at the top of the page.' },
        { label: 'Affected', value: '2 services', note: 'List impact plainly instead of hiding it inside engineering language.' },
        { label: 'Next update', value: '15 min', note: 'Always tell users when they should expect another signal.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Current state', 'Affected routes', 'User impact'] },
        { title: 'Next', items: ['Mitigation', 'Fallback', 'Update checkpoint'] },
        { title: 'History', items: ['Recent incidents', 'Resolved events', 'Patterns to monitor'] }
      ]}
      topics={[
        { title: 'Status is for humans first', body: 'Write status pages so a user can understand impact immediately, not so an engineer can admire internal terminology.' },
        { title: 'Keep incidents chronological', body: 'Users need sequence and checkpoints more than they need exhaustive postmortem detail in the moment.' }
      ]}
    />
  )
}
