import type { ReactNode } from 'react'
import { ActionLinks, ActionStack, LaneGrid, SectionHeader, StatGrid, TopicList } from './blackroad-ui'

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

type MarketingSurfaceProps = TemplateProps & {
  sectionTitle: string
  sectionDescription: string
  notesTitle: string
  notesDescription: string
  ctaTitle: string
  ctaDescription: string
}

type RuntimeSurfaceProps = TemplateProps & {
  modeLabel: string
  focusTitle: string
  focusDescription: string
  notesTitle: string
  notesDescription: string
  detailTitle?: string
  detailDescription?: string
  detailContent?: ReactNode
}

type DocsSurfaceProps = TemplateProps & {
  docLabel: string
  coverageTitle: string
  coverageDescription: string
  notesTitle: string
  notesDescription: string
}

function splitTitle(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean)

  if (parts.length <= 1) {
    return { lead: '', accent: title.trim() }
  }

  const accent = parts.pop() ?? title.trim()

  return {
    lead: parts.join(' '),
    accent
  }
}

function DisplayTitle({ title, className }: { title: string; className: string }) {
  const { lead, accent } = splitTitle(title)

  return (
    <span className={className}>
      {lead ? `${lead} ` : ''}
      <span className='grad-word'>{accent}</span>
    </span>
  )
}

