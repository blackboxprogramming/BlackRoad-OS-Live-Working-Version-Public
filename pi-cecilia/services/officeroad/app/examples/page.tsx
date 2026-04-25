import Link from 'next/link'
import { SectionHeader, TopicList } from '../_components/blackroad-ui'

const examples = [
  {
    title: 'Landing',
    body: 'Use for public product portals, ecosystem fronts, and homepages that explain the product before any runtime interaction.',
    href: '/examples/landing'
  },
  {
    title: 'Dashboard',
    body: 'Use for KPI-heavy runtime surfaces, operator consoles, and queue/capacity pages.',
    href: '/examples/dashboard'
  },
  {
    title: 'Docs',
    body: 'Use for documentation hubs, setup references, implementation guides, and reader-path navigation.',
    href: '/examples/docs'
  },
  {
    title: 'Help',
    body: 'Use for guided support, common-fix routing, and escalation-oriented product help surfaces.',
    href: '/examples/help'
  },
  {
    title: 'Settings',
    body: 'Use for runtime configuration, policy boundaries, and ownership-aware control surfaces.',
    href: '/examples/settings'
  },
  {
    title: 'Status',
    body: 'Use for uptime, degradation, incident, and service-readiness communication.',
    href: '/examples/status'
  },
  {
    title: 'Auth',
    body: 'Use for sign-in, authorization gates, and high-trust identity handoff surfaces.',
    href: '/examples/auth'
  },
  {
    title: 'Split App',
    body: 'Use when `/` is public-facing and `/app` is the actual runtime.',
    href: '/examples/split-app'
  }
]

export default function ExamplesIndexPage() {
  return (
    <main>
      <SectionHeader
        number='01 — Templates'
        title='BlackRoad Page Template Library'
        description='Pick a page type first. Then replace the copy and metrics while keeping the visual language, section rhythm, and route intent intact.'
      />
      <section className='stack-list'>
        {examples.map((example) => (
          <article key={example.title} className='list-row'>
            <div>
              <strong>{example.title}</strong>
              <p>{example.body}</p>
            </div>
            <Link className='button button-secondary' href={example.href}>
              Open template
            </Link>
          </article>
        ))}
      </section>
      <TopicList
        items={[
          {
            title: 'Start from page type, not product name',
            body: 'Most BlackRoad pages reuse the same structural patterns. Choose landing, dashboard, docs, status, auth, or split-app first, then specialize.'
          },
          {
            title: 'Copy structure before copywriting',
            body: 'The approved design language already decides spacing, section cadence, and tonal restraint. Replace content only after the frame is correct.'
          }
        ]}
      />
    </main>
  )
}
