import { AppRuntimeTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <AppRuntimeTemplate
      hero={{
        eyebrow: '01 — OneWay',
        title: 'Exports, Portability, And Structured Product Handoff',
        description:
          'OneWay is the canonical surface for exports, portability, migration bundles, and structured handoff between BlackRoad products. This root route should feel like a working data-transfer console.',
        actions: [
          { label: 'Open controls', href: '/settings' },
          { label: 'Transfer guidance', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Export lanes', value: 'ready', note: 'Bundle structured data, files, and canonical metadata into predictable handoff packages.' },
        { label: 'Portability rules', value: 'ready', note: 'Keep migrations, archive formats, and ownership trails explicit instead of hidden in ad hoc scripts.' },
        { label: 'Delivery evidence', value: 'ready', note: 'Track what was exported, where it went, and which product or domain change required it.' }
      ]}
      lanes={[
        { title: 'Outgoing', items: ['Snapshot product state', 'Package audit artifacts', 'Deliver migration bundle'] },
        { title: 'Incoming', items: ['Validate import shape', 'Map canonical ownership', 'Attach to target runtime'] },
        { title: 'Retention', items: ['Archive export history', 'Preserve decision trail', 'Set deletion windows'] }
      ]}
      topics={[
        { title: 'Make export and migration work traceable', body: 'OneWay should give BlackRoad a canonical place to package data, move it safely between runtimes, and keep every transfer tied to the product, host, and ownership rules in the registry.' },
        { title: 'Portability needs explicit ownership', body: 'The product is strongest when exports and imports are attached to canonical hosts and documented product responsibility instead of loose scripts.' }
      ]}
    />
  )
}
