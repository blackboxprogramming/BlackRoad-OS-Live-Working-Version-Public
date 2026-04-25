import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'CarKeys Settings',
        description:
          'Configure credential rotation, access review thresholds, machine trust rules, and support-surface behavior for the canonical CarKeys runtime.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Rotation', value: 'controlled', note: 'Credential age limits, forced refresh, and revocation behavior should stay visible together.' },
        { label: 'Access review', value: 'gated', note: 'Approval thresholds, machine roles, and freeze policy should be explicit runtime controls.' },
        { label: 'Ownership', value: 'foundation-led', note: 'Foundation owns the runtime with Security and Cloud support for policy and deployment hygiene.' }
      ]}
      lanes={[
        { title: 'Rotation Policy', items: ['expiry policy', 'forced rotation', 'revocation rules'] },
        { title: 'Access Review', items: ['approval thresholds', 'machine roles', 'freeze policy'] },
        { title: 'Ownership', items: ['foundation ownership', 'security support', 'cloud support'] }
      ]}
      topics={[
        {
          title: 'Treat access review as runtime policy',
          body: 'Permission and machine trust rules belong in visible settings because access posture degrades quickly when it hides in operational memory.'
        },
        {
          title: 'Keep support-surface behavior explicit',
          body: 'Settings should reinforce the separation between the operator control plane and service-facing credential APIs.'
        }
      ]}
    />
  )
}
