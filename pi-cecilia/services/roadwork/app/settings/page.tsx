export default function SupportPage() {
  const sections = [
    ['Governance', 'Approval thresholds', 'Required reviewers', 'Escalation lanes'],
    ['Compliance', 'Retention policy', 'Vendor review cadence', 'Launch checklist enforcement'],
    ['Operations', 'Incident handoff owner', 'Registry sync policy', 'Evidence export defaults']
  ]

  return (
    <main>
      <p className='eyebrow'>roadwork.blackroad.io</p>
      <h1>RoadWork Settings</h1>
      <p className='lede'>
        RoadWork settings should control how approvals are routed, how launch gates are enforced, and how business decisions stay
        tied to canonical products, domains, and evidence.
      </p>

      <section className='grid-section grid-section-three'>
        {sections.map(([title, ...items]) => (
          <article key={title} className='feature-card feature-card-tight'>
            <p className='section-label'>{title}</p>
            <div className='inline-code-list inline-code-list-stacked'>
              {items.map((item) => (
                <code key={item}>{item}</code>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
