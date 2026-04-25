import { NextResponse } from 'next/server'
import { getDownloads } from '../../../_lib/founder-flow'

export async function GET() {
  return NextResponse.json({ downloads: getDownloads() })
}
