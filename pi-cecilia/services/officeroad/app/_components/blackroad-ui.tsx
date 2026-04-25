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
  serviceUrl?: string
}

export function BrandNav({ serviceName, serviceUrl }: BrandNavProps) {
  return (
    <nav className='top-nav'>
      <div className='top-nav-inner'>
        <a href='/' className='nav-logo'>
          <span className='nav-logo-bar' />
          BlackRoad
        </a>
        <div className='nav-links'>
          <a href='/'>Home</a>
          <a href='/help'>Help</a>
          <a href='/settings'>Settings</a>
        </div>
        <a className='nav-cta' href={serviceUrl ?? '/'}>
          {serviceName}
        </a>
      </div>
    </nav>
  )
}

export function BrandFooter() {
  return (
    <footer className='shell'>
      <div className='shell-content'>
        <section className='meta-card'>
          <div className='meta-card-grad' />
          <div className='meta-card-body'>
            <p className='meta-label'>BlackRoad</p>
            <p><strong>System:</strong> Canonical runtime surface</p>
            <p><strong>Support:</strong> `/help`, `/settings`, and documented support routes</p>
          </div>
        </section>
      </div>
    </footer>
  )
}

export function ActionLinks({ actions }: { actions: ActionLink[] }) {
  return (
    <div className='actions'>
      {actions.map((action) => {
        const className = action.secondary ? 'button button-secondary' : 'button'
        return action.href.startsWith('/') ? (
          <Link key={action.label} className={className} href={action.href}>
            {action.label}
          </Link>
        ) : (
          <a key={action.label} className={className} href={action.href}>
            {action.label}
          </a>
        )
      })}
    </div>
  )
}

export function SectionHeader({ number, title, description }: SectionHeaderProps) {
  return (
    <header>
      <p className='section-label'>{number}</p>
      <h2>{title}</h2>
      <p className='lede'>{description}</p>
    </header>
  )
}

export function StatGrid({ items }: { items: StatCard[] }) {
  return (
    <section className='grid-section grid-section-three'>
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
    <section className='grid-section grid-section-three'>
      {items.map((item) => (
        <article key={item.title} className='feature-card feature-card-tight'>
          <p className='section-label'>{item.title}</p>
          <div className='inline-code-list inline-code-list-stacked'>
            {item.items.map((entry) => (
              <code key={entry}>{entry}</code>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

export function TopicList({ items }: { items: Topic[] }) {
  return (
    <section className='stack-list'>
      {items.map((item) => (
        <article key={item.title} className='list-row list-row-static'>
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
