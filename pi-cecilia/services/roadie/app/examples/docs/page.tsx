import { DocsTemplate } from '../../_components/blackroad-templates'

export default function DocsTemplatePage() {
  return (
    <DocsTemplate
      hero={{
        eyebrow: '01 — Docs',
        title: 'Documentation Hub',
        description: 'Use this for product docs, implementation references, or ops handbooks where readers need clear entry points by task and maturity level.',
        actions: [
          { label: 'Read setup', href: '/docs/setup' },
          { label: 'Open runtime', href: '/app', secondary: true }
        ]
      }}
      stats={[
        { label: 'Coverage', value: '84%', note: 'Track whether the documented runtime matches live product behavior.' },
        { label: 'Guides', value: '12', note: 'Separate setup, runtime, debugging, and decision material.' },
        { label: 'Drift', value: '2 warnings', note: 'Use docs surfaces to make stale references visible.' }
      ]}
      lanes={[
        { title: 'Start', items: ['Bootstrap', 'Install', 'First task'] },
        { title: 'Operate', items: ['Runtime flows', 'Health checks', 'Common fixes'] },
        { title: 'Decide', items: ['Canonical rules', 'Exceptions', 'Escalation notes'] }
      ]}
      topics={[
        { title: 'Docs are operational surfaces', body: 'Treat documentation as part of the runtime, not as an afterthought. A good docs page should shorten decisions.' },
        { title: 'Reader paths matter', body: 'Group by what the reader is trying to do, not by how the repo happens to be organized.' }
      ]}
    />
  )
}
