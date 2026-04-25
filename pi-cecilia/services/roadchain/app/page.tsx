import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadChain',
        title: 'Ledger Posture, Provenance, And Verification State',
        description:
          'RoadChain is the ledger and provenance surface for traceable records, signed events, and chain-aware product state. This root route should behave like the working ledger console.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Check status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Ledger posture', value: 'tracked', note: 'Track provenance, records, and chain events in a product surface instead of scattered audit notes.' },
        { label: 'Verification flow', value: 'tracked', note: 'Make integrity checks and signing paths visible before records move between systems.' },
        { label: 'Canonical evidence', value: 'tracked', note: 'Tie ledger state back to products, domains, and ownership so records stay meaningful.' }
      ]}
      lanes={[
        { title: 'Record', items: ['Create provenance entry', 'Capture chain metadata', 'Attach owning product'] },
        { title: 'Verify', items: ['Inspect signatures', 'Check chain continuity', 'Review trust state'] },
        { title: 'Publish', items: ['Open docs lane', 'Check status posture', 'Prepare external handoff'] }
      ]}
      topics={[
        { title: 'Make provenance visible before trust breaks', body: 'RoadChain should give BlackRoad a canonical place to track record integrity, product-linked provenance, and verification state without hiding that logic in backend-only tooling.' },
        { title: 'Verification should stay tied to product context', body: 'The ledger surface is strongest when records, ownership, and trust state stay visible in one place instead of fragmenting across services.' }
      ]}
    />
  )
}
