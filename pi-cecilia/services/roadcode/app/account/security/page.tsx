import { SectionHeader, TopicList } from '../../_components/blackroad-ui'
import { getViewerState } from '../../_lib/founder-flow'

export default function AccountSecurityPage() {
  const state = getViewerState()

  return (
    <main>
      <SectionHeader
        number='01 — Security'
        title='Session And Security State'
        description='Security routes should tell the user whether they are signed in, whether the session expired, and what the next safe action is.'
      />
      <TopicList
        items={[
          { title: 'Current auth state', body: `The current session state is ${state.authState}.` },
          { title: 'Cookie model', body: 'This scaffold uses a signed server-side session cookie with HttpOnly storage. No persistent access token appears in the URL.' },
          { title: 'Recovery rule', body: 'If the session expires, the user should re-authenticate and return to the exact route and action they started from.' }
        ]}
      />
      <section className='grid-section grid-section-three' style={{ marginTop: 24 }}>
        <article className='feature-card feature-card-tight'>
          <p className='section-label'>Expire session</p>
          <p className='lede' style={{ marginBottom: 16 }}>Simulate a session-expired state without losing the account route shape.</p>
          <form action='/api/auth/expire' method='post'>
            <button className='button button-secondary' type='submit'>Expire session</button>
          </form>
        </article>
        <article className='feature-card feature-card-tight'>
          <p className='section-label'>Sign out</p>
          <p className='lede' style={{ marginBottom: 16 }}>Clear the current signed session and return to the canonical login route.</p>
          <form action='/api/auth/logout' method='post'>
            <button className='button button-secondary' type='submit'>Sign out</button>
          </form>
        </article>
      </section>
    </main>
  )
}
