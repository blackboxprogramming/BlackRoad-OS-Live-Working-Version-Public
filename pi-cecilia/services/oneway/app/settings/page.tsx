import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'OneWay Settings',
        description:
          'OneWay settings should control how data bundles are packaged, where they can be delivered, and how transfer history is retained, redacted, or removed.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Packaging', value: 'schema-aware', note: 'Bundle shape, naming, and default contents should be explicit runtime controls.' },
        { label: 'Delivery', value: 'signed', note: 'Target mapping, retry behavior, and handoff policy should preserve transport integrity.' },
        { label: 'Retention', value: 'reviewed', note: 'Archive windows, redaction defaults, and deletion rules should remain visible.' }
      ]}
      lanes={[
        { title: 'Packaging', items: ['Export schema version', 'Default bundle contents', 'Artifact naming rules'] },
        { title: 'Delivery', items: ['Target runtime mapping', 'Signed handoff policy', 'Retry and resume behavior'] },
        { title: 'Retention', items: ['Archive windows', 'Redaction defaults', 'Deletion approval path'] }
      ]}
      topics={[
        {
          title: 'Keep bundle policy explicit',
          body: 'Migration systems become untrustworthy when packaging, delivery, and retention rules are scattered across scripts and docs.'
        },
        {
          title: 'Preserve deletion discipline',
          body: 'Retention settings matter because portability products create sensitive residual state very quickly if cleanup is not deliberate.'
        }
      ]}
    />
  )
}
