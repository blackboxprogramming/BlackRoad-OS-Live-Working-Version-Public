import { AnalyticsRuntimeTemplate } from './_components/blackroad-templates'
import { getBlackboardKpiData } from './lib/kpi-data'

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export default async function HomePage() {
  const data = await getBlackboardKpiData()
  const sourceLabel =
    data.source === 'analytics_worker'
      ? 'Live analytics-worker data'
      : 'Registry fallback model'
  const alertSeverityLabel =
    data.alertStatus.status === 'alerting'
      ? 'alerting'
      : data.alertStatus.status === 'warning'
        ? 'warning'
        : 'clean'
  const monthlySessionsNote =
    data.source === 'analytics_worker'
      ? `Live 30-day unique sessions across canonical and strategic hosts, with ${data.coverage.activeZones} active Cloudflare zones visible.`
      : `Registry-derived estimate across ${data.coverage.strategicDomains} strategic domains and ${data.coverage.products} canonical products.`
  const organicShareNote =
    data.source === 'analytics_worker'
      ? 'Share of 30-day pageviews landing on canonical or strategic hosts instead of aliases or uncataloged surfaces.'
      : 'Search remains the largest traffic source, so canonical routing quality still dominates growth.'
  const conversionNote =
    data.source === 'analytics_worker'
      ? `Event activity normalized against ${formatCompactNumber(data.traffic.sessions30d)} 30-day sessions to track qualified traffic quality.`
      : `Visitors reaching a product runtime, docs handoff, or follow-up path from ${data.product.canonicalHost}.`

  const scorecards = [
    {
      label: 'Monthly sessions',
      value: formatCompactNumber(data.scorecards.monthlySessions),
      note: monthlySessionsNote
    },
    {
      label: 'Organic share',
      value: `${data.scorecards.organicShare}%`,
      note: organicShareNote
    },
    {
      label: 'Qualified conversion',
      value: `${data.scorecards.qualifiedConversion}%`,
      note: conversionNote
    }
  ]

  const kpiRows = [
    {
      metric: 'Organic sessions',
      target: 'Grow branded and non-branded traffic into canonical hosts without inflating alias or duplicate surfaces.',
      owner: 'BlackRoad-Index',
      signal: `${data.scorecards.organicShare}% share`
    },
    {
      metric: 'Landing to runtime click-through',
      target: 'Move visitors from brand or product overview pages into `/app`, docs, or live product surfaces.',
      owner: 'BlackRoad-Products',
      signal: `${data.funnel.runtimeEntryRate}% rate`
    },
    {
      metric: 'Docs-assisted conversion',
      target: 'Measure how often docs and support content lead to runtime entry or qualified follow-up.',
      owner: 'BlackRoad-Analytics',
      signal: `${data.funnel.docsAssistedShare}% assisted`
    },
    {
      metric: 'Alias host waste',
      target: 'Catch wasted traffic on old or duplicate hosts so redirects and canonicals can be cleaned up fast.',
      owner: 'BlackRoad-OS',
      signal: `${data.migrationRisk.count} migration hosts`
    }
  ]

  return (
    <AnalyticsRuntimeTemplate
      hero={{
        eyebrow: '01 — BlackBoard',
        title: 'Portfolio Traffic And KPI Runtime',
        description:
          'BlackBoard is the canonical analytics runtime for the BlackRoad ecosystem. It combines live Cloudflare analytics-worker traffic with the canonical registry so sessions, conversion flow, alias waste, and support-surface coverage stay tied to the real operating model.',
        actions: [
          { label: 'Open KPI status', href: '/status' },
          { label: 'Configure traffic reporting', href: '/settings', secondary: true }
        ]
      }}
      stats={scorecards}
      detailTitle='Measure portfolio traffic the same way every time'
      detailDescription='Keep acquisition, engagement, conversion, channel mix, and redirect cleanup in one analytics runtime instead of splitting them across disconnected dashboards.'
      detailContent={
        <>
          <section className='feature-card'>
            <p className='section-label'>Traffic KPI Matrix</p>
            <div className='stack-list'>
              {kpiRows.map((row) => (
                <article key={row.metric} className='list-row'>
                  <div>
                    <strong>{row.metric}</strong>
                    <p>{row.target}</p>
                  </div>
                  <div className='inline-code-list inline-code-list-stacked'>
                    <code>{row.owner}</code>
                    <code>{row.signal}</code>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className='feature-card'>
            <p className='section-label'>Live Traffic Snapshot</p>
            <div className='grid-section grid-section-three'>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>Source</p>
                <p className='metric-value metric-value-small'>{sourceLabel}</p>
                <p className='metric-note'>Generated {new Date(data.generatedAt).toLocaleString()}</p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>24h traffic</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.traffic.views24h)} views</p>
                <p className='metric-note'>
                  {formatCompactNumber(data.traffic.sessions24h)} sessions, {formatCompactNumber(data.traffic.events24h)} events
                </p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>30d traffic</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.traffic.views30d)} views</p>
                <p className='metric-note'>
                  {formatCompactNumber(data.traffic.sessions30d)} sessions, {formatCompactNumber(data.traffic.events30d)} events
                </p>
              </article>
            </div>
            <div className='grid-section grid-section-two'>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>KPI alert status</p>
                <p className='metric-value metric-value-small'>{alertSeverityLabel}</p>
                <p className='metric-note'>{data.alertStatus.lines[0]}</p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>24h alias leakage</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.aliasTraffic24h)} views</p>
                <p className='metric-note'>
                  {data.attribution.aliasTraffic24h === 0
                    ? 'No fresh legacy alias traffic in the current 24h window.'
                    : 'Use redirect diagnostics to separate active edge defects from rolling-window residue.'}
                </p>
              </article>
            </div>
          </section>

          <section className='feature-card'>
            <p className='section-label'>Attribution Health</p>
            <div className='grid-section grid-section-three'>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>24h path-only drift</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.pathOnly24h)} views</p>
                <p className='metric-note'>
                  {data.attribution.writePathHealthy
                    ? 'No active write-path drift in the current 24h window.'
                    : 'Path-only traffic is still being written and needs immediate analytics-layer attention.'}
                </p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>7d path-only drift</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.pathOnly7d)} views</p>
                <p className='metric-note'>Use this to confirm the fix is holding beyond the current day.</p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>30d historical backlog</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.pathOnly30d)} views</p>
                <p className='metric-note'>Historical bad rows remain until the rolling window ages them out.</p>
              </article>
            </div>
            <div className='grid-section grid-section-three'>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>24h migration-host leakage</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.migrationTraffic24h)} views</p>
                <p className='metric-note'>
                  {data.attribution.migrationTraffic24h === 0
                    ? 'No fresh traffic hit known transitional hosts in the current 24h window.'
                    : 'Known migration hosts are still taking fresh traffic and redirect cleanup is incomplete.'}
                </p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>7d migration-host leakage</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.migrationTraffic7d)} views</p>
                <p className='metric-note'>Use this to prove migration-host cleanup is holding beyond the current day.</p>
              </article>
              <article className='metric-card metric-card-compact'>
                <p className='metric-label'>30d migration backlog</p>
                <p className='metric-value metric-value-small'>{formatCompactNumber(data.attribution.migrationTraffic30d)} views</p>
                <p className='metric-note'>This is historical tail until the rolling 30-day window clears older host usage.</p>
              </article>
            </div>
          </section>

          <section className='grid-section grid-section-three'>
            {data.channelMix.map((channel) => (
              <article key={channel.name} className='metric-card metric-card-compact'>
                <p className='metric-label'>{channel.name}</p>
                <p className='metric-value metric-value-small'>{channel.value}%</p>
                <p className='metric-note'>{channel.note}</p>
              </article>
            ))}
          </section>

          <section className='grid-section grid-section-two'>
            <article className='feature-card'>
              <p className='section-label'>Canonical Host Traffic</p>
              <div className='stack-list'>
                {data.canonicalTraffic.slice(0, 5).map((row) => (
                  <article key={row.path} className='list-row'>
                    <div>
                      <strong>{row.path}</strong>
                      <p>Top 30-day canonical or strategic host traffic.</p>
                    </div>
                    <div className='inline-code-list inline-code-list-stacked'>
                      <code>{row.views} views</code>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className='feature-card'>
              <p className='section-label'>Leakage And Drift</p>
              <div className='stack-list'>
                {data.leakage.slice(0, 5).map((row) => (
                  <article key={row.path} className='list-row'>
                    <div>
                      <strong>{row.path}</strong>
                      <p>{row.reason}</p>
                    </div>
                    <div className='inline-code-list inline-code-list-stacked'>
                      <code>{row.views} views</code>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>

          <section className='feature-card'>
            <p className='section-label'>Cleanup Checklist</p>
            <div className='stack-list'>
              {data.cleanupChecklist.length > 0 ? data.cleanupChecklist.map((item) => (
                <article key={item.title} className='list-row'>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                </article>
              )) : (
                <article className='list-row list-row-static'>
                  <div>
                    <strong>No active cleanup items</strong>
                    <p>Current traffic attribution and host normalization do not show active cleanup pressure.</p>
                  </div>
                </article>
              )}
            </div>
          </section>

          <section className='feature-card'>
            <p className='section-label'>Alert Notes</p>
            <div className='stack-list'>
              {data.alertStatus.lines.map((line) => (
                <article key={line} className='list-row list-row-static'>
                  <div>
                    <strong>{alertSeverityLabel}</strong>
                    <p>{line}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className='stack-list'>
            <article className='list-row list-row-static'>
              <div>
                <strong>Registry-backed coverage</strong>
                <p>
                  This KPI surface reflects <code>{data.coverage.strategicDomains} strategic domains</code>,{' '}
                  <code>{data.coverage.products} canonical products</code>, and <code>{data.coverage.reachableHosts} reachable hosts</code>{' '}
                  from the current operating registry, with <code>{data.coverage.activeZones} active Cloudflare zones</code> visible to analytics.
                </p>
              </div>
            </article>
            <article className='list-row list-row-static'>
              <div>
                <strong>Redirect cleanup pressure</strong>
                <p>
                  Migration entries currently targeting this runtime: {data.migrationRisk.hosts.length > 0 ? data.migrationRisk.hosts.join(', ') : 'none'}.
                </p>
              </div>
            </article>
            <article className='list-row list-row-static'>
              <div>
                <strong>Support surfaces</strong>
                <p>
                  KPI support is exposed on {data.product.supportSubdomains.map((subdomain, index) => (
                    <span key={subdomain}>
                      {index > 0 ? ', ' : ' '}
                      <code>{subdomain}</code>
                    </span>
                  ))}{' '}
                  while aliases {data.product.aliases.map((alias, index) => (
                    <span key={alias}>
                      {index > 0 ? ', ' : ' '}
                      <code>{alias}</code>
                    </span>
                  ))}{' '}
                  should remain redirects into the canonical product.
                </p>
              </div>
            </article>
          </section>
        </>
      }
      lanes={[
        { title: 'Acquisition', items: ['organic sessions', 'referral mix', 'campaign tagged visits'] },
        { title: 'Engagement', items: ['runtime entry rate', 'docs depth', 'return visitor share'] },
        { title: 'Conversion', items: ['qualified visits', 'contact intent', 'workflow starts'] }
      ]}
      topics={[
        {
          title: 'Know where visitors come from',
          body: 'Track search, referral, direct, social, and campaign traffic in one canonical analytics runtime so marketing and product teams stop reading different numbers.'
        },
        {
          title: 'Measure what people actually do',
          body: 'Expose landing-to-product clicks, docs depth, runtime entry rate, and return behavior instead of stopping at pageviews.'
        },
        {
          title: 'Tie traffic to product outcomes',
          body: 'Keep the KPI surface focused on actions that matter: product exploration, sign-up intent, operator contact, and downstream workflow starts.'
        }
      ]}
    />
  )
}
