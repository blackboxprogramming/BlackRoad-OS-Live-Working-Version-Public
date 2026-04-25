import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'RoadView Settings',
        description:
          'RoadView settings should control what gets indexed, how canonicals are ranked, and how operators see duplicates and drift.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Scope', value: 'registry-backed', note: 'Search settings should stay tied to canonical entities, docs, hosts, and domains.' },
        { label: 'Ranking', value: 'canonical-first', note: 'Alias demotion and docs prioritization should be visible configuration, not hidden heuristics.' },
        { label: 'Operator mode', value: 'drift-aware', note: 'Saved queries and migration visibility should expose competing routes instead of hiding them.' }
      ]}
      lanes={[
        { title: 'Index scope', items: ['Registry entities', 'Docs coverage', 'Host and domain inventory'] },
        { title: 'Ranking', items: ['Canonical-first ordering', 'Alias demotion', 'Docs prioritization'] },
        { title: 'Operator defaults', items: ['Saved queries', 'Health emphasis', 'Migration visibility'] }
      ]}
      topics={[
        {
          title: 'Ranking is policy',
          body: 'RoadView settings should make canonical-first behavior explicit because discovery quality depends on route and ownership clarity.'
        },
        {
          title: 'Index scope should match real operations',
          body: 'Only index what helps agents find the right surface and reduce drift. Discovery does not need to become an archive of noise.'
        }
      ]}
    />
  )
}
