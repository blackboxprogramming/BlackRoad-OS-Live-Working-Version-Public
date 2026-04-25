import { SettingsTemplate } from '../../_components/blackroad-templates'

export default function SettingsPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'BackRoad Settings',
        description:
          'Configure campaign flow, media review rules, and the route boundary between the public narrative at `/` and the publishing runtime at `/app`.',
        actions: [
          { label: 'Return to /app', href: '/app' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        {
          label: 'Campaign policy',
          value: 'reviewed',
          note: 'Publishing rules, review windows, and launch approvals should stay visible in the runtime.'
        },
        {
          label: 'Distribution',
          value: 'connected',
          note: 'Channel routing should stay tied to canonical product and media hosts instead of duplicate social surfaces.'
        },
        {
          label: 'Route split',
          value: 'intentional',
          note: 'The root remains the public front door while `/app` holds actual content operations.'
        }
      ]}
      lanes={[
        {
          title: 'Publishing',
          items: ['campaign approvals', 'asset review windows', 'release sequencing']
        },
        {
          title: 'Distribution',
          items: ['channel posture', 'status linkage', 'runtime escalation paths']
        },
        {
          title: 'Routing',
          items: ['canonical host', 'overview/app split', 'support surface boundaries']
        }
      ]}
      topics={[
        {
          title: 'BackRoad should stay a real publishing runtime',
          body: 'Settings need to support campaign work, moderation, and distribution rather than leaving media operations implicit.'
        },
        {
          title: 'Routing drift turns into launch failure',
          body: 'Distribution configuration should keep campaigns attached to canonical routes so media work does not leak into stale aliases.'
        }
      ]}
    />
  )
}
