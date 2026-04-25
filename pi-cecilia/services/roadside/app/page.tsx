import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadSide',
        title: 'Guided Intake, Support Routing, And Canonical Handoff',
        description:
          'RoadSide is the guided-flow support surface for onboarding, product assistance, and routing people toward the right BlackRoad product, docs, or escalation lane. This root route should feel like an active support console.',
        actions: [
          { label: 'Open guidance', href: '/help' },
          { label: 'Read docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Guided intake', value: 'guided', note: 'Collect product needs, blockers, and next actions in a structured flow instead of ad hoc requests.' },
        { label: 'Operator support', value: 'guided', note: 'Route people toward the right product, docs, or escalation lane without forcing them to understand the whole system first.' },
        { label: 'Canonical alignment', value: 'guided', note: 'Keep help flows tied to the right host, owning org, and documented support surface.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Identify product intent', 'Confirm canonical host', 'Choose support lane'] },
        { title: 'Guide', items: ['Surface documentation', 'Show next actions', 'Route to help or owner'] },
        { title: 'Resolve', items: ['Record outcome', 'Capture blockers', 'Close with handoff evidence'] }
      ]}
      topics={[
        { title: 'Help people reach the right product without drift', body: 'RoadSide should turn messy requests into clean handoffs by surfacing the right product, docs, and escalation path while preserving canonical host and ownership rules.' },
        { title: 'Support should preserve context', body: 'The product is strongest when guided intake captures enough context that the next owner does not have to reconstruct the request from scratch.' }
      ]}
    />
  )
}
