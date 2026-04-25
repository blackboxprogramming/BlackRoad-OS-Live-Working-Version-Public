import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'RoadWorld Documentation',
        description:
          'Use this page to explain world structure, interaction rules, scene transitions, and where public overview stops and the live runtime at `/app` begins.',
        actions: [
          { label: 'Read world model', href: '/docs/world' },
          { label: 'Open runtime', href: '/app', secondary: true }
        ]
      }}
      stats={[
        { label: 'World layers', value: '3', note: 'Keep public overview, runtime controls, and scene logic documented separately.' },
        { label: 'Interaction rules', value: 'explicit', note: 'Objects, agents, and transitions should not be left to guesswork.' },
        { label: 'Split model', value: '/ + /app', note: 'Readers should immediately understand the difference between the portal and the live environment.' }
      ]}
      lanes={[
        { title: 'World', items: ['Zones', 'Scenes', 'Transition rules'] },
        { title: 'Runtime', items: ['Operator controls', 'Session behavior', 'Support paths'] },
        { title: 'Systems', items: ['Agent hooks', 'Content rules', 'Escalation'] }
      ]}
      topics={[
        { title: 'World docs should stay operational', body: 'Document the runtime the way an operator or builder experiences it, not as vague concept art prose.' },
        { title: 'Protect the split surface', body: 'RoadWorld needs a clear public explanation at `/` and a clearly different live environment at `/app`.' }
      ]}
    />
  )
}
