import { SettingsTemplate } from '../../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'OfficeRoad Settings',
        description:
          'OfficeRoad settings should control how live sessions are presented, how coordination lanes route work, and how runtime visibility connects back to status surfaces.',
        actions: [
          { label: 'Return to /app', href: '/app' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Presence', value: 'visible', note: 'Session mode, operator visibility, and attendance routing should remain visible together.' },
        { label: 'Coordination', value: 'canonical', note: 'Handoff policy and destination rules should route work toward the right product and owner.' },
        { label: 'Publishing', value: 'status-linked', note: 'Snapshot cadence and release-note policy should keep the runtime tied to the status surface.' }
      ]}
      lanes={[
        { title: 'Presence', items: ['Default session mode', 'Operator visibility', 'Attendance routing'] },
        { title: 'Coordination', items: ['Handoff policy', 'Escalation owner defaults', 'Canonical destination rules'] },
        { title: 'Publishing', items: ['Status surface linkage', 'Snapshot cadence', 'Release note policy'] }
      ]}
      topics={[
        {
          title: 'Office coordination needs route discipline',
          body: 'OfficeRoad settings should prevent the live-office runtime from becoming a side channel that bypasses canonical products and owners.'
        },
        {
          title: 'Status visibility is part of the runtime contract',
          body: 'Snapshot cadence and publication policy belong in settings because the office surface has to communicate posture as well as activity.'
        }
      ]}
    />
  )
}
