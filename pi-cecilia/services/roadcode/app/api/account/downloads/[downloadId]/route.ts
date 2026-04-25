import { NextResponse } from 'next/server'
import { getDownloads, recordAudit } from '../../../../_lib/founder-flow'

type DownloadRouteProps = {
  params: {
    downloadId: string
  }
}

export async function GET(_: Request, { params }: DownloadRouteProps) {
  const download = getDownloads().find((entry) => entry.id === params.downloadId)
  if (!download) {
    return NextResponse.json({ error: 'missing_record', nextAction: 'Return to /account/downloads' }, { status: 404 })
  }

  recordAudit('download_started', { downloadId: download.id })
  recordAudit('download_completed', { downloadId: download.id })
  return NextResponse.json({
    id: download.id,
    name: download.name,
    status: 'delivered',
    bundle: ['studio-result.json', 'render-log.txt']
  })
}
