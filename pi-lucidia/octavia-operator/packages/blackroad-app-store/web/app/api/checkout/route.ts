import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const PLANS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
  credits: process.env.STRIPE_PRICE_CREDITS!,
  api: process.env.STRIPE_PRICE_API_MONTHLY!,
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json()
  const priceId = PLANS[plan]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: plan === 'credits' ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${request.nextUrl.origin}/pricing`,
    metadata: { userId, plan },
  })

  return NextResponse.json({ url: session.url })
}
