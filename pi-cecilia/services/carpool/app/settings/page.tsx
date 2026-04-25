import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'CarPool Settings',
        description:
          'Configure transport policy, queue fallback rules, service admission, and incident thresholds for the shared infrastructure runtime behind CarPool.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Routing rules', value: 'explicit', note: 'Fallback order, service groups, and priority lanes should be visible in the runtime.' },
        { label: 'Capacity policy', value: 'gated', note: 'Queue thresholds and capacity floors should control admission before failure happens.' },
        { label: 'Ownership', value: 'centralized', note: 'BlackRoad-Infrastructure owns this runtime with Cloud and AI support for deployment and service integration.' }
      ]}
      lanes={[
        { title: 'Routing Rules', items: ['route groups', 'fallback order', 'priority lanes'] },
        { title: 'Capacity Policy', items: ['queue thresholds', 'capacity floors', 'reroute triggers'] },
        { title: 'Ownership', items: ['infra ownership', 'cloud support', 'AI integration'] }
      ]}
      topics={[
        {
          title: 'Treat routing as infrastructure policy',
          body: 'CarPool settings should make transport behavior clear enough that operators can predict where traffic moves before a queue starts failing.'
        },
        {
          title: 'Keep infra control centralized',
          body: 'Queue and routing policy should stay unified here rather than drifting into individual service runtimes or undocumented shell scripts.'
        }
      ]}
    />
  )
}
