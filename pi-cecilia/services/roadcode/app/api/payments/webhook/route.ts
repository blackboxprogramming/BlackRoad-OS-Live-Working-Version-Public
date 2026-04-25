import { NextResponse } from 'next/server'
import { recordAudit } from '../../../_lib/founder-flow'
import { getStripe, getStripeWebhookSecret } from '../../../_lib/stripe'

export async function POST(request: Request) {
  const stripe = getStripe()
  const webhookSecret = getStripeWebhookSecret()

  if (!stripe || !webhookSecret) {
    recordAudit('payment_webhook_received', { provider: 'mock', idempotent: true })
    return NextResponse.json({ status: 'accepted', mode: 'mock-webhook' }, { status: 202 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    recordAudit('checkout_fail', { reason: 'missing_webhook_signature', provider: 'stripe' })
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  const body = await request.text()

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    recordAudit('payment_webhook_received', {
      provider: 'stripe',
      event_id: event.id,
      event_type: event.type,
      idempotent: true
    })

    if (event.type === 'checkout.session.completed') {
      recordAudit('payment_webhook_completed', { provider: 'stripe', event_id: event.id })
    }

    return NextResponse.json({ status: 'accepted', eventId: event.id }, { status: 202 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_webhook_error'
    recordAudit('checkout_fail', { reason: 'webhook_verification_failed', provider: 'stripe', message })
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }
}

export const runtime = 'nodejs'
