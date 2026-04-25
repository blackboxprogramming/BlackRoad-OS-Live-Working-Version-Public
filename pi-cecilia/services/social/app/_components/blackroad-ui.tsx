import Link from 'next/link'

type ActionLink = {
  label: string
  href: string
  secondary?: boolean
}

type StatCard = {
  label: string
  value: string
  note: string
}

type Lane = {
  title: string
  items: string[]
}

type Topic = {
  title: string
  body: string
}

type SectionHeaderProps = {
  number: string
  title: string
  description: string
}

type BrandNavProps = {
  serviceName: string
  serviceUrl: string
}

function isInternalHref(href: string) {
  return href.startsWith('/')
}

function renderActionLink(action: ActionLink, className: string, block = false) {
  const classes = block ? `${className} btn-block` : className

  if (isInternalHref(action.href)) {
    return (
      <Link key={`${action.label}-${action.href}`} className={classes} href={action.href}>
        {action.label}
      </Link>
    )
  }

  return (
    <a key={`${action.label}-${action.href}`} className={classes} href={action.href}>
      {action.label}
    </a>
  )
}

export function BrandNav({ serviceName, serviceUrl }: BrandNavProps) {
  return (
    <nav className='brand-nav'>
      <div className='brand-nav-inner'>
        <a href='https://blackroad.io' className='brand-nav-logo'>
          <span className='brand-nav-bar' />
          <span>BlackRoad</span>
        </a>

        <div className='brand-nav-links'>
          <a href='https://os.blackroad.io'>OS</a>
          <a href='https://roadtrip.blackroad.io'>Agents</a>
          <a href='https://search.blackroad.io'>Search</a>
          <a href='https://roadcode.blackroad.io'>Code</a>
          <a href='https://docs.blackroad.io'>Docs</a>
        </div>

        <a href={serviceUrl} className='brand-nav-cta'>
          <span className='brand-nav-cta-text'>{serviceName}</span>
        </a>
      </div>
    </nav>
  )
}

export function BrandFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className='brand-footer'>
      <div className='brand-footer-inner'>
        <div className='brand-footer-grid'>
          <div>
            <div className='brand-footer-brand'>
              <span className='brand-footer-bar' />
              <span>BlackRoad OS</span>
            </div>
            <p className='brand-footer-copy-block'>
              Canonical BlackRoad product surfaces, operator runtimes, docs, and launch pages built from the shared desktop template family.
            </p>
          </div>

          <div className='brand-footer-col'>
            <h4>Products</h4>
            <a href='https://blackboard.blackroad.io'>BlackBoard</a>
            <a href='https://roadtrip.blackroad.io'>RoadTrip</a>
            <a href='https://search.blackroad.io'>Search</a>
            <a href='https://roadcode.blackroad.io'>RoadCode</a>
          </div>

          <div className='brand-footer-col'>
            <h4>Platform</h4>
            <a href='https://os.blackroad.io'>BlackRoad OS</a>
            <a href='https://roadwork.blackroad.io'>RoadWork</a>
            <a href='https://roadchain.blackroad.io'>RoadChain</a>
            <a href='https://roadside.blackroad.io'>RoadSide</a>
          </div>

          <div className='brand-footer-col'>
            <h4>Company</h4>
            <a href='https://blackroad.io'>About</a>
            <a href='https://brand.blackroad.io'>Brand</a>
            <a href='https://status.blackroad.io'>Status</a>
            <a href='https://docs.blackroad.io'>Docs</a>
          </div>
        </div>

        <div className='brand-footer-bottom'>
          <span className='brand-footer-meta'>© {year} BlackRoad OS Inc. All rights reserved.</span>
          <span className='brand-footer-meta'>blackroad.io</span>
        </div>
      </div>
    </footer>
  )
}

export function ActionLinks({ actions }: { actions: ActionLink[] }) {
  return (
    <div className='actions'>
      {actions.map((action) => renderActionLink(action, action.secondary ? 'btn btn-outline' : 'btn btn-primary'))}
    </div>
  )
}

export function ActionStack({ actions }: { actions: ActionLink[] }) {
  return (
    <div className='action-stack'>
      {actions.map((action) => renderActionLink(action, action.secondary ? 'btn btn-outline' : 'btn btn-primary', true))}
    </div>
  )
}

export function SectionHeader({ number, title, description }: SectionHeaderProps) {
  return (
    <header className='section-header'>
      <p className='section-eyebrow'>{number}</p>
      <h2 className='section-title'>{title}</h2>
      <p className='section-sub'>{description}</p>
    </header>
  )
}

export function StatGrid({ items }: { items: StatCard[] }) {
  return (
    <section className='metric-grid'>
      {items.map((item) => (
        <article key={item.label} className='metric-card metric-card-compact'>
          <p className='metric-label'>{item.label}</p>
          <p className='metric-value metric-value-small'>{item.value}</p>
          <p className='metric-note'>{item.note}</p>
        </article>
      ))}
    </section>
  )
}

export function LaneGrid({ items }: { items: Lane[] }) {
  return (
    <section className='panel-grid'>
      {items.map((item) => (
        <article key={item.title} className='panel-card'>
          <p className='panel-kicker'>{item.title}</p>
          <ul className='bullet-list'>
            {item.items.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}

export function TopicList({ items }: { items: Topic[] }) {
  return (
    <section className='topic-stack'>
      {items.map((item) => (
        <article key={item.title} className='topic-row'>
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
