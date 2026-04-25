import { SectionHeader, TopicList } from '../../_components/blackroad-ui'
import { getPurchases, getViewerState } from '../../_lib/founder-flow'

export default function AccountPurchasesPage() {
  const purchases = getPurchases()
  const state = getViewerState()

  return (
    <main>
      <SectionHeader
        number='01 — Purchases'
        title='Purchase History'
        description='The account purchases route should always show what the user bought, what the state is, and what action they can take next.'
      />
      <TopicList
        items={purchases.length
          ? purchases.map((purchase) => ({
              title: `${purchase.feature} — ${purchase.amount}`,
              body: `Status: ${purchase.status}. Timestamp: ${purchase.timestamp}. Auth state: ${state.authState}.`
            }))
          : [{ title: 'No purchases yet', body: 'The user has not completed a purchase on this account yet.' }]}
      />
    </main>
  )
}

