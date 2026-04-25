import Link from 'next/link'
import { SectionHeader } from '../../_components/blackroad-ui'
import { getDownloads } from '../../_lib/founder-flow'

export default function AccountDownloadsPage() {
  const downloads = getDownloads()

  return (
    <main>
      <SectionHeader
        number='01 — Downloads'
        title='Owned Downloads'
        description='Downloads must be directly reachable and stable. If the user owns a result, the route should let them recover it without a redirect loop.'
      />
      <section className='stack-list'>
        {downloads.length ? downloads.map((download) => (
          <article key={download.id} className='list-row list-row-static'>
            <div>
              <strong>{download.name}</strong>
              <p>Status: {download.status}</p>
            </div>
            <Link className='button button-secondary' href={download.path}>Download</Link>
          </article>
        )) : (
          <article className='list-row list-row-static'>
            <div>
              <strong>No downloads yet</strong>
              <p>Downloads appear here once the protected feature has been purchased and rendered.</p>
            </div>
          </article>
        )}
      </section>
    </main>
  )
}

