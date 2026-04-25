import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadChain Help',
        description:
          'RoadChain help should teach operators how to create, verify, and publish provenance-backed records without breaking canonical trust and ownership rules.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Trust model', value: 'verified', note: 'Ledger entries should not become canonical evidence until product, host, and owner context are attached.' },
        { label: 'Canonical host', value: 'roadchain.blackroad.io', note: 'Use RoadChain as the provenance and verification runtime.' },
        { label: 'Closure', value: 'docs-synced', note: 'When ledger state changes, linked docs and product references should update too.' }
      ]}
      lanes={[
        { title: 'Create', items: ['Attach product', 'Attach host', 'Attach ownership context'] },
        { title: 'Verify', items: ['Check trust thresholds', 'Check signature posture', 'Check continuity'] },
        { title: 'Publish', items: ['Update docs', 'Update product references', 'Preserve chain story'] }
      ]}
      topics={[
        {
          title: 'Create records safely',
          body: 'Attach the correct product, host, and ownership context before treating a ledger entry as canonical evidence.'
        },
        {
          title: 'Close the provenance loop',
          body: 'When ledger state changes, downstream consumers should be able to trust the chain story because linked docs and product references stayed synchronized.'
        }
      ]}
    />
  )
}
