export async function GET() {
  return Response.json({
    service: process.env.SERVICE_NAME ?? 'blackroad-service',
    version: '0.1.0',
    build: 'template'
  })
}
