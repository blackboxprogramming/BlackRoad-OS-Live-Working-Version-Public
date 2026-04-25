import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'

type ClerkWebhookEvent = {
  type: string
  data: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'user.created':
      console.log(`New user: ${event.data.id}`)
      // TODO: create Stripe customer, provision default access
      break
    case 'user.updated':
      console.log(`User updated: ${event.data.id}`)
      break
    case 'user.deleted':
      console.log(`User deleted: ${event.data.id}`)
      // TODO: cancel Stripe subscription
      break
    default:
      console.log(`Unhandled clerk event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