function MarketingSurface({
  hero,
  stats,
  lanes,
  topics,
  sectionTitle,
  sectionDescription,
  notesTitle,
  notesDescription,
  ctaTitle,
  ctaDescription
}: MarketingSurfaceProps) {
  return (
    <div className='template-page template-page--marketing'>
      <section className='hero'>
        <div className='container hero-inner'>
          <div className='eyebrow'>{hero.eyebrow}</div>
          <h1 className='title'>
            <DisplayTitle title={hero.title} className='title-copy' />
          </h1>
          <p className='lede'>{hero.description}</p>
          <ActionLinks actions={hero.actions} />
          <StatGrid items={stats} />
        </div>
      </section>

      <section className='section'>
        <div className='container'>
          <SectionHeader
            number='02 / Structure'
            title={sectionTitle}
            description={sectionDescription}
          />
          <LaneGrid items={lanes} />
        </div>
      </section>

      <section className='section'>
        <div className='container'>
          <SectionHeader
            number='03 / Notes'
            title={notesTitle}
            description={notesDescription}
          />
          <TopicList items={topics} />

          <div className='cta-band'>
            <div className='cta-band-bar' />
            <div className='cta-band-body'>
              <div className='cta-band-copy'>
                <h3>{ctaTitle}</h3>
                <p>{ctaDescription}</p>
              </div>
              <div className='cta-band-actions'>
                <ActionLinks actions={hero.actions.slice(0, 2)} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function RuntimeSurface({
  hero,
  stats,
  lanes,
  topics,
  modeLabel,
  focusTitle,
  focusDescription,
  notesTitle,
  notesDescription,
  detailTitle,
  detailDescription,
  detailContent
}: RuntimeSurfaceProps) {
  return (
    <div className='runtime-shell'>
      <aside className='runtime-sidebar'>
        <div className='runtime-sidebar-card'>
          <div className='brand'>
            <span className='brand-bar' />
            <span>{modeLabel}</span>
          </div>
          <p className='sidebar-copy'>{hero.description}</p>
        </div>

        <div className='runtime-sidebar-card'>
          <div className='side-label'>Actions</div>
          <ActionStack actions={hero.actions} />
        </div>

        <div className='runtime-sidebar-card'>
          <div className='side-label'>Active lanes</div>
          <div className='runtime-lane-list'>
            {lanes.map((lane) => (
              <div key={lane.title} className='runtime-lane-item'>
                <strong>{lane.title}</strong>
                <span>{lane.items[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className='runtime-main'>
        <div className='topnav'>
          <div className='title-block'>
            <p className='eyebrow'>{hero.eyebrow}</p>
            <h1>
              <DisplayTitle title={hero.title} className='runtime-title' />
            </h1>
            <p>{hero.description}</p>
          </div>
          <div className='pill'>
            <span className='pill-dot' />
            {modeLabel}
          </div>
        </div>

        <StatGrid items={stats} />

        {detailContent ? (
          <>
            <SectionHeader
              number='02 / Detail'
              title={detailTitle ?? focusTitle}
              description={detailDescription ?? focusDescription}
            />
            {detailContent}
            <SectionHeader
              number='03 / Operating lanes'
              title={focusTitle}
              description={focusDescription}
            />
            <LaneGrid items={lanes} />
          </>
        ) : (
          <>
            <SectionHeader
              number='02 / Operating lanes'
              title={focusTitle}
              description={focusDescription}
            />
            <LaneGrid items={lanes} />
          </>
        )}

        <SectionHeader
          number={detailContent ? '04 / Notes' : '03 / Notes'}
          title={notesTitle}
          description={notesDescription}
        />
        <TopicList items={topics} />
      </div>
    </div>
  )
}

function DocsSurface({
  hero,
  stats,
  lanes,
  topics,
  docLabel,
  coverageTitle,
  coverageDescription,
  notesTitle,
  notesDescription
}: DocsSurfaceProps) {
  return (
    <div className='docs-layout'>
      <aside className='docs-sidebar'>
        <div className='docs-nav-title'>{docLabel}</div>
        <div className='docs-nav-links'>
          <a href='#overview'>Overview</a>
          <a href='#reader-paths'>Reader paths</a>
          <a href='#notes'>Notes</a>
        </div>
      </aside>

      <div className='docs-shell'>
        <div className='content-bar' />
        <article className='docs-content'>
          <div className='eyebrow'>{hero.eyebrow}</div>
          <h1 className='title docs-title'>
            <DisplayTitle title={hero.title} className='title-copy' />
          </h1>
          <p className='lede'>{hero.description}</p>
          <ActionLinks actions={hero.actions} />

          <section className='section section--docs' id='overview'>
            <SectionHeader
              number='02 / Coverage'
              title={coverageTitle}
              description={coverageDescription}
            />
            <StatGrid items={stats} />
          </section>

          <section className='section section--docs' id='reader-paths'>
            <SectionHeader
              number='03 / Reader paths'
              title='Guide the right readers fast'
              description='Keep setup, operation, escalation, and reference material easy to scan so readers land in the right place quickly.'
            />
            <LaneGrid items={lanes} />
          </section>

          <section className='section section--docs' id='notes'>
            <SectionHeader
              number='04 / Notes'
              title={notesTitle}
              description={notesDescription}
            />
            <TopicList items={topics} />
          </section>
        </article>
      </div>

      <aside className='docs-toc'>
        <div className='docs-nav-title'>On this page</div>
        <div className='docs-nav-links'>
          <a href='#overview'>Overview</a>
          <a href='#reader-paths'>Reader paths</a>
          <a href='#notes'>Notes</a>
        </div>
      </aside>
    </div>
  )
}

function AuthSurface({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <div className='auth-template'>
      <div className='auth-shell'>
        <section className='brand-side'>
          <div>
            <div className='brand-lockup'>
              <span className='brand-bar' />
              <span>BlackRoad Auth</span>
            </div>
            <div className='brand-copy'>
              <div className='eyebrow'>{hero.eyebrow}</div>
              <h1 className='hero-title'>
                <DisplayTitle title={hero.title} className='title-copy' />
              </h1>
              <div className='hero-copy'>
                <p>{hero.description}</p>
              </div>
              <div className='feature-list'>
                {topics.map((topic) => (
                  <div key={topic.title} className='feature-list-item'>
                    {topic.body}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='brand-foot'>
            <span>Space Grotesk</span>
            <span>JetBrains Mono</span>
            <span>Approved display gradient only</span>
          </div>
        </section>

        <section className='form-side'>
          <div className='auth-card'>
            <div className='auth-bar' />
            <div className='auth-body'>
              <div className='auth-kicker'>{hero.eyebrow}</div>
              <h2 className='auth-title'>{hero.title}</h2>
              <p className='auth-sub'>{hero.description}</p>

              <div className='auth-stat-list'>
                {stats.map((item) => (
                  <article key={item.label} className='auth-stat-item'>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>

              <div className='divider'>Actions</div>
              <ActionStack actions={hero.actions} />

              <div className='divider'>Session controls</div>
              <div className='auth-lane-list'>
                {lanes.map((lane) => (
                  <article key={lane.title} className='auth-lane-item'>
                    <strong>{lane.title}</strong>
                    <p>{lane.items.join(' • ')}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export function LandingTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <MarketingSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      sectionTitle='Use the root page as the canonical front door'
      sectionDescription='Keep the overview page direct and system-aware so people quickly understand what the service is and where the runtime lives.'
      notesTitle='Preserve the product story'
      notesDescription='The Desktop template family should refresh the visual language without flattening each service’s own message and route intent.'
      ctaTitle='Launch with the shared BlackRoad page system'
      ctaDescription='Use the same typography, spacing, gradient rules, and card language across the canonical services so the ecosystem reads as one system.'
    />
  )
}

export function AppRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='App runtime'
      focusTitle='Operate the live product'
      focusDescription='App-at-root services should feel operational immediately, with current state, actions, and active work lanes visible in the first screen.'
      notesTitle='Keep runtime context visible'
      notesDescription='The refreshed shell keeps execution-oriented structure while preserving each product’s own copy and priorities.'
    />
  )
}

export function DashboardTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Dashboard'
      focusTitle='Make the signal legible'
      focusDescription='Dashboard pages should privilege trustworthy metrics, operating lanes, and the smallest useful next actions instead of generic filler panels.'
      notesTitle='Hold the operating story together'
      notesDescription='Metrics are only useful when they stay tied to ownership, constraints, and the next move.'
    />
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
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Analytics runtime'
      focusTitle='Run the analytics surface'
      focusDescription='Keep traffic quality, attribution health, and cleanup work in the same runtime so operators can trust what they are seeing.'
      notesTitle='Keep portfolio analytics decision-safe'
      notesDescription='The analytics shell matches the Desktop dashboard family while leaving service-specific KPI content intact.'
      detailTitle={detailTitle}
      detailDescription={detailDescription}
      detailContent={detailContent}
    />
  )
}

export function DocsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <DocsSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      docLabel='Docs'
      coverageTitle='Coverage and readiness'
      coverageDescription='Documentation pages should make current coverage, missing gaps, and the shortest path to action obvious from the first screen.'
      notesTitle='Keep docs operational'
      notesDescription='The docs template should read like a working manual, not a marketing page wearing documentation clothes.'
    />
  )
}

export function MediaDocsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <DocsSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      docLabel='Editorial docs'
      coverageTitle='Editorial coverage and release readiness'
      coverageDescription='Media documentation should orient editors around schemas, packaging rules, and release dependencies without losing the shared surface language.'
      notesTitle='Ship editorial systems cleanly'
      notesDescription='This template preserves release and publishing intent while aligning the docs shell with the newer Desktop pattern.'
    />
  )
}

export function StatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Status'
      focusTitle='Separate state from action'
      focusDescription='Status pages should make healthy, degraded, and blocked conditions obvious and show what users or operators should inspect next.'
      notesTitle='Communicate clearly under load'
      notesDescription='The updated status shell keeps the message tight while leaving room for service-specific guidance and follow-through.'
    />
  )
}

export function AnalyticsStatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Analytics status'
      focusTitle='Protect reporting confidence'
      focusDescription='Analytics status surfaces should make freshness, attribution quality, and redirect drift obvious enough that stakeholders know whether the numbers are decision-safe.'
      notesTitle='Keep reliability visible'
      notesDescription='When reporting quality slips, the page should show the failure mode and the recovery path in the same view.'
    />
  )
}

export function InfrastructureStatusTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Infrastructure status'
      focusTitle='Watch the shared runtime condition'
      focusDescription='Infrastructure status should emphasize routing integrity, queue pressure, fleet health, and escalation paths instead of generic KPI tiles.'
      notesTitle='Support the control plane'
      notesDescription='The new shell keeps operator context and remediation guidance legible under degraded conditions.'
    />
  )
}

export function AuthTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return <AuthSurface hero={hero} stats={stats} lanes={lanes} topics={topics} />
}

export function SplitAppTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <MarketingSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      sectionTitle='Keep `/` and `/app` intentionally different'
      sectionDescription='Split-surface products should use the root page to explain value and routing, then reserve the app surface for the actual runtime and operator work.'
      notesTitle='Teach the route model'
      notesDescription='The public page should explain the system cleanly without pretending to be the runtime itself.'
      ctaTitle='Move people to the right surface'
      ctaDescription='This shell keeps product explanation at the front door while pointing people toward the live runtime, docs, or launch actions without visual drift.'
    />
  )
}

