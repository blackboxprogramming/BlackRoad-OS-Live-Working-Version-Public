export async function GET() {
  return Response.json({
    status: 'ok',
    service: process.env.SERVICE_NAME ?? 'blackroad-service',
    version: '0.1.0'
  })
}
