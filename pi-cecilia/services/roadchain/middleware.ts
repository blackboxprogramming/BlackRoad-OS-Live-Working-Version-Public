import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getOrCreateRequestId(request: NextRequest) {
  const existing = request.headers.get('x-request-id')
  if (existing) return existing

  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID()

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('x-frame-options', 'DENY')
  response.headers.set('referrer-policy', 'no-referrer')
  response.headers.set(
    'permissions-policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

export function middleware(request: NextRequest) {
  const requestId = getOrCreateRequestId(request)
  const response = NextResponse.next()

  response.headers.set('x-request-id', requestId)
  response.headers.set('x-service-name', process.env.SERVICE_NAME ?? 'blackroad-service')

  return applySecurityHeaders(response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
}