export function SplitRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Split runtime'
      focusTitle='Operate the `/app` surface'
      focusDescription='The runtime side of a split product should feel live immediately, with state, actions, and current work visible before anything else.'
      notesTitle='Keep the boundary clear'
      notesDescription='The refreshed runtime shell complements the public root page while preserving the app-specific copy and lanes.'
    />
  )
}

export function OperatorRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Operator runtime'
      focusTitle='Run the control surface'
      focusDescription='Operator products should make queues, ownership, escalation, and system truth obvious enough that coordination does not depend on hidden context.'
      notesTitle='Reduce coordination drag'
      notesDescription='The Desktop-aligned runtime shell keeps control-plane products sharp without flattening their operating intent.'
    />
  )
}

export function MediaRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Editorial runtime'
      focusTitle='Move drafts to publish'
      focusDescription='Editorial runtimes should show what is ready, what is blocked, and what ships next instead of burying release state in generic dashboards.'
      notesTitle='Keep release work connected'
      notesDescription='The refreshed shell brings the publishing runtime into the same visual family as the rest of the platform while preserving editorial content.'
    />
  )
}

export function WorldRuntimeTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='World runtime'
      focusTitle='Shape the world in one surface'
      focusDescription='World-building products should keep scene work, asset state, and release handoff visible in one builder-style runtime.'
      notesTitle='Preserve creative and operational context'
      notesDescription='The new layout aligns with the Desktop family while keeping world-building work readable as a live system.'
    />
  )
}

export function HelpTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <DocsSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      docLabel='Help'
      coverageTitle='Support paths and known blockers'
      coverageDescription='Help surfaces should reduce confusion quickly by showing the main start paths, recurring blockers, and the fastest route back into the runtime.'
      notesTitle='Answer the common questions first'
      notesDescription='The help shell follows the Desktop docs family while keeping service-specific guidance and escalation context intact.'
    />
  )
}

export function SettingsTemplate({ hero, stats, lanes, topics }: TemplateProps) {
  return (
    <RuntimeSurface
      hero={hero}
      stats={stats}
      lanes={lanes}
      topics={topics}
      modeLabel='Settings'
      focusTitle='Group configuration by behavior'
      focusDescription='Settings should be organized around runtime behavior, ownership, route policy, and trust boundaries instead of a loose list of toggles.'
      notesTitle='Make current policy obvious'
      notesDescription='The updated shell keeps mode, source of truth, and major configuration boundaries visible in the same place.'
    />
  )
}
