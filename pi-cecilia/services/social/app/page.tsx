import { LandingTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <LandingTemplate
      hero={{
        eyebrow: '01 — BackRoad',
        title: 'Media, Publishing, And Launch Narrative',
        description:
          'BackRoad is the media and publishing surface for BlackRoad. The root should frame the product, active creative system, and launch motion clearly while the operating interface lives in `/app`.',
        actions: [
          { label: 'Open app', href: '/app' },
          { label: 'View status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Publishing', value: 'active', note: 'Coordinate releases, social drops, and content calendars without splitting the runtime across duplicate hosts.' },
        { label: 'Creative ops', value: 'active', note: 'Keep asset creation, approvals, and distribution close to the product surface.' },
        { label: 'Narrative', value: 'active', note: 'Make the root route feel like the media and product front door while the execution surface lives in `/app`.' }
      ]}
      lanes={[
        { title: 'Content system', items: ['Campaigns', 'Launches', 'Short-form media', 'Publishing queues'] },
        { title: 'Operators', items: ['Content lead', 'Creative lead', 'Distribution lead', 'Review loop'] },
        { title: 'Connected surfaces', items: ['RoadBook', 'RoadWorld', 'Brand system', 'Status visibility'] }
      ]}
      topics={[
        { title: 'One public narrative, one runtime surface', body: 'BackRoad should avoid the duplicate-host sprawl that already exists elsewhere. The overview belongs here, and actual content operations belong inside `/app`.' },
        { title: 'The root is a media front door', body: 'The landing surface should orient creative and launch work without trying to become the publishing dashboard itself.' }
      ]}
    />
  )
}
