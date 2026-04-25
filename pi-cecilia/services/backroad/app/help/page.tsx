import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'BackRoad Help',
        description:
          'BackRoad help should guide operators through publishing, campaign routing, moderation, and support handoff without losing the canonical product links underneath.',
        actions: [
          { label: 'Open /app', href: '/app' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime split', value: '/ + /app', note: 'Use the public root for narrative and the runtime for actual publishing work.' },
        { label: 'Canonical host', value: 'social.blackroad.io', note: 'BackRoad should remain the social and campaign runtime, not a duplicate product index.' },
        { label: 'Publishing posture', value: 'operator-led', note: 'Campaign and moderation guidance should always route back to the live workspace.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Confirm campaign host', 'Open the runtime', 'Check publishing lanes'] },
        { title: 'Operate', items: ['Review approvals', 'Check moderation needs', 'Use canonical product links'] },
        { title: 'Escalate', items: ['Open status', 'Capture broken links or routes', 'Hand off with evidence'] }
      ]}
      topics={[
        {
          title: 'Keep narrative and runtime separate',
          body: 'The public root should explain the product, while help should move the operator back toward the actual publishing and moderation workspace.'
        },
        {
          title: 'Do not lose canonical product links',
          body: 'Campaigns should always map back to the correct product hosts instead of drifting into duplicate or vanity URLs.'
        }
      ]}
    />
  )
}
