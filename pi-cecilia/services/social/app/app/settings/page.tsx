import { SettingsTemplate } from '../../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'BackRoad Settings',
        description:
          'BackRoad settings should control how content gets scheduled, approved, branded, and mapped back to canonical product hosts.',
        actions: [
          { label: 'Return to /app', href: '/app' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Publishing', value: 'structured', note: 'Release cadence, channel defaults, and approvals should be visible in one settings view.' },
        { label: 'Creative system', value: 'guardrailed', note: 'BackRoad should stay aligned to the approved BlackRoad design sources instead of ad hoc campaign styles.' },
        { label: 'Routing', value: 'canonical-only', note: 'Campaign links should favor canonical product hosts and avoid alias drift.' }
      ]}
      lanes={[
        { title: 'Publishing', items: ['Release cadence', 'Channel defaults', 'Approval requirements'] },
        { title: 'Creative system', items: ['Asset libraries', 'Brand guardrails', 'Narrative priorities'] },
        { title: 'Routing', items: ['Canonical campaign links', 'Alias avoidance', 'Status visibility'] }
      ]}
      topics={[
        {
          title: 'Treat brand discipline as runtime policy',
          body: 'Publishing settings should reinforce the approved design system, not let campaigns quietly drift into a different visual language.'
        },
        {
          title: 'Routing belongs in campaign settings',
          body: 'Social work often creates URL drift. Make canonical-link policy visible in the runtime where publishing decisions happen.'
        }
      ]}
    />
  )
}
