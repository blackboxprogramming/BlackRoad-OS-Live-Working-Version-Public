import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadSide Settings',
        description:
          'RoadSide settings should control how support requests are categorized, how people are routed toward the correct product, and how guided flows preserve canonical alignment.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Intake', value: 'structured', note: 'Default guided flow and required context fields should stay visible together.' },
        { label: 'Routing', value: 'canonical-first', note: 'Host mapping, owner defaults, and docs priority should actively reduce structural drift.' },
        { label: 'Support', value: 'tracked', note: 'Handoffs and follow-up policy should make support loops auditable.' }
      ]}
      lanes={[
        { title: 'Intake', items: ['Default guided flow', 'Required context fields', 'Escalation trigger rules'] },
        { title: 'Routing', items: ['Canonical host mapping', 'Owning org defaults', 'Docs destination priority'] },
        { title: 'Support', items: ['Handoff format', 'Resolution tracking', 'Follow-up reminder policy'] }
      ]}
      topics={[
        {
          title: 'Support routing is product policy',
          body: 'RoadSide settings should decide how requests collapse toward the correct product and owner rather than leaving that choice to improvisation.'
        },
        {
          title: 'Preserve canonical alignment',
          body: 'A guided support system is only useful if it reinforces the canonical host and org map every time someone uses it.'
        }
      ]}
    />
  )
}
