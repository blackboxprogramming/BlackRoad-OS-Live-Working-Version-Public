import { ActionLinks, LaneGrid, SectionHeader, StatGrid } from '../_components/blackroad-ui'
import { getDownloads, getExports, getPurchases, getViewerState } from '../_lib/founder-flow'

export default function AccountPage() {
  const state = getViewerState()
  const purchases = getPurchases()
  const downloads = getDownloads()
  const exports = getExports()

  return (
    <main>
      <SectionHeader
        number='01 — Account'
        title='Stable Recovery For What The User Bought'
        description='Account routes exist to recover purchases, downloads, exports, and session/security controls without routing the user through a generic dashboard home.'
      />
      <ActionLinks
        actions={[
          { label: 'Purchases', href: '/account/purchases' },
          { label: 'Downloads', href: '/account/downloads', secondary: true },
          { label: 'Exports', href: '/account/exports', secondary: true },
          { label: 'Security', href: '/account/security', secondary: true }
        ]}
      />
      <StatGrid
        items={[
          { label: 'Auth state', value: state.authState, note: 'Expired sessions should recover context, not dump the user at home.' },
          { label: 'Purchases', value: String(purchases.length), note: 'Purchase history should always be directly reachable.' },
          { label: 'Recoverable assets', value: String(downloads.length + exports.length), note: 'Downloads and exports live on stable, direct account routes.' }
        ]}
      />
      <SectionHeader
        number='02 — Areas'
        title='Direct Account Routes'
        description='Each route has one clear purpose. No loop between login, account, and product pages.'
      />
      <LaneGrid
        items={[
          { title: 'Purchases', items: ['Receipts', 'Entitlement history', 'Payment status'] },
          { title: 'Downloads', items: ['Owned results', 'Direct downloads', 'No support ticket required'] },
          { title: 'Exports', items: ['Request export', 'Download own data', 'Track export completion'] }
        ]}
      />
    </main>
  )
}

