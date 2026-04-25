import { LandingTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <LandingTemplate
      hero={{
        eyebrow: '01 — OfficeRoad',
        title: 'Live Office, Activity, And Shared Coordination Surface',
        description:
          'OfficeRoad is the live office and activity surface for shared coordination, operator presence, and session routing. This root route should explain the product and point people into the runtime at `/app`.',
        actions: [
          { label: 'Open app', href: '/app' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Live presence', value: 'online', note: 'Turn office activity, current coordination state, and operator context into a visible product surface.' },
        { label: 'Runtime split', value: 'online', note: 'Keep the public overview at `/` and the working office runtime at `/app`.' },
        { label: 'Status clarity', value: 'online', note: 'Separate the human-facing status story from the live activity workspace and service health endpoints.' }
      ]}
      lanes={[
        { title: 'Overview', items: ['See current office posture', 'Review active lanes', 'Open status and guidance'] },
        { title: 'Operate', items: ['Enter the runtime', 'Route activity between teams', 'Review session flow'] },
        { title: 'Coordinate', items: ['Track live ownership', 'Prepare escalation', 'Handoff execution context'] }
      ]}
      topics={[
        { title: 'Make the office surface feel active', body: 'OfficeRoad should prove the live coordination pattern by making the overview route useful, the runtime intentional, and the status story easy to reach.' },
        { title: 'The landing page should orient, not overload', body: 'Use `/` to explain current office posture and coordination intent before pushing operators into the active runtime.' }
      ]}
    />
  )
}
