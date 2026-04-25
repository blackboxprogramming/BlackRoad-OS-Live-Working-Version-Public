export default function SupportPage() {
  const guides = [
    {
      title: 'Review a launch request',
      body: 'Confirm the canonical host, route model, validation evidence, and rollback path before a product or domain change goes live.'
    },
    {
      title: 'Handle a policy blocker',
      body: 'Record the owner, the affected product, and the exact gate that failed so the next agent can continue without rebuilding context.'
    },
    {
      title: 'Close the loop cleanly',
      body: 'When a decision changes structure, update the registry and operating docs in the same change so approvals and reality do not drift apart.'
    }
  ]

  return (
    <main>
      <p className='eyebrow'>roadwork.blackroad.io</p>
      <h1>RoadWork Help</h1>
      <p className='lede'>
        RoadWork help should teach operators how to move from policy and approvals to executed changes without losing auditability or
        canonical alignment.
      </p>

      <section className='stack-list'>
        {guides.map((guide) => (
          <article key={guide.title} className='list-row list-row-static'>
            <div>
              <strong>{guide.title}</strong>
              <p>{guide.body}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
