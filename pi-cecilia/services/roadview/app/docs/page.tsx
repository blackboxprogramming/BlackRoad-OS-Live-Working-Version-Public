import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'RoadView Documentation',
        description:
          'Use this docs surface for index policy, freshness expectations, query patterns, ranking review, and the support material behind search and discovery work.',
        actions: [
          { label: 'Read index policy', href: '/docs/index' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Coverage policy', value: 'canonical-first', note: 'Search should privilege canonical hosts and explicit source inclusion rules.' },
        { label: 'Quality loops', value: '3', note: 'Indexing, ranking review, and debugging each need their own reader path.' },
        { label: 'Freshness target', value: 'visible', note: 'Operators should be able to tell how stale results are without reading code.' }
      ]}
      lanes={[
        { title: 'Index', items: ['Source coverage', 'Freshness rules', 'Canonical boundaries'] },
        { title: 'Query', items: ['Patterns', 'Ranking expectations', 'Failure modes'] },
        { title: 'Operate', items: ['Debug flow', 'Escalation', 'Health checks'] }
      ]}
      topics={[
        { title: 'Search docs should expose ranking intent', body: 'RoadView needs documentation that explains what the engine is supposed to prefer, not just how to run it.' },
        { title: 'Keep source policy explicit', body: 'Document what is searchable and what is excluded so operators do not infer index behavior from accidents.' }
      ]}
    />
  )
}
