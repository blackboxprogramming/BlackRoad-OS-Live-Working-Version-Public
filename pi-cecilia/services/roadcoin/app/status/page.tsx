import { StatusTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <StatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'RoadCoin Status',
        description:
          'Use this surface to summarize issuance posture, reserve confidence, and whether RoadCoin economy controls are healthy enough for operator and public trust.',
        actions: [
          { label: 'Open health', href: '/api/health' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Issuance path', value: 'controlled', note: 'No unreviewed issuance routes are active in the current first-pass runtime.' },
        { label: 'Reserve posture', value: 'watching', note: 'Reserve logic and transparency rules are documented, but still await live backing systems.' },
        { label: 'Public explanation', value: 'clear', note: 'Status language remains understandable to non-operators.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Economy posture', 'Affected controls', 'User impact'] },
        { title: 'Next', items: ['Confirm readiness', 'Improve reserve transparency', 'Publish next update'] },
        { title: 'Trust', items: ['/api/health', '/api/ready', 'Docs alignment'] }
      ]}
      topics={[
        { title: 'Economy status should remain legible', body: 'RoadCoin status is only useful when non-operators can understand whether governance and reserves are safe.' },
        { title: 'Control and explanation must stay aligned', body: 'If reserve or issuance behavior changes, the public-facing status language has to change with it.' }
      ]}
    />
  )
}
