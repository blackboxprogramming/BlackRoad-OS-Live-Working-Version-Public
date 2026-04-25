type RequestInitWithJson = RequestInit & {
  json?: unknown
}

function getBackendBaseUrl() {
  return (process.env.ROADTRIP_API_BASE_URL ?? 'https://api.roadtrip.blackroad.io').replace(/\/+$/, '')
}

function getBackendToken() {
  const token = process.env.ROADTRIP_API_TOKEN
  if (!token) {
    throw new Error('ROADTRIP_API_TOKEN is not configured')
  }
  return token
}

export async function roadtripBackendFetch(path: string, init: RequestInitWithJson = {}) {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${getBackendToken()}`)

  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    cache: 'no-store'
  })

  return response
}

export async function roadtripBackendJson<T>(path: string, init: RequestInitWithJson = {}) {
  const response = await roadtripBackendFetch(path, init)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : null) ??
      `RoadTrip backend request failed: ${response.status}`
    throw new Error(message)
  }

  return data as T
}
