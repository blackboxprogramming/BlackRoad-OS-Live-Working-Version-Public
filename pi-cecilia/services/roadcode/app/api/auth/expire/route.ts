import { NextResponse } from 'next/server'
import { clearSessionCookies, recordAudit } from '../../../_lib/founder-flow'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  clearSessionCookies(response)
  response.cookies.set('br_user', 'expired', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  recordAudit('session_expired', { route: '/login' })
  return response
}
