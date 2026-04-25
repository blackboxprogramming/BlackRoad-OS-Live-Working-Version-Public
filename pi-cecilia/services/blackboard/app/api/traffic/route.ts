import { getBlackboardKpiData } from '../../lib/kpi-data'

export async function GET() {
  const data = await getBlackboardKpiData()

  return Response.json({
    status: 'ok',
    service: 'blackboard',
    ...data
  })
}
