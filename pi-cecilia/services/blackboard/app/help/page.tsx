import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'BlackBoard Help',
        description:
          'Use this surface to orient operators, instructors, and future agents before they touch routing, review logic, or live classroom behavior.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime model', value: 'app-at-root', note: 'New work belongs at /, not behind a duplicate /app split.' },
        { label: 'Canonical host', value: 'blackboard.blackroad.io', note: 'BlackBoard should remain the classroom, cohort, and KPI runtime.' },
        { label: 'Next build priority', value: 'cohorts + queues', note: 'Real cohort lists, board session state, assignment queues, and rubric summaries are the next meaningful runtime layer.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Use the canonical runtime', 'Check health surfaces', 'Confirm support subdomains'] },
        { title: 'Protect', items: ['Keep aliases as redirects', 'Separate product and support traffic', 'Avoid duplicate runtime surfaces'] },
        { title: 'Build next', items: ['cohort lists', 'board session state', 'assignment queues', 'rubric summaries'] }
      ]}
      topics={[
        {
          title: 'Check the health surfaces first',
          body: 'Verify /api/health, /api/ready, and /api/version before claiming the classroom runtime is usable.'
        },
        {
          title: 'Keep support traffic separate',
          body: 'User-facing runtime stays on the product host. Monitoring and service endpoints belong on the documented support subdomains.'
        }
      ]}
    />
  )
}
