import { roadtripBackendJson } from '../../../../_lib/roadtrip-backend'

type RuntimeMessage = {
  id: string
  room_id: string
  sender_id: string
  sender_name: string
  sender_type: string
  content: string
  reply_to: string | null
  created_at: string
}

type RuntimePresence = {
  room_id: string
  actor_id: string
  actor_name: string
  actor_type: string
  status: string
  metadata: Record<string, unknown> | null
  last_seen: string
}

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const [messageData, presenceData] = await Promise.all([
      roadtripBackendJson<{ room: string; messages: RuntimeMessage[] }>(`/api/rooms/${encodeURIComponent(roomId)}/messages?limit=40`),
      roadtripBackendJson<{ room: string; presence: RuntimePresence[] }>(`/api/rooms/${encodeURIComponent(roomId)}/presence`)
    ])

    return Response.json({
      roomId,
      messages: messageData.messages ?? [],
      presence: presenceData.presence ?? []
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load room state'
      },
      { status: 500 }
    )
  }
}
