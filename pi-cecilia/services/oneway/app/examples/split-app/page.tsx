import { SplitAppTemplate } from '../../_components/blackroad-templates'

export default function SplitAppTemplatePage() {
  return (
    <SplitAppTemplate
      hero={{
        eyebrow: '01 — Split App',
        title: 'Public Root With `/app` Runtime',
        description: 'Use this for products like OS, Social, OfficeRoad, or RoadBook where the root explains the product and `/app` is the actual operating surface.',
        actions: [
          { label: 'Open /app', href: '/app' },
          { label: 'Open docs', href: '/docs', secondary: true }
        ]
      }}
      stats={[
        { label: 'Root', value: 'portal', note: 'The public root should explain value and route intent.' },
        { label: 'Runtime', value: '/app', note: 'The actual operator experience should start immediately once the user enters `/app`.' },
        { label: 'Support', value: 'docs + status', note: 'Attach help surfaces outside the runtime when they need standalone URLs.' }
      ]}
      lanes={[
        { title: 'Public root', items: ['Hero', 'Feature proof', 'CTA to /app'] },
        { title: 'Runtime', items: ['Operator shell', 'Settings', 'Health awareness'] },
        { title: 'Support', items: ['Docs route', 'Status route', 'Ownership note'] }
      ]}
      topics={[
        { title: 'Do not duplicate the runtime at `/`', body: 'If a product uses `/app`, the root should not be a thinner version of the same dashboard.' },
        { title: 'Explain the split explicitly', body: 'Users should understand why the product has a public root and a separate runtime path.' }
      ]}
    />
  )
}
