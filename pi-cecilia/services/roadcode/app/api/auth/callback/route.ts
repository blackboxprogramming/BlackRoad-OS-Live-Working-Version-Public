import { NextResponse } from 'next/server'
import { createSessionToken, readSignedReturnState, recordAudit, withRestoredIntent } from '../../../_lib/founder-flow'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('return_to')
  const payload = readSignedReturnState(token)

  if (!payload) {
    recordAudit('login_fail', { reason: 'invalid_callback_state' })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.redirect(new URL(withRestoredIntent(payload.route, payload.intent), request.url))
  response.cookies.set('br_session', createSessionToken('operator@blackroad.io'), { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  response.cookies.set('br_user', 'operator@blackroad.io', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  recordAudit('login_success', { route: payload.route, intent: payload.intent })
  recordAudit('return_restored', { route: payload.route, intent: payload.intent })
  return response
}
