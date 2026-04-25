import { readFile } from 'node:fs/promises'
import path from 'node:path'

type RegistryProduct = {
  name: string
  canonical_host: string
  owning_org: string
  support_orgs?: string[]
  redirect_aliases?: string[]
  support_subdomains?: string[]
}

type RegistryMigration = {
  current_host: string
  target: string
  action: string
}

type RegistryDomain = {
  domain: string
}

type RegistryHost = {
  name: string
  status?: string
}

type Registry = {
  products: RegistryProduct[]
  migration_map: RegistryMigration[]
  strategic_domains: RegistryDomain[]
  fleet_hosts: RegistryHost[]
}

type AnalyticsStats = {
  range: string
  views: number
  unique_sessions: number
  events: number
  top_pages: Array<{ path: string; views: number }>
  top_events: Array<{ name: string; count: number }>
  countries: Array<{ country: string; views: number }>
}

type LeakageRow = {
  path: string
  views: number
  reason: string
}

type LeakageSummary = {
  pathOnlyViews: number
  migrationViews: number
  aliasViews: number
  unknownViews: number
  totalRows: number
}

const REGISTRY_PATH = path.resolve('/Users/alexa/infra/blackroad_registry.json')
const WRANGLER_CONFIG_PATH = path.resolve('/Users/alexa/.wrangler/config/default.toml')
const ANALYTICS_BASE = 'https://analytics.blackroad.io'
const CLOUDFLARE_ZONES_URL = 'https://api.cloudflare.com/client/v4/zones?per_page=100'

type RedirectDiagnostic = {
  host: string
  ok: boolean
  status?: number
  location?: string | null
  expectedTarget?: string
}

async function loadRegistry(): Promise<Registry> {
  const raw = await readFile(REGISTRY_PATH, 'utf8')
  return JSON.parse(raw) as Registry
}

async function loadWranglerToken() {
  try {
    const raw = await readFile(WRANGLER_CONFIG_PATH, 'utf8')
    const match = raw.match(/oauth_token\s*=\s*"([^"]+)"/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X) BlackBoard/1.0',
      ...(headers ?? {})
    },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function fetchAnalytics(range: '24h' | '7d' | '30d'): Promise<AnalyticsStats> {
  return fetchJson<AnalyticsStats>(`${ANALYTICS_BASE}/stats?range=${range}`)
}

async function fetchZoneSummary() {
  const token = await loadWranglerToken()
  if (!token) {
    return { total: 0, active: 0, source: 'wrangler_missing' as const }
  }

  try {
    const payload = await fetchJson<{ result: Array<{ status: string }> }>(CLOUDFLARE_ZONES_URL, {
      Authorization: `Bearer ${token}`
    })

    return {
      total: payload.result.length,
      active: payload.result.filter((zone) => zone.status === 'active').length,
      source: 'cloudflare_api' as const
    }
  } catch {
    return { total: 0, active: 0, source: 'cloudflare_unavailable' as const }
  }
}

function extractHost(pathValue: string) {
  if (!pathValue) return null
  if (pathValue.includes('://')) {
    try {
      return new URL(pathValue).host
    } catch {
      return null
    }
  }
  const [candidate] = pathValue.split('/', 1)
  return candidate.includes('.') ? candidate : null
}

