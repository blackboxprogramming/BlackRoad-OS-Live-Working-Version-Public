import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'RoadSide Help',
        description:
          'RoadSide help should teach operators and users how to move from a vague request to the right product, documentation, or escalation lane without creating duplicate surfaces.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Support model', value: 'guided', note: 'RoadSide should take ambiguous requests and route them toward the right canonical surface.' },
        { label: 'Canonical host', value: 'roadside.blackroad.io', note: 'Use RoadSide as the guided support and escalation runtime.' },
        { label: 'Outcome', value: 'closed loop', note: 'A support request should end with a next owner, next document, or next runtime.' }
      ]}
      lanes={[
        { title: 'Handle', items: ['Identify product intent', 'Confirm canonical host', 'Route to docs or owner'] },
        { title: 'Escalate', items: ['Capture blocker', 'Name next owner', 'Preserve actionable handoff'] },
        { title: 'Close', items: ['Record destination', 'Record what changed', 'Record next-step owner'] }
      ]}
      topics={[
        {
          title: 'Handle new requests without creating structure',
          body: 'Identify the product intent, confirm the canonical host, and route the user toward the correct docs or owner before creating anything new.'
        },
        {
          title: 'Support is successful only if it reduces drift',
          body: 'RoadSide should collapse ambiguity toward canonicals instead of creating another layer of routing confusion.'
        }
      ]}
    />
  )
}
