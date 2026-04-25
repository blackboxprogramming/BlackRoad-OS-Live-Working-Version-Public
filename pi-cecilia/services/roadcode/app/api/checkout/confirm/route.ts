import { NextResponse } from 'next/server'
import { applyStudioUnlock, readSignedReturnState, recordAudit, withRestoredIntent } from '../../../_lib/founder-flow'
import { getStripe } from '../../../_lib/stripe'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')
  const returnTo = url.searchParams.get('return_to')
  const payload = readSignedReturnState(returnTo)
  const stripe = getStripe()

  if (!sessionId || !payload || !stripe) {
    recordAudit('checkout_fail', { reason: 'invalid_confirmation_state', provider: stripe ? 'stripe' : 'missing' })
    return NextResponse.redirect(new URL('/checkout?checkout=cancelled', request.url))
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    recordAudit('checkout_fail', { reason: 'payment_not_paid', provider: 'stripe', payment_status: session.payment_status })
    return NextResponse.redirect(new URL(withRestoredIntent(payload.route, payload.intent, { checkout: 'pending' }), request.url))
  }

  const response = NextResponse.redirect(new URL(withRestoredIntent(payload.route, payload.intent, { checkout: 'success' }), request.url))
  const timestamp = new Date().toISOString()
  applyStudioUnlock(response, timestamp)
  recordAudit('checkout_success', { route: payload.route, intent: payload.intent, amount: '$1', provider: 'stripe', session_id: session.id })
  recordAudit('entitlement_granted', { feature: 'studio_unlock', timestamp, provider: 'stripe', session_id: session.id })
  return response
}
