import { LandingTemplate } from '../../_components/blackroad-templates'

export default function LandingTemplatePage() {
  return (
    <LandingTemplate
      hero={{
        eyebrow: '01 — Landing',
        title: 'Public Product Front Door',
        description: 'Use this for canonical product roots that need to explain the product, expose a clean CTA, and hand users into the runtime without making `/` feel like an empty brochure.',
        actions: [
          { label: 'Open runtime', href: '/app' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Host', value: 'product.blackroad.io', note: 'Canonical host should be obvious in the copy and metadata.' },
        { label: 'Audience', value: 'public', note: 'The first viewport should explain value before asking the user to operate.' },
        { label: 'Handoff', value: '/app', note: 'Use a direct route into the runtime if the product is split-surface.' }
      ]}
      lanes={[
        { title: 'Hero', items: ['Product statement', 'Primary CTA', 'Canonical host framing'] },
        { title: 'Proof', items: ['Core metrics', 'Feature cards', 'Product fit signals'] },
        { title: 'Handoff', items: ['Docs or pricing', 'Runtime CTA', 'Status/support links'] }
      ]}
      topics={[
        { title: 'Use this for roots that need explanation', body: 'This is the right template when a product needs a strong portal at `/` instead of dropping straight into an operator panel.' },
        { title: 'Keep the runtime one click away', body: 'The public root should not become a dead-end marketing site. It should move users directly into the actual product.' }
      ]}
    />
  )
}
