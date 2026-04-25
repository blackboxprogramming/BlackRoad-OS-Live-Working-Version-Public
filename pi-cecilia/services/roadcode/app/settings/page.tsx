import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadCode Settings',
        description:
          'RoadCode settings should control how agents code, verify, route tools, and hand work off to deployment surfaces.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Workspace', value: 'explicit', note: 'Repo targets, queue visibility, and execution mode should be visible together.' },
        { label: 'Tool routing', value: 'MCP-aware', note: 'Routing and provider preferences should be clear instead of implicit.' },
        { label: 'Delivery', value: 'verified', note: 'Build and deploy handoff rules should live in settings, not in operator memory.' }
      ]}
      lanes={[
        { title: 'Workspace', items: ['Default repo targets', 'Agent concurrency', 'Execution queue visibility'] },
        { title: 'Routing', items: ['MCP tool access', 'API gateway preference', 'Fallback provider rules'] },
        { title: 'Delivery', items: ['Build verification', 'Deploy handoff', 'Canonical host policy'] }
      ]}
      topics={[
        {
          title: 'Keep routing legible',
          body: 'RoadCode settings should make model, tool, and provider paths explicit before an agent starts coding.'
        },
        {
          title: 'Treat delivery as configuration',
          body: 'Verification and handoff rules are not optional workflow notes. They are part of the runtime policy of the coding surface.'
        }
      ]}
    />
  )
}