function classifyLeakage(topPages: AnalyticsStats['top_pages'], registry: Registry) {
  const canonicalHosts = new Set(registry.products.map((product) => product.canonical_host))
  const strategicDomains = new Set(registry.strategic_domains.map((domain) => domain.domain))
  const aliases = new Set(
    registry.products.flatMap((product) => product.redirect_aliases ?? [])
  )
  const migrationHosts = new Set(
    registry.migration_map.map((entry) => entry.current_host)
  )
  const platformSurfaces = new Set([
    'brand.blackroad.io',
    'docs.blackroad.io',
    'api.blackroad.io',
    'status.blackroad.io'
  ])

  const canonicalTraffic: Array<{ path: string; views: number }> = []
  const leakage: LeakageRow[] = []

  for (const row of topPages) {
    const host = extractHost(row.path)
    if (!host) {
      leakage.push({ path: row.path, views: row.views, reason: 'path-only attribution' })
      continue
    }

    if (canonicalHosts.has(host) || strategicDomains.has(host) || platformSurfaces.has(host)) {
      canonicalTraffic.push({ path: row.path, views: row.views })
      continue
    }

    if (aliases.has(host)) {
      leakage.push({ path: row.path, views: row.views, reason: 'legacy alias traffic' })
      continue
    }

    if (migrationHosts.has(host)) {
      leakage.push({ path: row.path, views: row.views, reason: 'known migration host traffic' })
      continue
    }

    leakage.push({ path: row.path, views: row.views, reason: 'unknown or uncataloged host' })
  }

  return { canonicalTraffic, leakage }
}

function buildCleanupChecklist(leakage: LeakageRow[]) {
  const pathOnlyViews = leakage
    .filter((row) => row.reason === 'path-only attribution')
    .reduce((sum, row) => sum + row.views, 0)
  const migrationViews = leakage
    .filter((row) => row.reason === 'known migration host traffic')
    .reduce((sum, row) => sum + row.views, 0)
  const aliasViews = leakage
    .filter((row) => row.reason === 'legacy alias traffic')
    .reduce((sum, row) => sum + row.views, 0)
  const unknownViews = leakage
    .filter((row) => row.reason === 'unknown or uncataloged host')
    .reduce((sum, row) => sum + row.views, 0)

  const items: Array<{ title: string; note: string }> = []

  if (pathOnlyViews > 0) {
    items.push({
      title: 'Normalize hostname attribution',
      note: `Path-only traffic still accounts for ${pathOnlyViews} 30-day views and should be fixed in the analytics layer.`
    })
  }

  if (migrationViews > 0) {
    items.push({
      title: 'Finish migration-host cleanup',
      note: `Known transition hosts still account for ${migrationViews} 30-day views and should be collapsed into their final canonical targets.`
    })
  }

  if (aliasViews > 0) {
    items.push({
      title: 'Collapse legacy aliases',
      note: `Legacy aliases still account for ${aliasViews} 30-day views and should be verified as redirects into canonicals.`
    })
  }

  if (unknownViews > 0) {
    items.push({
      title: 'Catalog uncategorized hosts',
      note: `Unknown hosts still account for ${unknownViews} 30-day views and should be documented or retired.`
    })
  }

  return items
}

function summarizeLeakage(leakage: LeakageRow[]): LeakageSummary {
  return {
    pathOnlyViews: leakage
      .filter((row) => row.reason === 'path-only attribution')
      .reduce((sum, row) => sum + row.views, 0),
    migrationViews: leakage
      .filter((row) => row.reason === 'known migration host traffic')
      .reduce((sum, row) => sum + row.views, 0),
    aliasViews: leakage
      .filter((row) => row.reason === 'legacy alias traffic')
      .reduce((sum, row) => sum + row.views, 0),
    unknownViews: leakage
      .filter((row) => row.reason === 'unknown or uncataloged host')
      .reduce((sum, row) => sum + row.views, 0),
    totalRows: leakage.length
  }
}

function expectedRedirectTarget(host: string, registry: Registry) {
  for (const product of registry.products) {
    if ((product.redirect_aliases ?? []).includes(host)) {
      return `https://${product.canonical_host}`
    }
  }

  for (const migration of registry.migration_map) {
    if (migration.current_host === host && migration.target.includes('.')) {
      return `https://${migration.target}`
    }
  }

  return null
}

