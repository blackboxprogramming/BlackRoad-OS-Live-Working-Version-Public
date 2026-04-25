import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'CarPool Help',
        description:
          'Use this help surface to orient operators and future agents before they touch routing policy, queue topology, or external service integration.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime model', value: 'app-at-root', note: 'New runtime work belongs at /, not behind a duplicate split.' },
        { label: 'Canonical host', value: 'carpool.blackroad.io', note: 'CarPool should remain the infrastructure routing and queue control plane.' },
        { label: 'Support surfaces', value: 'api + status', note: 'Infrastructure endpoints and public health messaging should stay on their dedicated support hosts.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Use the canonical host', 'Check health before routing changes', 'Confirm support hosts'] },
        { title: 'Protect', items: ['Keep aliases lightweight', 'Avoid competing runtimes', 'Preserve queue topology clarity'] },
        { title: 'Operate', items: ['Route through api.carpool', 'Communicate via status.carpool', 'Escalate with evidence'] }
      ]}
      topics={[
        {
          title: 'Keep aliases lightweight',
          body: 'pool.blackroad.io should stay a redirect or shorthand and must not become a competing runtime.'
        },
        {
          title: 'Check health before routing changes',
          body: 'Verify /api/health, /api/ready, and /api/version before claiming a service path is safe.'
        }
      ]}
    />
  )
}
