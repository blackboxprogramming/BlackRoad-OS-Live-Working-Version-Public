export async function GET() {
  return Response.json({
    service: process.env.SERVICE_NAME ?? 'roadview',
    version: '0.1.0',
    build: 'canonical-service'
  })
}
