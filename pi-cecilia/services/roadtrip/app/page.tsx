import { AppRuntimeTemplate } from './_components/blackroad-templates'
import { RoadTripRuntimePanel } from './_components/roadtrip-runtime-panel'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — RoadTrip',
        title: 'Multi-Agent Runtime Surface',
        description:
          'RoadTrip is the runtime surface for BlackRoad fleet coordination. It should show live rooms, authenticated operator context, message flow, and agent presence in one working control pane.',
        actions: [
          { label: 'Open settings', href: '/settings' },
          { label: 'How it works', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Auth', value: 'live', note: 'Server-side token session now attaches the UI to the backend without exposing credentials in the browser.' },
        { label: 'Messages', value: 'wired', note: 'Room message reads and writes now flow through the production-style backend foundation.' },
        { label: 'Presence', value: 'active', note: 'Room presence and fleet visibility are now part of the runtime surface instead of placeholder copy.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Authenticated runtime session', 'Live room browsing', 'Message send flow'] },
        { title: 'Next', items: ['WebSocket room stream', 'Presence refresh polish', 'Operator auth UX'] },
        { title: 'Signals', items: ['Fleet visibility', 'Room activity counts', 'Backend health and readiness'] }
      ]}
      topics={[
        { title: 'Backend-first wiring keeps the product honest', body: 'The homepage is now using Next.js proxy routes to talk to the RoadTrip worker foundation, so the runtime reflects real rooms, messages, and presence instead of a static shell.' },
        { title: 'The next unlock is true live sync', body: 'Once the UI is stable on server-side fetches, the next step is to layer in the Worker WebSocket room stream so new messages arrive without manual refresh.' }
      ]}
      detailTitle='02 / Live runtime'
      detailDescription='The homepage now includes a real control panel backed by the Worker auth, rooms, messages, and presence APIs.'
      detailContent={<RoadTripRuntimePanel />}
    />
  )
}
