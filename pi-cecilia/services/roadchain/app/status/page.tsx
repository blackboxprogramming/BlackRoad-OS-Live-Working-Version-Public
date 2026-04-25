import { StatusTemplate } from '../_components/blackroad-templates'

export default function StatusPage() {
  return (
    <StatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'RoadChain Status',
        description:
          'Use this surface to summarize whether RoadChain record intake, provenance checks, and public verification signals are healthy enough for trust-sensitive use.',
        actions: [
          { label: 'Open health', href: '/api/health' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Record intake', value: 'healthy', note: 'Submission and storage paths are operating within expected guardrails.' },
        { label: 'Verification queue', value: 'watching', note: 'Proof review remains available, but manual audit depth is higher than desired.' },
        { label: 'Public trust signal', value: 'clear', note: 'Human-facing status and provenance explanations remain aligned.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Current state', 'Affected verification lanes', 'User impact'] },
        { title: 'Next', items: ['Check readiness', 'Reduce audit backlog', 'Publish next checkpoint'] },
        { title: 'Trust', items: ['/api/health', '/api/ready', 'Public explanation'] }
      ]}
      topics={[
        { title: 'Trust-sensitive status should stay plain', body: 'RoadChain must explain whether records can be trusted without hiding behind internal provenance jargon.' },
        { title: 'Audit backlog matters', body: 'A degraded review queue changes confidence even if core intake is still technically healthy.' }
      ]}
    />
  )
}
