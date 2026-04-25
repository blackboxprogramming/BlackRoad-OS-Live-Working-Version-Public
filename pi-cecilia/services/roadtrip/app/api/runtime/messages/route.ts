import { roadtripBackendJson } from '../../../_lib/roadtrip-backend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const roomId = typeof body.roomId === 'string' && body.roomId ? body.roomId : 'general'
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return Response.json({ error: 'content required' }, { status: 400 })
    }

    const result = await roadtripBackendJson<{
      ok: boolean
      message: Record<string, unknown>
      reply?: Record<string, unknown>
    }>('/api/chat', {
      method: 'POST',
      json: {
        room: roomId,
        message: content,
        expect_reply: true
      }
    })

    return Response.json(result)
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send message'
      },
      { status: 500 }
    )
  }
}
