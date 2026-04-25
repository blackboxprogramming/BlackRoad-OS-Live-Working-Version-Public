import type { ReactNode } from 'react'
import { ActionLinks, LaneGrid, SectionHeader, StatGrid, TopicList } from './blackroad-ui'

type TemplateAction = {
  label: string
  href: string
  secondary?: boolean
}

type TemplateStat = {
  label: string
  value: string
  note: string
}

type TemplateTopic = {
  title: string
  body: string
}

type TemplateLane = {
  title: string
  items: string[]
}

type HeroProps = {
  eyebrow: string
  title: string
  description: string
  actions: TemplateAction[]
}

type TemplateProps = {
  hero: HeroProps
  stats: TemplateStat[]
  lanes: TemplateLane[]
  topics: TemplateTopic[]
}

type AnalyticsTemplateProps = TemplateProps & {
  detailTitle: string
  detailDescription: string
  detailContent: ReactNode
}

export function LandingTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <StatGrid items={stats} />
      <SectionHeader
        number='02 — Structure'
        title='Portal And Runtime Boundaries'
        description='Landing surfaces should explain what the product is, where the runtime lives, and how the canonical host fits into the larger BlackRoad system.'
      />
      <LaneGrid items={lanes} />
      <SectionHeader
        number='03 — Notes'
        title='What This Template Solves'
        description='Use this when the product needs a strong public front door before the operator runtime begins.'
      />
      <TopicList items={topics} />
    </main>
  )
}