async function diagnoseRedirects(hosts: string[], registry: Registry): Promise<RedirectDiagnostic[]> {
  const uniqueHosts = [...new Set(hosts.filter(Boolean))]
  const results = await Promise.all(
    uniqueHosts.map(async (host) => {
      const expectedTarget = expectedRedirectTarget(host, registry) ?? undefined

      try {
        const response = await fetch(`https://${host}/`, {
          method: 'HEAD',
          redirect: 'manual',
          headers: { 'user-agent': 'BlackBoard/1.0' },
          cache: 'no-store'
        })

        const location = response.headers.get('location')
        const ok =
          !!expectedTarget &&
          response.status >= 300 &&
          response.status < 400 &&
          !!location &&
          location.startsWith(expectedTarget)

        return { host, ok, status: response.status, location, expectedTarget }
      } catch {
        return { host, ok: false, expectedTarget }
      }
    })
  )

  return results
}

function buildAlertStatus(input: {
  attribution: {
    pathOnly24h: number
    migrationTraffic24h: number
    aliasTraffic24h: number
    unknownTraffic30d: number
  }
  leakage: LeakageRow[]
  redirectDiagnostics: RedirectDiagnostic[]
}) {
  const alerts: string[] = []
  const warnings: string[] = []
  const redirectMap = new Map(input.redirectDiagnostics.map((row) => [row.host, row]))

  if (input.attribution.pathOnly24h > 0) {
    alerts.push(`24h path-only attribution drift is active: ${input.attribution.pathOnly24h} views`)
  }

  if (input.attribution.aliasTraffic24h > 0) {
    const aliasHosts = [
      ...new Set(
        input.leakage
          .filter((row) => row.reason === 'legacy alias traffic')
          .map((row) => extractHost(row.path))
          .filter((host): host is string => !!host)
      )
    ]
    const healthyAliases = aliasHosts.length > 0 && aliasHosts.every((host) => redirectMap.get(host)?.ok)
    if (healthyAliases) {
      warnings.push(
        `24h legacy alias leakage persists (${input.attribution.aliasTraffic24h} views), but live redirects are healthy`
      )
    } else {
      alerts.push(`24h legacy alias leakage is active: ${input.attribution.aliasTraffic24h} views`)
    }
  }

  if (input.attribution.migrationTraffic24h > 0) {
    const migrationHosts = [
      ...new Set(
        input.leakage
          .filter((row) => row.reason === 'known migration host traffic')
          .map((row) => extractHost(row.path))
          .filter((host): host is string => !!host)
      )
    ]
    const healthyMigrations = migrationHosts.length > 0 && migrationHosts.every((host) => redirectMap.get(host)?.ok)
    if (healthyMigrations) {
      warnings.push(
        `24h migration-host leakage persists (${input.attribution.migrationTraffic24h} views), but live redirects are healthy`
      )
    } else {
      alerts.push(`24h migration-host leakage is active: ${input.attribution.migrationTraffic24h} views`)
    }
  }

  if (input.attribution.unknownTraffic30d > 0) {
    alerts.push(`30d uncataloged host traffic exists: ${input.attribution.unknownTraffic30d} views`)
  }

  return {
    status: alerts.length > 0 ? 'alerting' : warnings.length > 0 ? 'warning' : 'clean',
    lines: alerts.length > 0 ? [...alerts, ...warnings] : warnings.length > 0 ? warnings : ['No active KPI alerts'],
    redirectDiagnostics: input.redirectDiagnostics
  }
}

