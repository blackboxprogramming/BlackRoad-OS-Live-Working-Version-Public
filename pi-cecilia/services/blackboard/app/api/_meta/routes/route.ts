import fs from 'node:fs/promises'
import path from 'node:path'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const

function extractMethods(source: string) {
  const methods = new Set<string>()

  for (const method of HTTP_METHODS) {
    const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`, 'g')
    if (re.test(source)) methods.add(method)
  }

  return Array.from(methods)
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
      continue
    }
    yield fullPath
  }
}

function toApiRoute(apiDir: string, filePath: string) {
  const rel = path.relative(apiDir, filePath).replaceAll(path.sep, '/')
  if (!rel.endsWith('/route.ts') && !rel.endsWith('/route.js')) return null

  const routePath = rel
    .replace(/\/route\.(ts|js)$/, '')
    .split('/')
    .map((segment) => {
      if (segment === '') return segment
      if (segment.startsWith('(') && segment.endsWith(')')) return ''
      return segment
    })
    .filter(Boolean)
    .join('/')

  return `/api/${routePath}`.replace(/\/$/, '') || '/api'
}

function isAuthorized(request: Request) {
  const token = process.env.ROUTE_META_TOKEN
  if (!token) return process.env.NODE_ENV !== 'production'

  const headerToken = request.headers.get('x-route-meta-token')
  if (headerToken && headerToken === token) return true

  const auth = request.headers.get('authorization') || ''
  if (auth.startsWith('Bearer ') && auth.slice('Bearer '.length) === token) return true

  return false
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return new Response('Not Found', { status: 404 })

  const cwd = process.cwd()
  const apiDir = path.join(cwd, 'app', 'api')

  let routes: Array<{
    file: string
    methods: string[]
    route: string
  }> = []

  try {
    for await (const filePath of walk(apiDir)) {
      const route = toApiRoute(apiDir, filePath)
      if (!route) continue

      const source = await fs.readFile(filePath, 'utf8')
      routes.push({
        file: path.relative(cwd, filePath).replaceAll(path.sep, '/'),
        methods: extractMethods(source),
        route
      })
    }
  } catch {
    routes = []
  }

  routes.sort((a, b) => a.route.localeCompare(b.route))

  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      service: process.env.SERVICE_NAME ?? 'blackroad-service',
      routes
    },
    {
      headers: {
        'cache-control': 'no-store'
      }
    }
  )
}