export function AppRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Runtime State'
        title='Operator View'
        description='Use this when the canonical host itself is the app. The first screen should show state, work queues, and what the operator should do next.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Active Lanes'
        title='Work The Product'
        description='Root-runtime products should surface the primary operating lanes immediately instead of making operators hunt through navigation.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function DashboardTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — KPI Grid'
        title='Runtime Metrics'
        description='Dashboard surfaces should privilege operating state, capacity, queue health, freshness, and the actions an operator can take next.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Operating Lanes'
        title='Work The Runtime'
        description='Every dashboard should make the primary operating loops obvious in the first viewport.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function AnalyticsRuntimeTemplate({
  hero,
  stats,
  lanes,
  topics,
  detailTitle,
  detailDescription,
  detailContent
}: AnalyticsTemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — KPI Grid'
        title='Runtime Metrics'
        description='Analytics surfaces should privilege trustworthy metrics, canonical coverage, and the next cleanup or growth action an operator should take.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — KPI Detail'
        title={detailTitle}
        description={detailDescription}
      />
      {detailContent}
      <SectionHeader
        number='04 — Operating Lanes'
        title='Run The Dashboard'
        description='Keep attribution, coverage, conversion, and migration cleanup visible in the same runtime instead of scattering them across disconnected tools.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function DocsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Documentation Health'
        title='Coverage And Readability'
        description='Docs surfaces should make the current reference set, missing gaps, and the shortest path to implementation obvious.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Reader Paths'
        title='Guide Different Readers'
        description='Separate setup, runtime, debugging, and decision material instead of collapsing everything into one long page.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function MediaDocsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Editorial Coverage'
        title='Publish With Shared Rules'
        description='Media docs should orient editors and operators around schemas, release stages, packaging rules, and where canonical publishing policy actually lives.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Editorial Reader Paths'
        title='Guide Release Work'
        description='Separate editorial setup, packaging, review, and platform dependencies so publishing work does not get buried in generic docs structure.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function StatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Incident Model'
        title='Communicate Clearly'
        description='Status pages should distinguish healthy, degraded, and blocked states and show where operators should investigate next.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function AnalyticsStatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Reporting Confidence'
        title='Can The Numbers Be Trusted'
        description='Analytics status should privilege freshness, attribution health, and redirect or canonical drift so stakeholders know whether the metrics are decision-safe.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Signal Review'
        title='Protect KPI Integrity'
        description='Keep data freshness, traffic waste, and reporting confidence in one place instead of making operators infer reliability from backend implementation details.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function InfrastructureStatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Transport Health'
        title='Shared Runtime Condition'
        description='Infrastructure status should make queue pressure, routing integrity, and support-surface health obvious enough that operators know what to check next immediately.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Incident Paths'
        title='Diagnose And Escalate'
        description='Separate current condition, verification paths, and escalation actions so the control plane can be trusted during degraded periods.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function AuthTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Trust Signals'
        title='Identity Surface'
        description='Authentication pages should remain spare, high-trust, and explicit about what the user is entering and why.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Session Controls'
        title='Access Flow'
        description='Keep the sequence short: identify, verify, continue. Push advanced settings or recovery into separate views.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function SplitAppTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Surface Separation'
        title='Public Root, Operator Runtime'
        description='Use the split model when the product needs a clear public explanation at `/` and the actual runtime at `/app`.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Route Intent'
        title='Keep `/` And `/app` Different'
        description='The root should explain value and orientation. `/app` should immediately feel operational.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function SplitRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Live Runtime'
        title='Operate The App'
        description='Use this for the `/app` side of a split-surface product. It should feel operational immediately, with clear state, work queues, and fast paths.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Active Lanes'
        title='Keep The Runtime Moving'
        description='The runtime view should privilege current work, host or service health, and the smallest useful set of next actions.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function OperatorRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Control Surface'
        title='Run The System'
        description='Use this for split runtimes centered on fleet state, routing, escalation, or active coordination. The first screen should privilege operational truth and the next useful action.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Active Control Lanes'
        title='Keep Work Moving'
        description='Operator runtimes should make queues, ownership, host state, and escalation paths obvious enough that coordination does not depend on hidden chat context.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function MediaRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Editorial Runtime'
        title='Publish With Intent'
        description='Use this for split runtimes centered on campaigns, collections, editorial flow, or release packaging. The first screen should show what is ready, what is blocked, and what ships next.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Release Lanes'
        title='Move Drafts To Publish'
        description='Media runtimes should keep review queues, asset readiness, and distribution paths visible so release work does not dissolve into notes and scattered approvals.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function WorldRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Builder Runtime'
        title='Shape The World'
        description='Use this for split runtimes centered on scenes, interactive environments, or asset-aware workspace flow. The first screen should feel like a live builder surface, not a generic dashboard.'
      />
      <StatGrid items={stats} />
      <SectionHeader
        number='03 — Build Lanes'
        title='From Asset To Release'
        description='World-building runtimes should keep scene work, asset state, and release handoff visible in one place so creative and operational context stay connected.'
      />
      <LaneGrid items={lanes} />
      <TopicList items={topics} />
    </main>
  )
}

export function HelpTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Guidance'
        title='Support Paths'
        description='Help surfaces should reduce confusion quickly: start paths, common blockers, escalation routes, and the shortest path back into the runtime.'
      />
      <LaneGrid items={lanes} />
      <SectionHeader
        number='03 — Current Focus'
        title='What Users Need Most'
        description='Show the most common operator and user guidance in the first screen instead of burying it under long prose.'
      />
      <StatGrid items={stats} />
      <TopicList items={topics} />
    </main>
  )
}

export function SettingsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <main>
      <SectionHeader number={hero.eyebrow} title={hero.title} description={hero.description} />
      <ActionLinks actions={hero.actions} />
      <SectionHeader
        number='02 — Configuration Areas'
        title='Control The Runtime'
        description='Settings should be grouped by runtime behavior, ownership, and route policy instead of being a loose list of toggles.'
      />
      <LaneGrid items={lanes} />
      <SectionHeader
        number='03 — Current Policy'
        title='Configuration Signals'
        description='Make the current mode, source of truth, and major policy boundaries obvious.'
      />
      <StatGrid items={stats} />
      <TopicList items={topics} />
    </main>
  )
}
