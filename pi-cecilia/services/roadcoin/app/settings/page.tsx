import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadCoin Settings',
        description:
          'RoadCoin settings should control issuance, distribution, and governance so the economy remains explainable and tied to the canonical product system.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Issuance', value: 'controlled', note: 'Mint policy, allocation defaults, and reserve controls should remain explicit runtime settings.' },
        { label: 'Usage', value: 'linked', note: 'Reward routing and spend categories should stay tied to products and canonical destinations.' },
        { label: 'Governance', value: 'visible', note: 'Approval thresholds and documentation sync should keep token policy explainable.' }
      ]}
      lanes={[
        { title: 'Issuance', items: ['Mint policy', 'Allocation defaults', 'Reserve controls'] },
        { title: 'Usage', items: ['Reward routing', 'Spend categories', 'Product linkage rules'] },
        { title: 'Governance', items: ['Approval thresholds', 'Docs sync policy', 'Status visibility'] }
      ]}
      topics={[
        {
          title: 'Keep economy rules explainable',
          body: 'RoadCoin settings should keep issuance and governance visible enough that incentive behavior can be reviewed without decoding hidden assumptions.'
        },
        {
          title: 'Tie usage back to products',
          body: 'Spend categories and reward routing should stay linked to canonical product surfaces so the economy layer does not drift away from the rest of the system.'
        }
      ]}
    />
  )
}
