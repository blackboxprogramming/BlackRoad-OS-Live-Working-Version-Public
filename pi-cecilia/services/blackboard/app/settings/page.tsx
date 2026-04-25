import { SettingsTemplate } from '../_components/blackroad-templates'

export default function SupportPage() {
  return (
    <SettingsTemplate
      hero={{
        eyebrow: '01 — Settings',
        title: 'BlackBoard Settings',
        description:
          'Configure traffic reporting policy, attribution, canonical host filters, and KPI alerting so BlackBoard measures the web portfolio the same way every time.',
        actions: [
          { label: 'Open runtime', href: '/' },
          { label: 'Open help', href: '/help', secondary: true }
        ]
      }}
      stats={[
        { label: 'Attribution', value: 'configurable', note: 'Choose first-touch, last-touch, or blended attribution so campaign and docs-assisted conversions are measured consistently.' },
        { label: 'Canonical filters', value: 'required', note: 'Reporting should suppress noisy aliases and roll traffic up under canonical hosts.' },
        { label: 'Alerting', value: 'early warning', note: 'Bounce spikes, freshness gaps, runtime-entry drop-offs, and broken campaign tagging should trigger attention quickly.' }
      ]}
      lanes={[
        { title: 'Attribution model', items: ['first-touch', 'last-touch', 'blended attribution'] },
        { title: 'Canonical host filters', items: ['canonical host map', 'alias suppression', 'redirect waste tracking'] },
        { title: 'Alert thresholds', items: ['bounce alerts', 'freshness SLA', 'funnel degradation'] }
      ]}
      topics={[
        {
          title: 'Analytics ownership',
          body: 'BlackRoad-Analytics owns KPI correctness and metric definitions, while Index and Products support search-sourced traffic and runtime-entry mapping.'
        },
        {
          title: 'Alias discipline',
          body: 'Do not build KPI-specific settings on kpi.blackroad.io or other aliases. Settings apply to the canonical runtime at blackboard.blackroad.io.'
        }
      ]}
    />
  )
}
