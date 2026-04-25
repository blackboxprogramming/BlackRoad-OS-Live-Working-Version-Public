import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'OfficeRoad Help',
        description:
          'OfficeRoad help should teach operators how to move between overview, live activity, and status without blurring the split-surface model.',
        actions: [
          { label: 'Open /app', href: '/app' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime split', value: '/ + /app', note: 'Use the root route to understand office posture, then move into /app for active coordination work.' },
        { label: 'Canonical host', value: 'officeroad.blackroad.io', note: 'OfficeRoad remains the split-surface coordination and live-office reference.' },
        { label: 'Status model', value: 'separate', note: 'Use the status lane for human-readable posture and the runtime for actual coordination.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Use the right surface', 'Move into /app for activity', 'Keep the root explanatory'] },
        { title: 'Handoff', items: ['Keep handoffs canonical', 'Route to the right owner', 'Avoid side channels'] },
        { title: 'Communicate', items: ['Separate status from activity', 'Use status for posture', 'Use runtime for coordination'] }
      ]}
      topics={[
        {
          title: 'Keep handoffs canonical',
          body: 'When work leaves the office runtime, route it toward the correct product, host, and owner rather than creating side channels.'
        },
        {
          title: 'Do not blur live activity with status communication',
          body: 'Operators need the runtime and the status lane to stay distinct so both coordination and human-readable posture remain clear.'
        }
      ]}
    />
  )
}
