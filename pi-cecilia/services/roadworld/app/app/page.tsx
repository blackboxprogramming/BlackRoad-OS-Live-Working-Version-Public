import { WorldRuntimeTemplate } from '../_components/blackroad-templates'

export default function AppPage() {
  return (
    <WorldRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadWorld App',
        title: 'World-Building, Scene Management, And Asset-Aware Runtime Work',
        description:
          'RoadWorld App is the live runtime for world-building, interactive scene management, and asset-aware environment work.',
        actions: [
          { label: 'Open settings', href: '/app/settings' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Scene graph', value: 'ready', note: 'Track the active world, environment layers, and interactive objects.' },
        { label: 'Runtime state', value: 'ready', note: 'Keep health, publishing posture, and asset availability visible while editing.' },
        { label: 'Build lanes', value: 'ready', note: 'Move between scene design, asset review, and launch preparation without leaving the runtime.' }
      ]}
      lanes={[
        { title: 'World', items: ['Edit scenes', 'Review map structure', 'Manage environment variants'] },
        { title: 'Assets', items: ['Check asset ownership', 'Link docs surface', 'Prepare bundle for publish'] },
        { title: 'Ops', items: ['Confirm runtime health', 'Review release lane', 'Handoff to deployment'] }
      ]}
      topics={[
        { title: 'The runtime should feel like a builder workspace', body: 'RoadWorld `/app` is strongest when scene editing, asset review, and ship-readiness stay visible in one surface.' },
        { title: 'Shipping interactive work needs ops context', body: 'The product should make it easy to move from world editing to asset packaging to release handoff without breaking canonical ownership.' }
      ]}
    />
  )
}
