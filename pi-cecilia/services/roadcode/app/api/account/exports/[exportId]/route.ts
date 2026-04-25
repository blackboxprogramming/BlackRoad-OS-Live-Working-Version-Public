import { NextResponse } from 'next/server'
import { getExports } from '../../../../_lib/founder-flow'

type ExportRouteProps = {
  params: {
    exportId: string
  }
}

export async function GET(_: Request, { params }: ExportRouteProps) {
  const entry = getExports().find((item) => item.id === params.exportId)
  if (!entry) {
    return NextResponse.json({ error: 'missing_record', nextAction: 'Return to /account/exports' }, { status: 404 })
  }

  return NextResponse.json({
    id: entry.id,
    status: 'ready',
    export: {
      purchases: ['purchase_studio_unlock'],
      downloads: ['download_studio_bundle'],
      security: ['session_cookie_http_only']
    }
  })
}
