import { NextResponse } from 'next/server'
import { getViewerState } from '../../../_lib/founder-flow'

export async function GET() {
  return NextResponse.json(getViewerState())
}
