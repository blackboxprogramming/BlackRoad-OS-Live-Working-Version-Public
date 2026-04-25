import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadWorld Help',
        description:
          'RoadWorld help should teach operators how to move between overview, runtime, assets, and release work without collapsing the split-surface model.',
        actions: [
          { label: 'Open /app', href: '/app' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime split', value: '/ + /app', note: 'Use the root route to understand the product, then move into /app for world-building work.' },
        { label: 'Canonical host', value: 'roadworld.blackroad.io', note: 'RoadWorld remains the split-surface interactive reference.' },
        { label: 'Asset model', value: 'support-owned', note: 'Assets and documentation should stay on documented support surfaces instead of parallel hosts.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Use the right surface', 'Move into /app for runtime', 'Keep the root explanatory'] },
        { title: 'Protect', items: ['Keep assets canonical', 'Use support subdomains', 'Avoid parallel asset hosts'] },
        { title: 'Ship', items: ['Verify runtime health', 'Verify asset readiness', 'Verify release routing'] }
      ]}
      topics={[
        {
          title: 'Keep assets canonical',
          body: 'Treat supporting files and documentation as owned by the documented support subdomains rather than inventing parallel asset hosts.'
        },
        {
          title: 'Ship interactives safely',
          body: 'Verify runtime health, asset readiness, and release routing before calling a world or environment live.'
        }
      ]}
    />
  )
}
