import { DashboardTemplate } from '../../_components/blackroad-templates'

export default function DashboardTemplatePage() {
  return (
    <DashboardTemplate
      hero={{
        eyebrow: '01 — Dashboard',
        title: 'Operational KPI Surface',
        description: 'Use this for app-at-root products where the first screen should answer what is healthy, what is stalled, and what to do next.',
        actions: [
          { label: 'Open settings', href: '/settings' },
          { label: 'Open status', href: '/status', secondary: true }
        ]
      }}
      stats={[
        { label: 'Freshness', value: '2m', note: 'Time since the dashboard last reflected live state.' },
        { label: 'Queues', value: '4 active', note: 'Visible operating pressure should appear in the first metric row.' },
        { label: 'Blocked', value: '1 incident', note: 'Degraded work should be obvious without drilling into another page.' }
      ]}
      lanes={[
        { title: 'Health', items: ['Freshness', 'Capacity', 'Errors'] },
        { title: 'Work', items: ['Priority queues', 'Assignments', 'Pending reviews'] },
        { title: 'Control', items: ['Settings', 'Runbooks', 'Escalation paths'] }
      ]}
      topics={[
        { title: 'Show action, not just metrics', body: 'Dashboards should not be decorative scoreboards. They should lead the operator to the next decision.' },
        { title: 'Bias toward the first viewport', body: 'If the main operating risk is hidden below the fold, the dashboard is underperforming.' }
      ]}
    />
  )
}
