import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'Roadside Documentation',
        description:
          'Use this surface for intake structure, guided-support flows, escalation boundaries, and the handoff logic that moves people into the right runtime or operator lane.',
        actions: [
          { label: 'Read intake policy', href: '/docs/intake' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Support paths', value: '3', note: 'Separate self-serve guidance, guided troubleshooting, and operator escalation.' },
        { label: 'Handoff quality', value: 'high context', note: 'Roadside docs should make required intake details explicit before escalation.' },
        { label: 'Boundary clarity', value: 'strict', note: 'Users should know when they stay in Roadside and when they move into another product runtime.' }
      ]}
      lanes={[
        { title: 'Intake', items: ['Issue classification', 'Prompting', 'Required context'] },
        { title: 'Guide', items: ['Suggested next step', 'Fallback path', 'Common blockers'] },
        { title: 'Escalate', items: ['Ownership', 'Support host', 'Response expectation'] }
      ]}
      topics={[
        { title: 'Good docs reduce escalation waste', body: 'Roadside documentation should prevent weak handoffs by making intake requirements and route choices explicit.' },
        { title: 'Support boundaries matter', body: 'Make it obvious where Roadside ends and where deeper product-specific support begins.' }
      ]}
    />
  )
}
