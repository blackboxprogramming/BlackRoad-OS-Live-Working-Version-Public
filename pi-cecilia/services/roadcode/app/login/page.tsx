import { AuthTemplate } from '../_components/blackroad-templates'
import { createSignedReturnState, readSignedReturnState } from '../_lib/founder-flow'

type LoginPageProps = {
  searchParams?: {
    return_to?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const fallbackReturn = createSignedReturnState('/product/studio', 'unlock')
  const returnState = readSignedReturnState(searchParams?.return_to) ? searchParams?.return_to : fallbackReturn

  return (
    <main>
      <AuthTemplate
        hero={{
          eyebrow: '01 — Login',
          title: 'Use One Canonical Login Route',
          description: 'This auth surface only exists to identify the user and return them to the exact route and exact action they started from.',
          actions: [
            { label: 'Back to studio', href: '/product/studio', secondary: true },
            { label: 'Account security', href: '/account/security' }
          ]
        }}
        stats={[
          { label: 'Return state', value: 'signed', note: 'The destination is validated server-side before the user is sent back.' },
          { label: 'Session cookie', value: 'HttpOnly', note: 'Auth state is stored in a secure server-side cookie, never in the URL.' },
          { label: 'Redirect policy', value: 'strict', note: 'No fallback redirect to home or dashboard unless the user asked for it.' }
        ]}
        lanes={[
          { title: 'Continue', items: ['Identify the user', 'Restore the original route', 'Restore the protected intent'] },
          { title: 'Reject', items: ['Open redirects', 'Tampered state', 'Leaking tokens in URLs'] },
          { title: 'Recover', items: ['Re-auth when expired', 'Preserve route context', 'Return to exact action'] }
        ]}
        topics={[
          { title: 'The page shell is public', body: 'Users should not have to log in just to learn what the feature is or what the $1 unlock does.' },
          { title: 'The login route is canonical', body: 'Every protected action funnels through this one route so auth state stays predictable and redirect loops stay visible.' }
        ]}
      />
      <section className='feature-card feature-card-tight' style={{ marginTop: 24 }}>
        <p className='section-label'>Mock login</p>
        <h3 style={{ marginBottom: 8 }}>Complete sign-in and restore context</h3>
        <p className='lede' style={{ marginBottom: 16 }}>
          This scaffold uses a server-side callback to set a short-lived session cookie and route you back to the signed destination.
        </p>
        <form action='/api/auth/login/start' method='post'>
          <input type='hidden' name='return_to' value={returnState} />
          <button className='button' type='submit'>Sign in and continue</button>
        </form>
      </section>
    </main>
  )
}

