import { AuthTemplate } from '../../_components/blackroad-templates'

export default function AuthTemplatePage() {
  return (
    <AuthTemplate
      hero={{
        eyebrow: '01 — Auth',
        title: 'High-Trust Sign-In Surface',
        description: 'Use this for login and identity handoff pages where clarity and trust matter more than feature density.',
        actions: [
          { label: 'Continue', href: '/app' },
          { label: 'Recovery', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Mode', value: 'interactive', note: 'Primary path should be obvious and low-friction.' },
        { label: 'Factors', value: '2-step', note: 'Advanced verification belongs in its own lane, not mixed into every screen.' },
        { label: 'Policy', value: 'sovereign', note: 'If the product has strong security posture, explain it in restrained language.' }
      ]}
      lanes={[
        { title: 'Identify', items: ['Email or handle', 'Org context', 'Primary button'] },
        { title: 'Verify', items: ['Passkey or code', 'Fallback path', 'Recovery guidance'] },
        { title: 'Continue', items: ['Post-auth redirect', 'Session note', 'Help link'] }
      ]}
      topics={[
        { title: 'Do less on auth screens', body: 'Identity surfaces should feel calm and decisive. Keep visual density lower than the rest of the product.' },
        { title: 'Use policy language carefully', body: 'Security copy should reassure through clarity, not through hype.' }
      ]}
    />
  )
}
