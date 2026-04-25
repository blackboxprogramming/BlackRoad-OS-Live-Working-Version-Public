import { MediaRuntimeTemplate } from '../_components/blackroad-templates'

export default function AppPage() {
  return (
    <MediaRuntimeTemplate
      hero={{
        eyebrow: '01 — Publishing Dashboard',
        title: 'Campaign Flow, Asset Queues, And Distribution State',
        description:
          'This is the operating view for BackRoad. It should hold campaign flow, asset queues, and distribution state in one place.',
        actions: [
          { label: 'Open settings', href: '/app/settings' },
          { label: 'View status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Campaign queue', value: '4 active', note: 'Launches and narrative threads ready for review.' },
        { label: 'Assets in review', value: '9 items', note: 'Visuals, short-form cuts, and rollout assets.' },
        { label: 'Distribution lanes', value: '6 channels', note: 'Publishing endpoints and social surfaces.' }
      ]}
      lanes={[
        { title: 'Today', items: ['Prioritize launches', 'Get assets approved', 'Keep work tied to canonical products'] },
        { title: 'This week', items: ['Unify content around product roadmap', 'Reduce duplicate media surfaces', 'Clarify launch ownership'] },
        { title: 'Need attention', items: ['Duplicate host mapping', 'Ambiguous campaign routes', 'Routing cleanup before launch'] }
      ]}
      topics={[
        { title: 'Publishing is a runtime, not a note pile', body: 'BackRoad `/app` should keep campaign flow, review work, and distribution state visible enough that launches do not depend on hidden context.' },
        { title: 'Routing problems look like content problems', body: 'Any campaign mapped to a duplicate or ambiguous host should be treated as a routing issue first, not a creative failure.' }
      ]}
    />
  )
}
