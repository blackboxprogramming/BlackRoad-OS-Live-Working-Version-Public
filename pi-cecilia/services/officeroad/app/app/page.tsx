import { OperatorRuntimeTemplate } from '../_components/blackroad-templates'

export default function AppPage() {
  return (
    <OperatorRuntimeTemplate
      hero={{
        eyebrow: '01 — OfficeRoad App',
        title: 'Office Coordination, Shared Context, And Active Work Routing',
        description:
          'OfficeRoad App is the live runtime for office coordination, shared operator context, and active work routing.',
        actions: [
          { label: 'Open settings', href: '/app/settings' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Sessions', value: 'active', note: 'Track active office sessions, working lanes, and who currently owns the next move.' },
        { label: 'Coordination', value: 'active', note: 'Keep product, infra, and support work visible in one place instead of hidden across chats and terminals.' },
        { label: 'Escalation', value: 'active', note: 'Move blockers toward the correct owner with context preserved.' }
      ]}
      lanes={[
        { title: 'Office', items: ['Open work sessions', 'Review active operators', 'Inspect current context'] },
        { title: 'Routing', items: ['Assign next owner', 'Redirect to canonical host', 'Preserve handoff trail'] },
        { title: 'Ops', items: ['Check status lane', 'Review readiness', 'Prepare escalation path'] }
      ]}
      topics={[
        { title: 'The runtime should centralize coordination', body: 'OfficeRoad `/app` should make work ownership and session state visible enough that coordination does not depend on scattered chat context.' },
        { title: 'Escalation needs preserved context', body: 'Routing and escalation should move blockers toward the right owner without losing the story of what has already been tried.' }
      ]}
    />
  )
}
