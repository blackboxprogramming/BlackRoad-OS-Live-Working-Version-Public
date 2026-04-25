import { ActionLinks, LaneGrid, SectionHeader, StatGrid, TopicList } from '../../_components/blackroad-ui'
import { createSignedReturnState, getViewerState } from '../../_lib/founder-flow'

type StudioPageProps = {
  searchParams?: {
    intent?: string
    restored?: string
    checkout?: string
  }
}

export default function StudioPage({ searchParams }: StudioPageProps) {
  const state = getViewerState()
  const loginReturn = createSignedReturnState('/product/studio', 'unlock')
  const checkoutReturn = createSignedReturnState('/product/studio', 'unlock')

  const actions = [
    { label: 'Try preview', href: '/product/studio/preview', secondary: true },
    state.authState === 'authenticated'
      ? { label: 'Unlock for $1', href: `/checkout?return_to=${encodeURIComponent(checkoutReturn)}` }
      : { label: 'Sign in', href: `/login?return_to=${encodeURIComponent(loginReturn)}` },
    { label: 'Account purchases', href: '/account/purchases', secondary: true }
  ]

  const statusLabel =
    state.renderState === 'unlocked'
      ? 'Unlocked'
      : state.authState === 'expired'
        ? 'Session expired'
        : state.authState === 'authenticated'
          ? 'Login restored, entitlement missing'
          : 'Preview mode'

  const statusNote =
    state.renderState === 'unlocked'
      ? 'The page shell rendered first and the protected feature is now available without a redirect loop.'
      : state.authState === 'expired'
        ? 'Re-authenticate once and return directly to this route with your original context preserved.'
        : state.authState === 'authenticated'
          ? 'You are signed in. Only the paid action is gated.'
          : 'The shell is public. The paid action is explicit and isolated.'

  return (
    <main>
      <SectionHeader
        number='01 — Studio'
        title='Render First, Then Gate The Protected Action'
        description='RoadCode Studio is the reference implementation for the boring BlackRoad auth and payment path: public shell first, single login, single checkout, exact return target, stable account recovery.'
      />
      <ActionLinks actions={actions} />
      {(searchParams?.restored || searchParams?.checkout === 'success') ? (
        <section className='list-row list-row-static'>
          <div>
            <strong>
              {searchParams?.checkout === 'success'
                ? 'Checkout completed'
                : 'Return context restored'}
            </strong>
            <p>
              {searchParams?.checkout === 'success'
                ? 'The unlock completed and the page reloaded into the exact route you started from.'
                : `The original intent${searchParams?.intent ? ` (${searchParams.intent})` : ''} was preserved through authentication.`}
            </p>
          </div>
        </section>
      ) : null}
      <StatGrid
        items={[
          { label: 'Auth state', value: state.authState, note: 'Identity is separate from render state and entitlement state.' },
          { label: 'Entitlement', value: state.entitlementState, note: 'Only the protected action depends on entitlement.' },
          { label: 'Render', value: statusLabel, note: statusNote }
        ]}
      />
      <SectionHeader
        number='02 — What Costs Money'
        title='Public Explanation, Paid Action'
        description='A user should be able to understand what the feature is, what the preview does, and what the paid unlock grants before any auth wall appears.'
      />
      <LaneGrid
        items={[
          { title: 'Free', items: ['Open product shell', 'Read pricing and feature explanation', 'Try preview mode'] },
          { title: 'Protected', items: ['Generate a studio artifact', 'Save a result to account', 'Export downloadable bundle'] },
          { title: 'Recovery', items: ['View purchases', 'Recover downloads', 'Request account export'] }
        ]}
      />
      <SectionHeader
        number='03 — Current Flow'
        title='What Happens Next'
        description='These are the exact transitions this scaffold is hardening before a live identity or billing provider is wired in.'
      />
      <TopicList
        items={[
          { title: 'Anonymous users stay on the page', body: 'The product shell remains public. Clicking a protected action creates signed return state and moves into the login flow only when needed.' },
          { title: 'Authenticated users do not get bounced home', body: 'If the session is valid but entitlement is missing, the route stays put and the unlock action is the only gated step.' },
          { title: 'Account recovery is direct', body: 'Purchases, downloads, exports, and security are all first-class routes instead of side effects hidden behind a dashboard home.' }
        ]}
      />
    </main>
  )
}

