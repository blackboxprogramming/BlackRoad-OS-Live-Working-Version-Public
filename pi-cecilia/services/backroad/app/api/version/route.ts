export async function GET() {
  return Response.json({
    service: process.env.SERVICE_NAME ?? 'backroad',
    version: '0.1.0',
    build: 'canonical-service'
  })
}
