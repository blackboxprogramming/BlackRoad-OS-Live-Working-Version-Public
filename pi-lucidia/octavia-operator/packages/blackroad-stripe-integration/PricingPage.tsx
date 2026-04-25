'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  {
    name: 'Starter',
    price: '$9',
    priceId: 'price_starter',
    features: [
      '10,000 API calls/month',
      'Basic support',
      'Community access',
      '1 GB storage'
    ]
  },
  {
    name: 'Pro',
    price: '$29',
    priceId: 'price_pro',
    features: [
      '100,000 API calls/month',
      'Priority support',
      'Advanced features',
      '10 GB storage',
      'Custom domains'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    priceId: 'price_enterprise',
    features: [
      'Unlimited API calls',
      'Dedicated support',
      'All features',
      '100 GB storage',
      'Custom domains',
      'SLA guarantee',
      'White label'
    ]
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      const { sessionId } = await response.json()
      const stripe = await stripePromise
      
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            🖤 BlackRoad Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Choose the perfect plan for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-gray-800 to-black border-2 border-white'
                  : 'bg-gray-900 border border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.popular
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {loading === plan.priceId ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            🔒 Secure payment powered by Stripe
          </p>
          <p className="text-gray-500 text-sm">
            Cancel anytime • No hidden fees • 14-day money back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}
