import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadCoin Help',
        description:
          'RoadCoin help should teach operators how to review economy state, coordinate token policy, and keep incentive decisions tied to the documented system.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Economy model', value: 'governed', note: 'Issuance, allocation, and reward rules should stay reviewable before they are treated as canonical.' },
        { label: 'Canonical host', value: 'roadcoin.blackroad.io', note: 'Use RoadCoin as the economy and incentive runtime.' },
        { label: 'Ledger sync', value: 'required', note: 'RoadCoin and RoadChain should stay aligned whenever provenance and economy state interact.' }
      ]}
      lanes={[
        { title: 'Review', items: ['Check issuance', 'Check allocation', 'Check reward rules'] },
        { title: 'Coordinate', items: ['Use RoadChain together', 'Preserve provenance sync', 'Check trust surfaces'] },
        { title: 'Close', items: ['Update docs', 'Update policy references', 'Keep governance legible'] }
      ]}
      topics={[
        {
          title: 'Review the economy safely',
          body: 'Check issuance, allocation, and reward rules before treating the current token posture as canonical.'
        },
        {
          title: 'Close governance loops',
          body: 'When policy changes, update docs and supporting references so economy decisions remain legible to future operators.'
        }
      ]}
    />
  )
}
