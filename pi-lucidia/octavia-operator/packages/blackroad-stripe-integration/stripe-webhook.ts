import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('💰 Payment successful:', session.id)
      // TODO: Provision user access, send email, update database
      break

    case 'customer.subscription.created':
      console.log('🎉 New subscription:', event.data.object.id)
      break

    case 'customer.subscription.updated':
      console.log('📝 Subscription updated:', event.data.object.id)
      break

    case 'customer.subscription.deleted':
      console.log('❌ Subscription cancelled:', event.data.object.id)
      // TODO: Revoke user access
      break

    case 'invoice.payment_succeeded':
      console.log('✅ Invoice paid:', event.data.object.id)
      break

    case 'invoice.payment_failed':
      console.log('⚠️ Payment failed:', event.data.object.id)
      // TODO: Send notification to user
      break
  }

  return NextResponse.json({ received: true })
}
