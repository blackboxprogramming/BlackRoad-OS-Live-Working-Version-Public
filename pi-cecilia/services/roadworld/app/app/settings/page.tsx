import { SettingsTemplate } from '../../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadWorld Settings',
        description:
          'RoadWorld settings should control how environments are staged, how assets are linked, and how the runtime moves from editing to release.',
        actions: [
          { label: 'Return to /app', href: '/app' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Environment', value: 'staged', note: 'World templates, scene visibility, and runtime safety rules should remain visible together.' },
        { label: 'Assets', value: 'linked', note: 'Bundle source policy and asset approval should reinforce support-subdomain ownership.' },
        { label: 'Publishing', value: 'gated', note: 'Preview gates, release checklists, and rollback handoff should control the route to live.' }
      ]}
      lanes={[
        { title: 'Environment', items: ['Default world template', 'Scene visibility', 'Runtime safety rules'] },
        { title: 'Assets', items: ['Bundle source policy', 'Asset approval path', 'Support-subdomain linkage'] },
        { title: 'Publishing', items: ['Preview gate', 'Release checklist', 'Rollback handoff'] }
      ]}
      topics={[
        {
          title: 'Treat interactive release as a gated runtime flow',
          body: 'RoadWorld settings should make it obvious when an environment is still in staging and what must happen before it goes live.'
        },
        {
          title: 'Keep support-subdomain ownership intact',
          body: 'Asset linkage and documentation policy belong in settings because interactive products drift quickly when file ownership is ambiguous.'
        }
      ]}
    />
  )
}
