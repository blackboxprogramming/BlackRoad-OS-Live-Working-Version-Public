import { ActionLinks, LaneGrid, SectionHeader, StatGrid } from '../../../_components/blackroad-ui'
import { createSignedReturnState } from '../../../_lib/founder-flow'

export default function StudioPreviewPage() {
  const loginReturn = createSignedReturnState('/product/studio', 'unlock')

  return (
    <main>
      <SectionHeader
        number='01 — Preview'
        title='RoadCode Studio Preview'
        description='This is the public preview state. It shows the shell, the promise, and the protected boundary without forcing identity too early.'
      />
      <ActionLinks
        actions={[
          { label: 'Back to studio', href: '/product/studio' },
          { label: 'Sign in', href: `/login?return_to=${encodeURIComponent(loginReturn)}`, secondary: true }
        ]}
      />
      <StatGrid
        items={[
          { label: 'Preview surface', value: 'public', note: 'No login needed to understand what the feature is.' },
          { label: 'Paid action', value: '$1', note: 'Only the unlock path is charged.' },
          { label: 'Return model', value: 'signed', note: 'Return state is signed server-side and validated on the way back.' }
        ]}
      />
      <SectionHeader
        number='02 — Preview Boundaries'
        title='What Preview Does Not Do'
        description='Preview mode should feel honest. It should never imply that save, export, or purchase-sensitive actions already succeeded.'
      />
      <LaneGrid
        items={[
          { title: 'Visible', items: ['Feature explanation', 'Rough output shape', 'Pricing and next action'] },
          { title: 'Not yet granted', items: ['Save', 'Download', 'Publish'] },
          { title: 'Upgrade path', items: ['Sign in once', 'Pay once', 'Resume exact route'] }
        ]}
      />
    </main>
  )
}

