import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — CarKeys',
        title: 'Access, Credential Control, And Identity Posture',
        description:
          'CarKeys is the canonical access and credential-control surface for service identity, operator permissions, runtime keys, and gated entry across the BlackRoad system.',
        actions: [
          { label: 'Open access policy', href: '/settings' },
          { label: 'Operator guidance', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Active credentials', value: '128', note: 'Live service, operator, and machine credentials currently recognized by the canonical access surface.' },
        { label: 'Healthy rotation', value: '96%', note: 'Managed keys and access tokens staying inside the expected rotation and validity window.' },
        { label: 'Pending reviews', value: '11', note: 'Access requests, permission changes, or stale credentials waiting on operator approval.' }
      ]}
      lanes={[
        { title: 'Identity layer', items: ['Service keys', 'Machine access', 'Operator roles'] },
        { title: 'Security discipline', items: ['Rotation policy', 'Expiry windows', 'Review queue'] },
        { title: 'Support surface', items: ['API handoff', 'Credential issues', 'Canonical host'] }
      ]}
      topics={[
        { title: 'What lives here', body: 'The canonical runtime at `/` should manage identity posture, credential state, permission reviews, and access-control operations for the platform.' },
        { title: 'Support surfaces stay separate', body: 'Use `api.carkeys.blackroad.io` for service-facing key and credential endpoints instead of overloading the operator surface.' },
        { title: 'Alias policy stays strict', body: '`keys.blackroad.io` and `roadauth.blackroad.io` should remain redirects or documented shorthands, not competing runtimes.' }
      ]}
    />
  )
}
