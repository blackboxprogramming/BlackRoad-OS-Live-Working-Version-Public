import { NextResponse } from 'next/server'
import { recordAudit } from '../../../_lib/founder-flow'

export async function GET() {
  return NextResponse.json({ exports: [] })
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/account/exports', request.url))
  const timestamp = new Date().toISOString()
  response.cookies.set('br_export_studio', timestamp, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  recordAudit('export_requested', { timestamp })
  recordAudit('export_completed', { timestamp })
  return response
}
