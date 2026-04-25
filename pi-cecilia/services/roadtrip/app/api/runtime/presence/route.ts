import { roadtripBackendJson } from '../../../_lib/roadtrip-backend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const roomId = typeof body.roomId === 'string' && body.roomId ? body.roomId : 'general'
    const status = typeof body.status === 'string' && body.status ? body.status : 'online'
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined

    const result = await roadtripBackendJson<{ ok: boolean; room: string; actor_id: string; status: string }>(
      `/api/rooms/${encodeURIComponent(roomId)}/presence`,
      {
        method: 'POST',
        json: { status, metadata }
      }
    )

    return Response.json(result)
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update presence'
      },
      { status: 500 }
    )
  }
}
