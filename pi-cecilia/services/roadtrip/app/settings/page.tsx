import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadTrip Settings',
        description:
          'RoadTrip settings should determine how tasks move, who owns them, and when execution is allowed to advance or must stop.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Workflow', value: 'phased', note: 'Phase defaults, task states, and owner assignment should remain visible together.' },
        { label: 'Coordination', value: 'handoff-aware', note: 'Agent handoff rules and escalation triggers should shape the runtime, not live only in docs.' },
        { label: 'Runtime', value: 'gated', note: 'Health checks and dependency policy should control when execution is allowed to advance.' }
      ]}
      lanes={[
        { title: 'Workflow', items: ['Phase defaults', 'Task states', 'Owner assignment'] },
        { title: 'Coordination', items: ['Agent handoff rules', 'Escalation triggers', 'Execution summaries'] },
        { title: 'Runtime', items: ['Health gating', 'Dependency checks', 'API handoff policy'] }
      ]}
      topics={[
        {
          title: 'Execution settings should prevent drift',
          body: 'RoadTrip configuration is successful only if it prevents vague ownership, invisible blockers, and ad hoc advancement of work.'
        },
        {
          title: 'Treat gating as a first-class control',
          body: 'Health and dependency checks belong in the workflow settings because the runtime should know when work must stop.'
        }
      ]}
    />
  )
}