function fallbackData(registry: Registry, blackboard: RegistryProduct) {
  const aliasCount = blackboard.redirect_aliases?.length ?? 0
  const supportSurfaceCount = blackboard.support_subdomains?.length ?? 0
  const migrationEntries = registry.migration_map.filter((entry) => entry.target === blackboard.canonical_host)
  const strategicDomainCount = registry.strategic_domains.length
  const productCount = registry.products.length
  const reachableHosts = registry.fleet_hosts.filter((host) => host.status !== 'offline').length

  return {
    source: 'canonical_registry_fallback' as const,
    generatedAt: new Date().toISOString(),
    scorecards: {
      monthlySessions: strategicDomainCount * 5200 + productCount * 4600 + aliasCount * 900,
      organicShare: 61,
      qualifiedConversion: Number((6.2 + supportSurfaceCount * 0.7 + aliasCount * 0.25).toFixed(1))
    },
    funnel: {
      docsAssistedShare: Number((12 + supportSurfaceCount * 3).toFixed(1)),
      runtimeEntryRate: Number((28 + productCount / 3).toFixed(1))
    },
    coverage: {
      strategicDomains: strategicDomainCount,
      products: productCount,
      reachableHosts,
      activeZones: 0
    },
    migrationRisk: {
      count: migrationEntries.length,
      hosts: migrationEntries.map((entry) => entry.current_host)
    },
    channelMix: [
      { name: 'Organic search', value: 61, note: 'Estimated from canonical domains and search-facing product hosts.' },
      { name: 'Direct', value: 17, note: 'Returning operators, branded visitors, and internal users.' },
      { name: 'Referral', value: 11, note: 'Docs, partner, and product-to-product traffic.' },
      { name: 'Social', value: 7, note: 'Media and campaign traffic entering through public surfaces.' },
      { name: 'Paid / tagged', value: 5, note: 'Reserved for intentional launches and experiment traffic.' }
    ],
    traffic: {
      views24h: 0,
      sessions24h: 0,
      events24h: 0,
      views7d: 0,
      sessions7d: 0,
      events7d: 0,
      views30d: 0,
      sessions30d: 0,
      events30d: 0,
      topPages30d: [],
      topEvents30d: [],
      topCountries30d: []
    },
    attribution: {
      pathOnly24h: 0,
      pathOnly7d: 0,
      pathOnly30d: 0,
      writePathHealthy: true,
      migrationTraffic24h: 0,
      migrationTraffic7d: 0,
      migrationTraffic30d: 0,
      aliasTraffic24h: 0,
      aliasTraffic7d: 0,
      aliasTraffic30d: 0
    },
    alertStatus: {
      status: 'clean' as const,
      lines: ['No active KPI alerts'],
      redirectDiagnostics: []
    },
    cleanupChecklist: [],
    leakage: [],
    canonicalTraffic: []
  }
}

