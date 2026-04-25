export async function GET() {
  return Response.json({
    status: 'ok',
    service: process.env.SERVICE_NAME ?? 'roadview',
    version: '0.1.0'
  })
}
