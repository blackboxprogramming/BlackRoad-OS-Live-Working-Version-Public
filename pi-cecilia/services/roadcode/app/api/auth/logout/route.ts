import { NextResponse } from 'next/server'
import { clearSessionCookies, recordAudit } from '../../../_lib/founder-flow'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url))
  clearSessionCookies(response)
  recordAudit('logout', { route: '/login' })
  return response
}

