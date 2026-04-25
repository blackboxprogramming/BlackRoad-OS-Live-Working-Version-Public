import { InfrastructureStatusTemplate } from '../_components/blackroad-templates'

export default function StatusPage() {
  return (
    <InfrastructureStatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'CarPool Status',
        description:
          'Use this surface to summarize current routing posture, queue pressure, and the shared infrastructure signals behind the CarPool runtime.',
        actions: [
          { label: 'Open health', href: '/api/health' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Transport health', value: 'healthy', note: 'Core internal service links are within expected latency and retry thresholds.' },
        { label: 'Queue pressure', value: 'moderate', note: 'Background workload depth is elevated but still inside configured spillover policy.' },
        { label: 'Support hosts', value: '2 online', note: 'API and public status surfaces remain distinct from the canonical operator runtime.' }
      ]}
      lanes={[
        { title: 'Now', items: ['Current state', 'Queue condition', 'User impact'] },
        { title: 'Check', items: ['/api/health', '/api/ready', '/api/version'] },
        { title: 'Act', items: ['Reroute safely', 'Review support hosts', 'Escalate transport issues'] }
      ]}
      topics={[
        { title: 'Transport status should stay concrete', body: 'CarPool should tell operators which routing layer is stressed and what check comes next, not just say the system feels slow.' },
        { title: 'Support surfaces are part of health', body: 'The API and public status hosts need to remain distinct and healthy or the control plane becomes harder to trust.' }
      ]}
    />
  )
}
