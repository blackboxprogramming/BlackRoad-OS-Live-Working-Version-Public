import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export type ProtectedIntent = 'unlock' | 'generate' | 'export' | 'download'
export type AuthState = 'anonymous' | 'authenticated' | 'expired'
export type EntitlementState = 'missing' | 'pending' | 'granted'
export type RenderState = 'preview' | 'blocked' | 'unlocked'

type ReturnStatePayload = {
  route: string
  intent: ProtectedIntent
  draftRef?: string
  createdAt: number
  expiresAt: number
}

type SessionPayload = {
  userEmail: string
  createdAt: number
  expiresAt: number
}

export type ViewerState = {
  authState: AuthState
  entitlementState: EntitlementState
  renderState: RenderState
  userEmail?: string
  purchaseTimestamp?: string
}

const SESSION_COOKIE = 'br_session'
const USER_COOKIE = 'br_user'
const ENTITLEMENT_COOKIE = 'br_entitlements'
const PURCHASE_COOKIE = 'br_purchase_studio'
const EXPORT_COOKIE = 'br_export_studio'
const RETURN_STATE_SECRET = process.env.BLACKROAD_RETURN_STATE_SECRET || 'blackroad-roadcode-dev-secret'
const SESSION_SECRET = process.env.BLACKROAD_SESSION_SECRET || process.env.BLACKROAD_RETURN_STATE_SECRET || 'blackroad-roadcode-session-secret'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function toBase64Url(input: string) {
  return Buffer.from(input).toString('base64url')
}

function fromBase64Url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function signPayload(payload: string) {
  return createHmac('sha256', RETURN_STATE_SECRET).update(payload).digest('base64url')
}

function signSessionPayload(payload: string) {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

export function createSignedReturnState(route: string, intent: ProtectedIntent, draftRef?: string) {
  if (!route.startsWith('/')) {
    throw new Error('return state route must be local')
  }

  const payload: ReturnStatePayload = {
    route,
    intent,
    draftRef,
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 15
  }

  const encoded = toBase64Url(JSON.stringify(payload))
  const sig = signPayload(encoded)
  return `${encoded}.${sig}`
}

export function readSignedReturnState(token?: string | null): ReturnStatePayload | null {
  if (!token) return null

  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  const expected = signPayload(encoded)
  const left = Buffer.from(sig)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as ReturnStatePayload
    if (!payload.route.startsWith('/')) return null
    if (payload.expiresAt < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function withRestoredIntent(route: string, intent: ProtectedIntent, extras?: Record<string, string>) {
  const url = new URL(route, 'https://roadcode.blackroad.io')
  url.searchParams.set('intent', intent)
  url.searchParams.set('restored', '1')
  Object.entries(extras || {}).forEach(([key, value]) => url.searchParams.set(key, value))
  return `${url.pathname}${url.search}`
}

export function createSessionToken(userEmail: string) {
  const payload: SessionPayload = {
    userEmail,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  }

  const encoded = toBase64Url(JSON.stringify(payload))
  const sig = signSessionPayload(encoded)
  return `${encoded}.${sig}`
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null

  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  const expected = signSessionPayload(encoded)
  const left = Buffer.from(sig)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as SessionPayload
    if (!payload.userEmail) return null
    return payload
  } catch {
    return null
  }
}

export function clearSessionCookies(response: Response | import('next/server').NextResponse) {
  const target = response as import('next/server').NextResponse
  target.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
  target.cookies.set(USER_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
}

export function getViewerState(): ViewerState {
  const store = cookies()
  const sessionToken = store.get(SESSION_COOKIE)?.value
  const userCookie = store.get(USER_COOKIE)?.value
  const entitlements = store.get(ENTITLEMENT_COOKIE)?.value || ''
  const purchaseTimestamp = store.get(PURCHASE_COOKIE)?.value
  const session = readSessionToken(sessionToken)

  const authState: AuthState = session
    ? session.expiresAt < Date.now()
      ? 'expired'
      : 'authenticated'
    : userCookie === 'expired'
      ? 'expired'
      : 'anonymous'

  const userEmail = authState === 'authenticated'
    ? session?.userEmail
    : undefined

  const entitlementState: EntitlementState = entitlements.includes('studio_unlock')
    ? 'granted'
    : purchaseTimestamp
      ? 'pending'
      : 'missing'

  const renderState: RenderState = entitlementState === 'granted'
    ? 'unlocked'
    : authState === 'authenticated'
      ? 'blocked'
      : 'preview'

  return {
    authState,
    entitlementState,
    renderState,
    userEmail,
    purchaseTimestamp: purchaseTimestamp || undefined
  }
}

export function getAuditContext() {
  const state = getViewerState()
  return {
    userEmail: state.userEmail || 'anonymous',
    authState: state.authState,
    entitlementState: state.entitlementState
  }
}

export function recordAudit(event: string, details: Record<string, string | number | boolean | undefined>) {
  console.info(`[roadcode-audit] ${event}`, details)
}

export function applyStudioUnlock(response: Response | import('next/server').NextResponse, timestamp = new Date().toISOString()) {
  const target = response as import('next/server').NextResponse
  target.cookies.set('br_purchase_studio', timestamp, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  target.cookies.set('br_entitlements', 'studio_unlock', { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
}

export function getPurchases() {
  const state = getViewerState()
  if (!state.purchaseTimestamp) return []

  return [{
    id: 'purchase_studio_unlock',
    feature: 'RoadCode Studio unlock',
    amount: '$1.00',
    status: state.entitlementState === 'granted' ? 'paid' : 'pending',
    timestamp: state.purchaseTimestamp
  }]
}

export function getDownloads() {
  const state = getViewerState()
  if (state.entitlementState !== 'granted') return []

  return [{
    id: 'download_studio_bundle',
    name: 'RoadCode Studio render bundle',
    status: 'ready',
    path: '/api/account/downloads/download_studio_bundle'
  }]
}

export function getExports() {
  const store = cookies()
  const exportTimestamp = store.get(EXPORT_COOKIE)?.value
  if (!exportTimestamp) return []

  return [{
    id: 'export_studio_account',
    name: 'RoadCode account export',
    status: 'ready',
    timestamp: exportTimestamp,
    path: '/api/account/exports/export_studio_account'
  }]
}
