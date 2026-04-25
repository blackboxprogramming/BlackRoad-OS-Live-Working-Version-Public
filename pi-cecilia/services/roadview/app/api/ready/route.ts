export async function GET() {
  return Response.json({
    status: 'ready',
    service: process.env.SERVICE_NAME ?? 'roadview',
    dependencies: {}
  })
}
