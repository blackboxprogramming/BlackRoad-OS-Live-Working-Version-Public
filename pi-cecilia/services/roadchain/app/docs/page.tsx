import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'RoadChain Documentation',
        description:
          'Use this surface for ledger record structure, verification rules, provenance flows, and the audit material needed to trust RoadChain outputs.',
        actions: [
          { label: 'Read record policy', href: '/docs/records' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Record policy', value: 'strict', note: 'Evidence quality depends on explicit required fields and validation rules.' },
        { label: 'Verification lanes', value: '3', note: 'Capture, review, and audit each need distinct documentation paths.' },
        { label: 'Trust model', value: 'transparent', note: 'Operators and readers should know how provenance is established and challenged.' }
      ]}
      lanes={[
        { title: 'Capture', items: ['Required fields', 'Integrity rules', 'Submission policy'] },
        { title: 'Verify', items: ['Proof review', 'Audit routes', 'Failure states'] },
        { title: 'Report', items: ['Status output', 'Docs links', 'Escalation'] }
      ]}
      topics={[
        { title: 'Trust depends on documentation', body: 'RoadChain only becomes credible when record and verification rules are explicit and reviewable.' },
        { title: 'Keep audit language plain', body: 'Documentation should help a reader understand provenance, not force them through internal jargon.' }
      ]}
    />
  )
}
