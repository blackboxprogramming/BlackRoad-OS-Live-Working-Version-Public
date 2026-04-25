import { DocsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'RoadCode Documentation',
        description:
          'Use this surface to route engineers into the canonical operating docs, coding conventions, runtime API behavior, and deployment notes behind RoadCode.',
        actions: [
          { label: 'Read startup guide', href: '/docs/start' },
          { label: 'Open runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        { label: 'Read-first files', value: '4', note: 'Agents should start from the bootstrap, operating model, registry, and deployment guide.' },
        { label: 'Runtime surfaces', value: '3', note: 'Document editor, settings, and support flows separately instead of collapsing them together.' },
        { label: 'Drift tolerance', value: '0 ad hoc', note: 'RoadCode docs should point to canonical BlackRoad rules before any local exceptions.' }
      ]}
      lanes={[
        { title: 'Bootstrap', items: ['BLACKROAD_AGENT_START.md', 'BLACKROAD_OPERATING_MODEL.md', 'blackroad_registry.json'] },
        { title: 'Ship', items: ['Routing rules', 'Deploy notes', 'Health checks'] },
        { title: 'Operate', items: ['Coding policy', 'Review workflow', 'Agent handoff'] }
      ]}
      topics={[
        { title: 'Local docs should shorten decisions', body: 'This page exists to make the shortest correct engineering path obvious, not to duplicate the entire operating manual.' },
        { title: 'Keep runtime and policy distinct', body: 'Document what the product runtime does separately from the broader BlackRoad platform rules it inherits.' }
      ]}
    />
  )
}
