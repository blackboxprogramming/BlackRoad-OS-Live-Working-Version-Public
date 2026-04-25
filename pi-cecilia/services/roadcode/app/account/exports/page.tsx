import Link from 'next/link'
import { SectionHeader } from '../../_components/blackroad-ui'
import { getExports } from '../../_lib/founder-flow'

export default function AccountExportsPage() {
  const exports = getExports()

  return (
    <main>
      <SectionHeader
        number='01 — Exports'
        title='Export Your Own Data'
        description='Users should be able to request and retrieve their own data export without support intervention.'
      />
      <section className='feature-card feature-card-tight' style={{ marginBottom: 24 }}>
        <p className='section-label'>Request export</p>
        <h3 style={{ marginBottom: 8 }}>Generate a new account export</h3>
        <form action='/api/account/exports' method='post'>
          <button className='button' type='submit'>Create export</button>
        </form>
      </section>
      <section className='stack-list'>
        {exports.length ? exports.map((entry) => (
          <article key={entry.id} className='list-row list-row-static'>
            <div>
              <strong>{entry.name}</strong>
              <p>Status: {entry.status}. Timestamp: {entry.timestamp}</p>
            </div>
            <Link className='button button-secondary' href={entry.path}>Download export</Link>
          </article>
        )) : (
          <article className='list-row list-row-static'>
            <div>
              <strong>No exports yet</strong>
              <p>Create an export and it will remain available on this route.</p>
            </div>
          </article>
        )}
      </section>
    </main>
  )
}

