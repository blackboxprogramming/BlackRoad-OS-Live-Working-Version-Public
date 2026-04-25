import { DashboardTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <DashboardTemplate
      hero={{
        eyebrow: '01 — RoadView',
        title: 'Discovery And Analytics For The BlackRoad System',
        description:
          'RoadView is the discovery and analytics surface for BlackRoad. It should help operators find the right product, host, route, or document quickly and make ambiguity visible instead of hidden.',
        actions: [
          { label: 'Open docs', href: '/docs' },
          { label: 'Search settings', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Search', value: 'ready', note: 'Find products, routes, hosts, and docs from one canonical surface.' },
        { label: 'Analytics', value: 'ready', note: 'Turn runtime and content signals into usable operator visibility.' },
        { label: 'Discovery', value: 'ready', note: 'Show what exists, what is canonical, and what should be retired.' }
      ]}
      lanes={[
        { title: 'Index targets', items: ['Products', 'Domains', 'Hosts', 'Operating docs'] },
        { title: 'Operator uses', items: ['Find canonicals', 'Spot duplicates', 'Trace route ownership'] },
        { title: 'Next data', items: ['Registry feeds', 'Status surfaces', 'Service docs'] }
      ]}
      topics={[
        { title: 'Make the system discoverable', body: 'RoadView should be the place where agents and operators answer simple but critical questions fast: what is canonical, what is broken, and where should work go next.' },
        { title: 'Discovery needs explicit source policy', body: 'The product is strongest when operators can tell which domains, hosts, and documents are authoritative instead of guessing from stale routes.' }
      ]}
    />
  )
}
