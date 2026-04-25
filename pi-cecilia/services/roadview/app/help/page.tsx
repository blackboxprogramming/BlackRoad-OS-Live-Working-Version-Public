import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadView Help',
        description:
          'RoadView help should teach operators and agents how to use search and analytics to navigate the system without making routing or ownership mistakes.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Search priority', value: 'canonicals first', note: 'Results should elevate canonical products and domains before aliases, duplicates, or retired surfaces.' },
        { label: 'Canonical host', value: 'search.blackroad.io', note: 'Use RoadView as the discovery and ambiguity-resolution reference surface.' },
        { label: 'Operational role', value: 'reduce drift', note: 'This product should help agents find the right owner, host, and docs before they edit or deploy anything.' }
      ]}
      lanes={[
        { title: 'Search', items: ['Elevate canonicals', 'Demote aliases', 'Surface documented owners'] },
        { title: 'Navigate', items: ['Open the right docs', 'Check route ambiguity', 'Confirm support surfaces'] },
        { title: 'Escalate', items: ['Show unresolved drift', 'Capture duplicate hosts', 'Route to owning org'] }
      ]}
      topics={[
        {
          title: 'Show ambiguity openly',
          body: 'If multiple routes, aliases, or docs compete, RoadView should expose that instead of pretending the system is cleaner than it is.'
        },
        {
          title: 'Use search to reduce structural mistakes',
          body: 'Discovery is successful only if it helps people choose the right host, owner, and documentation path before they change anything.'
        }
      ]}
    />
  )
}
