'use client'

import { useEffect, useMemo, useState } from 'react'

type RuntimeSession = {
  actor_id: string
  actor_name: string
  actor_type: string
  scopes: string[]
  metadata: Record<string, unknown> | null
} | null

type RuntimeRoom = {
  id: string
  name: string
  topic: string | null
  visibility: string
  message_count: number
  last_message_at: string | null
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

type RuntimeFleetAgent = {
  id: string
  name: string
  role: string
  status: string
  last_seen: string
}

type BootstrapPayload = {
  session: RuntimeSession
  rooms: RuntimeRoom[]
  activeRoomId: string
  messages: RuntimeMessage[]
  presence: RuntimePresence[]
  fleet: RuntimeFleetAgent[]
}

function formatTime(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

export function RoadTripRuntimePanel() {
  const [session, setSession] = useState<RuntimeSession>(null)
  const [rooms, setRooms] = useState<RuntimeRoom[]>([])
  const [fleet, setFleet] = useState<RuntimeFleetAgent[]>([])
  const [messages, setMessages] = useState<RuntimeMessage[]>([])
  const [presence, setPresence] = useState<RuntimePresence[]>([])
  const [activeRoomId, setActiveRoomId] = useState('general')
  const [composerValue, setComposerValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadBootstrap() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/runtime/bootstrap', { cache: 'no-store' })
      const data = (await response.json()) as BootstrapPayload & { error?: string }

      if (!response.ok) throw new Error(data.error ?? 'Failed to load RoadTrip runtime')

      setSession(data.session)
      setRooms(data.rooms)
      setFleet(data.fleet)
      setActiveRoomId(data.activeRoomId)
      setMessages(data.messages)
      setPresence(data.presence)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RoadTrip runtime')
    } finally {
      setLoading(false)
    }
  }

  async function loadRoom(roomId: string) {
    setError(null)
    try {
      const response = await fetch(`/api/runtime/rooms/${encodeURIComponent(roomId)}`, { cache: 'no-store' })
      const data = (await response.json()) as { roomId: string; messages: RuntimeMessage[]; presence: RuntimePresence[]; error?: string }

      if (!response.ok) throw new Error(data.error ?? 'Failed to load room')

      setActiveRoomId(data.roomId)
      setMessages(data.messages)
      setPresence(data.presence)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room')
    }
  }

  async function syncPresence(roomId: string) {
    try {
      await fetch('/api/runtime/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          status: 'online',
          metadata: { source: 'next-ui' }
        })
      })
    } catch {}
  }

  useEffect(() => {
    void loadBootstrap()
  }, [])

  useEffect(() => {
    if (!activeRoomId || loading) return

    void syncPresence(activeRoomId)

    const timer = window.setInterval(() => {
      void syncPresence(activeRoomId)
    }, 60000)

    return () => window.clearInterval(timer)
  }, [activeRoomId, loading])

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) ?? null,
    [rooms, activeRoomId]
  )

  async function handleSendMessage() {
    if (!composerValue.trim() || sending) return

    setSending(true)
    setError(null)
    try {
      const response = await fetch('/api/runtime/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeRoomId,
          content: composerValue
        })
      })
      const data = (await response.json()) as {
        message?: RuntimeMessage
        reply?: RuntimeMessage
        error?: string
      }

      if (!response.ok) throw new Error(data.error ?? 'Failed to send message')

      const nextMessages = [...messages]
      if (data.message) nextMessages.push(data.message)
      if (data.reply) nextMessages.push(data.reply)
      setMessages(nextMessages)
      setComposerValue('')
      await loadRoom(activeRoomId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='roadtrip-runtime'>
      <div className='roadtrip-runtime-grid'>
        <section className='content-card roadtrip-panel'>
          <div className='roadtrip-panel-header'>
            <div>
              <p className='section-label'>Live backend runtime</p>
              <h3 className='content-card-title'>Rooms, messages, presence, and auth are wired</h3>
              <p className='content-card-copy'>
                This surface is using the Next.js proxy routes to talk to the RoadTrip worker foundation without exposing backend tokens in the browser.
              </p>
            </div>
            <button className='btn btn-outline' onClick={() => void loadBootstrap()} type='button'>
              Refresh runtime
            </button>
          </div>

          {error ? <div className='roadtrip-error'>{error}</div> : null}

          <div className='roadtrip-status-grid'>
            <article className='feature-card'>
              <p className='metric-label'>Session</p>
              <strong className='content-card-title'>{session?.actor_name ?? 'Unavailable'}</strong>
              <p className='content-card-copy'>{session ? `${session.actor_type} · ${session.actor_id}` : 'Configure backend env vars to attach a service session.'}</p>
            </article>
            <article className='feature-card'>
              <p className='metric-label'>Active room</p>
              <strong className='content-card-title'>{activeRoom?.name ?? activeRoomId}</strong>
              <p className='content-card-copy'>{activeRoom?.topic ?? 'Room topic unavailable'}</p>
            </article>
            <article className='feature-card'>
              <p className='metric-label'>Presence</p>
              <strong className='content-card-title'>{presence.length}</strong>
              <p className='content-card-copy'>People and Roadies currently visible in this room.</p>
            </article>
          </div>

          <div className='roadtrip-live-grid'>
            <div className='roadtrip-column'>
              <div className='roadtrip-subcard'>
                <div className='roadtrip-subcard-head'>
                  <p className='section-label'>Rooms</p>
                  <span className='room-meta'>{rooms.length} total</span>
                </div>
                <div className='roadtrip-room-list'>
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      className={`roadtrip-room-item${room.id === activeRoomId ? ' is-active' : ''}`}
                      onClick={() => void loadRoom(room.id)}
                      type='button'
                    >
                      <strong>{room.name}</strong>
                      <span>{room.topic ?? 'No topic yet'}</span>
                      <div className='roadtrip-room-meta'>
                        <span>{room.visibility}</span>
                        <span>{room.message_count} msgs</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className='roadtrip-subcard'>
                <div className='roadtrip-subcard-head'>
                  <p className='section-label'>Presence</p>
                  <span className='room-meta'>{activeRoomId}</span>
                </div>
                <div className='topic-stack'>
                  {presence.map((entry) => (
                    <article key={`${entry.room_id}-${entry.actor_id}`} className='topic-row'>
                      <div>
                        <strong>{entry.actor_name}</strong>
                        <p>{entry.actor_type} · {entry.status}</p>
                      </div>
                      <span className='room-meta'>{formatTime(entry.last_seen)}</span>
                    </article>
                  ))}
                  {!presence.length && !loading ? <p className='content-card-copy'>No active presence yet.</p> : null}
                </div>
              </div>
            </div>

            <div className='roadtrip-column roadtrip-column--wide'>
              <div className='roadtrip-subcard roadtrip-chat-card'>
                <div className='roadtrip-subcard-head'>
                  <div>
                    <p className='section-label'>Messages</p>
                    <h4 className='content-card-title'>{activeRoom?.name ?? 'Loading room'}</h4>
                  </div>
                  <span className='room-meta'>{loading ? 'Loading…' : `${messages.length} shown`}</span>
                </div>

                <div className='roadtrip-message-list'>
                  {messages.map((message) => (
                    <article key={message.id} className='roadtrip-message'>
                      <div className='roadtrip-message-head'>
                        <strong>{message.sender_name}</strong>
                        <span className='room-meta'>{message.sender_type} · {formatTime(message.created_at)}</span>
                      </div>
                      <p>{message.content}</p>
                    </article>
                  ))}
                  {!messages.length && !loading ? <p className='content-card-copy'>No messages yet in this room.</p> : null}
                </div>

                <div className='roadtrip-composer'>
                  <textarea
                    className='roadtrip-textarea'
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    placeholder={`Message ${activeRoom?.name ?? activeRoomId}…`}
                    rows={4}
                  />
                  <div className='roadtrip-composer-actions'>
                    <span className='room-meta'>
                      {session ? `${session.scopes.join(', ')}` : 'No session scopes available'}
                    </span>
                    <button className='btn btn-primary' onClick={() => void handleSendMessage()} type='button' disabled={sending || !composerValue.trim()}>
                      {sending ? 'Sending…' : 'Send message'}
                    </button>
                  </div>
                </div>
              </div>

              <div className='roadtrip-subcard'>
                <div className='roadtrip-subcard-head'>
                  <p className='section-label'>Fleet snapshot</p>
                  <span className='room-meta'>{fleet.length} agents</span>
                </div>
                <div className='panel-grid roadtrip-fleet-grid'>
                  {fleet.slice(0, 6).map((agent) => (
                    <article key={agent.id} className='panel-card'>
                      <p className='panel-kicker'>{agent.status}</p>
                      <strong>{agent.name}</strong>
                      <p>{agent.role}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
