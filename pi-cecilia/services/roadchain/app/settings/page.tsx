import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadChain Settings',
        description:
          'RoadChain settings should control how records are signed, how trust is evaluated, and how ledger state is documented and surfaced externally.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Ledger', value: 'signed', note: 'Record schema, signature requirements, and retention policy should remain visible together.' },
        { label: 'Verification', value: 'thresholded', note: 'Trust thresholds and reconciliation rules should be runtime controls, not buried assumptions.' },
        { label: 'Publishing', value: 'synced', note: 'Docs sync policy and handoff export defaults should preserve provenance outside the runtime.' }
      ]}
      lanes={[
        { title: 'Ledger', items: ['Record schema version', 'Signature requirements', 'Retention policy'] },
        { title: 'Verification', items: ['Trust threshold', 'Review cadence', 'Reconciliation rules'] },
        { title: 'Publishing', items: ['Docs sync policy', 'Status visibility', 'Handoff export defaults'] }
      ]}
      topics={[
        {
          title: 'Verification is part of the runtime contract',
          body: 'RoadChain settings should make trust evaluation legible enough that provenance can be reviewed without decoding hidden policy from code or memory.'
        },
        {
          title: 'Keep external surfaces synchronized',
          body: 'Ledger state matters beyond the app itself, so publication and documentation settings must stay part of the first-class runtime policy.'
        }
      ]}
    />
  )
}
