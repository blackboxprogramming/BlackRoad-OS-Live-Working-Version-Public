import { LandingTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <LandingTemplate
      hero={{
        eyebrow: '01 — RoadWorld',
        title: 'Interactive World-Building And Runtime Experiences',
        description:
          'RoadWorld is the interactive world-building surface for scenes, environments, and runtime experiences. This root route should explain the product and point operators into the live workspace at `/app`.',
        actions: [
          { label: 'Open app', href: '/app' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'World design', value: 'live', note: 'Organize environments, scenes, and interaction systems as first-class product surfaces.' },
        { label: 'Runtime orchestration', value: 'live', note: 'Separate the public overview from the live world-building workspace at `/app`.' },
        { label: 'Asset discipline', value: 'live', note: 'Keep visual and world assets tied to approved support subdomains and canonical ownership.' }
      ]}
      lanes={[
        { title: 'Explore', items: ['View world map', 'Inspect scene structure', 'Open docs and references'] },
        { title: 'Build', items: ['Launch editor runtime', 'Manage environments', 'Coordinate interactive assets'] },
        { title: 'Ship', items: ['Review runtime health', 'Package supporting assets', 'Prepare deployment handoff'] }
      ]}
      topics={[
        { title: 'Make the split-surface pattern feel intentional', body: 'RoadWorld should prove the marketing-plus-app model by making the root route a real overview and the runtime at `/app` a place where interactive work actually starts.' },
        { title: 'The root should frame the world', body: 'Use the landing surface to explain environments, assets, and operator flow before sending builders into the live workspace.' }
      ]}
    />
  )
}
