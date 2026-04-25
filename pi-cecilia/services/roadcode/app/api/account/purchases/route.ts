import { NextResponse } from 'next/server'
import { getPurchases, recordAudit } from '../../../_lib/founder-flow'

export async function GET() {
  const purchases = getPurchases()
  recordAudit('account_purchases_viewed', { count: purchases.length })
  return NextResponse.json({ purchases })
}
