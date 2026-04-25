import { StatusTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <StatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'OfficeRoad Status',
        description:
          'Use this surface to summarize whether OfficeRoad rooms, presence, and shared coordination systems are healthy enough for live use.',
        actions: [
          { label: 'Open current room status', href: '/status/rooms/current' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Presence sync', value: 'operational', note: 'Core layout and runtime structure are stable at the split surface.' },
        { label: 'Workspace continuity', value: 'degraded', note: 'Real-time meeting and room data still need live backing services.' },
        { label: 'Status publishing', value: 'watching', note: 'Human-facing incident reporting should stay separate from operator-only runtime views.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Room posture', 'Presence state', 'User impact'] },
        { title: 'Next', items: ['Restore live data', 'Check shared services', 'Publish next update'] },
        { title: 'History', items: ['Recent incidents', 'Resolved room issues', 'Patterns to monitor'] }
      ]}
      topics={[
        { title: 'Presence is the critical signal', body: 'OfficeRoad status becomes useful when it tells users whether rooms and coordination are really safe to use right now.' },
        { title: 'Keep public and operator views separate', body: 'The status page should explain impact cleanly without exposing the entire internal control surface.' }
      ]}
    />
  )
}
