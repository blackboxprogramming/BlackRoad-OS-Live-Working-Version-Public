import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadTrip Help',
        description:
          'RoadTrip help should teach operators and agents how to run execution cleanly: no hidden blockers, no vague ownership, and no routing drift.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Workflow standard', value: 'explicit', note: 'Tasks should always have an owner, a state, and a concrete next action before they move forward.' },
        { label: 'Canonical host', value: 'roadtrip.blackroad.io', note: 'Use RoadTrip as the workflow and convoy runtime for structured execution.' },
        { label: 'Evidence gate', value: 'required', note: 'Blockers should be resolved with actual health, build, or route evidence instead of assumptions.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Pick owner', 'Set task state', 'Confirm canonical product or host'] },
        { title: 'Advance', items: ['Check evidence', 'Move explicitly', 'Capture next action'] },
        { title: 'Escalate', items: ['Record blocker', 'Route to the right owner', 'Preserve handoff context'] }
      ]}
      topics={[
        {
          title: 'Keep workflow tied to canonicals',
          body: 'If execution touches a product, host, or service, use the canonical registry and operating model as the source of truth.'
        },
        {
          title: 'Do not hide blockers in narrative',
          body: 'Workflow help is successful only if it makes blockers, ownership, and next actions explicit enough for another agent to continue cleanly.'
        }
      ]}
    />
  )
}
