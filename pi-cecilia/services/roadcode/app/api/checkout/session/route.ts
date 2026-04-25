import { NextResponse } from 'next/server'
import { applyStudioUnlock, readSignedReturnState, recordAudit, withRestoredIntent } from '../../../_lib/founder-flow'
import { getStripe } from '../../../_lib/stripe'

export async function POST(request: Request) {
  const formData = await request.formData()
  const returnTo = String(formData.get('return_to') || '')
  const payload = readSignedReturnState(returnTo)

  if (!payload) {
    recordAudit('checkout_fail', { reason: 'invalid_return_state' })
    return NextResponse.redirect(new URL('/checkout', request.url))
  }

  recordAudit('checkout_start', { route: payload.route, intent: payload.intent, amount: '$1' })

  const stripe = getStripe()
  if (!stripe) {
    const response = NextResponse.redirect(new URL(withRestoredIntent(payload.route, payload.intent, { checkout: 'success' }), request.url))
    const timestamp = new Date().toISOString()
    applyStudioUnlock(response, timestamp)
    recordAudit('checkout_success', { route: payload.route, intent: payload.intent, amount: '$1', provider: 'mock' })
    recordAudit('entitlement_granted', { feature: 'studio_unlock', timestamp, provider: 'mock' })
    return response
  }

  const origin = new URL(request.url).origin
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    billing_address_collection: 'auto',
    success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}&return_to=${encodeURIComponent(returnTo)}`,
    cancel_url: `${origin}/checkout?return_to=${encodeURIComponent(returnTo)}&checkout=cancelled`,
    client_reference_id: payload.route,
    metadata: {
      feature: 'studio_unlock',
      return_to: returnTo,
      intent: payload.intent
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 100,
          product_data: {
            name: 'RoadCode Studio unlock',
            description: 'Single-feature unlock for the protected RoadCode Studio action.'
          }
        }
      }
    ]
  })

  if (!session.url) {
    recordAudit('checkout_fail', { reason: 'missing_checkout_url', provider: 'stripe' })
    return NextResponse.redirect(new URL('/checkout?checkout=cancelled', request.url))
  }

  return NextResponse.redirect(session.url)
}
