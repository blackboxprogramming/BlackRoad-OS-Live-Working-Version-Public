export async function GET() {
  return Response.json({
    status: 'ok',
    service: process.env.SERVICE_NAME ?? 'backroad',
    version: '0.1.0'
  })
}
