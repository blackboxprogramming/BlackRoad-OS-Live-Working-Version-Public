import { HelpTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <HelpTemplate
      hero={{
        eyebrow: '01 — Help',
        title: 'CarKeys Help',
        description:
          'Use this help surface to orient operators and future agents before they touch credential policy, permission flow, or service-facing key operations.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Runtime model', value: 'app-at-root', note: 'New runtime work belongs at /, not on duplicate alias hosts.' },
        { label: 'Canonical host', value: 'carkeys.blackroad.io', note: 'CarKeys remains the operator control plane for credentials and access posture.' },
        { label: 'Support API', value: 'api.carkeys', note: 'Service-facing credential actions belong on the API support surface, not on aliases.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Use the canonical runtime', 'Check health before permission changes', 'Confirm support API'] },
        { title: 'Protect', items: ['Keep aliases lightweight', 'Avoid competing runtimes', 'Preserve access review discipline'] },
        { title: 'Operate', items: ['Manage permissions', 'Review machine trust', 'Escalate with evidence'] }
      ]}
      topics={[
        {
          title: 'Keep aliases lightweight',
          body: 'keys.blackroad.io and roadauth.blackroad.io should stay redirects or documented pointers and must not diverge.'
        },
        {
          title: 'Check health before permission changes',
          body: 'Verify /api/health, /api/ready, and /api/version before claiming the credential runtime is safe.'
        }
      ]}
    />
  )
}
