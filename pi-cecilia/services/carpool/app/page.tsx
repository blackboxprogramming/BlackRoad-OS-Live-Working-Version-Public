import { DashboardTemplate } from './_components/blackroad-templates'

export default function HomePage() {
  return (
    <DashboardTemplate
      hero={{
        eyebrow: '01 — CarPool',
        title: 'Infrastructure Coordination And Internal Transport Control',
        description:
          'CarPool is the canonical infrastructure coordination surface for routing shared services, watching runtime capacity, and keeping internal transport between BlackRoad systems predictable.',
        actions: [
          { label: 'Open live status', href: '/status' },
          { label: 'Tune runtime policy', href: '/settings', secondary: true }
        ]
      }}
      stats={[
        { label: 'Active links', value: '26', note: 'Service-to-service routes currently moving queue, API, and background workload traffic.' },
        { label: 'Healthy capacity', value: '91%', note: 'Live workers reporting acceptable headroom across compute, queue depth, and internal transport latency.' },
        { label: 'Failover paths', value: '8', note: 'Documented reroute lanes ready to absorb service or host degradation without ad hoc reconfiguration.' }
      ]}
      lanes={[
        { title: 'Transport layer', items: ['Service links', 'Queue lanes', 'Fallback routes'] },
        { title: 'Runtime control', items: ['Capacity watch', 'Queue pressure', 'Incident thresholds'] },
        { title: 'Support surfaces', items: ['API handoff', 'Status reporting', 'Canonical host'] }
      ]}
      topics={[
        { title: 'What lives here', body: 'The canonical runtime at `/` should coordinate service routes, queue topology, capacity signals, and fallback policy for the platform.' },
        { title: 'Support surfaces stay delegated', body: 'Use `api.carpool.blackroad.io` for service-facing endpoints and `status.carpool.blackroad.io` for external uptime messaging.' },
        { title: 'Alias policy stays strict', body: '`pool.blackroad.io` should remain a redirect or operator shorthand, not a parallel infrastructure app.' }
      ]}
    />
  )
}
