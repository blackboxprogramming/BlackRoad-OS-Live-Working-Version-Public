import { roadtripBackendJson } from '../../../_lib/roadtrip-backend'

type RuntimeSessionResponse = {
  authenticated: boolean
  session?: {
    actor_id: string
    actor_name: string
    actor_type: string
    scopes: string[]
    metadata: Record<string, unknown> | null
  }
}

type RuntimeRoom = {
  id: string
  name: string
  topic: string | null
  visibility: string
  message_count: number
  last_message_at: string | null
}

type RuntimeFleetAgent = {
  id: string
  name: string
  role: string
  status: string
  last_seen: string
}

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

export async function GET() {
  try {
    const [sessionData, roomsData, fleetData] = await Promise.all([
      roadtripBackendJson<RuntimeSessionResponse>('/api/auth/session'),
      roadtripBackendJson<{ rooms: RuntimeRoom[] }>('/api/rooms'),
      roadtripBackendJson<{ fleet: RuntimeFleetAgent[] }>('/api/fleet')
    ])

    const rooms = roomsData.rooms ?? []
    const activeRoomId = rooms[0]?.id ?? 'general'

    const [messageData, presenceData] = await Promise.all([
      roadtripBackendJson<{ room: string; messages: RuntimeMessage[] }>(`/api/rooms/${encodeURIComponent(activeRoomId)}/messages?limit=40`),
      roadtripBackendJson<{ room: string; presence: RuntimePresence[] }>(`/api/rooms/${encodeURIComponent(activeRoomId)}/presence`)
    ])

    return Response.json({
      session: sessionData.session ?? null,
      rooms,
      activeRoomId,
      messages: messageData.messages ?? [],
      presence: presenceData.presence ?? [],
      fleet: fleetData.fleet ?? []
    })
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to load RoadTrip runtime bootstrap'
      },
      { status: 500 }
    )
  }
}
