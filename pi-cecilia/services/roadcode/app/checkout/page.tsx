import { redirect } from 'next/navigation'
import { ActionLinks, LaneGrid, SectionHeader, StatGrid } from '../_components/blackroad-ui'
import { createSignedReturnState, getViewerState, readSignedReturnState } from '../_lib/founder-flow'

type CheckoutPageProps = {
  searchParams?: {
    return_to?: string
    checkout?: string
  }
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const state = getViewerState()
  const fallback = createSignedReturnState('/product/studio', 'unlock')
  const validatedReturn = readSignedReturnState(searchParams?.return_to)
  const returnState = validatedReturn && searchParams?.return_to ? searchParams.return_to : fallback

  if (state.authState !== 'authenticated') {
    redirect(`/login?return_to=${encodeURIComponent(returnState)}`)
  }

  return (
    <main>
      <SectionHeader
        number='01 — Checkout'
        title='Use One Canonical Checkout Route'
        description='Checkout should only answer one question: do you want to unlock this protected feature for $1 and return to the exact route you started from.'
      />
      <ActionLinks
        actions={[
          { label: 'Back to studio', href: '/product/studio', secondary: true },
          { label: 'Account purchases', href: '/account/purchases' }
        ]}
      />
      {searchParams?.checkout === 'cancelled' ? (
        <section className='list-row list-row-static'>
          <div>
            <strong>Checkout cancelled</strong>
            <p>No purchase was completed. The feature remains locked and the route context was preserved.</p>
          </div>
        </section>
      ) : null}
      <StatGrid
        items={[
          { label: 'User', value: state.userEmail ?? 'signed-in user', note: 'Checkout uses authenticated server-side session state.' },
          { label: 'Amount', value: '$1.00', note: 'The purchase is narrow and explicit instead of hiding behind a dashboard bundle.' },
          { label: 'Grant model', value: 'server-side', note: 'Entitlement is granted only after server-side Stripe verification or the local mock path.' }
        ]}
      />
      <SectionHeader
        number='02 — Unlock'
        title='What This Purchase Grants'
        description='The unlock grants immediate access to the protected studio action, account recovery for the result, and a stable purchase record.'
      />
      <LaneGrid
        items={[
          { title: 'Unlocked', items: ['Generate protected studio result', 'See purchase in account', 'Recover later from downloads'] },
          { title: 'Still public', items: ['Page shell', 'Feature explanation', 'Preview mode'] },
          { title: 'Protected by server', items: ['Entitlement grant', 'Receipt record', 'Return-state validation'] }
        ]}
      />
      <section className='feature-card feature-card-tight' style={{ marginTop: 24 }}>
        <p className='section-label'>Mock checkout</p>
        <h3 style={{ marginBottom: 8 }}>Complete the $1 unlock</h3>
        <p className='lede' style={{ marginBottom: 16 }}>
          This scaffold simulates checkout completion and grants the entitlement server-side so the product route can render unlocked immediately.
        </p>
        <form action='/api/checkout/session' method='post'>
          <input type='hidden' name='return_to' value={returnState} />
          <button className='button' type='submit'>Pay $1 and unlock</button>
        </form>
      </section>
    </main>
  )
}
