import { SettingsTemplate } from '../../_components/blackroad-templates'

export default function SettingsTemplatePage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'Runtime Configuration Surface',
        description: 'Use this for product settings routes that need to expose policy, route boundaries, and runtime controls without looking like a generic form dump.',
        actions: [
          { label: 'Open runtime', href: '/app' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Source', value: 'registry', note: 'Configuration should reflect canonical product and route policy.' },
        { label: 'Mode', value: 'explicit', note: 'Users should understand what each settings group controls.' },
        { label: 'Risk', value: 'bounded', note: 'Dangerous actions should be separated from normal runtime defaults.' }
      ]}
      lanes={[
        { title: 'Runtime', items: ['Execution defaults', 'Health discipline', 'Primary route behavior'] },
        { title: 'Ownership', items: ['Owning org', 'Support orgs', 'Canonical host rules'] },
        { title: 'Routing', items: ['Aliases', 'Support surfaces', 'Escalation policy'] }
      ]}
      topics={[
        { title: 'Group by control domain', body: 'Settings pages should separate runtime controls, ownership, and route policy instead of mixing everything together.' },
        { title: 'Show the source of truth', body: 'If configuration comes from the registry or live infrastructure, say so directly in the UI.' }
      ]}
    />
  )
}