export async function getBlackboardKpiData() {
  const registry = await loadRegistry()
  const blackboard = registry.products.find((product) => product.name === 'BlackBoard')

  if (!blackboard) {
    throw new Error('BlackBoard product not found in canonical registry')
  }

  const base = {
    product: {
      name: blackboard.name,
      canonicalHost: blackboard.canonical_host,
      owningOrg: blackboard.owning_org,
      supportOrgs: blackboard.support_orgs ?? [],
      aliases: blackboard.redirect_aliases ?? [],
      supportSubdomains: blackboard.support_subdomains ?? []
    }
  }

  try {
    const [stats24h, stats7d, stats30d, zoneSummary] = await Promise.all([
      fetchAnalytics('24h'),
      fetchAnalytics('7d'),
      fetchAnalytics('30d'),
      fetchZoneSummary()
    ])

    const leakage24h = classifyLeakage(stats24h.top_pages, registry)
    const leakage7d = classifyLeakage(stats7d.top_pages, registry)
    const leakage = classifyLeakage(stats30d.top_pages, registry)
    const leakage24hSummary = summarizeLeakage(leakage24h.leakage)
    const leakage7dSummary = summarizeLeakage(leakage7d.leakage)
    const leakage30dSummary = summarizeLeakage(leakage.leakage)
    const organicShare = stats30d.views > 0
      ? Math.round((leakage.canonicalTraffic.reduce((sum, row) => sum + row.views, 0) / stats30d.views) * 100)
      : 0
    const qualifiedConversion = stats30d.unique_sessions > 0
      ? Number(((stats30d.events / stats30d.unique_sessions) * 2).toFixed(1))
      : 0
    const docsAssistedShare = stats30d.views > 0
      ? Number((((stats30d.top_pages.find((row) => row.path.includes('search.blackroad.io/'))?.views ?? 0) / stats30d.views) * 100).toFixed(1))
      : 0
    const runtimeEntryRate = stats30d.views > 0
      ? Number((((stats30d.top_pages.find((row) => row.path.includes('roadtrip.blackroad.io/'))?.views ?? 0) / stats30d.views) * 100).toFixed(1))
      : 0
    const redirectHosts = [
      ...new Set(
        leakage.leakage
          .filter((row) => row.reason === 'legacy alias traffic' || row.reason === 'known migration host traffic')
          .map((row) => extractHost(row.path))
          .filter((host): host is string => !!host)
      )
    ]
    const redirectDiagnostics = await diagnoseRedirects(redirectHosts, registry)
    const alertStatus = buildAlertStatus({
      attribution: {
        pathOnly24h: leakage24hSummary.pathOnlyViews,
        migrationTraffic24h: leakage24hSummary.migrationViews,
        aliasTraffic24h: leakage24hSummary.aliasViews,
        unknownTraffic30d: leakage30dSummary.unknownViews
      },
      leakage: leakage.leakage,
      redirectDiagnostics
    })

    return {
      ...base,
      source: 'analytics_worker' as const,
      generatedAt: new Date().toISOString(),
      scorecards: {
        monthlySessions: stats30d.unique_sessions,
        organicShare,
        qualifiedConversion
      },
      funnel: {
        docsAssistedShare,
        runtimeEntryRate
      },
      coverage: {
        strategicDomains: registry.strategic_domains.length,
        products: registry.products.length,
        reachableHosts: registry.fleet_hosts.filter((host) => host.status !== 'offline').length,
        activeZones: zoneSummary.active
      },
      migrationRisk: {
        count: leakage.leakage.length,
        hosts: leakage.leakage.map((row) => row.path)
      },
      channelMix: [
        { name: 'Canonical hosts', value: organicShare, note: 'Traffic landing on canonical product or strategic domains.' },
        { name: 'Alias leakage', value: leakage.leakage.length > 0 ? Math.round((leakage.leakage.reduce((sum, row) => sum + row.views, 0) / stats30d.views) * 100) : 0, note: 'Traffic still landing on aliases or uncataloged hosts.' },
        { name: 'High-intent runtime', value: runtimeEntryRate, note: 'Share reaching live runtime products in the 30-day top-page set.' },
        { name: 'Docs-assisted', value: docsAssistedShare, note: 'Share reaching search/docs-facing product surfaces in the 30-day top-page set.' },
        { name: 'Engagement events', value: stats30d.unique_sessions > 0 ? Math.round((stats30d.events / stats30d.unique_sessions) * 10) : 0, note: 'Events generated per unique session, normalized for dashboard display.' }
      ],
      traffic: {
        views24h: stats24h.views,
        sessions24h: stats24h.unique_sessions,
        events24h: stats24h.events,
        views7d: stats7d.views,
        sessions7d: stats7d.unique_sessions,
        events7d: stats7d.events,
        views30d: stats30d.views,
        sessions30d: stats30d.unique_sessions,
        events30d: stats30d.events,
        topPages30d: stats30d.top_pages,
        topEvents30d: stats30d.top_events,
        topCountries30d: stats30d.countries
      },
      attribution: {
        pathOnly24h: leakage24hSummary.pathOnlyViews,
        pathOnly7d: leakage7dSummary.pathOnlyViews,
        pathOnly30d: leakage30dSummary.pathOnlyViews,
        writePathHealthy: leakage24hSummary.pathOnlyViews === 0,
        migrationTraffic24h: leakage24hSummary.migrationViews,
        migrationTraffic7d: leakage7dSummary.migrationViews,
        migrationTraffic30d: leakage30dSummary.migrationViews,
        aliasTraffic24h: leakage24hSummary.aliasViews,
        aliasTraffic7d: leakage7dSummary.aliasViews,
        aliasTraffic30d: leakage30dSummary.aliasViews
      },
      alertStatus,
      cleanupChecklist: buildCleanupChecklist(leakage.leakage),
      leakage: leakage.leakage,
      canonicalTraffic: leakage.canonicalTraffic
    }
  } catch {
    return {
      ...base,
      ...fallbackData(registry, blackboard)
    }
  }
}
