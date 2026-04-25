import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'RoadCoin Documentation',
        description:
          'Use this surface for issuance policy, economy rules, reserve logic, and the governance explanations behind RoadCoin decisions.',
        actions: [
          { label: 'Read economy policy', href: '/docs/economy' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Governance tracks', value: '3', note: 'Issuance, reserve posture, and public explanation should be documented separately.' },
        { label: 'Policy drift', value: '0 tolerated', note: 'Public docs and internal control behavior should not diverge.' },
        { label: 'Review model', value: 'human-led', note: 'Economy changes need clear human checkpoints and readable rationale.' }
      ]}
      lanes={[
        { title: 'Economy', items: ['Issuance', 'Reserve logic', 'Burn policy'] },
        { title: 'Governance', items: ['Approval rules', 'Change review', 'Decision log'] },
        { title: 'Explain', items: ['Status language', 'Public notes', 'Operator checklist'] }
      ]}
      topics={[
        { title: 'Economy docs must stay legible', body: 'A reader should understand why RoadCoin changes happened without reverse-engineering internal operator notes.' },
        { title: 'Public explanation is part of governance', body: 'If a policy change cannot be explained clearly, it should not be considered complete.' }
      ]}
    />
  )
}
