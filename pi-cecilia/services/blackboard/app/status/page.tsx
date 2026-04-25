import { AnalyticsStatusTemplate } from '../_components/blackroad-templates'
import { getBlackboardKpiData } from '../lib/kpi-data'

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export default async function StatusPage() {
  const data = await getBlackboardKpiData()
  const freshnessValue =
    data.source === 'analytics_worker'
      ? 'live'
      : 'fallback'
  const attributionHealth = data.alertStatus.status

  return (
    <AnalyticsStatusTemplate
      hero={{
        eyebrow: '01 — Status',
        title: 'BlackBoard Status',
        description:
          'Use this surface to summarize traffic freshness, attribution health, and redirect waste for the BlackRoad KPI runtime so web reporting stays trustworthy during launches and routing changes.',
        actions: [
          { label: 'Open traffic API', href: '/api/traffic' },
          { label: 'Open KPI runtime', href: '/', secondary: true }
        ]
      }}
      stats={[
        {
          label: 'Traffic freshness',
          value: freshnessValue,
          note:
            data.source === 'analytics_worker'
              ? `Live analytics-worker data generated ${new Date(data.generatedAt).toLocaleString()}.`
              : 'Using canonical registry fallback because live analytics was unavailable.'
        },
        {
          label: 'Attribution health',
          value: attributionHealth,
          note: data.alertStatus.lines[0]
        },
        {
          label: 'Cleanup pressure',
          value: `${data.cleanupChecklist.length} queued`,
          note: `${formatCompactNumber(data.traffic.views30d)} 30-day views and ${formatCompactNumber(data.traffic.events30d)} events under current reporting posture.`
        }
      ]}
      lanes={[
        {
          title: 'Now',
          items: data.cleanupChecklist.length > 0
            ? data.cleanupChecklist.slice(0, 3).map((item) => item.title)
            : ['No active cleanup tasks', 'Attribution stable', 'Reporting confidence intact']
        },
        {
          title: 'Watch',
          items: [
            `${formatCompactNumber(data.traffic.views24h)} views in 24h`,
            `${formatCompactNumber(data.traffic.sessions24h)} sessions in 24h`,
            `${data.coverage.activeZones} active Cloudflare zones`
          ]
        },
        {
          title: 'Check',
          items: ['/api/traffic', '/api/health', 'make cloudflare-kpis']
        }
      ]}
      topics={[
        {
          title: 'Traffic status should stay human-readable',
          body: 'Stakeholders need to know whether the numbers are trustworthy before they care how the pipeline is implemented.'
        },
        {
          title: 'Coverage and waste belong together',
          body: 'A KPI runtime is only useful when it explains both canonical reach and how much alias traffic muddies the picture.'
        },
        {
          title: 'Cleanup pressure should stay visible',
          body: data.cleanupChecklist.length > 0
            ? data.cleanupChecklist.map((item) => item.title).join(', ')
            : 'No active cleanup checklist items are currently blocking traffic trust.'
        },
        {
          title: 'Alert severity should match live reality',
          body: data.alertStatus.lines.join(' ')
        },
        {
          title: 'Separate active drift from backlog',
          body: data.attribution.pathOnly24h > 0
            ? `Path-only attribution is still active in the 24h window (${data.attribution.pathOnly24h} views).`
            : `The write path is currently clean; ${data.attribution.pathOnly30d} path-only views remain only as historical 30-day backlog.`
        },
        {
          title: 'Track transitional host leakage separately',
          body: data.attribution.migrationTraffic24h > 0
            ? `Known migration hosts are still taking fresh traffic in the 24h window (${data.attribution.migrationTraffic24h} views).`
            : `Known migration-host leakage is currently clean in 24h; ${data.attribution.migrationTraffic30d} views remain only as 30-day historical tail.`
        }
      ]}
    />
  )
}
