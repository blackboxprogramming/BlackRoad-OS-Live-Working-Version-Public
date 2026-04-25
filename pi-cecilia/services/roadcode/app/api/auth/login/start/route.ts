import { redirect } from 'next/navigation'
import { readSignedReturnState, recordAudit } from '../../../../_lib/founder-flow'

export async function POST(request: Request) {
  const formData = await request.formData()
  const returnTo = String(formData.get('return_to') || '')
  const payload = readSignedReturnState(returnTo)

  if (!payload) {
    recordAudit('login_fail', { reason: 'invalid_return_state' })
    redirect('/login')
  }

  recordAudit('login_start', { route: payload.route, intent: payload.intent })
  redirect(`/api/auth/callback?return_to=${encodeURIComponent(returnTo)}`)
}
