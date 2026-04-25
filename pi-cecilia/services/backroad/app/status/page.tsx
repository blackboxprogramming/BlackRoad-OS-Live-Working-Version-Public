import { StatusTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <StatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'BackRoad Status',
        description:
          'Use this surface to summarize whether the publishing runtime, campaign routing, and creative delivery system are safe to use right now.',
        actions: [
          { label: 'Open publish queue', href: '/status/publishing/current' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Publishing runtime', value: 'operational', note: 'Core product structure and split-surface model are in place.' },
        { label: 'Creative review', value: 'degraded', note: 'Real workflow state still needs backing data instead of starter copy.' },
        { label: 'Distribution mapping', value: 'degraded', note: 'Alias and host clarity still matter before campaign links go live.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Publishing state', 'Creative queue', 'Distribution impact'] },
        { title: 'Next', items: ['Wire live workflow data', 'Clarify alias policy', 'Publish next checkpoint'] },
        { title: 'History', items: ['Recent incidents', 'Resolved release issues', 'Patterns to monitor'] }
      ]}
      topics={[
        { title: 'Campaign status should stay readable', body: 'BackRoad needs a status page that tells a stakeholder whether publishing is safe without forcing them into the runtime.' },
        { title: 'Routing clarity affects trust', body: 'Distribution mapping and alias cleanliness matter because bad host behavior can make a campaign look broken even when the editor works.' }
      ]}
    />
  )
}
