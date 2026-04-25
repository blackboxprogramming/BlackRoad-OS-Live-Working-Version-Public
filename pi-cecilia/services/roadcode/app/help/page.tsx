import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadCode Help',
        description:
          'RoadCode help should teach operators and agents how to move from planning to implementation without drifting away from the canonical system.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Workflow', value: 'Plan → Create → Test → Deploy', note: 'RoadCode should keep engineering work tied to a disciplined execution loop.' },
        { label: 'Canonical host', value: 'roadcode.blackroad.io', note: 'Use the app-at-root coding surface as the engineering reference runtime.' },
        { label: 'Validation', value: 'required', note: 'Type-check, build, and runtime checks should exist before any “done” claim.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Run preflight', 'Open target service', 'Check registry and product docs first'] },
        { title: 'Change', items: ['Patch canonical files first', 'Update service code second', 'Preserve route and owner intent'] },
        { title: 'Ship', items: ['Run type-check', 'Run build', 'Capture deploy or handoff evidence'] }
      ]}
      topics={[
        {
          title: 'Change structure safely',
          body: 'When a route, host, or ownership rule changes, update the registry and operating docs first, then patch the service code.'
        },
        {
          title: 'Treat evidence as part of the work',
          body: 'Engineering help should always push the reader back toward build output, health checks, or deployment evidence instead of generic reassurance.'
        }
      ]}
    />
  )
}
