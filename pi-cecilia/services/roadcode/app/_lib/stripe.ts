import Stripe from 'stripe'

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return null

  return new Stripe(secretKey)
}

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || ''
}
