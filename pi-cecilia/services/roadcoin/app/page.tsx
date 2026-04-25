import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadCoin',
        title: 'Economy Posture, Incentives, And Governance Signals',
        description:
          'RoadCoin is the economy and token surface for incentives, balances, and system-level reward logic. This root route should behave like the working economy console.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Check status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Economy posture', value: 'active', note: 'Track balances, incentives, and issuance logic as part of a canonical product surface.' },
        { label: 'Policy controls', value: 'active', note: 'Keep minting, allocation, and reward logic visible instead of hidden behind backend-only decisions.' },
        { label: 'Trust and support', value: 'active', note: 'Tie the economy surface to the ledger, docs, and status story so users can understand how the system moves.' }
      ]}
      lanes={[
        { title: 'Supply', items: ['Review issuance', 'Inspect allocation rules', 'Track reserve posture'] },
        { title: 'Usage', items: ['Inspect reward flows', 'Map incentives to products', 'Review spend lanes'] },
        { title: 'Governance', items: ['Open docs lane', 'Check status posture', 'Prepare decision handoff'] }
      ]}
      topics={[
        { title: 'Make token logic legible before it becomes opaque', body: 'RoadCoin should give BlackRoad a canonical place to reason about issuance, incentives, and balances while keeping policy and trust signals visible to operators.' },
        { title: 'Economy controls need visible governance', body: 'The product is strongest when reward logic, reserve posture, and decision handoff stay visible in one runtime instead of backend-only notes.' }
      ]}
    />
  )
}
