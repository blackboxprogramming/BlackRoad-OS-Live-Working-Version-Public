export async function GET() {
  return Response.json({
    status: 'ok',
    service: process.env.SERVICE_NAME ?? 'roadie',
    version: '0.1.0'
  })
}
